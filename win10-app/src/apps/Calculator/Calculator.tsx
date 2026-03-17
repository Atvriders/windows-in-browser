import { useState } from 'react';
import './Calculator.css';

type Mode = 'standard' | 'scientific';

export default function Calculator() {
  const [mode, setMode] = useState<Mode>('standard');
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [waitNext, setWaitNext] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [deg, setDeg] = useState(true); // degrees vs radians

  const input = (val: string) => {
    if (waitNext) {
      setDisplay(val === '.' ? '0.' : val);
      setWaitNext(false);
    } else {
      if (val === '.' && display.includes('.')) return;
      setDisplay(display === '0' && val !== '.' ? val : display + val);
    }
  };

  const operate = (nextOp: string) => {
    const cur = parseFloat(display);
    if (prev !== null && op && !waitNext) {
      const result = calc(prev, cur, op);
      setHistory(h => [...h.slice(-4), `${prev} ${op} ${cur} = ${result}`]);
      setDisplay(String(result));
      setPrev(result);
    } else {
      setPrev(cur);
    }
    setOp(nextOp);
    setWaitNext(true);
  };

  const calc = (a: number, b: number, o: string): number => {
    switch (o) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? 0 : a / b;
      case 'xʸ': return Math.pow(a, b);
      default: return b;
    }
  };

  const equals = () => {
    if (prev === null || op === null) return;
    const cur = parseFloat(display);
    const result = calc(prev, cur, op);
    setHistory(h => [...h.slice(-4), `${prev} ${op} ${cur} = ${result}`]);
    const resultStr = Number.isInteger(result) ? String(result) : parseFloat(result.toFixed(10)).toString();
    setDisplay(resultStr);
    setPrev(null);
    setOp(null);
    setWaitNext(true);
  };

  const clear = () => { setDisplay('0'); setPrev(null); setOp(null); setWaitNext(false); };
  const toggleSign = () => setDisplay(String(parseFloat(display) * -1));
  const percent = () => setDisplay(String(parseFloat(display) / 100));
  const backspace = () => setDisplay(display.length > 1 ? display.slice(0, -1) : '0');

  const toRad = (x: number) => deg ? x * Math.PI / 180 : x;
  const fromRad = (x: number) => deg ? x * 180 / Math.PI : x;

  const applyFn = (fn: string) => {
    const x = parseFloat(display);
    let result: number;
    switch (fn) {
      case 'sin': result = Math.sin(toRad(x)); break;
      case 'cos': result = Math.cos(toRad(x)); break;
      case 'tan': result = Math.tan(toRad(x)); break;
      case 'sin⁻¹': result = fromRad(Math.asin(x)); break;
      case 'cos⁻¹': result = fromRad(Math.acos(x)); break;
      case 'tan⁻¹': result = fromRad(Math.atan(x)); break;
      case 'log': result = Math.log10(x); break;
      case 'ln': result = Math.log(x); break;
      case '√': result = Math.sqrt(x); break;
      case 'x²': result = x * x; break;
      case 'x³': result = x * x * x; break;
      case '1/x': result = x === 0 ? 0 : 1 / x; break;
      case '|x|': result = Math.abs(x); break;
      case 'n!': {
        const n = Math.round(x);
        result = n < 0 ? NaN : n > 20 ? Infinity : Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a * b, 1);
        break;
      }
      case 'π': result = Math.PI; break;
      case 'e': result = Math.E; break;
      case '10ˣ': result = Math.pow(10, x); break;
      case 'eˣ': result = Math.exp(x); break;
      default: return;
    }
    const str = isNaN(result) ? 'Error' : !isFinite(result) ? 'Overflow' : parseFloat(result.toFixed(10)).toString();
    setHistory(h => [...h.slice(-4), `${fn}(${x}) = ${str}`]);
    setDisplay(str);
    setWaitNext(true);
    setPrev(null);
    setOp(null);
  };

  const standardButtons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '='],
  ];

  const sciButtons = [
    ['sin', 'cos', 'tan', 'π'],
    ['sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'e'],
    ['log', 'ln', '10ˣ', 'eˣ'],
    ['√', 'x²', 'x³', 'xʸ'],
    ['1/x', '|x|', 'n!', '('],
  ];

  const isOp = (b: string) => ['÷', '×', '−', '+', '=', 'xʸ'].includes(b);
  const isFn = (b: string) => ['C', '±', '%'].includes(b);
  const isSci = (b: string) => sciButtons.flat().includes(b);
  const isConst = (b: string) => ['π', 'e'].includes(b);

  return (
    <div className={`calc-root ${mode === 'scientific' ? 'sci-mode' : ''}`}>
      <div className="calc-mode-bar">
        <button className={`calc-mode-btn ${mode === 'standard' ? 'active' : ''}`} onClick={() => setMode('standard')}>Standard</button>
        <button className={`calc-mode-btn ${mode === 'scientific' ? 'active' : ''}`} onClick={() => setMode('scientific')}>Scientific</button>
        {mode === 'scientific' && (
          <button className="calc-deg-btn" onClick={() => setDeg(d => !d)}>{deg ? 'DEG' : 'RAD'}</button>
        )}
      </div>
      <div className="calc-history">
        {history.map((h, i) => <div key={i} className="calc-hist-item">{h}</div>)}
      </div>
      <div className="calc-display">
        {op && prev !== null && <div className="calc-expr">{prev} {op}</div>}
        <div className="calc-value">{display.length > 12 ? parseFloat(display).toExponential(6) : display}</div>
      </div>

      {mode === 'scientific' && (
        <div className="calc-sci-buttons">
          {sciButtons.flat().map((btn, i) => (
            <button
              key={i}
              className={`calc-btn sci ${isOp(btn) ? 'op' : ''} ${isConst(btn) ? 'const' : ''}`}
              onClick={() => {
                if (btn === 'xʸ') operate('xʸ');
                else if (btn === '(') { /* no-op placeholder */ }
                else applyFn(btn);
              }}
            >
              {btn}
            </button>
          ))}
        </div>
      )}

      <div className="calc-buttons">
        {standardButtons.flat().map((btn, i) => (
          <button
            key={i}
            className={`calc-btn ${isOp(btn) ? 'op' : ''} ${isFn(btn) ? 'fn' : ''} ${isSci(btn) ? 'sci' : ''} ${btn === '0' ? 'wide' : ''}`}
            onClick={() => {
              if (btn === 'C') clear();
              else if (btn === '±') toggleSign();
              else if (btn === '%') percent();
              else if (btn === '⌫') backspace();
              else if (btn === '=') equals();
              else if (isOp(btn)) operate(btn);
              else input(btn);
            }}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}
