import { useState, useEffect, useRef } from 'react';
import './ClockApp.css';

type Tab = 'clock' | 'alarm' | 'timer' | 'stopwatch';

interface Alarm { id: number; time: string; label: string; enabled: boolean; }

let alarmIdCounter = 3;

function pad(n: number, digits = 2) { return String(n).padStart(digits, '0'); }

function ClockTab() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  const hDeg = (h % 12) * 30 + m * 0.5;
  const mDeg = m * 6 + s * 0.1;
  const sDeg = s * 6;

  return (
    <div className="clock-tab">
      <div className="clock-face">
        <div className="clock-hand clock-hour" style={{ transform: `rotate(${hDeg}deg)` }} />
        <div className="clock-hand clock-minute" style={{ transform: `rotate(${mDeg}deg)` }} />
        <div className="clock-hand clock-second" style={{ transform: `rotate(${sDeg}deg)` }} />
        <div className="clock-center-dot" />
        {[...Array(12)].map((_, i) => (
          <div key={i} className="clock-tick" style={{ transform: `rotate(${i * 30}deg)` }}>
            <div className={`clock-tick-mark ${i % 3 === 0 ? 'major' : ''}`} />
          </div>
        ))}
      </div>
      <div className="clock-digital">{pad(h)}:{pad(m)}:{pad(s)}</div>
      <div className="clock-date">{now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>
  );
}

function AlarmTab() {
  const [alarms, setAlarms] = useState<Alarm[]>([
    { id: 1, time: '07:00', label: 'Wake up', enabled: true },
    { id: 2, time: '09:30', label: 'Stand-up meeting', enabled: false },
  ]);
  const [newTime, setNewTime] = useState('08:00');
  const [newLabel, setNewLabel] = useState('');

  const addAlarm = () => {
    setAlarms(a => [...a, { id: alarmIdCounter++, time: newTime, label: newLabel || 'Alarm', enabled: true }]);
    setNewLabel('');
  };
  const toggleAlarm = (id: number) => setAlarms(a => a.map(al => al.id === id ? { ...al, enabled: !al.enabled } : al));
  const deleteAlarm = (id: number) => setAlarms(a => a.filter(al => al.id !== id));

  return (
    <div className="alarm-tab">
      <div className="alarm-add-row">
        <input type="time" className="alarm-time-input" value={newTime} onChange={e => setNewTime(e.target.value)} />
        <input type="text" className="alarm-label-input" placeholder="Label (optional)" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
        <button className="alarm-add-btn" onClick={addAlarm}>+ Add</button>
      </div>
      <div className="alarm-list">
        {alarms.map(al => (
          <div key={al.id} className={`alarm-item ${al.enabled ? 'enabled' : 'disabled'}`}>
            <div className="alarm-info">
              <div className="alarm-time">{al.time}</div>
              <div className="alarm-label">{al.label}</div>
            </div>
            <button className={`alarm-toggle ${al.enabled ? 'on' : ''}`} onClick={() => toggleAlarm(al.id)}>
              <span className="alarm-toggle-thumb" />
            </button>
            <button className="alarm-delete" onClick={() => deleteAlarm(al.id)}>🗑</button>
          </div>
        ))}
        {alarms.length === 0 && <div className="alarm-empty">No alarms set</div>}
      </div>
    </div>
  );
}

function TimerTab() {
  const [inputMin, setInputMin] = useState(5);
  const [inputSec, setInputSec] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const total = inputMin * 60 + inputSec;

  useEffect(() => {
    if (running && remaining !== null) {
      intervalRef.current = window.setInterval(() => {
        setRemaining(r => {
          if (r === null || r <= 0) { setRunning(false); return 0; }
          return r - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current !== null) clearInterval(intervalRef.current); };
  }, [running]);

  const start = () => {
    if (remaining === null) setRemaining(total);
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setRemaining(null); };

  const display = remaining ?? total;
  const pct = total > 0 ? ((total - display) / total) * 100 : 0;
  const circumference = 2 * Math.PI * 90;

  return (
    <div className="timer-tab">
      {remaining === null && !running ? (
        <div className="timer-inputs">
          <div className="timer-input-group">
            <input type="number" min={0} max={99} value={inputMin} onChange={e => setInputMin(Math.max(0, Math.min(99, +e.target.value)))} className="timer-num-input" />
            <label>min</label>
          </div>
          <div className="timer-sep">:</div>
          <div className="timer-input-group">
            <input type="number" min={0} max={59} value={inputSec} onChange={e => setInputSec(Math.max(0, Math.min(59, +e.target.value)))} className="timer-num-input" />
            <label>sec</label>
          </div>
        </div>
      ) : (
        <div className="timer-ring-wrap">
          <svg className="timer-ring" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle cx="100" cy="100" r="90" fill="none" stroke="#0078d4" strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div className="timer-countdown">
            {display === 0 ? '⏰ Done!' : `${pad(Math.floor(display / 60))}:${pad(display % 60)}`}
          </div>
        </div>
      )}
      <div className="timer-controls">
        {!running ? (
          <button className="timer-btn primary" onClick={start} disabled={display === 0 && remaining !== null}>
            {remaining !== null ? '▶ Resume' : '▶ Start'}
          </button>
        ) : (
          <button className="timer-btn" onClick={pause}>⏸ Pause</button>
        )}
        <button className="timer-btn" onClick={reset}>↺ Reset</button>
      </div>
    </div>
  );
}

function StopwatchTab() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const lastLapRef = useRef(0);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => setElapsed(e => e + 10), 10);
    } else {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current !== null) clearInterval(intervalRef.current); };
  }, [running]);

  const formatTime = (ms: number) => {
    const cs = Math.floor((ms % 1000) / 10);
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000);
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}` : `${pad(m)}:${pad(s)}.${pad(cs)}`;
  };

  const lap = () => {
    const lapTime = elapsed - lastLapRef.current;
    lastLapRef.current = elapsed;
    setLaps(l => [lapTime, ...l]);
  };

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
    lastLapRef.current = 0;
  };

  return (
    <div className="sw-tab">
      <div className="sw-display">{formatTime(elapsed)}</div>
      <div className="sw-controls">
        <button className="timer-btn" onClick={lap} disabled={!running}>🏁 Lap</button>
        {!running
          ? <button className="timer-btn primary" onClick={() => setRunning(true)}>▶ {elapsed > 0 ? 'Resume' : 'Start'}</button>
          : <button className="timer-btn" onClick={() => setRunning(false)}>⏸ Stop</button>
        }
        <button className="timer-btn" onClick={reset} disabled={running}>↺ Reset</button>
      </div>
      {laps.length > 0 && (
        <div className="sw-laps">
          {laps.map((l, i) => (
            <div key={i} className="sw-lap">
              <span>Lap {laps.length - i}</span>
              <span>{formatTime(l)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClockApp() {
  const [tab, setTab] = useState<Tab>('clock');
  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'clock', label: 'Clock', icon: '🕐' },
    { id: 'alarm', label: 'Alarm', icon: '⏰' },
    { id: 'timer', label: 'Timer', icon: '⏱' },
    { id: 'stopwatch', label: 'Stopwatch', icon: '⏲' },
  ];
  return (
    <div className="clock-app">
      <div className="clock-nav">
        {TABS.map(t => (
          <button key={t.id} className={`clock-nav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      <div className="clock-body">
        {tab === 'clock' && <ClockTab />}
        {tab === 'alarm' && <AlarmTab />}
        {tab === 'timer' && <TimerTab />}
        {tab === 'stopwatch' && <StopwatchTab />}
      </div>
    </div>
  );
}
