import { useRef, useState, useEffect, useCallback } from 'react';
import './Paint.css';

type Tool = 'pencil' | 'eraser' | 'fill' | 'eyedropper' | 'line' | 'rect' | 'ellipse' | 'text';

const COLORS = [
  '#000000','#7f7f7f','#880015','#ed1c24','#ff7f27','#fff200','#22b14c','#00a2e8','#3f48cc','#a349a4',
  '#ffffff','#c3c3c3','#b97a57','#ffaec9','#ffc90e','#efe4b0','#b5e61d','#99d9ea','#7092be','#c8bfe7',
];

const MAX_HISTORY = 20;

export default function Paint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<ImageData[]>([]);
  const historyIdxRef = useRef(-1);
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(4);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const snapshotRef = useRef<ImageData | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Truncate future if we branched
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(snap);
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    historyIdxRef.current = historyRef.current.length - 1;
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  }, [saveHistory]);

  const undo = () => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current -= 1;
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.putImageData(historyRef.current[historyIdxRef.current], 0, 0);
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(true);
  };

  const redo = () => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current += 1;
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.putImageData(historyRef.current[historyIdxRef.current], 0, 0);
    setCanUndo(true);
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1);
  };

  const getPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDown = (e: React.MouseEvent) => {
    const pos = getPos(e);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    if (tool === 'eyedropper') {
      const pixel = ctx.getImageData(Math.round(pos.x), Math.round(pos.y), 1, 1).data;
      const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, '0')).join('');
      setColor(hex);
      return;
    }
    if (tool === 'text') {
      const text = window.prompt('Enter text:');
      if (text) {
        ctx.font = `${Math.max(size * 3, 14)}px Arial`;
        ctx.fillStyle = color;
        ctx.fillText(text, pos.x, pos.y);
        saveHistory();
      }
      return;
    }
    setDrawing(true);
    setStartPos(pos);
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (tool === 'pencil' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
    if (tool === 'fill') {
      floodFill(ctx, pos.x, pos.y, color);
      saveHistory();
    }
  };

  const onMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    if (tool === 'pencil') {
      ctx.strokeStyle = color;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    } else if (tool === 'line' || tool === 'rect' || tool === 'ellipse') {
      ctx.putImageData(snapshotRef.current!, 0, 0);
      ctx.strokeStyle = color;
      ctx.beginPath();
      if (tool === 'line') {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else {
        const rx = Math.abs(pos.x - startPos.x) / 2;
        const ry = Math.abs(pos.y - startPos.y) / 2;
        ctx.ellipse(startPos.x + (pos.x - startPos.x) / 2, startPos.y + (pos.y - startPos.y) / 2, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const onUp = () => {
    if (!drawing) return;
    setDrawing(false);
    snapshotRef.current = null;
    if (tool !== 'fill' && tool !== 'eyedropper' && tool !== 'text') {
      saveHistory();
    }
  };

  const floodFill = (ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) => {
    const canvas = canvasRef.current!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const idx = (Math.round(y) * canvas.width + Math.round(x)) * 4;
    const tr = data[idx], tg = data[idx + 1], tb = data[idx + 2];
    const fc = parseInt(fillColor.slice(1), 16);
    const fr = (fc >> 16) & 0xff, fg = (fc >> 8) & 0xff, fb = fc & 0xff;
    if (tr === fr && tg === fg && tb === fb) return;
    const stack = [[Math.round(x), Math.round(y)]];
    while (stack.length) {
      const [cx, cy] = stack.pop()!;
      if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) continue;
      const i = (cy * canvas.width + cx) * 4;
      if (data[i] !== tr || data[i+1] !== tg || data[i+2] !== tb) continue;
      data[i] = fr; data[i+1] = fg; data[i+2] = fb; data[i+3] = 255;
      stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
    }
    ctx.putImageData(imageData, 0, 0);
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
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
        const w = img.width * ratio, h = img.height * ratio;
        ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
        saveHistory();
      };
      img.src = ev.target!.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clear = () => {
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    saveHistory();
  };

  const save = () => {
    const link = document.createElement('a');
    link.download = 'painting.png';
    link.href = canvasRef.current!.toDataURL();
    link.click();
  };

  const tools: { id: Tool; icon: string; label: string }[] = [
    { id: 'pencil', icon: '✏️', label: 'Pencil' },
    { id: 'eraser', icon: '⬜', label: 'Eraser' },
    { id: 'fill', icon: '🪣', label: 'Fill' },
    { id: 'eyedropper', icon: '💉', label: 'Eyedropper' },
    { id: 'text', icon: 'A', label: 'Text' },
    { id: 'line', icon: '📏', label: 'Line' },
    { id: 'rect', icon: '⬛', label: 'Rectangle' },
    { id: 'ellipse', icon: '⭕', label: 'Ellipse' },
  ];

  const cursor = tool === 'eraser' ? 'cell' : tool === 'eyedropper' ? 'crosshair' : 'crosshair';

  return (
    <div className="paint-root">
      <div className="paint-toolbar">
        <div className="paint-tool-group">
          {tools.map(t => (
            <button key={t.id} className={`paint-tool ${tool === t.id ? 'active' : ''}`} onClick={() => setTool(t.id)} title={t.label}>
              {t.icon}
            </button>
          ))}
        </div>
        <div className="paint-divider" />
        <div className="paint-tool-group">
          <label className="paint-label">Size</label>
          <input type="range" min={1} max={30} value={size} onChange={e => setSize(+e.target.value)} className="paint-size-slider" />
          <span className="paint-size-val">{size}px</span>
        </div>
        <div className="paint-divider" />
        <div className="paint-colors">
          {COLORS.map(c => (
            <div key={c} className={`paint-swatch ${color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />
          ))}
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="paint-color-custom" title="Custom color" />
        </div>
        <div className="paint-divider" />
        <button className="paint-action" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">↩ Undo</button>
        <button className="paint-action" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">↪ Redo</button>
        <div className="paint-divider" />
        <button className="paint-action" onClick={() => fileInputRef.current?.click()}>📂 Open Image</button>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageLoad} />
        <button className="paint-action" onClick={clear}>🗑️ Clear</button>
        <button className="paint-action" onClick={save}>💾 Save</button>
      </div>
      {tool === 'eyedropper' && (
        <div className="paint-eyedropper-hint">Click anywhere on the canvas to pick a color</div>
      )}
      <div className="paint-canvas-wrap">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="paint-canvas"
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          style={{ cursor }}
        />
      </div>
    </div>
  );
}
