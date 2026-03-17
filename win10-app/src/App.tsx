import { useState, useCallback, useEffect } from 'react';
import BootScreen from './components/Boot/BootScreen';
import ShutdownScreen from './components/Boot/ShutdownScreen';
import LoginScreen from './components/Boot/LoginScreen';
import Desktop from './components/Desktop/Desktop';
import { useDesktopStore } from './store/useDesktopStore';
import { useThemeStore } from './store/useThemeStore';
import { useWindowStore } from './store/useWindowStore';
import { useDisplayStore } from './store/useDisplayStore';
import {
  getDisplayChannel,
  announcePosition,
  sendPing,
  sendPong,
  sendDisconnect,
} from './utils/displayChannel';
import type { AppID } from './types/window';

type AppState = 'locked' | 'booting' | 'running' | 'restarting' | 'shutting_down' | 'sleeping';

export default function App() {
  const [state, setState] = useState<AppState>('locked');
  const { restartRequested, clearRestartRequest } = useDesktopStore();
  const { darkMode } = useThemeStore();
  const { openWindow } = useWindowStore();
  const { myPosition, setPairedConnected, setPairedPosition } = useDisplayStore();

  // BroadcastChannel: announce position, handle incoming messages, heartbeat
  useEffect(() => {
    const ch = getDisplayChannel();

    const handleMessage = (e: MessageEvent) => {
      const { type, appId, title, appProps, position } = e.data ?? {};

      if (type === 'announce') {
        setPairedConnected(true);
        setPairedPosition(position ?? null);
        // Respond so the other tab knows we exist
        sendPong(myPosition);
      }

      if (type === 'ping') {
        setPairedConnected(true);
        setPairedPosition(position ?? null);
        sendPong(myPosition);
      }

      if (type === 'pong') {
        setPairedConnected(true);
        setPairedPosition(position ?? null);
      }

      if (type === 'disconnect') {
        setPairedConnected(false);
        setPairedPosition(null);
      }

      if (type === 'move-window' && appId) {
        setState(s => (s === 'running' ? s : 'running'));
        openWindow(appId as AppID, title ?? appId, appProps);
      }
    };

    ch.addEventListener('message', handleMessage);

    // Let other tabs know we exist and our position
    announcePosition(myPosition);

    // Heartbeat: re-ping every 8s so paired status stays fresh
    const heartbeat = setInterval(() => sendPing(myPosition), 8000);

    const handleUnload = () => sendDisconnect();
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      ch.removeEventListener('message', handleMessage);
      clearInterval(heartbeat);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [myPosition, openWindow, setPairedConnected, setPairedPosition]);

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

  return (
    <div className={darkMode ? 'theme-dark' : 'theme-light'} style={{ width: '100vw', height: '100vh' }}>
      <Desktop onRestart={handleRestart} onShutdown={handleShutdown} onSleep={handleSleep} onLock={() => setState('locked')} />
    </div>
  );
}
