import os
import re
import logging
from typing import Optional
import httpx
from app.services.conversion_engine import ConversionEngine
from app.core.config import settings

logger = logging.getLogger(__name__)

class CodeExplainer:
    COMMENT_SYNTAX = {
        "c": "//",
        "cpp": "//",
        "java": "//",
        "python": "#",
        "javascript": "//"
    }

    @classmethod
    async def explain(
        cls,
        source_code: str,
        language: str,
        api_key: Optional[str] = None
    ) -> str:
        norm_lang = (language or "").strip().lower()
        if norm_lang == "c++":
            norm_lang = "cpp"

        effective_key = (api_key or os.getenv("GEMINI_API_KEY", "") or settings.GEMINI_API_KEY).strip()
        comment_prefix = cls.COMMENT_SYNTAX.get(norm_lang, "//")

        if effective_key:
            candidate_models = settings.CANDIDATE_GEMINI_MODELS or [
                "gemini-3.1-flash-lite",
                "gemini-3.5-flash",
                "gemini-3.8-flash"
            ]

            system_instruction = (
                f"You are a code documentation specialist. Analyze the provided {norm_lang.upper()} program "
                f"and annotate it by inserting concise, meaningful, high-level inline comments explaining key logic, "
                f"algorithms, data structures, and operations.\n\n"
                f"CRITICAL REQUIREMENTS:\n"
                f"1. Return ONLY pure, executable {norm_lang.upper()} source code with inline comments.\n"
                f"2. All explanations must be valid inline comments using '{comment_prefix} ' syntax.\n"
                f"3. DO NOT wrap the output in markdown code fences (NO ```, NO ```{norm_lang}).\n"
                f"4. DO NOT write conversational explanations, chat responses, or markdown articles.\n"
                f"5. DO NOT alter the program's execution, logic, or syntax.\n"
                f"6. Do not comment trivial braces; focus on algorithms, loops, conditions, and calculations.\n"
            )

            prompt = f"Please annotate this {norm_lang.upper()} code with concise inline comments:\n\n{source_code}"

            for model in candidate_models:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={effective_key}"
                    payload = {
                        "system_instruction": {"parts": [{"text": system_instruction}]},
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 4096}
                    }
                    async with httpx.AsyncClient(timeout=15.0) as client:
                        resp = await client.post(url, json=payload)
                        if resp.status_code == 200:
                            data = resp.json()
                            candidates = data.get("candidates", [])
                            if candidates and "content" in candidates[0]:
                                text = candidates[0]["content"]["parts"][0]["text"]
                                if text and text.strip():
                                    return ConversionEngine.clean_markdown_fences(text)
                except Exception as e:
                    logger.warning(f"Explainer model {model} failed: {e}")

        # Heuristic inline comments fallback
        return cls._heuristic_explain(source_code, norm_lang)

    @classmethod
    def _heuristic_explain(cls, code: str, language: str) -> str:
        """Annotates standard code constructs with inline comments."""
        prefix = cls.COMMENT_SYNTAX.get(language, "//")
        lines = code.split("\n")
        annotated_lines = []

        added_header = False

        for line in lines:
            stripped = line.strip()

            if not added_header and stripped and not stripped.startswith(prefix):
                annotated_lines.append(f"{prefix} Program logic and execution pipeline")
                added_header = True

            if ("cin >>" in stripped or "scanf" in stripped or "input()" in stripped or "Scanner" in stripped) and not stripped.startswith(prefix):
                annotated_lines.append(f"    {prefix} Read and parse standard input values")

            if ("+" in stripped or "*" in stripped or "cout" in stripped or "print" in stripped or "printf" in stripped) and not stripped.startswith(prefix):
                if not any(k in stripped for k in ("for", "while", "include", "import")):
                    annotated_lines.append(f"    {prefix} Emit formatted program output")

            if (stripped.startswith("for ") or stripped.startswith("while ") or "for(" in stripped) and not stripped.startswith(prefix):
                annotated_lines.append(f"    {prefix} Iterate through input collection / sequence")

            if (stripped.startswith("if ") or "if(" in stripped or stripped.startswith("elif ")) and not stripped.startswith(prefix):
                annotated_lines.append(f"    {prefix} Validate condition and branch execution")

            annotated_lines.append(line)

        return "\n".join(annotated_lines)
