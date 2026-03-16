import { v4 as uuidv4 } from 'uuid';
import type { VirtualFS, FSNode, FSFile, FSDirectory } from '../types/filesystem';

export class FileSystemDriver {
  private fs: VirtualFS;
  private onChange: (fs: VirtualFS) => void;

  constructor(fs: VirtualFS, onChange: (fs: VirtualFS) => void) {
    this.fs = fs;
    this.onChange = onChange;
  }

  update(fs: VirtualFS) { this.fs = fs; }

  private commit(nodes: Record<string, FSNode>) {
    const next = { ...this.fs, nodes };
    this.fs = next;
    this.onChange(next);
  }

  getChildren(dirId: string): FSNode[] {
    return Object.values(this.fs.nodes).filter(n => n.parentId === dirId);
  }

  getNode(id: string): FSNode | undefined {
    return this.fs.nodes[id];
  }

  getPath(nodeId: string): string {
    const parts: string[] = [];
    let current: FSNode | undefined = this.fs.nodes[nodeId];
    while (current && current.parentId !== null) {
      parts.unshift(current.name);
      current = this.fs.nodes[current.parentId];
    }
    return '/' + parts.join('/');
  }

  getNodeByPath(path: string): FSNode | undefined {
    const parts = path.replace(/^\//, '').split('/').filter(Boolean);
    let currentId = this.fs.rootId;
    for (const part of parts) {
      const children = this.getChildren(currentId);
      const found = children.find(c => c.name === part);
      if (!found) return undefined;
      currentId = found.id;
    }
    return this.fs.nodes[currentId];
  }

  createFile(parentId: string, name: string, content = '', mimeType = 'text/plain'): FSFile {
    const now = Date.now();
    const node: FSFile = { id: uuidv4(), name, type: 'file', parentId, createdAt: now, modifiedAt: now, content, mimeType };
    this.commit({ ...this.fs.nodes, [node.id]: node });
    return node;
  }

  createDirectory(parentId: string, name: string): FSDirectory {
    const now = Date.now();
    const node: FSDirectory = { id: uuidv4(), name, type: 'directory', parentId, createdAt: now, modifiedAt: now };
    this.commit({ ...this.fs.nodes, [node.id]: node });
    return node;
  }

  renameNode(id: string, newName: string) {
    const node = this.fs.nodes[id];
    if (!node) return;
    this.commit({ ...this.fs.nodes, [id]: { ...node, name: newName, modifiedAt: Date.now() } });
  }

  deleteNode(id: string) {
    const nodes = { ...this.fs.nodes };
    const toDelete = [id];
    while (toDelete.length) {
      const current = toDelete.pop()!;
      Object.values(nodes).forEach(n => { if (n.parentId === current) toDelete.push(n.id); });
      delete nodes[current];
    }
    this.commit(nodes);
  }

  readFile(id: string): string {
    const node = this.fs.nodes[id];
    if (!node || node.type !== 'file') return '';
    return (node as FSFile).content;
  }

  writeFile(id: string, content: string) {
    const node = this.fs.nodes[id];
    if (!node || node.type !== 'file') return;
    this.commit({ ...this.fs.nodes, [id]: { ...node, content, modifiedAt: Date.now() } as FSFile });
  }
}
