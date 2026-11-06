import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { LANGUAGES } from '../services/api';

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  excludeLanguage?: string;
  disabled?: boolean;
  isDark?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  excludeLanguage,
  disabled = false,
  isDark: _isDark = true,
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
    <div className="relative w-full sm:w-auto inline-block text-left" ref={containerRef}>
      <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
        <span className="text-xs font-semibold dark:text-[#D0E4FE] text-[#334DAF] shrink-0">Convert To:</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
            disabled
              ? 'opacity-50 cursor-not-allowed dark:bg-[#070D1F]/60 dark:border-[#1A2D5C]/30 dark:text-[#7096D1]/40 bg-[#D0E4FE]/40 border-[#7096D1]/40 text-[#7096D1]/60'
              : 'dark:bg-[#070D1F] dark:border-[#1A2D5C] hover:dark:border-[#7096D1] dark:text-[#D0E4FE] dark:hover:bg-[#070D1F]/90 bg-[#D0E4FE]/40 border-[#7096D1] hover:border-[#334DAF] text-[#334DAF] hover:bg-[#D0E4FE] shadow-md'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full dark:bg-[#7096D1] bg-[#334DAF] shadow-sm"></span>
            <span className="dark:text-white text-[#334DAF]">{LANGUAGES[selectedLanguage]?.name || selectedLanguage}</span>
            <span className="text-[11px] font-mono dark:text-[#7096D1] text-[#334DAF]/70">({LANGUAGES[selectedLanguage]?.extension})</span>
          </span>
          <ChevronDown className={`w-3.5 h-3.5 dark:text-[#7096D1] text-[#334DAF] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-full sm:w-64 max-w-[calc(100vw-2.5rem)] rounded-xl dark:bg-[#070D1F] bg-white border dark:border-[#1A2D5C] border-[#7096D1] shadow-2xl py-2 z-50 backdrop-blur-xl ring-2 dark:ring-black/80 ring-[#7096D1]/30 flex flex-col max-h-80">
          <div className="px-3 pb-2 border-b dark:border-[#1A2D5C] border-[#7096D1]/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider dark:text-[#7096D1] text-[#334DAF]/80 font-mono">
                Select Target ({filteredLanguages.length} of {availableLanguages.length})
              </span>
            </div>
            {/* Search filter input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 dark:text-[#7096D1] text-[#7096D1]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search (e.g. rust, go, ts)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full dark:bg-[#111E3D] bg-[#D0E4FE]/30 border dark:border-[#1A2D5C] border-[#7096D1] focus:border-[#334DAF] rounded-lg pl-8 pr-2.5 py-1 text-xs dark:text-white text-[#0A1128] dark:placeholder-[#7096D1]/60 placeholder-[#7096D1] focus:outline-none"
              />
            </div>
          </div>

          <div className="py-1 overflow-y-auto max-h-56 divide-y dark:divide-[#1A2D5C]/40 divide-[#7096D1]/20">
            {filteredLanguages.length === 0 ? (
              <div className="px-3.5 py-4 text-center text-xs dark:text-[#7096D1] text-[#7096D1] font-mono">
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
                        ? 'dark:bg-[#1A2D5C] bg-[#D0E4FE] dark:text-white text-[#334DAF] font-bold'
                        : 'dark:text-[#D0E4FE] text-[#0A1128] dark:hover:bg-[#111E3D] hover:bg-[#D0E4FE]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] dark:text-[#7096D1] text-white dark:bg-[#111E3D] bg-[#334DAF] px-1.5 py-0.5 rounded border dark:border-[#1A2D5C] border-transparent min-w-[36px] text-center">
                        {LANGUAGES[lang].extension}
                      </span>
                      <span>{LANGUAGES[lang].name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 dark:text-[#7096D1] text-[#334DAF]" />}
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
