import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Terminal as TerminalIcon,
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
  RotateCcw
} from 'lucide-react';
import { ExecuteResult, SupportedLanguage } from '../types';
import { LANGUAGES } from '../services/api';
import { detectInputVariables, DetectedInput } from '../services/inputDetector';

interface VSCodeTerminalProps {
  isDark?: boolean;
  targetLanguage: SupportedLanguage;
  code: string;
  executionResult: ExecuteResult | null;
  isExecuting: boolean;
  onExecute: (stdinString?: string) => void;
  onClose: () => void;
  onClear: () => void;
  runTrigger?: number;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

interface InputHistoryItem {
  prompt: string;
  value: string;
  varName: string;
}

export const VSCodeTerminal: React.FC<VSCodeTerminalProps> = ({
  isDark = true,
  targetLanguage,
  code,
  executionResult,
  isExecuting,
  onExecute,
  onClose,
  onClear,
  runTrigger = 0,
  isMaximized = false,
  onToggleMaximize,
}) => {
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const activeInputRef = useRef<HTMLInputElement>(null);

  // Detect input variables required by the converted code across all languages
  const expectedInputs = useMemo(() => {
    return detectInputVariables(code, targetLanguage);
  }, [code, targetLanguage]);

  // Interactive one-by-one input state
  const [isCollectingInputs, setIsCollectingInputs] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [inputHistory, setInputHistory] = useState<InputHistoryItem[]>([]);

  const targetInfo = LANGUAGES[targetLanguage] || { name: targetLanguage, defaultFilename: 'main' };

  // Standard command line displayed in terminal prompt
  const getCommandLine = useCallback((lang: SupportedLanguage): string => {
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
      case 'php':
        return 'php index.php';
      case 'ruby':
        return 'ruby main.rb';
      case 'kotlin':
        return 'kotlinc Main.kt -include-runtime -d Main.jar && java -jar Main.jar';
      case 'swift':
        return 'swift main.swift';
      case 'dart':
        return 'dart run main.dart';
      case 'bash':
        return 'bash script.sh';
      default:
        return `run ${targetInfo.defaultFilename || 'main'}`;
    }
  }, [targetInfo.defaultFilename]);

  const commandStr = getCommandLine(targetLanguage);

  // Auto-scroll terminal output to bottom whenever content updates
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [executionResult, isExecuting, isCollectingInputs, inputHistory]);

  // Auto-focus the active input element when taking inputs one by one
  useEffect(() => {
    if (isCollectingInputs && activeInputRef.current) {
      activeInputRef.current.focus();
    }
  }, [isCollectingInputs, currentStepIndex]);

  // Start execution workflow explicitly
  const startExecutionWorkflow = useCallback(() => {
    onClear();
    if (expectedInputs.length > 0) {
      setIsCollectingInputs(true);
      setCurrentStepIndex(0);
      setCurrentInputValue('');
      setInputHistory([]);
    } else {
      setIsCollectingInputs(false);
      setInputHistory([]);
      onExecute('');
    }
  }, [expectedInputs, onClear, onExecute]);

  // Track runTrigger: Only execute when user explicitly clicks "Execute Code" or presses shortcut
  const prevRunTriggerRef = useRef(runTrigger);
  useEffect(() => {
    if (runTrigger > 0 && runTrigger !== prevRunTriggerRef.current) {
      prevRunTriggerRef.current = runTrigger;
      startExecutionWorkflow();
    }
  }, [runTrigger, startExecutionWorkflow]);

  // When terminal first mounts without an execution result, start execution once
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (!executionResult && !isExecuting) {
        startExecutionWorkflow();
      }
    }
  }, [executionResult, isExecuting, startExecutionWorkflow]);

  // Submit current input and advance to next input or execute
  const handleSubmitCurrentInput = () => {
    const activePrompt = expectedInputs[currentStepIndex];
    if (!activePrompt) return;

    const val = currentInputValue;
    const newHistory = [
      ...inputHistory,
      { prompt: activePrompt.prompt, value: val, varName: activePrompt.name },
    ];
    setInputHistory(newHistory);
    setCurrentInputValue('');

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < expectedInputs.length) {
      // Advance to the next input variable
      setCurrentStepIndex(nextIndex);
    } else {
      // All inputs collected, execute the code securely with all inputs
      setIsCollectingInputs(false);
      const stdinPayload = newHistory.map((h) => h.value).join('\n') + '\n';
      onExecute(stdinPayload);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitCurrentInput();
    }
  };

  // Clear Terminal Button: Clears the terminal screen completely without executing code
  const handleClearTerminal = () => {
    onClear();
    setInputHistory([]);
    setIsCollectingInputs(false);
    setCurrentInputValue('');
  };

  const handleCopyOutput = async () => {
    const parts: string[] = [];
    parts.push(`user@sandbox:~$ ${commandStr}`);
    inputHistory.forEach((h) => {
      parts.push(`${h.prompt}${h.value}`);
    });
    if (executionResult?.stdout) parts.push(executionResult.stdout);
    if (executionResult?.stderr) parts.push(executionResult.stderr);
    if (executionResult?.error_message) parts.push(executionResult.error_message);

    const content = parts.join('\n');
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy terminal output:', e);
    }
  };

  // Helper to filter out prompt text if echoed back by the subprocess
  const displayStdout = useMemo(() => {
    if (!executionResult?.stdout) return '';
    let out = executionResult.stdout;

    // Remove printed prompts that are already visually rendered in inputHistory
    inputHistory.forEach((h) => {
      const cleanP = h.prompt.trim();
      if (out.startsWith(cleanP)) {
        out = out.slice(cleanP.length).trimStart();
      } else if (out.includes(cleanP)) {
        out = out.replace(cleanP, '').trimStart();
      }
    });

    return out || executionResult.stdout;
  }, [executionResult?.stdout, inputHistory]);

  const currentActiveInput: DetectedInput | undefined = expectedInputs[currentStepIndex];

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

          
          {/* Status Badge */}
          {isCollectingInputs ? (
            <span className="text-[11px] font-mono text-amber-300">
              [Input {currentStepIndex + 1}/{expectedInputs.length}]
            </span>
          ) : isExecuting ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-300 animate-pulse bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
              <span>Executing...</span>
            </span>
          ) : executionResult ? (
            executionResult.status === 'COMPLETED' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                <CheckCircle2 className="w-3 h-3" />
                <span>({executionResult.execution_time_ms}ms)</span>
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
          {/* Re-run Button */}
          <button
            type="button"
            disabled={isExecuting}
            onClick={startExecutionWorkflow}
            className="p-1.5 rounded text-slate-400 hover:text-emerald-400 hover:bg-[#111E3D] transition-colors disabled:opacity-40 flex items-center gap-1"
            title="Re-run code and inputs (Ctrl+Enter)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono hidden xl:inline">Run</span>
          </button>

          {/* Clear Terminal Button: Clears the terminal output completely */}
          <button
            type="button"
            onClick={handleClearTerminal}
            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-[#111E3D] transition-colors"
            title="Clear Terminal Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Copy Terminal Output */}
          <button
            type="button"
            disabled={!executionResult && inputHistory.length === 0}
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
              title={isMaximized ? 'Restore Split View (50%)' : 'Maximize Terminal'}
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

      {/* Terminal Output Screen */}
      <div className="flex-1 min-h-0 p-3 overflow-y-auto font-mono text-xs select-text space-y-1.5 leading-relaxed bg-[#060A14]">
        {/* Startup banner */}
       

        {/* Shell invocation command line */}
        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-emerald-400 font-bold">user@sandbox:~$</span>
          <span className="text-white font-medium">{commandStr}</span>
        </div>

        {/* Previously entered inputs rendered as simple terminal lines */}
        {inputHistory.map((item, idx) => (
          <div key={idx} className="flex items-baseline gap-1 text-slate-200">
            <span className="text-slate-300 font-mono">{item.prompt}</span>
            <span className="text-emerald-300 font-mono font-medium">{item.value}</span>
          </div>
        ))}

        {/* Minimalist, clean terminal input line (no heavy borders, cards, or buttons) */}
        {isCollectingInputs && currentActiveInput && (
          <div className="flex items-center gap-1 text-slate-200 py-0.5">
            <span className="text-slate-300 font-mono shrink-0">{currentActiveInput.prompt}</span>
            <input
              ref={activeInputRef}
              type="text"
              value={currentInputValue}
              onChange={(e) => setCurrentInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-emerald-300 p-0 m-0 focus:ring-0 focus:outline-none"
              autoFocus
            />
          </div>
        )}

        {/* Live Execution Spinner */}
        {isExecuting && (
          <div className="flex items-center gap-2 text-amber-300 text-xs py-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
            <span>Executing code in isolated container...</span>
          </div>
        )}

        {/* Execution Output (STDOUT / STDERR) */}
        {executionResult && !isExecuting && (
          <div className="space-y-1 pt-0.5">
            {/* Standard Output (STDOUT) */}
            {executionResult.stdout && (
              <div className="text-slate-100 whitespace-pre-wrap break-words font-mono">
                {displayStdout || executionResult.stdout}
              </div>
            )}

            {/* Standard Error (STDERR) */}
            {executionResult.stderr && (
              <div className="text-rose-400 whitespace-pre-wrap break-words font-mono">
                {executionResult.stderr}
              </div>
            )}

            {/* Error message if stderr empty */}
            {executionResult.error_message && !executionResult.stderr && (
              <div className="text-rose-400 whitespace-pre-wrap break-words font-mono">
                {executionResult.error_message}
              </div>
            )}

            {/* If neither stdout nor stderr was produced */}
            {!executionResult.stdout && !executionResult.stderr && !executionResult.error_message && (
              <div className="text-slate-500 italic text-[11px]">
                (Process finished with exit code {executionResult.exit_code})
              </div>
            )}

            {/* Process exit summary */}
            <div className="pt-1.5 border-t border-[#1A2D5C]/60 flex items-center justify-between text-[11px] text-slate-400 gap-2">
              <span
                className={
                  executionResult.status === 'COMPLETED'
                    ? 'text-emerald-400 font-bold'
                    : 'text-rose-400 font-bold'
                }
              >
                [Process completed with exit code {executionResult.exit_code}]
              </span>
              <span className="text-slate-500">
                Runner: {executionResult.runner_used || 'isolated-sandbox'}
              </span>
            </div>

            {/* Next prompt cursor */}
            <div className="pt-1 flex items-center gap-2 text-slate-400">
              <span className="text-emerald-400 font-bold">user@sandbox:~$</span>
              <span className="inline-block w-2 h-4 bg-[#7096D1] animate-pulse"></span>
            </div>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
