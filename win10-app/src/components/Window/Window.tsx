import React, { useCallback, useState } from 'react';
import { useWindowStore } from '../../store/useWindowStore';
import { useDisplayStore } from '../../store/useDisplayStore';
import { sendWindowToMonitor, sendWindowDragging, sendWindowDragCancel } from '../../utils/displayChannel';
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
import CMD from '../../apps/CMD/CMD';
import DeviceManager from '../../apps/DeviceManager/DeviceManager';
import DiskManagement from '../../apps/DiskManagement/DiskManagement';
import RegistryEditor from '../../apps/RegistryEditor/RegistryEditor';
import IPScanner from '../../apps/IPScanner/IPScanner';
import Malwarebytes from '../../apps/Malwarebytes/Malwarebytes';
import CPUZ from '../../apps/CPUZ/CPUZ';
import HWMonitor from '../../apps/HWMonitor/HWMonitor';
import CCleaner from '../../apps/CCleaner/CCleaner';
import Wireshark from '../../apps/Wireshark/Wireshark';
import WinDirStat from '../../apps/WinDirStat/WinDirStat';
import Teams from '../../apps/Teams/Teams';
import StickyNotes from '../../apps/StickyNotes/StickyNotes';
import ClockApp from '../../apps/ClockApp/ClockApp';
import Jellyfin from '../../apps/Jellyfin/Jellyfin';
import RemoteDesktop from '../../apps/RemoteDesktop/RemoteDesktop';
import PuTTY from '../../apps/PuTTY/PuTTY';
import DevicesAndPrinters from '../../apps/DevicesAndPrinters/DevicesAndPrinters';
import HyperV from '../../apps/HyperV/HyperV';
import WindowsTerminal from '../../apps/WindowsTerminal/WindowsTerminal';
import EventViewer from '../../apps/EventViewer/EventViewer';
import GroupPolicy from '../../apps/GroupPolicy/GroupPolicy';
import PerfMon from '../../apps/PerfMon/PerfMon';
import IISManager from '../../apps/IISManager/IISManager';
import WinSCP from '../../apps/WinSCP/WinSCP';
import Nmap from '../../apps/Nmap/Nmap';
import VMManager from '../../apps/VMManager/VMManager';
import Clippy from '../../apps/Clippy/Clippy';
import Globe from '../../apps/Globe/Globe';
import './Window.css';

// Lazy imports for heavy apps (avoids initial bundle size issues)
import { lazy, Suspense } from 'react';
const OBS = lazy(() => import('../../apps/OBS/OBS'));
const NotepadPlusPlus = lazy(() => import('../../apps/NotepadPlusPlus/NotepadPlusPlus'));
const QBittorrent = lazy(() => import('../../apps/QBittorrent/QBittorrent'));
const GPUZ = lazy(() => import('../../apps/GPUZ/GPUZ'));
const ProcessHacker = lazy(() => import('../../apps/ProcessHacker/ProcessHacker'));
const SevenZip = lazy(() => import('../../apps/SevenZip/SevenZip'));
const CrystalDiskInfo = lazy(() => import('../../apps/CrystalDiskInfo/CrystalDiskInfo'));

interface Props { win: WindowInstance; zIndex: number; }

const TASKBAR_H = 40;

const Loader = () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', fontSize: 14 }}>Loading…</div>;

export default function Window({ win, zIndex }: Props) {
  const { updatePosition, updateSize, focusWindow, toggleMaximize, snapWindow, closeWindow } = useWindowStore();
  const { myPosition, pairedConnected } = useDisplayStore();
  const [snapPreview, setSnapPreview] = useState<'left' | 'right' | 'top' | null>(null);
  const [monitorEdge, setMonitorEdge] = useState<'left' | 'right' | null>(null);

  const getBounds = useCallback(() => ({
    top: win.top, left: win.left, width: win.width, height: win.height,
  }), [win.top, win.left, win.width, win.height]);

  const getSnapZone = (mouseX: number, mouseY: number): 'left' | 'right' | 'top' | null => {
    if (mouseY <= 4) return 'top';
    // Only snap to screen edges when there is no paired monitor on that side
    if (mouseX <= 8  && !(pairedConnected && myPosition === 'right')) return 'left';
    if (mouseX >= window.innerWidth - 8 && !(pairedConnected && myPosition === 'left')) return 'right';
    return null;
  };

  // Allow window to slide off the edge connected to another monitor
  const clampLeft = (myPosition === 'right' && pairedConnected) ? -(win.width + 4) : -200;

  const { onMouseDown: onDragMouseDown } = useDrag({
    onMove: (top, left) => {
      updatePosition(win.id, top, left);
    },
    getPosition: () => ({ top: win.top, left: win.left }),
    clampTop: 0,
    clampBottom: window.innerHeight - TASKBAR_H - 32,
    clampLeft,
    onDragMove: (_mouseX, _mouseY, curLeft) => {
      const { myPosition: pos, pairedConnected: paired } = useDisplayStore.getState();
      if (!paired || !pos) { setMonitorEdge(null); return; }

      const vw = window.innerWidth;
      const overflowRight = curLeft + win.width - vw;   // > 0 when off right
      const overflowLeft  = -(curLeft);                  // > 0 when off left

      if (pos === 'left' && overflowRight > 0) {
        setMonitorEdge('right');
        sendWindowDragging(overflowRight, win.width, win.height, win.top, win.appId, win.title, win.appProps, 'left');
      } else if (pos === 'right' && overflowLeft > 0) {
        setMonitorEdge('left');
        sendWindowDragging(overflowLeft, win.width, win.height, win.top, win.appId, win.title, win.appProps, 'right');
      } else {
        if (monitorEdge !== null) {
          sendWindowDragCancel();
          setMonitorEdge(null);
        }
      }
    },
    onDragEnd: (mouseX, mouseY, curLeft, curTop) => {
      const { myPosition: pos, pairedConnected: paired } = useDisplayStore.getState();
      setMonitorEdge(null);
      setSnapPreview(null);

      if (paired && pos) {
        const vw = window.innerWidth;
        const overflowRight = curLeft + win.width - vw;
        const overflowLeft  = -(curLeft);

        if (pos === 'left' && overflowRight > 0) {
          if (overflowRight >= win.width / 2) {
            // More than half crossed → transfer
            sendWindowDragCancel();
            sendWindowToMonitor(win.appId, win.title, win.appProps);
            closeWindow(win.id);
          } else {
            // Snap back to right edge of this screen
            sendWindowDragCancel();
            updatePosition(win.id, curTop, vw - win.width);
          }
          return;
        }

        if (pos === 'right' && overflowLeft > 0) {
          if (overflowLeft >= win.width / 2) {
            sendWindowDragCancel();
            sendWindowToMonitor(win.appId, win.title, win.appProps);
            closeWindow(win.id);
          } else {
            sendWindowDragCancel();
            updatePosition(win.id, curTop, 0);
          }
          return;
        }
      }

      const zone = getSnapZone(mouseX, mouseY);
      if (zone) snapWindow(win.id, zone);
    },
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

  const snapGhostStyle = (() => {
    const TASKBAR_H_LOCAL = 40;
    const vw = window.innerWidth;
    const vh = window.innerHeight - TASKBAR_H_LOCAL;
    if (!snapPreview) return null;
    if (snapPreview === 'top') return { top: 0, left: 0, width: vw, height: vh };
    const hw = Math.floor(vw / 2);
    return { top: 0, left: snapPreview === 'left' ? 0 : hw, width: hw, height: vh };
  })();

  return (
    <>
      {snapGhostStyle && (
        <div className="snap-ghost" style={{ position: 'fixed', zIndex: zIndex - 1, background: 'rgba(0,120,212,0.18)', border: '2px solid rgba(0,120,212,0.5)', borderRadius: 6, pointerEvents: 'none', ...snapGhostStyle }} />
      )}
      {monitorEdge && (
        <div style={{
          position: 'fixed', zIndex: zIndex - 1, pointerEvents: 'none',
          top: 0, bottom: 0,
          left: monitorEdge === 'left' ? 0 : undefined,
          right: monitorEdge === 'right' ? 0 : undefined,
          width: 6,
          background: monitorEdge === 'right'
            ? 'linear-gradient(to left,  rgba(0,180,255,0.8), transparent)'
            : 'linear-gradient(to right, rgba(0,180,255,0.8), transparent)',
          boxShadow: monitorEdge === 'right'
            ? '-4px 0 20px rgba(0,180,255,0.5)'
            : '4px 0 20px rgba(0,180,255,0.5)',
        }} />
      )}
      <div
        className="window"
        style={{ ...style, zIndex }}
        onMouseDown={handleFocus}
      >
        <TitleBar
          win={win}
          onDragMouseDown={win.isMaximized ? undefined : (e) => {
            onDragMouseDown(e);
          }}
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
        {win.appId === 'settings' && <Settings initialPage={win.appProps?.initialPage as string} />}
        {win.appId === 'paint' && <Paint />}
        {win.appId === 'spotify' && <Spotify />}
        {win.appId === 'discord' && <Discord />}
        {win.appId === 'vlc' && <VLC />}
        {win.appId === 'windowsStore' && <WindowsStore />}
        {win.appId === 'snippingTool' && <SnippingTool />}
        {win.appId === 'calendar' && <Calendar />}
        {win.appId === 'maps' && <Maps />}
        {win.appId === 'cmd' && <CMD powershell={win.appProps?.powershell as boolean} />}
        {win.appId === 'deviceManager' && <DeviceManager />}
        {win.appId === 'diskManagement' && <DiskManagement />}
        {win.appId === 'registryEditor' && <RegistryEditor />}
        {win.appId === 'ipScanner' && <IPScanner />}
        {win.appId === 'malwarebytes' && <Malwarebytes />}
        {win.appId === 'cpuZ' && <CPUZ />}
        {win.appId === 'hwMonitor' && <HWMonitor />}
        {win.appId === 'ccleaner' && <CCleaner />}
        {win.appId === 'wireshark' && <Wireshark />}
        {win.appId === 'winDirStat' && <WinDirStat />}
        {win.appId === 'teams' && <Teams />}
        {win.appId === 'obs' && <Suspense fallback={<Loader />}><OBS /></Suspense>}
        {win.appId === 'notepadPlusPlus' && <Suspense fallback={<Loader />}><NotepadPlusPlus /></Suspense>}
        {win.appId === 'qbittorrent' && <Suspense fallback={<Loader />}><QBittorrent /></Suspense>}
        {win.appId === 'gpuZ' && <Suspense fallback={<Loader />}><GPUZ /></Suspense>}
        {win.appId === 'processHacker' && <Suspense fallback={<Loader />}><ProcessHacker /></Suspense>}
        {win.appId === 'sevenZip' && <Suspense fallback={<Loader />}><SevenZip /></Suspense>}
        {win.appId === 'crystalDiskInfo' && <Suspense fallback={<Loader />}><CrystalDiskInfo /></Suspense>}
        {win.appId === 'stickyNotes' && <StickyNotes />}
        {win.appId === 'clockApp' && <ClockApp />}
        {win.appId === 'jellyfin' && <Jellyfin />}
        {win.appId === 'remoteDesktop' && <RemoteDesktop />}
        {win.appId === 'putty' && <PuTTY />}
        {win.appId === 'devicesAndPrinters' && <DevicesAndPrinters />}
        {win.appId === 'hyperV' && <HyperV />}
        {win.appId === 'windowsTerminal' && <WindowsTerminal />}
        {win.appId === 'eventViewer' && <EventViewer />}
        {win.appId === 'groupPolicy' && <GroupPolicy />}
        {win.appId === 'perfMon' && <PerfMon />}
        {win.appId === 'iisManager' && <IISManager />}
        {win.appId === 'winSCP' && <WinSCP />}
        {win.appId === 'nmap' && <Nmap />}
        {win.appId === 'vmManager' && <VMManager />}
        {win.appId === 'clippy' && <Clippy />}
        {win.appId === 'globe' && <Globe />}
      </div>
      {!win.isMaximized && <ResizeHandles onMouseDown={onResizeMouseDown} />}
    </div>
    </>
  );
}
