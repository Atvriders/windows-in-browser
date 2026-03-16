import { useRef, useState, useEffect } from 'react';
import './AutoCAD.css';

type DrawTool = 'line' | 'rectangle' | 'circle' | 'polyline' | 'select';
interface DrawShape { id: number; type: string; x: number; y: number; x2: number; y2: number; color: string; }

const GRID_SIZE = 20;

export default function AutoCAD() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<DrawTool>('line');
  const [shapes, setShapes] = useState<DrawShape[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [command, setCommand] = useState('');
  const [cmdHistory, setCmdHistory] = useState(['AutoCAD 2024 - [Drawing1.dwg]', 'Command: ']);

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
    });
  }, [shapes]);

  const getPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: snap(e.clientX - rect.left), y: snap(e.clientY - rect.top) };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getPos(e);
    setStartPos(pos);
    setDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getPos(e);
    setCursorPos(pos);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!drawing) return;
    const pos = getPos(e);
    setShapes(s => [...s, { id: Date.now(), type: tool, x: startPos.x, y: startPos.y, x2: pos.x, y2: pos.y, color: '#00bfff' }]);
    setDrawing(false);
    setCmdHistory(h => [...h, `${tool.toUpperCase()} from (${startPos.x},${startPos.y}) to (${pos.x},${pos.y})`]);
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
          <button className="cad-tool" title="Zoom In">🔍+</button>
          <button className="cad-tool" title="Zoom Extents">⊞</button>
        </div>

        <div className="cad-viewport">
          <canvas ref={canvasRef} width={780} height={480} className="cad-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
          />
          <div className="cad-coords">X: {cursorPos.x} Y: {cursorPos.y}</div>
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
