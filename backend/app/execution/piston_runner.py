import httpx
import logging
from typing import Dict, Optional
from app.execution.base_runner import BaseRunner, ExecutionResult
from app.core.config import settings

logger = logging.getLogger(__name__)

class PistonRunner(BaseRunner):
    """
    Runner using Piston API (e.g. self-hosted or authenticated public Piston).
    """

    LANGUAGE_MAP: Dict[str, Dict[str, str]] = {
        "c": {"language": "c", "version": "*", "file": "main.c"},
        "cpp": {"language": "c++", "version": "*", "file": "main.cpp"},
        "java": {"language": "java", "version": "*", "file": "Main.java"},
        "python": {"language": "python", "version": "*", "file": "main.py"},
        "javascript": {"language": "javascript", "version": "*", "file": "main.js"},
        "typescript": {"language": "typescript", "version": "*", "file": "main.ts"},
        "csharp": {"language": "csharp", "version": "*", "file": "Program.cs"},
        "go": {"language": "go", "version": "*", "file": "main.go"},
        "rust": {"language": "rust", "version": "*", "file": "main.rs"},
        "php": {"language": "php", "version": "*", "file": "index.php"},
        "ruby": {"language": "ruby", "version": "*", "file": "main.rb"},
        "kotlin": {"language": "kotlin", "version": "*", "file": "Main.kt"},
        "swift": {"language": "swift", "version": "*", "file": "main.swift"},
        "dart": {"language": "dart", "version": "*", "file": "main.dart"},
        "r": {"language": "r", "version": "*", "file": "main.r"},
        "julia": {"language": "julia", "version": "*", "file": "main.jl"},
        "scala": {"language": "scala", "version": "*", "file": "Main.scala"},
        "perl": {"language": "perl", "version": "*", "file": "main.pl"},
        "lua": {"language": "lua", "version": "*", "file": "main.lua"},
        "bash": {"language": "bash", "version": "*", "file": "script.sh"}
    }

    FILE_NAMES: Dict[str, str] = {
        "c": "main.c",
        "cpp": "main.cpp",
        "java": "Main.java",
        "python": "main.py",
        "javascript": "main.js",
        "typescript": "main.ts",
        "csharp": "Program.cs",
        "go": "main.go",
        "rust": "main.rs",
        "php": "index.php",
        "ruby": "main.rb",
        "kotlin": "Main.kt",
        "swift": "main.swift",
        "dart": "main.dart",
        "r": "main.r",
        "julia": "main.jl",
        "scala": "Main.scala",
        "perl": "main.pl",
        "lua": "main.lua",
        "bash": "script.sh"
    }

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        self.base_url = (base_url or settings.PISTON_URL).rstrip("/")
        self.api_key = api_key or settings.PISTON_API_KEY

    def is_available(self) -> bool:
        return bool(self.base_url)

    async def execute(
        self,
        source_code: str,
        language: str,
        stdin: str = "",
        timeout_seconds: int = 10,
        memory_limit_mb: int = 128
    ) -> ExecutionResult:
        norm_lang = self.normalize_language(language)
        cfg = self.LANGUAGE_MAP.get(norm_lang)
        if not cfg:
            return ExecutionResult(
                status="FAILED",
                runner_used="piston",
                error_message=f"Unsupported language '{language}' for Piston runner."
            )

        filename = self.FILE_NAMES.get(norm_lang, "code.txt")
        if norm_lang == "java":
            import re
            m = re.search(r"public\s+class\s+([A-Za-z0-9_]+)", source_code)
            if m:
                filename = f"{m.group(1)}.java"
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CodeConverter/1.0"
        }
        if self.api_key:
            headers["Authorization"] = self.api_key

        payload = {
            "language": cfg["language"],
            "version": cfg["version"],
            "files": [{"name": filename, "content": source_code}],
            "stdin": stdin or "",
            "run_timeout": timeout_seconds * 1000,
            "compile_timeout": 10000
        }

        url = f"{self.base_url}/execute"

        try:
            async with httpx.AsyncClient(timeout=timeout_seconds + 8) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code != 200:
                    return ExecutionResult(
                        status="FAILED",
                        runner_used="piston",
                        error_message=f"Piston HTTP {res.status_code}: {res.text[:200]}"
                    )

                data = res.json()
                compile_stage = data.get("compile") or {}
                run_stage = data.get("run") or {}

                compile_stderr = compile_stage.get("stderr") or ""
                compile_code = compile_stage.get("code")

                if compile_code is not None and compile_code != 0:
                    return ExecutionResult(
                        stdout="",
                        stderr=compile_stderr or "Compilation failed.",
                        exit_code=compile_code,
                        status="COMPILE_ERROR",
                        runner_used="piston",
                        error_message="Compilation error"
                    )

                stdout = run_stage.get("stdout") or ""
                stderr = run_stage.get("stderr") or ""
                exit_code = run_stage.get("code") or 0
                signal = run_stage.get("signal")

                status = "COMPLETED"
                if signal == "SIGKILL" or "timed out" in stderr.lower():
                    status = "TIMEOUT"
                elif exit_code != 0:
                    status = "RUNTIME_ERROR"

                return ExecutionResult(
                    stdout=stdout,
                    stderr=stderr,
                    exit_code=exit_code,
                    execution_time_ms=0.0,
                    status=status,
                    runner_used="piston",
                    error_message=stderr if status != "COMPLETED" else None
                )
        except Exception as e:
            logger.error(f"Piston execution error: {e}")
            return ExecutionResult(
                status="FAILED",
                runner_used="piston",
                error_message=f"Piston connection error: {str(e)}"
            )
