import { useState } from 'react';
import './Jellyfin.css';

type View = 'home' | 'movies' | 'tvshows' | 'music' | 'player';

interface MediaItem {
  id: number;
  title: string;
  year: number;
  genre: string;
  rating: string;
  duration: string;
  type: 'movie' | 'episode' | 'music';
  season?: string;
  artist?: string;
  progress?: number; // 0-100
}

const MOVIES: MediaItem[] = [
  { id: 1, title: 'Dune: Part Two', year: 2024, genre: 'Sci-Fi', rating: '8.6', duration: '2h 46m', type: 'movie', progress: 42 },
  { id: 2, title: 'Oppenheimer', year: 2023, genre: 'Drama', rating: '8.3', duration: '3h 0m', type: 'movie' },
  { id: 3, title: 'The Dark Knight', year: 2008, genre: 'Action', rating: '9.0', duration: '2h 32m', type: 'movie' },
  { id: 4, title: 'Interstellar', year: 2014, genre: 'Sci-Fi', rating: '8.7', duration: '2h 49m', type: 'movie' },
  { id: 5, title: 'Blade Runner 2049', year: 2017, genre: 'Sci-Fi', rating: '8.0', duration: '2h 44m', type: 'movie' },
  { id: 6, title: 'The Shawshank Redemption', year: 1994, genre: 'Drama', rating: '9.3', duration: '2h 22m', type: 'movie' },
  { id: 7, title: 'Mad Max: Fury Road', year: 2015, genre: 'Action', rating: '8.1', duration: '2h 0m', type: 'movie' },
  { id: 8, title: 'Arrival', year: 2016, genre: 'Sci-Fi', rating: '7.9', duration: '1h 56m', type: 'movie' },
  { id: 9, title: 'Everything Everywhere All at Once', year: 2022, genre: 'Sci-Fi', rating: '7.8', duration: '2h 19m', type: 'movie' },
  { id: 10, title: 'Poor Things', year: 2023, genre: 'Fantasy', rating: '8.0', duration: '2h 21m', type: 'movie' },
  { id: 11, title: 'Parasite', year: 2019, genre: 'Thriller', rating: '8.5', duration: '2h 12m', type: 'movie' },
  { id: 12, title: 'The Batman', year: 2022, genre: 'Action', rating: '7.8', duration: '2h 56m', type: 'movie' },
];

const TV_SHOWS: { title: string; year: number; rating: string; seasons: number; genre: string; episodes: MediaItem[] }[] = [
  {
    title: 'Breaking Bad', year: 2008, rating: '9.5', seasons: 5, genre: 'Drama',
    episodes: [
      { id: 101, title: 'Pilot', year: 2008, genre: 'Drama', rating: '9.0', duration: '58m', type: 'episode', season: 'S01E01' },
      { id: 102, title: "Cat's in the Bag", year: 2008, genre: 'Drama', rating: '8.9', duration: '47m', type: 'episode', season: 'S01E02' },
    ],
  },
  {
    title: 'Severance', year: 2022, rating: '8.7', seasons: 2, genre: 'Sci-Fi',
    episodes: [
      { id: 201, title: 'Good News About Hell', year: 2022, genre: 'Sci-Fi', rating: '8.0', duration: '54m', type: 'episode', season: 'S01E01', progress: 67 },
      { id: 202, title: 'Half Loop', year: 2022, genre: 'Sci-Fi', rating: '8.2', duration: '51m', type: 'episode', season: 'S01E02' },
    ],
  },
  {
    title: 'The Bear', year: 2022, rating: '8.6', seasons: 3, genre: 'Drama',
    episodes: [
      { id: 301, title: 'System', year: 2022, genre: 'Drama', rating: '9.0', duration: '40m', type: 'episode', season: 'S01E01' },
    ],
  },
];

const MUSIC: { artist: string; album: string; year: number; tracks: MediaItem[] }[] = [
  {
    artist: 'Radiohead', album: 'OK Computer', year: 1997,
    tracks: [
      { id: 1001, title: 'Airbag', year: 1997, genre: 'Alt Rock', rating: '9.1', duration: '4:44', type: 'music', artist: 'Radiohead' },
      { id: 1002, title: 'Paranoid Android', year: 1997, genre: 'Alt Rock', rating: '9.5', duration: '6:23', type: 'music', artist: 'Radiohead' },
      { id: 1003, title: 'Karma Police', year: 1997, genre: 'Alt Rock', rating: '9.3', duration: '4:21', type: 'music', artist: 'Radiohead' },
    ],
  },
  {
    artist: 'Daft Punk', album: 'Random Access Memories', year: 2013,
    tracks: [
      { id: 2001, title: 'Get Lucky', year: 2013, genre: 'Electronic', rating: '8.8', duration: '6:07', type: 'music', artist: 'Daft Punk' },
      { id: 2002, title: 'Instant Crush', year: 2013, genre: 'Electronic', rating: '8.5', duration: '5:37', type: 'music', artist: 'Daft Punk' },
    ],
  },
];

function MediaCard({ item, onClick }: { item: MediaItem; onClick: () => void }) {
  const colors = ['#1a3a5c','#2a1a3c','#1a2a1a','#3c1a1a','#1a2a3c','#2a2a1a'];
  const bg = colors[item.id % colors.length];
  return (
    <div className="jf-card" onClick={onClick}>
      <div className="jf-card-thumb" style={{ background: `linear-gradient(135deg, ${bg}, #0a0a0a)` }}>
        <span className="jf-card-play">▶</span>
        {item.progress !== undefined && (
          <div className="jf-card-progress"><div className="jf-card-progress-fill" style={{ width: `${item.progress}%` }} /></div>
        )}
      </div>
      <div className="jf-card-info">
        <div className="jf-card-title">{item.title}</div>
        <div className="jf-card-meta">{item.year} · {item.rating}★ · {item.duration}</div>
      </div>
    </div>
  );
}

function PlayerView({ item, onBack }: { item: MediaItem; onBack: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(item.progress ?? 0);

  return (
    <div className="jf-player">
      <div className="jf-player-bg" />
      <button className="jf-player-back" onClick={onBack}>← Back</button>
      <div className="jf-player-screen">
        <div className="jf-player-poster">
          <span style={{ fontSize: 64 }}>{item.type === 'music' ? '🎵' : '🎬'}</span>
        </div>
      </div>
      <div className="jf-player-meta">
        <div className="jf-player-title">{item.title}</div>
        <div className="jf-player-sub">
          {item.season ?? item.artist ?? ''}{item.season || item.artist ? ' · ' : ''}{item.year} · {item.genre}
        </div>
      </div>
      <div className="jf-player-progress-bar">
        <span className="jf-player-time">{Math.floor(progress * 0.6)}:{String(Math.floor((progress * 0.6 % 1) * 60)).padStart(2,'0')}</span>
        <div className="jf-player-track" onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          setProgress(Math.round(((e.clientX - rect.left) / rect.width) * 100));
        }}>
          <div className="jf-player-fill" style={{ width: `${progress}%` }} />
          <div className="jf-player-thumb" style={{ left: `${progress}%` }} />
        </div>
        <span className="jf-player-time">{item.duration}</span>
      </div>
      <div className="jf-player-controls">
        <button className="jf-ctrl-btn">⏮</button>
        <button className="jf-ctrl-btn">⏪</button>
        <button className="jf-ctrl-btn play" onClick={() => setPlaying(p => !p)}>{playing ? '⏸' : '▶'}</button>
        <button className="jf-ctrl-btn">⏩</button>
        <button className="jf-ctrl-btn">⏭</button>
      </div>
      <div className="jf-player-aux">
        <button className="jf-aux-btn">🔀 Shuffle</button>
        <button className="jf-aux-btn">🔁 Repeat</button>
        <button className="jf-aux-btn">🔊 Volume</button>
        <button className="jf-aux-btn">⛶ Fullscreen</button>
      </div>
    </div>
  );
}

export default function Jellyfin() {
  const [view, setView] = useState<View>('home');
  const [playing, setPlaying] = useState<MediaItem | null>(null);
  const [expandedShow, setExpandedShow] = useState<string | null>(null);

  if (playing) return <PlayerView item={playing} onBack={() => setPlaying(null)} />;

  const continueWatching = [...MOVIES, ...TV_SHOWS.flatMap(s => s.episodes)].filter(m => m.progress);

  return (
    <div className="jellyfin">
      <div className="jf-sidebar">
        <div className="jf-logo">🪼 Jellyfin</div>
        {[
          { id: 'home', icon: '🏠', label: 'Home' },
          { id: 'movies', icon: '🎬', label: 'Movies' },
          { id: 'tvshows', icon: '📺', label: 'TV Shows' },
          { id: 'music', icon: '🎵', label: 'Music' },
        ].map(item => (
          <button key={item.id} className={`jf-nav-btn ${view === item.id ? 'active' : ''}`} onClick={() => setView(item.id as View)}>
            <span>{item.icon}</span><span>{item.label}</span>
          </button>
        ))}
        <div className="jf-sidebar-sep" />
        <button className="jf-nav-btn"><span>⚙️</span><span>Settings</span></button>
        <button className="jf-nav-btn"><span>👤</span><span>User</span></button>
      </div>

      <div className="jf-content">
        {view === 'home' && (
          <>
            {continueWatching.length > 0 && (
              <section>
                <h2 className="jf-section-title">Continue Watching</h2>
                <div className="jf-row">
                  {continueWatching.map(m => <MediaCard key={m.id} item={m} onClick={() => setPlaying(m)} />)}
                </div>
              </section>
            )}
            <section>
              <h2 className="jf-section-title">Recent Movies</h2>
              <div className="jf-row">
                {MOVIES.slice(0, 6).map(m => <MediaCard key={m.id} item={m} onClick={() => setPlaying(m)} />)}
              </div>
            </section>
            <section>
              <h2 className="jf-section-title">TV Shows</h2>
              <div className="jf-row">
                {TV_SHOWS.map(s => (
                  <div key={s.title} className="jf-card" onClick={() => { setView('tvshows'); setExpandedShow(s.title); }}>
                    <div className="jf-card-thumb" style={{ background: 'linear-gradient(135deg, #1a2a3c, #0a0a0a)' }}>
                      <span className="jf-card-play">▶</span>
                    </div>
                    <div className="jf-card-info">
                      <div className="jf-card-title">{s.title}</div>
                      <div className="jf-card-meta">{s.seasons} seasons · {s.rating}★</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {view === 'movies' && (
          <>
            <h2 className="jf-section-title">Movies ({MOVIES.length})</h2>
            <div className="jf-grid">
              {MOVIES.map(m => <MediaCard key={m.id} item={m} onClick={() => setPlaying(m)} />)}
            </div>
          </>
        )}

        {view === 'tvshows' && (
          <>
            <h2 className="jf-section-title">TV Shows</h2>
            {TV_SHOWS.map(show => (
              <div key={show.title} className="jf-show-block">
                <div className="jf-show-header" onClick={() => setExpandedShow(expandedShow === show.title ? null : show.title)}>
                  <div>
                    <span className="jf-show-title">{show.title}</span>
                    <span className="jf-show-meta"> · {show.year} · {show.seasons} seasons · {show.rating}★</span>
                  </div>
                  <span>{expandedShow === show.title ? '▲' : '▼'}</span>
                </div>
                {expandedShow === show.title && (
                  <div className="jf-episode-list">
                    {show.episodes.map(ep => (
                      <div key={ep.id} className="jf-episode" onClick={() => setPlaying(ep)}>
                        <span className="jf-ep-num">{ep.season}</span>
                        <span className="jf-ep-title">{ep.title}</span>
                        <span className="jf-ep-dur">{ep.duration}</span>
                        {ep.progress && <div className="jf-ep-progress"><div style={{ width: `${ep.progress}%` }} /></div>}
                        <button className="jf-ep-play">▶</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {view === 'music' && (
          <>
            <h2 className="jf-section-title">Music</h2>
            {MUSIC.map(album => (
              <div key={album.album} className="jf-show-block">
                <div className="jf-show-header">
                  <div>
                    <span className="jf-show-title">{album.album}</span>
                    <span className="jf-show-meta"> · {album.artist} · {album.year}</span>
                  </div>
                </div>
                <div className="jf-episode-list">
                  {album.tracks.map((track, i) => (
                    <div key={track.id} className="jf-episode" onClick={() => setPlaying(track)}>
                      <span className="jf-ep-num">{i + 1}</span>
                      <span className="jf-ep-title">{track.title}</span>
                      <span className="jf-ep-dur">{track.duration}</span>
                      <button className="jf-ep-play">▶</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
