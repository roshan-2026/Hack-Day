import React, { useState, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import {
  SupportedLanguage,
  LanguageDetectResult
} from './types';
import {
  detectLanguage,
  convertCode,
  explainCode,
  LANGUAGES
} from './services/api';

export const App: React.FC = () => {
  // Main Code States
  const [sourceCode, setSourceCode] = useState<string>('');
  const [convertedCode, setConvertedCode] = useState<string>('');
  
  // Language States
  const [detection, setDetection] = useState<LanguageDetectResult | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [targetLang, setTargetLang] = useState<SupportedLanguage>('python');
  const [customInstructions, setCustomInstructions] = useState<string>('');

  // Loading States
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);

  // Debounced language detection timer
  const debounceTimerRef = useRef<number | null>(null);

  // Trigger language detection with 400ms debounce
  const triggerLanguageDetection = useCallback((code: string) => {
    if (!code.trim()) {
      setDetection(null);
      setIsDetecting(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsDetecting(true);
    debounceTimerRef.current = window.setTimeout(async () => {
      try {
        const res = await detectLanguage(code);
        setDetection(res);

        // If detected language conflicts with current target language, auto-switch target language
        if (res.detected_language && res.detected_language !== 'unknown') {
          const detected = res.detected_language as SupportedLanguage;
          setTargetLang((prev) => {
            if (prev === detected) {
              const allLangs = Object.keys(LANGUAGES) as SupportedLanguage[];
              return allLangs.find((l) => l !== detected) || 'python';
            }
            return prev;
          });
        }
      } catch (e) {
        console.error('Language detection error:', e);
      } finally {
        setIsDetecting(false);
      }
    }, 400);
  }, []);

  const handleSourceCodeChange = (newCode: string) => {
    setSourceCode(newCode);
    triggerLanguageDetection(newCode);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSourceCode(text);
        triggerLanguageDetection(text);
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const handleManualSourceLangChange = (lang: SupportedLanguage) => {
    setDetection({
      detected_language: lang,
      confidence: 1.0,
      status: 'detected',
      explanation: 'Specified manually by user',
    });
    if (targetLang === lang) {
      const allLangs = Object.keys(LANGUAGES) as SupportedLanguage[];
      setTargetLang(allLangs.find((l) => l !== lang) || 'python');
    }
  };

  // Convert Code Action
  const handleConvert = async () => {
    if (!sourceCode.trim() || isConverting) return;

    setIsConverting(true);
    const srcLang = detection?.detected_language !== 'unknown' ? detection?.detected_language : undefined;

    try {
      const res = await convertCode({
        sourceCode,
        sourceLanguage: srcLang,
        targetLanguage: targetLang,
        customInstructions: customInstructions.trim() || undefined,
      });

      setConvertedCode(res.converted_code);
    } catch (error: any) {
      console.error('Conversion failed:', error);
      alert(`Conversion Error: ${error.message || 'Failed to convert code'}`);
    } finally {
      setIsConverting(false);
    }
  };

  // Explain Code Action (Adds inline comments)
  const handleExplain = async () => {
    if (!convertedCode.trim() || isExplaining) return;

    setIsExplaining(true);
    try {
      const res = await explainCode({
        sourceCode: convertedCode,
        language: targetLang,
      });
      setConvertedCode(res.explained_code);
    } catch (error: any) {
      console.error('Explain error:', error);
      alert(`Explain Error: ${error.message || 'Failed to explain code'}`);
    } finally {
      setIsExplaining(false);
    }
  };

  // Download Code Action
  const handleDownload = () => {
    if (!convertedCode) return;
    const filename = LANGUAGES[targetLang]?.defaultFilename || `main.${targetLang}`;
    const blob = new Blob([convertedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans selection:bg-violet-600/30 selection:text-violet-200 overflow-y-auto">
      {/* Top Navbar */}
      <Header />

      {/* Main Dual-Panel Code Workspace */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-3 lg:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch lg:min-h-[calc(100vh-4.75rem)] pb-4 lg:pb-2">
          {/* Left Panel: Input Code */}
          <InputPanel
            sourceCode={sourceCode}
            onCodeChange={handleSourceCodeChange}
            detection={detection}
            isDetecting={isDetecting}
            selectedTargetLang={targetLang}
            onSelectTargetLang={setTargetLang}
            onManualSourceLangChange={handleManualSourceLangChange}
            customInstructions={customInstructions}
            onInstructionsChange={setCustomInstructions}
            onConvert={handleConvert}
            isConverting={isConverting}
            onPasteClipboard={handlePasteClipboard}
          />

          {/* Right Panel: Converted Code */}
          <OutputPanel
            convertedCode={convertedCode}
            onCodeChange={setConvertedCode}
            targetLanguage={targetLang}
            onExplain={handleExplain}
            isExplaining={isExplaining}
            onDownload={handleDownload}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
