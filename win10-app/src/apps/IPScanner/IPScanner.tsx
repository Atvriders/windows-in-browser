import { useState, useRef } from 'react';
import { useWindowStore } from '../../store/useWindowStore';
import './IPScanner.css';

// These IPs match the 192.168.1.x subnet shown in CMD ipconfig (gateway .1, this PC .105)
const NETWORK_DEVICES = [
  { ip: '192.168.1.1',   hostname: 'TP-Link_AX3000',       mac: 'A0:F3:C1:22:4B:80', vendor: 'TP-Link Technologies',    type: 'Router',          icon: '📡', ports: [80, 443, 53] },
  { ip: '192.168.1.2',   hostname: 'DESKTOP-WIN10',         mac: 'B4:D1:3A:F2:0C:44', vendor: 'ASUSTeK Computer',        type: 'Desktop PC',      icon: '🖥️', ports: [80, 445, 3389] },
  { ip: '192.168.1.100', hostname: 'iPhone-15-Pro',         mac: 'CE:A3:12:77:B1:09', vendor: 'Apple Inc.',              type: 'Smartphone',      icon: '📱', ports: [62078] },
  { ip: '192.168.1.101', hostname: 'Galaxy-S24',            mac: 'D4:E8:53:44:29:CC', vendor: 'Samsung Electronics',    type: 'Smartphone',      icon: '📱', ports: [5555] },
  { ip: '192.168.1.102', hostname: 'MacBook-Pro-M3',        mac: 'F0:18:98:B2:3D:E1', vendor: 'Apple Inc.',              type: 'Laptop',          icon: '💻', ports: [22, 548] },
  { ip: '192.168.1.103', hostname: 'PlayStation5',          mac: '00:D9:D1:AF:64:2C', vendor: 'Sony Interactive Ent.',   type: 'Game Console',    icon: '🎮', ports: [1935, 3478] },
  { ip: '192.168.1.104', hostname: 'Xbox-Series-X',         mac: '00:25:AE:C0:99:11', vendor: 'Microsoft Corp.',         type: 'Game Console',    icon: '🎮', ports: [3074] },
  { ip: '192.168.1.105', hostname: 'DESKTOP-MAIN',          mac: 'B8:27:EB:4A:11:22', vendor: 'ASUSTeK Computer',        type: 'This PC',         icon: '🖥️', ports: [80, 139, 445] },
  { ip: '192.168.1.106', hostname: 'LAPTOP-WORK',           mac: 'A8:5C:2C:D3:44:FA', vendor: 'Dell Inc.',               type: 'Laptop',          icon: '💻', ports: [22, 80] },
  { ip: '192.168.1.107', hostname: 'iPad-Pro-12-9',         mac: '78:4F:43:B1:22:CD', vendor: 'Apple Inc.',              type: 'Tablet',          icon: '📱', ports: [62078] },
  { ip: '192.168.1.108', hostname: 'Surface-Pro-9',         mac: '3C:77:E6:AD:15:88', vendor: 'Microsoft Corp.',         type: 'Laptop',          icon: '💻', ports: [80, 445] },
  { ip: '192.168.1.109', hostname: 'Mac-mini-M4',           mac: 'AC:BC:32:D4:E1:02', vendor: 'Apple Inc.',              type: 'Desktop PC',      icon: '🖥️', ports: [22, 548, 80] },
  { ip: '192.168.1.110', hostname: 'Chromecast-4K',         mac: '54:60:09:E7:2A:FF', vendor: 'Google LLC',              type: 'Streaming Device',icon: '📡', ports: [8008, 8009] },
  { ip: '192.168.1.111', hostname: 'Chromecast-Bedroom',    mac: '54:60:09:E8:3B:00', vendor: 'Google LLC',              type: 'Streaming Device',icon: '📡', ports: [8008, 8009] },
  { ip: '192.168.1.112', hostname: 'Fire-TV-Stick-4K',      mac: 'FC:A6:21:B3:44:10', vendor: 'Amazon Technologies',     type: 'Streaming Device',icon: '📺', ports: [4070] },
  { ip: '192.168.1.113', hostname: 'Samsung-TV-75-QLED',    mac: 'C4:57:6E:A2:11:FF', vendor: 'Samsung Electronics',    type: 'Smart TV',        icon: '📺', ports: [8001, 9197] },
  { ip: '192.168.1.115', hostname: 'Echo-Dot-4th-Gen',      mac: '68:37:E9:3B:CC:12', vendor: 'Amazon Technologies',     type: 'Smart Speaker',   icon: '🔊', ports: [4070] },
  { ip: '192.168.1.116', hostname: 'Echo-Studio',           mac: '40:B4:CD:72:AA:31', vendor: 'Amazon Technologies',     type: 'Smart Speaker',   icon: '🔊', ports: [4070] },
  { ip: '192.168.1.120', hostname: 'Ring-Doorbell-Pro2',    mac: 'B0:C5:54:12:AB:33', vendor: 'Ring LLC (Amazon)',       type: 'IoT Camera',      icon: '🔔', ports: [443] },
  { ip: '192.168.1.121', hostname: 'Ring-Floodlight-Cam',   mac: 'B0:C5:54:22:BC:44', vendor: 'Ring LLC (Amazon)',       type: 'IoT Camera',      icon: '🔔', ports: [443] },
  { ip: '192.168.1.125', hostname: 'Nest-Thermostat-G4',    mac: '18:B4:30:9A:6D:77', vendor: 'Google Nest',             type: 'Smart Home',      icon: '🌡️', ports: [9543] },
  { ip: '192.168.1.126', hostname: 'Nest-Cam-Backyard',     mac: '18:B4:30:AB:7E:88', vendor: 'Google Nest',             type: 'IoT Camera',      icon: '📷', ports: [443] },
  { ip: '192.168.1.130', hostname: 'HP-LaserJet-MFP-479',   mac: 'A4:5D:36:70:44:BB', vendor: 'HP Inc.',                 type: 'Printer',         icon: '🖨️', ports: [80, 631, 9100] },
  { ip: '192.168.1.135', hostname: 'Canon-PIXMA-TS9120',    mac: 'A8:9C:ED:11:CC:55', vendor: 'Canon Inc.',              type: 'Printer',         icon: '🖨️', ports: [80, 631, 9100] },
  { ip: '192.168.1.140', hostname: 'raspberrypi',           mac: 'DC:A6:32:11:22:33', vendor: 'Raspberry Pi Foundation', type: 'SBC',             icon: '🍓', ports: [22, 80, 5900] },
  { ip: '192.168.1.150', hostname: 'SynologyNAS-DS920',     mac: '00:11:32:BC:AA:EE', vendor: 'Synology Inc.',           type: 'NAS',             icon: '💾', ports: [5000, 5001, 22, 445] },
  { ip: '192.168.1.151', hostname: 'UnraidServer',          mac: '04:D4:C4:88:11:22', vendor: 'Super Micro Computer',    type: 'Server',          icon: '🖥️', ports: [80, 22, 445] },
  { ip: '192.168.1.160', hostname: 'Philips-Hue-Bridge',    mac: 'EC:B5:FA:AB:CD:EF', vendor: 'Signify Netherlands',     type: 'Smart Home Hub',  icon: '💡', ports: [80, 443] },
  { ip: '192.168.1.161', hostname: 'WeMo-Smart-Plug',       mac: '50:D4:F7:44:22:11', vendor: 'Belkin International',    type: 'Smart Plug',      icon: '🔌', ports: [49153] },
  { ip: '192.168.1.162', hostname: 'Kasa-Smart-Switch',     mac: '50:C7:BF:22:33:44', vendor: 'TP-Link Technologies',    type: 'Smart Switch',    icon: '🔌', ports: [9999] },
];

interface ScanDevice { ip: string; hostname: string; mac: string; vendor: string; type: string; icon: string; ports: number[]; latency: number; }

export default function IPScanner() {
  const { openWindow } = useWindowStore();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIp, setCurrentIp] = useState('');
  const [found, setFound] = useState<ScanDevice[]>([]);
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<ScanDevice | null>(null);
  const [filter, setFilter] = useState('');
  const timerRef = useRef<number | null>(null);

  const startScan = () => {
    setScanning(true);
    setFound([]);
    setDone(false);
    setProgress(0);
    setSelected(null);

    const total = 254;
    let idx = 1;
    const devSet = new Set(NETWORK_DEVICES.map(d => d.ip));
    const discovered: ScanDevice[] = [];

    timerRef.current = window.setInterval(() => {
      const ip = `192.168.1.${idx}`;
      setCurrentIp(ip);
      setProgress(Math.round((idx / total) * 100));

      if (devSet.has(ip)) {
        const dev = NETWORK_DEVICES.find(d => d.ip === ip)!;
        const entry: ScanDevice = { ...dev, latency: Math.floor(Math.random() * 8) + 1 };
        discovered.push(entry);
        setFound([...discovered]);
      }

      idx++;
      if (idx > total) {
        clearInterval(timerRef.current!);
        setScanning(false);
        setDone(true);
      }
    }, 12); // ~3 seconds for full scan
  };

  const openInBrowser = (ip: string) => {
    openWindow('browser', `http://${ip}`, { url: `http://${ip}` });
  };

  const filtered = found.filter(d =>
    !filter || d.ip.includes(filter) || d.hostname.toLowerCase().includes(filter.toLowerCase()) ||
    d.vendor.toLowerCase().includes(filter.toLowerCase()) || d.type.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="ips-root">
      {/* Header */}
      <div className="ips-header">
        <div className="ips-logo">
          <span className="ips-logo-icon">📡</span>
          <div>
            <div className="ips-logo-title">Advanced IP Scanner</div>
            <div className="ips-logo-sub">Network Scanner v2.5.4</div>
          </div>
        </div>
        <div className="ips-controls">
          <input
            className="ips-range-input"
            defaultValue="192.168.1.1 - 192.168.1.254"
            readOnly
          />
          <button className="ips-scan-btn" onClick={() => {
            if (scanning) { if (timerRef.current !== null) clearInterval(timerRef.current); setScanning(false); }
            else startScan();
          }}>
            {scanning ? '⏹ Stop' : '▶ Scan'}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="ips-progress-bar">
        <div className="ips-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="ips-status-bar">
        {scanning ? (
          <span>Scanning: <strong>{currentIp}</strong> · {found.length} devices found · {progress}% complete</span>
        ) : done ? (
          <span>Scan complete · <strong>{found.length}</strong> devices found on 192.168.1.x/24</span>
        ) : (
          <span>Ready · Range: 192.168.1.1 – 192.168.1.254 (254 hosts)</span>
        )}
        <input
          className="ips-filter"
          placeholder="Filter..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      {/* Results table */}
      <div className="ips-body">
        <div className="ips-table-wrap">
          <table className="ips-table">
            <thead>
              <tr>
                <th></th><th>Status</th><th>IP Address</th><th>Hostname</th>
                <th>Ping</th><th>MAC Address</th><th>Vendor</th><th>Type</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(dev => (
                <tr
                  key={dev.ip}
                  className={`ips-row ${selected?.ip === dev.ip ? 'selected' : ''} ${dev.type === 'This PC' ? 'this-pc' : ''}`}
                  onClick={() => setSelected(dev)}
                >
                  <td className="ips-icon-cell">{dev.icon}</td>
                  <td><span className="ips-online">● Alive</span></td>
                  <td className="ips-ip">{dev.ip}</td>
                  <td>{dev.hostname}</td>
                  <td className="ips-ping">{dev.latency} ms</td>
                  <td className="ips-mac">{dev.mac}</td>
                  <td>{dev.vendor}</td>
                  <td>{dev.type}</td>
                  <td>
                    <button className="ips-open-btn" onClick={e => { e.stopPropagation(); openInBrowser(dev.ip); }}>
                      🌐
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!scanning && found.length === 0 && (
            <div className="ips-empty">
              Click <strong>Scan</strong> to discover devices on 192.168.1.0/24
            </div>
          )}
          {scanning && found.length === 0 && (
            <div className="ips-empty">Scanning… waiting for responses</div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="ips-detail">
            <div className="ips-detail-icon">{selected.icon}</div>
            <div className="ips-detail-name">{selected.hostname}</div>
            <div className="ips-detail-type">{selected.type}</div>
            <div className="ips-detail-rows">
              {[
                ['IP Address', selected.ip],
                ['MAC Address', selected.mac],
                ['Vendor', selected.vendor],
                ['Ping', `${selected.latency} ms`],
                ['Open Ports', selected.ports.join(', ')],
              ].map(([k, v]) => (
                <div key={k} className="ips-detail-row">
                  <span className="ips-detail-key">{k}</span>
                  <span className="ips-detail-val">{v}</span>
                </div>
              ))}
            </div>
            <button className="ips-open-full-btn" onClick={() => openInBrowser(selected.ip)}>
              🌐 Open in Browser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
