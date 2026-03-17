import React, { useState } from 'react';
import { useWindowStore } from '../../store/useWindowStore';
import ContextMenu from '../ContextMenu/ContextMenu';
import type { WindowInstance } from '../../types/window';
import './TitleBar.css';

interface Props {
  win: WindowInstance;
  onDragMouseDown?: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
}

const appIcons: Record<string, string> = {
  fileExplorer: '📁', browser: '🌐', notepad: '📝', taskManager: '📊',
  word: '📘', excel: '📗', powerPoint: '📙', outlook: '📧', oneNote: '🗒',
  photoshop: '🖼', illustrator: '✒', premiere: '🎬', afterEffects: '✨',
  autoCAD: '📐', solidWorks: '⚙', steam: '🎮',
  calculator: '🧮', settings: '⚙️', paint: '🎨', spotify: '🎵', discord: '💬',
  vlc: '🎬', windowsStore: '🛒', snippingTool: '✂️', calendar: '📅', maps: '🗺️',
};

export default function TitleBar({ win, onDragMouseDown, onDoubleClick }: Props) {
  const { closeWindow, minimizeWindow, toggleMaximize, restoreWindow } = useWindowStore();
  const [ctxPos, setCtxPos] = useState<{ x: number; y: number } | null>(null);

  const menuItems = [
    { label: 'Restore', onClick: () => restoreWindow(win.id), disabled: !win.isMaximized && !win.isMinimized },
    { label: 'Move', onClick: () => {}, disabled: true },
    { label: 'Size', onClick: () => {}, disabled: true },
    { label: 'Minimize', onClick: () => minimizeWindow(win.id), disabled: win.isMinimized },
    { label: 'Maximize', onClick: () => toggleMaximize(win.id), disabled: win.isMaximized },
    'separator' as const,
    { label: 'Close', onClick: () => closeWindow(win.id) },
  ];

  return (
    <div
      className="titlebar"
      onMouseDown={onDragMouseDown}
      onDoubleClick={onDoubleClick}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setCtxPos({ x: e.clientX, y: e.clientY }); }}
    >
      <span className="titlebar-icon">{appIcons[win.appId]}</span>
      <span className="titlebar-title">{win.title}</span>
      <div className="titlebar-controls">
        <button className="tb-btn tb-minimize" onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }} title="Minimize">─</button>
        <button className="tb-btn tb-maximize" onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id); }} title={win.isMaximized ? 'Restore' : 'Maximize'}>
          {win.isMaximized ? '❐' : '□'}
        </button>
        <button className="tb-btn tb-close" onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} title="Close">✕</button>
      </div>
      {ctxPos && (
        <ContextMenu x={ctxPos.x} y={ctxPos.y} items={menuItems} onClose={() => setCtxPos(null)} />
      )}
    </div>
  );
}
