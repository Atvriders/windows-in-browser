import { useState } from 'react';
import './IISManager.css';

type TreeNode = {
  id: string;
  label: string;
  icon: string;
  level: number;
  expandable: boolean;
  type: 'server' | 'apppool' | 'site' | 'app' | 'folder';
};

const TREE: TreeNode[] = [
  { id: 'startpage',   label: 'Start Page',              icon: '🏠', level: 0, expandable: false, type: 'folder' },
  { id: 'server',      label: 'DESKTOP-WIN10 (local)',   icon: '🖥️', level: 0, expandable: true,  type: 'server' },
  { id: 'apppools',    label: 'Application Pools',       icon: '🔄', level: 1, expandable: false, type: 'apppool' },
  { id: 'sites',       label: 'Sites',                   icon: '🌐', level: 1, expandable: true,  type: 'folder' },
  { id: 'default-site',label: 'Default Web Site',        icon: '🌍', level: 2, expandable: true,  type: 'site' },
  { id: 'wordpress',   label: 'wordpress',               icon: '📄', level: 3, expandable: false, type: 'app' },
  { id: 'api',         label: 'api',                     icon: '📄', level: 3, expandable: false, type: 'app' },
];

interface AppPool {
  name: string;
  framework: string;
  pipeline: string;
  state: 'Started' | 'Stopped';
  identity: string;
}

interface Site {
  name: string;
  id: number;
  state: 'Started' | 'Stopped';
  bindings: string;
  path: string;
  appPool: string;
}

const APP_POOLS: AppPool[] = [
  { name: 'DefaultAppPool',  framework: '.NET CLR v4.0', pipeline: 'Integrated', state: 'Started', identity: 'ApplicationPoolIdentity' },
  { name: 'WordPressPool',   framework: 'No Managed Code', pipeline: 'Integrated', state: 'Started', identity: 'ApplicationPoolIdentity' },
  { name: '.NET v4.5',       framework: '.NET CLR v4.0', pipeline: 'Integrated', state: 'Stopped', identity: 'ApplicationPoolIdentity' },
  { name: 'Classic .NET AppPool', framework: '.NET CLR v2.0', pipeline: 'Classic', state: 'Stopped', identity: 'NetworkService' },
];

const SITES: Site[] = [
  { name: 'Default Web Site', id: 1, state: 'Started', bindings: 'http *:80', path: 'C:\\inetpub\\wwwroot', appPool: 'DefaultAppPool' },
  { name: 'wordpress',        id: 2, state: 'Started', bindings: 'http *:8080', path: 'C:\\inetpub\\wordpress', appPool: 'WordPressPool' },
  { name: 'api',              id: 3, state: 'Started', bindings: 'http *:3000', path: 'C:\\inetpub\\api', appPool: 'DefaultAppPool' },
];

const IIS_FEATURES = [
  { name: 'Authentication',     icon: '🔐', desc: 'Configure authentication methods' },
  { name: 'Authorization Rules',icon: '🛡️', desc: 'Manage authorization rules' },
  { name: 'Default Document',   icon: '📄', desc: 'Configure default documents' },
  { name: 'Directory Browsing', icon: '📁', desc: 'Enable/disable directory listing' },
  { name: 'Error Pages',        icon: '⚠️', desc: 'Configure custom error pages' },
  { name: 'Handler Mappings',   icon: '🗺️', desc: 'Manage handler mappings' },
  { name: 'HTTP Headers',       icon: '📋', desc: 'Configure HTTP response headers' },
  { name: 'HTTP Redirect',      icon: '↩️', desc: 'Configure URL redirects' },
  { name: 'IP and Domain Restrictions', icon: '🔒', desc: 'Restrict access by IP' },
  { name: 'ISAPI Filters',      icon: '🔧', desc: 'Manage ISAPI filters' },
  { name: 'Logging',            icon: '📊', desc: 'Configure IIS logging' },
  { name: 'MIME Types',         icon: '🗂️', desc: 'Configure MIME type mappings' },
  { name: 'Modules',            icon: '🧩', desc: 'View and manage server modules' },
  { name: 'Output Caching',     icon: '⚡', desc: 'Configure output caching rules' },
  { name: 'Request Filtering',  icon: '🔍', desc: 'Configure request filtering' },
  { name: 'SSL Settings',       icon: '🔏', desc: 'Configure SSL/TLS settings' },
  { name: 'URL Rewrite',        icon: '🔄', desc: 'Define URL rewriting rules' },
  { name: 'Worker Processes',   icon: '⚙️', desc: 'Monitor worker processes' },
];

const SITE_ACTIONS = ['Browse *:80 (http)', 'Edit Permissions…', 'Basic Settings…', 'View Applications', 'View Virtual Directories', '—', 'Manage Website', '   Restart', '   Start', '   Stop', 'Browse', '—', 'Advanced Settings…', 'Configure', '   Failed Request Tracing…', '   Limits…', '—', 'Remove', 'Rename', '—', 'Refresh', 'Help'];

export default function IISManager() {
  const [selectedNode, setSelectedNode] = useState('server');
  const [expanded, setExpanded] = useState(new Set(['server', 'sites']));
  const [appPools, setAppPools] = useState<AppPool[]>(APP_POOLS);
  const [sites, setSites] = useState<Site[]>(SITES);
  const [bindingsModal, setBindingsModal] = useState<Site | null>(null);

  const toggleNode = (id: string) => {
    setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const togglePool = (name: string) => {
    setAppPools(ps => ps.map(p => p.name === name ? { ...p, state: p.state === 'Started' ? 'Stopped' : 'Started' } : p));
  };

  const toggleSite = (name: string) => {
    setSites(ss => ss.map(s => s.name === name ? { ...s, state: s.state === 'Started' ? 'Stopped' : 'Started' } : s));
  };

  const currentNode = TREE.find(n => n.id === selectedNode);

  const renderMain = () => {
    if (selectedNode === 'apppools') {
      return (
        <div className="iis-apppool-view">
          <div className="iis-view-title">Application Pools</div>
          <div className="iis-pool-header">
            <span>Name</span>
            <span>.NET CLR Version</span>
            <span>Managed Pipeline Mode</span>
            <span>Identity</span>
            <span>State</span>
          </div>
          {appPools.map(p => (
            <div key={p.name} className="iis-pool-row">
              <span className="iis-pool-name">🔄 {p.name}</span>
              <span>{p.framework}</span>
              <span>{p.pipeline}</span>
              <span>{p.identity}</span>
              <span className={p.state === 'Started' ? 'iis-state-started' : 'iis-state-stopped'}>
                {p.state === 'Started' ? '▶ Started' : '⏹ Stopped'}
              </span>
            </div>
          ))}
        </div>
      );
    }

    if (selectedNode === 'sites' || selectedNode === 'startpage') {
      return (
        <div className="iis-sites-view">
          <div className="iis-view-title">Sites</div>
          <div className="iis-sites-header">
            <span>Name</span><span>ID</span><span>State</span><span>Binding</span><span>Path</span><span>App Pool</span>
          </div>
          {sites.map(s => (
            <div key={s.name} className="iis-sites-row">
              <span>🌍 {s.name}</span>
              <span>{s.id}</span>
              <span className={s.state === 'Started' ? 'iis-state-started' : 'iis-state-stopped'}>
                {s.state === 'Started' ? '▶ Started' : '⏹ Stopped'}
              </span>
              <span
                className="iis-bindings-link"
                onClick={() => setBindingsModal(s)}
              >{s.bindings}</span>
              <span className="iis-path">{s.path}</span>
              <span>{s.appPool}</span>
            </div>
          ))}
        </div>
      );
    }

    // Feature view for server / site nodes
    return (
      <div className="iis-feature-view">
        <div className="iis-view-title">
          {currentNode ? `${currentNode.label} — Feature View` : 'Feature View'}
        </div>
        <div className="iis-feature-section">IIS</div>
        <div className="iis-feature-grid">
          {IIS_FEATURES.map(f => (
            <div key={f.name} className="iis-feature-item" title={f.desc}>
              <span className="iis-feature-icon">{f.icon}</span>
              <span className="iis-feature-name">{f.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="iis-root">
      {/* Toolbar */}
      <div className="iis-toolbar">
        <span className="iis-toolbar-brand">🌐 IIS Manager</span>
        <div className="iis-tb-sep" />
        <button className="iis-tb-btn">📄 File</button>
        <button className="iis-tb-btn">👁️ View</button>
        <button className="iis-tb-btn">❓ Help</button>
        <div style={{ flex: 1 }} />
        <button className="iis-tb-btn">🔄 Connect…</button>
      </div>

      <div className="iis-body">
        {/* Left tree */}
        <div className="iis-left">
          <div className="iis-left-header">Connections</div>
          {TREE.map(node => {
            const visible = node.level === 0 ||
              (node.level === 1 && expanded.has('server')) ||
              (node.level === 2 && expanded.has('sites') && expanded.has('server')) ||
              (node.level === 3 && expanded.has('default-site') && expanded.has('sites') && expanded.has('server'));
            if (!visible) return null;
            return (
              <div
                key={node.id}
                className={`iis-tree-item iis-tree-level-${node.level} ${selectedNode === node.id ? 'active' : ''}`}
                onClick={() => {
                  if (node.expandable) toggleNode(node.id);
                  setSelectedNode(node.id);
                }}
              >
                <span className="iis-tree-caret">
                  {node.expandable ? (expanded.has(node.id) ? '▼' : '▶') : ''}
                </span>
                <span className="iis-tree-icon">{node.icon}</span>
                {node.label}
              </div>
            );
          })}
        </div>

        {/* Center */}
        <div className="iis-center">
          {renderMain()}
        </div>

        {/* Right actions */}
        <div className="iis-right">
          <div className="iis-right-section">Actions</div>
          {SITE_ACTIONS.map((a, i) => {
            if (a === '—') return <div key={i} className="iis-action-sep" />;
            const isHeader = !a.startsWith('   ');
            return (
              <div
                key={i}
                className={`iis-action-item ${isHeader ? '' : 'iis-action-sub'}`}
                onClick={() => {
                  const name = a.trim();
                  const site = sites.find(s => selectedNode === 'default-site' || selectedNode === 'sites');
                  if (name === 'Restart' || name === 'Stop' || name === 'Start') {
                    setSites(ss => ss.map(s => s.name === 'Default Web Site' ? { ...s, state: name === 'Stop' ? 'Stopped' : 'Started' } : s));
                  }
                }}
              >
                {a.trim()}
              </div>
            );
          })}

          <div className="iis-right-section" style={{ marginTop: 8 }}>Application Pools</div>
          {appPools.map(p => (
            <div key={p.name} className="iis-right-pool-item">
              <div className="iis-right-pool-name">{p.name}</div>
              <button
                className={`iis-right-pool-btn ${p.state === 'Started' ? 'iis-pool-stop' : 'iis-pool-start'}`}
                onClick={() => togglePool(p.name)}
              >
                {p.state === 'Started' ? '⏹ Stop' : '▶ Start'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bindings modal */}
      {bindingsModal && (
        <div className="iis-overlay" onClick={() => setBindingsModal(null)}>
          <div className="iis-modal" onClick={e => e.stopPropagation()}>
            <div className="iis-modal-title">Site Bindings — {bindingsModal.name}</div>
            <div className="iis-modal-header">
              <span>Type</span><span>Host Name</span><span>Port</span><span>IP Address</span>
            </div>
            {[
              { type: 'http', host: '', port: '80', ip: '*' },
              { type: 'https', host: '', port: '443', ip: '*' },
            ].map((b, i) => (
              <div key={i} className="iis-modal-row">
                <span>{b.type}</span><span>{b.host || 'All Unassigned'}</span><span>{b.port}</span><span>{b.ip}</span>
              </div>
            ))}
            <div className="iis-modal-btns">
              <button className="iis-modal-btn" onClick={() => {}}>Add…</button>
              <button className="iis-modal-btn" onClick={() => {}}>Edit…</button>
              <button className="iis-modal-btn" onClick={() => {}}>Remove</button>
              <button className="iis-modal-btn" onClick={() => setBindingsModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
