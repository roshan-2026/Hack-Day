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
    <div className="flex flex-col h-full min-h-0 dark:bg-[#111E3D]/95 bg-white/95 border dark:border-[#1A2D5C] border-[#7096D1]/60 rounded-2xl p-3.5 lg:p-4 shadow-xl dark:shadow-2xl backdrop-blur-sm justify-between overflow-visible transition-colors duration-150">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b dark:border-[#1A2D5C] border-[#7096D1]/40 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold tracking-tight dark:text-white text-[#334DAF] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full dark:bg-[#7096D1] bg-[#334DAF] shadow-sm"></span>
            Input Code
          </h2>

          {/* Automatic Language Detection Badge */}
          <div className="flex items-center gap-1.5">
            {isDetecting ? (
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full dark:bg-[#070D1F] bg-[#D0E4FE] dark:text-[#7096D1] text-[#334DAF] font-mono animate-pulse border dark:border-[#1A2D5C] border-[#7096D1]/50">
                <Loader2 className="w-2.5 h-2.5 animate-spin dark:text-[#7096D1] text-[#334DAF]" />
                Detecting...
              </span>
            ) : isDetected ? (
              <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full dark:bg-[#070D1F] bg-[#D0E4FE] border dark:border-[#1A2D5C] border-[#7096D1] dark:text-[#D0E4FE] text-[#334DAF] font-medium shadow-sm">
                <Sparkles className="w-3 h-3 dark:text-[#7096D1] text-[#334DAF]" />
                <span>Detected:</span>
                <span className="font-bold uppercase font-mono">
                  {LANGUAGES[detectedLang as SupportedLanguage]?.name || detectedLang}
                </span>
                <span className="text-[10px] dark:text-[#7096D1] text-[#334DAF]/70 font-mono">({confidence}%)</span>
              </div>
            ) : (
              <span className="text-[11px] font-mono px-2 py-0.5 dark:bg-[#070D1F] bg-[#D0E4FE]/50 rounded border dark:border-[#1A2D5C] border-[#7096D1]/40 dark:text-[#7096D1] text-[#334DAF]">
                Auto-detect active
              </span>
            )}

            {/* Low confidence clarification dropdown */}
            {isAmbiguous && (
              <div className="flex items-center gap-1 text-[11px] text-amber-500 dark:bg-[#070D1F] bg-[#D0E4FE] border border-amber-500/50 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                <span>Confirm:</span>
                <select
                  className="bg-transparent dark:text-amber-300 text-amber-700 text-xs focus:outline-none cursor-pointer font-medium"
                  value={isDetected ? (detectedLang as string) : ''}
                  onChange={(e) => onManualSourceLangChange(e.target.value as SupportedLanguage)}
                >
                  <option value="" disabled className="dark:bg-[#070D1F] bg-white text-slate-500">Select language</option>
                  {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((lang) => (
                    <option key={lang} value={lang} className="dark:bg-[#070D1F] bg-white dark:text-[#D0E4FE] text-[#0A1128]">
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold dark:bg-[#070D1F] dark:border-[#1A2D5C] dark:hover:border-[#7096D1] dark:text-[#D0E4FE] dark:hover:text-white bg-white border border-[#7096D1] hover:border-[#334DAF] text-[#334DAF] hover:bg-[#D0E4FE]/40 transition-all shadow-sm"
        >
          <Clipboard className="w-3.5 h-3.5 dark:text-[#7096D1] text-[#334DAF]" />
          <span>Paste from Clipboard</span>
        </button>
      </div>

      {/* Monaco Code Editor (fills available height) */}
      <div className="flex-1 min-h-0 py-2.5 flex flex-col">
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
      <div className="relative pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t dark:border-[#1A2D5C] border-[#7096D1]/40 shrink-0 z-20">
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
          className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
            isConverting || !sourceCode.trim()
              ? 'cursor-not-allowed dark:bg-[#070D1F]/60 bg-white/80 dark:border-[#1A2D5C] border-2 border-[#7096D1] dark:text-[#7096D1] text-[#334DAF]'
              : 'dark:bg-[#334DAF] dark:hover:bg-[#4162D4] bg-[#334DAF] hover:bg-[#253982] text-white border-2 border-transparent shadow-[#334DAF]/30 active:scale-[0.98]'
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
