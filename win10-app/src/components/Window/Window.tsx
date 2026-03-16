import React, { useCallback } from 'react';
import { useWindowStore } from '../../store/useWindowStore';
import { useDrag } from '../../hooks/useDrag';
import { useResize } from '../../hooks/useResize';
import type { WindowInstance } from '../../types/window';
import TitleBar from './TitleBar';
import ResizeHandles from './ResizeHandles';
import FileExplorer from '../../apps/FileExplorer/FileExplorer';
import Browser from '../../apps/Browser/Browser';
import Notepad from '../../apps/Notepad/Notepad';
import './Window.css';

interface Props { win: WindowInstance; zIndex: number; }

const TASKBAR_H = 40;

export default function Window({ win, zIndex }: Props) {
  const { updatePosition, updateSize, focusWindow, toggleMaximize } = useWindowStore();

  const getBounds = useCallback(() => ({
    top: win.top, left: win.left, width: win.width, height: win.height,
  }), [win.top, win.left, win.width, win.height]);

  const { onMouseDown: onDragMouseDown } = useDrag({
    onMove: (top, left) => updatePosition(win.id, top, left),
    getPosition: () => ({ top: win.top, left: win.left }),
    clampTop: 0,
    clampBottom: window.innerHeight - TASKBAR_H - 32,
  });

  const { onMouseDown: onResizeMouseDown } = useResize({
    onResize: (w, h, t, l) => updateSize(win.id, w, h, t, l),
    getBounds,
  });

  const handleFocus = () => focusWindow(win.id);

  const style: React.CSSProperties = win.isMaximized
    ? { top: 0, left: 0, width: '100vw', height: `calc(100vh - ${TASKBAR_H}px)`, borderRadius: 0 }
    : { top: win.top, left: win.left, width: win.width, height: win.height };

  if (win.isMinimized) return null;

  return (
    <div
      className="window"
      style={{ ...style, zIndex }}
      onMouseDown={handleFocus}
    >
      <TitleBar
        win={win}
        onDragMouseDown={win.isMaximized ? undefined : onDragMouseDown}
        onDoubleClick={() => toggleMaximize(win.id)}
      />
      <div className="window-content">
        {win.appId === 'fileExplorer' && <FileExplorer initialPath={win.appProps?.path as string} />}
        {win.appId === 'browser' && <Browser initialUrl={win.appProps?.url as string} />}
        {win.appId === 'notepad' && <Notepad fileId={win.appProps?.fileId as string} initialContent={win.appProps?.content as string} />}
      </div>
      {!win.isMaximized && <ResizeHandles onMouseDown={onResizeMouseDown} />}
    </div>
  );
}
