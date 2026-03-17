import { useState, useRef, useEffect } from 'react';
import './Nmap.css';

const PROFILES = [
  { label: 'Intense scan',         args: '-T4 -A -v' },
  { label: 'Intense scan plus UDP', args: '-sS -sU -T4 -A -v' },
  { label: 'Intense scan, all TCP', args: '-p 1-65535 -T4 -A -v' },
  { label: 'Ping scan',             args: '-sn' },
  { label: 'Quick scan',            args: '-T4 -F' },
  { label: 'Quick scan plus',       args: '-sV -T4 -O -F --version-light' },
  { label: 'Quick traceroute',      args: '-sn --traceroute' },
  { label: 'Regular scan',          args: '' },
  { label: 'Slow comprehensive scan', args: '-sS -sU -T2 -A -p-' },
  { label: 'Custom',                args: '' },
];

type ScanTab = 'output' | 'ports' | 'hosts' | 'details';

interface HostResult {
  ip: string;
  hostname: string;
  state: 'up' | 'down';
  os: string;
  ports: PortResult[];
  mac: string;
  vendor: string;
}

interface PortResult {
  port: number;
  proto: 'tcp' | 'udp';
  state: 'open' | 'closed' | 'filtered';
  service: string;
  version: string;
}

const SCAN_RESULTS: HostResult[] = [
  {
    ip: '192.168.1.1',
    hostname: 'TP-Link_AX3000',
    state: 'up',
    os: 'Linux 4.4 (Embedded)',
    mac: 'A0:F3:C1:22:4B:80',
    vendor: 'TP-Link Technologies',
    ports: [
      { port: 53,  proto: 'tcp', state: 'open', service: 'domain',   version: 'dnsmasq 2.80' },
      { port: 80,  proto: 'tcp', state: 'open', service: 'http',     version: 'TP-Link WebUI 1.0' },
      { port: 443, proto: 'tcp', state: 'open', service: 'https',    version: 'TP-Link WebUI' },
    ],
  },
  {
    ip: '192.168.1.2',
    hostname: 'DESKTOP-WIN10',
    state: 'up',
    os: 'Windows 10 / Windows 11',
    mac: 'B4:D1:3A:F2:0C:44',
    vendor: 'ASUSTeK Computer',
    ports: [
      { port: 80,   proto: 'tcp', state: 'open', service: 'http',    version: 'Apache httpd 2.4.58' },
      { port: 135,  proto: 'tcp', state: 'open', service: 'msrpc',   version: 'Microsoft Windows RPC' },
      { port: 139,  proto: 'tcp', state: 'open', service: 'netbios-ssn', version: 'Microsoft netbios-ssn' },
      { port: 445,  proto: 'tcp', state: 'open', service: 'microsoft-ds', version: 'Windows 10 microsoft-ds' },
      { port: 3389, proto: 'tcp', state: 'open', service: 'ms-wbt-server', version: 'Microsoft Terminal Services' },
    ],
  },
  {
    ip: '192.168.1.102',
    hostname: 'MacBook-Pro-M3',
    state: 'up',
    os: 'macOS 14 (Sonoma)',
    mac: 'F0:18:98:B2:3D:E1',
    vendor: 'Apple Inc.',
    ports: [
      { port: 22,  proto: 'tcp', state: 'open',     service: 'ssh',    version: 'OpenSSH 9.4 (protocol 2.0)' },
      { port: 548, proto: 'tcp', state: 'open',     service: 'afp',    version: 'Netatalk 3.1.12' },
      { port: 631, proto: 'tcp', state: 'filtered', service: 'ipp',    version: '' },
    ],
  },
  {
    ip: '192.168.1.130',
    hostname: 'HP-LaserJet-MFP',
    state: 'up',
    os: 'Embedded HP JetDirect',
    mac: 'A4:5D:36:70:44:BB',
    vendor: 'HP Inc.',
    ports: [
      { port: 80,   proto: 'tcp', state: 'open', service: 'http',    version: 'HP JetDirect http admin' },
      { port: 443,  proto: 'tcp', state: 'open', service: 'https',   version: 'HP JetDirect ssl' },
      { port: 631,  proto: 'tcp', state: 'open', service: 'ipp',     version: 'CUPS 2.3.3' },
      { port: 9100, proto: 'tcp', state: 'open', service: 'jetdirect', version: 'HP JetDirect' },
    ],
  },
  {
    ip: '192.168.1.140',
    hostname: 'raspberrypi',
    state: 'up',
    os: 'Linux 5.10 - 5.15 (Raspberry Pi)',
    mac: 'DC:A6:32:11:22:33',
    vendor: 'Raspberry Pi Foundation',
    ports: [
      { port: 22,   proto: 'tcp', state: 'open', service: 'ssh',    version: 'OpenSSH 8.9p1 Debian' },
      { port: 80,   proto: 'tcp', state: 'open', service: 'http',   version: 'nginx 1.22.1' },
      { port: 5900, proto: 'tcp', state: 'open', service: 'vnc',    version: 'RealVNC 5.3.2' },
    ],
  },
  {
    ip: '192.168.1.150',
    hostname: 'SynologyNAS-DS920',
    state: 'up',
    os: 'Linux 4.4 (Synology DSM)',
    mac: '00:11:32:BC:AA:EE',
    vendor: 'Synology Inc.',
    ports: [
      { port: 22,   proto: 'tcp', state: 'open', service: 'ssh',    version: 'OpenSSH 7.6p1 (Synology)' },
      { port: 445,  proto: 'tcp', state: 'open', service: 'microsoft-ds', version: 'Samba 4.15.13' },
      { port: 5000, proto: 'tcp', state: 'open', service: 'http',   version: 'Synology DSM 7.2' },
      { port: 5001, proto: 'tcp', state: 'open', service: 'ssl/http', version: 'Synology DSM 7.2 ssl' },
    ],
  },
  {
    ip: '192.168.1.200',
    hostname: 'WIN-SERVER-2022',
    state: 'up',
    os: 'Windows Server 2022',
    mac: 'C0:18:50:E5:11:22',
    vendor: 'Dell Inc.',
    ports: [
      { port: 53,   proto: 'tcp', state: 'open', service: 'domain',  version: 'Microsoft DNS 10.0.20348' },
      { port: 88,   proto: 'tcp', state: 'open', service: 'kerberos-sec', version: 'Microsoft Windows Kerberos' },
      { port: 135,  proto: 'tcp', state: 'open', service: 'msrpc',   version: 'Microsoft Windows RPC' },
      { port: 389,  proto: 'tcp', state: 'open', service: 'ldap',    version: 'Microsoft Windows Active Directory LDAP' },
      { port: 445,  proto: 'tcp', state: 'open', service: 'microsoft-ds', version: 'Windows Server 2022 microsoft-ds' },
      { port: 3389, proto: 'tcp', state: 'open', service: 'ms-wbt-server', version: 'Microsoft Terminal Services' },
      { port: 5985, proto: 'tcp', state: 'open', service: 'wsman',   version: 'Microsoft HTTPAPI httpd 2.0' },
    ],
  },
];

function buildNmapOutput(target: string, profile: string, hosts: HostResult[]): string[] {
  const lines: string[] = [];
  lines.push(`Starting Nmap 7.95 ( https://nmap.org ) at ${new Date().toLocaleString()}`);
  lines.push(`Nmap scan report — Target: ${target}  Profile: ${profile}`);
  lines.push('');
  for (const h of hosts) {
    if (h.state === 'down') continue;
    lines.push(`Nmap scan report for ${h.hostname} (${h.ip})`);
    lines.push(`Host is up (0.00${Math.floor(Math.random() * 9) + 1}s latency).`);
    lines.push(`MAC Address: ${h.mac} (${h.vendor})`);
    if (h.ports.length > 0) {
      lines.push(`PORT      STATE    SERVICE         VERSION`);
      for (const p of h.ports) {
        const portStr = `${p.port}/${p.proto}`.padEnd(10);
        const stateStr = p.state.padEnd(9);
        const svcStr = p.service.padEnd(16);
        lines.push(`${portStr}${stateStr}${svcStr}${p.version}`);
      }
    }
    lines.push(`OS: ${h.os}`);
    lines.push('');
  }
  const upCount = hosts.filter(h => h.state === 'up').length;
  lines.push(`Nmap done: 254 IP addresses (${upCount} hosts up) scanned in ${(Math.random() * 4 + 2).toFixed(2)} seconds`);
  return lines;
}

export default function Nmap() {
  const [target, setTarget] = useState('192.168.1.0/24');
  const [selectedProfile, setSelectedProfile] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [tab, setTab] = useState<ScanTab>('output');
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [scanDone, setScanDone] = useState(false);
  const [selectedHost, setSelectedHost] = useState<HostResult | null>(null);
  const timerRef = useRef<number | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputLines]);

  const startScan = () => {
    if (scanning) return;
    setScanning(true);
    setScanDone(false);
    setOutputLines([]);
    setTab('output');

    const profile = PROFILES[selectedProfile];
    const allLines = buildNmapOutput(target, profile.label, SCAN_RESULTS);
    let i = 0;
    timerRef.current = window.setInterval(() => {
      if (i < allLines.length) {
        setOutputLines(prev => [...prev, allLines[i]]);
        i++;
      } else {
        clearInterval(timerRef.current!);
        setScanning(false);
        setScanDone(true);
      }
    }, 80);
  };

  const stopScan = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setScanning(false);
    setOutputLines(prev => [...prev, '', '-- Scan cancelled by user --']);
  };

  const upHosts = SCAN_RESULTS.filter(h => h.state === 'up');

  return (
    <div className="nmap-root">
      {/* Top bar */}
      <div className="nmap-topbar">
        <span className="nmap-brand">Zenmap — Nmap GUI</span>
        <div className="nmap-target-row">
          <label className="nmap-label">Target:</label>
          <input
            className="nmap-target-input"
            value={target}
            onChange={e => setTarget(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !scanning && startScan()}
          />
          <label className="nmap-label">Profile:</label>
          <select
            className="nmap-profile-select"
            value={selectedProfile}
            onChange={e => setSelectedProfile(Number(e.target.value))}
          >
            {PROFILES.map((p, i) => (
              <option key={i} value={i}>{p.label}</option>
            ))}
          </select>
          <button
            className={`nmap-scan-btn ${scanning ? 'nmap-scan-stop' : ''}`}
            onClick={scanning ? stopScan : startScan}
          >
            {scanning ? '⏹ Cancel' : '▶ Scan'}
          </button>
        </div>
        <div className="nmap-cmd-row">
          <label className="nmap-label">Command:</label>
          <input
            className="nmap-cmd-input"
            readOnly
            value={`nmap ${PROFILES[selectedProfile].args} ${target}`}
          />
        </div>
      </div>

      <div className="nmap-body">
        {/* Left: host list */}
        <div className="nmap-hosts-panel">
          <div className="nmap-hosts-title">Hosts</div>
          {upHosts.map(h => (
            <div
              key={h.ip}
              className={`nmap-host-item ${selectedHost?.ip === h.ip ? 'selected' : ''} ${!scanDone ? 'nmap-host-dim' : ''}`}
              onClick={() => { if (scanDone) { setSelectedHost(h); setTab('hosts'); } }}
            >
              <span className="nmap-host-dot" style={{ color: h.state === 'up' ? '#2ecc71' : '#e74c3c' }}>⬤</span>
              <div>
                <div className="nmap-host-ip">{h.ip}</div>
                <div className="nmap-host-name">{h.hostname}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: tabs */}
        <div className="nmap-right">
          <div className="nmap-tabs">
            {(['output', 'ports', 'hosts', 'details'] as ScanTab[]).map(t => (
              <button
                key={t}
                className={`nmap-tab ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'output' ? 'Nmap Output' : t === 'ports' ? 'Ports / Hosts' : t === 'hosts' ? 'Host Details' : 'Topology'}
              </button>
            ))}
          </div>

          <div className="nmap-tab-content">
            {tab === 'output' && (
              <div className="nmap-output" ref={outputRef}>
                {outputLines.map((line, i) => (
                  <div
                    key={i}
                    className={`nmap-output-line ${line.startsWith('PORT') ? 'nmap-header' : line.startsWith('Nmap scan') || line.startsWith('Starting') ? 'nmap-title-line' : line.startsWith('Host is up') ? 'nmap-up' : line.startsWith('OS:') ? 'nmap-os' : ''}`}
                  >
                    {line}
                  </div>
                ))}
                {scanning && <span className="nmap-cursor">█</span>}
              </div>
            )}

            {tab === 'ports' && (
              <div className="nmap-ports-view">
                {!scanDone ? (
                  <div className="nmap-not-done">Run a scan to see results.</div>
                ) : (
                  <table className="nmap-ports-table">
                    <thead>
                      <tr><th>IP</th><th>Port</th><th>Proto</th><th>State</th><th>Service</th><th>Version</th></tr>
                    </thead>
                    <tbody>
                      {upHosts.flatMap(h => h.ports.map(p => (
                        <tr key={`${h.ip}-${p.port}`} className={`nmap-port-row nmap-port-${p.state}`}>
                          <td>{h.ip}</td>
                          <td className="nmap-port-num">{p.port}</td>
                          <td>{p.proto}</td>
                          <td className={`nmap-state-${p.state}`}>{p.state}</td>
                          <td>{p.service}</td>
                          <td className="nmap-port-ver">{p.version}</td>
                        </tr>
                      )))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {tab === 'hosts' && (
              <div className="nmap-host-details">
                {!scanDone ? (
                  <div className="nmap-not-done">Run a scan to see host details.</div>
                ) : !selectedHost ? (
                  <div className="nmap-not-done">Click a host in the list to see details.</div>
                ) : (
                  <div className="nmap-host-detail-view">
                    <div className="nmap-detail-header">
                      <span className="nmap-detail-ip">{selectedHost.ip}</span>
                      <span className="nmap-detail-hostname">{selectedHost.hostname}</span>
                      <span className="nmap-detail-state nmap-state-open">▲ Up</span>
                    </div>
                    <div className="nmap-detail-rows">
                      <div className="nmap-detail-row"><span>OS</span><span>{selectedHost.os}</span></div>
                      <div className="nmap-detail-row"><span>MAC</span><span>{selectedHost.mac}</span></div>
                      <div className="nmap-detail-row"><span>Vendor</span><span>{selectedHost.vendor}</span></div>
                      <div className="nmap-detail-row"><span>Open ports</span><span>{selectedHost.ports.filter(p => p.state === 'open').length}</span></div>
                    </div>
                    <div className="nmap-detail-ports-title">Open Ports</div>
                    <table className="nmap-ports-table">
                      <thead><tr><th>Port</th><th>Proto</th><th>State</th><th>Service</th><th>Version</th></tr></thead>
                      <tbody>
                        {selectedHost.ports.map(p => (
                          <tr key={p.port} className={`nmap-port-row nmap-port-${p.state}`}>
                            <td className="nmap-port-num">{p.port}</td>
                            <td>{p.proto}</td>
                            <td className={`nmap-state-${p.state}`}>{p.state}</td>
                            <td>{p.service}</td>
                            <td className="nmap-port-ver">{p.version}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === 'details' && (
              <div className="nmap-not-done" style={{ padding: 16 }}>
                {!scanDone ? 'Run a scan to see topology.' : `${upHosts.length} hosts discovered · ${upHosts.reduce((a, h) => a + h.ports.filter(p => p.state === 'open').length, 0)} open ports total`}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="nmap-status">
            {scanning ? (
              <span className="nmap-status-scanning">🔍 Scanning {target}…</span>
            ) : scanDone ? (
              <span>✔ Scan complete — {upHosts.length} hosts up</span>
            ) : (
              <span>Ready</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
