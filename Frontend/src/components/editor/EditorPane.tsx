import React from 'react';
import Editor, { OnChange, OnMount } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { CollaboratorCursor } from './CollaboratorCursor';

// --- Interface Definitions ---
interface Cursor {
  userId: string;
  userName: string;
  line: number;
  column: number;
  color: string;
}

interface EditorPaneProps {
  code: string;
  language: string;
  cursors: Cursor[];
  onCodeChange: (newCode: string) => void;
  onCursorChange: (cursor: { line: number; column: number }) => void;
  onLanguageChange: (language: string) => void;
}

const supportedLanguages = ['javascript', 'typescript', 'python', 'java', 'html', 'css'];

export const EditorPane = ({ code, language, cursors, onCodeChange, onCursorChange, onLanguageChange }: EditorPaneProps) => {
  const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editorInstance) => {
    editorRef.current = editorInstance;
    editorInstance.onDidChangeCursorPosition((e) => {
      onCursorChange({
        line: e.position.lineNumber,
        column: e.position.column
      });
    });
  };

  const handleEditorChange: OnChange = (value) => {
    onCodeChange(value || "");
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Language Selector Bar */}
      <div className="flex items-center justify-between bg-glass/20 backdrop-blur-md border-b border-glass-border pr-2 flex-shrink-0">
        <div className="flex items-center px-4 py-2 border-r border-glass-border bg-background text-foreground">
          <span className="text-sm">main.{language.slice(0,2)}</span>
        </div>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-transparent text-sm text-foreground border border-input rounded-md px-2 py-1 outline-none"
        >
          {supportedLanguages.map(lang => (
            <option key={lang} value={lang} className="bg-background text-foreground">
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineHeight: 19,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
        {/* Render collaborator cursors */}
        {cursors.map(cursor => (
          <CollaboratorCursor
            key={cursor.userId}
            line={cursor.line}
            column={cursor.column}
            userName={cursor.userName}
            color={cursor.color}
          />
        ))}
      </div>
    </div>
  );
};
