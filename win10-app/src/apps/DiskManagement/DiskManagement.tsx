import './DiskManagement.css';

const VOLUMES = [
  { letter: 'C:', label: 'Windows', fs: 'NTFS', status: 'Healthy (Boot, Page File, Crash Dump, Primary Partition)', total: 512, used: 180, type: 'System' },
  { letter: 'D:', label: 'Data', fs: 'NTFS', status: 'Healthy (Primary Partition)', total: 512, used: 220, type: 'Data' },
  { letter: 'E:', label: 'Storage', fs: 'NTFS', status: 'Healthy (Primary Partition)', total: 2000, used: 850, type: 'Storage' },
  { letter: 'F:', label: 'Backup', fs: 'NTFS', status: 'Healthy (Primary Partition)', total: 1000, used: 340, type: 'Backup' },
];

const DISKS = [
  {
    id: 'Disk 0',
    type: 'SSD',
    size: '512 GB',
    partitions: [
      { letter: '', label: 'EFI System Partition', size: 0.05, color: '#90c0ff', fs: 'FAT32' },
      { letter: 'C:', label: 'Windows', size: 0.5, color: '#5a9fd4', fs: 'NTFS' },
      { letter: 'D:', label: 'Data', size: 0.45, color: '#4a8fc4', fs: 'NTFS' },
    ],
  },
  {
    id: 'Disk 1',
    type: 'HDD',
    size: '2 TB',
    partitions: [
      { letter: 'E:', label: 'Storage', size: 0.6, color: '#6aaf6a', fs: 'NTFS' },
      { letter: 'F:', label: 'Backup', size: 0.4, color: '#5a9f5a', fs: 'NTFS' },
    ],
  },
];

export default function DiskManagement() {
  return (
    <div className="dsk-root">
      <div className="dsk-menubar">
        {['File', 'Action', 'View', 'Help'].map(m => (
          <span key={m} className="dsk-menu">{m}</span>
        ))}
      </div>

      {/* Volume list */}
      <div className="dsk-volume-list">
        <div className="dsk-list-header">
          <span>Volume</span><span>Layout</span><span>Type</span><span>File System</span>
          <span>Status</span><span>Capacity</span><span>Free Space</span><span>% Free</span>
        </div>
        {VOLUMES.map(v => {
          const free = v.total - v.used;
          const pct = Math.round((free / v.total) * 100);
          return (
            <div key={v.letter} className="dsk-list-row">
              <span>{v.letter} {v.label}</span>
              <span>Simple</span>
              <span>Basic</span>
              <span>{v.fs}</span>
              <span className="dsk-healthy">Healthy</span>
              <span>{v.total >= 1000 ? (v.total / 1000).toFixed(1) + ' TB' : v.total + ' GB'}</span>
              <span>{free >= 1000 ? (free / 1000).toFixed(1) + ' TB' : free + ' GB'}</span>
              <span>{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Disk layout */}
      <div className="dsk-disk-section">
        {DISKS.map(disk => (
          <div key={disk.id} className="dsk-disk-row">
            <div className="dsk-disk-info">
              <div className="dsk-disk-id">{disk.id}</div>
              <div className="dsk-disk-type">{disk.type}</div>
              <div className="dsk-disk-size">{disk.size}</div>
              <div className="dsk-disk-online">Online</div>
            </div>
            <div className="dsk-partitions">
              {disk.partitions.map(p => (
                <div
                  key={p.letter || p.label}
                  className="dsk-partition"
                  style={{ flex: p.size, background: p.color }}
                  title={`${p.letter} ${p.label} · ${p.fs}`}
                >
                  <div className="dsk-part-letter">{p.letter}</div>
                  <div className="dsk-part-label">{p.label}</div>
                  <div className="dsk-part-fs">{p.fs}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
