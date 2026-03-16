export type AppID = 'fileExplorer' | 'browser' | 'notepad' | 'taskManager';

export interface WindowInstance {
  id: string;
  appId: AppID;
  title: string;
  top: number;
  left: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  prevBounds?: { top: number; left: number; width: number; height: number };
  appProps?: Record<string, unknown>;
}
