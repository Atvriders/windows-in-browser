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
}

const defaultSizes: Record<AppID, { w: number; h: number }> = {
  fileExplorer: { w: 800, h: 500 },
  browser: { w: 900, h: 600 },
  notepad: { w: 600, h: 400 },
  settings: { w: 700, h: 500 },
};

export const useWindowStore = create<WindowStore>((set) => ({
  windows: [],

  openWindow: (appId, title, appProps) => set((s) => {
    const offset = s.windows.filter(w => !w.isMinimized).length * 25;
    const { w, h } = defaultSizes[appId] ?? { w: 700, h: 500 };
    const newWin: WindowInstance = {
      id: uuidv4(),
      appId,
      title,
      top: 50 + offset,
      left: 80 + offset,
      width: w,
      height: h,
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
}));
