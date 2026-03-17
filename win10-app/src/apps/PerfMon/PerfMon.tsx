import { useState, useEffect, useRef, useCallback } from 'react';
import './PerfMon.css';

interface Counter {
  id: number;
  name: string;
  instance: string;
  color: string;
  scale: string;
  enabled: boolean;
}

type DataPoint = { cpu: number; mem: number; disk: number; net: number };
const HISTORY = 120;

const COUNTER_COLORS = ['#00b4d8', '#7b2d8b', '#f4a261', '#2dc653', '#ff6b35', '#e91e63', '#9c27b0', '#00bcd4'];

const DEFAULT_COUNTERS: Counter[] = [
  { id: 1, name: '% Processor Time',   instance: '_Total', color: '#00b4d8', scale: '1.0', enabled: true },
  { id: 2, name: '% Committed Bytes In Use', instance: '',    color: '#7b2d8b', scale: '1.0', enabled: true },
  { id: 3, name: '% Disk Time',         instance: '_Total', color: '#f4a261', scale: '1.0', enabled: true },
  { id: 4, name: 'Bytes Total/sec',     instance: 'Local Area Connection', color: '#2dc653', scale: '1.0', enabled: true },
];

const ADD_COUNTER_OPTIONS = [
  'Processor\\% Processor Time',
  'Memory\\% Committed Bytes In Use',
  'Memory\\Available MBytes',
  'PhysicalDisk\\% Disk Time',
  'PhysicalDisk\\Disk Read Bytes/sec',
  'PhysicalDisk\\Disk Write Bytes/sec',
  'Network Interface\\Bytes Total/sec',
  'Network Interface\\Bytes Sent/sec',
  'Network Interface\\Bytes Received/sec',
  'Process\\% Processor Time',
  'Process\\Working Set',
  'System\\Context Switches/sec',
  'System\\Processor Queue Length',
  'TCPv4\\Connections Established',
  'GPU Engine\\% Utilization',
];

function genData(prev: DataPoint): DataPoint {
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  return {
    cpu:  clamp(prev.cpu  + (Math.random() - 0.48) * 8, 2, 98),
    mem:  clamp(prev.mem  + (Math.random() - 0.5)  * 3, 20, 95),
    disk: clamp(prev.disk + (Math.random() - 0.5)  * 15, 0, 100),
    net:  clamp(prev.net  + (Math.random() - 0.5)  * 12, 0, 100),
  };
}

export default function PerfMon() {
  const [data, setData] = useState<DataPoint[]>(() => {
    const initial: DataPoint = { cpu: 8, mem: 35, disk: 5, net: 3 };
    return Array.from({ length: HISTORY }, () => initial);
  });
  const [counters, setCounters] = useState<Counter[]>(DEFAULT_COUNTERS);
  const [selectedNode, setSelectedNode] = useState('perfmon');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addSelection, setAddSelection] = useState('');
  const [running, setRunning] = useState(true);
  const latestRef = useRef<DataPoint>({ cpu: 8, mem: 35, disk: 5, net: 3 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgSize, setSvgSize] = useState({ w: 600, h: 300 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const next = genData(latestRef.current);
      latestRef.current = next;
      setData(prev => [...prev.slice(1), next]);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        setSvgSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const buildPath = useCallback((values: number[], w: number, h: number) => {
    const pts = values.map((v, i) => `${(i / (HISTORY - 1)) * w},${h - (v / 100) * h}`);
    return `M ${pts.join(' L ')}`;
  }, []);

  const buildArea = useCallback((values: number[], w: number, h: number) => {
    const pts = values.map((v, i) => `${(i / (HISTORY - 1)) * w},${h - (v / 100) * h}`);
    return `M 0,${h} L ${pts.join(' L ')} L ${w},${h} Z`;
  }, []);

  const getValues = (counterId: number): number[] => {
    if (counterId === 1) return data.map(d => d.cpu);
    if (counterId === 2) return data.map(d => d.mem);
    if (counterId === 3) return data.map(d => d.disk);
    if (counterId === 4) return data.map(d => d.net);
    return data.map(() => 0);
  };

  const getCurrentVal = (counterId: number): number => {
    const last = data[data.length - 1];
    if (counterId === 1) return Math.round(last.cpu);
    if (counterId === 2) return Math.round(last.mem);
    if (counterId === 3) return Math.round(last.disk);
    if (counterId === 4) return Math.round(last.net);
    return 0;
  };

  const removeCounter = (id: number) => {
    setCounters(cs => cs.filter(c => c.id !== id));
  };

  const toggleCounter = (id: number) => {
    setCounters(cs => cs.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const addCounter = () => {
    if (!addSelection) return;
    const parts = addSelection.split('\\');
    const name = parts[1] || addSelection;
    const newId = Math.max(0, ...counters.map(c => c.id)) + 1;
    setCounters(cs => [...cs, {
      id: newId,
      name,
      instance: '_Total',
      color: COUNTER_COLORS[newId % COUNTER_COLORS.length],
      scale: '1.0',
      enabled: true,
    }]);
    setShowAddDialog(false);
    setAddSelection('');
  };

  const W = svgSize.w;
  const H = svgSize.h;

  return (
    <div className="pm-root">
      {/* Left sidebar */}
      <div className="pm-left">
        <div className="pm-left-title">Performance Monitor</div>
        <div className={`pm-left-item ${selectedNode === 'monitoring' ? 'active' : ''}`} onClick={() => setSelectedNode('monitoring')}>
          📊 Monitoring Tools
        </div>
        <div
          className={`pm-left-item pm-left-child ${selectedNode === 'perfmon' ? 'active' : ''}`}
          onClick={() => setSelectedNode('perfmon')}
        >
          📈 Performance Monitor
        </div>
        <div className={`pm-left-item ${selectedNode === 'dcs' ? 'active' : ''}`} onClick={() => setSelectedNode('dcs')}>
          📁 Data Collector Sets
        </div>
        <div className={`pm-left-item pm-left-child ${selectedNode === 'user' ? 'active' : ''}`} onClick={() => setSelectedNode('user')}>
          👤 User Defined
        </div>
        <div className={`pm-left-item pm-left-child ${selectedNode === 'system' ? 'active' : ''}`} onClick={() => setSelectedNode('system')}>
          🖥️ System
        </div>
        <div className={`pm-left-item ${selectedNode === 'reports' ? 'active' : ''}`} onClick={() => setSelectedNode('reports')}>
          📋 Reports
        </div>
      </div>

      {/* Main area */}
      <div className="pm-main">
        {/* Toolbar */}
        <div className="pm-toolbar">
          <button className="pm-tb-btn" onClick={() => setShowAddDialog(true)} title="Add counters">➕</button>
          <button className="pm-tb-btn" title="Remove selected counter">➖</button>
          <button className="pm-tb-btn" title="Highlight selected counter">✨</button>
          <button className="pm-tb-btn" title="Properties">⚙️</button>
          <div className="pm-tb-sep" />
          <button className="pm-tb-btn" onClick={() => setRunning(r => !r)} title={running ? 'Freeze' : 'Resume'}>
            {running ? '⏸' : '▶'}
          </button>
          <button className="pm-tb-btn" title="Save image">🖼️</button>
          <div className="pm-tb-sep" />
          <span className="pm-toolbar-info">
            {running ? <span className="pm-live">● LIVE</span> : '■ Paused'} &nbsp;|&nbsp; Last 120s &nbsp;|&nbsp; 1s interval
          </span>
        </div>

        {/* Graph area */}
        <div className="pm-chart-wrap" ref={containerRef}>
          {W > 0 && H > 0 && (
            <svg ref={svgRef} width={W} height={H} className="pm-svg">
              {/* Grid */}
              {[0, 25, 50, 75, 100].map(v => {
                const y = H - (v / 100) * H;
                return (
                  <g key={v}>
                    <line x1={0} y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    <text x={4} y={y - 3} fill="rgba(255,255,255,0.4)" fontSize="10">{v}%</text>
                  </g>
                );
              })}
              {/* Counter areas + lines */}
              {counters.filter(c => c.enabled).map(c => {
                const vals = getValues(c.id);
                return (
                  <g key={c.id}>
                    <defs>
                      <linearGradient id={`grad-pm-${c.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c.color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={c.color} stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path d={buildArea(vals, W, H)} fill={`url(#grad-pm-${c.id})`} />
                    <path d={buildPath(vals, W, H)} fill="none" stroke={c.color} strokeWidth="1.5" />
                  </g>
                );
              })}
              {/* Current time marker */}
              <line x1={W - 1} y1={0} x2={W - 1} y2={H} stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4,4" />
            </svg>
          )}
        </div>

        {/* Counter list */}
        <div className="pm-counter-list">
          <div className="pm-counter-header">
            <span />
            <span>Color</span>
            <span>Scale</span>
            <span>Counter</span>
            <span>Instance</span>
            <span>Current</span>
            <span>Average</span>
            <span>Min</span>
            <span>Max</span>
            <span />
          </div>
          {counters.map(c => {
            const vals = getValues(c.id);
            const cur = getCurrentVal(c.id);
            const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
            const min = Math.round(Math.min(...vals));
            const max = Math.round(Math.max(...vals));
            return (
              <div key={c.id} className={`pm-counter-row ${!c.enabled ? 'pm-counter-disabled' : ''}`}>
                <span>
                  <input type="checkbox" checked={c.enabled} onChange={() => toggleCounter(c.id)} />
                </span>
                <span>
                  <span className="pm-counter-swatch" style={{ background: c.color }} />
                </span>
                <span style={{ color: '#aaa', fontSize: 11 }}>{c.scale}</span>
                <span className="pm-counter-name">{c.name}</span>
                <span style={{ color: '#aaa', fontSize: 11 }}>{c.instance || '—'}</span>
                <span style={{ color: c.color, fontWeight: 600 }}>{cur}%</span>
                <span>{avg}%</span>
                <span>{min}%</span>
                <span>{max}%</span>
                <span>
                  <button className="pm-remove-btn" onClick={() => removeCounter(c.id)} title="Remove">✕</button>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Counter Dialog */}
      {showAddDialog && (
        <div className="pm-overlay">
          <div className="pm-add-dialog">
            <div className="pm-add-title">Add Counters</div>
            <div className="pm-add-body">
              <div className="pm-add-label">Select counters from computer:</div>
              <input className="pm-add-comp" value="\\DESKTOP-WIN10" readOnly />
              <div className="pm-add-label" style={{ marginTop: 10 }}>Available counters:</div>
              <div className="pm-add-list">
                {ADD_COUNTER_OPTIONS.map(opt => (
                  <div
                    key={opt}
                    className={`pm-add-item ${addSelection === opt ? 'selected' : ''}`}
                    onClick={() => setAddSelection(opt)}
                    onDoubleClick={() => { setAddSelection(opt); addCounter(); }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </div>
            <div className="pm-add-btns">
              <button className="pm-add-btn pm-add-primary" onClick={addCounter} disabled={!addSelection}>Add &gt;&gt;</button>
              <button className="pm-add-btn" onClick={() => setShowAddDialog(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
