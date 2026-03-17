# Project Context for Claude

## User preferences
- GitHub: **Atvriders** (klassenjames0@gmail.com)
- Short, direct responses — no preamble, no trailing summaries
- Pushes directly to `master`, no PR workflow
- No `gh` CLI — use `curl` against GitHub API with token in remote URL

---

## What this project is

A **React 18 + TypeScript browser simulation of Windows 10**, running entirely in the browser with no backend. It looks and feels like a real Windows 10 desktop: boot screen, Start Menu, taskbar, draggable/resizable windows, ~45 working apps (File Explorer, qBittorrent, Task Manager, Notepad, CMD, Settings, Steam, Discord, Spotify, VLC, etc.).

**Repo:** https://github.com/Atvriders/windows-in-browser
**Local path:** `/home/kasm-user/windows-in-browser`
**App source root:** `win10-app/src/`

**Stack:** React 18 · TypeScript (strict) · Vite 5 · Zustand · Plain CSS per component

**Build commands:**
```bash
node_modules/.bin/tsc -b --noEmit    # type-check only
node_modules/.bin/vite build         # production build
```
Node: `/home/kasm-user/.local/node/bin/node`

---

## File-by-file reference

### `win10-app/src/main.tsx`
Standard React entry point. Mounts `<App />` into `#root`.

---

### `win10-app/src/App.tsx`
Top-level state machine. `AppState` is one of: `'booting' | 'running' | 'restarting' | 'shutting_down' | 'sleeping'`.

- Starts in `'booting'` → shows `<BootScreen>` → on complete transitions to `'running'` → shows `<Desktop>`
- `onRestart` / `onShutdown` / `onSleep` are passed down to Desktop → StartMenu for power options
- Watches `useDesktopStore.restartRequested` — Windows Update triggers this to force a restart cycle
- Sleep just hides the desktop for 3 seconds then comes back (no real sleep)

---

### `win10-app/src/store/useWindowStore.ts`
**Zustand store. Manages all open windows.**

Each window is a `WindowInstance`: `{ id, appId, title, top, left, width, height, isMinimized, isMaximized, appProps?, prevBounds? }`

Key actions:
- `openWindow(appId, title, appProps?)` — creates a new window, positions it offset from existing windows, clamps to viewport
- `closeWindow(id)` — removes it
- `minimizeWindow` / `restoreWindow` / `toggleMaximize` / `focusWindow`
- `focusWindow` works by moving the target window to the END of the `windows` array — `WindowManager` renders windows in array order so last = highest z-index

`defaultSizes` maps every `AppID` to a default `{w, h}`. **When adding a new app, add its default size here.**

---

### `win10-app/src/store/useDesktopStore.ts`
Small Zustand store. Manages:
- `startMenuOpen` — whether Start Menu is visible
- `restartRequested` — flag set by Windows Update (Settings app) to trigger a restart

---

### `win10-app/src/store/useFileSystemStore.ts`
**Zustand store with `persist` middleware. The filesystem survives page refreshes.**

Persists to `localStorage` under key `'win10_fs'`. Only `fs` (the node tree) is persisted — `driver` is re-created on mount.

- `fs: VirtualFS` — the raw node tree (`{ rootId, nodes: Record<string, FSNode> }`)
- `driver: FileSystemDriver | null` — the API layer over the tree
- `initDriver()` — called once on Desktop mount to wire up the driver

---

### `win10-app/src/filesystem/initialTree.ts`
**Builds the initial virtual filesystem tree from scratch.**

Uses two helpers:
- `d(name, parentId)` → creates a directory, returns its UUID
- `f(name, parentId, content?, mimeType?)` → creates a file, returns its UUID

Root node is hardcoded: `id: 'root'`, `name: 'This PC'`.

**Drive structure (all are direct children of `rootId`):**

| Drive | Purpose | Notable content |
|-------|---------|-----------------|
| `C:` | OS | Full Windows dir tree: System32 (40+ DLLs/EXEs), Program Files, Users (Desktop, Documents, Downloads, etc.), ProgramData, Windows |
| `D:` | Games 1 | Installed Steam games |
| `E:` | Games 2 | More Steam games |
| `F:` | Storage | General file storage |
| `G:` | Mods | Game mod files |
| `N:` | NAS-Media | Music (FLAC), movies (MP4), home videos |
| `P:` | NAS-Personal | Photos, documents, personal backups |
| `Q:` | NAS-Seeds1 | Live music: Grateful Dead, Phish, other concerts |
| `R:` | NAS-Seeds2 | Texts, video, educational content |
| `S:` | NAS-Seeds3 | World music, concert films, radio |
| `T:` | NAS-Seeds4 | Photography, periodicals, academic |
| `U:` | NAS-Seeds5 | Classical, jazz, blues |
| `V:` | NAS-Seeds6 | Video, film, games archives |
| `W:` | NAS-Seeds7 | Texts, newspapers, radio dramas |
| `Z:` | NAS-Archive | Archive.org backups |

**To add a new drive:** call `d('X:', rootId)` then build subdirs under it. Do this before the `// ProgramData` comment (around line 809).

**Important:** Adding a drive to `initialTree.ts` alone is NOT enough — you must ALSO update `FileExplorer.tsx` (see below). The filesystem only makes a drive browsable; the File Explorer decides what to display.

---

### `win10-app/src/filesystem/FileSystemDriver.ts`
API class wrapping the raw node tree. Methods: `getNode(id)`, `getChildren(id)`, `createDirectory(parentId, name)`, `createFile(parentId, name)`, `deleteNode(id)`, `renameNode(id, name)`, `update(fs)`. Used by `FileExplorer` and `Notepad`.

---

### `win10-app/src/components/Desktop/Desktop.tsx`
The main shell when the OS is "running":

- Renders the desktop wallpaper (CSS gradient), cycles through 8 wallpapers every 10 minutes
- `DESKTOP_SHORTCUTS` — array of `[appId, label, icon]` tuples, rendered as desktop icons. **Add new app shortcuts here.**
- Also renders `DesktopIcon` nodes from the filesystem's `Desktop` folder (real FS items)
- Calls `initDriver()` once on mount
- Keyboard shortcuts: `Alt+F4` closes top window, `Meta` toggles Start Menu
- Renders: `<WindowManager>`, `<StartMenu>` (if open), `<Taskbar>`

---

### `win10-app/src/components/Taskbar/Taskbar.tsx`
The bottom bar. Contains: `<StartButton>` | taskbar items (one per open window) | `<SystemTray>`.

---

### `win10-app/src/components/Taskbar/SystemTray.tsx`
**The right side of the taskbar. Contains the battery, Wi-Fi, volume, and clock.**

#### Battery system — IMPORTANT
The battery is a self-contained simulation inside `SystemTray`:

- Starts at 100%
- **Drains at `BATTERY_DRAIN_INTERVAL = 36_000 ms` (36 seconds) per 1%** → full drain in exactly 1 hour
- `battery` state: number 0–100
- `dead` state: boolean — becomes `true` when battery hits 0
- When `dead` becomes `true`: a full-screen overlay appears (`battery-dead-overlay`) with an animated "stealing your power to recharge" message and a charging bar animation
- After 6 seconds (`dead` timeout), `dead` resets to `false` and `battery` resets to 100 — it "recharges" and the overlay disappears
- Battery indicator in the tray: a small bar + percentage text. Green >40%, orange >20%, red ≤20%
- Clicking the battery tray icon opens a `battery-panel` popup showing: large icon, percentage, status text, progress bar, estimated minutes remaining (`battery * 0.6` minutes), and a "Power & battery settings" button that opens Settings
- `getBatteryIcon(pct)` always returns `'🔋'` or `'🪫'` (emoji) — there is no SVG, just emoji

**Do not refactor the battery to use the Web Battery API** — the whole point is a fake simulated drain.

#### Wi-Fi / Bluetooth panel
- `WIFI_NETWORKS` — static list of 10 fake networks with signal strength (1–4) and secured flag
- `BT_DEVICES` — 4 fake Bluetooth devices
- Clicking the network tray icon opens a tabbed panel (Wi-Fi / Bluetooth)
- Wi-Fi tab: toggle on/off, shows connected network, lists available networks, "Connect" switches active network
- Bluetooth tab: toggle on/off, lists paired/connected devices

#### Clock
- Real system time, updates every 1 second, formatted as `HH:MM` / `M/D/YYYY`

---

### `win10-app/src/components/Window/Window.tsx`
Draggable, resizable window frame. Contains `<TitleBar>` (close/min/max buttons) and renders the correct app component based on `win.appId`. z-index comes from its position in the `windows` array.

### `win10-app/src/components/Window/WindowManager.tsx`
Maps `useWindowStore.windows` → `<Window>` components. Windows are rendered in array order; the last element is on top (highest z-index = `100 + index`).

### `win10-app/src/components/Window/TitleBar.tsx`
The `━━━ □ ✕` bar. Handles drag (mousedown → mousemove), double-click to maximize, and the three control buttons.

### `win10-app/src/components/Window/ResizeHandles.tsx`
8 invisible resize handles around the window edges/corners.

---

### `win10-app/src/components/Boot/BootScreen.tsx`
Animated Windows 10 boot screen (spinning dots). Calls `onComplete` after the animation.

### `win10-app/src/components/Boot/ShutdownScreen.tsx`
Full-screen black overlay with a message ("Shutting down...", "Restarting...", "Sleeping...").

---

### `win10-app/src/components/StartMenu/StartMenu.tsx`
Full Start Menu: search bar, pinned app tiles, all apps list, power options (Restart/Shutdown/Sleep → calls the handlers from `App.tsx`).

---

### `win10-app/src/apps/FileExplorer/FileExplorer.tsx`
Full virtual filesystem browser. **The most complex app.**

Key internals:
- `currentId` — UUID of the currently viewed directory
- `isThisPC` — `currentId === fs.rootId` → shows drive overview instead of file grid
- `history[]` + `historyIdx` — back/forward navigation
- `handleOpen(node)` — double-clicking a file: special cases for `.exe`/`.msc`/`.cpl` open the matching app; everything else opens in Notepad

**`DRIVE_SPACE`** (defined at line ~124): a `Record<string, {total, used, label, icon}>` mapping drive letters to GB sizes and display names. ALL sizes are in **GB** (NAS drives: 96TB = 98304 GB, etc.). This powers the status bar and drive cards. **Must be updated when adding new drives.**

**"This PC" overview** (when `isThisPC`):
- Section 1 "Devices and drives": filters children by `['C:','D:','E:','F:','G:']`
- Section 2 "Network locations (NAS)": filters by `['N:','P:','Q:','R:','S:','T:','U:','V:','W:','Z:']`
- Each drive renders as a card with icon, letter, label, a usage bar (blue <75%, orange 75–90%, red >90%), and free/total text

**Sidebar**:
- "This PC" group: local drives `['C:','D:','E:','F:','G:']`
- "Network (NAS)" group: NAS drives `['N:','P:','Q:','R:','S:','T:','U:','V:','W:','Z:']`

**Status bar** (bottom): shows the current drive's usage bar when browsing inside a drive.

**RULE: When adding a new drive, update ALL of these in `FileExplorer.tsx`:**
1. `DRIVE_SPACE` record — add `'X:': { total, used, label, icon: '🗄️' }`
2. NAS filter in sidebar (line ~216)
3. Both NAS filter arrays in the This PC overview (lines ~260 and ~264)

---

### `win10-app/src/apps/QBittorrent/QBittorrent.tsx`
Fake qBittorrent UI with full feature simulation.

**`Torrent` interface:**
```typescript
interface Torrent {
  id: number;
  name: string;
  size: string;       // "32.4 GB"
  sizeBytes: number;  // bytes
  done: number;       // 0–100
  status: 'seeding' | 'downloading' | 'paused';
  seeds: number;
  peers: number;
  dlSpeed: number;    // KB/s
  ulSpeed: number;    // KB/s
  eta: string;
  added: string;      // "YYYY-MM-DD HH:MM"
  savePath: string;   // Windows path "Q:\\Live-Music\\"
  hash: string;
  category: string;
  tracker: string;
  typeIcon: string;   // emoji
  files: TorrentFile[];
}
```

**`mk()` helper** (line 36) — compact factory for Archive.org torrents:
```typescript
mk(id, name, size, sizeGB, savePath, icon, seeds, ul, files, added?)
```
Sets defaults: `status:'seeding'`, `done:100`, `dlSpeed:0`, `peers: Math.round(seeds*0.07)`, `category:'Archive.org'`, `tracker:'http://bt1.archive.org:6969/announce'`, hash derived from id.
`files` is `[name, size][]` pairs.

**`INITIAL_TORRENTS`** — 521 entries:
- IDs 1–70: full verbose objects. Various categories: Linux ISOs, Games, Movies, TV Shows, Archive.org
- IDs 71–521: compact `mk()` entries, all `Archive.org` category

**Save path ranges:**
- `Q:\\Live-Music\\Grateful-Dead\\` — IDs 71–86
- `Q:\\Live-Music\\Phish\\` — IDs 87–101
- `Q:\\Live-Music\\` — IDs 102–186
- `U:\\Classical\\` — IDs 187–226
- `U:\\Jazz\\` — IDs 227–261
- `U:\\Blues-Folk\\` — IDs 262–291
- `W:\\Texts\\` — IDs 292–331
- `W:\\Newspapers\\` — IDs 332–361
- `V:\\Silent-Films\\` — IDs 362–381
- `V:\\Documentaries\\` — IDs 382–411
- `V:\\Animation\\` — IDs 412–426
- `V:\\Software\\` — IDs 427–466
- `W:\\Radio\\` — IDs 467–491
- `T:\\Academic\\` — IDs 492–521

**`CATEGORIES`**: `['Linux ISOs', 'Games', 'Movies', 'TV Shows', 'Archive.org']`

---

### Other notable apps

| App | File | Notes |
|-----|------|-------|
| CMD | `apps/CMD/CMD.tsx` | Fake terminal, processes a fixed set of commands |
| Task Manager | `apps/TaskManager/TaskManager.tsx` | Fake processes list, simulated CPU/RAM graphs |
| Settings | `apps/Settings/Settings.tsx` | Multiple pages, wallpaper picker, triggers `requestRestart()` on Windows Update |
| WinDirStat | `apps/WinDirStat/WinDirStat.tsx` | Scans all 5 local drives, shows treemap |
| CrystalDiskInfo | `apps/CrystalDiskInfo/CrystalDiskInfo.tsx` | Fake disk health info |
| HWMonitor | `apps/HWMonitor/HWMonitor.tsx` | Fake CPU/GPU temps and voltages |
| CPU-Z | `apps/CPUZ/CPUZ.tsx` | Fake CPU info tabs |
| GPU-Z | `apps/GPUZ/GPUZ.tsx` | Fake GPU info |
| Process Hacker | `apps/ProcessHacker/ProcessHacker.tsx` | Fake process list with memory/CPU columns |
| Disk Management | `apps/DiskManagement/DiskManagement.tsx` | Shows all drives as visual partitions |
| Device Manager | `apps/DeviceManager/DeviceManager.tsx` | Fake device tree |
| Registry Editor | `apps/RegistryEditor/RegistryEditor.tsx` | Fake registry tree |

---

### `win10-app/src/types/`
- `window.ts` — `WindowInstance`, `AppID` union type (every known appId string)
- `filesystem.ts` — `FSNode`, `VirtualFS`

**When adding a new app:** add its `appId` string to the `AppID` union in `types/window.ts`, add its default size to `defaultSizes` in `useWindowStore.ts`, add it to the app router inside `Window.tsx`, and optionally add it to `DESKTOP_SHORTCUTS` in `Desktop.tsx`.

---

## Drive sizes reference (GB)

| Drive | Total (GB) | Used (GB) |
|-------|-----------|----------|
| C: | 512 | 346.2 |
| D: | 2000 | 1884 |
| E: | 2000 | 1764 |
| F: | 8000 | 6348 |
| G: | 1000 | 862 |
| N: | 98304 | 79872 |
| P: | 73728 | 65536 |
| Q: | 147456 | 138240 |
| R: | 196608 | 184320 |
| S: | 262144 | 251904 |
| T: | 327680 | 315392 |
| U: | 491520 | 473088 |
| V: | 589824 | 573440 |
| W: | 393216 | 378880 |
| Z: | 49152 | 42496 |

---

## GitHub access (no gh CLI)

Token: `YOUR_GITHUB_TOKEN` *(may be expired — user will provide new one)*

```bash
# Push
git push https://TOKEN@github.com/Atvriders/windows-in-browser.git master

# If credential prompt error, try:
GIT_ASKPASS=echo git push https://Atvriders:TOKEN@github.com/Atvriders/windows-in-browser.git master

# Create new repo
curl -s -X POST https://api.github.com/user/repos \
  -H "Authorization: token TOKEN" \
  -d '{"name":"repo-name","private":false}'
git remote add origin https://TOKEN@github.com/Atvriders/repo-name.git
git push -u origin master
```
