import { useEffect } from 'react';
import { playStartup } from '../../utils/sounds';
import './BootScreen.css';

interface Props { onComplete: () => void; }

export default function BootScreen({ onComplete }: Props) {
  useEffect(() => {
    // Play startup chime ~1s before screen completes
    const chime = setTimeout(() => playStartup(), 2000);
    const t = setTimeout(onComplete, 3500);
    return () => { clearTimeout(chime); clearTimeout(t); };
  }, [onComplete]);

  return (
    <div className="boot-screen">
      <div className="boot-logo">
        <div className="boot-logo-grid">
          <div className="boot-tile red" />
          <div className="boot-tile green" />
          <div className="boot-tile blue" />
          <div className="boot-tile yellow" />
        </div>
      </div>
      <div className="boot-dots">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="boot-dot" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}
