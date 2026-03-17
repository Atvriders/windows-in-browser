import { useState, useCallback, useEffect } from 'react';
import BootScreen from './components/Boot/BootScreen';
import ShutdownScreen from './components/Boot/ShutdownScreen';
import LoginScreen from './components/Boot/LoginScreen';
import Desktop from './components/Desktop/Desktop';
import { useDesktopStore } from './store/useDesktopStore';

type AppState = 'locked' | 'booting' | 'running' | 'restarting' | 'shutting_down' | 'sleeping';

export default function App() {
  const [state, setState] = useState<AppState>('locked');
  const { restartRequested, clearRestartRequest } = useDesktopStore();

  const handleBootComplete = useCallback(() => setState('running'), []);
  const handleRestart = useCallback(() => {
    setState('restarting');
    setTimeout(() => setState('locked'), 2000);
  }, []);
  const handleShutdown = useCallback(() => setState('shutting_down'), []);
  const handleSleep = useCallback(() => {
    setState('sleeping');
    setTimeout(() => setState('running'), 3000);
  }, []);

  // Watch for restart requests from Windows Update
  useEffect(() => {
    if (restartRequested && state === 'running') {
      clearRestartRequest();
      handleRestart();
    }
  }, [restartRequested, state, clearRestartRequest, handleRestart]);

  if (state === 'locked') return <LoginScreen onLogin={() => setState('booting')} />;
  if (state === 'booting') return <BootScreen onComplete={handleBootComplete} />;
  if (state === 'shutting_down') return <ShutdownScreen message="Shutting down..." />;
  if (state === 'restarting') return <ShutdownScreen message="Restarting..." />;
  if (state === 'sleeping') return <ShutdownScreen message="Sleeping..." />;

  return <Desktop onRestart={handleRestart} onShutdown={handleShutdown} onSleep={handleSleep} onLock={() => setState('locked')} />;
}
