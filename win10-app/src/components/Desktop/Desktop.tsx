import { useEffect } from 'react';
import { useDesktopStore } from '../../store/useDesktopStore';
import { useFileSystemStore } from '../../store/useFileSystemStore';
import { useWindowStore } from '../../store/useWindowStore';
import WindowManager from '../Window/WindowManager';
import Taskbar from '../Taskbar/Taskbar';
import StartMenu from '../StartMenu/StartMenu';
import DesktopIcon from './DesktopIcon';
import './Desktop.css';

interface Props {
  onRestart: () => void;
  onShutdown: () => void;
  onSleep: () => void;
}

export default function Desktop({ onRestart, onShutdown, onSleep }: Props) {
  const { startMenuOpen, closeStartMenu } = useDesktopStore();
  const { initDriver, driver, fs } = useFileSystemStore();
  const { openWindow } = useWindowStore();

  useEffect(() => { initDriver(); }, []);

  useEffect(() => { driver?.update(fs); }, [fs, driver]);

  const desktopDirId = driver
    ? Object.values(fs.nodes).find(n => n.name === 'Desktop' && n.type === 'directory')?.id
    : null;

  const desktopItems = desktopDirId && driver ? driver.getChildren(desktopDirId) : [];

  const handleDesktopClick = () => { if (startMenuOpen) closeStartMenu(); };

  const openApp = (appId: string, title: string, props?: Record<string, unknown>) => {
    openWindow(appId as any, title, props);
  };

  return (
    <div className="desktop" onClick={handleDesktopClick}>
      <div className="desktop-icons">
        {desktopItems.map(node => (
          <DesktopIcon key={node.id} node={node} onOpen={openApp} />
        ))}
        <DesktopIcon
          node={{ id: '__explorer__', name: 'File Explorer', type: 'directory', parentId: null, createdAt: 0, modifiedAt: 0 }}
          onOpen={(_appId, _title) => openApp('fileExplorer', 'File Explorer')}
          icon="📁"
        />
        <DesktopIcon
          node={{ id: '__browser__', name: 'Browser', type: 'directory', parentId: null, createdAt: 0, modifiedAt: 0 }}
          onOpen={(_appId, _title) => openApp('browser', 'Browser')}
          icon="🌐"
        />
        <DesktopIcon
          node={{ id: '__notepad__', name: 'Notepad', type: 'directory', parentId: null, createdAt: 0, modifiedAt: 0 }}
          onOpen={(_appId, _title) => openApp('notepad', 'Notepad')}
          icon="📝"
        />
        <DesktopIcon
          node={{ id: '__taskmanager__', name: 'Task Manager', type: 'directory', parentId: null, createdAt: 0, modifiedAt: 0 }}
          onOpen={(_appId, _title) => openApp('taskManager', 'Task Manager')}
          icon="📊"
        />
      </div>

      <WindowManager />
      {startMenuOpen && <StartMenu onRestart={onRestart} onShutdown={onShutdown} onSleep={onSleep} />}
      <Taskbar />
    </div>
  );
}
