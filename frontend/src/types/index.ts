export type SupportedLanguage = 'c' | 'cpp' | 'java' | 'python' | 'javascript';

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
