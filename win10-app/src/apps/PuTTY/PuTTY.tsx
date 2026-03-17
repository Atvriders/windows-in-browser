import { useState, useRef, useEffect } from 'react';
import './PuTTY.css';

const SAVED_SESSIONS = [
  { name: 'web-server-01', host: '10.0.0.5',   port: 22, user: 'root' },
  { name: 'db-server-01',  host: '10.0.0.10',  port: 22, user: 'admin' },
  { name: 'dev-server',    host: '10.0.0.15',  port: 22, user: 'dev' },
  { name: 'backup-server', host: '192.168.1.150', port: 22, user: 'backup' },
  { name: 'router-gateway',host: '192.168.1.1',port: 22, user: 'admin' },
  { name: 'kali-vm',       host: '10.0.0.20',  port: 22, user: 'kali' },
];

const CATEGORIES = ['Session', 'Terminal', 'Keyboard', 'Bell', 'Features', 'Window', 'Appearance', 'Behaviour', 'Translation', 'Selection', 'Colours', 'Connection', 'SSH', 'Serial'];

type TermLine = { type: 'banner' | 'prompt' | 'input' | 'output' | 'error'; text: string };

const SSH_BANNERS: Record<string, string> = {
  '10.0.0.5':     'Ubuntu 22.04.3 LTS\nWelcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-94-generic x86_64)\n\n * Documentation:  https://help.ubuntu.com\n * Management:     https://landscape.canonical.com\n\nLast login: Mon Mar 17 08:42:11 2026 from 192.168.1.105',
  '10.0.0.10':    'Ubuntu 22.04.3 LTS (DB Cluster Node)\nWelcome to db-cluster-01\n\nSystem information as of Mon Mar 17 09:00:00 UTC 2026\n\n  System load:  0.08           Users logged in:     1\n  Processes:    142            Memory usage:        34%\n  Disk usage:   68%\n\nLast login: Mon Mar 17 07:15:44 2026 from 10.0.0.15',
  '10.0.0.15':    'Microsoft Windows [Version 10.0.22000.2960]\n(c) Microsoft Corporation. All rights reserved.\n\nOpenSSH_for_Windows_9.5p1, LibreSSL 3.8.2\nLast login: Mon Mar 17 09:30:22 2026',
  '192.168.1.150':'FreeNAS 13.0-U6.1 (RELEASE)\nWelcome to backup-server (TrueNAS CORE)\n\nLast login: Sun Mar 16 23:01:14 2026 from 192.168.1.105',
  '192.168.1.1':  'RouterOS 7.13.2\nMikroTik RB4011 SSH server v2.0\n\nLast login: Mon Mar 17 09:12:33 2026',
  '10.0.0.20':    'Kali GNU/Linux Rolling\n┌──(kali㉿kali-vm)-[~]\nWelcome to Kali Linux 2024.1\nLast login: Mon Mar 17 08:55:00 2026 from 192.168.1.105',
};

const PROMPTS: Record<string, string> = {
  '10.0.0.5':     'root@web-server-01:~# ',
  '10.0.0.10':    'admin@db-cluster-01:~# ',
  '10.0.0.15':    'C:\\Users\\dev> ',
  '192.168.1.150':'[backup@storage ~]# ',
  '192.168.1.1':  '[admin@MikroTik] > ',
  '10.0.0.20':    '┌──(kali㉿kali-vm)-[~]\n└─$ ',
};

function getCommandOutput(cmd: string, host: string): string {
  const c = cmd.trim();
  if (!c) return '';
  const isWin = host === '10.0.0.15';

  if (c === 'ls' || c === 'ls -la') return isWin
    ? 'Directory: C:\\Users\\dev\n\nMode   LastWriteTime   Name\n----   -------------   ----\nd----  2026-03-17      Desktop\nd----  2026-03-17      Documents\nd----  2026-03-17      Downloads\nd----  2026-03-16      Projects\n-a---  2026-03-10      .bashrc\n-a---  2026-03-01      .gitconfig'
    : 'total 88\ndrwxr-xr-x 12 root root 4096 Mar 17 09:00 .\ndrwxr-xr-x 20 root root 4096 Jan 15 12:00 ..\n-rw-------  1 root root 1234 Mar 17 08:42 .bash_history\n-rw-r--r--  1 root root 3526 Jan 15 12:00 .bashrc\ndrwxr-xr-x  2 root root 4096 Mar 10 14:22 .ssh\ndrwxr-xr-x  5 root root 4096 Feb 20 10:15 apps\ndrwxr-xr-x  3 root root 4096 Feb 14 08:30 backups\ndrwxr-xr-x  8 root root 4096 Mar 17 09:00 logs\n-rw-r--r--  1 root root  220 Jan 15 12:00 README.md';

  if (c === 'pwd') return isWin ? 'C:\\Users\\dev' : '/root';

  if (c === 'whoami') return isWin ? 'dev-box\\dev' : 'root';

  if (c === 'uname -a') return 'Linux web-server-01 5.15.0-94-generic #104-Ubuntu SMP Tue Jan 9 15:25:40 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux';

  if (c === 'df -h') return 'Filesystem      Size  Used Avail Use% Mounted on\nudev            3.9G     0  3.9G   0% /dev\ntmpfs           794M  1.5M  793M   1% /run\n/dev/sda1        50G   22G   26G  46% /\ntmpfs           3.9G     0  3.9G   0% /dev/shm\n/dev/sdb1       200G  148G   41G  79% /data\n/dev/sdc1        50G    4G   46G   8% /var/log';

  if (c === 'ps aux') return 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1 167824  9236 ?        Ss   09:00   0:01 /sbin/init\nroot       548  0.0  0.0  65536  3840 ?        Ss   09:00   0:00 /usr/sbin/sshd -D\nwww-data   924  0.1  0.5 196352 42244 ?        S    09:00   0:12 nginx: worker process\nmysql     1035  0.8  4.2 1854208 339244 ?      Sl   09:00   2:34 /usr/sbin/mysqld\nroot      1248  0.0  0.1  14220  9152 ?        Ss   09:01   0:00 sshd: root@pts/0\nroot      1292  0.0  0.0  11492  5120 pts/0    Ss   09:01   0:00 -bash\nroot      1420  0.0  0.0  13528  3456 pts/0    R+   09:15   0:00 ps aux';

  if (c === 'cat /etc/os-release') return 'NAME="Ubuntu"\nVERSION="22.04.3 LTS (Jammy Jellyfish)"\nID=ubuntu\nID_LIKE=debian\nPRETTY_NAME="Ubuntu 22.04.3 LTS"\nVERSION_ID="22.04"\nHOME_URL="https://www.ubuntu.com/"\nSUPPORT_URL="https://help.ubuntu.com/"';

  if (c === 'hostname') return host.includes('10.0.0.5') ? 'web-server-01' : host.includes('10.0.0.10') ? 'db-cluster-01' : host.includes('10.0.0.15') ? 'dev-box' : 'server';

  if (c === 'free -h') return '               total        used        free      shared  buff/cache   available\nMem:            7.7G        2.1G        1.8G        124M        3.8G        5.2G\nSwap:           2.0G          0B        2.0G';

  if (c === 'netstat -tuln' || c === 'ss -tuln') return 'Netid  State   Recv-Q  Send-Q  Local Address:Port  Peer Address:Port\ntcp    LISTEN  0       128     0.0.0.0:22          0.0.0.0:*\ntcp    LISTEN  0       511     0.0.0.0:80          0.0.0.0:*\ntcp    LISTEN  0       511     0.0.0.0:443         0.0.0.0:*\ntcp    LISTEN  0       70      127.0.0.1:3306      0.0.0.0:*\nudp    UNCONN  0       0       0.0.0.0:68          0.0.0.0:*';

  if (c.startsWith('echo ')) return c.slice(5);
  if (c === 'date') return new Date().toString();
  if (c === 'uptime') return ` 09:42:15 up 3 days,  2:18,  1 user,  load average: 0.08, 0.12, 0.10`;
  if (c === 'exit' || c === 'logout') return '\nlogout\nConnection to server closed.';
  if (c === 'clear') return '\x1b[CLEAR]';
  if (c.startsWith('cd ')) return '';
  if (c === 'sudo su' || c === 'su -') return `[sudo] password for user:`;

  return `bash: ${c}: command not found`;
}

export default function PuTTY() {
  const [connected, setConnected] = useState(false);
  const [activeHost, setActiveHost] = useState('10.0.0.5');
  const [host, setHost] = useState('10.0.0.5');
  const [port, setPort] = useState(22);
  const [connType, setConnType] = useState<'SSH' | 'Telnet' | 'Rlogin' | 'Raw' | 'Serial'>('SSH');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Session');
  const [lines, setLines] = useState<TermLine[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleOpen = () => {
    const banner = SSH_BANNERS[host] ?? `SSH connection established to ${host}`;
    const prompt = PROMPTS[host] ?? `user@${host}:~# `;
    setActiveHost(host);
    setLines([
      { type: 'banner', text: `\r\nConnecting to ${host}:${port}...\r\nSSH-2.0-OpenSSH_9.3p2 Ubuntu-1ubuntu3.4\r\n` },
      { type: 'banner', text: banner },
      { type: 'prompt', text: prompt },
    ]);
    setConnected(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const getPrompt = () => PROMPTS[activeHost] ?? `user@${activeHost}:~# `;

  const handleSubmit = () => {
    const cmd = input.trim();
    setInput('');
    setHistIdx(-1);
    if (cmd) setHistory(h => [cmd, ...h.slice(0, 49)]);

    const output = getCommandOutput(cmd, activeHost);
    const promptStr = getPrompt();

    if (output === '\x1b[CLEAR]') {
      setLines([{ type: 'prompt', text: promptStr }]);
      return;
    }

    setLines(prev => [
      ...prev,
      { type: 'input', text: cmd },
      ...(output ? [{ type: 'output' as const, text: output }] : []),
      { type: 'prompt', text: promptStr },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { handleSubmit(); return; }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      if (history[idx] !== undefined) setInput(history[idx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? '' : history[idx]);
    } else if (e.key === 'c' && e.ctrlKey) {
      setLines(prev => [...prev, { type: 'input', text: input + '^C' }, { type: 'prompt', text: getPrompt() }]);
      setInput('');
    }
  };

  if (connected) {
    return (
      <div className="putty-terminal" onClick={() => inputRef.current?.focus()}>
        <div className="putty-term-output">
          {lines.map((line, i) => {
            if (line.type === 'prompt') {
              const parts = line.text.split('\n');
              return (
                <div key={i} className="putty-prompt-line">
                  {parts.slice(0, -1).map((p, j) => <div key={j} className="putty-banner-line">{p}</div>)}
                  <div className="putty-input-row">
                    <span className="putty-prompt-text">{parts[parts.length - 1]}</span>
                    {i === lines.length - 1 && (
                      <input
                        ref={inputRef}
                        className="putty-input"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        spellCheck={false}
                        autoComplete="off"
                      />
                    )}
                  </div>
                </div>
              );
            }
            return (
              <pre key={i} className={`putty-line putty-line-${line.type}`}>{line.text}</pre>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div className="putty-term-status">
          <span>SSH — {activeHost}:{port}</span>
          <span>80x24</span>
          <button className="putty-close-btn" onClick={() => setConnected(false)}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="putty-root">
      <div className="putty-sidebar">
        <div className="putty-cat-title">Category:</div>
        {CATEGORIES.map(cat => (
          <div
            key={cat}
            className={`putty-cat-item ${selectedCategory === cat ? 'active' : ''} ${['SSH', 'Window', 'Connection', 'Terminal'].includes(cat) ? 'putty-cat-parent' : 'putty-cat-child'}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </div>
        ))}
      </div>

      <div className="putty-main">
        <div className="putty-main-title">PuTTY Configuration</div>
        <div className="putty-section-label">Basic options for your PuTTY session</div>

        <div className="putty-group">
          <div className="putty-group-title">Specify the destination you want to connect to</div>
          <div className="putty-form-row">
            <label>Host Name (or IP address)</label>
            <input
              className="putty-input-field"
              value={host}
              onChange={e => setHost(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleOpen()}
            />
          </div>
          <div className="putty-form-row">
            <label>Port</label>
            <input
              className="putty-input-field putty-port"
              type="number"
              value={port}
              onChange={e => setPort(Number(e.target.value))}
            />
          </div>
          <div className="putty-conntype-row">
            <span className="putty-conntype-label">Connection type:</span>
            {(['SSH', 'Telnet', 'Rlogin', 'Raw', 'Serial'] as const).map(ct => (
              <label key={ct} className="putty-radio-label">
                <input
                  type="radio"
                  name="conntype"
                  checked={connType === ct}
                  onChange={() => setConnType(ct)}
                />
                {ct}
              </label>
            ))}
          </div>
        </div>

        <div className="putty-group">
          <div className="putty-group-title">Load, save or delete a stored session</div>
          <div className="putty-sessions-row">
            <div className="putty-sessions-list">
              <div
                className={`putty-session-item putty-session-default ${selectedSession === '' ? 'active' : ''}`}
                onClick={() => { setSelectedSession(''); }}
                onDoubleClick={handleOpen}
              >
                Default Settings
              </div>
              {SAVED_SESSIONS.map(s => (
                <div
                  key={s.name}
                  className={`putty-session-item ${selectedSession === s.name ? 'active' : ''}`}
                  onClick={() => { setSelectedSession(s.name); setHost(s.host); setPort(s.port); }}
                  onDoubleClick={() => { setHost(s.host); setPort(s.port); handleOpen(); }}
                >
                  {s.name}
                </div>
              ))}
            </div>
            <div className="putty-session-btns">
              <button className="putty-sess-btn" onClick={handleOpen}>Load</button>
              <button className="putty-sess-btn">Save</button>
              <button className="putty-sess-btn">Delete</button>
            </div>
          </div>
        </div>

        <div className="putty-close-option-row">
          <label>Close window on exit:</label>
          <label className="putty-radio-label"><input type="radio" name="exit" defaultChecked /> Always</label>
          <label className="putty-radio-label"><input type="radio" name="exit" /> Never</label>
          <label className="putty-radio-label"><input type="radio" name="exit" /> Only on clean exit</label>
        </div>

        <div className="putty-open-row">
          <button className="putty-cancel-btn" onClick={() => {}}>Cancel</button>
          <button className="putty-open-btn" onClick={handleOpen}>Open</button>
        </div>
      </div>
    </div>
  );
}
