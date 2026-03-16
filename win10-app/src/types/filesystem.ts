export interface FSNodeBase {
  id: string;
  name: string;
  type: 'file' | 'directory';
  parentId: string | null;
  createdAt: number;
  modifiedAt: number;
}

export interface FSFile extends FSNodeBase {
  type: 'file';
  content: string;
  mimeType: string;
}

export interface FSDirectory extends FSNodeBase {
  type: 'directory';
}

export type FSNode = FSFile | FSDirectory;

export interface VirtualFS {
  nodes: Record<string, FSNode>;
  rootId: string;
}
