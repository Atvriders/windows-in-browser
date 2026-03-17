import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { WindowInstance, AppID } from '../types/window';

interface WindowStore {
  windows: WindowInstance[];
  openWindow: (appId: AppID, title: string, appProps?: Record<string, unknown>) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  focusWindow: (id: string) => void;
  updatePosition: (id: string, top: number, left: number) => void;
  updateSize: (id: string, width: number, height: number, top: number, left: number) => void;
  snapWindow: (id: string, position: 'left' | 'right' | 'top') => void;
}

const defaultSizes: Record<AppID, { w: number; h: number }> = {
  fileExplorer: { w: 800, h: 500 },
  browser: { w: 900, h: 600 },
  notepad: { w: 600, h: 400 },
  taskManager: { w: 750, h: 500 },
  word: { w: 900, h: 650 },
  excel: { w: 950, h: 600 },
  powerPoint: { w: 1000, h: 650 },
  outlook: { w: 950, h: 600 },
  oneNote: { w: 850, h: 580 },
  photoshop: { w: 1000, h: 680 },
  illustrator: { w: 1000, h: 680 },
  premiere: { w: 1050, h: 680 },
  afterEffects: { w: 1050, h: 680 },
  autoCAD: { w: 1000, h: 680 },
  solidWorks: { w: 1000, h: 680 },
  steam: { w: 1000, h: 640 },
  calculator: { w: 320, h: 520 },
  settings: { w: 800, h: 580 },
  paint: { w: 900, h: 620 },
  spotify: { w: 950, h: 640 },
  discord: { w: 1000, h: 660 },
  vlc: { w: 900, h: 600 },
  windowsStore: { w: 1000, h: 660 },
  snippingTool: { w: 700, h: 480 },
  calendar: { w: 1000, h: 660 },
  maps: { w: 950, h: 640 },
  cmd: { w: 700, h: 420 },
  deviceManager: { w: 700, h: 520 },
  diskManagement: { w: 900, h: 580 },
  registryEditor: { w: 820, h: 560 },
  ipScanner: { w: 860, h: 560 },
  malwarebytes: { w: 820, h: 600 },
  cpuZ: { w: 460, h: 540 },
  hwMonitor: { w: 380, h: 620 },
  ccleaner: { w: 800, h: 560 },
  wireshark: { w: 1000, h: 660 },
  winDirStat: { w: 900, h: 600 },
  teams: { w: 1000, h: 680 },
  obs: { w: 1000, h: 660 },
  notepadPlusPlus: { w: 900, h: 620 },
  sevenZip: { w: 700, h: 500 },
  qbittorrent: { w: 900, h: 620 },
  crystalDiskInfo: { w: 760, h: 540 },
  gpuZ: { w: 480, h: 580 },
  processHacker: { w: 900, h: 620 },
  stickyNotes: { w: 600, h: 480 },
  clockApp: { w: 500, h: 500 },
  jellyfin: { w: 1000, h: 680 },
};

export const useWindowStore = create<WindowStore>((set) => ({
  windows: [],

  openWindow: (appId, title, appProps) => set((s) => {
    const TASKBAR_H = 40;
    const offset = (s.windows.filter(w => !w.isMinimized).length % 12) * 24;
    const { w, h } = defaultSizes[appId] ?? { w: 700, h: 500 };
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 720;
    const rawTop = 40 + offset;
    const rawLeft = 80 + offset;
    const top = Math.min(rawTop, Math.max(0, vh - TASKBAR_H - h));
    const left = Math.min(rawLeft, Math.max(0, vw - w));
    const newWin: WindowInstance = {
      id: uuidv4(),
      appId,
      title,
      top,
      left,
      width: Math.min(w, vw),
      height: Math.min(h, vh - TASKBAR_H),
      isMinimized: false,
      isMaximized: false,
      appProps,
    };
    return { windows: [...s.windows, newWin] };
  }),

  closeWindow: (id) => set((s) => ({ windows: s.windows.filter(w => w.id !== id) })),

  minimizeWindow: (id) => set((s) => ({
    windows: s.windows.map(w => w.id === id ? { ...w, isMinimized: true } : w),
  })),

  restoreWindow: (id) => set((s) => ({
    windows: s.windows.map(w => w.id === id ? { ...w, isMinimized: false } : w),
  })),

  toggleMaximize: (id) => set((s) => ({
    windows: s.windows.map(w => {
      if (w.id !== id) return w;
      if (w.isMaximized) {
        const prev = w.prevBounds ?? { top: 50, left: 80, width: 800, height: 500 };
        return { ...w, isMaximized: false, ...prev, prevBounds: undefined };
      }
      return { ...w, isMaximized: true, prevBounds: { top: w.top, left: w.left, width: w.width, height: w.height } };
    }),
  })),

  focusWindow: (id) => set((s) => {
    const win = s.windows.find(w => w.id === id);
    if (!win) return s;
    return { windows: [...s.windows.filter(w => w.id !== id), win] };
  }),

  updatePosition: (id, top, left) => set((s) => ({
    windows: s.windows.map(w => w.id === id ? { ...w, top, left } : w),
  })),

  updateSize: (id, width, height, top, left) => set((s) => ({
    windows: s.windows.map(w => w.id === id ? { ...w, width, height, top, left } : w),
  })),

  snapWindow: (id, position) => set((s) => {
    const TASKBAR_H = 40;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 720;
    const usableH = vh - TASKBAR_H;
    return {
      windows: s.windows.map(w => {
        if (w.id !== id) return w;
        if (position === 'top') {
          return { ...w, isMaximized: true, prevBounds: { top: w.top, left: w.left, width: w.width, height: w.height } };
        }
        const snapW = Math.floor(vw / 2);
        const snapLeft = position === 'left' ? 0 : snapW;
        return {
          ...w,
          isMaximized: false,
          top: 0,
          left: snapLeft,
          width: snapW,
          height: usableH,
          prevBounds: { top: w.top, left: w.left, width: w.width, height: w.height },
        };
      }),
    };
  }),
}));
