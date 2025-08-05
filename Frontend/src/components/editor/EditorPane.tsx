import React from 'react';
import Editor, { OnChange, OnMount } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { CollaboratorCursor } from './CollaboratorCursor';
import { X } from 'lucide-react';

// --- 1. Define the props the component will receive ---
interface Cursor {
  userId: string;
  userName: string;
  line: number;
  column: number;
  color: string;
}

// MODIFIED: Added all the new props for tab functionality
interface EditorPaneProps {
  code: string;
  language: string;
  cursors: Cursor[];
  openTabs: string[];
  activeFile: string;
  onCodeChange: (newCode: string) => void;
  onCursorChange: (cursor: { line: number; column: number }) => void;
  onTabSelect: (filePath: string) => void;
  onTabClose: (filePath: string, event: React.MouseEvent) => void;
  onLanguageChange: (language: string) => void; // Added back this prop
}

// --- 2. Create the component, accepting the props ---
export const EditorPane = ({ 
  code, 
  language, 
  cursors, 
  openTabs, 
  activeFile, 
  onCodeChange, 
  onCursorChange, 
  onTabSelect, 
  onTabClose,
  onLanguageChange 
}: EditorPaneProps) => {
  const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null);

  const supportedLanguages = ['javascript', 'typescript', 'python', 'java', 'html', 'css'];

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
      {/* --- 3. VS Code-Style Tab Bar --- */}
      <div className="flex items-center justify-between bg-glass/20 backdrop-blur-md border-b border-glass-border pr-2 flex-shrink-0">
        <div className="flex items-center">
          {openTabs.map(tabPath => (
            <div
              key={tabPath}
              onClick={() => onTabSelect(tabPath)}
              className={`flex items-center px-4 py-2 border-r border-glass-border cursor-pointer ${activeFile === tabPath ? 'bg-background text-foreground' : 'bg-transparent text-muted-foreground'}`}
            >
              <span className="text-sm mr-2">{tabPath.split('/').pop()}</span>
              <button
                onClick={(e) => onTabClose(tabPath, e)}
                className="p-1 rounded-full hover:bg-accent/20"
              >
                <X size={12} />
              </button>
            </div>
          ))}
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
