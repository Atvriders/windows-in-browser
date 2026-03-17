import { useState } from 'react';
import { useWindowStore } from '../../store/useWindowStore';
import ContextMenu from '../ContextMenu/ContextMenu';
import type { WindowInstance } from '../../types/window';
import './TaskbarItem.css';

const appIcons: Record<string, string> = {
  fileExplorer: '📁', browser: '🌐', notepad: '📝', settings: '⚙️',
};

interface Props { win: WindowInstance; }

export default function TaskbarItem({ win }: Props) {
  const { restoreWindow, minimizeWindow, focusWindow, closeWindow, toggleMaximize, windows } = useWindowStore();
  const isFocused = windows[windows.length - 1]?.id === win.id && !win.isMinimized;
  const [ctxPos, setCtxPos] = useState<{ x: number; y: number } | null>(null);

  const handleClick = () => {
    if (win.isMinimized) { restoreWindow(win.id); focusWindow(win.id); }
    else if (isFocused) { minimizeWindow(win.id); }
    else { focusWindow(win.id); }
  };

  const menuItems = [
    win.isMinimized
      ? { label: 'Restore', onClick: () => { restoreWindow(win.id); focusWindow(win.id); } }
      : { label: 'Minimize', onClick: () => minimizeWindow(win.id) },
    win.isMaximized
      ? { label: 'Restore down', onClick: () => toggleMaximize(win.id) }
      : { label: 'Maximize', onClick: () => toggleMaximize(win.id) },
    'separator' as const,
    { label: 'Close window', onClick: () => closeWindow(win.id) },
  ];

  return (
    <>
      <button
        className={`taskbar-item ${isFocused ? 'active' : ''} ${win.isMinimized ? 'minimized' : ''}`}
        onClick={handleClick}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setCtxPos({ x: e.clientX, y: e.clientY }); }}
        title={win.title}
      >
        <span>{appIcons[win.appId]}</span>
        <span className="taskbar-item-title">{win.title}</span>
      </button>
      {ctxPos && (
        <ContextMenu x={ctxPos.x} y={ctxPos.y} items={menuItems} onClose={() => setCtxPos(null)} />
      )}
    </>
  );
}
