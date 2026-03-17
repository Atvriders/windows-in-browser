import { useState, useRef, useEffect, useCallback } from 'react';
import './WindowsTerminal.css';

type ProfileType = 'powershell' | 'cmd' | 'ubuntu';

interface Profile {
  id: ProfileType;
  name: string;
  icon: string;
  bg: string;
  fg: string;
  prompt: (cwd: string) => string;
}

interface Tab {
  id: number;
  profile: Profile;
  cwd: string;
  lines: TermLine[];
  input: string;
  history: string[];
  histIdx: number;
}

type TermLine = { type: 'output' | 'input' | 'error' | 'prompt'; text: string };

const PROFILES: Profile[] = [
  {
    id: 'powershell',
    name: 'Windows PowerShell',
    icon: '⚡',
    bg: '#012456',
    fg: '#eeedf0',
    prompt: (cwd) => `PS ${cwd}> `,
  },
  {
    id: 'cmd',
    name: 'Command Prompt',
    icon: '⬛',
    bg: '#0c0c0c',
    fg: '#cccccc',
    prompt: (cwd) => `${cwd}>`,
  },
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    icon: '🟠',
    bg: '#300a24',
    fg: '#eeeeec',
    prompt: (cwd) => `user@DESKTOP-WIN10:${cwd}$ `,
  },
];

const INIT_MESSAGES: Record<ProfileType, string> = {
  powershell: 'Windows PowerShell\nCopyright (C) Microsoft Corporation. All rights reserved.\n\nInstall the latest PowerShell for new features and improvements! https://aka.ms/PSWindows\n',
  cmd: 'Microsoft Windows [Version 10.0.19045.3996]\n(c) Microsoft Corporation. All rights reserved.\n',
  ubuntu: 'To run a command as administrator (user "root"), use "sudo <command>".\nSee "man sudo_root" for details.\n',
};

const FS_TREE: Record<string, string[]> = {
  'C:\\Users\\User': ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Music', 'Videos', 'AppData'],
  'C:\\': ['Windows', 'Program Files', 'Program Files (x86)', 'Users', 'PerfLogs'],
  '~': ['.bashrc', '.bash_history', '.ssh', 'projects', 'Downloads'],
};

function runCommand(cmd: string, profile: ProfileType, cwd: string): { output: string; newCwd?: string } {
  const trimmed = cmd.trim();
  if (!trimmed) return { output: '' };
  const [c, ...args] = trimmed.split(/\s+/);
  const cl = c.toLowerCase();
  const argStr = args.join(' ');
  const isUnix = profile === 'ubuntu';

  if ((cl === 'clear' || cl === 'cls') && isUnix) return { output: '\x1b[2J' };
  if (cl === 'cls' || cl === 'clear') return { output: '\x1b[2J' };

  if (cl === 'echo') return { output: argStr || (isUnix ? '' : 'ECHO is on.') };

  if (cl === 'pwd' || (cl === 'cd' && !argStr && isUnix)) return { output: isUnix ? '/home/user' : cwd };

  if (cl === 'whoami') return { output: isUnix ? 'user' : 'desktop-win10\\user' };
  if (cl === 'hostname') return { output: 'DESKTOP-WIN10' };
  if (cl === 'date') return { output: new Date().toString() };

  if (cl === 'ls' || cl === 'dir') {
    const items = FS_TREE[isUnix ? '~' : cwd] ?? FS_TREE[cwd] ?? [];
    if (isUnix) return { output: items.join('  ') };
    const now = new Date();
    const ds = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const ts = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    let out = `\n Directory of ${cwd}\n\n`;
    items.forEach(i => { out += `${ds}  ${ts}    ${i.includes('.') ? '       1,024   ' : '<DIR>          '} ${i}\n`; });
    return { output: out };
  }

  if (cl === 'cd' || cl === 'chdir') {
    if (!argStr || argStr === '.') return { output: '' };
    if (isUnix) return { output: '', newCwd: argStr.startsWith('/') ? argStr : `${cwd}/${argStr}` };
    if (argStr === '..') {
      const parts = cwd.split('\\').filter(Boolean);
      if (parts.length > 1) { parts.pop(); return { output: '', newCwd: parts.length === 1 ? parts[0] + '\\' : parts.join('\\') }; }
      return { output: '' };
    }
    return { output: '', newCwd: argStr.includes(':') ? argStr : `${cwd}\\${argStr}` };
  }

  if (cl === 'ipconfig') {
    return { output: '\nWindows IP Configuration\n\nEthernet adapter Ethernet:\n   IPv4 Address. . . : 192.168.1.105\n   Subnet Mask . . . : 255.255.255.0\n   Default Gateway . : 192.168.1.1\n' };
  }

  if (cl === 'ping') {
    const host = args[0] || 'google.com';
    return { output: `\nPinging ${host} with 32 bytes of data:\nReply from 142.250.80.46: bytes=32 time=12ms TTL=115\nReply from 142.250.80.46: bytes=32 time=11ms TTL=115\nReply from 142.250.80.46: bytes=32 time=14ms TTL=115\nReply from 142.250.80.46: bytes=32 time=13ms TTL=115\n\nPing statistics:\n    Packets: Sent = 4, Received = 4, Lost = 0\n` };
  }

  if (cl === 'uname') return { output: 'Linux DESKTOP-WIN10 5.15.90.1-microsoft-standard-WSL2 #1 SMP x86_64 GNU/Linux' };

  if (cl === 'get-process' || cl === 'ps') {
    return { output: `\nHandles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName\n-------  ------    -----      -----     ------     --  -- -----------\n    462      28    15240      21048       0.42   1692   1 explorer\n    338      22     8244      14840       0.12   4520   1 Spotify\n    892      62    74224     128440       4.21   4788   1 chrome\n   1024      94   145880     214440      12.44   7100   1 node\n` };
  }

  if (cl === 'get-date' || (profile === 'powershell' && cl === 'date')) {
    return { output: new Date().toISOString() };
  }

  if (cl === 'ver' || (cl === 'get-host' && profile === 'powershell')) {
    return { output: profile === 'powershell' ? '\nName             : ConsoleHost\nVersion          : 7.4.1\nInstanceId       : a1b2c3d4\nUI               : System.Management.Automation.Internal.Host.InternalHostUserInterface\n' : '\nMicrosoft Windows [Version 10.0.19045.3996]\n' };
  }

  if (cl === 'systeminfo' || (cl === 'get-computerinfo' && profile === 'powershell')) {
    return { output: '\nHost Name:                 DESKTOP-WIN10\nOS Name:                   Microsoft Windows 10 Pro\nOS Version:                10.0.19045 Build 19045\nSystem Type:               x64-based PC\nTotal Physical Memory:     16,384 MB\n' };
  }

  if (cl === 'exit' || cl === 'quit') return { output: '' };
  if (cl === 'help') return { output: `Available commands: echo, cls/clear, pwd, ls/dir, cd, ping, ipconfig, whoami, hostname, date, ver, ps, systeminfo, uname, exit` };

  return { output: isUnix ? `${c}: command not found` : `'${c}' is not recognized as an internal or external command.` };
}

let tabCounter = 0;
function makeTab(profile: Profile): Tab {
  const cwd = profile.id === 'ubuntu' ? '~' : 'C:\\Users\\User';
  return {
    id: ++tabCounter,
    profile,
    cwd,
    lines: [{ type: 'output', text: INIT_MESSAGES[profile.id] }],
    input: '',
    history: [],
    histIdx: -1,
  };
}

export default function WindowsTerminal() {
  const [tabs, setTabs] = useState<Tab[]>(() => [makeTab(PROFILES[0])]);
  const [activeTabId, setActiveTabId] = useState<number>(() => tabs[0]?.id ?? 1);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];

  useEffect(() => {
    outputRef.current?.scrollTo(0, outputRef.current.scrollHeight);
  }, [activeTab?.lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeTabId]);

  const updateTab = useCallback((id: number, updater: (tab: Tab) => Tab) => {
    setTabs(ts => ts.map(t => t.id === id ? updater(t) : t));
  }, []);

  const addTab = (profile: Profile) => {
    const newTab = makeTab(profile);
    setTabs(ts => [...ts, newTab]);
    setActiveTabId(newTab.id);
    setShowDropdown(false);
  };

  const closeTab = (id: number) => {
    setTabs(ts => {
      const remaining = ts.filter(t => t.id !== id);
      if (remaining.length === 0) return ts; // keep at least 1
      if (activeTabId === id) setActiveTabId(remaining[remaining.length - 1].id);
      return remaining;
    });
  };

  const handleSubmit = () => {
    if (!activeTab) return;
    const cmd = activeTab.input;
    const result = runCommand(cmd, activeTab.profile.id, activeTab.cwd);

    updateTab(activeTab.id, tab => {
      if (result.output === '\x1b[2J') {
        return { ...tab, lines: [], input: '', histIdx: -1, history: cmd ? [cmd, ...tab.history.slice(0, 49)] : tab.history };
      }
      return {
        ...tab,
        cwd: result.newCwd ?? tab.cwd,
        input: '',
        histIdx: -1,
        history: cmd ? [cmd, ...tab.history.slice(0, 49)] : tab.history,
        lines: [
          ...tab.lines,
          { type: 'input', text: `${tab.profile.prompt(tab.cwd)}${cmd}` },
          ...(result.output ? [{ type: 'output' as const, text: result.output }] : []),
        ],
      };
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!activeTab) return;
    if (e.key === 'Enter') { handleSubmit(); return; }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = Math.min(activeTab.histIdx + 1, activeTab.history.length - 1);
      updateTab(activeTab.id, t => ({ ...t, histIdx: idx, input: t.history[idx] ?? '' }));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = Math.max(activeTab.histIdx - 1, -1);
      updateTab(activeTab.id, t => ({ ...t, histIdx: idx, input: idx === -1 ? '' : t.history[idx] ?? '' }));
    } else if (e.key === 'c' && e.ctrlKey) {
      updateTab(activeTab.id, t => ({
        ...t,
        input: '',
        histIdx: -1,
        lines: [...t.lines, { type: 'input', text: `${t.profile.prompt(t.cwd)}${t.input}^C` }],
      }));
    }
  };

  if (!activeTab) return null;

  return (
    <div className="wt-root" style={{ background: activeTab.profile.bg }}>
      {/* Tab bar */}
      <div className="wt-tabbar">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`wt-tab ${tab.id === activeTabId ? 'active' : ''}`}
            style={{
              background: tab.id === activeTabId ? tab.profile.bg : undefined,
              color: tab.id === activeTabId ? tab.profile.fg : undefined,
            }}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span className="wt-tab-icon">{tab.profile.icon}</span>
            <span className="wt-tab-name">{tab.profile.name}</span>
            <button
              className="wt-tab-close"
              onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
            >✕</button>
          </div>
        ))}

        <div className="wt-tab-add-wrap">
          <button className="wt-tab-add" onClick={() => setShowDropdown(d => !d)} title="New tab">+</button>
          {showDropdown && (
            <div className="wt-dropdown">
              {PROFILES.map(p => (
                <div key={p.id} className="wt-dropdown-item" onClick={() => addTab(p)}>
                  <span>{p.icon}</span>
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />
        <button className="wt-settings-btn" title="Settings">⚙</button>
      </div>

      {/* Terminal body */}
      <div
        className="wt-terminal"
        style={{ color: activeTab.profile.fg }}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="wt-output" ref={outputRef}>
          {activeTab.lines.map((line, i) => (
            <pre key={i} className={`wt-line wt-line-${line.type}`} style={{ color: line.type === 'error' ? '#ff6b6b' : line.type === 'input' ? activeTab.profile.fg : undefined }}>
              {line.text}
            </pre>
          ))}
          <div className="wt-input-row">
            <span className="wt-prompt" style={{ color: activeTab.profile.id === 'powershell' ? '#ffff00' : activeTab.profile.id === 'ubuntu' ? '#44ff44' : activeTab.profile.fg }}>
              {activeTab.profile.prompt(activeTab.cwd)}
            </span>
            <input
              ref={inputRef}
              className="wt-input"
              style={{ color: activeTab.profile.fg, caretColor: activeTab.profile.fg }}
              value={activeTab.input}
              onChange={e => updateTab(activeTab.id, t => ({ ...t, input: e.target.value }))}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
