// src/components/editor/CollaborationPanel.tsx

import React from 'react';
import { Users, FileText, Video, MessageCircle } from 'lucide-react';

// ADDED: Define props for the component
interface CollaborationPanelProps {
  users: string[];
}

export const CollaborationPanel = ({ users }: CollaborationPanelProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-glass-border">
        <h3 className="text-sm font-semibold text-foreground flex items-center">
          <Users className="w-4 h-4 mr-2" />
          Collaboration
        </h3>
        <div className="text-xs text-muted-foreground mt-3">
          {/* MODIFIED: Use live data from props */}
          {users.length} online
        </div>
      </div>

      {/* Collaborators List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Team Members
        </h4>
        <div className="space-y-2">
          {/* MODIFIED: Map over the 'users' prop */}
          {users.map((user, index) => (
            <div
              key={index}
              className="flex items-center p-2 rounded-lg"
            >
              <div className="relative mr-3">
                <div
                  className="w-8 h-8 rounded-full text-white text-sm flex items-center justify-center font-medium bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  {user.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background bg-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground truncate">
                  {user}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};