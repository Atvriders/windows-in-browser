# win10-app

React + TypeScript + Vite frontend for the Windows 10 browser simulation.

## Dev

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run lint
```

## Adding a new app

1. Add the app ID to `src/types/window.ts` → `AppID` union
2. Create `src/apps/MyApp/MyApp.tsx` (and `.css`)
3. Register a default window size in `src/store/useWindowStore.ts` → `DEFAULT_SIZES`
4. Add a launch handler in `src/components/Desktop/Desktop.tsx` → `openApp()`
5. Add to Start Menu in `src/components/StartMenu/StartMenu.tsx`
