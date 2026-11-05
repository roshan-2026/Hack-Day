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
    <div className="flex flex-col h-full dark:bg-navy-900/80 bg-white border dark:border-slate-800 border-slate-200/90 rounded-2xl p-3.5 lg:p-4 shadow-xl dark:shadow-2xl backdrop-blur-sm justify-between transition-colors duration-150">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b dark:border-slate-800/80 border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold tracking-tight dark:text-white text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500"></span>
            Converted Code
          </h2>

          {/* Target Language Indicator Badge */}
          <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full dark:bg-purple-500/15 dark:border-purple-500/30 dark:text-purple-300 bg-purple-50 border border-purple-200 text-purple-700 font-medium">
            <span>Target:</span>
            <span className="font-bold dark:text-white text-slate-900 uppercase font-mono">{targetInfo.name}</span>
            <span className="text-[10px] text-purple-500 font-mono">({targetInfo.extension})</span>
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
      <div className="pt-2.5 flex items-center justify-end gap-2 border-t dark:border-slate-800/80 border-slate-200 shrink-0">
        {/* Explain Code Button */}
        <button
          type="button"
          disabled={!convertedCode.trim() || isExplaining}
          onClick={onExplain}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            !convertedCode.trim() || isExplaining
              ? 'opacity-40 cursor-not-allowed dark:bg-navy-850 dark:border-slate-800 dark:text-slate-500 bg-slate-100 border-slate-200 text-slate-400'
              : 'dark:bg-navy-850 dark:border-slate-700 dark:hover:border-violet-500/50 dark:text-slate-300 dark:hover:text-white bg-slate-100 border-slate-200 hover:border-violet-400 text-slate-700 hover:text-slate-900 shadow-sm'
          }`}
          title="Insert concise inline explanatory comments into the code"
        >
          {isExplaining ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
          ) : (
            <HelpCircle className="w-3.5 h-3.5 text-violet-500" />
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
              ? 'opacity-40 cursor-not-allowed dark:bg-navy-850 dark:border-slate-800 dark:text-slate-500 bg-slate-100 border-slate-200 text-slate-400'
              : copied
              ? 'dark:bg-violet-950/60 dark:border-violet-500 dark:text-violet-200 bg-violet-100 border-violet-400 text-violet-800'
              : 'dark:bg-navy-850 dark:border-slate-700 dark:hover:border-violet-500/50 dark:text-slate-300 dark:hover:text-white bg-slate-100 border-slate-200 hover:border-violet-400 text-slate-700 hover:text-slate-900 shadow-sm'
          }`}
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-300 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
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
              ? 'opacity-40 cursor-not-allowed dark:bg-navy-850 dark:border-slate-800 dark:text-slate-500 bg-slate-100 border-slate-200 text-slate-400'
              : 'dark:bg-navy-850 dark:border-slate-700 dark:hover:border-violet-500/50 dark:text-slate-300 dark:hover:text-white bg-slate-100 border-slate-200 hover:border-violet-400 text-slate-700 hover:text-slate-900 shadow-sm'
          }`}
          title={`Download as ${targetInfo.defaultFilename || 'file'}`}
        >
          <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};
