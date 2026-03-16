import { create } from 'zustand';

interface DesktopStore {
  startMenuOpen: boolean;
  toggleStartMenu: () => void;
  closeStartMenu: () => void;
  restartRequested: boolean;
  requestRestart: () => void;
  clearRestartRequest: () => void;
}

export const useDesktopStore = create<DesktopStore>((set) => ({
  startMenuOpen: false,
  toggleStartMenu: () => set((s) => ({ startMenuOpen: !s.startMenuOpen })),
  closeStartMenu: () => set({ startMenuOpen: false }),
  restartRequested: false,
  requestRestart: () => set({ restartRequested: true }),
  clearRestartRequest: () => set({ restartRequested: false }),
}));
