# Project Context for Claude

## User preferences
- GitHub: **Atvriders** (klassenjames0@gmail.com)
- Short, direct responses — no preamble, no trailing summaries
- Pushes directly to `master`, no PR workflow
- No `gh` CLI — use `curl` against GitHub API with token in remote URL

---

## What this project is

A **React 18 + TypeScript browser simulation of Windows 10**, running entirely in the browser with no backend. It looks and feels like a real Windows 10 desktop: boot screen, Start Menu, taskbar, draggable/resizable windows, ~45 working apps.

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

## Core architecture

### `App.tsx`
State machine: `'booting' | 'running' | 'restarting' | 'shutting_down' | 'sleeping'`
- Starts in `'booting'` → `<BootScreen>` → transitions to `'running'` → `<Desktop>`
- Watches `useDesktopStore.restartRequested` — Windows Update sets this to force a restart
- Sleep hides desktop for 3s then returns

### `store/useWindowStore.ts`
Manages all open windows. Each `WindowInstance`: `{ id, appId, title, top, left, width, height, isMinimized, isMaximized, appProps?, prevBounds? }`
- `openWindow(appId, title, appProps?)` — creates window, positions with 24px cascade offset, clamps to viewport
- `focusWindow(id)` — moves target to END of `windows` array (last = highest z-index = on top)
- `defaultSizes` maps every `AppID` to `{w, h}` — **add entry here when adding a new app**

### `store/useDesktopStore.ts`
- `startMenuOpen` toggle
- `restartRequested` flag (set by Settings/Windows Update, cleared by `App.tsx` after restart)

### `store/useFileSystemStore.ts`
- Zustand with `persist` middleware → survives page refresh via `localStorage` key `'win10_fs'`
- `fs: VirtualFS` — flat node tree `{ rootId, nodes: Record<string, FSNode> }`
- `driver: FileSystemDriver` — API layer; re-created on Desktop mount via `initDriver()`
- Only `fs` is persisted; `driver` is always re-created

### `filesystem/initialTree.ts`
Builds the virtual filesystem. Helpers: `d(name, parentId)` → directory UUID, `f(name, parentId, content?, mimeType?)` → file UUID. Root: `id:'root'`, `name:'This PC'`. New drives go before the `// ProgramData` comment (~line 809).

### `components/Desktop/Desktop.tsx`
- `DESKTOP_SHORTCUTS: [appId, label, icon][]` — 45 shortcuts rendered as desktop icons. Add new apps here.
- 8 CSS gradient wallpapers, cycle every 10 minutes
- `Alt+F4` closes top window; `Meta` toggles Start Menu
- Renders: `<WindowManager>` + `<StartMenu>` (if open) + `<Taskbar>`

### `components/Window/WindowManager.tsx`
Maps `windows` array → `<Window zIndex={100+i}>`. Last window in array = on top.

### `components/Taskbar/SystemTray.tsx`
Right side of taskbar. Contains battery, Wi-Fi, volume, clock.

**Battery system:**
- Starts at 100%, drains 1%/36s → full drain in exactly 1 hour
- `BATTERY_DRAIN_INTERVAL = 36_000` ms
- `dead` state: true when hits 0 → full-screen overlay: "stealing your power to recharge" + animated bar
- After 6s: `dead` resets, `battery` resets to 100 (recharges)
- Tray icon: small bar + percentage. Green >40%, orange >20%, red ≤20%
- Click opens battery popup: icon, %, status, bar, `~Math.round(battery * 0.6)` min remaining, settings link
- **Do NOT replace with Web Battery API** — intentionally fake

**Wi-Fi / Bluetooth:**
- `WIFI_NETWORKS` — 10 fake networks (HomeNetwork_5G connected by default)
- `BT_DEVICES` — 4 devices (AirPods Pro + Magic Keyboard connected, Xbox Controller + iPhone paired)
- Clicking Wi-Fi tray icon opens tabbed panel; clicking a network switches `connectedWifi`

**Clock:** real system time, 1s interval.

---

## FileExplorer — `apps/FileExplorer/FileExplorer.tsx`

- `currentId` — UUID of viewed directory
- `isThisPC` — `currentId === fs.rootId` → shows drive overview (cards) instead of file grid
- `DRIVE_SPACE` at line ~124 — `Record<string, {total, used, label, icon}>` in **GB**. NAS sizes: 96TB = 98304 GB, etc.
- Drive card bars: blue <75%, orange 75–90%, red >90%
- `handleOpen` double-click routing: `.exe`/`.msc`/`.cpl` launch apps; everything else opens in Notepad
- **This PC overview sections:**
  - "Devices and drives": `['C:','D:','E:','F:','G:']`
  - "Network locations (NAS)": `['N:','P:','Q:','R:','S:','T:','U:','V:','W:','Z:']`
- **Sidebar sections:**
  - "This PC": `['C:','D:','E:','F:','G:']`
  - "Network (NAS)": `['N:','P:','Q:','R:','S:','T:','U:','V:','W:','Z:']`

**RULE — when adding a drive, update ALL of:**
1. `DRIVE_SPACE` record
2. NAS filter in sidebar (~line 216)
3. Both NAS filter arrays in This PC overview (~lines 260 & 264)
4. `initialTree.ts` (create the drive directory)

---

## QBittorrent — `apps/QBittorrent/QBittorrent.tsx`

521 torrents. IDs 1–70: full objects. IDs 71–521: compact via `mk()` helper (line 36).

`mk(id, name, size, sizeGB, savePath, icon, seeds, ul, files, added?)` — sets `status:'seeding'`, `done:100`, `dlSpeed:0`, `peers:Math.round(seeds*0.07)`, `category:'Archive.org'`, `tracker:'http://bt1.archive.org:6969/announce'`, hash from id.

**Note:** ID 3 (Cyberpunk 2077) is at 67% `downloading` at 2840 KB/s — the only active download. UL speeds randomize live via setInterval.

**Archive.org save path ranges:**
- `Q:\\Live-Music\\Grateful-Dead\\` — 71–86
- `Q:\\Live-Music\\Phish\\` — 87–101
- `Q:\\Live-Music\\` — 102–186
- `U:\\Classical\\` — 187–226
- `U:\\Jazz\\` — 227–261
- `U:\\Blues-Folk\\` — 262–291
- `W:\\Texts\\` — 292–331
- `W:\\Newspapers\\` — 332–361
- `V:\\Silent-Films\\` — 362–381
- `V:\\Documentaries\\` — 382–411
- `V:\\Animation\\` — 412–426
- `V:\\Software\\` — 427–466
- `W:\\Radio\\` — 467–491
- `T:\\Academic\\` — 492–521

**Categories:** `['Linux ISOs', 'Games', 'Movies', 'TV Shows', 'Archive.org']`

---

## All apps — detailed reference

### AfterEffects
4 hardcoded layers (Title Text, Logo.png, Background, Music.mp3) in a 10s composition. Transport buttons manually step `currentTime` by 0.1 — no auto-advance interval. `playing` is cosmetic.

### AutoCAD
Functional canvas drawing with 20px grid snapping. Tools: select, line, rectangle, circle, polyline. Undo/clear work. `polyline` is in toolbar but **not wired** in `handleMouseUp`. State: `tool`, `shapes`, `drawing`, `startPos`, `cursorPos`, `command`, `cmdHistory`.

### Browser
Simulates Microsoft Edge. YouTube loads via real iframe (`youtube-nocookie.com`). All other URLs use `SimulatedPage` with custom renders for: google.com, github.com, reddit.com, wikipedia.org, stackoverflow.com, ycombinator.com, netflix.com, twitter.com/x.com, waterburp.com (joke 404), private IPs (router admin for .1/.0.1, device info cards for 15 known 192.168.1.x IPs). uBlock shows fake blocked count (random 10–49, fixed per session). Tabs, bookmarks, extensions panel all functional. State: `url`, `inputUrl`, `historyStack`, `tabs`, `activeTab`, `showBookmarks`, `showExtensions`.

### Calculator
Fully working: +/−/×/÷, decimal, backspace, ±, %. Division by zero returns 0. Shows last 5 calculations in history. State: `display`, `prev`, `op`, `waitNext`, `history`.

### Calendar
Today hardcoded to `new Date(2026, 2, 16)` (March 16, 2026). 8 pre-seeded events across March 16–April 1, 2026. Can add/delete events with title, time, color. State: `current`, `events`, `selected`, `showAdd`.

### CCleaner
4 pages: Cleaner, Registry, Tools, Options. 20 junk file templates with randomized size ranges. Analyze: 80ms interval, 1–4%/tick. Clean: 100ms interval, 1–5%/tick. Registry scan shows an alert. Tools page is static. State: `page`, `phase`, `scanFile`, `scanProgress`, `items`, `cleanProgress`.

### CMD
Accepts `powershell?: boolean` prop (changes prompt style).

**Implemented commands:** `cls`, `echo`, `ver`, `whoami`, `hostname`, `date`, `time`, `dir`, `cd`, `ipconfig [/all]`, `ping`, `tracert`, `systeminfo`, `tasklist`, `netstat`, `set`, `tree`, `md`/`mkdir`, `color`, `exit`, `help`

**IP consistency — this PC is always `192.168.1.105`**, gateway `192.168.1.1`.

**Ping behavior:** `ping <anything>` always succeeds — hardcoded 4 replies from `142.250.80.46` at 11/14/11/13ms. **This includes all 192.168.1.x IPs from IPScanner** — pinging any IP from the IP Scanner in CMD will always return a successful reply. The ping doesn't actually resolve the host; it always shows `142.250.80.46` as the resolved address. Tracert shows 4 hops ending at `142.250.80.46`.

**Partial FS tree** for `dir`/`cd`: hardcoded paths for `C:\`, `C:\Users`, `C:\Users\User`, `C:\Windows`, `C:\Windows\System32`, `C:\Program Files`.

### CPU-Z
7 static tabs. CPU: **i7-12700K**, Alder Lake, Socket 1700, 12 cores, 3612.4 MHz. Board: **ASUS PRIME Z690-P**, BIOS 2703. Memory: DDR5 16GB, 2400 MHz CL40. GPU tab: **RTX 4070**, AD104, 4nm, 12GB GDDR6X. State: `tab` only.

### CrystalDiskInfo
4 drives. All health: **Good**. Temperatures fluctuate ±1°C every 2s.
- C: Samsung 990 Pro 512GB NVMe — 17 SMART attrs
- D: Samsung 990 Pro 2TB
- E: WD Black SN850X 2TB
- F: Seagate Barracuda 8TB — 20 SMART attrs (D/E reuse C's SMART data)

**Note:** HWMonitor lists "Samsung SSD 970 EVO Plus" — intentional inconsistency or oversight.

### DeviceManager
15 static device categories. Notable entries: Logitech MX Master 3, Dell S2722DGM monitor, Intel Wi-Fi 6E AX211, RTX 4070 driver 551.86. State: `expanded` (Set), `selected`.

### Discord
12 servers with full channel hierarchies. 30 DM users with status/activity/unread counts. Pre-seeded messages in: #general, #cs2, #help, #announcements, and DMs with Sarah, Sophie, Bella. Sending messages appends to state. State: `server`, `channel`, `messages`, `input`, `dmOpen`, `collapsedCategories`.

### DiskManagement
Fully static, no state. Shows Disk 0 (SSD 512GB: EFI + C: + D:) and Disk 1 (HDD 2TB: E: + F:). Visual partition bars with proportional `flex` sizing. **Note: sizes here differ from `DRIVE_SPACE` in FileExplorer** — intentional cosmetic inconsistency.

### Excel
26 columns × 50 rows. Formula evaluation via `Function()` constructor — supports cell refs (A1), `SUM(A1:A5)`, arithmetic. 3 sheets (Sheet1/2/3) that don't isolate data from each other. State: `cells`, `selected`, `editing`, `editVal`, `activeSheet`.

### GPU-Z
Graphics Card tab: static RTX 4070. Sensors tab: 10 live readings every 1s — GPU Core ~2520 MHz, Temp ~44°C, Load ~22%, Fan ~1540 RPM, Power ~58W (all randomly walk ±small amount). State: `tab`, `sensors`.

### HWMonitor
5 hardware groups, live every 1500ms: Nuvoton NCT6798D (motherboard voltages/fans), i7-12700K core temps, RTX 4070 GPU, Samsung SSD 970 EVO Plus (note: different model from CrystalDiskInfo), DDR5 temp/voltage. State: `groups`, `expanded`.

### Illustrator
Canvas drawing: rectangle and ellipse work. Pen/line/text tools exist in toolbar but are **not wired**. Static Layers panel (Layer 1, Artwork, Background) and Transform panel. State: `tool`, `color`, `stroke`, `shapes`.

### IPScanner
15 `NETWORK_DEVICES` on `192.168.1.x`. Scan sweeps `.1–.254` at 12ms/address (~3s total). `192.168.1.105` flagged as "This PC". "Open in Browser" calls `openWindow('browser', ...)` which loads that IP in the Browser app (shows device info card). **All IPs also respond to `ping` in CMD** — CMD ping always succeeds regardless of IP. State: `scanning`, `progress`, `found`, `selected`, `filter`.

### Malwarebytes
15 `THREAT_CATEGORIES`. Scan: 60ms interval, 80–260 files/tick, stops at 820,000 objects. Generates 2,000–10,000 random threats. After clean: calls `useDesktopStore().requestRestart()` → triggers Windows Update–style restart. Plays notification sounds. State: `phase`, `scanPath`, `scannedFiles`, `threats`, `cleanProgress`, `dbVersion`, `lastScan`.

### Maps
6 hardcoded NYC places. Map is pure CSS simulation — grid of divs + road divs + fixed-position marker dots. Markers at hardcoded percentage positions, **not tied to real lat/lng**. Zoom/map type are cosmetic. State: `search`, `mapType`, `zoom`.

### Notepad
Reads/writes real virtual filesystem via `driver.readFile`/`driver.writeFile`. `fileId` prop → opens that FS node. No `fileId` → blank. Ctrl+S saves. Tab inserts 4 spaces. State: `content`, `isDirty`, `wordWrap`, `statusMsg`.

### Notepad++
5 pre-loaded tabs with realistic code: `index.html`, `style.css`, `app.js`, `README.md`, `config.py`. Custom regex-based syntax highlighting rendered via `dangerouslySetInnerHTML`. Click toggles between highlighted view and editable textarea. State: `tabs`, `activeId`, `editMode`, `cursorLine`, `cursorCol`.

### OBS
4 scenes, each with 3–6 sources. 3 audio channels with animated VU meters when streaming. Stream/record timers count independently. Studio Mode shows Preview + Program panels with Cut transition. Can add/remove/reorder scenes and sources. CPU/bitrate/FPS animate during stream. State: `activeScene`, `previewScene`, `scenes`, `sources`, `isStreaming`, `isRecording`, `studioMode`, `streamTime`, `recordTime`.

### OneNote
3 sections (Personal/purple, Work/blue, School/green), 4 pre-filled notes: Ideas, Goals 2025, Meeting Notes, Lecture Notes (data structures). Can add pages and edit inline. State: `sections`, `activeSection`, `activeNote`.

### Outlook
4 fake emails: Microsoft welcome, IT maintenance, HR Q1 review, GitHub activity notification for "windows-in-browser" repo (self-referential). 5 folders (Inbox, Sent, Drafts, Junk, Deleted). Compose form is cosmetic (no send). State: `emails`, `selected`, `composing`, `folder`.

### Paint
Full canvas: pencil, eraser, fill (BFS flood fill), line, rect, ellipse. 20 color swatches + custom color picker. Brush size 1–30px. Save exports a real PNG download. `snapshotRef` used for live shape preview while dragging. State: `tool`, `color`, `size`, `drawing`, `startPos`.

### Photoshop
Canvas with brush/eraser (`globalCompositeOperation:'destination-out'` for eraser). Move/crop/fill/eyedropper are **UI-only** (not wired). 3 static layers. Zoom dropdown 25–200% (cosmetic). State: `tool`, `color`, `brushSize`, `drawing`, `zoom`, `layers`, `activeLayer`.

### PowerPoint
3 default slides. Can add/delete slides. 5 theme colors. Click title/body text to edit inline. State: `slides`, `current`, `editingTitle`, `editingBody`.

### Premiere
6 video clips on 4 tracks (V2, V1, A1, A2). Transport buttons manually step `currentTime` — **no interval auto-advances time** (`playing` is cosmetic). State: `playing`, `currentTime`, `selected`.

### ProcessHacker
38 `BASE_PROCS`. Live every 1s: `cs2.exe` 15–45% CPU, `chrome.exe` 0–5%, others 0–2%. End Process: **blocked** for system/service processes. User processes permanently removed via `killedRef`. 4 tabs: Processes, Services, Network, Disk. State: `tab`, `procs`, `selected`, `toast`.

### RegistryEditor
5 root hives (HKCR, HKCU, HKLM, HKU, HKCC). Notable values:
- `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`: Discord, Spotify
- `HKLM\HARDWARE`: ASUS BIOS, RTX 4070 video BIOS string
- `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion`: BuildNumber `19045`, RegisteredOwner `User`
- `HKLM\SYSTEM\CurrentControlSet\Control\ComputerName`: `DESKTOP-WIN10`
State: `selected`, `selectedNode`, `searchVal`.

### Settings
Multi-page app. **Windows Update subpage** has:
- 10 possible updates (March 2026 dates)
- 6 install history entries
- Phase machine: `idle → checking` (4–8s) → `found → downloading` (15–40s) → `installing` (15–30s) → `restart`
- On completion: plays `playUpdateDone()` sound + calls `requestRestart()` → triggers full OS restart cycle in `App.tsx`

Other pages: System, Devices, Network, Personalization (wallpaper picker), Apps, Accounts, Time, Gaming, Ease of Access, Privacy, Update.

### SevenZip
3-level navigation: root (drive list) → `C:\` → `C:\Users\User\Downloads`. Per-path `customItems` state allows delete. Extract/info show toasts. State: `path`, `selected`, `customItems`, `toast`.

### SnippingTool
Cosmetic only. "New" toggles `snipped` state showing a fake screenshot placeholder. Annotation toolbar is UI-only. State: `mode`, `snipped`, `delay`, `showPen`.

### SolidWorks
Interactive 3D box rendered on canvas with isometric projection math. Mouse drag rotates via X/Y angles. Static feature tree (Boss-Extrude1, Fillet1, Cut-Extrude1, Mirror1, Shell1). State: `rotation`, `dragging`, `lastMouse`, `activeTab`, `zoom`.

### Spotify
6 playlists. Songs defined for `'liked'` (12 songs) and `'focus'` (6 songs); other playlists fall back to liked songs. Progress advances 1 tick/second proportional to duration, loops on completion. Pre-liked: 'Blinding Lights', 'Anti-Hero'. State: `view`, `selectedPlaylist`, `playing`, `paused`, `progress`, `volume`, `liked`.

### Steam
~500 real game titles with genre/size/playtime/installed flag. CS2: playing, 1204 hrs. Dota 2: 2841 hrs. BG3 has `'update'` status. RDR2/GTA V not installed. Library/Store tabs with filter, search, sort. State: `view`, `search`, `genre`, `sort`, `selectedGame`.

### TaskManager
CPU: measured via `performance.now()` overhead. RAM: uses `performance.memory` if available (Chrome only), else random ~1200–1280 MB. Disk/Network: random walk. 60-point history arrays drive SVG sparklines. State: `metrics`, `history`, `tab`, `selectedProc`.

### Teams
23 DM contacts with job roles. Multiple teams with channels and pre-seeded messages. State: `view`, `selectedContact`, `messages`, `input`, `activeTeam`, `activeChannel`.

### VLC
6-item playlist (4 video, 2 audio). Progress advances 1 tick/second, auto-advances to next track on completion. `setFullscreen` state exists but is **never applied** (fullscreen is wired to state but has no effect). State: `playing`, `current`, `progress`, `volume`, `muted`, `showPlaylist`.

### WinDirStat
Treemap for C/D/E/F/G + NAS drives. C:\ breakdown: Program Files 156.4 GB (Steam 89.2, Office 32.1, Adobe 28.6), Program Files (x86) 48.2 GB, Users 72.4 GB, Windows 68.8 GB. Scan animation cycles through path strings. State: `activeDrive`, `scanning`, `scanProgress`, `scanPath`, `scanned`.

### WindowsStore
18 apps. Only paid app: WinRAR ($29.99). Pre-installed: Spotify, VLC. Install simulates with 2s `setTimeout`. State: `view`, `category`, `selectedApp`, `installed`, `installing`, `search`.

### Wireshark
Random packets every 80ms when capturing. Protocol weights: TCP 35%, UDP 20%, DNS 15%, TLS 12%, HTTP 10%, ARP 4%, ICMP 4%. Hex dump shows random bytes for selected packet. Truncates at ~500 packets. State: `capturing`, `packets`, `selected`, `filter`, `elapsed`.

### Word
`contentEditable` + `document.execCommand` for formatting (bold, italic, underline, align, lists). Reads from virtual filesystem if `fileId` prop provided. Ctrl+S saves. 6 font families, 14 font sizes. State: `isDirty`, `fontSize`, `fontFamily`, `statusMsg`, `wordCount`.

---

## Known cross-app inconsistencies (intentional)

| Inconsistency | Where |
|---|---|
| HWMonitor shows "Samsung SSD 970 EVO Plus" | CrystalDiskInfo shows "Samsung 990 Pro" |
| DiskManagement shows different drive sizes | FileExplorer DRIVE_SPACE has the canonical sizes |
| CMD ping always resolves to `142.250.80.46` | Even when pinging 192.168.1.x IPs from IPScanner |

---

## Drive reference

### Local (C–G) — "Devices and drives"
| Drive | Label | Total GB | Used GB |
|-------|-------|----------|---------|
| C: | OS — Samsung SSD 990 Pro 512GB | 512 | 346.2 |
| D: | Games 1 — Samsung SSD 990 Pro 2TB | 2000 | 1884 |
| E: | Games 2 — WD Black SN850X 2TB | 2000 | 1764 |
| F: | Storage — Seagate Barracuda 8TB | 8000 | 6348 |
| G: | Mods — Crucial P5 Plus 1TB | 1000 | 862 |

### NAS (N/P/Q/R/S/T/U/V/W/Z) — "Network locations (NAS)"
| Drive | Label | Total GB | Used GB |
|-------|-------|----------|---------|
| N: | NAS-Media — Synology DS1823xs+ 96TB | 98304 | 79872 |
| P: | NAS-Personal — Synology DS1621+ 72TB | 73728 | 65536 |
| Q: | NAS-Seeds1 — Synology RS4021xs+ 144TB | 147456 | 138240 |
| R: | NAS-Seeds2 — Custom 24-bay 192TB | 196608 | 184320 |
| S: | NAS-Seeds3 — SuperMicro JBOD 256TB | 262144 | 251904 |
| T: | NAS-Seeds4 — NetApp FAS8700 320TB | 327680 | 315392 |
| U: | NAS-Seeds5 — Supermicro 480TB | 491520 | 473088 |
| V: | NAS-Seeds6 — Dell PowerEdge 576TB | 589824 | 573440 |
| W: | NAS-Seeds7 — HPE ProLiant 384TB | 393216 | 378880 |
| Z: | NAS-Archive — QNAP TS-873A 48TB | 49152 | 42496 |

---

## Adding a new app — checklist

1. Create `win10-app/src/apps/MyApp/MyApp.tsx` + `MyApp.css`
2. Add `appId` to `AppID` union in `types/window.ts`
3. Add default size to `defaultSizes` in `store/useWindowStore.ts`
4. Add `case 'myApp': return <MyApp {...appProps} />` in `components/Window/Window.tsx`
5. Optionally add to `DESKTOP_SHORTCUTS` in `components/Desktop/Desktop.tsx`
6. Optionally add to Start Menu in `components/StartMenu/StartMenu.tsx`

---

## GitHub access (no gh CLI)

Token: `YOUR_GITHUB_TOKEN` *(may be expired — user will provide new one)*

```bash
# Push (token in URL)
git push https://Atvriders:TOKEN@github.com/Atvriders/windows-in-browser.git master

# Create new repo
curl -s -X POST https://api.github.com/user/repos \
  -H "Authorization: token TOKEN" \
  -d '{"name":"repo-name","private":false}'
git remote add origin https://Atvriders:TOKEN@github.com/Atvriders/repo-name.git
git push -u origin master
```
