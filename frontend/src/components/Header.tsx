import React from 'react';
import { Code2 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800/80 bg-navy-900/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-2.5 shadow-lg shrink-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Title and Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-glow-violet text-white shrink-0">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold tracking-tight text-white leading-tight">
                Code Converter & Equivalence Tester
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                AI Powered
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal leading-tight">
              Convert code between programming languages with automated functional testing.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
