import sys
import asyncio
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent / "backend"))

from app.execution import get_runner

async def test_python_execution():
    runner = get_runner()
    py_code = """a, b = map(int, input().split())
print(a + b)"""
    res = await runner.execute(
        source_code=py_code,
        language="python",
        stdin="15 27",
        timeout_seconds=10
    )
    assert res.status == "COMPLETED", f"Execution failed: {res.stderr or res.error_message}"
    assert res.stdout.strip() == "42", f"Expected '42', got '{res.stdout}'"
    print(f"Python execution test passed! Runner: {res.runner_used}, Time: {res.execution_time_ms}ms")

async def test_cpp_execution():
    runner = get_runner()
    cpp_code = """#include <iostream>
using namespace std;

int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << a + b << endl;
    }
    return 0;
}"""
    res = await runner.execute(
        source_code=cpp_code,
        language="cpp",
        stdin="10 20",
        timeout_seconds=10
    )
    assert res.status == "COMPLETED", f"Execution failed: {res.stderr or res.error_message}"
    assert res.stdout.strip() == "30", f"Expected '30', got '{res.stdout}'"
    print(f"C++ execution test passed! Runner: {res.runner_used}, Time: {res.execution_time_ms}ms")

async def main():
    await test_python_execution()
    await test_cpp_execution()
    print("All execution tests passed!")

if __name__ == "__main__":
    asyncio.run(main())
