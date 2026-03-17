import { useState, useRef } from 'react';
import './WinSCP.css';

interface SavedSession {
  name: string;
  host: string;
  user: string;
  protocol: 'SFTP' | 'FTP' | 'SCP' | 'WebDAV';
}

interface FsEntry {
  name: string;
  type: 'dir' | 'file';
  size: string;
  modified: string;
  perms?: string;
}

const SAVED_SESSIONS: SavedSession[] = [
  { name: 'web-server-01',   host: '10.0.0.5',      user: 'root',   protocol: 'SFTP' },
  { name: 'db-server-01',    host: '10.0.0.10',     user: 'admin',  protocol: 'SFTP' },
  { name: 'dev-server',      host: '10.0.0.15',     user: 'dev',    protocol: 'SFTP' },
  { name: 'backup-server',   host: '192.168.1.150', user: 'backup', protocol: 'SFTP' },
  { name: 'router-gateway',  host: '192.168.1.1',   user: 'admin',  protocol: 'SCP' },
  { name: 'kali-vm',         host: '10.0.0.20',     user: 'kali',   protocol: 'SFTP' },
];

const LOCAL_FS: Record<string, FsEntry[]> = {
  'C:\\': [
    { name: 'Users', type: 'dir', size: '', modified: '2026-01-15 09:00' },
    { name: 'Windows', type: 'dir', size: '', modified: '2026-03-10 08:30' },
    { name: 'Program Files', type: 'dir', size: '', modified: '2026-03-01 14:22' },
  ],
  'C:\\Users\\User': [
    { name: 'Desktop', type: 'dir', size: '', modified: '2026-03-17 09:05' },
    { name: 'Documents', type: 'dir', size: '', modified: '2026-03-16 18:30' },
    { name: 'Downloads', type: 'dir', size: '', modified: '2026-03-17 08:50' },
    { name: 'Pictures', type: 'dir', size: '', modified: '2026-03-10 14:20' },
    { name: 'Videos', type: 'dir', size: '', modified: '2026-02-28 20:00' },
  ],
  'C:\\Users\\User\\Downloads': [
    { name: 'project-backup.tar.gz', type: 'file', size: '124.5 MB', modified: '2026-03-15 16:44' },
    { name: 'ubuntu-22.04-live.iso', type: 'file', size: '1.2 GB',   modified: '2026-01-20 12:00' },
    { name: 'setup.exe',             type: 'file', size: '34.2 MB',  modified: '2026-03-10 10:30' },
    { name: 'report-2026-Q1.pdf',    type: 'file', size: '2.1 MB',   modified: '2026-03-14 09:15' },
  ],
  'C:\\Users\\User\\Documents': [
    { name: 'projects',  type: 'dir',  size: '',        modified: '2026-03-16 14:00' },
    { name: 'notes.txt', type: 'file', size: '4.2 KB',  modified: '2026-03-17 08:00' },
    { name: 'config.json', type: 'file', size: '1.8 KB', modified: '2026-03-12 11:30' },
  ],
};

const REMOTE_FS: Record<string, FsEntry[]> = {
  '/': [
    { name: 'bin',  type: 'dir',  size: '', modified: '2026-01-15 00:00', perms: 'drwxr-xr-x' },
    { name: 'etc',  type: 'dir',  size: '', modified: '2026-03-17 09:00', perms: 'drwxr-xr-x' },
    { name: 'home', type: 'dir',  size: '', modified: '2026-01-15 00:00', perms: 'drwxr-xr-x' },
    { name: 'root', type: 'dir',  size: '', modified: '2026-03-17 08:42', perms: 'drwx------' },
    { name: 'var',  type: 'dir',  size: '', modified: '2026-03-17 09:00', perms: 'drwxr-xr-x' },
    { name: 'opt',  type: 'dir',  size: '', modified: '2026-02-10 12:00', perms: 'drwxr-xr-x' },
    { name: 'tmp',  type: 'dir',  size: '', modified: '2026-03-17 09:15', perms: 'drwxrwxrwt' },
  ],
  '/root': [
    { name: '.bashrc',       type: 'file', size: '3.5 KB',   modified: '2026-01-15 00:00', perms: '-rw-r--r--' },
    { name: '.bash_history', type: 'file', size: '14.2 KB',  modified: '2026-03-17 09:15', perms: '-rw-------' },
    { name: '.ssh',          type: 'dir',  size: '',          modified: '2026-02-20 10:00', perms: 'drwx------' },
    { name: 'apps',          type: 'dir',  size: '',          modified: '2026-03-10 14:22', perms: 'drwxr-xr-x' },
    { name: 'backup',        type: 'dir',  size: '',          modified: '2026-03-15 02:00', perms: 'drwxr-x---' },
    { name: 'deploy.sh',     type: 'file', size: '2.1 KB',   modified: '2026-03-01 09:00', perms: '-rwxr-xr-x' },
    { name: 'nginx.conf',    type: 'file', size: '4.8 KB',   modified: '2026-02-14 16:30', perms: '-rw-r--r--' },
    { name: 'README.md',     type: 'file', size: '1.2 KB',   modified: '2026-01-20 12:00', perms: '-rw-r--r--' },
  ],
  '/var/www': [
    { name: 'html',      type: 'dir',  size: '', modified: '2026-03-10 08:00', perms: 'drwxr-xr-x' },
    { name: 'wordpress', type: 'dir',  size: '', modified: '2026-02-28 10:00', perms: 'drwxr-xr-x' },
  ],
};

type TransferState = { file: string; progress: number; direction: 'up' | 'down' } | null;

export default function WinSCP() {
  const [connected, setConnected] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SavedSession | null>(null);
  const [host, setHost] = useState('10.0.0.5');
  const [user, setUser] = useState('root');
  const [password, setPassword] = useState('');
  const [protocol, setProtocol] = useState<'SFTP' | 'FTP' | 'SCP' | 'WebDAV'>('SFTP');
  const [localPath, setLocalPath] = useState('C:\\Users\\User');
  const [remotePath, setRemotePath] = useState('/root');
  const [localSelected, setLocalSelected] = useState<string | null>(null);
  const [remoteSelected, setRemoteSelected] = useState<string | null>(null);
  const [transfer, setTransfer] = useState<TransferState>(null);
  const timerRef = useRef<number | null>(null);

  const localEntries = LOCAL_FS[localPath] ?? LOCAL_FS['C:\\Users\\User'];
  const remoteEntries = REMOTE_FS[remotePath] ?? REMOTE_FS['/root'];

  const handleConnect = () => {
    setConnected(true);
    setRemotePath('/root');
  };

  const handleDisconnect = () => {
    setConnected(false);
    setLocalSelected(null);
    setRemoteSelected(null);
  };

  const startTransfer = (file: string, direction: 'up' | 'down') => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTransfer({ file, progress: 0, direction });
    let pct = 0;
    timerRef.current = window.setInterval(() => {
      pct += Math.random() * 15 + 5;
      if (pct >= 100) {
        clearInterval(timerRef.current!);
        setTransfer(null);
        return;
      }
      setTransfer({ file, progress: Math.min(pct, 100), direction });
    }, 200);
  };

  const handleUpload = () => {
    if (!localSelected) return;
    startTransfer(localSelected, 'up');
  };

  const handleDownload = () => {
    if (!remoteSelected) return;
    startTransfer(remoteSelected, 'down');
  };

  const navigateLocal = (entry: FsEntry) => {
    if (entry.type !== 'dir') return;
    const newPath = localPath === 'C:\\' ? `C:\\${entry.name}` : `${localPath}\\${entry.name}`;
    setLocalPath(LOCAL_FS[newPath] ? newPath : localPath);
    setLocalSelected(null);
  };

  const navigateRemote = (entry: FsEntry) => {
    if (entry.type !== 'dir') return;
    const newPath = remotePath === '/' ? `/${entry.name}` : `${remotePath}/${entry.name}`;
    setRemotePath(REMOTE_FS[newPath] ? newPath : remotePath);
    setRemoteSelected(null);
  };

  if (!connected) {
    return (
      <div className="winscp-login">
        <div className="winscp-login-header">
          <span className="winscp-login-icon">📂</span>
          <div>
            <div className="winscp-login-title">WinSCP — Login</div>
            <div className="winscp-login-sub">Secure File Transfer Client</div>
          </div>
        </div>

        <div className="winscp-login-body">
          <div className="winscp-sessions-panel">
            <div className="winscp-sessions-title">Saved Sessions</div>
            {SAVED_SESSIONS.map(s => (
              <div
                key={s.name}
                className={`winscp-session-item ${selectedSession?.name === s.name ? 'active' : ''}`}
                onClick={() => { setSelectedSession(s); setHost(s.host); setUser(s.user); setProtocol(s.protocol); }}
                onDoubleClick={() => { setSelectedSession(s); setHost(s.host); setUser(s.user); setProtocol(s.protocol); handleConnect(); }}
              >
                <span className="winscp-sess-icon">📡</span>
                <div>
                  <div className="winscp-sess-name">{s.name}</div>
                  <div className="winscp-sess-host">{s.protocol}://{s.user}@{s.host}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="winscp-form-panel">
            <div className="winscp-form-section">Session</div>
            <div className="winscp-form-row">
              <label>File protocol:</label>
              <select className="winscp-select" value={protocol} onChange={e => setProtocol(e.target.value as typeof protocol)}>
                {(['SFTP', 'FTP', 'SCP', 'WebDAV'] as const).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="winscp-form-row">
              <label>Host name:</label>
              <input className="winscp-input" value={host} onChange={e => setHost(e.target.value)} />
              <label className="winscp-port-label">Port:</label>
              <input className="winscp-input winscp-port" defaultValue="22" />
            </div>
            <div className="winscp-form-row">
              <label>User name:</label>
              <input className="winscp-input" value={user} onChange={e => setUser(e.target.value)} />
            </div>
            <div className="winscp-form-row">
              <label>Password:</label>
              <input className="winscp-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="(leave blank to prompt)" />
            </div>
            <div className="winscp-login-btns">
              <button className="winscp-btn winscp-btn-primary" onClick={handleConnect}>Login</button>
              <button className="winscp-btn" onClick={() => {}}>Save</button>
              <button className="winscp-btn" onClick={() => {}}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="winscp-root">
      {/* Toolbar */}
      <div className="winscp-toolbar">
        <button className="winscp-tb-btn" onClick={handleDownload} disabled={!remoteSelected} title="Download">
          ⬇ Download
        </button>
        <button className="winscp-tb-btn" onClick={handleUpload} disabled={!localSelected} title="Upload">
          ⬆ Upload
        </button>
        <div className="winscp-tb-sep" />
        <button className="winscp-tb-btn" title="Delete">🗑 Delete</button>
        <button className="winscp-tb-btn" title="Create directory">📁 New Dir</button>
        <button className="winscp-tb-btn" title="Refresh">🔄 Refresh</button>
        <div className="winscp-tb-sep" />
        <button className="winscp-tb-btn" onClick={handleDisconnect}>🔌 Disconnect</button>
        <div style={{ flex: 1 }} />
        <span className="winscp-session-info">{protocol}://{user}@{host}</span>
      </div>

      {/* Split panels */}
      <div className="winscp-panels">
        {/* Local */}
        <div className="winscp-panel">
          <div className="winscp-panel-header">
            <span className="winscp-panel-title">🖥 Local</span>
            <div className="winscp-path-bar">
              <button className="winscp-path-up" onClick={() => {
                const parts = localPath.split('\\').filter(Boolean);
                if (parts.length > 1) { parts.pop(); setLocalPath(parts.length === 1 ? parts[0] + '\\' : parts.join('\\')); }
              }}>↑</button>
              <span className="winscp-path-text">{localPath}</span>
            </div>
          </div>
          <div className="winscp-file-header">
            <span className="winscp-fc-name">Name</span>
            <span className="winscp-fc-size">Size</span>
            <span className="winscp-fc-date">Modified</span>
          </div>
          <div className="winscp-file-list">
            {localEntries.map(e => (
              <div
                key={e.name}
                className={`winscp-file-row ${localSelected === e.name ? 'selected' : ''}`}
                onClick={() => setLocalSelected(e.name)}
                onDoubleClick={() => navigateLocal(e)}
              >
                <span className="winscp-fc-name">
                  {e.type === 'dir' ? '📁' : '📄'} {e.name}
                </span>
                <span className="winscp-fc-size">{e.size}</span>
                <span className="winscp-fc-date">{e.modified}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Remote */}
        <div className="winscp-panel">
          <div className="winscp-panel-header">
            <span className="winscp-panel-title">🌐 Remote ({host})</span>
            <div className="winscp-path-bar">
              <button className="winscp-path-up" onClick={() => {
                const parts = remotePath.split('/').filter(Boolean);
                if (parts.length > 0) { parts.pop(); setRemotePath(parts.length === 0 ? '/' : '/' + parts.join('/')); }
              }}>↑</button>
              <span className="winscp-path-text">{remotePath}</span>
            </div>
          </div>
          <div className="winscp-file-header">
            <span className="winscp-fc-name">Name</span>
            <span className="winscp-fc-size">Size</span>
            <span className="winscp-fc-date">Modified</span>
            <span className="winscp-fc-perms">Permissions</span>
          </div>
          <div className="winscp-file-list">
            {remoteEntries.map(e => (
              <div
                key={e.name}
                className={`winscp-file-row ${remoteSelected === e.name ? 'selected' : ''}`}
                onClick={() => setRemoteSelected(e.name)}
                onDoubleClick={() => navigateRemote(e)}
              >
                <span className="winscp-fc-name">
                  {e.type === 'dir' ? '📁' : '📄'} {e.name}
                </span>
                <span className="winscp-fc-size">{e.size}</span>
                <span className="winscp-fc-date">{e.modified}</span>
                <span className="winscp-fc-perms" style={{ fontFamily: 'Consolas', fontSize: 11 }}>{e.perms}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transfer progress */}
      {transfer && (
        <div className="winscp-transfer">
          <span>{transfer.direction === 'up' ? '⬆ Uploading' : '⬇ Downloading'}: {transfer.file}</span>
          <div className="winscp-transfer-bar-bg">
            <div className="winscp-transfer-bar-fill" style={{ width: `${transfer.progress}%` }} />
          </div>
          <span>{Math.round(transfer.progress)}%</span>
          <button className="winscp-transfer-cancel" onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setTransfer(null); }}>
            Cancel
          </button>
        </div>
      )}

      {/* Status bar */}
      <div className="winscp-statusbar">
        <span>✔ Connected to {host}</span>
        <span>{protocol} · {user}</span>
        <span>Remote: {remoteEntries.length} items · Local: {localEntries.length} items</span>
      </div>
    </div>
  );
}
