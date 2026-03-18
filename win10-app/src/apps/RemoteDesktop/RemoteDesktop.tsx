import { useState, useEffect, useRef } from 'react';
import './RemoteDesktop.css';

interface SavedServer {
  name: string;
  ip: string;
  user: string;
  resolution: string;
  role?: string;
}

const SAVED_SERVERS: SavedServer[] = [
  { name: 'WIN-DC-01',       ip: '192.168.1.200', user: 'Administrator', resolution: '1920x1080', role: 'Domain Controller' },
  { name: 'WIN-SERVER-2022', ip: '192.168.1.201', user: 'Administrator', resolution: '1920x1080', role: 'File & Print Server' },
  { name: 'UBUNTU-WEB-01',   ip: '10.0.0.5',      user: 'Administrator', resolution: '1280x720',  role: 'Web Server' },
  { name: 'DB-CLUSTER-01',   ip: '10.0.0.10',     user: 'Administrator', resolution: '1280x720',  role: 'Database Server' },
  { name: 'SCCM-SERVER',     ip: '192.168.1.210', user: 'Administrator', resolution: '1920x1080', role: 'SCCM / ConfigMgr' },
  { name: 'DEV-BOX',         ip: '10.0.0.15',     user: 'Administrator', resolution: '1920x1080', role: 'Dev Workstation' },
  { name: 'BACKUP-NAS',      ip: '192.168.1.150', user: 'Administrator', resolution: '1024x768',  role: 'NAS / Backup' },
];

const RESOLUTIONS = ['1024x768', '1280x720', '1366x768', '1920x1080', '2560x1440', 'Full Screen'];

// ─── Simulated data ──────────────────────────────────────────────────────────

const AD_USERS = [
  { name: 'John Smith',      sam: 'jsmith',    ou: 'IT',      dept: 'IT Dept',     title: 'Systems Admin',      status: 'Enabled',  lastLogon: '2026-03-17 08:42' },
  { name: 'Sarah Johnson',   sam: 'sjohnson',  ou: 'IT',      dept: 'IT Dept',     title: 'Network Engineer',   status: 'Enabled',  lastLogon: '2026-03-17 07:55' },
  { name: 'Mike Davis',      sam: 'mdavis',    ou: 'IT',      dept: 'IT Dept',     title: 'Help Desk Lead',     status: 'Enabled',  lastLogon: '2026-03-16 17:12' },
  { name: 'Emily Chen',      sam: 'echen',     ou: 'Finance', dept: 'Finance',     title: 'Finance Director',   status: 'Enabled',  lastLogon: '2026-03-17 09:01' },
  { name: 'Robert Wilson',   sam: 'rwilson',   ou: 'Finance', dept: 'Finance',     title: 'Senior Accountant',  status: 'Enabled',  lastLogon: '2026-03-15 14:33' },
  { name: 'Lisa Brown',      sam: 'lbrown',    ou: 'HR',      dept: 'HR',          title: 'HR Manager',         status: 'Enabled',  lastLogon: '2026-03-17 08:10' },
  { name: 'Tom Martinez',    sam: 'tmartinez', ou: 'HR',      dept: 'HR',          title: 'Recruiter',          status: 'Enabled',  lastLogon: '2026-03-14 11:20' },
  { name: 'Amy Taylor',      sam: 'ataylor',   ou: 'Sales',   dept: 'Sales',       title: 'Sales Manager',      status: 'Enabled',  lastLogon: '2026-03-17 08:58' },
  { name: 'Chris Anderson',  sam: 'canderson', ou: 'Sales',   dept: 'Sales',       title: 'Account Executive',  status: 'Enabled',  lastLogon: '2026-03-16 10:45' },
  { name: 'Diana Lee',       sam: 'dlee',      ou: 'Sales',   dept: 'Sales',       title: 'Account Executive',  status: 'Enabled',  lastLogon: '2026-03-17 07:22' },
  { name: 'Kevin White',     sam: 'kwhite',    ou: 'Mgmt',    dept: 'Management',  title: 'CEO',                status: 'Enabled',  lastLogon: '2026-03-17 09:15' },
  { name: 'Nancy Clark',     sam: 'nclark',    ou: 'Mgmt',    dept: 'Management',  title: 'COO',                status: 'Enabled',  lastLogon: '2026-03-16 16:00' },
  { name: 'Paul Harris',     sam: 'pharris',   ou: 'IT',      dept: 'IT Dept',     title: 'Security Analyst',   status: 'Enabled',  lastLogon: '2026-03-17 08:30' },
  { name: 'TestUser01',      sam: 'testuser1', ou: 'IT',      dept: 'IT Dept',     title: 'Test Account',       status: 'Disabled', lastLogon: '2025-12-01 10:00' },
  { name: 'svc_backup',      sam: 'svcbackup', ou: 'SvcAccts',dept: 'IT Dept',    title: 'Service Account',    status: 'Enabled',  lastLogon: '2026-03-17 00:05' },
  { name: 'svc_sccm',        sam: 'svcsccm',   ou: 'SvcAccts',dept: 'IT Dept',    title: 'Service Account',    status: 'Enabled',  lastLogon: '2026-03-17 06:00' },
  { name: 'svc_sql',         sam: 'svcsql',    ou: 'SvcAccts',dept: 'IT Dept',    title: 'Service Account',    status: 'Enabled',  lastLogon: '2026-03-17 08:00' },
];

const AD_COMPUTERS = [
  { name: 'WIN-DC-01',       ip: '192.168.1.200', os: 'Windows Server 2022', ou: 'Domain Controllers', type: 'Server' },
  { name: 'WIN-SERVER-2022', ip: '192.168.1.201', os: 'Windows Server 2022', ou: 'Servers',            type: 'Server' },
  { name: 'SCCM-SERVER',     ip: '192.168.1.210', os: 'Windows Server 2022', ou: 'Servers',            type: 'Server' },
  { name: 'WKSTN-001',       ip: '192.168.1.101', os: 'Windows 11 Pro',      ou: 'Workstations',       type: 'Workstation' },
  { name: 'WKSTN-002',       ip: '192.168.1.102', os: 'Windows 11 Pro',      ou: 'Workstations',       type: 'Workstation' },
  { name: 'WKSTN-003',       ip: '192.168.1.103', os: 'Windows 10 Pro',      ou: 'Workstations',       type: 'Workstation' },
  { name: 'WKSTN-004',       ip: '192.168.1.104', os: 'Windows 11 Pro',      ou: 'IT',                 type: 'Workstation' },
  { name: 'WKSTN-005',       ip: '192.168.1.105', os: 'Windows 11 Pro',      ou: 'IT',                 type: 'Workstation' },
  { name: 'LAPTOP-HR-01',    ip: '192.168.1.120', os: 'Windows 11 Pro',      ou: 'Laptops',            type: 'Laptop' },
  { name: 'LAPTOP-SALES-01', ip: '192.168.1.121', os: 'Windows 11 Pro',      ou: 'Laptops',            type: 'Laptop' },
];

const LAPS_DATA = [
  { computer: 'WKSTN-001',    password: 'K@9mPx#2qR',  expires: '2026-04-17', set: '2026-03-17' },
  { computer: 'WKSTN-002',    password: 'Tz!5nWv#8bL', expires: '2026-04-18', set: '2026-03-18' },
  { computer: 'WKSTN-003',    password: 'Qe@7sHd$4mN', expires: '2026-04-10', set: '2026-03-10' },
  { computer: 'WKSTN-004',    password: 'Yw&3kJr!6pC', expires: '2026-04-22', set: '2026-03-22' },
  { computer: 'WKSTN-005',    password: 'Mb#9xFt@2dV', expires: '2026-04-05', set: '2026-03-05' },
  { computer: 'LAPTOP-HR-01', password: 'Rn!4vBz#7wS', expires: '2026-04-14', set: '2026-03-14' },
  { computer: 'LAPTOP-SALES-01', password: 'Lp@6cGh$1eT', expires: '2026-04-20', set: '2026-03-20' },
  { computer: 'WIN-SERVER-2022', password: 'Xd#2qYm!5rK', expires: '2026-05-01', set: '2026-04-01' },
];

const SCCM_DEVICES = [
  { name: 'WKSTN-001',    os: 'Windows 11 22H2', client: '5.00.9096', compliant: true,  lastSync: '2026-03-17 07:30', patches: 0  },
  { name: 'WKSTN-002',    os: 'Windows 11 22H2', client: '5.00.9096', compliant: true,  lastSync: '2026-03-17 06:45', patches: 0  },
  { name: 'WKSTN-003',    os: 'Windows 10 22H2', client: '5.00.9096', compliant: false, lastSync: '2026-03-15 14:00', patches: 12 },
  { name: 'WKSTN-004',    os: 'Windows 11 23H2', client: '5.00.9096', compliant: true,  lastSync: '2026-03-17 08:00', patches: 0  },
  { name: 'WKSTN-005',    os: 'Windows 11 23H2', client: '5.00.9096', compliant: true,  lastSync: '2026-03-16 12:30', patches: 2  },
  { name: 'LAPTOP-HR-01', os: 'Windows 11 22H2', client: '5.00.9096', compliant: false, lastSync: '2026-03-10 09:00', patches: 8  },
  { name: 'LAPTOP-SALES-01', os: 'Windows 11 23H2', client: '5.00.9096', compliant: true, lastSync: '2026-03-17 08:50', patches: 0 },
  { name: 'WIN-SERVER-2022', os: 'Windows Server 2022', client: '5.00.9096', compliant: true, lastSync: '2026-03-17 03:00', patches: 0 },
];

const SCCM_DEPLOYMENTS = [
  { name: 'Microsoft 365 Apps 2306',    type: 'Application',      devices: 7,  success: 7,  fail: 0, pending: 0 },
  { name: 'Google Chrome 123.0',        type: 'Application',      devices: 7,  success: 6,  fail: 1, pending: 0 },
  { name: '2026-03 Cumulative Update',  type: 'Software Update',  devices: 8,  success: 5,  fail: 2, pending: 1 },
  { name: 'CrowdStrike Falcon 7.15',    type: 'Application',      devices: 8,  success: 8,  fail: 0, pending: 0 },
  { name: 'Windows Defender Def. 1.409',type: 'Software Update',  devices: 8,  success: 7,  fail: 0, pending: 1 },
  { name: '7-Zip 24.07',               type: 'Application',      devices: 7,  success: 7,  fail: 0, pending: 0 },
  { name: 'Endpoint Compliance Baseline',type:'Configuration',    devices: 8,  success: 6,  fail: 2, pending: 0 },
];

const DNS_ZONES = [
  { name: 'corp.local', type: 'Primary', records: 28, status: 'Running' },
  { name: '192.168.1.x Subnet', type: 'Primary Reverse', records: 18, status: 'Running' },
  { name: '10.0.0.x Subnet',    type: 'Primary Reverse', records: 8,  status: 'Running' },
  { name: 'microsoft.com',      type: 'Conditional Forwarder', records: 2, status: 'Delegated' },
];

const DNS_RECORDS = [
  { name: 'win-dc-01',        type: 'A',     value: '192.168.1.200', ttl: '1200' },
  { name: 'win-server-2022',  type: 'A',     value: '192.168.1.201', ttl: '1200' },
  { name: 'sccm-server',      type: 'A',     value: '192.168.1.210', ttl: '1200' },
  { name: 'corp.local',       type: 'NS',    value: 'win-dc-01.corp.local', ttl: '3600' },
  { name: 'corp.local',       type: 'SOA',   value: 'win-dc-01 hostmaster 2026031701', ttl: '3600' },
  { name: 'wkstn-001',        type: 'A',     value: '192.168.1.101', ttl: '1200' },
  { name: 'wkstn-002',        type: 'A',     value: '192.168.1.102', ttl: '1200' },
  { name: 'smtp',             type: 'A',     value: '192.168.1.220', ttl: '3600' },
  { name: '@',                type: 'MX',    value: 'smtp.corp.local (10)', ttl: '3600' },
  { name: '_ldap._tcp',       type: 'SRV',   value: 'win-dc-01.corp.local:389', ttl: '600' },
  { name: '_kerberos._tcp',   type: 'SRV',   value: 'win-dc-01.corp.local:88', ttl: '600' },
];

const DHCP_SCOPES = [
  { name: '192.168.1.0/24 – LAN',    range: '192.168.1.100 – 192.168.1.254', leases: 34, available: 120, status: 'Active' },
  { name: '10.0.0.0/24 – Servers',   range: '10.0.0.1 – 10.0.0.50',          leases: 6,  available: 44,  status: 'Active' },
  { name: '172.16.0.0/24 – VoIP',    range: '172.16.0.100 – 172.16.0.200',   leases: 12, available: 88,  status: 'Active' },
  { name: '192.168.10.0/24 – Guest', range: '192.168.10.100 – 192.168.10.200',leases: 4,  available: 96,  status: 'Active' },
];

const GPOS = [
  { name: 'Default Domain Policy',       scope: 'CORP.LOCAL',    status: 'Enabled', modified: '2025-11-02' },
  { name: 'Password Policy',             scope: 'CORP.LOCAL',    status: 'Enabled', modified: '2025-10-15' },
  { name: 'Workstation Baseline',        scope: 'Workstations',  status: 'Enabled', modified: '2026-01-20' },
  { name: 'IT Admin Rights',             scope: 'IT OU',         status: 'Enabled', modified: '2026-02-10' },
  { name: 'LAPS – Workstations',         scope: 'Workstations',  status: 'Enabled', modified: '2025-12-05' },
  { name: 'Windows Update – WSUS',       scope: 'CORP.LOCAL',    status: 'Enabled', modified: '2025-09-30' },
  { name: 'Screensaver Lock Policy',     scope: 'CORP.LOCAL',    status: 'Enabled', modified: '2025-08-14' },
  { name: 'Mapped Drives – Finance',     scope: 'Finance OU',    status: 'Enabled', modified: '2026-01-05' },
  { name: 'Software Restrictions',       scope: 'CORP.LOCAL',    status: 'Enabled', modified: '2025-11-22' },
  { name: 'BitLocker Policy',            scope: 'Laptops OU',    status: 'Enabled', modified: '2026-02-18' },
  { name: 'AppLocker Baseline',          scope: 'CORP.LOCAL',    status: 'Disabled',modified: '2025-07-08' },
  { name: 'RDS CAL Policy',              scope: 'Servers OU',    status: 'Enabled', modified: '2025-10-01' },
];

const SERVER_SERVICES: Record<string, string[]> = {
  '192.168.1.200': ['AD DS (Active Directory)', 'AD CS (Certificate Services)', 'DNS Server', 'DHCP Server', 'LAPS', 'NTP', 'KDC (Kerberos)', 'Remote Desktop Services'],
  '192.168.1.201': ['File Server Resource Manager', 'DFS (Distributed File System)', 'Print Spooler', 'Shadow Copy', 'WDS', 'Remote Desktop Services'],
  '10.0.0.5':      ['nginx 1.24.0', 'MySQL 8.0.36', 'PHP-FPM 8.2', 'OpenSSH 9.3', 'UFW Firewall', 'fail2ban', 'certbot'],
  '10.0.0.10':     ['MySQL Cluster 8.0', 'Redis 7.2', 'HAProxy 2.8', 'Keepalived', 'OpenSSH', 'Prometheus Node Exporter'],
  '192.168.1.210': ['SMS Executive', 'SCCM Site Server', 'Distribution Point', 'Management Point', 'SQL Server 2022', 'WSUS', 'Remote Desktop Services'],
  '10.0.0.15':     ['Visual Studio 2022', 'Docker Desktop 4.28', 'Git 2.44', 'Node.js 20', 'Python 3.12', 'WSL2', 'Remote Desktop Services'],
  '192.168.1.150': ['Samba 4.19', 'NFS Server', 'Plex Media Server', 'SSH', 'ZFS Pool: tank', 'Rsync Daemon'],
};

const SERVER_WALLPAPERS: Record<string, string> = {
  '192.168.1.200': 'linear-gradient(135deg, #0a2a5c 0%, #0d47a1 50%, #1565c0 100%)',
  '192.168.1.201': 'linear-gradient(135deg, #1a2a1a 0%, #2a3a2a 50%, #1e2e1e 100%)',
  '10.0.0.5':      'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #3a3a3a 100%)',
  '10.0.0.10':     'linear-gradient(135deg, #0d1f0d 0%, #1a3a1a 50%, #0a2a0a 100%)',
  '192.168.1.210': 'linear-gradient(135deg, #2a0a2a 0%, #3a1a3a 50%, #4a2a4a 100%)',
  '10.0.0.15':     'linear-gradient(135deg, #001a3a 0%, #00264d 50%, #003366 100%)',
  '192.168.1.150': 'linear-gradient(135deg, #1a0a2a 0%, #2d1a3a 50%, #3a2a4a 100%)',
};

type Phase = 'dialog' | 'connecting' | 'connected';
type Panel = 'server-manager' | 'aduc' | 'laps' | 'sccm' | 'gpo' | 'dns' | 'dhcp' | 'cmd';

interface DeskIcon { id: Panel; icon: string; label: string }

const DC_ICONS: DeskIcon[] = [
  { id: 'server-manager', icon: '⚙️',  label: 'Server Manager' },
  { id: 'aduc',           icon: '👥',  label: 'AD Users & Computers' },
  { id: 'laps',           icon: '🔑',  label: 'LAPS AdmPwd' },
  { id: 'sccm',           icon: '📦',  label: 'SCCM Console' },
  { id: 'gpo',            icon: '📋',  label: 'Group Policy Mgmt' },
  { id: 'dns',            icon: '🌐',  label: 'DNS Manager' },
  { id: 'dhcp',           icon: '🔌',  label: 'DHCP Manager' },
  { id: 'cmd',            icon: '💻',  label: 'PowerShell ISE' },
];

const DEFAULT_ICONS: DeskIcon[] = [
  { id: 'server-manager', icon: '⚙️', label: 'Server Manager' },
  { id: 'cmd',            icon: '💻', label: 'PowerShell ISE' },
];

// ─── Panel components ─────────────────────────────────────────────────────────

function PanelServerManager({ ip }: { ip: string }) {
  const svcs = SERVER_SERVICES[ip] ?? SERVER_SERVICES['192.168.1.200'];
  const isDC = ip === '192.168.1.200';
  const isSCCM = ip === '192.168.1.210';
  return (
    <div className="rdp-panel-inner">
      <div className="rdp-panel-hdr">Server Manager — Dashboard</div>
      <div className="rdp-sm-grid">
        {isDC && <>
          <div className="rdp-sm-tile rdp-sm-ok"><div className="rdp-sm-tile-icon">🏛️</div><div><b>AD DS</b><div className="rdp-sm-tile-sub">Running · Replication OK</div></div></div>
          <div className="rdp-sm-tile rdp-sm-ok"><div className="rdp-sm-tile-icon">📜</div><div><b>AD CS</b><div className="rdp-sm-tile-sub">Enterprise Root CA · Active</div></div></div>
          <div className="rdp-sm-tile rdp-sm-ok"><div className="rdp-sm-tile-icon">🌐</div><div><b>DNS Server</b><div className="rdp-sm-tile-sub">4 zones · All healthy</div></div></div>
          <div className="rdp-sm-tile rdp-sm-ok"><div className="rdp-sm-tile-icon">🔌</div><div><b>DHCP Server</b><div className="rdp-sm-tile-sub">4 scopes · 56 leases</div></div></div>
          <div className="rdp-sm-tile rdp-sm-ok"><div className="rdp-sm-tile-icon">🔑</div><div><b>LAPS</b><div className="rdp-sm-tile-sub">8 managed computers</div></div></div>
          <div className="rdp-sm-tile rdp-sm-ok"><div className="rdp-sm-tile-icon">🛡️</div><div><b>Windows Firewall</b><div className="rdp-sm-tile-sub">All profiles active</div></div></div>
        </>}
        {isSCCM && <>
          <div className="rdp-sm-tile rdp-sm-ok"><div className="rdp-sm-tile-icon">📦</div><div><b>SMS Executive</b><div className="rdp-sm-tile-sub">Running · Site Primary</div></div></div>
          <div className="rdp-sm-tile rdp-sm-ok"><div className="rdp-sm-tile-icon">🗄️</div><div><b>SQL Server 2022</b><div className="rdp-sm-tile-sub">SCCMDB · Active</div></div></div>
          <div className="rdp-sm-tile rdp-sm-warn"><div className="rdp-sm-tile-icon">⚠️</div><div><b>WSUS</b><div className="rdp-sm-tile-sub">2 pending sync errors</div></div></div>
        </>}
        {!isDC && !isSCCM && svcs.map((s, i) => (
          <div key={i} className="rdp-sm-tile rdp-sm-ok">
            <div className="rdp-sm-tile-icon">✅</div>
            <div><b>{s.split(' ')[0]}</b><div className="rdp-sm-tile-sub">{s}</div></div>
          </div>
        ))}
      </div>
      <div className="rdp-panel-section">Events (last 24h)</div>
      <table className="rdp-table">
        <thead><tr><th>Level</th><th>Source</th><th>Event ID</th><th>Message</th><th>Time</th></tr></thead>
        <tbody>
          <tr><td className="rdp-ev-info">ℹ️</td><td>Security</td><td>4624</td><td>Successful logon: Administrator</td><td>09:15</td></tr>
          <tr><td className="rdp-ev-info">ℹ️</td><td>System</td><td>7036</td><td>DHCP Server service entered running state</td><td>06:00</td></tr>
          {isDC && <tr><td className="rdp-ev-info">ℹ️</td><td>ActiveDirectory</td><td>1000</td><td>AD replication cycle completed successfully</td><td>08:30</td></tr>}
          {isDC && <tr><td className="rdp-ev-warn">⚠️</td><td>DNS Server</td><td>4015</td><td>Critical DNS server zone transfer delay</td><td>03:12</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function PanelADUC() {
  const [ouFilter, setOuFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = AD_USERS.filter(u =>
    (ouFilter === 'All' || u.ou === ouFilter) &&
    (search === '' || u.name.toLowerCase().includes(search.toLowerCase()) || u.sam.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="rdp-panel-inner">
      <div className="rdp-panel-hdr">Active Directory Users and Computers — corp.local</div>
      <div className="rdp-aduc-toolbar">
        <span className="rdp-tb-btn" title="New User">👤+</span>
        <span className="rdp-tb-btn" title="New Group">👥+</span>
        <span className="rdp-tb-btn" title="New OU">📁+</span>
        <span className="rdp-tb-sep" />
        <span className="rdp-tb-btn" title="Reset Password">🔐</span>
        <span className="rdp-tb-btn" title="Disable Account">🚫</span>
        <span className="rdp-tb-btn" title="Properties">⚙️</span>
        <span className="rdp-tb-sep" />
        <input className="rdp-search" placeholder="🔍 Search users…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="rdp-aduc-body">
        <div className="rdp-aduc-tree">
          <div className="rdp-tree-title">corp.local</div>
          {['All', 'Domain Controllers', 'IT', 'Finance', 'HR', 'Sales', 'Mgmt', 'SvcAccts', 'Workstations', 'Servers', 'Laptops'].map(o => (
            <div key={o} className={`rdp-tree-item ${ouFilter === o ? 'active' : ''}`} onClick={() => setOuFilter(o === 'Domain Controllers' || o === 'Workstations' || o === 'Servers' || o === 'Laptops' ? 'All' : o)}>
              {o === 'All' ? '🏛️' : o === 'Domain Controllers' ? '🖥️' : '📁'} {o}
            </div>
          ))}
        </div>
        <div className="rdp-aduc-list">
          <table className="rdp-table rdp-table-compact">
            <thead><tr><th>Name</th><th>SAM Account</th><th>Department</th><th>Title</th><th>Status</th><th>Last Logon</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.sam} className={selected === u.sam ? 'selected' : ''} onClick={() => setSelected(u.sam)}>
                  <td>👤 {u.name}</td>
                  <td>{u.sam}</td>
                  <td>{u.dept}</td>
                  <td>{u.title}</td>
                  <td className={u.status === 'Enabled' ? 'rdp-green' : 'rdp-red'}>{u.status}</td>
                  <td>{u.lastLogon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rdp-status-bar">{filtered.length} object(s) · Domain: corp.local · DC: WIN-DC-01</div>
    </div>
  );
}

function PanelLAPS() {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const toggle = (c: string) => setRevealed(s => { const n = new Set(s); n.has(c) ? n.delete(c) : n.add(c); return n; });
  const [rotatingPw, setRotatingPw] = useState<string | null>(null);
  const rotatePw = (c: string) => {
    setRotatingPw(c);
    setTimeout(() => setRotatingPw(null), 1800);
  };
  return (
    <div className="rdp-panel-inner">
      <div className="rdp-panel-hdr">LAPS — Local Administrator Password Solution</div>
      <div className="rdp-laps-info">
        <span className="rdp-laps-badge">LAPS v2 (Windows LAPS)</span>
        <span style={{ color: '#888', fontSize: 11 }}>Managed by GPO: "LAPS – Workstations"</span>
      </div>
      <table className="rdp-table">
        <thead><tr><th>Computer</th><th>Admin Password</th><th>Set Date</th><th>Expires</th><th>Actions</th></tr></thead>
        <tbody>
          {LAPS_DATA.map(l => (
            <tr key={l.computer}>
              <td>🖥️ {l.computer}</td>
              <td className="rdp-laps-pw">
                {rotatingPw === l.computer
                  ? <span className="rdp-rotating">⟳ Rotating…</span>
                  : revealed.has(l.computer)
                    ? <code className="rdp-pw-code">{l.password}</code>
                    : <span className="rdp-pw-hidden">••••••••••</span>}
              </td>
              <td>{l.set}</td>
              <td>{l.expires}</td>
              <td>
                <button className="rdp-laps-btn" onClick={() => toggle(l.computer)}>{revealed.has(l.computer) ? 'Hide' : 'Show'}</button>
                <button className="rdp-laps-btn rdp-laps-rotate" onClick={() => rotatePw(l.computer)}>Rotate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="rdp-panel-section">Computers</div>
      <table className="rdp-table rdp-table-compact">
        <thead><tr><th>Name</th><th>IP</th><th>OS</th><th>OU</th><th>Type</th></tr></thead>
        <tbody>
          {AD_COMPUTERS.filter(c => c.type !== 'Server' || c.name === 'WIN-SERVER-2022').map(c => (
            <tr key={c.name}><td>{'🖥️'} {c.name}</td><td>{c.ip}</td><td>{c.os}</td><td>{c.ou}</td><td>{c.type}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PanelSCCM() {
  const [tab, setTab] = useState<'devices' | 'deployments' | 'updates' | 'reports'>('devices');
  const compliant = SCCM_DEVICES.filter(d => d.compliant).length;
  return (
    <div className="rdp-panel-inner">
      <div className="rdp-panel-hdr">System Center Configuration Manager (SCCM) — Site: CORP</div>
      <div className="rdp-sccm-summary">
        <div className="rdp-sccm-card rdp-sccm-ok"><b>{SCCM_DEVICES.length}</b><span>Total Devices</span></div>
        <div className="rdp-sccm-card rdp-sccm-ok"><b>{compliant}</b><span>Compliant</span></div>
        <div className="rdp-sccm-card rdp-sccm-warn"><b>{SCCM_DEVICES.length - compliant}</b><span>Non-Compliant</span></div>
        <div className="rdp-sccm-card rdp-sccm-ok"><b>{SCCM_DEPLOYMENTS.length}</b><span>Active Deployments</span></div>
      </div>
      <div className="rdp-tabs">
        {(['devices', 'deployments', 'updates', 'reports'] as const).map(t => (
          <div key={t} className={`rdp-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>
      {tab === 'devices' && (
        <table className="rdp-table rdp-table-compact">
          <thead><tr><th>Device</th><th>OS</th><th>Client Ver.</th><th>Compliant</th><th>Last Sync</th><th>Pending Patches</th></tr></thead>
          <tbody>
            {SCCM_DEVICES.map(d => (
              <tr key={d.name}>
                <td>🖥️ {d.name}</td>
                <td>{d.os}</td>
                <td>{d.client}</td>
                <td className={d.compliant ? 'rdp-green' : 'rdp-red'}>{d.compliant ? '✔ Yes' : '✗ No'}</td>
                <td>{d.lastSync}</td>
                <td>{d.patches > 0 ? <span className="rdp-badge-warn">{d.patches}</span> : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {tab === 'deployments' && (
        <table className="rdp-table rdp-table-compact">
          <thead><tr><th>Deployment</th><th>Type</th><th>Devices</th><th>Success</th><th>Failed</th><th>Pending</th></tr></thead>
          <tbody>
            {SCCM_DEPLOYMENTS.map((d, i) => (
              <tr key={i}>
                <td>{d.name}</td>
                <td>{d.type}</td>
                <td>{d.devices}</td>
                <td className="rdp-green">{d.success}</td>
                <td className={d.fail > 0 ? 'rdp-red' : ''}>{d.fail || '—'}</td>
                <td>{d.pending || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {tab === 'updates' && (
        <div>
          <div className="rdp-panel-section">Pending Software Updates</div>
          {SCCM_DEVICES.filter(d => d.patches > 0).map(d => (
            <div key={d.name} className="rdp-update-row">
              <span>🖥️ {d.name}</span>
              <span className="rdp-badge-warn">{d.patches} updates pending</span>
              <button className="rdp-laps-btn">Force Sync</button>
            </div>
          ))}
          {SCCM_DEVICES.every(d => d.patches === 0) && <div style={{ color: '#888', padding: 16 }}>All devices up to date ✔</div>}
        </div>
      )}
      {tab === 'reports' && (
        <div className="rdp-report-list">
          {['Compliance Overview', 'Software Inventory', 'Hardware Inventory', 'Update Compliance', 'Application Usage', 'Client Health Summary'].map(r => (
            <div key={r} className="rdp-report-item">📊 {r}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function PanelGPO() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="rdp-panel-inner">
      <div className="rdp-panel-hdr">Group Policy Management — Forest: corp.local</div>
      <div className="rdp-aduc-toolbar">
        <span className="rdp-tb-btn" title="New GPO">📋+</span>
        <span className="rdp-tb-btn" title="Edit">✏️</span>
        <span className="rdp-tb-btn" title="Link">🔗</span>
        <span className="rdp-tb-btn" title="Disable">🚫</span>
        <span className="rdp-tb-btn" title="Backup">💾</span>
      </div>
      <table className="rdp-table rdp-table-compact">
        <thead><tr><th>GPO Name</th><th>Linked To</th><th>Status</th><th>Last Modified</th></tr></thead>
        <tbody>
          {GPOS.map(g => (
            <tr key={g.name} className={selected === g.name ? 'selected' : ''} onClick={() => setSelected(g.name)}>
              <td>📋 {g.name}</td>
              <td>{g.scope}</td>
              <td className={g.status === 'Enabled' ? 'rdp-green' : 'rdp-red'}>{g.status}</td>
              <td>{g.modified}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div className="rdp-gpo-detail">
          <b>{selected}</b>
          <div style={{ color: '#888', fontSize: 11, marginTop: 4 }}>Scope: {GPOS.find(g => g.name === selected)?.scope} · Click Edit to modify settings</div>
          <div className="rdp-gpo-tabs">
            <span className="rdp-gpo-tab active">Scope</span>
            <span className="rdp-gpo-tab">Details</span>
            <span className="rdp-gpo-tab">Settings</span>
            <span className="rdp-gpo-tab">Delegation</span>
          </div>
        </div>
      )}
      <div className="rdp-status-bar">{GPOS.length} GPOs · {GPOS.filter(g => g.status === 'Enabled').length} enabled</div>
    </div>
  );
}

function PanelDNS() {
  const [zone, setZone] = useState<string>('corp.local');
  return (
    <div className="rdp-panel-inner">
      <div className="rdp-panel-hdr">DNS Manager — WIN-DC-01</div>
      <div className="rdp-aduc-body">
        <div className="rdp-aduc-tree">
          <div className="rdp-tree-title">WIN-DC-01</div>
          <div className="rdp-tree-item">📂 Forward Lookup Zones</div>
          {DNS_ZONES.filter(z => z.type !== 'Primary Reverse').map(z => (
            <div key={z.name} className={`rdp-tree-item rdp-tree-indent ${zone === z.name ? 'active' : ''}`} onClick={() => setZone(z.name)}>
              🌐 {z.name}
            </div>
          ))}
          <div className="rdp-tree-item">📂 Reverse Lookup Zones</div>
          {DNS_ZONES.filter(z => z.type === 'Primary Reverse').map(z => (
            <div key={z.name} className={`rdp-tree-item rdp-tree-indent ${zone === z.name ? 'active' : ''}`} onClick={() => setZone(z.name)}>
              🔄 {z.name}
            </div>
          ))}
        </div>
        <div className="rdp-aduc-list">
          <div className="rdp-panel-section" style={{ marginBottom: 8 }}>Zone: {zone}</div>
          <table className="rdp-table rdp-table-compact">
            <thead><tr><th>Name</th><th>Type</th><th>Value</th><th>TTL</th></tr></thead>
            <tbody>
              {DNS_RECORDS.filter(() => zone === 'corp.local').map((r, i) => (
                <tr key={i}><td>{r.name}</td><td><span className="rdp-dns-type">{r.type}</span></td><td>{r.value}</td><td>{r.ttl}</td></tr>
              ))}
              {zone !== 'corp.local' && (
                <tr><td colSpan={4} style={{ color: '#888', textAlign: 'center', padding: 20 }}>PTR records for {zone}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rdp-status-bar">{DNS_ZONES.length} zones · {DNS_RECORDS.length} records in corp.local</div>
    </div>
  );
}

function PanelDHCP() {
  return (
    <div className="rdp-panel-inner">
      <div className="rdp-panel-hdr">DHCP Manager — WIN-DC-01</div>
      <div className="rdp-panel-section">Scopes</div>
      <table className="rdp-table">
        <thead><tr><th>Scope Name</th><th>Range</th><th>Leases</th><th>Available</th><th>Status</th></tr></thead>
        <tbody>
          {DHCP_SCOPES.map((s, i) => (
            <tr key={i}>
              <td>🔌 {s.name}</td>
              <td>{s.range}</td>
              <td>{s.leases}</td>
              <td>{s.available}</td>
              <td className="rdp-green">{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="rdp-panel-section" style={{ marginTop: 16 }}>Recent Leases (LAN Scope)</div>
      <table className="rdp-table rdp-table-compact">
        <thead><tr><th>IP Address</th><th>Client Name</th><th>MAC Address</th><th>Lease Expires</th></tr></thead>
        <tbody>
          {[
            ['192.168.1.101', 'WKSTN-001',      '00:1A:2B:3C:4D:01', '2026-03-18 07:30'],
            ['192.168.1.102', 'WKSTN-002',      '00:1A:2B:3C:4D:02', '2026-03-18 06:45'],
            ['192.168.1.103', 'WKSTN-003',      '00:1A:2B:3C:4D:03', '2026-03-17 14:00'],
            ['192.168.1.120', 'LAPTOP-HR-01',   'AC:16:2D:1E:4F:A0', '2026-03-17 09:00'],
            ['192.168.1.121', 'LAPTOP-SALES-01','AC:16:2D:1E:4F:B1', '2026-03-17 08:50'],
            ['192.168.1.130', 'UNKNOWN',        'F4:5C:89:AB:12:34', '2026-03-17 11:20'],
          ].map(([ip, name, mac, exp]) => (
            <tr key={ip}><td>{ip}</td><td>{name}</td><td>{mac}</td><td>{exp}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PanelPowerShell({ serverName }: { serverName: string }) {
  const [history, setHistory] = useState<string[]>([
    `Windows PowerShell`,
    `Copyright (C) Microsoft Corporation. All rights reserved.`,
    ``,
    `PS C:\\Users\\Administrator> `,
  ]);
  const [input, setInput] = useState('');
  const cmdHistory = useRef<string[]>([]);
  const histIdx = useRef(-1);

  const COMMANDS: Record<string, string[]> = {
    'Get-ADUser -Filter *': AD_USERS.map(u => `Name: ${u.name}  SAMAccountName: ${u.sam}  Enabled: ${u.status === 'Enabled'}`),
    'Get-ADComputer -Filter *': AD_COMPUTERS.map(c => `Name: ${c.name}  DistinguishedName: CN=${c.name},OU=${c.ou},DC=corp,DC=local`),
    'Get-DhcpServerv4Scope -ComputerName localhost': DHCP_SCOPES.map(s => `ScopeId: ${s.name}  State: ${s.status}  ActiveLeases: ${s.leases}`),
    'whoami': [`corp\\administrator`],
    'hostname': [serverName],
    'ipconfig': [`Ethernet adapter LAN:\n  IPv4 Address: 192.168.1.200\n  Subnet Mask: 255.255.255.0\n  Default Gateway: 192.168.1.1`],
    'Get-Service | Where-Object Status -eq Running': SERVER_SERVICES['192.168.1.200'].map(s => `Running  ${s}`),
    'cls': [],
    'clear': [],
    'help': ['Available commands: Get-ADUser, Get-ADComputer, Get-DhcpServerv4Scope, whoami, hostname, ipconfig, Get-Service, cls'],
  };

  const run = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    cmdHistory.current = [trimmed, ...cmdHistory.current.slice(0, 49)];
    histIdx.current = -1;
    if (trimmed === 'cls' || trimmed === 'clear') {
      setHistory([`PS C:\\Users\\Administrator> `]);
      return;
    }
    const out = COMMANDS[trimmed] ?? [`'${trimmed}' is not recognized as a cmdlet. Type 'help' for available commands.`];
    setHistory(h => [...h.filter(l => !l.endsWith('> ')), `PS C:\\Users\\Administrator> ${trimmed}`, ...out, `PS C:\\Users\\Administrator> `]);
  };

  return (
    <div className="rdp-ps-root">
      <div className="rdp-ps-output">
        {history.map((l, i) => <div key={i} className="rdp-ps-line">{l}</div>)}
      </div>
      <input
        className="rdp-ps-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { run(input); setInput(''); }
          else if (e.key === 'ArrowUp') { const ni = Math.min(histIdx.current + 1, cmdHistory.current.length - 1); histIdx.current = ni; setInput(cmdHistory.current[ni] ?? ''); e.preventDefault(); }
          else if (e.key === 'ArrowDown') { const ni = Math.max(histIdx.current - 1, -1); histIdx.current = ni; setInput(ni === -1 ? '' : cmdHistory.current[ni]); e.preventDefault(); }
        }}
        autoFocus
        spellCheck={false}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RemoteDesktop() {
  const [phase, setPhase] = useState<Phase>('dialog');
  const [computer, setComputer] = useState('');
  const [username, setUsername] = useState('Administrator');
  const [password, setPassword] = useState('');
  const [resolution, setResolution] = useState('1920x1080');
  const [connectProgress, setConnectProgress] = useState(0);
  const [connectStep, setConnectStep] = useState('');
  const [connectedTo, setConnectedTo] = useState<SavedServer | null>(null);
  const [selectedSaved, setSelectedSaved] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [serverTime, setServerTime] = useState(new Date());
  const [activePanel, setActivePanel] = useState<Panel>('server-manager');
  const progressRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== 'connected') return;
    const id = setInterval(() => setServerTime(new Date()), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const handleSelectSaved = (server: SavedServer) => {
    setSelectedSaved(server.name);
    setComputer(server.ip);
    setUsername(server.user);
    setResolution(server.resolution);
  };

  const handleConnect = () => {
    if (!computer.trim()) return;
    if (progressRef.current) clearInterval(progressRef.current);
    const found = SAVED_SERVERS.find(s => s.ip === computer.trim() || s.name === computer.trim());
    const target = found ?? { name: computer.trim(), ip: computer.trim(), user: username, resolution };
    setConnectedTo(target);
    setPhase('connecting');
    setConnectProgress(0);
    setActivePanel('server-manager');

    const steps = [
      'Initiating connection…',
      'Negotiating RDP security…',
      'Authenticating credentials…',
      'Loading user profile…',
      'Applying Group Policy…',
      'Starting remote session…',
    ];
    let step = 0;
    setConnectStep(steps[0]);
    progressRef.current = window.setInterval(() => {
      step++;
      setConnectProgress(Math.min((step / steps.length) * 100, 100));
      if (step < steps.length) {
        setConnectStep(steps[step]);
      } else {
        clearInterval(progressRef.current!);
        setTimeout(() => setPhase('connected'), 400);
      }
    }, 600);
  };

  const handleDisconnect = () => {
    if (progressRef.current) clearInterval(progressRef.current);
    setPhase('dialog');
    setConnectedTo(null);
    setConnectProgress(0);
    setPassword('');
  };

  const wallpaper = connectedTo ? (SERVER_WALLPAPERS[connectedTo.ip] ?? SERVER_WALLPAPERS['192.168.1.200']) : '';
  const isDC = connectedTo?.ip === '192.168.1.200';
  const icons = isDC ? DC_ICONS : DEFAULT_ICONS;

  if (phase === 'connecting') {
    return (
      <div className="rdp-connecting">
        <div className="rdp-connecting-icon">🖥️</div>
        <div className="rdp-connecting-title">Remote Desktop Connection</div>
        <div className="rdp-connecting-target">{connectedTo?.name ?? computer}</div>
        <div className="rdp-connecting-step">{connectStep}</div>
        <div className="rdp-connecting-bar-bg">
          <div className="rdp-connecting-bar-fill" style={{ width: `${connectProgress}%` }} />
        </div>
        <div className="rdp-connecting-pct">{Math.round(connectProgress)}%</div>
        <button className="rdp-cancel-btn" onClick={handleDisconnect}>Cancel</button>
      </div>
    );
  }

  if (phase === 'connected' && connectedTo) {
    return (
      <div className="rdp-session" style={{ background: wallpaper }}>
        <div className="rdp-session-bar">
          <span>🔒 {connectedTo.name} ({connectedTo.ip}) · {username} · {connectedTo.resolution}</span>
          <button className="rdp-disconnect-btn" onClick={handleDisconnect}>Disconnect</button>
        </div>

        <div className="rdp-session-body">
          {/* Desktop icons sidebar */}
          <div className="rdp-icon-sidebar">
            {icons.map(ic => (
              <div key={ic.id} className={`rdp-desk-icon ${activePanel === ic.id ? 'rdp-desk-icon-active' : ''}`} onClick={() => setActivePanel(ic.id)}>
                <span className="rdp-desk-icon-img">{ic.icon}</span>
                <span className="rdp-desk-icon-label">{ic.label}</span>
              </div>
            ))}
          </div>

          {/* Management panel area */}
          <div className="rdp-panel-area">
            {activePanel === 'server-manager' && <PanelServerManager ip={connectedTo.ip} />}
            {activePanel === 'aduc'           && <PanelADUC />}
            {activePanel === 'laps'           && <PanelLAPS />}
            {activePanel === 'sccm'           && <PanelSCCM />}
            {activePanel === 'gpo'            && <PanelGPO />}
            {activePanel === 'dns'            && <PanelDNS />}
            {activePanel === 'dhcp'           && <PanelDHCP />}
            {activePanel === 'cmd'            && <PanelPowerShell serverName={connectedTo.name} />}
          </div>
        </div>

        {/* Server taskbar */}
        <div className="rdp-server-taskbar">
          <div className="rdp-server-taskbar-start">⊞</div>
          <div className="rdp-server-taskbar-items">
            {icons.map(ic => (
              <span key={ic.id} className={`rdp-taskbar-item ${activePanel === ic.id ? 'rdp-taskbar-item-active' : ''}`} onClick={() => setActivePanel(ic.id)}>
                {ic.icon} {ic.label}
              </span>
            ))}
          </div>
          <div className="rdp-server-taskbar-clock">
            <div>{serverTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="rdp-clock-date">{serverTime.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' })}</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Dialog phase ──
  return (
    <div className="rdp-root">
      <div className="rdp-header">
        <span className="rdp-header-icon">🖥️</span>
        <div>
          <div className="rdp-header-title">Remote Desktop Connection</div>
          <div className="rdp-header-sub">Connect to a remote computer</div>
        </div>
      </div>

      <div className="rdp-body">
        <div className="rdp-saved-panel">
          <div className="rdp-saved-title">Saved Connections</div>
          {SAVED_SERVERS.map(s => (
            <div
              key={s.name}
              className={`rdp-saved-item ${selectedSaved === s.name ? 'selected' : ''}`}
              onClick={() => handleSelectSaved(s)}
              onDoubleClick={() => { handleSelectSaved(s); setTimeout(handleConnect, 50); }}
            >
              <span className="rdp-saved-icon">🖥️</span>
              <div className="rdp-saved-info">
                <div className="rdp-saved-name">{s.name}</div>
                <div className="rdp-saved-ip">{s.role ?? s.ip}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="rdp-form-panel">
          <div className="rdp-form-section">General</div>

          <div className="rdp-form-row">
            <label className="rdp-label">Computer:</label>
            <input className="rdp-input" value={computer} onChange={e => setComputer(e.target.value)}
              placeholder="IP address or hostname" onKeyDown={e => e.key === 'Enter' && handleConnect()} />
          </div>

          <div className="rdp-form-row">
            <label className="rdp-label">Username:</label>
            <input className="rdp-input" value={username} onChange={e => setUsername(e.target.value)} />
          </div>

          <div className="rdp-form-row">
            <label className="rdp-label">Password:</label>
            <div className="rdp-pw-wrap">
              <input className="rdp-input" type={showPassword ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleConnect()} />
              <button className="rdp-pw-toggle" onClick={() => setShowPassword(p => !p)}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="rdp-form-section" style={{ marginTop: 16 }}>Display</div>

          <div className="rdp-form-row">
            <label className="rdp-label">Resolution:</label>
            <select className="rdp-select" value={resolution} onChange={e => setResolution(e.target.value)}>
              {RESOLUTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="rdp-form-row">
            <label className="rdp-label">Color depth:</label>
            <select className="rdp-select" defaultValue="32">
              <option value="15">High Color (15 bit)</option>
              <option value="16">High Color (16 bit)</option>
              <option value="24">True Color (24 bit)</option>
              <option value="32">Highest Quality (32 bit)</option>
            </select>
          </div>

          <div className="rdp-checkrow">
            <input type="checkbox" id="rdp-fullscreen" defaultChecked />
            <label htmlFor="rdp-fullscreen">Display the connection bar when in full screen mode</label>
          </div>

          <div className="rdp-form-section" style={{ marginTop: 16 }}>Local Resources</div>
          <div className="rdp-checkrow">
            <input type="checkbox" id="rdp-clipboard" defaultChecked />
            <label htmlFor="rdp-clipboard">Clipboard</label>
          </div>
          <div className="rdp-checkrow">
            <input type="checkbox" id="rdp-printers" defaultChecked />
            <label htmlFor="rdp-printers">Printers</label>
          </div>
          <div className="rdp-checkrow">
            <input type="checkbox" id="rdp-drives" />
            <label htmlFor="rdp-drives">Local disk drives</label>
          </div>

          <div className="rdp-btn-row">
            <button className="rdp-save-btn" onClick={() => {}}>Save</button>
            <button className="rdp-connect-btn" onClick={handleConnect} disabled={!computer.trim()}>Connect</button>
          </div>
        </div>
      </div>
    </div>
  );
}
