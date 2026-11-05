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
    <div className="flex flex-col h-full dark:bg-[#111E3D]/95 bg-white/95 border dark:border-[#1A2D5C] border-[#7096D1]/60 rounded-2xl p-3.5 lg:p-4 shadow-xl dark:shadow-2xl backdrop-blur-sm justify-between transition-colors duration-150">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b dark:border-[#1A2D5C] border-[#7096D1]/40 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold tracking-tight dark:text-white text-[#334DAF] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full dark:bg-[#7096D1] bg-[#334DAF] shadow-sm"></span>
            Converted Code
          </h2>

          {/* Target Language Indicator Badge */}
          <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full dark:bg-[#070D1F] bg-[#D0E4FE] border dark:border-[#1A2D5C] border-[#7096D1] dark:text-[#D0E4FE] text-[#334DAF] font-medium shadow-sm">
            <span>Target:</span>
            <span className="font-bold uppercase font-mono">{targetInfo.name}</span>
            <span className="text-[10px] dark:text-[#7096D1] text-[#334DAF]/70 font-mono">({targetInfo.extension})</span>
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
      <div className="pt-2.5 flex items-center justify-end gap-2 border-t dark:border-[#1A2D5C] border-[#7096D1]/40 shrink-0">
        {/* Explain Code Button */}
        <button
          type="button"
          disabled={!convertedCode.trim() || isExplaining}
          onClick={onExplain}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            !convertedCode.trim() || isExplaining
              ? 'opacity-40 cursor-not-allowed dark:bg-[#070D1F]/60 dark:border-[#1A2D5C]/30 dark:text-[#7096D1]/40 bg-[#D0E4FE]/40 border-[#7096D1]/40 text-[#7096D1]/60'
              : 'dark:bg-[#070D1F] dark:border-[#1A2D5C] dark:hover:border-[#7096D1] dark:text-[#D0E4FE] dark:hover:text-white bg-[#D0E4FE]/40 border border-[#7096D1] hover:border-[#334DAF] text-[#334DAF] hover:bg-[#D0E4FE] shadow-sm font-semibold'
          }`}
          title="Insert concise inline explanatory comments into the code"
        >
          {isExplaining ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin dark:text-[#7096D1] text-[#334DAF]" />
          ) : (
            <HelpCircle className="w-3.5 h-3.5 dark:text-[#7096D1] text-[#334DAF]" />
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
              ? 'opacity-40 cursor-not-allowed dark:bg-[#070D1F]/60 dark:border-[#1A2D5C]/30 dark:text-[#7096D1]/40 bg-[#D0E4FE]/40 border-[#7096D1]/40 text-[#7096D1]/60'
              : copied
              ? 'dark:bg-[#334DAF] dark:border-white text-white bg-[#334DAF] border-transparent'
              : 'dark:bg-[#070D1F] dark:border-[#1A2D5C] dark:hover:border-[#7096D1] dark:text-[#D0E4FE] dark:hover:text-white bg-[#D0E4FE]/40 border border-[#7096D1] hover:border-[#334DAF] text-[#334DAF] hover:bg-[#D0E4FE] shadow-sm font-semibold'
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
              <Copy className="w-3.5 h-3.5 dark:text-[#7096D1] text-[#334DAF]" />
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
              ? 'opacity-40 cursor-not-allowed dark:bg-[#070D1F]/60 dark:border-[#1A2D5C]/30 dark:text-[#7096D1]/40 bg-[#D0E4FE]/40 border-[#7096D1]/40 text-[#7096D1]/60'
              : 'dark:bg-[#070D1F] dark:border-[#1A2D5C] dark:hover:border-[#7096D1] dark:text-[#D0E4FE] dark:hover:text-white bg-[#D0E4FE]/40 border border-[#7096D1] hover:border-[#334DAF] text-[#334DAF] hover:bg-[#D0E4FE] shadow-sm font-semibold'
          }`}
          title={`Download as ${targetInfo.defaultFilename || 'file'}`}
        >
          <Download className="w-3.5 h-3.5 dark:text-[#7096D1] text-[#334DAF]" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};
