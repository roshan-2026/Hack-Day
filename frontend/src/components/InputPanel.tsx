import React from 'react';
import { Clipboard, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { LanguageSelector } from './LanguageSelector';
import { CustomInstructions } from './CustomInstructions';
import { SupportedLanguage, LanguageDetectResult } from '../types';
import { LANGUAGES } from '../services/api';

interface InputPanelProps {
  sourceCode: string;
  onCodeChange: (code: string) => void;
  detection: LanguageDetectResult | null;
  isDetecting: boolean;
  selectedTargetLang: SupportedLanguage;
  onSelectTargetLang: (lang: SupportedLanguage) => void;
  onManualSourceLangChange: (lang: SupportedLanguage) => void;
  customInstructions: string;
  onInstructionsChange: (val: string) => void;
  onConvert: () => void;
  isConverting: boolean;
  onPasteClipboard: () => void;
  isDark?: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  sourceCode,
  onCodeChange,
  detection,
  isDetecting,
  selectedTargetLang,
  onSelectTargetLang,
  onManualSourceLangChange,
  customInstructions,
  onInstructionsChange,
  onConvert,
  isConverting,
  onPasteClipboard,
  isDark = true,
}) => {
  const detectedLang = detection?.detected_language;
  const isDetected = detectedLang && detectedLang !== 'unknown';
  const confidence = detection?.confidence ? Math.round(detection.confidence * 100) : 0;
  const isAmbiguous = detection?.status === 'ambiguous';

  return (
    <div className="flex flex-col h-full dark:bg-navy-900/80 bg-white border dark:border-slate-800 border-slate-200/90 rounded-2xl p-3.5 lg:p-4 shadow-xl dark:shadow-2xl backdrop-blur-sm justify-between overflow-visible transition-colors duration-150">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b dark:border-slate-800/80 border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold tracking-tight dark:text-white text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-sm shadow-violet-500"></span>
            Input Code
          </h2>

          {/* Automatic Language Detection Badge */}
          <div className="flex items-center gap-1.5">
            {isDetecting ? (
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-600 font-mono animate-pulse">
                <Loader2 className="w-2.5 h-2.5 animate-spin text-violet-500" />
                Detecting...
              </span>
            ) : isDetected ? (
              <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full dark:bg-violet-500/15 dark:border-violet-500/30 dark:text-violet-300 bg-violet-50 border border-violet-200 text-violet-700 font-medium">
                <Sparkles className="w-3 h-3 text-violet-500" />
                <span>Detected:</span>
                <span className="font-bold dark:text-white text-slate-900 uppercase font-mono">
                  {LANGUAGES[detectedLang as SupportedLanguage]?.name || detectedLang}
                </span>
                <span className="text-[10px] text-violet-500 font-mono">({confidence}%)</span>
              </div>
            ) : (
              <span className="text-[11px] dark:text-slate-500 text-slate-400 font-mono px-2 py-0.5 dark:bg-navy-850 bg-slate-100 rounded border dark:border-slate-800 border-slate-200">
                Auto-detect active
              </span>
            )}

            {/* Low confidence clarification dropdown */}
            {isAmbiguous && (
              <div className="flex items-center gap-1 text-[11px] text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                <span>Confirm:</span>
                <select
                  className="bg-transparent text-amber-600 dark:text-amber-200 text-xs focus:outline-none cursor-pointer font-medium"
                  value={isDetected ? (detectedLang as string) : ''}
                  onChange={(e) => onManualSourceLangChange(e.target.value as SupportedLanguage)}
                >
                  <option value="" disabled className="dark:bg-navy-900 bg-white text-slate-500">Select language</option>
                  {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((lang) => (
                    <option key={lang} value={lang} className="dark:bg-navy-900 bg-white dark:text-slate-200 text-slate-800">
                      {LANGUAGES[lang].name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Paste from Clipboard Button */}
        <button
          type="button"
          onClick={onPasteClipboard}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold dark:bg-navy-850 dark:border-slate-700/80 dark:hover:border-violet-500/50 dark:text-slate-300 dark:hover:text-white bg-slate-100 border border-slate-200 hover:border-violet-400 text-slate-700 hover:text-slate-900 transition-all shadow-sm"
        >
          <Clipboard className="w-3.5 h-3.5 text-violet-500" />
          <span>Paste from Clipboard</span>
        </button>
      </div>

      {/* Monaco Code Editor (fills available height) */}
      <div className="flex-1 min-h-0 py-2.5">
        <CodeEditor
          value={sourceCode}
          onChange={onCodeChange}
          language={isDetected ? (detectedLang as string) : 'plaintext'}
          placeholder="Enter or paste your code here..."
          height="100%"
          isDark={isDark}
        />
      </div>

      {/* Custom Conversion Instructions (Compact) */}
      <div className="pb-2.5 shrink-0">
        <CustomInstructions
          value={customInstructions}
          onChange={onInstructionsChange}
          isDark={isDark}
        />
      </div>

      {/* Bottom Action Bar: Convert To dropdown & Convert Now button */}
      <div className="relative pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t dark:border-slate-800/80 border-slate-200 shrink-0 z-20">
        {/* Target Language Dropdown (opens upward with high z-index) */}
        <LanguageSelector
          selectedLanguage={selectedTargetLang}
          onSelectLanguage={onSelectTargetLang}
          excludeLanguage={isDetected ? detectedLang : undefined}
          disabled={isConverting}
          isDark={isDark}
        />

        {/* Convert Now Button */}
        <button
          type="button"
          disabled={isConverting || !sourceCode.trim()}
          onClick={onConvert}
          className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
            isConverting || !sourceCode.trim()
              ? 'opacity-40 cursor-not-allowed dark:bg-slate-800 bg-slate-200 dark:text-slate-500 text-slate-400 border dark:border-slate-700 border-slate-300'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-glow-violet active:scale-[0.98]'
          }`}
        >
          {isConverting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Converting Code...</span>
            </>
          ) : (
            <>
              <span>Convert Now</span>
              <ArrowRight className="w-4 h-4 text-violet-200" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
