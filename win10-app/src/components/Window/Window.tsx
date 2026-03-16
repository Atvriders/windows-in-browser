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
import TaskManager from '../../apps/TaskManager/TaskManager';
import Word from '../../apps/Word/Word';
import Excel from '../../apps/Excel/Excel';
import PowerPoint from '../../apps/PowerPoint/PowerPoint';
import Outlook from '../../apps/Outlook/Outlook';
import OneNote from '../../apps/OneNote/OneNote';
import Photoshop from '../../apps/Photoshop/Photoshop';
import Illustrator from '../../apps/Illustrator/Illustrator';
import Premiere from '../../apps/Premiere/Premiere';
import AfterEffects from '../../apps/AfterEffects/AfterEffects';
import AutoCAD from '../../apps/AutoCAD/AutoCAD';
import SolidWorks from '../../apps/SolidWorks/SolidWorks';
import Steam from '../../apps/Steam/Steam';
import Calculator from '../../apps/Calculator/Calculator';
import Settings from '../../apps/Settings/Settings';
import Paint from '../../apps/Paint/Paint';
import Spotify from '../../apps/Spotify/Spotify';
import Discord from '../../apps/Discord/Discord';
import VLC from '../../apps/VLC/VLC';
import WindowsStore from '../../apps/WindowsStore/WindowsStore';
import SnippingTool from '../../apps/SnippingTool/SnippingTool';
import Calendar from '../../apps/Calendar/Calendar';
import Maps from '../../apps/Maps/Maps';
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
        {win.appId === 'taskManager' && <TaskManager />}
        {win.appId === 'word' && <Word fileId={win.appProps?.fileId as string} />}
        {win.appId === 'excel' && <Excel />}
        {win.appId === 'powerPoint' && <PowerPoint />}
        {win.appId === 'outlook' && <Outlook />}
        {win.appId === 'oneNote' && <OneNote />}
        {win.appId === 'photoshop' && <Photoshop />}
        {win.appId === 'illustrator' && <Illustrator />}
        {win.appId === 'premiere' && <Premiere />}
        {win.appId === 'afterEffects' && <AfterEffects />}
        {win.appId === 'autoCAD' && <AutoCAD />}
        {win.appId === 'solidWorks' && <SolidWorks />}
        {win.appId === 'steam' && <Steam />}
        {win.appId === 'calculator' && <Calculator />}
        {win.appId === 'settings' && <Settings />}
        {win.appId === 'paint' && <Paint />}
        {win.appId === 'spotify' && <Spotify />}
        {win.appId === 'discord' && <Discord />}
        {win.appId === 'vlc' && <VLC />}
        {win.appId === 'windowsStore' && <WindowsStore />}
        {win.appId === 'snippingTool' && <SnippingTool />}
        {win.appId === 'calendar' && <Calendar />}
        {win.appId === 'maps' && <Maps />}
      </div>
      {!win.isMaximized && <ResizeHandles onMouseDown={onResizeMouseDown} />}
    </div>
  );
}
