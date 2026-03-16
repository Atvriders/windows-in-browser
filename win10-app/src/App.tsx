import { useState, useCallback } from 'react';
import BootScreen from './components/Boot/BootScreen';
import ShutdownScreen from './components/Boot/ShutdownScreen';
import Desktop from './components/Desktop/Desktop';

type AppState = 'booting' | 'running' | 'restarting' | 'shutting_down' | 'sleeping';

export default function App() {
  const [state, setState] = useState<AppState>('booting');

  const handleBootComplete = useCallback(() => setState('running'), []);
  const handleRestart = useCallback(() => {
    setState('restarting');
    setTimeout(() => setState('booting'), 2000);
  }, []);
  const handleShutdown = useCallback(() => setState('shutting_down'), []);
  const handleSleep = useCallback(() => {
    setState('sleeping');
    setTimeout(() => setState('running'), 3000);
  }, []);

  if (state === 'booting') return <BootScreen onComplete={handleBootComplete} />;
  if (state === 'shutting_down') return <ShutdownScreen message="Shutting down..." />;
  if (state === 'restarting') return <ShutdownScreen message="Restarting..." />;
  if (state === 'sleeping') return <ShutdownScreen message="Sleeping..." />;

  return <Desktop onRestart={handleRestart} onShutdown={handleShutdown} onSleep={handleSleep} />;
}
