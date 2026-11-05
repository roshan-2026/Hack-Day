import re
from typing import Dict, Tuple

class LanguageDetector:
    SUPPORTED_LANGUAGES = [
        "c",
        "cpp",
        "java",
        "python",
        "javascript",
        "typescript",
        "csharp",
        "go",
        "rust",
        "php",
        "ruby",
        "kotlin",
        "swift",
        "dart",
        "r",
        "julia",
        "scala",
        "perl",
        "lua",
        "bash",
    ]

    PATTERNS: Dict[str, list[Tuple[re.Pattern, float, str]]] = {
        "cpp": [
            (re.compile(r'#include\s*<iostream>', re.IGNORECASE), 5.0, "iostream header"),
            (re.compile(r'#include\s*<(vector|string|map|set|algorithm|queue|deque|stack|cmath|sstream)>', re.IGNORECASE), 4.0, "C++ STL header"),
            (re.compile(r'\b(std::cin|cin)\s*>>'), 4.5, "cin operator"),
            (re.compile(r'\b(std::cout|cout)\s*<<'), 4.5, "cout operator"),
            (re.compile(r'\b(std::cerr|cerr|std::endl|endl)\b'), 3.5, "std stream helpers"),
            (re.compile(r'\busing\s+namespace\s+std\s*;'), 4.5, "using namespace std"),
            (re.compile(r'\bstd::[a-zA-Z0-9_]+'), 3.5, "std namespace scope"),
            (re.compile(r'\b(nullptr|constexpr|decltype)\b'), 3.0, "modern C++ keywords"),
            (re.compile(r'\btemplate\s*<'), 3.5, "C++ template"),
            (re.compile(r'\b(class|struct)\s+[a-zA-Z0-9_]+(\s*:\s*(public|private|protected))?'), 2.5, "C++ class inheritance"),
            (re.compile(r'\b(public|private|protected):'), 3.0, "access specifier"),
        ],
        "c": [
            (re.compile(r'#include\s*<stdio\.h>', re.IGNORECASE), 5.0, "stdio.h header"),
            (re.compile(r'#include\s*<(stdlib\.h|string\.h|math\.h|stdbool\.h|limits\.h)>', re.IGNORECASE), 3.0, "C standard header"),
            (re.compile(r'\bprintf\s*\('), 2.5, "printf function"),
            (re.compile(r'\bscanf\s*\('), 3.0, "scanf function"),
            (re.compile(r'\bmalloc\s*\('), 3.0, "malloc"),
            (re.compile(r'\bfree\s*\('), 2.5, "free"),
            (re.compile(r'\bint\s+main\s*\(\s*(void|[a-zA-Z0-9_,\s\*]+)?\)'), 2.5, "main function"),
            (re.compile(r'\btypedef\s+struct\b'), 3.0, "typedef struct"),
            (re.compile(r'#include\s*<[a-zA-Z0-9_]+\.h>'), 2.5, ".h include"),
        ],
        "java": [
            (re.compile(r'\bpublic\s+class\s+[a-zA-Z0-9_]+'), 4.5, "public class"),
            (re.compile(r'public\s+static\s+void\s+main\s*\(\s*String(\s*\[\]\s*|\s+)'), 5.0, "Java main method"),
            (re.compile(r'System\.(out|err)\.(println|print|printf)'), 5.0, "System.out.println"),
            (re.compile(r'import\s+java\.[a-zA-Z0-9_\.]+;'), 4.5, "java import"),
            (re.compile(r'\bpackage\s+[a-zA-Z0-9_\.]+;'), 3.5, "java package"),
            (re.compile(r'Scanner\s+[a-zA-Z0-9_]+\s*=\s*new\s+Scanner\s*\(\s*System\.in\s*\)'), 4.5, "Java Scanner"),
            (re.compile(r'\bnew\s+(ArrayList|HashMap|HashSet|Scanner|StringBuilder|LinkedList|Object)\s*(<[^>]*>)?\s*\('), 3.5, "Java constructor new"),
            (re.compile(r'@(Override|Deprecated|SuppressWarnings)'), 3.0, "Java annotation"),
            (re.compile(r'\b(boolean|byte|short|int|long|float|double|char|void)\s+[a-zA-Z0-9_]+\s*='), 1.5, "primitive type declaration"),
            (re.compile(r'\b(extends|implements)\s+[a-zA-Z0-9_]+'), 2.5, "class inheritance"),
        ],
        "python": [
            (re.compile(r'^\s*def\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*:', re.MULTILINE), 4.5, "def function:"),
            (re.compile(r'^\s*class\s+[a-zA-Z0-9_]+(\([^)]*\))?\s*:', re.MULTILINE), 3.5, "class definition:"),
            (re.compile(r'^\s*elif\s+.*:', re.MULTILINE), 4.5, "elif statement"),
            (re.compile(r'^\s*if\s+__name__\s*==\s*[\'"]__main__[\'"]\s*:', re.MULTILINE), 5.0, "if __name__ == '__main__':"),
            (re.compile(r'\bprint\s*\([^)]*\)'), 2.5, "print function"),
            (re.compile(r'\b(input\s*\(\)|int\s*\(\s*input\s*\(\)|map\s*\(\s*int\s*,\s*input\(\)\.split\(\)\))'), 4.5, "python input reading"),
            (re.compile(r'^\s*(import\s+[a-zA-Z0-9_]+|from\s+[a-zA-Z0-9_\.]+\s+import)', re.MULTILINE), 3.5, "python import"),
            (re.compile(r'\bfor\s+[a-zA-Z0-9_,\s]+\s+in\s+range\s*\('), 4.5, "for in range"),
            (re.compile(r'\b(True|False|None)\b'), 2.5, "Python boolean/None literals"),
            (re.compile(r'\[\s*[a-zA-Z0-9_]+\s+for\s+[a-zA-Z0-9_]+\s+in\s+'), 4.0, "list comprehension"),
            (re.compile(r'\bself\b'), 2.0, "self reference"),
        ],
        "javascript": [
            (re.compile(r'console\.(log|error|warn|info|debug)\s*\('), 4.5, "console.log"),
            (re.compile(r'\b(const|let|var)\s+[a-zA-Z0-9_]+\s*='), 3.0, "variable declaration"),
            (re.compile(r'\bfunction\s+[a-zA-Z0-9_]*\s*\([^)]*\)\s*\{'), 3.0, "function declaration"),
            (re.compile(r'(=>|async\s*\([^)]*\)\s*=>)'), 3.0, "arrow function"),
            (re.compile(r'\b(===|!==)\b'), 3.5, "strict equality"),
            (re.compile(r'require\s*\([\'"][a-zA-Z0-9_@\.\/-]+[\'"]\)'), 3.5, "require() call"),
            (re.compile(r'^\s*import\s+.*\s+from\s+[\'"][^\'"]+[\'"]', re.MULTILINE), 3.0, "ES import"),
            (re.compile(r'process\.(stdin|stdout|argv)'), 4.0, "Node.js process"),
            (re.compile(r'\bmodule\.exports\b|\bexport\s+(default|const|let|function)\b'), 3.5, "JS export"),
            (re.compile(r'fs\.readFileSync|readline\.createInterface'), 4.0, "Node.js readline/fs"),
            (re.compile(r'\bJSON\.(stringify|parse)\b'), 2.5, "JSON parse/stringify"),
        ],
        "typescript": [
            (re.compile(r'\binterface\s+[A-Z][a-zA-Z0-9_]*\s*\{'), 5.0, "TS interface"),
            (re.compile(r'\btype\s+[A-Z][a-zA-Z0-9_]*\s*='), 4.5, "TS type alias"),
            (re.compile(r':\s*(string|number|boolean|any|void|unknown|never|Record<|Array<|Promise<)\b'), 4.0, "TS type annotation"),
            (re.compile(r'\bas\s+(const|[A-Z][a-zA-Z0-9_]*)'), 4.0, "TS type assertion"),
            (re.compile(r'\benum\s+[A-Z][a-zA-Z0-9_]*\s*\{'), 4.5, "TS enum"),
            (re.compile(r'\b(implements\s+[A-Z][a-zA-Z0-9_]*)'), 3.5, "TS implements"),
            (re.compile(r'\bdeclare\s+(const|let|var|function|module|namespace)\b'), 4.5, "TS declaration"),
            (re.compile(r'console\.log\s*\('), 2.5, "console.log"),
        ],
        "csharp": [
            (re.compile(r'\busing\s+System(\.[a-zA-Z0-9_]+)?\s*;'), 5.0, "using System;"),
            (re.compile(r'\bnamespace\s+[a-zA-Z0-9_\.]+'), 4.0, "namespace declaration"),
            (re.compile(r'Console\.(WriteLine|Write|ReadLine|ReadKey)\s*\('), 5.0, "Console.WriteLine"),
            (re.compile(r'\bstatic\s+void\s+Main\s*\(\s*string\s*\[\s*\]'), 4.5, "C# static void Main"),
            (re.compile(r'\b(ConsoleColor|String\.Format|int\.Parse|Convert\.To)'), 3.5, "C# BCL methods"),
            (re.compile(r'\b(async\s+Task|Task<[a-zA-Z0-9_<>]+>)\b'), 4.0, "C# Task"),
            (re.compile(r'\{\s*get;\s*set;\s*\}'), 4.5, "C# auto-property"),
            (re.compile(r'\bforeach\s*\(\s*(var|[a-zA-Z0-9_]+)\s+[a-zA-Z0-9_]+\s+in\s+'), 3.5, "C# foreach"),
        ],
        "go": [
            (re.compile(r'^\s*package\s+(main|[a-zA-Z0-9_]+)', re.MULTILINE), 5.0, "package main"),
            (re.compile(r'\bimport\s+(\(\s*["a-zA-Z0-9_/\.\s]+\s*\)|"[a-zA-Z0-9_/\.]+")'), 4.5, "Go import"),
            (re.compile(r'\bfunc\s+(main|[a-zA-Z0-9_]+)\s*\([^)]*\)'), 4.5, "Go func declaration"),
            (re.compile(r'fmt\.(Println|Printf|Print|Sprintf|Scanf|Scanln|Fprintln)\s*\('), 5.0, "fmt.Println"),
            (re.compile(r':='), 3.5, "Go short variable declaration"),
            (re.compile(r'\bmake\s*\(\s*(chan|map|\[\])'), 4.0, "make()"),
            (re.compile(r'\b(defer|fallthrough|goroutine)\b'), 4.0, "Go control keywords"),
            (re.compile(r'\berr\s*!=\s*nil\b'), 4.0, "err != nil check"),
        ],
        "rust": [
            (re.compile(r'\bfn\s+main\s*\(\s*\)'), 5.0, "fn main()"),
            (re.compile(r'\bfn\s+[a-zA-Z0-9_]+\s*(<[^>]*>)?\s*\([^)]*\)\s*(->\s*[a-zA-Z0-9_<>&,\'\s]+)?\s*\{'), 4.5, "Rust fn"),
            (re.compile(r'\b(println!|print!|eprintln!|format!|vec!|panic!)\s*\('), 5.0, "Rust macro !"),
            (re.compile(r'\blet\s+mut\s+[a-zA-Z0-9_]+'), 4.5, "let mut"),
            (re.compile(r'\buse\s+std::'), 4.5, "use std::"),
            (re.compile(r'\b(pub\s+)?(struct|enum|trait)\s+[A-Z][a-zA-Z0-9_]*'), 3.5, "Rust struct/enum/trait"),
            (re.compile(r'\bimpl\s+[a-zA-Z0-9_]+'), 4.0, "Rust impl"),
            (re.compile(r'\bmatch\s+[a-zA-Z0-9_.]+\s*\{'), 4.0, "Rust match"),
            (re.compile(r'\b(Result<|Option<|Some\(|None|Ok\(|Err\()\b'), 4.0, "Rust types"),
        ],
        "php": [
            (re.compile(r'<\?php'), 6.0, "<?php opening tag"),
            (re.compile(r'\$[a-zA-Z_][a-zA-Z0-9_]*'), 3.5, "PHP variable $"),
            (re.compile(r'\becho\s+'), 3.5, "echo statement"),
            (re.compile(r'\b(var_dump|print_r|isset|empty)\s*\('), 4.0, "PHP builtins"),
            (re.compile(r'->[a-zA-Z0-9_]+'), 3.0, "object operator ->"),
            (re.compile(r'\barray\s*\('), 3.0, "array()"),
            (re.compile(r'\bfunction\s+[a-zA-Z0-9_]+\s*\(\s*\$'), 4.0, "PHP function with $param"),
        ],
        "ruby": [
            (re.compile(r'\bputs\s+'), 4.0, "puts statement"),
            (re.compile(r'^\s*def\s+[a-zA-Z0-9_?!]+(\s*\([^)]*\))?\s*$', re.MULTILINE), 4.0, "def without braces"),
            (re.compile(r'^\s*end\s*$', re.MULTILINE), 3.0, "end keyword"),
            (re.compile(r'\b(attr_accessor|attr_reader|attr_writer)\b'), 4.5, "Ruby attribute macros"),
            (re.compile(r'\brequire\s+[\'"][a-zA-Z0-9_\/]+[\'"]'), 3.5, "Ruby require"),
            (re.compile(r'\b(elsif|unless)\b'), 3.5, "Ruby elsif/unless"),
            (re.compile(r'\.each\s+do\s*(\|[a-zA-Z0-9_,\s]+\|)?'), 4.5, "Ruby .each do"),
            (re.compile(r'@[a-zA-Z0-9_]+'), 2.5, "Ruby instance variable @"),
        ],
        "kotlin": [
            (re.compile(r'\bfun\s+main\s*\('), 5.0, "fun main()"),
            (re.compile(r'\bfun\s+[a-zA-Z0-9_]+\s*\([^)]*\)(\s*:\s*[a-zA-Z0-9_<>?]+)?\s*\{'), 4.5, "Kotlin fun"),
            (re.compile(r'\b(val|var)\s+[a-zA-Z0-9_]+\s*(:\s*[a-zA-Z0-9_<>?]+)?\s*='), 3.5, "val/var declaration"),
            (re.compile(r'\bprintln\s*\('), 3.0, "println()"),
            (re.compile(r'\bimport\s+kotlin(\.[a-zA-Z0-9_\*]+)?'), 4.5, "Kotlin import"),
            (re.compile(r'\b(data\s+class|companion\s+object)\b'), 5.0, "data class / companion object"),
            (re.compile(r'\bwhen\s*(\([^)]*\))?\s*\{'), 4.0, "Kotlin when"),
        ],
        "swift": [
            (re.compile(r'\bimport\s+(Swift|Foundation|UIKit|SwiftUI)\b'), 5.0, "Swift import"),
            (re.compile(r'\bfunc\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*(->\s*[a-zA-Z0-9_<>?]+)?\s*\{'), 4.0, "Swift func"),
            (re.compile(r'\b(guard\s+let|if\s+let)\s+'), 4.5, "guard let / if let"),
            (re.compile(r'\b(mutating\s+func|convenience\s+init)\b'), 4.5, "Swift keywords"),
            (re.compile(r'\bprint\s*\('), 2.5, "print()"),
            (re.compile(r'\b(struct|class|enum|protocol)\s+[A-Z][a-zA-Z0-9_]*\s*:\s*[A-Z]'), 3.5, "Swift type conformation"),
        ],
        "dart": [
            (re.compile(r'\bvoid\s+main\s*\(\s*(List<String>\s+[a-zA-Z0-9_]+)?\s*\)'), 5.0, "Dart main()"),
            (re.compile(r'\bimport\s+[\'"]package:[a-zA-Z0-9_\/.]+[\'"]'), 5.0, "Dart package import"),
            (re.compile(r'\bclass\s+[A-Z][a-zA-Z0-9_]*\s+extends\s+(StatelessWidget|StatefulWidget|State<)'), 5.0, "Flutter widget class"),
            (re.compile(r'\bWidget\s+build\s*\(\s*BuildContext\s+'), 5.0, "Widget build(BuildContext)"),
            (re.compile(r'\b(final|const|late)\s+([a-zA-Z0-9_<>?]+\s+)?[a-zA-Z0-9_]+\s*='), 4.5, "Dart variable"),
            (re.compile(r'\bsetState\s*\(\s*\(\s*\)\s*=>'), 4.5, "setState"),
        ],
        "r": [
            (re.compile(r'<-'), 4.5, "R assignment arrow <-"),
            (re.compile(r'\blibrary\s*\([a-zA-Z0-9_.]+\)'), 4.5, "R library() call"),
            (re.compile(r'\b(c|data\.frame|matrix|list)\s*\('), 3.5, "R constructors c(), data.frame()"),
            (re.compile(r'\b(cat|print)\s*\('), 2.5, "R print/cat"),
            (re.compile(r'\b(read\.csv|write\.csv)\s*\('), 4.0, "R read.csv"),
            (re.compile(r'\b(ggplot|aes|geom_[a-zA-Z0-9_]+)\s*\('), 4.5, "ggplot2"),
        ],
        "julia": [
            (re.compile(r'\bprintln\s*\('), 3.0, "println()"),
            (re.compile(r'^\s*function\s+[a-zA-Z0-9_!]+\s*\([^)]*\)\s*$', re.MULTILINE), 4.5, "Julia function without braces"),
            (re.compile(r'\busing\s+[a-zA-Z0-9_]+'), 4.0, "Julia using"),
            (re.compile(r'\b(Float64|Int64|Vector{Float64}|Array{Float64})\b'), 4.5, "Julia types"),
            (re.compile(r'(@time|@btime|@threads)\b'), 4.5, "Julia macros"),
            (re.compile(r'^\s*end\s*$', re.MULTILINE), 2.5, "end keyword"),
        ],
        "scala": [
            (re.compile(r'\bobject\s+[A-Z][a-zA-Z0-9_]*\b'), 4.5, "Scala object"),
            (re.compile(r'\bdef\s+main\s*\(\s*args\s*:\s*Array\[String\]\s*\)'), 5.0, "Scala def main"),
            (re.compile(r'\bcase\s+class\s+[A-Z][a-zA-Z0-9_]*'), 4.5, "Scala case class"),
            (re.compile(r'\bimport\s+scala\.[a-zA-Z0-9_\.]*'), 4.5, "Scala import"),
            (re.compile(r'(Array|List|Option)\[[a-zA-Z0-9_]+\]'), 4.0, "Scala generic brackets []"),
            (re.compile(r'\b(val|var)\s+[a-zA-Z0-9_]+\s*(:\s*[a-zA-Z0-9_\[\]]+)?\s*='), 3.0, "val/var declaration"),
        ],
        "perl": [
            (re.compile(r'^#!\s*/usr/bin/(env\s+)?perl', re.MULTILINE), 5.5, "Perl shebang"),
            (re.compile(r'\bmy\s+[\$@%][a-zA-Z0-9_]+'), 5.0, "Perl my $var declaration"),
            (re.compile(r'\buse\s+(strict|warnings)\s*;'), 5.0, "use strict/warnings"),
            (re.compile(r'\bsub\s+[a-zA-Z0-9_]+\s*\{'), 4.0, "Perl sub"),
            (re.compile(r'\bforeach\s+my\s+\$[a-zA-Z0-9_]+\s*\('), 4.5, "Perl foreach my"),
            (re.compile(r'\b(chomp|scalar|push|pop)\b'), 3.0, "Perl builtins"),
            (re.compile(r'\$_'), 3.5, "Perl special $_"),
        ],
        "lua": [
            (re.compile(r'\blocal\s+function\s+[a-zA-Z0-9_]+'), 5.5, "Lua local function"),
            (re.compile(r'^\s*function\s+[a-zA-Z0-9_.:]+\s*\([^)]*\)\s*$', re.MULTILINE), 4.0, "Lua function"),
            (re.compile(r'\blocal\s+[a-zA-Z0-9_]+\s*='), 4.5, "local variable"),
            (re.compile(r'\b(then|elseif|end)\b'), 4.0, "Lua then/end"),
            (re.compile(r'~='), 4.5, "Lua ~= inequality"),
            (re.compile(r'--(?!-)'), 4.0, "Lua -- comment"),
            (re.compile(r'\bstring\.(format|sub|len|find)\s*\('), 4.5, "Lua string lib"),
            (re.compile(r'\btable\.(insert|remove|concat)\s*\('), 4.5, "Lua table lib"),
            (re.compile(r'\bio\.(write|read)\s*\('), 4.0, "Lua io lib"),
        ],
        "bash": [
            (re.compile(r'^#!\s*/bin/(bash|sh|env\s+bash)', re.MULTILINE), 5.5, "Bash shebang"),
            (re.compile(r'\becho\s+'), 3.0, "echo command"),
            (re.compile(r'\b(fi|done|esac)\b'), 4.5, "Bash closing keywords fi/done"),
            (re.compile(r'\bif\s+\[\s*.*\s*\];\s*then\b'), 4.5, "Bash if [ ... ]; then"),
            (re.compile(r'\bfor\s+[a-zA-Z0-9_]+\s+in\s+.*;\s*do\b'), 4.5, "Bash for loop"),
            (re.compile(r'\b(export|source|unset)\s+[a-zA-Z0-9_]+'), 3.5, "Bash export"),
            (re.compile(r'\$(1|2|@|\?|\*|#)'), 4.0, "Bash arguments $1, $?"),
            (re.compile(r'>\s*/dev/null'), 4.0, "/dev/null redirection"),
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

        # Disambiguate C vs C++
        cpp_exclusive = any(
            re.search(pat, trimmed) for pat in [
                r'iostream', r'cin\s*>>', r'cout\s*<<', r'namespace\s+std', r'std::', r'vector<', r'template<'
            ]
        )
        if cpp_exclusive:
            scores["cpp"] += 5.0
            scores["c"] = max(0.0, scores["c"] - 4.0)

        # Disambiguate TypeScript vs JavaScript
        ts_exclusive = any(
            re.search(pat, trimmed) for pat in [
                r'\binterface\s+[A-Z]', r'\btype\s+[A-Z][a-zA-Z0-9_]*\s*=', r':\s*(string|number|boolean|Record<|Array<|Promise<)',
                r'\bas\s+const\b', r'\benum\s+[A-Z]'
            ]
        )
        if ts_exclusive:
            scores["typescript"] += 5.0
            scores["javascript"] = max(0.0, scores["javascript"] - 3.0)

        # Disambiguate Java vs C# vs Kotlin vs Scala
        if re.search(r'System\.(out|err)\.(println|print|printf)|public\s+class\s+[a-zA-Z0-9_]+.*public\s+static\s+void\s+main', trimmed, re.DOTALL):
            scores["java"] += 6.0
        if re.search(r'Console\.(WriteLine|Write|ReadLine)', trimmed):
            scores["csharp"] += 6.0
        if re.search(r'\bfun\s+main\b|\bdata\s+class\b', trimmed):
            scores["kotlin"] += 6.0
        if re.search(r'\bobject\s+Main\b|\bcase\s+class\b', trimmed):
            scores["scala"] += 6.0

        # Disambiguate Python vs others
        if '{' not in trimmed and '}' not in trimmed and re.search(r':\s*$', trimmed, re.MULTILINE):
            scores["python"] += 3.0

        # Disambiguate Bash
        if re.search(r'^#!\s*/bin/(bash|sh)', trimmed, re.MULTILINE) or re.search(r'\b(fi|done|esac)\b', trimmed):
            scores["bash"] += 5.0

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
