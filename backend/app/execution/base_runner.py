from abc import ABC, abstractmethod
from typing import Optional
from dataclasses import dataclass

@dataclass
class ExecutionResult:
    stdout: str = ""
    stderr: str = ""
    exit_code: int = 0
    execution_time_ms: float = 0.0
    memory_kb: int = 0
    status: str = "COMPLETED"  # "COMPLETED" | "COMPILE_ERROR" | "RUNTIME_ERROR" | "TIMEOUT" | "FAILED"
    runner_used: str = "unknown"
    error_message: Optional[str] = None

class BaseRunner(ABC):
    @abstractmethod
    async def execute(
        self,
        source_code: str,
        language: str,
        stdin: str = "",
        timeout_seconds: int = 10,
        memory_limit_mb: int = 128
    ) -> ExecutionResult:
        pass

    @abstractmethod
    def is_available(self) -> bool:
        pass

    @staticmethod
    def normalize_language(lang: str) -> str:
        l = (lang or "").strip().lower()
        if l in ["c++", "cpp", "cplusplus"]:
            return "cpp"
        if l in ["c"]:
            return "c"
        if l in ["java"]:
            return "java"
        if l in ["python", "python3", "py"]:
            return "python"
        if l in ["javascript", "js", "node", "nodejs"]:
            return "javascript"
        if l in ["typescript", "ts"]:
            return "typescript"
        if l in ["csharp", "c#", "cs"]:
            return "csharp"
        if l in ["golang", "go"]:
            return "go"
        if l in ["rust", "rs"]:
            return "rust"
        if l in ["shell", "sh", "bash"]:
            return "bash"
        if l in ["ruby", "rb"]:
            return "ruby"
        if l in ["kotlin", "kt"]:
            return "kotlin"
        return l
