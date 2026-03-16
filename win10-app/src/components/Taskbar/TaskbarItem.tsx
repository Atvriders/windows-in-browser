import { useWindowStore } from '../../store/useWindowStore';
import type { WindowInstance } from '../../types/window';
import './TaskbarItem.css';

const appIcons: Record<string, string> = {
  fileExplorer: '📁', browser: '🌐', notepad: '📝', settings: '⚙️',
};

interface Props { win: WindowInstance; }

export default function TaskbarItem({ win }: Props) {
  const { restoreWindow, minimizeWindow, focusWindow, windows } = useWindowStore();
  const isFocused = windows[windows.length - 1]?.id === win.id && !win.isMinimized;

  const handleClick = () => {
    if (win.isMinimized) { restoreWindow(win.id); focusWindow(win.id); }
    else if (isFocused) { minimizeWindow(win.id); }
    else { focusWindow(win.id); }
  };

  return (
    <button className={`taskbar-item ${isFocused ? 'active' : ''} ${win.isMinimized ? 'minimized' : ''}`} onClick={handleClick} title={win.title}>
      <span>{appIcons[win.appId]}</span>
      <span className="taskbar-item-title">{win.title}</span>
    </button>
  );
}
