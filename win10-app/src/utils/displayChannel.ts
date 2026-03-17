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

/**
 * Broadcast live drag position while a window is crossing the screen edge.
 * entryEdge = the edge of the RECEIVING tab that the window enters from.
 */
export function sendWindowDragging(
  overlapPx: number,
  winWidth: number,
  winHeight: number,
  winTop: number,
  appId: string,
  title: string,
  appProps: Record<string, unknown> | undefined,
  entryEdge: 'left' | 'right',
) {
  getDisplayChannel().postMessage({
    type: 'window-dragging',
    overlapPx, winWidth, winHeight, winTop,
    appId, title, appProps, entryEdge,
  });
}

export function sendWindowDragCancel() {
  getDisplayChannel().postMessage({ type: 'window-drag-cancel' });
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
