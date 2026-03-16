import { useState } from 'react';
import './DeviceManager.css';

interface Device { name: string; status: 'ok' | 'warn' | 'error'; driver?: string; }
interface Category { label: string; icon: string; devices: Device[]; }

const CATEGORIES: Category[] = [
  { label: 'Audio inputs and outputs', icon: '🎵', devices: [
    { name: 'Realtek High Definition Audio', status: 'ok', driver: '6.0.9474.1' },
    { name: 'NVIDIA High Definition Audio', status: 'ok', driver: '1.3.40.28' },
    { name: 'Microphone (Realtek Audio)', status: 'ok' },
  ]},
  { label: 'Bluetooth', icon: '🔵', devices: [
    { name: 'Intel(R) Wireless Bluetooth(R)', status: 'ok', driver: '22.140.0.2' },
    { name: 'AirPods Pro', status: 'ok' },
    { name: 'Xbox Wireless Controller', status: 'ok' },
  ]},
  { label: 'Computer', icon: '🖥️', devices: [
    { name: 'ACPI x64-based PC', status: 'ok' },
  ]},
  { label: 'Disk drives', icon: '💾', devices: [
    { name: 'Samsung SSD 970 EVO Plus 512GB', status: 'ok', driver: '10.0.19041.1' },
    { name: 'Seagate BarraCuda 2TB', status: 'ok', driver: '10.0.19041.1' },
  ]},
  { label: 'Display adapters', icon: '🖥️', devices: [
    { name: 'NVIDIA GeForce RTX 4070', status: 'ok', driver: '551.86' },
    { name: 'Microsoft Basic Display Adapter', status: 'ok' },
  ]},
  { label: 'Human Interface Devices', icon: '🖱️', devices: [
    { name: 'HID-compliant mouse', status: 'ok' },
    { name: 'HID Keyboard Device', status: 'ok' },
    { name: 'USB Input Device', status: 'ok' },
  ]},
  { label: 'Keyboards', icon: '⌨️', devices: [
    { name: 'HID Keyboard Device', status: 'ok' },
    { name: 'Standard PS/2 Keyboard', status: 'ok' },
  ]},
  { label: 'Mice and other pointing devices', icon: '🖱️', devices: [
    { name: 'HID-compliant mouse', status: 'ok' },
    { name: 'Logitech MX Master 3 Mouse', status: 'ok' },
  ]},
  { label: 'Monitors', icon: '📺', devices: [
    { name: 'Dell S2722DGM (DP)', status: 'ok', driver: '10.0.19041.1' },
  ]},
  { label: 'Network adapters', icon: '📶', devices: [
    { name: 'Intel(R) Wi-Fi 6E AX211 160MHz', status: 'ok', driver: '22.240.0.6' },
    { name: 'Intel(R) Ethernet Controller I225-V', status: 'ok', driver: '12.19.2.37' },
    { name: 'Bluetooth Device (Personal Area Network)', status: 'ok' },
  ]},
  { label: 'Ports (COM & LPT)', icon: '🔌', devices: [
    { name: 'Communications Port (COM1)', status: 'ok' },
    { name: 'Printer Port (LPT1)', status: 'ok' },
  ]},
  { label: 'Processors', icon: '⚙️', devices: [
    { name: 'Intel(R) Core(TM) i7-12700K CPU @ 3.60GHz (x12)', status: 'ok' },
  ]},
  { label: 'Sound, video and game controllers', icon: '🔊', devices: [
    { name: 'Realtek High Definition Audio', status: 'ok', driver: '6.0.9474.1' },
    { name: 'NVIDIA Virtual Audio Device (Wave Extensible)', status: 'ok' },
  ]},
  { label: 'System devices', icon: '🔧', devices: [
    { name: 'ACPI Fixed Feature Button', status: 'ok' },
    { name: 'Intel(R) Management Engine Interface', status: 'ok', driver: '2239.3.4.0' },
    { name: 'Microsoft ACPI-Compliant System', status: 'ok' },
    { name: 'PCI Express Root Complex', status: 'ok' },
  ]},
  { label: 'Universal Serial Bus controllers', icon: '🔌', devices: [
    { name: 'Intel(R) USB 3.2 eXtensible Host Controller', status: 'ok', driver: '10.0.19041.1' },
    { name: 'USB Root Hub (USB 3.0)', status: 'ok' },
    { name: 'Generic USB Hub', status: 'ok' },
  ]},
];

export default function DeviceManager() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);

  const toggle = (label: string) => {
    setExpanded(s => {
      const n = new Set(s);
      n.has(label) ? n.delete(label) : n.add(label);
      return n;
    });
  };

  return (
    <div className="dm-root">
      <div className="dm-menubar">
        <span className="dm-menu-item">File</span>
        <span className="dm-menu-item">Action</span>
        <span className="dm-menu-item">View</span>
        <span className="dm-menu-item">Help</span>
      </div>
      <div className="dm-toolbar">
        <button className="dm-tool-btn" title="Properties">⊞</button>
        <button className="dm-tool-btn" title="Update driver">⬆</button>
        <button className="dm-tool-btn" title="Disable">⊖</button>
        <button className="dm-tool-btn" title="Uninstall">🗑</button>
        <button className="dm-tool-btn" title="Scan for hardware changes">🔄</button>
      </div>
      <div className="dm-tree">
        <div className="dm-computer-root">
          <span className="dm-caret">▼</span>
          <span className="dm-icon">💻</span>
          <span className="dm-label">DESKTOP-WIN10</span>
        </div>
        {CATEGORIES.map(cat => (
          <div key={cat.label} className="dm-category">
            <div
              className={`dm-cat-row ${expanded.has(cat.label) ? 'open' : ''}`}
              onClick={() => toggle(cat.label)}
            >
              <span className="dm-caret">{expanded.has(cat.label) ? '▼' : '▶'}</span>
              <span className="dm-icon">{cat.icon}</span>
              <span className="dm-cat-label">{cat.label}</span>
            </div>
            {expanded.has(cat.label) && cat.devices.map(dev => (
              <div
                key={dev.name}
                className={`dm-device-row ${selected === dev.name ? 'selected' : ''}`}
                onClick={() => setSelected(dev.name)}
              >
                <span className="dm-dev-status">
                  {dev.status === 'ok' ? '✅' : dev.status === 'warn' ? '⚠️' : '❌'}
                </span>
                <span className="dm-dev-name">{dev.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      {selected && (
        <div className="dm-statusbar">
          {selected}{CATEGORIES.flatMap(c => c.devices).find(d => d.name === selected)?.driver
            ? ` · Driver: ${CATEGORIES.flatMap(c => c.devices).find(d => d.name === selected)?.driver}`
            : ''}
        </div>
      )}
    </div>
  );
}
