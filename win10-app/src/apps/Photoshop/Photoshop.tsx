import { useRef, useState, useEffect } from 'react';
import './Photoshop.css';

type Tool = 'brush' | 'eraser' | 'fill' | 'eyedropper' | 'crop' | 'move';

export default function Photoshop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [drawing, setDrawing] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [layers] = useState(['Background', 'Layer 1', 'Layer 2']);
  const [activeLayer, setActiveLayer] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (canvasRef.current!.width / rect.width), y: (e.clientY - rect.top) * (canvasRef.current!.height / rect.height) };
  };

  const startDraw = (e: React.MouseEvent) => {
    if (tool !== 'brush' && tool !== 'eraser') return;
    setDrawing(true);
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent) => {
    if (!drawing || (tool !== 'brush' && tool !== 'eraser')) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDraw = () => setDrawing(false);

  const TOOLS: { id: Tool; icon: string; label: string }[] = [
    { id: 'move', icon: '✥', label: 'Move' },
    { id: 'crop', icon: '⊡', label: 'Crop' },
    { id: 'brush', icon: '🖌', label: 'Brush' },
    { id: 'eraser', icon: '⬜', label: 'Eraser' },
    { id: 'fill', icon: '🪣', label: 'Fill' },
    { id: 'eyedropper', icon: '💉', label: 'Eyedropper' },
  ];

  return (
    <div className="photoshop">
      <div className="ps-menubar">
        {['File','Edit','Image','Layer','Select','Filter','View','Window','Help'].map(m => (
          <button key={m} className="ps-menu-item">{m}</button>
        ))}
      </div>

      <div className="ps-body">
        <div className="ps-toolbar">
          {TOOLS.map(t => (
            <button key={t.id} className={`ps-tool ${tool === t.id ? 'active' : ''}`} title={t.label} onClick={() => setTool(t.id)}>
              {t.icon}
            </button>
          ))}
          <div className="ps-tool-sep" />
          <div className="ps-colors">
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="ps-color-fg" title="Foreground Color" />
          </div>
          <div className="ps-tool-sep" />
          <div className="ps-brush-size">
            <span className="ps-label">Size</span>
            <input type="range" min="1" max="50" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="ps-slider" />
            <span className="ps-label">{brushSize}px</span>
          </div>
        </div>

        <div className="ps-workspace">
          <div className="ps-canvas-area">
            <div className="ps-canvas-label">Untitled-1 @ {zoom}%</div>
            <div className="ps-canvas-wrapper">
              <canvas
                ref={canvasRef}
                width={800} height={600}
                className="ps-canvas"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                style={{ cursor: tool === 'brush' ? 'crosshair' : tool === 'eraser' ? 'cell' : 'default' }}
              />
            </div>
          </div>

          <div className="ps-panels">
            <div className="ps-panel">
              <div className="ps-panel-header">Layers</div>
              {[...layers].reverse().map((l, i) => (
                <div key={l} className={`ps-layer ${layers.length - 1 - i === activeLayer ? 'active' : ''}`}
                  onClick={() => setActiveLayer(layers.length - 1 - i)}>
                  <div className="ps-layer-thumb" />
                  <span>{l}</span>
                </div>
              ))}
              <div className="ps-layer-actions">
                <button className="ps-layer-btn">＋</button>
                <button className="ps-layer-btn">🗑</button>
              </div>
            </div>

            <div className="ps-panel">
              <div className="ps-panel-header">Properties</div>
              <div className="ps-prop-row"><span>Zoom:</span>
                <select className="ps-prop-select" value={zoom} onChange={e => setZoom(Number(e.target.value))}>
                  {[25,50,75,100,150,200].map(z => <option key={z} value={z}>{z}%</option>)}
                </select>
              </div>
              <div className="ps-prop-row"><span>Opacity:</span><span>100%</span></div>
              <div className="ps-prop-row"><span>Mode:</span><span>Normal</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="ps-statusbar">
        <span>800 x 600 px | RGB | 8-bit</span>
        <span>Tool: {tool}</span>
      </div>
    </div>
  );
}
