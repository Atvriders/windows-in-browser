import { useState, useRef } from 'react';
import './CCleaner.css';

type Phase = 'idle' | 'analyzing' | 'results' | 'cleaning' | 'done';

interface JunkItem {
  icon: string;
  name: string;
  detail: string;
  size: number; // MB
}

const JUNK_TEMPLATES = [
  { icon: '🌐', name: 'Internet Explorer Cache', detail: 'Temporary internet files', sizeMB: [12, 340] },
  { icon: '🌐', name: 'Chrome - Cache', detail: 'Cached web content', sizeMB: [40, 900] },
  { icon: '🌐', name: 'Chrome - Cookies', detail: 'Stored cookies', sizeMB: [1, 8] },
  { icon: '🌐', name: 'Firefox - Cache', detail: 'Browser cache files', sizeMB: [20, 600] },
  { icon: '🌐', name: 'Edge - Cache', detail: 'Microsoft Edge cached files', sizeMB: [30, 500] },
  { icon: '🪟', name: 'Windows - Recycle Bin', detail: 'Files in the recycle bin', sizeMB: [0, 2000] },
  { icon: '🪟', name: 'Windows - Temp Folder', detail: '%TEMP% directory contents', sizeMB: [100, 3000] },
  { icon: '🪟', name: 'Windows - Clipboard', detail: 'Clipboard contents', sizeMB: [0, 2] },
  { icon: '🪟', name: 'Windows - Memory Dumps', detail: 'Memory dump files (.dmp)', sizeMB: [0, 1500] },
  { icon: '🪟', name: 'Windows - Log Files', detail: 'System and application logs', sizeMB: [5, 200] },
  { icon: '🪟', name: 'Windows - Recent Docs', detail: 'Recent documents list', sizeMB: [0, 1] },
  { icon: '🪟', name: 'Windows Update Cache', detail: 'Downloaded update files', sizeMB: [50, 4000] },
  { icon: '🪟', name: 'Windows Prefetch', detail: 'Application prefetch data', sizeMB: [2, 80] },
  { icon: '📦', name: 'WinRAR - Recent Files', detail: 'Recently extracted archives', sizeMB: [0, 5] },
  { icon: '📦', name: '7-Zip - Temp Files', detail: 'Extraction temporary files', sizeMB: [0, 50] },
  { icon: '🎮', name: 'Steam - Download Cache', detail: 'Game download cache', sizeMB: [10, 2000] },
  { icon: '🎮', name: 'Discord - Cache', detail: 'Voice/image cache files', sizeMB: [20, 300] },
  { icon: '🎵', name: 'Spotify - Cache', detail: 'Cached music data', sizeMB: [50, 1200] },
  { icon: '📋', name: 'Windows - DNS Cache', detail: 'DNS resolver cache', sizeMB: [0, 1] },
  { icon: '🗂️', name: 'Office - MRU Lists', detail: 'Most recently used file lists', sizeMB: [0, 2] },
];

const SCAN_FILES = [
  'C:\\Windows\\Temp\\~DF1A3B.tmp',
  'C:\\Users\\User\\AppData\\Local\\Temp\\setup_cache.tmp',
  'C:\\Users\\User\\AppData\\Roaming\\Discord\\Cache\\f_000001',
  'C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache',
  'C:\\Windows\\SoftwareDistribution\\Download\\',
  'C:\\$Recycle.Bin\\S-1-5-21-...',
  'C:\\Users\\User\\AppData\\Local\\Spotify\\Storage\\',
  'C:\\Windows\\Prefetch\\CHROME.EXE-8A2B4C1D.pf',
  'C:\\Users\\User\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache',
  'C:\\Windows\\Logs\\CBS\\CBS.log',
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function fmtSize(mb: number) {
  if (mb >= 1024) return (mb / 1024).toFixed(1) + ' GB';
  if (mb >= 1) return mb.toFixed(0) + ' MB';
  return (mb * 1024).toFixed(0) + ' KB';
}

export default function CCleaner() {
  const [page, setPage] = useState<'cleaner' | 'registry' | 'tools' | 'options'>('cleaner');
  const [phase, setPhase] = useState<Phase>('idle');
  const [scanFile, setScanFile] = useState('');
  const [scanProgress, setProgress] = useState(0);
  const [items, setItems] = useState<JunkItem[]>([]);
  const [cleanProgress, setCleanProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  const clear = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const analyze = () => {
    setPhase('analyzing');
    setProgress(0);
    setScanFile('');
    let prog = 0;
    timerRef.current = window.setInterval(() => {
      prog += rand(1, 4);
      setScanFile(SCAN_FILES[Math.floor(Math.random() * SCAN_FILES.length)]);
      setProgress(Math.min(100, Math.round(prog)));
      if (prog >= 100) {
        clear();
        const found: JunkItem[] = JUNK_TEMPLATES
          .filter(() => Math.random() > 0.15)
          .map(t => ({
            icon: t.icon,
            name: t.name,
            detail: t.detail,
            size: parseFloat(rand(t.sizeMB[0], t.sizeMB[1]).toFixed(1)),
          }))
          .filter(i => i.size > 0);
        setItems(found);
        setPhase('results');
      }
    }, 80);
  };

  const clean = () => {
    setPhase('cleaning');
    setCleanProgress(0);
    let prog = 0;
    timerRef.current = window.setInterval(() => {
      prog += rand(1, 5);
      setCleanProgress(Math.min(100, Math.round(prog)));
      if (prog >= 100) {
        clear();
        setPhase('done');
      }
    }, 100);
  };

  const totalMB = items.reduce((s, i) => s + i.size, 0);

  return (
    <div className="cc-root">
      {/* Sidebar */}
      <div className="cc-sidebar">
        <div className="cc-logo">
          <div className="cc-logo-title">CCleaner</div>
          <div className="cc-logo-sub">v6.19 Professional</div>
        </div>
        <div className="cc-nav">
          <div className="cc-nav-section">Tools</div>
          {[
            ['cleaner', '🧹', 'Custom Clean'],
            ['registry', '📋', 'Registry'],
            ['tools', '🔧', 'Tools'],
            ['options', '⚙️', 'Options'],
          ].map(([id, icon, label]) => (
            <div
              key={id}
              className={`cc-nav-item ${page === id ? 'active' : ''}`}
              onClick={() => { setPage(id as any); setPhase('idle'); }}
            >
              <span className="cc-nav-icon">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="cc-content">
        <div className="cc-top-bar">
          <div className="cc-top-title">
            {page === 'cleaner' ? 'Custom Clean' : page === 'registry' ? 'Registry Cleaner' : page === 'tools' ? 'Tools' : 'Options'}
          </div>
          <div className="cc-top-sub">
            {page === 'cleaner' ? 'Remove junk files to free up disk space' : page === 'registry' ? 'Fix registry issues to improve stability' : page === 'tools' ? 'Manage programs and startup items' : 'Configure CCleaner preferences'}
          </div>
        </div>

        {page === 'cleaner' && (
          <div className="cc-cleaner-body">
            {/* Category selector */}
            <div className="cc-category-panel">
              {[
                { header: '🪟 Windows', items: ['Internet Explorer', 'Windows Explorer', 'System', 'Advanced'] },
                { header: '🌐 Applications', items: ['Chrome', 'Firefox', 'Edge', 'Steam', 'Discord', 'Spotify', 'Office'] },
              ].map(group => (
                <div key={group.header} className="cc-cat-group">
                  <div className="cc-cat-header">{group.header}</div>
                  {group.items.map(item => (
                    <div key={item} className="cc-cat-item">
                      <input type="checkbox" className="cc-cat-checkbox" defaultChecked />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Results / scanning area */}
            <div className="cc-results-panel">
              {(phase === 'idle') && (
                <div className="cc-results-area">
                  <div style={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 60, fontSize: 14 }}>
                    Click Analyze to scan for junk files
                  </div>
                </div>
              )}

              {phase === 'analyzing' && (
                <div className="cc-scanning">
                  <div className="cc-scan-ring" />
                  <div className="cc-scan-label">Analyzing…</div>
                  <div className="cc-scan-file">{scanFile}</div>
                  <div className="cc-progress-track">
                    <div className="cc-progress-fill" style={{ width: `${scanProgress}%` }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{scanProgress}%</div>
                </div>
              )}

              {phase === 'results' && (
                <div className="cc-results-area">
                  {items.map(item => (
                    <div key={item.name} className="cc-result-item">
                      <div className="cc-result-icon">{item.icon}</div>
                      <div className="cc-result-info">
                        <div className="cc-result-name">{item.name}</div>
                        <div className="cc-result-detail">{item.detail}</div>
                      </div>
                      <div className="cc-result-size">{fmtSize(item.size)}</div>
                    </div>
                  ))}
                </div>
              )}

              {phase === 'cleaning' && (
                <div className="cc-scanning">
                  <div className="cc-scan-ring" />
                  <div className="cc-scan-label">Cleaning…</div>
                  <div className="cc-scan-file">Removing {items.length} items…</div>
                  <div className="cc-progress-track">
                    <div className="cc-progress-fill" style={{ width: `${cleanProgress}%` }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{cleanProgress}%</div>
                </div>
              )}

              {phase === 'done' && (
                <div className="cc-done">
                  <div className="cc-done-icon">✨</div>
                  <div className="cc-done-title">{fmtSize(totalMB)} Removed</div>
                  <div className="cc-done-sub">{items.length} items cleaned successfully</div>
                  <button className="cc-done-again" onClick={() => setPhase('idle')}>Run Again</button>
                </div>
              )}

              <div className="cc-bottom-bar">
                <div className="cc-total">
                  {phase === 'results' ? <><strong>{fmtSize(totalMB)}</strong> to be cleaned ({items.length} items)</> : 'Select categories and click Analyze'}
                </div>
                <button className="cc-analyze-btn" onClick={analyze} disabled={phase === 'analyzing' || phase === 'cleaning'}>
                  Analyze
                </button>
                <button className="cc-clean-btn" onClick={clean} disabled={phase !== 'results'}>
                  Run Cleaner
                </button>
              </div>
            </div>
          </div>
        )}

        {page === 'registry' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }}>
            <div style={{ fontSize: 48 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Registry Cleaner</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 340 }}>
              Scans your registry for obsolete entries, invalid paths, and missing shared DLLs.
            </div>
            <button className="cc-clean-btn" style={{ marginTop: 8 }} onClick={() => alert('No issues found in registry.')}>
              Scan for Issues
            </button>
          </div>
        )}

        {page === 'tools' && (
          <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['🗑️', 'Uninstall', '87 programs installed'],
              ['🚀', 'Startup', '12 startup items'],
              ['🔍', 'Browser Plugins', '8 extensions found'],
              ['💾', 'Disk Analyzer', 'Analyze disk usage'],
              ['🔀', 'File Finder', 'Find duplicate files'],
              ['🛡️', 'System Restore', '3 restore points'],
            ].map(([icon, name, sub]) => (
              <div key={name} className="cc-result-item" style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: 20 }}>{icon}</div>
                <div className="cc-result-info">
                  <div className="cc-result-name">{name}</div>
                  <div className="cc-result-detail">{sub}</div>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>▶</div>
              </div>
            ))}
          </div>
        )}

        {page === 'options' && (
          <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Run CCleaner when the computer starts', true],
              ['Add "Run CCleaner" option to Recycle Bin', true],
              ['Automatically update CCleaner', true],
              ['Enable Active Monitoring', false],
              ['Send anonymous usage data to Piriform', false],
            ].map(([label, def]) => (
              <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <input type="checkbox" defaultChecked={def as boolean} style={{ accentColor: '#6ec6f5', width: 15, height: 15 }} />
                <span style={{ fontSize: 13 }}>{label as string}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
