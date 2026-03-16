import { useState } from 'react';
import './SnippingTool.css';

export default function SnippingTool() {
  const [mode, setMode] = useState<'rect' | 'window' | 'free' | 'fullscreen'>('rect');
  const [snipped, setSnipped] = useState(false);
  const [delay, setDelay] = useState(0);
  const [, setShowPen] = useState(false);

  const snip = () => {
    setSnipped(false);
    setTimeout(() => setSnipped(true), delay * 1000 + 300);
  };

  return (
    <div className="snip-root">
      <div className="snip-toolbar">
        <button className="snip-action" onClick={snip}>
          ✂️ New
        </button>
        <div className="snip-delay-wrap">
          <span>Delay</span>
          <select className="snip-delay-select" value={delay} onChange={e => setDelay(+e.target.value)}>
            <option value={0}>No delay</option>
            <option value={1}>1 second</option>
            <option value={3}>3 seconds</option>
            <option value={5}>5 seconds</option>
          </select>
        </div>
        <div className="snip-modes">
          {([['rect','⬜ Rectangular Snip'],['window','🔲 Window Snip'],['free','✏️ Free-form Snip'],['fullscreen','🖥️ Full-screen Snip']] as const).map(([m, label]) => (
            <button key={m} className={`snip-mode-btn ${mode === m ? 'active' : ''}`} onClick={() => setMode(m)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="snip-content">
        {!snipped ? (
          <div className="snip-placeholder">
            <div className="snip-placeholder-icon">✂️</div>
            <div className="snip-placeholder-title">Snipping Tool</div>
            <div className="snip-placeholder-sub">Click <strong>New</strong> to take a screenshot.</div>
            <div className="snip-mode-hint">Mode: <strong>{mode === 'rect' ? 'Rectangular Snip' : mode === 'window' ? 'Window Snip' : mode === 'free' ? 'Free-form Snip' : 'Full-screen Snip'}</strong></div>
            <button className="snip-new-btn" onClick={snip}>✂️ New Snip</button>
          </div>
        ) : (
          <div className="snip-result">
            <div className="snip-result-toolbar">
              <button className="snip-result-btn" title="Pen" onClick={() => setShowPen(p => !p)}>🖊️ Pen</button>
              <button className="snip-result-btn" title="Highlighter">🖍️ Highlighter</button>
              <button className="snip-result-btn" title="Eraser">⬜ Eraser</button>
              <div className="snip-result-divider" />
              <button className="snip-result-btn" title="Save" onClick={() => {}}>💾 Save</button>
              <button className="snip-result-btn" title="Copy">📋 Copy</button>
            </div>
            <div className="snip-preview">
              <div className="snip-preview-inner">
                <div className="snip-preview-title">Screenshot captured</div>
                <div className="snip-preview-desc">Your snip has been captured.<br />Use the toolbar to annotate or save.</div>
                <div className="snip-preview-time">{new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
