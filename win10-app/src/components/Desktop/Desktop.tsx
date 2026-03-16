import { useEffect, useState } from 'react';
import { useDesktopStore } from '../../store/useDesktopStore';
import { useFileSystemStore } from '../../store/useFileSystemStore';
import { useWindowStore } from '../../store/useWindowStore';
import WindowManager from '../Window/WindowManager';
import Taskbar from '../Taskbar/Taskbar';
import StartMenu from '../StartMenu/StartMenu';
import DesktopIcon from './DesktopIcon';
import './Desktop.css';

const WALLPAPERS = [
  'radial-gradient(ellipse at 30% 60%, #0a3a6b 0%, #0a1628 40%, #061020 100%)',
  'linear-gradient(135deg, #1a0533 0%, #6b1a4f 30%, #c9592a 60%, #f5a623 80%, #fcd97d 100%)',
  'linear-gradient(160deg, #0d1f0d 0%, #1a4a1a 30%, #2d7a3a 60%, #4aa85a 80%, #88c888 100%)',
  'radial-gradient(ellipse at 50% 100%, #0d2b5e 0%, #030a1a 60%, #000510 100%)',
  'linear-gradient(150deg, #1a0f00 0%, #4a2c0a 25%, #8b5a1a 50%, #c4893a 75%, #e8b86d 100%)',
  'radial-gradient(ellipse at 60% 40%, #1a0038 0%, #2d0060 30%, #5a0080 60%, #8800b0 80%, #4a006a 100%)',
  'linear-gradient(180deg, #001a3a 0%, #003060 30%, #005090 60%, #0078d4 85%, #40a8ff 100%)',
  'conic-gradient(from 180deg at 50% 50%, #0d0d2b 0deg, #0a1a4a 90deg, #0d1a2d 180deg, #051020 270deg, #0d0d2b 360deg)',
];

const WALLPAPER_NAMES = [
  'Windows Hero', 'Sunrise', 'Forest', 'Night Sky',
  'Desert', 'Violet', 'Arctic Blue', 'Abstract Dark',
];

interface Props {
  onRestart: () => void;
  onShutdown: () => void;
  onSleep: () => void;
}

// Desktop shortcut definitions: [appId, label, icon]
const DESKTOP_SHORTCUTS: [string, string, string][] = [
  ['fileExplorer', 'File Explorer', '📁'],
  ['browser', 'Microsoft Edge', '🌐'],
  ['notepad', 'Notepad', '📝'],
  ['taskManager', 'Task Manager', '📊'],
  ['windowsStore', 'Microsoft Store', '🛒'],
  ['settings', 'Settings', '⚙️'],
  ['cmd', 'Command Prompt', '💻'],
  ['steam', 'Steam', '🎮'],
  ['discord', 'Discord', '🗨️'],
  ['teams', 'Microsoft Teams', '👥'],
  ['spotify', 'Spotify', '🎵'],
  ['vlc', 'VLC Media Player', '🎬'],
  ['word', 'Microsoft Word', '📄'],
  ['excel', 'Microsoft Excel', '📊'],
  ['powerPoint', 'PowerPoint', '📑'],
  ['outlook', 'Outlook', '📧'],
  ['photoshop', 'Photoshop', '🖼️'],
  ['malwarebytes', 'Malwarebytes', '🛡️'],
  ['ccleaner', 'CCleaner', '🧹'],
  ['cpuZ', 'CPU-Z', '⚙️'],
  ['hwMonitor', 'HWMonitor', '🖥️'],
  ['gpuZ', 'GPU-Z', '🎮'],
  ['wireshark', 'Wireshark', '🦈'],
  ['winDirStat', 'WinDirStat', '📂'],
  ['ipScanner', 'IP Scanner', '📡'],
  ['obs', 'OBS Studio', '🔴'],
  ['notepadPlusPlus', 'Notepad++', '📝'],
  ['qbittorrent', 'qBittorrent', '🔽'],
  ['crystalDiskInfo', 'CrystalDiskInfo', '💾'],
  ['processHacker', 'Process Hacker', '🔬'],
  ['calculator', 'Calculator', '🧮'],
  ['paint', 'Paint', '🎨'],
  ['snippingTool', 'Snipping Tool', '✂️'],
  ['calendar', 'Calendar', '📅'],
  ['maps', 'Maps', '🗺️'],
  ['registryEditor', 'Registry Editor', '📋'],
  ['diskManagement', 'Disk Management', '💿'],
  ['deviceManager', 'Device Manager', '🖥️'],
];

export default function Desktop({ onRestart, onShutdown, onSleep }: Props) {
  const { startMenuOpen, closeStartMenu } = useDesktopStore();
  const { initDriver, driver, fs } = useFileSystemStore();
  const { openWindow } = useWindowStore();
  const [wallpaperIdx, setWallpaperIdx] = useState(0);

  useEffect(() => { initDriver(); }, []);
  useEffect(() => { driver?.update(fs); }, [fs, driver]);

  useEffect(() => {
    const id = setInterval(() => {
      setWallpaperIdx(i => (i + 1) % WALLPAPERS.length);
    }, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const desktopDirId = driver
    ? Object.values(fs.nodes).find(n => n.name === 'Desktop' && n.type === 'directory')?.id
    : null;

  const desktopItems = desktopDirId && driver ? driver.getChildren(desktopDirId) : [];

  const handleDesktopClick = () => { if (startMenuOpen) closeStartMenu(); };

  const openApp = (appId: string, title: string, props?: Record<string, unknown>) => {
    openWindow(appId as any, title, props);
  };

  return (
    <div
      className="desktop"
      onClick={handleDesktopClick}
      style={{ background: WALLPAPERS[wallpaperIdx], transition: 'background 2s ease' }}
    >
      <div className="desktop-icons">
        {/* File system items from Desktop folder */}
        {desktopItems.map(node => (
          <DesktopIcon key={node.id} node={node} onOpen={openApp} />
        ))}
        {/* Pinned app shortcuts */}
        {DESKTOP_SHORTCUTS.map(([appId, label, icon]) => (
          <DesktopIcon
            key={`__${appId}__`}
            node={{ id: `__${appId}__`, name: label, type: 'directory', parentId: null, createdAt: 0, modifiedAt: 0 }}
            onOpen={() => openApp(appId, label)}
            icon={icon}
          />
        ))}
      </div>
      <div className="desktop-wallpaper-label">{WALLPAPER_NAMES[wallpaperIdx]}</div>

      <WindowManager />
      {startMenuOpen && <StartMenu onRestart={onRestart} onShutdown={onShutdown} onSleep={onSleep} />}
      <Taskbar />
    </div>
  );
}
