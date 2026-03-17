import { create } from 'zustand';

export type MonitorPosition = 'left' | 'right' | null;

/** Data about a window that is mid-transfer from another tab */
export interface PhantomWindowData {
  appId: string;
  title: string;
  appProps?: Record<string, unknown>;
  /** How many pixels of the window have crossed the screen boundary */
  overlapPx: number;
  winWidth: number;
  winHeight: number;
  winTop: number;
  /** Which edge of THIS screen the window is entering from */
  entryEdge: 'left' | 'right';
}

interface DisplayStore {
  myPosition: MonitorPosition;
  pairedConnected: boolean;
  pairedPosition: MonitorPosition;
  phantomWindow: PhantomWindowData | null;

  setMyPosition: (p: MonitorPosition) => void;
  setPairedConnected: (v: boolean) => void;
  setPairedPosition: (p: MonitorPosition) => void;
  setPhantomWindow: (pw: PhantomWindowData) => void;
  clearPhantomWindow: () => void;
}

export const useDisplayStore = create<DisplayStore>((set) => ({
  myPosition: null,
  pairedConnected: false,
  pairedPosition: null,
  phantomWindow: null,

  setMyPosition:       (myPosition)     => set({ myPosition }),
  setPairedConnected:  (pairedConnected) => set({ pairedConnected }),
  setPairedPosition:   (pairedPosition)  => set({ pairedPosition }),
  setPhantomWindow:    (phantomWindow)   => set({ phantomWindow }),
  clearPhantomWindow:  ()               => set({ phantomWindow: null }),
}));
