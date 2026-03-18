import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useDesktopStore } from '../../store/useDesktopStore';
import { useWallpaperStore, WALLPAPERS } from '../../store/useWallpaperStore';
import { useFileSystemStore } from '../../store/useFileSystemStore';
import { useWindowStore } from '../../store/useWindowStore';
import { useDisplayStore } from '../../store/useDisplayStore';
import WindowManager from '../Window/WindowManager';
import PhantomWindow from '../Window/PhantomWindow';
import Taskbar from '../Taskbar/Taskbar';
import StartMenu from '../StartMenu/StartMenu';
import DesktopIcon from './DesktopIcon';
import ContextMenu from '../ContextMenu/ContextMenu';
import PropertiesDialog from '../PropertiesDialog/PropertiesDialog';
import type { ContextMenuItem } from '../ContextMenu/ContextMenu';
import type { FSNode } from '../../types/filesystem';
import './Desktop.css';


interface Props {
  onRestart: () => void;
  onShutdown: () => void;
  onSleep: () => void;
  onLock: () => void;
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
  ['stickyNotes', 'Sticky Notes', '📌'],
  ['clockApp', 'Clock', '🕐'],
  ['jellyfin', 'Jellyfin', '🪼'],
  ['remoteDesktop', 'Remote Desktop Connection', '🖥️'],
  ['putty', 'PuTTY', '🐢'],
  ['devicesAndPrinters', 'Devices and Printers', '🖨️'],
  ['hyperV', 'Hyper-V Manager', '⚡'],
  ['windowsTerminal', 'Windows Terminal', '⬛'],
  ['eventViewer', 'Event Viewer', '📋'],
  ['groupPolicy', 'Group Policy Editor', '🔒'],
  ['perfMon', 'Performance Monitor', '📈'],
  ['iisManager', 'IIS Manager', '🌐'],
  ['winSCP', 'WinSCP', '📂'],
  ['nmap', 'Nmap', '🔍'],
  ['vmManager', 'VM Manager', '🖥️'],
  ['clippy', 'Clippy', '📎'],
];

const CELL_W = 90;
const CELL_H = 90;
const GRID_LEFT = 10;
const GRID_TOP = 10;

function findFreeCell(
  col: number, row: number, excludeId: string,
  positions: Record<string, [number, number]>, maxRows: number,
): [number, number] {
  const occupied = new Set(
    Object.entries(positions)
      .filter(([k]) => k !== excludeId)
      .map(([, [c, r]]) => `${c},${r}`),
  );
  if (!occupied.has(`${col},${row}`)) return [col, row];
  for (let d = 1; d < 100; d++) {
    for (let dc = -d; dc <= d; dc++) {
      for (let dr = -d; dr <= d; dr++) {
        if (Math.abs(dc) !== d && Math.abs(dr) !== d) continue;
        const c = col + dc, r = row + dr;
        if (c < 0 || r < 0 || r >= maxRows) continue;
        if (!occupied.has(`${c},${r}`)) return [c, r];
      }
    }
  }
  return [col, row];
}

export default function Desktop({ onRestart, onShutdown, onSleep, onLock }: Props) {
  const { startMenuOpen, closeStartMenu, toggleStartMenu } = useDesktopStore();
  const { initDriver, driver, fs } = useFileSystemStore();
  const { openWindow, closeWindow } = useWindowStore();
  const { myPosition, pairedConnected } = useDisplayStore();
  const { wallpaperIdx, nextWallpaper, cycleInterval } = useWallpaperStore();
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [ctx, setCtx] = useState<CtxState | null>(null);
  const [propsTarget, setPropsTarget] = useState<{ node: FSNode | null; icon?: string; label?: string } | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [selBox, setSelBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set());
  const [iconPositions, setIconPositions] = useState<Record<string, [number, number]>>({});
  const [iconDrag, setIconDrag] = useState<{ id: string; ghostX: number; ghostY: number; icon: string; label: string } | null>(null);
  const [dragTargetCell, setDragTargetCell] = useState<[number, number] | null>(null);
  const rowsPerCol = useMemo(() => Math.max(1, Math.floor((window.innerHeight - 48 - GRID_TOP) / CELL_H)), []);

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
    if (cycleRef.current) clearInterval(cycleRef.current);
    if (cycleInterval > 0) {
      cycleRef.current = setInterval(() => nextWallpaper(WALLPAPERS.length), cycleInterval * 1000);
    }
    return () => { if (cycleRef.current) clearInterval(cycleRef.current); };
  }, [cycleInterval, nextWallpaper]);

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

  const allIconIds = useMemo(
    () => [
      ...DESKTOP_SHORTCUTS.map(([appId]) => `__${appId}__`),
      ...desktopItems.map(n => n.id),
    ],
    [desktopItems],
  );

  useEffect(() => {
    setIconPositions(prev => {
      const next = { ...prev };
      let changed = false;
      const occupied = new Set(Object.values(next).map(([c, r]) => `${c},${r}`));
      for (const id of allIconIds) {
        if (!next[id]) {
          let c = 0, r = 0;
          while (occupied.has(`${c},${r}`)) {
            r++;
            if (r >= rowsPerCol) { r = 0; c++; }
          }
          next[id] = [c, r];
          occupied.add(`${c},${r}`);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [allIconIds, rowsPerCol]);

  const handleIconMouseDown = useCallback((
    e: React.MouseEvent, id: string, iconEmoji: string, label: string,
  ) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    let dragged = false;
    const onMove = (ev: MouseEvent) => {
      if (!dragged && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 6) dragged = true;
      if (!dragged) return;
      setIconDrag({ id, ghostX: ev.clientX, ghostY: ev.clientY, icon: iconEmoji, label });
      const tc = Math.max(0, Math.floor((ev.clientX - GRID_LEFT) / CELL_W));
      const tr = Math.max(0, Math.min(rowsPerCol - 1, Math.floor((ev.clientY - GRID_TOP) / CELL_H)));
      setDragTargetCell([tc, tr]);
    };
    const onUp = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (dragged) {
        const tc = Math.max(0, Math.floor((ev.clientX - GRID_LEFT) / CELL_W));
        const tr = Math.max(0, Math.min(rowsPerCol - 1, Math.floor((ev.clientY - GRID_TOP) / CELL_H)));
        setIconPositions(prev => ({ ...prev, [id]: findFreeCell(tc, tr, id, prev, rowsPerCol) }));
      }
      setIconDrag(null);
      setDragTargetCell(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [rowsPerCol]);

  const openApp = (appId: string, title: string, props?: Record<string, unknown>) => {
    openWindow(appId as any, title, props);
  };

  const handleDesktopClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.start-menu')) return;
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
        { label: 'Refresh', icon: '🔄', onClick: () => { setSelectedIcons(new Set()); setCtx(null); } },
        'separator',
        { label: 'Display settings', icon: '🖥️', onClick: () => openApp('settings', 'Settings', { initialPage: 'system' }) },
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
        {iconDrag && dragTargetCell && (
          <div
            className="desktop-icon-cell-highlight"
            style={{
              left: GRID_LEFT + dragTargetCell[0] * CELL_W,
              top: GRID_TOP + dragTargetCell[1] * CELL_H,
              width: CELL_W,
              height: CELL_H,
            }}
          />
        )}
        {desktopItems.map(node => {
          const pos = iconPositions[node.id];
          if (!pos) return null;
          const emoji = node.type === 'directory' ? '📁' : '📄';
          return (
            <DesktopIcon
              key={node.id}
              node={node}
              onOpen={openApp}
              onContextMenu={handleIconContextMenu}
              isSelected={selectedIcons.has(node.id)}
              isDragging={iconDrag?.id === node.id}
              style={{ position: 'absolute', left: GRID_LEFT + pos[0] * CELL_W, top: GRID_TOP + pos[1] * CELL_H }}
              onIconMouseDown={(e) => handleIconMouseDown(e, node.id, emoji, node.name)}
            />
          );
        })}
        {DESKTOP_SHORTCUTS.map(([appId, label, icon]) => {
          const id = `__${appId}__`;
          const pos = iconPositions[id];
          if (!pos) return null;
          return (
            <DesktopIcon
              key={id}
              node={{ id, name: label, type: 'directory', parentId: null, createdAt: 0, modifiedAt: 0 }}
              onOpen={() => openApp(appId, label)}
              icon={icon}
              onContextMenu={handleIconContextMenu}
              isSelected={selectedIcons.has(id)}
              isDragging={iconDrag?.id === id}
              style={{ position: 'absolute', left: GRID_LEFT + pos[0] * CELL_W, top: GRID_TOP + pos[1] * CELL_H }}
              onIconMouseDown={(e) => handleIconMouseDown(e, id, icon, label)}
            />
          );
        })}
      </div>
      {iconDrag && (
        <div
          className="desktop-icon-drag-ghost"
          style={{ left: iconDrag.ghostX - 40, top: iconDrag.ghostY - 40 }}
        >
          <span className="desktop-icon-img">{iconDrag.icon}</span>
          <span className="desktop-icon-label">{iconDrag.label}</span>
        </div>
      )}
      <div className="desktop-wallpaper-label">Windows Clone by Claude</div>

      <WindowManager />
      <PhantomWindow />
      {startMenuOpen && <StartMenu onRestart={onRestart} onShutdown={onShutdown} onSleep={onSleep} onLock={onLock} onSignOut={() => { useWindowStore.getState().windows.forEach(w => closeWindow(w.id)); onLock(); }} />}
      <Taskbar />

      {/* Persistent edge glow showing where the connected monitor is */}
      {pairedConnected && myPosition && (
        <div
          className={`desktop-monitor-edge desktop-monitor-edge--${myPosition === 'left' ? 'right' : 'left'}`}
          title={`Monitor 2 is to the ${myPosition === 'left' ? 'right' : 'left'}`}
        />
      )}

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
