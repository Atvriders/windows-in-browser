import { useState, useEffect } from 'react';
import './PowerPoint.css';

interface Slide { id: number; title: string; body: string; bg: string; }

const defaultSlides: Slide[] = [
  { id: 1, title: 'Click to add title', body: 'Click to add subtitle', bg: '#fff' },
  { id: 2, title: 'Slide 2', body: 'Add your content here', bg: '#fff' },
  { id: 3, title: 'Slide 3', body: 'Add your content here', bg: '#fff' },
];

const themes = ['#ffffff','#1e3a5f','#2d6a4f','#6b2d4e','#3d3d3d'];

export default function PowerPoint() {
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [current, setCurrent] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingBody, setEditingBody] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [presentIdx, setPresentIdx] = useState(0);

  useEffect(() => {
    if (!presenting) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setPresentIdx(i => Math.min(slides.length - 1, i + 1));
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setPresentIdx(i => Math.max(0, i - 1));
      else if (e.key === 'Escape') setPresenting(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [presenting, slides.length]);

  const slide = slides[current];

  const updateSlide = (patch: Partial<Slide>) =>
    setSlides(s => s.map((sl, i) => i === current ? { ...sl, ...patch } : sl));

  const addSlide = () => {
    const newSlide = { id: Date.now(), title: 'New Slide', body: 'Add content here', bg: '#fff' };
    setSlides(s => [...s, newSlide]);
    setCurrent(slides.length);
  };

  const deleteSlide = () => {
    if (slides.length <= 1) return;
    setSlides(s => s.filter((_, i) => i !== current));
    setCurrent(Math.max(0, current - 1));
  };

  return (
    <div className="ppt">
      <div className="ppt-ribbon">
        <button className="ppt-btn" onClick={addSlide}>＋ New Slide</button>
        <button className="ppt-btn" onClick={deleteSlide}>🗑 Delete</button>
        <div className="ppt-ribbon-sep" />
        <span className="ppt-label">Theme:</span>
        {themes.map(bg => (
          <button key={bg} className="ppt-color-btn" style={{ background: bg, border: slide.bg === bg ? '2px solid #c9511f' : '2px solid #555' }} onClick={() => updateSlide({ bg })} />
        ))}
        <div className="ppt-ribbon-sep" />
        <button className="ppt-btn" onClick={() => { setPresentIdx(current); setPresenting(true); }}>▶ Present</button>
      </div>

      <div className="ppt-body">
        <div className="ppt-panel">
          {slides.map((sl, i) => (
            <div key={sl.id} className={`ppt-thumb ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)}>
              <div className="ppt-thumb-inner" style={{ background: sl.bg }}>
                <div className="ppt-thumb-title">{sl.title}</div>
                <div className="ppt-thumb-body">{sl.body}</div>
              </div>
              <span className="ppt-thumb-num">{i + 1}</span>
            </div>
          ))}
        </div>

        <div className="ppt-stage">
          <div className="ppt-slide" style={{ background: slide.bg }}>
            {editingTitle
              ? <input className="ppt-title-input" autoFocus value={slide.title} onChange={e => updateSlide({ title: e.target.value })} onBlur={() => setEditingTitle(false)} />
              : <div className="ppt-title" onClick={() => setEditingTitle(true)} style={{ color: slide.bg === '#fff' ? '#222' : '#fff' }}>{slide.title}</div>
            }
            {editingBody
              ? <textarea className="ppt-body-input" autoFocus value={slide.body} onChange={e => updateSlide({ body: e.target.value })} onBlur={() => setEditingBody(false)} />
              : <div className="ppt-body-text" onClick={() => setEditingBody(true)} style={{ color: slide.bg === '#fff' ? '#555' : 'rgba(255,255,255,0.8)' }}>{slide.body}</div>
            }
          </div>
          <div className="ppt-stage-info">Slide {current + 1} of {slides.length}</div>
        </div>
      </div>
      {presenting && (
        <div className="ppt-present-overlay">
          <div className="ppt-present-slide" style={{ background: slides[presentIdx]?.bg }}>
            <div className="ppt-present-title" style={{ color: slides[presentIdx]?.bg === '#fff' ? '#222' : '#fff' }}>
              {slides[presentIdx]?.title}
            </div>
            <div className="ppt-present-body" style={{ color: slides[presentIdx]?.bg === '#fff' ? '#555' : 'rgba(255,255,255,0.85)' }}>
              {slides[presentIdx]?.body}
            </div>
          </div>
          <div className="ppt-present-bar">
            <button className="ppt-present-btn" onClick={() => setPresentIdx(i => Math.max(0, i - 1))}>◀</button>
            <span className="ppt-present-counter">{presentIdx + 1} / {slides.length}</span>
            <button className="ppt-present-btn" onClick={() => setPresentIdx(i => Math.min(slides.length - 1, i + 1))}>▶</button>
            <button className="ppt-present-btn ppt-present-exit" onClick={() => setPresenting(false)}>✕ Exit</button>
          </div>
        </div>
      )}
    </div>
  );
}
