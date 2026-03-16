import { useState } from 'react';
import './RegistryEditor.css';

interface RegKey { name: string; children?: RegKey[]; values?: RegValue[]; }
interface RegValue { name: string; type: 'REG_SZ' | 'REG_DWORD' | 'REG_BINARY' | 'REG_EXPAND_SZ'; data: string; }

const REGISTRY: RegKey[] = [
  {
    name: 'HKEY_CLASSES_ROOT', children: [
      { name: 'Directory', children: [
        { name: 'shell', children: [{ name: 'open' }, { name: 'explore' }] },
      ]},
      { name: 'exefile', children: [{ name: 'shell', children: [{ name: 'open' }] }] },
    ],
  },
  {
    name: 'HKEY_CURRENT_USER', children: [
      { name: 'Software', children: [
        { name: 'Microsoft', children: [
          { name: 'Windows', children: [
            { name: 'CurrentVersion', children: [
              { name: 'Run', values: [
                { name: 'Discord', type: 'REG_SZ', data: 'C:\\Users\\User\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe' },
                { name: 'Spotify', type: 'REG_SZ', data: 'C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe' },
              ]},
              { name: 'Explorer', values: [
                { name: 'Shell Folders', type: 'REG_SZ', data: '' },
              ]},
            ]},
          ]},
          { name: 'Office', children: [{ name: '16.0' }] },
        ]},
        { name: 'Google', children: [{ name: 'Chrome' }] },
      ]},
      { name: 'Environment', values: [
        { name: 'PATH', type: 'REG_EXPAND_SZ', data: '%USERPROFILE%\\AppData\\Local\\Microsoft\\WindowsApps;' },
        { name: 'TEMP', type: 'REG_EXPAND_SZ', data: '%USERPROFILE%\\AppData\\Local\\Temp' },
        { name: 'TMP', type: 'REG_EXPAND_SZ', data: '%USERPROFILE%\\AppData\\Local\\Temp' },
      ]},
    ],
  },
  {
    name: 'HKEY_LOCAL_MACHINE', children: [
      { name: 'HARDWARE', children: [
        { name: 'DESCRIPTION', children: [
          { name: 'System', values: [
            { name: 'SystemBiosVersion', type: 'REG_SZ', data: 'ASUS - 2703' },
            { name: 'VideoBiosVersion', type: 'REG_SZ', data: 'NVIDIA GeForce RTX 4070' },
          ]},
        ]},
      ]},
      { name: 'SOFTWARE', children: [
        { name: 'Microsoft', children: [
          { name: 'Windows NT', children: [
            { name: 'CurrentVersion', values: [
              { name: 'ProductName', type: 'REG_SZ', data: 'Windows 10 Pro' },
              { name: 'CurrentVersion', type: 'REG_SZ', data: '10.0' },
              { name: 'CurrentBuildNumber', type: 'REG_SZ', data: '19045' },
              { name: 'RegisteredOwner', type: 'REG_SZ', data: 'User' },
              { name: 'SystemRoot', type: 'REG_SZ', data: 'C:\\Windows' },
              { name: 'InstallDate', type: 'REG_DWORD', data: '0x65934b80' },
            ]},
          ]},
          { name: 'Windows', children: [
            { name: 'CurrentVersion', children: [
              { name: 'Run', values: [
                { name: 'SecurityHealth', type: 'REG_EXPAND_SZ', data: '%windir%\\system32\\SecurityHealthSystray.exe' },
              ]},
            ]},
          ]},
        ]},
      ]},
      { name: 'SYSTEM', children: [
        { name: 'CurrentControlSet', children: [
          { name: 'Services' },
          { name: 'Control', children: [
            { name: 'ComputerName', values: [
              { name: 'ComputerName', type: 'REG_SZ', data: 'DESKTOP-WIN10' },
            ]},
          ]},
        ]},
      ]},
    ],
  },
  {
    name: 'HKEY_USERS', children: [
      { name: '.DEFAULT' },
      { name: 'S-1-5-21-1234567890-123456789-1234567890-1001' },
    ],
  },
  {
    name: 'HKEY_CURRENT_CONFIG', children: [
      { name: 'Software' },
      { name: 'System', children: [{ name: 'CurrentControlSet' }] },
    ],
  },
];

function TreeNode({ node, depth, selected, onSelect }: {
  node: RegKey; depth: number; selected: string; onSelect: (path: string, node: RegKey) => void;
}) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={`re-tree-row ${selected === node.name ? 'selected' : ''}`}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => { onSelect(node.name, node); if (hasChildren) setOpen(o => !o); }}
      >
        <span className="re-caret">{hasChildren ? (open ? '▼' : '▶') : ' '}</span>
        <span className="re-key-icon">📁</span>
        <span className="re-key-name">{node.name}</span>
      </div>
      {open && hasChildren && node.children!.map(child => (
        <TreeNode key={child.name} node={child} depth={depth + 1} selected={selected} onSelect={onSelect} />
      ))}
    </div>
  );
}

export default function RegistryEditor() {
  const [selected, setSelected] = useState('');
  const [selectedNode, setSelectedNode] = useState<RegKey | null>(null);
  const [searchVal, setSearchVal] = useState('');

  const defaultValues: RegValue[] = [
    { name: '(Default)', type: 'REG_SZ', data: '(value not set)' },
  ];

  const values = selectedNode?.values ?? defaultValues;

  return (
    <div className="re-root">
      <div className="re-menubar">
        {['File', 'Edit', 'View', 'Favorites', 'Help'].map(m => (
          <span key={m} className="re-menu">{m}</span>
        ))}
      </div>
      <div className="re-address-bar">
        <span className="re-addr-label">Computer</span>
        <input
          className="re-addr-input"
          value={searchVal || (selected ? `Computer\\${selected}` : 'Computer')}
          onChange={e => setSearchVal(e.target.value)}
          onFocus={e => e.target.select()}
        />
      </div>
      <div className="re-body">
        <div className="re-tree">
          <div className="re-computer-root">
            <span>🖥️</span>
            <span style={{ marginLeft: 4, fontWeight: 600 }}>Computer</span>
          </div>
          {REGISTRY.map(hive => (
            <TreeNode key={hive.name} node={hive} depth={1} selected={selected} onSelect={(name, node) => { setSelected(name); setSelectedNode(node); setSearchVal(''); }} />
          ))}
        </div>
        <div className="re-values">
          <div className="re-values-header">
            <span>Name</span><span>Type</span><span>Data</span>
          </div>
          {values.map(v => (
            <div key={v.name} className="re-value-row">
              <span className="re-val-name">{v.name}</span>
              <span className="re-val-type">{v.type}</span>
              <span className="re-val-data">{v.data}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="re-statusbar">
        {selected ? `Computer\\${selected}` : 'Computer'}
      </div>
    </div>
  );
}
