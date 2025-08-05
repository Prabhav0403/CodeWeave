import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ChevronDown, ChevronRight, File, Folder, FolderOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { Socket } from 'socket.io-client';
import { toast } from "sonner";

const ItemTypes = { NODE: 'node' };

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  isOpen?: boolean;
}

interface FileExplorerProps {
  onFileSelect: (filePath: string) => void;
  activeFile: string | null;
  socket: Socket;
}

const NodeComponent = ({ node, depth, onFileSelect, activeFile, handleContextMenu, moveNode, toggleFolder }: any) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.NODE,
    item: { path: node.path },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.NODE,
    drop: (item: { path: string }) => {
      if (node.type === 'folder' && item.path !== node.path && !node.path.startsWith(item.path + '/')) {
        moveNode(item.path, node.path);
      }
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const isActive = activeFile === node.path;

  return (
    <div ref={(nodeRef) => drag(drop(nodeRef))} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div
        className={`flex items-center py-1 px-2 hover:bg-accent/20 cursor-pointer ${isActive ? 'bg-primary/20 text-primary' : ''} ${isOver && node.type === 'folder' ? 'bg-blue-500/20' : ''}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => node.type === 'file' ? onFileSelect(node.path) : toggleFolder(node.path)}
        onContextMenu={(e) => handleContextMenu(e, node.path)}
      >
        {node.type === 'folder' && (
          <span className="mr-1">{node.isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
        )}
        <span className="mr-2">{node.type === 'folder' ? (node.isOpen ? <FolderOpen size={16} /> : <Folder size={16} />) : <File size={16} />}</span>
        <span className="text-sm truncate">{node.name}</span>
      </div>
      {node.isOpen && node.children && (
        <div>
          {node.children.map(child => (
            <NodeComponent key={child.path} node={child} depth={depth + 1} {...{ onFileSelect, activeFile, handleContextMenu, moveNode, toggleFolder }} />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer = ({ onFileSelect, activeFile, socket }: FileExplorerProps) => {
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, path: string | null } | null>(null);

  useEffect(() => {
    if (!socket) return;
    socket.on('updateFiles', (newFiles: FileNode[]) => setFileStructure(newFiles));
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => {
      socket.off('updateFiles');
      window.removeEventListener('click', handleClickOutside);
    };
  }, [socket]);

  const updateAndEmitFiles = (newFiles: FileNode[]) => {
    setFileStructure(newFiles);
    socket.emit('filesChange', newFiles);
  };

  const recursiveMap = (nodes: FileNode[], logic: (node: FileNode) => FileNode | null): FileNode[] => {
    return nodes.reduce((acc, node) => {
      const updatedNode = logic(node);
      if (updatedNode) {
        if (updatedNode.children) {
          updatedNode.children = recursiveMap(updatedNode.children, logic);
        }
        acc.push(updatedNode);
      }
      return acc;
    }, [] as FileNode[]);
  };

  const handleCreate = (type: 'file' | 'folder', parentPath: string | null) => {
    const name = prompt(`Enter new ${type} name:`);
    if (!name || !name.trim()) return setContextMenu(null);

    const newPath = parentPath ? `${parentPath}/${name}` : name;
    const newNode: FileNode = { name, type, path: newPath, isOpen: type === 'folder' ? false : undefined };
    if (type === 'folder') newNode.children = [];

    if (parentPath === null) {
      updateAndEmitFiles([...fileStructure, newNode]);
    } else {
      const newTree = recursiveMap(fileStructure, node => {
        if (node.path === parentPath && node.type === 'folder') {
          if (node.children?.some(child => child.name === name)) {
            toast.error(`A ${type} with this name already exists in this folder.`);
            return node;
          }
          return { ...node, children: [...(node.children || []), newNode], isOpen: true };
        }
        return node;
      });
      updateAndEmitFiles(newTree);
    }
    setContextMenu(null);
  };

  const handleDelete = (path: string) => {
    if (window.confirm(`Are you sure you want to delete ${path}?`)) {
      const newFiles = recursiveMap(fileStructure, node => node.path === path ? null : node);
      updateAndEmitFiles(newFiles);
      socket.emit('deleteFile', path);
    }
    setContextMenu(null);
  };

  const handleRename = (oldPath: string) => {
    const oldName = oldPath.split('/').pop();
    const newName = prompt(`Enter new name for ${oldName}:`, oldName);
    if (newName && newName.trim()) {
      const newPath = oldPath.substring(0, oldPath.lastIndexOf('/') + 1) + newName;
      const newFiles = recursiveMap(fileStructure, node => {
        if (node.path === oldPath) {
          return { ...node, name: newName, path: newPath };
        }
        return node;
      });
      updateAndEmitFiles(newFiles);
      socket.emit('renameFile', { oldPath, newPath });
    }
    setContextMenu(null);
  };
  
  const toggleFolder = (path: string) => {
      const newFiles = recursiveMap(fileStructure, node => node.path === path ? {...node, isOpen: !node.isOpen} : node);
      setFileStructure(newFiles);
  };

  const moveNode = (draggedPath: string, dropTargetPath: string) => {
    let draggedNode: FileNode | null = null;
    
    const treeWithoutDragged = recursiveMap(JSON.parse(JSON.stringify(fileStructure)), node => {
        if (node.path === draggedPath) {
            draggedNode = node;
            return null;
        }
        return node;
    });

    if (!draggedNode) return;

    const updatePaths = (node: FileNode, parentPath: string): FileNode => {
        const newPath = `${parentPath}/${node.name}`;
        const updatedNode = { ...node, path: newPath };
        if (updatedNode.children) {
            updatedNode.children = updatedNode.children.map(child => updatePaths(child, newPath));
        }
        return updatedNode;
    };

    const newTree = recursiveMap(treeWithoutDragged, node => {
        if (node.path === dropTargetPath && node.type === 'folder') {
            const newDraggedNode = updatePaths(draggedNode!, node.path);
            return { ...node, children: [...(node.children || []), newDraggedNode], isOpen: true };
        }
        return node;
    });

    updateAndEmitFiles(newTree);
  };

  const handleContextMenu = (e: React.MouseEvent, path: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.pageX, y: e.pageY, path });
  };
  
  const renderFileNode = (node: FileNode, depth: number = 0) => (
    <NodeComponent key={node.path} {...{ node, depth, onFileSelect, activeFile, handleContextMenu, moveNode, toggleFolder }} />
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col" onContextMenu={(e) => handleContextMenu(e, null)}>
        <div className="p-4 border-b border-glass-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Explorer</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {fileStructure.length === 0 && <p className="p-4 text-sm text-muted-foreground">Right-click to create a file.</p>}
          {fileStructure.map(node => renderFileNode(node))}
        </div>

        {contextMenu && (
          <div
            className="absolute bg-background border border-glass-border rounded-md shadow-lg py-2 z-20"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <div onClick={() => handleCreate('file', contextMenu.path)} className="px-4 py-1 text-sm hover:bg-accent/20 cursor-pointer flex items-center"><Plus size={14} className="mr-2" />New File</div>
            <div onClick={() => handleCreate('folder', contextMenu.path)} className="px-4 py-1 text-sm hover:bg-accent/20 cursor-pointer flex items-center"><FolderOpen size={14} className="mr-2" />New Folder</div>
            {contextMenu.path && (
              <>
                <div className="border-t border-glass-border my-1" />
                <div onClick={() => handleRename(contextMenu.path!)} className="px-4 py-1 text-sm hover:bg-accent/20 cursor-pointer flex items-center"><Edit size={14} className="mr-2" />Rename</div>
                <div onClick={() => handleDelete(contextMenu.path!)} className="px-4 py-1 text-sm hover:bg-accent/20 text-red-500 cursor-pointer flex items-center"><Trash2 size={14} className="mr-2" />Delete</div>
              </>
            )}
          </div>
        )}
      </div>
    </DndProvider>
  );
};
