import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language: string;
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
  isDark?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  placeholder,
  readOnly = false,
  height = '100%',
  isDark = true,
}) => {
  const monacoInstanceRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Map internal language id to Monaco language id
  const getMonacoLanguage = (lang: string): string => {
    switch (lang.toLowerCase()) {
      case 'c':
        return 'c';
      case 'cpp':
      case 'c++':
        return 'cpp';
      case 'java':
        return 'java';
      case 'python':
      case 'py':
        return 'python';
      case 'javascript':
      case 'js':
        return 'javascript';
      case 'typescript':
      case 'ts':
        return 'typescript';
      case 'csharp':
      case 'cs':
      case 'c#':
        return 'csharp';
      case 'go':
      case 'golang':
        return 'go';
      case 'rust':
      case 'rs':
        return 'rust';
      case 'php':
        return 'php';
      case 'ruby':
      case 'rb':
        return 'ruby';
      case 'kotlin':
      case 'kt':
        return 'kotlin';
      case 'swift':
        return 'swift';
      case 'dart':
        return 'dart';
      case 'r':
        return 'r';
      case 'julia':
      case 'jl':
        return 'julia';
      case 'scala':
        return 'scala';
      case 'perl':
        return 'perl';
      case 'lua':
        return 'lua';
      case 'bash':
      case 'sh':
      case 'shell':
        return 'shell';
      default:
        return 'plaintext';
    }
  };

  const monacoLanguage = getMonacoLanguage(language);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoInstanceRef.current = monaco;

    // Define Dark Theme (Midnight Sapphire #070D1F, #111E3D, #7096D1, #D0E4FE)
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '7096D1', fontStyle: 'italic' },
        { token: 'keyword', foreground: '93C5FD', fontStyle: 'bold' },
        { token: 'string', foreground: '86EFAC' },
        { token: 'number', foreground: 'F472B6' },
      ],
      colors: {
        'editor.background': '#070D1F',
        'editor.foreground': '#D0E4FE',
        'editorCursor.foreground': '#7096D1',
        'editor.lineHighlightBackground': '#0E1A3C',
        'editorLineNumber.foreground': '#3E598A',
        'editorLineNumber.activeForeground': '#7096D1',
        'editorIndentGuide.background': '#13224E',
        'editorIndentGuide.activeBackground': '#1A2D5C',
      },
    });

    // Define Light Theme (#334DAF, #7096D1, #D0E4FE)
    monaco.editor.defineTheme('custom-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '7096D1', fontStyle: 'italic' },
        { token: 'keyword', foreground: '334DAF', fontStyle: 'bold' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: 'DC2626' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#0A1128',
        'editorCursor.foreground': '#334DAF',
        'editor.lineHighlightBackground': '#F0F6FE',
        'editorLineNumber.foreground': '#7096D1',
        'editorLineNumber.activeForeground': '#334DAF',
        'editorIndentGuide.background': '#D0E4FE',
        'editorIndentGuide.activeBackground': '#ADC8F2',
      },
    });

    monaco.editor.setTheme(isDark ? 'custom-dark' : 'custom-light');
  };

  useEffect(() => {
    if (monacoInstanceRef.current) {
      monacoInstanceRef.current.editor.setTheme(isDark ? 'custom-dark' : 'custom-light');
    }
  }, [isDark]);

  // Responsive ResizeObserver to automatically relayout Monaco when container dimensions change
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[140px] flex-1 overflow-hidden rounded-xl border shadow-inner group transition-colors ${
        isDark
          ? 'border-[#1A2D5C] bg-[#070D1F] focus-within:border-[#7096D1]'
          : 'border-[#7096D1]/60 bg-white focus-within:border-[#334DAF]'
      }`}
    >
      {/* Empty placeholder banner */}
      {!value && placeholder && (
        <div
          className={`pointer-events-none absolute top-3.5 left-14 z-10 text-xs font-mono select-none ${
            isDark ? 'text-[#7096D1]/70' : 'text-[#7096D1]'
          }`}
        >
          {placeholder}
        </div>
      )}

      <Editor
        height={height}
        language={monacoLanguage}
        value={value}
        onChange={(val) => onChange?.(val || '')}
        theme={isDark ? 'custom-dark' : 'custom-light'}
        onMount={handleEditorMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          lineNumbersMinChars: 3,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          bracketPairColorization: { enabled: true },
          folding: true,
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 10, bottom: 10 },
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
        }}
      />
    </div>
  );
};
