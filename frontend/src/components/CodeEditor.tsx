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
      case 'pl':
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

  const handleEditorMount: OnMount = (_editor, monaco) => {
    monacoInstanceRef.current = monaco;

    // Define Dark Theme
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'string', foreground: '86efac' },
        { token: 'number', foreground: 'f472b6' },
      ],
      colors: {
        'editor.background': '#070a12',
        'editor.foreground': '#e2e8f0',
        'editorCursor.foreground': '#a855f7',
        'editor.lineHighlightBackground': '#0f172a50',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#c084fc',
        'editorIndentGuide.background': '#1e293b',
        'editorIndentGuide.activeBackground': '#334155',
      },
    });

    // Define Light Theme
    monaco.editor.defineTheme('custom-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '7c3aed', fontStyle: 'bold' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: 'db2777' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#0f172a',
        'editorCursor.foreground': '#7c3aed',
        'editor.lineHighlightBackground': '#f8fafc',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#7c3aed',
        'editorIndentGuide.background': '#f1f5f9',
        'editorIndentGuide.activeBackground': '#e2e8f0',
      },
    });

    monaco.editor.setTheme(isDark ? 'custom-dark' : 'custom-light');
  };

  useEffect(() => {
    if (monacoInstanceRef.current) {
      monacoInstanceRef.current.editor.setTheme(isDark ? 'custom-dark' : 'custom-light');
    }
  }, [isDark]);

  return (
    <div className={`relative w-full h-full min-h-[280px] flex-1 overflow-hidden rounded-xl border shadow-inner group transition-colors ${
      isDark
        ? 'border-slate-800 bg-navy-950 focus-within:border-violet-500/50'
        : 'border-slate-200 bg-white focus-within:border-violet-400'
    }`}>
      {/* Empty placeholder banner */}
      {!value && placeholder && (
        <div className={`pointer-events-none absolute top-3.5 left-14 z-10 text-xs font-mono select-none ${
          isDark ? 'text-slate-500/70' : 'text-slate-400'
        }`}>
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
