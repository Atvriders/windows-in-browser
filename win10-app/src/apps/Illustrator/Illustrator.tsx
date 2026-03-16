import { useRef, useState, useEffect } from 'react';
import './Illustrator.css';

type Tool = 'select' | 'pen' | 'rectangle' | 'ellipse' | 'line' | 'text';

interface Shape { id: number; type: string; x: number; y: number; w: number; h: number; color: string; stroke: string; }

export default function Illustrator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('rectangle');
  const [color, setColor] = useState('#ff6b35');
  const [stroke, setStroke] = useState('#000000');
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(s => {
      ctx.fillStyle = s.color;
      ctx.strokeStyle = s.stroke;
      ctx.lineWidth = 2;
      if (s.type === 'rectangle') { ctx.fillRect(s.x, s.y, s.w, s.h); ctx.strokeRect(s.x, s.y, s.w, s.h); }
      if (s.type === 'ellipse') {
        ctx.beginPath();
        ctx.ellipse(s.x + s.w/2, s.y + s.h/2, Math.abs(s.w/2), Math.abs(s.h/2), 0, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
      }
    });
  }, [shapes]);

  const getPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getPos(e);
    setStartPos(pos);
    setDrawing(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!drawing) return;
    const pos = getPos(e);
    if (tool === 'rectangle' || tool === 'ellipse') {
      setShapes(s => [...s, { id: Date.now(), type: tool, x: startPos.x, y: startPos.y, w: pos.x - startPos.x, h: pos.y - startPos.y, color, stroke }]);
    }
    setDrawing(false);
  };

  const TOOLS: { id: Tool; icon: string }[] = [
    { id: 'select', icon: '↖' },
    { id: 'pen', icon: '✒' },
    { id: 'rectangle', icon: '▭' },
    { id: 'ellipse', icon: '⬭' },
    { id: 'line', icon: '╱' },
    { id: 'text', icon: 'T' },
  ];

  return (
    <div className="illustrator">
      <div className="ai-menubar">
        {['File','Edit','Object','Type','Select','Effect','View','Window','Help'].map(m => (
          <button key={m} className="ai-menu-item">{m}</button>
        ))}
      </div>
      <div className="ai-body">
        <div className="ai-toolbar">
          {TOOLS.map(t => (
            <button key={t.id} className={`ai-tool ${tool === t.id ? 'active' : ''}`} onClick={() => setTool(t.id)}>{t.icon}</button>
          ))}
          <div className="ai-tool-sep" />
          <div className="ai-colors">
            <label className="ai-color-label">Fill</label>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="ai-color-input" />
            <label className="ai-color-label">Stroke</label>
            <input type="color" value={stroke} onChange={e => setStroke(e.target.value)} className="ai-color-input" />
          </div>
        </div>
        <div className="ai-canvas-area">
          <canvas ref={canvasRef} width={760} height={560} className="ai-canvas"
            onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
            style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }} />
        </div>
        <div className="ai-panels">
          <div className="ai-panel"><div className="ai-panel-header">Transform</div>
            <div className="ai-prop-row"><span>X:</span><input className="ai-prop-input" defaultValue="0" /></div>
            <div className="ai-prop-row"><span>Y:</span><input className="ai-prop-input" defaultValue="0" /></div>
            <div className="ai-prop-row"><span>W:</span><input className="ai-prop-input" defaultValue="100" /></div>
            <div className="ai-prop-row"><span>H:</span><input className="ai-prop-input" defaultValue="100" /></div>
          </div>
          <div className="ai-panel"><div className="ai-panel-header">Layers</div>
            {['Layer 1','Artwork','Background'].map(l => (
              <div key={l} className="ai-layer"><span>👁</span><span>{l}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div className="ai-statusbar"><span>Untitled-1.ai</span><span>Objects: {shapes.length}</span></div>
    </div>
  );
}
