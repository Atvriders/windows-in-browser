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
  d('Counter-Strike 2', common);
  d('Cyberpunk 2077', common);
  d('Minecraft', common);
  d('Elden Ring', common);

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

  return { nodes, rootId };
}
