import { useState } from 'react';
import './Calendar.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

interface CalEvent { id: string; date: string; title: string; time: string; color: string; }

const INIT_EVENTS: CalEvent[] = [
  { id: '1', date: '2026-03-16', title: 'Team standup', time: '9:00 AM', color: '#0078d4' },
  { id: '2', date: '2026-03-16', title: 'Lunch with Sarah', time: '12:30 PM', color: '#00cc6a' },
  { id: '3', date: '2026-03-18', title: 'Doctor appointment', time: '2:00 PM', color: '#f4a261' },
  { id: '4', date: '2026-03-20', title: 'Project deadline', time: 'All day', color: '#e74856' },
  { id: '5', date: '2026-03-22', title: 'Birthday party - Mike', time: '7:00 PM', color: '#9b59b6' },
  { id: '6', date: '2026-03-25', title: 'Dentist', time: '10:00 AM', color: '#f4a261' },
  { id: '7', date: '2026-03-28', title: 'Code review session', time: '3:30 PM', color: '#0078d4' },
  { id: '8', date: '2026-04-01', title: 'Q2 planning kickoff', time: '10:00 AM', color: '#0078d4' },
];

export default function Calendar() {
  const today = new Date(2026, 2, 16); // March 16, 2026
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState<CalEvent[]>(INIT_EVENTS);
  const [selected, setSelected] = useState<Date | null>(today);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('9:00 AM');
  const [newColor, setNewColor] = useState('#0078d4');

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const isToday = (d: Date) => fmt(d) === fmt(today);
  const isSelected = (d: Date) => selected ? fmt(d) === fmt(selected) : false;

  const selectedEvents = selected ? events.filter(e => e.date === fmt(selected)) : [];

  const addEvent = () => {
    if (!newTitle.trim() || !selected) return;
    const ev: CalEvent = { id: Date.now().toString(), date: fmt(selected), title: newTitle, time: newTime, color: newColor };
    setEvents(e => [...e, ev]);
    setNewTitle(''); setShowAdd(false);
  };

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  const cells: ({ day: number; date: Date; cur: boolean })[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, date: new Date(year, month - 1, daysInPrev - i), cur: false });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, date: new Date(year, month, i), cur: true });
  while (cells.length % 7 !== 0) { cells.push({ day: cells.length - daysInMonth - firstDay + 1, date: new Date(year, month + 1, cells.length - daysInMonth - firstDay + 1), cur: false }); }

  return (
    <div className="cal-root">
      <div className="cal-sidebar">
        <div className="cal-mini-header">
          <button className="cal-nav" onClick={prev}>‹</button>
          <span>{MONTHS[month].substring(0,3)} {year}</span>
          <button className="cal-nav" onClick={next}>›</button>
        </div>
        <div className="cal-mini-days">{DAYS.map(d => <div key={d} className="cal-mini-day-hdr">{d.substring(0,1)}</div>)}</div>
        <div className="cal-mini-grid">
          {cells.map((c, i) => (
            <button key={i} className={`cal-mini-cell ${!c.cur ? 'other' : ''} ${isToday(c.date) ? 'today' : ''} ${isSelected(c.date) ? 'selected' : ''}`} onClick={() => setSelected(c.date)}>
              {c.day}
              {events.some(e => e.date === fmt(c.date)) && <span className="cal-mini-dot" />}
            </button>
          ))}
        </div>
        <button className="cal-add-btn" onClick={() => setShowAdd(true)}>+ New event</button>
        <div className="cal-legend">
          <div className="cal-legend-title">My calendars</div>
          {[['Personal','#0078d4'],['Work','#00cc6a'],['Family','#f4a261'],['Health','#e74856']].map(([n,c]) => (
            <div key={n} className="cal-legend-item"><span className="cal-legend-dot" style={{ background: c }} />{n}</div>
          ))}
        </div>
      </div>
      <div className="cal-main">
        <div className="cal-header">
          <div className="cal-header-left">
            <button className="cal-nav-btn" onClick={prev}>‹</button>
            <h2 className="cal-month-title">{MONTHS[month]} {year}</h2>
            <button className="cal-nav-btn" onClick={next}>›</button>
            <button className="cal-today-btn" onClick={() => { setCurrent(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(today); }}>Today</button>
          </div>
        </div>
        <div className="cal-grid-header">
          {DAYS.map(d => <div key={d} className="cal-grid-day-hdr">{d}</div>)}
        </div>
        <div className="cal-grid">
          {cells.map((c, i) => {
            const dayEvents = events.filter(e => e.date === fmt(c.date));
            return (
              <div key={i} className={`cal-cell ${!c.cur ? 'other' : ''} ${isToday(c.date) ? 'today' : ''} ${isSelected(c.date) ? 'selected' : ''}`} onClick={() => setSelected(c.date)}>
                <div className="cal-cell-num">{c.day}</div>
                <div className="cal-cell-events">
                  {dayEvents.slice(0,3).map(ev => (
                    <div key={ev.id} className="cal-event-chip" style={{ background: ev.color + '30', borderLeft: `3px solid ${ev.color}` }}>
                      {ev.time !== 'All day' && <span className="cal-event-time">{ev.time}</span>} {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && <div className="cal-more">+{dayEvents.length - 3} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selected && (
        <div className="cal-detail">
          <div className="cal-detail-date">{selected.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          {selectedEvents.length === 0 && <div className="cal-no-events">No events</div>}
          {selectedEvents.map(ev => (
            <div key={ev.id} className="cal-detail-event" style={{ borderLeft: `4px solid ${ev.color}` }}>
              <div className="cal-detail-ev-time">{ev.time}</div>
              <div className="cal-detail-ev-title">{ev.title}</div>
              <button className="cal-detail-ev-del" onClick={() => setEvents(e => e.filter(x => x.id !== ev.id))}>✕</button>
            </div>
          ))}
          <button className="cal-add-btn" style={{ marginTop: 12 }} onClick={() => setShowAdd(true)}>+ Add event</button>
        </div>
      )}
      {showAdd && (
        <div className="cal-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="cal-modal" onClick={e => e.stopPropagation()}>
            <div className="cal-modal-title">New event</div>
            <input className="cal-modal-input" placeholder="Event title" value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus />
            <input className="cal-modal-input" placeholder="Time (e.g. 9:00 AM)" value={newTime} onChange={e => setNewTime(e.target.value)} />
            <div className="cal-modal-colors">
              {['#0078d4','#00cc6a','#f4a261','#e74856','#9b59b6','#00b7c3'].map(c => (
                <div key={c} className={`cal-color-opt ${newColor === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setNewColor(c)} />
              ))}
            </div>
            <div className="cal-modal-actions">
              <button className="cal-modal-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="cal-modal-save" onClick={addEvent}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
