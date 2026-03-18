import { useState, useEffect } from 'react';
import './HWMonitor.css';

interface Sensor { label: string; value: number; unit: string; min: number; max: number; warn: number; crit: number; }
interface Group { name: string; icon: string; sensors: Sensor[]; }

function rand(base: number, variance: number) {
  return +(base + (Math.random() - 0.5) * variance).toFixed(1);
}

function buildSensors(): Group[] {
  return [
    {
      name: 'DESKTOP-WIN10 (Nuvoton NCT6798D)', icon: '🖥️',
      sensors: [
        { label: 'Vcore', value: rand(1.248, 0.02), unit: 'V', min: 1.230, max: 1.272, warn: 1.4, crit: 1.5 },
        { label: '+5V', value: rand(5.04, 0.02), unit: 'V', min: 5.02, max: 5.08, warn: 5.5, crit: 6.0 },
        { label: '+12V', value: rand(12.05, 0.05), unit: 'V', min: 11.98, max: 12.14, warn: 13.0, crit: 14.0 },
        { label: 'AUXTIN0', value: rand(34, 4), unit: '°C', min: 29, max: 38, warn: 70, crit: 85 },
        { label: 'CPU Fan', value: rand(1320, 80), unit: 'RPM', min: 1200, max: 1440, warn: 400, crit: 200 },
        { label: 'Chassis Fan 1', value: rand(980, 60), unit: 'RPM', min: 920, max: 1060, warn: 400, crit: 200 },
      ],
    },
    {
      name: 'Intel Core i7-12700K', icon: '⚙️',
      sensors: [
        { label: 'Core #0', value: rand(58, 8), unit: '°C', min: 42, max: 72, warn: 85, crit: 100 },
        { label: 'Core #1', value: rand(56, 8), unit: '°C', min: 40, max: 70, warn: 85, crit: 100 },
        { label: 'Core #2', value: rand(60, 8), unit: '°C', min: 44, max: 74, warn: 85, crit: 100 },
        { label: 'Core #3', value: rand(55, 8), unit: '°C', min: 39, max: 68, warn: 85, crit: 100 },
        { label: 'Core #4', value: rand(57, 8), unit: '°C', min: 41, max: 71, warn: 85, crit: 100 },
        { label: 'Core #5', value: rand(59, 8), unit: '°C', min: 43, max: 73, warn: 85, crit: 100 },
        { label: 'Package', value: rand(64, 6), unit: '°C', min: 48, max: 76, warn: 90, crit: 100 },
        { label: 'CPU Power', value: rand(68, 10), unit: 'W', min: 52, max: 84, warn: 125, crit: 150 },
      ],
    },
    {
      name: 'NVIDIA GeForce RTX 42069', icon: '🎮',
      sensors: [
        { label: 'GPU Core', value: rand(44, 6), unit: '°C', min: 36, max: 52, warn: 83, crit: 90 },
        { label: 'GPU Memory', value: rand(52, 4), unit: '°C', min: 44, max: 58, warn: 100, crit: 110 },
        { label: 'GPU Core Clock', value: rand(1920, 80), unit: 'MHz', min: 1800, max: 2100, warn: 0, crit: 0 },
        { label: 'GPU Mem Clock', value: rand(5251, 50), unit: 'MHz', min: 5000, max: 5400, warn: 0, crit: 0 },
        { label: 'GPU Fan', value: rand(1540, 120), unit: 'RPM', min: 1200, max: 1800, warn: 300, crit: 100 },
        { label: 'GPU Load', value: rand(22, 15), unit: '%', min: 5, max: 48, warn: 95, crit: 100 },
        { label: 'GPU Power', value: rand(58, 12), unit: 'W', min: 40, max: 80, warn: 200, crit: 220 },
      ],
    },
    {
      name: 'Samsung SSD 970 EVO Plus 512GB', icon: '💾',
      sensors: [
        { label: 'Temperature', value: rand(38, 4), unit: '°C', min: 32, max: 44, warn: 65, crit: 70 },
      ],
    },
    {
      name: 'DDR7 — Samsung 69GB', icon: '🧩',
      sensors: [
        { label: 'Temperature', value: rand(42, 3), unit: '°C', min: 38, max: 46, warn: 85, crit: 95 },
        { label: 'Voltage', value: rand(1.102, 0.005), unit: 'V', min: 1.098, max: 1.108, warn: 1.2, crit: 1.3 },
      ],
    },
  ];
}

function color(val: number, warn: number, crit: number, unit: string) {
  if (unit === 'RPM' || unit === 'V' || unit === 'MHz') return '#333';
  if (crit > 0 && val >= crit) return '#d32f2f';
  if (warn > 0 && val >= warn) return '#f57c00';
  return '#1b5e20';
}

export default function HWMonitor() {
  const [groups, setGroups] = useState<Group[]>(buildSensors);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(buildSensors().map(g => g.name)));

  useEffect(() => {
    const id = setInterval(() => setGroups(buildSensors()), 1500);
    return () => clearInterval(id);
  }, []);

  const toggle = (name: string) => {
    setExpanded(s => {
      const n = new Set(s);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });
  };

  return (
    <div className="hwm-root">
      <div className="hwm-header">
        <span className="hwm-title">HWMonitor</span>
        <span className="hwm-sub">v1.54 — Hardware Monitoring</span>
      </div>
      <div className="hwm-col-headers">
        <span style={{ flex: 1 }}>Sensor</span>
        <span className="hwm-col">Value</span>
        <span className="hwm-col">Min</span>
        <span className="hwm-col">Max</span>
      </div>
      <div className="hwm-tree">
        {groups.map(g => (
          <div key={g.name}>
            <div className="hwm-group-row" onClick={() => toggle(g.name)}>
              <span className="hwm-caret">{expanded.has(g.name) ? '▼' : '▶'}</span>
              <span className="hwm-group-icon">{g.icon}</span>
              <span className="hwm-group-name">{g.name}</span>
            </div>
            {expanded.has(g.name) && g.sensors.map(s => (
              <div key={s.label} className="hwm-sensor-row">
                <span className="hwm-sensor-label">{s.label}</span>
                <span className="hwm-col hwm-val" style={{ color: color(s.value, s.warn, s.crit, s.unit) }}>
                  {s.value} {s.unit}
                </span>
                <span className="hwm-col hwm-minmax">{s.min} {s.unit}</span>
                <span className="hwm-col hwm-minmax" style={{ color: color(s.max, s.warn, s.crit, s.unit) }}>
                  {s.max} {s.unit}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
