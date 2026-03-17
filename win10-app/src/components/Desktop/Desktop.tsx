import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDesktopStore } from '../../store/useDesktopStore';
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

const WALLPAPERS = [
  // Windows Hero — classic Bloom: flowing deep navy into signature Windows blue
  'radial-gradient(ellipse at 30% 60%, #0a3a6b 0%, #0a1628 40%, #061020 100%)',
  // Sunrise — cool pre-dawn indigo lifting to muted rose, Windows Spotlight style
  'linear-gradient(165deg, #06091a 0%, #0d1a38 20%, #1a2a58 38%, #2a3a70 52%, #4a4878 65%, #6a5880 78%, #8a6878 90%, #9a7878 100%)',
  // Misty Forest — atmospheric deep teal-green, Windows Spotlight mountain forest
  'linear-gradient(175deg, #020c08 0%, #061808 15%, #0d2a14 30%, #143818 45%, #1a4820 58%, #1e5228 70%, #183d1e 85%, #0d2410 100%)',
  // Night Sky — deep space blue-black with subtle stellar glow
  'radial-gradient(ellipse at 50% 100%, #0d2b5e 0%, #030a1a 60%, #000510 100%)',
  // Blue Hour Desert — cool indigo sky fading to shadowed dune, Windows Spotlight Sahara
  'linear-gradient(170deg, #08102a 0%, #101a40 18%, #1a2858 34%, #1e3060 48%, #1a2840 62%, #101820 78%, #080e14 100%)',
  // Windows Violet — rich imperial purple, official Windows 10 accent
  'radial-gradient(ellipse at 60% 40%, #0a0020 0%, #180040 25%, #300868 50%, #401880 70%, #2a1050 88%, #100828 100%)',
  // Arctic Blue — Windows 10 signature sky-to-horizon cyan gradient
  'linear-gradient(180deg, #001020 0%, #002040 22%, #003870 40%, #0058a0 58%, #0078d4 78%, #1090e8 92%, #28a8ff 100%)',
  // Abstract Dark — flowing midnight blues, Windows 10 lock screen style
  'conic-gradient(from 200deg at 40% 60%, #030818 0deg, #081428 70deg, #0a1a38 140deg, #060e20 210deg, #040a18 280deg, #030818 360deg)',
  // Ocean Dusk — deep sapphire sea, Windows Spotlight coastal twilight
  'linear-gradient(180deg, #080e1a 0%, #0c1828 18%, #102238 34%, #143050 50%, #103868 66%, #0c2850 80%, #081820 100%)',
  // Coastal Mist — pearl-grey sky dissolving into steel-blue water, moody overcast
  'linear-gradient(175deg, #1a2030 0%, #2a3448 18%, #304060 35%, #284870 52%, #204870 68%, #183850 82%, #102030 100%)',
  // Rainforest Mist — moonlit jungle canopy, deep cool teal-black
  'linear-gradient(165deg, #020a06 0%, #041410 18%, #082818 35%, #0c3020 52%, #0a2818 68%, #061808 84%, #020c06 100%)',
  // Misty Peaks — Windows Spotlight alpine haze, layered blue ridgelines
  'linear-gradient(180deg, #0c1828 0%, #102038 16%, #183458 32%, #1e4070 48%, #1a3860 62%, #14284a 76%, #0c1830 90%, #080e1c 100%)',
  // Twilight Savanna — blue-hour veldt, silhouette tones under indigo sky
  'linear-gradient(170deg, #06080c 0%, #0c1018 18%, #141c28 34%, #1a2438 50%, #141e30 65%, #0e1622 80%, #080c14 100%)',
  // Winter Bloom — muted lavender-slate, Windows 10 Personalization default
  'linear-gradient(155deg, #0c0818 0%, #181430 18%, #242048 35%, #2e2858 52%, #28204c 68%, #1c1638 84%, #100c22 100%)',
  // Aurora — Windows Spotlight Northern Lights: deep navy with teal-green ribbon
  'linear-gradient(165deg, #020810 0%, #040e18 15%, #061828 30%, #0a2838 45%, #0c3040 58%, #0e3848 70%, #0c3040 82%, #081828 92%, #040e18 100%)',
  // Volcanic Dusk — dark basalt with deep crimson horizon, subdued Windows style
  'radial-gradient(ellipse at 50% 110%, #380808 0%, #200404 18%, #100202 35%, #080101 55%, #040101 75%, #020101 100%)',
  // Mountain Lake — serene steel-blue reflection, Windows Spotlight Patagonia
  'linear-gradient(180deg, #0e1c2c 0%, #162840 16%, #1e3858 32%, #1a3858 50%, #162e4a 66%, #102038 82%, #0a1428 100%)',
  // Autumn Fog — muted smoky amber-slate, Windows Spotlight misty woods
  'linear-gradient(160deg, #0c0c0c 0%, #181010 18%, #241808 35%, #301c08 52%, #281808 68%, #181008 84%, #0c0a04 100%)',
  // Canyon Blue Hour — cool azure sky over shadowed rust stone walls
  'linear-gradient(175deg, #0a1828 0%, #102040 18%, #183462 34%, #162e58 50%, #101e38 65%, #0c1428 80%, #060a14 100%)',
  // Bamboo Dusk — deep indigo-tinted forest, Windows Spotlight Asian nature
  'linear-gradient(165deg, #030810 0%, #060c16 16%, #08101e 32%, #0a1424 48%, #081018 64%, #060c12 80%, #04080e 100%)',
  // Fjord Twilight — Windows Spotlight Norway: deep slate water, violet sky
  'linear-gradient(170deg, #060812 0%, #0a0e20 15%, #10183a 30%, #18204a 45%, #141c40 60%, #0e1430 76%, #080c20 90%, #040610 100%)',
  // Wetland Dawn — steel-blue mist over still water, Windows Spotlight marsh
  'linear-gradient(165deg, #080c12 0%, #0c1220 18%, #121e34 35%, #182848 52%, #142040 68%, #0e1830 84%, #080e1e 100%)',
  // Deep Ocean — abyssal blue-black, Windows Spotlight ocean trench
  'radial-gradient(ellipse at 50% 0%, #081828 0%, #041020 25%, #020810 55%, #010408 80%, #010306 100%)',
  // Reef Twilight — deep navy with subtle cool teal depth, Windows Spotlight ocean
  'linear-gradient(160deg, #020810 0%, #041020 18%, #061828 35%, #081e32 52%, #061828 68%, #041020 84%, #020810 100%)',
];

const WALLPAPER_NAMES = [
  'Windows Hero', 'Sunrise', 'Misty Forest', 'Night Sky',
  'Blue Hour Desert', 'Windows Violet', 'Arctic Blue', 'Abstract Dark',
  'Ocean Dusk', 'Coastal Mist', 'Rainforest Mist', 'Misty Peaks',
  'Twilight Savanna', 'Winter Bloom', 'Aurora', 'Volcanic Dusk',
  'Mountain Lake', 'Autumn Fog', 'Canyon Blue Hour', 'Bamboo Dusk',
  'Fjord Twilight', 'Wetland Dawn', 'Deep Ocean', 'Reef Twilight',
];

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
  const [wallpaperIdx, setWallpaperIdx] = useState(0);
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
    const id = setInterval(() => {
      setWallpaperIdx(i => (i + 1) % WALLPAPERS.length);
    }, 5 * 60 * 1000);
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
      <div className="desktop-wallpaper-label">{WALLPAPER_NAMES[wallpaperIdx]}</div>

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
