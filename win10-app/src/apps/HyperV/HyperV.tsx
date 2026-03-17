import { useState } from 'react';
import './HyperV.css';

interface VM {
  name: string;
  state: 'Running' | 'Off' | 'Paused' | 'Saved';
  os: string;
  ram: string;
  cpu: number;
  uptime: string;
  checkpoints: string[];
}

const INITIAL_VMS: VM[] = [
  { name: 'Ubuntu Server 22.04',  state: 'Running', os: 'Ubuntu 22.04 LTS',       ram: '4 GB', cpu: 4, uptime: '3 days, 2:18', checkpoints: ['2026-03-10 baseline', '2026-03-15 after-update'] },
  { name: 'Windows Server 2022',  state: 'Running', os: 'Windows Server 2022 Std', ram: '8 GB', cpu: 4, uptime: '1 day, 14:05', checkpoints: ['2026-03-01 clean-install', '2026-03-17 AD configured'] },
  { name: 'Kali Linux 2024.1',    state: 'Off',     os: 'Kali Linux 2024.1',       ram: '4 GB', cpu: 2, uptime: '—',            checkpoints: ['2026-02-20 initial-setup'] },
  { name: 'pfSense 2.7',          state: 'Running', os: 'FreeBSD (pfSense 2.7.0)', ram: '1 GB', cpu: 2, uptime: '14 days, 0:22', checkpoints: [] },
  { name: 'Docker-Host',          state: 'Running', os: 'Ubuntu 22.04 LTS',        ram: '8 GB', cpu: 8, uptime: '7 days, 11:44', checkpoints: ['2026-03-10 pre-compose'] },
];

const VM_CONSOLES: Record<string, { type: 'desktop' | 'terminal'; bg: string; content: string }> = {
  'Ubuntu Server 22.04': {
    type: 'terminal', bg: '#0c0c0c',
    content: 'Ubuntu 22.04.3 LTS ubuntu-server tty1\n\nubuntu-server login: root\nPassword:\nLast login: Mon Mar 17 09:00:00 2026\nroot@ubuntu-server:~# ',
  },
  'Windows Server 2022': {
    type: 'desktop', bg: 'linear-gradient(135deg, #0a2a5c 0%, #0d47a1 100%)',
    content: 'Windows Server 2022',
  },
  'Kali Linux 2024.1': {
    type: 'terminal', bg: '#1a0a2e',
    content: '┌──(root㉿kali)-[~]\n└─# ',
  },
  'pfSense 2.7': {
    type: 'terminal', bg: '#001a00',
    content: 'Welcome to pfSense 2.7.0-RELEASE\n\n*** Welcome to pfSense 2.7.0-RELEASE (amd64) ***\n\n LAN -> em0 -> v4: 192.168.1.1/24\n WAN -> em1 -> v4/DHCP4: 203.0.113.45\n\nEnter an option: ',
  },
  'Docker-Host': {
    type: 'terminal', bg: '#0c0c0c',
    content: 'root@docker-host:~# docker ps\nCONTAINER ID   IMAGE         COMMAND                  CREATED      STATUS       NAMES\na1b2c3d4e5f6   nginx:latest  "/docker-entrypoint.…"  2 days ago   Up 2 days    web\nb2c3d4e5f6a7   postgres:15   "docker-entrypoint.s…"  7 days ago   Up 7 days    db\nc3d4e5f6a7b8   redis:7       "docker-entrypoint.s…"  7 days ago   Up 7 days    cache\nroot@docker-host:~# ',
  },
};

const ACTIONS = [
  { label: 'Connect…', icon: '🖥️' },
  { label: 'Settings…', icon: '⚙️' },
  { label: 'Start', icon: '▶️' },
  { label: 'Checkpoint', icon: '📷' },
  { label: 'Revert', icon: '↩️' },
  { label: 'Reset', icon: '🔄' },
  { label: 'Shut Down', icon: '⏹️' },
  { label: 'Save', icon: '💾' },
  { label: 'Pause', icon: '⏸️' },
  { label: 'Delete…', icon: '🗑️' },
];

export default function HyperV() {
  const [vms, setVms] = useState<VM[]>(INITIAL_VMS);
  const [selected, setSelected] = useState<VM | null>(INITIAL_VMS[0]);
  const [consoleVm, setConsoleVm] = useState<VM | null>(null);
  const [nodeExpanded, setNodeExpanded] = useState(true);

  const handleAction = (action: string, vm: VM | null) => {
    if (!vm) return;
    if (action === 'Connect…') { setConsoleVm(vm); return; }
    if (action === 'Start') {
      setVms(vs => vs.map(v => v.name === vm.name ? { ...v, state: 'Running', uptime: '0:00:01' } : v));
    } else if (action === 'Shut Down') {
      setVms(vs => vs.map(v => v.name === vm.name ? { ...v, state: 'Off', uptime: '—' } : v));
    } else if (action === 'Pause') {
      setVms(vs => vs.map(v => v.name === vm.name ? { ...v, state: 'Paused' } : v));
    } else if (action === 'Save') {
      setVms(vs => vs.map(v => v.name === vm.name ? { ...v, state: 'Saved' } : v));
    } else if (action === 'Reset') {
      setVms(vs => vs.map(v => v.name === vm.name ? { ...v, state: 'Running', uptime: '0:00:01' } : v));
    } else if (action === 'Checkpoint') {
      const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
      setVms(vs => vs.map(v => v.name === vm.name ? { ...v, checkpoints: [...v.checkpoints, `${now} manual`] } : v));
    }
  };

  const stateColor = (state: VM['state']) => {
    if (state === 'Running') return '#2ecc71';
    if (state === 'Off') return '#e74c3c';
    if (state === 'Paused') return '#f39c12';
    return '#95a5a6';
  };

  const consoleData = consoleVm ? VM_CONSOLES[consoleVm.name] : null;

  return (
    <div className="hv-root">
      {/* Left pane */}
      <div className="hv-left">
        <div className="hv-left-title">Hyper-V Manager</div>
        <div className="hv-tree">
          <div className="hv-tree-item hv-tree-root" onClick={() => setNodeExpanded(p => !p)}>
            {nodeExpanded ? '▼' : '▶'} Hyper-V Manager
          </div>
          {nodeExpanded && (
            <div className="hv-tree-child">
              🖥️ DESKTOP-WIN10
            </div>
          )}
        </div>
      </div>

      {/* Center */}
      <div className="hv-center">
        {/* VM list */}
        <div className="hv-vm-list">
          <div className="hv-vm-list-header">
            <span className="hv-col-name">Name</span>
            <span className="hv-col-state">State</span>
            <span className="hv-col-cpu">CPU Usage</span>
            <span className="hv-col-ram">Assigned Memory</span>
            <span className="hv-col-uptime">Uptime</span>
          </div>
          {vms.map(vm => (
            <div
              key={vm.name}
              className={`hv-vm-row ${selected?.name === vm.name ? 'selected' : ''}`}
              onClick={() => setSelected(vm)}
              onDoubleClick={() => setConsoleVm(vm)}
            >
              <span className="hv-col-name">🖥️ {vm.name}</span>
              <span className="hv-col-state" style={{ color: stateColor(vm.state) }}>⬤ {vm.state}</span>
              <span className="hv-col-cpu">{vm.state === 'Running' ? `${vm.cpu}%` : '—'}</span>
              <span className="hv-col-ram">{vm.ram}</span>
              <span className="hv-col-uptime">{vm.uptime}</span>
            </div>
          ))}
        </div>

        <div className="hv-center-divider" />

        {/* Checkpoints + details */}
        <div className="hv-lower-center">
          <div className="hv-checkpoints-pane">
            <div className="hv-pane-title">Checkpoints — {selected?.name ?? 'No VM selected'}</div>
            {selected?.checkpoints.length === 0 && (
              <div className="hv-empty-msg">No checkpoints for this virtual machine.</div>
            )}
            {selected?.checkpoints.map(cp => (
              <div key={cp} className="hv-cp-item">
                <span className="hv-cp-icon">📷</span>
                <span className="hv-cp-label">{cp}</span>
              </div>
            ))}
          </div>
          {selected && (
            <div className="hv-detail-pane">
              <div className="hv-pane-title">Summary</div>
              <div className="hv-detail-row"><span>Name</span><span>{selected.name}</span></div>
              <div className="hv-detail-row"><span>State</span><span style={{ color: stateColor(selected.state) }}>{selected.state}</span></div>
              <div className="hv-detail-row"><span>OS</span><span>{selected.os}</span></div>
              <div className="hv-detail-row"><span>RAM</span><span>{selected.ram}</span></div>
              <div className="hv-detail-row"><span>Uptime</span><span>{selected.uptime}</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="hv-right">
        <div className="hv-right-section">Actions — DESKTOP-WIN10</div>
        <div
          className="hv-action-item"
          onClick={() => { /* open new VM wizard */ }}
        >
          <span>🆕</span> New Virtual Machine…
        </div>
        <div className="hv-action-item"><span>⚙️</span> Hyper-V Settings…</div>
        <div className="hv-action-item"><span>🔄</span> Virtual Switch Manager…</div>
        <div className="hv-action-sep" />
        <div className="hv-right-section">{selected ? `Actions — ${selected.name}` : 'Select a VM'}</div>
        {ACTIONS.map(a => (
          <div
            key={a.label}
            className={`hv-action-item ${!selected ? 'hv-action-disabled' : ''}`}
            onClick={() => handleAction(a.label, selected)}
          >
            <span>{a.icon}</span> {a.label}
          </div>
        ))}
      </div>

      {/* VM console modal */}
      {consoleVm && consoleData && (
        <div className="hv-console-overlay" onClick={() => setConsoleVm(null)}>
          <div className="hv-console" style={{ background: consoleData.bg }} onClick={e => e.stopPropagation()}>
            <div className="hv-console-titlebar">
              <span>{consoleVm.name} — Virtual Machine Connection</span>
              <button className="hv-console-close" onClick={() => setConsoleVm(null)}>✕</button>
            </div>
            {consoleData.type === 'terminal' ? (
              <div className="hv-console-terminal">
                <pre className="hv-console-text">{consoleData.content}</pre>
                <span className="hv-console-cursor">█</span>
              </div>
            ) : (
              <div className="hv-console-desktop">
                <div className="hv-console-desktop-icons">
                  {['This PC', 'Recycle Bin', 'Server Manager', 'Notepad'].map(icon => (
                    <div key={icon} className="hv-desk-icon">
                      <span>{icon === 'This PC' ? '🖥️' : icon === 'Recycle Bin' ? '🗑️' : icon === 'Server Manager' ? '⚙️' : '📝'}</span>
                      <span>{icon}</span>
                    </div>
                  ))}
                </div>
                <div className="hv-console-desktop-label">{consoleData.content}</div>
                <div className="hv-console-taskbar">
                  <span>⊞</span>
                  <span className="hv-console-task-item">📋 Server Manager</span>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 11, color: '#ccc' }}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
