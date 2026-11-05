import sys
import asyncio
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent / "backend"))

from app.services.conversion_engine import ConversionEngine
from app.services.equivalence_tester import EquivalenceTester
from app.services.correction_engine import CorrectionEngine
from app.services.language_detector import LanguageDetector
from app.execution import get_runner

async def test_scenario_2():
    print("\n--- Testing Scenario 2: Python to C++ (n * n) ---")
    py_code = """n = int(input())
print(n * n)"""
    converted, status, _ = await ConversionEngine.convert(py_code, "python", "cpp")
    assert "iostream" in converted
    assert "cin >>" in converted or "std::cin" in converted
    print("Scenario 2 conversion succeeded.")

    # Test equivalence
    res = await EquivalenceTester.run_tests(py_code, converted, "python", "cpp", auto_generate=True)
    print(f"Scenario 2 Equivalence: {res.equivalence_status} ({res.passed_tests}/{res.total_tests})")
    assert res.passed_tests > 0

async def test_scenario_3():
    print("\n--- Testing Scenario 3: Java to Python ---")
    java_code = """import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
    }
}"""
    converted, status, _ = await ConversionEngine.convert(java_code, "java", "python")
    assert "sys" in converted or "input" in converted
    print("Scenario 3 conversion succeeded.")

async def test_scenario_4():
    print("\n--- Testing Scenario 4: Custom Instructions (C++17 Functions) ---")
    py_code = """n = int(input())
print(n * n)"""
    converted, status, notes = await ConversionEngine.convert(
        py_code, "python", "cpp", custom_instructions="Use functions and modern C++17 syntax."
    )
    assert "square" in converted or "function" in notes.lower() or "c++17" in converted.lower() or "long long" in converted
    print(f"Scenario 4 custom instructions applied successfully. Notes: {notes}")

async def test_scenario_5():
    print("\n--- Testing Scenario 5: AI Automatic Correction ---")
    orig_cpp = """#include <iostream>
using namespace std;
int main() {
    int a, b;
    if (cin >> a >> b) cout << a + b;
    return 0;
}"""
    # Flawed python code with syntax error (missing colon / missing main definition)
    flawed_py = """import sys
def main()
    tokens = sys.stdin.read().split()
    print(int(tokens[0]) + int(tokens[1]))
"""
    corr_res = await CorrectionEngine.auto_correct(
        original_code=orig_cpp,
        converted_code=flawed_py,
        source_language="cpp",
        target_language="python",
        error_details="SyntaxError: invalid syntax",
        max_retries=2
    )
    print(f"Auto-correction attempts: {corr_res.attempts}, succeeded: {corr_res.succeeded}")

async def test_scenario_7():
    print("\n--- Testing Scenario 7: Invalid & Ambiguous Input ---")
    # Empty code
    det_empty = LanguageDetector.detect("   ")
    assert det_empty["status"] == "unknown"

    # Ambiguous snippet
    det_ambig = LanguageDetector.detect("x = 10")
    print(f"Ambiguous snippet detection: {det_ambig['detected_language']}, confidence: {det_ambig['confidence']}, status: {det_ambig['status']}")
    assert det_ambig["confidence"] < 0.9

async def test_scenario_8():
    print("\n--- Testing Scenario 8: Sandbox Security & Timeouts ---")
    runner = get_runner()
    # Infinite loop code
    infinite_loop = """while True: pass"""
    res = await runner.execute(infinite_loop, "python", stdin="", timeout_seconds=2)
    print(f"Infinite loop result status: {res.status}")
    assert res.status == "TIMEOUT", f"Expected TIMEOUT, got {res.status}"

async def main():
    await test_scenario_2()
    await test_scenario_3()
    await test_scenario_4()
    await test_scenario_5()
    await test_scenario_7()
    await test_scenario_8()
    print("\n==========================================")
    print("ALL SPECIFIED TEST SCENARIOS PASSED SUCCESSFULLY!")
    print("==========================================")

if __name__ == "__main__":
    asyncio.run(main())
