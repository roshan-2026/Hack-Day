import logging
from typing import Optional
from app.execution.base_runner import BaseRunner, ExecutionResult
from app.execution.judge0_runner import Judge0Runner
from app.execution.piston_runner import PistonRunner
from app.execution.docker_runner import DockerRunner
from app.execution.local_runner import LocalRunner
from app.core.config import settings

logger = logging.getLogger(__name__)

class CompositeRunner(BaseRunner):
    """
    Intelligent execution runner that supports switching and graceful fallbacks
    across Judge0, Piston, Docker, and Local execution.
    """

    def __init__(self, provider: Optional[str] = None):
        self.provider = (provider or settings.EXECUTION_PROVIDER).lower()
        self.judge0 = Judge0Runner()
        self.piston = PistonRunner()
        self.docker = DockerRunner()
        self.local = LocalRunner()

    def is_available(self) -> bool:
        return True

    async def execute(
        self,
        source_code: str,
        language: str,
        stdin: str = "",
        timeout_seconds: int = 10,
        memory_limit_mb: int = 128
    ) -> ExecutionResult:
        timeout = timeout_seconds or settings.EXECUTION_TIMEOUT_SECONDS
        memory = memory_limit_mb or settings.MEMORY_LIMIT_MB

        if self.provider == "judge0":
            return await self.judge0.execute(source_code, language, stdin, timeout, memory)
        elif self.provider == "piston":
            return await self.piston.execute(source_code, language, stdin, timeout, memory)
        elif self.provider == "docker":
            return await self.docker.execute(source_code, language, stdin, timeout, memory)
        elif self.provider == "local":
            return await self.local.execute(source_code, language, stdin, timeout, memory)

        # "auto" mode:
        # First check if local runner can run this language natively (Python, Node.js)
        if self.local.can_run_language(language):
            local_res = await self.local.execute(source_code, language, stdin, timeout, memory)
            if local_res.status != "FAILED" or "not found" not in (local_res.error_message or "").lower():
                return local_res

        # Try Piston runner first (public, free, fast, supports all 20 languages without API key)
        if self.piston.is_available():
            piston_res = await self.piston.execute(source_code, language, stdin, timeout, memory)
            if piston_res.status in ("COMPLETED", "COMPILE_ERROR", "RUNTIME_ERROR", "TIMEOUT"):
                return piston_res

        # Try Judge0 runner (remote sandbox)
        res = await self.judge0.execute(source_code, language, stdin, timeout, memory)
        if res.status in ("COMPLETED", "COMPILE_ERROR", "RUNTIME_ERROR", "TIMEOUT"):
            return res

        # If Docker is active, try Docker
        if self.docker.is_available():
            docker_res = await self.docker.execute(source_code, language, stdin, timeout, memory)
            if docker_res.status != "FAILED":
                return docker_res

        # If Piston had an informative error or result, return it
        if 'piston_res' in locals() and piston_res:
            return piston_res

        return res
