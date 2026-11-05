import React, { useState } from 'react';
import { Sliders, ChevronDown } from 'lucide-react';

interface CustomInstructionsProps {
  value: string;
  onChange: (value: string) => void;
}

export const CustomInstructions: React.FC<CustomInstructionsProps> = ({
  value,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-800/80 bg-navy-900/60 transition-all overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-slate-300">
            Custom Conversion Instructions
          </span>
          {value.trim() && (
            <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-1.5 py-0.2 rounded-full font-mono">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-xs">
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            {isExpanded ? 'Collapse' : 'Optional'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="p-3.5 pt-1 space-y-2 border-t border-slate-800/60 bg-navy-950/40">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            placeholder="Tell the AI how you want your code converted or modified..."
            className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition-all resize-none font-sans"
          />
        </div>
      )}
    </div>
  );
};
