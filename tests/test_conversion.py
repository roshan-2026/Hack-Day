import sys
import asyncio
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent / "backend"))

from app.services.conversion_engine import ConversionEngine

async def test_cpp_to_python_conversion():
    cpp_code = """#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b;
    return 0;
}"""
    converted, status, notes = await ConversionEngine.convert(
        source_code=cpp_code,
        source_language="cpp",
        target_language="python"
    )
    assert status == "success"
    assert "print" in converted
    assert "input" in converted or "sys.stdin" in converted
    print("Scenario 1 (C++ to Python conversion) passed!")

async def test_python_to_cpp_with_custom_instructions():
    py_code = """n = int(input())
print(n * n)"""
    converted, status, notes = await ConversionEngine.convert(
        source_code=py_code,
        source_language="python",
        target_language="cpp",
        custom_instructions="Use functions and modern C++17 syntax."
    )
    assert status == "success"
    assert "iostream" in converted
    assert "cin >>" in converted or "std::cin" in converted
    print("Scenario 2 & 4 (Python to C++ with custom instructions) passed!")

async def main():
    await test_cpp_to_python_conversion()
    await test_python_to_cpp_with_custom_instructions()
    print("All conversion tests passed!")

if __name__ == "__main__":
    asyncio.run(main())
