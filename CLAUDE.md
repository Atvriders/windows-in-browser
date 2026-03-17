# Project Context for Claude

## User
- GitHub: **Atvriders** (klassenjames0@gmail.com)
- Keep responses short and direct — no preamble, no trailing summaries
- Pushes directly to `master`, no PR workflow

## Project: windows-in-browser
React 18 + TypeScript Windows 10 browser simulation (Vite 5, Zustand).

**Repo:** https://github.com/Atvriders/windows-in-browser
**Path:** `/home/kasm-user/windows-in-browser`

### Key files
| File | Purpose |
|------|---------|
| `win10-app/src/apps/QBittorrent/QBittorrent.tsx` | `INITIAL_TORRENTS` array + `mk()` helper, `CATEGORIES` |
| `win10-app/src/apps/FileExplorer/FileExplorer.tsx` | `DRIVE_SPACE` record, NAS filter arrays in sidebar/overview |
| `win10-app/src/filesystem/initialTree.ts` | Virtual filesystem tree — drive directories |

### Drives
- **Local (C–G):** C: OS/512GB, D: Games1/2TB, E: Games2/2TB, F: Storage/8TB, G: Mods/1TB
- **NAS (N/P/Q/R/S/T/Z):** N: Media/96TB, P: Personal/72TB, Q: Seeds1/144TB, R: Seeds2/192TB, S: Seeds3/256TB, T: Seeds4/320TB, Z: Archive/48TB

### Torrents
521 Archive.org seeding torrents in `INITIAL_TORRENTS`. Uses compact `mk()` helper (defined just before the array) to avoid boilerplate. IDs 1–70 are full objects; IDs 71–521 use `mk()`. Category: `'Archive.org'`, tracker: `http://bt1.archive.org:6969/announce`.

### Build commands
```bash
node_modules/.bin/tsc -b --noEmit          # type-check
node_modules/.bin/vite build               # production build
```
Node binary: `/home/kasm-user/.local/node/bin/node`

## GitHub (no gh CLI installed)
Push via token in remote URL. To create a new repo:
```bash
TOKEN="YOUR_GITHUB_TOKEN"
curl -s -X POST https://api.github.com/user/repos \
  -H "Authorization: token $TOKEN" \
  -d '{"name":"repo-name","private":false}'
git remote add origin https://$TOKEN@github.com/Atvriders/repo-name.git
git push -u origin master
```
