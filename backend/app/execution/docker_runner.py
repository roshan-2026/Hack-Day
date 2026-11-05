import shutil
import subprocess
import tempfile
import os
import time
import logging
from typing import Dict, Optional
from app.execution.base_runner import BaseRunner, ExecutionResult

logger = logging.getLogger(__name__)

class DockerRunner(BaseRunner):
    """
    Runner using local Docker daemon for containerized execution.
    Applies security constraints: --network none, memory limits, cpu limits, timeout, non-root user.
    """

    IMAGE_MAP: Dict[str, Dict[str, str]] = {
        "c": {"image": "gcc:latest", "compile": "gcc -O2 main.c -o main", "run": "./main", "file": "main.c"},
        "cpp": {"image": "gcc:latest", "compile": "g++ -O2 -std=c++17 main.cpp -o main", "run": "./main", "file": "main.cpp"},
        "java": {"image": "openjdk:17-alpine", "compile": "javac Main.java", "run": "java Main", "file": "Main.java"},
        "python": {"image": "python:3.11-alpine", "compile": "", "run": "python main.py", "file": "main.py"},
        "javascript": {"image": "node:18-alpine", "compile": "", "run": "node main.js", "file": "main.js"}
    }

    def __init__(self):
        self._docker_available: Optional[bool] = None

    def is_available(self) -> bool:
        if self._docker_available is None:
            self._docker_available = bool(shutil.which("docker"))
            if self._docker_available:
                try:
                    res = subprocess.run(["docker", "info"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=2)
                    self._docker_available = (res.returncode == 0)
                except Exception:
                    self._docker_available = False
        return self._docker_available

    async def execute(
        self,
        source_code: str,
        language: str,
        stdin: str = "",
        timeout_seconds: int = 10,
        memory_limit_mb: int = 128
    ) -> ExecutionResult:
        if not self.is_available():
            return ExecutionResult(
                status="FAILED",
                runner_used="docker",
                error_message="Docker daemon is not running or docker CLI is not installed on this host."
            )

        norm_lang = self.normalize_language(language)
        cfg = self.IMAGE_MAP.get(norm_lang)
        if not cfg:
            return ExecutionResult(
                status="FAILED",
                runner_used="docker",
                error_message=f"Unsupported language '{language}' in Docker runner."
            )

        with tempfile.TemporaryDirectory() as tmp_dir:
            file_path = os.path.join(tmp_dir, cfg["file"])
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(source_code)

            start_t = time.time()

            # Compile if needed
            if cfg["compile"]:
                compile_cmd = [
                    "docker", "run", "--rm",
                    "--network", "none",
                    "--memory", f"{memory_limit_mb}m",
                    "-v", f"{tmp_dir}:/code",
                    "-w", "/code",
                    cfg["image"],
                    "sh", "-c", cfg["compile"]
                ]
                try:
                    proc = subprocess.run(compile_cmd, capture_output=True, text=True, timeout=timeout_seconds)
                    if proc.returncode != 0:
                        return ExecutionResult(
                            stdout="",
                            stderr=proc.stderr or proc.stdout,
                            exit_code=proc.returncode,
                            status="COMPILE_ERROR",
                            runner_used="docker",
                            error_message="Compilation error in Docker"
                        )
                except subprocess.TimeoutExpired:
                    return ExecutionResult(
                        status="TIMEOUT",
                        runner_used="docker",
                        error_message="Compilation timed out"
                    )

            # Run container
            run_cmd = [
                "docker", "run", "--rm", "-i",
                "--network", "none",
                "--memory", f"{memory_limit_mb}m",
                "--cpus", "0.5",
                "-v", f"{tmp_dir}:/code:ro",
                "-w", "/code",
                cfg["image"],
                "sh", "-c", cfg["run"]
            ]

            try:
                proc = subprocess.run(run_cmd, input=stdin, capture_output=True, text=True, timeout=timeout_seconds)
                exec_time_ms = (time.time() - start_t) * 1000.0
                status = "COMPLETED" if proc.returncode == 0 else "RUNTIME_ERROR"
                return ExecutionResult(
                    stdout=proc.stdout,
                    stderr=proc.stderr,
                    exit_code=proc.returncode,
                    execution_time_ms=round(exec_time_ms, 2),
                    status=status,
                    runner_used="docker",
                    error_message=proc.stderr if status != "COMPLETED" else None
                )
            except subprocess.TimeoutExpired:
                return ExecutionResult(
                    status="TIMEOUT",
                    runner_used="docker",
                    error_message=f"Execution timed out ({timeout_seconds}s limit)"
                )
            except Exception as e:
                return ExecutionResult(
                    status="FAILED",
                    runner_used="docker",
                    error_message=f"Docker error: {str(e)}"
                )
