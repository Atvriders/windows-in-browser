import { useState } from 'react';
import './VLC.css';

const PLAYLIST = [
  { title: 'Big Buck Bunny', duration: '9:56', type: 'video' },
  { title: 'Sintel', duration: '14:48', type: 'video' },
  { title: 'Tears of Steel', duration: '12:14', type: 'video' },
  { title: 'Elephants Dream', duration: '10:54', type: 'video' },
  { title: 'sample_audio_1.mp3', duration: '3:24', type: 'audio' },
  { title: 'sample_audio_2.flac', duration: '4:12', type: 'audio' },
];

export default function VLC() {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [, setFullscreen] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);

  const song = PLAYLIST[current];
  const totalSecs = parseInt(song.duration.split(':')[0]) * 60 + parseInt(song.duration.split(':')[1]);
  const currentSecs = Math.round(progress / 100 * totalSecs);
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="vlc-root">
      <div className="vlc-menubar">
        {['Media', 'Playback', 'Audio', 'Video', 'Subtitle', 'Tools', 'View', 'Help'].map(m => (
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
            {PLAYLIST.map((item, i) => (
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
            <button className="vlc-btn" onClick={() => { setCurrent(c => Math.min(PLAYLIST.length-1, c+1)); setProgress(0); }}>⏭</button>
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
