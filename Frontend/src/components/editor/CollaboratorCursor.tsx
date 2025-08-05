import React from 'react';

interface CollaboratorCursorProps {
  line: number;
  column: number;
  userName: string;
  color: string;
}

export const CollaboratorCursor = ({ line, column, userName, color }: CollaboratorCursorProps) => {
  // These values are estimates for Monaco's default font settings.
  // You may need to adjust them for perfect alignment.
  const top = (line - 1) * 19; // Based on a line height of 19px
  const left = (column - 1) * 8.4 + 60; // Based on a char width of 8.4px and editor padding

  return (
    <div
      className="absolute pointer-events-none"
      style={{ top, left, zIndex: 10 }}
    >
      <div
        className="w-0.5 h-5"
        style={{ backgroundColor: color }}
      />
      <div
        className="absolute -top-6 -left-1 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {userName}
      </div>
    </div>
  );
};