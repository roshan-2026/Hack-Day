import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  Trash2,
  Copy,
  Check,
  X,
  Maximize2,
  Minimize2,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  CornerDownLeft
} from 'lucide-react';
import { ExecuteResult, SupportedLanguage } from '../types';
import { LANGUAGES } from '../services/api';

interface VSCodeTerminalProps {
  isDark?: boolean;
  targetLanguage: SupportedLanguage;
  executionResult: ExecuteResult | null;
  isExecuting: boolean;
  onExecute: () => void;
  onClose: () => void;
  onClear: () => void;
  stdin: string;
  onStdinChange: (val: string) => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const VSCodeTerminal: React.FC<VSCodeTerminalProps> = ({
  isDark = true,
  targetLanguage,
  executionResult,
  isExecuting,
  onExecute,
  onClose,
  onClear,
  stdin,
  onStdinChange,
  isMaximized = false,
  onToggleMaximize,
}) => {
  const [copied, setCopied] = useState(false);
  const [showStdinDrawer, setShowStdinDrawer] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const targetInfo = LANGUAGES[targetLanguage] || { name: targetLanguage, defaultFilename: 'main' };

  // Generate standard command line displayed in terminal prompt
  const getCommandLine = (lang: SupportedLanguage): string => {
    switch (lang) {
      case 'python':
        return 'python3 main.py';
      case 'javascript':
        return 'node main.js';
      case 'typescript':
        return 'ts-node main.ts';
      case 'c':
        return 'gcc -O2 main.c -o main && ./main';
      case 'cpp':
        return 'g++ -O2 -std=c++17 main.cpp -o main && ./main';
      case 'java':
        return 'javac Main.java && java Main';
      case 'csharp':
        return 'dotnet run';
      case 'go':
        return 'go run main.go';
      case 'rust':
        return 'rustc main.rs -o main && ./main';
      case 'bash':
        return 'bash script.sh';
      default:
        return `run ${targetInfo.defaultFilename || 'main'}`;
    }
  };

  // Auto-scroll terminal output to bottom when output arrives
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [executionResult, isExecuting]);

  const handleCopyOutput = async () => {
    if (!executionResult) return;
    const content = [
      executionResult.stdout ? `STDOUT:\n${executionResult.stdout}` : '',
      executionResult.stderr ? `STDERR:\n${executionResult.stderr}` : '',
      executionResult.error_message ? `ERROR:\n${executionResult.error_message}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy terminal output:', e);
    }
  };

  const commandStr = getCommandLine(targetLanguage);

  return (
    <div
      className={`flex flex-col h-full w-full rounded-xl overflow-hidden border shadow-2xl transition-all duration-150 ${
        isDark
          ? 'bg-[#060A14] border-[#1A2D5C] text-slate-200'
          : 'bg-[#0A1128] border-[#334DAF] text-slate-100'
      }`}
    >
      {/* VS Code Terminal Header / Tab Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#090F20] border-b border-[#1A2D5C] select-none shrink-0">
        {/* Left: Terminal Tab & Statuses */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Active Tab */}
          <div className="flex items-center gap-1.5 pb-0.5 border-b-2 border-[#7096D1] text-xs font-semibold tracking-wide font-mono text-white">
            <TerminalIcon className="w-3.5 h-3.5 text-[#7096D1]" />
            <span>TERMINAL</span>
          </div>

          {/* Sub-process name badge */}
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-[#111E3D]/80 border border-[#1A2D5C]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {targetLanguage}
          </span>
          
          {/* Live Execution Status */}
          {isExecuting ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 animate-pulse bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
              <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
              <span>Executing...</span>
            </span>
          ) : executionResult ? (
            executionResult.status === 'COMPLETED' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                <span>{executionResult.execution_time_ms} ms</span>
              </span>
            ) : executionResult.status === 'TIMEOUT' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                <Clock className="w-3 h-3" />
                <span>timeout</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                <AlertTriangle className="w-3 h-3" />
                <span>exit code {executionResult.exit_code}</span>
              </span>
            )
          ) : (
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              [Ready]
            </span>
          )}
        </div>

        {/* Right: Action Buttons (VS Code style toolbar) */}
        <div className="flex items-center gap-1">
          {/* STDIN Toggle Button */}
          <button
            type="button"
            onClick={() => setShowStdinDrawer((prev) => !prev)}
            className={`p-1.5 rounded transition-all flex items-center gap-1 text-[11px] font-mono ${
              showStdinDrawer || stdin.trim()
                ? 'bg-[#1A2D5C] text-[#7096D1] border border-[#7096D1]/40'
                : 'text-slate-400 hover:text-white hover:bg-[#111E3D]'
            }`}
            title="Toggle Standard Input (stdin)"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">stdin</span>
            {stdin.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            )}
          </button>

          {/* Re-run Button */}
          <button
            type="button"
            disabled={isExecuting}
            onClick={onExecute}
            className="p-1.5 rounded text-slate-400 hover:text-emerald-400 hover:bg-[#111E3D] transition-colors disabled:opacity-40"
            title="Rerun Code (Ctrl+Enter)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Clear Terminal Button */}
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-[#111E3D] transition-colors"
            title="Clear Terminal (Ctrl+L)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Copy Terminal Output */}
          <button
            type="button"
            disabled={!executionResult}
            onClick={handleCopyOutput}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#111E3D] transition-colors disabled:opacity-30"
            title="Copy Terminal Output"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Maximize / Restore Toggle */}
          {onToggleMaximize && (
            <button
              type="button"
              onClick={onToggleMaximize}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#111E3D] transition-colors"
              title={isMaximized ? "Restore Split View (50%)" : "Maximize Terminal"}
            >
              {isMaximized ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Close Terminal Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-rose-900/60 transition-colors"
            title="Close Terminal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Optional STDIN Drawer */}
      {showStdinDrawer && (
        <div className="bg-[#0A1226] border-b border-[#1A2D5C] p-2 flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-[#7096D1] font-bold shrink-0">
            STDIN &gt;
          </span>
          <input
            type="text"
            value={stdin}
            onChange={(e) => onStdinChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onExecute();
              }
            }}
            placeholder="Type standard input (stdin) for input(), scanf(), cin... Press Enter to run"
            className="flex-1 bg-[#060A14] border border-[#1A2D5C] rounded px-2 py-1 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#7096D1]"
          />
          <button
            type="button"
            disabled={isExecuting}
            onClick={onExecute}
            className="px-2.5 py-1 text-xs font-mono bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition-colors disabled:opacity-40"
          >
            Send & Run
          </button>
        </div>
      )}

      {/* Terminal Output Screen */}
      <div className="flex-1 min-h-0 p-3 overflow-y-auto font-mono text-xs select-text space-y-2 leading-relaxed bg-[#060A14]">
        {/* Startup banner if no execution has occurred yet */}
        {!executionResult && !isExecuting && (
          <div className="text-slate-400 space-y-1 select-none">
            <div className="pt-2 text-slate-400 flex items-center gap-2">
              <span className="text-emerald-400">bash:~$</span>
              <span className="text-slate-300">{commandStr}</span>
              <span className="inline-block w-2 h-4 bg-[#7096D1] animate-pulse"></span>
            </div>
            
          </div>
        )}

        {/* When executing */}
        {isExecuting && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-emerald-400">bash:~$</span>
              <span>{commandStr}</span>
            </div>
            <div className="flex items-center gap-2 text-amber-300 text-xs py-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
              <span>Compiling and executing in isolated container...</span>
            </div>
          </div>
        )}

        {/* When execution result is present */}
        {executionResult && !isExecuting && (
          <div className="space-y-2">
            {/* Command invocation prompt line */}
            <div className="flex items-center gap-2 text-slate-300 border-b border-[#1A2D5C]/60 pb-1">
              <span className="text-emerald-400">bash:~$</span>
              <span className="text-white font-medium">{commandStr}</span>
            </div>

            {/* If STDIN was passed */}
            {stdin && (
              <div className="text-[11px] text-[#7096D1] bg-[#111E3D]/50 px-2 py-1 rounded border border-[#1A2D5C]">
                <span className="font-bold mr-1">&lt;stdin&gt;:</span>
                <span className="text-slate-300">{stdin}</span>
              </div>
            )}

            {/* Standard Output (STDOUT) */}
            {executionResult.stdout && (
              <div className="text-slate-100 whitespace-pre-wrap break-words font-mono">
                {executionResult.stdout}
              </div>
            )}

            {/* Standard Error (STDERR) */}
            {executionResult.stderr && (
              <div className="text-rose-400 bg-rose-950/20 border border-rose-900/50 p-2 rounded whitespace-pre-wrap break-words font-mono">
                {executionResult.stderr}
              </div>
            )}

            {/* Error Message if runner failed */}
            {executionResult.error_message && !executionResult.stderr && (
              <div className="text-rose-400 bg-rose-950/20 border border-rose-900/50 p-2 rounded whitespace-pre-wrap break-words font-mono">
                {executionResult.error_message}
              </div>
            )}

            {/* If no output was produced */}
            {!executionResult.stdout && !executionResult.stderr && !executionResult.error_message && (
              <div className="text-slate-500 italic text-[11px]">
                (Process exited without printing to stdout or stderr)
              </div>
            )}

            {/* Process exit summary */}
            <div className="pt-2 border-t border-[#1A2D5C]/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={
                    executionResult.status === 'COMPLETED'
                      ? 'text-emerald-400 font-bold'
                      : 'text-rose-400 font-bold'
                  }
                >
                  [Process completed with exit code {executionResult.exit_code}]
                </span>
                <span>•</span>
                <span>Time: {executionResult.execution_time_ms}ms</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <span>Runner: {executionResult.runner_used || 'isolated-sandbox'}</span>
              </div>
            </div>

            {/* Next prompt cursor */}
            <div className="pt-2 flex items-center gap-2 text-slate-400">
              <span className="text-emerald-400">bash:~$</span>
              <span className="inline-block w-2 h-4 bg-[#7096D1] animate-pulse"></span>
            </div>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
