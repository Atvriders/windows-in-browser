import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VirtualFS } from '../types/filesystem';
import { buildInitialTree } from '../filesystem/initialTree';
import { FileSystemDriver } from '../filesystem/FileSystemDriver';

interface FSStore {
  fs: VirtualFS;
  driver: FileSystemDriver | null;
  initDriver: () => void;
  setFS: (fs: VirtualFS) => void;
}

export const useFileSystemStore = create<FSStore>()(
  persist(
    (set, get) => ({
      fs: buildInitialTree(),
      driver: null,

      initDriver: () => {
        const setFS = (fs: VirtualFS) => set({ fs });
        const driver = new FileSystemDriver(get().fs, setFS);
        set({ driver });
      },

      setFS: (fs) => {
        get().driver?.update(fs);
        set({ fs });
      },
    }),
    {
      name: 'win10_fs',
      partialize: (s) => ({ fs: s.fs }),
    }
  )
);
