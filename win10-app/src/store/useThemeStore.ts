import { create } from 'zustand';

interface ThemeStore {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (v: boolean) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  darkMode: true,
  toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
  setDarkMode: (v) => set({ darkMode: v }),
}));
