export type SupportedLanguage =
  | 'c'
  | 'cpp'
  | 'java'
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'kotlin'
  | 'swift'
  | 'dart'
  | 'r'
  | 'julia'
  | 'scala'
  | 'perl'
  | 'lua'
  | 'bash';

export interface LanguageInfo {
  id: SupportedLanguage;
  name: string;
  monacoLang: string;
  extension: string;
  defaultFilename: string;
}

export interface LanguageDetectResult {
  detected_language: SupportedLanguage | 'unknown';
  confidence: number;
  status: 'detected' | 'ambiguous' | 'unknown';
  explanation?: string;
  scores?: Record<string, number>;
}

export interface ConvertResult {
  converted_code: string;
  detected_language: string;
  target_language: string;
  conversion_status: 'success' | 'warning' | 'failed';
  notes?: string;
  error?: string;
}

export interface ExecuteLimits {
  timeout_seconds?: number;
  memory_limit_mb?: number;
}

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  exit_code: number;
  execution_time_ms: number;
  memory_kb?: number;
  status: 'COMPLETED' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIMEOUT' | 'FAILED';
  runner_used?: string;
  error_message?: string;
}
