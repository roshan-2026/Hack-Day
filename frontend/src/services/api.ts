import {
  LanguageDetectResult,
  ConvertResult,
  SupportedLanguage,
  ExecuteResult
} from '../types';

const rawApiBase: string = ((import.meta as any).env?.VITE_API_BASE_URL as string) || '';
const API_BASE = rawApiBase ? `${rawApiBase.replace(/\/$/, '')}/api` : '/api';

export const LANGUAGES: Record<SupportedLanguage, { name: string; monacoLang: string; extension: string; defaultFilename: string }> = {
  c: { name: 'C', monacoLang: 'c', extension: '.c', defaultFilename: 'main.c' },
  cpp: { name: 'C++', monacoLang: 'cpp', extension: '.cpp', defaultFilename: 'main.cpp' },
  java: { name: 'Java', monacoLang: 'java', extension: '.java', defaultFilename: 'Main.java' },
  python: { name: 'Python', monacoLang: 'python', extension: '.py', defaultFilename: 'main.py' },
  javascript: { name: 'JavaScript', monacoLang: 'javascript', extension: '.js', defaultFilename: 'main.js' },
  typescript: { name: 'TypeScript', monacoLang: 'typescript', extension: '.ts', defaultFilename: 'main.ts' },
  csharp: { name: 'C#', monacoLang: 'csharp', extension: '.cs', defaultFilename: 'Program.cs' },
  go: { name: 'Go', monacoLang: 'go', extension: '.go', defaultFilename: 'main.go' },
  rust: { name: 'Rust', monacoLang: 'rust', extension: '.rs', defaultFilename: 'main.rs' },
  php: { name: 'PHP', monacoLang: 'php', extension: '.php', defaultFilename: 'index.php' },
  ruby: { name: 'Ruby', monacoLang: 'ruby', extension: '.rb', defaultFilename: 'main.rb' },
  kotlin: { name: 'Kotlin', monacoLang: 'kotlin', extension: '.kt', defaultFilename: 'Main.kt' },
  swift: { name: 'Swift', monacoLang: 'swift', extension: '.swift', defaultFilename: 'main.swift' },
  dart: { name: 'Dart', monacoLang: 'dart', extension: '.dart', defaultFilename: 'main.dart' },
  r: { name: 'R', monacoLang: 'r', extension: '.r', defaultFilename: 'main.r' },
  julia: { name: 'Julia', monacoLang: 'julia', extension: '.jl', defaultFilename: 'main.jl' },
  scala: { name: 'Scala', monacoLang: 'scala', extension: '.scala', defaultFilename: 'Main.scala' },
  perl: { name: 'Perl', monacoLang: 'perl', extension: '.pl', defaultFilename: 'main.pl' },
  lua: { name: 'Lua', monacoLang: 'lua', extension: '.lua', defaultFilename: 'main.lua' },
  bash: { name: 'Bash', monacoLang: 'shell', extension: '.sh', defaultFilename: 'script.sh' },
};

export async function detectLanguage(sourceCode: string): Promise<LanguageDetectResult> {
  const res = await fetch(`${API_BASE}/detect-language`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_code: sourceCode }),
  });
  if (!res.ok) {
    throw new Error(`Language detection failed: ${res.statusText}`);
  }
  return res.json();
}

export async function convertCode(params: {
  sourceCode: string;
  sourceLanguage?: string;
  targetLanguage: string;
  customInstructions?: string;
}): Promise<ConvertResult> {
  const res = await fetch(`${API_BASE}/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: params.sourceCode,
      source_language: params.sourceLanguage,
      target_language: params.targetLanguage,
      custom_instructions: params.customInstructions,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Conversion failed: ${res.statusText}`);
  }
  return res.json();
}

export async function explainCode(params: {
  sourceCode: string;
  language: string;
}): Promise<{ explained_code: string; language: string }> {
  const res = await fetch(`${API_BASE}/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: params.sourceCode,
      language: params.language,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Code explanation failed: ${res.statusText}`);
  }
  return res.json();
}

export async function executeCode(params: {
  sourceCode: string;
  language: string;
  stdin?: string;
  timeoutSeconds?: number;
}): Promise<ExecuteResult> {
  const res = await fetch(`${API_BASE}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: params.sourceCode,
      language: params.language,
      stdin: params.stdin || '',
      execution_limits: {
        timeout_seconds: params.timeoutSeconds || 10,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Execution request failed: ${res.statusText}`);
  }
  return res.json();
}
