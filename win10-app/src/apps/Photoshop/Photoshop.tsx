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

  const floodFill = (x: number, y: number) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const px = Math.floor(x), py = Math.floor(y);
    const i0 = (py * canvas.width + px) * 4;
    const [tR, tG, tB, tA] = [data[i0], data[i0+1], data[i0+2], data[i0+3]];
    const fR = parseInt(color.slice(1,3),16), fG = parseInt(color.slice(3,5),16), fB = parseInt(color.slice(5,7),16);
    if (tR===fR && tG===fG && tB===fB) return;
    const match = (i: number) => data[i]===tR && data[i+1]===tG && data[i+2]===tB && data[i+3]===tA;
    const stack = [[px, py]];
    while (stack.length) {
      const [cx, cy] = stack.pop()!;
      if (cx<0||cx>=canvas.width||cy<0||cy>=canvas.height) continue;
      const ci = (cy*canvas.width+cx)*4;
      if (!match(ci)) continue;
      data[ci]=fR; data[ci+1]=fG; data[ci+2]=fB; data[ci+3]=255;
      stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
    }
    ctx.putImageData(imgData, 0, 0);
  };

  const startDraw = (e: React.MouseEvent) => {
    const { x, y } = getPos(e);
    if (tool === 'eyedropper') {
      const ctx = canvasRef.current!.getContext('2d')!;
      const [r,g,b] = ctx.getImageData(Math.floor(x),Math.floor(y),1,1).data;
      setColor(`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`);
      return;
    }
    if (tool === 'fill') { floodFill(x, y); return; }
    if (tool !== 'brush' && tool !== 'eraser') return;
    setDrawing(true);
    const ctx = canvasRef.current!.getContext('2d')!;
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
                style={{ cursor: tool === 'brush' ? 'crosshair' : tool === 'eraser' ? 'cell' : tool === 'eyedropper' ? 'copy' : tool === 'fill' ? 'cell' : 'default' }}
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
