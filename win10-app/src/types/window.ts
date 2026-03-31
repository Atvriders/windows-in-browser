export type AppID =
  | 'fileExplorer' | 'browser' | 'notepad' | 'taskManager'
  | 'word' | 'excel' | 'powerPoint' | 'outlook' | 'oneNote'
  | 'photoshop' | 'illustrator' | 'premiere' | 'afterEffects'
  | 'autoCAD' | 'solidWorks' | 'steam'
  | 'calculator' | 'settings' | 'paint' | 'spotify' | 'discord'
  | 'vlc' | 'windowsStore' | 'snippingTool' | 'calendar' | 'maps'
  | 'cmd' | 'deviceManager' | 'diskManagement' | 'registryEditor'
  | 'ipScanner' | 'malwarebytes' | 'cpuZ' | 'hwMonitor' | 'ccleaner' | 'wireshark' | 'winDirStat'
  | 'teams' | 'obs' | 'notepadPlusPlus' | 'sevenZip' | 'qbittorrent' | 'crystalDiskInfo' | 'gpuZ' | 'processHacker'
  | 'stickyNotes' | 'clockApp' | 'jellyfin'
  | 'remoteDesktop' | 'putty' | 'devicesAndPrinters' | 'hyperV' | 'windowsTerminal'
  | 'eventViewer' | 'groupPolicy' | 'perfMon' | 'iisManager' | 'winSCP' | 'nmap'
  | 'vmManager' | 'clippy' | 'globe';

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
