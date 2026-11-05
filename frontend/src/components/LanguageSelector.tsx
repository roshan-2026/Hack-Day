import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { LANGUAGES } from '../services/api';

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  excludeLanguage?: string;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  excludeLanguage,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Exclude source language
  const availableLanguages = (Object.keys(LANGUAGES) as SupportedLanguage[]).filter(
    (lang) => lang !== excludeLanguage
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-300">Convert To:</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
            disabled
              ? 'opacity-50 cursor-not-allowed bg-navy-850 border-slate-800 text-slate-500'
              : 'bg-navy-850 border-violet-500/40 hover:border-violet-500 text-slate-100 hover:bg-navy-800 shadow-md ring-1 ring-violet-500/20'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-sm shadow-violet-500"></span>
            <span className="text-white">{LANGUAGES[selectedLanguage]?.name || selectedLanguage}</span>
            <span className="text-[11px] font-mono text-violet-400">({LANGUAGES[selectedLanguage]?.extension})</span>
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-52 rounded-xl bg-navy-900 border border-violet-500/50 shadow-2xl py-1.5 z-50 backdrop-blur-xl ring-2 ring-black/80">
          <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800/80">
            Select Target Language
          </div>
          <div className="py-1">
            {availableLanguages.map((lang) => {
              const isSelected = selectedLanguage === lang;
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    onSelectLanguage(lang);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-violet-600/25 text-violet-200 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[11px] text-violet-400 bg-violet-950/40 px-1.5 py-0.5 rounded border border-violet-500/20">
                      {LANGUAGES[lang].extension}
                    </span>
                    <span>{LANGUAGES[lang].name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-violet-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
