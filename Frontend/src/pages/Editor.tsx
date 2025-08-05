import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { toast } from "sonner";
import { Copy, Play } from 'lucide-react';

import { EditorPane } from '@/components/editor/EditorPane';
import { Terminal } from '@/components/editor/Terminal';
import { CollaborationPanel } from '@/components/editor/CollaborationPanel';
import { FileExplorer } from '@/components/editor/FileExplorer';

interface TerminalLine { type: 'command' | 'output' | 'error'; content: string; }
interface CursorData { userId: string; userName: string; line: number; column: number; color: string; filePath: string; }

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const socket: Socket = io(VITE_BACKEND_URL);

const languageMap: { [key: string]: string } = {
  js: 'javascript', ts: 'typescript', html: 'html', css: 'css', py: 'python', java: 'java', json: 'json', md: 'markdown',
};

const Editor = () => {
  const { roomId } = useParams();
  const location = useLocation();

  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<{ [key: string]: string }>({});
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [language, setLanguage] = useState<string>('plaintext');
  const [terminalOutputs, setTerminalOutputs] = useState<{ [key: string]: TerminalLine[] }>({});
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [cursors, setCursors] = useState<CursorData[]>([]);
  const [activePanel, setActivePanel] = useState<'files' | 'collaboration'>('files');
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    const joinRoom = () => {
      if (roomId) {
        const username = location.state?.username || `User-${Math.floor(Math.random() * 1000)}`;
        socket.emit('joinRoom', roomId, username);
      }
    };
    
    joinRoom();
    socket.on('connect', () => { setIsConnected(true); joinRoom(); });
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('codeUpdate', ({ filePath, newCode }) => {
      setOpenFiles(prev => ({ ...prev, [filePath]: newCode }));
    });
    socket.on('terminalUpdate', (data: { filePath: string } & TerminalLine) => {
      const { filePath, ...lineData } = data;
      setTerminalOutputs(prev => ({
        ...prev,
        [filePath]: [...(prev[filePath] || []), lineData],
      }));
    });
    socket.on('updateUserList', (users: string[]) => setCollaborators(users));
    
    socket.on('updateCursors', (data: CursorData) => {
      setCursors(prevCursors => {
        const cursorsMap = new Map(prevCursors.map(c => [c.userId, c]));
        cursorsMap.set(data.userId, data);
        return Array.from(cursorsMap.values());
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('codeUpdate');
      socket.off('terminalUpdate');
      socket.off('updateUserList');
      socket.off('updateCursors');
    };
  }, [roomId, location.state]);

  const handleFileSelect = (filePath: string) => {
    if (!openTabs.includes(filePath)) {
      setOpenTabs(prev => [...prev, filePath]);
    }
    setActiveFile(filePath);
    const extension = filePath.split('.').pop() || '';
    setLanguage(languageMap[extension] || 'plaintext');
    if (openFiles[filePath] === undefined) {
      socket.emit('getCode', filePath);
    }
  };

  const handleTabSelect = (filePath: string) => {
    setActiveFile(filePath);
    const extension = filePath.split('.').pop() || '';
    setLanguage(languageMap[extension] || 'plaintext');
  };

  const handleTabClose = (filePathToClose: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newTabs = openTabs.filter(p => p !== filePathToClose);
    setOpenTabs(newTabs);

    if (activeFile === filePathToClose) {
      const newActiveFile = newTabs[newTabs.length - 1] || null;
      setActiveFile(newActiveFile);
    }
  };

  const handleFileDelete = (filePath: string) => {
    handleTabClose(filePath, { stopPropagation: () => {} } as React.MouseEvent);
    setOpenFiles(prev => {
      const newOpenFiles = { ...prev };
      delete newOpenFiles[filePath];
      return newOpenFiles;
    });
  };
  
  const handleCodeChange = (newCode: string) => {
    if (activeFile) {
      setOpenFiles(prev => ({ ...prev, [activeFile]: newCode }));
      socket.emit('codeChange', { filePath: activeFile, newCode });
    }
  };
  
  const handleCursorChange = (cursorData: { line: number; column: number }) => {
    if (activeFile) {
      socket.emit('cursorChange', { ...cursorData, filePath: activeFile });
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (activeFile) {
        const newCode = `// Language switched to ${newLanguage}\n`;
        handleCodeChange(newCode);
    }
    if (activeFile) {
        setTerminalOutputs(prev => ({...prev, [activeFile]: []}));
    }
    toast.info(`Switched language to ${newLanguage}`);
  };

  const handleRunCode = () => {
    if (activeFile) {
      const code = openFiles[activeFile];
      const runCommandLog: TerminalLine = { type: 'command', content: '$ run' };
      socket.emit('terminalCommand', { filePath: activeFile, ...runCommandLog });
      socket.emit('runCode', { code, language, filePath: activeFile });
    } else {
      toast.error("Please open a file to run.");
    }
  };
  
  const handleTerminalCommand = (command: string) => {
    if (!activeFile) {
        toast.error("Please open a file to use the terminal.");
        return;
    }
    if (command.trim().toLowerCase() === 'run') {
      handleRunCode();
    } else if (command.trim().toLowerCase() === 'clear') {
      setTerminalOutputs(prev => ({...prev, [activeFile]: []}));
    } else {
       const commandLog: TerminalLine = { type: 'command', content: `$ ${command}` };
       socket.emit('terminalCommand', { filePath: activeFile, ...commandLog });
       const help: TerminalLine = { type: 'output', content: `Unknown command.` };
       socket.emit('terminalCommand', { filePath: activeFile, ...help });
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        toast.success("Invite link copied to clipboard!");
    });
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      <div className="h-12 bg-glass/30 backdrop-blur-md border-b border-glass-border flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">CodeWeave</div>
        <div className="flex items-center space-x-4">
            <button onClick={handleRunCode} className="flex items-center space-x-2 p-2 bg-primary/20 hover:bg-primary/30 rounded-md transition-colors text-primary" title="Run Code">
              <Play className="w-4 h-4" />
              <span className="text-sm hidden md:inline">Run</span>
            </button>
            <button onClick={handleCopyLink} className="flex items-center space-x-2 p-2 hover:bg-accent/20 rounded-md transition-colors text-muted-foreground hover:text-foreground" title="Copy Invite Link">
              <Copy className="w-4 h-4" />
              <span className="text-sm hidden md:inline">Share</span>
            </button>
            <div className={`w-3 h-3 rounded-full transition-colors ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'}></div>
        </div>
      </div>
      
      <div className="flex-1 flex min-h-0">
        <div className="w-80 bg-glass/10 backdrop-blur-md border-r border-glass-border flex flex-col">
          <div className="flex border-b border-glass-border">
            <button onClick={() => setActivePanel('files')} className={`px-4 py-2 text-sm ${activePanel === 'files' ? 'bg-background' : ''}`}>Files</button>
            <button onClick={() => setActivePanel('collaboration')} className={`px-4 py-2 text-sm ${activePanel === 'collaboration' ? 'bg-background' : ''}`}>Team</button>
          </div>
          <div style={{ display: activePanel === 'files' ? 'block' : 'none' }} className="h-full">
            <FileExplorer onFileSelect={handleFileSelect} activeFile={activeFile} socket={socket} onFileDelete={handleFileDelete} />
          </div>
          <div style={{ display: activePanel === 'collaboration' ? 'block' : 'none' }} className="h-full">
            <CollaborationPanel users={collaborators} />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="flex-1 min-h-0">
            {openTabs.length > 0 && activeFile ? (
              <EditorPane
                key={activeFile}
                code={openFiles[activeFile] || ''}
                cursors={cursors.filter(c => c.filePath === activeFile && c.userId !== socket.id)}
                language={language}
                onCodeChange={handleCodeChange}
                onCursorChange={handleCursorChange}
                openTabs={openTabs}
                activeFile={activeFile}
                onTabSelect={handleTabSelect}
                onTabClose={handleTabClose}
                onLanguageChange={handleLanguageChange} // This prop is now correctly passed
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Create a file to begin.</p>
              </div>
            )}
          </div>
          <div className="h-64 border-t border-glass-border flex-shrink-0">
            <Terminal 
              output={terminalOutputs[activeFile || ''] || []} 
              onCommand={handleTerminalCommand} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
