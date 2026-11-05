import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Exclude source language
  const availableLanguages = (Object.keys(LANGUAGES) as SupportedLanguage[]).filter(
    (lang) => lang !== excludeLanguage
  );

  const filteredLanguages = availableLanguages.filter((lang) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const info = LANGUAGES[lang];
    return (
      info.name.toLowerCase().includes(query) ||
      info.extension.toLowerCase().includes(query) ||
      lang.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

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
        <div className="absolute left-0 bottom-full mb-2 w-64 rounded-xl bg-navy-900 border border-violet-500/50 shadow-2xl py-2 z-50 backdrop-blur-xl ring-2 ring-black/80 flex flex-col max-h-80">
          <div className="px-3 pb-2 border-b border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Select Target ({filteredLanguages.length} of {availableLanguages.length})
              </span>
            </div>
            {/* Search filter input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search (e.g. rust, go, ts)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700/80 focus:border-violet-500 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="py-1 overflow-y-auto max-h-56 divide-y divide-slate-800/40">
            {filteredLanguages.length === 0 ? (
              <div className="px-3.5 py-4 text-center text-xs text-slate-500 font-mono">
                No matching language
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = selectedLanguage === lang;
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      onSelectLanguage(lang);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-violet-600/25 text-violet-200 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] text-violet-400 bg-violet-950/40 px-1.5 py-0.5 rounded border border-violet-500/20 min-w-[36px] text-center">
                        {LANGUAGES[lang].extension}
                      </span>
                      <span>{LANGUAGES[lang].name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-violet-400" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
