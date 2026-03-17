import { useState, useEffect, useRef } from 'react';
import './TaskManager.css';

interface Metrics {
  cpu: number;
  ram: number;
  ramTotal: number;
  disk: number;
  network: number;
}

const HISTORY_LEN = 60;

function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics>({ cpu: 5, ram: 1250, ramTotal: 16384, disk: 2, network: 0 });
  const [history, setHistory] = useState<Record<keyof Metrics, number[]>>({
    cpu: Array(HISTORY_LEN).fill(0),
    ram: Array(HISTORY_LEN).fill(0),
    ramTotal: Array(HISTORY_LEN).fill(0),
    disk: Array(HISTORY_LEN).fill(0),
    network: Array(HISTORY_LEN).fill(0),
  });
  const diskRef = useRef(2);
  const netRef = useRef(0);

  useEffect(() => {
    let lastTime = performance.now();
    let cpuEstimate = 5;
    const interval = setInterval(() => {
      const now = performance.now();
      const elapsed = now - lastTime;
      const overhead = Math.max(0, elapsed - 1000);
      cpuEstimate = Math.min(100, Math.max(1, cpuEstimate * 0.7 + (overhead / 10) * 0.3 + Math.random() * 4));
      lastTime = now;
      let ramUsed = 0, ramTotal = 16384;
      if ((performance as any).memory) {
        ramUsed = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
        ramTotal = Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024);
      } else {
        ramUsed = 1200 + Math.round(Math.random() * 80);
        ramTotal = 16384;
      }
      diskRef.current = Math.max(0, Math.min(100, diskRef.current + (Math.random() - 0.5) * 5));
      let networkMbps = 0;
      if ((navigator as any).connection?.downlink) {
        networkMbps = (navigator as any).connection.downlink;
      } else {
        netRef.current = Math.max(0, Math.min(100, netRef.current + (Math.random() - 0.48) * 3));
        networkMbps = netRef.current;
      }
      const newMetrics = { cpu: Math.round(cpuEstimate), ram: ramUsed, ramTotal, disk: Math.round(diskRef.current), network: Math.round(networkMbps * 10) / 10 };
      setMetrics(newMetrics);
      setHistory(h => {
        const next = { ...h };
        (Object.keys(next) as (keyof Metrics)[]).forEach(k => { next[k] = [...next[k].slice(1), newMetrics[k]]; });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return { metrics, history };
}

function MiniGraph({ values, color, max }: { values: number[]; color: string; max: number }) {
  const width = 200, height = 60;
  const pts = values.map((v, i) => `${(i / (HISTORY_LEN - 1)) * width},${height - (v / max) * height}`).join(' ');
  const area = `${pts} ${width},${height} 0,${height}`;
  return (
    <svg width={width} height={height} className="tm-graph">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#grad-${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function MetricCard({ label, value, unit, color, history, max, detail }: {
  label: string; value: number; unit: string; color: string;
  history: number[]; max: number; detail?: string;
}) {
  return (
    <div className="tm-card">
      <div className="tm-card-header">
        <span className="tm-card-label">{label}</span>
        <span className="tm-card-value" style={{ color }}>{value}{unit}</span>
      </div>
      <MiniGraph values={history} color={color} max={max} />
      {detail && <div className="tm-card-detail">{detail}</div>}
    </div>
  );
}

const processes = [
  { name: 'System', pid: 4, cpu: 0.1, ram: 12, status: 'Running', type: 'System' },
  { name: 'explorer.exe', pid: 1024, cpu: 0.5, ram: 48, status: 'Running', type: 'Windows process' },
  { name: 'win10-app (Browser)', pid: 2048, cpu: 1.2, ram: 128, status: 'Running', type: 'App' },
  { name: 'svchost.exe', pid: 892, cpu: 0.0, ram: 18, status: 'Running', type: 'Windows process' },
  { name: 'svchost.exe', pid: 1140, cpu: 0.2, ram: 24, status: 'Running', type: 'Windows process' },
  { name: 'svchost.exe', pid: 1264, cpu: 0.0, ram: 16, status: 'Running', type: 'Windows process' },
  { name: 'RuntimeBroker.exe', pid: 1512, cpu: 0.0, ram: 22, status: 'Running', type: 'Windows process' },
  { name: 'SearchIndexer.exe', pid: 2304, cpu: 0.3, ram: 35, status: 'Running', type: 'Windows process' },
  { name: 'dwm.exe', pid: 788, cpu: 0.8, ram: 56, status: 'Running', type: 'Windows process' },
  { name: 'winlogon.exe', pid: 620, cpu: 0.0, ram: 8, status: 'Running', type: 'Windows process' },
  { name: 'csrss.exe', pid: 548, cpu: 0.1, ram: 6, status: 'Running', type: 'Windows process' },
  { name: 'lsass.exe', pid: 700, cpu: 0.0, ram: 14, status: 'Running', type: 'Windows process' },
  { name: 'spoolsv.exe', pid: 1388, cpu: 0.0, ram: 10, status: 'Running', type: 'Windows process' },
  { name: 'taskhostw.exe', pid: 3096, cpu: 0.1, ram: 9, status: 'Running', type: 'Windows process' },
  { name: 'conhost.exe', pid: 3456, cpu: 0.0, ram: 5, status: 'Running', type: 'Windows process' },
  { name: 'MsMpEng.exe', pid: 4120, cpu: 0.4, ram: 62, status: 'Running', type: 'Windows process' },
  { name: 'ShellExperienceHost.exe', pid: 4680, cpu: 0.1, ram: 28, status: 'Running', type: 'Windows process' },
  { name: 'SearchApp.exe', pid: 5012, cpu: 0.0, ram: 38, status: 'Suspended', type: 'Windows process' },
  { name: 'WmiPrvSE.exe', pid: 3728, cpu: 0.0, ram: 8, status: 'Running', type: 'Windows process' },
];

const startupApps = [
  { name: 'Discord', publisher: 'Discord Inc.', status: 'Enabled', impact: 'High', startTime: '0.8s' },
  { name: 'Spotify', publisher: 'Spotify AB', status: 'Enabled', impact: 'Medium', startTime: '0.5s' },
  { name: 'Steam', publisher: 'Valve Corporation', status: 'Enabled', impact: 'High', startTime: '1.2s' },
  { name: 'OneDrive', publisher: 'Microsoft Corporation', status: 'Enabled', impact: 'Low', startTime: '0.2s' },
  { name: 'Microsoft Teams', publisher: 'Microsoft Corporation', status: 'Disabled', impact: 'High', startTime: '—' },
  { name: 'Zoom', publisher: 'Zoom Video Communications', status: 'Disabled', impact: 'Medium', startTime: '—' },
  { name: 'Adobe Creative Cloud', publisher: 'Adobe Inc.', status: 'Enabled', impact: 'Medium', startTime: '0.6s' },
  { name: 'NVIDIA GeForce Experience', publisher: 'NVIDIA Corporation', status: 'Enabled', impact: 'Low', startTime: '0.3s' },
];

const users = [
  { name: 'User', id: 0, status: 'Active', cpu: '1.5%', ram: '128 MB', pid: 2048 },
  { name: 'SYSTEM', id: 1, status: 'System', cpu: '0.3%', ram: '45 MB', pid: 4 },
  { name: 'LOCAL SERVICE', id: 2, status: 'Service', cpu: '0.0%', ram: '12 MB', pid: 892 },
  { name: 'NETWORK SERVICE', id: 3, status: 'Service', cpu: '0.0%', ram: '8 MB', pid: 1140 },
];

const services = [
  { name: 'AudioSrv', displayName: 'Windows Audio', status: 'Running', startType: 'Auto', pid: 1264 },
  { name: 'BFE', displayName: 'Base Filtering Engine', status: 'Running', startType: 'Auto', pid: 892 },
  { name: 'BrokerInfrastructure', displayName: 'Background Tasks Infrastructure', status: 'Running', startType: 'Auto', pid: 788 },
  { name: 'DcomLaunch', displayName: 'DCOM Server Process Launcher', status: 'Running', startType: 'Auto', pid: 548 },
  { name: 'Dhcp', displayName: 'DHCP Client', status: 'Running', startType: 'Auto', pid: 892 },
  { name: 'Dnscache', displayName: 'DNS Client', status: 'Running', startType: 'Auto', pid: 1264 },
  { name: 'Eventlog', displayName: 'Windows Event Log', status: 'Running', startType: 'Auto', pid: 892 },
  { name: 'MpsSvc', displayName: 'Windows Defender Firewall', status: 'Running', startType: 'Auto', pid: 1264 },
  { name: 'NetLogon', displayName: 'Netlogon', status: 'Stopped', startType: 'Manual', pid: null },
  { name: 'Print Spooler', displayName: 'Print Spooler', status: 'Running', startType: 'Auto', pid: 1388 },
  { name: 'RpcSs', displayName: 'Remote Procedure Call', status: 'Running', startType: 'Auto', pid: 892 },
  { name: 'Schedule', displayName: 'Task Scheduler', status: 'Running', startType: 'Auto', pid: 892 },
  { name: 'SysMain', displayName: 'SysMain (Superfetch)', status: 'Running', startType: 'Auto', pid: 1512 },
  { name: 'Themes', displayName: 'Themes', status: 'Running', startType: 'Auto', pid: 788 },
  { name: 'W32Time', displayName: 'Windows Time', status: 'Stopped', startType: 'Manual', pid: null },
  { name: 'WinDefend', displayName: 'Windows Defender Antivirus', status: 'Running', startType: 'Auto', pid: 4120 },
  { name: 'Winmgmt', displayName: 'Windows Management Instrumentation', status: 'Running', startType: 'Auto', pid: 3728 },
  { name: 'wuauserv', displayName: 'Windows Update', status: 'Stopped', startType: 'Manual', pid: null },
];

type Tab = 'performance' | 'processes' | 'startup' | 'users' | 'details' | 'services';

export default function TaskManager() {
  const { metrics, history } = useMetrics();
  const [tab, setTab] = useState<Tab>('performance');
  const [procSort, setProcSort] = useState<'name' | 'cpu' | 'ram'>('cpu');
  const [startupList, setStartupList] = useState(startupApps);

  const ramPct = Math.round((metrics.ram / metrics.ramTotal) * 100);

  const sortedProcs = [...processes].sort((a, b) => {
    if (procSort === 'name') return a.name.localeCompare(b.name);
    if (procSort === 'cpu') return b.cpu - a.cpu;
    return b.ram - a.ram;
  });

  const toggleStartup = (name: string) => {
    setStartupList(list => list.map(s => s.name === name ? { ...s, status: s.status === 'Enabled' ? 'Disabled' : 'Enabled', startTime: s.status === 'Enabled' ? '—' : '0.5s' } : s));
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'processes', label: 'Processes' },
    { id: 'performance', label: 'Performance' },
    { id: 'startup', label: 'Startup' },
    { id: 'users', label: 'Users' },
    { id: 'details', label: 'Details' },
    { id: 'services', label: 'Services' },
  ];

  return (
    <div className="task-manager">
      <div className="tm-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`tm-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === 'performance' && (
        <div className="tm-performance">
          <MetricCard label="CPU" value={metrics.cpu} unit="%" color="#00b4d8" history={history.cpu} max={100} detail="Intel Core i7-12700K — 12 cores, 20 threads" />
          <MetricCard label="Memory" value={ramPct} unit="%" color="#7b2d8b" history={history.ram.map(v => (v / metrics.ramTotal) * 100)} max={100} detail={`${metrics.ram} MB / ${metrics.ramTotal} MB (DDR5-5600)`} />
          <MetricCard label="Disk" value={metrics.disk} unit="%" color="#f4a261" history={history.disk} max={100} detail="C: — Samsung 980 Pro 1TB NVMe SSD" />
          <MetricCard label="Network" value={metrics.network} unit=" Mbps" color="#2dc653" history={history.network} max={100} detail="Ethernet — Intel I225-V 2.5Gb" />
          <div className="tm-card">
            <div className="tm-card-header"><span className="tm-card-label">GPU</span><span className="tm-card-value" style={{ color: '#ff9f43' }}>{Math.round(metrics.cpu * 0.4 + 6)}%</span></div>
            <div className="tm-card-detail">NVIDIA GeForce RTX 4070 — 12 GB GDDR6X</div>
            <div className="tm-gpu-bar"><div className="tm-gpu-fill" style={{ width: `${Math.round(metrics.cpu * 0.4 + 6)}%` }} /></div>
          </div>
        </div>
      )}

      {tab === 'processes' && (
        <div className="tm-processes">
          <div className="tm-proc-header">
            <span className="tm-proc-col-name" onClick={() => setProcSort('name')} style={{ cursor: 'pointer', color: procSort === 'name' ? '#00b4d8' : '' }}>Name ▲</span>
            <span>Status</span>
            <span onClick={() => setProcSort('cpu')} style={{ cursor: 'pointer', color: procSort === 'cpu' ? '#00b4d8' : '' }}>CPU</span>
            <span onClick={() => setProcSort('ram')} style={{ cursor: 'pointer', color: procSort === 'ram' ? '#00b4d8' : '' }}>Memory</span>
            <span>Type</span>
          </div>
          <div className="tm-proc-list">
            {sortedProcs.map(p => (
              <div key={`${p.pid}-${p.name}`} className="tm-proc-row tm-proc-row-5">
                <span>⚙️ {p.name}</span>
                <span className={`tm-status tm-status-${p.status.toLowerCase()}`}>{p.status}</span>
                <span style={{ color: p.cpu > 0.5 ? '#00b4d8' : '' }}>{(p.cpu + Math.random() * 0.1).toFixed(1)}%</span>
                <span>{p.ram} MB</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{p.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'startup' && (
        <div className="tm-startup">
          <div className="tm-startup-header">
            <span>Name</span><span>Publisher</span><span>Status</span><span>Startup impact</span><span>Startup time</span>
          </div>
          <div className="tm-startup-list">
            {startupList.map(s => (
              <div key={s.name} className="tm-startup-row">
                <span>{s.name}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{s.publisher}</span>
                <span className={`tm-startup-status ${s.status === 'Enabled' ? 'enabled' : 'disabled'}`}>{s.status}</span>
                <span className={`tm-impact tm-impact-${s.impact.toLowerCase()}`}>{s.impact}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{s.startTime}</span>
                <button className="tm-startup-toggle" onClick={() => toggleStartup(s.name)}>
                  {s.status === 'Enabled' ? 'Disable' : 'Enable'}
                </button>
              </div>
            ))}
          </div>
          <div className="tm-startup-info">
            <span>Last BIOS time: <strong>3.2 s</strong></span>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="tm-users">
          <div className="tm-users-header"><span>User</span><span>ID</span><span>Status</span><span>CPU</span><span>Memory</span></div>
          <div className="tm-users-list">
            {users.map(u => (
              <div key={u.id} className="tm-users-row">
                <span>👤 {u.name}</span>
                <span>{u.id}</span>
                <span className={`tm-status ${u.status === 'Active' ? 'tm-status-running' : 'tm-status-system'}`}>{u.status}</span>
                <span>{u.cpu}</span>
                <span>{u.ram}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'details' && (
        <div className="tm-details">
          <div className="tm-details-header"><span>Name</span><span>PID</span><span>Status</span><span>CPU</span><span>Memory</span><span>Description</span></div>
          <div className="tm-details-list">
            {processes.map(p => (
              <div key={`${p.pid}-${p.name}-det`} className="tm-details-row">
                <span>{p.name}</span>
                <span>{p.pid}</span>
                <span className={`tm-status ${p.status === 'Running' ? 'tm-status-running' : 'tm-status-suspended'}`}>{p.status}</span>
                <span>{p.cpu.toFixed(1)}%</span>
                <span>{p.ram} MB</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{p.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'services' && (
        <div className="tm-services">
          <div className="tm-services-header"><span>Name</span><span>PID</span><span>Description</span><span>Status</span><span>Startup type</span></div>
          <div className="tm-services-list">
            {services.map(s => (
              <div key={s.name} className="tm-services-row">
                <span>{s.name}</span>
                <span>{s.pid ?? '—'}</span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{s.displayName}</span>
                <span className={`tm-svc-status ${s.status === 'Running' ? 'running' : 'stopped'}`}>{s.status}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{s.startType}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tm-statusbar">
        <span>Processes: {processes.length}</span>
        <span>CPU: {metrics.cpu}%</span>
        <span>RAM: {metrics.ram} MB / {metrics.ramTotal} MB</span>
        <span>Uptime: 3:12:45</span>
      </div>
    </div>
  );
}
