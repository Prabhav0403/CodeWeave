import React, { useState, useRef, useEffect } from 'react';
import { Search, File, Folder, Command, GitBranch, Terminal, Settings } from 'lucide-react';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  shortcut?: string;
}

const mockCommands: Command[] = [
  {
    id: '1',
    title: 'Open File',
    description: 'Quickly open any file in the workspace',
    icon: <File className="w-4 h-4" />,
    category: 'File',
    shortcut: '⌘P'
  },
  {
    id: '2',
    title: 'New Terminal',
    description: 'Open a new terminal instance',
    icon: <Terminal className="w-4 h-4" />,
    category: 'Terminal',
    shortcut: '⌘⇧`'
  },
  {
    id: '3',
    title: 'Git: Clone Repository',
    description: 'Clone a repository from URL',
    icon: <GitBranch className="w-4 h-4" />,
    category: 'Git'
  },
  {
    id: '4',
    title: 'Search in Files',
    description: 'Search for text across all files',
    icon: <Search className="w-4 h-4" />,
    category: 'Search',
    shortcut: '⌘⇧F'
  },
  {
    id: '5',
    title: 'Preferences: Settings',
    description: 'Open user and workspace settings',
    icon: <Settings className="w-4 h-4" />,
    category: 'Preferences',
    shortcut: '⌘,'
  },
  {
    id: '6',
    title: 'Create New Folder',
    description: 'Create a new folder in the workspace',
    icon: <Folder className="w-4 h-4" />,
    category: 'File'
  }
];

interface CommandPaletteProps {
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = mockCommands.filter(command =>
    command.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        // Execute selected command
        console.log('Executing:', filteredCommands[selectedIndex].title);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, filteredCommands, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 z-50 animate-fade-in">
      <div className="w-full max-w-2xl mx-4">
        <div className="bg-glass/90 backdrop-blur-xl border border-glass-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-glass-border">
            <Search className="w-5 h-5 text-muted-foreground mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-lg"
            />
          </div>

          {/* Command List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length > 0 ? (
              <div className="py-2">
                {filteredCommands.map((command, index) => (
                  <div
                    key={command.id}
                    className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                      index === selectedIndex
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-accent/10 text-foreground'
                    }`}
                    onClick={() => {
                      console.log('Executing:', command.title);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="mr-3">{command.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{command.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {command.description}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs bg-accent/20 px-2 py-1 rounded">
                        {command.category}
                      </span>
                      {command.shortcut && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {command.shortcut}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Command className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No commands found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-glass/50 border-t border-glass-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
                <span>esc to cancel</span>
              </div>
              <div>
                {filteredCommands.length} commands
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};