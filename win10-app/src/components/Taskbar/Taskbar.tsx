import { useState } from 'react';
import { useWindowStore } from '../../store/useWindowStore';
import { useDesktopStore } from '../../store/useDesktopStore';
import StartButton from './StartButton';
import TaskbarItem from './TaskbarItem';
import SystemTray from './SystemTray';
import ContextMenu from '../ContextMenu/ContextMenu';
import './Taskbar.css';

export default function Taskbar() {
  const windows = useWindowStore(s => s.windows);
  const { openWindow } = useWindowStore();
  const { toggleStartMenu } = useDesktopStore();
  const [ctxPos, setCtxPos] = useState<{ x: number; y: number } | null>(null);

  return (
    <div
      className="taskbar"
      onContextMenu={(e) => {
        if ((e.target as HTMLElement).closest('.taskbar-item, .start-btn, .system-tray')) return;
        e.preventDefault();
        setCtxPos({ x: e.clientX, y: e.clientY });
      }}
    >
      <StartButton onClick={toggleStartMenu} />
      <div className="taskbar-items">
        {windows.map(win => <TaskbarItem key={win.id} win={win} />)}
      </div>
      <SystemTray />
      {ctxPos && (
        <ContextMenu
          x={ctxPos.x} y={ctxPos.y}
          items={[{ label: 'Taskbar settings', icon: '⚙️', onClick: () => openWindow('settings', 'Settings') }]}
          onClose={() => setCtxPos(null)}
        />
      )}
    </div>
  );
}
