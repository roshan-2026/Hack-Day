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
    <div className="relative inline-block text-left" ref={containerRef}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold dark:text-[#E3EED4] text-[#0F2A1D]">Convert To:</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
            disabled
              ? 'opacity-50 cursor-not-allowed dark:bg-[#0F2A1D]/60 dark:border-[#6B9071]/30 dark:text-[#AEC3B0]/40 bg-[#E3EED4]/60 border-[#6B9071]/40 text-[#6B9071]/50'
              : 'dark:bg-[#0F2A1D] dark:border-[#6B9071]/60 hover:dark:border-[#6B9071] dark:text-[#E3EED4] dark:hover:bg-[#0F2A1D]/90 bg-[#E3EED4] border-[#6B9071] hover:border-[#0F2A1D] text-[#0F2A1D] hover:bg-white shadow-md'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full dark:bg-[#6B9071] bg-[#0F2A1D] shadow-sm"></span>
            <span className="dark:text-white text-[#0F2A1D]">{LANGUAGES[selectedLanguage]?.name || selectedLanguage}</span>
            <span className="text-[11px] font-mono dark:text-[#AEC3B0] text-[#375534]">({LANGUAGES[selectedLanguage]?.extension})</span>
          </span>
          <ChevronDown className={`w-3.5 h-3.5 dark:text-[#AEC3B0] text-[#0F2A1D] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-64 rounded-xl dark:bg-[#0F2A1D] bg-[#E3EED4] border dark:border-[#6B9071]/70 border-[#6B9071] shadow-2xl py-2 z-50 backdrop-blur-xl ring-2 dark:ring-black/80 ring-[#6B9071]/40 flex flex-col max-h-80">
          <div className="px-3 pb-2 border-b dark:border-[#6B9071]/30 border-[#6B9071]/50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider dark:text-[#AEC3B0] text-[#375534]">
                Select Target ({filteredLanguages.length} of {availableLanguages.length})
              </span>
            </div>
            {/* Search filter input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 dark:text-[#AEC3B0] text-[#375534]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search (e.g. rust, go, ts)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full dark:bg-[#375534] bg-white border dark:border-[#6B9071]/50 border-[#6B9071] focus:border-[#0F2A1D] rounded-lg pl-8 pr-2.5 py-1 text-xs dark:text-white text-[#0F2A1D] dark:placeholder-[#AEC3B0]/60 placeholder-[#375534]/60 focus:outline-none"
              />
            </div>
          </div>

          <div className="py-1 overflow-y-auto max-h-56 divide-y dark:divide-[#6B9071]/20 divide-[#6B9071]/30">
            {filteredLanguages.length === 0 ? (
              <div className="px-3.5 py-4 text-center text-xs dark:text-[#AEC3B0] text-[#375534] font-mono">
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
                        ? 'dark:bg-[#375534] bg-[#AEC3B0] dark:text-white text-[#0F2A1D] font-bold'
                        : 'dark:text-[#E3EED4] text-[#0F2A1D] dark:hover:bg-[#1a402e] hover:bg-[#AEC3B0]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] dark:text-[#AEC3B0] text-white dark:bg-[#375534] bg-[#6B9071] px-1.5 py-0.5 rounded border dark:border-[#6B9071]/40 border-transparent min-w-[36px] text-center">
                        {LANGUAGES[lang].extension}
                      </span>
                      <span>{LANGUAGES[lang].name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 dark:text-[#6B9071] text-[#0F2A1D]" />}
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
