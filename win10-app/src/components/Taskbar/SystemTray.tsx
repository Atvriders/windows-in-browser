import { useState, useEffect } from 'react';
import './SystemTray.css';

export default function SystemTray() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });

  return (
    <div className="system-tray">
      <button className="tray-icon" title="Network">🌐</button>
      <button className="tray-icon" title="Volume">🔊</button>
      <div className="tray-clock">
        <div className="tray-time">{timeStr}</div>
        <div className="tray-date">{dateStr}</div>
      </div>
    </div>
  );
}
