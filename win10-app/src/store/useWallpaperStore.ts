import { create } from 'zustand';

export const WALLPAPERS = [
  'radial-gradient(ellipse at 30% 60%, #0a3a6b 0%, #0a1628 40%, #061020 100%)',
  'linear-gradient(165deg, #06091a 0%, #0d1a38 20%, #1a2a58 38%, #2a3a70 52%, #4a4878 65%, #6a5880 78%, #8a6878 90%, #9a7878 100%)',
  'linear-gradient(175deg, #020c08 0%, #061808 15%, #0d2a14 30%, #143818 45%, #1a4820 58%, #1e5228 70%, #183d1e 85%, #0d2410 100%)',
  'radial-gradient(ellipse at 50% 100%, #0d2b5e 0%, #030a1a 60%, #000510 100%)',
  'linear-gradient(170deg, #08102a 0%, #101a40 18%, #1a2858 34%, #1e3060 48%, #1a2840 62%, #101820 78%, #080e14 100%)',
  'radial-gradient(ellipse at 60% 40%, #0a0020 0%, #180040 25%, #300868 50%, #401880 70%, #2a1050 88%, #100828 100%)',
  'linear-gradient(180deg, #001020 0%, #002040 22%, #003870 40%, #0058a0 58%, #0078d4 78%, #1090e8 92%, #28a8ff 100%)',
  'conic-gradient(from 200deg at 40% 60%, #030818 0deg, #081428 70deg, #0a1a38 140deg, #060e20 210deg, #040a18 280deg, #030818 360deg)',
  'linear-gradient(180deg, #080e1a 0%, #0c1828 18%, #102238 34%, #143050 50%, #103868 66%, #0c2850 80%, #081820 100%)',
  'linear-gradient(175deg, #1a2030 0%, #2a3448 18%, #304060 35%, #284870 52%, #204870 68%, #183850 82%, #102030 100%)',
  'linear-gradient(165deg, #020a06 0%, #041410 18%, #082818 35%, #0c3020 52%, #0a2818 68%, #061808 84%, #020c06 100%)',
  'linear-gradient(180deg, #0c1828 0%, #102038 16%, #183458 32%, #1e4070 48%, #1a3860 62%, #14284a 76%, #0c1830 90%, #080e1c 100%)',
  'linear-gradient(170deg, #06080c 0%, #0c1018 18%, #141c28 34%, #1a2438 50%, #141e30 65%, #0e1622 80%, #080c14 100%)',
  'linear-gradient(155deg, #0c0818 0%, #181430 18%, #242048 35%, #2e2858 52%, #28204c 68%, #1c1638 84%, #100c22 100%)',
  'linear-gradient(165deg, #020810 0%, #040e18 15%, #061828 30%, #0a2838 45%, #0c3040 58%, #0e3848 70%, #0c3040 82%, #081828 92%, #040e18 100%)',
  'radial-gradient(ellipse at 50% 110%, #380808 0%, #200404 18%, #100202 35%, #080101 55%, #040101 75%, #020101 100%)',
  'linear-gradient(180deg, #0e1c2c 0%, #162840 16%, #1e3858 32%, #1a3858 50%, #162e4a 66%, #102038 82%, #0a1428 100%)',
  'linear-gradient(160deg, #0c0c0c 0%, #181010 18%, #241808 35%, #301c08 52%, #281808 68%, #181008 84%, #0c0a04 100%)',
  'linear-gradient(175deg, #0a1828 0%, #102040 18%, #183462 34%, #162e58 50%, #101e38 65%, #0c1428 80%, #060a14 100%)',
  'linear-gradient(165deg, #030810 0%, #060c16 16%, #08101e 32%, #0a1424 48%, #081018 64%, #060c12 80%, #04080e 100%)',
  'linear-gradient(170deg, #060812 0%, #0a0e20 15%, #10183a 30%, #18204a 45%, #141c40 60%, #0e1430 76%, #080c20 90%, #040610 100%)',
  'linear-gradient(165deg, #080c12 0%, #0c1220 18%, #121e34 35%, #182848 52%, #142040 68%, #0e1830 84%, #080e1e 100%)',
  'radial-gradient(ellipse at 50% 0%, #081828 0%, #041020 25%, #020810 55%, #010408 80%, #010306 100%)',
  'linear-gradient(160deg, #020810 0%, #041020 18%, #061828 35%, #081e32 52%, #061828 68%, #041020 84%, #020810 100%)',
];

interface WallpaperState {
  wallpaperIdx: number;
  cycleInterval: number; // seconds; 0 = off
  setWallpaperIdx: (idx: number) => void;
  nextWallpaper: (total: number) => void;
  setCycleInterval: (secs: number) => void;
}

export const useWallpaperStore = create<WallpaperState>((set) => ({
  wallpaperIdx: 0,
  cycleInterval: 0,
  setWallpaperIdx: (idx) => set({ wallpaperIdx: idx }),
  nextWallpaper: (total) => set((s) => ({ wallpaperIdx: (s.wallpaperIdx + 1) % total })),
  setCycleInterval: (secs) => set({ cycleInterval: secs }),
}));
