# Windows 10 in Browser

A faithful Windows 10 simulation built in React + TypeScript — runs entirely in the browser with no VM or backend required.

![Windows 10 Clone](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Docker](https://img.shields.io/badge/Docker-ready-2496ED)

## Features

### Desktop & Shell
- Animated boot screen with Windows logo and loading dots
- Windows 10 startup chime (synthesized via Web Audio API — no audio files)
- 8 rotating desktop wallpapers (CSS gradients cycling every 10 minutes)
- Fully functional taskbar with clock, system tray, Start button
- Start menu with 26 apps, search, pinned tiles, and power options
- Window manager — open, minimize, maximize, resize, drag, z-order focus
- Shut down, restart, and sleep animations

### System Tray
- Wi-Fi panel with 10 networks to connect to
- Volume control
- Notification center
- Action center quick toggles

### Apps

| App | Description |
|-----|-------------|
| **File Explorer** | Virtual filesystem with folders, files, breadcrumb navigation |
| **Browser** | In-app browser with bookmarks bar, address bar, Google search fallback, 10+ preset sites |
| **Notepad** | Text editor with File/Edit menu |
| **Task Manager** | 6 tabs — Processes, Performance (CPU/RAM/GPU/Disk), Startup, Users, Details, Services |
| **Calculator** | Full arithmetic calculator with history |
| **Paint** | Canvas drawing with pencil, eraser, flood fill, line, rect, ellipse, 20-color palette |
| **Settings** | Complete Settings app with 9 pages (see below) |
| **Windows Store** | 18+ apps to browse, category filter, install simulation |
| **Snipping Tool** | Mode selector, delay picker, annotation toolbar |
| **Calendar** | Monthly grid, event add/delete, mini calendar sidebar |
| **Maps** | Simulated map with CSS roads, landmark markers, map/satellite toggle |
| **Spotify** | Sidebar nav, playlists, now-playing bar with progress and volume |
| **Discord** | Server list, channels, member list, live message sending |
| **VLC** | Playlist, transport controls, audio visualizer |
| **Word / Excel / PowerPoint** | Office suite stubs |
| **Outlook / OneNote** | Email and notes stubs |
| **Photoshop / Illustrator / Premiere / After Effects** | Adobe suite stubs |
| **AutoCAD / SolidWorks** | CAD suite stubs |
| **Steam** | Game launcher stub |

### Settings App (9 pages)
- **System** — display brightness, resolution, sound volume, device info
- **Devices** — connected Bluetooth devices, printers
- **Network & Internet** — Wi-Fi toggle, Bluetooth, IP/DNS info, advanced options
- **Personalization** — dark mode, accent colors, background, taskbar options
- **Apps & Features** — searchable app list with Modify/Uninstall buttons
- **Accounts** — user profile, sign-in options (PIN, Face, Fingerprint)
- **Time & Language** — timezone, region, language selector
- **Privacy** — per-permission toggles (camera, mic, location, etc.)
- **Update & Security** — full Windows Update simulation (see below)

### Windows Update Simulation
1. Click **Check for updates** — spins for 4–8 seconds
2. Finds 2–5 randomly selected updates (Security, Driver, Cumulative, Definition types)
3. **Download phase**: 15–40 seconds with animated progress bar
4. **Install phase**: 15–30 seconds with per-update status icons
5. Plays a completion chime when done
6. Shows **Restart now** banner — clicking it triggers the full reboot animation
- Full update history with KB numbers and dates
- Delivery optimization stats panel
- Pause updates / Active hours toggles

### Virtual Filesystem
- **System32**: 50+ tools — `cmd.exe`, `powershell.exe`, `mmsys.cpl`, `sysdm.cpl`, `appwiz.cpl`, `ncpa.cpl`, `gpedit.msc`, `services.msc`, `ipconfig.exe`, `ping.exe`, and more
- **Downloads**: 25+ realistic installer files (Chrome, Discord, Spotify, Steam, OBS, Python, Node, Git, etc.)
- **Documents, Pictures, Music, Videos**: subfolders with realistic content files

## Tech Stack

- **React 18** + **TypeScript** (strict)
- **Vite 5** for dev server and production build
- **Zustand** for global state (window manager, filesystem, desktop, update signals)
- **Web Audio API** for all sounds — no external audio files
- **CSS** only for wallpapers and animations — no image assets required

## Running Locally

```bash
cd win10-app
npm install
npm run dev
```

Open http://localhost:5173

## Docker Deployment

The app is served as a static site behind an Nginx proxy via Docker.

```bash
docker compose up -d
```

Open http://localhost:8080

The Docker image is automatically built and pushed to `ghcr.io/atvriders/windows-in-browser` via GitHub Actions on every push to `master`.

## Project Structure

```
win10-app/src/
├── apps/           # Individual app components (Calculator, Settings, Paint, …)
├── components/
│   ├── Boot/       # BootScreen, ShutdownScreen
│   ├── Desktop/    # Desktop, wallpaper logic
│   ├── StartMenu/
│   ├── Taskbar/    # SystemTray, WiFi panel, clock
│   └── Window/     # Window chrome, drag/resize
├── filesystem/     # initialTree.ts — virtual FS definition
├── store/          # Zustand stores (windows, filesystem, desktop)
├── types/          # AppID union type, FSNode, Window interfaces
└── utils/          # sounds.ts (Web Audio API)
```
