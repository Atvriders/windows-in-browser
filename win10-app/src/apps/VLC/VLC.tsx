import { useState, useEffect, useRef } from 'react';
import './VLC.css';

const DEFAULT_PLAYLIST = [
  { title: 'Big Buck Bunny', duration: '9:56', type: 'video' },
  { title: 'Sintel', duration: '14:48', type: 'video' },
  { title: 'Tears of Steel', duration: '12:14', type: 'video' },
  { title: 'Elephants Dream', duration: '10:54', type: 'video' },
  { title: 'Cosmos Laundromat', duration: '12:10', type: 'video' },
  { title: 'Caminandes: Llamigos', duration: '2:30', type: 'video' },
  { title: 'Glass Half', duration: '3:16', type: 'video' },
  { title: 'Charge', duration: '3:03', type: 'video' },
  { title: 'Interstellar (2014).mkv', duration: '2:49:03', type: 'video' },
  { title: 'Dune Part Two (2024).mkv', duration: '2:46:22', type: 'video' },
  { title: 'Oppenheimer (2023).mkv', duration: '3:00:10', type: 'video' },
  { title: 'The Dark Knight (2008).mkv', duration: '2:32:00', type: 'video' },
  { title: 'Inception (2010).mkv', duration: '2:28:00', type: 'video' },
  { title: 'Parasite (2019).mkv', duration: '2:12:01', type: 'video' },
  { title: 'Everything Everywhere All at Once.mkv', duration: '2:19:38', type: 'video' },
  { title: 'Blade Runner 2049 (2017).mkv', duration: '2:43:42', type: 'video' },
  { title: 'The Bear S03E01 - Tomorrow.mkv', duration: '43:12', type: 'video' },
  { title: 'The Bear S03E02 - Next Level.mkv', duration: '38:44', type: 'video' },
  { title: 'Dark S01E01 - Secrets.mkv', duration: '52:31', type: 'video' },
  { title: 'Fallout S01E01 - The End.mkv', duration: '1:07:20', type: 'video' },
  { title: 'Daft Punk - Get Lucky (Official).mp4', duration: '4:08', type: 'video' },
  { title: 'Radiohead - Karma Police (Official).mp4', duration: '4:24', type: 'video' },
  { title: 'Tame Impala - The Less I Know The Better.mp4', duration: '3:38', type: 'video' },
  { title: 'Tycho - Awake.flac', duration: '5:46', type: 'audio' },
  { title: 'Jon Hopkins - Open Eye Signal.flac', duration: '10:05', type: 'audio' },
  { title: 'Nujabes - Feather ft. Cise Starr.mp3', duration: '5:20', type: 'audio' },
  { title: 'Daft Punk - Giorgio by Moroder.flac', duration: '9:04', type: 'audio' },
  { title: 'Brian Eno - An Ending (Ascent).mp3', duration: '4:18', type: 'audio' },
  { title: 'Boards of Canada - Roygbiv.mp3', duration: '2:32', type: 'audio' },
  { title: 'Nils Frahm - Says.flac', duration: '10:50', type: 'audio' },
  { title: 'Mac Miller - Good News.mp3', duration: '3:37', type: 'audio' },
  { title: 'Kendrick Lamar - Money Trees.mp3', duration: '6:26', type: 'audio' },
  { title: 'J Dilla - Donuts Outro.mp3', duration: '1:12', type: 'audio' },
];

export default function VLC() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [playlist, setPlaylist] = useState(DEFAULT_PLAYLIST);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [, setFullscreen] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);

  const song = playlist[current];

  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const type = ['mp4','mkv','avi','mov','webm'].includes(ext) ? 'video' : 'audio';
    const newItem = { title: file.name, duration: '?:??', type };
    setPlaylist(prev => [...prev, newItem]);
    setCurrent(playlist.length);
    setPlaying(true);
    setProgress(0);
    e.target.value = '';
  };
  const parseDuration = (dur: string) => {
    const parts = dur.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return parts[0] * 60 + parts[1];
  };
  const totalSecs = parseDuration(song.duration);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress(p => {
        if (p + (100 / totalSecs) >= 100) {
          setCurrent(c => (c + 1) % playlist.length);
          return 0;
        }
        return p + (100 / totalSecs);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, totalSecs, playlist.length]);
  const currentSecs = Math.round(progress / 100 * totalSecs);
  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${m}:${String(sec).padStart(2,'0')}`;
  };

  return (
    <div className="vlc-root">
      <div className="vlc-menubar">
        <button className="vlc-menu-item" onClick={() => fileInputRef.current?.click()}>📂 Open File</button>
        <input ref={fileInputRef} type="file" accept="video/*,audio/*" style={{ display: 'none' }} onChange={handleOpenFile} />
        {['Playback', 'Audio', 'Video', 'Subtitle', 'Tools', 'View', 'Help'].map(m => (
          <button key={m} className="vlc-menu-item">{m}</button>
        ))}
      </div>
      <div className="vlc-body">
        <div className="vlc-viewport">
          {song.type === 'video' ? (
            <div className="vlc-video-area">
              {playing ? (
                <div className="vlc-playing-indicator">▶ {song.title}</div>
              ) : (
                <div className="vlc-cone">🎬<div className="vlc-cone-label">VLC media player</div><div className="vlc-cone-sub">{song.title}</div></div>
              )}
            </div>
          ) : (
            <div className="vlc-audio-area">
              <div className="vlc-audio-icon">🎵</div>
              <div className="vlc-audio-title">{song.title}</div>
              {playing && <div className="vlc-audio-bars"><span/><span/><span/><span/><span/></div>}
            </div>
          )}
        </div>
        {showPlaylist && (
          <div className="vlc-playlist">
            <div className="vlc-pl-header">Playlist</div>
            {playlist.map((item, i) => (
              <div key={i} className={`vlc-pl-item ${i === current ? 'active' : ''}`} onDoubleClick={() => { setCurrent(i); setPlaying(true); setProgress(0); }}>
                <span>{item.type === 'video' ? '🎬' : '🎵'}</span>
                <span className="vlc-pl-title">{item.title}</span>
                <span className="vlc-pl-dur">{item.duration}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="vlc-controls">
        <div className="vlc-progress-bar">
          <span className="vlc-time">{fmt(currentSecs)}</span>
          <input type="range" min={0} max={100} value={progress} onChange={e => setProgress(+e.target.value)} className="vlc-slider" />
          <span className="vlc-time">{song.duration}</span>
        </div>
        <div className="vlc-buttons">
          <div className="vlc-btn-group">
            <button className="vlc-btn" onClick={() => { setCurrent(c => Math.max(0, c-1)); setProgress(0); }}>⏮</button>
            <button className="vlc-btn" onClick={() => setProgress(p => Math.max(0, p - 10))}>⏪</button>
            <button className="vlc-btn vlc-play" onClick={() => setPlaying(p => !p)}>{playing ? '⏸' : '▶'}</button>
            <button className="vlc-btn" onClick={() => setProgress(p => Math.min(100, p + 10))}>⏩</button>
            <button className="vlc-btn" onClick={() => { setCurrent(c => Math.min(playlist.length-1, c+1)); setProgress(0); }}>⏭</button>
            <button className="vlc-btn" onClick={() => { setPlaying(false); setProgress(0); }}>⏹</button>
          </div>
          <div className="vlc-btn-group">
            <button className="vlc-btn" onClick={() => setMuted(m => !m)}>{muted ? '🔇' : '🔊'}</button>
            <input type="range" min={0} max={125} value={muted ? 0 : volume} onChange={e => { setVolume(+e.target.value); setMuted(false); }} className="vlc-vol-slider" />
            <span className="vlc-vol-val">{muted ? 0 : volume}%</span>
          </div>
          <div className="vlc-btn-group">
            <button className="vlc-btn" onClick={() => setShowPlaylist(p => !p)} title="Toggle playlist">📋</button>
            <button className="vlc-btn" onClick={() => setFullscreen(p => !p)} title="Fullscreen">⛶</button>
          </div>
        </div>
      </div>
    </div>
  );
}
