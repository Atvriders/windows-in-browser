import { useState, useEffect } from 'react';
import './LoginScreen.css';

interface Props { onLogin: () => void; }

export default function LoginScreen({ onLogin }: Props) {
  const [time, setTime] = useState(new Date());
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleClick = () => {
    // Resume AudioContext via user gesture so the startup chime plays
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        ctx.resume().then(() => ctx.close());
      }
    } catch (_) { /* */ }
    setFading(true);
    setTimeout(onLogin, 600);
  };

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className={`login-screen${fading ? ' fading' : ''}`} onClick={handleClick}>
      <div className="login-time-block">
        <div className="login-time">{timeStr}</div>
        <div className="login-date">{dateStr}</div>
      </div>

      <div className="login-user-block">
        <div className="login-avatar">👤</div>
        <div className="login-username">User</div>
        <div className="login-hint">Click anywhere to sign in</div>
      </div>

      <div className="login-arrow">↑</div>
    </div>
  );
}
