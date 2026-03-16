import { useState, useRef, useEffect } from 'react';
import './WinDirStat.css';

interface DirNode {
  name: string;
  size: number;
  files: number;
  color: string;
  children?: DirNode[];
}

const PALETTE = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c','#3498db','#9b59b6','#e91e63','#00bcd4','#8bc34a','#ff5722','#607d8b','#795548','#ff9800','#4caf50','#2196f3','#9c27b0','#f44336','#009688','#cddc39'];

interface DriveInfo {
  label: string;
  total: number;
  used: number;
  tree: DirNode;
  exts: { ext: string; size: number; color: string }[];
  scanPaths: string[];
}

const DRIVES: Record<string, DriveInfo> = {
  'C:\\': {
    label: 'Samsung SSD 990 Pro 512GB',
    total: 512, used: 346.2,
    scanPaths: [
      'C:\\Windows\\System32\\ntoskrnl.exe',
      'C:\\Program Files\\Steam\\steamapps\\',
      'C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\',
      'C:\\Program Files\\Microsoft Office\\root\\',
      'C:\\Windows\\WinSxS\\amd64_microsoft-windows-',
      'C:\\Users\\User\\Downloads\\',
      'C:\\ProgramData\\NVIDIA\\',
      'C:\\Program Files (x86)\\Discord\\',
    ],
    exts: [
      { ext: '.exe', size: 28.4, color: PALETTE[5] },
      { ext: '.dll', size: 42.1, color: PALETTE[2] },
      { ext: '.mp4', size: 18.6, color: PALETTE[0] },
      { ext: '.pak', size: 34.2, color: PALETTE[3] },
      { ext: '.jpg', size: 8.4,  color: PALETTE[4] },
      { ext: '.png', size: 6.2,  color: PALETTE[1] },
      { ext: '.dat', size: 14.8, color: PALETTE[6] },
      { ext: '.log', size: 4.2,  color: PALETTE[11] },
      { ext: '.zip', size: 18.6, color: PALETTE[10] },
      { ext: '.sys', size: 5.6,  color: PALETTE[8] },
      { ext: 'other', size: 28.2, color: PALETTE[13] },
    ],
    tree: {
      name: 'C:\\', size: 512, files: 0, color: '#555', children: [
        { name: 'Program Files', size: 156.4, files: 48230, color: PALETTE[2], children: [
          { name: 'Steam', size: 89.2, files: 21400, color: PALETTE[0] },
          { name: 'Microsoft Office', size: 32.1, files: 8820, color: PALETTE[2] },
          { name: 'Adobe', size: 28.6, files: 12100, color: PALETTE[10] },
          { name: 'AutoCAD', size: 6.5, files: 3200, color: PALETTE[5] },
        ]},
        { name: 'Program Files (x86)', size: 48.2, files: 19300, color: PALETTE[3], children: [
          { name: 'Google', size: 12.4, files: 3100, color: PALETTE[5] },
          { name: 'Malwarebytes', size: 8.8, files: 1200, color: PALETTE[6] },
          { name: 'Discord', size: 9.6, files: 2400, color: PALETTE[9] },
          { name: 'Spotify', size: 17.4, files: 5800, color: PALETTE[3] },
        ]},
        { name: 'Windows', size: 28.6, files: 82400, color: PALETTE[5], children: [
          { name: 'System32', size: 14.2, files: 44200, color: PALETTE[5] },
          { name: 'SysWOW64', size: 8.1, files: 22100, color: PALETTE[6] },
          { name: 'WinSxS', size: 4.6, files: 10800, color: PALETTE[7] },
          { name: 'Temp', size: 1.7, files: 5300, color: PALETTE[8] },
        ]},
        { name: 'Users', size: 86.4, files: 62800, color: PALETTE[6], children: [
          { name: 'User', size: 84.8, files: 61200, color: PALETTE[6], children: [
            { name: 'Downloads', size: 38.4, files: 2100, color: PALETTE[10] },
            { name: 'Documents', size: 14.2, files: 8400, color: PALETTE[2] },
            { name: 'Desktop', size: 2.8, files: 340, color: PALETTE[3] },
            { name: 'Pictures', size: 12.6, files: 4200, color: PALETTE[4] },
            { name: 'Videos', size: 14.4, files: 820, color: PALETTE[0] },
            { name: 'Music', size: 2.4, files: 380, color: PALETTE[9] },
            { name: 'AppData', size: 36.8, files: 44800, color: PALETTE[6], children: [
              { name: 'Local', size: 22.4, files: 28200, color: PALETTE[5] },
              { name: 'Roaming', size: 12.6, files: 14200, color: PALETTE[7] },
              { name: 'LocalLow', size: 1.8, files: 2400, color: PALETTE[8] },
            ]},
          ]},
        ]},
        { name: 'ProgramData', size: 12.4, files: 8200, color: PALETTE[8], children: [
          { name: 'Microsoft', size: 6.2, files: 4100, color: PALETTE[5] },
          { name: 'NVIDIA', size: 3.8, files: 2800, color: PALETTE[3] },
          { name: 'Package Cache', size: 2.4, files: 1300, color: PALETTE[4] },
        ]},
        { name: 'pagefile.sys', size: 8.0, files: 1, color: PALETTE[11] },
        { name: 'hiberfil.sys', size: 6.4, files: 1, color: PALETTE[12] },
        { name: 'swapfile.sys', size: 0.5, files: 1, color: PALETTE[13] },
      ],
    },
  },
  'D:\\': {
    label: 'Samsung SSD 990 Pro 2TB',
    total: 2000, used: 1884,
    scanPaths: [
      'D:\\Games\\steamapps\\common\\Cyberpunk 2077\\',
      'D:\\Games\\steamapps\\common\\Elden Ring\\',
      'D:\\Games\\steamapps\\common\\GTA V\\',
      'D:\\Games\\steamapps\\common\\Red Dead Redemption 2\\',
      'D:\\Games\\steamapps\\common\\Baldur\'s Gate 3\\',
      'D:\\Backups\\System\\',
      'D:\\Downloads\\',
    ],
    exts: [
      { ext: '.exe', size: 12.4, color: PALETTE[5] },
      { ext: '.dll', size: 28.6, color: PALETTE[2] },
      { ext: '.pak', size: 820.4, color: PALETTE[3] },
      { ext: '.bin', size: 420.2, color: PALETTE[0] },
      { ext: '.dat', size: 180.8, color: PALETTE[6] },
      { ext: '.cfg', size: 2.4,  color: PALETTE[4] },
      { ext: '.log', size: 8.2,  color: PALETTE[11] },
      { ext: '.zip', size: 142.6, color: PALETTE[10] },
      { ext: 'other', size: 268.4, color: PALETTE[13] },
    ],
    tree: {
      name: 'D:\\', size: 2000, files: 0, color: '#555', children: [
        { name: 'Games', size: 1624.4, files: 284200, color: PALETTE[0], children: [
          { name: 'steamapps', size: 1580.2, files: 271000, color: PALETTE[0], children: [
            { name: 'Cyberpunk 2077', size: 70.4, files: 4200, color: PALETTE[7] },
            { name: 'Elden Ring', size: 60.8, files: 3800, color: PALETTE[10] },
            { name: 'GTA V', size: 110.2, files: 5100, color: PALETTE[1] },
            { name: 'Red Dead Redemption 2', size: 148.6, files: 6200, color: PALETTE[10] },
            { name: "Baldur's Gate 3", size: 122.7, files: 8400, color: PALETTE[6] },
            { name: 'Hogwarts Legacy', size: 84.2, files: 3200, color: PALETTE[7] },
            { name: 'Starfield', size: 140.4, files: 7800, color: PALETTE[5] },
            { name: 'Diablo IV', size: 90.6, files: 4100, color: PALETTE[0] },
            { name: 'Call of Duty MW3', size: 230.8, files: 9200, color: PALETTE[11] },
            { name: 'Forza Horizon 5', size: 110.4, files: 4800, color: PALETTE[1] },
            { name: 'other games', size: 406.1, files: 224200, color: PALETTE[13] },
          ]},
          { name: 'GOG Games', size: 44.2, files: 13200, color: PALETTE[4] },
        ]},
        { name: 'Backups', size: 184.8, files: 1240, color: PALETTE[8], children: [
          { name: 'System', size: 124.4, files: 840, color: PALETTE[5] },
          { name: 'Documents', size: 60.4, files: 400, color: PALETTE[2] },
        ]},
        { name: 'Downloads', size: 74.8, files: 842, color: PALETTE[10] },
      ],
    },
  },
  'E:\\': {
    label: 'WD Black SN850X 2TB',
    total: 2000, used: 1764,
    scanPaths: [
      'E:\\Games\\steamapps\\common\\World of Warcraft\\',
      'E:\\Games\\steamapps\\common\\Final Fantasy XIV\\',
      'E:\\Media\\Movies\\',
      'E:\\Media\\TV Shows\\',
      'E:\\Games\\steamapps\\common\\Path of Exile\\',
    ],
    exts: [
      { ext: '.mkv', size: 480.2, color: PALETTE[0] },
      { ext: '.mp4', size: 284.6, color: PALETTE[1] },
      { ext: '.pak', size: 380.4, color: PALETTE[3] },
      { ext: '.bin', size: 280.8, color: PALETTE[6] },
      { ext: '.exe', size: 8.4,  color: PALETTE[5] },
      { ext: '.dll', size: 18.6, color: PALETTE[2] },
      { ext: '.srt', size: 2.2,  color: PALETTE[4] },
      { ext: 'other', size: 308.8, color: PALETTE[13] },
    ],
    tree: {
      name: 'E:\\', size: 2000, files: 0, color: '#555', children: [
        { name: 'Games', size: 984.6, files: 182400, color: PALETTE[0], children: [
          { name: 'World of Warcraft', size: 102.4, files: 22400, color: PALETTE[5] },
          { name: 'Final Fantasy XIV', size: 44.8, files: 8200, color: PALETTE[6] },
          { name: 'Path of Exile', size: 28.6, files: 6400, color: PALETTE[10] },
          { name: 'Guild Wars 2', size: 62.4, files: 12800, color: PALETTE[0] },
          { name: 'Age of Empires IV', size: 50.2, files: 4800, color: PALETTE[2] },
          { name: 'Civilization VI', size: 18.4, files: 3200, color: PALETTE[3] },
          { name: 'Total War Warhammer III', size: 120.8, files: 18400, color: PALETTE[7] },
          { name: 'other games', size: 557.0, files: 106200, color: PALETTE[13] },
        ]},
        { name: 'Media', size: 764.4, files: 8420, color: PALETTE[1], children: [
          { name: 'Movies', size: 480.2, files: 4200, color: PALETTE[0], children: [
            { name: '4K UHD', size: 284.6, files: 820, color: PALETTE[0] },
            { name: '1080p', size: 142.4, files: 2100, color: PALETTE[1] },
            { name: 'Classics', size: 53.2, files: 1280, color: PALETTE[2] },
          ]},
          { name: 'TV Shows', size: 284.2, files: 4220, color: PALETTE[3], children: [
            { name: 'Breaking Bad', size: 42.4, files: 620, color: PALETTE[0] },
            { name: 'Game of Thrones', size: 88.6, files: 840, color: PALETTE[7] },
            { name: 'The Last of Us', size: 24.8, files: 180, color: PALETTE[10] },
            { name: 'other shows', size: 128.4, files: 2580, color: PALETTE[13] },
          ]},
        ]},
        { name: 'Downloads', size: 15.0, files: 240, color: PALETTE[10] },
      ],
    },
  },
  'F:\\': {
    label: 'Seagate Barracuda 8TB',
    total: 8000, used: 6348,
    scanPaths: [
      'F:\\OBS Recordings\\2025-03\\',
      'F:\\Old Projects\\WebDev\\',
      'F:\\Virtual Machines\\Windows 11\\',
      'F:\\Archive\\2023\\',
      'F:\\OBS Recordings\\2025-02\\',
    ],
    exts: [
      { ext: '.mkv', size: 1840.4, color: PALETTE[0] },
      { ext: '.mp4', size: 920.2, color: PALETTE[1] },
      { ext: '.vmdk', size: 1480.6, color: PALETTE[5] },
      { ext: '.zip', size: 480.4, color: PALETTE[10] },
      { ext: '.iso', size: 284.8, color: PALETTE[3] },
      { ext: '.psd', size: 128.4, color: PALETTE[6] },
      { ext: '.pdf', size: 42.6,  color: PALETTE[7] },
      { ext: '.js',  size: 28.4,  color: PALETTE[2] },
      { ext: 'other', size: 1142.2, color: PALETTE[13] },
    ],
    tree: {
      name: 'F:\\', size: 8000, files: 0, color: '#555', children: [
        { name: 'OBS Recordings', size: 2480.4, files: 1240, color: PALETTE[0], children: [
          { name: '2025-03', size: 480.2, files: 240, color: PALETTE[0] },
          { name: '2025-02', size: 420.8, files: 210, color: PALETTE[1] },
          { name: '2025-01', size: 380.4, files: 190, color: PALETTE[2] },
          { name: '2024', size: 1199.0, files: 600, color: PALETTE[3] },
        ]},
        { name: 'Virtual Machines', size: 1840.6, files: 84, color: PALETTE[5], children: [
          { name: 'Windows 11', size: 980.4, files: 42, color: PALETTE[5] },
          { name: 'Ubuntu 22.04', size: 480.2, files: 24, color: PALETTE[3] },
          { name: 'Kali Linux', size: 380.0, files: 18, color: PALETTE[0] },
        ]},
        { name: 'Old Projects', size: 842.4, files: 48200, color: PALETTE[2], children: [
          { name: 'WebDev', size: 284.6, files: 18400, color: PALETTE[5] },
          { name: 'GameDev', size: 480.8, files: 24200, color: PALETTE[4] },
          { name: 'School', size: 77.0, files: 5600, color: PALETTE[2] },
        ]},
        { name: 'Archive', size: 884.6, files: 8420, color: PALETTE[8], children: [
          { name: '2023', size: 284.4, files: 2840, color: PALETTE[8] },
          { name: '2022', size: 240.2, files: 2420, color: PALETTE[9] },
          { name: '2021', size: 360.0, files: 3160, color: PALETTE[11] },
        ]},
        { name: 'Downloads', size: 300.0, files: 840, color: PALETTE[10] },
      ],
    },
  },
  'G:\\': {
    label: 'Crucial P5 Plus 1TB',
    total: 1000, used: 862,
    scanPaths: [
      'G:\\Mods\\Skyrim\\SKSE\\',
      'G:\\Mods\\Minecraft\\mods\\',
      'G:\\Dev Tools\\Python\\',
      'G:\\ISOs\\',
      'G:\\Mods\\Skyrim\\textures\\',
    ],
    exts: [
      { ext: '.esp', size: 42.4, color: PALETTE[6] },
      { ext: '.bsa', size: 180.6, color: PALETTE[7] },
      { ext: '.jar', size: 28.4,  color: PALETTE[2] },
      { ext: '.iso', size: 184.8, color: PALETTE[3] },
      { ext: '.exe', size: 48.4,  color: PALETTE[5] },
      { ext: '.dll', size: 84.2,  color: PALETTE[2] },
      { ext: '.py',  size: 8.4,   color: PALETTE[4] },
      { ext: '.zip', size: 120.4, color: PALETTE[10] },
      { ext: 'other', size: 164.4, color: PALETTE[13] },
    ],
    tree: {
      name: 'G:\\', size: 1000, files: 0, color: '#555', children: [
        { name: 'Mods', size: 484.2, files: 182400, color: PALETTE[6], children: [
          { name: 'Skyrim', size: 284.6, files: 124000, color: PALETTE[7], children: [
            { name: 'textures', size: 140.4, files: 48200, color: PALETTE[7] },
            { name: 'meshes', size: 84.2, files: 42000, color: PALETTE[8] },
            { name: 'SKSE', size: 24.8, files: 18200, color: PALETTE[9] },
            { name: 'scripts', size: 35.2, files: 15600, color: PALETTE[10] },
          ]},
          { name: 'Minecraft', size: 120.4, files: 42000, color: PALETTE[4], children: [
            { name: 'mods', size: 48.4, files: 18200, color: PALETTE[4] },
            { name: 'resourcepacks', size: 42.8, files: 14400, color: PALETTE[3] },
            { name: 'shaderpacks', size: 29.2, files: 9400, color: PALETTE[1] },
          ]},
          { name: 'Fallout 4', size: 79.2, files: 16400, color: PALETTE[10] },
        ]},
        { name: 'Dev Tools', size: 248.4, files: 84200, color: PALETTE[5], children: [
          { name: 'Python', size: 84.2, files: 28400, color: PALETTE[4] },
          { name: 'Node.js', size: 42.4, files: 18200, color: PALETTE[3] },
          { name: 'Git', size: 18.4, files: 8200, color: PALETTE[10] },
          { name: 'VS Code', size: 84.8, files: 24200, color: PALETTE[5] },
          { name: 'JDK', size: 18.6, files: 5200, color: PALETTE[1] },
        ]},
        { name: 'ISOs', size: 129.4, files: 42, color: PALETTE[3], children: [
          { name: 'ubuntu-22.04.iso', size: 4.7, files: 1, color: PALETTE[3] },
          { name: 'Win11_22H2.iso', size: 5.8, files: 1, color: PALETTE[5] },
          { name: 'archlinux.iso', size: 0.9, files: 1, color: PALETTE[6] },
        ]},
      ],
    },
  },
};

function fmtGB(gb: number) {
  if (gb >= 1) return gb.toFixed(1) + ' GB';
  return (gb * 1024).toFixed(0) + ' MB';
}

function totalSize(node: DirNode): number {
  if (!node.children) return node.size;
  return node.children.reduce((s, c) => s + totalSize(c), 0);
}

interface TreeRowProps {
  node: DirNode;
  depth: number;
  parentSize: number;
  selected: DirNode | null;
  onSelect: (n: DirNode) => void;
}

function TreeRow({ node, depth, parentSize, selected, onSelect }: TreeRowProps) {
  const [open, setOpen] = useState(depth < 2);
  const sz = totalSize(node);
  const pct = parentSize > 0 ? ((sz / parentSize) * 100).toFixed(1) : '100.0';
  const fileCount = node.files > 0 ? node.files.toLocaleString() : '—';

  return (
    <div className="wds-node">
      <div
        className={`wds-node-row ${selected === node ? 'selected' : ''}`}
        onClick={() => { onSelect(node); if (node.children) setOpen(o => !o); }}
        style={{ paddingLeft: depth * 14 + 4 }}
      >
        {node.children
          ? <span className="wds-caret">{open ? '▼' : '▶'}</span>
          : <span className="wds-caret" />}
        <span className="wds-node-icon">{node.children ? (open ? '📂' : '📁') : '📄'}</span>
        <span className="wds-node-name">{node.name}</span>
        <span className="wds-node-size">{fmtGB(sz)}</span>
        <span className="wds-node-pct">{pct}%</span>
        <span className="wds-node-files">{fileCount}</span>
        <div className="wds-node-bar">
          <div className="wds-node-bar-fill" style={{ width: `${Math.min(100, +pct)}%`, background: node.color }} />
        </div>
      </div>
      {open && node.children?.map(child => (
        <TreeRow key={child.name} node={child} depth={depth + 1} parentSize={sz} selected={selected} onSelect={onSelect} />
      ))}
    </div>
  );
}

interface Cell { x: number; y: number; w: number; h: number; node: DirNode; }

function buildTreemap(nodes: DirNode[], x: number, y: number, w: number, h: number): Cell[] {
  const total = nodes.reduce((s, n) => s + totalSize(n), 0);
  if (total === 0 || w < 4 || h < 4) return [];
  const cells: Cell[] = [];
  let cx = x, cy = y, cw = w, ch = h;
  const sorted = [...nodes].sort((a, b) => totalSize(b) - totalSize(a));
  for (let i = 0; i < sorted.length; i++) {
    const node = sorted[i];
    const remaining = sorted.slice(i).reduce((s, n) => s + totalSize(n), 0);
    const frac = totalSize(node) / remaining;
    if (cw >= ch) {
      const cellW = Math.round(cw * frac);
      cells.push({ x: cx, y: cy, w: cellW, h: ch, node });
      cx += cellW; cw -= cellW;
    } else {
      const cellH = Math.round(ch * frac);
      cells.push({ x: cx, y: cy, w: cw, h: cellH, node });
      cy += cellH; ch -= cellH;
    }
  }
  return cells;
}

export default function WinDirStat() {
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [scanPath, setScanPath] = useState('');
  const [scanPct, setScanPct] = useState(0);
  const [selected, setSelected] = useState<DirNode | null>(null);
  const [drive, setDrive] = useState('C:\\');
  const [scannedDrive, setScannedDrive] = useState('C:\\');
  const [treemapSize, setTreemapSize] = useState({ w: 600, h: 200 });
  const treemapRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const e = entries[0];
      if (e) setTreemapSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) });
    });
    if (treemapRef.current) obs.observe(treemapRef.current);
    return () => obs.disconnect();
  }, []);

  const scan = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const d = drive;
    setPhase('scanning');
    setScanPct(0);
    setSelected(null);
    let pct = 0;
    const paths = DRIVES[d].scanPaths;
    timerRef.current = window.setInterval(() => {
      pct += Math.random() * 3 + 1;
      setScanPath(paths[Math.floor(Math.random() * paths.length)]);
      setScanPct(Math.min(100, Math.round(pct)));
      if (pct >= 100) {
        clearInterval(timerRef.current!);
        setScannedDrive(d);
        setPhase('done');
      }
    }, 80);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const info = DRIVES[scannedDrive];
  const root = info.tree;
  const cells = phase === 'done' && root.children
    ? buildTreemap(root.children, 0, 0, treemapSize.w, treemapSize.h)
    : [];

  return (
    <div className="wds-root">
      <div className="wds-toolbar">
        <button className="wds-btn" onClick={scan}>📊 Scan</button>
        <button className="wds-btn" onClick={() => { setPhase('idle'); setSelected(null); }}>✕ Close</button>
        <select className="wds-drive-select" value={drive} onChange={e => { setDrive(e.target.value); setPhase('idle'); setSelected(null); }}>
          {Object.keys(DRIVES).map(k => <option key={k} value={k}>{k} [{DRIVES[k].label}]</option>)}
        </select>
        <span style={{ marginLeft: 8, fontSize: 11, color: '#666' }}>
          {DRIVES[drive].total} GB total · {DRIVES[drive].used} GB used · {(DRIVES[drive].total - DRIVES[drive].used).toFixed(1)} GB free
        </span>
      </div>

      {phase === 'idle' && (
        <div className="wds-scanning">
          <div style={{ fontSize: 48 }}>📊</div>
          <div className="wds-scan-label">Select a drive and click Scan</div>
          <button className="wds-btn" style={{ padding: '6px 20px', fontSize: 13 }} onClick={scan}>Scan {drive}</button>
        </div>
      )}

      {phase === 'scanning' && (
        <div className="wds-scanning">
          <div className="wds-scan-ring" />
          <div className="wds-scan-label">Scanning {drive}…</div>
          <div className="wds-scan-file">{scanPath}</div>
          <div className="wds-progress-bar">
            <div className="wds-progress-fill" style={{ width: `${scanPct}%` }} />
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>{scanPct}%</div>
        </div>
      )}

      {phase === 'done' && (
        <div className="wds-main">
          <div className="wds-upper">
            <div className="wds-tree">
              <div className="wds-tree-header">
                <span className="wds-th-name">Name</span>
                <span className="wds-th-size">Size</span>
                <span className="wds-th-pct">%</span>
                <span className="wds-th-files">Files</span>
                <span style={{ width: 84, flexShrink: 0 }} />
              </div>
              <TreeRow node={root} depth={0} parentSize={totalSize(root)} selected={selected} onSelect={setSelected} />
            </div>
            <div className="wds-ext-list">
              <div className="wds-ext-header">Extension</div>
              {info.exts.map(e => (
                <div key={e.ext} className="wds-ext-item">
                  <div className="wds-ext-dot" style={{ background: e.color }} />
                  <span className="wds-ext-name">{e.ext}</span>
                  <span className="wds-ext-size">{fmtGB(e.size)}</span>
                  <span className="wds-ext-pct">{((e.size / info.used) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="wds-treemap" ref={treemapRef}>
            {cells.map((cell, i) => (
              <div
                key={i}
                className="wds-treemap-cell"
                style={{ left: cell.x, top: cell.y, width: cell.w, height: cell.h, background: cell.node.color }}
                onClick={() => setSelected(cell.node)}
                title={`${cell.node.name} — ${fmtGB(totalSize(cell.node))}`}
              >
                {cell.w > 40 && cell.h > 20 && (
                  <span className="wds-treemap-label">{cell.node.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="wds-status">
        {selected
          ? `${selected.name}  —  ${fmtGB(totalSize(selected))}  —  ${selected.files.toLocaleString()} files`
          : phase === 'done'
            ? `${scannedDrive}  —  ${fmtGB(info.used)} used of ${fmtGB(info.total)}  —  ${((info.used / info.total) * 100).toFixed(1)}% full  —  ${fmtGB(info.total - info.used)} free`
            : 'Ready'}
      </div>
    </div>
  );
}
