import { v4 as uuidv4 } from 'uuid';
import type { VirtualFS, FSNode } from '../types/filesystem';

export function buildInitialTree(): VirtualFS {
  const now = Date.now();
  const nodes: Record<string, FSNode> = {};

  const mk = (id: string, name: string, type: 'file' | 'directory', parentId: string | null, extra?: object) => {
    nodes[id] = { id, name, type, parentId, createdAt: now, modifiedAt: now, ...(type === 'file' ? { content: '', mimeType: 'text/plain', ...extra } : extra) } as FSNode;
  };
  const f = (name: string, parentId: string, content = '', mimeType = 'text/plain') => {
    const id = uuidv4(); mk(id, name, 'file', parentId, { content, mimeType }); return id;
  };
  const d = (name: string, parentId: string | null) => {
    const id = uuidv4(); mk(id, name, 'directory', parentId); return id;
  };

  const rootId = 'root';
  mk(rootId, 'This PC', 'directory', null);

  const cDrive = d('C:', rootId);

  // Boot
  f('pagefile.sys', cDrive, '', 'application/octet-stream');
  f('hiberfil.sys', cDrive, '', 'application/octet-stream');
  f('swapfile.sys', cDrive, '', 'application/octet-stream');
  f('bootmgr', cDrive, '', 'application/octet-stream');
  const bootDir = d('Boot', cDrive);
  f('BCD', bootDir, '', 'application/octet-stream');
  f('bootstat.dat', bootDir, '', 'application/octet-stream');

  // Windows
  const winDir = d('Windows', cDrive);
  const system32 = d('System32', winDir);
  const sysWow64 = d('SysWOW64', winDir);
  const winFonts = d('Fonts', winDir);
  d('Temp', winDir); d('inf', winDir); d('Help', winDir); d('Cursors', winDir); d('Media', winDir);

  const sys32dlls = [
    'ntdll.dll','kernel32.dll','user32.dll','gdi32.dll','advapi32.dll','shell32.dll',
    'ole32.dll','oleaut32.dll','rpcrt4.dll','wininet.dll','msvcrt.dll','comctl32.dll',
    'comdlg32.dll','shlwapi.dll','urlmon.dll','ws2_32.dll','crypt32.dll','secur32.dll',
    'netapi32.dll','winspool.drv','msvcp140.dll','vcruntime140.dll','ucrtbase.dll',
    'ntoskrnl.exe','hal.dll','win32k.sys','ci.dll','clfs.sys','fltMgr.sys',
    'd3d11.dll','dxgi.dll','d2d1.dll','dwrite.dll','windowscodecs.dll','wintrust.dll',
    'setupapi.dll','cfgmgr32.dll','devobj.dll','umpnpmgr.dll',
  ];
  const sys32exes = [
    'cmd.exe','explorer.exe','notepad.exe','calc.exe','mspaint.exe','taskmgr.exe',
    'regedit.exe','msiexec.exe','services.exe','lsass.exe','svchost.exe','csrss.exe',
    'wininit.exe','winlogon.exe','spoolsv.exe','conhost.exe','dllhost.exe','dwm.exe',
    'audiodg.exe','SearchIndexer.exe','RuntimeBroker.exe','ShellExperienceHost.exe',
    'fontdrvhost.exe','sihost.exe','taskhostw.exe','smartscreen.exe',
  ];
  [...sys32dlls, ...sys32exes].forEach(name => {
    const ext = name.split('.').pop()!;
    const mimes: Record<string,string> = { dll:'application/octet-stream', exe:'application/x-msdownload', sys:'application/octet-stream', drv:'application/octet-stream' };
    f(name, system32, '', mimes[ext] ?? 'application/octet-stream');
  });
  d('drivers', system32); d('config', system32); d('en-US', system32); d('wbem', system32); d('WindowsPowerShell', system32);

  // System32 Control Panel applets and tools
  const sys32cpls = [
    'appwiz.cpl','desk.cpl','firewall.cpl','hdwwiz.cpl','inetcpl.cpl','intl.cpl',
    'joy.cpl','main.cpl','mmsys.cpl','ncpa.cpl','powercfg.cpl','sysdm.cpl',
    'telephon.cpl','timedate.cpl','wscui.cpl',
  ];
  const sys32tools = [
    'mmc.exe','msconfig.exe','msinfo32.exe','perfmon.exe','resmon.exe','eventvwr.exe',
    'devmgmt.msc','diskmgmt.msc','services.msc','gpedit.msc','compmgmt.msc',
    'taskschd.msc','secpol.msc','certmgr.msc','lusrmgr.msc','fsmgmt.msc',
    'magnify.exe','narrator.exe','osk.exe','utilman.exe','sndvol.exe',
    'charmap.exe','dfrgui.exe','diskpart.exe','dxdiag.exe','msdt.exe',
    'mstsc.exe','netstat.exe','ping.exe','ipconfig.exe','tracert.exe',
    'nslookup.exe','pathping.exe','route.exe','arp.exe','netsh.exe',
    'wevtutil.exe','wmic.exe','powershell.exe','powershell_ise.exe',
    'where.exe','whoami.exe','xcopy.exe','robocopy.exe','icacls.exe',
    'sc.exe','net.exe','reg.exe','regsvr32.exe','rundll32.exe',
    'msiexec.exe','wusa.exe','expand.exe','makecab.exe','bcdedit.exe',
    'bootrec.exe','bcdboot.exe','sfc.exe','dism.exe','chkdsk.exe',
    'cleanmgr.exe','compact.exe','attrib.exe','cipher.exe','fsutil.exe',
  ];
  [...sys32cpls, ...sys32tools].forEach(name => {
    const ext = name.split('.').pop()!;
    const mimes: Record<string,string> = { cpl:'application/x-msdownload', exe:'application/x-msdownload', msc:'application/octet-stream' };
    f(name, system32, '', mimes[ext] ?? 'application/octet-stream');
  });

  ['kernel32.dll','user32.dll','ntdll.dll','msvcrt.dll','wow64.dll','wow64win.dll','wow64cpu.dll','msvcp140.dll','vcruntime140.dll'].forEach(n => f(n, sysWow64, '', 'application/octet-stream'));
  ['arial.ttf','arialbd.ttf','calibri.ttf','cambria.ttc','consola.ttf','cour.ttf','segoeui.ttf','segoeuib.ttf','times.ttf','verdana.ttf','wingding.ttf','tahoma.ttf','georgia.ttf'].forEach(n => f(n, winFonts, '', 'font/ttf'));

  const winLogs = d('Logs', winDir);
  const setupLog = d('Setup', winLogs);
  f('setupact.log', setupLog, 'Windows Setup Action Log\n[2024-01-15 09:22:41] Setup started\n[2024-01-15 09:45:22] Setup completed successfully.', 'text/plain');
  f('setuperr.log', setupLog, '', 'text/plain');
  const cbsLog = d('CBS', winLogs);
  f('CBS.log', cbsLog, '[2024-01-15 10:00:01] Component-based servicing started.\n[2024-01-15 10:00:03] Verify complete.\n', 'text/plain');

  // Program Files
  const progFiles = d('Program Files', cDrive);
  const progFilesX86 = d('Program Files (x86)', cDrive);

  const msOffice = d('Microsoft Office', progFiles);
  const office16 = d('Office16', msOffice);
  ['WINWORD.EXE','EXCEL.EXE','POWERPNT.EXE','OUTLOOK.EXE','ONENOTE.EXE','MSACCESS.EXE','MSPUB.EXE'].forEach(n => f(n, office16, '', 'application/x-msdownload'));

  const adobe = d('Adobe', progFiles);
  const psDir = d('Adobe Photoshop 2024', adobe); f('Photoshop.exe', psDir, '', 'application/x-msdownload');
  const aiDir = d('Adobe Illustrator 2024', adobe); f('Illustrator.exe', aiDir, '', 'application/x-msdownload');
  const prDir = d('Adobe Premiere Pro 2024', adobe); f('Adobe Premiere Pro.exe', prDir, '', 'application/x-msdownload');
  const aeDir = d('Adobe After Effects 2024', adobe); f('AfterFX.exe', aeDir, '', 'application/x-msdownload');
  const xdDir = d('Adobe XD', adobe); f('Adobe XD.exe', xdDir, '', 'application/x-msdownload');
  const accDir = d('Adobe Acrobat DC', adobe); f('Acrobat.exe', accDir, '', 'application/x-msdownload');
  const ccDir = d('Adobe Creative Cloud', adobe); f('Creative Cloud.exe', ccDir, '', 'application/x-msdownload');

  const autodesk = d('Autodesk', progFilesX86);
  const autocadDir = d('AutoCAD 2024', autodesk); f('acad.exe', autocadDir, '', 'application/x-msdownload');
  const swCorp = d('SolidWorks Corp', progFiles);
  const swDir = d('SOLIDWORKS 2024', swCorp); f('SLDWORKS.exe', swDir, '', 'application/x-msdownload');

  const googDir = d('Google', progFilesX86);
  const chromeDir = d('Chrome', googDir); const chromeApp = d('Application', chromeDir);
  f('chrome.exe', chromeApp, '', 'application/x-msdownload');
  const vlcDir = d('VideoLAN', progFilesX86); const vlc = d('VLC', vlcDir); f('vlc.exe', vlc, '', 'application/x-msdownload');
  const vsDir = d('Microsoft VS Code', progFiles); f('Code.exe', vsDir, '', 'application/x-msdownload');
  const spotifyDir = d('Spotify', progFilesX86); f('Spotify.exe', spotifyDir, '', 'application/x-msdownload');
  const discordDir = d('Discord', progFilesX86); f('Discord.exe', discordDir, '', 'application/x-msdownload');
  const steamDir = d('Steam', progFilesX86);
  f('steam.exe', steamDir, '', 'application/x-msdownload');
  const steamApps = d('steamapps', steamDir);
  const common = d('common', steamApps);
  // All installed Steam games
  ['Counter-Strike 2','Cyberpunk 2077','Minecraft','Elden Ring','Baldur\'s Gate 3',
   'Hogwarts Legacy','Hades','Terraria','Stardew Valley','Hollow Knight',
   'Deep Rock Galactic','Valheim','Rust','Destiny 2','Dead by Daylight',
   'Phasmophobia','Subnautica','Satisfactory','Factorio','Rocket League',
   'Celeste','Cuphead','Dead Cells','Slay the Spire','Dark Souls III',
   'Sekiro','Monster Hunter World','Monster Hunter Rise','Resident Evil 2',
   'Resident Evil 4','God of War','Spider-Man Remastered','Ghost of Tsushima',
   'NieR Automata','Persona 5 Royal','Persona 3 Reload','Final Fantasy XIV',
   'XCOM 2','Civilization VI','Stellaris','Crusader Kings 3','Age of Empires IV',
   'Total War Warhammer 3','Halo Infinite','Doom Eternal','Half-Life 2','Portal 2',
   'Outer Wilds','Vampire Survivors','Balatro','Diablo IV','Last Epoch',
   'Helldivers 2','Hunt Showdown','V Rising','Project Zomboid','RimWorld',
   'Oxygen Not Included','Palworld','Enshrouded','Frostpunk 2','Hi-Fi Rush',
   'Sifu','Tekken 8','Kena Bridge of Spirits','Ultrakill','Stray',
   'Rogue Legacy 2','A Hat in Time','Nine Sols','Momodora Moonlit Farewell',
   'Hades II','Star Wars Jedi Survivor','Dragon\'s Dogma 2','Like a Dragon Infinite Wealth',
   'Final Fantasy VII Rebirth','Space Marine 2','The Finals','Remnant 2',
   'Fortnite','Apex Legends','PUBG Battlegrounds','Fall Guys','PAYDAY 3',
   'Darktide','Animal Well','The Talos Principle 2','Dragon Ball FighterZ',
   'Guilty Gear Strive','PowerWash Simulator','Cities Skylines','Anno 1800',
   'Frostpunk 2','Northgard','Songs of Conquest'].forEach(name => d(name, common));

  // Other installed apps in Program Files
  const teamsDir = d('Microsoft Teams', progFiles); f('Teams.exe', teamsDir, '', 'application/x-msdownload');
  const obsDir = d('obs-studio', progFiles); f('obs64.exe', d('bin', d('64bit', obsDir)), '', 'application/x-msdownload');
  const nppDir = d('Notepad++', progFilesX86); f('notepad++.exe', nppDir, '', 'application/x-msdownload');
  const zipDir = d('7-Zip', progFilesX86); f('7zFM.exe', zipDir, '', 'application/x-msdownload');
  const qbtDir = d('qBittorrent', progFiles); f('qbittorrent.exe', qbtDir, '', 'application/x-msdownload');
  const cdiDir = d('CrystalDiskInfo8_ALT', progFiles); f('DiskInfo64.exe', cdiDir, '', 'application/x-msdownload');
  const gpuzDir = d('GPU-Z', progFiles); f('GPU-Z.exe', gpuzDir, '', 'application/x-msdownload');
  const phDir = d('Process Hacker 2', progFiles); f('ProcessHacker.exe', phDir, '', 'application/x-msdownload');
  const ccDir2 = d('CCleaner', progFilesX86); f('CCleaner64.exe', ccDir2, '', 'application/x-msdownload');
  const mbDir = d('Malwarebytes', progFilesX86); f('MBAMService.exe', mbDir, '', 'application/x-msdownload');
  const wsDir = d('Wireshark', progFiles); f('Wireshark.exe', wsDir, '', 'application/x-msdownload');
  const wdsDir = d('WinDirStat', progFiles); f('windirstat.exe', wdsDir, '', 'application/x-msdownload');

  // ─── D: Drive (Games SSD 1 — 2TB Samsung 990 Pro) ───
  const dDrive = d('D:', rootId);
  f('disk_label.txt', dDrive, 'Games SSD — Samsung 990 Pro 2TB\nSerial: S6BPNS0T123456\nHealth: Good', 'text/plain');
  const dGames = d('Games', dDrive);
  ['Red Dead Redemption 2','GTA V','The Witcher 3','Cyberpunk 2077 DLC',
   'Fallout 4','Skyrim Special Edition','Mass Effect Legendary Edition',
   'Assassin\'s Creed Odyssey','Assassin\'s Creed Valhalla','Watch Dogs Legion',
   'Far Cry 6','Ghost Recon Breakpoint','Rainbow Six Siege','For Honor',
   'Starfield','Dragon Age Inquisition','The Division 2','Anthem'].forEach(g => d(g, dGames));
  const dDownloads = d('Downloads', dDrive);
  ['ubuntu-22.04.3-desktop-amd64.iso','debian-12.2.0-amd64-netinst.iso',
   'windows11_22H2_en-US_x64.iso','kali-linux-2024.1-installer-amd64.iso'].forEach(n => f(n, dDownloads, '', 'application/x-iso9660-image'));
  const dBackups = d('Backups', dDrive);
  f('system_backup_2025-03-01.zip', dBackups, '', 'application/zip');
  f('photos_backup_2024.zip', dBackups, '', 'application/zip');
  f('documents_backup_jan2025.zip', dBackups, '', 'application/zip');

  // ─── E: Drive (Games SSD 2 — 2TB WD Black SN850X) ───
  const eDrive = d('E:', rootId);
  f('disk_label.txt', eDrive, 'Games SSD 2 — WD Black SN850X 2TB\nSerial: WD-WX42A8123456\nHealth: Good', 'text/plain');
  const eGames = d('Games', eDrive);
  ['Ark Survival Evolved','No Man\'s Sky','DayZ','Escape from Tarkov',
   'Battlefield 2042','Battlefield V','Battlefield 1','Squad','Arma 3',
   'Warframe','Path of Exile','World of Warcraft','Final Fantasy XIV Online',
   'Black Desert Online','Lost Ark','Elder Scrolls Online',
   'Monster Hunter World Iceborne','Monster Hunter Rise Sunbreak',
   'Total War Three Kingdoms','Hearts of Iron IV','Europa Universalis IV',
   'Crusader Kings 2','Victoria 2','Stellaris DLC Collection'].forEach(g => d(g, eGames));
  const eMedia = d('Media', eDrive);
  const eMovies = d('Movies', eMedia);
  ['Inception (2010)','Interstellar (2014)','The Dark Knight (2008)',
   'Oppenheimer (2023)','Dune (2021)','Dune Part Two (2024)',
   'Everything Everywhere All at Once (2022)','Parasite (2019)'].forEach(m => d(m, eMovies));
  const eTV = d('TV Shows', eMedia);
  ['Breaking Bad (Complete)','The Wire (Complete)','Dark (Seasons 1-3)',
   'The Bear (Seasons 1-2)','Succession (Complete)','Chernobyl'].forEach(s => d(s, eTV));

  // ─── F: Drive (Storage HDD — 8TB Seagate Barracuda) ───
  const fDrive = d('F:', rootId);
  f('disk_label.txt', fDrive, 'Storage HDD — Seagate Barracuda 8TB\nSerial: ZA1E4B2M\nHealth: Good', 'text/plain');
  const fArchive = d('Archive', fDrive);
  const fProjects = d('Old Projects', fArchive);
  ['Project_2021_Website','Project_2022_MobileApp','Project_2023_API','Project_2024_Dashboard'].forEach(p => d(p, fProjects));
  const fRecordings = d('OBS Recordings', fDrive);
  f('recordings_log.txt', fRecordings, 'OBS Recording Log\n\n2025-03-10 - CS2 ranked session (4 hrs)\n2025-03-08 - Minecraft build timelapse (2 hrs)\n2025-03-05 - Elden Ring DLC run (6 hrs)\n2025-02-28 - Stream highlights compilation', 'text/plain');
  const fVMs = d('Virtual Machines', fDrive);
  ['Ubuntu 22.04','Windows 10 LTSC','Kali Linux','macOS Sonoma (Hackintosh)'].forEach(vm => d(vm, fVMs));

  // ─── G: Drive (Game Mods SSD — 1TB Crucial P5 Plus) ───
  const gDrive = d('G:', rootId);
  f('disk_label.txt', gDrive, 'Mods & Tools SSD — Crucial P5 Plus 1TB\nSerial: 2342E4ABCDEF\nHealth: Good', 'text/plain');
  const gMods = d('Mods', gDrive);
  const skMods = d('Skyrim SE Mods', gMods);
  ['SKSE64','SkyUI','ENB Series','Alternate Start','Immersive Armors',
   'Immersive Weapons','Ordinator Perks','Apocalypse Magic','Populated Cities',
   '4K Textures Pack','Realistic Water Two','A Quality World Map','Frostfall'].forEach(m => d(m, skMods));
  const mc4Mods = d('Minecraft Mods', gMods);
  ['Forge 1.20.1','Optifine','JourneyMap','Tinkers Construct','Applied Energistics 2',
   'Create Mod','Thermal Expansion','Biomes O Plenty','Alex Mobs','Supplementaries'].forEach(m => d(m, mc4Mods));
  const gTools = d('Dev Tools', gDrive);
  ['Android Studio 2024','IntelliJ IDEA Ultimate','Visual Studio 2022',
   'Docker Desktop','Postman','DBeaver','TablePlus','Insomnia'].forEach(t => d(t, gTools));
  const gISOs = d('OS ISOs', gDrive);
  f('iso_list.txt', gISOs, 'ISO Collection:\n- Ubuntu 22.04 LTS Desktop\n- Windows 11 22H2\n- Kali Linux 2024\n- Debian 12\n- Fedora 39', 'text/plain');

  // ─── N: Drive (NAS-Media — 96TB Synology DS1823xs+) ───
  const nDrive = d('N:', rootId);
  f('disk_label.txt', nDrive, 'NAS-Media — Synology DS1823xs+\n96TB raw / 8-bay RAID6\nIP: 192.168.1.200', 'text/plain');

  const nMovies4K = d('Movies 4K', nDrive);
  ['2001 A Space Odyssey (1968)', 'Alien (1979)', 'Aliens (1986)', 'Apocalypse Now (1979)',
   'Blade Runner 2049 (2017)', 'Children of Men (2006)', 'Dune (2021)', 'Dune Part Two (2024)',
   'Everything Everywhere All at Once (2022)', 'Fight Club (1999)', 'Goodfellas (1990)',
   'Inception (2010)', 'Interstellar (2014)', 'Mad Max Fury Road (2015)',
   'No Country for Old Men (2007)', 'Oppenheimer (2023)', 'Parasite (2019)',
   'Pulp Fiction (1994)', 'Schindlers List (1993)', 'Spirited Away (2001)',
   'The Dark Knight (2008)', 'The Godfather (1972)', 'The Godfather Part II (1974)',
   'The Grand Budapest Hotel (2014)', 'The Matrix (1999)', 'The Shawshank Redemption (1994)',
   'There Will Be Blood (2007)', 'Heat (1995)', 'Annihilation (2018)',
   'Arrival (2016)', 'Hereditary (2018)', 'Midsommar (2019)', 'Mulholland Drive (2001)',
   'Eyes Wide Shut (1999)', 'Barry Lyndon (1975)', 'Full Metal Jacket (1987)',
   'The Shining (1980)', 'A Clockwork Orange (1971)', 'Stalker (1979)',
   'Solaris (1972)', 'Andrei Rublev (1966)', 'Ran (1985)', 'Seven Samurai (1954)',
   'Rashomon (1950)', 'Tokyo Story (1953)', 'Bicycle Thieves (1948)',
   'City of God (2002)', 'Pan\'s Labyrinth (2006)', '12 Angry Men (1957)',
   'Sunset Boulevard (1950)', 'Chinatown (1974)'].forEach(m => {
    const mDir = d(m, nMovies4K);
    const base = m.replace(/\s*\(\d{4}\)/, '').replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '.');
    f(`${base}.2160p.UHD.BluRay.x265.10bit.HDR.mkv`, mDir, '', 'video/x-matroska');
    f(`${base}.en.srt`, mDir, '', 'text/plain');
  });

  const nMoviesHD = d('Movies HD 1080p', nDrive);
  ['Almost Famous (2000)', 'American Beauty (1999)', 'American History X (1998)',
   'A Beautiful Mind (2001)', 'Brokeback Mountain (2005)', 'Cast Away (2000)',
   'Catch Me If You Can (2002)', 'District 9 (2009)', 'Eternal Sunshine (2004)',
   'Gladiator (2000)', 'Her (2013)', 'Into the Wild (2007)', 'Joker (2019)',
   'Kill Bill Vol 1 (2003)', 'Kill Bill Vol 2 (2004)', 'Lost in Translation (2003)',
   'Memento (2000)', 'Moon (2009)', 'Nightcrawler (2014)', 'Prisoners (2013)',
   'Requiem for a Dream (2000)', 'Sicario (2015)', 'Snatch (2000)',
   'Social Network (2010)', 'Superbad (2007)', 'Taxi Driver (1976)',
   'The Big Lebowski (1998)', 'The Departed (2006)', 'Training Day (2001)',
   'Uncut Gems (2019)', 'Zodiac (2007)', 'Gone Girl (2014)', 'Whiplash (2014)',
   'Ex Machina (2014)', 'Black Swan (2010)', 'Birdman (2014)', 'Spotlight (2015)',
   'The Revenant (2015)', '12 Years a Slave (2013)'].forEach(m => {
    const mDir = d(m, nMoviesHD);
    const base = m.replace(/\s*\(\d{4}\)/, '').trim().replace(/\s+/g, '.');
    f(`${base}.1080p.BluRay.x264.mkv`, mDir, '', 'video/x-matroska');
  });

  const nTV4K = d('TV Shows 4K', nDrive);
  ['Band of Brothers (2001)', 'Chernobyl (2019)', 'Game of Thrones S01-S08',
   'House of the Dragon S01-S02', 'Severance S01-S02', 'The Bear S01-S03',
   'The Last of Us S01-S02', 'The White Lotus S01-S03', 'True Detective S01-S04',
   'Twin Peaks The Return (2017)', 'Andor S01', 'Shogun (2024)', 'Fallout S01',
   'Silo S01-S02', 'The Boys S01-S04', 'Succession S01-S04',
   'Barry S01-S04', 'Better Call Saul S01-S06', 'Breaking Bad S01-S05'].forEach(s => {
    d(s, nTV4K);
  });

  const nTVHD = d('TV Shows HD', nDrive);
  ['The Wire S01-S05', 'The Sopranos S01-S06', 'Deadwood S01-S03',
   'Carnivale S01-S02', 'Oz S01-S06', 'Six Feet Under S01-S05',
   'Rome S01-S02', 'Boardwalk Empire S01-S05', 'Justified S01-S06',
   'Fargo S01-S05', 'Mindhunter S01-S02', 'Dark S01-S03',
   'Babylon Berlin S01-S04', 'Dark S01-S03', '1899 S01', 'Peaky Blinders S01-S06',
   'Black Mirror S01-S07', 'Years and Years S01', 'Fleabag S01-S02',
   'Atlanta S01-S04', 'Euphoria S01-S02', 'Yellowjackets S01-S03'].forEach(s => {
    d(s, nTVHD);
  });

  const nMusicFLAC = d('Music FLAC', nDrive);
  const nFlacArtists = [
    ['Pink Floyd', ['The Dark Side of the Moon (1973)', 'Wish You Were Here (1975)', 'Animals (1977)', 'The Wall (1979)', 'Meddle (1971)']],
    ['Radiohead', ['Pablo Honey (1993)', 'The Bends (1995)', 'OK Computer (1997)', 'Kid A (2000)', 'Amnesiac (2001)', 'Hail to the Thief (2003)', 'In Rainbows (2007)', 'The King of Limbs (2011)', 'A Moon Shaped Pool (2016)']],
    ['The Beatles', ['Please Please Me (1963)', 'With the Beatles (1963)', 'A Hard Days Night (1964)', 'Beatles for Sale (1964)', 'Help! (1965)', 'Rubber Soul (1965)', 'Revolver (1966)', 'Sgt Peppers (1967)', 'Magical Mystery Tour (1967)', 'The White Album (1968)', 'Abbey Road (1969)', 'Let It Be (1970)']],
    ['Led Zeppelin', ['Led Zeppelin I (1969)', 'Led Zeppelin II (1969)', 'Led Zeppelin III (1970)', 'Led Zeppelin IV (1971)', 'Physical Graffiti (1975)', 'Presence (1976)', 'In Through the Out Door (1979)']],
    ['David Bowie', ['Space Oddity (1969)', 'Hunky Dory (1971)', 'Ziggy Stardust (1972)', 'Aladdin Sane (1973)', 'Diamond Dogs (1974)', 'Young Americans (1975)', 'Station to Station (1976)', 'Low (1977)', 'Heroes (1977)', 'Scary Monsters (1980)', 'Lets Dance (1983)', 'Blackstar (2016)']],
    ['Aphex Twin', ['Selected Ambient Works Vol I (1992)', 'Selected Ambient Works Vol II (1994)', 'Richard D James Album (1996)', 'Drukqs (2001)', 'Syro (2014)']],
    ['Daft Punk', ['Homework (1997)', 'Discovery (2001)', 'Human After All (2005)', 'Random Access Memories (2013)']],
    ['Boards of Canada', ['Music Has the Right to Children (1998)', 'Geogaddi (2002)', 'The Campfire Headphase (2005)', 'Tomorrow\'s Harvest (2013)']],
    ['Miles Davis', ['Kind of Blue (1959)', 'Sketches of Spain (1960)', 'Bitches Brew (1970)', 'In a Silent Way (1969)']],
    ['John Coltrane', ['A Love Supreme (1965)', 'Giant Steps (1960)', 'My Favorite Things (1961)', 'Ballads (1963)']],
    ['Nick Cave and the Bad Seeds', ['The Boatmans Call (1997)', 'Murder Ballads (1996)', 'Skeleton Tree (2016)', 'Ghosteen (2019)']],
    ['Tame Impala', ['Innerspeaker (2010)', 'Lonerism (2012)', 'Currents (2015)', 'The Slow Rush (2020)']],
  ] as [string, string[]][];
  nFlacArtists.forEach(([artist, albums]) => {
    const artistDir = d(artist, nMusicFLAC);
    albums.forEach(album => {
      const albumDir = d(album, artistDir);
      f('cover.jpg', albumDir, '', 'image/jpeg');
      for (let i = 1; i <= 10; i++) {
        f(`${String(i).padStart(2,'0')} - Track ${i}.flac`, albumDir, '', 'audio/flac');
      }
    });
  });

  const nAudiobooks = d('Audiobooks', nDrive);
  [['Fiction', ['Project Hail Mary - Andy Weir', 'The Three-Body Problem - Liu Cixin', 'Dune - Frank Herbert', 'Enders Game - Orson Scott Card', 'American Gods - Neil Gaiman', 'The Name of the Wind - Patrick Rothfuss', 'Mistborn - Brandon Sanderson', 'The Way of Kings - Brandon Sanderson']],
   ['Non-Fiction', ['Sapiens - Yuval Noah Harari', 'A Brief History of Time - Stephen Hawking', 'Thinking Fast and Slow - Daniel Kahneman', 'The Selfish Gene - Richard Dawkins', 'Godel Escher Bach - Douglas Hofstadter', 'The Art of War - Sun Tzu', 'Meditations - Marcus Aurelius']],
   ['Self Help', ['Atomic Habits - James Clear', 'Deep Work - Cal Newport', 'The Pragmatic Programmer', 'Clean Code - Robert C Martin', 'Zero to One - Peter Thiel']],
  ].forEach(([genre, books]) => {
    const genreDir = d(genre as string, nAudiobooks);
    (books as string[]).forEach(book => {
      const bookDir = d(book, genreDir);
      f(`${book}.m4b`, bookDir, '', 'audio/mp4');
      f('cover.jpg', bookDir, '', 'image/jpeg');
      f('info.txt', bookDir, `Audiobook: ${book}\nFormat: M4B AAC 128kbps\nChapters: included`, 'text/plain');
    });
  });

  const nPodcasts = d('Podcasts', nDrive);
  [['Lex Fridman Podcast', 320], ['Hardcore History - Dan Carlin', 72], ['Darknet Diaries', 145],
   ['The Joe Rogan Experience', 2100], ['99% Invisible', 520], ['Radiolab', 280],
   ['This American Life', 800], ['Serial', 52], ['Software Engineering Daily', 1200],
   ['Huberman Lab', 180]].forEach(([name, count]) => {
    const podDir = d(name as string, nPodcasts);
    f('episodes.txt', podDir, `${name}\nEpisodes archived: ${count}\nFormat: MP3 128kbps`, 'text/plain');
  });

  // ─── P: Drive (NAS-Personal — 72TB Synology DS1621+) ───
  const pDrive = d('P:', rootId);
  f('disk_label.txt', pDrive, 'NAS-Personal — Synology DS1621+\n72TB raw / 6-bay RAID6\nIP: 192.168.1.201', 'text/plain');

  const pHomeVideos = d('Home Videos', pDrive);
  [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024].forEach(year => {
    const yearDir = d(String(year), pHomeVideos);
    const events: Record<number, string[]> = {
      2010: ['Christmas Morning', 'Summer BBQ', 'Road Trip to Mountains'],
      2011: ['New Years Party', 'Birthday Party', 'Beach Week July'],
      2012: ['Disney World Trip', 'Thanksgiving', 'Halloween Costumes'],
      2013: ['Graduation Ceremony', 'New Apartment Move In', 'Christmas'],
      2014: ['Europe Vacation - Italy', 'Wedding - Jake and Emily', 'New Years Eve'],
      2015: ['Japan Trip May', 'Summer Family Reunion', 'First Apartment Tour'],
      2016: ['Road Trip Pacific Coast Hwy', 'Thanksgiving Cooking', 'Christmas Morning'],
      2017: ['New Years Tokyo', 'Spring Hiking Trip', 'Summer Pool Days', 'Halloween'],
      2018: ['Iceland February', 'Camping Olympic Nat Park', 'Christmas Eve'],
      2019: ['New Years Party NYC', 'Backpacking SE Asia', 'Home Garden Project'],
      2020: ['Lockdown Cooking Experiments', 'Backyard Campfire Nights', 'Christmas Zoom Call'],
      2021: ['Road Trip National Parks', 'First Vaccine Day', 'Summer Reopening Celebration'],
      2022: ['Scotland Hiking', 'New Kitchen Renovation', 'Friendsgiving'],
      2023: ['Portugal Road Trip', 'New Dog - Penny First Week', 'Christmas Morning'],
      2024: ['Japan Cherry Blossom Season', 'Summer Music Festival', 'Penny - 1 Year Birthday'],
    };
    (events[year] || [`${year} Misc Clips`]).forEach((event, i) => {
      const eventDir = d(event, yearDir);
      f(`${year}_${String(i+1).padStart(2,'0')}_${event.replace(/\s+/g,'_')}.mp4`, eventDir, '', 'video/mp4');
      f('thumbnail.jpg', eventDir, '', 'image/jpeg');
    });
  });

  const pPhotos = d('Photos', pDrive);
  const photoYears = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
  photoYears.forEach(year => {
    const pyDir = d(String(year), pPhotos);
    ['January','March','June','August','October','December'].forEach(month => {
      const monthDir = d(`${month} ${year}`, pyDir);
      for (let i = 1; i <= 30; i++) {
        f(`IMG_${year}${String(i*3).padStart(4,'0')}.jpg`, monthDir, '', 'image/jpeg');
      }
    });
  });

  const pBooks = d('Books', pDrive);
  [['Computer Science', ['The Art of Computer Programming Vol 1-4 - Knuth', 'Structure and Interpretation of Computer Programs', 'Introduction to Algorithms - CLRS', 'Designing Data-Intensive Applications - Kleppmann', 'The Pragmatic Programmer', 'Clean Architecture - Robert C Martin', 'Software Engineering at Google', 'A Philosophy of Software Design', 'Computer Networks - Tanenbaum', 'Operating System Concepts - Silberschatz']],
   ['Science', ['A Brief History of Time - Hawking', 'The Selfish Gene - Dawkins', 'The Double Helix - Watson', 'The Feynman Lectures on Physics', 'What is Life - Schrodinger', 'The Elegant Universe - Greene', 'Cosmos - Carl Sagan', 'Pale Blue Dot - Sagan', 'The Order of Time - Rovelli']],
   ['History', ['Sapiens - Harari', 'Guns Germs and Steel - Diamond', 'The Rise and Fall of the Third Reich - Shirer', 'The Gulag Archipelago - Solzhenitsyn', 'The Power Broker - Caro', 'Longitude - Sobel', 'A Peoples History of the United States - Zinn']],
   ['Fiction', ['The Complete Works of Dostoevsky', 'Collected Works of Kafka', 'Infinite Jest - Wallace', 'Blood Meridian - McCarthy', 'Gravity\'s Rainbow - Pynchon', '2666 - Bolano', 'The Magic Mountain - Mann', 'In Search of Lost Time - Proust']],
   ['Philosophy', ['Being and Time - Heidegger', 'The Republic - Plato', 'Critique of Pure Reason - Kant', 'Beyond Good and Evil - Nietzsche', 'Meditations - Aurelius', 'Letters from a Stoic - Seneca', 'Phenomenology of Spirit - Hegel', 'The World as Will - Schopenhauer']],
  ].forEach(([genre, titles]) => {
    const genreDir = d(genre as string, pBooks);
    (titles as string[]).forEach(title => {
      f(`${title}.epub`, genreDir, '', 'application/epub+zip');
      f(`${title}.pdf`, genreDir, '', 'application/pdf');
    });
  });

  const pComics = d('Comics', pDrive);
  [['Marvel', ['The Amazing Spider-Man Vol 1-10', 'X-Men Classic Vol 1-5', 'Infinity Gauntlet', 'Civil War', 'House of M', 'Secret Wars 2015', 'Planet Hulk', 'Daredevil - Born Again']],
   ['DC', ['Watchmen', 'Batman - The Dark Knight Returns', 'Batman - Year One', 'Kingdom Come', 'All-Star Superman', 'Whatever Happened to the Man of Tomorrow', 'Green Lantern - Blackest Night']],
   ['Manga', ['Berserk Vol 1-41', 'Vagabond Vol 1-37', 'Vinland Saga Vol 1-27', 'Goodnight Punpun Complete', 'Oyasumi Punpun', 'JoJos Bizarre Adventure Complete', 'Hunter x Hunter Vol 1-37', 'Fullmetal Alchemist Complete']],
   ['Indie', ['Saga Vol 1-11', 'Monstress Vol 1-9', 'Paper Girls Complete', 'Locke and Key Complete', 'Sandman Complete - Neil Gaiman', 'From Hell - Alan Moore', 'V for Vendetta - Alan Moore', 'League of Extraordinary Gentlemen']],
  ].forEach(([publisher, titles]) => {
    const pubDir = d(publisher as string, pComics);
    (titles as string[]).forEach(title => {
      f(`${title.replace(/\s+/g, '_')}.cbz`, pubDir, '', 'application/x-cbz');
    });
  });

  // ─── Z: Drive (NAS-Archive — 48TB QNAP TS-873A) ───
  const zDrive = d('Z:', rootId);
  f('disk_label.txt', zDrive, 'NAS-Archive — QNAP TS-873A\n48TB raw / 8-bay RAID6\nIP: 192.168.1.202', 'text/plain');

  const zArchiveOrg = d('Archive.org', zDrive);
  const zGratefulDead = d('Grateful Dead Live Concerts', zArchiveOrg);
  ['gd1972-05-04.sbd.miller.74228', 'gd1977-05-08.aud.hagen.23692', 'gd1969-08-16.sbd.22661',
   'gd1974-06-16.sbd.12244', 'gd1978-09-02.sbd.29775', 'gd1980-09-03.sbd.84953',
   'gd1972-08-27.sbd.20309', 'gd1973-06-22.aud.58988'].forEach(show => {
    const showDir = d(show, zGratefulDead);
    f(`${show}.flac16.md5`, showDir, '', 'text/plain');
    for (let t = 1; t <= 12; t++) {
      f(`${show}t${String(t).padStart(2,'0')}.flac`, showDir, '', 'audio/flac');
    }
  });

  const zNASA = d('NASA Films and Images', zArchiveOrg);
  ['Apollo 11 Mission Footage (1969)', 'Apollo 17 Lunar Surface EVA',
   'Mars Rover Curiosity - First Year', 'Hubble Deep Field Collection',
   'ISS Live Feed Compilation 2020', 'Saturn V Launch Complete Footage',
   'Apollo 8 Earthrise - Original Scans', 'Voyager Mission Documentary'].forEach(item => {
    const itemDir = d(item, zNASA);
    f(`${item.replace(/\s+/g,'_')}.mp4`, itemDir, '', 'video/mp4');
    f('metadata.txt', itemDir, `Archive.org collection: NASA\nTitle: ${item}\nLicense: Public Domain`, 'text/plain');
  });

  const zMsDos = d('MS-DOS and Classic PC Games', zArchiveOrg);
  ['Doom (1993)', 'Wolfenstein 3D (1992)', 'Commander Keen (1990)', 'Prince of Persia (1989)',
   'Monkey Island 1 (1990)', 'Monkey Island 2 (1991)', 'Day of the Tentacle (1993)',
   'Sam and Max Hit the Road (1993)', 'Indiana Jones Fate of Atlantis (1992)',
   'Master of Magic (1994)', 'Civilization I (1991)', 'Transport Tycoon (1994)',
   'SimCity 2000 (1993)', 'Stunts (1990)', 'Jazz Jackrabbit (1994)'].forEach(game => {
    const gameDir = d(game, zMsDos);
    f('dosbox.conf', gameDir, '[dosbox]\nmemsize=16\n[cpu]\ncycles=3000\n[autoexec]\nmount c .\nc:', 'text/plain');
    f(`${game.split(' (')[0].replace(/\s+/g,'')}.exe`, gameDir, '', 'application/x-msdownload');
  });

  const zPrelinger = d('Prelinger Archives', zArchiveOrg);
  ['A Date With Your Family (1950)', 'Duck and Cover (1951)', 'Coronet Blue (1967)',
   'Are You Popular? (1947)', 'Dating Dos and Donts (1949)', 'Buying Food (1950)',
   'Design for Dreaming (1956)', 'The Relaxed Wife (1957)', 'What to Do on a Date (1950)',
   'Going to College (1951)', 'Highways of Agony (1969)', 'Safety Belt for Susie (1962)'].forEach(film => {
    const filmDir = d(film, zPrelinger);
    f(`${film.replace(/[()]/g,'').replace(/\s+/g,'_').toLowerCase()}.mp4`, filmDir, '', 'video/mp4');
  });

  const zOTR = d('Old Time Radio', zArchiveOrg);
  ['Jack Benny Program (1940s-1955)', 'The Shadow (1937-1954)', 'Fibber McGee and Molly',
   'Suspense! Complete Run', 'The Lone Ranger Radio (1933-1954)', 'Inner Sanctum Mysteries',
   'Gunsmoke Radio (1952-1961)', 'Orson Welles - War of the Worlds (1938)'].forEach(show => {
    const otrDir = d(show, zOTR);
    f('episode_list.txt', otrDir, `Old Time Radio: ${show}\nEpisodes: archived from archive.org\nFormat: MP3`, 'text/plain');
  });

  const z78rpm = d('78rpm Recordings', zArchiveOrg);
  ['Robert Johnson - Complete Recordings', 'Bessie Smith - Essential Collection',
   'Louis Armstrong - Hot Fives and Sevens', 'Billie Holiday - Original Recordings 1933-1942',
   'Duke Ellington - Early Years', 'Jelly Roll Morton - Original Piano Rolls',
   'Hank Williams - Early Singles 1947-1952', 'Woody Guthrie - Dust Bowl Ballads'].forEach(artist => {
    const artDir = d(artist, z78rpm);
    f('tracklist.txt', artDir, `78rpm Collection: ${artist}\nRestored from archive.org digitization project`, 'text/plain');
  });

  const zBackups = d('System Backups', zDrive);
  ['2025-03', '2025-02', '2025-01', '2024-12', '2024-11', '2024-10'].forEach(month => {
    const monthDir = d(month, zBackups);
    f(`full_backup_${month}.tar.gz`, monthDir, '', 'application/gzip');
    f(`backup_manifest_${month}.txt`, monthDir, `Backup: ${month}\nSize: ~4.2TB\nDrives: C: D: E:\nStatus: Verified OK`, 'text/plain');
  });

  const zProjectArchive = d('Project Archives', zDrive);
  ['WebApp_2021', 'MobileApp_2022', 'API_Gateway_2023', 'ML_Experiments_2024',
   'Client_Acme_2022-2024', 'Client_StartupABC_2023', 'Freelance_Portfolio'].forEach(proj => {
    const pjDir = d(proj, zProjectArchive);
    f(`${proj}_source.tar.gz`, pjDir, '', 'application/gzip');
    f('README.txt', pjDir, `Project: ${proj}\nArchived and compressed\nSee git history for details`, 'text/plain');
  });

  // ─── Q: Drive (NAS-Seeds1 — 144TB Live Music & Audio) ───
  const qDrive = d('Q:', rootId);
  f('disk_label.txt', qDrive, 'NAS-Seeds1 — Synology RS4021xs+ 144TB\nPurpose: Archive.org Live Music & Audio Seeding\nIP: 192.168.1.203', 'text/plain');

  const lma = d('Live Music Archive', qDrive);
  const lmaBands: [string, string[]][] = [
    ['Phish', ['1994-10-31 Glens Falls NY', '1995-12-31 Madison Square Garden NY', '1997-07-22 Deer Creek IN', '1998-04-03 Nassau Coliseum NY', '2003-02-28 Las Vegas NV', '2009-06-07 Jones Beach NY', '2012-08-31 Dick\'s Sporting Goods Park CO', '2014-07-04 SPAC NY']],
    ['String Cheese Incident', ['2001-07-20 Horning\'s Hideout OR', '2003-08-09 Telluride CO', '2006-08-17 Red Rocks CO', '2011-07-02 Breckenridge CO']],
    ['Widespread Panic', ['1997-03-01 Atlanta GA', '2001-07-08 Red Rocks CO', '2004-08-01 Athens GA', '2008-07-05 Atlanta GA', '2016-07-04 Red Rocks CO']],
    ['moe.', ['2001-08-11 Catskill NY', '2004-12-31 Albany NY', '2007-04-14 Portland OR', '2010-05-08 Burlington VT']],
    ['Dead & Company', ['2016-06-10 Saratoga Springs NY', '2017-07-04 Folsom Field CO', '2018-06-13 San Francisco CA', '2021-10-30 Mountain View CA', '2022-06-15 Deer Creek IN']],
    ['Bob Weir and Wolf Bros', ['2018-04-20 San Francisco CA', '2019-03-01 Chicago IL', '2022-11-11 Denver CO']],
    ['Dark Star Orchestra', ['2002-04-04 Chicago IL', '2006-08-19 Horning\'s Hideout OR', '2010-12-31 Atlanta GA', '2015-08-08 Red Rocks CO', '2019-06-21 Peoria IL']],
    ['The Disco Biscuits', ['1999-09-04 Philadelphia PA', '2003-12-31 New York NY', '2007-07-28 Camp Bisco PA', '2010-12-30 Philadelphia PA', '2014-08-09 Camp Bisco NY']],
    ['STS9 (Sound Tribe Sector 9)', ['2001-12-31 Atlanta GA', '2004-08-14 Telluride CO', '2007-12-29 Atlanta GA', '2011-04-16 Denver CO', '2015-12-31 Denver CO']],
    ['Umphrey\'s McGee', ['2004-07-03 Horning\'s Hideout OR', '2007-12-31 Rosemont IL', '2010-08-07 Chicago IL', '2014-09-06 Ravinia IL', '2018-08-25 Peoria IL']],
    ['Leftover Salmon', ['1996-08-10 Telluride CO', '2001-07-21 Breckenridge CO', '2004-06-17 Boulder CO', '2009-08-22 Red Rocks CO']],
    ['Yonder Mountain String Band', ['2001-12-29 Boulder CO', '2004-08-07 Telluride CO', '2007-08-11 Horning\'s Hideout OR', '2012-06-01 Red Rocks CO']],
    ['Galactic', ['1998-08-22 New Orleans LA', '2001-02-03 San Francisco CA', '2005-04-30 New Orleans LA', '2008-12-31 New Orleans LA']],
    ['Government Mule', ['1997-04-19 Augusta GA', '2001-12-31 Atlanta GA', '2004-11-27 New York NY', '2008-08-03 Asheville NC', '2013-12-31 Atlanta GA']],
    ['Allman Brothers Band', ['1991-09-23 Madison Square Garden NY', '1994-09-17 Ludlow Garage OH', '2003-03-27 Beacon Theatre NY', '2009-10-16 Beacon Theatre NY']],
    ['Tedeschi Trucks Band', ['2011-04-16 Boulder CO', '2014-07-05 Red Rocks CO', '2017-08-11 Noblesville IN', '2020-12-31 Online Lockdown']],
    ['Blues Traveler', ['1991-12-31 New York NY', '1994-08-14 Woodstock NY', '1998-06-20 Mountain View CA', '2002-07-04 Washington DC']],
    ['Dave Matthews Band', ['1995-07-09 Sugarbush VT', '1998-12-31 New York NY', '2002-07-06 Hershey PA', '2008-08-23 Gorge WA', '2012-08-22 Gorge WA']],
    ['Pearl Jam', ['1992-04-03 Seattle WA', '1995-12-08 Seattle WA', '2000-08-03 Jones Beach NY', '2003-04-07 Denver CO', '2013-11-17 Brisbane AU']],
    ['Radiohead', ['2001-07-07 Glasgow UK', '2003-09-05 Edinburgh UK', '2006-05-08 Bonnaroo TN', '2012-08-07 Hyde Park London']],
    ['Wilco', ['1997-04-04 London UK', '2001-08-09 Horning\'s Hideout OR', '2004-06-17 Chicago IL', '2009-08-01 Solid Sound MA']],
    ['My Morning Jacket', ['2003-04-12 Louisville KY', '2006-08-04 Red Rocks CO', '2008-06-13 Bonnaroo TN', '2015-08-07 Red Rocks CO']],
    ['Primus', ['1993-04-02 San Francisco CA', '1997-11-19 Denver CO', '2003-04-05 Portland OR', '2011-10-21 Los Angeles CA']],
    ['Ween', ['1994-12-03 Philadelphia PA', '1999-08-07 Remlap AL', '2003-08-09 Red Rocks CO', '2006-12-31 Philadelphia PA']],
    ['Animal Collective', ['2005-04-01 New York NY', '2007-08-11 Big Sur CA', '2009-08-14 End of the Road UK', '2012-06-10 Barcelona ES']],
    ['Modest Mouse', ['1999-07-04 Portland OR', '2004-08-01 Lollapalooza', '2007-05-18 New York NY', '2014-07-24 New York NY']],
    ['Arcade Fire', ['2004-08-07 Montreal QC', '2007-09-30 Paris FR', '2010-08-08 Hyde Park London', '2014-09-16 Montreal QC']],
    ['LCD Soundsystem', ['2007-05-18 All Tomorrow\'s Parties UK', '2010-12-31 Madison Square Garden NY', '2017-04-08 New York NY', '2022-09-17 Chicago IL']],
    ['Explosions in the Sky', ['2004-09-10 Austin TX', '2007-06-09 Bonaroo TN', '2011-04-15 Chicago IL', '2014-08-30 Austin TX']],
    ['Godspeed You Black Emperor', ['1999-05-01 Montreal QC', '2002-10-06 Brussels BE', '2010-10-01 Primavera ES', '2015-08-30 Montreal QC']],
    ['Sigur Ros', ['2001-06-05 Reykjavik IS', '2005-08-07 Edinburgh UK', '2008-07-26 Montreux CH', '2013-07-05 Hyde Park London']],
    ['Neutral Milk Hotel', ['1998-03-01 Athens GA', '1998-06-15 New York NY', '2013-10-19 Manchester UK', '2014-09-21 London UK']],
    ['Built to Spill', ['1997-07-04 Portland OR', '2001-08-12 Seattle WA', '2006-04-15 Chicago IL', '2013-08-03 Portland OR']],
    ['Guided by Voices', ['1993-04-09 Dayton OH', '1997-06-21 New York NY', '2004-07-17 Chicago IL', '2012-08-11 Chicago IL']],
    ['Pavement', ['1994-08-14 Lollapalooza', '1997-06-20 London UK', '1999-09-22 New York NY', '2010-09-21 New York NY']],
    ['Yo La Tengo', ['1993-12-31 Hoboken NJ', '1998-08-09 New York NY', '2003-12-31 Hoboken NJ', '2015-12-31 Hoboken NJ']],
    ['Tortoise', ['1996-07-04 Chicago IL', '2001-04-07 London UK', '2004-09-11 Bumbershoot WA', '2012-08-19 Primavera ES']],
    ['Sonic Youth', ['1988-05-14 New York NY', '1994-07-17 Lollapalooza', '2001-06-17 Glastonbury UK', '2006-08-12 ATP UK']],
    ['Dinosaur Jr', ['1988-11-22 Boston MA', '1994-09-10 New York NY', '2005-10-07 New York NY', '2012-08-17 Primavera ES']],
    ['Pixies', ['1989-09-15 Boston MA', '1991-04-06 Toronto ON', '2004-07-02 Coachella CA', '2013-05-24 Manchester UK']],
    ['Talking Heads', ['1978-10-26 New York NY', '1980-08-14 Heatwave Festival ON', '1983-12-12 Rome IT', '1984-08-12 Stop Making Sense Film']],
    ['Television', ['1977-05-07 CBGB New York NY', '1992-06-14 Chicago IL', '2001-09-14 New York NY', '2014-05-03 ATP Minehead UK']],
    ['The Fall', ['1982-05-01 Manchester UK', '1986-11-22 New York NY', '1994-06-18 Glastonbury UK', '2001-10-14 London UK']],
    ['Can', ['1972-02-05 Cologne DE', '1975-09-13 Paris FR', '2004-01-17 Barbican London UK']],
    ['Fela Kuti', ['1977-12-01 Lagos NG', '1980-03-21 Berlin DE', '1983-07-11 Montreux CH']],
    ['Sun Ra Arkestra', ['1968-11-16 New York NY', '1978-08-12 Montreux CH', '1990-07-04 Chicago IL', '1993-08-21 Glastonbury UK']],
    ['Charles Mingus', ['1964-07-27 Antibes FR', '1971-08-05 Newport Jazz Festival', '1978-01-19 New York NY']],
    ['Keith Jarrett Trio', ['1975-01-24 Koln DE', '1987-07-15 Montreux CH', '1996-12-10 Tokyo JP', '2009-07-05 Lugano CH']],
    ['Bill Evans Trio', ['1961-06-25 Village Vanguard NY', '1965-08-21 Montreux CH', '1978-04-09 Paris FR', '1980-07-14 Copenhagen DK']],
    ['Ornette Coleman', ['1965-04-01 Stockholm SE', '1971-08-06 Newport Jazz Festival', '1981-07-17 Montreux CH', '2009-07-31 Newport Jazz Festival']],
    ['John Zorn', ['1988-10-14 Tokyo JP', '1992-04-04 New York NY', '2001-12-01 New York NY', '2014-06-06 Krakow PL']],
    ['Boredoms', ['1990-10-25 Osaka JP', '1996-07-19 Fuji Rock JP', '2002-08-10 ATP UK', '2007-07-07 77 Boadrums Brooklyn NY']],
    ['Lightning Bolt', ['1999-04-14 Providence RI', '2003-08-09 ATP UK', '2007-06-09 Chicago IL', '2015-05-15 Providence RI']],
    ['Wolf Eyes', ['2002-05-18 Chicago IL', '2004-08-07 Ann Arbor MI', '2008-10-25 Brooklyn NY', '2013-06-14 Detroit MI']],
    ['Mastodon', ['2004-09-24 Atlanta GA', '2007-08-04 Ozzfest', '2011-08-07 Chicago IL', '2017-08-12 Atlanta GA']],
    ['Isis', ['2002-10-19 Boston MA', '2005-11-12 Chicago IL', '2009-05-16 Portland OR']],
    ['Pelican', ['2003-08-16 Chicago IL', '2007-02-24 London UK', '2012-05-12 Los Angeles CA']],
    ['Neurosis', ['1995-06-17 San Francisco CA', '2000-08-18 Chicago IL', '2007-09-22 ATP UK', '2016-08-13 San Francisco CA']],
    ['Mogwai', ['1997-08-16 Glasgow UK', '2001-10-27 London UK', '2006-09-14 Edinburgh UK', '2011-11-06 Los Angeles CA', '2017-03-19 Chicago IL']],
    ['Mogwai', ['1997-08-16 Glasgow UK', '2003-04-14 Glasgow UK', '2011-11-06 Los Angeles CA']],
    ['Godflesh', ['1989-09-01 Birmingham UK', '1994-06-25 Glastonbury UK', '2010-04-17 London UK', '2014-11-28 Chicago IL']],
    ['Boris', ['2001-09-01 Tokyo JP', '2005-10-14 ATP UK', '2008-07-26 New York NY', '2016-08-06 Osaka JP']],
    ['Sunn O)))', ['2003-04-05 Chicago IL', '2007-11-10 London UK', '2013-08-31 ATP UK', '2019-07-06 Copenhagen DK']],
    ['Earth', ['1992-06-01 Seattle WA', '2005-08-13 Portland OR', '2011-04-23 New York NY', '2019-05-04 Berlin DE']],
    ['Swans', ['1985-11-08 New York NY', '1996-04-04 London UK', '2012-08-04 Porto PT', '2016-09-26 New York NY']],
    ['Nick Cave and the Bad Seeds', ['1994-10-28 Melbourne AU', '1997-05-01 Glastonbury UK', '2001-11-22 Berlin DE', '2008-10-18 Sydney AU', '2017-07-08 Dublin IE']],
    ['Tom Waits', ['1975-07-26 Montreux CH', '1979-08-25 Bottom Line NY', '1987-09-15 Chicago IL', '1999-09-17 Pittsburgh PA', '2008-11-10 San Diego CA']],
    ['Leonard Cohen', ['1976-07-02 Montreux CH', '1985-09-14 Austin TX', '1993-04-06 Toronto ON', '2008-05-23 Manchester UK', '2012-04-17 Montreal QC']],
    ['Bob Dylan', ['1966-05-17 Free Trade Hall Manchester', '1975-10-30 Boston MA', '1995-10-18 New York NY', '2005-11-05 Denver CO', '2016-07-02 London UK']],
    ['Neil Young', ['1970-08-30 Fillmore East NY', '1973-01-10 Nashville TN', '1987-09-14 Shoreline CA', '2003-04-11 Shoreline CA', '2014-09-12 Del Mar CA']],
    ['Bruce Springsteen', ['1978-08-09 Agora Cleveland OH', '1984-09-13 Philadelphia PA', '1999-04-09 East Rutherford NJ', '2009-02-28 Tampa FL', '2023-02-01 Columbus OH']],
    ['R.E.M.', ['1983-09-27 San Francisco CA', '1995-08-19 Vienna AT', '2001-06-16 Glastonbury UK', '2004-08-27 Dublin IE', '2008-10-06 Glasgow UK']],
    ['The Replacements', ['1985-02-06 Minneapolis MN', '1987-07-26 Merriweather MD', '1989-07-30 Universal Amphitheater CA', '2014-09-19 New York NY']],
    ['Husker Du', ['1983-08-12 Minneapolis MN', '1985-10-02 San Francisco CA', '1986-07-18 Baltimore MD']],
    ['Mission of Burma', ['1981-08-22 Boston MA', '2002-07-04 Boston MA', '2006-10-08 New York NY', '2012-03-31 Boston MA']],
    ['Gang of Four', ['1979-09-21 Manchester UK', '1982-04-17 New York NY', '2005-09-17 Toronto ON', '2011-10-02 New York NY']],
    ['Wire', ['1978-05-06 Manchester UK', '1980-06-21 Hammersmith UK', '1987-03-02 London UK', '2013-05-25 London UK']],
    ['Public Image Ltd', ['1979-12-25 London UK', '1984-09-07 New York NY', '1989-11-04 Glasgow UK', '2012-07-06 ATP UK']],
    ['Joy Division', ['1979-07-27 Glastonbury UK', '1979-10-29 Manchester UK', '1980-01-08 London UK']],
    ['New Order', ['1983-12-16 New York NY', '1989-06-24 Glastonbury UK', '1994-08-13 Lollapalooza', '2002-12-31 Manchester UK', '2015-07-23 Manchester UK']],
    ['The Cure', ['1982-11-06 London UK', '1987-07-04 Glasgow UK', '1992-04-09 Berlin DE', '2004-05-14 Coachella CA', '2019-07-18 Hyde Park London']],
    ['Siouxsie and the Banshees', ['1977-09-24 London UK', '1982-08-28 Glastonbury UK', '1991-08-31 Reading UK', '1995-05-21 Frankfurt DE']],
    ['The Jesus and Mary Chain', ['1985-03-15 London UK', '1992-08-29 Reading UK', '2007-08-11 Coachella CA', '2014-09-26 Atlanta GA']],
    ['My Bloody Valentine', ['1988-04-02 Bristol UK', '1991-05-17 Manchester UK', '2008-06-23 Shepherd\'s Bush London', '2013-06-21 Dublin IE']],
    ['Spiritualized', ['1993-11-20 London UK', '2001-10-14 New York NY', '2008-06-28 ATP UK', '2012-06-17 London UK']],
    ['Mercury Rev', ['1993-05-01 Buffalo NY', '1999-05-13 London UK', '2001-08-25 Edinburgh UK', '2004-04-10 New York NY']],
    ['Super Furry Animals', ['1997-06-27 Glastonbury UK', '2001-07-21 London UK', '2005-06-25 Glastonbury UK', '2016-07-23 Latitude UK']],
    ['Stereolab', ['1993-10-22 London UK', '1997-08-02 Edinburgh UK', '2001-10-20 Chicago IL', '2019-09-06 Chicago IL']],
    ['Broadcast', ['1997-05-31 Glastonbury UK', '2000-10-28 London UK', '2005-08-12 Edinburgh UK', '2011-11-12 Manchester UK']],
    ['Portishead', ['1994-06-01 Bristol UK', '1998-10-20 New York NY', '2008-05-04 Coachella CA', '2011-07-23 London UK']],
    ['Massive Attack', ['1994-08-19 Glastonbury UK', '1998-07-26 Montreux CH', '2003-05-09 London UK', '2008-06-28 Glastonbury UK', '2016-07-07 Glastonbury UK']],
    ['Tricky', ['1995-07-21 Glastonbury UK', '1998-10-12 New York NY', '2001-08-18 Edinburgh UK', '2008-10-25 London UK']],
    ['The Prodigy', ['1992-07-17 Glastonbury UK', '1997-08-23 Reading UK', '2004-06-01 Moscow RU', '2009-11-14 London UK', '2015-03-07 Dublin IE']],
    ['Aphex Twin', ['1994-08-27 Glastonbury UK', '2001-06-09 Sonar Barcelona ES', '2011-10-29 New York NY', '2019-09-06 Edinburgh UK']],
    ['Autechre', ['1997-06-28 Glastonbury UK', '2001-08-05 Edinburgh UK', '2008-11-01 Manchester UK', '2016-04-01 London UK']],
    ['Squarepusher', ['1997-04-12 London UK', '2001-03-03 Chicago IL', '2008-08-14 Fuji Rock JP', '2015-11-14 Glasgow UK']],
    ['Boards of Canada', ['2000-04-09 Coachella CA', '2013-06-16 Barcelona ES']],
    ['The Orb', ['1992-04-11 London UK', '1995-07-01 Glastonbury UK', '2001-10-06 Barcelona ES', '2013-07-06 Glastonbury UK']],
    ['Orbital', ['1992-06-27 Glastonbury UK', '1994-12-30 London UK', '2002-06-22 Glastonbury UK', '2017-06-24 Glastonbury UK']],
    ['Underworld', ['1994-08-20 Glastonbury UK', '1998-07-17 Tribal Gathering UK', '2002-06-29 Glastonbury UK', '2016-06-24 Glastonbury UK']],
    ['Four Tet', ['2003-08-09 Edinburgh UK', '2010-06-13 Glastonbury UK', '2015-12-31 Fabric London', '2022-08-20 Glastonbury UK']],
    ['Actress', ['2010-10-14 London UK', '2012-06-16 Unsound PL', '2017-09-23 Berlin DE']],
    ['Jon Hopkins', ['2009-09-19 London UK', '2013-11-03 New York NY', '2018-05-07 Milan IT', '2021-06-12 Online']],
    ['Floating Points', ['2012-07-07 London UK', '2015-08-02 Glastonbury UK', '2019-08-04 Primavera ES', '2022-11-19 Chicago IL']],
    ['Sudan Archives', ['2017-03-11 Los Angeles CA', '2019-04-14 Coachella CA', '2022-08-07 Chicago IL']],
    ['Mdou Moctar', ['2019-09-14 Brooklyn NY', '2021-07-02 Amsterdam NL', '2023-04-29 Chicago IL']],
    ['King Crimson', ['1969-07-05 Hyde Park London', '1972-11-23 Jacksonville FL', '1982-07-23 Santa Monica CA', '1996-11-07 Buenos Aires AR', '2019-09-21 Chicago IL']],
    ['Van der Graaf Generator', ['1975-01-31 Sheffield UK', '1978-04-28 London UK', '2007-06-16 Oslo NO', '2011-07-09 London UK']],
    ['Soft Machine', ['1969-01-11 Los Angeles CA', '1972-08-18 Montreux CH', '1975-11-14 London UK']],
    ['Henry Cow', ['1973-09-14 London UK', '1975-07-05 Glastonbury UK', '1978-03-09 Bremen DE']],
    ['Faust', ['1973-05-12 Munich DE', '1994-09-30 London UK', '2007-07-08 Cologne DE', '2015-11-21 London UK']],
    ['Klaus Schulze', ['1975-08-01 Berlin DE', '1979-09-14 Paris FR', '1988-11-26 Zurich CH', '2003-04-05 Warsaw PL']],
    ['Tangerine Dream', ['1974-11-01 York UK', '1977-04-09 Coventry UK', '1980-10-25 Montreal QC', '1992-06-14 Zurich CH']],
    ['Popol Vuh', ['1973-04-14 Munich DE', '1979-10-27 Berlin DE', '1991-08-17 Frankfurt DE']],
    ['Cluster', ['1972-09-16 Dusseldorf DE', '1979-08-12 Hamburg DE', '1993-10-08 Berlin DE']],
    ['Harmonia', ['1974-01-28 Forst DE', '1975-09-04 Bremen DE']],
    ['Amon Duul II', ['1969-09-14 Munich DE', '1973-08-26 Cologne DE', '1984-10-20 London UK']],
    ['Neu!', ['1972-10-14 Cologne DE', '1975-04-17 Hamburg DE']],
    ['Can', ['1972-02-05 Cologne DE', '1973-09-22 Paris FR', '1975-11-08 Mannheim DE']],
  ];
  lmaBands.forEach(([band, shows]) => {
    const bandDir = d(band, lma);
    shows.forEach(show => {
      const showDir = d(show, bandDir);
      const slug = show.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
      f(`${slug}-set1.flac`, showDir, '', 'audio/flac');
      f(`${slug}-set2.flac`, showDir, '', 'audio/flac');
      f(`${slug}.txt`, showDir, `Show: ${band} - ${show}\nSource: Soundboard/Audience\nTaper: archive.org community\nTransfer: Flac 16/44.1`, 'text/plain');
    });
  });

  // etree lossless concert archive
  const etree = d('etree Lossless Archive', qDrive);
  const etreeBands = [
    'Acoustic Syndicate', 'Aquarium Rescue Unit', 'Bela Fleck and the Flecktones',
    'Béla Fleck', 'Big Head Todd and the Monsters', 'Blackfoot Gypsies',
    'Blue Miracle', 'Bowling for Soup', 'Brett Dennen', 'Cabinet',
    'Calexico', 'Camper Van Beethoven', 'Carbon Leaf', 'Catfish and the Bottlemen',
    'Charlie Hunter', 'Chet Atkins', 'Chris Robinson Brotherhood', 'Circles Around the Sun',
    'Col. Bruce Hampton', 'Cornmeal', 'Dave Holland Quartet', 'David Grisman Quintet',
    'Derek Trucks Band', 'Dispatch', 'Dr. Dog', 'Drive-By Truckers', 'Dumpstaphunk',
    'Earl Scruggs', 'Ekoostic Hookah', 'Electric Six', 'Elephant Revival', 'Emmylou Harris',
    'Explosions in the Sky', 'Felice Brothers', 'Furthur', 'Grace Potter and the Nocturnals',
    'Greensky Bluegrass', 'Hayseed Dixie', 'Hot Tuna', 'Huey Lewis and the News',
    'Ivan Neville\'s Dumpstaphunk', 'Jack Johnson', 'Jackie Greene', 'Jake Owen',
    'Jamey Johnson', 'Jambay', 'Jefferson Starship', 'JGB (Jerry Garcia Band)',
    'Jethro Tull', 'Joe Russo Almost Dead', 'John Butler Trio', 'John Fogerty',
    'John Garcia', 'John Hartford', 'John Lee Hooker', 'John Mayall',
    'Jorma Kaukonen', 'Keller Williams', 'Lake Street Dive', 'Larry Carlton',
    'Leo Kottke', 'Lester Young', 'Little Feat', 'Lyle Lovett',
    'Mahavishnu Orchestra', 'Martin Sexton', 'Matt Schofield', 'Medeski Martin and Wood',
    'Michael Franti', 'Midnight North', 'Mike Gordon', 'Mike Stern',
    'Moonalice', 'Mountain', 'New Grass Revival', 'Nickel Creek',
    'North Mississippi Allstars', 'O.A.R.', 'Oteil and the Peacemakers', 'Ozric Tentacles',
    'Page McConnell', 'Peter Green', 'Peter Rowan', 'Pigeons Playing Ping Pong',
    'Project Logic', 'Railroad Earth', 'Ratdog', 'Ray Davies',
    'Raymond Benson', 'Rebirth Brass Band', 'Richard Thompson', 'Robert Randolph',
    'Roy Buchanan', 'Sam Bush', 'Santana', 'Snarky Puppy',
    'Spafford', 'Spin Doctors', 'Steely Dan', 'Steve Kimock',
    'Steve Miller Band', 'Sturgill Simpson', 'Subdudes', 'The Avett Brothers',
    'The Black Crowes', 'The Blind Boys of Alabama', 'The Budos Band', 'The Doobie Brothers',
    'The Drive-By Truckers', 'The Grateful Dead', 'The Infamous Stringdusters', 'The Meters',
    'The National', 'The New Pornographers', 'The Oh Hellos', 'The Samples',
    'The Slip', 'The Wood Brothers', 'Trey Anastasio Band', 'Twiddle',
    'Uncle Tupelo', 'Umphrey\'s McGee', 'Victor Wooten', 'Vince Guaraldi Trio',
    'Warren Haynes Band', 'Weezer', 'Widespread Panic', 'Wovenhand', 'Yam Yam',
  ];
  etreeBands.forEach(band => {
    const bandDir = d(band, etree);
    const year = 1990 + Math.floor(band.length % 30);
    f(`${band.replace(/\s+/g,'_')}_${year}_complete.txt`, bandDir, `etree collection: ${band}\nShows: multiple dates archived\nFormat: FLAC 16bit 44.1kHz\nSource: SBD/AUD/Matrix`, 'text/plain');
  });

  // Archive.org Audio collections
  const archiveAudio = d('Archive.org Audio Collections', qDrive);
  [
    ['Folkways Records Digital Archive', '4200 albums of folk, world, children\'s music (1948-2000)'],
    ['V-Discs WWII Military Music', '900+ 78rpm pressings distributed to US troops 1943-1949'],
    ['Alan Lomax Collection', 'Field recordings from 1930s-1990s, 12,000+ tracks'],
    ['Harry Smith Anthology of American Folk Music', 'The complete 6-volume original collection'],
    ['Commodore Records Archive', 'Jazz label 1938-1954, 800+ original recordings'],
    ['Blue Note Records 1939-1967', 'Complete early Blue Note catalog before Liberty acquisition'],
    ['Riverside Records Collection', 'Bill Evans, Thelonious Monk, Wes Montgomery originals'],
    ['Prestige Records 1949-1971', 'Miles Davis, John Coltrane, Sonny Rollins originals'],
    ['Impulse Records Collection', 'Coltrane, Mingus, Pharoah Sanders complete catalog'],
    ['ECM Records Archive 1969-1999', 'Keith Jarrett, Jan Garbarek, Charlie Haden'],
    ['Nonesuch Records Explorer Series', 'World music field recordings 1967-1985'],
    ['Elektra Records 1950-1975', 'Early folk revival, Ed McCurdy, Josh White, Theodore Bikel'],
    ['Vanguard Records Folk Archive', 'Joan Baez, Peter Paul and Mary, Ian and Sylvia'],
    ['Topic Records UK Archive', 'British folk and blues 1939-2005, 3000+ albums'],
    ['Arhoolie Records Blues Archive', 'Lightnin\' Hopkins, Clifton Chenier, Mance Lipscomb'],
    ['Rounder Records Archive', 'Bluegrass, old-time, blues, zydeco 1970-2000'],
    ['Original Memphis Blues Archive', '78rpm field recordings of early Delta blues 1928-1942'],
    ['Gospel Music Archive 1925-1965', 'Sacred Harp singing, shape note, black gospel'],
    ['Cajun and Zydeco Field Recordings', 'Louisiana French music 1934-1970, Library of Congress'],
    ['Appalachian Traditional Music Archive', 'Old-time fiddle, banjo, shape note singing'],
  ].forEach(([name, desc]) => {
    const colDir = d(name as string, archiveAudio);
    f('collection_info.txt', colDir, `Archive.org Collection: ${name}\n${desc}\nStatus: Seeding active`, 'text/plain');
  });

  // ─── R: Drive (NAS-Seeds2 — 192TB Texts, Video, Educational) ───
  const rDrive = d('R:', rootId);
  f('disk_label.txt', rDrive, 'NAS-Seeds2 — Custom 24-bay 192TB\nPurpose: Archive.org Texts, Video & Educational Seeding\nIP: 192.168.1.204', 'text/plain');

  // Archive.org Texts
  const archiveTexts = d('Archive.org Texts', rDrive);

  const bookPublishers = [
    ['Project Gutenberg Mirror', ['The Complete Works of Charles Dickens', 'The Complete Works of Mark Twain', 'The Complete Works of Jane Austen', 'The Complete Works of Thomas Hardy', 'The Complete Works of Anthony Trollope', 'The Complete Works of George Eliot', 'The Complete Works of Wilkie Collins', 'The Complete Works of Arthur Conan Doyle', 'The Complete Works of H.G. Wells', 'The Complete Sherlock Holmes', 'The Complete Works of Rudyard Kipling', 'The Complete Works of Jack London', 'The Complete Works of Ambrose Bierce', 'The Complete Works of O. Henry', 'The Complete Works of Edgar Allan Poe', 'The Complete Works of Nathaniel Hawthorne', 'The Complete Works of Herman Melville', 'The Complete Works of Henry James', 'The Complete Works of Edith Wharton', 'The Complete Works of Theodore Dreiser', 'The Complete Works of Upton Sinclair', 'The Complete Works of Frank Norris', 'The Complete Works of Stephen Crane', 'The Works of Plato', 'The Works of Aristotle', 'The Works of Cicero', 'The Works of Seneca', 'The Works of Marcus Aurelius', 'The Works of Epictetus', 'The Dialogues of Plato - Jowett Translation']],
    ['Internet Archive Scholarly Articles', ['JSTOR Open Access Collection 2019', 'PubMed Central Open Archive', 'arXiv Physics Preprints 1991-2010', 'arXiv Mathematics Preprints 1991-2010', 'arXiv Computer Science Preprints 1991-2010', 'SSRN Social Science Papers Archive', 'Hathi Trust Digitized Books Pre-1927', 'Google Books Out of Copyright Scan Collection', 'British Library Digitized Manuscripts', 'Library of Congress Rare Books Digitization']],
    ['Vintage Magazines Archive', ['Popular Science 1872-1960', 'Popular Mechanics 1902-1960', 'Scientific American 1845-1970', 'National Geographic 1888-1970', 'Life Magazine 1936-1972', 'Time Magazine 1923-1960', 'Fortune Magazine 1930-1960', 'The Saturday Evening Post 1821-1969', 'Harper\'s Magazine 1850-1925', 'The Atlantic Monthly 1857-1960', 'The New Yorker 1925-1970', 'Punch Magazine 1841-1992', 'Collier\'s Weekly 1888-1957', 'The Strand Magazine 1891-1950', 'Amazing Stories 1926-1971', 'Astounding Science Fiction 1930-1965', 'Galaxy Science Fiction 1950-1980', 'The Magazine of Fantasy and Science Fiction 1949-2000', 'Weird Tales 1923-1954', 'Black Mask Magazine 1920-1951']],
    ['US Government Documents', ['Congressional Record 1873-1960', 'Federal Register 1936-1975', 'Supreme Court Opinions 1793-2000', 'US Census Records 1790-1940', 'State Department Foreign Relations Series', 'NASA Technical Reports 1958-2000', 'Atomic Energy Commission Reports', 'US Army Technical Manuals WWII', 'OSS Research Reports WWII', 'CIA Cold War Documents (Declassified)']],
    ['Zines and Independent Press', ['Maximum Rocknroll Complete Archive', 'Factsheet Five Archive', 'Punk Planet Complete Run', 'HeartAttack Zine Complete', 'Cometbus Complete', 'Murder Can Be Fun Complete', 'Ben is Dead Complete', 'Dishwasher Pete Complete', 'Temp Slave Complete', 'Processed World Archive', 'Profane Existence Complete', 'Slug and Lettuce Complete']],
    ['Comic Books and Graphic Novels', ['EC Comics Complete Archive', 'Harvey Comics Archive', 'Archie Comics 1941-1975', 'Dell Comics Archives', 'Gold Key Comics Archive', 'Horror Comics 1950-1955 Pre-Code', 'Crime Comics 1948-1955 Pre-Code', 'War Comics 1950-1965', 'Romance Comics 1949-1977', 'Funny Animal Comics 1940-1960', 'Big Little Books Archive 1932-1950', 'Classic Illustrated Archive Complete']],
    ['Technical Manuals', ['Bell System Technical Journals 1922-1983', 'IBM Technical Disclosure Bulletins', 'RCA Review Complete Archive', 'Proceedings of the IRE 1913-1963', 'Bell Labs Records Archive', 'Western Electric Instruction Manuals', 'MIT Radiation Lab Series WWII', 'USAF Technical Orders Archive', 'Navy BUSHIPS Technical Manuals', 'Machinery\'s Handbook Editions 1-28']],
  ];
  bookPublishers.forEach(([publisher, titles]) => {
    const pubDir = d(publisher as string, archiveTexts);
    (titles as string[]).forEach(title => {
      const titleDir = d(title, pubDir);
      f(`${(title as string).replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0,40)}.pdf`, titleDir, '', 'application/pdf');
      f(`${(title as string).replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0,40)}.epub`, titleDir, '', 'application/epub+zip');
    });
  });

  // Archive.org Video
  const archiveVideo = d('Archive.org Video', rDrive);
  [
    ['Brick Films Animation Archive', ['Lego Stop Motion 2000-2015 Complete Collection', 'Brick Film Festival Entries 2004-2012', 'Classic Brickfilm YouTube Mirror', 'Award Winners Collection']],
    ['Classic Hollywood Films 1920-1950', ['MGM Pre-Code Archive', 'RKO Pre-Code Collection', 'Universal Horror 1930s', 'Poverty Row Studios Archive', 'British Quota Quickies 1927-1937', 'Early Sound Films 1927-1932', 'Three Stooges Complete Columbia Shorts', 'Laurel and Hardy Complete Hal Roach', 'Our Gang Comedies Complete', 'Marx Brothers Pre-Paramount Films']],
    ['Educational Films Archive', ['Bell System Science Films 1956-1968', 'Disney Educational Productions Complete', 'Coronet Films Complete Archive', 'McGraw-Hill Text Films', 'Encyclopedia Britannica Films', 'Churchill Films Archive', 'Young America Films', 'Jam Handy Organization Films', 'United World Films Archive', 'Academy Award Winning Documentary Shorts 1941-1980']],
    ['Independent and Experimental Cinema', ['Canyon Cinema Catalog Archive', 'Anthology Film Archives Collection', 'New American Cinema Group Films', 'Fluxus Film Archive', 'Stan Brakhage Complete Works', 'Maya Deren Complete Works', 'Bruce Conner Complete Works', 'Paul Sharits Complete', 'Michael Snow Complete', 'Hollis Frampton Complete', 'Ernie Gehr Complete', 'Su Friedrich Complete']],
    ['Documentary Films Pre-1980', ['Robert Flaherty Collection', 'Pare Lorentz Films Complete', 'Joris Ivens Archive', 'Dziga Vertov Films', 'Jean Vigo Complete', 'Luis Bunuel Early Films', 'Humphrey Jennings Complete', 'John Grierson Archive', 'Free Cinema Movement UK', 'Direct Cinema 1960s-1970s']],
    ['TV Archives', ['KCET Los Angeles Archive 1964-1990', 'NET (National Educational Television) Archive', 'WHA Wisconsin Educational TV 1950s-1970s', 'WNET New York Educational Archive', 'CBC Television Archive Digitized 1952-1980', 'BBC Archive Licensed Clips Pre-1980', 'ITV Archive Preservation Project', 'Westinghouse Broadcasting Archive', 'Group W Television Archive']],
    ['News Footage Archive', ['AP Archive 1930-1980 Open Access', 'Reuters Newsreel Archive Pre-1975', 'British Pathe Complete Digitization', 'Fox Movietone News 1928-1963', 'Universal Newsreel 1929-1967', 'RKO-Pathé News 1931-1947', 'Paramount News 1927-1957', 'Hearst Metrotone News Archive', 'Telenews Archive 1947-1956']],
    ['World Cinema', ['Soviet Cinema Archive 1920-1960', 'Weimar German Cinema 1919-1933', 'Italian Neorealism Complete Collection', 'French New Wave Archive', 'Czech New Wave Films', 'Polish Film School Archive', 'Japanese Cinema 1950s-1970s', 'Bollywood Golden Age 1940-1965', 'Latin American Cinema 1950-1980', 'African Cinema Archive 1960-1985']],
  ].forEach(([category, items]) => {
    const catDir = d(category as string, archiveVideo);
    (items as string[]).forEach(item => {
      const itemDir = d(item, catDir);
      f(`${(item as string).replace(/\s+/g,'_').substring(0,40)}.mp4`, itemDir, '', 'video/mp4');
      f('metadata.txt', itemDir, `Archive.org Video: ${item}\nLicense: Public Domain / Creative Commons\nCategory: ${category}`, 'text/plain');
    });
  });

  // Educational content
  const archiveEdu = d('Educational Content', rDrive);
  [
    ['MIT OpenCourseWare Mirror 2010-2020', ['18.01 Single Variable Calculus', '18.02 Multivariable Calculus', '18.06 Linear Algebra - Gilbert Strang', '6.001 Structure and Interpretation', '6.046 Design and Analysis of Algorithms', '6.828 OS Engineering', '6.830 Database Systems', '6.824 Distributed Systems', '8.01 Physics I', '8.02 Physics II', '8.04 Quantum Physics I', '5.111 Principles of Chemical Science', '7.012 Introductory Biology', '9.01 Neuroscience and Behavior', '21H.001 How to Stage a Revolution', '24.00 Introduction to Philosophy']],
    ['Yale Open Courses Archive', ['HIST 116 American Revolution', 'PHIL 176 Death - Shelly Kagan', 'PSYC 110 Introduction to Psychology', 'ECON 252 Financial Markets - Shiller', 'ENGL 310 Modern Poetry - Hammer', 'RLST 145 Introduction to Old Testament', 'HIST 202 European Civilization 1648-1945', 'MCDB 150 Global Problems of Population Growth']],
    ['Khan Academy Complete Archive 2012', ['Arithmetic', 'Pre-Algebra', 'Algebra 1 and 2', 'Geometry', 'Trigonometry', 'Pre-Calculus', 'Calculus', 'Statistics and Probability', 'Linear Algebra', 'Differential Equations', 'Biology', 'Chemistry', 'Physics', 'Organic Chemistry', 'Computer Science', 'US History', 'World History', 'Economics', 'Finance and Capital Markets']],
    ['Feynman Lectures Video Archive', ['Volume I Mechanics - Complete', 'Volume II Electromagnetism - Complete', 'Volume III Quantum Mechanics - Complete', 'Character of Physical Law - Cornell 1964', 'Project Tuva - Microsoft Research', 'Feynman on Computing', 'Feynman Nobel Lecture 1965']],
    ['Carl Sagan Video Archive', ['Cosmos Episode Master Prints', 'Pale Blue Dot Lectures', 'SETI Presentations 1970-1993', 'Gifford Lectures 1985', 'Cornell Astronomy Lectures', 'Broca\'s Brain Interviews', 'Contact Pre-Production Materials']],
    ['TED Talks Complete Archive 2006-2012', ['2006 Conference Complete', '2007 Conference Complete', '2008 Conference Complete', '2009 Conference Complete', '2010 Conference Complete', '2011 Conference Complete', '2012 Conference Complete', 'TED-Ed Early Collection', 'TEDx Talks 2009-2012 Mirror']],
    ['Crash Course Complete Archive', ['World History Series 1-42', 'US History Series 1-47', 'Biology Series 1-40', 'Chemistry Series 1-46', 'Physics Series 1-46', 'Psychology Series 1-40', 'Ecology Series 1-12', 'Astronomy Series 1-47', 'Literature Series 1-46', 'Film History Series 1-12']],
    ['Great Courses Lecture Archive', ['The Story of Human Language - McWhorter', 'Understanding Calculus - Edwards', 'Philosophy of Mind - Searle', 'The Science of Information', 'How to Listen to and Understand Great Music', 'Great World Religions Survey', 'The Art of Reading', 'Memory and the Human Lifespan', 'Mysteries of Modern Physics', 'Origins of the Human Mind']],
  ].forEach(([course, topics]) => {
    const courseDir = d(course as string, archiveEdu);
    (topics as string[]).forEach(topic => {
      const topicDir = d(topic, courseDir);
      f(`${(topic as string).replace(/\s+/g,'_').substring(0,35)}_lecture.mp4`, topicDir, '', 'video/mp4');
      f('notes.txt', topicDir, `Course: ${course}\nTopic: ${topic}\nSource: Archive.org educational mirror`, 'text/plain');
    });
  });

  // TV News Archive
  const archiveTVNews = d('TV News Archive', rDrive);
  [
    ['CNN Archive 1980-2010', '12,000+ hours of broadcast recording'],
    ['BBC World Service Radio Archive', '45,000+ hours of shortwave broadcasts 1932-2005'],
    ['NBC News Archive 1953-1985', '8,400 broadcast recordings'],
    ['CBS News Archive 1950-1980', '6,200 broadcast recordings'],
    ['ABC News Archive 1955-1980', '5,100 broadcast recordings'],
    ['PBS NewsHour Complete 1983-2010', '7,200 episodes archived'],
    ['Democracy Now! Complete 1996-2015', '4,800 episodes'],
    ['C-SPAN Archive 1982-2000', 'Congressional proceedings and public affairs'],
    ['Al Jazeera English Complete 2006-2015', '22,000+ hours'],
    ['RT (Russia Today) Archive 2005-2014', '18,000+ hours'],
    ['Voice of America Archive 1942-1985', 'WWII and Cold War broadcasts'],
    ['Radio Free Europe Archive 1950-1992', 'Cold War broadcasts to Eastern Europe'],
    ['Armed Forces Radio Archive 1942-1960', 'WWII and Korean War military broadcasts'],
  ].forEach(([network, desc]) => {
    const netDir = d(network as string, archiveTVNews);
    f('collection_info.txt', netDir, `TV/Radio Archive: ${network}\n${desc}\nSeeding via archive.org`, 'text/plain');
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].forEach(month => {
      d(`${month} Archive`, netDir);
    });
  });

  // Software and Games
  const archiveSoftware = d('Software and Games Archive', rDrive);
  [
    ['Commodore 64 Game Library', ['Action Games 1982-1994', 'Adventure Games 1982-1994', 'RPG Collection', 'Sports Games', 'Strategy Games', 'Educational Software', 'Demos and Cracktros', 'European Scene Releases', 'NTSC Titles', 'Unreleased Prototypes']],
    ['Apple II Software Archive', ['Sierra On-Line Complete', 'Infocom Text Adventures', 'Broderbund Collection', 'SubLogic Flight Simulator Versions', 'Print Shop and Variations', 'Appleworks Versions', 'Beagle Bros Utilities', 'Electronic Arts Early Titles', 'Epyx Collection', 'SSI Gold Box Games']],
    ['Atari ST Archive', ['Dungeon Master Original', 'Populous Original', 'Speedball Series', 'Rick Dangerous Series', 'Sensible Soccer Original', 'Carrier Command', 'Elite Plus', 'Virgo and Jaguar Games', 'MIDI and Music Software', 'Graphics Applications Archive']],
    ['Amiga Games Complete', ['Bitmap Brothers Collection', 'Team 17 Complete Archive', 'Ocean Software Collection', 'US Gold Complete', 'Psygnosis Complete', 'Gremlin Graphics Archive', 'Palace Software Collection', 'Cinemaware Games', 'Microprose Amiga Titles', 'Black Legend and Silmarils']],
    ['DOS/Windows Games 1990-1999', ['id Software Complete Catalog', 'LucasArts Complete Collection', 'Sierra On-Line Kings Quest Series', 'Sierra Police Quest Series', 'Sierra Space Quest Series', 'Sierra Leisure Suit Larry Series', 'Origin Systems Complete', 'Bullfrog Productions Complete', 'Westwood Studios Complete', 'Black Isle Studios Complete', 'Bioware Early Titles', 'Interplay Complete Catalog']],
    ['Flash Games Archive', ['Newgrounds Classic Collection 2000-2010', 'AddictingGames Archive', 'Miniclip Classic Collection', 'Adult Swim Games Archive', 'Armor Games Collection', 'Kongregate Featured Games Archive', 'Nick Jr Games 2000-2010', 'Cartoon Network Games Archive', 'Disney Online Games Archive', 'Nick.com Games Archive']],
    ['Shareware Collections', ['3D Realms Shareware Archive', 'Apogee Software Complete', 'Epic MegaGames Shareware', 'id Software Shareware Originals', 'Activision Shareware Pack', 'PC Gamer Demo Disc Archive 1994-2004', 'GameSpy Arcade CD Archives', 'Computer Gaming World Demo CDs', 'Next Generation Demo Discs', 'Edge Magazine Cover Discs UK']],
  ].forEach(([platform, collections]) => {
    const platformDir = d(platform as string, archiveSoftware);
    (collections as string[]).forEach(col => {
      d(col, platformDir);
    });
  });

  // ─── S: Drive (NAS-Seeds3 — 256TB Live Concerts Overflow) ───
  const sDrive = d('S:', rootId);
  f('disk_label.txt', sDrive, 'NAS-Seeds3 — SuperMicro JBOD 256TB\nPurpose: Archive.org Concert Overflow & World Music\nIP: 192.168.1.205', 'text/plain');

  const sWorldMusic = d('World Music Archive', sDrive);
  [
    ['African Music', ['Fela Kuti Complete Discography FLAC', 'Ali Farka Toure Field Recordings', 'King Sunny Ade Complete Archive', 'Miriam Makeba Recordings 1957-2008', 'Hugh Masekela Complete Archive', 'Thomas Mapfumo Complete', 'Orchestra Baobab Complete', 'Youssou N\'Dour Complete', 'Salif Keita Archive', 'Angelique Kidjo Complete']],
    ['Latin and South American', ['Mercedes Sosa Complete Archive', 'Astor Piazzolla FLAC Collection', 'Buena Vista Social Club Sessions', 'Carlos Gardel Complete Recordings', 'Cesaria Evora Complete', 'Celia Cruz Complete Archive', 'Tito Puente Complete', 'Eddie Palmieri Archive', 'Rubén Blades Complete', 'Los Panchos Complete']],
    ['Middle East and North Africa', ['Oum Kalthoum Complete Recordings', 'Fairuz Complete Archive', 'Nusrat Fateh Ali Khan FLAC', 'Anouar Brahem Complete', 'Marcel Khalife Archive', 'Khaled (Cheb) Complete', 'Rachid Taha Complete', 'Gnawa Music of Morocco', 'Turkish Classical Music Archive', 'Persian Classical Dastgah Collection']],
    ['South and Southeast Asian', ['Ravi Shankar Complete Recordings', 'Ali Akbar Khan Archive', 'Bismillah Khan Complete', 'Zakir Hussain Tabla Archive', 'M.S. Subbulakshmi Complete', 'Balamurali Krishna Archive', 'Nusrat Fateh Ali Khan Qawwali', 'Indonesian Gamelan Archive', 'Thai Court Music Archive', 'Cambodian Classical Music']],
    ['East Asian', ['Traditional Chinese Court Music Archive', 'Guqin Masters Collection', 'Shakuhachi Masters - Japan', 'Gagaku Imperial Music Japan', 'Korean Pansori Complete Archive', 'Beijing Opera Classic Recordings', 'Mongolian Throat Singing Archive', 'Tuvan Throat Singing Huun-Huur-Tu']],
    ['Eastern European Folk', ['Bulgarian Women\'s Choir - Le Mystere des Voix', 'Romanian Folk Music Archive', 'Hungarian Bartok Field Recordings', 'Polish Folk Music Archive', 'Croatian Tamburica Music', 'Georgian Polyphony Archive', 'Ukrainian Folk Songs Complete', 'Balkan Brass Band Archive']],
  ].forEach(([region, artists]) => {
    const regionDir = d(region as string, sWorldMusic);
    (artists as string[]).forEach(artist => {
      const artistDir = d(artist, regionDir);
      f('collection_info.txt', artistDir, `World Music: ${artist}\nRegion: ${region}\nFormat: FLAC / MP3\nSource: Archive.org`, 'text/plain');
    });
  });

  const sConcertFilms = d('Concert Films Archive', sDrive);
  [
    ['Stop Making Sense 1984 - Talking Heads', 'Jonathan Demme director, IMAX restoration'],
    ['The Last Waltz 1978 - The Band', 'Martin Scorsese director'],
    ['Gimme Shelter 1970 - Rolling Stones', 'Altamont documentary, Maysles Brothers'],
    ['Woodstock 1970 Director\'s Cut', '4-hour director\'s cut with extra performances'],
    ['Monterey Pop 1968', 'D.A. Pennebaker, Jimi Hendrix, Janis Joplin'],
    ['Don\'t Look Back 1967 - Bob Dylan', 'D.A. Pennebaker UK Tour documentary'],
    ['Ziggy Stardust and the Spiders from Mars 1973', 'D.A. Pennebaker, final Ziggy concert'],
    ['The Song Remains the Same 1976 - Led Zeppelin', 'Madison Square Garden 1973'],
    ['Pink Floyd Live at Pompeii 1972', 'Director\'s cut with 2002 footage'],
    ['Rust Never Sleeps 1979 - Neil Young', 'Cow Palace San Francisco'],
    ['Talking Heads True Stories Concert Film 1986', 'Jonathan Demme'],
    ['Joni Mitchell - Woman of Heart and Mind 2003', 'Susan Lacy documentary'],
    ['Amazing Grace 1972 - Aretha Franklin', 'Sydney Pollack, restored 2018'],
    ['Cocksucker Blues 1972 - Rolling Stones', 'Robert Frank, rarely screened'],
    ['Devo Live 1980 - Urgh A Music War', 'Miles Copeland concert film'],
    ['Dancin\' in the Street 1985 - David Bowie and Mick Jagger', 'Live Aid charity single film'],
    ['No Direction Home 2005 - Bob Dylan', 'Martin Scorsese documentary'],
    ['The Devil and Daniel Johnston 2005', 'Documentary'],
    ['DiG! 2004 - Brian Jonestown Massacre vs Dandy Warhols', 'Ondi Timoner'],
    ['Anvil The Story of Anvil 2008', 'Sacha Gervasi documentary'],
  ].forEach(([film, desc]) => {
    const filmDir = d(film, sConcertFilms);
    f('film_info.txt', filmDir, `Concert Film: ${film}\n${desc}\nSource: Archive.org`, 'text/plain');
    f(`${(film as string).split('-')[0].trim().replace(/\s+/g,'_').substring(0,30)}.mkv`, filmDir, '', 'video/x-matroska');
  });

  const sRadioSessions = d('Radio Sessions Archive', sDrive);
  [['BBC Radio Sessions', ['John Peel Sessions Complete 1967-2004 - 4,000+ sessions', 'BBC In Concert Series Archive', 'BBC Maida Vale Studios Recordings', 'Radio 1 Live Lounge Complete', 'BBC Radio 2 Folk Sessions', 'BBC Radio 3 New Generations', 'Radio 4 Drama Archive']],
   ['American Radio', ['NPR Tiny Desk Concerts Complete', 'KEXP Live Performances Archive', 'WFUV Live Concerts', 'WNYC Soundcheck Archive', 'KCRW Morning Becomes Eclectic', 'WXPN World Cafe Complete', 'World Music Radio WUMB Archive']],
   ['College Radio', ['WBUR Boston Archive', 'WFMU Free-Form Complete Archive', 'WREK Atlanta Archive', 'KFJC Los Altos Hills Archive', 'WRCT Pittsburgh Archive', 'WPRB Princeton Archive']],
  ].forEach(([network, shows]) => {
    const networkDir = d(network as string, sRadioSessions);
    (shows as string[]).forEach(show => {
      const showDir = d(show, networkDir);
      f('session_log.txt', showDir, `Radio Archive: ${show}\nNetwork: ${network}\nFormat: MP3 128kbps / FLAC 16bit`, 'text/plain');
    });
  });

  // ─── T: Drive (NAS-Seeds4 — 320TB Additional Collections) ───
  const tDrive = d('T:', rootId);
  f('disk_label.txt', tDrive, 'NAS-Seeds4 — NetApp FAS8700 320TB\nPurpose: Archive.org Overflow - Photography, Periodicals, Film\nIP: 192.168.1.206', 'text/plain');

  const tPhotography = d('Photography Archives', tDrive);
  [['Dorothea Lange - Farm Security Administration 1935-1942', 'FSA Complete Print Archive'],
   ['Walker Evans - American Photographs 1936-1938', 'Original negatives digitized'],
   ['Robert Capa - WWII Photography 1936-1954', 'Contact Press Images Archive'],
   ['Henri Cartier-Bresson - Complete Archive', 'Magnum Photos public domain selections'],
   ['Ansel Adams - National Park Photographs', 'US National Archives digitization'],
   ['Berenice Abbott - New York City 1935-1939', 'Changing New York project'],
   ['Lewis Hine - Child Labor Documentation 1908-1918', 'Library of Congress'],
   ['Jacob Riis - How the Other Half Lives 1890', 'NYPL digitization'],
   ['FSA-OWI Photograph Collection Complete', '175,000 photographs 1935-1944'],
   ['LIFE Magazine Photo Archive Pre-1972', 'Google/LIFE partnership public domain'],
  ].forEach(([name, desc]) => {
    const photoDir = d(name as string, tPhotography);
    f('archive_info.txt', photoDir, `Photography: ${name}\n${desc}\nLicense: Public Domain`, 'text/plain');
    for (let i = 1; i <= 20; i++) {
      f(`photo_${String(i).padStart(4,'0')}.jpg`, photoDir, '', 'image/jpeg');
    }
  });

  const tPeriodicals = d('Historical Periodicals', tDrive);
  [['The New York Times Historical Archive 1851-1980', 'Digitized from microfilm, searchable PDFs'],
   ['The Guardian and Observer Archive 1821-1990', 'ProQuest digitization project'],
   ['Der Spiegel Archive 1947-1995', 'German news magazine digital archive'],
   ['Le Monde Archive 1944-1990', 'French newspaper historical archive'],
   ['The Times of London 1785-1985', 'Gale Historical Newspapers'],
   ['The Chicago Tribune 1849-1980', 'ProQuest digitization'],
   ['The Washington Post 1877-1980', 'ProQuest Historical Newspapers'],
   ['The Boston Globe 1872-1980', 'ProQuest Historical Newspapers'],
   ['The Manchester Guardian 1821-1959', 'Historical newspaper archive'],
   ['The Illustrated London News 1842-1971', 'Complete run digitized'],
   ['Scientific American 1845-1909', 'First 64 years in full'],
   ['Harper\'s Weekly 1857-1916', 'Complete illustrated weekly'],
  ].forEach(([name, desc]) => {
    const periodDir = d(name as string, tPeriodicals);
    f('periodical_info.txt', periodDir, `Periodical: ${name}\n${desc}\nFormat: PDF scans\nSource: Archive.org`, 'text/plain');
    ['1850s', '1860s', '1870s', '1880s', '1890s', '1900s', '1910s', '1920s', '1930s', '1940s', '1950s', '1960s', '1970s'].forEach(decade => {
      d(decade, periodDir);
    });
  });

  const tAcademic = d('Academic and Scientific Archives', tDrive);
  [['arXiv Preprints 1991-2020 - Physics', '1.2 million physics preprints'],
   ['arXiv Preprints 1991-2020 - Mathematics', '800,000 math preprints'],
   ['arXiv Preprints 1991-2020 - Computer Science', '600,000 CS preprints'],
   ['NASA Technical Reports 1958-2000', 'NTRS digitization complete'],
   ['Bell Labs Technical Memos 1925-1984', 'Murray Hill archive'],
   ['RAND Corporation Research Archive 1948-1990', 'Declassified reports'],
   ['MIT AI Lab Technical Reports 1959-2000', 'Early AI research archive'],
   ['Stanford Linear Accelerator Reports', 'SLAC preprint server mirror'],
   ['Los Alamos National Lab Pre-Prints', 'LANL reports archive'],
   ['NIH PubMed Central Open Archive', 'Free biomedical literature'],
  ].forEach(([name, desc]) => {
    const acadDir = d(name as string, tAcademic);
    f('archive_info.txt', acadDir, `Academic Archive: ${name}\n${desc}\nSource: Archive.org`, 'text/plain');
  });

  // ─── U: Drive (NAS-Seeds5 — 480TB Classical/Jazz/Blues) ───
  const uDrive = d('U:', rootId);
  f('disk_label.txt', uDrive, 'NAS-Seeds5 — Supermicro 480TB\nPurpose: Archive.org Classical, Jazz, Blues, Folk\nIP: 192.168.1.207', 'text/plain');
  const uClassical = d('Classical Music Archive', uDrive);
  ['Bach Complete Works FLAC', 'Beethoven Complete Symphonies', 'Mozart Complete Works', 'Brahms Complete Works',
   'Chopin Complete Works', 'Schubert Complete Works', 'Wagner Ring Cycle', 'Mahler Complete Symphonies',
   'Verdi Opera Collection', 'Puccini Opera Collection', 'Baroque Masters Collection', 'Romantic Era Symphonies',
   'Glenn Gould Bach Goldberg Variations', 'Karajan BPO Complete Recordings', 'Leonard Bernstein Complete DG',
   'Vladimir Horowitz Complete RCA', 'Sviatoslav Richter Live Recordings', 'Arthur Rubinstein Complete RCA',
  ].forEach(c => d(c, uClassical));
  const uJazz = d('Jazz Archive', uDrive);
  ['Miles Davis Complete Blue Note Sessions', 'John Coltrane Complete Impulse', 'Charlie Parker Complete Savoy',
   'Duke Ellington Complete Cotton Club', 'Louis Armstrong Hot Five and Seven', 'Thelonious Monk Complete Blue Note',
   'Bill Evans Complete Riverside', 'Art Blakey Jazz Messengers Complete', 'Clifford Brown Complete Blue Note',
   'Charles Mingus Complete Debut', 'Ornette Coleman Complete Atlantic', 'Dave Brubeck Complete Columbia',
   'Wes Montgomery Complete Riverside', 'Herbie Hancock Complete Blue Note', 'Wayne Shorter Complete Blue Note',
   'Blue Note Records Complete 1939-1967', 'Prestige Records Complete 1949-1969', 'Newport Jazz Festival Collection',
  ].forEach(c => d(c, uJazz));
  const uBlues = d('Blues Folk Country Gospel Archive', uDrive);
  ['Robert Johnson Complete Recordings', 'Muddy Waters Complete Chess Sessions', 'Howlin Wolf Complete Chess',
   'BB King Live at the Regal', 'Lead Belly Complete Smithsonian', 'Son House Library of Congress',
   'Woody Guthrie Complete Archive', 'Pete Seeger Complete Recordings', 'Joan Baez Complete Vanguard',
   'Hank Williams Complete Recordings', 'Carter Family Complete RCA', 'Johnny Cash Complete Sun Sessions',
   'Alan Lomax Southern Journey Collection', 'Arhoolie Records Complete Blues', 'Folkways Records Complete Archive',
   'Gospel Music Archive 1920s-1960s', 'Sacred Harp Singing Collection', 'Cajun and Zydeco Music Archive',
  ].forEach(c => d(c, uBlues));

  // ─── V: Drive (NAS-Seeds6 — 576TB Video/Film/Games) ───
  const vDrive = d('V:', rootId);
  f('disk_label.txt', vDrive, 'NAS-Seeds6 — Dell PowerEdge 576TB\nPurpose: Archive.org Silent Films, Docs, Animation, Software\nIP: 192.168.1.208', 'text/plain');
  const vSilentFilms = d('Silent Films Archive', vDrive);
  ['Chaplin Complete Silent Films', 'Buster Keaton Complete Silent Films', 'Harold Lloyd Complete Silent Films',
   'Mack Sennett Keystone Collection', 'DW Griffith Complete Films', 'Fritz Lang Silent Films',
   'FW Murnau Complete Films', 'Sergei Eisenstein Complete Films', 'German Expressionist Cinema',
   'Lumiere Brothers Complete Films', 'Melies Complete Films', 'Early Nickelodeon Films 1894-1910',
  ].forEach(c => d(c, vSilentFilms));
  const vDocs = d('Documentary Archive', vDrive);
  ['Prelinger Archives Industrial Films', 'US Government Propaganda Films 1940s-1960s', 'NASA Films Complete Archive',
   'National Film Board of Canada', 'Civil Rights Era Documentary Collection', 'Vietnam War Documentary Archive',
   'Cold War Documentary Collection', 'WWII Documentary Archive Vol.1', 'WWII Documentary Archive Vol.2',
   'Great Depression Documentary Archive', 'Rock and Roll Era Documentary', 'Natural World Documentary Archive',
  ].forEach(c => d(c, vDocs));
  const vAnimation = d('Animation Archive', vDrive);
  ['Fleischer Studios Complete Archive', 'Van Beuren Studios Collection', 'Terrytoons Complete Archive',
   'MGM Cartoon Archive Pre-1948', 'UPA Animation Archive', 'Soviet Animation Soyuzmultfilm',
   'Eastern European Animation Archive', 'Vintage Educational Animation', 'Advertising Animation 1950s-1970s',
  ].forEach(c => d(c, vAnimation));
  const vSoftware = d('Software Games Archive', vDrive);
  ['Atari 2600 Complete ROM Collection', 'Apple II Software Complete Archive', 'Commodore 64 Complete Archive',
   'DOS Games Complete Collection 1981-1995', 'Windows 3.x Games Archive', 'Mac Classic Software Archive',
   'Sinclair ZX Spectrum Complete Archive', 'MSX Computer Software Archive', 'CP/M Software Archive',
   'Infocom Interactive Fiction Complete', 'Sierra On-Line Complete Archive', 'LucasArts Adventure Archive',
   'id Software Complete Archive', 'Microprose Complete Archive', 'MAME Arcade Complete ROM Set',
   'ScummVM Adventure Games Archive', 'Early PC Shareware 1980s-1990s', 'Vintage Console Emulation Pack',
  ].forEach(c => d(c, vSoftware));

  // ─── W: Drive (NAS-Seeds7 — 384TB Texts/Radio/News) ───
  const wDrive = d('W:', rootId);
  f('disk_label.txt', wDrive, 'NAS-Seeds7 — HPE ProLiant 384TB\nPurpose: Archive.org Texts, Newspapers, Radio Dramas\nIP: 192.168.1.209', 'text/plain');
  const wTexts = d('Texts and Books Archive', wDrive);
  ['Project Gutenberg Complete Archive 2024', 'Standard Ebooks Complete Collection', 'Open Library Collection',
   'HathiTrust Public Domain Vol.1', 'HathiTrust Public Domain Vol.2', 'Library of Congress Digital Collections',
   'British Library Public Domain Books', 'World Digital Library Archive', 'Digital Public Library of America',
   'Philosophy Classics Collection EPUB', 'Scientific Literature 1800s-1950s', 'Historical Technical Manuals',
   'Pulp Fiction Magazines 1920s-1960s', 'Science Fiction Classics Collection', 'Poetry Archive Complete',
   'Natural History Books Collection', 'Vintage Medical Textbooks', 'Folklore and Mythology Archive',
   'Childrens Books Classic Collection', 'Vintage Science Textbooks 1800s-1960s',
  ].forEach(c => d(c, wTexts));
  const wNewspapers = d('Historical Newspapers Archive', wDrive);
  ['New York Times Archive 1851-1980', 'The Guardian Archive 1821-1990', 'Washington Post Archive 1877-1970',
   'Chicago Tribune Archive 1847-1970', 'Scientific American Archive 1845-1980', 'Life Magazine Complete Archive',
   'Saturday Evening Post Archive 1821-1969', 'National Geographic Archive 1888-1970', 'Punch Magazine Complete Archive',
   'Time Magazine Archive 1923-1970', 'Rolling Stone Archive 1967-1990', 'Downbeat Magazine Archive 1934-1980',
  ].forEach(c => d(c, wNewspapers));
  const wRadio = d('Radio Audio Drama Archive', wDrive);
  ['BBC Radio Archive 1930s-1980s', 'NBC Radio Archive 1920s-1960s', 'CBS Radio Archive 1930s-1960s',
   'OTR Old Time Radio Comedy Collection', 'OTR Mystery Theater Complete Archive', 'OTR Science Fiction Radio Dramas',
   'OTR Western Programs Archive', 'OTR Horror Radio Dramas Collection', 'Radio Free Europe Archive 1950s-1980s',
   'Voice of America Archive 1942-1980', 'Presidential Speeches Complete Archive', 'WPA Oral History Project',
   'Studs Terkel Radio Collection', 'Fresh Air NPR Archive 1987-2000', 'This American Life Archive 1995-2010',
   'Pacifica Radio Archive Complete', 'Literary Readings Archive 1950s-1980s', 'Oral History Collection American Life',
  ].forEach(c => d(c, wRadio));

  // ProgramData
  const progData = d('ProgramData', cDrive);
  const msPD = d('Microsoft', progData); const winPD = d('Windows', msPD); d('Start Menu', winPD);

  // Users
  const usersDir = d('Users', cDrive);
  const publicDir = d('Public', usersDir);
  d('Public Documents', publicDir); d('Public Desktop', publicDir); d('Public Downloads', publicDir);

  const userDir = d('User', usersDir);
  const appData = d('AppData', userDir);
  const roaming = d('Roaming', appData); d('Local', appData); d('LocalLow', appData);
  const msRoaming = d('Microsoft', roaming); const winRoaming = d('Windows', msRoaming); d('Recent', winRoaming);

  const desktop = d('Desktop', userDir);
  const docs = d('Documents', userDir);
  const downloads = d('Downloads', userDir);
  const pictures = d('Pictures', userDir);
  const music = d('Music', userDir);
  const videos = d('Videos', userDir);

  // Desktop
  f('readme.txt', desktop, 'Welcome to Windows 10!\n\nThis is a web-based clone built with React.\nDouble-click files to open them.\nUse the Start Menu to launch apps.\n\nApps: File Explorer, Browser (YouTube!), Notepad, Word, Excel, PowerPoint,\nOutlook, OneNote, Photoshop, Illustrator, Premiere, After Effects, AutoCAD, SolidWorks', 'text/plain');
  f('Getting Started.txt', desktop, 'Getting Started\n===============\n\nTips:\n- Ctrl+S saves in Notepad/Word\n- Drag windows by title bar\n- Resize windows from any edge\n- Double-click title bar to maximize\n- Task Manager shows real performance stats', 'text/plain');

  // Documents - Personal
  f('Daily Journal.txt', docs, 'Personal Journal\n================\n\nMarch 15, 2025\n--------------\nHad a great day today. Finished the project I\'ve been working on for the past two weeks. The client seemed really happy with the results.\n\nAlso started reading "Atomic Habits" again. The chapter on identity-based habits is really clicking with me this time.\n\nMarch 14, 2025\n--------------\nLong day at work. The meeting ran over by an hour, but we finally reached a consensus on the new architecture. Feeling good about the direction we\'re heading.', 'text/plain');

  f('Story - The Last Signal.txt', docs, 'THE LAST SIGNAL\nA Short Story\n\nThe radio crackled at 3:47 AM, pulling Mara from a dreamless sleep. She had almost forgotten the old receiver was still plugged in — a relic from her father\'s time, when shortwave was how you heard the world.\n\n"...if anyone can hear this, we are at coordinates 47.2 north, 12.8 east. We have been here for eleven days. The water is almost gone."\n\nMara sat up, her heart hammering. The voice was a young man\'s, hoarse and cracked with thirst. She grabbed a notepad.\n\n"Eleven days," she whispered. That meant they\'d gone missing around the 4th — the same weekend the storm had taken out the mountain roads.\n\nShe reached for her phone to call search and rescue, then stopped. The signal was patchy. If she lost the frequency...\n\nShe kept writing instead.', 'text/plain');

  f('Brainstorm - App Ideas.txt', docs, 'APP IDEAS BRAINSTORM\n====================\n\n=== GOOD IDEAS ===\n\n1. Habit Streak Tracker\n   - Track daily habits with streaks\n   - Social accountability features\n\n2. Local Recipe Finder\n   - Input ingredients you have at home\n   - Get recipe suggestions\n   - Filter by cuisine, time, difficulty\n\n3. Focus Timer with Music\n   - Pomodoro technique built-in\n   - Auto-plays lo-fi music\n   - Blocks distracting sites during sessions\n\n4. Plant Care Reminder\n   - Photo-based plant identification\n   - Custom watering schedules\n\n=== DROPPED ===\n- Another to-do app (market saturated)\n- Crypto tracker (already too many)', 'text/plain');

  f('Meeting Notes - Q1 Planning.txt', docs, 'Q1 PLANNING MEETING NOTES\n=========================\nDate: January 15, 2025\nAttendees: Sarah, Mike, Dev Team, PM\n\nKEY DECISIONS\n-------------\n- Launch new onboarding flow by Feb 28\n- Migrate to new database by March 15\n- Hire 2 more backend devs\n\nACTION ITEMS\n------------\n[ ] Mike: Create Jira tickets by Jan 20\n[ ] Dev team: Code review process by Jan 22\n[ ] PM: Update roadmap by Jan 19\n[ ] All: Self-review for performance cycle by Feb 1', 'text/plain');

  f('Book List 2025.txt', docs, 'READING LIST 2025\n=================\n\nCOMPLETED\n- Atomic Habits - James Clear\n- The Pragmatic Programmer\n- Deep Work - Cal Newport\n\nCURRENTLY READING\n- Thinking, Fast and Slow - Kahneman\n\nTO READ\n- The Creative Act - Rick Rubin\n- Zero to One - Peter Thiel\n- Dune - Frank Herbert\n- Clean Code - Robert C. Martin\n- Project Hail Mary - Andy Weir\n\nGOAL: 20 books this year', 'text/plain');

  f('Budget 2025.txt', docs, 'MONTHLY BUDGET 2025\n===================\n\nINCOME\nSalary (net):     $5,200\nFreelance (avg):  $  800\nTotal:            $6,000\n\nFIXED EXPENSES\nRent:             $1,400\nCar payment:      $  380\nInsurance:        $  210\nInternet:         $   60\nPhone:            $   85\nSubscriptions:    $   95\nGym:              $   45\nTotal Fixed:      $2,275\n\nSAVINGS\n401k:             $  520\nEmergency fund:   $  500\nInvestments:      $  500\nTotal Savings:    $1,520\n\nDISCRETIONARY:    $1,285', 'text/plain');

  // Documents - Homework
  const homework = d('Homework', docs);

  f('Math - Calculus Problem Set 4.txt', homework, 'CALCULUS PROBLEM SET 4\nMAT 201 - Due: March 20, 2025\n\n1. Find the derivative of f(x) = 3x^4 - 7x^3 + 2x^2 - 9x + 4\n   f\'(x) = 12x^3 - 21x^2 + 4x - 9\n\n2. Evaluate the integral: integral(2x^3 + 5x) dx\n   = x^4/2 + (5x^2)/2 + C\n\n3. Find the critical points of g(x) = x^3 - 6x^2 + 9x - 4\n   g\'(x) = 3x^2 - 12x + 9 = 3(x-1)(x-3)\n   Critical points: x=1 (local max), x=3 (local min)\n\n[ ] Problems 4-6 - need to review chain rule\n[ ] Problem 7 - related rates (check textbook p.284)', 'text/plain');

  f('History - Essay Draft - WW2.txt', homework, 'HISTORY 102 - Essay Draft\nCauses of World War II\nDue: March 25, 2025\n\nTHESIS: World War II resulted from the convergence of political extremism, failed diplomacy, and unresolved tensions from the Treaty of Versailles.\n\nBODY 1: Treaty of Versailles\nThe harsh reparations imposed on Germany created economic instability and resentment that Hitler exploited. The "war guilt clause" (Article 231) forced Germany to accept full responsibility...\n[NEED MORE SOURCES]\n\nBODY 2: Rise of Fascism\n[TODO]\n- Italy under Mussolini (1922)\n- Germany under Hitler (1933)\n- Economic depression as catalyst\n\nSOURCES NEEDED:\n- Keegan: The Second World War\n- Shirer: Rise and Fall of Third Reich', 'text/plain');

  f('CS - Programming Assignment 3.txt', homework, 'CS 301 - DATA STRUCTURES\nAssignment 3: Binary Search Tree\nDue: March 22, 2025\n\nINSERT ALGORITHM:\n1. Start at root\n2. If value < current, go left; if >, go right\n3. Insert at null position\nTime complexity: O(log n) average, O(n) worst case\n\nDELETE CASES:\n- Case 1: No children - simply remove\n- Case 2: One child - replace with child\n- Case 3: Two children - replace with in-order successor\n\nTEST CASES:\n[x] Insert into empty tree\n[x] Insert duplicates\n[x] Delete leaf node\n[x] Delete with one child\n[ ] Delete with two children - still working\n[ ] Balance check', 'text/plain');

  f('Biology - Lab Report - Osmosis.txt', homework, 'BIOLOGY 101 LAB REPORT\nOsmosis in Plant Cells\nDate: March 10, 2025\n\nHYPOTHESIS: Potato slices in higher salt solutions will lose more mass due to osmosis.\n\nRESULTS:\n0% NaCl:  +3.2% mass gain (hypotonic)\n1% NaCl:  +0.8% slight gain\n2% NaCl:  -1.4% slight loss\n4% NaCl:  -5.7% mass loss (hypertonic)\n\nCONCLUSION: Hypothesis supported. As NaCl increased, potato slices lost progressively more mass, demonstrating osmosis across a semi-permeable membrane.', 'text/plain');

  f('English - Book Report - Gatsby.txt', homework, 'ENGLISH 201 BOOK REPORT\nThe Great Gatsby - F. Scott Fitzgerald\nGrade received: A-\n\nTHEMES ANALYSIS\n\nTHE AMERICAN DREAM\nFitzgerald presents the American Dream as fundamentally hollow. Gatsby\'s wealth cannot buy Daisy\'s love or acceptance into old money society. The green light symbolizes a dream always just out of reach.\n\n"So we beat on, boats against the current, borne back ceaselessly into the past."\n\nCLASS DIVISIONS\n- Old money (East Egg): Buchanans - careless and destructive\n- New money (West Egg): Gatsby - aspiring but never accepted\n- No money (Valley of Ashes): Wilson - victim\n\nPROFESSOR NOTES: "Strong thesis. Develop the color symbolism further - yellow vs. gold throughout."', 'text/plain');

  f('Physics - Notes Chapter 7.txt', homework, 'PHYSICS 202 - ELECTROMAGNETIC INDUCTION\n\nFARADAY\'S LAW:\nEMF = -N x (dPhi/dt)\n\nwhere N = coil turns, Phi = magnetic flux\nNegative sign = LENZ\'S LAW (induced current opposes change)\n\nEXAMPLE:\n100-turn coil, area 0.01 m^2\nB changes 0.1T to 0.5T in 0.2s\nEMF = -100 x (0.01 x 2) = -2V\n\n[ ] Problem set 7.1-7.5\n[ ] Lab pre-report for Thursday\n[ ] Review for quiz March 20', 'text/plain');

  // Documents - Work
  const workDir = d('Work', docs);
  f('Project Proposal - Mobile App.txt', workDir, 'PROJECT PROPOSAL\nCustomer Mobile App v2.0\nDate: February 2025\n\nPROBLEM: Current app has 2.3 star rating. Issues: slow (4.2s load), confusing nav, no offline.\n\nSOLUTION:\n1. Complete UI/UX redesign\n2. Offline-first architecture\n3. Load time under 1.5s\n4. Smart notifications\n\nBUDGET:\nDesign:      $15,000\nDevelopment: $85,000\nTesting:     $12,000\nMarketing:   $18,000\nTotal:       $130,000\n\nSTATUS: Approved Feb 20', 'text/plain');

  f('Team Contacts.txt', workDir, 'TEAM CONTACTS\n=============\nAlex Johnson (me) - Lead Dev - ext. 4421\nSarah Chen - Backend Dev - ext. 4408\nMike Torres - Frontend Dev - ext. 4415\nJamie Kim - QA Engineer - ext. 4419\nPriya Patel - DevOps - ext. 4423\nLucas Moore - Lead Designer - ext. 4430\nDavid Park - Product Manager - ext. 4401\n\nIT Helpdesk: ext. 4499', 'text/plain');

  // Office Documents folder
  const officeDir = d('Office Documents', docs);

  const wordDir = d('Word Documents', officeDir);
  f('Resume_2025.docx', wordDir, 'RESUME\n\nAlex Johnson\nalexjohnson@email.com | (555) 123-4567 | LinkedIn: /in/alexjohnson\n\nSUMMARY\nFull-stack software engineer with 6+ years experience building scalable web applications.\n\nEXPERIENCE\n----------\nSenior Software Engineer | TechCorp Inc | 2021-Present\n- Led development of customer-facing mobile app (React Native, 500k+ users)\n- Reduced API response time by 40% through caching optimizations\n- Mentored 3 junior engineers\n\nSoftware Engineer | StartupXYZ | 2019-2021\n- Built real-time dashboard using React + WebSockets\n- Implemented CI/CD pipeline reducing deployment time from 2hr to 15min\n\nEDUCATION\n---------\nB.S. Computer Science | State University | 2019\nGPA: 3.8/4.0\n\nSKILLS\n------\nLanguages: JavaScript/TypeScript, Python, Go, SQL\nFrameworks: React, Node.js, Express, FastAPI\nTools: Docker, Kubernetes, AWS, Git', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

  f('Cover Letter - Google.docx', wordDir, 'Dear Hiring Manager,\n\nI am writing to express my strong interest in the Senior Software Engineer position at Google. With over 6 years of full-stack development experience and a passion for building products at scale, I believe I would be a valuable addition to your team.\n\nIn my current role at TechCorp, I led the complete redesign of our mobile application, resulting in a 4.2-star App Store rating and a 35% increase in daily active users. I am particularly drawn to Google\'s commitment to innovation and the opportunity to work on products that impact billions of people worldwide.\n\nI would welcome the opportunity to discuss how my experience aligns with Google\'s needs.\n\nSincerely,\nAlex Johnson', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

  f('Meeting Agenda Template.docx', wordDir, 'MEETING AGENDA\n==============\nDate: [DATE]\nTime: [TIME]\nLocation: [ROOM / ZOOM LINK]\nFacilitator: [NAME]\n\nATTENDEES\n---------\n1.\n2.\n3.\n\nAGENDA ITEMS\n------------\n1. [Item 1] - [Time allocation]\n   - Discussion points:\n   - Decision needed:\n\n2. [Item 2] - [Time allocation]\n   - Discussion points:\n   - Decision needed:\n\nACTION ITEMS FROM LAST MEETING\n------------------------------\n[ ] Action 1 - Owner - Due date\n[ ] Action 2 - Owner - Due date\n\nNEW ACTION ITEMS\n----------------\n\nNEXT MEETING\n------------\nDate:\nTime:', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

  const excelDir = d('Excel Spreadsheets', officeDir);
  f('Budget_2025.xlsx', excelDir, 'Monthly Budget Spreadsheet\n\nRow 1: Category | Jan | Feb | Mar | Apr | May | Jun | Total\nRow 2: Rent | 1400 | 1400 | 1400 | 1400 | 1400 | 1400 | =SUM(B2:G2)\nRow 3: Car Payment | 380 | 380 | 380 | 380 | 380 | 380 | =SUM(B3:G3)\nRow 4: Groceries | 320 | 350 | 380 | 310 | 340 | 360 | =SUM(B4:G4)\nRow 5: Utilities | 120 | 115 | 95 | 80 | 75 | 70 | =SUM(B5:G5)\nRow 6: Entertainment | 180 | 220 | 150 | 200 | 175 | 190 | =SUM(B6:G6)\nRow 7: TOTAL | =SUM(B2:B6) | =SUM(C2:C6) | =SUM(D2:D6)', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  f('Project_Tracker.xlsx', excelDir, 'PROJECT TRACKER\n\nTask | Owner | Status | Priority | Due Date | % Complete\nDesign mockups | Lucas | Done | High | Jan 20 | 100%\nBackend API | Sarah | In Progress | High | Feb 15 | 65%\nFrontend UI | Mike | In Progress | High | Feb 20 | 40%\nQA Testing | Jamie | Not Started | Medium | Mar 1 | 0%\nDocumentation | Alex | Not Started | Low | Mar 10 | 0%\nDeployment | Priya | Not Started | High | Mar 15 | 0%', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  f('Sales_Data_Q1.xlsx', excelDir, 'Q1 SALES DATA\n\nMonth | Product A | Product B | Product C | Total | Target | Variance\nJanuary | 45200 | 32100 | 18400 | 95700 | 90000 | +6.3%\nFebruary | 41800 | 35600 | 21200 | 98600 | 92000 | +7.2%\nMarch | 52300 | 38900 | 24100 | 115300 | 100000 | +15.3%\nQ1 Total | 139300 | 106600 | 63700 | 309600 | 282000 | +9.8%', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  const pptDir = d('PowerPoint Presentations', officeDir);
  f('Q1_Review_Presentation.pptx', pptDir, 'SLIDE 1: Q1 2025 Review\nPresented by: Alex Johnson\nDate: April 2025\n\nSLIDE 2: Highlights\n- Revenue up 9.8% vs target\n- Shipped 3 major features\n- Hired 2 new team members\n- NPS score improved from 32 to 47\n\nSLIDE 3: Key Metrics\n- Monthly Active Users: 124,500 (+18% QoQ)\n- Conversion Rate: 3.4% (+0.6%)\n- Avg Session Duration: 8m 42s (+2m)\n- Churn Rate: 2.1% (-0.4%)\n\nSLIDE 4: Challenges\n- Server costs increased 22%\n- Onboarding completion rate at 61% (target: 75%)\n- 2 key features delayed to Q2\n\nSLIDE 5: Q2 Roadmap\n- Launch redesigned onboarding (April)\n- Mobile app v2.0 (May)\n- API v3 migration (June)\n- International expansion planning\n\nSLIDE 6: Thank You\nQuestions?', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');

  f('New_Employee_Onboarding.pptx', pptDir, 'SLIDE 1: Welcome to the Team!\nYour first 30 days guide\n\nSLIDE 2: Company Overview\n- Founded: 2018\n- Team size: 85 employees\n- Mission: Making technology accessible\n- Values: Innovation, Integrity, Impact\n\nSLIDE 3: Your First Week\n- Day 1: HR orientation, equipment setup\n- Day 2: Meet your team\n- Day 3-4: Product deep-dive\n- Day 5: Shadow senior team member\n\nSLIDE 4: Tools We Use\n- Communication: Slack\n- Project management: Jira\n- Code: GitHub\n- Design: Figma\n- Docs: Confluence\n\nSLIDE 5: Important Contacts\n- Your manager: David Park\n- HR: hr@company.com\n- IT: ext. 4499\n- Office manager: Emma', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');

  // Downloads - filled with popular files
  f('setup_vscode.exe', downloads, '', 'application/x-msdownload');
  f('ChromeSetup.exe', downloads, '', 'application/x-msdownload');
  f('Discord-0.0.309-full.exe', downloads, '', 'application/x-msdownload');
  f('Spotify_Setup_1.2.26.exe', downloads, '', 'application/x-msdownload');
  f('VLC-3.0.20-win64.exe', downloads, '', 'application/x-msdownload');
  f('Steam_Setup.exe', downloads, '', 'application/x-msdownload');
  f('OBSStudio-30.0.2-Windows.exe', downloads, '', 'application/x-msdownload');
  f('7z2406-x64.exe', downloads, '', 'application/x-msdownload');
  f('WinRAR_7.00_x64.exe', downloads, '', 'application/x-msdownload');
  f('node-v20.11.0-x64.msi', downloads, '', 'application/x-msi');
  f('python-3.12.2-amd64.exe', downloads, '', 'application/x-msdownload');
  f('Git-2.44.0-64-bit.exe', downloads, '', 'application/x-msdownload');
  f('dotnet-sdk-8.0.100-win-x64.exe', downloads, '', 'application/x-msdownload');
  f('MinecraftInstaller.exe', downloads, '', 'application/x-msdownload');
  f('zoom_installer_5.17.exe', downloads, '', 'application/x-msdownload');
  f('slack-4.36.138-full.exe', downloads, '', 'application/x-msdownload');
  f('figma-115.9.5-win32-setup.exe', downloads, '', 'application/x-msdownload');
  f('vacation_photos_2024.zip', downloads, '', 'application/zip');
  f('project_backup_march.zip', downloads, '', 'application/zip');
  f('music_collection.zip', downloads, '', 'application/zip');
  f('drivers_rtx4070.zip', downloads, '', 'application/zip');
  f('invoice_march_2025.pdf', downloads, 'INVOICE #2025-0312\nFrom: Freelance Client Corp\nTo: Alex Johnson\nDate: March 12, 2025\n\nServices: Web development consulting\nHours: 24 @ $95/hr\nTotal: $2,280.00\nTax: $182.40\nTOTAL DUE: $2,462.40', 'application/pdf');
  f('tax_return_2024.pdf', downloads, 'TAX RETURN 2024\nFederal Income Tax Return\nForm 1040\n\nFiling Status: Single\nAdjusted Gross Income: $72,450\nTaxable Income: $58,120\nTotal Tax: $8,512\nRefund Amount: $1,243', 'application/pdf');
  f('lease_agreement_2024.pdf', downloads, 'RESIDENTIAL LEASE AGREEMENT\nProperty: 123 Main Street, Apt 4B\nTerm: January 1, 2024 - December 31, 2024\nMonthly Rent: $1,400\nSecurity Deposit: $2,800', 'application/pdf');
  f('roadmap-q2-2025.pdf', downloads, 'Q2 2025 PRODUCT ROADMAP\nConfidential - Internal Use Only\n\nApril: Mobile app v2.0 launch\nMay: API v3 migration\nJune: International expansion phase 1', 'application/pdf');
  f('react-hooks-cheatsheet.pdf', downloads, 'REACT HOOKS CHEATSHEET\n\nuseState - State management\nuseEffect - Side effects\nuseContext - Context consumption\nuseRef - DOM refs & mutable values\nuseCallback - Memoized callbacks\nuseMemo - Memoized values', 'application/pdf');
  f('system-design-notes.txt', downloads, 'SYSTEM DESIGN NOTES\n\nScalability Patterns:\n1. Horizontal scaling (add more servers)\n2. Caching (Redis, Memcached)\n3. CDN for static assets\n4. Database sharding\n5. Message queues (RabbitMQ, Kafka)\n\nCAP Theorem:\n- Consistency, Availability, Partition tolerance\n- Choose 2 of 3', 'text/plain');
  f('shortcuts.txt', downloads, 'KEYBOARD SHORTCUTS REFERENCE\n\nWindows:\nWin+D - Show desktop\nWin+E - File Explorer\nWin+L - Lock screen\nAlt+F4 - Close window\nCtrl+Shift+Esc - Task Manager\n\nVS Code:\nCtrl+P - Quick open\nCtrl+Shift+P - Command palette\nCtrl+` - Terminal\nAlt+Up/Down - Move line', 'text/plain');

  // Pictures folder - subfolders and photos
  const picsVacation = d('Vacation 2024', pictures);
  f('trip_notes.txt', picsVacation, 'EUROPE TRIP 2024 - July 14-26\n\nPrague: Old Town Square, Charles Bridge, Prague Castle\nVienna: Schönbrunn Palace, Belvedere, Naschmarkt\nBudapest: Parliament, Fisherman\'s Bastion, ruin bars\n\nBest food: Trdelník in Prague, Wiener Schnitzel in Vienna, Lángos in Budapest\nBest photo spot: Charles Bridge at sunrise (go early!)', 'text/plain');
  f('IMG_4821.jpg', picsVacation, '', 'image/jpeg');
  f('IMG_4835.jpg', picsVacation, '', 'image/jpeg');
  f('IMG_4902.jpg', picsVacation, '', 'image/jpeg');
  f('IMG_5011.jpg', picsVacation, '', 'image/jpeg');
  f('IMG_5234.jpg', picsVacation, '', 'image/jpeg');

  const picsScreenshots = d('Screenshots', pictures);
  f('screenshot_2024-12-15.png', picsScreenshots, '', 'image/png');
  f('screenshot_2025-01-08.png', picsScreenshots, '', 'image/png');
  f('screenshot_2025-02-22.png', picsScreenshots, '', 'image/png');
  f('meme_collection.zip', picsScreenshots, '', 'application/zip');

  const picsWallpapers = d('Wallpapers', pictures);
  f('mountain_sunrise.jpg', picsWallpapers, '', 'image/jpeg');
  f('ocean_waves.jpg', picsWallpapers, '', 'image/jpeg');
  f('neon_city.png', picsWallpapers, '', 'image/png');
  f('space_nebula.jpg', picsWallpapers, '', 'image/jpeg');
  f('forest_morning.jpg', picsWallpapers, '', 'image/jpeg');

  f('profile_photo.jpg', pictures, '', 'image/jpeg');
  f('photo_editing_notes.txt', pictures, 'PHOTO EDITING NOTES\n\nSoftware: Lightroom + Photoshop\nPreset: "Golden Hour" (bumps warmth +25, clarity +15, dehaze +10)\n\nBatch editing tips:\n- Use auto tone as starting point\n- Sync settings across similar shots\n- Export at 80% JPEG quality for sharing', 'text/plain');

  // Music folder
  const musicPlaylists = d('Playlists', music);
  f('coding_playlist.txt', musicPlaylists, 'CODING PLAYLIST 2025\n\nFocus Mode:\n1. Tycho - Awake\n2. Jon Hopkins - Immunity\n3. Boards of Canada - Music Has the Right\n4. Brian Eno - Ambient 1\n5. Nils Frahm - Spaces\n\nHigh Energy:\n1. Daft Punk - Random Access Memories\n2. The Chemical Brothers - We Are the Night\n3. Justice - Cross\n\nLate Night:\n1. Nujabes - Modal Soul\n2. J Dilla - Donuts\n3. Mac Miller - Circles', 'text/plain');
  f('workout_playlist.txt', musicPlaylists, 'WORKOUT PLAYLIST\n\n1. Eye of the Tiger - Survivor\n2. Lose Yourself - Eminem\n3. Power - Kanye West\n4. Till I Collapse - Eminem\n5. Stronger - Kanye West\n6. Run the World - Beyoncé\n7. Can\'t Hold Us - Macklemore\n8. Work B**ch - Britney Spears', 'text/plain');

  f('music_library_info.txt', music, 'MUSIC LIBRARY\n\nTotal: 2,847 songs | 18.4 GB\n\nTop Artists:\n1. Radiohead (127 songs)\n2. Daft Punk (89 songs)\n3. The Beatles (213 songs)\n4. Kanye West (156 songs)\n5. Taylor Swift (178 songs)\n\nFormats: MP3 (mostly), FLAC (audiophile picks), AAC (from iTunes)\nOrganized by: Artist > Album', 'text/plain');

  // Videos folder
  const videosMovies = d('Movies', videos);
  f('movies_to_watch.txt', videosMovies, 'MOVIES WATCHLIST\n\nNot Watched:\n[ ] Oppenheimer (2023)\n[ ] Past Lives (2023)\n[ ] The Zone of Interest (2023)\n[ ] Poor Things (2023)\n[ ] Killers of the Flower Moon (2023)\n\nFavorites:\n[x] The Shawshank Redemption\n[x] Inception\n[x] Interstellar\n[x] Parasite\n[x] Everything Everywhere All at Once', 'text/plain');

  const videosClips = d('Clips', videos);
  f('clip_notes.txt', videosClips, 'VIDEO CLIPS\n\nGaming Highlights:\n- cs2_ace_round_47.mp4 (saved on OBS)\n- minecraft_timelapse.mp4\n- elden_ring_boss_kill.mp4\n\nPersonal:\n- birthday_party_2024.mp4\n- prague_walk.mp4\n- concert_clips.mp4', 'text/plain');

  f('watch_later.txt', videos, 'WATCH LATER\n\nYouTube:\n- Rust in 100 seconds - Fireship\n- System Design Interview - ByteByteGo\n- The Copenhagen Interpretation - PBS Space Time\n- How Linux Works - LiveOverflow\n- Building a Compiler - Tsoding\n\nNetflix:\n- Dark (finish season 3)\n- The Bear (season 3)\n- Beef\n\nPrime Video:\n- The Boys season 4\n- Fallout\n\nHBO Max:\n- The Last of Us season 2\n- Succession (rewatch)', 'text/plain');

  // More files in Documents subfolders
  f('Interview Prep Notes.txt', docs, 'INTERVIEW PREP\n=============\n\nBehavioral (STAR method):\n1. Tell me about a challenging project\n   Situation: Mobile app rewrite needed\n   Task: Lead architecture decisions\n   Action: Proposed microservices approach\n   Result: 40% performance improvement\n\nTechnical Topics:\n[ ] System design (LLD + HLD)\n[ ] Data structures & algorithms\n[ ] React performance optimization\n[ ] Node.js async patterns\n[ ] Docker/Kubernetes basics\n[ ] SQL query optimization', 'text/plain');
  f('Recipes.txt', docs, 'FAVORITE RECIPES\n================\n\nPasta Carbonara (serves 2)\n--------------------------\nIngredients:\n- 200g spaghetti\n- 100g pancetta or guanciale\n- 2 eggs + 1 yolk\n- 50g pecorino romano\n- Black pepper\n\nSteps:\n1. Cook pasta, reserve 100ml pasta water\n2. Fry pancetta until crispy\n3. Mix eggs, cheese, pepper\n4. Toss pasta with pancetta, off heat add egg mix\n5. Add pasta water to emulsify\n\nBest Chocolate Chip Cookies\n---------------------------\n- 2¼ cups flour, 1 tsp baking soda, 1 tsp salt\n- 2 sticks butter (room temp), ¾ cup sugar, ¾ cup brown sugar\n- 2 eggs, 2 tsp vanilla\n- 2 cups chocolate chips\nBake 375°F for 9-11 min (underbake slightly!)', 'text/plain');
  f('2025 Goals.txt', docs, '2025 GOALS\n==========\n\nCareer:\n[x] Get promoted to Senior Engineer (Q1)\n[ ] Learn Rust (by June)\n[ ] Contribute to open source (ongoing)\n[ ] Get AWS Solutions Architect cert\n\nHealth:\n[ ] Run a 5K under 25 minutes\n[ ] Go to gym 4x/week consistently\n[ ] Sleep 7.5+ hours nightly\n\nPersonal:\n[x] Read 20 books\n[ ] Learn to cook 10 new recipes\n[ ] Visit 2 new countries\n[ ] Save $15K for down payment\n\nProgress: 4/12 goals completed', 'text/plain');

  f('API Keys - DO NOT SHARE.txt', docs, 'API KEYS REFERENCE (DUMMY)\n==========================\nNOTE: These are placeholder examples only.\n\nDev environment:\n- Use .env files, never hardcode\n- Rotate keys every 90 days\n- Use secrets manager in production\n\nServices I use:\n- OpenWeatherMap API (free tier)\n- Google Maps Embed API\n- SendGrid for email\n\nSee: password manager for actual keys', 'text/plain');

  f('Freelance Clients.txt', workDir, 'FREELANCE CLIENTS 2025\n=====================\n\nActive:\n1. Acme Corp\n   Contact: Jennifer Walsh\n   Rate: $95/hr\n   Project: E-commerce redesign\n   Hours: 24 invoiced, 15 remaining\n\n2. StartupABC\n   Contact: Marcus Lee\n   Rate: $85/hr\n   Project: MVP development\n   Hours: 40 invoiced\n\nPotential:\n- Restaurant chain (referral from Marcus)\n  Needs: Mobile app + POS integration\n  Budget: $25-40k', 'text/plain');

  f('Sprint Notes - Week 12.txt', workDir, 'SPRINT 12 NOTES - Week of March 10\n====================================\n\nCompleted:\n[x] API endpoint for user preferences\n[x] Unit tests for auth module\n[x] Fixed iOS Safari bug on login form\n[x] Code review for Sarah\'s PR #284\n\nIn Progress:\n[~] Dashboard performance optimization\n[~] Notification system redesign\n\nBlocked:\n[ ] Payment integration (waiting on PCI compliance docs)\n\nRetro actions from last sprint:\n- Added ESLint rule to prevent any-types\n- Daily 15-min sync added to reduce Slack noise', 'text/plain');

  // ── Additional Word Documents ────────────────────────────────────────────
  f('Technical_Spec_v2.docx', wordDir, 'TECHNICAL SPECIFICATION\nCustomer Portal v2.0\nRevision: 2.3 | Date: March 2025\nAuthor: Alex Johnson\n\n1. OVERVIEW\n-----------\nThis document specifies the architecture and implementation requirements\nfor the Customer Portal v2.0 redesign. The portal serves 124,500 MAUs\nand must achieve sub-1.5s load times on 4G connections.\n\n2. ARCHITECTURE\n---------------\nFrontend: React 18 + TypeScript (strict)\nState: Zustand + React Query\nAPI: REST + GraphQL (migration in progress)\nAuth: OAuth 2.0 + JWT (15-min access tokens)\nDatabase: PostgreSQL 15 (primary) + Redis (cache)\nInfra: AWS ECS Fargate + CloudFront + RDS\n\n3. API ENDPOINTS\n---------------\nGET  /api/v2/users/:id          - User profile\nPOST /api/v2/auth/token         - Issue JWT\nDEL  /api/v2/auth/token         - Revoke JWT\nGET  /api/v2/dashboard          - Dashboard data\nPATCH /api/v2/preferences       - Update settings\n\n4. PERFORMANCE REQUIREMENTS\n---------------------------\nLCP (Largest Contentful Paint): < 1.5s\nFID (First Input Delay): < 100ms\nCLS (Cumulative Layout Shift): < 0.1\nTime to Interactive: < 2.0s\nBundle size: < 200KB gzipped\n\n5. SECURITY\n-----------\n- HTTPS everywhere (HSTS header)\n- CSP Level 3\n- Input validation on all forms\n- Rate limiting: 100 req/min per user\n- Audit logging for sensitive actions\n\n6. OPEN ISSUES\n--------------\n[HIGH] Session timeout handling UX\n[MED]  Offline mode fallback\n[LOW]  Dark mode persistence across devices', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

  f('Short_Story_Neon_City.docx', wordDir, 'NEON CITY\nA Short Story by Alex Johnson\n\nThe rain hadn\'t stopped for six days. Marcus stood at the window of his forty-third-floor apartment, watching the city bleed color into the streets below. Red from the ramen shop on Fifth. Blue from the police drones that circled every four hours. Green from the biotech billboard that promised immortality for a modest monthly subscription.\n\nHis phone buzzed. Unknown number — but the area code was from the server district, which meant it was probably Sasha.\n\n"You\'re late," she said before he could speak.\n"I\'m never late. I arrive at the precise moment things get interesting."\n"The chip is gone, Marcus. Someone moved it before we could."\n\nHe pressed his forehead against the cold glass. Forty-three floors down, a food delivery drone clipped a traffic light and spun out, scattering ramen containers across the intersection. Nobody looked up.\n\n"How long ago?" he asked.\n"Six hours. Maybe seven. The logs were wiped."\n"Professional."\n"Very."\n\nHe grabbed his jacket — the one with the Faraday lining — and headed for the door. The chip contained twelve years of corporate memory. Whoever had it now didn\'t just own a secret. They owned a weapon.\n\nAnd someone had just fired it.', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

  f('Business_Plan_Draft.docx', wordDir, 'BUSINESS PLAN — DRAFT\nFocusFlow: AI-Powered Deep Work Assistant\nDate: February 2025\n\nEXECUTIVE SUMMARY\n-----------------\nFocusFlow is a subscription SaaS that combines Pomodoro timers, ambient sound generation, AI task coaching, and website blocking into one seamless productivity platform.\n\nTarget market: Remote workers, students, freelancers (TAM: $4.2B)\nRevenue model: $9.99/mo personal, $14.99/mo pro, $24.99/mo team\nGoal: 10,000 paying subscribers by Month 12\n\nMARKET ANALYSIS\n---------------\nPrimary competitors:\n- Forest App: mobile-only, no AI, limited integrations\n- Notion: general productivity, not focus-specific\n- RescueTime: tracking only, no active coaching\n\nDifferentiator: Real-time AI coach that adapts session length and task ordering based on cognitive load patterns.\n\nFINANCIAL PROJECTIONS (Year 1)\n-------------------------------\nMonth 1-3:   500 users   | MRR: $4,997\nMonth 4-6:   2,100 users | MRR: $20,979\nMonth 7-9:   5,800 users | MRR: $57,942\nMonth 10-12: 10,000 users| MRR: $99,900\n\nBurnRate: $18,000/mo (2 founders, no office)\nRunway: 18 months (current savings + $150k friends & family)\n\nMILESTONES\n----------\nApril 2025: Beta launch (100 invited users)\nJune 2025:  Public launch + Product Hunt\nSept 2025:  iOS & Android apps\nDec 2025:   Team plan + Slack integration\nMar 2026:   Series A fundraise ($2M target)', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

  f('Research_Notes_LLMs.docx', wordDir, 'RESEARCH NOTES — Large Language Models\nAlex Johnson | Ongoing since Jan 2024\n\nKEY PAPERS READ\n---------------\n[x] Attention Is All You Need (Vaswani et al., 2017)\n    - Introduced transformer architecture\n    - Multi-head attention mechanism\n    - Positional encoding replaces recurrence\n\n[x] GPT-3 (Brown et al., 2020)\n    - 175B parameters, few-shot learning\n    - In-context learning without fine-tuning\n    - Scaling laws first demonstrated clearly\n\n[x] Chain-of-Thought Prompting (Wei et al., 2022)\n    - "Let\'s think step by step" improves reasoning\n    - Emergent in models >100B params\n\n[x] Constitutional AI (Anthropic, 2022)\n    - RLHF replacement using AI feedback\n    - Reduces human labor for alignment\n\n[ ] Mixtral of Experts (Mistral, 2023)\n[ ] Mamba SSM (Gu & Dao, 2023)\n[ ] Flash Attention 2 (Dao, 2023)\n\nINTERESTING OBSERVATIONS\n------------------------\n- Scaling laws seem to hold but plateauing in some benchmarks\n- Instruction-following > raw capability for most use cases\n- RAG is surprisingly competitive with larger models\n- Quantization (4-bit) has minimal quality loss in practice\n\nQUESTIONS TO EXPLORE\n--------------------\n- What is the minimum model size for reliable tool use?\n- Can mixture-of-experts close the gap with dense models?\n- How does context length affect reasoning quality?', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

  f('Letter_of_Recommendation.docx', wordDir, 'LETTER OF RECOMMENDATION\n\nMarch 10, 2025\n\nDear Admissions Committee,\n\nI am writing to enthusiastically recommend Sarah Chen for the Graduate Program in Computer Science at MIT. I have had the pleasure of working with Sarah for two years at TechCorp Inc., where she served as a Backend Software Engineer on my team.\n\nSarah consistently demonstrates exceptional technical skill combined with remarkable communication ability — a rare combination. In her first six months, she independently redesigned our authentication service, reducing login latency from 340ms to 47ms, a 7x improvement that directly impacted our 500,000+ users. She did this while also mentoring two junior engineers and writing documentation so thorough that it became the template for our entire team.\n\nWhat distinguishes Sarah is her intellectual curiosity. She doesn\'t just solve problems — she asks why the problems exist. When we encountered database deadlocks last summer, Sarah didn\'t just apply a hotfix; she spent three weekends reading database internals, emerged with a complete architectural recommendation, and presented it to our CTO with clarity and confidence.\n\nI have no doubt that Sarah will excel in a rigorous academic environment. She has my highest recommendation without reservation.\n\nSincerely,\nAlex Johnson\nSenior Software Engineer, TechCorp Inc.\nalexjohnson@techcorp.com | (555) 123-4567', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

  f('Novel_Draft_Chapter1.docx', wordDir, 'THE CARTOGRAPHER OF LOST THINGS\nA Novel\nChapter One: The Map That Shouldn\'t Exist\n\nElena had mapped eleven thousand cities, but she had never mapped one that didn\'t want to be found.\n\nThe commission had arrived by actual paper mail — a rarity in 2041 — sealed with dark green wax and smelling faintly of cedar and old libraries. The client had given no name. The coordinates were real. The payment — already in her account by the time she opened the envelope — was exactly twice her rate.\n\nShe spread the preliminary sketches across her workstation. Zola, her mapping AI, hummed with what Elena had learned to recognize as concern.\n\n"Twelve distinct geographical impossibilities," Zola said. "The river runs uphill in three locations. This mountain range doesn\'t match any tectonic record going back 200,000 years. And these ruins—" A soft alert tone. "These ruins match no known architectural tradition on Earth."\n\n"Off Earth?"\n\nA pause. "The closest stylistic match is the megalithic structures of Göbekli Tepe. But these are at least three times older."\n\nElena leaned back. Outside her window, São Paulo glittered — a city she could map blindfolded, every favela and boulevard committed to memory. This was different. This was a place that had chosen to stay hidden for twelve thousand years.\n\nShe accepted the commission.\n\nShe would regret it. She would also never regret it.', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

  // ── CSV Files for Excel ──────────────────────────────────────────────────
  const csvDir = d('CSV Data', officeDir);

  f('Employees.csv', csvDir, 'Name,Department,Role,Salary,StartDate,City,Performance\nAlice Johnson,Engineering,Senior Engineer,95000,2021-03-15,New York,A\nBob Smith,Marketing,Director,88000,2019-07-01,Chicago,B+\nCarlos Rivera,Engineering,Junior Engineer,72000,2023-01-10,Austin,A-\nDiana Chen,Product,Product Manager,105000,2020-09-20,San Francisco,A\nEvan Park,Design,UX Designer,78000,2022-04-05,Seattle,B+\nFiona Walsh,Sales,Account Executive,68000,2021-11-30,New York,A\nGeorge Kim,Engineering,DevOps Engineer,91000,2020-02-14,Remote,A-\nHannah Moore,HR,HR Specialist,62000,2022-08-01,Chicago,B\nIvan Petrov,Engineering,Backend Engineer,87000,2021-06-22,Austin,A\nJessica Lee,Marketing,Content Manager,65000,2023-03-01,Remote,B+\nKevin Brown,Sales,Sales Manager,92000,2019-12-10,New York,A-\nLaura Martinez,Engineering,Frontend Engineer,82000,2022-01-17,San Francisco,A\nMarcus Thompson,Product,Product Analyst,71000,2023-05-15,Chicago,B+\nNina Patel,Engineering,ML Engineer,110000,2020-10-01,San Francisco,A\nOliver Scott,Finance,Financial Analyst,74000,2021-08-09,New York,B\nPriya Singh,Engineering,QA Engineer,69000,2022-11-20,Austin,B+\nQuinn Davis,Design,Graphic Designer,61000,2023-02-28,Remote,B\nRachel Wilson,Sales,AE,65000,2022-07-04,Chicago,A-\nSam Taylor,Engineering,Staff Engineer,130000,2018-05-01,New York,A+\nTanya Anderson,Marketing,CMO,145000,2017-09-15,San Francisco,A+', 'text/csv');

  f('Sales_Q1_2025.csv', csvDir, 'Month,ProductA,ProductB,ProductC,ProductD,Total,Target,Variance\nJanuary,45200,32100,18400,12800,108500,100000,8500\nFebruary,41800,35600,21200,14300,112900,105000,7900\nMarch,52300,38900,24100,16700,132000,120000,12000\nApril,48600,41200,22800,15400,128000,115000,13000\nMay,55100,43800,26500,18200,143600,130000,13600\nJune,61400,47200,29100,21000,158700,145000,13700\nJuly,58900,44600,27300,19800,150600,140000,10600\nAugust,63200,49100,31000,22400,165700,155000,10700\nSeptember,67800,52400,33500,24100,177800,165000,12800\nOctober,71200,55800,36000,26300,189300,175000,14300\nNovember,84500,63200,42100,31000,220800,200000,20800\nDecember,91000,68400,46200,34500,240100,220000,20100', 'text/csv');

  f('Student_Grades.csv', csvDir, 'StudentID,Name,Math,English,Science,History,CS,Art,GPA\n001,Emma Wilson,94,88,92,85,97,79,3.8\n002,James Brown,78,82,75,88,91,85,3.4\n003,Sofia Martinez,89,95,87,91,83,92,3.7\n004,Noah Davis,65,70,72,68,95,60,3.0\n005,Olivia Taylor,97,93,96,94,99,88,4.0\n006,Liam Anderson,82,79,85,77,88,73,3.5\n007,Ava Thomas,91,96,89,93,85,95,3.8\n008,Ethan Jackson,73,68,80,71,92,65,3.2\n009,Isabella White,88,90,91,87,86,89,3.7\n010,Mason Harris,76,74,78,80,89,72,3.3\n011,Charlotte Martin,95,97,93,96,91,94,3.9\n012,Logan Garcia,69,72,74,66,97,61,3.1\n013,Amelia Rodriguez,93,89,95,92,88,87,3.8\n014,Lucas Martinez,81,83,79,84,90,78,3.5\n015,Mia Robinson,87,92,88,90,84,93,3.7', 'text/csv');

  f('Inventory_March.csv', csvDir, 'SKU,ProductName,Category,StockQty,ReorderPoint,UnitCost,SellingPrice,Supplier\nSKU001,Wireless Keyboard,Peripherals,142,50,28.50,59.99,Logitech\nSKU002,USB-C Hub 7-Port,Accessories,89,30,22.00,44.99,Anker\nSKU003,27in 4K Monitor,Displays,23,10,285.00,549.99,LG Electronics\nSKU004,Mechanical Keyboard,Peripherals,67,25,75.00,149.99,Keychron\nSKU005,Laptop Stand,Accessories,201,75,12.50,34.99,Nexstand\nSKU006,Webcam 4K,Peripherals,55,20,80.00,169.99,Logitech\nSKU007,SSD 1TB NVMe,Storage,134,40,65.00,119.99,Samsung\nSKU008,RAM DDR5 32GB,Memory,78,25,120.00,229.99,Corsair\nSKU009,Mouse Wireless,Peripherals,167,60,22.00,49.99,Logitech\nSKU010,Headset 7.1,Audio,44,15,55.00,129.99,SteelSeries\nSKU011,GPU RTX 4070,Graphics,12,5,480.00,599.99,NVIDIA\nSKU012,CPU i7-13700K,Processors,18,8,310.00,409.99,Intel\nSKU013,Motherboard Z790,Motherboards,21,8,195.00,299.99,ASUS\nSKU014,PSU 850W Gold,Power,39,15,95.00,159.99,Corsair\nSKU015,CPU Cooler 360mm,Cooling,52,20,85.00,149.99,NZXT', 'text/csv');

  f('Budget_vs_Actual_2025.csv', csvDir, 'Category,JanBudget,JanActual,FebBudget,FebActual,MarBudget,MarActual\nRent,1400,1400,1400,1400,1400,1400\nGroceries,350,328,350,376,350,341\nUtilities,120,108,120,134,100,92\nTransportation,200,187,200,213,200,195\nEntertainment,200,245,200,178,200,267\nDining Out,150,198,150,162,150,221\nSubscriptions,95,95,95,95,95,95\nGym,45,45,45,45,45,45\nClothing,100,0,100,245,100,89\nHealthcare,75,40,75,120,75,35\nSavings,1000,1000,1000,1000,1000,1000\nMiscellaneous,200,167,200,143,200,188', 'text/csv');

  f('Website_Analytics_Feb2025.csv', csvDir, 'Date,Sessions,Users,NewUsers,BounceRate,AvgDuration,PageViews,Conversions\n2025-02-01,4821,3910,1840,0.42,3:24,14230,87\n2025-02-02,3214,2680,1102,0.45,2:58,9820,54\n2025-02-03,2987,2510,980,0.48,2:41,8740,41\n2025-02-04,5102,4210,2010,0.39,3:45,15890,112\n2025-02-05,5467,4580,2240,0.37,3:52,17120,128\n2025-02-06,5234,4390,2150,0.38,3:48,16340,119\n2025-02-07,4980,4100,1920,0.40,3:33,15210,104\n2025-02-08,3456,2890,1210,0.43,3:02,10340,58\n2025-02-09,2910,2440,890,0.47,2:44,8560,38\n2025-02-10,5678,4720,2390,0.36,3:58,18240,141\n2025-02-11,6102,5140,2780,0.34,4:12,19870,163\n2025-02-12,5890,4960,2610,0.35,4:05,18920,155\n2025-02-13,5441,4580,2280,0.37,3:49,17100,134\n2025-02-14,6234,5290,2920,0.33,4:21,20580,178\n2025-02-15,4812,4010,1810,0.41,3:26,14890,96', 'text/csv');

  f('Stock_Portfolio.csv', csvDir, 'Ticker,Company,Shares,AvgCost,CurrentPrice,Value,GainLoss,GainLossPct\nAAPL,Apple Inc,45,148.20,182.50,8212.50,1539.00,23.1\nMSFT,Microsoft Corp,30,285.40,415.20,12456.00,3834.00,44.8\nGOOGL,Alphabet Inc,12,128.50,156.80,1881.60,339.60,22.0\nAMZN,Amazon.com Inc,20,132.80,178.40,3568.00,914.00,34.4\nNVDA,NVIDIA Corp,25,420.00,875.40,21885.00,11385.00,108.4\nMETA,Meta Platforms,35,290.10,505.60,17696.00,7543.50,74.4\nTSLA,Tesla Inc,40,225.80,192.30,7692.00,-1340.00,-14.8\nAMD,Advanced Micro,60,108.40,172.80,10368.00,3864.00,59.4\nCRM,Salesforce Inc,22,195.60,298.40,6564.80,2267.20,52.8\nNFLX,Netflix Inc,15,380.20,612.70,9190.50,3378.00,59.4\nPYPL,PayPal Holdings,80,65.40,62.80,5024.00,-208.00,-4.0\nSPY,S&P 500 ETF,100,420.00,512.40,51240.00,9240.00,22.0\nQQQ,Nasdaq 100 ETF,50,365.80,448.20,22410.00,4120.00,22.5\nVTI,Vanguard Total,75,198.40,248.60,18645.00,3765.00,25.3\nBND,Vanguard Bonds,120,72.10,71.80,8616.00,-36.00,-0.4', 'text/csv');

  f('Project_Timeline.csv', csvDir, 'Task,Owner,StartDate,EndDate,Duration,Status,Progress,Dependencies\nRequirements Gathering,David Park,2025-01-06,2025-01-17,10d,Done,100,\nUI/UX Design,Lucas Moore,2025-01-13,2025-02-07,20d,Done,100,Requirements Gathering\nDatabase Schema,Sarah Chen,2025-01-20,2025-01-31,10d,Done,100,Requirements Gathering\nBackend API v1,Sarah Chen,2025-02-03,2025-03-07,25d,In Progress,75,Database Schema\nFrontend Development,Mike Torres,2025-02-10,2025-03-21,30d,In Progress,50,UI/UX Design\nAuth Integration,Alex Johnson,2025-02-17,2025-02-28,10d,Done,100,Backend API v1\nQA Testing,Jamie Kim,2025-03-10,2025-03-28,15d,Not Started,0,Frontend Development\nPerformance Testing,Alex Johnson,2025-03-24,2025-04-04,10d,Not Started,0,QA Testing\nStaging Deploy,Priya Patel,2025-03-31,2025-04-04,5d,Not Started,0,Performance Testing\nProduction Launch,Priya Patel,2025-04-07,2025-04-07,1d,Not Started,0,Staging Deploy', 'text/csv');

  // ── Code Files for Notepad++ ─────────────────────────────────────────────
  const codeDir = d('Code Projects', docs);
  const serverDir = d('backend-api', codeDir);

  f('server.py', serverDir, 'from flask import Flask, request, jsonify\nfrom flask_sqlalchemy import SQLAlchemy\nfrom flask_jwt_extended import JWTManager, jwt_required, create_access_token\nfrom datetime import timedelta\nimport os\n\napp = Flask(__name__)\napp.config[\'SQLALCHEMY_DATABASE_URI\'] = os.getenv(\'DATABASE_URL\', \'postgresql://localhost/myapp\')\napp.config[\'JWT_SECRET_KEY\'] = os.getenv(\'JWT_SECRET\', \'dev-secret\')\napp.config[\'JWT_ACCESS_TOKEN_EXPIRES\'] = timedelta(minutes=15)\n\ndb = SQLAlchemy(app)\njwt = JWTManager(app)\n\nclass User(db.Model):\n    id = db.Column(db.Integer, primary_key=True)\n    email = db.Column(db.String(120), unique=True, nullable=False)\n    name = db.Column(db.String(80), nullable=False)\n    created_at = db.Column(db.DateTime, server_default=db.func.now())\n\n    def to_dict(self):\n        return {\'id\': self.id, \'email\': self.email, \'name\': self.name}\n\n@app.route(\'/api/v2/users\', methods=[\'GET\'])\n@jwt_required()\ndef get_users():\n    page = request.args.get(\'page\', 1, type=int)\n    per_page = request.args.get(\'per_page\', 20, type=int)\n    users = User.query.paginate(page=page, per_page=per_page)\n    return jsonify({\n        \'users\': [u.to_dict() for u in users.items],\n        \'total\': users.total,\n        \'pages\': users.pages\n    })\n\n@app.route(\'/api/v2/auth/token\', methods=[\'POST\'])\ndef login():\n    data = request.get_json()\n    email = data.get(\'email\')\n    # In production: verify password hash\n    user = User.query.filter_by(email=email).first()\n    if not user:\n        return jsonify({\'error\': \'Invalid credentials\'}), 401\n    token = create_access_token(identity=user.id)\n    return jsonify({\'access_token\': token, \'token_type\': \'bearer\'})\n\nif __name__ == \'__main__\':\n    with app.app_context():\n        db.create_all()\n    app.run(debug=True, port=8000)', 'text/plain');

  f('schema.sql', serverDir, '-- Customer Portal v2.0 Database Schema\n-- PostgreSQL 15\n\nCREATE EXTENSION IF NOT EXISTS "uuid-ossp";\nCREATE EXTENSION IF NOT EXISTS "pgcrypto";\n\n-- Users table\nCREATE TABLE users (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    email VARCHAR(255) UNIQUE NOT NULL,\n    name VARCHAR(120) NOT NULL,\n    password_hash TEXT NOT NULL,\n    role VARCHAR(20) DEFAULT \'user\' CHECK (role IN (\'user\', \'admin\', \'moderator\')),\n    is_verified BOOLEAN DEFAULT FALSE,\n    avatar_url TEXT,\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW(),\n    last_login TIMESTAMPTZ\n);\n\n-- Sessions table\nCREATE TABLE sessions (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    user_id UUID REFERENCES users(id) ON DELETE CASCADE,\n    token_hash TEXT NOT NULL,\n    expires_at TIMESTAMPTZ NOT NULL,\n    ip_address INET,\n    user_agent TEXT,\n    created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\n-- Products table\nCREATE TABLE products (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    name VARCHAR(255) NOT NULL,\n    description TEXT,\n    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),\n    stock_qty INTEGER DEFAULT 0 CHECK (stock_qty >= 0),\n    category_id UUID REFERENCES categories(id),\n    sku VARCHAR(50) UNIQUE,\n    created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\n-- Orders table\nCREATE TABLE orders (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    user_id UUID REFERENCES users(id),\n    status VARCHAR(20) DEFAULT \'pending\' CHECK (status IN (\'pending\',\'confirmed\',\'shipped\',\'delivered\',\'cancelled\')),\n    total DECIMAL(10,2) NOT NULL,\n    shipping_address JSONB,\n    created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\n-- Indexes\nCREATE INDEX idx_users_email ON users(email);\nCREATE INDEX idx_sessions_user_id ON sessions(user_id);\nCREATE INDEX idx_sessions_expires ON sessions(expires_at);\nCREATE INDEX idx_orders_user_id ON orders(user_id);\nCREATE INDEX idx_orders_status ON orders(status);\n\n-- Updated_at trigger\nCREATE OR REPLACE FUNCTION update_updated_at()\nRETURNS TRIGGER AS $$\nBEGIN NEW.updated_at = NOW(); RETURN NEW; END;\n$$ LANGUAGE plpgsql;\n\nCREATE TRIGGER users_updated_at\n    BEFORE UPDATE ON users\n    FOR EACH ROW EXECUTE FUNCTION update_updated_at();', 'text/plain');

  f('Dockerfile', serverDir, '# syntax=docker/dockerfile:1\nFROM python:3.12-slim AS base\n\nWORKDIR /app\nENV PYTHONDONTWRITEBYTECODE=1 \\\n    PYTHONUNBUFFERED=1 \\\n    PIP_NO_CACHE_DIR=1\n\n# Install dependencies\nCOPY requirements.txt .\nRUN pip install --upgrade pip && pip install -r requirements.txt\n\n# Development stage\nFROM base AS development\nRUN pip install pytest pytest-cov black isort mypy\nCOPY . .\nCMD ["flask", "run", "--host=0.0.0.0", "--port=8000", "--debug"]\n\n# Production stage\nFROM base AS production\nCOPY . .\nRUN addgroup --system app && adduser --system --group app\nUSER app\nEXPOSE 8000\nCMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--worker-class", "gthread", "--threads", "2", "--timeout", "30", "server:app"]', 'text/plain');

  const frontendDir = d('frontend-react', codeDir);

  f('useAuth.ts', frontendDir, 'import { useState, useEffect, useCallback } from \'react\';\nimport { create } from \'zustand\';\nimport { persist } from \'zustand/middleware\';\n\ninterface User {\n  id: string;\n  email: string;\n  name: string;\n  role: \'user\' | \'admin\';\n}\n\ninterface AuthState {\n  user: User | null;\n  token: string | null;\n  isLoading: boolean;\n  login: (email: string, password: string) => Promise<void>;\n  logout: () => void;\n  refreshToken: () => Promise<void>;\n}\n\nexport const useAuthStore = create<AuthState>()(\n  persist(\n    (set, get) => ({\n      user: null,\n      token: null,\n      isLoading: false,\n\n      login: async (email: string, password: string) => {\n        set({ isLoading: true });\n        try {\n          const res = await fetch(\'/api/v2/auth/token\', {\n            method: \'POST\',\n            headers: { \'Content-Type\': \'application/json\' },\n            body: JSON.stringify({ email, password }),\n          });\n          if (!res.ok) throw new Error(\'Invalid credentials\');\n          const { access_token } = await res.json();\n\n          const meRes = await fetch(\'/api/v2/me\', {\n            headers: { Authorization: `Bearer ${access_token}` },\n          });\n          const user = await meRes.json();\n          set({ user, token: access_token, isLoading: false });\n        } catch (err) {\n          set({ isLoading: false });\n          throw err;\n        }\n      },\n\n      logout: () => set({ user: null, token: null }),\n\n      refreshToken: async () => {\n        const { token } = get();\n        if (!token) return;\n        // Implement token refresh logic\n      },\n    }),\n    { name: \'auth-storage\', partialize: (s) => ({ token: s.token }) }\n  )\n);\n\nexport const useAuth = () => useAuthStore();', 'text/plain');

  f('Dashboard.tsx', frontendDir, 'import { useEffect, useState } from \'react\';\nimport { useAuth } from \'./useAuth\';\n\ninterface Metric {\n  label: string;\n  value: number;\n  change: number;\n  unit?: string;\n}\n\nexport default function Dashboard() {\n  const { user, token } = useAuth();\n  const [metrics, setMetrics] = useState<Metric[]>([]);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);\n\n  useEffect(() => {\n    const fetchMetrics = async () => {\n      try {\n        const res = await fetch(\'/api/v2/dashboard\', {\n          headers: { Authorization: `Bearer ${token}` },\n        });\n        if (!res.ok) throw new Error(`HTTP ${res.status}`);\n        const data = await res.json();\n        setMetrics(data.metrics);\n      } catch (err) {\n        setError(err instanceof Error ? err.message : \'Unknown error\');\n      } finally {\n        setLoading(false);\n      }\n    };\n    fetchMetrics();\n  }, [token]);\n\n  if (loading) return <div className="loading-spinner" />;\n  if (error) return <div className="error-banner">Error: {error}</div>;\n\n  return (\n    <main className="dashboard">\n      <header>\n        <h1>Welcome back, {user?.name}</h1>\n        <p className="subtitle">Here\'s what\'s happening today.</p>\n      </header>\n      <div className="metrics-grid">\n        {metrics.map(m => (\n          <div key={m.label} className="metric-card">\n            <span className="metric-label">{m.label}</span>\n            <span className="metric-value">\n              {m.value.toLocaleString()}{m.unit}\n            </span>\n            <span className={`metric-change ${m.change >= 0 ? \'positive\' : \'negative\'}`}>\n              {m.change >= 0 ? \'+\' : \'\'}{m.change}%\n            </span>\n          </div>\n        ))}\n      </div>\n    </main>\n  );\n}', 'text/plain');

  f('algorithms.py', codeDir, '"""\nClassic algorithms implemented in Python\nFor interview prep and reference\n"""\nfrom typing import TypeVar, List, Optional\nT = TypeVar(\'T\')\n\n# ─── Sorting ─────────────────────────────────────────────────────\n\ndef quicksort(arr: List[int]) -> List[int]:\n    """O(n log n) average, O(n^2) worst. In-place via Lomuto partition."""\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    mid  = [x for x in arr if x == pivot]\n    right= [x for x in arr if x > pivot]\n    return quicksort(left) + mid + quicksort(right)\n\ndef mergesort(arr: List[int]) -> List[int]:\n    """O(n log n) guaranteed. Stable sort."""\n    if len(arr) <= 1:\n        return arr\n    mid = len(arr) // 2\n    left = mergesort(arr[:mid])\n    right = mergesort(arr[mid:])\n    result = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            result.append(left[i]); i += 1\n        else:\n            result.append(right[j]); j += 1\n    return result + left[i:] + right[j:]\n\n# ─── Search ──────────────────────────────────────────────────────\n\ndef binary_search(arr: List[int], target: int) -> int:\n    """O(log n). Returns index or -1."""\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: lo = mid + 1\n        else: hi = mid - 1\n    return -1\n\n# ─── Graph ───────────────────────────────────────────────────────\n\nfrom collections import deque\n\ndef bfs(graph: dict, start: str) -> List[str]:\n    """Breadth-first traversal. Returns visited order."""\n    visited, queue = set(), deque([start])\n    visited.add(start)\n    result = []\n    while queue:\n        node = queue.popleft()\n        result.append(node)\n        for neighbor in graph.get(node, []):\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)\n    return result\n\ndef dfs(graph: dict, start: str, visited=None) -> List[str]:\n    """Depth-first traversal (recursive)."""\n    if visited is None: visited = set()\n    visited.add(start)\n    result = [start]\n    for neighbor in graph.get(start, []):\n        if neighbor not in visited:\n            result.extend(dfs(graph, neighbor, visited))\n    return result\n\n# ─── Dynamic Programming ─────────────────────────────────────────\n\ndef longest_common_subsequence(s1: str, s2: str) -> int:\n    """Classic LCS — O(mn) time and space."""\n    m, n = len(s1), len(s2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if s1[i-1] == s2[j-1]:\n                dp[i][j] = dp[i-1][j-1] + 1\n            else:\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    return dp[m][n]\n\ndef knapsack_01(weights: List[int], values: List[int], capacity: int) -> int:\n    """0/1 Knapsack — O(n*W)."""\n    n = len(weights)\n    dp = [[0] * (capacity + 1) for _ in range(n + 1)]\n    for i in range(1, n + 1):\n        for w in range(capacity + 1):\n            dp[i][w] = dp[i-1][w]\n            if weights[i-1] <= w:\n                dp[i][w] = max(dp[i][w], dp[i-1][w - weights[i-1]] + values[i-1])\n    return dp[n][capacity]', 'text/plain');

  f('nginx.conf', codeDir, 'user nginx;\nworker_processes auto;\nerror_log /var/log/nginx/error.log warn;\npid /var/run/nginx.pid;\n\nevents {\n    worker_connections 1024;\n    use epoll;\n    multi_accept on;\n}\n\nhttp {\n    include /etc/nginx/mime.types;\n    default_type application/octet-stream;\n\n    # Logging\n    log_format main \'$remote_addr - $remote_user [$time_local] "$request" \'\n                    \'$status $body_bytes_sent "$http_referer" \'\n                    \'"$http_user_agent" "$http_x_forwarded_for"\';\n    access_log /var/log/nginx/access.log main;\n\n    # Performance\n    sendfile on;\n    tcp_nopush on;\n    tcp_nodelay on;\n    keepalive_timeout 65;\n    gzip on;\n    gzip_types text/plain text/css application/json application/javascript text/xml;\n    gzip_min_length 1000;\n\n    # Rate limiting\n    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;\n\n    server {\n        listen 80;\n        server_name example.com www.example.com;\n        return 301 https://$host$request_uri;\n    }\n\n    server {\n        listen 443 ssl http2;\n        server_name example.com www.example.com;\n\n        ssl_certificate /etc/ssl/certs/example.com.crt;\n        ssl_certificate_key /etc/ssl/private/example.com.key;\n        ssl_protocols TLSv1.2 TLSv1.3;\n        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;\n        ssl_prefer_server_ciphers off;\n\n        add_header X-Frame-Options DENY;\n        add_header X-Content-Type-Options nosniff;\n        add_header Strict-Transport-Security "max-age=63072000";\n\n        location / {\n            root /var/www/html;\n            try_files $uri $uri/ /index.html;\n        }\n\n        location /api {\n            limit_req zone=api burst=20 nodelay;\n            proxy_pass http://127.0.0.1:8000;\n            proxy_set_header Host $host;\n            proxy_set_header X-Real-IP $remote_addr;\n            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n            proxy_set_header X-Forwarded-Proto $scheme;\n        }\n    }\n}', 'text/plain');

  f('test_api.py', codeDir, 'import pytest\nimport json\nfrom server import app, db, User\n\n@pytest.fixture\ndef client():\n    app.config[\'TESTING\'] = True\n    app.config[\'SQLALCHEMY_DATABASE_URI\'] = \'sqlite:///:memory:\'\n    with app.test_client() as client:\n        with app.app_context():\n            db.create_all()\n            # Seed test user\n            user = User(email=\'test@example.com\', name=\'Test User\')\n            db.session.add(user)\n            db.session.commit()\n        yield client\n\ndef test_login_success(client):\n    resp = client.post(\'/api/v2/auth/token\', json={\'email\': \'test@example.com\', \'password\': \'pass\'})\n    assert resp.status_code == 200\n    data = json.loads(resp.data)\n    assert \'access_token\' in data\n\ndef test_login_invalid(client):\n    resp = client.post(\'/api/v2/auth/token\', json={\'email\': \'nobody@example.com\', \'password\': \'bad\'})\n    assert resp.status_code == 401\n\ndef test_get_users_unauthorized(client):\n    resp = client.get(\'/api/v2/users\')\n    assert resp.status_code == 401\n\ndef test_get_users_authorized(client):\n    # Login first\n    login = client.post(\'/api/v2/auth/token\', json={\'email\': \'test@example.com\', \'password\': \'pass\'})\n    token = json.loads(login.data)[\'access_token\']\n    resp = client.get(\'/api/v2/users\', headers={\'Authorization\': f\'Bearer {token}\'})\n    assert resp.status_code == 200\n    data = json.loads(resp.data)\n    assert \'users\' in data\n    assert data[\'total\'] >= 1\n\ndef test_pagination(client):\n    resp_page1 = client.get(\'/api/v2/users?page=1&per_page=5\')\n    # Without auth — expect 401\n    assert resp_page1.status_code == 401', 'text/plain');

  f('Component.vue', codeDir, '<template>\n  <div class="user-card" :class="{ premium: user.isPremium }">\n    <div class="user-card__avatar">\n      <img :src="user.avatarUrl || defaultAvatar" :alt="user.name" />\n      <span v-if="user.isOnline" class="online-dot" />\n    </div>\n    <div class="user-card__body">\n      <h3 class="user-card__name">{{ user.name }}</h3>\n      <p class="user-card__email">{{ user.email }}</p>\n      <div class="user-card__badges">\n        <span v-for="badge in user.badges" :key="badge" class="badge">{{ badge }}</span>\n      </div>\n    </div>\n    <div class="user-card__actions">\n      <button @click="$emit(\'message\', user.id)" :disabled="!user.isOnline">Message</button>\n      <button @click="$emit(\'follow\', user.id)" :class="{ following: isFollowing }">{{ isFollowing ? \'Following\' : \'Follow\' }}</button>\n    </div>\n  </div>\n</template>\n\n<script setup lang="ts">\nimport { ref, computed } from \'vue\';\n\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n  avatarUrl?: string;\n  isOnline: boolean;\n  isPremium: boolean;\n  badges: string[];\n  followerCount: number;\n}\n\nconst props = defineProps<{ user: User }>();\nconst emit = defineEmits<{\n  (e: \'message\', id: string): void;\n  (e: \'follow\', id: string): void;\n}>();\n\nconst isFollowing = ref(false);\nconst defaultAvatar = \'https://api.dicebear.com/7.x/avataaars/svg?seed=\' + props.user.id;\n\nconst toggleFollow = () => {\n  isFollowing.value = !isFollowing.value;\n  emit(\'follow\', props.user.id);\n};\n</script>\n\n<style scoped>\n.user-card {\n  display: flex; align-items: center; gap: 16px;\n  padding: 16px; border-radius: 12px;\n  background: var(--card-bg, #fff); border: 1px solid var(--border, #e5e7eb);\n  transition: box-shadow 0.2s;\n}\n.user-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }\n.user-card.premium { border-color: gold; background: #fffbeb; }\n.online-dot { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; }\n.badge { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #e0e7ff; color: #4338ca; }\n</style>', 'text/plain');

  // ─── Wireshark Capture Files ─────────────────────────────────────────────
  const wsCaptDir = d('Wireshark Captures', docs);
  f('homelab_traffic.pcap', wsCaptDir, '{"interface":"Ethernet 0","captureDate":"2025-03-10 19:42:01","duration":120.45,"packets":[{"no":1,"time":"0.000000","src":"192.168.1.105","dst":"192.168.1.1","proto":"ARP","len":42,"info":"Who has 192.168.1.1? Tell 192.168.1.105"},{"no":2,"time":"0.001230","src":"192.168.1.1","dst":"192.168.1.105","proto":"ARP","len":42,"info":"is at d8:31:cf:1a:2b:3c"},{"no":3,"time":"0.002100","src":"192.168.1.105","dst":"8.8.8.8","proto":"DNS","len":74,"info":"Standard query A google.com"},{"no":4,"time":"0.023450","src":"8.8.8.8","dst":"192.168.1.105","proto":"DNS","len":90,"info":"Standard query response A 142.250.80.46"},{"no":5,"time":"0.024100","src":"192.168.1.105","dst":"142.250.80.46","proto":"TCP","len":66,"info":"[SYN] Seq=0 Win=64240 Len=0"},{"no":6,"time":"0.045200","src":"142.250.80.46","dst":"192.168.1.105","proto":"TCP","len":66,"info":"[SYN, ACK] Seq=0 Ack=1 Win=65535"},{"no":7,"time":"0.045300","src":"192.168.1.105","dst":"142.250.80.46","proto":"TCP","len":54,"info":"[ACK] Seq=1 Ack=1 Win=8192 Len=0"},{"no":8,"time":"0.045400","src":"192.168.1.105","dst":"142.250.80.46","proto":"TLS","len":571,"info":"Client Hello"},{"no":9,"time":"0.068900","src":"142.250.80.46","dst":"192.168.1.105","proto":"TLS","len":1400,"info":"Server Hello, Certificate, Server Hello Done"},{"no":10,"time":"0.069200","src":"192.168.1.105","dst":"142.250.80.46","proto":"TLS","len":126,"info":"Change Cipher Spec, Encrypted Handshake"},{"no":11,"time":"0.069500","src":"192.168.1.105","dst":"142.250.80.46","proto":"TLS","len":654,"info":"Application Data"},{"no":12,"time":"0.125000","src":"192.168.1.200","dst":"192.168.1.255","proto":"UDP","len":62,"info":"mDNS query response"},{"no":13,"time":"0.225000","src":"192.168.1.105","dst":"8.8.8.8","proto":"DNS","len":74,"info":"Standard query A discord.com"},{"no":14,"time":"0.248000","src":"8.8.8.8","dst":"192.168.1.105","proto":"DNS","len":86,"info":"Standard query response A 162.159.135.232"},{"no":15,"time":"0.350000","src":"192.168.1.105","dst":"162.159.135.232","proto":"TLS","len":571,"info":"Client Hello"},{"no":16,"time":"0.375000","src":"162.159.135.232","dst":"192.168.1.105","proto":"TLS","len":1400,"info":"Server Hello, Certificate, Server Hello Done"},{"no":17,"time":"0.689000","src":"192.168.1.1","dst":"192.168.1.105","proto":"ICMP","len":74,"info":"Echo (ping) request  id=0x0001, seq=1"},{"no":18,"time":"0.690000","src":"192.168.1.105","dst":"192.168.1.1","proto":"ICMP","len":74,"info":"Echo (ping) reply    id=0x0001, seq=1"},{"no":19,"time":"1.245000","src":"192.168.1.110","dst":"192.168.1.105","proto":"TCP","len":78,"info":"[PSH, ACK] Seq=289 Ack=1 Len=524"},{"no":20,"time":"1.450000","src":"192.168.1.105","dst":"1.1.1.1","proto":"DNS","len":74,"info":"Standard query AAAA reddit.com"},{"no":21,"time":"1.474000","src":"1.1.1.1","dst":"192.168.1.105","proto":"DNS","len":100,"info":"Standard query response AAAA 2606:2800:220:1:248:1893:25c8:1946"},{"no":22,"time":"2.100000","src":"192.168.1.105","dst":"151.101.1.140","proto":"TCP","len":66,"info":"[SYN] Seq=0 Win=64240 Len=0"},{"no":23,"time":"2.124000","src":"151.101.1.140","dst":"192.168.1.105","proto":"TCP","len":66,"info":"[SYN, ACK] Seq=0 Ack=1 Win=65535"},{"no":24,"time":"2.124200","src":"192.168.1.105","dst":"151.101.1.140","proto":"TLS","len":571,"info":"Client Hello"},{"no":25,"time":"2.148000","src":"151.101.1.140","dst":"192.168.1.105","proto":"TLS","len":1400,"info":"Server Hello, Certificate, Server Hello Done"}]}', 'application/vnd.tcpdump.pcap');

  f('http_web_browsing.pcap', wsCaptDir, '{"interface":"Wi-Fi","captureDate":"2025-03-12 10:15:33","duration":60.2,"packets":[{"no":1,"time":"0.000000","src":"192.168.1.105","dst":"8.8.8.8","proto":"DNS","len":74,"info":"Standard query A stackoverflow.com"},{"no":2,"time":"0.018500","src":"8.8.8.8","dst":"192.168.1.105","proto":"DNS","len":106,"info":"Standard query response A 151.101.129.69"},{"no":3,"time":"0.019000","src":"192.168.1.105","dst":"151.101.129.69","proto":"TCP","len":66,"info":"[SYN] Seq=0 Win=64240 Len=0"},{"no":4,"time":"0.038200","src":"151.101.129.69","dst":"192.168.1.105","proto":"TCP","len":66,"info":"[SYN, ACK] Seq=0 Ack=1 Win=28960"},{"no":5,"time":"0.038300","src":"192.168.1.105","dst":"151.101.129.69","proto":"HTTP","len":420,"info":"GET /questions/12345 HTTP/1.1"},{"no":6,"time":"0.061000","src":"151.101.129.69","dst":"192.168.1.105","proto":"HTTP","len":1400,"info":"HTTP/1.1 200 OK  (text/html)"},{"no":7,"time":"0.061200","src":"151.101.129.69","dst":"192.168.1.105","proto":"HTTP","len":1400,"info":"[Continuation]"},{"no":8,"time":"0.062000","src":"192.168.1.105","dst":"151.101.129.69","proto":"TCP","len":54,"info":"[ACK] Seq=367 Ack=2749 Win=8192 Len=0"},{"no":9,"time":"0.125000","src":"192.168.1.105","dst":"8.8.8.8","proto":"DNS","len":74,"info":"Standard query A cdn.sstatic.net"},{"no":10,"time":"0.143000","src":"8.8.8.8","dst":"192.168.1.105","proto":"DNS","len":90,"info":"Standard query response A 151.101.193.69"},{"no":11,"time":"0.145000","src":"192.168.1.105","dst":"151.101.193.69","proto":"HTTP","len":380,"info":"GET /img/logo.png HTTP/1.1"},{"no":12,"time":"0.168000","src":"151.101.193.69","dst":"192.168.1.105","proto":"HTTP","len":1400,"info":"HTTP/1.1 200 OK  (image/png)"},{"no":13,"time":"0.280000","src":"192.168.1.105","dst":"8.8.8.8","proto":"DNS","len":74,"info":"Standard query A github.com"},{"no":14,"time":"0.299000","src":"8.8.8.8","dst":"192.168.1.105","proto":"DNS","len":86,"info":"Standard query response A 140.82.112.4"},{"no":15,"time":"0.300000","src":"192.168.1.105","dst":"140.82.112.4","proto":"TCP","len":66,"info":"[SYN] Seq=0 Win=64240 Len=0"},{"no":16,"time":"0.328000","src":"140.82.112.4","dst":"192.168.1.105","proto":"TCP","len":66,"info":"[SYN, ACK] Seq=0 Ack=1 Win=65535"},{"no":17,"time":"0.328100","src":"192.168.1.105","dst":"140.82.112.4","proto":"TLS","len":571,"info":"Client Hello"},{"no":18,"time":"0.355000","src":"140.82.112.4","dst":"192.168.1.105","proto":"TLS","len":1400,"info":"Server Hello, Certificate, Server Hello Done"},{"no":19,"time":"0.355200","src":"192.168.1.105","dst":"140.82.112.4","proto":"TLS","len":126,"info":"Change Cipher Spec, Encrypted Handshake"},{"no":20,"time":"0.380000","src":"192.168.1.105","dst":"140.82.112.4","proto":"TLS","len":892,"info":"Application Data"},{"no":21,"time":"0.405000","src":"140.82.112.4","dst":"192.168.1.105","proto":"TLS","len":1400,"info":"Application Data"},{"no":22,"time":"1.200000","src":"192.168.1.105","dst":"151.101.129.69","proto":"HTTP","len":380,"info":"POST /api/metrics HTTP/1.1"},{"no":23,"time":"1.224000","src":"151.101.129.69","dst":"192.168.1.105","proto":"HTTP","len":240,"info":"HTTP/1.1 204 No Content"},{"no":24,"time":"2.450000","src":"192.168.1.105","dst":"151.101.129.69","proto":"TCP","len":54,"info":"[FIN, ACK] Seq=4212 Ack=289"},{"no":25,"time":"2.474000","src":"151.101.129.69","dst":"192.168.1.105","proto":"TCP","len":54,"info":"[FIN, ACK] Seq=289 Ack=4213"}]}', 'application/vnd.tcpdump.pcap');

  f('lan_port_scan.pcap', wsCaptDir, '{"interface":"Ethernet 0","captureDate":"2025-03-14 22:08:15","duration":18.3,"notes":"nmap -sV 192.168.1.0/24 scan result","packets":[{"no":1,"time":"0.000000","src":"192.168.1.105","dst":"192.168.1.1","proto":"ARP","len":42,"info":"Who has 192.168.1.1? Tell 192.168.1.105"},{"no":2,"time":"0.001100","src":"192.168.1.1","dst":"192.168.1.105","proto":"ARP","len":42,"info":"is at d8:31:cf:1a:2b:3c"},{"no":3,"time":"0.002000","src":"192.168.1.105","dst":"192.168.1.1","proto":"TCP","len":66,"info":"[SYN] Seq=0 Win=1024 Len=0 port 22"},{"no":4,"time":"0.003100","src":"192.168.1.1","dst":"192.168.1.105","proto":"TCP","len":54,"info":"[RST, ACK] Seq=1 Ack=1"},{"no":5,"time":"0.004000","src":"192.168.1.105","dst":"192.168.1.1","proto":"TCP","len":66,"info":"[SYN] Seq=0 Win=1024 Len=0 port 80"},{"no":6,"time":"0.005200","src":"192.168.1.1","dst":"192.168.1.105","proto":"TCP","len":66,"info":"[SYN, ACK] Seq=0 Ack=1 Win=65535 port 80"},{"no":7,"time":"0.005300","src":"192.168.1.105","dst":"192.168.1.1","proto":"HTTP","len":240,"info":"GET / HTTP/1.1"},{"no":8,"time":"0.006400","src":"192.168.1.1","dst":"192.168.1.105","proto":"HTTP","len":1400,"info":"HTTP/1.1 200 OK  (text/html)"},{"no":9,"time":"0.010000","src":"192.168.1.105","dst":"192.168.1.200","proto":"ICMP","len":74,"info":"Echo (ping) request  id=0x0001, seq=1"},{"no":10,"time":"0.011200","src":"192.168.1.200","dst":"192.168.1.105","proto":"ICMP","len":74,"info":"Echo (ping) reply    id=0x0001, seq=1"},{"no":11,"time":"0.012000","src":"192.168.1.105","dst":"192.168.1.200","proto":"TCP","len":66,"info":"[SYN] Seq=0 Win=1024 Len=0 port 554"},{"no":12,"time":"0.013100","src":"192.168.1.200","dst":"192.168.1.105","proto":"TCP","len":66,"info":"[SYN, ACK] Seq=0 Ack=1 Win=65535 port 554"},{"no":13,"time":"0.014000","src":"192.168.1.105","dst":"192.168.1.110","proto":"ICMP","len":74,"info":"Echo (ping) request  id=0x0001, seq=2"},{"no":14,"time":"0.024800","src":"192.168.1.105","dst":"192.168.1.110","proto":"ICMP","len":74,"info":"Echo (ping) request  id=0x0001, seq=3"},{"no":15,"time":"2.024800","src":"192.168.1.105","dst":"192.168.1.130","proto":"ICMP","len":74,"info":"Destination unreachable (Port unreachable)"},{"no":16,"time":"2.100000","src":"192.168.1.105","dst":"192.168.1.200","proto":"TCP","len":66,"info":"[SYN] Seq=0 Win=1024 Len=0 port 8080"},{"no":17,"time":"2.101200","src":"192.168.1.200","dst":"192.168.1.105","proto":"TCP","len":66,"info":"[SYN, ACK] Seq=0 Ack=1 Win=65535 port 8080"},{"no":18,"time":"2.102000","src":"192.168.1.105","dst":"192.168.1.200","proto":"HTTP","len":260,"info":"GET /api/status HTTP/1.1"},{"no":19,"time":"2.103400","src":"192.168.1.200","dst":"192.168.1.105","proto":"HTTP","len":320,"info":"HTTP/1.1 200 OK  (application/json)"},{"no":20,"time":"3.450000","src":"192.168.1.105","dst":"192.168.1.1","proto":"TCP","len":66,"info":"[SYN] Seq=0 Win=1024 Len=0 port 443"},{"no":21,"time":"3.451200","src":"192.168.1.1","dst":"192.168.1.105","proto":"TCP","len":66,"info":"[SYN, ACK] Seq=0 Ack=1 Win=65535 port 443"},{"no":22,"time":"3.451300","src":"192.168.1.105","dst":"192.168.1.1","proto":"TLS","len":571,"info":"Client Hello"}]}', 'application/vnd.tcpdump.pcap');

  f('dns_queries_log.pcap', wsCaptDir, '{"interface":"Ethernet 0","captureDate":"2025-03-15 08:00:00","duration":300.0,"notes":"DNS activity log - 5 minute sample","packets":[{"no":1,"time":"0.000000","src":"192.168.1.105","dst":"8.8.8.8","proto":"DNS","len":74,"info":"Standard query A google.com"},{"no":2,"time":"0.019000","src":"8.8.8.8","dst":"192.168.1.105","proto":"DNS","len":90,"info":"Standard query response A 142.250.80.46"},{"no":3,"time":"0.500000","src":"192.168.1.105","dst":"8.8.8.8","proto":"DNS","len":74,"info":"Standard query A youtube.com"},{"no":4,"time":"0.521000","src":"8.8.8.8","dst":"192.168.1.105","proto":"DNS","len":106,"info":"Standard query response A 142.250.185.78"},{"no":5,"time":"1.200000","src":"192.168.1.105","dst":"1.1.1.1","proto":"DNS","len":74,"info":"Standard query A discord.com"},{"no":6,"time":"1.218000","src":"1.1.1.1","dst":"192.168.1.105","proto":"DNS","len":86,"info":"Standard query response A 162.159.135.232"},{"no":7,"time":"2.400000","src":"192.168.1.105","dst":"8.8.8.8","proto":"DNS","len":74,"info":"Standard query AAAA reddit.com"},{"no":8,"time":"2.421000","src":"8.8.8.8","dst":"192.168.1.105","proto":"DNS","len":100,"info":"Standard query response AAAA 2606:2800:220:1:248:1893:25c8:1946"},{"no":9,"time":"5.000000","src":"192.168.1.105","dst":"8.8.8.8","proto":"DNS","len":74,"info":"Standard query A twitch.tv"},{"no":10,"time":"5.020000","src":"8.8.8.8","dst":"192.168.1.105","proto":"DNS","len":90,"info":"Standard query response A 151.101.2.167"},{"no":11,"time":"10.000000","src":"192.168.1.105","dst":"8.8.8.8","proto":"DNS","len":74,"info":"Standard query A netflix.com"},{"no":12,"time":"10.022000","src":"8.8.8.8","dst":"192.168.1.105","proto":"DNS","len":90,"info":"Standard query response A 100.28.232.113"},{"no":13,"time":"15.500000","src":"192.168.1.105","dst":"1.1.1.1","proto":"DNS","len":74,"info":"Standard query A api.github.com"},{"no":14,"time":"15.519000","src":"1.1.1.1","dst":"192.168.1.105","proto":"DNS","len":90,"info":"Standard query response A 140.82.112.5"},{"no":15,"time":"20.000000","src":"192.168.1.105","dst":"8.8.8.8","proto":"DNS","len":74,"info":"Standard query A update.googleapis.com"},{"no":16,"time":"20.021000","src":"8.8.8.8","dst":"192.168.1.105","proto":"DNS","len":90,"info":"Standard query response A 142.250.80.74"},{"no":17,"time":"30.000000","src":"192.168.1.105","dst":"8.8.8.8","proto":"DNS","len":74,"info":"Standard query A steamcommunity.com"},{"no":18,"time":"30.019000","src":"8.8.8.8","dst":"192.168.1.105","proto":"DNS","len":90,"info":"Standard query response A 23.55.218.138"},{"no":19,"time":"45.000000","src":"192.168.1.105","dst":"8.8.8.8","proto":"DNS","len":74,"info":"Standard query A spotifycdn.com"},{"no":20,"time":"45.021000","src":"8.8.8.8","dst":"192.168.1.105","proto":"DNS","len":90,"info":"Standard query response A 35.186.224.47"},{"no":21,"time":"60.000000","src":"192.168.1.200","dst":"8.8.8.8","proto":"DNS","len":74,"info":"Standard query A time.windows.com"},{"no":22,"time":"60.022000","src":"8.8.8.8","dst":"192.168.1.200","proto":"DNS","len":90,"info":"Standard query response A 13.86.101.172"},{"no":23,"time":"90.000000","src":"192.168.1.105","dst":"8.8.8.8","proto":"DNS","len":74,"info":"Standard query A telemetry.microsoft.com"},{"no":24,"time":"90.020000","src":"8.8.8.8","dst":"192.168.1.105","proto":"DNS","len":90,"info":"Standard query response A 134.170.185.70"},{"no":25,"time":"120.000000","src":"192.168.1.105","dst":"1.1.1.1","proto":"DNS","len":74,"info":"Standard query A tracker.openbittorrent.com"}]}', 'application/vnd.tcpdump.pcap');

  // ─── More Code Files ─────────────────────────────────────────────────────
  const scriptsDir = d('Scripts', codeDir);
  f('setup.sh', scriptsDir, '#!/bin/bash\nset -euo pipefail\n\n# Development environment setup script\nBLUE="\\033[0;34m"; GREEN="\\033[0;32m"; NC="\\033[0m"\n\nlog() { echo -e "${BLUE}[SETUP]${NC} $1"; }\nok()  { echo -e "${GREEN}[OK]${NC} $1"; }\n\nlog "Checking prerequisites..."\ncommand -v docker &>/dev/null || { echo "Docker not found. Install from https://docker.com"; exit 1; }\ncommand -v node &>/dev/null   || { echo "Node.js not found. Install from https://nodejs.org"; exit 1; }\n\nlog "Installing dependencies..."\nnpm ci --prefix ./frontend\npip install -r backend/requirements.txt\n\nlog "Setting up environment..."\n[ -f .env ] || cp .env.example .env\n\nlog "Starting services..."\ndocker compose up -d postgres redis\nsleep 3\n\nlog "Running migrations..."\ncd backend && python manage.py migrate && cd ..\n\nlog "Seeding database..."\ncd backend && python manage.py seed_db --dev && cd ..\n\nok "Setup complete! Run: npm run dev"\necho "Frontend: http://localhost:5173"\necho "Backend:  http://localhost:8000"\necho "Docs:     http://localhost:8000/docs"', 'text/plain');

  f('.env.example', scriptsDir, '# Copy to .env and fill in values\n# DO NOT commit .env to git\n\n# Application\nAPP_ENV=development\nAPP_PORT=8000\nAPP_SECRET_KEY=change-me-in-production-use-long-random-string\nAPP_DEBUG=true\n\n# Database (PostgreSQL)\nDB_HOST=localhost\nDB_PORT=5432\nDB_NAME=myapp_dev\nDB_USER=postgres\nDB_PASSWORD=postgres\nDATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_dev\n\n# Redis\nREDIS_URL=redis://localhost:6379/0\n\n# JWT\nJWT_SECRET=another-long-random-secret-for-jwt\nJWT_ACCESS_EXPIRE_MINUTES=15\nJWT_REFRESH_EXPIRE_DAYS=30\n\n# Email (SMTP)\nSMTP_HOST=smtp.gmail.com\nSMTP_PORT=587\nSMTP_USER=your@email.com\nSMTP_PASS=your-app-password\nSMTP_FROM=noreply@yourapp.com\n\n# AWS S3\nAWS_ACCESS_KEY_ID=\nAWS_SECRET_ACCESS_KEY=\nAWS_S3_BUCKET=your-bucket-name\nAWS_REGION=us-east-1\n\n# Stripe\nSTRIPE_PUBLIC_KEY=pk_test_...\nSTRIPE_SECRET_KEY=sk_test_...\nSTRIPE_WEBHOOK_SECRET=whsec_...', 'text/plain');

  f('main.go', scriptsDir, 'package main\n\nimport (\n\t"encoding/json"\n\t"fmt"\n\t"log"\n\t"net/http"\n\t"os"\n\t"time"\n\n\t"github.com/gorilla/mux"\n)\n\ntype Response struct {\n\tStatus  string      `json:"status"`\n\tData    interface{} `json:"data,omitempty"`\n\tError   string      `json:"error,omitempty"`\n\tLatency int64       `json:"latency_ms"`\n}\n\nfunc writeJSON(w http.ResponseWriter, code int, v interface{}) {\n\tw.Header().Set("Content-Type", "application/json")\n\tw.WriteHeader(code)\n\tif err := json.NewEncoder(w).Encode(v); err != nil {\n\t\tlog.Printf("encode error: %v", err)\n\t}\n}\n\nfunc healthHandler(w http.ResponseWriter, r *http.Request) {\n\tstart := time.Now()\n\twriteJSON(w, http.StatusOK, Response{\n\t\tStatus:  "ok",\n\t\tData:    map[string]string{"version": "1.0.0", "uptime": time.Since(start).String()},\n\t\tLatency: time.Since(start).Milliseconds(),\n\t})\n}\n\nfunc main() {\n\tport := os.Getenv("PORT")\n\tif port == "" {\n\t\tport = "8080"\n\t}\n\tr := mux.NewRouter()\n\tr.HandleFunc("/health", healthHandler).Methods("GET")\n\tfmt.Printf("Server running on :%s\\n", port)\n\tlog.Fatal(http.ListenAndServe(":"+port, r))\n}', 'text/plain');

  f('README.md', codeDir, '# Customer Portal v2.0\n\nA modern customer management portal built with React + TypeScript (frontend) and Python/Flask (backend).\n\n## Stack\n\n| Layer | Tech |\n|-------|------|\n| Frontend | React 18, TypeScript, Vite, Zustand |\n| Backend | Python 3.12, Flask, SQLAlchemy |\n| Database | PostgreSQL 15 + Redis |\n| Auth | JWT (access + refresh tokens) |\n| Infra | Docker, nginx, AWS ECS |\n\n## Quick Start\n\n```bash\ngit clone https://github.com/alexj/customer-portal\ncd customer-portal\n./setup.sh\n```\n\n## Development\n\n```bash\nnpm run dev          # Frontend dev server (localhost:5173)\npython server.py     # Backend API (localhost:8000)\ndocker compose up -d # Postgres + Redis\n```\n\n## API Endpoints\n\n```\nGET  /api/v2/users      List users (auth required)\nPOST /api/v2/auth/token Issue JWT token\nGET  /api/v2/dashboard  Dashboard metrics\n```\n\n## Testing\n\n```bash\npytest backend/           # Python unit tests\nnpm run test --ui         # Vitest frontend tests\n```\n\n## Deployment\n\nPush to `main` triggers GitHub Actions CI/CD:\n1. Tests must pass\n2. Docker image built & pushed to ECR\n3. ECS rolling deploy\n4. Smoke test\n\n## Team\n\n- Alex Johnson (Lead) — alex@company.com\n- Sarah Chen (Backend) — sarah@company.com\n- Mike Torres (Frontend) — mike@company.com', 'text/plain');

  f('config.json', codeDir, '{\n  "app": {\n    "name": "CustomerPortal",\n    "version": "2.0.0",\n    "environment": "development",\n    "port": 5173,\n    "api_base_url": "http://localhost:8000"\n  },\n  "features": {\n    "dark_mode": true,\n    "analytics": false,\n    "maintenance_mode": false,\n    "beta_features": ["new_dashboard", "ai_search"]\n  },\n  "limits": {\n    "max_file_upload_mb": 10,\n    "max_users_per_request": 100,\n    "session_timeout_minutes": 30,\n    "max_retries": 3\n  },\n  "cache": {\n    "ttl_seconds": 300,\n    "max_entries": 10000\n  },\n  "logging": {\n    "level": "debug",\n    "format": "json",\n    "output": "console"\n  }\n}', 'text/plain');

  // ─── Design / Creative App Files ─────────────────────────────────────────
  const designDir = d('Design Projects', docs);
  const psDir2 = d('Photoshop', designDir);
  f('brand_identity_v3.psd', psDir2, 'Adobe Photoshop Document\nFile: brand_identity_v3.psd\nDimensions: 3840 x 2160 px\nResolution: 300 PPI\nColor Mode: RGB/8bit\nLayers: 42\nSize on disk: 287 MB\n\nLayer Structure:\n- Background\n  - Gradient fill\n- Logo Group\n  - Primary logo (vector)\n  - Tagline text\n- Color Palette swatches\n- Typography specimens\n  - Heading font: Neue Haas Grotesk\n  - Body font: Inter\n- Mockup scenes\n  - Business card preview\n  - Letterhead preview\n  - Digital banner 1200x628', 'application/octet-stream');
  f('social_media_kit.psd', psDir2, 'Adobe Photoshop Document\nFile: social_media_kit.psd\nDimensions: 1080 x 1080 px\nResolution: 72 PPI\nColor Mode: RGB/8bit\nLayers: 28\nSize on disk: 48 MB\n\nArtboards:\n- Instagram Post (1080x1080)\n- Instagram Story (1080x1920)\n- Twitter Header (1500x500)\n- Facebook Cover (851x315)\n- LinkedIn Banner (1584x396)\n\nSmart Objects: logo.ai, product_shot.jpg\nFonts: Montserrat Bold, Montserrat Regular', 'application/octet-stream');
  f('product_retouching.psd', psDir2, 'Adobe Photoshop Document\nFile: product_retouching.psd\nDimensions: 4800 x 3200 px\nResolution: 300 PPI\nColor Mode: RGB/16bit\nLayers: 67\nSize on disk: 1.24 GB\n\nRetouching layers:\n- RAW source (Camera Raw filter)\n- Frequency Separation (High)\n- Frequency Separation (Low)\n- Color grading LUT\n- Dodge & Burn\n- Background removal mask\n- Drop shadow\n- Final composite', 'application/octet-stream');

  const aiDir2 = d('Illustrator', designDir);
  f('logo_vectors.ai', aiDir2, 'Adobe Illustrator Document\nFile: logo_vectors.ai\nVersion: CC 2024\nColor Mode: CMYK\nArtboards: 5\n  - Primary logo (full color)\n  - Primary logo (white)\n  - Primary logo (black)\n  - Icon only\n  - Favicon (32x32)\n\nFonts: Neue Haas Grotesk Display 75 Bold\nColors: Pantone 2945 C, Pantone 485 C, Black\nLayers:\n- Guides\n- Typography\n- Icon shapes\n- Background', 'application/octet-stream');
  f('ui_icon_set.ai', aiDir2, 'Adobe Illustrator Document\nFile: ui_icon_set.ai\nVersion: CC 2024\nColor Mode: RGB\nArtboards: 48 (24x24 grid, 2px stroke)\nIcon categories:\n- Navigation (home, back, forward, menu)\n- Actions (add, edit, delete, save, share)\n- Media (play, pause, stop, volume)\n- Files (folder, file, upload, download)\n- Communication (mail, chat, phone, notification)\n- UI (settings, search, filter, sort)\nExport: SVG, PNG @1x/2x/3x', 'application/octet-stream');

  const prDir2 = d('Premiere Pro', designDir);
  f('youtube_channel_intro.prproj', prDir2, 'Adobe Premiere Pro Project\nFile: youtube_channel_intro.prproj\nVersion: 24.0\nTimeline: 00:00:08:00 (8 seconds)\nSequence: 1920x1080 29.97fps\n\nBins:\n- /Footage\n  - logo_animation.mov (ProRes 4444)\n  - background_loop.mp4\n  - whoosh_sfx.wav\n- /Audio\n  - intro_music_15sec.mp3\n- /Graphics\n  - channel_name_title.mogrt\n  - subscribe_button.mogrt\n\nEffects: Lumetri Color, Ultra Key, Warp Stabilizer\nAudio tracks: Music, SFX, Voice', 'application/octet-stream');
  f('short_film_cut_v4.prproj', prDir2, 'Adobe Premiere Pro Project\nFile: short_film_cut_v4.prproj\nVersion: 24.0\nTimeline: 00:12:34:18 (12 min 34 sec)\nSequence: 4K (3840x2160) 24fps\n\nBins:\n- /A-Roll (48 clips)\n- /B-Roll (112 clips)\n- /Music_Score\n  - orchestral_theme.wav\n  - ambient_tension.wav\n- /SFX_Library (234 clips)\n- /Color_Grades\n  - REC709_to_HLG_LUT.cube\n  - skin_tone_base.cube\n\nCut history: v1 (rough), v2 (picture lock), v3 (color temp), v4 (final grade)\nExport: H.264 4K, ProRes 422 HQ archive', 'application/octet-stream');

  const aeDir2 = d('After Effects', designDir);
  f('motion_graphics_reel.aep', aeDir2, 'Adobe After Effects Project\nFile: motion_graphics_reel.aep\nVersion: 24.0\nDuration: 02:30 (150 seconds)\nComposition: 1920x1080 60fps\n\nCompositions (12):\n- Main_Reel (master)\n- Logo_Reveal (5s)\n- Text_Kinetics (8s)\n- Particle_System (12s)\n- Data_Visualization (15s)\n- 3D_Camera_Fly (10s)\n- Liquid_Transition (3s)\n- Glitch_Effect (4s)\n- Lower_Third_Pack (6s)\n- End_Card (5s)\n\nPlugins: Trapcode Suite, Element 3D, Optical Flares\nRender Queue: AME Media Encoder, H.264 1080p', 'application/octet-stream');
  f('lower_thirds_pack.aep', aeDir2, 'Adobe After Effects Project\nFile: lower_thirds_pack.aep\nVersion: 24.0\nComposition: 1920x1080 29.97fps\n\n25 Lower Third Templates:\n- News ticker style\n- Corporate minimal\n- YouTube creator style\n- Breaking news (animated)\n- Sports broadcast\n- Interview nameplate\n- Social media handles (5 variants)\n- Countdown timer\n- Progress bar\n- Topic title card\n\nAll text layers are editable.\nColors use master color control effect.\nFonts: Adobe Fonts (Myriad Pro, Source Sans)', 'application/octet-stream');

  // ─── CAD / Engineering Files ───────────────────────────────────────────────
  const cadDir = d('CAD Projects', docs);
  f('office_floor_plan_rev4.dwg', cadDir, 'AutoCAD Drawing\nFile: office_floor_plan_rev4.dwg\nAutoCAD Version: 2024 (R24.3)\nUnits: Millimeters\nScale: 1:100\nSize: 24.0 MB\n\nLayers (18):\n- 0 (default)\n- WALLS (continuous, weight 0.50)\n- DOORS (continuous, weight 0.25)\n- WINDOWS (continuous, weight 0.25)\n- FURNITURE (dashed, weight 0.13)\n- ELECTRICAL (hidden, weight 0.18)\n- DIMENSIONS\n- TEXT_NOTES\n\nBlock References:\n- Desk_L_shape (x28)\n- Chair_Office (x34)\n- Conference_Table_10 (x2)\n- Bathroom_Fixtures\n- Emergency_Exit_Signs (x6)\n\nRevision History:\n- Rev 1: Initial layout\n- Rev 2: Added server room\n- Rev 3: HVAC overlay\n- Rev 4: ADA compliance updates', 'application/octet-stream');
  f('mechanical_bracket_v2.dwg', cadDir, 'AutoCAD Drawing\nFile: mechanical_bracket_v2.dwg\nAutoCAD Version: 2024 (R24.3)\nUnits: Millimeters\nScale: 1:1\nSize: 3.8 MB\n\nDimensions:\n- Overall: 240 x 180 x 45 mm\n- Material thickness: 6 mm\n- Hole pattern: M8 x 8 holes, 25mm spacing\n- Tolerance: H7/h6 fit\n\nViews:\n- Front view (primary)\n- Top view\n- Right side view\n- Isometric\n- Section A-A (hole detail)\n\nMaterial: Aluminum 6061-T6\nFinish: Anodized Type II, Clear\nDrawn by: A. Johnson\nApproved by: M. Torres\nDate: 2025-02-14', 'application/octet-stream');

  const swDir2 = d('SolidWorks', cadDir);
  f('gearbox_housing_v5.SLDPRT', swDir2, 'SolidWorks Part Document\nFile: gearbox_housing_v5.SLDPRT\nSolidWorks Version: 2024 SP3\nUnits: MMGS (millimeter, gram, second)\n\nFeature Tree (32 features):\n- Imported Geometry\n- Boss-Extrude1 (base body, 180x120x85mm)\n- Cut-Extrude1 (bearing pocket D72)\n- Cut-Extrude2 (bearing pocket D72)\n- Fillet1 (R3 all inner corners)\n- Shell1 (5mm wall thickness)\n- Boss-Extrude2 (mounting flanges)\n- Cut-Extrude3 (M6 mounting holes x8)\n- Mirror1 (symmetric features)\n- Surface-Knit1 (gasket surface)\n\nMaterial: Gray Cast Iron (ASTM A48 Class 30)\nMass: 4.82 kg\nCG: (90.2, 60.1, 42.5) mm\nSurface Area: 34,821 mm^2', 'application/octet-stream');
  f('drive_shaft_assembly.SLDASM', swDir2, 'SolidWorks Assembly Document\nFile: drive_shaft_assembly.SLDASM\nSolidWorks Version: 2024 SP3\nUnits: MMGS\n\nComponents (14):\n- shaft_main.SLDPRT (1x)\n- bearing_6208.SLDPRT (2x)\n- bearing_housing.SLDPRT (2x)\n- coupling_flange.SLDPRT (2x)\n- key_6x6x50.SLDPRT (2x)\n- snap_ring_62mm.SLDPRT (2x)\n- seal_lip_62mm.SLDPRT (2x)\n- bolt_M8x25.SLDPRT (8x)\n\nMates:\n- Concentric (shaft to bearing bore)\n- Coincident (shoulder to bearing face)\n- Parallel (key flats)\n\nInterferences: None detected\nTotal mass: 8.34 kg\nMotion study: Rotation 1450 RPM', 'application/octet-stream');
  f('pump_impeller.SLDPRT', swDir2, 'SolidWorks Part Document\nFile: pump_impeller.SLDPRT\nSolidWorks Version: 2024 SP3\nUnits: MMGS\n\nFeature Tree (28 features):\n- Revolve1 (hub body, D85)\n- CurvedSurface-Loft1 (blade profile)\n- CircularPattern1 (6 blades, 60deg spacing)\n- Cut-Extrude1 (bore D25H7)\n- Cut-Extrude2 (keyway 8x4mm)\n- Fillet1-8 (hydraulic profile smoothing)\n- Draft1 (2deg casting draft)\n\nMaterial: 316L Stainless Steel\nMass: 0.842 kg\nMoment of Inertia: Ixx=1.42e4 kg*mm^2\nCFD analysis: eta=78.3% at 2900 RPM, Q=45 m3/h', 'application/octet-stream');

  // ─── OBS Scene Collection ──────────────────────────────────────────────────
  const obsDir2 = d('OBS', docs);
  f('stream_scenes.json', obsDir2, '{\n  "name": "Main Stream Setup",\n  "uuid": "a8f3c2d1-4e7b-4a9c-b8e2-f1d3a5c7e9b1",\n  "current_scene": "Gaming",\n  "current_program_scene": "Gaming",\n  "scenes": [\n    {\n      "id": 1,\n      "name": "Gaming",\n      "sources": [\n        {"type": "game_capture", "name": "Game Capture", "settings": {"window": "", "capture_mode": "any_fullscreen"}},\n        {"type": "dshow_input", "name": "Webcam 4K", "settings": {"video_device_id": "Logitech BRIO"}},\n        {"type": "wasapi_input_capture", "name": "Mic (Blue Yeti)", "settings": {}},\n        {"type": "text_gdiplus", "name": "Alerts Overlay", "settings": {}},\n        {"type": "browser_source", "name": "Chat Overlay", "settings": {"url": "https://streamelements.com/overlay"}}\n      ]\n    },\n    {\n      "id": 2,\n      "name": "Just Chatting",\n      "sources": [\n        {"type": "dshow_input", "name": "Webcam 4K (fullscreen)", "settings": {}},\n        {"type": "wasapi_input_capture", "name": "Mic (Blue Yeti)", "settings": {}},\n        {"type": "image_source", "name": "Background", "settings": {"file": "background_chatting.png"}}\n      ]\n    },\n    {\n      "id": 3,\n      "name": "BRB Screen",\n      "sources": [\n        {"type": "image_source", "name": "BRB Image", "settings": {"file": "brb_screen.png"}},\n        {"type": "wasapi_output_capture", "name": "Desktop Audio", "settings": {}}\n      ]\n    },\n    {\n      "id": 4,\n      "name": "Starting Soon",\n      "sources": [\n        {"type": "browser_source", "name": "Countdown Timer", "settings": {"url": "https://lodlive.it/countdown?t=1741000000"}},\n        {"type": "image_source", "name": "Brand Background", "settings": {}}\n      ]\n    }\n  ]\n}', 'text/plain');

  // ─── VLC Playlist ─────────────────────────────────────────────────────────
  const vlcDir2 = d('VLC', docs);
  f('music_playlist.m3u', vlcDir2, '#EXTM3U\n#PLAYLIST:My Music Collection\n\n#EXTINF:214,Daft Punk - Get Lucky\nD:\\Music\\Daft Punk\\Random Access Memories\\Get Lucky.flac\n\n#EXTINF:245,Pink Floyd - Comfortably Numb\nD:\\Music\\Pink Floyd\\The Wall\\Comfortably Numb.flac\n\n#EXTINF:252,The Beatles - Bohemian Rhapsody\nD:\\Music\\Queen\\A Night At The Opera\\Bohemian Rhapsody.flac\n\n#EXTINF:315,Led Zeppelin - Stairway to Heaven\nD:\\Music\\Led Zeppelin\\Led Zeppelin IV\\Stairway to Heaven.flac\n\n#EXTINF:234,Nirvana - Smells Like Teen Spirit\nD:\\Music\\Nirvana\\Nevermind\\Smells Like Teen Spirit.flac\n\n#EXTINF:183,The Weeknd - Blinding Lights\nD:\\Music\\The Weeknd\\After Hours\\Blinding Lights.flac\n\n#EXTINF:256,Kendrick Lamar - HUMBLE.\nD:\\Music\\Kendrick Lamar\\DAMN\\HUMBLE.flac\n\n#EXTINF:267,Radiohead - Creep\nD:\\Music\\Radiohead\\Pablo Honey\\Creep.flac\n\n#EXTINF:298,Tool - Schism\nD:\\Music\\Tool\\Lateralus\\Schism.flac\n\n#EXTINF:189,Billie Eilish - bad guy\nD:\\Music\\Billie Eilish\\WHEN WE ALL FALL ASLEEP\\bad guy.flac', 'text/plain');

  f('movies_watched.m3u', vlcDir2, '#EXTM3U\n#PLAYLIST:Watch Later\n\n#EXTINF:10162,Interstellar (2014)\nE:\\Movies\\Interstellar.2014.2160p.BluRay.HEVC.mkv\n\n#EXTINF:9054,The Dark Knight (2008)\nE:\\Movies\\The.Dark.Knight.2008.2160p.BluRay.HEVC.mkv\n\n#EXTINF:8969,Inception (2010)\nE:\\Movies\\Inception.2010.2160p.BluRay.HEVC.mkv\n\n#EXTINF:6912,Pulp Fiction (1994)\nE:\\Movies\\Pulp.Fiction.1994.1080p.BluRay.mkv\n\n#EXTINF:8867,The Matrix (1999)\nE:\\Movies\\The.Matrix.1999.2160p.Remastered.mkv\n\n#EXTINF:7561,Parasite (2019)\nE:\\Movies\\Parasite.2019.1080p.BluRay.mkv\n\n#EXTINF:5843,Spirited Away (2001)\nE:\\Movies\\Spirited.Away.2001.1080p.BluRay.mkv', 'text/plain');

  return { nodes, rootId };
}
