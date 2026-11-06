export interface DetectedInput {
  id: string;
  name: string;
  prompt: string;
}

/**
 * Universal multi-language input detector.
 * Automatically scans and detects input variables across all 20 supported languages:
 * Python, C, C++, Java, JavaScript, TypeScript, C#, Go, Rust, Kotlin, Swift, Dart,
 * PHP, Ruby, Bash, R, Julia, Scala, Perl, and Lua.
 */
export function detectInputVariables(code: string, _language?: string): DetectedInput[] {
  if (!code || !code.trim()) return [];

  const inputs: DetectedInput[] = [];
  const lines = code.split('\n');

  const addInput = (name: string, prompt?: string) => {
    const cleanName = (name || '').trim().replace(/^[&*]+/, '');
    const cleanPrompt = (prompt || '').trim();
    const finalName = cleanName || `input_${inputs.length + 1}`;
    let finalPrompt = cleanPrompt;
    if (!finalPrompt) {
      finalPrompt = `Enter value for '${finalName}': `;
    } else if (!finalPrompt.endsWith(':') && !finalPrompt.endsWith(': ')) {
      finalPrompt = `${finalPrompt}: `;
    }

    inputs.push({
      id: `input_${inputs.length + 1}`,
      name: finalName,
      prompt: finalPrompt,
    });
  };

  // Helper to extract preceding print prompt
  // Scans lines i, i-1, i-2, i-3 for print statements with literal text
  const findPrecedingPrompt = (lineIndex: number): string => {
    for (let k = lineIndex; k >= Math.max(0, lineIndex - 3); k--) {
      const l = lines[k];
      const printMatch = /(?:cout\s*<<|printf|System\.out\.print(?:ln)?|Console\.Write(?:Line)?|fmt\.Print(?:ln|f)?|print(?:ln)?!|print|echo|puts|stdout\.write)\s*(?:\(\s*)?["'`]([^"'`]+)["'`]/.exec(l);
      if (printMatch) {
        return printMatch[1].trim().replace(/\\n$/, '');
      }
    }
    return '';
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Ignore comment lines
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      continue;
    }

    // 1. Python input("...") or input()
    const pyMatch = /(?:([a-zA-Z0-9_,\s]+)\s*=\s*)?(?:(?:int|float|str|bool)\s*\(\s*)?input\s*\(\s*(?:['"`](.*?)['"`])?\s*\)/.exec(line);
    if (pyMatch) {
      const varPart = pyMatch[1]?.trim();
      const promptText = pyMatch[2]?.trim();
      if (varPart && varPart.includes(',')) {
        varPart.split(',').map((v) => v.trim()).filter(Boolean).forEach((v) => {
          addInput(v, promptText ? `${promptText} (${v})` : `Enter ${v}`);
        });
      } else {
        const v = varPart || `input_${inputs.length + 1}`;
        addInput(v, promptText || `Enter ${v}`);
      }
      continue;
    }

    // Python sys.stdin.readline
    const pySys = /(?:([a-zA-Z0-9_]+)\s*=\s*)?sys\.stdin\.(?:readline|read)/.exec(line);
    if (pySys) {
      const v = pySys[1]?.trim() || `input_${inputs.length + 1}`;
      addInput(v, `Enter ${v}`);
      continue;
    }

    // 2. C++ cin >> a >> b >> c; or std::cin >> a;
    if (line.includes('cin')) {
      const cinMatch = /(?:std::)?cin\s*>>\s*([^;]+);/.exec(line);
      if (cinMatch) {
        const preceding = findPrecedingPrompt(i);
        const vars = cinMatch[1].split('>>').map((t) => t.trim().replace(/^[&*]+/, '')).filter(Boolean);
        vars.forEach((v) => {
          const p = vars.length === 1 && preceding ? preceding : (preceding ? `${preceding} (${v})` : `Enter ${v}`);
          addInput(v, p);
        });
        continue;
      }

      const getlineMatch = /getline\s*\(\s*(?:std::)?cin\s*,\s*([a-zA-Z0-9_]+)\s*\)/.exec(line);
      if (getlineMatch) {
        const preceding = findPrecedingPrompt(i);
        const v = getlineMatch[1].trim();
        addInput(v, preceding || `Enter ${v}`);
        continue;
      }
    }

    // 3. C scanf("%d %s", &a, &b)
    if (line.includes('scanf')) {
      const scanfMatch = /scanf\s*\(\s*["'][^"']*["']\s*,\s*([^;)]+)\)/.exec(line);
      if (scanfMatch) {
        const preceding = findPrecedingPrompt(i);
        const vars = scanfMatch[1].split(',').map((t) => t.trim().replace(/^[&*]+/, '')).filter(Boolean);
        vars.forEach((v) => {
          addInput(v, vars.length === 1 && preceding ? preceding : (preceding ? `${preceding} (${v})` : `Enter ${v}`));
        });
        continue;
      }
    }

    // 4. Java Scanner or BufferedReader
    // sc.nextInt(), scanner.nextLine(), in.nextDouble(), br.readLine()
    if (/\b(?:sc|scanner|in|reader|br|stdin|System\.console\(\))\.(?:nextLine|nextInt|nextDouble|nextFloat|nextLong|nextShort|nextByte|nextBoolean|next|readLine)\s*\(/.test(line)) {
      const preceding = findPrecedingPrompt(i);
      const varMatch = /(?:(?:[a-zA-Z0-9_<>[\]]+)\s+)?([a-zA-Z0-9_]+)\s*=\s*[a-zA-Z0-9_]+\.(?:next|readLine)/.exec(line);
      const v = varMatch ? varMatch[1].trim() : `input_${inputs.length + 1}`;
      addInput(v, preceding || `Enter ${v}`);
      continue;
    }

    // 5. JavaScript / TypeScript prompt("...") or readline
    if (line.includes('prompt(') || line.includes('prompt (') || line.includes('readline')) {
      const promptMatch = /(?:(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*)?prompt\s*\(\s*(?:['"`](.*?)['"`])?\s*\)/.exec(line);
      if (promptMatch) {
        const v = promptMatch[1]?.trim() || `input_${inputs.length + 1}`;
        const p = promptMatch[2]?.trim() || `Enter ${v}`;
        addInput(v, p);
        continue;
      }
    }

    // 6. C# Console.ReadLine()
    if (line.includes('Console.ReadLine') || line.includes('Console.Read')) {
      const preceding = findPrecedingPrompt(i);
      const varMatch = /(?:(?:[a-zA-Z0-9_<>[\]]+)\s+)?([a-zA-Z0-9_]+)\s*=\s*(?:[a-zA-Z0-9_.]+\s*\(\s*)?Console\.Read/.exec(line);
      const v = varMatch ? varMatch[1].trim() : `input_${inputs.length + 1}`;
      addInput(v, preceding || `Enter ${v}`);
      continue;
    }

    // 7. Go fmt.Scan(&a, &b)
    if (line.includes('fmt.Scan')) {
      const scanMatch = /fmt\.Scan(?:ln|f)?\s*\(\s*(?:["'][^"']*["']\s*,\s*)?([^;)]+)\)/.exec(line);
      if (scanMatch) {
        const preceding = findPrecedingPrompt(i);
        const vars = scanMatch[1].split(',').map((t) => t.trim().replace(/^[&*]+/, '')).filter(Boolean);
        vars.forEach((v) => {
          addInput(v, vars.length === 1 && preceding ? preceding : (preceding ? `${preceding} (${v})` : `Enter ${v}`));
        });
        continue;
      }
    }

    // 8. Rust io::stdin().read_line(&mut ...)
    if (line.includes('read_line')) {
      const preceding = findPrecedingPrompt(i);
      const rustMatch = /read_line\s*\(\s*&mut\s*([a-zA-Z0-9_]+)/.exec(line);
      const v = rustMatch ? rustMatch[1].trim() : `input_${inputs.length + 1}`;
      addInput(v, preceding || `Enter ${v}`);
      continue;
    }

    // 9. Kotlin / Swift readLine() / readln()
    if (/\b(?:readLine|readln)\s*\(/.test(line)) {
      const preceding = findPrecedingPrompt(i);
      const varMatch = /(?:(?:val|var|let)\s+)?([a-zA-Z0-9_]+)\s*=\s*(?:readLine|readln)/.exec(line);
      const v = varMatch ? varMatch[1].trim() : `input_${inputs.length + 1}`;
      addInput(v, preceding || `Enter ${v}`);
      continue;
    }

    // 10. Dart stdin.readLineSync()
    if (line.includes('readLineSync')) {
      const preceding = findPrecedingPrompt(i);
      const varMatch = /(?:(?:[a-zA-Z0-9_?]+)\s+)?([a-zA-Z0-9_]+)\s*=\s*stdin\.readLineSync/.exec(line);
      const v = varMatch ? varMatch[1].trim() : `input_${inputs.length + 1}`;
      addInput(v, preceding || `Enter ${v}`);
      continue;
    }

    // 11. PHP / Ruby readline / fgets(STDIN) / gets
    if (/\b(?:readline|fgets\s*\(\s*STDIN|gets)\b/.test(line)) {
      const preceding = findPrecedingPrompt(i);
      const varMatch = /(?:([$a-zA-Z0-9_]+)\s*=\s*)?(?:readline|fgets|gets)/.exec(line);
      const v = varMatch && varMatch[1] ? varMatch[1].trim().replace(/^\$/, '') : `input_${inputs.length + 1}`;
      addInput(v, preceding || `Enter ${v}`);
      continue;
    }

    // 12. Bash read -p "prompt" var or read var
    if (/^\s*read\s+/.test(line)) {
      const bashPromptMatch = /read\s+(?:-p\s*["']([^"']+)["']\s+)?([a-zA-Z0-9_]+)/.exec(line);
      if (bashPromptMatch) {
        const p = bashPromptMatch[1]?.trim();
        const v = bashPromptMatch[2]?.trim() || `input_${inputs.length + 1}`;
        addInput(v, p || `Enter ${v}`);
        continue;
      }
    }
  }

  // 13. Fallback: If no structured input was caught, check for any standard input tokens
  if (inputs.length === 0) {
    const genericMatches = code.match(/\b(input|cin|scanf|readLine|readln|nextInt|nextLine|Console\.Read|fmt\.Scan|read_line|io\.read|<STDIN>)\b/g);
    if (genericMatches && genericMatches.length > 0) {
      const count = Math.min(genericMatches.length, 5);
      for (let k = 1; k <= count; k++) {
        addInput(`input_${k}`, `Enter input ${k}`);
      }
    }
  }

  return inputs;
}
