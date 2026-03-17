import { useState, useEffect } from 'react';
import { useFileSystemStore } from '../../store/useFileSystemStore';
import { useWindowStore } from '../../store/useWindowStore';
import type { FSNode } from '../../types/filesystem';
import ContextMenu from '../../components/ContextMenu/ContextMenu';
import type { ContextMenuItem } from '../../components/ContextMenu/ContextMenu';
import PropertiesDialog from '../../components/PropertiesDialog/PropertiesDialog';
import './FileExplorer.css';

interface Props { initialPath?: string; }

interface CtxState { x: number; y: number; node: FSNode | null; }

export default function FileExplorer({ initialPath }: Props) {
  const { driver, fs } = useFileSystemStore();
  const { openWindow } = useWindowStore();
  const [currentId, setCurrentId] = useState<string>('');
  const [selected, setSelected] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [ctx, setCtx] = useState<CtxState | null>(null);
  const [propsNode, setPropsNode] = useState<FSNode | null>(null);

  useEffect(() => {
    if (!driver) return;
    const startId = initialPath ?? fs.rootId;
    setCurrentId(startId);
    setHistory([startId]);
    setHistoryIdx(0);
  }, [driver]);

  if (!driver) return <div className="fe-loading">Loading...</div>;

  const children = driver.getChildren(currentId);

  const navigate = (id: string) => {
    const newHistory = history.slice(0, historyIdx + 1).concat(id);
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
    setCurrentId(id);
    setSelected(null);
  };

  const goBack = () => {
    if (historyIdx > 0) {
      const newIdx = historyIdx - 1;
      setHistoryIdx(newIdx);
      setCurrentId(history[newIdx]);
    }
  };

  const goForward = () => {
    if (historyIdx < history.length - 1) {
      const newIdx = historyIdx + 1;
      setHistoryIdx(newIdx);
      setCurrentId(history[newIdx]);
    }
  };

  const handleOpen = (node: FSNode) => {
    if (node.type === 'directory') {
      navigate(node.id);
      return;
    }
    const name = node.name.toLowerCase();
    // Executables & CPL files → launch matching app
    if (name === 'cmd.exe') { openWindow('cmd', 'Command Prompt'); return; }
    if (name === 'powershell.exe') { openWindow('cmd', 'Windows PowerShell', { powershell: true }); return; }
    if (name === 'taskmgr.exe') { openWindow('taskManager', 'Task Manager'); return; }
    if (name === 'notepad.exe') { openWindow('notepad', 'Notepad'); return; }
    if (name === 'calc.exe') { openWindow('calculator', 'Calculator'); return; }
    if (name === 'mspaint.exe') { openWindow('paint', 'Paint'); return; }
    if (name === 'explorer.exe') { openWindow('fileExplorer', 'File Explorer'); return; }
    if (name === 'regedit.exe') { openWindow('registryEditor', 'Registry Editor'); return; }
    if (name === 'devmgmt.msc') { openWindow('deviceManager', 'Device Manager'); return; }
    if (name === 'diskmgmt.msc') { openWindow('diskManagement', 'Disk Management'); return; }
    if (name === 'services.msc') { openWindow('taskManager', 'Services'); return; }
    if (name === 'taskmgr.exe') { openWindow('taskManager', 'Task Manager'); return; }
    // CPL files → open Settings on the relevant page
    if (name === 'mmsys.cpl') { openWindow('settings', 'Sound', { initialPage: 'system' }); return; }
    if (name === 'ncpa.cpl') { openWindow('settings', 'Network Connections', { initialPage: 'network' }); return; }
    if (name === 'appwiz.cpl') { openWindow('settings', 'Programs and Features', { initialPage: 'apps' }); return; }
    if (name === 'sysdm.cpl') { openWindow('settings', 'System Properties', { initialPage: 'system' }); return; }
    if (name === 'desk.cpl') { openWindow('settings', 'Display Settings', { initialPage: 'personalization' }); return; }
    if (name === 'timedate.cpl') { openWindow('settings', 'Date and Time', { initialPage: 'time' }); return; }
    if (name === 'powercfg.cpl') { openWindow('settings', 'Power Options', { initialPage: 'system' }); return; }
    if (name === 'main.cpl') { openWindow('settings', 'Mouse Properties', { initialPage: 'devices' }); return; }
    if (name === 'firewall.cpl') { openWindow('settings', 'Windows Firewall', { initialPage: 'update' }); return; }
    if (name === 'inetcpl.cpl') { openWindow('settings', 'Internet Options', { initialPage: 'network' }); return; }
    if (name === 'msconfig.exe') { openWindow('settings', 'System Configuration', { initialPage: 'system' }); return; }
    if (name === 'gpedit.msc') { openWindow('settings', 'Group Policy Editor', { initialPage: 'privacy' }); return; }
    // Default: open in Notepad
    openWindow('notepad', node.name, { fileId: node.id });
  };

  const handleNewFolder = () => {
    const node = driver.createDirectory(currentId, 'New Folder');
    setRenaming(node.id);
    setRenameValue('New Folder');
  };

  const handleNewFile = () => {
    const node = driver.createFile(currentId, 'New Text Document.txt');
    setRenaming(node.id);
    setRenameValue('New Text Document.txt');
  };

  const handleDelete = (id: string) => {
    driver.deleteNode(id);
    if (selected === id) setSelected(null);
  };

  const startRename = (node: FSNode) => {
    setRenaming(node.id);
    setRenameValue(node.name);
  };

  const commitRename = () => {
    if (renaming && renameValue.trim()) {
      driver.renameNode(renaming, renameValue.trim());
    }
    setRenaming(null);
  };

  const handleItemContextMenu = (e: React.MouseEvent, node: FSNode) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(node.id);
    setCtx({ x: e.clientX, y: e.clientY, node });
  };

  const handleBgContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setCtx({ x: e.clientX, y: e.clientY, node: null });
  };

  const buildMenuItems = (): (ContextMenuItem | 'separator')[] => {
    if (!ctx) return [];
    const node = ctx.node;

    if (!node) {
      // Background right-click
      return [
        { label: 'New Folder', icon: '📁', onClick: handleNewFolder },
        { label: 'New File', icon: '📄', onClick: handleNewFile },
        'separator',
        { label: 'Refresh', icon: '🔄', onClick: () => {} },
        'separator',
        {
          label: 'Properties',
          icon: 'ℹ️',
          onClick: () => {
            const curNode = driver.getNode(currentId);
            if (curNode) setPropsNode(curNode);
          },
        },
      ];
    }

    const items: (ContextMenuItem | 'separator')[] = [
      {
        label: 'Open',
        icon: node.type === 'directory' ? '📂' : '📄',
        onClick: () => handleOpen(node),
      },
    ];
    if (node.type === 'file') {
      items.push({ label: 'Open with Notepad', icon: '📝', onClick: () => openWindow('notepad', node.name, { fileId: node.id }) });
    }
    items.push('separator');
    items.push({ label: 'Rename', icon: '✏️', onClick: () => startRename(node) });
    items.push({ label: 'Delete', icon: '🗑️', onClick: () => handleDelete(node.id) });
    items.push('separator');
    items.push({ label: 'Properties', icon: 'ℹ️', onClick: () => setPropsNode(node) });
    return items;
  };

  const icons: Record<string, string> = { directory: '📁', 'text/plain': '📄' };
  const getIcon = (n: FSNode) => n.type === 'directory' ? '📁' : icons[(n as any).mimeType] ?? '📄';

  // Drive space info for status bar
  const DRIVE_SPACE: Record<string, { total: number; used: number; label: string; icon: string }> = {
    'C:': { total: 512,   used: 346.2,  label: 'OS — Samsung SSD 990 Pro 512GB',        icon: '💾' },
    'D:': { total: 2000,  used: 1884,   label: 'Games 1 — Samsung SSD 990 Pro 2TB',     icon: '💾' },
    'E:': { total: 2000,  used: 1764,   label: 'Games 2 — WD Black SN850X 2TB',         icon: '💾' },
    'F:': { total: 8000,  used: 6348,   label: 'Storage — Seagate Barracuda 8TB',       icon: '🖴'  },
    'G:': { total: 1000,  used: 862,    label: 'Mods — Crucial P5 Plus 1TB',            icon: '💾' },
    'N:': { total: 98304,  used: 79872,  label: 'NAS-Media — Synology DS1823xs+ 96TB',    icon: '🗄️' },
    'P:': { total: 73728,  used: 65536,  label: 'NAS-Personal — Synology DS1621+ 72TB',  icon: '🗄️' },
    'Q:': { total: 147456, used: 138240, label: 'NAS-Seeds1 — Synology RS4021xs+ 144TB',  icon: '🗄️' },
    'R:': { total: 196608, used: 184320, label: 'NAS-Seeds2 — Custom 24-bay 192TB',       icon: '🗄️' },
    'S:': { total: 262144, used: 251904, label: 'NAS-Seeds3 — SuperMicro JBOD 256TB',     icon: '🗄️' },
    'T:': { total: 327680, used: 315392, label: 'NAS-Seeds4 — NetApp FAS8700 320TB',      icon: '🗄️' },
    'U:': { total: 491520, used: 473088, label: 'NAS-Seeds5 — Supermicro 480TB Classical/Jazz/Blues', icon: '🗄️' },
    'V:': { total: 589824, used: 573440, label: 'NAS-Seeds6 — Dell PowerEdge 576TB Video/Film/Games', icon: '🗄️' },
    'W:': { total: 393216, used: 378880, label: 'NAS-Seeds7 — HPE ProLiant 384TB Texts/Radio/News',  icon: '🗄️' },
    'Z:': { total: 49152,  used: 42496,  label: 'NAS-Archive — QNAP TS-873A 48TB',        icon: '🗄️' },
  };

  // Find which drive the current path is under
  const getCurrentDrive = (): { total: number; used: number; label: string; name: string } | null => {
    let id: string | null = currentId;
    while (id) {
      const node = driver.getNode(id);
      if (!node) break;
      if (node.parentId === fs.rootId && DRIVE_SPACE[node.name]) {
        return { ...DRIVE_SPACE[node.name], name: node.name };
      }
      id = node.parentId;
    }
    return null;
  };
  const driveInfo = getCurrentDrive();
  const drivePct = driveInfo ? (driveInfo.used / driveInfo.total) * 100 : 0;
  const driveBarColor = drivePct > 90 ? '#f44336' : drivePct > 75 ? '#ff9800' : '#0078d4';

  const isThisPC = currentId === fs.rootId;
  const fmtSize = (gb: number) => gb >= 1000 ? `${(gb / 1000).toFixed(1)} TB` : `${gb.toFixed(0)} GB`;

  // Build breadcrumb
  const buildBreadcrumbs = () => {
    const parts: { id: string; name: string }[] = [];
    let id: string | null = currentId;
    while (id) {
      const node = driver.getNode(id);
      if (!node) break;
      parts.unshift({ id, name: node.name });
      id = node.parentId;
    }
    return parts;
  };
  const breadcrumbs = buildBreadcrumbs();

  return (
    <div className="file-explorer">
      <div className="fe-toolbar">
        <button className="fe-nav-btn" onClick={goBack} disabled={historyIdx <= 0}>‹</button>
        <button className="fe-nav-btn" onClick={goForward} disabled={historyIdx >= history.length - 1}>›</button>
        <div className="fe-address-bar">
          {breadcrumbs.map((b, i) => (
            <span key={b.id}>
              {i > 0 && <span className="fe-sep"> › </span>}
              <button className="fe-crumb" onClick={() => navigate(b.id)}>{b.name}</button>
            </span>
          ))}
        </div>
      </div>

      <div className="fe-action-bar">
        <button className="fe-action-btn" onClick={handleNewFolder}>📁 New Folder</button>
        <button className="fe-action-btn" onClick={handleNewFile}>📄 New File</button>
        {selected && <button className="fe-action-btn danger" onClick={() => handleDelete(selected)}>🗑 Delete</button>}
        {selected && <button className="fe-action-btn" onClick={() => { const n = driver.getNode(selected); if (n) startRename(n); }}>✏️ Rename</button>}
      </div>

      <div className="fe-body">
        <div className="fe-sidebar">
          <div className="fe-sidebar-section">Quick Access</div>
          {Object.values(fs.nodes).filter(n => ['Desktop', 'Documents', 'Downloads'].includes(n.name) && n.type === 'directory').map(n => (
            <button key={n.id} className={`fe-sidebar-item ${currentId === n.id ? 'active' : ''}`} onClick={() => navigate(n.id)}>
              📁 {n.name}
            </button>
          ))}
          <div className="fe-sidebar-section" style={{ marginTop: 12 }}>This PC</div>
          <button className={`fe-sidebar-item ${currentId === fs.rootId ? 'active' : ''}`} onClick={() => navigate(fs.rootId)}>
            🖥️ This PC
          </button>
          {Object.values(fs.nodes).filter(n => n.parentId === fs.rootId && ['C:','D:','E:','F:','G:'].includes(n.name)).map(n => (
            <button key={n.id} className={`fe-sidebar-item ${currentId === n.id ? 'active' : ''}`} onClick={() => navigate(n.id)}>
              {DRIVE_SPACE[n.name]?.icon ?? getIcon(n)} {n.name}
            </button>
          ))}
          <div className="fe-sidebar-section" style={{ marginTop: 12 }}>Network (NAS)</div>
          {Object.values(fs.nodes).filter(n => n.parentId === fs.rootId && ['N:','P:','Q:','R:','S:','T:','U:','V:','W:','Z:'].includes(n.name)).map(n => (
            <button key={n.id} className={`fe-sidebar-item ${currentId === n.id ? 'active' : ''}`} onClick={() => navigate(n.id)}>
              {DRIVE_SPACE[n.name]?.icon ?? getIcon(n)} {n.name}
            </button>
          ))}
        </div>

        <div className="fe-content" onContextMenu={handleBgContextMenu}>
          {isThisPC ? (
            <div className="fe-thispc">
              <div className="fe-thispc-section">Devices and drives</div>
              <div className="fe-thispc-grid">
                {children.filter(n => DRIVE_SPACE[n.name] && ['C:','D:','E:','F:','G:'].includes(n.name)).map(node => {
                  const info = DRIVE_SPACE[node.name];
                  const pct = (info.used / info.total) * 100;
                  const barColor = pct > 90 ? '#f44336' : pct > 75 ? '#ff9800' : '#0078d4';
                  const free = info.total - info.used;
                  return (
                    <div
                      key={node.id}
                      className={`fe-drive-card ${selected === node.id ? 'selected' : ''}`}
                      onClick={() => setSelected(node.id)}
                      onDoubleClick={() => navigate(node.id)}
                      onContextMenu={e => handleItemContextMenu(e, node)}
                    >
                      <div className="fe-drive-card-top">
                        <span className="fe-drive-card-icon">{info.icon}</span>
                        <div className="fe-drive-card-names">
                          <span className="fe-drive-card-letter">{node.name}</span>
                          <span className="fe-drive-card-label">{info.label}</span>
                        </div>
                      </div>
                      <div className="fe-drive-card-bar-bg">
                        <div className="fe-drive-card-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
                      </div>
                      <div className="fe-drive-card-stats">
                        <span style={{ color: pct > 90 ? '#f44336' : pct > 75 ? '#ff9800' : 'rgba(255,255,255,0.55)' }}>
                          {fmtSize(free)} free
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.35)' }}>{fmtSize(info.total)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {children.filter(n => DRIVE_SPACE[n.name] && ['N:','P:','Q:','R:','S:','T:','U:','V:','W:','Z:'].includes(n.name)).length > 0 && (
                <>
                  <div className="fe-thispc-section" style={{ marginTop: 20 }}>Network locations (NAS)</div>
                  <div className="fe-thispc-grid">
                    {children.filter(n => DRIVE_SPACE[n.name] && ['N:','P:','Q:','R:','S:','T:','U:','V:','W:','Z:'].includes(n.name)).map(node => {
                      const info = DRIVE_SPACE[node.name];
                      const pct = (info.used / info.total) * 100;
                      const barColor = pct > 90 ? '#f44336' : pct > 75 ? '#ff9800' : '#0078d4';
                      const free = info.total - info.used;
                      return (
                        <div key={node.id} className={`fe-drive-card ${selected === node.id ? 'selected' : ''}`}
                          onClick={() => setSelected(node.id)} onDoubleClick={() => navigate(node.id)}
                          onContextMenu={e => handleItemContextMenu(e, node)}>
                          <div className="fe-drive-card-top">
                            <span className="fe-drive-card-icon">{info.icon}</span>
                            <div className="fe-drive-card-names">
                              <span className="fe-drive-card-letter">{node.name}</span>
                              <span className="fe-drive-card-label">{info.label}</span>
                            </div>
                          </div>
                          <div className="fe-drive-card-bar-bg">
                            <div className="fe-drive-card-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
                          </div>
                          <div className="fe-drive-card-stats">
                            <span style={{ color: pct > 90 ? '#f44336' : pct > 75 ? '#ff9800' : 'rgba(255,255,255,0.55)' }}>
                              {fmtSize(free)} free
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.35)' }}>{fmtSize(info.total)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {children.length === 0 && <div className="fe-empty">This folder is empty.</div>}
              <div className="fe-grid">
                {children.map(node => (
                  <div
                    key={node.id}
                    className={`fe-item ${selected === node.id ? 'selected' : ''}`}
                    onClick={() => setSelected(node.id)}
                    onDoubleClick={() => handleOpen(node)}
                    onContextMenu={e => handleItemContextMenu(e, node)}
                  >
                    <span className="fe-item-icon">{getIcon(node)}</span>
                    {renaming === node.id ? (
                      <input
                        className="fe-rename-input"
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(null); }}
                        autoFocus
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span className="fe-item-name">{node.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="fe-statusbar">
        <span>{children.length} item{children.length !== 1 ? 's' : ''}{selected && ' · 1 selected'}</span>
        {driveInfo && (
          <div className="fe-drive-bar-wrap">
            <span>{driveInfo.name} — {(driveInfo.total - driveInfo.used).toFixed(1)} GB free of {driveInfo.total >= 1000 ? (driveInfo.total / 1000).toFixed(0) + ' TB' : driveInfo.total + ' GB'}</span>
            <div className="fe-drive-bar">
              <div className="fe-drive-bar-fill" style={{ width: `${drivePct}%`, background: driveBarColor }} />
            </div>
            <span style={{ color: drivePct > 90 ? '#f44336' : drivePct > 75 ? '#ff9800' : 'inherit' }}>{drivePct.toFixed(0)}%</span>
          </div>
        )}
      </div>

      {ctx && (
        <ContextMenu
          x={ctx.x}
          y={ctx.y}
          items={buildMenuItems()}
          onClose={() => setCtx(null)}
        />
      )}

      {propsNode && (
        <PropertiesDialog
          node={propsNode}
          driver={driver}
          onClose={() => setPropsNode(null)}
        />
      )}
    </div>
  );
}
