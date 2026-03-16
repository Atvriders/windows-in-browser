import { useState } from 'react';
import './AfterEffects.css';

const LAYERS = [
  { id: 1, name: 'Title Text', type: 'text', color: '#ff6b6b', inPoint: 0, outPoint: 5 },
  { id: 2, name: 'Logo.png', type: 'image', color: '#4ecdc4', inPoint: 1, outPoint: 8 },
  { id: 3, name: 'Background', type: 'solid', color: '#45b7d1', inPoint: 0, outPoint: 10 },
  { id: 4, name: 'Music.mp3', type: 'audio', color: '#96e6a1', inPoint: 0, outPoint: 10 },
];

export default function AfterEffects() {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selected, setSelected] = useState<number | null>(1);
  const totalDuration = 10;

  return (
    <div className="ae">
      <div className="ae-menubar">
        {['File','Edit','Composition','Layer','Effect','Animation','View','Window','Help'].map(m => (
          <button key={m} className="ae-menu-item">{m}</button>
        ))}
      </div>

      <div className="ae-body">
        <div className="ae-project">
          <div className="ae-panel-header">Project</div>
          <div className="ae-comp-item">📦 Comp 1</div>
          <div className="ae-comp-item">🖼 Logo.png</div>
          <div className="ae-comp-item">🎵 Music.mp3</div>
          <div className="ae-panel-header" style={{ marginTop: 4 }}>Effects & Presets</div>
          {['Motion Blur','Glow','Color Correction','Transform','Blur & Sharpen'].map(e => (
            <div key={e} className="ae-effect-item">▶ {e}</div>
          ))}
        </div>

        <div className="ae-preview">
          <div className="ae-comp-view">
            <div className="ae-comp-screen">Comp 1 — {currentTime.toFixed(1)}s</div>
          </div>
          <div className="ae-transport">
            <button className="ae-tbtn" onClick={() => setCurrentTime(0)}>⏮</button>
            <button className={`ae-tbtn ${playing ? 'active' : ''}`} onClick={() => setPlaying(p => !p)}>{playing ? '⏸' : '▶'}</button>
            <button className="ae-tbtn" onClick={() => setCurrentTime(t => Math.min(totalDuration, t + 0.1))}>⏩</button>
            <span className="ae-timecode">{currentTime.toFixed(2)}s / {totalDuration}s</span>
          </div>
        </div>

        <div className="ae-info">
          <div className="ae-panel-header">Properties</div>
          {selected && (() => {
            const l = LAYERS.find(x => x.id === selected);
            if (!l) return null;
            return (
              <div className="ae-props">
                <div className="ae-prop"><span>Name:</span><span>{l.name}</span></div>
                <div className="ae-prop"><span>Type:</span><span>{l.type}</span></div>
                <div className="ae-prop"><span>In:</span><span>{l.inPoint}s</span></div>
                <div className="ae-prop"><span>Out:</span><span>{l.outPoint}s</span></div>
                <div className="ae-prop"><span>Opacity:</span><span>100%</span></div>
                <div className="ae-prop"><span>Scale:</span><span>100%</span></div>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="ae-timeline">
        <div className="ae-tl-header">
          <span>Comp 1 ▾</span>
          <div className="ae-tl-ruler">
            {Array.from({ length: totalDuration + 1 }, (_, i) => (
              <span key={i} className="ae-tl-mark">{i}s</span>
            ))}
          </div>
        </div>
        <div className="ae-tl-layers">
          {LAYERS.map(layer => (
            <div key={layer.id} className={`ae-tl-layer ${selected === layer.id ? 'selected' : ''}`} onClick={() => setSelected(layer.id)}>
              <div className="ae-tl-layer-label">
                <span className="ae-tl-layer-name">{layer.name}</span>
              </div>
              <div className="ae-tl-layer-track">
                <div className="ae-tl-clip" style={{
                  left: `${(layer.inPoint / totalDuration) * 100}%`,
                  width: `${((layer.outPoint - layer.inPoint) / totalDuration) * 100}%`,
                  background: layer.color,
                }}>
                  <span className="ae-tl-clip-name">{layer.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="ae-tl-playhead" style={{ left: `calc(200px + ${(currentTime / totalDuration) * (100)}%)` }} />
      </div>
    </div>
  );
}
