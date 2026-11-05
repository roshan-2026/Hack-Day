import React from 'react';
import { Code2, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, onToggleTheme }) => {
  return (
    <header className="border-b dark:border-[#1A2D5C] border-[#7096D1]/60 dark:bg-[#0A1128]/95 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-2.5 shadow-sm dark:shadow-xl shrink-0 transition-colors duration-150">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Title and Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl dark:bg-[#111E3D] bg-[#334DAF] border dark:border-[#7096D1]/50 border-transparent flex items-center justify-center text-white shrink-0 shadow-md shadow-[#334DAF]/20">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold tracking-tight dark:text-white text-[#334DAF] leading-tight">
                Cross-Language Code Translation
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 rounded-full dark:bg-[#111E3D] dark:text-[#7096D1] dark:border-[#1A2D5C] bg-[#D0E4FE] text-[#334DAF] border border-[#7096D1]/70 font-mono">
                AI Powered
              </span>
            </div>
            <p className="text-[11px] dark:text-[#7096D1] text-[#334DAF]/80 font-medium leading-tight">
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
              dark:bg-[#111E3D] dark:border-[#1A2D5C] dark:hover:border-[#7096D1]/60 dark:text-[#D0E4FE] dark:hover:bg-[#1A2D5C]
              bg-[#D0E4FE]/70 border-[#7096D1] text-[#334DAF] hover:bg-white"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline font-medium text-[#D0E4FE]">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#334DAF]" />
                <span className="hidden sm:inline font-semibold text-[#334DAF]">Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
