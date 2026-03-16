# Windows 10 in Browser

A faithful Windows 10 simulation built in React + TypeScript — runs entirely in the browser with no VM or backend required.

![Windows 10 Clone](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Docker](https://img.shields.io/badge/Docker-ready-2496ED)

## Features

### Desktop & Shell
- Animated boot screen with Windows logo and loading dots
- Windows 10 startup chime (synthesized via Web Audio API — no audio files)
- 8 rotating desktop wallpapers (CSS gradients cycling every 10 minutes)
- Fully functional taskbar with clock, system tray, Start button
- Start menu with 40+ apps, search, pinned tiles, and power options
- Window manager — open, minimize, maximize, resize, drag, z-order focus
- Shut down, restart, and sleep animations

### System Tray
- Wi-Fi panel with 10 networks to connect to
- Volume control
- Notification center
- Action center quick toggles
- **Battery indicator** — drains 100 → 0% over 1 hour; at 0% plays a fullscreen "stealing your power to recharge" animation then resets

### Apps

#### Productivity & Office
| App | Description |
|-----|-------------|
| **File Explorer** | Virtual filesystem — 10 drives (C–G local + N/P/Q/R/S/T/Z NAS), "This PC" overview with drive cards and usage bars, 90+ game install folders, full Program Files tree |
| **Notepad** | Text editor with File/Edit menus |
| **Notepad++** | Tabbed code editor with syntax highlighting for HTML, CSS, JS, Python, Markdown; line numbers, status bar |
| **Word / Excel / PowerPoint** | Office suite with ribbon UI |
| **Outlook / OneNote** | Email client and notes app |
| **Calculator** | Full arithmetic calculator with history |
| **Calendar** | Monthly grid, event add/delete, mini calendar sidebar |
| **Snipping Tool** | Mode selector, delay picker, annotation toolbar |
| **Paint** | Canvas drawing with pencil, eraser, flood fill, line, rect, ellipse, 20-color palette |

#### Communication & Media
| App | Description |
|-----|-------------|
| **Discord** | 12 servers with category/channel structure, 30 DM contacts, live messaging, collapsible categories |
| **Microsoft Teams** | 25 DMs, 5 team workspaces with channels, calendar, call history, file recents |
| **Spotify** | Sidebar nav, playlists, now-playing bar with progress and volume |
| **VLC** | Playlist, transport controls, audio visualizer |

#### Gaming & Tools
| App | Description |
|-----|-------------|
| **Steam** | ~350 real game titles with genres, sizes, and playtimes; library filter/sort, game details panel |
| **OBS Studio** | Scene/source management, audio mixer with VU meters, streaming/recording with live timers, Studio Mode |
| **qBittorrent** | 70+ torrents — Archive.org seeding (Grateful Dead, NASA, Phish, Bruce Springsteen, John Peel Sessions, NYT archive, Bell Labs, etc.), plus games/movies/Linux ISOs; live speed animation, torrent detail tabs, category sidebar |

#### System & Monitoring
| App | Description |
|-----|-------------|
| **Task Manager** | 6 tabs — Processes, Performance (CPU/RAM/GPU/Disk), Startup, Users, Details, Services |
| **Process Hacker** | 40 real Windows processes with live CPU/memory updates, color-coded by type |
| **CrystalDiskInfo** | 4 drives (2× Samsung NVMe, WD Black, Seagate HDD) with S.M.A.R.T. tables and live temps |
| **GPU-Z** | Full RTX 4090 specs, 10 live sensor readings (clock, temp, load, power, VRAM) |
| **CPU-Z** | CPU/cache/mainboard/memory tabs with full spec readout |
| **HWMonitor** | System-wide sensor tree — temperatures, voltages, fan speeds, power draw |
| **WinDirStat** | Disk usage analyzer with collapsible directory tree, extension list, and treemap visualization |
| **Device Manager** | Device tree with expand/collapse |
| **Disk Management** | Disk 0/1 partition layout |
| **Registry Editor** | HKEY tree navigation |

#### Security & Network
| App | Description |
|-----|-------------|
| **Wireshark** | Live packet capture simulation — TCP/UDP/DNS/HTTP/TLS/ARP/ICMP with filter bar, detail tree, hex dump |
| **Malwarebytes** | Scan simulation with threat detection, quarantine, real-time protection toggles |
| **CCleaner** | Analyze/clean phases with animated progress, junk results list, registry cleaner tab |
| **IP Scanner** | Network range scanner with live host discovery |

#### Creative & Design
| App | Description |
|-----|-------------|
| **Photoshop / Illustrator / Premiere / After Effects** | Adobe suite with toolbars and panels |
| **AutoCAD / SolidWorks** | CAD suite stubs |
| **7-Zip** | File manager with drive/folder navigation |

#### Web & Misc
| App | Description |
|-----|-------------|
| **Browser** | In-app browser with bookmarks bar, address bar, Google search fallback, 10+ preset sites |
| **Settings** | 9 full pages — see below |
| **Windows Store** | 18+ apps to browse, category filter, install simulation |
| **Maps** | Simulated map with CSS roads, landmark markers, map/satellite toggle |
| **CMD** | Command prompt simulation |

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

#### Local Drives
- **C: Samsung SSD 990 Pro 512GB** — OS drive with System32, Program Files, Users, steamapps
- **D: Samsung SSD 990 Pro 2TB** — Games SSD 1 with 18 AAA game folders
- **E: WD Black SN850X 2TB** — Games SSD 2 with MMOs, strategy games, and media
- **F: Seagate Barracuda 8TB** — Storage HDD with OBS recordings, old projects, VMs
- **G: Crucial P5 Plus 1TB** — Mods & Tools (Skyrim/Minecraft mods, dev tools, ISOs)
- **steamapps/common**: 90+ game install directories matching the Steam library
- **Program Files**: All 40+ installed applications
- **System32**: 50+ tools — `cmd.exe`, `powershell.exe`, `sysdm.cpl`, `gpedit.msc`, `services.msc`, `ipconfig.exe`, etc.

#### NAS Drives (Network)
- **N: Synology DS1823xs+ 96TB** — NAS-Media: 4K/HD movies (90+ films), 4K/HD TV shows, FLAC music library (12 artists / 100+ albums with individual tracks), audiobooks by genre, podcasts
- **P: Synology DS1621+ 72TB** — NAS-Personal: Home videos by year 2010–2024 (real event names), photos, books in 5 genres (epub+PDF), comics (Marvel/DC/Manga/Indie as CBZ)
- **Q: Synology RS4021xs+ 144TB** — NAS-Seeds1: Live Music Archive (100+ bands with individual dated concerts in FLAC), etree archive, audio collections (Folkways, Alan Lomax, Blue Note, Prestige)
- **R: Custom 24-bay 192TB** — NAS-Seeds2: Archive.org texts (Project Gutenberg, Hathi Trust, vintage magazines, comics), video (newsreels, documentary, experimental cinema, TV archives), educational (MIT OCW, Khan Academy, Feynman lectures), software/games archive
- **S: SuperMicro JBOD 256TB** — NAS-Seeds3: World music (African/Latin/MENA/Asian/Eastern European), concert films (Woodstock, Stop Making Sense, Gimme Shelter, etc.), radio sessions (John Peel, KEXP, NPR)
- **T: NetApp FAS8700 320TB** — NAS-Seeds4: Photography archives (FSA-OWI 175,000 photos, LIFE Magazine), historical periodicals (NYT 1851–1980, Guardian, Le Monde), academic archives (arXiv, NASA technical reports, Bell Labs)
- **Z: QNAP TS-873A 48TB** — NAS-Archive: Archive.org (Grateful Dead concerts, NASA films, MS-DOS games, Prelinger Archives, Old Time Radio, 78rpm recordings), system backups, project archives

#### File Explorer — This PC Overview
When navigating to "This PC" (root), the file grid is replaced by **drive cards** showing each drive's icon, label, free/total space, and a color-coded usage bar (blue → orange → red). Local drives and NAS drives are shown in separate sections. The sidebar has a dedicated "Network (NAS)" group.

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

Open http://localhost:3000

The Docker image is automatically built and pushed to `ghcr.io/atvriders/windows-in-browser` via GitHub Actions on every push to `master`.

## Project Structure

```
win10-app/src/
├── apps/           # Individual app components (40+ apps)
├── components/
│   ├── Boot/       # BootScreen, ShutdownScreen
│   ├── Desktop/    # Desktop icons, wallpaper logic
│   ├── StartMenu/
│   ├── Taskbar/    # SystemTray, battery, WiFi panel, clock
│   └── Window/     # Window chrome, drag/resize
├── filesystem/     # initialTree.ts — virtual FS with 5 drives
├── store/          # Zustand stores (windows, filesystem, desktop)
├── types/          # AppID union type, FSNode, Window interfaces
└── utils/          # sounds.ts (Web Audio API)
```
