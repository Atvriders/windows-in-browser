import { useState, useEffect, useCallback } from 'react';
import './QBittorrent.css';

type TorrentStatus = 'seeding' | 'downloading' | 'paused';
type DetailTab = 'General' | 'Trackers' | 'Peers' | 'Content';
type FilterKey = 'All' | 'Downloading' | 'Seeding' | 'Paused' | 'Completed' | string;

interface TorrentFile {
  name: string;
  size: string;
  progress: number;
  priority: string;
}

interface Torrent {
  id: number;
  name: string;
  size: string;
  sizeBytes: number;
  done: number;         // 0–100
  status: TorrentStatus;
  seeds: number;
  peers: number;
  dlSpeed: number;      // KB/s
  ulSpeed: number;      // KB/s
  eta: string;
  added: string;
  savePath: string;
  hash: string;
  category: string;
  tracker: string;
  typeIcon: string;
  files: TorrentFile[];
}

const INITIAL_TORRENTS: Torrent[] = [
  {
    id: 1,
    name: 'ubuntu-23.10-desktop-amd64.iso',
    size: '4.6 GB', sizeBytes: 4939212800,
    done: 100, status: 'seeding',
    seeds: 312, peers: 0,
    dlSpeed: 0, ulSpeed: 87,
    eta: '∞',
    added: '2024-01-12 14:22',
    savePath: 'D:\\Downloads\\',
    hash: 'a6bfbe43027f7b9a2e9fe7f7bb2c89c891d2df5c',
    category: 'Linux ISOs',
    tracker: 'https://torrent.ubuntu.com/announce',
    typeIcon: '💿',
    files: [{ name: 'ubuntu-23.10-desktop-amd64.iso', size: '4.6 GB', progress: 100, priority: 'Normal' }],
  },
  {
    id: 2,
    name: 'debian-12.4.0-amd64-DVD-1.iso',
    size: '3.7 GB', sizeBytes: 3972005888,
    done: 100, status: 'seeding',
    seeds: 148, peers: 3,
    dlSpeed: 0, ulSpeed: 43,
    eta: '∞',
    added: '2024-01-08 09:11',
    savePath: 'D:\\Downloads\\',
    hash: '3d5a9be9f8c5d812de8e0ad1d1c82c9b9e2c4a1d',
    category: 'Linux ISOs',
    tracker: 'https://cdimage.debian.org/cdimage/tracker/announce',
    typeIcon: '💿',
    files: [
      { name: 'debian-12.4.0-amd64-DVD-1.iso', size: '3.7 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 3,
    name: 'Cyberpunk.2077.Update.2.1.CODEX',
    size: '70.4 GB', sizeBytes: 75585822720,
    done: 67, status: 'downloading',
    seeds: 892, peers: 241,
    dlSpeed: 2840, ulSpeed: 120,
    eta: '2h 14m',
    added: '2024-01-15 20:07',
    savePath: 'E:\\Games\\',
    hash: 'b9c7d4e1a2f3c8d5e6a7b8c9d0e1f2a3b4c5d6e7',
    category: 'Games',
    tracker: 'udp://tracker.opentrackr.org:1337/announce',
    typeIcon: '🎮',
    files: [
      { name: 'setup_cyberpunk2077.exe', size: '2.1 MB', progress: 100, priority: 'High' },
      { name: 'data1.bin', size: '35.2 GB', progress: 100, priority: 'Normal' },
      { name: 'data2.bin', size: '35.1 GB', progress: 34, priority: 'Normal' },
    ],
  },
  {
    id: 4,
    name: 'The.Dark.Knight.2008.2160p.UHD.BluRay.x265.10bit.HDR',
    size: '58.3 GB', sizeBytes: 62588715008,
    done: 100, status: 'seeding',
    seeds: 67, peers: 12,
    dlSpeed: 0, ulSpeed: 230,
    eta: '∞',
    added: '2024-01-03 18:44',
    savePath: 'F:\\Movies\\',
    hash: 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
    category: 'Movies',
    tracker: 'udp://open.demonii.com:1337/announce',
    typeIcon: '🎬',
    files: [
      { name: 'The.Dark.Knight.2008.2160p.mkv', size: '57.9 GB', progress: 100, priority: 'Normal' },
      { name: 'The.Dark.Knight.2008.srt', size: '82 KB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 5,
    name: 'Breaking.Bad.S01-S05.Complete.1080p.BluRay.x264',
    size: '92.1 GB', sizeBytes: 98897203200,
    done: 100, status: 'seeding',
    seeds: 201, peers: 34,
    dlSpeed: 0, ulSpeed: 156,
    eta: '∞',
    added: '2023-12-28 11:32',
    savePath: 'F:\\TV Shows\\',
    hash: 'd2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1',
    category: 'TV Shows',
    tracker: 'udp://tracker.leechers-paradise.org:6969/announce',
    typeIcon: '📺',
    files: [
      { name: 'Season 01', size: '14.2 GB', progress: 100, priority: 'Normal' },
      { name: 'Season 02', size: '17.8 GB', progress: 100, priority: 'Normal' },
      { name: 'Season 03', size: '19.4 GB', progress: 100, priority: 'Normal' },
      { name: 'Season 04', size: '20.1 GB', progress: 100, priority: 'Normal' },
      { name: 'Season 05', size: '20.6 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 6,
    name: 'Elden.Ring.v1.10.CODEX',
    size: '60.5 GB', sizeBytes: 64966082560,
    done: 23, status: 'downloading',
    seeds: 1240, peers: 388,
    dlSpeed: 4210, ulSpeed: 185,
    eta: '4h 02m',
    added: '2024-01-15 21:55',
    savePath: 'E:\\Games\\',
    hash: 'e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
    category: 'Games',
    tracker: 'udp://tracker.opentrackr.org:1337/announce',
    typeIcon: '🎮',
    files: [
      { name: 'EldenRing_Setup.exe', size: '1.3 MB', progress: 100, priority: 'High' },
      { name: 'EldenRing_Data.bin', size: '60.5 GB', progress: 23, priority: 'Normal' },
    ],
  },
  {
    id: 7,
    name: 'Oppenheimer.2023.2160p.IMAX.BluRay.x265.HDR10+',
    size: '74.2 GB', sizeBytes: 79659622400,
    done: 100, status: 'seeding',
    seeds: 134, peers: 18,
    dlSpeed: 0, ulSpeed: 312,
    eta: '∞',
    added: '2024-01-10 16:20',
    savePath: 'F:\\Movies\\',
    hash: 'f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3',
    category: 'Movies',
    tracker: 'udp://open.demonii.com:1337/announce',
    typeIcon: '🎬',
    files: [
      { name: 'Oppenheimer.2023.2160p.IMAX.mkv', size: '73.8 GB', progress: 100, priority: 'Normal' },
      { name: 'Oppenheimer.srt', size: '98 KB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 8,
    name: 'The.Last.of.Us.S01.Complete.2160p.MAX.WEBRip',
    size: '48.7 GB', sizeBytes: 52293836800,
    done: 100, status: 'paused',
    seeds: 0, peers: 0,
    dlSpeed: 0, ulSpeed: 0,
    eta: '∞',
    added: '2024-01-05 13:15',
    savePath: 'F:\\TV Shows\\',
    hash: 'a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4',
    category: 'TV Shows',
    tracker: 'udp://tracker.leechers-paradise.org:6969/announce',
    typeIcon: '📺',
    files: [
      { name: 'TLOU.S01E01.2160p.mkv', size: '5.4 GB', progress: 100, priority: 'Normal' },
      { name: 'TLOU.S01E02.2160p.mkv', size: '5.1 GB', progress: 100, priority: 'Normal' },
      { name: 'TLOU.S01E03.2160p.mkv', size: '6.2 GB', progress: 100, priority: 'Normal' },
      { name: 'TLOU.S01E04.2160p.mkv', size: '4.8 GB', progress: 100, priority: 'Normal' },
      { name: 'TLOU.S01E05.2160p.mkv', size: '5.9 GB', progress: 100, priority: 'Normal' },
      { name: 'TLOU.S01E06.2160p.mkv', size: '5.3 GB', progress: 100, priority: 'Normal' },
      { name: 'TLOU.S01E07.2160p.mkv', size: '4.9 GB', progress: 100, priority: 'Normal' },
      { name: 'TLOU.S01E08.2160p.mkv', size: '5.2 GB', progress: 100, priority: 'Normal' },
      { name: 'TLOU.S01E09.2160p.mkv', size: '5.9 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 9,
    name: 'Arch.Linux.2024.01.01-x86_64.iso',
    size: '903 MB', sizeBytes: 946864128,
    done: 100, status: 'seeding',
    seeds: 87, peers: 5,
    dlSpeed: 0, ulSpeed: 28,
    eta: '∞',
    added: '2024-01-02 08:00',
    savePath: 'D:\\Downloads\\',
    hash: 'b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
    category: 'Linux ISOs',
    tracker: 'https://archlinux.org/announce',
    typeIcon: '💿',
    files: [{ name: 'archlinux-2024.01.01-x86_64.iso', size: '903 MB', progress: 100, priority: 'Normal' }],
  },
  {
    id: 10,
    name: 'Baldurs.Gate.3.v4.1.1.3367634.FLT',
    size: '122.7 GB', sizeBytes: 131760087040,
    done: 48, status: 'downloading',
    seeds: 2187, peers: 612,
    dlSpeed: 5920, ulSpeed: 240,
    eta: '5h 51m',
    added: '2024-01-15 19:30',
    savePath: 'E:\\Games\\',
    hash: 'c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
    category: 'Games',
    tracker: 'udp://tracker.opentrackr.org:1337/announce',
    typeIcon: '🎮',
    files: [
      { name: 'BG3_Setup.exe', size: '4.2 MB', progress: 100, priority: 'High' },
      { name: 'BG3_Data_Part1.bin', size: '61.3 GB', progress: 100, priority: 'Normal' },
      { name: 'BG3_Data_Part2.bin', size: '61.2 GB', progress: 0, priority: 'Normal' },
    ],
  },
  {
    id: 11,
    name: 'Interstellar.2014.4K.UHD.BluRay.HDR.DolbyAtmos',
    size: '55.8 GB', sizeBytes: 59907809280,
    done: 100, status: 'seeding',
    seeds: 98, peers: 7,
    dlSpeed: 0, ulSpeed: 95,
    eta: '∞',
    added: '2023-12-20 22:18',
    savePath: 'F:\\Movies\\',
    hash: 'd8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
    category: 'Movies',
    tracker: 'udp://open.demonii.com:1337/announce',
    typeIcon: '🎬',
    files: [
      { name: 'Interstellar.2014.4K.UHD.mkv', size: '55.5 GB', progress: 100, priority: 'Normal' },
      { name: 'Interstellar.2014.en.srt', size: '78 KB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 12,
    name: 'Fedora-Workstation-Live-x86_64-39-1.5.iso',
    size: '2.1 GB', sizeBytes: 2254857830,
    done: 100, status: 'paused',
    seeds: 0, peers: 0,
    dlSpeed: 0, ulSpeed: 0,
    eta: '∞',
    added: '2023-12-15 10:45',
    savePath: 'D:\\Downloads\\',
    hash: 'e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
    category: 'Linux ISOs',
    tracker: 'https://torrent.fedoraproject.org/announce',
    typeIcon: '💿',
    files: [{ name: 'Fedora-Workstation-Live-x86_64-39-1.5.iso', size: '2.1 GB', progress: 100, priority: 'Normal' }],
  },
];

const CATEGORIES = [
  { name: 'Linux ISOs', color: '#f97316' },
  { name: 'Games',      color: '#a855f7' },
  { name: 'Movies',     color: '#3b82f6' },
  { name: 'TV Shows',   color: '#14b8a6' },
];

function fmtSpeed(kbs: number): string {
  if (kbs === 0) return '—';
  if (kbs < 1024) return `${kbs} KB/s`;
  return `${(kbs / 1024).toFixed(1)} MB/s`;
}

function statusClass(s: TorrentStatus): string {
  return `qbt-status-${s}`;
}

function statusLabel(s: TorrentStatus): string {
  if (s === 'seeding')     return 'Seeding';
  if (s === 'downloading') return 'Downloading';
  return 'Paused';
}

function randVariance(base: number, variance: number): number {
  return Math.round(base + (Math.random() - 0.5) * 2 * variance);
}

export default function QBittorrent() {
  const [torrents, setTorrents] = useState<Torrent[]>(INITIAL_TORRENTS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterKey>('All');
  const [detailTab, setDetailTab] = useState<DetailTab>('General');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  // Animate download speeds every second
  useEffect(() => {
    const id = setInterval(() => {
      setTorrents(prev => prev.map(t => {
        if (t.status !== 'downloading') return t;
        const newDl = Math.max(100, randVariance(t.dlSpeed || 3000, 800));
        const newUl = Math.max(10, randVariance(t.ulSpeed || 150, 50));
        const newDone = Math.min(100, t.done + 0.05);
        return { ...t, dlSpeed: newDl, ulSpeed: newUl, done: newDone };
      }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pauseTorrent = () => {
    if (!selectedId) { showToast('Select a torrent first'); return; }
    setTorrents(prev => prev.map(t => t.id === selectedId && t.status !== 'paused' ? { ...t, status: 'paused', dlSpeed: 0, ulSpeed: 0 } : t));
  };

  const resumeTorrent = () => {
    if (!selectedId) { showToast('Select a torrent first'); return; }
    setTorrents(prev => prev.map(t => t.id === selectedId && t.status === 'paused' ? { ...t, status: t.done === 100 ? 'seeding' : 'downloading', dlSpeed: t.done < 100 ? 2500 : 0, ulSpeed: 80 } : t));
  };

  const deleteTorrent = () => {
    if (!selectedId) { showToast('Select a torrent first'); return; }
    const t = torrents.find(x => x.id === selectedId);
    if (t) { setTorrents(prev => prev.filter(x => x.id !== selectedId)); setSelectedId(null); showToast(`Removed: ${t.name}`); }
  };

  const filteredTorrents = torrents.filter(t => {
    if (filter === 'All')         return true;
    if (filter === 'Downloading') return t.status === 'downloading';
    if (filter === 'Seeding')     return t.status === 'seeding';
    if (filter === 'Paused')      return t.status === 'paused';
    if (filter === 'Completed')   return t.done === 100;
    // category filter
    return t.category === filter;
  });

  const counts = {
    All:         torrents.length,
    Downloading: torrents.filter(t => t.status === 'downloading').length,
    Seeding:     torrents.filter(t => t.status === 'seeding').length,
    Paused:      torrents.filter(t => t.status === 'paused').length,
    Completed:   torrents.filter(t => t.done === 100).length,
  };

  const selected = torrents.find(t => t.id === selectedId) ?? null;

  const totalDl = torrents.reduce((s, t) => s + t.dlSpeed, 0);
  const totalUl = torrents.reduce((s, t) => s + t.ulSpeed, 0);

  const handleRowClick = useCallback((id: number) => {
    setSelectedId(prev => prev === id ? null : id);
  }, []);

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'All',         label: 'All' },
    { key: 'Downloading', label: 'Downloading' },
    { key: 'Seeding',     label: 'Seeding' },
    { key: 'Paused',      label: 'Paused' },
    { key: 'Completed',   label: 'Completed' },
  ];

  return (
    <div className="qbt-root">
      {toast && <div style={{ position: 'absolute', top: 6, right: 6, background: '#1a1a2e', color: '#e0e0e0', padding: '5px 12px', borderRadius: 4, fontSize: 11, zIndex: 100, border: '1px solid #444', maxWidth: 360 }}>{toast}</div>}

      {/* ── Toolbar ── */}
      <div className="qbt-toolbar">
        <button className="qbt-toolbar-btn" title="Add Torrent" onClick={() => showToast('Add Torrent — drag a .torrent file here')}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M9 2a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H4a1 1 0 1 1 0-2h4V3a1 1 0 0 1 1-1z"/>
          </svg>
          Add Torrent
        </button>
        <button className="qbt-toolbar-btn" title="Add Magnet Link" onClick={() => showToast('Add Magnet Link — paste a magnet:// URI')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 15A6 6 0 1 0 18 9"/>
            <path d="M6 15v3m6-9v3m6-3v3"/>
          </svg>
          Add Magnet
        </button>
        <div className="qbt-toolbar-sep" />
        <button className="qbt-toolbar-btn" title="Pause" onClick={pauseTorrent}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <rect x="4" y="3" width="4" height="12" rx="1"/>
            <rect x="10" y="3" width="4" height="12" rx="1"/>
          </svg>
          Pause
        </button>
        <button className="qbt-toolbar-btn" title="Resume" onClick={resumeTorrent}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M5 3l11 6-11 6V3z"/>
          </svg>
          Resume
        </button>
        <div className="qbt-toolbar-sep" />
        <button className="qbt-toolbar-btn" title="Delete" onClick={deleteTorrent}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M7 2h4l1 1h3v2H3V3h3l1-1zm-3 4h10l-1 10H5L4 6zm3 2v6h1V8H7zm3 0v6h1V8h-1z"/>
          </svg>
          Delete
        </button>
        <div className="qbt-toolbar-sep" />
        <button className="qbt-toolbar-btn" title="Move Up">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M9 4l6 7H3l6-7z"/>
          </svg>
          Up Priority
        </button>
        <button className="qbt-toolbar-btn" title="Move Down">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M9 14L3 7h12l-6 7z"/>
          </svg>
          Down Priority
        </button>
      </div>

      {/* ── Main area ── */}
      <div className="qbt-main">

        {/* Sidebar */}
        <div className="qbt-sidebar">
          <div className="qbt-sidebar-section">
            <div className="qbt-sidebar-title">Status</div>
            {FILTERS.map(f => (
              <div
                key={f.key}
                className={`qbt-sidebar-item ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                <span className="qbt-sidebar-item-label">
                  {f.key === 'All'         && <span>🗂</span>}
                  {f.key === 'Downloading' && <span>⬇</span>}
                  {f.key === 'Seeding'     && <span>⬆</span>}
                  {f.key === 'Paused'      && <span>⏸</span>}
                  {f.key === 'Completed'   && <span>✅</span>}
                  {f.label}
                </span>
                <span className="qbt-sidebar-count">{counts[f.key as keyof typeof counts]}</span>
              </div>
            ))}
          </div>
          <div className="qbt-sidebar-section">
            <div className="qbt-sidebar-title">Categories</div>
            {CATEGORIES.map(cat => (
              <div
                key={cat.name}
                className={`qbt-sidebar-item ${filter === cat.name ? 'active' : ''}`}
                onClick={() => setFilter(cat.name)}
              >
                <span className="qbt-sidebar-item-label">
                  <span className="qbt-cat-dot" style={{ background: cat.color }} />
                  {cat.name}
                </span>
                <span className="qbt-sidebar-count">
                  {torrents.filter(t => t.category === cat.name).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Torrent list + detail panel */}
        <div className="qbt-right">

          {/* Torrent table */}
          <div className="qbt-list-wrap">
            <table className="qbt-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th style={{ minWidth: 220 }}>Name</th>
                  <th style={{ width: 72 }}>Size</th>
                  <th style={{ width: 120 }}>Done</th>
                  <th style={{ width: 90 }}>Status</th>
                  <th style={{ width: 50 }}>Seeds</th>
                  <th style={{ width: 50 }}>Peers</th>
                  <th style={{ width: 80 }}>Speed ↓</th>
                  <th style={{ width: 80 }}>Speed ↑</th>
                  <th style={{ width: 70 }}>ETA</th>
                </tr>
              </thead>
              <tbody>
                {filteredTorrents.map((t, idx) => (
                  <tr
                    key={t.id}
                    className={selectedId === t.id ? 'selected' : ''}
                    onClick={() => handleRowClick(t.id)}
                  >
                    <td>{idx + 1}</td>
                    <td title={t.name}>
                      <div className="qbt-name-cell">
                        <span className="qbt-type-icon">{t.typeIcon}</span>
                        <span className="qbt-name-text">{t.name}</span>
                      </div>
                    </td>
                    <td>{t.size}</td>
                    <td>
                      <div className="qbt-done-cell">
                        <div className="qbt-progress-wrap">
                          <div
                            className={`qbt-progress-bar ${t.status}`}
                            style={{ width: `${t.done}%` }}
                          />
                        </div>
                        <span className="qbt-done-pct">{t.done.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className={statusClass(t.status)}>{statusLabel(t.status)}</td>
                    <td style={{ color: t.seeds > 0 ? '#4ade80' : '#666' }}>{t.seeds}</td>
                    <td style={{ color: t.peers > 0 ? '#60a5fa' : '#666' }}>{t.peers}</td>
                    <td style={{ color: t.dlSpeed > 0 ? '#60a5fa' : '#666' }}>{fmtSpeed(t.dlSpeed)}</td>
                    <td style={{ color: t.ulSpeed > 0 ? '#4ade80' : '#666' }}>{fmtSpeed(t.ulSpeed)}</td>
                    <td style={{ color: '#aaa' }}>{t.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          <div className="qbt-detail-panel">
            <div className="qbt-detail-tabs">
              {(['General', 'Trackers', 'Peers', 'Content'] as DetailTab[]).map(tab => (
                <button
                  key={tab}
                  className={`qbt-detail-tab ${detailTab === tab ? 'active' : ''}`}
                  onClick={() => setDetailTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="qbt-detail-body">
              {!selected ? (
                <div className="qbt-detail-empty">Select a torrent to view details</div>
              ) : (
                <>
                  {detailTab === 'General' && (
                    <div className="qbt-detail-grid">
                      <span className="qbt-detail-label">Save Path:</span>
                      <span className="qbt-detail-value">{selected.savePath}</span>
                      <span className="qbt-detail-label">Added:</span>
                      <span className="qbt-detail-value">{selected.added}</span>

                      <span className="qbt-detail-label">Total Size:</span>
                      <span className="qbt-detail-value">{selected.size}</span>
                      <span className="qbt-detail-label">Category:</span>
                      <span className="qbt-detail-value">{selected.category}</span>

                      <span className="qbt-detail-label">Downloaded:</span>
                      <span className="qbt-detail-value">
                        {(selected.sizeBytes * selected.done / 100 / 1073741824).toFixed(2)} GiB
                      </span>
                      <span className="qbt-detail-label">Ratio:</span>
                      <span className="qbt-detail-value">
                        {selected.status === 'seeding' ? (Math.random() * 2 + 1).toFixed(3) : '0.000'}
                      </span>

                      <span className="qbt-detail-label">Status:</span>
                      <span className={`qbt-detail-value ${statusClass(selected.status)}`}>
                        {statusLabel(selected.status)}
                      </span>
                      <span className="qbt-detail-label">Seeds:</span>
                      <span className="qbt-detail-value">{selected.seeds} ({selected.seeds} total)</span>

                      <span className="qbt-detail-label">Hash:</span>
                      <span className="qbt-detail-value" style={{ fontFamily: 'monospace', fontSize: '10px', gridColumn: '2 / 5' }}>
                        {selected.hash}
                      </span>
                    </div>
                  )}

                  {detailTab === 'Trackers' && (
                    <div className="qbt-trackers-list">
                      <div className="qbt-tracker-row">
                        <span className="qbt-tracker-url">{selected.tracker}</span>
                        <span className="qbt-tracker-stat" style={{ color: '#4ade80' }}>Working</span>
                        <span className="qbt-tracker-stat">{selected.seeds} seeds</span>
                      </div>
                      <div className="qbt-tracker-row">
                        <span className="qbt-tracker-url">udp://tracker.coppersurfer.tk:6969/announce</span>
                        <span className="qbt-tracker-stat" style={{ color: '#4ade80' }}>Working</span>
                        <span className="qbt-tracker-stat">{Math.floor(selected.seeds * 0.7)} seeds</span>
                      </div>
                      <div className="qbt-tracker-row">
                        <span className="qbt-tracker-url">udp://9.rarbg.to:2920/announce</span>
                        <span className="qbt-tracker-stat" style={{ color: '#f59e0b' }}>Not contacted</span>
                        <span className="qbt-tracker-stat">—</span>
                      </div>
                      <div className="qbt-tracker-row">
                        <span className="qbt-tracker-url">udp://tracker.internetwarriors.net:1337/announce</span>
                        <span className="qbt-tracker-stat" style={{ color: '#f87171' }}>Not working</span>
                        <span className="qbt-tracker-stat">—</span>
                      </div>
                    </div>
                  )}

                  {detailTab === 'Peers' && (
                    <table className="qbt-peers-table">
                      <thead>
                        <tr>
                          <th>IP</th>
                          <th>Port</th>
                          <th>Client</th>
                          <th>Progress</th>
                          <th>Down Speed</th>
                          <th>Up Speed</th>
                          <th>Flags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.peers > 0 ? (
                          Array.from({ length: Math.min(selected.peers, 6) }, (_, i) => (
                            <tr key={i}>
                              <td style={{ fontFamily: 'monospace' }}>
                                {`${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`}
                              </td>
                              <td>{Math.floor(Math.random() * 40000 + 10000)}</td>
                              <td style={{ color: '#aaa' }}>
                                {['qBittorrent 4.6.2', 'µTorrent 3.5.5', 'Transmission 4.0', 'Deluge 2.1', 'rTorrent 0.9.8', 'Vuze 5.7'][i % 6]}
                              </td>
                              <td>{(Math.random() * 80 + 10).toFixed(1)}%</td>
                              <td style={{ color: '#60a5fa' }}>{fmtSpeed(Math.floor(Math.random() * 500 + 50))}</td>
                              <td style={{ color: '#4ade80' }}>{fmtSpeed(Math.floor(Math.random() * 200 + 20))}</td>
                              <td style={{ color: '#888' }}>D</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} style={{ color: '#666', textAlign: 'center', padding: '12px' }}>
                              No connected peers
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {detailTab === 'Content' && (
                    <table className="qbt-content-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Size</th>
                          <th>Progress</th>
                          <th>Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.files.map((f, i) => (
                          <tr key={i}>
                            <td>{f.name}</td>
                            <td>{f.size}</td>
                            <td>
                              <div className="qbt-done-cell">
                                <div className="qbt-progress-wrap" style={{ width: 60 }}>
                                  <div
                                    className={`qbt-progress-bar ${selected.status}`}
                                    style={{ width: `${f.progress}%` }}
                                  />
                                </div>
                                <span>{f.progress}%</span>
                              </div>
                            </td>
                            <td style={{ color: f.priority === 'High' ? '#f59e0b' : '#888' }}>{f.priority}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="qbt-statusbar">
        <span className="qbt-statusbar-item">
          <span className="label">DHT:</span>
          <span className="val" style={{ color: '#4ade80' }}>●</span>
          <span className="val">2,847 nodes</span>
        </span>
        <span className="qbt-statusbar-sep">|</span>
        <span className="qbt-statusbar-item">
          <span className="label">↓</span>
          <span className="val" style={{ color: '#60a5fa' }}>{fmtSpeed(totalDl)}</span>
        </span>
        <span className="qbt-statusbar-item">
          <span className="label">↑</span>
          <span className="val" style={{ color: '#4ade80' }}>{fmtSpeed(totalUl)}</span>
        </span>
        <span className="qbt-statusbar-sep">|</span>
        <span className="qbt-statusbar-item">
          <span className="label">Free space:</span>
          <span className="val">324.8 GB</span>
        </span>
        <span className="qbt-statusbar-sep">|</span>
        <span className="qbt-statusbar-item">
          <span className="label">Torrents:</span>
          <span className="val">{filteredTorrents.length} shown / {torrents.length} total</span>
        </span>
      </div>
    </div>
  );
}
