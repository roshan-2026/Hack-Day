import re
import math
import logging
from typing import List, Optional, Tuple, Dict, Any
from app.schemas.models import TestCaseInput, TestCaseResult, EquivalenceTestResponse
from app.execution import get_runner, BaseRunner

logger = logging.getLogger(__name__)

class EquivalenceTester:
    @staticmethod
    def normalize_output(text: str) -> str:
        """Standardizes line endings and trailing whitespace for fair comparison."""
        if text is None:
            return ""
        # Normalize carriage returns
        cleaned = text.replace("\r\n", "\n").replace("\r", "\n")
        # Strip trailing spaces on each line and strip overall trailing whitespace
        lines = [line.rstrip() for line in cleaned.split("\n")]
        return "\n".join(lines).strip()

    @classmethod
    def outputs_match(cls, expected: str, actual: str) -> bool:
        """Compares expected and actual outputs with floating-point tolerance and formatting normalization."""
        norm_exp = cls.normalize_output(expected)
        norm_act = cls.normalize_output(actual)

        if norm_exp == norm_act:
            return True

        # Try token-by-token comparison (handles whitespace variances and floats)
        exp_tokens = norm_exp.split()
        act_tokens = norm_act.split()

        if len(exp_tokens) != len(act_tokens):
            return False

        for e_tok, a_tok in zip(exp_tokens, act_tokens):
            if e_tok == a_tok:
                continue
            # Try floating point comparison
            try:
                e_val = float(e_tok)
                a_val = float(a_tok)
                if not math.isclose(e_val, a_val, rel_tol=1e-5, abs_tol=1e-5):
                    return False
            except ValueError:
                return False

        return True

    @classmethod
    def generate_smart_test_cases(cls, code: str, language: str) -> List[TestCaseInput]:
        """
        Infers input types and structure from code to generate realistic,
        thorough test cases: normal, boundary, zero, negative, large.
        """
        cases: List[TestCaseInput] = []

        # Analyze input patterns
        has_two_inputs = bool(
            re.search(r'cin\s*>>\s*[a-zA-Z0-9_]+\s*>>\s*[a-zA-Z0-9_]+', code) or
            re.search(r'scanf\s*\(\s*["\']%[a-z]+\s*%[a-z]+', code) or
            re.search(r'map\s*\(\s*int\s*,\s*input\(\)\.split\(\)\)', code) or
            re.search(r'a\s*,\s*b\s*=', code) or
            re.search(r'nextLong\(\).*nextLong\(\)', code, re.DOTALL) or
            re.search(r'tokens\.length\s*>=\s*2', code)
        )

        has_single_input = bool(
            re.search(r'cin\s*>>', code) or
            re.search(r'scanf', code) or
            re.search(r'int\s*\(\s*input\(\)\s*\)', code) or
            re.search(r'scanner\.next', code) or
            re.search(r'fs\.readFileSync', code)
        )

        if has_two_inputs:
            cases.append(TestCaseInput(name="Normal Positive Integers", stdin="15 27", description="Standard positive integers"))
            cases.append(TestCaseInput(name="Zero and Positive", stdin="0 42", description="Zero boundary test"))
            cases.append(TestCaseInput(name="Negative Numbers", stdin="-10 25", description="Negative and positive integers"))
            cases.append(TestCaseInput(name="Both Negative", stdin="-15 -35", description="Both negative values"))
            cases.append(TestCaseInput(name="Large Numbers", stdin="100000 250000", description="Large integer values"))
        elif has_single_input:
            cases.append(TestCaseInput(name="Normal Positive Integer", stdin="7", description="Single positive integer"))
            cases.append(TestCaseInput(name="Zero Boundary", stdin="0", description="Zero boundary test"))
            cases.append(TestCaseInput(name="Negative Number", stdin="-5", description="Negative integer test"))
            cases.append(TestCaseInput(name="Power of Two", stdin="16", description="Typical power of two input"))
            cases.append(TestCaseInput(name="Large Integer", stdin="999", description="Large single integer"))
        else:
            # Standalone program (no stdin needed or array stdin)
            cases.append(TestCaseInput(name="Default Execution", stdin="", description="Program execution without stdin"))
            cases.append(TestCaseInput(name="Array / Sequence Sample", stdin="1 2 3 4 5", description="Array or space-separated tokens"))
            cases.append(TestCaseInput(name="Single Value", stdin="10", description="Single value fallback"))

        return cases

    @classmethod
    async def run_tests(
        cls,
        original_code: str,
        converted_code: str,
        source_language: str,
        target_language: str,
        user_test_cases: Optional[List[TestCaseInput]] = None,
        auto_generate: bool = True,
        runner: Optional[BaseRunner] = None
    ) -> EquivalenceTestResponse:
        exec_runner = runner or get_runner()

        # Build test cases list
        test_inputs: List[TestCaseInput] = []
        if user_test_cases:
            test_inputs.extend(user_test_cases)
        if auto_generate or not test_inputs:
            auto_cases = cls.generate_smart_test_cases(original_code, source_language)
            # Avoid duplicate empty stdin
            existing_stdins = {tc.stdin.strip() for tc in test_inputs}
            for ac in auto_cases:
                if ac.stdin.strip() not in existing_stdins:
                    test_inputs.append(ac)
                    existing_stdins.add(ac.stdin.strip())

        if not test_inputs:
            test_inputs.append(TestCaseInput(name="Default Run", stdin=""))

        # Pre-check compilation on test 1
        results: List[TestCaseResult] = []
        passed_count = 0
        orig_compile_ok = "OK"
        conv_compile_ok = "OK"

        for idx, tc in enumerate(test_inputs, start=1):
            # Run original
            orig_res = await exec_runner.execute(
                source_code=original_code,
                language=source_language,
                stdin=tc.stdin,
                timeout_seconds=8
            )

            if orig_res.status == "COMPILE_ERROR":
                orig_compile_ok = f"Original compilation error: {orig_res.stderr[:150]}"
                results.append(TestCaseResult(
                    test_id=idx,
                    name=tc.name or f"Test {idx}",
                    stdin=tc.stdin,
                    expected_output="",
                    actual_output="",
                    passed=False,
                    status="COMPILE_ERROR",
                    error_message=f"Original program failed compilation:\n{orig_res.stderr}",
                    execution_time_ms=orig_res.execution_time_ms
                ))
                break

            # Run converted
            conv_res = await exec_runner.execute(
                source_code=converted_code,
                language=target_language,
                stdin=tc.stdin,
                timeout_seconds=8
            )

            if conv_res.status == "COMPILE_ERROR":
                conv_compile_ok = f"Converted compilation error: {conv_res.stderr[:150]}"
                results.append(TestCaseResult(
                    test_id=idx,
                    name=tc.name or f"Test {idx}",
                    stdin=tc.stdin,
                    expected_output=orig_res.stdout,
                    actual_output="",
                    passed=False,
                    status="COMPILE_ERROR",
                    error_message=f"Converted program failed compilation:\n{conv_res.stderr}",
                    execution_time_ms=conv_res.execution_time_ms
                ))
                break

            # Compare outputs
            matches = cls.outputs_match(orig_res.stdout, conv_res.stdout)
            status = "PASSED" if matches else "FAILED"
            error_msg = None

            if not matches:
                if conv_res.status in ("RUNTIME_ERROR", "TIMEOUT"):
                    status = conv_res.status
                    error_msg = conv_res.stderr or conv_res.error_message
                else:
                    error_msg = f"Output mismatch. Expected: '{orig_res.stdout.strip()}', Got: '{conv_res.stdout.strip()}'"

            if matches and orig_res.status == "COMPLETED" and conv_res.status == "COMPLETED":
                passed_count += 1

            results.append(TestCaseResult(
                test_id=idx,
                name=tc.name or f"Test {idx}",
                stdin=tc.stdin,
                expected_output=orig_res.stdout,
                actual_output=conv_res.stdout,
                passed=matches and (status == "PASSED"),
                status=status,
                error_message=error_msg,
                execution_time_ms=conv_res.execution_time_ms
            ))

        total_tests = len(results)
        if total_tests == 0:
            equiv_status = "NOT_VERIFIED"
            summary = "No tests were executed."
        elif passed_count == total_tests:
            equiv_status = "PASSED"
            summary = f"All {total_tests} functional test cases passed successfully."
        elif passed_count > 0:
            equiv_status = "PARTIALLY_PASSED"
            summary = f"{passed_count} of {total_tests} test cases passed. Some discrepancies detected."
        else:
            equiv_status = "FAILED"
            summary = f"All {total_tests} test cases failed to produce matching behavior."

        return EquivalenceTestResponse(
            total_tests=total_tests,
            passed_tests=passed_count,
            failed_tests=total_tests - passed_count,
            test_results=results,
            equivalence_status=equiv_status,
            summary=summary,
            original_compile_status=orig_compile_ok,
            converted_compile_status=conv_compile_ok
        )
