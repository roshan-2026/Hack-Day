import re
from typing import Dict, Tuple

class LanguageDetector:
    SUPPORTED_LANGUAGES = ["c", "cpp", "java", "python", "javascript"]

    # Language patterns and weights
    PATTERNS: Dict[str, list[Tuple[re.Pattern, float, str]]] = {
        "cpp": [
            (re.compile(r'#include\s*<iostream>', re.IGNORECASE), 4.5, "iostream header"),
            (re.compile(r'#include\s*<(vector|string|map|set|algorithm|queue|deque|stack|cmath|sstream)>', re.IGNORECASE), 3.5, "C++ STL header"),
            (re.compile(r'\b(std::cin|cin)\s*>>'), 4.0, "cin operator"),
            (re.compile(r'\b(std::cout|cout)\s*<<'), 4.0, "cout operator"),
            (re.compile(r'\b(std::cerr|cerr|std::endl|endl)\b'), 3.0, "std stream helpers"),
            (re.compile(r'\busing\s+namespace\s+std\s*;'), 4.0, "using namespace std"),
            (re.compile(r'\bstd::[a-zA-Z0-9_]+'), 3.5, "std namespace scope"),
            (re.compile(r'\b(nullptr|constexpr|decltype|auto\s+[a-zA-Z0-9_]+\s*=)\b'), 2.5, "modern C++ keywords"),
            (re.compile(r'\btemplate\s*<'), 3.0, "C++ template"),
            (re.compile(r'\b(class|struct)\s+[a-zA-Z0-9_]+(\s*:\s*(public|private|protected))?'), 2.0, "C++ class inheritance"),
            (re.compile(r'\b(public|private|protected):'), 2.5, "access specifier"),
        ],
        "c": [
            (re.compile(r'#include\s*<stdio\.h>', re.IGNORECASE), 4.0, "stdio.h header"),
            (re.compile(r'#include\s*<(stdlib\.h|string\.h|math\.h|stdbool\.h|limits\.h)>', re.IGNORECASE), 2.5, "C standard header"),
            (re.compile(r'\bprintf\s*\('), 2.5, "printf function"),
            (re.compile(r'\bscanf\s*\('), 3.0, "scanf function"),
            (re.compile(r'\bmalloc\s*\('), 2.5, "malloc"),
            (re.compile(r'\bfree\s*\('), 2.0, "free"),
            (re.compile(r'\bint\s+main\s*\(\s*(void|[a-zA-Z0-9_,\s\*]+)?\)'), 2.0, "main function"),
            (re.compile(r'\btypedef\s+struct\b'), 2.5, "typedef struct"),
            (re.compile(r'#include\s*<[a-zA-Z0-9_]+\.h>'), 2.0, ".h include"),
        ],
        "java": [
            (re.compile(r'\bpublic\s+class\s+[a-zA-Z0-9_]+'), 4.5, "public class"),
            (re.compile(r'public\s+static\s+void\s+main\s*\(\s*String(\s*\[\]\s*|\s+)'), 5.0, "Java main method"),
            (re.compile(r'System\.(out|err)\.(println|print|printf)'), 4.5, "System.out.println"),
            (re.compile(r'import\s+java\.[a-zA-Z0-9_\.]+;'), 4.0, "java import"),
            (re.compile(r'\bpackage\s+[a-zA-Z0-9_\.]+;'), 3.0, "java package"),
            (re.compile(r'Scanner\s+[a-zA-Z0-9_]+\s*=\s*new\s+Scanner\s*\(\s*System\.in\s*\)'), 4.5, "Java Scanner"),
            (re.compile(r'\bnew\s+(ArrayList|HashMap|HashSet|Scanner|StringBuilder|LinkedList|Object|String)\s*(<[^>]*>)?\s*\('), 3.5, "Java constructor new"),
            (re.compile(r'@(Override|Deprecated|SuppressWarnings)'), 3.0, "Java annotation"),
            (re.compile(r'\b(boolean|byte|short|int|long|float|double|char|void)\s+[a-zA-Z0-9_]+\s*='), 1.5, "primitive type declaration"),
            (re.compile(r'\b(extends|implements)\s+[a-zA-Z0-9_]+'), 2.5, "class inheritance"),
        ],
        "python": [
            (re.compile(r'^\s*def\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*:', re.MULTILINE), 4.5, "def function:"),
            (re.compile(r'^\s*class\s+[a-zA-Z0-9_]+(\([^)]*\))?\s*:', re.MULTILINE), 3.5, "class definition:"),
            (re.compile(r'^\s*elif\s+.*:', re.MULTILINE), 4.0, "elif statement"),
            (re.compile(r'^\s*if\s+__name__\s*==\s*[\'"]__main__[\'"]\s*:', re.MULTILINE), 5.0, "if __name__ == '__main__':"),
            (re.compile(r'\bprint\s*\([^)]*\)'), 2.5, "print function"),
            (re.compile(r'\b(input\s*\(\)|int\s*\(\s*input\s*\(\)|map\s*\(\s*int\s*,\s*input\(\)\.split\(\)\))'), 4.0, "python input reading"),
            (re.compile(r'^\s*(import\s+[a-zA-Z0-9_]+|from\s+[a-zA-Z0-9_\.]+\s+import)', re.MULTILINE), 3.5, "python import"),
            (re.compile(r'\bfor\s+[a-zA-Z0-9_,\s]+\s+in\s+range\s*\('), 4.0, "for in range"),
            (re.compile(r'\b(True|False|None)\b'), 2.0, "Python boolean/None literals"),
            (re.compile(r'^\s*#.*$', re.MULTILINE), 1.5, "hash comment"),
            (re.compile(r'\[\s*[a-zA-Z0-9_]+\s+for\s+[a-zA-Z0-9_]+\s+in\s+'), 3.5, "list comprehension"),
            (re.compile(r'\bself\b'), 2.0, "self reference"),
        ],
        "javascript": [
            (re.compile(r'console\.(log|error|warn|info|debug)\s*\('), 4.5, "console.log"),
            (re.compile(r'\b(const|let|var)\s+[a-zA-Z0-9_]+\s*='), 3.5, "variable declaration"),
            (re.compile(r'\bfunction\s+[a-zA-Z0-9_]*\s*\([^)]*\)\s*\{'), 3.5, "function declaration"),
            (re.compile(r'(=>|async\s*\([^)]*\)\s*=>)'), 3.0, "arrow function"),
            (re.compile(r'\b(===|!==)\b'), 3.5, "strict equality"),
            (re.compile(r'require\s*\([\'"][a-zA-Z0-9_@\.\/-]+[\'"]\)'), 3.5, "require() call"),
            (re.compile(r'^\s*import\s+.*\s+from\s+[\'"][^\'"]+[\'"]', re.MULTILINE), 3.0, "ES import"),
            (re.compile(r'process\.(stdin|stdout|argv)'), 4.0, "Node.js process"),
            (re.compile(r'\bmodule\.exports\b|\bexport\s+(default|const|let|function)\b'), 3.5, "JS export"),
            (re.compile(r'fs\.readFileSync|readline\.createInterface'), 4.0, "Node.js readline/fs"),
            (re.compile(r'\bJSON\.(stringify|parse)\b'), 2.5, "JSON parse/stringify"),
        ]
    }

    @classmethod
    def detect(cls, code: str) -> Dict:
        trimmed = code.strip()
        if not trimmed:
            return {
                "detected_language": "unknown",
                "confidence": 0.0,
                "status": "unknown",
                "explanation": "No code provided",
                "scores": {lang: 0.0 for lang in cls.SUPPORTED_LANGUAGES}
            }

        scores: Dict[str, float] = {lang: 0.0 for lang in cls.SUPPORTED_LANGUAGES}
        evidence: Dict[str, list[str]] = {lang: [] for lang in cls.SUPPORTED_LANGUAGES}

        for lang, rules in cls.PATTERNS.items():
            for pattern, weight, reason in rules:
                matches = pattern.findall(trimmed)
                if matches:
                    count = min(len(matches), 3)  # cap repeat matches
                    added_score = weight * (1 + 0.3 * (count - 1))
                    scores[lang] += added_score
                    evidence[lang].append(reason)

        # Disambiguate C vs C++:
        # If C++ has strong indicators (iostream, cin, cout, std::, vector, etc.), boost C++ and suppress C
        cpp_exclusive = any(
            re.search(pat, trimmed) for pat in [
                r'iostream', r'cin\s*>>', r'cout\s*<<', r'namespace\s+std', r'std::', r'vector<', r'template<'
            ]
        )
        if cpp_exclusive:
            scores["cpp"] += 5.0
            scores["c"] = max(0.0, scores["c"] - 4.0)

        # Disambiguate Java vs C++/C:
        # If public class or System.out exists, Java is overwhelmingly favored
        if re.search(r'public\s+(class|static\s+void\s+main)|System\.out', trimmed):
            scores["java"] += 6.0

        # Disambiguate Python vs others:
        # Check indentation vs braces: if no curly braces at all and has colons and def/print
        if '{' not in trimmed and '}' not in trimmed and re.search(r':\s*$', trimmed, re.MULTILINE):
            scores["python"] += 3.0

        # Find best candidate
        sorted_scores = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        top_lang, top_score = sorted_scores[0]
        second_lang, second_score = sorted_scores[1]

        if top_score == 0:
            return {
                "detected_language": "unknown",
                "confidence": 0.0,
                "status": "unknown",
                "explanation": "Could not identify syntax characteristics for any supported language",
                "scores": scores
            }

        # Calculate confidence
        diff = top_score - second_score
        if diff >= 3.0:
            confidence = min(0.99, 0.75 + (diff / 20.0))
        elif diff >= 1.0:
            confidence = min(0.85, 0.60 + (diff / 10.0))
        else:
            confidence = max(0.40, top_score / (top_score + second_score + 1.0))

        confidence = round(confidence, 2)
        status = "detected" if confidence >= 0.70 else "ambiguous"

        # Construct short explanation
        matched_reasons = evidence.get(top_lang, [])
        reason_str = ", ".join(matched_reasons[:3]) if matched_reasons else "code structure"
        explanation = f"Detected {top_lang.upper()} based on {reason_str}"

        return {
            "detected_language": top_lang,
            "confidence": confidence,
            "status": status,
            "explanation": explanation,
            "scores": {k: round(v, 2) for k, v in scores.items()}
        }
