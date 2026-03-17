import { useState } from 'react';
import { useFileSystemStore } from '../../store/useFileSystemStore';
import './FilePicker.css';

interface Props {
  title?: string;
  /** mime types like 'text/plain' or extensions like '.txt' */
  accept?: string[];
  onSelect: (nodeId: string, name: string) => void;
  onClose: () => void;
}

export default function FilePicker({ title = 'Open', accept, onSelect, onClose }: Props) {
  const { fs } = useFileSystemStore();
  const [search, setSearch] = useState('');

  const files = Object.values(fs.nodes).filter(n => {
    if (n.type !== 'file') return false;
    const mime = (n as any).mimeType ?? '';
    if (accept?.length) {
      const ok = accept.some(a =>
        a.startsWith('.') ? n.name.toLowerCase().endsWith(a.toLowerCase()) : mime === a
      );
      if (!ok) return false;
    }
    if (search) return n.name.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const getPath = (nodeId: string): string => {
    const parts: string[] = [];
    let id: string | null = nodeId;
    while (id && id !== 'root') {
      const node: { name: string; parentId: string | null } | undefined = fs.nodes[id];
      if (!node) break;
      parts.unshift(node.name);
      id = node.parentId;
    }
    parts.pop(); // remove filename itself
    return parts.join('\\') || 'C:\\';
  };

  return (
    <div className="filepicker-overlay" onClick={onClose}>
      <div className="filepicker" onClick={e => e.stopPropagation()}>
        <div className="filepicker-title">
          <span>📂 {title}</span>
          <button className="filepicker-close" onClick={onClose}>✕</button>
        </div>
        <input
          className="filepicker-search"
          placeholder="Search files..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
        <div className="filepicker-list">
          {files.length === 0 && (
            <div className="filepicker-empty">No matching files found</div>
          )}
          {files.map(node => (
            <button
              key={node.id}
              className="filepicker-item"
              onClick={() => onSelect(node.id, node.name)}
            >
              <span className="filepicker-icon">📄</span>
              <div className="filepicker-info">
                <div className="filepicker-name">{node.name}</div>
                <div className="filepicker-path">{getPath(node.id)}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
