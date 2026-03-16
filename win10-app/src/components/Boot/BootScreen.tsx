import { useEffect } from 'react';
import './BootScreen.css';

interface Props { onComplete: () => void; }

export default function BootScreen({ onComplete }: Props) {
  useEffect(() => {
    const t = setTimeout(onComplete, 3500);
    return () => clearTimeout(t);
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
