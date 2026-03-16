import { useState } from 'react';
import './Steam.css';

interface Game {
  id: number;
  name: string;
  icon: string;
  genre: string;
  size: string;
  lastPlayed: string;
  playtime: string;
  installed: boolean;
  status?: 'playing' | 'update';
}

const LIBRARY: Game[] = [
  { id: 1, name: 'Counter-Strike 2', icon: '🎯', genre: 'FPS', size: '31.2 GB', lastPlayed: 'Today', playtime: '342 hrs', installed: true, status: 'playing' },
  { id: 2, name: 'Cyberpunk 2077', icon: '🌆', genre: 'RPG', size: '70.4 GB', lastPlayed: '2 days ago', playtime: '124 hrs', installed: true },
  { id: 3, name: 'Elden Ring', icon: '⚔️', genre: 'Action RPG', size: '60.0 GB', lastPlayed: 'Last week', playtime: '89 hrs', installed: true },
  { id: 4, name: 'Minecraft', icon: '⛏️', genre: 'Sandbox', size: '1.2 GB', lastPlayed: 'Yesterday', playtime: '512 hrs', installed: true },
  { id: 5, name: 'Baldur\'s Gate 3', icon: '🐉', genre: 'RPG', size: '122.3 GB', lastPlayed: '3 days ago', playtime: '67 hrs', installed: true, status: 'update' },
  { id: 6, name: 'Hogwarts Legacy', icon: '🧙', genre: 'Action RPG', size: '85.1 GB', lastPlayed: 'Last month', playtime: '45 hrs', installed: true },
  { id: 7, name: 'GTA V', icon: '🚗', genre: 'Action', size: '94.6 GB', lastPlayed: 'Last month', playtime: '203 hrs', installed: false },
  { id: 8, name: 'Red Dead Redemption 2', icon: '🤠', genre: 'Action', size: '150.0 GB', lastPlayed: '2 months ago', playtime: '78 hrs', installed: false },
  { id: 9, name: 'Stardew Valley', icon: '🌾', genre: 'Simulation', size: '0.5 GB', lastPlayed: 'Last week', playtime: '210 hrs', installed: true },
  { id: 10, name: 'Hollow Knight', icon: '🦋', genre: 'Metroidvania', size: '9.0 GB', lastPlayed: '2 weeks ago', playtime: '55 hrs', installed: true },
  { id: 11, name: 'The Witcher 3', icon: '🗡️', genre: 'RPG', size: '50.0 GB', lastPlayed: '2 months ago', playtime: '156 hrs', installed: false },
  { id: 12, name: 'Hades', icon: '🔱', genre: 'Roguelike', size: '14.2 GB', lastPlayed: 'Last week', playtime: '93 hrs', installed: true },
  { id: 13, name: 'Terraria', icon: '🌍', genre: 'Sandbox', size: '0.3 GB', lastPlayed: 'Last month', playtime: '420 hrs', installed: true },
  { id: 14, name: 'Dota 2', icon: '🏆', genre: 'MOBA', size: '35.0 GB', lastPlayed: '5 days ago', playtime: '1,204 hrs', installed: true },
  { id: 15, name: 'Among Us', icon: '🚀', genre: 'Party', size: '0.3 GB', lastPlayed: '6 months ago', playtime: '28 hrs', installed: false },
];

const STORE_FEATURED = [
  { id: 101, name: 'Starfield', icon: '🌌', price: '$69.99', discount: null, genre: 'RPG' },
  { id: 102, name: 'Alan Wake 2', icon: '🔦', price: '$59.99', discount: '-20%', genre: 'Horror' },
  { id: 103, name: 'Lies of P', icon: '🎭', price: '$49.99', discount: '-25%', genre: 'Souls-like' },
  { id: 104, name: 'Forza Horizon 5', icon: '🏎️', price: '$59.99', discount: '-33%', genre: 'Racing' },
  { id: 105, name: 'Sea of Stars', icon: '⭐', price: '$34.99', discount: null, genre: 'RPG' },
  { id: 106, name: 'Dave the Diver', icon: '🤿', price: '$19.99', discount: '-15%', genre: 'Adventure' },
];

type Tab = 'store' | 'library' | 'community' | 'profile';

export default function Steam() {
  const [tab, setTab] = useState<Tab>('library');
  const [selected, setSelected] = useState<Game | null>(LIBRARY[0]);
  const [search, setSearch] = useState('');

  const filtered = LIBRARY.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
  const installed = filtered.filter(g => g.installed);
  const notInstalled = filtered.filter(g => !g.installed);

  return (
    <div className="steam">
      <div className="steam-titlebar">
        <span className="steam-logo">STEAM</span>
        <nav className="steam-nav">
          {(['store','library','community','profile'] as Tab[]).map(t => (
            <button key={t} className={`steam-nav-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
        <div className="steam-nav-right">
          <span className="steam-username">👤 User</span>
          <span className="steam-balance">$24.50</span>
        </div>
      </div>

      {tab === 'library' && (
        <div className="steam-library">
          <div className="steam-sidebar">
            <input className="steam-search" placeholder="🔍 Search games..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="steam-list-header">INSTALLED ({installed.length})</div>
            {installed.map(g => (
              <button key={g.id} className={`steam-game-item ${selected?.id === g.id ? 'active' : ''}`} onClick={() => setSelected(g)}>
                <span className="steam-game-icon">{g.icon}</span>
                <div className="steam-game-info">
                  <span className="steam-game-name">{g.name}</span>
                  {g.status === 'playing' && <span className="steam-badge playing">Playing</span>}
                  {g.status === 'update' && <span className="steam-badge update">Update</span>}
                </div>
              </button>
            ))}
            {notInstalled.length > 0 && (
              <>
                <div className="steam-list-header">NOT INSTALLED ({notInstalled.length})</div>
                {notInstalled.map(g => (
                  <button key={g.id} className={`steam-game-item not-installed ${selected?.id === g.id ? 'active' : ''}`} onClick={() => setSelected(g)}>
                    <span className="steam-game-icon">{g.icon}</span>
                    <span className="steam-game-name">{g.name}</span>
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="steam-detail">
            {selected ? (
              <>
                <div className="steam-hero" style={{ background: `linear-gradient(135deg, #1a2a4a 0%, #0e1621 100%)` }}>
                  <div className="steam-hero-icon">{selected.icon}</div>
                  <div className="steam-hero-info">
                    <h2 className="steam-hero-title">{selected.name}</h2>
                    <div className="steam-hero-meta">
                      <span>{selected.genre}</span>
                      <span>·</span>
                      <span>{selected.playtime} on record</span>
                    </div>
                  </div>
                </div>
                <div className="steam-detail-body">
                  <div className="steam-detail-actions">
                    {selected.installed ? (
                      <>
                        <button className="steam-play-btn">▶ Play</button>
                        {selected.status === 'update' && <button className="steam-update-btn">⬇ Update</button>}
                        <button className="steam-action-btn">📊 Stats</button>
                        <button className="steam-action-btn">🏆 Achievements</button>
                        <button className="steam-action-btn">⚙ Properties</button>
                      </>
                    ) : (
                      <button className="steam-install-btn">⬇ Install</button>
                    )}
                  </div>
                  <div className="steam-detail-stats">
                    <div className="steam-stat"><span>Last played</span><b>{selected.lastPlayed}</b></div>
                    <div className="steam-stat"><span>Playtime</span><b>{selected.playtime}</b></div>
                    <div className="steam-stat"><span>Disk space</span><b>{selected.size}</b></div>
                    <div className="steam-stat"><span>Genre</span><b>{selected.genre}</b></div>
                    <div className="steam-stat"><span>Status</span><b style={{ color: selected.installed ? '#6bcb77' : '#aaa' }}>{selected.installed ? 'Installed' : 'Not installed'}</b></div>
                  </div>
                  <div className="steam-friends-activity">
                    <div className="steam-section-title">Friends Activity</div>
                    <div className="steam-friend-row">
                      <span>🟢 Alex_G</span><span>playing {selected.name}</span><span>2 hrs</span>
                    </div>
                    <div className="steam-friend-row">
                      <span>🟢 KingSlayer99</span><span>playing {selected.name}</span><span>45 min</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="steam-empty">Select a game from your library</div>
            )}
          </div>
        </div>
      )}

      {tab === 'store' && (
        <div className="steam-store">
          <div className="steam-store-banner">
            <div className="steam-banner-text">
              <h2>Weekend Deal</h2>
              <p>Up to 75% off on top titles</p>
              <button className="steam-play-btn">Browse Sales</button>
            </div>
          </div>
          <div className="steam-store-section">
            <div className="steam-section-title">Featured &amp; Recommended</div>
            <div className="steam-store-grid">
              {STORE_FEATURED.map(g => (
                <div key={g.id} className="steam-store-card">
                  <div className="steam-store-card-art">{g.icon}</div>
                  <div className="steam-store-card-info">
                    <div className="steam-store-card-name">{g.name}</div>
                    <div className="steam-store-card-genre">{g.genre}</div>
                    <div className="steam-store-card-price">
                      {g.discount && <span className="steam-discount">{g.discount}</span>}
                      <span className="steam-price">{g.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'community' && (
        <div className="steam-community">
          <div className="steam-section-title" style={{ padding: '16px' }}>Community Hub</div>
          <div className="steam-community-stats">
            <div className="steam-comm-stat"><b>2,847</b><span>Friends Online</span></div>
            <div className="steam-comm-stat"><b>142M</b><span>Players Online</span></div>
            <div className="steam-comm-stat"><b>50,000+</b><span>Games Available</span></div>
          </div>
          <div style={{ padding: '16px' }}>
            {['Activity Feed','Discussions','Screenshots','Workshop','Market'].map(s => (
              <div key={s} className="steam-community-item">🔗 {s}</div>
            ))}
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <div className="steam-profile">
          <div className="steam-profile-hero">
            <div className="steam-avatar">👤</div>
            <div>
              <div className="steam-profile-name">User</div>
              <div className="steam-profile-level">Level 42 · Steam Member since 2018</div>
              <div className="steam-online-status">🟢 Online</div>
            </div>
          </div>
          <div className="steam-profile-stats">
            <div className="steam-pstat"><b>{LIBRARY.length}</b><span>Games</span></div>
            <div className="steam-pstat"><b>847</b><span>Achievements</span></div>
            <div className="steam-pstat"><b>$24.50</b><span>Wallet</span></div>
            <div className="steam-pstat"><b>12</b><span>Friends</span></div>
          </div>
        </div>
      )}

      <div className="steam-statusbar">
        <span>🟢 Steam Online</span>
        <span>{LIBRARY.filter(g => g.installed).length} games installed</span>
        <span>▼ 0 KB/s</span>
      </div>
    </div>
  );
}
