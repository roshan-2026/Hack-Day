import React, { useState, useEffect, useCallback } from 'react';
import {
  HelpCircle,
  Copy,
  Download,
  Check,
  Loader2,
  Play,
  Terminal as TerminalIcon
} from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { VSCodeTerminal } from './VSCodeTerminal';
import { SupportedLanguage, ExecuteResult } from '../types';
import { LANGUAGES, executeCode } from '../services/api';

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
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecuteResult | null>(null);
  const [stdin, setStdin] = useState('');

  const targetInfo = LANGUAGES[targetLanguage] || { name: targetLanguage, extension: '' };
  const isDisabled = !convertedCode.trim();

  const handleCopy = async () => {
    if (!convertedCode) return;
    try {
      await navigator.clipboard.writeText(convertedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  const handleExecute = useCallback(async () => {
    if (!convertedCode.trim() || isExecuting) return;

    // Immediately open terminal container taking half size of output field
    setIsTerminalOpen(true);
    setIsExecuting(true);

    try {
      const res = await executeCode({
        sourceCode: convertedCode,
        language: targetLanguage,
        stdin: stdin.trim() || undefined,
      });
      setExecutionResult(res);
    } catch (err: any) {
      setExecutionResult({
        stdout: '',
        stderr: err.message || 'Execution failed',
        exit_code: 1,
        execution_time_ms: 0,
        status: 'FAILED',
        runner_used: 'sandbox-error',
        error_message: err.message || 'Failed to execute code in sandbox environment',
      });
    } finally {
      setIsExecuting(false);
    }
  }, [convertedCode, isExecuting, targetLanguage, stdin]);

  // Global Ctrl+Enter / Cmd+Enter shortcut to execute code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (convertedCode.trim()) {
          e.preventDefault();
          handleExecute();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [convertedCode, handleExecute]);

  return (
    <div className="flex flex-col h-full min-h-0 dark:bg-[#111E3D]/95 bg-white/95 border dark:border-[#1A2D5C] border-[#7096D1]/60 rounded-2xl p-3.5 lg:p-4 shadow-xl dark:shadow-2xl backdrop-blur-sm justify-between transition-colors duration-150">
      {/* Top Header with Title, Badge, and Top-Right Execute Code Play Button */}
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
            <span className="text-[10px] dark:text-[#7096D1] text-[#334DAF]/70 font-mono">
              ({targetInfo.extension})
            </span>
          </div>
        </div>

        {/* Top Right Corner: Execute Code Play Button and Terminal Toggle */}
        <div className="flex items-center gap-2">
          {/* Terminal Toggle Button */}
          <button
            type="button"
            onClick={() => setIsTerminalOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isTerminalOpen
                ? 'dark:bg-[#1A2D5C] dark:text-white dark:border-[#7096D1] bg-[#334DAF] text-white border-[#334DAF] shadow-sm'
                : 'dark:bg-[#070D1F] dark:border-[#1A2D5C] dark:text-[#D0E4FE] dark:hover:border-[#7096D1] bg-[#D0E4FE]/70 border-[#7096D1] text-[#334DAF] hover:bg-white'
            }`}
            title={isTerminalOpen ? 'Hide Terminal' : 'Open Integrated Terminal'}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Terminal</span>
          </button>

          {/* Execute Code Play Button */}
          <button
            type="button"
            disabled={isDisabled || isExecuting}
            onClick={handleExecute}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ${
              isDisabled || isExecuting
                ? 'cursor-not-allowed opacity-50 dark:bg-emerald-950 dark:text-emerald-700 bg-emerald-100 text-emerald-400 border border-emerald-300 dark:border-emerald-900'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 hover:shadow-emerald-500/30 ring-1 ring-emerald-400/40 cursor-pointer'
            }`}
            title="Execute code securely in terminal (Ctrl+Enter)"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-white" />
                <span>Execute Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Field Area: Code Editor & VS Code Terminal container */}
      <div className="flex-1 min-h-0 py-2.5 flex flex-col gap-2.5">
        {/* Monaco Code Editor (takes full height when terminal closed, or 50% top half when terminal open) */}
        <div
          className={`transition-all duration-150 min-h-0 ${
            isTerminalOpen && !isTerminalMaximized
              ? 'h-1/2 flex-1'
              : isTerminalMaximized
              ? 'hidden'
              : 'h-full flex-1'
          }`}
        >
          <CodeEditor
            value={convertedCode}
            onChange={onCodeChange}
            language={targetLanguage}
            placeholder="Your converted code will appear here..."
            height="100%"
            isDark={isDark}
          />
        </div>

        {/* VS Code Terminal Container (opens half the size of output field in the output field) */}
        {isTerminalOpen && (
          <div
            className={`transition-all duration-150 min-h-0 ${
              isTerminalMaximized ? 'h-full flex-1' : 'h-1/2 flex-1'
            }`}
          >
            <VSCodeTerminal
              isDark={isDark}
              targetLanguage={targetLanguage}
              executionResult={executionResult}
              isExecuting={isExecuting}
              onExecute={handleExecute}
              onClose={() => setIsTerminalOpen(false)}
              onClear={() => setExecutionResult(null)}
              stdin={stdin}
              onStdinChange={setStdin}
              isMaximized={isTerminalMaximized}
              onToggleMaximize={() => setIsTerminalMaximized((prev) => !prev)}
            />
          </div>
        )}
      </div>

      {/* Bottom Action Bar: Explain Code, Copy Code, Download aligned at bottom */}
      <div className="pt-2.5 flex items-center justify-end gap-2 border-t dark:border-[#1A2D5C] border-[#7096D1]/40 shrink-0">
        {/* Explain Code Button */}
        <button
          type="button"
          disabled={isDisabled || isExplaining}
          onClick={onExplain}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isDisabled || isExplaining
              ? 'cursor-not-allowed dark:bg-[#070D1F]/60 bg-white/90 dark:border-[#1A2D5C] border border-[#7096D1] dark:text-[#7096D1] text-[#334DAF]'
              : 'dark:bg-[#070D1F] dark:border-[#7096D1] dark:hover:border-white dark:text-[#D0E4FE] dark:hover:text-white bg-[#D0E4FE]/70 border-2 border-[#334DAF] text-[#334DAF] hover:bg-[#D0E4FE] shadow-sm font-bold'
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
          disabled={isDisabled}
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isDisabled
              ? 'cursor-not-allowed dark:bg-[#070D1F]/60 bg-white/90 dark:border-[#1A2D5C] border border-[#7096D1] dark:text-[#7096D1] text-[#334DAF]'
              : copied
              ? 'dark:bg-[#334DAF] dark:border-white text-white bg-[#334DAF] border-transparent font-bold'
              : 'dark:bg-[#070D1F] dark:border-[#7096D1] dark:hover:border-white dark:text-[#D0E4FE] dark:hover:text-white bg-[#D0E4FE]/70 border-2 border-[#334DAF] text-[#334DAF] hover:bg-[#D0E4FE] shadow-sm font-bold'
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
          disabled={isDisabled}
          onClick={onDownload}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isDisabled
              ? 'cursor-not-allowed dark:bg-[#070D1F]/60 bg-white/90 dark:border-[#1A2D5C] border border-[#7096D1] dark:text-[#7096D1] text-[#334DAF]'
              : 'dark:bg-[#070D1F] dark:border-[#7096D1] dark:hover:border-white dark:text-[#D0E4FE] dark:hover:text-white bg-[#D0E4FE]/70 border-2 border-[#334DAF] text-[#334DAF] hover:bg-[#D0E4FE] shadow-sm font-bold'
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
