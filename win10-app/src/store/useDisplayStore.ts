import { create } from 'zustand';

export type MonitorPosition = 'left' | 'right' | null;

interface DisplayStore {
  /** Position of THIS tab in the virtual desktop layout */
  myPosition: MonitorPosition;
  /** Whether another tab on the same origin is connected and has answered a ping */
  pairedConnected: boolean;
  /** Position the paired tab reported */
  pairedPosition: MonitorPosition;

  setMyPosition: (p: MonitorPosition) => void;
  setPairedConnected: (v: boolean) => void;
  setPairedPosition: (p: MonitorPosition) => void;
}

export const useDisplayStore = create<DisplayStore>((set) => ({
  myPosition: null,
  pairedConnected: false,
  pairedPosition: null,

  setMyPosition: (myPosition) => set({ myPosition }),
  setPairedConnected: (pairedConnected) => set({ pairedConnected }),
  setPairedPosition: (pairedPosition) => set({ pairedPosition }),
}));
