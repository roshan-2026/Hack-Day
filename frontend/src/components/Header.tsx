import React from 'react';
import { Code2, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, onToggleTheme }) => {
  return (
    <header className="border-b dark:border-[#375534] border-[#6B9071]/50 dark:bg-[#0F2A1D]/95 bg-[#AEC3B0]/95 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-2.5 shadow-sm dark:shadow-lg shrink-0 transition-colors duration-150">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Title and Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl dark:bg-[#375534] bg-[#0F2A1D] border dark:border-[#6B9071]/50 border-transparent flex items-center justify-center text-white shrink-0 shadow-md">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold tracking-tight dark:text-white text-[#0F2A1D] leading-tight">
                Cross-Language Code Translation
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 rounded-full dark:bg-[#375534] dark:text-[#AEC3B0] dark:border-[#6B9071]/50 bg-[#E3EED4] text-[#0F2A1D] border border-[#6B9071]/70">
                AI Powered
              </span>
            </div>
            <p className="text-[11px] dark:text-[#AEC3B0] text-[#23422a] font-medium leading-tight">
              Convert code across 20 programming languages with automated translation.
            </p>
          </div>
        </div>

        {/* Right side: Light/Dark Mode Toggle Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm active:scale-95
              dark:bg-[#375534] dark:border-[#6B9071]/60 dark:text-white dark:hover:bg-[#527750]
              bg-[#E3EED4] border-[#6B9071] text-[#0F2A1D] hover:bg-white"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline font-medium text-white">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#0F2A1D]" />
                <span className="hidden sm:inline font-semibold text-[#0F2A1D]">Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
