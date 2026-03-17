import { useState } from 'react';
import { useDesktopStore } from '../../store/useDesktopStore';
import { useWindowStore } from '../../store/useWindowStore';
import type { AppID } from '../../types/window';
import './StartMenu.css';

const ALL_APPS: { appId: AppID; name: string; icon: string }[] = [
  { appId: 'fileExplorer', name: 'File Explorer', icon: '📁' },
  { appId: 'browser', name: 'Browser', icon: '🌐' },
  { appId: 'notepad', name: 'Notepad', icon: '📝' },
  { appId: 'taskManager', name: 'Task Manager', icon: '📊' },
  { appId: 'calculator', name: 'Calculator', icon: '🧮' },
  { appId: 'calendar', name: 'Calendar', icon: '📅' },
  { appId: 'maps', name: 'Maps', icon: '🗺️' },
  { appId: 'snippingTool', name: 'Snipping Tool', icon: '✂️' },
  { appId: 'paint', name: 'Paint', icon: '🎨' },
  { appId: 'settings', name: 'Settings', icon: '⚙️' },
  { appId: 'windowsStore', name: 'Microsoft Store', icon: '🛒' },
  { appId: 'word', name: 'Word', icon: '📘' },
  { appId: 'excel', name: 'Excel', icon: '📗' },
  { appId: 'powerPoint', name: 'PowerPoint', icon: '📙' },
  { appId: 'outlook', name: 'Outlook', icon: '📧' },
  { appId: 'oneNote', name: 'OneNote', icon: '🗒' },
  { appId: 'spotify', name: 'Spotify', icon: '🎵' },
  { appId: 'discord', name: 'Discord', icon: '💬' },
  { appId: 'vlc', name: 'VLC', icon: '🎬' },
  { appId: 'steam', name: 'Steam', icon: '🎮' },
  { appId: 'photoshop', name: 'Photoshop', icon: '🖼' },
  { appId: 'illustrator', name: 'Illustrator', icon: '✒' },
  { appId: 'premiere', name: 'Premiere Pro', icon: '🎬' },
  { appId: 'afterEffects', name: 'After Effects', icon: '✨' },
  { appId: 'autoCAD', name: 'AutoCAD', icon: '📐' },
  { appId: 'solidWorks', name: 'SolidWorks', icon: '⚙' },
  { appId: 'teams', name: 'Microsoft Teams', icon: '👥' },
  { appId: 'obs', name: 'OBS Studio', icon: '🔴' },
  { appId: 'notepadPlusPlus', name: 'Notepad++', icon: '📝' },
  { appId: 'sevenZip', name: '7-Zip', icon: '🗜️' },
  { appId: 'qbittorrent', name: 'qBittorrent', icon: '🔽' },
  { appId: 'crystalDiskInfo', name: 'CrystalDiskInfo', icon: '💾' },
  { appId: 'gpuZ', name: 'GPU-Z', icon: '🎮' },
  { appId: 'processHacker', name: 'Process Hacker', icon: '🔬' },
  { appId: 'cmd', name: 'Command Prompt', icon: '💻' },
  { appId: 'deviceManager', name: 'Device Manager', icon: '🖥️' },
  { appId: 'diskManagement', name: 'Disk Management', icon: '💿' },
  { appId: 'registryEditor', name: 'Registry Editor', icon: '📋' },
  { appId: 'ipScanner', name: 'IP Scanner', icon: '📡' },
  { appId: 'malwarebytes', name: 'Malwarebytes', icon: '🛡️' },
  { appId: 'cpuZ', name: 'CPU-Z', icon: '⚙️' },
  { appId: 'hwMonitor', name: 'HWMonitor', icon: '🌡️' },
  { appId: 'ccleaner', name: 'CCleaner', icon: '🧹' },
  { appId: 'wireshark', name: 'Wireshark', icon: '🦈' },
  { appId: 'winDirStat', name: 'WinDirStat', icon: '📂' },
  { appId: 'stickyNotes', name: 'Sticky Notes', icon: '📝' },
  { appId: 'clockApp', name: 'Clock', icon: '🕐' },
  { appId: 'jellyfin', name: 'Jellyfin', icon: '🪼' },
];

interface Props {
  onRestart: () => void;
  onShutdown: () => void;
  onSleep: () => void;
  onLock: () => void;
  onSignOut?: () => void;
}

export default function StartMenu({ onRestart, onShutdown, onSleep, onLock, onSignOut }: Props) {
  const { closeStartMenu } = useDesktopStore();
  const { openWindow } = useWindowStore();
  const [search, setSearch] = useState('');
  const [showPower, setShowPower] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);

  const filtered = ALL_APPS.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  const launch = (appId: AppID, name: string) => {
    openWindow(appId, name);
    closeStartMenu();
  };

  const handleRestart = () => { closeStartMenu(); onRestart(); };
  const handleShutdown = () => { closeStartMenu(); onShutdown(); };

  return (
    <div className="start-menu">
      <div className="start-menu-header">
        <input
          className="start-search"
          placeholder="Type here to search"
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="start-menu-apps">
        {search ? (
          <>
            <div className="start-menu-section-title">Search Results</div>
            {filtered.length === 0 && <div className="start-no-results">No results found</div>}
            <div className="start-list">
              {filtered.map(app => (
                <button key={app.appId} className="start-list-item" onClick={() => launch(app.appId, app.name)}>
                  <span className="start-list-icon">{app.icon}</span>
                  <span>{app.name}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="start-menu-section-title">Pinned</div>
            <div className="start-menu-grid">
              {ALL_APPS.map(app => (
                <button key={app.appId} className="start-tile" onClick={() => launch(app.appId, app.name)}>
                  <span className="start-tile-icon">{app.icon}</span>
                  <span className="start-tile-name">{app.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="start-menu-footer">
        {showUserPanel && (
          <div className="start-user-panel">
            <div className="start-user-panel-avatar">👤</div>
            <div className="start-user-panel-name">User</div>
            <div className="start-user-panel-type">Local Account</div>
            <div className="start-user-panel-divider" />
            <button className="start-user-panel-item" onClick={() => { openWindow('settings', 'Settings', { initialPage: 'accounts' }); closeStartMenu(); }}>⚙ Change account settings</button>
            <button className="start-user-panel-item" onClick={() => { closeStartMenu(); onLock(); }}>🔒 Lock</button>
            <button className="start-user-panel-item" onClick={() => { closeStartMenu(); (onSignOut ?? onLock)(); }}>🚪 Sign out</button>
          </div>
        )}
        <button className="start-user-btn" onClick={() => setShowUserPanel(p => !p)}>
          <span className="start-user-avatar">👤</span>
          <span>User</span>
        </button>
        <div className="start-power-wrapper">
          {showPower && (
            <div className="start-power-menu">
              <button className="start-power-item" onClick={() => { closeStartMenu(); onSleep(); }}>😴 Sleep</button>
              <button className="start-power-item" onClick={handleShutdown}>⏻ Shut down</button>
              <button className="start-power-item" onClick={handleRestart}>🔄 Restart</button>
            </div>
          )}
          <button className="start-power" onClick={() => setShowPower(p => !p)} title="Power">⏻</button>
        </div>
      </div>
    </div>
  );
}
