import { useState, useEffect, useRef, useCallback } from 'react';
import { useDesktopStore } from '../../store/useDesktopStore';
import { useThemeStore } from '../../store/useThemeStore';
import { playSuccess, playUpdateDone, playNotification, playError } from '../../utils/sounds';
import './Settings.css';

// ─── Windows Update ──────────────────────────────────────────────────────────

type UpdatePhase =
  | 'idle'          // up to date, nothing happening
  | 'checking'      // "Checking for updates…"
  | 'found'         // updates listed, waiting for user to click install
  | 'downloading'   // progress bar: downloading
  | 'installing'    // progress bar: installing
  | 'restart';      // restart required

interface Update {
  id: string;
  name: string;
  kb: string;
  type: 'Security' | 'Driver' | 'Cumulative' | 'Definition';
  size: string;
}

const UPDATE_POOLS: Update[] = [
  { id: 'u1', name: '2026-03 Cumulative Update for Windows 10 Version 22H2', kb: 'KB5053606', type: 'Cumulative', size: '487 MB' },
  { id: 'u2', name: 'Security Update for Microsoft Edge (KB5053474)', kb: 'KB5053474', type: 'Security', size: '12 MB' },
  { id: 'u3', name: 'NVIDIA – Display – 551.86', kb: 'KB3176938', type: 'Driver', size: '628 MB' },
  { id: 'u4', name: 'Intel(R) Management Engine Interface – Firmware update', kb: 'KB5007651', type: 'Driver', size: '8 MB' },
  { id: 'u5', name: '2026-03 Definition Update for Windows Defender Antivirus', kb: 'KB2267602', type: 'Definition', size: '1.1 MB' },
  { id: 'u6', name: 'Malicious Software Removal Tool x64 – v5.121', kb: 'KB890830', type: 'Security', size: '74 MB' },
  { id: 'u7', name: 'Realtek Audio Driver – 6.0.9474.1', kb: 'KB3176936', type: 'Driver', size: '156 MB' },
  { id: 'u8', name: '2026-03 Security Update for .NET Framework 4.8.1', kb: 'KB5035845', type: 'Security', size: '21 MB' },
  { id: 'u9', name: 'Intel Wi-Fi 6E AX211 – Driver update', kb: 'KB5003791', type: 'Driver', size: '14 MB' },
  { id: 'u10', name: 'Windows Subsystem for Linux Update', kb: 'KB5015020', type: 'Cumulative', size: '48 MB' },
];

const HISTORY: { name: string; kb: string; date: string; type: string }[] = [
  { name: '2026-02 Cumulative Update for Windows 10 Version 22H2', kb: 'KB5052077', date: 'Feb 11, 2026', type: 'Cumulative' },
  { name: '2026-01 Cumulative Update for Windows 10 Version 22H2', kb: 'KB5049981', date: 'Jan 14, 2026', type: 'Cumulative' },
  { name: 'Security Update for Microsoft Edge (KB5051553)', kb: 'KB5051553', date: 'Jan 9, 2026', type: 'Security' },
  { name: '2025-12 Definition Update for Windows Defender', kb: 'KB2267602', date: 'Dec 10, 2025', type: 'Definition' },
  { name: 'Intel(R) Graphics Driver – 31.0.101.5186', kb: 'KB3176938', date: 'Nov 12, 2025', type: 'Driver' },
  { name: '2025-11 Cumulative Update for Windows 10 Version 22H2', kb: 'KB5046613', date: 'Nov 12, 2025', type: 'Cumulative' },
];

function typeColor(t: string) {
  if (t === 'Security') return '#e74856';
  if (t === 'Driver') return '#0078d4';
  if (t === 'Definition') return '#00cc6a';
  return '#f4a261';
}

function pickUpdates(): Update[] {
  const shuffled = [...UPDATE_POOLS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2 + Math.floor(Math.random() * 4)); // 2-5 updates
}

function WindowsUpdate() {
  const { requestRestart } = useDesktopStore();
  const [phase, setPhase] = useState<UpdatePhase>('idle');
  const [updates, setUpdates] = useState<Update[]>([]);
  const [progress, setProgress] = useState(0);          // 0-100
  const [currentIdx, setCurrentIdx] = useState(0);      // which update currently processing
  const [history, setHistory] = useState(HISTORY);

  const [pauseUpdates, setPauseUpdates] = useState(false);
  const [activeUpdate, setActiveUpdate] = useState(false); // toggle "Active hours"
  const timerRef = useRef<number | null>(null);
  const progressRef = useRef(0);

  const clearTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  // ── Check for updates ──────────────────────────────────────────────────────
  const checkForUpdates = useCallback(() => {
    playNotification();
    setPhase('checking');
    setProgress(0);
    progressRef.current = 0;

    // Simulate checking (4-8 seconds)
    const checkDuration = 4000 + Math.random() * 4000;
    timerRef.current = window.setTimeout(() => {
      const found = pickUpdates();
      setUpdates(found);
      setPhase('found');
      playNotification();
    }, checkDuration);
  }, []);

  // ── Download + Install ─────────────────────────────────────────────────────
  const startInstall = useCallback((updList: Update[]) => {
    setPhase('downloading');
    setProgress(0);
    setCurrentIdx(0);
    progressRef.current = 0;

    // Total download time: 15-40 seconds
    const dlDuration = (15 + Math.random() * 25) * 1000;
    const dlInterval = 200;
    const dlStep = (dlInterval / dlDuration) * 100;

    timerRef.current = window.setInterval(() => {
      progressRef.current = Math.min(100, progressRef.current + dlStep + Math.random() * dlStep * 0.5);
      // update currentIdx based on progress segments per update
      setCurrentIdx(Math.min(updList.length - 1, Math.floor((progressRef.current / 100) * updList.length)));
      setProgress(Math.round(progressRef.current));

      if (progressRef.current >= 100) {
        clearTimer();
        progressRef.current = 0;
        setProgress(0);
        setPhase('installing');
        startInstallPhase(updList);
      }
    }, dlInterval);
  }, []); // eslint-disable-line

  const startInstallPhase = (updList: Update[]) => {
    // Total install time: 15-30 seconds
    const instDuration = (15 + Math.random() * 15) * 1000;
    const instInterval = 300;
    const instStep = (instInterval / instDuration) * 100;
    let localProg = 0;

    timerRef.current = window.setInterval(() => {
      localProg = Math.min(100, localProg + instStep + Math.random() * instStep * 0.4);
      setCurrentIdx(Math.min(updList.length - 1, Math.floor((localProg / 100) * updList.length)));
      setProgress(Math.round(localProg));

      if (localProg >= 100) {
        clearTimer();
        setProgress(100);
        // Add installed updates to history
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        setHistory(h => [
          ...updList.map(u => ({ name: u.name, kb: u.kb, date: today, type: u.type })),
          ...h,
        ]);
        playUpdateDone();
        setPhase('restart');
      }
    }, instInterval);
  };

  useEffect(() => () => clearTimer(), []);

  // ── Render ─────────────────────────────────────────────────────────────────
  const renderStatus = () => {
    switch (phase) {
      case 'idle':
        return (
          <div className="wu-idle">
            <div className="wu-status-box wu-status-ok">
              <div className="wu-status-icon">✅</div>
              <div>
                <div className="wu-status-title">You're up to date</div>
                <div className="wu-status-sub">Last checked: Today, 9:41 AM</div>
              </div>
            </div>
            <button className="wu-check-btn" onClick={checkForUpdates}>Check for updates</button>
          </div>
        );

      case 'checking':
        return (
          <div className="wu-checking">
            <div className="wu-status-box wu-status-info">
              <div className="wu-spinner" />
              <div>
                <div className="wu-status-title">Checking for updates…</div>
                <div className="wu-status-sub">Connecting to Windows Update servers</div>
              </div>
            </div>
          </div>
        );

      case 'found':
        return (
          <div className="wu-found">
            <div className="wu-status-box wu-status-warn">
              <div className="wu-status-icon">⬇️</div>
              <div>
                <div className="wu-status-title">Updates available</div>
                <div className="wu-status-sub">{updates.length} update{updates.length !== 1 ? 's' : ''} ready to download</div>
              </div>
            </div>
            <div className="wu-update-list">
              {updates.map(u => (
                <div key={u.id} className="wu-update-item">
                  <span className="wu-update-badge" style={{ background: typeColor(u.type) + '22', color: typeColor(u.type), border: `1px solid ${typeColor(u.type)}44` }}>{u.type}</span>
                  <div className="wu-update-info">
                    <div className="wu-update-name">{u.name}</div>
                    <div className="wu-update-meta">{u.kb} · {u.size}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="wu-found-actions">
              <button className="wu-install-btn" onClick={() => startInstall(updates)}>Download and install</button>
              <button className="wu-link-btn" onClick={() => setPhase('idle')}>Remind me later</button>
            </div>
          </div>
        );

      case 'downloading':
      case 'installing': {
        const isInstalling = phase === 'installing';
        const cur = updates[currentIdx];
        return (
          <div className="wu-progress-phase">
            <div className="wu-status-box wu-status-info">
              <div className="wu-spinner" />
              <div>
                <div className="wu-status-title">
                  {isInstalling ? 'Installing updates…' : 'Downloading updates…'} {progress}%
                </div>
                <div className="wu-status-sub">
                  {cur ? `${isInstalling ? 'Installing' : 'Downloading'}: ${cur.name}` : 'Preparing…'}
                </div>
              </div>
            </div>
            <div className="wu-progress-bar-wrap">
              <div className="wu-progress-track">
                <div
                  className="wu-progress-fill"
                  style={{ width: `${progress}%`, background: isInstalling ? '#f4a261' : '#0078d4' }}
                />
              </div>
              <span className="wu-progress-pct">{progress}%</span>
            </div>
            <div className="wu-update-list">
              {updates.map((u, i) => (
                <div key={u.id} className={`wu-update-item ${i === currentIdx ? 'wu-active' : i < currentIdx ? 'wu-done' : 'wu-pending'}`}>
                  <span className="wu-update-state-icon">
                    {i < currentIdx ? '✅' : i === currentIdx ? (isInstalling ? '⚙️' : '⬇️') : '⏳'}
                  </span>
                  <div className="wu-update-info">
                    <div className="wu-update-name">{u.name}</div>
                    <div className="wu-update-meta">{u.kb} · {u.size}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="wu-pause-wrap">
              <button className="wu-link-btn" onClick={() => { clearTimer(); setPauseUpdates(true); setPhase('found'); }}>⏸ Pause updates</button>
            </div>
          </div>
        );
      }

      case 'restart':
        return (
          <div className="wu-restart">
            <div className="wu-status-box wu-status-restart">
              <div className="wu-status-icon">🔄</div>
              <div>
                <div className="wu-status-title">Restart required</div>
                <div className="wu-status-sub">Your device needs to restart to finish installing updates.</div>
              </div>
            </div>
            <div className="wu-restart-actions">
              <button className="wu-restart-btn" onClick={() => { playSuccess(); requestRestart(); }}>
                🔄 Restart now
              </button>
              <button className="wu-schedule-btn">Schedule the restart</button>
            </div>
            <div className="wu-restart-note">
              💡 Make sure to save your work before restarting.
            </div>
            <div className="wu-update-list">
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>INSTALLED UPDATES</div>
              {updates.map(u => (
                <div key={u.id} className="wu-update-item wu-done">
                  <span className="wu-update-state-icon">✅</span>
                  <div className="wu-update-info">
                    <div className="wu-update-name">{u.name}</div>
                    <div className="wu-update-meta">{u.kb} · {u.size}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="settings-page">
      <h2>Windows Update</h2>

      {/* Main update status */}
      <div className="settings-section">
        {renderStatus()}
      </div>

      {/* Options */}
      {phase === 'idle' || phase === 'found' || phase === 'restart' ? (
        <div className="settings-section">
          <div className="settings-section-title">Update options</div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Pause updates</div>
              <div className="settings-row-sub">Pause for up to 7 days</div>
            </div>
            <button className={`settings-toggle ${pauseUpdates ? 'on' : ''}`} onClick={() => setPauseUpdates(p => !p)}>
              {pauseUpdates ? 'On' : 'Off'}
            </button>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Active hours</div>
              <div className="settings-row-sub">Windows won't restart during 8:00 AM – 5:00 PM</div>
            </div>
            <button className={`settings-toggle ${activeUpdate ? 'on' : ''}`} onClick={() => setActiveUpdate(p => !p)}>
              {activeUpdate ? 'On' : 'Off'}
            </button>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Automatic (recommended)</div>
              <div className="settings-row-sub">Keep your device up to date automatically</div>
            </div>
            <button className="settings-toggle on">On</button>
          </div>
          <button className="settings-list-item">View optional updates ›</button>
          <button className="settings-list-item">Advanced options ›</button>
        </div>
      ) : null}

      {/* Update History */}
      <div className="settings-section">
        <div className="settings-section-title">Update history</div>
        <div className="wu-history-list">
          {history.slice(0, 8).map((h, i) => (
            <div key={i} className="wu-history-item">
              <span className="wu-update-badge" style={{ background: typeColor(h.type) + '22', color: typeColor(h.type), border: `1px solid ${typeColor(h.type)}44`, flexShrink: 0 }}>{h.type}</span>
              <div className="wu-update-info">
                <div className="wu-update-name" style={{ fontSize: 12 }}>{h.name}</div>
                <div className="wu-update-meta">{h.kb} · Installed {h.date}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="settings-list-item">View full history ›</button>
        <button className="settings-list-item" onClick={() => { playError(); }}>Uninstall updates ›</button>
      </div>

      {/* Windows Security */}
      <div className="settings-section">
        <div className="settings-section-title">Windows Security</div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Windows Defender Antivirus</div>
            <div className="settings-row-sub">Protection is active · Last scan: Today</div>
          </div>
          <span style={{ color: '#00cc6a', fontSize: 13 }}>✓ Protected</span>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Windows Firewall</div>
            <div className="settings-row-sub">Domain, private, and public networks protected</div>
          </div>
          <span style={{ color: '#00cc6a', fontSize: 13 }}>✓ On</span>
        </div>
        <button className="settings-list-item">Open Windows Security ›</button>
      </div>

      {/* Delivery optimization */}
      <div className="settings-section">
        <div className="settings-section-title">Delivery optimization</div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Allow downloads from other PCs</div>
            <div className="settings-row-sub">PCs on my local network</div>
          </div>
          <button className="settings-toggle on">On</button>
        </div>
        <div className="wu-delivery-stats">
          <div className="wu-delivery-stat">
            <div className="wu-delivery-val">2.3 GB</div>
            <div className="wu-delivery-lbl">Downloaded from Microsoft</div>
          </div>
          <div className="wu-delivery-stat">
            <div className="wu-delivery-val">842 MB</div>
            <div className="wu-delivery-lbl">Downloaded from local PCs</div>
          </div>
          <div className="wu-delivery-stat">
            <div className="wu-delivery-val">156 MB</div>
            <div className="wu-delivery-lbl">Sent to other PCs</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Settings component ─────────────────────────────────────────────────

type SettingsPage = 'home' | 'system' | 'personalization' | 'accounts' | 'network' | 'privacy' | 'update' | 'apps' | 'devices' | 'time';

const PAGES: { id: SettingsPage; icon: string; label: string }[] = [
  { id: 'system', icon: '🖥️', label: 'System' },
  { id: 'devices', icon: '🖨️', label: 'Devices' },
  { id: 'network', icon: '📶', label: 'Network & Internet' },
  { id: 'personalization', icon: '🎨', label: 'Personalization' },
  { id: 'apps', icon: '📦', label: 'Apps' },
  { id: 'accounts', icon: '👤', label: 'Accounts' },
  { id: 'time', icon: '🕐', label: 'Time & Language' },
  { id: 'privacy', icon: '🔒', label: 'Privacy' },
  { id: 'update', icon: '🔄', label: 'Update & Security' },
];

export default function Settings({ initialPage }: { initialPage?: string }) {
  const [page, setPage] = useState<SettingsPage>((initialPage as SettingsPage) ?? 'home');
  const { darkMode, toggleDarkMode } = useThemeStore();
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [volume, setVolume] = useState(75);
  const [brightness, setBrightness] = useState(80);
  const [search, setSearch] = useState('');
  const [privacySettings, setPrivacySettings] = useState<Record<string, string>>({
    'Location': 'Off', 'Camera': 'On', 'Microphone': 'On', 'Notifications': 'On',
    'Account info': 'On', 'Contacts': 'Off', 'Calendar': 'On', 'Background apps': 'On',
    'Diagnostics & feedback': 'Off', 'Activity history': 'Off',
  });

  const renderPage = () => {
    switch (page) {
      case 'home': return (
        <div className="settings-home">
          <div className="settings-home-grid">
            {PAGES.map(p => (
              <button key={p.id} className="settings-home-card" onClick={() => setPage(p.id)}>
                <span className="settings-home-icon">{p.icon}</span>
                <span className="settings-home-label">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      );

      case 'system': return (
        <div className="settings-page">
          <h2>System</h2>
          <div className="settings-section">
            <div className="settings-section-title">Display</div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Brightness</div>
                <div className="settings-row-sub">Adjust screen brightness</div>
              </div>
              <input type="range" min={10} max={100} value={brightness} onChange={e => setBrightness(+e.target.value)} className="settings-slider" />
            </div>
            <div className="settings-row">
              <div className="settings-row-label">Resolution</div>
              <select className="settings-select"><option>1920 × 1080 (Recommended)</option><option>2560 × 1440</option><option>1280 × 720</option></select>
            </div>
            <div className="settings-row">
              <div className="settings-row-label">Display orientation</div>
              <select className="settings-select"><option>Landscape</option><option>Portrait</option></select>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Multiple displays</div>
                <div className="settings-row-sub">Extend your desktop to another monitor</div>
              </div>
              <button className="settings-btn-action" onClick={() => window.open(location.href, '_blank')}>Connect to a display</button>
            </div>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Sound</div>
            <div className="settings-row">
              <div><div className="settings-row-label">Volume</div><div className="settings-row-sub">Master volume</div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🔊</span>
                <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(+e.target.value)} className="settings-slider" />
                <span style={{ fontSize: 12, width: 30 }}>{volume}%</span>
              </div>
            </div>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">About</div>
            <div className="settings-about-grid">
              {[['Device name','DESKTOP-WIN10'],['Processor','Intel Core i7-12700K'],['Installed RAM','16.0 GB'],['System type','64-bit OS, x64-based processor'],['OS','Windows 10 Pro'],['Version','22H2'],['Build','19045.3996'],['Windows Feature Experience Pack','1000.19041.1000.0']].map(([k,v]) => (
                <div key={k} className="settings-about-row"><span className="settings-about-key">{k}</span><span className="settings-about-val">{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      );

      case 'personalization': return (
        <div className="settings-page">
          <h2>Personalization</h2>
          <div className="settings-section">
            <div className="settings-section-title">Colors</div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Dark mode</div>
                <div className="settings-row-sub">Windows and apps use dark theme</div>
              </div>
              <button className={`settings-toggle ${darkMode ? 'on' : ''}`} onClick={toggleDarkMode}>{darkMode ? 'On' : 'Off'}</button>
            </div>
            <div className="settings-row">
              <div className="settings-row-label">Accent color</div>
              <div className="settings-colors">
                {['#0078d4','#e74856','#00cc6a','#ff8c00','#9b59b6','#00b7c3','#da3b01','#ea005e'].map(c => (
                  <div key={c} className="settings-color-swatch" style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Background</div>
            <div className="settings-row">
              <div className="settings-row-label">Background</div>
              <select className="settings-select"><option>Windows Spotlight</option><option>Picture</option><option>Solid color</option><option>Slideshow</option></select>
            </div>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Taskbar</div>
            <div className="settings-row"><div><div className="settings-row-label">Lock the taskbar</div></div><button className="settings-toggle on">On</button></div>
            <div className="settings-row"><div><div className="settings-row-label">Use small taskbar buttons</div></div><button className="settings-toggle">Off</button></div>
            <div className="settings-row"><div><div className="settings-row-label">Show badges on taskbar buttons</div></div><button className="settings-toggle on">On</button></div>
          </div>
        </div>
      );

      case 'accounts': return (
        <div className="settings-page">
          <h2>Accounts</h2>
          <div className="settings-section">
            <div className="settings-user-card">
              <div className="settings-user-avatar">👤</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>User</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Local Account · Administrator</div>
              </div>
            </div>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Your info</div>
            {['Change account name','Change your password','Sign in with Microsoft instead','Manage your Microsoft account'].map(item => (
              <button key={item} className="settings-list-item">{item} ›</button>
            ))}
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Email & accounts</div>
            <button className="settings-list-item">Add a work or school account ›</button>
            <button className="settings-list-item">Add a Microsoft account ›</button>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Sign-in options</div>
            {['Windows Hello PIN','Windows Hello Face','Windows Hello Fingerprint','Password','Security Key'].map(opt => (
              <div key={opt} className="settings-row">
                <div className="settings-row-label">{opt}</div>
                <button className="settings-btn-sm">Set up</button>
              </div>
            ))}
          </div>
        </div>
      );

      case 'network': return (
        <div className="settings-page">
          <h2>Network & Internet</h2>
          <div className="settings-section">
            <div className="settings-section-title">Wi-Fi</div>
            <div className="settings-row">
              <div><div className="settings-row-label">Wi-Fi</div><div className="settings-row-sub">Connected to HomeNetwork_5G</div></div>
              <button className={`settings-toggle ${wifi ? 'on' : ''}`} onClick={() => setWifi(p => !p)}>{wifi ? 'On' : 'Off'}</button>
            </div>
            <button className="settings-list-item">Manage known networks ›</button>
            <button className="settings-list-item">Hardware properties ›</button>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Bluetooth & other devices</div>
            <div className="settings-row">
              <div><div className="settings-row-label">Bluetooth</div><div className="settings-row-sub">{bluetooth ? 'On' : 'Off'}</div></div>
              <button className={`settings-toggle ${bluetooth ? 'on' : ''}`} onClick={() => setBluetooth(p => !p)}>{bluetooth ? 'On' : 'Off'}</button>
            </div>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Network status</div>
            {[['IP address','192.168.1.105'],['Subnet mask','255.255.255.0'],['Default gateway','192.168.1.1'],['DNS servers','8.8.8.8, 8.8.4.4'],['Link speed','300/300 Mbps'],['SSID','HomeNetwork_5G'],['Protocol','Wi-Fi 6 (802.11ax)']].map(([k,v]) => (
              <div key={k} className="settings-about-row"><span className="settings-about-key">{k}</span><span className="settings-about-val">{v}</span></div>
            ))}
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Advanced</div>
            {['VPN','Airplane mode','Mobile hotspot','Proxy','Dial-up'].map(item => (
              <button key={item} className="settings-list-item">{item} ›</button>
            ))}
          </div>
        </div>
      );

      case 'privacy': return (
        <div className="settings-page">
          <h2>Privacy</h2>
          <div className="settings-section">
            <div className="settings-section-title">Windows permissions</div>
            {Object.entries(privacySettings).map(([label, val]) => (
              <div key={label} className="settings-row">
                <div className="settings-row-label">{label}</div>
                <button className={`settings-toggle ${val === 'On' ? 'on' : ''}`}
                  onClick={() => setPrivacySettings(p => ({ ...p, [label]: p[label] === 'On' ? 'Off' : 'On' }))}>
                  {val}
                </button>
              </div>
            ))}
          </div>
        </div>
      );

      case 'update': return <WindowsUpdate />;

      case 'apps': return (
        <div className="settings-page">
          <h2>Apps & Features</h2>
          <div className="settings-section">
            <input className="settings-search" placeholder="Search apps..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="settings-apps-list">
              {[
                { name: 'Google Chrome', size: '289 MB', date: '1/10/2024' },
                { name: 'Discord', size: '342 MB', date: '1/5/2024' },
                { name: 'Spotify', size: '195 MB', date: '12/20/2023' },
                { name: 'Steam', size: '1.2 GB', date: '11/15/2023' },
                { name: 'Microsoft Office 2024', size: '3.8 GB', date: '1/1/2024' },
                { name: 'Adobe Photoshop 2024', size: '4.2 GB', date: '12/1/2023' },
                { name: 'Adobe Illustrator 2024', size: '3.9 GB', date: '12/1/2023' },
                { name: 'VLC media player', size: '112 MB', date: '10/15/2023' },
                { name: 'VS Code', size: '380 MB', date: '1/8/2024' },
                { name: 'AutoCAD 2024', size: '6.1 GB', date: '11/20/2023' },
                { name: 'SolidWorks 2024', size: '8.4 GB', date: '11/30/2023' },
                { name: 'OBS Studio', size: '320 MB', date: '2/1/2024' },
                { name: 'Figma', size: '210 MB', date: '1/15/2024' },
              ].filter(a => a.name.toLowerCase().includes(search.toLowerCase())).map(app => (
                <div key={app.name} className="settings-app-item">
                  <div className="settings-app-name">{app.name}</div>
                  <div className="settings-app-meta">{app.size} · Installed {app.date}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="settings-btn-sm">Modify</button>
                    <button className="settings-btn-sm danger">Uninstall</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      case 'devices': return (
        <div className="settings-page">
          <h2>Devices</h2>
          <div className="settings-section">
            <div className="settings-section-title">Connected devices</div>
            {[
              { icon: '🖱️', name: 'Logitech MX Master 3', type: 'Bluetooth Mouse', status: 'Connected' },
              { icon: '⌨️', name: 'Logitech MX Keys', type: 'Bluetooth Keyboard', status: 'Connected' },
              { icon: '🖨️', name: 'HP LaserJet Pro M404', type: 'Network Printer', status: 'Ready' },
              { icon: '🎧', name: 'Sony WH-1000XM5', type: 'Bluetooth Headphones', status: 'Connected' },
              { icon: '📺', name: 'Dell S2722DGM 27"', type: 'Display', status: 'Active' },
              { icon: '🎮', name: 'Xbox Wireless Controller', type: 'Bluetooth Controller', status: 'Paired' },
            ].map(d => (
              <div key={d.name} className="settings-device-item">
                <span style={{ fontSize: 24 }}>{d.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className="settings-row-label">{d.name}</div>
                  <div className="settings-row-sub">{d.type}</div>
                </div>
                <span style={{ fontSize: 12, color: d.status === 'Connected' || d.status === 'Active' || d.status === 'Ready' ? '#00cc6a' : 'rgba(255,255,255,0.4)' }}>{d.status}</span>
              </div>
            ))}
            <button className="settings-btn" style={{ marginTop: 12 }}>+ Add a device</button>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Printers & scanners</div>
            <button className="settings-list-item">HP LaserJet Pro M404 ›</button>
            <button className="settings-list-item">Microsoft Print to PDF ›</button>
            <button className="settings-list-item">+ Add a printer or scanner ›</button>
          </div>
        </div>
      );

      case 'time': return (
        <div className="settings-page">
          <h2>Time & Language</h2>
          <div className="settings-section">
            <div className="settings-section-title">Date & time</div>
            <div className="settings-row"><div><div className="settings-row-label">Set time automatically</div></div><button className="settings-toggle on">On</button></div>
            <div className="settings-row"><div><div className="settings-row-label">Set time zone automatically</div></div><button className="settings-toggle on">On</button></div>
            <div className="settings-row">
              <div className="settings-row-label">Time zone</div>
              <select className="settings-select"><option>(UTC-05:00) Eastern Time (US & Canada)</option><option>(UTC-08:00) Pacific Time</option><option>(UTC+00:00) UTC</option><option>(UTC+01:00) Paris</option><option>(UTC+08:00) Beijing</option></select>
            </div>
            <div className="settings-row"><div><div className="settings-row-label">Adjust for daylight saving time automatically</div></div><button className="settings-toggle on">On</button></div>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Region</div>
            <div className="settings-row">
              <div className="settings-row-label">Country or region</div>
              <select className="settings-select"><option>United States</option><option>Canada</option><option>United Kingdom</option><option>Germany</option><option>Japan</option></select>
            </div>
            <div className="settings-row">
              <div className="settings-row-label">Regional format</div>
              <select className="settings-select"><option>English (United States)</option><option>English (UK)</option><option>Deutsch (Deutschland)</option></select>
            </div>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Language</div>
            <div className="settings-row">
              <div className="settings-row-label">Windows display language</div>
              <select className="settings-select"><option>English (United States)</option><option>Español (España)</option><option>Français (France)</option><option>Deutsch (Deutschland)</option></select>
            </div>
            <button className="settings-list-item">Add a language ›</button>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Speech</div>
            <div className="settings-row">
              <div className="settings-row-label">Speech language</div>
              <select className="settings-select"><option>English (United States)</option></select>
            </div>
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="settings-root">
      <div className="settings-sidebar">
        <div className="settings-sidebar-title">Settings</div>
        <button className={`settings-nav-item ${page === 'home' ? 'active' : ''}`} onClick={() => setPage('home')}>🏠 Home</button>
        {PAGES.map(p => (
          <button key={p.id} className={`settings-nav-item ${page === p.id ? 'active' : ''}`} onClick={() => setPage(p.id)}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>
      <div className="settings-content">
        {renderPage()}
      </div>
    </div>
  );
}
