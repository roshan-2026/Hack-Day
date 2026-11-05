import shutil
import subprocess
import tempfile
import os
import time
import logging
import sys
from typing import Dict, Optional
from app.execution.base_runner import BaseRunner, ExecutionResult

logger = logging.getLogger(__name__)

class LocalRunner(BaseRunner):
    """
    Executes code locally when native compilers/interpreters are available.
    """

    def is_available(self) -> bool:
        return True

    def can_run_language(self, language: str) -> bool:
        norm = self.normalize_language(language)
        if norm == "python":
            return bool(sys.executable)
        if norm == "javascript":
            return bool(shutil.which("node"))
        if norm == "cpp":
            return bool(shutil.which("g++") or shutil.which("clang++"))
        if norm == "c":
            return bool(shutil.which("gcc") or shutil.which("clang"))
        if norm == "java":
            return bool(shutil.which("javac") and shutil.which("java"))
        return False

    async def execute(
        self,
        source_code: str,
        language: str,
        stdin: str = "",
        timeout_seconds: int = 10,
        memory_limit_mb: int = 128
    ) -> ExecutionResult:
        norm = self.normalize_language(language)

        with tempfile.TemporaryDirectory() as tmp_dir:
            start_t = time.time()
            try:
                if norm == "python":
                    file_path = os.path.join(tmp_dir, "main.py")
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(source_code)
                    cmd = [sys.executable, file_path]
                    proc = subprocess.run(
                        cmd, input=stdin, capture_output=True, text=True, timeout=timeout_seconds, cwd=tmp_dir
                    )
                    exec_time_ms = (time.time() - start_t) * 1000.0
                    status = "COMPLETED" if proc.returncode == 0 else "RUNTIME_ERROR"
                    return ExecutionResult(
                        stdout=proc.stdout,
                        stderr=proc.stderr,
                        exit_code=proc.returncode,
                        execution_time_ms=round(exec_time_ms, 2),
                        status=status,
                        runner_used="local",
                        error_message=proc.stderr if status != "COMPLETED" else None
                    )

                elif norm == "javascript":
                    node_bin = shutil.which("node")
                    if not node_bin:
                        return ExecutionResult(status="FAILED", runner_used="local", error_message="Node.js runtime not found locally.")
                    file_path = os.path.join(tmp_dir, "main.js")
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(source_code)
                    proc = subprocess.run(
                        [node_bin, file_path], input=stdin, capture_output=True, text=True, timeout=timeout_seconds, cwd=tmp_dir
                    )
                    exec_time_ms = (time.time() - start_t) * 1000.0
                    status = "COMPLETED" if proc.returncode == 0 else "RUNTIME_ERROR"
                    return ExecutionResult(
                        stdout=proc.stdout,
                        stderr=proc.stderr,
                        exit_code=proc.returncode,
                        execution_time_ms=round(exec_time_ms, 2),
                        status=status,
                        runner_used="local",
                        error_message=proc.stderr if status != "COMPLETED" else None
                    )

                elif norm == "cpp":
                    gpp = shutil.which("g++") or shutil.which("clang++")
                    if not gpp:
                        return ExecutionResult(status="FAILED", runner_used="local", error_message="C++ compiler (g++/clang++) not found locally.")
                    src = os.path.join(tmp_dir, "main.cpp")
                    out = os.path.join(tmp_dir, "main.exe" if os.name == "nt" else "main")
                    with open(src, "w", encoding="utf-8") as f:
                        f.write(source_code)
                    c_proc = subprocess.run([gpp, "-O2", "-std=c++17", src, "-o", out], capture_output=True, text=True, timeout=timeout_seconds)
                    if c_proc.returncode != 0:
                        return ExecutionResult(stdout="", stderr=c_proc.stderr, exit_code=c_proc.returncode, status="COMPILE_ERROR", runner_used="local")
                    r_proc = subprocess.run([out], input=stdin, capture_output=True, text=True, timeout=timeout_seconds, cwd=tmp_dir)
                    exec_time_ms = (time.time() - start_t) * 1000.0
                    status = "COMPLETED" if r_proc.returncode == 0 else "RUNTIME_ERROR"
                    return ExecutionResult(stdout=r_proc.stdout, stderr=r_proc.stderr, exit_code=r_proc.returncode, execution_time_ms=round(exec_time_ms, 2), status=status, runner_used="local")

                elif norm == "c":
                    gcc = shutil.which("gcc") or shutil.which("clang")
                    if not gcc:
                        return ExecutionResult(status="FAILED", runner_used="local", error_message="C compiler (gcc/clang) not found locally.")
                    src = os.path.join(tmp_dir, "main.c")
                    out = os.path.join(tmp_dir, "main.exe" if os.name == "nt" else "main")
                    with open(src, "w", encoding="utf-8") as f:
                        f.write(source_code)
                    c_proc = subprocess.run([gcc, "-O2", src, "-o", out], capture_output=True, text=True, timeout=timeout_seconds)
                    if c_proc.returncode != 0:
                        return ExecutionResult(stdout="", stderr=c_proc.stderr, exit_code=c_proc.returncode, status="COMPILE_ERROR", runner_used="local")
                    r_proc = subprocess.run([out], input=stdin, capture_output=True, text=True, timeout=timeout_seconds, cwd=tmp_dir)
                    exec_time_ms = (time.time() - start_t) * 1000.0
                    status = "COMPLETED" if r_proc.returncode == 0 else "RUNTIME_ERROR"
                    return ExecutionResult(stdout=r_proc.stdout, stderr=r_proc.stderr, exit_code=r_proc.returncode, execution_time_ms=round(exec_time_ms, 2), status=status, runner_used="local")

                elif norm == "java":
                    javac = shutil.which("javac")
                    java_bin = shutil.which("java")
                    if not javac or not java_bin:
                        return ExecutionResult(status="FAILED", runner_used="local", error_message="Java compiler (javac/java) not found locally.")
                    src = os.path.join(tmp_dir, "Main.java")
                    with open(src, "w", encoding="utf-8") as f:
                        f.write(source_code)
                    c_proc = subprocess.run([javac, src], capture_output=True, text=True, timeout=timeout_seconds, cwd=tmp_dir)
                    if c_proc.returncode != 0:
                        return ExecutionResult(stdout="", stderr=c_proc.stderr, exit_code=c_proc.returncode, status="COMPILE_ERROR", runner_used="local")
                    r_proc = subprocess.run([java_bin, "Main"], input=stdin, capture_output=True, text=True, timeout=timeout_seconds, cwd=tmp_dir)
                    exec_time_ms = (time.time() - start_t) * 1000.0
                    status = "COMPLETED" if r_proc.returncode == 0 else "RUNTIME_ERROR"
                    return ExecutionResult(stdout=r_proc.stdout, stderr=r_proc.stderr, exit_code=r_proc.returncode, execution_time_ms=round(exec_time_ms, 2), status=status, runner_used="local")

                else:
                    return ExecutionResult(status="FAILED", runner_used="local", error_message=f"Unsupported language: {language}")

            except subprocess.TimeoutExpired:
                return ExecutionResult(status="TIMEOUT", runner_used="local", error_message=f"Execution timed out ({timeout_seconds}s limit)")
            except Exception as e:
                return ExecutionResult(status="FAILED", runner_used="local", error_message=str(e))
