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
  const [metrics, setMetrics] = useState<Metrics>({ cpu: 5, ram: 30, ramTotal: 8192, disk: 2, network: 0 });
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
      // CPU: measure how much time JS blocked the event loop
      const now = performance.now();
      const elapsed = now - lastTime;
      const overhead = Math.max(0, elapsed - 1000);
      cpuEstimate = Math.min(100, Math.max(1, cpuEstimate * 0.7 + (overhead / 10) * 0.3 + Math.random() * 4));
      lastTime = now;

      // RAM
      let ramUsed = 0, ramTotal = 8192;
      if ((performance as any).memory) {
        ramUsed = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
        ramTotal = Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024);
      } else {
        ramUsed = 1200 + Math.round(Math.random() * 50);
        ramTotal = 8192;
      }

      // Disk: random walk
      diskRef.current = Math.max(0, Math.min(100, diskRef.current + (Math.random() - 0.5) * 5));

      // Network
      let networkMbps = 0;
      if ((navigator as any).connection?.downlink) {
        networkMbps = (navigator as any).connection.downlink;
      } else {
        netRef.current = Math.max(0, Math.min(100, netRef.current + (Math.random() - 0.48) * 3));
        networkMbps = netRef.current;
      }

      const newMetrics = {
        cpu: Math.round(cpuEstimate),
        ram: ramUsed,
        ramTotal,
        disk: Math.round(diskRef.current),
        network: Math.round(networkMbps * 10) / 10,
      };

      setMetrics(newMetrics);
      setHistory(h => {
        const next = { ...h };
        (Object.keys(next) as (keyof Metrics)[]).forEach(k => {
          next[k] = [...next[k].slice(1), newMetrics[k]];
        });
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
  { name: 'System', pid: 4, cpu: 0.1, ram: 12 },
  { name: 'explorer.exe', pid: 1024, cpu: 0.5, ram: 48 },
  { name: 'win10-app', pid: 2048, cpu: 1.2, ram: 128 },
  { name: 'svchost.exe', pid: 892, cpu: 0.0, ram: 18 },
  { name: 'RuntimeBroker.exe', pid: 1512, cpu: 0.0, ram: 22 },
  { name: 'SearchIndexer.exe', pid: 2304, cpu: 0.3, ram: 35 },
  { name: 'dwm.exe', pid: 788, cpu: 0.8, ram: 56 },
  { name: 'winlogon.exe', pid: 620, cpu: 0.0, ram: 8 },
  { name: 'csrss.exe', pid: 548, cpu: 0.1, ram: 6 },
  { name: 'lsass.exe', pid: 700, cpu: 0.0, ram: 14 },
  { name: 'spoolsv.exe', pid: 1388, cpu: 0.0, ram: 10 },
  { name: 'taskhostw.exe', pid: 3096, cpu: 0.1, ram: 9 },
];

type Tab = 'performance' | 'processes';

export default function TaskManager() {
  const { metrics, history } = useMetrics();
  const [tab, setTab] = useState<Tab>('performance');

  const ramPct = Math.round((metrics.ram / metrics.ramTotal) * 100);

  return (
    <div className="task-manager">
      <div className="tm-tabs">
        <button className={`tm-tab ${tab === 'processes' ? 'active' : ''}`} onClick={() => setTab('processes')}>Processes</button>
        <button className={`tm-tab ${tab === 'performance' ? 'active' : ''}`} onClick={() => setTab('performance')}>Performance</button>
      </div>

      {tab === 'performance' && (
        <div className="tm-performance">
          <MetricCard
            label="CPU" value={metrics.cpu} unit="%" color="#00b4d8"
            history={history.cpu} max={100}
            detail="Intel Core i7 — 8 cores"
          />
          <MetricCard
            label="Memory" value={ramPct} unit="%" color="#7b2d8b"
            history={history.ram.map(v => (v / metrics.ramTotal) * 100)} max={100}
            detail={`${metrics.ram} MB / ${metrics.ramTotal} MB`}
          />
          <MetricCard
            label="Disk" value={metrics.disk} unit="%" color="#f4a261"
            history={history.disk} max={100}
            detail="C: — SSD"
          />
          <MetricCard
            label="Network" value={metrics.network} unit=" Mbps" color="#2dc653"
            history={history.network} max={100}
            detail="Ethernet"
          />
        </div>
      )}

      {tab === 'processes' && (
        <div className="tm-processes">
          <div className="tm-proc-header">
            <span>Name</span><span>PID</span><span>CPU</span><span>Memory</span>
          </div>
          <div className="tm-proc-list">
            {processes.map(p => (
              <div key={p.pid} className="tm-proc-row">
                <span>⚙️ {p.name}</span>
                <span>{p.pid}</span>
                <span>{(p.cpu + Math.random() * 0.1).toFixed(1)}%</span>
                <span>{p.ram} MB</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tm-statusbar">
        CPU: {metrics.cpu}% &nbsp;|&nbsp; RAM: {metrics.ram}MB &nbsp;|&nbsp; Processes: {processes.length}
      </div>
    </div>
  );
}
