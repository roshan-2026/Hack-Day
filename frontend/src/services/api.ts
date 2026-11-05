import {
  LanguageDetectResult,
  ConvertResult,
  SupportedLanguage
} from '../types';

const API_BASE = '/api';

export const LANGUAGES: Record<SupportedLanguage, { name: string; monacoLang: string; extension: string; defaultFilename: string }> = {
  c: { name: 'C', monacoLang: 'c', extension: '.c', defaultFilename: 'main.c' },
  cpp: { name: 'C++', monacoLang: 'cpp', extension: '.cpp', defaultFilename: 'main.cpp' },
  java: { name: 'Java', monacoLang: 'java', extension: '.java', defaultFilename: 'Main.java' },
  python: { name: 'Python', monacoLang: 'python', extension: '.py', defaultFilename: 'main.py' },
  javascript: { name: 'JavaScript', monacoLang: 'javascript', extension: '.js', defaultFilename: 'main.js' },
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
