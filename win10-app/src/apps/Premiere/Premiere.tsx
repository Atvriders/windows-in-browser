import { useState, useEffect } from 'react';
import './Premiere.css';

const CLIPS = [
  { id: 1, name: 'clip_001.mp4', duration: 120, color: '#1e90ff' },
  { id: 2, name: 'clip_002.mp4', duration: 80, color: '#ff6b6b' },
  { id: 3, name: 'interview.mp4', duration: 200, color: '#4ecdc4' },
  { id: 4, name: 'broll_park.mp4', duration: 60, color: '#45b7d1' },
  { id: 5, name: 'music_bg.mp3', duration: 180, color: '#96e6a1' },
  { id: 6, name: 'voiceover.wav', duration: 150, color: '#ffd93d' },
];

const TRACKS = ['V2', 'V1', 'A1', 'A2'];
const TRACK_CLIPS: Record<string, typeof CLIPS[number][]> = {
  V1: [CLIPS[0], CLIPS[1], CLIPS[3]],
  V2: [CLIPS[2]],
  A1: [CLIPS[4]],
  A2: [CLIPS[5]],
};

const TOTAL_DURATION = 260; // seconds (longest sequence end)

export default function Premiere() {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setCurrentTime(t => {
        if (t >= TOTAL_DURATION) { setPlaying(false); return TOTAL_DURATION; }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <div className="premiere">
      <div className="pr-menubar">
        {['File','Edit','Clip','Sequence','Markers','Graphics','View','Window','Help'].map(m => (
          <button key={m} className="pr-menu-item">{m}</button>
        ))}
      </div>

      <div className="pr-body">
        <div className="pr-project">
          <div className="pr-panel-header">Project</div>
          <div className="pr-media-list">
            {CLIPS.map(clip => (
              <div key={clip.id} className={`pr-media-item ${selected === clip.id ? 'selected' : ''}`} onClick={() => setSelected(clip.id)}>
                <div className="pr-media-icon" style={{ background: clip.color }} />
                <div>
                  <div className="pr-media-name">{clip.name}</div>
                  <div className="pr-media-dur">{Math.floor(clip.duration / 60)}:{String(clip.duration % 60).padStart(2, '0')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pr-preview">
          <div className="pr-preview-screen">
            <div className="pr-preview-placeholder">▶ Program Monitor</div>
            <div className="pr-timecode">{String(Math.floor(currentTime / 3600)).padStart(2,'0')}:{String(Math.floor((currentTime%3600)/60)).padStart(2,'0')}:{String(currentTime%60).padStart(2,'0')}:00</div>
          </div>
          <div className="pr-transport">
            <button className="pr-transport-btn" onClick={() => setCurrentTime(0)}>⏮</button>
            <button className="pr-transport-btn" onClick={() => setCurrentTime(t => Math.max(0, t-1))}>⏪</button>
            <button className={`pr-transport-btn play ${playing ? 'active' : ''}`} onClick={() => setPlaying(p => !p)}>{playing ? '⏸' : '▶'}</button>
            <button className="pr-transport-btn" onClick={() => setCurrentTime(t => t+1)}>⏩</button>
            <button className="pr-transport-btn">⏭</button>
          </div>
        </div>

        <div className="pr-effects">
          <div className="pr-panel-header">Effects</div>
          {['Video Transitions','Audio Transitions','Video Effects','Audio Effects','Lumetri Presets'].map(e => (
            <div key={e} className="pr-effect-category">▶ {e}</div>
          ))}
        </div>
      </div>

      <div className="pr-timeline">
        <div className="pr-timeline-header">
          <span className="pr-timeline-title">Timeline: Sequence 01</span>
          <div className="pr-zoom">Zoom: <input type="range" min="1" max="10" defaultValue="5" className="pr-zoom-slider" /></div>
        </div>
        <div className="pr-tracks">
          {TRACKS.map(track => (
            <div key={track} className="pr-track">
              <div className="pr-track-label">{track}</div>
              <div className="pr-track-content">
                {(TRACK_CLIPS[track] || []).map((clip, i) => (
                  <div key={clip.id} className="pr-clip" style={{ width: clip.duration * 0.8, background: clip.color, left: i * 20 }}>
                    <span className="pr-clip-name">{clip.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
