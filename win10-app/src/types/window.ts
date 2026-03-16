export type AppID =
  | 'fileExplorer' | 'browser' | 'notepad' | 'taskManager'
  | 'word' | 'excel' | 'powerPoint' | 'outlook' | 'oneNote'
  | 'photoshop' | 'illustrator' | 'premiere' | 'afterEffects'
  | 'autoCAD' | 'solidWorks';

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
