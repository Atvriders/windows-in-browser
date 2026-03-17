import { useState } from 'react';
import './StickyNotes.css';

const NOTE_COLORS = [
  { id: 'yellow', bg: '#fef08a', header: '#fde047', text: '#1c1917' },
  { id: 'blue',   bg: '#bfdbfe', header: '#93c5fd', text: '#1e3a5f' },
  { id: 'green',  bg: '#bbf7d0', header: '#86efac', text: '#14532d' },
  { id: 'pink',   bg: '#fbcfe8', header: '#f9a8d4', text: '#831843' },
  { id: 'purple', bg: '#e9d5ff', header: '#d8b4fe', text: '#4c1d95' },
  { id: 'grey',   bg: '#e5e7eb', header: '#d1d5db', text: '#111827' },
];

interface Note {
  id: number;
  colorId: string;
  text: string;
}

let nextId = 4;

const INITIAL: Note[] = [
  { id: 1, colorId: 'yellow', text: 'Buy groceries\n- Milk\n- Bread\n- Eggs' },
  { id: 2, colorId: 'blue',   text: 'Meeting at 3pm\nRemember to prep slides!' },
  { id: 3, colorId: 'green',  text: 'Ideas:\n• New app feature\n• Refactor auth\n• Write tests' },
];

export default function StickyNotes() {
  const [notes, setNotes] = useState<Note[]>(INITIAL);
  const [activeId, setActiveId] = useState<number | null>(null);

  const addNote = () => {
    const newNote: Note = { id: nextId++, colorId: 'yellow', text: '' };
    setNotes(ns => [...ns, newNote]);
    setActiveId(newNote.id);
  };

  const deleteNote = (id: number) => {
    setNotes(ns => ns.filter(n => n.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const updateText = (id: number, text: string) => {
    setNotes(ns => ns.map(n => n.id === id ? { ...n, text } : n));
  };

  const setColor = (id: number, colorId: string) => {
    setNotes(ns => ns.map(n => n.id === id ? { ...n, colorId } : n));
  };

  return (
    <div className="sn-root">
      <div className="sn-sidebar">
        <button className="sn-add-btn" onClick={addNote} title="New note">＋ New note</button>
        <div className="sn-list">
          {notes.map(n => {
            const col = NOTE_COLORS.find(c => c.id === n.colorId) ?? NOTE_COLORS[0];
            return (
              <div
                key={n.id}
                className={`sn-list-item ${activeId === n.id ? 'active' : ''}`}
                style={{ borderLeft: `4px solid ${col.header}` }}
                onClick={() => setActiveId(n.id)}
              >
                <span className="sn-list-preview">{n.text.split('\n')[0] || 'New note'}</span>
                <button className="sn-list-del" onClick={e => { e.stopPropagation(); deleteNote(n.id); }}>🗑</button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sn-editor-area">
        {activeId === null ? (
          <div className="sn-empty">
            <div className="sn-empty-icon">📝</div>
            <div>Select a note or create a new one</div>
          </div>
        ) : (() => {
          const note = notes.find(n => n.id === activeId);
          if (!note) return null;
          const col = NOTE_COLORS.find(c => c.id === note.colorId) ?? NOTE_COLORS[0];
          return (
            <div className="sn-note" style={{ background: col.bg, color: col.text }}>
              <div className="sn-note-header" style={{ background: col.header }}>
                <div className="sn-color-picker">
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c.id}
                      className={`sn-color-dot ${note.colorId === c.id ? 'selected' : ''}`}
                      style={{ background: c.header }}
                      onClick={() => setColor(note.id, c.id)}
                      title={c.id}
                    />
                  ))}
                </div>
                <button className="sn-del-btn" onClick={() => deleteNote(note.id)} title="Delete note">🗑</button>
              </div>
              <textarea
                className="sn-textarea"
                style={{ color: col.text, background: 'transparent' }}
                value={note.text}
                onChange={e => updateText(note.id, e.target.value)}
                placeholder="Start typing your note..."
                autoFocus
              />
            </div>
          );
        })()}
      </div>
    </div>
  );
}
