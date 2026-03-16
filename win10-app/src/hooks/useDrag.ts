import { useCallback } from 'react';

interface DragOptions {
  onMove: (top: number, left: number) => void;
  getPosition: () => { top: number; left: number };
  clampTop?: number;
  clampBottom?: number;
}

export function useDrag({ onMove, getPosition, clampTop = 0, clampBottom }: DragOptions) {
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();

    const { top, left } = getPosition();
    const startX = e.clientX;
    const startY = e.clientY;

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let newTop = top + dy;
      let newLeft = left + dx;
      if (newTop < clampTop) newTop = clampTop;
      if (clampBottom !== undefined && newTop > clampBottom) newTop = clampBottom;
      if (newLeft < -200) newLeft = -200;
      onMove(newTop, newLeft);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [onMove, getPosition, clampTop, clampBottom]);

  return { onMouseDown };
}
