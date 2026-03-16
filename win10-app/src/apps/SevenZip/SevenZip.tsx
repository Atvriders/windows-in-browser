import { useState } from 'react';
import './SevenZip.css';

interface FsItem { name: string; size: string; type: string; date: string; icon: string; isDir: boolean; }

const DRIVES: FsItem[] = [
  { name: 'C:\\', size: '346.2 GB', type: 'Local Disk', date: '', icon: '💿', isDir: true },
  { name: 'D:\\', size: '1.84 TB', type: 'Local Disk', date: '', icon: '💿', isDir: true },
  { name: 'E:\\', size: '1.72 TB', type: 'Local Disk', date: '', icon: '💿', isDir: true },
  { name: 'F:\\', size: '6.21 TB', type: 'Local Disk', date: '', icon: '💾', isDir: true },
  { name: 'G:\\', size: '842 GB', type: 'Local Disk', date: '', icon: '💿', isDir: true },
];

const C_ROOT: FsItem[] = [
  { name: 'Program Files', size: '', type: 'Folder', date: '2024-01-15 09:22', icon: '📁', isDir: true },
  { name: 'Program Files (x86)', size: '', type: 'Folder', date: '2024-01-15 09:22', icon: '📁', isDir: true },
  { name: 'Users', size: '', type: 'Folder', date: '2024-01-15 09:22', icon: '📁', isDir: true },
  { name: 'Windows', size: '', type: 'Folder', date: '2024-01-15 09:22', icon: '📁', isDir: true },
  { name: 'ProgramData', size: '', type: 'Folder', date: '2024-01-15 09:22', icon: '📁', isDir: true },
  { name: 'pagefile.sys', size: '8.00 GB', type: 'SYS File', date: '2025-03-15 00:00', icon: '📄', isDir: false },
  { name: 'hiberfil.sys', size: '6.40 GB', type: 'SYS File', date: '2025-03-15 00:00', icon: '📄', isDir: false },
  { name: 'bootmgr', size: '405 KB', type: 'File', date: '2024-01-15 09:22', icon: '📄', isDir: false },
];

const DOWNLOADS: FsItem[] = [
  { name: 'Steam_Setup.exe', size: '3.4 MB', type: 'Application', date: '2025-03-10 14:22', icon: '⚙️', isDir: false },
  { name: 'ChromeSetup.exe', size: '1.2 MB', type: 'Application', date: '2025-03-08 11:05', icon: '⚙️', isDir: false },
  { name: 'OBSStudio-30.0.2.exe', size: '98.4 MB', type: 'Application', date: '2025-03-07 09:12', icon: '⚙️', isDir: false },
  { name: 'vacation_photos_2024.zip', size: '2.41 GB', type: '7-Zip Archive', date: '2025-02-28 22:11', icon: '🗜️', isDir: false },
  { name: 'project_backup.zip', size: '484 MB', type: '7-Zip Archive', date: '2025-03-01 18:44', icon: '🗜️', isDir: false },
  { name: 'ubuntu-22.04.iso', size: '4.70 GB', type: 'Disc Image', date: '2025-01-20 16:32', icon: '💿', isDir: false },
  { name: 'drivers_rtx4070.zip', size: '722 MB', type: '7-Zip Archive', date: '2025-02-14 10:28', icon: '🗜️', isDir: false },
  { name: 'invoice_march_2025.pdf', size: '284 KB', type: 'PDF Document', date: '2025-03-12 08:00', icon: '📋', isDir: false },
];

const PATH_MAP: Record<string, FsItem[]> = {
  '\\': DRIVES,
  'C:\\': C_ROOT,
  'C:\\Users\\User\\Downloads\\': DOWNLOADS,
};

export default function SevenZip() {
  const [path, setPath] = useState('\\');
  const [selected, setSelected] = useState<string | null>(null);
  const items = PATH_MAP[path] ?? C_ROOT;

  const navigate = (item: FsItem) => {
    if (!item.isDir) return;
    if (item.name === 'C:\\') setPath('C:\\');
    else if (item.name === 'Users' && path === 'C:\\') setPath('C:\\Users\\User\\Downloads\\');
    else setPath(path + item.name + '\\');
  };

  const goUp = () => {
    if (path === '\\') return;
    if (path === 'C:\\') setPath('\\');
    else setPath('C:\\');
  };

  return (
    <div className="sz-root">
      <div className="sz-toolbar">
        {[['⬆️','Up'],['📋','Copy'],['✂️','Move'],['🗑️','Delete'],['ℹ️','Info'],['📂','Extract'],['🗜️','Add'],['🔧','Test'],['⚙️','Properties']].map(([icon, label]) => (
          <button key={label} className="sz-btn"><span className="sz-btn-icon">{icon}</span>{label}</button>
        ))}
      </div>
      <div className="sz-addr">
        <span className="sz-addr-label">Path:</span>
        <input className="sz-addr-input" value={path} readOnly />
        <button className="sz-btn" style={{ flexDirection: 'row', minWidth: 'auto', padding: '3px 8px' }} onClick={goUp}>⬆ Up</button>
      </div>
      <div className="sz-col-headers">
        <span className="sz-col-name">Name</span>
        <span className="sz-col-size">Size</span>
        <span className="sz-col-type">Type</span>
        <span className="sz-col-date">Modified</span>
      </div>
      <div className="sz-list">
        {items.map(item => (
          <div key={item.name} className={`sz-row ${selected === item.name ? 'selected' : ''}`} onClick={() => setSelected(item.name)} onDoubleClick={() => navigate(item)}>
            <span className="sz-icon">{item.icon}</span>
            <span className="sz-col-name">{item.name}</span>
            <span className="sz-col-size">{item.size}</span>
            <span className="sz-col-type">{item.type}</span>
            <span className="sz-col-date">{item.date}</span>
          </div>
        ))}
      </div>
      <div className="sz-status">{items.length} objects | {items.filter(i => !i.isDir).length} files selected: {selected ?? 'none'}</div>
    </div>
  );
}
