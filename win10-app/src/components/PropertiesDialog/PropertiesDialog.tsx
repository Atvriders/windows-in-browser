import type { FSNode } from '../../types/filesystem';
import type { FileSystemDriver } from '../../filesystem/FileSystemDriver';
import './PropertiesDialog.css';

interface Props {
  node?: FSNode;
  appLabel?: string;
  appIcon?: string;
  driver?: FileSystemDriver | null;
  onClose: () => void;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 bytes';
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB (${bytes.toLocaleString()} bytes)`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB (${bytes.toLocaleString()} bytes)`;
}

function formatDate(ts: number): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function winPath(path: string): string {
  // driver.getPath returns "/C:/Users/..." — convert to "C:\Users\..."
  return path.replace(/^\//, '').replace(/\//g, '\\');
}

function typeLabel(node: FSNode): string {
  if (node.type === 'directory') return 'File folder';
  const mime = (node as any).mimeType ?? '';
  if (mime === 'text/plain') return 'Text Document (.txt)';
  if (mime === 'text/html') return 'HTML Document (.html)';
  const ext = node.name.split('.').pop()?.toUpperCase();
  return ext ? `${ext} File` : 'File';
}

export default function PropertiesDialog({ node, appLabel, appIcon, driver, onClose }: Props) {
  const isAppShortcut = !node;
  const name = node?.name ?? appLabel ?? 'Unknown';
  const icon = appIcon ?? (node?.type === 'directory' ? '📁' : '📄');

  const fullPath = node && driver ? winPath(driver.getPath(node.id)) : null;
  const location = fullPath ? fullPath.split('\\').slice(0, -1).join('\\') || 'This PC' : null;

  const fileSize = node?.type === 'file' ? (node as any).content?.length ?? 0 : null;
  const childCount = node?.type === 'directory' && driver
    ? driver.getChildren(node.id).length
    : null;

  return (
    <div className="props-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="props-dialog">
        <div className="props-titlebar">
          <span>{name} Properties</span>
          <button className="props-close" onClick={onClose}>✕</button>
        </div>

        <div className="props-body">
          <div className="props-header">
            <span className="props-icon">{icon}</span>
            <span className="props-name">{name}</span>
          </div>
          <div className="props-divider" />

          <table className="props-table">
            <tbody>
              <tr>
                <td className="props-key">Type:</td>
                <td>{isAppShortcut ? 'Application shortcut' : typeLabel(node!)}</td>
              </tr>
              {location && (
                <tr>
                  <td className="props-key">Location:</td>
                  <td className="props-path">{location}</td>
                </tr>
              )}
              {fileSize !== null && (
                <tr>
                  <td className="props-key">Size:</td>
                  <td>{formatSize(fileSize)}</td>
                </tr>
              )}
              {childCount !== null && (
                <tr>
                  <td className="props-key">Contains:</td>
                  <td>{childCount} item{childCount !== 1 ? 's' : ''}</td>
                </tr>
              )}
            </tbody>
          </table>

          {node && (
            <>
              <div className="props-divider" />
              <table className="props-table">
                <tbody>
                  <tr>
                    <td className="props-key">Created:</td>
                    <td>{formatDate(node.createdAt)}</td>
                  </tr>
                  {node.type === 'file' && (
                    <tr>
                      <td className="props-key">Modified:</td>
                      <td>{formatDate(node.modifiedAt)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className="props-footer">
          <button className="props-btn" onClick={onClose}>OK</button>
          <button className="props-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
