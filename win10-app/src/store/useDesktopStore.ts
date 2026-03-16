import { create } from 'zustand';

interface DesktopStore {
  startMenuOpen: boolean;
  toggleStartMenu: () => void;
  closeStartMenu: () => void;
}

export const useDesktopStore = create<DesktopStore>((set) => ({
  startMenuOpen: false,
  toggleStartMenu: () => set((s) => ({ startMenuOpen: !s.startMenuOpen })),
  closeStartMenu: () => set({ startMenuOpen: false }),
}));
