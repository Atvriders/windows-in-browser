import { useRef, useEffect } from 'react';
import type { FSNode } from '../../types/filesystem';
import './DesktopIcon.css';

interface Props {
  node: FSNode;
  onOpen: (appId: string, title: string, props?: Record<string, unknown>) => void;
  icon?: string;
  onContextMenu?: (e: React.MouseEvent, node: FSNode, icon?: string) => void;
  isSelected?: boolean;
  isDragging?: boolean;
  style?: React.CSSProperties;
  onIconMouseDown?: (e: React.MouseEvent) => void;
}

const fileIcons: Record<string, string> = {
  'text/plain': '📄',
  'text/html': '🌐',
};

export default function DesktopIcon({ node, onOpen, icon, onContextMenu, isSelected, isDragging, style, onIconMouseDown }: Props) {
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (clickTimer.current) clearTimeout(clickTimer.current); };
  }, []);

  const displayIcon = icon ?? (node.type === 'directory' ? '📁' : fileIcons[(node as any).mimeType] ?? '📄');

  const handleClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      if (clickCount.current >= 2) {
        if (node.type === 'directory') {
          onOpen('fileExplorer', node.name, { path: node.id });
        } else {
          onOpen('notepad', node.name, { fileId: node.id });
        }
      }
      clickCount.current = 0;
    }, 300);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu?.(e, node, displayIcon);
  };

  return (
    <button
      className={`desktop-icon${isSelected ? ' selected' : ''}${isDragging ? ' dragging' : ''}`}
      data-icon-id={node.id}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseDown={onIconMouseDown}
      title={node.name}
      style={style}
    >
      <span className="desktop-icon-img">{displayIcon}</span>
      <span className="desktop-icon-label">{node.name}</span>
    </button>
  );
}
