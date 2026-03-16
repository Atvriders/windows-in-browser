import { v4 as uuidv4 } from 'uuid';
import type { VirtualFS, FSNode } from '../types/filesystem';

export function buildInitialTree(): VirtualFS {
  const now = Date.now();
  const nodes: Record<string, FSNode> = {};

  const mk = (id: string, name: string, type: 'file' | 'directory', parentId: string | null, extra?: object) => {
    nodes[id] = { id, name, type, parentId, createdAt: now, modifiedAt: now, ...(type === 'file' ? { content: '', mimeType: 'text/plain', ...extra } : extra) } as FSNode;
  };

  const f = (name: string, parentId: string, content = '', mimeType = 'text/plain') => {
    const id = uuidv4();
    mk(id, name, 'file', parentId, { content, mimeType });
    return id;
  };

  const d = (name: string, parentId: string | null) => {
    const id = uuidv4();
    mk(id, name, 'directory', parentId);
    return id;
  };

  const rootId = 'root';
  mk(rootId, 'This PC', 'directory', null);

  // C: drive
  const cDrive = d('C:', rootId);
  const windows = d('Windows', cDrive);
  const system32 = d('System32', windows);
  const sysWow64 = d('SysWOW64', windows);
  const winFonts = d('Fonts', windows);
  const winTemp = d('Temp', windows);
  const winLogs = d('Logs', windows);

  // suppress unused variable warnings
  void winTemp;

  // System32 files
  const sys32files = [
    'ntdll.dll','kernel32.dll','user32.dll','gdi32.dll','advapi32.dll',
    'shell32.dll','ole32.dll','oleaut32.dll','rpcrt4.dll','wininet.dll',
    'msvcrt.dll','comctl32.dll','comdlg32.dll','shlwapi.dll','urlmon.dll',
    'ws2_32.dll','crypt32.dll','secur32.dll','netapi32.dll','winspool.drv',
    'cmd.exe','explorer.exe','notepad.exe','calc.exe','mspaint.exe',
    'taskmgr.exe','regedit.exe','msiexec.exe','services.exe','lsass.exe',
    'svchost.exe','csrss.exe','wininit.exe','winlogon.exe','spoolsv.exe',
    'conhost.exe','dllhost.exe','taskhost.exe','dwm.exe','audiodg.exe',
    'drivers','config','en-US','wbem','WindowsPowerShell',
  ];
  sys32files.forEach(name => {
    if (!name.includes('.')) { d(name, system32); return; }
    const ext = name.split('.').pop()!;
    const mimes: Record<string,string> = { dll: 'application/octet-stream', exe: 'application/x-msdownload', drv: 'application/octet-stream' };
    f(name, system32, '', mimes[ext] ?? 'application/octet-stream');
  });

  // SysWOW64
  ['kernel32.dll','user32.dll','ntdll.dll','msvcrt.dll','wow64.dll','wow64win.dll','wow64cpu.dll'].forEach(name => f(name, sysWow64, '', 'application/octet-stream'));

  // Fonts
  ['arial.ttf','arialbd.ttf','ariali.ttf','calibri.ttf','cambria.ttc','consola.ttf','cour.ttf','segoeui.ttf','times.ttf','verdana.ttf','wingding.ttf'].forEach(name => f(name, winFonts, '', 'font/ttf'));

  // Windows Logs
  const setupLog = d('Setup', winLogs);
  f('setupact.log', setupLog, 'Windows Setup Action Log\nSetup completed successfully.', 'text/plain');
  f('setuperr.log', setupLog, '', 'text/plain');

  // Program Files
  const progFiles = d('Program Files', cDrive);
  const progFilesX86 = d('Program Files (x86)', cDrive);
  const windowsApps = d('WindowsApps', progFiles);
  const commonFiles = d('Common Files', progFiles);

  // suppress unused variable warnings
  void windowsApps;
  void commonFiles;

  const internetExplorer = d('Internet Explorer', progFiles);
  f('iexplore.exe', internetExplorer, '', 'application/x-msdownload');
  const msOffice = d('Microsoft Office', progFiles);
  const office16 = d('Office16', msOffice);
  ['WINWORD.EXE','EXCEL.EXE','POWERPNT.EXE','OUTLOOK.EXE'].forEach(name => f(name, office16, '', 'application/x-msdownload'));

  // Program Files x86
  const googleDir = d('Google', progFilesX86);
  const chromeDir = d('Chrome', googleDir);
  const chromeApp = d('Application', chromeDir);
  f('chrome.exe', chromeApp, '', 'application/x-msdownload');

  // Users
  const usersDir = d('Users', cDrive);
  const publicDir = d('Public', usersDir);
  const publicDocs = d('Public Documents', publicDir);
  const publicDesktop = d('Public Desktop', publicDir);
  const publicDownloads = d('Public Downloads', publicDir);

  // suppress unused variable warnings
  void publicDocs;
  void publicDesktop;
  void publicDownloads;

  const userDir = d('User', usersDir);
  const appData = d('AppData', userDir);
  const roaming = d('Roaming', appData);
  const local = d('Local', appData);
  const localLow = d('LocalLow', appData);

  // suppress unused variable warnings
  void local;
  void localLow;

  const microsoftDir = d('Microsoft', roaming);
  const windowsDir2 = d('Windows', microsoftDir);
  const recentDir = d('Recent', windowsDir2);

  // suppress unused variable warnings
  void recentDir;

  const desktop = d('Desktop', userDir);
  const docs = d('Documents', userDir);
  const downloads = d('Downloads', userDir);
  const pictures = d('Pictures', userDir);
  const music = d('Music', userDir);
  const videos = d('Videos', userDir);

  // suppress unused variable warnings
  void downloads;
  void pictures;
  void music;
  void videos;

  // Desktop files
  f('readme.txt', desktop, 'Welcome to Windows 10!\n\nThis is a web-based clone with a virtual file system.\n\nDouble-click files to open them in Notepad.\nRight-click for context menu options.', 'text/plain');
  f('Getting Started.txt', desktop, 'Getting Started with Windows 10\n================================\n\nTips:\n- Double-click desktop icons to open apps\n- Use the Start menu to find all apps\n- File Explorer lets you browse and manage files\n- Notepad can create and edit text files\n- Task Manager shows system performance\n\nKeyboard Shortcuts:\n- Ctrl+S: Save in Notepad', 'text/plain');

  // Documents
  f('notes.txt', docs, 'My Notes\n========\n\nEdit this file in Notepad.', 'text/plain');
  f('todo.txt', docs, 'TODO List\n=========\n\n[ ] Task 1\n[ ] Task 2\n[ ] Task 3', 'text/plain');

  // Windows pagefile and hiberfil
  f('pagefile.sys', cDrive, '', 'application/octet-stream');
  f('hiberfil.sys', cDrive, '', 'application/octet-stream');
  f('swapfile.sys', cDrive, '', 'application/octet-stream');

  // Boot files
  f('bootmgr', cDrive, '', 'application/octet-stream');
  const bootDir = d('Boot', cDrive);
  f('BCD', bootDir, '', 'application/octet-stream');
  f('bootstat.dat', bootDir, '', 'application/octet-stream');

  // ProgramData
  const progData = d('ProgramData', cDrive);
  const msProgData = d('Microsoft', progData);
  const winProgData = d('Windows', msProgData);
  d('Start Menu', winProgData);
  d('Templates', winProgData);

  return { nodes, rootId };
}
