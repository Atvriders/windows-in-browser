import React from 'react';
import { useWindowStore } from '../../store/useWindowStore';
import type { WindowInstance } from '../../types/window';
import './TitleBar.css';

interface Props {
  win: WindowInstance;
  onDragMouseDown?: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
}

const appIcons: Record<string, string> = {
  fileExplorer: '📁',
  browser: '🌐',
  notepad: '📝',
  settings: '⚙️',
};

export default function TitleBar({ win, onDragMouseDown, onDoubleClick }: Props) {
  const { closeWindow, minimizeWindow, toggleMaximize } = useWindowStore();

  return (
    <div className="titlebar" onMouseDown={onDragMouseDown} onDoubleClick={onDoubleClick}>
      <span className="titlebar-icon">{appIcons[win.appId]}</span>
      <span className="titlebar-title">{win.title}</span>
      <div className="titlebar-controls">
        <button className="tb-btn tb-minimize" onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }} title="Minimize">─</button>
        <button className="tb-btn tb-maximize" onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id); }} title={win.isMaximized ? 'Restore' : 'Maximize'}>
          {win.isMaximized ? '❐' : '□'}
        </button>
        <button className="tb-btn tb-close" onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} title="Close">✕</button>
      </div>
    </div>
  );
}
