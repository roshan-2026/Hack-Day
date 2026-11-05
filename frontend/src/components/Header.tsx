import React from 'react';
import { Code2, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, onToggleTheme }) => {
  return (
    <header className="border-b dark:border-slate-800/80 border-slate-200 dark:bg-navy-900/90 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-2.5 shadow-sm dark:shadow-lg shrink-0 transition-colors duration-150">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Title and Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-glow-violet text-white shrink-0">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold tracking-tight dark:text-white text-slate-900 leading-tight">
                Cross-Language Code Translation
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 rounded-full dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30 bg-violet-100 text-violet-700 border border-violet-200">
                AI Powered
              </span>
            </div>
            <p className="text-[11px] dark:text-slate-400 text-slate-500 font-normal leading-tight">
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
              dark:bg-navy-850 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-navy-800 dark:hover:border-violet-500/40
              bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:border-violet-400"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline font-medium text-slate-300">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-violet-600" />
                <span className="hidden sm:inline font-medium text-slate-700">Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
