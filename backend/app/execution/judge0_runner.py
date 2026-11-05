import httpx
import logging
from typing import Dict, Optional
from app.execution.base_runner import BaseRunner, ExecutionResult
from app.core.config import settings

logger = logging.getLogger(__name__)

class Judge0Runner(BaseRunner):
    """
    Runner using Judge0 CE or self-hosted Judge0 API.
    Supports C, C++, Java, Python, and JavaScript without requiring local compilers.
    """

    LANGUAGE_IDS: Dict[str, int] = {
        "c": 103,         # C (GCC 14.1.0)
        "cpp": 105,       # C++ (GCC 14.1.0)
        "java": 91,       # Java (JDK 17.0.6)
        "python": 100,    # Python (3.12.5)
        "javascript": 102 # JavaScript (Node.js 22.08.0)
    }

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        api_host: Optional[str] = None
    ):
        self.base_url = (base_url or settings.JUDGE0_URL).rstrip("/")
        self.api_key = api_key or settings.JUDGE0_API_KEY
        self.api_host = api_host or settings.JUDGE0_HOST

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
        lang_id = self.LANGUAGE_IDS.get(norm_lang)

        if not lang_id:
            return ExecutionResult(
                status="FAILED",
                runner_used="judge0",
                error_message=f"Unsupported language '{language}' for Judge0 runner."
            )

        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CodeConverter/1.0"
        }
        if self.api_key:
            headers["X-Auth-Token"] = self.api_key
            headers["x-rapidapi-key"] = self.api_key
        if self.api_host:
            headers["x-rapidapi-host"] = self.api_host

        payload = {
            "source_code": source_code,
            "language_id": lang_id,
            "stdin": stdin or "",
            "cpu_time_limit": min(timeout_seconds, 15),
            "memory_limit": memory_limit_mb * 1024, # KB
        }

        url = f"{self.base_url}/submissions?base64_encoded=false&wait=true"

        try:
            async with httpx.AsyncClient(timeout=timeout_seconds + 8) as client:
                response = await client.post(url, json=payload, headers=headers)
                if response.status_code not in (200, 201):
                    return ExecutionResult(
                        status="FAILED",
                        runner_used="judge0",
                        error_message=f"Judge0 API returned HTTP {response.status_code}: {response.text[:200]}"
                    )

                data = response.json()
                status_obj = data.get("status", {})
                status_id = status_obj.get("id", 0)
                status_desc = status_obj.get("description", "")

                stdout = data.get("stdout") or ""
                stderr = data.get("stderr") or ""
                compile_output = data.get("compile_output") or ""
                time_str = data.get("time") or "0"
                memory_kb = int(data.get("memory") or 0)
                exit_code = data.get("exit_code") or (0 if status_id == 3 else 1)

                try:
                    exec_time_ms = float(time_str) * 1000.0
                except ValueError:
                    exec_time_ms = 0.0

                # Judge0 status IDs:
                # 3 = Accepted
                # 4 = Wrong Answer
                # 5 = Time Limit Exceeded
                # 6 = Compilation Error
                # 7 = Runtime Error (SIGSEGV)
                # 8 = Runtime Error (SIGXFSZ)
                # 9 = Runtime Error (SIGFPE)
                # 10 = Runtime Error (SIGABRT)
                # 11 = Runtime Error (NZEC)
                # 12 = Runtime Error (Other)
                # 13 = Internal Error
                # 14 = Exec Format Error
                if status_id == 3:
                    final_status = "COMPLETED"
                elif status_id == 5:
                    final_status = "TIMEOUT"
                    stderr = f"Execution timed out ({timeout_seconds}s limit).\n" + stderr
                elif status_id == 6:
                    final_status = "COMPILE_ERROR"
                    stderr = compile_output or stderr or "Compilation error occurred."
                elif status_id in (7, 8, 9, 10, 11, 12):
                    final_status = "RUNTIME_ERROR"
                    if not stderr and status_desc:
                        stderr = f"Runtime Error: {status_desc}"
                else:
                    final_status = "FAILED" if status_id != 3 else "COMPLETED"

                return ExecutionResult(
                    stdout=stdout,
                    stderr=stderr,
                    exit_code=exit_code,
                    execution_time_ms=round(exec_time_ms, 2),
                    memory_kb=memory_kb,
                    status=final_status,
                    runner_used="judge0",
                    error_message=status_desc if final_status in ("COMPILE_ERROR", "RUNTIME_ERROR", "TIMEOUT") else None
                )
        except httpx.TimeoutException:
            return ExecutionResult(
                status="TIMEOUT",
                runner_used="judge0",
                error_message=f"Execution request timed out after {timeout_seconds} seconds."
            )
        except Exception as e:
            logger.error(f"Judge0 execution error: {e}")
            return ExecutionResult(
                status="FAILED",
                runner_used="judge0",
                error_message=f"Network or service error connecting to Judge0: {str(e)}"
            )
