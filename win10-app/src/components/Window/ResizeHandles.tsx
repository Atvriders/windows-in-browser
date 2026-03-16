import React from 'react';
import './ResizeHandles.css';

type Direction = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
const dirs: Direction[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

const cursors: Record<Direction, string> = {
  n: 'n-resize', ne: 'ne-resize', e: 'e-resize', se: 'se-resize',
  s: 's-resize', sw: 'sw-resize', w: 'w-resize', nw: 'nw-resize',
};

interface Props { onMouseDown: (e: React.MouseEvent, dir: Direction) => void; }

export default function ResizeHandles({ onMouseDown }: Props) {
  return (
    <>
      {dirs.map(dir => (
        <div
          key={dir}
          className={`resize-handle resize-${dir}`}
          style={{ cursor: cursors[dir] }}
          onMouseDown={e => onMouseDown(e, dir)}
        />
      ))}
    </>
  );
}
