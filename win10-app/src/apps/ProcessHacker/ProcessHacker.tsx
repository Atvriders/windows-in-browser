import { useState, useEffect } from 'react';
import './ProcessHacker.css';

interface Proc { pid: number; name: string; cpu: number; mem: number; user: string; type: 'system' | 'user' | 'service'; }

const BASE_PROCS: Omit<Proc, 'cpu' | 'mem'>[] = [
  { pid: 4, name: 'System', user: 'SYSTEM', type: 'system' },
  { pid: 8, name: 'Registry', user: 'SYSTEM', type: 'system' },
  { pid: 380, name: 'smss.exe', user: 'SYSTEM', type: 'system' },
  { pid: 512, name: 'csrss.exe', user: 'SYSTEM', type: 'system' },
  { pid: 644, name: 'wininit.exe', user: 'SYSTEM', type: 'system' },
  { pid: 656, name: 'winlogon.exe', user: 'SYSTEM', type: 'system' },
  { pid: 748, name: 'services.exe', user: 'SYSTEM', type: 'system' },
  { pid: 760, name: 'lsass.exe', user: 'SYSTEM', type: 'system' },
  { pid: 912, name: 'svchost.exe', user: 'SYSTEM', type: 'service' },
  { pid: 1024, name: 'svchost.exe', user: 'NETWORK SERVICE', type: 'service' },
  { pid: 1080, name: 'svchost.exe', user: 'LOCAL SERVICE', type: 'service' },
  { pid: 1240, name: 'svchost.exe', user: 'SYSTEM', type: 'service' },
  { pid: 1440, name: 'dwm.exe', user: 'DWM-1', type: 'system' },
  { pid: 1692, name: 'explorer.exe', user: 'User', type: 'user' },
  { pid: 2108, name: 'SearchIndexer.exe', user: 'SYSTEM', type: 'service' },
  { pid: 2244, name: 'spoolsv.exe', user: 'SYSTEM', type: 'service' },
  { pid: 2356, name: 'MsMpEng.exe', user: 'SYSTEM', type: 'service' },
  { pid: 2540, name: 'audiodg.exe', user: 'LOCAL SERVICE', type: 'service' },
  { pid: 2788, name: 'RuntimeBroker.exe', user: 'User', type: 'user' },
  { pid: 3204, name: 'ShellExperienceHost.exe', user: 'User', type: 'user' },
  { pid: 3512, name: 'taskhostw.exe', user: 'User', type: 'user' },
  { pid: 3840, name: 'smartscreen.exe', user: 'User', type: 'user' },
  { pid: 4120, name: 'Discord.exe', user: 'User', type: 'user' },
  { pid: 4288, name: 'Discord.exe', user: 'User', type: 'user' },
  { pid: 4520, name: 'Spotify.exe', user: 'User', type: 'user' },
  { pid: 4788, name: 'chrome.exe', user: 'User', type: 'user' },
  { pid: 4820, name: 'chrome.exe', user: 'User', type: 'user' },
  { pid: 4840, name: 'chrome.exe', user: 'User', type: 'user' },
  { pid: 5100, name: 'steam.exe', user: 'User', type: 'user' },
  { pid: 5240, name: 'steamwebhelper.exe', user: 'User', type: 'user' },
  { pid: 5480, name: 'cs2.exe', user: 'User', type: 'user' },
  { pid: 6020, name: 'obs64.exe', user: 'User', type: 'user' },
  { pid: 6340, name: 'nvcontainer.exe', user: 'User', type: 'user' },
  { pid: 6540, name: 'NvOAWrapperCache.exe', user: 'SYSTEM', type: 'service' },
  { pid: 6780, name: 'Code.exe', user: 'User', type: 'user' },
  { pid: 6820, name: 'Code.exe', user: 'User', type: 'user' },
  { pid: 7100, name: 'node.exe', user: 'User', type: 'user' },
  { pid: 7340, name: 'Teams.exe', user: 'User', type: 'user' },
  { pid: 7540, name: 'Malwarebytes.exe', user: 'User', type: 'user' },
  { pid: 7788, name: 'OneDrive.exe', user: 'User', type: 'user' },
];

function buildProcs(): Proc[] {
  return BASE_PROCS.map(p => ({
    ...p,
    cpu: p.type === 'system' ? 0 : p.name === 'cs2.exe' ? +(Math.random() * 30 + 15).toFixed(1) : p.name === 'chrome.exe' ? +(Math.random() * 5).toFixed(1) : +(Math.random() * 2).toFixed(1),
    mem: p.name === 'cs2.exe' ? Math.floor(Math.random() * 500 + 3000) : p.name === 'chrome.exe' ? Math.floor(Math.random() * 200 + 200) : Math.floor(Math.random() * 80 + 20),
  }));
}

type Tab = 'Processes' | 'Services' | 'Network' | 'Disk';

export default function ProcessHacker() {
  const [tab, setTab] = useState<Tab>('Processes');
  const [procs, setProcs] = useState<Proc[]>(buildProcs());
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setProcs(buildProcs()), 1000);
    return () => clearInterval(id);
  }, []);

  const totalCpu = procs.reduce((s, p) => s + p.cpu, 0).toFixed(1);
  const totalMem = procs.reduce((s, p) => s + p.mem, 0);

  const displayed = tab === 'Processes' ? procs : tab === 'Services' ? procs.filter(p => p.type === 'service' || p.type === 'system') : procs.slice(0, 10);

  return (
    <div className="ph-root">
      <div className="ph-toolbar">
        <button className="ph-btn">🔄 Refresh</button>
        <button className="ph-btn">⬛ End Process</button>
        <button className="ph-btn">🔍 Find Handles</button>
        <button className="ph-btn">📊 Properties</button>
        <button className="ph-btn" style={{ marginLeft: 'auto' }}>⚙️ Options</button>
      </div>
      <div className="ph-tabs">
        {(['Processes','Services','Network','Disk'] as Tab[]).map(t => (
          <div key={t} className={`ph-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>
      <div className="ph-col-headers">
        <span className="ph-col-name">Name</span>
        <span className="ph-col-pid">PID</span>
        <span className="ph-col-cpu">CPU %</span>
        <span className="ph-col-mem">Memory</span>
        <span className="ph-col-user">User</span>
      </div>
      <div className="ph-list">
        {displayed.map(p => (
          <div
            key={`${p.pid}-${p.name}`}
            className={`ph-row ${p.type === 'system' ? 'system' : ''} ${p.cpu > 10 ? 'highlighted' : ''} ${selected === p.pid ? 'selected' : ''}`}
            onClick={() => setSelected(p.pid)}
          >
            <span className="ph-col-name">{p.name}</span>
            <span className="ph-col-pid">{p.pid}</span>
            <span className="ph-col-cpu" style={{ color: p.cpu > 20 ? '#f44336' : p.cpu > 5 ? '#ff9800' : '#4caf50' }}>{p.cpu.toFixed(1)}</span>
            <span className="ph-col-mem">{p.mem.toLocaleString()} K</span>
            <span className="ph-col-user">{p.user}</span>
          </div>
        ))}
      </div>
      <div className="ph-status">
        <span>Processes: {procs.length}</span>
        <span>CPU: {totalCpu}%</span>
        <span>Physical memory: {(totalMem / 1024).toFixed(0)} MB / 16384 MB</span>
      </div>
    </div>
  );
}
