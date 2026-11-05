import React, { useState } from 'react';
import { HelpCircle, Copy, Download, Check, Loader2 } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { SupportedLanguage } from '../types';
import { LANGUAGES } from '../services/api';

interface OutputPanelProps {
  convertedCode: string;
  onCodeChange: (code: string) => void;
  targetLanguage: SupportedLanguage;
  onExplain: () => void;
  isExplaining: boolean;
  onDownload: () => void;
  isDark?: boolean;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  convertedCode,
  onCodeChange,
  targetLanguage,
  onExplain,
  isExplaining,
  onDownload,
  isDark = true,
}) => {
  const [copied, setCopied] = useState(false);
  const targetInfo = LANGUAGES[targetLanguage] || { name: targetLanguage, extension: '' };

  const handleCopy = async () => {
    if (!convertedCode) return;
    try {
      await navigator.clipboard.writeText(convertedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  return (
    <div className="flex flex-col h-full dark:bg-[#375534]/90 bg-[#AEC3B0] border dark:border-[#6B9071]/50 border-[#6B9071]/80 rounded-2xl p-3.5 lg:p-4 shadow-xl backdrop-blur-sm justify-between transition-colors duration-150">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b dark:border-[#6B9071]/30 border-[#6B9071]/60 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold tracking-tight dark:text-white text-[#0F2A1D] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full dark:bg-[#6B9071] bg-[#0F2A1D] shadow-sm"></span>
            Converted Code
          </h2>

          {/* Target Language Indicator Badge */}
          <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full dark:bg-[#0F2A1D]/80 bg-[#E3EED4] border dark:border-[#6B9071]/60 border-[#6B9071] dark:text-[#E3EED4] text-[#0F2A1D] font-medium shadow-sm">
            <span>Target:</span>
            <span className="font-bold uppercase font-mono">{targetInfo.name}</span>
            <span className="text-[10px] dark:text-[#AEC3B0] text-[#375534] font-mono">({targetInfo.extension})</span>
          </div>
        </div>
      </div>

      {/* Monaco Code Editor (fills available height) */}
      <div className="flex-1 min-h-0 py-2.5">
        <CodeEditor
          value={convertedCode}
          onChange={onCodeChange}
          language={targetLanguage}
          placeholder="Your converted code will appear here..."
          height="100%"
          isDark={isDark}
        />
      </div>

      {/* Bottom Action Bar: Explain Code, Copy Code, Download aligned at bottom */}
      <div className="pt-2.5 flex items-center justify-end gap-2 border-t dark:border-[#6B9071]/30 border-[#6B9071]/60 shrink-0">
        {/* Explain Code Button */}
        <button
          type="button"
          disabled={!convertedCode.trim() || isExplaining}
          onClick={onExplain}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            !convertedCode.trim() || isExplaining
              ? 'opacity-40 cursor-not-allowed dark:bg-[#0F2A1D]/60 dark:border-[#6B9071]/20 dark:text-[#AEC3B0]/40 bg-[#E3EED4]/60 border-[#6B9071]/40 text-[#6B9071]/50'
              : 'dark:bg-[#0F2A1D] dark:border-[#6B9071]/50 dark:hover:border-[#6B9071] dark:text-[#E3EED4] dark:hover:text-white bg-[#E3EED4] border border-[#6B9071] hover:border-[#0F2A1D] text-[#0F2A1D] hover:bg-white shadow-sm font-semibold'
          }`}
          title="Insert concise inline explanatory comments into the code"
        >
          {isExplaining ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin dark:text-[#6B9071] text-[#0F2A1D]" />
          ) : (
            <HelpCircle className="w-3.5 h-3.5 dark:text-[#6B9071] text-[#0F2A1D]" />
          )}
          <span>{isExplaining ? 'Explaining...' : 'Explain Code'}</span>
        </button>

        {/* Copy Code Button */}
        <button
          type="button"
          disabled={!convertedCode.trim()}
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            !convertedCode.trim()
              ? 'opacity-40 cursor-not-allowed dark:bg-[#0F2A1D]/60 dark:border-[#6B9071]/20 dark:text-[#AEC3B0]/40 bg-[#E3EED4]/60 border-[#6B9071]/40 text-[#6B9071]/50'
              : copied
              ? 'dark:bg-[#6B9071] dark:border-white text-white bg-[#0F2A1D] border-transparent'
              : 'dark:bg-[#0F2A1D] dark:border-[#6B9071]/50 dark:hover:border-[#6B9071] dark:text-[#E3EED4] dark:hover:text-white bg-[#E3EED4] border border-[#6B9071] hover:border-[#0F2A1D] text-[#0F2A1D] hover:bg-white shadow-sm font-semibold'
          }`}
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span className="text-white font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 dark:text-[#6B9071] text-[#0F2A1D]" />
              <span>Copy Code</span>
            </>
          )}
        </button>

        {/* Download Code Button */}
        <button
          type="button"
          disabled={!convertedCode.trim()}
          onClick={onDownload}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            !convertedCode.trim()
              ? 'opacity-40 cursor-not-allowed dark:bg-[#0F2A1D]/60 dark:border-[#6B9071]/20 dark:text-[#AEC3B0]/40 bg-[#E3EED4]/60 border-[#6B9071]/40 text-[#6B9071]/50'
              : 'dark:bg-[#0F2A1D] dark:border-[#6B9071]/50 dark:hover:border-[#6B9071] dark:text-[#E3EED4] dark:hover:text-white bg-[#E3EED4] border border-[#6B9071] hover:border-[#0F2A1D] text-[#0F2A1D] hover:bg-white shadow-sm font-semibold'
          }`}
          title={`Download as ${targetInfo.defaultFilename || 'file'}`}
        >
          <Download className="w-3.5 h-3.5 dark:text-[#6B9071] text-[#0F2A1D]" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};
