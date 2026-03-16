import { useWindowStore } from '../../store/useWindowStore';
import Window from './Window';

export default function WindowManager() {
  const windows = useWindowStore(s => s.windows);
  return (
    <>
      {windows.map((win, i) => (
        <Window key={win.id} win={win} zIndex={100 + i} />
      ))}
    </>
  );
}
