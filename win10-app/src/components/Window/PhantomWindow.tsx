import { useDisplayStore } from '../../store/useDisplayStore';
import './PhantomWindow.css';

const appIcons: Record<string, string> = {
  fileExplorer: '📁', browser: '🌐', notepad: '📝', taskManager: '📊',
  word: '📘', excel: '📗', powerPoint: '📙', outlook: '📧', oneNote: '🗒',
  photoshop: '🖼', illustrator: '✒', premiere: '🎬', afterEffects: '✨',
  autoCAD: '📐', solidWorks: '⚙', steam: '🎮',
  calculator: '🧮', settings: '⚙️', paint: '🎨', spotify: '🎵', discord: '💬',
  vlc: '🎬', windowsStore: '🛒', snippingTool: '✂️', calendar: '📅', maps: '🗺️',
};

export default function PhantomWindow() {
  const { phantomWindow } = useDisplayStore();
  if (!phantomWindow) return null;

  const { overlapPx, winWidth, winHeight, winTop, title, appId, entryEdge } = phantomWindow;
  const vw = window.innerWidth;

  // Position the phantom so exactly `overlapPx` pixels are visible from the entry edge
  const left = entryEdge === 'left'
    ? -(winWidth - overlapPx)          // entering from left: mostly off-screen left
    : vw - overlapPx;                  // entering from right: mostly off-screen right

  // Opacity ramps up from 0.2 to 0.85 as the window slides in
  const opacity = Math.min(0.85, 0.2 + (overlapPx / winWidth) * 0.65);

  return (
    <div
      className="phantom-window"
      style={{
        left,
        top: winTop,
        width: winWidth,
        height: winHeight,
        opacity,
        transition: 'left 0ms, top 0ms, opacity 60ms',
      }}
    >
      <div className="phantom-titlebar">
        <span className="phantom-icon">{appIcons[appId] ?? '🪟'}</span>
        <span className="phantom-title">{title}</span>
      </div>
      <div className="phantom-body" />
    </div>
  );
}
