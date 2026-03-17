import { useState } from 'react';
import './GroupPolicy.css';

type PolicyState = 'Not Configured' | 'Enabled' | 'Disabled';

interface Policy {
  name: string;
  state: PolicyState;
  comment: string;
  description: string;
  category: string;
}

const POLICIES: Policy[] = [
  // Computer Config / Windows Settings / Security Settings
  { name: 'Account lockout threshold', state: 'Enabled', comment: 'Set to 5 attempts', category: 'comp-security', description: 'Determines the number of failed logon attempts that will cause a user account to be locked out.' },
  { name: 'Maximum password age', state: 'Enabled', comment: '90 days', category: 'comp-security', description: 'Determines the maximum number of days that a password may be used before the user is required to change it.' },
  { name: 'Minimum password length', state: 'Enabled', comment: '12 characters', category: 'comp-security', description: 'Determines the least number of characters that can make up a password for a user account.' },
  { name: 'Password must meet complexity requirements', state: 'Enabled', comment: '', category: 'comp-security', description: 'Determines whether passwords must meet complexity requirements such as containing uppercase, lowercase, numeric, and special characters.' },
  { name: 'Rename administrator account', state: 'Enabled', comment: 'Renamed to sysadmin', category: 'comp-security', description: 'Determines whether a different account name is associated with the security identifier (SID) for the Administrator account.' },
  { name: 'Rename guest account', state: 'Enabled', comment: 'Renamed to guest_acct', category: 'comp-security', description: 'Determines whether a different account name is associated with the SID for the Guest account.' },
  // Computer Config / Admin Templates
  { name: 'Turn off Autoplay', state: 'Enabled', comment: '', category: 'comp-admin', description: 'Disables the Autoplay feature. Autoplay begins reading from a drive as soon as you insert media in the drive.' },
  { name: 'Configure Windows SmartScreen', state: 'Enabled', comment: 'Warn mode', category: 'comp-admin', description: 'This policy setting allows you to manage the behavior of Windows SmartScreen.' },
  { name: 'Do not send additional data when a data collection policy is not configured', state: 'Enabled', comment: '', category: 'comp-admin', description: 'This policy setting configures the behavior of Windows Error Reporting.' },
  { name: 'Turn off Windows Error Reporting', state: 'Not Configured', comment: '', category: 'comp-admin', description: 'Disables Windows Error Reporting and prevents it from prompting the user to send information about application failures to Microsoft.' },
  { name: 'Disable Windows Update', state: 'Not Configured', comment: '', category: 'comp-admin', description: 'Prevents access to Windows Update.' },
  { name: 'Configure Automatic Updates', state: 'Enabled', comment: 'Auto download and notify for install', category: 'comp-admin', description: 'Specifies whether computers in your environment will receive security updates and other important downloads through the Windows automatic updating service.' },
  { name: 'Allow BitLocker without a compatible TPM', state: 'Not Configured', comment: '', category: 'comp-admin', description: 'This policy setting allows you to use BitLocker Drive Encryption without a compatible TPM.' },
  { name: 'Prohibit access to Control Panel and PC settings', state: 'Not Configured', comment: '', category: 'comp-admin', description: 'Disables all Control Panel programs and the PC Settings app.' },
  { name: 'Remove Task Manager', state: 'Not Configured', comment: '', category: 'comp-admin', description: 'Prevents users from starting Task Manager.' },
  // User Config / Windows Settings
  { name: 'Script — Logon', state: 'Not Configured', comment: '', category: 'user-windows', description: 'Run specified scripts when users log on.' },
  { name: 'Script — Logoff', state: 'Not Configured', comment: '', category: 'user-windows', description: 'Run specified scripts when users log off.' },
  { name: 'Folder Redirection — Desktop', state: 'Enabled', comment: '\\\\Server\\Users\\%USERNAME%\\Desktop', category: 'user-windows', description: 'Redirects the Desktop folder to a network location.' },
  { name: 'Folder Redirection — Documents', state: 'Enabled', comment: '\\\\Server\\Users\\%USERNAME%\\Documents', category: 'user-windows', description: 'Redirects the Documents folder to a network location.' },
  // User Config / Admin Templates
  { name: 'Disable the command prompt', state: 'Not Configured', comment: '', category: 'user-admin', description: 'Disables the Windows command prompt.' },
  { name: 'Prevent access to registry editing tools', state: 'Not Configured', comment: '', category: 'user-admin', description: 'Disables the Windows registry editors, Regedit.exe and Regedt32.exe.' },
  { name: 'Turn off toast notifications on the lock screen', state: 'Enabled', comment: '', category: 'user-admin', description: 'Turns off toast notifications on the lock screen.' },
  { name: 'Do not use the search-based method when resolving shell shortcuts', state: 'Not Configured', comment: '', category: 'user-admin', description: 'Affects the method used to resolve shortcut files whose targets have been moved.' },
  { name: 'Remove Run menu from Start Menu', state: 'Not Configured', comment: '', category: 'user-admin', description: 'Allows you to remove the Run command from the Start menu.' },
  { name: 'Clear history of recently opened documents on exit', state: 'Not Configured', comment: '', category: 'user-admin', description: 'Clears the recent documents list when the user logs off.' },
  { name: 'Prevent the usage of OneDrive for file storage', state: 'Disabled', comment: '', category: 'user-admin', description: 'Prevents apps and features from working with files on OneDrive.' },
  { name: 'Turn off Windows Copilot', state: 'Enabled', comment: '', category: 'user-admin', description: 'Disables Windows Copilot (AI assistant) for all users.' },
];

type TreeNode = {
  id: string;
  label: string;
  level: number;
  expandable: boolean;
  category?: string;
};

const TREE: TreeNode[] = [
  { id: 'root', label: 'Local Computer Policy', level: 0, expandable: true },
  { id: 'comp', label: 'Computer Configuration', level: 1, expandable: true },
  { id: 'comp-sw', label: 'Software Settings', level: 2, expandable: false },
  { id: 'comp-win', label: 'Windows Settings', level: 2, expandable: true },
  { id: 'comp-security', label: 'Security Settings', level: 3, expandable: false, category: 'comp-security' },
  { id: 'comp-admin', label: 'Administrative Templates', level: 2, expandable: false, category: 'comp-admin' },
  { id: 'user', label: 'User Configuration', level: 1, expandable: true },
  { id: 'user-sw', label: 'Software Settings', level: 2, expandable: false },
  { id: 'user-win', label: 'Windows Settings', level: 2, expandable: false, category: 'user-windows' },
  { id: 'user-admin', label: 'Administrative Templates', level: 2, expandable: false, category: 'user-admin' },
];

interface PolicyDialog {
  policy: Policy;
}

export default function GroupPolicy() {
  const [expanded, setExpanded] = useState(new Set(['root', 'comp', 'comp-win', 'user']));
  const [selectedNode, setSelectedNode] = useState<TreeNode>(TREE[4]);
  const [policies, setPolicies] = useState<Policy[]>(POLICIES);
  const [dialog, setDialog] = useState<PolicyDialog | null>(null);
  const [dialogState, setDialogState] = useState<PolicyState>('Not Configured');

  const toggleNode = (id: string) => {
    setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const filteredPolicies = selectedNode.category
    ? policies.filter(p => p.category === selectedNode.category)
    : [];

  const openDialog = (policy: Policy) => {
    setDialog({ policy });
    setDialogState(policy.state);
  };

  const savePolicy = () => {
    if (!dialog) return;
    setPolicies(ps => ps.map(p => p.name === dialog.policy.name ? { ...p, state: dialogState } : p));
    setDialog(null);
  };

  const stateColor = (state: PolicyState) => {
    if (state === 'Enabled') return '#2ecc71';
    if (state === 'Disabled') return '#e74c3c';
    return '#aaa';
  };

  return (
    <div className="gp-root">
      {/* Toolbar */}
      <div className="gp-toolbar">
        <button className="gp-tb-btn">📄 Action</button>
        <button className="gp-tb-btn">👁️ View</button>
        <div className="gp-tb-sep" />
        <button className="gp-tb-btn">⬅ Back</button>
        <button className="gp-tb-btn">➡ Forward</button>
        <div className="gp-tb-sep" />
        <button className="gp-tb-btn">🔄 Refresh</button>
        <button className="gp-tb-btn">❓ Help</button>
      </div>

      <div className="gp-body">
        {/* Left tree */}
        <div className="gp-left">
          {TREE.map(node => {
            const visible = node.level === 0 || (node.level === 1 && expanded.has('root')) ||
              (node.level === 2 && expanded.has(node.id.startsWith('comp') ? 'comp' : 'user')) ||
              (node.level === 3 && expanded.has('comp-win'));
            if (!visible) return null;
            return (
              <div
                key={node.id}
                className={`gp-tree-item gp-tree-level-${node.level} ${selectedNode.id === node.id ? 'active' : ''}`}
                onClick={() => {
                  if (node.expandable) toggleNode(node.id);
                  setSelectedNode(node);
                }}
              >
                <span className="gp-tree-caret">
                  {node.expandable ? (expanded.has(node.id) ? '▼' : '▶') : ''}
                </span>
                <span className="gp-tree-icon">
                  {node.expandable ? '📁' : '📄'}
                </span>
                {node.label}
              </div>
            );
          })}
        </div>

        {/* Right policy list */}
        <div className="gp-right">
          <div className="gp-right-path">{selectedNode.label}</div>
          {filteredPolicies.length === 0 ? (
            <div className="gp-empty">
              {selectedNode.expandable
                ? 'Select a sub-node to view policies.'
                : 'This container has no policy settings.'}
            </div>
          ) : (
            <>
              <div className="gp-policy-header">
                <span className="gp-col-name">Policy</span>
                <span className="gp-col-state">Setting</span>
                <span className="gp-col-comment">Comment</span>
              </div>
              <div className="gp-policy-list">
                {filteredPolicies.map(p => (
                  <div
                    key={p.name}
                    className="gp-policy-row"
                    onDoubleClick={() => openDialog(p)}
                  >
                    <span className="gp-col-name">📋 {p.name}</span>
                    <span className="gp-col-state" style={{ color: stateColor(p.state) }}>{p.state}</span>
                    <span className="gp-col-comment">{p.comment}</span>
                  </div>
                ))}
              </div>
              <div className="gp-right-hint">Double-click a policy to edit its settings.</div>
            </>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="gp-statusbar">
        <span>Local Computer Policy</span>
        <span>|</span>
        <span>{filteredPolicies.filter(p => p.state === 'Enabled').length} enabled · {filteredPolicies.filter(p => p.state === 'Disabled').length} disabled · {filteredPolicies.filter(p => p.state === 'Not Configured').length} not configured</span>
      </div>

      {/* Policy dialog */}
      {dialog && (
        <div className="gp-overlay">
          <div className="gp-dialog">
            <div className="gp-dialog-title">{dialog.policy.name}</div>
            <div className="gp-dialog-body">
              <div className="gp-dialog-radio-group">
                {(['Not Configured', 'Enabled', 'Disabled'] as PolicyState[]).map(s => (
                  <label key={s} className={`gp-dialog-radio ${dialogState === s ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="pstate"
                      checked={dialogState === s}
                      onChange={() => setDialogState(s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
              <div className="gp-dialog-sep" />
              <div className="gp-dialog-help-label">Supported on: Windows 10 and later</div>
              <div className="gp-dialog-help">{dialog.policy.description}</div>
            </div>
            <div className="gp-dialog-btns">
              <button className="gp-dialog-btn" onClick={savePolicy}>OK</button>
              <button className="gp-dialog-btn" onClick={() => setDialog(null)}>Cancel</button>
              <button className="gp-dialog-btn" onClick={savePolicy}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
