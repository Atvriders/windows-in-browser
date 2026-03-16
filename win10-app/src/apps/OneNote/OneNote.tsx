import { useState } from 'react';
import './OneNote.css';

interface Note { id: number; title: string; content: string; }
interface Section { name: string; color: string; notes: Note[]; }

const DEFAULT_SECTIONS: Section[] = [
  { name: 'Personal', color: '#7719aa', notes: [
    { id: 1, title: 'Ideas', content: 'Brain dump of ideas:\n\n- Build a personal website\n- Learn a new programming language\n- Read 2 books a month\n- Start journaling daily' },
    { id: 2, title: 'Goals 2025', content: 'Annual Goals:\n\n1. Get promoted\n2. Exercise 4x per week\n3. Save $10,000\n4. Travel to 2 new countries' },
  ]},
  { name: 'Work', color: '#0078d4', notes: [
    { id: 3, title: 'Meeting Notes', content: 'Q1 Planning Meeting - Jan 15\n\nAttendees: Team Lead, PM, Dev Team\n\nAction Items:\n- Complete sprint backlog by Jan 20\n- Schedule design review\n- Update documentation' },
  ]},
  { name: 'School', color: '#107c10', notes: [
    { id: 4, title: 'Lecture Notes', content: 'Chapter 5: Data Structures\n\nArrays: O(1) access, O(n) insert\nLinked Lists: O(n) access, O(1) insert\nHash Tables: O(1) average\nBinary Trees: O(log n) search' },
  ]},
];

export default function OneNote() {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [activeSection, setActiveSection] = useState(0);
  const [activeNote, setActiveNote] = useState(0);

  const section = sections[activeSection];
  const note = section?.notes[activeNote];

  const updateNote = (content: string) => {
    setSections(s => s.map((sec, si) => si !== activeSection ? sec : {
      ...sec,
      notes: sec.notes.map((n, ni) => ni !== activeNote ? n : { ...n, content }),
    }));
  };

  const updateTitle = (title: string) => {
    setSections(s => s.map((sec, si) => si !== activeSection ? sec : {
      ...sec,
      notes: sec.notes.map((n, ni) => ni !== activeNote ? n : { ...n, title }),
    }));
  };

  return (
    <div className="onenote">
      <div className="onenote-sections">
        {sections.map((sec, i) => (
          <button key={sec.name} className={`onenote-section-tab ${i === activeSection ? 'active' : ''}`}
            style={i === activeSection ? { background: sec.color } : {}}
            onClick={() => { setActiveSection(i); setActiveNote(0); }}>
            {sec.name}
          </button>
        ))}
      </div>

      <div className="onenote-body" style={{ '--section-color': section?.color } as React.CSSProperties}>
        <div className="onenote-pages">
          <div className="onenote-pages-header" style={{ background: section?.color }}>Pages</div>
          {section?.notes.map((n, i) => (
            <button key={n.id} className={`onenote-page ${i === activeNote ? 'active' : ''}`}
              style={i === activeNote ? { borderLeft: `3px solid ${section.color}` } : {}}
              onClick={() => setActiveNote(i)}>
              {n.title}
            </button>
          ))}
          <button className="onenote-add-page" onClick={() => {
            const newNote = { id: Date.now(), title: 'New Page', content: '' };
            setSections(s => s.map((sec, i) => i === activeSection ? { ...sec, notes: [...sec.notes, newNote] } : sec));
            setActiveNote(section.notes.length);
          }}>＋ Add page</button>
        </div>

        <div className="onenote-editor">
          {note && (
            <>
              <input className="onenote-title" value={note.title} onChange={e => updateTitle(e.target.value)} />
              <div className="onenote-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <textarea className="onenote-content" value={note.content} onChange={e => updateNote(e.target.value)} placeholder="Start typing your note..." />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
