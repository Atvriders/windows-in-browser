import { useState, useEffect } from 'react';
import './CrystalDiskInfo.css';

interface Disk {
  id: string; label: string; model: string; serial: string; firmware: string;
  capacity: string; used: string; rotationRate: string; interface: string;
  feature: string; buffer: string; nandType?: string; health: 'Good' | 'Caution' | 'Bad';
  temp: number; powerOnHours: number; powerOnCount: number;
}

const DISKS: Disk[] = [
  {
    id: 'c', label: 'C: [Samsung SSD 990 Pro 512GB]', model: 'Samsung SSD 990 Pro 512GB',
    serial: 'S6BPNS0T123456', firmware: '4B2QFXO7', capacity: '512 GB', used: '346 GB',
    rotationRate: 'SSD', interface: 'NVMe', feature: 'S.M.A.R.T., NCQ, TRIM, VolatileWriteCache',
    buffer: '—', nandType: 'V-NAND 3-bit MLC', health: 'Good', temp: 38, powerOnHours: 2840, powerOnCount: 412,
  },
  {
    id: 'd', label: 'D: [Samsung SSD 990 Pro 2TB]', model: 'Samsung SSD 990 Pro 2TB',
    serial: 'S6BPNS0T789012', firmware: '4B2QFXO7', capacity: '2 TB', used: '1.84 TB',
    rotationRate: 'SSD', interface: 'NVMe', feature: 'S.M.A.R.T., NCQ, TRIM, VolatileWriteCache',
    buffer: '—', nandType: 'V-NAND 3-bit MLC', health: 'Good', temp: 42, powerOnHours: 2840, powerOnCount: 412,
  },
  {
    id: 'e', label: 'E: [WD Black SN850X 2TB]', model: 'WD_BLACK SN850X 2000GB',
    serial: 'WD-WX42A8123456', firmware: '620171WD', capacity: '2 TB', used: '1.72 TB',
    rotationRate: 'SSD', interface: 'NVMe', feature: 'S.M.A.R.T., NCQ, TRIM',
    buffer: '—', nandType: 'BiCS5 3D TLC', health: 'Good', temp: 39, powerOnHours: 1240, powerOnCount: 210,
  },
  {
    id: 'f', label: 'F: [Seagate Barracuda 8TB]', model: 'ST8000DM008-2JJ112',
    serial: 'ZA1E4B2M', firmware: '0001', capacity: '8 TB', used: '6.21 TB',
    rotationRate: '5400 RPM', interface: 'SATA', feature: 'S.M.A.R.T., NCQ',
    buffer: '256 MB', health: 'Good', temp: 34, powerOnHours: 8440, powerOnCount: 1240,
  },
];

const SMART: Record<string, { id: string; name: string; cur: number; wor: number; thr: number; raw: string }[]> = {
  c: [
    { id: '05', name: 'Reallocated Sectors Count', cur: 100, wor: 100, thr: 10, raw: '0000000000' },
    { id: '09', name: 'Power-On Hours', cur: 100, wor: 100, thr: 0, raw: '0000000B18' },
    { id: '0C', name: 'Power Cycle Count', cur: 99, wor: 99, thr: 0, raw: '000000019C' },
    { id: 'AF', name: 'Program Fail Count (Chip)', cur: 100, wor: 100, thr: 10, raw: '0000000000' },
    { id: 'B0', name: 'Erase Fail Count (Chip)', cur: 100, wor: 100, thr: 10, raw: '0000000000' },
    { id: 'B1', name: 'Wear Leveling Count', cur: 98, wor: 98, thr: 0, raw: '00000000CA' },
    { id: 'B3', name: 'Used Reserved Block Count Total', cur: 100, wor: 100, thr: 10, raw: '0000000000' },
    { id: 'B4', name: 'Unused Reserved Block Count Total', cur: 100, wor: 100, thr: 10, raw: '0000000064' },
    { id: 'B5', name: 'Program Fail Count Total', cur: 100, wor: 100, thr: 10, raw: '0000000000' },
    { id: 'B6', name: 'Erase Fail Count Total', cur: 100, wor: 100, thr: 10, raw: '0000000000' },
    { id: 'BB', name: 'Uncorrectable Error Count', cur: 100, wor: 100, thr: 0, raw: '0000000000' },
    { id: 'BE', name: 'Temperature Difference', cur: 62, wor: 37, thr: 0, raw: '002600001A' },
    { id: 'C3', name: 'ECC Error Rate', cur: 200, wor: 200, thr: 0, raw: '0000000000' },
    { id: 'C7', name: 'CRC Error Count', cur: 100, wor: 100, thr: 0, raw: '0000000000' },
    { id: 'EB', name: 'POR Recovery Count', cur: 100, wor: 100, thr: 0, raw: '0000000000' },
    { id: 'F1', name: 'Total LBAs Written', cur: 100, wor: 100, thr: 0, raw: '00B4A29C12' },
    { id: 'F2', name: 'Total LBAs Read', cur: 100, wor: 100, thr: 0, raw: '00C8D44E02' },
  ],
  f: [
    { id: '01', name: 'Read Error Rate', cur: 115, wor: 99, thr: 6, raw: '00071B0000' },
    { id: '03', name: 'Spin-Up Time', cur: 93, wor: 91, thr: 0, raw: '0000000000' },
    { id: '04', name: 'Start/Stop Count', cur: 100, wor: 100, thr: 20, raw: '00000004D8' },
    { id: '05', name: 'Reallocated Sectors Count', cur: 100, wor: 100, thr: 10, raw: '0000000000' },
    { id: '07', name: 'Seek Error Rate', cur: 78, wor: 60, thr: 30, raw: '000C8D4422' },
    { id: '09', name: 'Power-On Hours', cur: 55, wor: 55, thr: 0, raw: '000000EOFC' },
    { id: '0A', name: 'Spin Retry Count', cur: 100, wor: 100, thr: 97, raw: '0000000000' },
    { id: '0B', name: 'Calibration Retry Count', cur: 100, wor: 100, thr: 0, raw: '0000000000' },
    { id: '0C', name: 'Power Cycle Count', cur: 99, wor: 99, thr: 20, raw: '00000004D0' },
    { id: 'BC', name: 'Command Timeout', cur: 100, wor: 100, thr: 0, raw: '0000000000' },
    { id: 'BD', name: 'High Fly Writes', cur: 100, wor: 100, thr: 0, raw: '0000000000' },
    { id: 'BE', name: 'Airflow Temperature Celsius', cur: 66, wor: 48, thr: 45, raw: '0022002108' },
    { id: 'BF', name: 'G-Sense Error Rate', cur: 100, wor: 100, thr: 0, raw: '0000000000' },
    { id: 'C0', name: 'Power-off Retract Count', cur: 100, wor: 100, thr: 0, raw: '000000000C' },
    { id: 'C1', name: 'Load/Unload Cycle Count', cur: 96, wor: 96, thr: 0, raw: '000000359C' },
    { id: 'C2', name: 'Temperature Celsius', cur: 34, wor: 52, thr: 0, raw: '0022001408' },
    { id: 'C5', name: 'Current Pending Sector', cur: 100, wor: 100, thr: 0, raw: '0000000000' },
    { id: 'C6', name: 'Offline Uncorrectable', cur: 100, wor: 100, thr: 0, raw: '0000000000' },
    { id: 'C7', name: 'Ultra DMA CRC Error Count', cur: 200, wor: 200, thr: 0, raw: '0000000000' },
    { id: 'FE', name: 'Free Fall Protection', cur: 100, wor: 100, thr: 0, raw: '0000000000' },
  ],
};

export default function CrystalDiskInfo() {
  const [activeDisk, setActiveDisk] = useState('c');
  const [temps, setTemps] = useState<Record<string, number>>(Object.fromEntries(DISKS.map(d => [d.id, d.temp])));
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 1800); };

  const refreshTemps = () => {
    setTemps(prev => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, v + (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.5 ? 1 : 0)])));
    showToast('Refreshed');
  };

  useEffect(() => {
    const id = setInterval(() => {
      setTemps(prev => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, v + (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.7 ? 1 : 0)])));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const disk = DISKS.find(d => d.id === activeDisk)!;
  const smart = SMART[activeDisk] ?? SMART['c'];
  const temp = temps[activeDisk] ?? disk.temp;

  return (
    <div className="cdi-root">
      {toast && <div style={{ position: 'absolute', top: 8, right: 8, background: '#333', color: '#fff', padding: '5px 10px', borderRadius: 4, fontSize: 11, zIndex: 100 }}>{toast}</div>}
      <div className="cdi-header">
        <span className="cdi-logo">💎 CrystalDiskInfo</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>9.3.2 (C) 2008-2024 hiyohiyo</span>
      </div>
      <div className="cdi-toolbar">
        <button className="cdi-btn" onClick={refreshTemps}>🔄 Refresh</button>
        <button className="cdi-btn" onClick={() => showToast('Graph view — select a S.M.A.R.T. attribute to graph')}>📊 Graph</button>
        <button className="cdi-btn" onClick={() => showToast('Function settings')}>⚙️ Function</button>
        <button className="cdi-btn" onClick={() => showToast(`Current temperatures — ${DISKS.map(d => `${d.label.split('[')[0].trim()}: ${temps[d.id] ?? d.temp}°C`).join(', ')}`)}>🌡️ Temperature</button>
        <button className="cdi-btn" onClick={() => showToast('CrystalDiskInfo v9.3.2 by hiyohiyo')}>❓ Help</button>
      </div>
      <div className="cdi-disks">
        {DISKS.map(d => (
          <div key={d.id} className={`cdi-disk-tab ${activeDisk === d.id ? 'active' : ''}`} onClick={() => setActiveDisk(d.id)}>
            <span>{d.rotationRate === 'SSD' ? '💾' : '🖴'}</span>
            <span style={{ fontSize: 11 }}>{d.label}</span>
            <span className={`cdi-health ${d.health === 'Good' ? 'cdi-good' : 'cdi-caution'}`}>{d.health}</span>
            <span style={{ fontSize: 11, color: '#4fc3f7' }}>{temps[d.id] ?? d.temp}°C</span>
          </div>
        ))}
      </div>
      <div className="cdi-body">
        <div className="cdi-health-box">
          <div className="cdi-health-icon">{disk.health === 'Good' ? '✅' : '⚠️'}</div>
          <div className={`cdi-health-label ${disk.health === 'Good' ? 'cdi-good' : 'cdi-caution'}`}>{disk.health}</div>
          <div className="cdi-health-temp">{temp}°C</div>
          <div className="cdi-health-sub">Power On Hours: {disk.powerOnHours.toLocaleString()}</div>
          <div className="cdi-health-sub">Power On Count: {disk.powerOnCount}</div>
        </div>
        <div className="cdi-info">
          <div className="cdi-section-title">Drive Information</div>
          {[
            ['Model', disk.model],
            ['Serial Number', disk.serial],
            ['Firmware', disk.firmware],
            ['Capacity', disk.capacity],
            ['Interface', disk.interface],
            ['Rotation Rate', disk.rotationRate],
            ['Feature', disk.feature],
            ...(disk.nandType ? [['NAND Type', disk.nandType]] : []),
            ...(disk.buffer !== '—' ? [['Buffer Size', disk.buffer]] : []),
          ].map(([label, value]) => (
            <div key={label} className="cdi-row">
              <span className="cdi-row-label">{label}</span>
              <span className="cdi-row-value">{value}</span>
            </div>
          ))}
          <div className="cdi-section-title" style={{ marginTop: 12 }}>S.M.A.R.T. Attributes</div>
          <div className="cdi-smart">
            <div className="cdi-smart-header">
              <span style={{ width: 8, marginRight: 4 }} />
              <span className="cdi-smart-id">ID</span>
              <span style={{ flex: 1 }}>Attribute Name</span>
              <span className="cdi-smart-cur">Current</span>
              <span className="cdi-smart-wor">Worst</span>
              <span className="cdi-smart-thr">Threshold</span>
              <span className="cdi-smart-raw">Raw Value</span>
            </div>
            {smart.map(s => (
              <div key={s.id} className="cdi-smart-row">
                <div className="cdi-dot" style={{ background: s.cur > s.thr ? '#4caf50' : '#f44336' }} />
                <span className="cdi-smart-id">{s.id}</span>
                <span style={{ flex: 1 }}>{s.name}</span>
                <span className="cdi-smart-cur">{s.cur}</span>
                <span className="cdi-smart-wor">{s.wor}</span>
                <span className="cdi-smart-thr">{s.thr}</span>
                <span className="cdi-smart-raw">{s.raw}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
