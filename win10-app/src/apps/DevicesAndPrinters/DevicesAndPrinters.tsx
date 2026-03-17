import { useState, useRef, useEffect } from 'react';
import './DevicesAndPrinters.css';

interface Printer {
  name: string;
  icon: string;
  isDefault: boolean;
  status: string;
  location: string;
  type: 'printer' | 'fax' | 'virtual';
}

interface Device {
  name: string;
  icon: string;
  type: string;
  status: string;
}

const INITIAL_PRINTERS: Printer[] = [
  { name: 'HP LaserJet Pro M404dn', icon: '🖨️', isDefault: true,  status: 'Ready', location: 'Office - 192.168.1.130', type: 'printer' },
  { name: 'Canon PIXMA TR8620',     icon: '🖨️', isDefault: false, status: 'Ready', location: 'Home Network',           type: 'printer' },
  { name: 'Microsoft Print to PDF', icon: '📄', isDefault: false, status: 'Ready', location: '',                       type: 'virtual' },
  { name: 'Microsoft XPS Document Writer', icon: '📄', isDefault: false, status: 'Ready', location: '', type: 'virtual' },
  { name: 'OneNote (Desktop)',       icon: '📘', isDefault: false, status: 'Ready', location: '',       type: 'virtual' },
  { name: 'Fax',                     icon: '📠', isDefault: false, status: 'Ready', location: '',       type: 'fax' },
];

const DEVICES: Device[] = [
  { name: 'DESKTOP-WIN10', icon: '🖥️', type: 'This PC', status: 'Working' },
  { name: 'Generic Bluetooth Adapter', icon: '📶', type: 'Bluetooth Adapter', status: 'Working' },
  { name: 'USB Composite Device', icon: '🔌', type: 'USB Device', status: 'Working' },
  { name: 'Realtek USB Audio', icon: '🎵', type: 'Audio Device', status: 'Working' },
  { name: 'HID Keyboard Device', icon: '⌨️', type: 'Keyboard', status: 'Working' },
  { name: 'HID-compliant mouse', icon: '🖱️', type: 'Mouse', status: 'Working' },
];

type CtxMenu = { x: number; y: number; printer: Printer } | null;
type WizardPhase = 'search' | 'found' | null;

export default function DevicesAndPrinters() {
  const [printers, setPrinters] = useState<Printer[]>(INITIAL_PRINTERS);
  const [selected, setSelected] = useState<string | null>(null);
  const [ctxMenu, setCtxMenu] = useState<CtxMenu>(null);
  const [queuePrinter, setQueuePrinter] = useState<Printer | null>(null);
  const [wizardPhase, setWizardPhase] = useState<WizardPhase>(null);
  const [wizardPct, setWizardPct] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const close = () => setCtxMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const setDefault = (name: string) => {
    setPrinters(ps => ps.map(p => ({ ...p, isDefault: p.name === name })));
  };

  const handleContextMenu = (e: React.MouseEvent, printer: Printer) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(printer.name);
    setCtxMenu({ x: e.clientX, y: e.clientY, printer });
  };

  const startWizard = () => {
    setWizardPhase('search');
    setWizardPct(0);
    timerRef.current = window.setInterval(() => {
      setWizardPct(p => {
        if (p >= 100) {
          clearInterval(timerRef.current!);
          setWizardPhase('found');
          return 100;
        }
        return p + 5;
      });
    }, 150);
  };

  const finishWizard = () => {
    setWizardPhase(null);
    setWizardPct(0);
  };

  const selectedPrinter = printers.find(p => p.name === selected);

  return (
    <div className="dnp-root" onClick={() => setSelected(null)}>
      {/* Toolbar */}
      <div className="dnp-toolbar">
        <button className="dnp-toolbar-btn" onClick={e => { e.stopPropagation(); startWizard(); }}>
          ➕ Add a device
        </button>
        <button className="dnp-toolbar-btn" onClick={e => { e.stopPropagation(); startWizard(); }}>
          🖨️ Add a printer
        </button>
        <div className="dnp-toolbar-sep" />
        <button className="dnp-toolbar-btn" disabled={!selectedPrinter}>
          ⬛ See what's printing
        </button>
        <button className="dnp-toolbar-btn" disabled={!selectedPrinter} onClick={() => { if (selectedPrinter) setDefault(selectedPrinter.name); }}>
          ✓ Set as default
        </button>
        <div className="dnp-toolbar-sep" />
        <div className="dnp-toolbar-search">
          <span>🔍</span>
          <input placeholder="Search devices and printers" className="dnp-search" />
        </div>
      </div>

      <div className="dnp-body">
        {/* Devices section */}
        <div className="dnp-section-title">Devices ({DEVICES.length})</div>
        <div className="dnp-device-grid">
          {DEVICES.map(dev => (
            <div
              key={dev.name}
              className={`dnp-device-item ${selected === dev.name ? 'selected' : ''}`}
              onClick={e => { e.stopPropagation(); setSelected(dev.name); }}
              onDoubleClick={() => {}}
            >
              <span className="dnp-device-icon">{dev.icon}</span>
              <span className="dnp-device-name">{dev.name}</span>
              <span className="dnp-device-type">{dev.type}</span>
            </div>
          ))}
        </div>

        {/* Printers section */}
        <div className="dnp-section-title" style={{ marginTop: 24 }}>
          Printers ({printers.length})
        </div>
        <div className="dnp-device-grid">
          {printers.map(p => (
            <div
              key={p.name}
              className={`dnp-device-item ${selected === p.name ? 'selected' : ''}`}
              onClick={e => { e.stopPropagation(); setSelected(p.name); }}
              onDoubleClick={() => setQueuePrinter(p)}
              onContextMenu={e => handleContextMenu(e, p)}
            >
              <div className="dnp-printer-icon-wrap">
                <span className="dnp-device-icon">{p.icon}</span>
                {p.isDefault && <span className="dnp-default-badge" title="Default printer">✓</span>}
              </div>
              <span className="dnp-device-name">{p.name}</span>
              <span className="dnp-device-type" style={{ color: p.status === 'Ready' ? '#2ecc71' : '#e74c3c' }}>{p.status}</span>
            </div>
          ))}
        </div>

        {/* Details panel */}
        {selectedPrinter && (
          <div className="dnp-details-bar">
            <span className="dnp-details-icon">{selectedPrinter.icon}</span>
            <div className="dnp-details-info">
              <div className="dnp-details-name">{selectedPrinter.name}</div>
              <div className="dnp-details-row">
                <span>Status: <strong>{selectedPrinter.status}</strong></span>
                {selectedPrinter.location && <span>Location: {selectedPrinter.location}</span>}
                {selectedPrinter.isDefault && <span className="dnp-default-tag">⬤ Default</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Context menu */}
      {ctxMenu && (
        <div
          className="dnp-ctx"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          <div className="dnp-ctx-item dnp-ctx-bold" onClick={() => setQueuePrinter(ctxMenu.printer)}>
            See what's printing
          </div>
          <div className="dnp-ctx-sep" />
          <div className="dnp-ctx-item" onClick={() => { setDefault(ctxMenu.printer.name); setCtxMenu(null); }}>
            Set as default printer
          </div>
          <div className="dnp-ctx-item" onClick={() => setCtxMenu(null)}>Printing preferences</div>
          <div className="dnp-ctx-item" onClick={() => setCtxMenu(null)}>Printer properties</div>
          <div className="dnp-ctx-sep" />
          <div className="dnp-ctx-item" onClick={() => { setQueuePrinter(ctxMenu.printer); setCtxMenu(null); }}>
            See what's printing
          </div>
          <div className="dnp-ctx-item dnp-ctx-danger" onClick={() => setCtxMenu(null)}>Cancel all documents</div>
          <div className="dnp-ctx-sep" />
          <div className="dnp-ctx-item" onClick={() => setCtxMenu(null)}>Remove device</div>
          <div className="dnp-ctx-item" onClick={() => setCtxMenu(null)}>Properties</div>
        </div>
      )}

      {/* Print queue modal */}
      {queuePrinter && (
        <div className="dnp-overlay" onClick={() => setQueuePrinter(null)}>
          <div className="dnp-queue" onClick={e => e.stopPropagation()}>
            <div className="dnp-queue-title">{queuePrinter.name}</div>
            <div className="dnp-queue-menu">
              <span>Printer</span><span>Document</span><span>View</span><span>Help</span>
            </div>
            <div className="dnp-queue-header">
              <span>Document Name</span><span>Status</span><span>Owner</span><span>Pages</span><span>Size</span><span>Submitted</span>
            </div>
            <div className="dnp-queue-empty">There are no print jobs in the queue.</div>
            <div className="dnp-queue-status">
              <span>{queuePrinter.isDefault ? '✓ Default printer · ' : ''}{queuePrinter.status} · 0 documents waiting</span>
              <button className="dnp-queue-close" onClick={() => setQueuePrinter(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add printer wizard */}
      {wizardPhase && (
        <div className="dnp-overlay" onClick={() => {}}>
          <div className="dnp-wizard" onClick={e => e.stopPropagation()}>
            <div className="dnp-wizard-title">Add Printer</div>
            {wizardPhase === 'search' && (
              <>
                <div className="dnp-wizard-msg">Searching for available printers on the network...</div>
                <div className="dnp-wizard-spinner">⟳</div>
                <div className="dnp-wizard-bar-bg">
                  <div className="dnp-wizard-bar-fill" style={{ width: `${wizardPct}%` }} />
                </div>
                <div className="dnp-wizard-actions">
                  <button className="dnp-wizard-btn" onClick={finishWizard}>Cancel</button>
                </div>
              </>
            )}
            {wizardPhase === 'found' && (
              <>
                <div className="dnp-wizard-msg">The following printers were found on your network:</div>
                <div className="dnp-wizard-found-list">
                  {['Epson ET-2803 (192.168.1.131)', 'Brother MFC-L2750DW (192.168.1.132)', 'HP OfficeJet Pro 9015e (192.168.1.133)'].map(p => (
                    <div key={p} className="dnp-wizard-found-item">🖨️ {p}</div>
                  ))}
                </div>
                <div className="dnp-wizard-actions">
                  <button className="dnp-wizard-btn dnp-wizard-primary" onClick={finishWizard}>Install</button>
                  <button className="dnp-wizard-btn" onClick={finishWizard}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
