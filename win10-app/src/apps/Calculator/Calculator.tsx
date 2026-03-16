import { useState } from 'react';
import './Calculator.css';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [waitNext, setWaitNext] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

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

  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '='],
  ];

  const isOp = (b: string) => ['÷', '×', '−', '+', '='].includes(b);
  const isFn = (b: string) => ['C', '±', '%'].includes(b);

  return (
    <div className="calc-root">
      <div className="calc-history">
        {history.map((h, i) => <div key={i} className="calc-hist-item">{h}</div>)}
      </div>
      <div className="calc-display">
        {op && prev !== null && <div className="calc-expr">{prev} {op}</div>}
        <div className="calc-value">{display.length > 12 ? parseFloat(display).toExponential(6) : display}</div>
      </div>
      <div className="calc-buttons">
        {buttons.flat().map((btn, i) => (
          <button
            key={i}
            className={`calc-btn ${isOp(btn) ? 'op' : ''} ${isFn(btn) ? 'fn' : ''} ${btn === '0' ? 'wide' : ''}`}
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
