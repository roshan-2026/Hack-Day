from app.execution.base_runner import BaseRunner, ExecutionResult
from app.execution.judge0_runner import Judge0Runner
from app.execution.piston_runner import PistonRunner
from app.execution.docker_runner import DockerRunner
from app.execution.local_runner import LocalRunner
from app.execution.composite_runner import CompositeRunner

def get_runner(provider: str = "auto") -> BaseRunner:
    return CompositeRunner(provider=provider)

__all__ = [
    "BaseRunner",
    "ExecutionResult",
    "Judge0Runner",
    "PistonRunner",
    "DockerRunner",
    "LocalRunner",
    "CompositeRunner",
    "get_runner"
]
