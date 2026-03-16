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
  { appId: 'word', name: 'Word', icon: '📘' },
  { appId: 'excel', name: 'Excel', icon: '📗' },
  { appId: 'powerPoint', name: 'PowerPoint', icon: '📙' },
  { appId: 'outlook', name: 'Outlook', icon: '📧' },
  { appId: 'oneNote', name: 'OneNote', icon: '🗒' },
  { appId: 'photoshop', name: 'Photoshop', icon: '🖼' },
  { appId: 'illustrator', name: 'Illustrator', icon: '✒' },
  { appId: 'premiere', name: 'Premiere Pro', icon: '🎬' },
  { appId: 'afterEffects', name: 'After Effects', icon: '✨' },
  { appId: 'autoCAD', name: 'AutoCAD', icon: '📐' },
  { appId: 'solidWorks', name: 'SolidWorks', icon: '⚙' },
];

interface Props {
  onRestart: () => void;
  onShutdown: () => void;
}

export default function StartMenu({ onRestart, onShutdown }: Props) {
  const { closeStartMenu } = useDesktopStore();
  const { openWindow } = useWindowStore();
  const [search, setSearch] = useState('');
  const [showPower, setShowPower] = useState(false);

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
        <div className="start-user">👤 User</div>
        <div className="start-power-wrapper">
          {showPower && (
            <div className="start-power-menu">
              <button className="start-power-item" onClick={() => {}}>😴 Sleep</button>
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
