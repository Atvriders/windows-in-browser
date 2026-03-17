import { useRef, useState, useEffect } from 'react';
import './Illustrator.css';

type Tool = 'select' | 'pen' | 'rectangle' | 'ellipse' | 'line' | 'text';

interface Shape { id: number; type: string; x: number; y: number; w: number; h: number; color: string; stroke: string; text?: string; points?: { x: number; y: number }[]; }

export default function Illustrator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tool, setTool] = useState<Tool>('rectangle');
  const [color, setColor] = useState('#ff6b35');
  const [stroke, setStroke] = useState('#000000');
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [penPoints, setPenPoints] = useState<{ x: number; y: number }[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

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
      if (s.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + s.w, s.y + s.h);
        ctx.stroke();
      }
      if (s.type === 'pen' && s.points && s.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(s.points[0].x, s.points[0].y);
        s.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (s.type === 'text' && s.text) {
        ctx.fillStyle = s.color;
        ctx.font = '16px Arial';
        ctx.fillText(s.text, s.x, s.y);
      }
    });
    // In-progress pen path preview
    if (penPoints.length > 0) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(penPoints[0].x, penPoints[0].y);
      penPoints.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(cursorPos.x, cursorPos.y);
      ctx.stroke();
      ctx.setLineDash([]);
      penPoints.forEach(p => { ctx.fillStyle = stroke; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill(); });
    }
  }, [shapes, penPoints, cursorPos, stroke]);

  const getPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.detail === 2) return;
    const pos = getPos(e);
    if (tool === 'pen') {
      setPenPoints(pts => [...pts, pos]);
      return;
    }
    if (tool === 'text') {
      const text = window.prompt('Enter text:');
      if (text) setShapes(s => [...s, { id: Date.now(), type: 'text', x: pos.x, y: pos.y, w: 0, h: 0, color, stroke, text }]);
      return;
    }
    setStartPos(pos);
    setDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPos(getPos(e));
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (tool === 'pen' || tool === 'text' || tool === 'select') return;
    if (!drawing) return;
    const pos = getPos(e);
    if (tool === 'rectangle' || tool === 'ellipse') {
      setShapes(s => [...s, { id: Date.now(), type: tool, x: startPos.x, y: startPos.y, w: pos.x - startPos.x, h: pos.y - startPos.y, color, stroke }]);
    }
    if (tool === 'line') {
      setShapes(s => [...s, { id: Date.now(), type: 'line', x: startPos.x, y: startPos.y, w: pos.x - startPos.x, h: pos.y - startPos.y, color, stroke }]);
    }
    setDrawing(false);
  };

  const handleImageLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
        const w = img.width * ratio, h = img.height * ratio;
        ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      };
      img.src = ev.target!.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDoubleClick = () => {
    if (tool === 'pen' && penPoints.length >= 2) {
      setShapes(s => [...s, { id: Date.now(), type: 'pen', x: penPoints[0].x, y: penPoints[0].y, w: 0, h: 0, color, stroke, points: penPoints }]);
      setPenPoints([]);
    }
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
        <button className="ai-menu-item" onClick={() => fileInputRef.current?.click()}>📂 Open Image</button>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageLoad} />
        {['Edit','Object','Type','Select','Effect','View','Window','Help'].map(m => (
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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            style={{ cursor: tool === 'text' ? 'text' : tool === 'select' ? 'default' : 'crosshair' }} />
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
