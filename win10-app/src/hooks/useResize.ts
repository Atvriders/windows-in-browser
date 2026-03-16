import { useCallback } from 'react';

interface ResizeOptions {
  onResize: (width: number, height: number, top: number, left: number) => void;
  getBounds: () => { top: number; left: number; width: number; height: number };
  minWidth?: number;
  minHeight?: number;
}

type Direction = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

export function useResize({ onResize, getBounds, minWidth = 280, minHeight = 180 }: ResizeOptions) {
  const onMouseDown = useCallback((e: React.MouseEvent, direction: Direction) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const { top, left, width, height } = getBounds();

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let newTop = top, newLeft = left, newWidth = width, newHeight = height;

      if (direction.includes('e')) newWidth = Math.max(minWidth, width + dx);
      if (direction.includes('w')) { newWidth = Math.max(minWidth, width - dx); newLeft = left + (width - newWidth); }
      if (direction.includes('s')) newHeight = Math.max(minHeight, height + dy);
      if (direction.includes('n')) { newHeight = Math.max(minHeight, height - dy); newTop = top + (height - newHeight); }

      onResize(newWidth, newHeight, newTop, newLeft);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [onResize, getBounds, minWidth, minHeight]);

  return { onMouseDown };
}
