import { useRef, useEffect, useState } from 'react';
import './SolidWorks.css';

export default function SolidWorks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 30, y: 45 });
  const [dragging, setDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('Features');
  const [zoom, setZoom] = useState(1);

  const features = [
    { name: 'Boss-Extrude1', icon: '⬛', depth: 0 },
    { name: 'Fillet1', icon: '◲', depth: 1 },
    { name: 'Cut-Extrude1', icon: '⬛', depth: 1 },
    { name: 'Mirror1', icon: '⬛', depth: 1 },
    { name: 'Shell1', icon: '⬛', depth: 2 },
  ];

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#e8f0f8');
    bg.addColorStop(1, '#c8d8e8');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Simple 3D box projection
    const cx = w / 2, cy = h / 2;
    const rx = (rotation.x * Math.PI) / 180;
    const ry = (rotation.y * Math.PI) / 180;
    const size = 100 * zoom;

    const project = (x: number, y: number, z: number) => {
      const rx2 = x, ry2 = y * Math.cos(rx) - z * Math.sin(rx), rz2 = y * Math.sin(rx) + z * Math.cos(rx);
      const rx3 = rx2 * Math.cos(ry) + rz2 * Math.sin(ry), ry3 = ry2, rz3 = -rx2 * Math.sin(ry) + rz2 * Math.cos(ry);
      const fov = 400;
      return { x: cx + (rx3 * fov) / (fov + rz3), y: cy + (ry3 * fov) / (fov + rz3) };
    };

    const s = size;
    const verts = [
      project(-s, -s, -s), project(s, -s, -s), project(s, s, -s), project(-s, s, -s),
      project(-s, -s, s), project(s, -s, s), project(s, s, s), project(-s, s, s),
    ];

    const faces = [
      { verts: [4, 5, 6, 7], color: '#5b9bd5' },
      { verts: [0, 1, 2, 3], color: '#2e75b6' },
      { verts: [0, 1, 5, 4], color: '#4472c4' },
      { verts: [2, 3, 7, 6], color: '#4472c4' },
      { verts: [1, 2, 6, 5], color: '#3868b0' },
      { verts: [0, 3, 7, 4], color: '#3868b0' },
    ];

    faces.forEach(face => {
      ctx.beginPath();
      ctx.moveTo(verts[face.verts[0]].x, verts[face.verts[0]].y);
      face.verts.slice(1).forEach(v => ctx.lineTo(verts[v].x, verts[v].y));
      ctx.closePath();
      ctx.fillStyle = face.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Axes
    ctx.lineWidth = 2;
    const o = project(0, 0, 0);
    [
      { to: project(s * 1.5, 0, 0), color: '#ff0000', label: 'X' },
      { to: project(0, s * 1.5, 0), color: '#00aa00', label: 'Y' },
      { to: project(0, 0, s * 1.5), color: '#0000ff', label: 'Z' },
    ].forEach(axis => {
      ctx.strokeStyle = axis.color;
      ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(axis.to.x, axis.to.y); ctx.stroke();
      ctx.fillStyle = axis.color;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(axis.label, axis.to.x + 4, axis.to.y + 4);
    });
  }, [rotation, zoom]);

  const onMouseDown = (e: React.MouseEvent) => { setDragging(true); setLastMouse({ x: e.clientX, y: e.clientY }); };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastMouse.x, dy = e.clientY - lastMouse.y;
    setRotation(r => ({ x: r.x + dy * 0.5, y: r.y + dx * 0.5 }));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="solidworks">
      <div className="sw-menubar">
        {['File','Edit','View','Insert','Tools','Simulation','Window','Help'].map(m => (
          <button key={m} className="sw-menu-item">{m}</button>
        ))}
      </div>

      <div className="sw-toolbar">
        {['New','Open','Save','Print','Undo','Redo','Extrude','Cut','Fillet','Mirror','Shell','Measure'].map(t => (
          <button key={t} className="sw-tb-btn">{t}</button>
        ))}
      </div>

      <div className="sw-body">
        <div className="sw-tree">
          <div className="sw-tree-tabs">
            {['Features','Sketch','Evaluate'].map(t => (
              <button key={t} className={`sw-tree-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
            ))}
          </div>
          <div className="sw-tree-item" style={{ fontWeight: 600 }}>📦 Part1</div>
          {activeTab === 'Features' && features.map(f => (
            <div key={f.name} className="sw-tree-item" style={{ paddingLeft: 16 + f.depth * 14 }}>
              {f.icon} {f.name}
            </div>
          ))}
          {activeTab === 'Sketch' && (
            <>
              {['Sketch1 (Base profile)','Sketch2 (Cut path)','Sketch3 (Fillet guide)'].map(s => (
                <div key={s} className="sw-tree-item" style={{ paddingLeft: 16 }}>✏️ {s}</div>
              ))}
            </>
          )}
          {activeTab === 'Evaluate' && (
            <>
              {['Mass Properties','Interference Detection','Section Properties','Draft Analysis','Thickness Analysis'].map(s => (
                <div key={s} className="sw-tree-item" style={{ paddingLeft: 16 }}>🔍 {s}</div>
              ))}
            </>
          )}
        </div>

        <div className="sw-viewport">
          <canvas ref={canvasRef} width={640} height={480} className="sw-canvas"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
            onWheel={e => setZoom(z => Math.max(0.3, Math.min(3, z - e.deltaY * 0.001)))}
          />
          <div className="sw-view-buttons">
            {['Front','Top','Right','Isometric'].map(v => (
              <button key={v} className="sw-view-btn" onClick={() => {
                if (v === 'Front') setRotation({ x: 0, y: 0 });
                if (v === 'Top') setRotation({ x: 90, y: 0 });
                if (v === 'Right') setRotation({ x: 0, y: 90 });
                if (v === 'Isometric') setRotation({ x: 30, y: 45 });
              }}>{v}</button>
            ))}
          </div>
        </div>

        <div className="sw-properties">
          <div className="sw-prop-header">Properties</div>
          <div className="sw-prop-row"><span>Material:</span><span>Steel 1020</span></div>
          <div className="sw-prop-row"><span>Mass:</span><span>2.45 kg</span></div>
          <div className="sw-prop-row"><span>Volume:</span><span>312.4 cm³</span></div>
          <div className="sw-prop-row"><span>Surface:</span><span>428.8 cm²</span></div>
          <div className="sw-prop-row"><span>Features:</span><span>{features.length}</span></div>
        </div>
      </div>

      <div className="sw-statusbar">
        <span>Part1.SLDPRT</span>
        <span>Drag to rotate · Scroll to zoom</span>
        <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}
