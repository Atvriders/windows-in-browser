import { useState } from 'react';
import './Spotify.css';

const PLAYLISTS = [
  { id: 'liked', name: 'Liked Songs', icon: '💚', count: 847 },
  { id: 'chill', name: 'Chill Vibes', icon: '😌', count: 42 },
  { id: 'workout', name: 'Workout Pump', icon: '💪', count: 38 },
  { id: 'focus', name: 'Deep Focus', icon: '🎯', count: 61 },
  { id: 'party', name: 'Party Hits', icon: '🎉', count: 55 },
  { id: 'sleep', name: 'Sleep Sounds', icon: '😴', count: 29 },
];

const SONGS: Record<string, { title: string; artist: string; album: string; duration: string }[]> = {
  liked: [
    { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:22' },
    { title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", duration: '2:37' },
    { title: 'Flowers', artist: 'Miley Cyrus', album: 'Endless Summer Vacation', duration: '3:21' },
    { title: 'Unholy', artist: 'Sam Smith ft. Kim Petras', album: 'Gloria', duration: '2:37' },
    { title: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights', duration: '3:20' },
    { title: 'Bad Habit', artist: 'Steve Lacy', album: 'Gemini Rights', duration: '3:52' },
    { title: 'Shivers', artist: 'Ed Sheeran', album: '=', duration: '3:27' },
    { title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', album: 'F*CK LOVE 3', duration: '2:21' },
    { title: 'Easy On Me', artist: 'Adele', album: '30', duration: '3:44' },
    { title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: '3:23' },
    { title: 'Peaches', artist: 'Justin Bieber ft. Daniel Caesar', album: 'Justice', duration: '3:18' },
    { title: 'Montero', artist: 'Lil Nas X', album: 'Montero', duration: '2:18' },
  ],
  focus: [
    { title: 'Divenire', artist: 'Ludovico Einaudi', album: 'Divenire', duration: '6:45' },
    { title: 'Experience', artist: 'Ludovico Einaudi', album: 'In a Time Lapse', duration: '5:14' },
    { title: 'Comptine d\'un autre été', artist: 'Yann Tiersen', album: 'Amélie OST', duration: '2:23' },
    { title: 'Intro', artist: 'The xx', album: 'xx', duration: '2:07' },
    { title: 'Motion Picture Soundtrack', artist: 'Radiohead', album: 'Kid A', duration: '7:01' },
    { title: 'Gymnopédie No.1', artist: 'Erik Satie', album: 'Gymnopédies', duration: '3:07' },
  ],
};

const RECOMMENDED = [
  { title: 'Cruel Summer', artist: 'Taylor Swift', img: '🌅' },
  { title: 'Espresso', artist: 'Sabrina Carpenter', img: '☕' },
  { title: 'Feather', artist: 'Sabrina Carpenter', img: '🪶' },
  { title: 'Paint The Town Red', artist: 'Doja Cat', img: '🎨' },
  { title: 'Ella Baila Sola', artist: 'Eslabon Armado', img: '💃' },
  { title: 'Calm Down', artist: 'Rema & Selena Gomez', img: '🌊' },
];

export default function Spotify() {
  const [view, setView] = useState<'home' | 'search' | 'library'>('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(35);
  const [volume, setVolume] = useState(80);
  const [search, setSearch] = useState('');
  const [liked, setLiked] = useState<Set<string>>(new Set(['Blinding Lights', 'Anti-Hero']));

  const currentSong = playing
    ? (Object.values(SONGS).flat().find(s => s.title === playing) ?? { title: playing, artist: 'Unknown', album: '', duration: '3:00' })
    : null;

  const toggleLike = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(l => { const n = new Set(l); n.has(title) ? n.delete(title) : n.add(title); return n; });
  };

  const songs = selectedPlaylist ? (SONGS[selectedPlaylist] ?? SONGS.liked) : [];

  return (
    <div className="spotify-root">
      {/* Sidebar */}
      <div className="spotify-sidebar">
        <div className="spotify-logo">🎵 Spotify</div>
        <nav className="spotify-nav">
          <button className={`spotify-nav-btn ${view === 'home' ? 'active' : ''}`} onClick={() => { setView('home'); setSelectedPlaylist(null); }}>🏠 Home</button>
          <button className={`spotify-nav-btn ${view === 'search' ? 'active' : ''}`} onClick={() => setView('search')}>🔍 Search</button>
          <button className={`spotify-nav-btn ${view === 'library' ? 'active' : ''}`} onClick={() => setView('library')}>📚 Your Library</button>
        </nav>
        <div className="spotify-sidebar-section">YOUR PLAYLISTS</div>
        {PLAYLISTS.map(p => (
          <button key={p.id} className={`spotify-playlist-item ${selectedPlaylist === p.id ? 'active' : ''}`}
            onClick={() => { setSelectedPlaylist(p.id); setView('library'); }}>
            <span>{p.icon}</span>
            <div>
              <div className="spotify-pl-name">{p.name}</div>
              <div className="spotify-pl-count">{p.count} songs</div>
            </div>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="spotify-main">
        {view === 'home' && !selectedPlaylist && (
          <div className="spotify-home">
            <h2>Good evening</h2>
            <div className="spotify-quick-grid">
              {PLAYLISTS.map(p => (
                <button key={p.id} className="spotify-quick-card" onClick={() => { setSelectedPlaylist(p.id); setView('library'); }}>
                  <span className="spotify-quick-icon">{p.icon}</span>
                  <span className="spotify-quick-name">{p.name}</span>
                </button>
              ))}
            </div>
            <h3>Recommended for you</h3>
            <div className="spotify-rec-grid">
              {RECOMMENDED.map(r => (
                <div key={r.title} className="spotify-rec-card" onClick={() => setPlaying(r.title)}>
                  <div className="spotify-rec-img">{r.img}</div>
                  <div className="spotify-rec-title">{r.title}</div>
                  <div className="spotify-rec-artist">{r.artist}</div>
                  <button className="spotify-play-btn">▶</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'search' && (
          <div className="spotify-search-view">
            <input className="spotify-search-input" placeholder="What do you want to listen to?" autoFocus value={search} onChange={e => setSearch(e.target.value)} />
            <div className="spotify-search-results">
              {search && Object.values(SONGS).flat().filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.artist.toLowerCase().includes(search.toLowerCase())).map(s => (
                <div key={s.title} className={`spotify-song-row ${playing === s.title ? 'playing' : ''}`} onClick={() => { setPlaying(s.title); setPaused(false); }}>
                  <span className="spotify-song-num">{playing === s.title && !paused ? '▶' : '♪'}</span>
                  <div className="spotify-song-info"><div className="spotify-song-title">{s.title}</div><div className="spotify-song-artist">{s.artist}</div></div>
                  <div className="spotify-song-album">{s.album}</div>
                  <button className={`spotify-heart ${liked.has(s.title) ? 'liked' : ''}`} onClick={e => toggleLike(s.title, e)}>♥</button>
                  <div className="spotify-song-dur">{s.duration}</div>
                </div>
              ))}
              {search && Object.values(SONGS).flat().filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.artist.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                <div style={{ color: 'rgba(255,255,255,0.4)', padding: 24 }}>No results for "{search}"</div>
              )}
            </div>
          </div>
        )}

        {(view === 'library' || selectedPlaylist) && songs.length > 0 && (
          <div className="spotify-library">
            <div className="spotify-library-header">
              <div className="spotify-library-icon">{PLAYLISTS.find(p => p.id === selectedPlaylist)?.icon ?? '🎵'}</div>
              <div>
                <div className="spotify-library-title">{PLAYLISTS.find(p => p.id === selectedPlaylist)?.name ?? 'Library'}</div>
                <div className="spotify-library-meta">{songs.length} songs</div>
              </div>
              <button className="spotify-big-play" onClick={() => { setPlaying(songs[0].title); setPaused(false); }}>▶ Play</button>
            </div>
            <div className="spotify-songs-header"><span>#</span><span>Title</span><span>Album</span><span>♥</span><span>⏱</span></div>
            {songs.map((s, i) => (
              <div key={s.title} className={`spotify-song-row ${playing === s.title ? 'playing' : ''}`} onClick={() => { setPlaying(s.title); setPaused(false); }}>
                <span className="spotify-song-num">{playing === s.title && !paused ? '▶' : i + 1}</span>
                <div className="spotify-song-info"><div className="spotify-song-title">{s.title}</div><div className="spotify-song-artist">{s.artist}</div></div>
                <div className="spotify-song-album">{s.album}</div>
                <button className={`spotify-heart ${liked.has(s.title) ? 'liked' : ''}`} onClick={e => toggleLike(s.title, e)}>♥</button>
                <div className="spotify-song-dur">{s.duration}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Now Playing bar */}
      <div className="spotify-nowplaying">
        <div className="spotify-np-song">
          {currentSong ? (
            <>
              <div className="spotify-np-icon">🎵</div>
              <div><div className="spotify-np-title">{currentSong.title}</div><div className="spotify-np-artist">{currentSong.artist}</div></div>
              <button className={`spotify-heart ${liked.has(currentSong.title) ? 'liked' : ''}`} onClick={e => { if (currentSong) toggleLike(currentSong.title, e); }}>♥</button>
            </>
          ) : <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Not playing</div>}
        </div>
        <div className="spotify-np-controls">
          <button className="spotify-ctrl">⏮</button>
          <button className="spotify-ctrl play" onClick={() => { if (playing) setPaused(p => !p); }}>
            {playing && !paused ? '⏸' : '▶'}
          </button>
          <button className="spotify-ctrl">⏭</button>
          <div className="spotify-progress-wrap">
            <span className="spotify-time">1:{String(Math.floor(progress / 100 * 60)).padStart(2,'0')}</span>
            <input type="range" min={0} max={100} value={progress} onChange={e => setProgress(+e.target.value)} className="spotify-progress" />
            <span className="spotify-time">{currentSong?.duration ?? '0:00'}</span>
          </div>
        </div>
        <div className="spotify-np-right">
          <span>🔊</span>
          <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(+e.target.value)} className="spotify-volume" />
        </div>
      </div>
    </div>
  );
}
