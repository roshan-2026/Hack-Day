import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent / "backend"))

from app.services.language_detector import LanguageDetector

def test_detect_cpp():
    code = """#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b;
    return 0;
}"""
    res = LanguageDetector.detect(code)
    assert res["detected_language"] == "cpp"
    assert res["confidence"] >= 0.8
    assert res["status"] == "detected"

def test_detect_python():
    code = """import sys

def main():
    a, b = map(int, input().split())
    print(a + b)

if __name__ == '__main__':
    main()"""
    res = LanguageDetector.detect(code)
    assert res["detected_language"] == "python"
    assert res["confidence"] >= 0.8

def test_detect_java():
    code = """import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        System.out.println(a * a);
    }
}"""
    res = LanguageDetector.detect(code)
    assert res["detected_language"] == "java"
    assert res["confidence"] >= 0.8

def test_detect_c():
    code = """#include <stdio.h>

int main() {
    int x;
    scanf("%d", &x);
    printf("%d\\n", x * x);
    return 0;
}"""
    res = LanguageDetector.detect(code)
    assert res["detected_language"] == "c"

def test_detect_javascript():
    code = """const fs = require('fs');

function main() {
    const input = fs.readFileSync(0, 'utf-8');
    console.log("Result: " + input);
}

main();"""
    res = LanguageDetector.detect(code)
    assert res["detected_language"] == "javascript"

def test_empty_input():
    res = LanguageDetector.detect("   ")
    assert res["detected_language"] == "unknown"
    assert res["status"] == "unknown"

if __name__ == "__main__":
    test_detect_cpp()
    test_detect_python()
    test_detect_java()
    test_detect_c()
    test_detect_javascript()
    test_empty_input()
    print("All language detection tests passed!")
