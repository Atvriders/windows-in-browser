import { useState, useMemo } from 'react';
import './EventViewer.css';

type Level = 'Information' | 'Warning' | 'Error' | 'Critical' | 'Verbose';
type LogName = 'Application' | 'Security' | 'System' | 'Setup' | 'Forwarded Events';

interface EventEntry {
  id: number;
  level: Level;
  date: string;
  source: string;
  eventId: number;
  taskCategory: string;
  description: string;
  log: LogName;
}

function makeDate(daysAgo: number, h: number, m: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const EVENTS: EventEntry[] = [
  // System
  { id: 1,  level: 'Information', date: makeDate(0,9,5),  source: 'Service Control Manager', eventId: 7036, taskCategory: 'None', description: 'The Windows Update service entered the running state.', log: 'System' },
  { id: 2,  level: 'Information', date: makeDate(0,8,55), source: 'Kernel-Power',             eventId: 41,   taskCategory: '(63)', description: 'The system has rebooted without cleanly shutting down first.', log: 'System' },
  { id: 3,  level: 'Warning',     date: makeDate(0,8,10), source: 'W32Time',                  eventId: 36,   taskCategory: 'None', description: 'The time service has not synchronized the system time for 86400 seconds because none of the time service providers provided a usable time stamp.', log: 'System' },
  { id: 4,  level: 'Error',       date: makeDate(0,7,30), source: 'DCOM',                     eventId: 10016,taskCategory: 'None', description: 'The application-specific permission settings do not grant Local Activation permission for the COM Server application with CLSID {D63B10C5-BB46-4990-A94F-E40B9D520160}.', log: 'System' },
  { id: 5,  level: 'Information', date: makeDate(0,6,20), source: 'EventLog',                 eventId: 6013, taskCategory: 'None', description: 'The system uptime is 25263 seconds.', log: 'System' },
  { id: 6,  level: 'Warning',     date: makeDate(1,14,33),source: 'Disk',                     eventId: 51,   taskCategory: 'None', description: 'An error was detected on device \\Device\\Harddisk0\\DR0 during a paging operation.', log: 'System' },
  { id: 7,  level: 'Information', date: makeDate(1,10,5), source: 'Service Control Manager',  eventId: 7040, taskCategory: 'None', description: 'The start type of the Windows Defender Antivirus Service service was changed from auto start to demand start.', log: 'System' },
  { id: 8,  level: 'Error',       date: makeDate(2,16,44),source: 'srv',                      eventId: 2017, taskCategory: 'None', description: 'The server was unable to allocate from the system nonpaged pool because the pool was empty.', log: 'System' },
  { id: 9,  level: 'Information', date: makeDate(2,9,0),  source: 'Kernel-General',           eventId: 13,   taskCategory: 'None', description: 'The operating system started at system time 2026-03-15T09:00:00.000000000Z.', log: 'System' },
  { id: 10, level: 'Warning',     date: makeDate(3,11,22),source: 'NDP',                      eventId: 1026, taskCategory: 'None', description: '.NET Runtime version 4.8.4690/W — Application: chrome.exe — Fatal Execution Engine Exception.', log: 'System' },
  // Application
  { id: 11, level: 'Information', date: makeDate(0,9,15), source: 'MsiInstaller',             eventId: 11724,taskCategory: 'None', description: 'Product: Microsoft Edge Update Helper -- Installation completed successfully.', log: 'Application' },
  { id: 12, level: 'Error',       date: makeDate(0,8,44), source: 'Application Error',        eventId: 1000, taskCategory: '(100)', description: 'Faulting application name: Discord.exe, version: 1.0.9032.0, faulting module: ntdll.dll. Exception code: 0xc0000374.', log: 'Application' },
  { id: 13, level: 'Warning',     date: makeDate(0,8,12), source: 'Windows Error Reporting',  eventId: 1001, taskCategory: 'None', description: 'Fault bucket 123456789, type 4. Event Name: BEX64. Application: chrome.exe.', log: 'Application' },
  { id: 14, level: 'Information', date: makeDate(1,15,0), source: 'VSS',                      eventId: 8194, taskCategory: 'None', description: 'Volume Shadow Copy Service error: Unexpected error querying for the IVssWriterCallback interface.', log: 'Application' },
  { id: 15, level: 'Error',       date: makeDate(1,13,8), source: '.NET Runtime',             eventId: 1026, taskCategory: 'None', description: 'Application: node.exe — .NET Framework version 4.8.4690 — Fatal Execution Engine Exception.', log: 'Application' },
  { id: 16, level: 'Information', date: makeDate(1,10,30),source: 'MsiInstaller',             eventId: 11707,taskCategory: 'None', description: 'Product: 7-Zip 23.01 -- Installation operation completed successfully.', log: 'Application' },
  { id: 17, level: 'Warning',     date: makeDate(2,8,55), source: 'SecurityCenter',           eventId: 16,   taskCategory: 'None', description: 'Windows Defender is turned off. Windows Firewall is active. No antivirus is actively protecting your PC.', log: 'Application' },
  { id: 18, level: 'Information', date: makeDate(2,8,0),  source: 'Microsoft-Windows-Perflib',eventId: 2004, taskCategory: 'None', description: 'Windows cannot open the database file for the performance counters.', log: 'Application' },
  // Security
  { id: 19, level: 'Information', date: makeDate(0,9,5),  source: 'Microsoft-Windows-Security-Auditing', eventId: 4624, taskCategory: 'Logon', description: 'An account was successfully logged on. Subject: Security ID: SYSTEM, Account Name: DESKTOP-WIN10$.', log: 'Security' },
  { id: 20, level: 'Information', date: makeDate(0,8,50), source: 'Microsoft-Windows-Security-Auditing', eventId: 4634, taskCategory: 'Logoff', description: 'An account was logged off. Subject: Account Name: User, Logon Type: 2.', log: 'Security' },
  { id: 21, level: 'Warning',     date: makeDate(0,3,22), source: 'Microsoft-Windows-Security-Auditing', eventId: 4625, taskCategory: 'Logon', description: 'An account failed to log on. Subject: Account Name: User. Logon Type: 2. Status: 0xC000006D (wrong password).', log: 'Security' },
  { id: 22, level: 'Information', date: makeDate(1,14,10),source: 'Microsoft-Windows-Security-Auditing', eventId: 4688, taskCategory: 'Process Creation', description: 'A new process has been created. Creator Subject: User. New Process Name: C:\\Windows\\System32\\cmd.exe.', log: 'Security' },
  { id: 23, level: 'Information', date: makeDate(1,11,5), source: 'Microsoft-Windows-Security-Auditing', eventId: 4689, taskCategory: 'Process Termination', description: 'A process has exited. Process Name: C:\\Windows\\System32\\svchost.exe. Exit Status: 0x0.', log: 'Security' },
  { id: 24, level: 'Warning',     date: makeDate(2,2,14), source: 'Microsoft-Windows-Security-Auditing', eventId: 4776, taskCategory: 'Credential Validation', description: 'The computer attempted to validate the credentials for an account. Authentication Package: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0.', log: 'Security' },
  // Setup
  { id: 25, level: 'Information', date: makeDate(5,3,0),  source: 'Microsoft-Windows-Servicing', eventId: 4, taskCategory: 'None', description: 'Package KB5053606 was successfully staged for installation.', log: 'Setup' },
  { id: 26, level: 'Information', date: makeDate(5,3,10), source: 'Microsoft-Windows-Servicing', eventId: 4, taskCategory: 'None', description: 'Package KB5053606 was successfully installed.', log: 'Setup' },
  { id: 27, level: 'Warning',     date: makeDate(5,2,55), source: 'Microsoft-Windows-Servicing', eventId: 8, taskCategory: 'None', description: 'CBS operation failed with HRESULT: 0x800F0825 — Package corrupt.', log: 'Setup' },
  // More System
  { id: 28, level: 'Error',       date: makeDate(4,20,10),source: 'Ntfs',                     eventId: 55,   taskCategory: 'None', description: 'The file system structure on the disk is corrupt and unusable. Please run the chkdsk utility on the volume \\Device\\HarddiskVolume3.', log: 'System' },
  { id: 29, level: 'Information', date: makeDate(4,18,5), source: 'Browser',                  eventId: 8033, taskCategory: 'None', description: 'The browser has forced an election on network \\Device\\NetBT_Tcpip.', log: 'System' },
  { id: 30, level: 'Warning',     date: makeDate(3,7,48), source: 'NetBT',                    eventId: 4321, taskCategory: 'None', description: 'The name "WORKGROUP:1d" could not be registered on the interface with IP address 192.168.1.105.', log: 'System' },
  { id: 31, level: 'Information', date: makeDate(0,10,2), source: 'WinDefend',                eventId: 1116, taskCategory: 'None', description: 'Microsoft Defender Antivirus has detected malware or other potentially unwanted software. Name: Trojan:Win32/Casdet!rfn.', log: 'System' },
  { id: 32, level: 'Critical',    date: makeDate(7,3,44), source: 'Kernel-Power',             eventId: 41,   taskCategory: '(63)', description: 'The system has rebooted without cleanly shutting down. This error could be caused by sudden power loss, a hardware failure, or a system crash.', log: 'System' },
  { id: 33, level: 'Error',       date: makeDate(6,15,22),source: 'DistributedCOM',           eventId: 10005,taskCategory: 'None', description: 'DCOM got error "1115" attempting to start the service WpnService with arguments "" in order to run the server.', log: 'System' },
  { id: 34, level: 'Warning',     date: makeDate(6,11,0), source: 'Schannel',                 eventId: 36871,taskCategory: 'None', description: 'A fatal error occurred while creating a TLS client credential. The internal error state is 10013.', log: 'System' },
  { id: 35, level: 'Information', date: makeDate(0,11,0), source: 'Service Control Manager',  eventId: 7036, taskCategory: 'None', description: 'The Print Spooler service entered the running state.', log: 'System' },
  // More Application
  { id: 36, level: 'Error',       date: makeDate(3,9,5),  source: 'Application Error',        eventId: 1000, taskCategory: '(100)', description: 'Faulting application: Spotify.exe, version: 1.2.27.0, faulting module: libcef.dll. Exception code: 0xc0000005.', log: 'Application' },
  { id: 37, level: 'Information', date: makeDate(0,9,30), source: 'ESENT',                    eventId: 326,  taskCategory: 'None', description: 'svchost (6832) Database Recovery/Restore: The database engine has begun replaying log file C:\\ProgramData\\Microsoft\\Search\\Data\\Applications\\Windows\\MSSearch.log.', log: 'Application' },
  { id: 38, level: 'Warning',     date: makeDate(1,16,0), source: 'User Profile Service',     eventId: 1509, taskCategory: 'None', description: 'Windows cannot copy file C:\\Users\\User\\AppData\\Local to location C:\\Users\\User\\AppData\\Roaming. Possible causes of this error include network problems or insufficient security rights.', log: 'Application' },
  { id: 39, level: 'Information', date: makeDate(0,8,0),  source: 'Search',                  eventId: 1002, taskCategory: 'None', description: 'The Windows Search Service has successfully completed full-text indexing of all indexed locations.', log: 'Application' },
  { id: 40, level: 'Error',       date: makeDate(8,21,5), source: 'SideBySide',               eventId: 33,   taskCategory: 'None', description: 'Activation context generation failed for "C:\\Windows\\WinSxS\\amd64_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9258_none_08e4a0fb51a3b2ec\\MSVCR90.dll".', log: 'Application' },
  { id: 41, level: 'Critical',    date: makeDate(14,4,0), source: 'Application Hang',         eventId: 1002, taskCategory: 'Hanging Events', description: 'The program node.exe version 20.11.0.0 stopped interacting with Windows and was closed. To see if more information about the problem is available, check the problem history.', log: 'Application' },
  // More Security
  { id: 42, level: 'Information', date: makeDate(0,9,0),  source: 'Microsoft-Windows-Security-Auditing', eventId: 4672, taskCategory: 'Special Logon', description: 'Special privileges assigned to new logon. Subject: Account Name: User.', log: 'Security' },
  { id: 43, level: 'Warning',     date: makeDate(3,22,5), source: 'Microsoft-Windows-Security-Auditing', eventId: 4648, taskCategory: 'Logon', description: 'A logon was attempted using explicit credentials. Subject: Account Name: User. Target Account: Administrator@192.168.1.200.', log: 'Security' },
  { id: 44, level: 'Information', date: makeDate(2,10,15),source: 'Microsoft-Windows-Security-Auditing', eventId: 4720, taskCategory: 'User Account Management', description: 'A user account was created. Subject: Account Name: User. New Account Name: BackupAdmin.', log: 'Security' },
  { id: 45, level: 'Information', date: makeDate(1,9,0),  source: 'Microsoft-Windows-Security-Auditing', eventId: 4732, taskCategory: 'Security Group Management', description: 'A member was added to a security-enabled local group. Group Name: Administrators.', log: 'Security' },
  { id: 46, level: 'Warning',     date: makeDate(0,2,33), source: 'Microsoft-Windows-Security-Auditing', eventId: 4625, taskCategory: 'Logon', description: 'An account failed to log on. Failure reason: Unknown user name or bad password. Workstation: UNKNOWN-PC.', log: 'Security' },
  { id: 47, level: 'Information', date: makeDate(0,8,45), source: 'Microsoft-Windows-Security-Auditing', eventId: 4611, taskCategory: 'Logon', description: 'A trusted logon process has been registered with the Local Security Authority.', log: 'Security' },
  // Setup
  { id: 48, level: 'Information', date: makeDate(35,4,0), source: 'Microsoft-Windows-Servicing', eventId: 4, taskCategory: 'None', description: 'Package KB5049981 was successfully installed.', log: 'Setup' },
  { id: 49, level: 'Information', date: makeDate(35,4,10),source: 'Microsoft-Windows-Servicing', eventId: 4, taskCategory: 'None', description: 'Package KB2267602 was successfully installed (Definition Update).', log: 'Setup' },
  // Forwarded
  { id: 50, level: 'Warning',     date: makeDate(0,7,10), source: 'Microsoft-Windows-Security-Auditing', eventId: 4625, taskCategory: 'Logon', description: 'Forwarded from WIN-SERVER-2022: Account failed to logon. Account Name: Administrator. Failure Code: 0xC000006A.', log: 'Forwarded Events' },
  { id: 51, level: 'Error',       date: makeDate(1,11,5), source: 'Service Control Manager',  eventId: 7024, taskCategory: 'None', description: 'Forwarded from DB-CLUSTER-01: The MySQL service terminated with service-specific error 1067.', log: 'Forwarded Events' },
  { id: 52, level: 'Information', date: makeDate(0,9,30), source: 'Windows Update',           eventId: 19,   taskCategory: 'Windows Update Agent', description: 'Installation Successful: Windows successfully installed update KB5053606.', log: 'System' },
  { id: 53, level: 'Warning',     date: makeDate(4,5,20), source: 'Time-Service',             eventId: 129,  taskCategory: 'None', description: 'NtpClient was unable to set a domain peer to use as a time source due to a name resolution failure on dns.google.', log: 'System' },
  { id: 54, level: 'Information', date: makeDate(0,11,15),source: 'Microsoft-Windows-WMI',   eventId: 5858, taskCategory: 'None', description: 'Id = {00000000-0000-0000-0000-000000000000}; ClientMachine = DESKTOP-WIN10; User = User; ClientProcessId = 6780.', log: 'System' },
  { id: 55, level: 'Error',       date: makeDate(3,12,0), source: 'IISExpress',               eventId: 2268, taskCategory: 'None', description: 'Application pool ASPNET v4.0 Classic could not be started. The IIS process model configuration failed. The application pool identity may be invalid.', log: 'Application' },
  { id: 56, level: 'Information', date: makeDate(0,10,10),source: 'WinRM',                   eventId: 10148,taskCategory: 'None', description: 'The WinRM service is listening for WS-Management requests.', log: 'System' },
  { id: 57, level: 'Warning',     date: makeDate(2,18,44),source: 'Userenv',                  eventId: 1085, taskCategory: 'None', description: 'Windows failed to apply the Group Policy Folders settings. The processing of Group Policy failed due to a problem with the network.', log: 'System' },
  { id: 58, level: 'Information', date: makeDate(1,6,0),  source: 'Microsoft-Windows-WindowsUpdateClient', eventId: 19, taskCategory: 'Windows Update Agent', description: 'Installation Successful: Windows successfully installed the following update: Definition Update for Windows Defender Antivirus.', log: 'System' },
  { id: 59, level: 'Error',       date: makeDate(10,3,5), source: 'WAS',                      eventId: 5010, taskCategory: 'None', description: 'A process serving application pool DefaultAppPool suffered a fatal communication error with the Windows Process Activation Service.', log: 'Application' },
  { id: 60, level: 'Information', date: makeDate(0,9,20), source: 'EventLog',                 eventId: 6009, taskCategory: 'None', description: 'Microsoft (R) Windows (R) 10.00.19045 Multiprocessor Free.', log: 'System' },
  { id: 61, level: 'Warning',     date: makeDate(0,8,30), source: 'PerfNet',                  eventId: 2004, taskCategory: 'None', description: 'Unable to open the Server service performance object. The first four bytes (DWORD) of the Data section contains the error code.', log: 'System' },
  { id: 62, level: 'Information', date: makeDate(0,7,5),  source: 'Service Control Manager',  eventId: 7036, taskCategory: 'None', description: 'The Remote Registry service entered the stopped state.', log: 'System' },
  { id: 63, level: 'Critical',    date: makeDate(20,5,0), source: 'Kernel-Power',             eventId: 41,   taskCategory: '(63)', description: 'The system has rebooted without cleanly shutting down first. This error could be caused by sudden power loss or a hardware failure.', log: 'System' },
];

const TREE_NODES = [
  { id: 'root', label: 'Event Viewer (Local)', level: 0, expandable: true },
  { id: 'custom', label: 'Custom Views', level: 1, expandable: false },
  { id: 'windows-logs', label: 'Windows Logs', level: 1, expandable: true },
  { id: 'Application', label: 'Application', level: 2, expandable: false },
  { id: 'Security', label: 'Security', level: 2, expandable: false },
  { id: 'System', label: 'System', level: 2, expandable: false },
  { id: 'Setup', label: 'Setup', level: 2, expandable: false },
  { id: 'Forwarded Events', label: 'Forwarded Events', level: 2, expandable: false },
  { id: 'apps-services', label: 'Applications and Services Logs', level: 1, expandable: false },
];

const RIGHT_ACTIONS = ['Open Saved Log…', 'Create Custom View…', 'Import Custom View…', 'Clear Log…', 'Filter Current Log…', 'Properties', 'Find…', 'Save All Events As…', 'Attach a Task To this Log…', 'View', 'Refresh', 'Help'];

function levelIcon(level: Level) {
  if (level === 'Error' || level === 'Critical') return '🔴';
  if (level === 'Warning') return '⚠️';
  return 'ℹ️';
}
function levelColor(level: Level) {
  if (level === 'Error') return '#e74c3c';
  if (level === 'Critical') return '#c0392b';
  if (level === 'Warning') return '#e67e22';
  if (level === 'Verbose') return '#95a5a6';
  return '#2980b9';
}

export default function EventViewer() {
  const [selectedNode, setSelectedNode] = useState<string>('System');
  const [selectedEvent, setSelectedEvent] = useState<EventEntry | null>(null);
  const [xmlTab, setXmlTab] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root', 'windows-logs']));

  const displayed = useMemo(() => {
    if (['Application', 'Security', 'System', 'Setup', 'Forwarded Events'].includes(selectedNode)) {
      return EVENTS.filter(e => e.log === selectedNode);
    }
    return EVENTS;
  }, [selectedNode]);

  const toggleNode = (id: string) => {
    setExpandedNodes(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const xmlView = selectedEvent ? `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="${selectedEvent.source}" />
    <EventID>${selectedEvent.eventId}</EventID>
    <Level>${['Verbose','Information','Warning','Error','Critical'].indexOf(selectedEvent.level)}</Level>
    <TimeCreated SystemTime="${new Date().toISOString()}" />
    <EventRecordID>${selectedEvent.id}</EventRecordID>
    <Execution ProcessID="4" ThreadID="48" />
    <Computer>DESKTOP-WIN10</Computer>
  </System>
  <EventData>
    <Data Name="Description">${selectedEvent.description}</Data>
  </EventData>
</Event>` : '';

  return (
    <div className="ev-root">
      {/* Left tree */}
      <div className="ev-left">
        <div className="ev-left-title">Event Viewer</div>
        {TREE_NODES.map(node => {
          const isLogNode = ['Application', 'Security', 'System', 'Setup', 'Forwarded Events'].includes(node.id);
          const count = isLogNode ? EVENTS.filter(e => e.log === node.id).length : 0;
          return (
            <div
              key={node.id}
              className={`ev-tree-item ev-tree-level-${node.level} ${selectedNode === node.id ? 'active' : ''}`}
              onClick={() => {
                if (node.expandable) toggleNode(node.id);
                setSelectedNode(node.id);
              }}
            >
              {node.expandable && (
                <span className="ev-tree-caret">{expandedNodes.has(node.id) ? '▼' : '▶'}</span>
              )}
              {!node.expandable && <span className="ev-tree-caret" />}
              <span className="ev-tree-icon">
                {node.id === 'root' ? '📋' : isLogNode ? '📄' : '📁'}
              </span>
              <span className="ev-tree-label">{node.label}</span>
              {count > 0 && <span className="ev-tree-count">{count}</span>}
            </div>
          );
        })}
      </div>

      {/* Center */}
      <div className="ev-center">
        <div className="ev-center-title">{selectedNode} — {displayed.length} events</div>

        {/* Event list */}
        <div className="ev-event-list">
          <div className="ev-list-header">
            <span className="ev-col-level">Level</span>
            <span className="ev-col-date">Date and Time</span>
            <span className="ev-col-source">Source</span>
            <span className="ev-col-id">Event ID</span>
            <span className="ev-col-task">Task Category</span>
          </div>
          <div className="ev-list-body">
            {displayed.map(ev => (
              <div
                key={ev.id}
                className={`ev-event-row ${selectedEvent?.id === ev.id ? 'selected' : ''}`}
                onClick={() => { setSelectedEvent(ev); setXmlTab(false); }}
              >
                <span className="ev-col-level">
                  <span className="ev-level-icon">{levelIcon(ev.level)}</span>
                  <span style={{ color: levelColor(ev.level), fontSize: 11 }}>{ev.level}</span>
                </span>
                <span className="ev-col-date">{ev.date}</span>
                <span className="ev-col-source">{ev.source}</span>
                <span className="ev-col-id">{ev.eventId}</span>
                <span className="ev-col-task">{ev.taskCategory}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Event detail */}
        {selectedEvent && (
          <div className="ev-detail">
            <div className="ev-detail-tabs">
              <button className={`ev-detail-tab ${!xmlTab ? 'active' : ''}`} onClick={() => setXmlTab(false)}>General</button>
              <button className={`ev-detail-tab ${xmlTab ? 'active' : ''}`} onClick={() => setXmlTab(true)}>Details (XML)</button>
            </div>
            {!xmlTab ? (
              <div className="ev-detail-general">
                <div className="ev-detail-desc">{selectedEvent.description}</div>
                <div className="ev-detail-meta">
                  <div className="ev-meta-row"><span>Log Name:</span><span>{selectedEvent.log}</span></div>
                  <div className="ev-meta-row"><span>Source:</span><span>{selectedEvent.source}</span></div>
                  <div className="ev-meta-row"><span>Event ID:</span><span>{selectedEvent.eventId}</span></div>
                  <div className="ev-meta-row"><span>Level:</span><span style={{ color: levelColor(selectedEvent.level) }}>{selectedEvent.level}</span></div>
                  <div className="ev-meta-row"><span>Date:</span><span>{selectedEvent.date}</span></div>
                  <div className="ev-meta-row"><span>Computer:</span><span>DESKTOP-WIN10</span></div>
                </div>
              </div>
            ) : (
              <pre className="ev-xml">{xmlView}</pre>
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="ev-right">
        <div className="ev-right-section">Actions</div>
        {RIGHT_ACTIONS.map(a => (
          <div key={a} className={`ev-right-action ${a === 'View' || a === 'Help' ? 'ev-right-section-sub' : ''}`}>
            {a}
          </div>
        ))}
      </div>
    </div>
  );
}
