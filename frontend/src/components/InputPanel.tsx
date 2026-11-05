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
    <div className="flex flex-col h-full dark:bg-[#375534]/90 bg-[#AEC3B0] border dark:border-[#6B9071]/50 border-[#6B9071]/80 rounded-2xl p-3.5 lg:p-4 shadow-xl backdrop-blur-sm justify-between overflow-visible transition-colors duration-150">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b dark:border-[#6B9071]/30 border-[#6B9071]/60 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold tracking-tight dark:text-white text-[#0F2A1D] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full dark:bg-[#6B9071] bg-[#0F2A1D] shadow-sm"></span>
            Input Code
          </h2>

          {/* Automatic Language Detection Badge */}
          <div className="flex items-center gap-1.5">
            {isDetecting ? (
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full dark:bg-[#0F2A1D] bg-[#E3EED4] dark:text-[#AEC3B0] text-[#0F2A1D] font-mono animate-pulse border dark:border-[#6B9071]/40 border-[#6B9071]/60">
                <Loader2 className="w-2.5 h-2.5 animate-spin dark:text-[#6B9071] text-[#0F2A1D]" />
                Detecting...
              </span>
            ) : isDetected ? (
              <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full dark:bg-[#0F2A1D]/80 bg-[#E3EED4] border dark:border-[#6B9071]/60 border-[#6B9071] dark:text-[#E3EED4] text-[#0F2A1D] font-medium shadow-sm">
                <Sparkles className="w-3 h-3 dark:text-[#6B9071] text-[#0F2A1D]" />
                <span>Detected:</span>
                <span className="font-bold uppercase font-mono">
                  {LANGUAGES[detectedLang as SupportedLanguage]?.name || detectedLang}
                </span>
                <span className="text-[10px] dark:text-[#AEC3B0] text-[#375534] font-mono">({confidence}%)</span>
              </div>
            ) : (
              <span className="text-[11px] font-mono px-2 py-0.5 dark:bg-[#0F2A1D] bg-[#E3EED4] rounded border dark:border-[#6B9071]/40 border-[#6B9071]/60 dark:text-[#AEC3B0] text-[#0F2A1D]">
                Auto-detect active
              </span>
            )}

            {/* Low confidence clarification dropdown */}
            {isAmbiguous && (
              <div className="flex items-center gap-1 text-[11px] text-amber-500 dark:bg-[#0F2A1D] bg-[#E3EED4] border border-amber-500/50 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                <span>Confirm:</span>
                <select
                  className="bg-transparent dark:text-amber-300 text-amber-700 text-xs focus:outline-none cursor-pointer font-medium"
                  value={isDetected ? (detectedLang as string) : ''}
                  onChange={(e) => onManualSourceLangChange(e.target.value as SupportedLanguage)}
                >
                  <option value="" disabled className="dark:bg-[#0F2A1D] bg-[#E3EED4] text-slate-500">Select language</option>
                  {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((lang) => (
                    <option key={lang} value={lang} className="dark:bg-[#0F2A1D] bg-[#E3EED4] dark:text-[#E3EED4] text-[#0F2A1D]">
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold dark:bg-[#0F2A1D] dark:border-[#6B9071]/50 dark:hover:border-[#6B9071] dark:text-[#E3EED4] dark:hover:text-white bg-[#E3EED4] border border-[#6B9071] hover:border-[#0F2A1D] text-[#0F2A1D] hover:bg-white transition-all shadow-sm"
        >
          <Clipboard className="w-3.5 h-3.5 dark:text-[#6B9071] text-[#0F2A1D]" />
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
      <div className="relative pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t dark:border-[#6B9071]/30 border-[#6B9071]/60 shrink-0 z-20">
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
              ? 'opacity-40 cursor-not-allowed dark:bg-[#0F2A1D] bg-[#E3EED4] dark:text-[#AEC3B0] text-[#6B9071] border dark:border-[#6B9071]/30 border-[#6B9071]'
              : 'dark:bg-[#6B9071] dark:hover:bg-[#527750] bg-[#0F2A1D] hover:bg-[#1a4430] text-white shadow-md active:scale-[0.98]'
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
              <ArrowRight className="w-4 h-4 text-white" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
