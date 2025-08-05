// src/components/editor/Terminal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Plus, X, Square } from 'lucide-react';

// ADDED: Define props for the component
interface TerminalProps {
  output: { type: string; content: string }[];
  onCommand: (command: string) => void;
}

export const Terminal = ({ output, onCommand }: TerminalProps) => {
  const [input, setInput] = useState('');
  const endOfOutputRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the bottom when output changes
  useEffect(() => {
    endOfOutputRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);
  
  const getOutputColor = (type: string) => {
    switch (type) {
      case 'command': return 'text-primary';
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-cyan-400';
      default: return 'text-muted-foreground';
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      onCommand(input); // Use the prop function to send the command
      setInput('');
    }
  };

  return (
    <div className="h-full bg-glass/20 backdrop-blur-md border-t border-glass-border flex flex-col">
      {/* ... (Terminal Header and Tabs are unchanged) ... */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {/* MODIFIED: Use the 'output' prop instead of mock data */}
        {output.map((line, index) => (
          <div key={index} className={`${getOutputColor(line.type)} leading-6`}>
            {line.content}
          </div>
        ))}
        {/* Command Input */}
        <div className="flex items-center text-primary">
          <span className="mr-2">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground"
            placeholder="Type a command..."
            onKeyDown={handleKeyDown}
          />
        </div>
        {/* This div helps with auto-scrolling */}
        <div ref={endOfOutputRef} />
      </div>
    </div>
  );
};