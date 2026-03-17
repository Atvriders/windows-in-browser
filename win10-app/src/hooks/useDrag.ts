import { useCallback } from 'react';

interface DragOptions {
  onMove: (top: number, left: number) => void;
  getPosition: () => { top: number; left: number };
  clampTop?: number;
  clampBottom?: number;
  /** Leftmost allowed position for the window's left edge. Default -200. */
  clampLeft?: number;
  /** Called every mousemove with (mouseX, mouseY, curLeft, curTop) */
  onDragMove?: (mouseX: number, mouseY: number, curLeft: number, curTop: number) => void;
  /** Called on mouseup with (mouseX, mouseY, curLeft, curTop) */
  onDragEnd?: (mouseX: number, mouseY: number, curLeft: number, curTop: number) => void;
}

export function useDrag({
  onMove, getPosition, clampTop = 0, clampBottom, clampLeft = -200, onDragMove, onDragEnd,
}: DragOptions) {
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();

    const { top, left } = getPosition();
    const startX = e.clientX;
    const startY = e.clientY;
    let curLeft = left;
    let curTop  = top;

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let newTop  = top  + dy;
      let newLeft = left + dx;
      if (newTop < clampTop) newTop = clampTop;
      if (clampBottom !== undefined && newTop > clampBottom) newTop = clampBottom;
      if (newLeft < clampLeft) newLeft = clampLeft;
      curLeft = newLeft;
      curTop  = newTop;
      onMove(newTop, newLeft);
      onDragMove?.(ev.clientX, ev.clientY, newLeft, newTop);
    };

    const onMouseUp = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      onDragEnd?.(ev.clientX, ev.clientY, curLeft, curTop);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [onMove, getPosition, clampTop, clampBottom, clampLeft, onDragMove, onDragEnd]);

  return { onMouseDown };
}
