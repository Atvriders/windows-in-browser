import { useState } from 'react';
import './Settings.css';

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

export default function Settings() {
  const [page, setPage] = useState<SettingsPage>('home');
  const [darkMode, setDarkMode] = useState(true);
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [volume, setVolume] = useState(75);
  const [brightness, setBrightness] = useState(80);
  const [search, setSearch] = useState('');

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
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Sound</div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Volume</div>
                <div className="settings-row-sub">Master volume</div>
              </div>
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
              {[['Device name','DESKTOP-WIN10'],['Processor','Intel Core i7-12700K'],['RAM','16.0 GB'],['OS','Windows 10 Pro'],['Version','22H2'],['Build','19045.3996']].map(([k,v]) => (
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
              <button className={`settings-toggle ${darkMode ? 'on' : ''}`} onClick={() => setDarkMode(p => !p)}>{darkMode ? 'On' : 'Off'}</button>
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
              <select className="settings-select"><option>Solid color</option><option>Picture</option><option>Slideshow</option></select>
            </div>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Taskbar</div>
            <div className="settings-row">
              <div><div className="settings-row-label">Lock the taskbar</div></div>
              <button className="settings-toggle on">On</button>
            </div>
            <div className="settings-row">
              <div><div className="settings-row-label">Use small taskbar buttons</div></div>
              <button className="settings-toggle">Off</button>
            </div>
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
            {['Change account name', 'Change your password', 'Sign in with Microsoft instead', 'Manage your Microsoft account'].map(item => (
              <button key={item} className="settings-list-item">{item} ›</button>
            ))}
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Email & accounts</div>
            <button className="settings-list-item">Add a work or school account ›</button>
            <button className="settings-list-item">Add a Microsoft account ›</button>
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
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Bluetooth</div>
            <div className="settings-row">
              <div><div className="settings-row-label">Bluetooth</div><div className="settings-row-sub">{bluetooth ? 'On' : 'Off'}</div></div>
              <button className={`settings-toggle ${bluetooth ? 'on' : ''}`} onClick={() => setBluetooth(p => !p)}>{bluetooth ? 'On' : 'Off'}</button>
            </div>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Status</div>
            {[['IP address','192.168.1.105'],['DNS servers','8.8.8.8, 8.8.4.4'],['Link speed','300 Mbps']].map(([k,v]) => (
              <div key={k} className="settings-about-row"><span className="settings-about-key">{k}</span><span className="settings-about-val">{v}</span></div>
            ))}
          </div>
        </div>
      );
      case 'privacy': return (
        <div className="settings-page">
          <h2>Privacy</h2>
          <div className="settings-section">
            <div className="settings-section-title">Windows permissions</div>
            {[['Location','Off'],['Camera','On'],['Microphone','On'],['Notifications','On'],['Background apps','On'],['Diagnostics & feedback','Off']].map(([label, val]) => (
              <div key={label} className="settings-row">
                <div className="settings-row-label">{label}</div>
                <button className={`settings-toggle ${val === 'On' ? 'on' : ''}`}>{val}</button>
              </div>
            ))}
          </div>
        </div>
      );
      case 'update': return (
        <div className="settings-page">
          <h2>Windows Update</h2>
          <div className="settings-section">
            <div className="settings-update-status">
              <div className="settings-update-check">✅</div>
              <div>
                <div style={{ fontWeight: 600 }}>You're up to date</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Last checked: Today, 9:41 AM</div>
              </div>
            </div>
            <button className="settings-btn" style={{ marginTop: 16 }}>Check for updates</button>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Update history</div>
            {[['2024-11 Cumulative Update for Windows 10 (KB5046613)','Installed Jan 15'],['2024-10 Cumulative Update (KB5044273)','Installed Dec 12'],['Definition Update for Windows Defender (KB2267602)','Installed Jan 14']].map(([name, date]) => (
              <div key={name} className="settings-about-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                <span style={{ fontSize: 13 }}>{name}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{date}</span>
              </div>
            ))}
          </div>
        </div>
      );
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
                { name: 'VLC media player', size: '112 MB', date: '10/15/2023' },
                { name: 'VS Code', size: '380 MB', date: '1/8/2024' },
                { name: 'AutoCAD 2024', size: '6.1 GB', date: '11/20/2023' },
                { name: 'SolidWorks 2024', size: '8.4 GB', date: '11/30/2023' },
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
              { icon: '🖱️', name: 'Logitech MX Master 3', type: 'Bluetooth Mouse' },
              { icon: '⌨️', name: 'Logitech MX Keys', type: 'Bluetooth Keyboard' },
              { icon: '🖨️', name: 'HP LaserJet Pro', type: 'Network Printer' },
              { icon: '🎧', name: 'Sony WH-1000XM5', type: 'Bluetooth Headphones' },
              { icon: '📺', name: 'Dell 27" Monitor', type: 'Display' },
            ].map(d => (
              <div key={d.name} className="settings-device-item">
                <span style={{ fontSize: 24 }}>{d.icon}</span>
                <div><div className="settings-row-label">{d.name}</div><div className="settings-row-sub">{d.type}</div></div>
              </div>
            ))}
          </div>
        </div>
      );
      case 'time': return (
        <div className="settings-page">
          <h2>Time & Language</h2>
          <div className="settings-section">
            <div className="settings-section-title">Date & time</div>
            <div className="settings-row">
              <div><div className="settings-row-label">Set time automatically</div></div>
              <button className="settings-toggle on">On</button>
            </div>
            <div className="settings-row">
              <div><div className="settings-row-label">Time zone</div></div>
              <select className="settings-select"><option>(UTC-05:00) Eastern Time</option><option>(UTC-08:00) Pacific Time</option><option>(UTC+00:00) UTC</option></select>
            </div>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Region</div>
            <div className="settings-row">
              <div className="settings-row-label">Country or region</div>
              <select className="settings-select"><option>United States</option><option>Canada</option><option>United Kingdom</option></select>
            </div>
          </div>
          <div className="settings-section">
            <div className="settings-section-title">Language</div>
            <div className="settings-row">
              <div className="settings-row-label">Windows display language</div>
              <select className="settings-select"><option>English (United States)</option><option>Español</option><option>Français</option></select>
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
