import type { MonitorPosition } from '../store/useDisplayStore';

const CHANNEL_NAME = 'win10-display-bus';

let _ch: BroadcastChannel | null = null;

export function getDisplayChannel(): BroadcastChannel {
  if (!_ch) _ch = new BroadcastChannel(CHANNEL_NAME);
  return _ch;
}

export function sendWindowToMonitor(
  appId: string,
  title: string,
  appProps?: Record<string, unknown>,
) {
  getDisplayChannel().postMessage({ type: 'move-window', appId, title, appProps });
}

export function announcePosition(position: MonitorPosition) {
  getDisplayChannel().postMessage({ type: 'announce', position });
}

export function sendPing(myPosition: MonitorPosition) {
  getDisplayChannel().postMessage({ type: 'ping', position: myPosition });
}

export function sendPong(myPosition: MonitorPosition) {
  getDisplayChannel().postMessage({ type: 'pong', position: myPosition });
}

export function sendDisconnect() {
  getDisplayChannel().postMessage({ type: 'disconnect' });
}
