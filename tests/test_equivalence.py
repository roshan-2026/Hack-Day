import sys
import asyncio
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent / "backend"))

from app.services.equivalence_tester import EquivalenceTester

async def test_cpp_python_equivalence():
    cpp_code = """#include <iostream>
using namespace std;

int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << a + b << endl;
    }
    return 0;
}"""

    python_code = """import sys

def main():
    tokens = sys.stdin.read().split()
    if len(tokens) >= 2:
        print(int(tokens[0]) + int(tokens[1]))

if __name__ == '__main__':
    main()"""

    res = await EquivalenceTester.run_tests(
        original_code=cpp_code,
        converted_code=python_code,
        source_language="cpp",
        target_language="python",
        auto_generate=True
    )

    print(f"Equivalence Status: {res.equivalence_status}")
    print(f"Total: {res.total_tests}, Passed: {res.passed_tests}, Failed: {res.failed_tests}")
    for tc in res.test_results:
        print(f"  [{'PASS' if tc.passed else 'FAIL'}] {tc.name}: stdin='{tc.stdin}', expected='{tc.expected_output.strip()}', actual='{tc.actual_output.strip()}'")

    assert res.equivalence_status == "PASSED", f"Expected PASSED, got {res.equivalence_status}: {res.summary}"
    assert res.passed_tests >= 5
    print("Scenario 6 (Functional equivalence testing with 5+ inputs) passed!")

if __name__ == "__main__":
    asyncio.run(test_cpp_python_equivalence())
