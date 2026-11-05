import os
import logging
from typing import Optional, Dict, Any, Tuple
from app.schemas.models import AutoCorrectResponse, EquivalenceTestResponse
from app.services.conversion_engine import ConversionEngine
from app.services.equivalence_tester import EquivalenceTester
from app.core.config import settings

logger = logging.getLogger(__name__)

class CorrectionEngine:
    MAX_ATTEMPTS = 3

    @classmethod
    async def auto_correct(
        cls,
        original_code: str,
        converted_code: str,
        source_language: str,
        target_language: str,
        error_details: str,
        failed_test_input: Optional[str] = None,
        expected_output: Optional[str] = None,
        actual_output: Optional[str] = None,
        custom_instructions: Optional[str] = None,
        max_retries: int = 3,
        api_key: Optional[str] = None
    ) -> AutoCorrectResponse:
        current_code = converted_code
        attempts = 0
        limit = min(max_retries, cls.MAX_ATTEMPTS)
        effective_key = api_key or settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")

        last_test_res: Optional[EquivalenceTestResponse] = None

        while attempts < limit:
            attempts += 1
            logger.info(f"Correction attempt {attempts}/{limit} for {target_language}...")

            # Request corrected implementation from AI
            if effective_key:
                corrected_code = await cls._correct_with_gemini(
                    original_code=original_code,
                    failing_code=current_code,
                    source_language=source_language,
                    target_language=target_language,
                    error_details=error_details,
                    failed_test_input=failed_test_input,
                    expected_output=expected_output,
                    actual_output=actual_output,
                    custom_instructions=custom_instructions,
                    api_key=effective_key
                )
                current_code = ConversionEngine.clean_markdown_fences(corrected_code)
            else:
                # Offline rule-based fix: attempt syntax or I/O tweak
                current_code = cls._heuristic_fix(current_code, target_language, error_details)

            # Re-run equivalence tests to verify fix
            test_res = await EquivalenceTester.run_tests(
                original_code=original_code,
                converted_code=current_code,
                source_language=source_language,
                target_language=target_language,
                auto_generate=True
            )
            last_test_res = test_res

            if test_res.equivalence_status == "PASSED":
                return AutoCorrectResponse(
                    corrected_code=current_code,
                    attempts=attempts,
                    succeeded=True,
                    test_results=test_res,
                    explanation=f"Successfully corrected and passed all {test_res.total_tests} test cases on attempt {attempts}."
                )

            # Update error details for next iteration if any test failed
            failing_case = next((tc for tc in test_res.test_results if not tc.passed), None)
            if failing_case:
                error_details = failing_case.error_message or "Output mismatch"
                failed_test_input = failing_case.stdin
                expected_output = failing_case.expected_output
                actual_output = failing_case.actual_output

        return AutoCorrectResponse(
            corrected_code=current_code,
            attempts=attempts,
            succeeded=False,
            test_results=last_test_res,
            explanation=f"Reached maximum correction limit ({limit} attempts). Discrepancies or errors remain."
        )

    @classmethod
    async def _correct_with_gemini(
        cls,
        original_code: str,
        failing_code: str,
        source_language: str,
        target_language: str,
        error_details: str,
        failed_test_input: Optional[str],
        expected_output: Optional[str],
        actual_output: Optional[str],
        custom_instructions: Optional[str],
        api_key: str
    ) -> str:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)

            system_instruction = (
                f"You are an expert software engineer and debugger. You are given a program in {target_language} "
                f"converted from {source_language} that failed testing or compilation. Fix the bug while preserving "
                f"exact functional equivalence with the original {source_language} program.\n\n"
                f"CRITICAL REQUIREMENTS:\n"
                f"1. Return ONLY the complete, executable {target_language} source code.\n"
                f"2. DO NOT use markdown code fences (NO ```, NO ```{target_language}).\n"
                f"3. DO NOT include conversational text, pleasantries, or explanations.\n"
                f"4. Inline comments explaining the fix are allowed ({ConversionEngine.COMMENT_PREFIXES.get(target_language.lower(), '//')}).\n"
                f"5. DO NOT remove existing functionality or hardcode test outputs.\n"
            )

            prompt = (
                f"ORIGINAL {source_language.upper()} CODE:\n{original_code}\n\n"
                f"CURRENT FAILING {target_language.upper()} CODE:\n{failing_code}\n\n"
                f"ERROR DETAILS:\n{error_details}\n"
            )
            if failed_test_input is not None:
                prompt += f"FAILING TEST INPUT:\n{failed_test_input}\n"
            if expected_output is not None:
                prompt += f"EXPECTED OUTPUT:\n{expected_output}\n"
            if actual_output is not None:
                prompt += f"ACTUAL OUTPUT:\n{actual_output}\n"
            if custom_instructions:
                prompt += f"CUSTOM INSTRUCTIONS TO RESPECT:\n{custom_instructions}\n"

            prompt += f"\nPlease output the fully corrected {target_language.upper()} code now:\n"

            interaction = client.interactions.create(
                model=settings.DEFAULT_GEMINI_MODEL,
                system_instruction=system_instruction,
                input=prompt
            )
            return interaction.output_text or failing_code

        except Exception as e:
            logger.error(f"Error calling Gemini in correction engine: {e}")
            return failing_code

    @classmethod
    def _heuristic_fix(cls, code: str, language: str, error_details: str) -> str:
        """Simple syntax/heuristic fix for offline environments."""
        fixed = code
        # Common C++ missing headers
        if language == "cpp":
            if "<iostream>" not in fixed:
                fixed = "#include <iostream>\n" + fixed
            if "std::cin" in fixed or "std::cout" in fixed:
                pass
            elif "cin" in fixed or "cout" in fixed:
                if "using namespace std;" not in fixed:
                    fixed = fixed.replace("#include <iostream>\n", "#include <iostream>\nusing namespace std;\n")

        # Python missing sys.stdin
        elif language == "python":
            if "sys.stdin" in fixed and "import sys" not in fixed:
                fixed = "import sys\n" + fixed

        return fixed
