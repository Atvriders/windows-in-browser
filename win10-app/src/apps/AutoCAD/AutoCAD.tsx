import { useRef, useState, useEffect } from 'react';
import './AutoCAD.css';

type DrawTool = 'line' | 'rectangle' | 'circle' | 'polyline' | 'select';
interface DrawShape { id: number; type: string; x: number; y: number; x2: number; y2: number; color: string; points?: { x: number; y: number }[]; }

const GRID_SIZE = 20;

export default function AutoCAD() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<DrawTool>('line');
  const [shapes, setShapes] = useState<DrawShape[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [polylinePoints, setPolylinePoints] = useState<{ x: number; y: number }[]>([]);
  const [command, setCommand] = useState('');
  const [cmdHistory, setCmdHistory] = useState(['AutoCAD 2024 - [Drawing1.dwg]', 'Command: ']);
  const [canvasZoom, setCanvasZoom] = useState(1);

  const snap = (v: number) => Math.round(v / GRID_SIZE) * GRID_SIZE;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Draw shapes
    shapes.forEach(s => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (s.type === 'line') { ctx.moveTo(s.x, s.y); ctx.lineTo(s.x2, s.y2); ctx.stroke(); }
      if (s.type === 'rectangle') { ctx.strokeRect(s.x, s.y, s.x2 - s.x, s.y2 - s.y); }
      if (s.type === 'circle') {
        const r = Math.hypot(s.x2 - s.x, s.y2 - s.y);
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.stroke();
      }
      if (s.type === 'polyline' && s.points && s.points.length >= 2) {
        ctx.moveTo(s.points[0].x, s.points[0].y);
        s.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
    });

    // Draw in-progress polyline
    if (polylinePoints.length > 0) {
      ctx.strokeStyle = '#00bfff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(polylinePoints[0].x, polylinePoints[0].y);
      polylinePoints.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(cursorPos.x, cursorPos.y);
      ctx.stroke();
      ctx.setLineDash([]);
      // Draw point markers
      polylinePoints.forEach(p => {
        ctx.fillStyle = '#00bfff';
        ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
      });
    }
  }, [shapes, polylinePoints, cursorPos]);

  const getPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: snap((e.clientX - rect.left) / canvasZoom), y: snap((e.clientY - rect.top) / canvasZoom) };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.detail === 2) return; // handled by dblclick
    const pos = getPos(e);
    if (tool === 'polyline') {
      setPolylinePoints(pts => [...pts, pos]);
      setCmdHistory(h => [...h, `PLINE point (${pos.x},${pos.y}) — dbl-click to finish`]);
      return;
    }
    setStartPos(pos);
    setDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getPos(e);
    setCursorPos(pos);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (tool === 'polyline') return;
    if (!drawing) return;
    const pos = getPos(e);
    setShapes(s => [...s, { id: Date.now(), type: tool, x: startPos.x, y: startPos.y, x2: pos.x, y2: pos.y, color: '#00bfff' }]);
    setDrawing(false);
    setCmdHistory(h => [...h, `${tool.toUpperCase()} from (${startPos.x},${startPos.y}) to (${pos.x},${pos.y})`]);
  };

  const handleDoubleClick = () => {
    if (tool !== 'polyline' || polylinePoints.length < 2) return;
    const pts = polylinePoints;
    setShapes(s => [...s, { id: Date.now(), type: 'polyline', x: pts[0].x, y: pts[0].y, x2: pts[pts.length - 1].x, y2: pts[pts.length - 1].y, color: '#00bfff', points: pts }]);
    setPolylinePoints([]);
    setCmdHistory(h => [...h, `PLINE complete — ${pts.length} points`]);
  };

  const TOOLS: { id: DrawTool; icon: string; label: string }[] = [
    { id: 'select', icon: '↖', label: 'Select' },
    { id: 'line', icon: '╱', label: 'Line' },
    { id: 'rectangle', icon: '▭', label: 'Rectangle' },
    { id: 'circle', icon: '○', label: 'Circle' },
    { id: 'polyline', icon: '∧', label: 'Polyline' },
  ];

  return (
    <div className="autocad">
      <div className="cad-menubar">
        {['File','Edit','View','Insert','Format','Tools','Draw','Modify','Dimension','Help'].map(m => (
          <button key={m} className="cad-menu-item">{m}</button>
        ))}
      </div>

      <div className="cad-body">
        <div className="cad-toolbar">
          {TOOLS.map(t => (
            <button key={t.id} className={`cad-tool ${tool === t.id ? 'active' : ''}`} title={t.label} onClick={() => setTool(t.id)}>{t.icon}</button>
          ))}
          <div className="cad-tool-sep" />
          <button className="cad-tool" title="Undo" onClick={() => setShapes(s => s.slice(0, -1))}>↩</button>
          <button className="cad-tool" title="Clear" onClick={() => setShapes([])}>🗑</button>
          <div className="cad-tool-sep" />
          <button className="cad-tool" title="Zoom In" onClick={() => setCanvasZoom(z => Math.min(3, parseFloat((z + 0.25).toFixed(2))))}>🔍+</button>
          <button className="cad-tool" title="Zoom Out" onClick={() => setCanvasZoom(z => Math.max(0.25, parseFloat((z - 0.25).toFixed(2))))}>🔍-</button>
          <button className="cad-tool" title="Zoom Extents" onClick={() => setCanvasZoom(1)}>⊞</button>
        </div>

        <div className="cad-viewport">
          <canvas ref={canvasRef} width={780} height={480} className="cad-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            style={{ cursor: tool === 'select' ? 'default' : 'crosshair', transform: `scale(${canvasZoom})`, transformOrigin: 'top left' }}
          />
          <div className="cad-coords">X: {cursorPos.x} Y: {cursorPos.y} | Zoom: {(canvasZoom * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div className="cad-command-line">
        <div className="cad-cmd-history">
          {cmdHistory.slice(-4).map((h, i) => <div key={i} className="cad-cmd-line">{h}</div>)}
        </div>
        <div className="cad-cmd-input-row">
          <span className="cad-cmd-prompt">Command: </span>
          <input className="cad-cmd-input" value={command} onChange={e => setCommand(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setCmdHistory(h => [...h, `Command: ${command}`]); setCommand(''); }}} />
        </div>
      </div>
    </div>
  );
}
