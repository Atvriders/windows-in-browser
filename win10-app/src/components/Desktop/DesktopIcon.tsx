import { useRef } from 'react';
import type { FSNode } from '../../types/filesystem';
import './DesktopIcon.css';

interface Props {
  node: FSNode;
  onOpen: (appId: string, title: string, props?: Record<string, unknown>) => void;
  icon?: string;
}

const fileIcons: Record<string, string> = {
  'text/plain': '📄',
  'text/html': '🌐',
};

export default function DesktopIcon({ node, onOpen, icon }: Props) {
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <button className="desktop-icon" onClick={handleClick} title={node.name}>
      <span className="desktop-icon-img">{displayIcon}</span>
      <span className="desktop-icon-label">{node.name}</span>
    </button>
  );
}
