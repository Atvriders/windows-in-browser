# Project Context for Claude

## User preferences
- GitHub: **Atvriders** (klassenjames0@gmail.com)
- Keep responses short and direct — no preamble, no trailing summaries
- Pushes directly to `master`, no PR workflow
- No `gh` CLI installed — use `curl` against the GitHub API + token in remote URL

---

## What this project is

A **React 18 + TypeScript browser simulation of Windows 10**, built with Vite 5 and Zustand. It runs entirely in the browser — no backend. It looks and behaves like a Windows 10 desktop: Start Menu, taskbar, draggable/resizable windows, File Explorer with real drive navigation, qBittorrent, Task Manager, Notepad, Paint, Settings, etc.

**Repo:** https://github.com/Atvriders/windows-in-browser
**Local path:** `/home/kasm-user/windows-in-browser`
**App source:** `win10-app/src/`

---

## Stack

| Thing | Detail |
|-------|--------|
| Framework | React 18 |
| Language | TypeScript (strict) |
| Bundler | Vite 5 |
| State | Zustand (`useWindowStore`, `useFileSystemStore`, `useDesktopStore`) |
| Styling | Plain CSS modules per component |
| Node | `/home/kasm-user/.local/node/bin/node` |

### Build commands
```bash
node_modules/.bin/tsc -b --noEmit    # type-check only
node_modules/.bin/vite build         # production build
```

---

## Architecture overview

### Windows / apps — `useWindowStore`
`win10-app/src/store/useWindowStore.ts` manages open windows. Each window has an `appId` (e.g. `'fileExplorer'`, `'qbittorrent'`, `'notepad'`). `openWindow(appId, title, props?)` opens a new window. Apps are React components rendered inside a draggable/resizable frame.

### Virtual filesystem — `useFileSystemStore`
`win10-app/src/store/useFileSystemStore.ts` owns the filesystem state. The filesystem is a flat record of `FSNode` objects keyed by UUID. Each node has `{ id, name, type: 'file'|'directory', parentId, content?, mimeType? }`.

The tree is built once at startup from `win10-app/src/filesystem/initialTree.ts` using two helpers:
- `d(name, parentId)` — creates a directory node, returns its UUID
- `f(name, parentId, content?, mimeType?)` — creates a file node, returns its UUID

The root node has `id: 'root'` and `name: 'This PC'`. Drive letters (C:, D:, etc.) are direct children of root.

### File Explorer — `win10-app/src/apps/FileExplorer/FileExplorer.tsx`
Uses `useFileSystemStore` to browse the virtual filesystem. Key concepts:

- **`currentId`** — UUID of the currently viewed directory
- **`isThisPC`** — true when `currentId === fs.rootId` (showing the top-level drive overview)
- **`DRIVE_SPACE`** — a `Record<string, {total, used, label, icon}>` defined inside the component (around line 124). Maps drive letters like `'C:'` to size info in GB. This is purely cosmetic — it powers the status bar and drive cards.
- **Drive cards** — when at "This PC" (`isThisPC === true`), the main content area shows drive cards grouped into two sections:
  - **"Devices and drives"** — local drives filtered by `['C:','D:','E:','F:','G:']`
  - **"Network locations (NAS)"** — NAS drives filtered by `['N:','P:','Q:','R:','S:','T:','U:','V:','W:','Z:']`
- **Sidebar** — has two groups:
  - "This PC" group — filters by `['C:','D:','E:','F:','G:']`
  - "Network (NAS)" group — filters by `['N:','P:','Q:','R:','S:','T:','U:','V:','W:','Z:']`
- **Status bar** — shows free/total space bar for the current drive, color-coded: blue <75%, orange 75–90%, red >90%

**IMPORTANT:** When adding a new drive, you must update ALL of the following in `FileExplorer.tsx`:
1. Add it to `DRIVE_SPACE` with total/used (GB), label, and icon
2. Add it to the NAS filter array in the sidebar (line ~216)
3. Add it to both NAS filter arrays in the This PC overview (lines ~260 and ~264)

### Virtual filesystem drives — `win10-app/src/filesystem/initialTree.ts`
This file builds the actual directory tree. Adding a drive here makes it navigable. Each drive is created with `d('X:', rootId)` then its subdirectories and files are created under it.

**Current drives in `initialTree.ts`:**
- `C:` — OS drive, full Windows directory tree (System32, Program Files, Users, etc.)
- `D:` — Games 1
- `E:` — Games 2
- `F:` — Storage
- `G:` — Mods
- `N:` — NAS-Media (music, movies, home videos, FLAC collections)
- `P:` — NAS-Personal (photos, documents, backups)
- `Q:` — NAS-Seeds1 (live music — Grateful Dead, Phish, etc.)
- `R:` — NAS-Seeds2 (texts, video, educational)
- `S:` — NAS-Seeds3 (world music, concerts, radio)
- `T:` — NAS-Seeds4 (photography, periodicals, academic)
- `U:` — NAS-Seeds5 (classical, jazz, blues)
- `V:` — NAS-Seeds6 (video, film, games)
- `W:` — NAS-Seeds7 (texts, newspapers, radio)
- `Z:` — NAS-Archive (archive, backups)

New drives go just before the `// ProgramData` comment inside the `buildInitialTree()` function body.

---

## qBittorrent app — `win10-app/src/apps/QBittorrent/QBittorrent.tsx`

This is a full fake qBittorrent UI. It has:
- Category filter sidebar (All, Downloading, Seeding, Paused, and custom categories)
- Torrent list with columns: name, size, done %, status, seeds, peers, DL/UL speed, ETA, added date
- Detail panel below with tabs: General, Trackers, Peers, Content (file list)

### The `Torrent` interface (lines 15–34)
```typescript
interface Torrent {
  id: number;
  name: string;
  size: string;       // display string e.g. "32.4 GB"
  sizeBytes: number;  // bytes
  done: number;       // 0–100
  status: 'seeding' | 'downloading' | 'paused';
  seeds: number;
  peers: number;
  dlSpeed: number;    // KB/s
  ulSpeed: number;    // KB/s
  eta: string;
  added: string;      // "YYYY-MM-DD HH:MM"
  savePath: string;   // Windows path e.g. "Q:\\Live-Music\\"
  hash: string;
  category: string;
  tracker: string;
  typeIcon: string;   // emoji
  files: TorrentFile[];
}
```

### The `mk()` helper (lines 36–48)
A compact factory to avoid repeating all fields for Archive.org torrents:
```typescript
function mk(id, name, size, sizeGB, savePath, icon, seeds, ul, files, added?): Torrent
```
- Sets `status: 'seeding'`, `done: 100`, `dlSpeed: 0`, `peers: Math.round(seeds * 0.07)`
- Sets `category: 'Archive.org'`, `tracker: 'http://bt1.archive.org:6969/announce'`
- Derives `hash` from id: `id.toString(16).padStart(8,'0').repeat(5)`
- `files` is `[string, string][]` → `[name, size]` pairs

### `INITIAL_TORRENTS` array (starts line 50)
521 torrents total. IDs 1–70 are full verbose objects (various categories: Linux ISOs, Games, Movies, TV Shows, Archive.org). IDs 71–521 all use `mk()` and are `category: 'Archive.org'`.

**Categories in use:**
```typescript
const CATEGORIES = ['Linux ISOs', 'Games', 'Movies', 'TV Shows', 'Archive.org'];
```

**Archive.org torrent save paths by content type:**
- `Q:\\Live-Music\\Grateful-Dead\\` — Grateful Dead concerts (IDs 71–86)
- `Q:\\Live-Music\\Phish\\` — Phish concerts (IDs 87–101)
- `Q:\\Live-Music\\` — other live music (IDs 102–186)
- `U:\\Classical\\` — classical music (IDs 187–226)
- `U:\\Jazz\\` — jazz (IDs 227–261)
- `U:\\Blues-Folk\\` — blues/folk/country/gospel (IDs 262–291)
- `W:\\Texts\\` — books/texts (IDs 292–331)
- `W:\\Newspapers\\` — historical newspapers (IDs 332–361)
- `V:\\Silent-Films\\` — silent films (IDs 362–381)
- `V:\\Documentaries\\` — documentaries (IDs 382–411)
- `V:\\Animation\\` — animation (IDs 412–426)
- `V:\\Software\\` — software/games (IDs 427–466)
- `W:\\Radio\\` — radio/audio dramas (IDs 467–491)
- `T:\\Academic\\` — academic/scientific (IDs 492–521)

---

## Drive reference

### Local drives (C–G) — appear in "Devices and drives"
| Drive | Label | Size |
|-------|-------|------|
| C: | OS — Samsung SSD 990 Pro | 512 GB |
| D: | Games 1 — Samsung SSD 990 Pro | 2 TB |
| E: | Games 2 — WD Black SN850X | 2 TB |
| F: | Storage — Seagate Barracuda | 8 TB |
| G: | Mods — Crucial P5 Plus | 1 TB |

### NAS drives (N/P/Q/R/S/T/U/V/W/Z) — appear in "Network locations (NAS)"
| Drive | Label | Total |
|-------|-------|-------|
| N: | NAS-Media — Synology DS1823xs+ | 96 TB |
| P: | NAS-Personal — Synology DS1621+ | 72 TB |
| Q: | NAS-Seeds1 — Synology RS4021xs+ | 144 TB |
| R: | NAS-Seeds2 — Custom 24-bay | 192 TB |
| S: | NAS-Seeds3 — SuperMicro JBOD | 256 TB |
| T: | NAS-Seeds4 — NetApp FAS8700 | 320 TB |
| U: | NAS-Seeds5 — Supermicro | 480 TB |
| V: | NAS-Seeds6 — Dell PowerEdge | 576 TB |
| W: | NAS-Seeds7 — HPE ProLiant | 384 TB |
| Z: | NAS-Archive — QNAP TS-873A | 48 TB |

---

## GitHub access (no gh CLI)

Token: `YOUR_GITHUB_TOKEN`
*(token may be expired — user will provide a new one if push fails)*

```bash
# Push to existing repo (token embedded in remote URL)
git push https://TOKEN@github.com/Atvriders/windows-in-browser.git master

# Create a new repo
curl -s -X POST https://api.github.com/user/repos \
  -H "Authorization: token TOKEN" \
  -d '{"name":"repo-name","private":false}'
git remote add origin https://TOKEN@github.com/Atvriders/repo-name.git
git push -u origin master
```

If `git push` fails with a credential prompt error, try:
```bash
GIT_ASKPASS=echo git push ...
```
Or set the remote explicitly with `git remote set-url origin https://Atvriders:TOKEN@github.com/...`
