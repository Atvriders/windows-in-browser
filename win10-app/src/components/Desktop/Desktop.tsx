import { useEffect, useState } from 'react';
import { useDesktopStore } from '../../store/useDesktopStore';
import { useFileSystemStore } from '../../store/useFileSystemStore';
import { useWindowStore } from '../../store/useWindowStore';
import WindowManager from '../Window/WindowManager';
import Taskbar from '../Taskbar/Taskbar';
import StartMenu from '../StartMenu/StartMenu';
import DesktopIcon from './DesktopIcon';
import ContextMenu from '../ContextMenu/ContextMenu';
import PropertiesDialog from '../PropertiesDialog/PropertiesDialog';
import type { ContextMenuItem } from '../ContextMenu/ContextMenu';
import type { FSNode } from '../../types/filesystem';
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

interface CtxState {
  x: number;
  y: number;
  node: FSNode | null;
  icon?: string;
  isBackground?: boolean;
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
  ['sevenZip', '7-Zip', '🗜️'],
  ['oneNote', 'OneNote', '🗒️'],
  ['illustrator', 'Illustrator', '✏️'],
  ['premiere', 'Premiere Pro', '🎞️'],
  ['afterEffects', 'After Effects', '🌀'],
  ['autoCAD', 'AutoCAD', '📐'],
  ['solidWorks', 'SolidWorks', '🔩'],
];

export default function Desktop({ onRestart, onShutdown, onSleep }: Props) {
  const { startMenuOpen, closeStartMenu, toggleStartMenu } = useDesktopStore();
  const { initDriver, driver, fs } = useFileSystemStore();
  const { openWindow, closeWindow } = useWindowStore();
  const [wallpaperIdx, setWallpaperIdx] = useState(0);
  const [ctx, setCtx] = useState<CtxState | null>(null);
  const [propsTarget, setPropsTarget] = useState<{ node: FSNode | null; icon?: string; label?: string } | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [selBox, setSelBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set());

  useEffect(() => { initDriver(); }, []);
  useEffect(() => { driver?.update(fs); }, [fs, driver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        const wins = useWindowStore.getState().windows;
        if (wins.length > 0) closeWindow(wins[wins.length - 1].id);
      } else if (e.key === 'Meta') {
        e.preventDefault();
        toggleStartMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeWindow, toggleStartMenu]);

  useEffect(() => {
    const id = setInterval(() => {
      setWallpaperIdx(i => (i + 1) % WALLPAPERS.length);
    }, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!dragStart) return;

    const onMove = (e: MouseEvent) => {
      const x = Math.min(e.clientX, dragStart.x);
      const y = Math.min(e.clientY, dragStart.y);
      const w = Math.abs(e.clientX - dragStart.x);
      const h = Math.abs(e.clientY - dragStart.y);
      setSelBox({ x, y, w, h });

      // Find icons that intersect the selection rect
      const r = { left: x, right: x + w, top: y, bottom: y + h };
      const newSel = new Set<string>();
      document.querySelectorAll<HTMLElement>('[data-icon-id]').forEach(el => {
        const ir = el.getBoundingClientRect();
        if (ir.left < r.right && ir.right > r.left && ir.top < r.bottom && ir.bottom > r.top) {
          newSel.add(el.getAttribute('data-icon-id')!);
        }
      });
      setSelectedIcons(newSel);
    };

    const onUp = () => {
      setDragStart(null);
      setSelBox(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragStart]);

  const desktopDirId = driver
    ? Object.values(fs.nodes).find(n => n.name === 'Desktop' && n.type === 'directory')?.id
    : null;

  const desktopItems = desktopDirId && driver ? driver.getChildren(desktopDirId) : [];

  const openApp = (appId: string, title: string, props?: Record<string, unknown>) => {
    openWindow(appId as any, title, props);
  };

  const handleDesktopClick = () => {
    if (startMenuOpen) closeStartMenu();
    setCtx(null);
  };

  const handleDesktopMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.desktop-icon, .taskbar, .window, .start-menu, .ctx-menu, .props-overlay')) return;
    setSelectedIcons(new Set());
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (startMenuOpen) closeStartMenu();
    setCtx({ x: e.clientX, y: e.clientY, node: null, isBackground: true });
  };

  const handleIconContextMenu = (e: React.MouseEvent, node: FSNode, icon?: string) => {
    setCtx({ x: e.clientX, y: e.clientY, node, icon });
  };

  // Build context menu items based on what was right-clicked
  const buildMenuItems = (): (ContextMenuItem | 'separator')[] => {
    if (!ctx) return [];

    if (ctx.isBackground) {
      return [
        { label: 'View', icon: '👁️', onClick: () => {}, disabled: true },
        { label: 'Sort by', icon: '🔤', onClick: () => {}, disabled: true },
        'separator',
        { label: 'Refresh', icon: '🔄', onClick: () => {} },
        'separator',
        { label: 'Display settings', icon: '🖥️', onClick: () => openApp('settings', 'Settings', { initialPage: 'personalization' }) },
        { label: 'Personalize', icon: '🎨', onClick: () => openApp('settings', 'Settings', { initialPage: 'personalization' }) },
      ];
    }

    const node = ctx.node;

    // App shortcut (synthetic node with __appId__ id)
    if (node && node.id.startsWith('__') && node.id.endsWith('__')) {
      const appId = node.id.slice(2, -2);
      return [
        { label: 'Open', icon: '▶️', onClick: () => openApp(appId, node.name) },
        'separator',
        { label: 'Properties', icon: 'ℹ️', onClick: () => setPropsTarget({ node: null, icon: ctx.icon, label: node.name }) },
      ];
    }

    // Real FS node
    if (node) {
      const items: (ContextMenuItem | 'separator')[] = [
        {
          label: 'Open',
          icon: node.type === 'directory' ? '📂' : '📄',
          onClick: () => {
            if (node.type === 'directory') openApp('fileExplorer', node.name, { path: node.id });
            else openApp('notepad', node.name, { fileId: node.id });
          },
        },
      ];
      if (node.type === 'file') {
        items.push({ label: 'Open with Notepad', icon: '📝', onClick: () => openApp('notepad', node.name, { fileId: node.id }) });
      }
      items.push('separator');
      items.push({ label: 'Properties', icon: 'ℹ️', onClick: () => setPropsTarget({ node, icon: ctx.icon }) });
      return items;
    }

    return [];
  };

  return (
    <div
      className="desktop"
      onClick={handleDesktopClick}
      onMouseDown={handleDesktopMouseDown}
      onContextMenu={handleDesktopContextMenu}
      style={{ background: WALLPAPERS[wallpaperIdx], transition: 'background 2s ease' }}
    >
      <div className="desktop-icons">
        {desktopItems.map(node => (
          <DesktopIcon
            key={node.id}
            node={node}
            onOpen={openApp}
            onContextMenu={handleIconContextMenu}
            isSelected={selectedIcons.has(node.id)}
          />
        ))}
        {DESKTOP_SHORTCUTS.map(([appId, label, icon]) => (
          <DesktopIcon
            key={`__${appId}__`}
            node={{ id: `__${appId}__`, name: label, type: 'directory', parentId: null, createdAt: 0, modifiedAt: 0 }}
            onOpen={() => openApp(appId, label)}
            icon={icon}
            onContextMenu={handleIconContextMenu}
            isSelected={selectedIcons.has(`__${appId}__`)}
          />
        ))}
      </div>
      <div className="desktop-wallpaper-label">{WALLPAPER_NAMES[wallpaperIdx]}</div>

      <WindowManager />
      {startMenuOpen && <StartMenu onRestart={onRestart} onShutdown={onShutdown} onSleep={onSleep} />}
      <Taskbar />

      {selBox && selBox.w > 4 && selBox.h > 4 && (
        <div
          className="desktop-sel-box"
          style={{ left: selBox.x, top: selBox.y, width: selBox.w, height: selBox.h }}
        />
      )}

      {ctx && (
        <ContextMenu
          x={ctx.x}
          y={ctx.y}
          items={buildMenuItems()}
          onClose={() => setCtx(null)}
        />
      )}

      {propsTarget && (
        <PropertiesDialog
          node={propsTarget.node ?? undefined}
          appLabel={propsTarget.label}
          appIcon={propsTarget.icon}
          driver={driver}
          onClose={() => setPropsTarget(null)}
        />
      )}
    </div>
  );
}
