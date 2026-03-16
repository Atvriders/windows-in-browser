import { useDesktopStore } from '../../store/useDesktopStore';
import { useWindowStore } from '../../store/useWindowStore';
import type { AppID } from '../../types/window';
import './StartMenu.css';

const apps: { appId: AppID; name: string; icon: string }[] = [
  { appId: 'fileExplorer', name: 'File Explorer', icon: '📁' },
  { appId: 'browser', name: 'Browser', icon: '🌐' },
  { appId: 'notepad', name: 'Notepad', icon: '📝' },
];

export default function StartMenu() {
  const { closeStartMenu } = useDesktopStore();
  const { openWindow } = useWindowStore();

  const launch = (appId: AppID, name: string) => {
    openWindow(appId, name);
    closeStartMenu();
  };

  return (
    <div className="start-menu">
      <div className="start-menu-header">
        <input className="start-search" placeholder="Type here to search" autoFocus />
      </div>
      <div className="start-menu-apps">
        <div className="start-menu-section-title">Apps</div>
        <div className="start-menu-grid">
          {apps.map(app => (
            <button key={app.appId} className="start-tile" onClick={() => launch(app.appId, app.name)}>
              <span className="start-tile-icon">{app.icon}</span>
              <span className="start-tile-name">{app.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="start-menu-footer">
        <div className="start-user">👤 User</div>
        <button className="start-power" onClick={closeStartMenu}>⏻</button>
      </div>
    </div>
  );
}
