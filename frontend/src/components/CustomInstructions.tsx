import React, { useState } from 'react';
import { Sliders, ChevronDown } from 'lucide-react';

interface CustomInstructionsProps {
  value: string;
  onChange: (value: string) => void;
  isDark?: boolean;
}

export const CustomInstructions: React.FC<CustomInstructionsProps> = ({
  value,
  onChange,
  isDark: _isDark = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border dark:border-slate-800/80 border-slate-200 dark:bg-navy-900/60 bg-slate-50/90 transition-all overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left dark:hover:bg-slate-800/40 hover:bg-slate-100/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-violet-500" />
          <span className="text-xs font-semibold dark:text-slate-300 text-slate-700">
            Custom Conversion Instructions
          </span>
          {value.trim() && (
            <span className="text-[10px] dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30 bg-violet-100 text-violet-700 border border-violet-200 px-1.5 py-0.2 rounded-full font-mono">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 dark:text-slate-400 text-slate-500 text-xs">
          <span className="text-[11px] dark:text-slate-500 text-slate-400 hidden sm:inline">
            {isExpanded ? 'Collapse' : 'Optional'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="p-3.5 pt-1 space-y-2 border-t dark:border-slate-800/60 border-slate-200 dark:bg-navy-950/40 bg-white/60">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            placeholder="Tell the AI how you want your code converted or modified (e.g. use recursion, modern syntax, optimize)..."
            className="w-full dark:bg-navy-950 dark:border-slate-800 dark:text-slate-200 dark:placeholder-slate-500 bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg p-2.5 text-xs focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition-all resize-none font-sans"
          />
        </div>
      )}
    </div>
  );
};
