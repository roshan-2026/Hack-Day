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
    <div className="rounded-xl border dark:border-[#1A2D5C] border-[#7096D1]/50 dark:bg-[#070D1F]/60 bg-[#D0E4FE]/30 transition-all overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 flex items-center justify-between text-left dark:hover:bg-[#070D1F]/90 hover:bg-[#D0E4FE]/60 transition-colors"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Sliders className="w-3.5 h-3.5 dark:text-[#7096D1] text-[#334DAF] shrink-0" />
          <span className="text-xs font-semibold dark:text-[#D0E4FE] text-[#334DAF] truncate">
            Custom Conversion Instructions
          </span>
          {value.trim() && (
            <span className="text-[10px] dark:bg-[#334DAF] dark:text-white bg-[#334DAF] text-white px-1.5 py-0.2 rounded-full font-mono shrink-0">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 dark:text-[#7096D1] text-[#7096D1] text-xs shrink-0 ml-2">
          <span className="text-[11px] hidden sm:inline">
            {isExpanded ? 'Collapse' : 'Optional'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="p-3.5 pt-1 space-y-2 border-t dark:border-[#1A2D5C] border-[#7096D1]/30 dark:bg-[#070D1F]/40 bg-white/40">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            placeholder="Tell the AI how you want your code converted or modified (e.g. use recursion, modern syntax, optimize)..."
            className="w-full dark:bg-[#070D1F] dark:border-[#1A2D5C] dark:text-[#D0E4FE] dark:placeholder-[#7096D1]/60 bg-white border border-[#7096D1] text-[#0A1128] placeholder-[#7096D1]/70 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#334DAF] transition-all resize-none font-sans shadow-inner"
          />
        </div>
      )}
    </div>
  );
};
