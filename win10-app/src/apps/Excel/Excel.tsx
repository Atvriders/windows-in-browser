import { useState, useCallback } from 'react';
import { useFileSystemStore } from '../../store/useFileSystemStore';
import FilePicker from '../../components/FilePicker/FilePicker';
import './Excel.css';

const COLS = 26;
const ROWS = 50;
const colLabel = (i: number) => String.fromCharCode(65 + i);

type CellMap = Record<string, string>;

function evalFormula(raw: string, cells: CellMap): string {
  if (!raw.startsWith('=')) return raw;
  try {
    let expr = raw.slice(1).toUpperCase();
    // Replace cell refs like A1, B2
    expr = expr.replace(/([A-Z])(\d+)/g, (_m, col, row) => {
      const key = `${col}${row}`;
      const val = cells[key] ?? '0';
      return isNaN(Number(val)) ? '0' : val;
    });
    // SUM(A1:A5)
    expr = expr.replace(/SUM\(([A-Z])(\d+):([A-Z])(\d+)\)/g, (_m, c1, r1, c2, r2) => {
      let sum = 0;
      for (let c = c1.charCodeAt(0); c <= c2.charCodeAt(0); c++) {
        for (let r = Number(r1); r <= Number(r2); r++) {
          sum += Number(cells[`${String.fromCharCode(c)}${r}`] ?? 0) || 0;
        }
      }
      return String(sum);
    });
    // eslint-disable-next-line no-new-func
    return String(Function(`"use strict"; return (${expr})`)());
  } catch {
    return '#ERR';
  }
}

export default function Excel() {
  const { driver } = useFileSystemStore();
  const [showOpen, setShowOpen] = useState(false);
  const [cells, setCells] = useState<CellMap>({});
  const [selected, setSelected] = useState<string>('A1');
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [sheets] = useState(['Sheet1', 'Sheet2', 'Sheet3']);
  const [activeSheet, setActiveSheet] = useState('Sheet1');

  const cellKey = (col: number, row: number) => `${colLabel(col)}${row + 1}`;

  const startEdit = (key: string) => {
    setEditing(key);
    setEditVal(cells[key] ?? '');
  };

  const commitEdit = useCallback(() => {
    if (editing) {
      setCells(c => ({ ...c, [editing]: editVal }));
      setEditing(null);
    }
  }, [editing, editVal]);

  const loadCSV = (content: string) => {
    const newCells: CellMap = {};
    content.split('\n').forEach((line, rowIdx) => {
      if (rowIdx >= ROWS || !line.trim()) return;
      line.split(',').forEach((val, colIdx) => {
        if (colIdx >= COLS) return;
        newCells[`${colLabel(colIdx)}${rowIdx + 1}`] = val.trim();
      });
    });
    setCells(newCells);
  };

  const openFromFS = (nodeId: string) => {
    if (!driver) return;
    loadCSV(driver.readFile(nodeId));
    setShowOpen(false);
  };

  const display = (key: string) => {
    const raw = cells[key] ?? '';
    return raw.startsWith('=') ? evalFormula(raw, cells) : raw;
  };

  return (
    <div className="excel">
      <div className="excel-ribbon">
        <div className="excel-ribbon-group">
          <button className="excel-btn" onClick={() => setShowOpen(true)}>📂 Open</button>
          <button className="excel-btn">💾 Save</button>
          <button className="excel-btn">↩ Undo</button>
          <button className="excel-btn">↪ Redo</button>
        </div>
        <div className="excel-ribbon-sep" />
        <div className="excel-ribbon-group">
          <button className="excel-btn"><b>B</b></button>
          <button className="excel-btn"><i>I</i></button>
          <button className="excel-btn"><u>U</u></button>
        </div>
        <div className="excel-ribbon-sep" />
        <div className="excel-ribbon-group">
          <button className="excel-btn">Σ Sum</button>
          <button className="excel-btn">📊 Chart</button>
          <button className="excel-btn">🔽 Filter</button>
        </div>
      </div>

      <div className="excel-formula-bar">
        <div className="excel-cell-ref">{selected}</div>
        <div className="excel-formula-sep" />
        <div className="excel-formula-input">
          {editing === selected
            ? <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={commitEdit} onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null); }} />
            : <span>{cells[selected] ?? ''}</span>
          }
        </div>
      </div>

      <div className="excel-grid-wrapper">
        <table className="excel-grid">
          <thead>
            <tr>
              <th className="excel-corner" />
              {Array.from({ length: COLS }, (_, i) => (
                <th key={i} className="excel-col-header">{colLabel(i)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, row) => (
              <tr key={row}>
                <td className="excel-row-header">{row + 1}</td>
                {Array.from({ length: COLS }, (_, col) => {
                  const key = cellKey(col, row);
                  const isSelected = selected === key;
                  const isEditing = editing === key;
                  return (
                    <td
                      key={col}
                      className={`excel-cell ${isSelected ? 'selected' : ''}`}
                      onClick={() => { setSelected(key); setEditing(null); }}
                      onDoubleClick={() => startEdit(key)}
                    >
                      {isEditing
                        ? <input
                            autoFocus className="excel-cell-input"
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null); }}
                          />
                        : <span>{display(key)}</span>
                      }
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showOpen && (
        <FilePicker
          title="Open Spreadsheet"
          accept={['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.csv', '.xlsx']}
          onSelect={(id) => openFromFS(id)}
          onClose={() => setShowOpen(false)}
        />
      )}

      <div className="excel-sheets">
        {sheets.map(s => (
          <button key={s} className={`excel-sheet-tab ${activeSheet === s ? 'active' : ''}`} onClick={() => setActiveSheet(s)}>{s}</button>
        ))}
        <button className="excel-sheet-add">＋</button>
      </div>
    </div>
  );
}
