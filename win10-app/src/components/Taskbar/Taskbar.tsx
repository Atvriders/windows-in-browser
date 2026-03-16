import { useWindowStore } from '../../store/useWindowStore';
import { useDesktopStore } from '../../store/useDesktopStore';
import StartButton from './StartButton';
import TaskbarItem from './TaskbarItem';
import SystemTray from './SystemTray';
import './Taskbar.css';

export default function Taskbar() {
  const windows = useWindowStore(s => s.windows);
  const { toggleStartMenu } = useDesktopStore();

  return (
    <div className="taskbar">
      <StartButton onClick={toggleStartMenu} />
      <div className="taskbar-items">
        {windows.map(win => <TaskbarItem key={win.id} win={win} />)}
      </div>
      <SystemTray />
    </div>
  );
}
