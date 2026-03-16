import { useState, useRef, useEffect } from 'react';
import './WinDirStat.css';

interface DirNode {
  name: string;
  size: number; // GB
  files: number;
  color: string;
  children?: DirNode[];
}

const PALETTE = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c','#3498db','#9b59b6','#e91e63','#00bcd4','#8bc34a','#ff5722','#607d8b','#795548','#ff9800','#4caf50','#2196f3','#9c27b0','#f44336','#009688','#cddc39'];

const TREE: DirNode[] = [
  {
    name: 'C:\\', size: 512, files: 0, color: '#555', children: [
      {
        name: 'Program Files', size: 156.4, files: 48230, color: PALETTE[2], children: [
          { name: 'Steam', size: 89.2, files: 21400, color: PALETTE[0] },
          { name: 'Microsoft Office', size: 32.1, files: 8820, color: PALETTE[2] },
          { name: 'Adobe', size: 28.6, files: 12100, color: PALETTE[10] },
          { name: 'AutoCAD', size: 6.5, files: 3200, color: PALETTE[5] },
        ],
      },
      {
        name: 'Program Files (x86)', size: 48.2, files: 19300, color: PALETTE[3], children: [
          { name: 'Google', size: 12.4, files: 3100, color: PALETTE[5] },
          { name: 'Malwarebytes', size: 8.8, files: 1200, color: PALETTE[6] },
          { name: 'Discord', size: 9.6, files: 2400, color: PALETTE[9] },
          { name: 'Spotify', size: 17.4, files: 5800, color: PALETTE[3] },
        ],
      },
      {
        name: 'Windows', size: 28.6, files: 82400, color: PALETTE[5], children: [
          { name: 'System32', size: 14.2, files: 44200, color: PALETTE[5] },
          { name: 'SysWOW64', size: 8.1, files: 22100, color: PALETTE[6] },
          { name: 'WinSxS', size: 4.6, files: 10800, color: PALETTE[7] },
          { name: 'Temp', size: 1.7, files: 5300, color: PALETTE[8] },
        ],
      },
      {
        name: 'Users', size: 86.4, files: 62800, color: PALETTE[6], children: [
          {
            name: 'User', size: 84.8, files: 61200, color: PALETTE[6], children: [
              { name: 'Downloads', size: 38.4, files: 2100, color: PALETTE[10] },
              { name: 'Documents', size: 14.2, files: 8400, color: PALETTE[2] },
              { name: 'Desktop', size: 2.8, files: 340, color: PALETTE[3] },
              { name: 'Pictures', size: 12.6, files: 4200, color: PALETTE[4] },
              { name: 'Videos', size: 14.4, files: 820, color: PALETTE[0] },
              { name: 'Music', size: 2.4, files: 380, color: PALETTE[9] },
              {
                name: 'AppData', size: 36.8, files: 44800, color: PALETTE[6], children: [
                  { name: 'Local', size: 22.4, files: 28200, color: PALETTE[5] },
                  { name: 'Roaming', size: 12.6, files: 14200, color: PALETTE[7] },
                  { name: 'LocalLow', size: 1.8, files: 2400, color: PALETTE[8] },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'ProgramData', size: 12.4, files: 8200, color: PALETTE[8], children: [
          { name: 'Microsoft', size: 6.2, files: 4100, color: PALETTE[5] },
          { name: 'NVIDIA', size: 3.8, files: 2800, color: PALETTE[3] },
          { name: 'Package Cache', size: 2.4, files: 1300, color: PALETTE[4] },
        ],
      },
      { name: 'pagefile.sys', size: 8.0, files: 1, color: PALETTE[11] },
      { name: 'hiberfil.sys', size: 6.4, files: 1, color: PALETTE[12] },
      { name: 'swapfile.sys', size: 0.5, files: 1, color: PALETTE[13] },
    ],
  },
];

const EXTS = [
  { ext: '.exe', size: 28.4, color: PALETTE[5] },
  { ext: '.dll', size: 42.1, color: PALETTE[2] },
  { ext: '.mp4', size: 38.6, color: PALETTE[0] },
  { ext: '.pak', size: 34.2, color: PALETTE[3] },
  { ext: '.jpg', size: 8.4, color: PALETTE[4] },
  { ext: '.png', size: 6.2, color: PALETTE[1] },
  { ext: '.dat', size: 14.8, color: PALETTE[6] },
  { ext: '.log', size: 4.2, color: PALETTE[11] },
  { ext: '.zip', size: 18.6, color: PALETTE[10] },
  { ext: '.pdf', size: 3.8, color: PALETTE[7] },
  { ext: '.mp3', size: 2.4, color: PALETTE[9] },
  { ext: '.sys', size: 5.6, color: PALETTE[8] },
  { ext: 'other', size: 28.2, color: PALETTE[13] },
];

const SCAN_PATHS = [
  'C:\\Windows\\System32\\ntoskrnl.exe',
  'C:\\Program Files\\Steam\\steamapps\\',
  'C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\',
  'C:\\Program Files\\Microsoft Office\\root\\',
  'C:\\Windows\\WinSxS\\amd64_microsoft-windows-',
  'C:\\Users\\User\\Downloads\\',
  'C:\\ProgramData\\NVIDIA\\',
  'C:\\Program Files (x86)\\Discord\\',
];

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

// Build treemap cells using simple squarified layout approximation
interface Cell { x: number; y: number; w: number; h: number; node: DirNode; }

function buildTreemap(nodes: DirNode[], x: number, y: number, w: number, h: number): Cell[] {
  const total = nodes.reduce((s, n) => s + totalSize(n), 0);
  if (total === 0 || w < 4 || h < 4) return [];
  const cells: Cell[] = [];
  let cx = x, cy = y, cw = w, ch = h;
  const sorted = [...nodes].sort((a, b) => totalSize(b) - totalSize(a));

  for (let i = 0; i < sorted.length; i++) {
    const node = sorted[i];
    const sz = totalSize(node);
    const remaining = sorted.slice(i).reduce((s, n) => s + totalSize(n), 0);
    const frac = sz / remaining;
    if (cw >= ch) {
      const cellW = Math.round(cw * frac);
      cells.push({ x: cx, y: cy, w: cellW, h: ch, node });
      cx += cellW;
      cw -= cellW;
    } else {
      const cellH = Math.round(ch * frac);
      cells.push({ x: cx, y: cy, w: cw, h: cellH, node });
      cy += cellH;
      ch -= cellH;
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
  const [treemapSize, setTreemapSize] = useState({ w: 600, h: 200 });
  const treemapRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const root = TREE[0];

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const e = entries[0];
      if (e) setTreemapSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) });
    });
    if (treemapRef.current) obs.observe(treemapRef.current);
    return () => obs.disconnect();
  }, []);

  const scan = () => {
    setPhase('scanning');
    setScanPct(0);
    let pct = 0;
    timerRef.current = window.setInterval(() => {
      pct += Math.random() * 3 + 1;
      setScanPath(SCAN_PATHS[Math.floor(Math.random() * SCAN_PATHS.length)]);
      setScanPct(Math.min(100, Math.round(pct)));
      if (pct >= 100) {
        clearInterval(timerRef.current!);
        setPhase('done');
      }
    }, 80);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const cells = phase === 'done' && root.children
    ? buildTreemap(root.children, 0, 0, treemapSize.w, treemapSize.h)
    : [];

  return (
    <div className="wds-root">
      <div className="wds-toolbar">
        <button className="wds-btn" onClick={scan}>📊 Scan</button>
        <button className="wds-btn" onClick={() => { setPhase('idle'); setSelected(null); }}>✕ Close</button>
        <select className="wds-drive-select" value={drive} onChange={e => setDrive(e.target.value)}>
          <option>C:\</option>
          <option>D:\</option>
        </select>
        <span style={{ marginLeft: 8, fontSize: 11, color: '#666' }}>{drive} — 512 GB total, 346.2 GB used, 165.8 GB free</span>
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
            {/* Directory tree */}
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

            {/* Extension list */}
            <div className="wds-ext-list">
              <div className="wds-ext-header">Extension</div>
              {EXTS.map(e => (
                <div key={e.ext} className="wds-ext-item">
                  <div className="wds-ext-dot" style={{ background: e.color }} />
                  <span className="wds-ext-name">{e.ext}</span>
                  <span className="wds-ext-size">{e.size} GB</span>
                  <span className="wds-ext-pct">{((e.size / 237) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Treemap */}
          <div className="wds-treemap" ref={treemapRef}>
            {cells.map((cell, i) => (
              <div
                key={i}
                className="wds-treemap-cell"
                style={{
                  left: cell.x, top: cell.y, width: cell.w, height: cell.h,
                  background: cell.node.color,
                }}
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
          : phase === 'done' ? `${drive}  —  346.2 GB used of 512 GB  —  ${root.files.toLocaleString()} files` : 'Ready'}
      </div>
    </div>
  );
}
