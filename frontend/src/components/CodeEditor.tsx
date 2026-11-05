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

    // Define Dark Theme with palette #0F2A1D, #375534, #6B9071
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B9071', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'AEC3B0', fontStyle: 'bold' },
        { token: 'string', foreground: 'FDE68A' },
        { token: 'number', foreground: 'F472B6' },
      ],
      colors: {
        'editor.background': '#0F2A1D',
        'editor.foreground': '#E3EED4',
        'editorCursor.foreground': '#AEC3B0',
        'editor.lineHighlightBackground': '#183a2b',
        'editorLineNumber.foreground': '#4f7256',
        'editorLineNumber.activeForeground': '#AEC3B0',
        'editorIndentGuide.background': '#1d4533',
        'editorIndentGuide.activeBackground': '#375534',
      },
    });

    // Define Light Theme with textarea background #6B9071 and palette #AEC3B0, #E3EED4
    monaco.editor.defineTheme('custom-light', {
      base: 'vs-dark', // using vs-dark base ensures high-contrast light tokens on #6B9071
      inherit: true,
      rules: [
        { token: 'comment', foreground: 'D6E3D8', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'FEF08A', fontStyle: 'bold' },
        { token: 'string', foreground: 'FFFFFF' },
        { token: 'number', foreground: 'FED7AA' },
      ],
      colors: {
        'editor.background': '#6B9071',
        'editor.foreground': '#FFFFFF',
        'editorCursor.foreground': '#FFFFFF',
        'editor.lineHighlightBackground': '#5f8265',
        'editorLineNumber.foreground': '#D6E3D8',
        'editorLineNumber.activeForeground': '#FFFFFF',
        'editorIndentGuide.background': '#5f8265',
        'editorIndentGuide.activeBackground': '#4d6f53',
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
        ? 'border-[#6B9071]/40 bg-[#0F2A1D] focus-within:border-[#6B9071]'
        : 'border-[#375534]/50 bg-[#6B9071] focus-within:border-[#0F2A1D]'
    }`}>
      {/* Empty placeholder banner */}
      {!value && placeholder && (
        <div className={`pointer-events-none absolute top-3.5 left-14 z-10 text-xs font-mono select-none ${
          isDark ? 'text-[#6B9071]' : 'text-[#E3EED4]/90'
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
