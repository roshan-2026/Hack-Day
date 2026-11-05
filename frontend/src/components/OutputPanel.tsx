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
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  convertedCode,
  onCodeChange,
  targetLanguage,
  onExplain,
  isExplaining,
  onDownload,
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
    <div className="flex flex-col h-full bg-navy-900/80 border border-slate-800 rounded-2xl p-3.5 lg:p-4 shadow-xl backdrop-blur-sm justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500"></span>
            Converted Code
          </h2>

          {/* Target Language Indicator Badge */}
          <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-medium">
            <span>Target:</span>
            <span className="font-bold text-white uppercase font-mono">{targetInfo.name}</span>
            <span className="text-[10px] text-purple-400 font-mono">({targetInfo.extension})</span>
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
        />
      </div>

      {/* Bottom Action Bar: Explain Code, Copy Code, Download aligned at bottom */}
      <div className="pt-2.5 flex items-center justify-end gap-2 border-t border-slate-800/80 shrink-0">
        {/* Explain Code Button */}
        <button
          type="button"
          disabled={!convertedCode.trim() || isExplaining}
          onClick={onExplain}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            !convertedCode.trim() || isExplaining
              ? 'opacity-40 cursor-not-allowed bg-navy-850 border-slate-800 text-slate-500'
              : 'bg-navy-850 border-slate-700 hover:border-violet-500/50 text-slate-300 hover:text-white shadow-sm'
          }`}
          title="Insert concise inline explanatory comments into the code"
        >
          {isExplaining ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
          ) : (
            <HelpCircle className="w-3.5 h-3.5 text-violet-400" />
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
              ? 'opacity-40 cursor-not-allowed bg-navy-850 border-slate-800 text-slate-500'
              : copied
              ? 'bg-violet-950/60 border-violet-500 text-violet-200'
              : 'bg-navy-850 border-slate-700 hover:border-violet-500/50 text-slate-300 hover:text-white shadow-sm'
          }`}
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
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
              ? 'opacity-40 cursor-not-allowed bg-navy-850 border-slate-800 text-slate-500'
              : 'bg-navy-850 border-slate-700 hover:border-violet-500/50 text-slate-300 hover:text-white shadow-sm'
          }`}
          title={`Download as ${targetInfo.defaultFilename || 'file'}`}
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};
