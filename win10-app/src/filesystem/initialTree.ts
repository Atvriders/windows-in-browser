import { v4 as uuidv4 } from 'uuid';
import type { VirtualFS, FSNode } from '../types/filesystem';

export function buildInitialTree(): VirtualFS {
  const now = Date.now();
  const nodes: Record<string, FSNode> = {};

  const mk = (id: string, name: string, type: 'file' | 'directory', parentId: string | null, extra?: object) => {
    nodes[id] = { id, name, type, parentId, createdAt: now, modifiedAt: now, ...extra } as FSNode;
  };

  const rootId = 'root';
  mk(rootId, 'This PC', 'directory', null);

  const cDrive = uuidv4();
  mk(cDrive, 'C:', 'directory', rootId);

  const users = uuidv4();
  mk(users, 'Users', 'directory', cDrive);

  const userDir = uuidv4();
  mk(userDir, 'User', 'directory', users);

  const desktop = uuidv4();
  mk(desktop, 'Desktop', 'directory', userDir);

  const docs = uuidv4();
  mk(docs, 'Documents', 'directory', userDir);

  const downloads = uuidv4();
  mk(downloads, 'Downloads', 'directory', userDir);

  const progFiles = uuidv4();
  mk(progFiles, 'Program Files', 'directory', cDrive);

  const windows = uuidv4();
  mk(windows, 'Windows', 'directory', cDrive);

  // Sample files
  const readme = uuidv4();
  mk(readme, 'readme.txt', 'file', desktop, {
    content: 'Welcome to Windows 10!\n\nThis is a web-based clone with a virtual file system.\n\nDouble-click files to open them in Notepad.',
    mimeType: 'text/plain',
  });

  const notes = uuidv4();
  mk(notes, 'notes.txt', 'file', docs, {
    content: 'My notes...\n\nEdit this file in Notepad.',
    mimeType: 'text/plain',
  });

  return { nodes, rootId };
}
