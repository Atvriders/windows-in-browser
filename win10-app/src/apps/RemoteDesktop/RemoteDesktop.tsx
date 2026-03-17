import { useState, useEffect, useRef } from 'react';
import './RemoteDesktop.css';

interface SavedServer {
  name: string;
  ip: string;
  user: string;
  resolution: string;
}

const SAVED_SERVERS: SavedServer[] = [
  { name: 'WIN-SERVER-2022', ip: '192.168.1.200', user: 'Administrator', resolution: '1920x1080' },
  { name: 'UBUNTU-WEB-01',   ip: '10.0.0.5',      user: 'Administrator', resolution: '1280x720' },
  { name: 'DB-CLUSTER-01',   ip: '10.0.0.10',     user: 'Administrator', resolution: '1280x720' },
  { name: 'DEV-BOX',         ip: '10.0.0.15',     user: 'Administrator', resolution: '1920x1080' },
  { name: 'BACKUP-NAS',      ip: '192.168.1.150', user: 'Administrator', resolution: '1024x768' },
];

const RESOLUTIONS = ['1024x768', '1280x720', '1366x768', '1920x1080', '2560x1440', 'Full Screen'];

const SERVER_SERVICES: Record<string, string[]> = {
  '192.168.1.200': ['Windows Server 2022 Standard', 'Active Directory Domain Services', 'DNS Server', 'DHCP Server', 'Remote Desktop Services', 'Windows Firewall', 'Windows Update', 'Task Scheduler'],
  '10.0.0.5':      ['Ubuntu 22.04 LTS', 'nginx 1.24.0 (active)', 'MySQL 8.0.36 (active)', 'PHP-FPM 8.2 (active)', 'OpenSSH Server 9.3', 'UFW Firewall', 'fail2ban', 'certbot (Let\'s Encrypt)'],
  '10.0.0.10':     ['Ubuntu 22.04 LTS', 'MySQL Cluster 8.0', 'Redis 7.2 (active)', 'HAProxy 2.8', 'Keepalived (active)', 'OpenSSH Server', 'UFW Firewall', 'Prometheus Node Exporter'],
  '10.0.0.15':     ['Windows 11 Pro Dev', 'Visual Studio 2022', 'Docker Desktop 4.28', 'Git 2.44', 'Node.js 20.11', 'Python 3.12', 'WSL2 (Ubuntu 22.04)', 'Remote Desktop Services'],
  '192.168.1.150': ['FreeNAS 13.0', 'Samba 4.19 (active)', 'NFS Server (active)', 'Plex Media Server', 'SSH (active)', 'S.M.A.R.T. Monitor', 'ZFS Pool: tank (healthy)', 'Rsync Daemon'],
};

const SERVER_WALLPAPERS: Record<string, string> = {
  '192.168.1.200': 'linear-gradient(135deg, #0a2a5c 0%, #0d47a1 50%, #1565c0 100%)',
  '10.0.0.5':      'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #3a3a3a 100%)',
  '10.0.0.10':     'linear-gradient(135deg, #0d1f0d 0%, #1a3a1a 50%, #0a2a0a 100%)',
  '10.0.0.15':     'linear-gradient(135deg, #001a3a 0%, #00264d 50%, #003366 100%)',
  '192.168.1.150': 'linear-gradient(135deg, #1a0a2a 0%, #2d1a3a 50%, #3a2a4a 100%)',
};

type Phase = 'dialog' | 'connecting' | 'connected';

export default function RemoteDesktop() {
  const [phase, setPhase] = useState<Phase>('dialog');
  const [computer, setComputer] = useState('');
  const [username, setUsername] = useState('Administrator');
  const [password, setPassword] = useState('');
  const [resolution, setResolution] = useState('1920x1080');
  const [connectProgress, setConnectProgress] = useState(0);
  const [connectStep, setConnectStep] = useState('');
  const [connectedTo, setConnectedTo] = useState<SavedServer | null>(null);
  const [selectedSaved, setSelectedSaved] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [serverTime, setServerTime] = useState(new Date());
  const progressRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== 'connected') return;
    const id = setInterval(() => setServerTime(new Date()), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const handleSelectSaved = (server: SavedServer) => {
    setSelectedSaved(server.name);
    setComputer(server.ip);
    setUsername(server.user);
    setResolution(server.resolution);
  };

  const handleConnect = () => {
    if (!computer.trim()) return;
    const found = SAVED_SERVERS.find(s => s.ip === computer.trim() || s.name === computer.trim());
    const target = found ?? { name: computer.trim(), ip: computer.trim(), user: username, resolution };
    setConnectedTo(target);
    setPhase('connecting');
    setConnectProgress(0);

    const steps = [
      'Initiating connection…',
      'Negotiating security…',
      'Authenticating credentials…',
      'Loading user profile…',
      'Starting remote session…',
    ];
    let step = 0;
    setConnectStep(steps[0]);
    progressRef.current = window.setInterval(() => {
      step++;
      setConnectProgress(Math.min((step / steps.length) * 100, 100));
      if (step < steps.length) {
        setConnectStep(steps[step]);
      } else {
        clearInterval(progressRef.current!);
        setTimeout(() => setPhase('connected'), 400);
      }
    }, 700);
  };

  const handleDisconnect = () => {
    if (progressRef.current) clearInterval(progressRef.current);
    setPhase('dialog');
    setConnectedTo(null);
    setConnectProgress(0);
    setPassword('');
  };

  const services = connectedTo ? (SERVER_SERVICES[connectedTo.ip] ?? SERVER_SERVICES['192.168.1.200']) : [];
  const wallpaper = connectedTo ? (SERVER_WALLPAPERS[connectedTo.ip] ?? SERVER_WALLPAPERS['192.168.1.200']) : '';

  if (phase === 'connecting') {
    return (
      <div className="rdp-connecting">
        <div className="rdp-connecting-icon">🖥️</div>
        <div className="rdp-connecting-title">Remote Desktop Connection</div>
        <div className="rdp-connecting-target">{connectedTo?.name ?? computer}</div>
        <div className="rdp-connecting-step">{connectStep}</div>
        <div className="rdp-connecting-bar-bg">
          <div className="rdp-connecting-bar-fill" style={{ width: `${connectProgress}%` }} />
        </div>
        <div className="rdp-connecting-pct">{Math.round(connectProgress)}%</div>
        <button className="rdp-cancel-btn" onClick={handleDisconnect}>Cancel</button>
      </div>
    );
  }

  if (phase === 'connected' && connectedTo) {
    return (
      <div className="rdp-session" style={{ background: wallpaper }}>
        {/* Server desktop content */}
        <div className="rdp-desktop-area">
          <div className="rdp-server-overlay">
            <div className="rdp-server-name">{connectedTo.name}</div>
            <div className="rdp-server-ip">{connectedTo.ip}</div>
            <div className="rdp-server-user">👤 {username}</div>
            <div className="rdp-server-res">🖥 {connectedTo.resolution}</div>
          </div>

          <div className="rdp-services-panel">
            <div className="rdp-services-title">Running Services</div>
            {services.map((svc, i) => (
              <div key={i} className="rdp-service-item">
                <span className="rdp-service-dot" />
                <span>{svc}</span>
              </div>
            ))}
          </div>

          <div className="rdp-server-icons">
            {['My Computer', 'Recycle Bin', 'Network', 'Server Manager', 'CMD'].map(icon => (
              <div key={icon} className="rdp-server-icon">
                <span className="rdp-server-icon-img">
                  {icon === 'My Computer' ? '🖥️' : icon === 'Recycle Bin' ? '🗑️' : icon === 'Network' ? '🌐' : icon === 'Server Manager' ? '⚙️' : '💻'}
                </span>
                <span className="rdp-server-icon-label">{icon}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Server taskbar */}
        <div className="rdp-server-taskbar">
          <div className="rdp-server-taskbar-start">⊞</div>
          <div className="rdp-server-taskbar-items">
            <span className="rdp-taskbar-item">📁 Server Manager</span>
            <span className="rdp-taskbar-item">💻 CMD</span>
            <span className="rdp-taskbar-item">🌐 IE</span>
          </div>
          <div className="rdp-server-taskbar-clock">
            <div>{serverTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="rdp-clock-date">{serverTime.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' })}</div>
          </div>
        </div>

        {/* Session info bar */}
        <div className="rdp-session-bar">
          <span>🔒 Encrypted connection to {connectedTo.name} ({connectedTo.ip})</span>
          <button className="rdp-disconnect-btn" onClick={handleDisconnect}>Disconnect</button>
        </div>
      </div>
    );
  }

  // Dialog phase
  return (
    <div className="rdp-root">
      <div className="rdp-header">
        <span className="rdp-header-icon">🖥️</span>
        <div>
          <div className="rdp-header-title">Remote Desktop Connection</div>
          <div className="rdp-header-sub">Connect to a remote computer</div>
        </div>
      </div>

      <div className="rdp-body">
        {/* Saved sessions list */}
        <div className="rdp-saved-panel">
          <div className="rdp-saved-title">Saved Connections</div>
          {SAVED_SERVERS.map(s => (
            <div
              key={s.name}
              className={`rdp-saved-item ${selectedSaved === s.name ? 'selected' : ''}`}
              onClick={() => handleSelectSaved(s)}
              onDoubleClick={() => { handleSelectSaved(s); setTimeout(handleConnect, 50); }}
            >
              <span className="rdp-saved-icon">🖥️</span>
              <div className="rdp-saved-info">
                <div className="rdp-saved-name">{s.name}</div>
                <div className="rdp-saved-ip">{s.ip}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Connection form */}
        <div className="rdp-form-panel">
          <div className="rdp-form-section">General</div>

          <div className="rdp-form-row">
            <label className="rdp-label">Computer:</label>
            <input
              className="rdp-input"
              value={computer}
              onChange={e => setComputer(e.target.value)}
              placeholder="IP address or hostname"
              onKeyDown={e => e.key === 'Enter' && handleConnect()}
            />
          </div>

          <div className="rdp-form-row">
            <label className="rdp-label">Username:</label>
            <input
              className="rdp-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div className="rdp-form-row">
            <label className="rdp-label">Password:</label>
            <div className="rdp-pw-wrap">
              <input
                className="rdp-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleConnect()}
              />
              <button className="rdp-pw-toggle" onClick={() => setShowPassword(p => !p)}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="rdp-form-section" style={{ marginTop: 16 }}>Display</div>

          <div className="rdp-form-row">
            <label className="rdp-label">Resolution:</label>
            <select
              className="rdp-select"
              value={resolution}
              onChange={e => setResolution(e.target.value)}
            >
              {RESOLUTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="rdp-form-row">
            <label className="rdp-label">Color depth:</label>
            <select className="rdp-select" defaultValue="32">
              <option value="15">High Color (15 bit)</option>
              <option value="16">High Color (16 bit)</option>
              <option value="24">True Color (24 bit)</option>
              <option value="32">Highest Quality (32 bit)</option>
            </select>
          </div>

          <div className="rdp-checkrow">
            <input type="checkbox" id="rdp-fullscreen" defaultChecked />
            <label htmlFor="rdp-fullscreen">Display the connection bar when in full screen mode</label>
          </div>

          <div className="rdp-form-section" style={{ marginTop: 16 }}>Local Resources</div>

          <div className="rdp-checkrow">
            <input type="checkbox" id="rdp-clipboard" defaultChecked />
            <label htmlFor="rdp-clipboard">Clipboard</label>
          </div>
          <div className="rdp-checkrow">
            <input type="checkbox" id="rdp-printers" defaultChecked />
            <label htmlFor="rdp-printers">Printers</label>
          </div>
          <div className="rdp-checkrow">
            <input type="checkbox" id="rdp-drives" />
            <label htmlFor="rdp-drives">Local disk drives</label>
          </div>

          <div className="rdp-btn-row">
            <button className="rdp-save-btn" onClick={() => {}}>Save</button>
            <button
              className="rdp-connect-btn"
              onClick={handleConnect}
              disabled={!computer.trim()}
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
