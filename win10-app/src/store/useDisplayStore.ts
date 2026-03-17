import { create } from 'zustand';

export type MonitorArrangement = 'primary-left' | 'primary-right';

interface DisplayStore {
  arrangement: MonitorArrangement;
  setArrangement: (a: MonitorArrangement) => void;
  swap: () => void;
}

export const useDisplayStore = create<DisplayStore>((set) => ({
  arrangement: 'primary-left',
  setArrangement: (arrangement) => set({ arrangement }),
  swap: () => set(s => ({
    arrangement: s.arrangement === 'primary-left' ? 'primary-right' : 'primary-left',
  })),
}));
