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
    <div className="rounded-xl border dark:border-[#6B9071]/40 border-[#6B9071]/70 dark:bg-[#0F2A1D]/60 bg-[#E3EED4]/90 transition-all overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left dark:hover:bg-[#0F2A1D]/90 hover:bg-[#E3EED4] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 dark:text-[#6B9071] text-[#0F2A1D]" />
          <span className="text-xs font-semibold dark:text-[#E3EED4] text-[#0F2A1D]">
            Custom Conversion Instructions
          </span>
          {value.trim() && (
            <span className="text-[10px] dark:bg-[#6B9071]/40 dark:text-[#E3EED4] dark:border-[#6B9071]/60 bg-[#0F2A1D] text-white border border-transparent px-1.5 py-0.2 rounded-full font-mono">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 dark:text-[#AEC3B0] text-[#375534] text-xs">
          <span className="text-[11px] hidden sm:inline">
            {isExpanded ? 'Collapse' : 'Optional'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="p-3.5 pt-1 space-y-2 border-t dark:border-[#6B9071]/30 border-[#6B9071]/50 dark:bg-[#0F2A1D]/40 bg-[#AEC3B0]/40">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            placeholder="Tell the AI how you want your code converted or modified (e.g. use recursion, modern syntax, optimize)..."
            className="w-full dark:bg-[#0F2A1D] dark:border-[#6B9071]/50 dark:text-[#E3EED4] dark:placeholder-[#AEC3B0]/60 bg-[#6B9071] border border-[#375534]/60 text-white placeholder-[#E3EED4]/80 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-white/40 transition-all resize-none font-sans shadow-inner"
          />
        </div>
      )}
    </div>
  );
};
