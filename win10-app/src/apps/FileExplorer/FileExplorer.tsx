import { useState, useEffect } from 'react';
import { useFileSystemStore } from '../../store/useFileSystemStore';
import { useWindowStore } from '../../store/useWindowStore';
import type { FSNode } from '../../types/filesystem';
import './FileExplorer.css';

interface Props { initialPath?: string; }

export default function FileExplorer({ initialPath }: Props) {
  const { driver, fs } = useFileSystemStore();
  const { openWindow } = useWindowStore();
  const [currentId, setCurrentId] = useState<string>('');
  const [selected, setSelected] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

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

  const icons: Record<string, string> = { directory: '📁', 'text/plain': '📄' };
  const getIcon = (n: FSNode) => n.type === 'directory' ? '📁' : icons[(n as any).mimeType] ?? '📄';

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
          {Object.values(fs.nodes).filter(n => n.parentId === fs.rootId).map(n => (
            <button key={n.id} className={`fe-sidebar-item ${currentId === n.id ? 'active' : ''}`} onClick={() => navigate(n.id)}>
              {getIcon(n)} {n.name}
            </button>
          ))}
        </div>

        <div className="fe-content">
          {children.length === 0 && <div className="fe-empty">This folder is empty.</div>}
          <div className="fe-grid">
            {children.map(node => (
              <div
                key={node.id}
                className={`fe-item ${selected === node.id ? 'selected' : ''}`}
                onClick={() => setSelected(node.id)}
                onDoubleClick={() => handleOpen(node)}
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
        </div>
      </div>

      <div className="fe-statusbar">
        {children.length} item{children.length !== 1 ? 's' : ''}
        {selected && ` · 1 selected`}
      </div>
    </div>
  );
}
