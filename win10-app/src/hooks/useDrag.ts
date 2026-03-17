import { useCallback } from 'react';

interface DragOptions {
  onMove: (top: number, left: number) => void;
  getPosition: () => { top: number; left: number };
  clampTop?: number;
  clampBottom?: number;
  onDragMove?: (mouseX: number, mouseY: number) => void;
  onDragEnd?: (mouseX: number, mouseY: number) => void;
}

export function useDrag({ onMove, getPosition, clampTop = 0, clampBottom, onDragMove, onDragEnd }: DragOptions) {
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
      onDragMove?.(ev.clientX, ev.clientY);
    };

    const onMouseUp = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      onDragEnd?.(ev.clientX, ev.clientY);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [onMove, getPosition, clampTop, clampBottom, onDragEnd]);

  return { onMouseDown };
}
