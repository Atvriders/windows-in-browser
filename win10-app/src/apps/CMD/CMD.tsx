import { useState, useRef, useEffect } from 'react';
import './CMD.css';

interface Props { powershell?: boolean; }
type CmdLine = { type: 'input' | 'output' | 'error'; text: string };

const FS_TREE: Record<string, string[]> = {
  'C:\\': ['Windows', 'Program Files', 'Program Files (x86)', 'Users', 'PerfLogs'],
  'C:\\Windows': ['System32', 'SysWOW64', 'Temp', 'Fonts', 'inf', 'Logs'],
  'C:\\Windows\\System32': [
    'cmd.exe','powershell.exe','notepad.exe','calc.exe','taskmgr.exe',
    'regedit.exe','mspaint.exe','explorer.exe','svchost.exe','ntdll.dll',
    'kernel32.dll','user32.dll','mmsys.cpl','ncpa.cpl','appwiz.cpl',
    'sysdm.cpl','ipconfig.exe','ping.exe','netstat.exe','tracert.exe',
  ],
  'C:\\Users': ['User', 'Public', 'Default'],
  'C:\\Users\\User': ['Desktop','Documents','Downloads','Pictures','Music','Videos','AppData'],
  'C:\\Program Files': ['Google','Microsoft Office','Steam','Discord','Spotify','7-Zip'],
};

export default function CMD({ powershell }: Props) {
  const initMsg = powershell
    ? `Windows PowerShell\nCopyright (C) Microsoft Corporation. All rights reserved.\n\nPS C:\\Users\\User> `
    : `Microsoft Windows [Version 10.0.19045.3996]\n(c) Microsoft Corporation. All rights reserved.\n\n`;

  const [cwd, setCwd] = useState('C:\\Users\\User');
  const [lines, setLines] = useState<CmdLine[]>([{ type: 'output', text: initMsg }]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const prompt = powershell ? `PS ${cwd}> ` : `${cwd}>`;

  const addLines = (...newLines: CmdLine[]) =>
    setLines(l => [...l, ...newLines]);

  const runCommand = (raw: string) => {
    const trimmed = raw.trim();
    addLines({ type: 'input', text: prompt + trimmed });
    if (!trimmed) return;
    setCmdHistory(h => [trimmed, ...h.slice(0, 49)]);
    setHistIdx(-1);

    const [cmd, ...args] = trimmed.split(/\s+/);
    const cmdL = cmd.toLowerCase();
    const argStr = args.join(' ');

    switch (cmdL) {
      case 'cls':
      case 'clear':
        setLines([]);
        break;

      case 'echo':
        addLines({ type: 'output', text: argStr || 'ECHO is on.' });
        break;

      case 'ver':
        addLines({ type: 'output', text: '\nMicrosoft Windows [Version 10.0.19045.3996]\n' });
        break;

      case 'whoami':
        addLines({ type: 'output', text: 'desktop-win10\\user' });
        break;

      case 'hostname':
        addLines({ type: 'output', text: 'DESKTOP-WIN10' });
        break;

      case 'date':
        addLines({ type: 'output', text: `The current date is: ${new Date().toLocaleDateString()}` });
        break;

      case 'time':
        addLines({ type: 'output', text: `The current time is: ${new Date().toLocaleTimeString()}` });
        break;

      case 'dir': {
        const target = argStr || cwd;
        const contents = FS_TREE[target] ?? FS_TREE[cwd] ?? [];
        const now = new Date();
        const ds = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        const ts = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        let out = `\n Directory of ${target}\n\n`;
        out += `${ds}  ${ts}    <DIR>          .\n`;
        out += `${ds}  ${ts}    <DIR>          ..\n`;
        contents.forEach(item => {
          const isDir = !item.includes('.');
          out += `${ds}  ${ts}    ${isDir ? '<DIR>          ' : '       1,024   '} ${item}\n`;
        });
        const files = contents.filter(i => i.includes('.')).length;
        const dirs = contents.filter(i => !i.includes('.')).length;
        out += `\n               ${files} File(s)          ${files * 1024} bytes\n`;
        out += `               ${dirs} Dir(s)   512,000,000,000 bytes free\n`;
        addLines({ type: 'output', text: out });
        break;
      }

      case 'cd':
      case 'chdir': {
        if (!argStr || argStr === '.') break;
        if (argStr === '..') {
          const parts = cwd.split('\\').filter(Boolean);
          if (parts.length > 1) {
            parts.pop();
            setCwd(parts.length === 1 ? parts[0] + '\\' : parts.join('\\'));
          }
          break;
        }
        if (argStr === '\\') { setCwd('C:\\'); break; }
        const newPath = argStr.includes(':') ? argStr : `${cwd}\\${argStr}`;
        setCwd(newPath);
        break;
      }

      case 'ipconfig': {
        const full = argStr === '/all';
        let out = '\nWindows IP Configuration\n\n';
        if (full) {
          out += `   Host Name . . . . . . . . . . . . : DESKTOP-WIN10\n`;
          out += `   Primary Dns Suffix  . . . . . . . :\n`;
          out += `   Node Type . . . . . . . . . . . . : Hybrid\n\n`;
        }
        out += `Wireless LAN adapter Wi-Fi:\n\n`;
        out += `   Connection-specific DNS Suffix  . :\n`;
        out += `   Link-local IPv6 Address . . . . . : fe80::a1b2:c3d4:e5f6:7890%12\n`;
        out += `   IPv4 Address. . . . . . . . . . . : 192.168.1.105\n`;
        out += `   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n`;
        out += `   Default Gateway . . . . . . . . . : 192.168.1.1\n`;
        if (full) {
          out += `   DHCP Server . . . . . . . . . . . : 192.168.1.1\n`;
          out += `   DNS Servers . . . . . . . . . . . : 8.8.8.8\n                                        8.8.4.4\n`;
        }
        addLines({ type: 'output', text: out });
        break;
      }

      case 'ping': {
        const host = args[0] || 'google.com';
        let out = `\nPinging ${host} [142.250.80.46] with 32 bytes of data:\n`;
        [12, 14, 11, 13].forEach(t => {
          out += `Reply from 142.250.80.46: bytes=32 time=${t}ms TTL=115\n`;
        });
        out += `\nPing statistics for 142.250.80.46:\n`;
        out += `    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\n`;
        out += `Approximate round trip times in milli-seconds:\n`;
        out += `    Minimum = 11ms, Maximum = 14ms, Average = 12ms\n`;
        addLines({ type: 'output', text: out });
        break;
      }

      case 'tracert': {
        const host = args[0] || 'google.com';
        let out = `\nTracing route to ${host} [142.250.80.46]\nover a maximum of 30 hops:\n\n`;
        [
          ['1', '1 ms', '1 ms', '1 ms', '192.168.1.1'],
          ['2', '8 ms', '9 ms', '8 ms', '10.0.0.1'],
          ['3', '12 ms', '11 ms', '12 ms', '72.14.215.165'],
          ['4', '13 ms', '14 ms', '13 ms', '142.250.80.46'],
        ].forEach(([hop, t1, t2, t3, ip]) => {
          out += `  ${hop.padStart(2)}    ${t1}   ${t2}   ${t3}   ${ip}\n`;
        });
        out += `\nTrace complete.\n`;
        addLines({ type: 'output', text: out });
        break;
      }

      case 'systeminfo': {
        const out = `
Host Name:                 DESKTOP-WIN10
OS Name:                   Microsoft Windows 10 Pro
OS Version:                10.0.19045 N/A Build 19045
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Workstation
OS Build Type:             Multiprocessor Free
Registered Owner:          User
Product ID:                00330-80000-00000-AA032
Original Install Date:     1/1/2024, 12:00:00 AM
System Boot Time:          ${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}
System Manufacturer:       ASUS
System Model:              PRIME Z690-P
System Type:               x64-based PC
Processor(s):              1 Processor(s) Installed.
                           [01]: Intel64 Family 6 Model 154 GenuineIntel ~3600 Mhz
BIOS Version:              ASUS 2703, 1/15/2024
Windows Directory:         C:\\Windows
System Directory:          C:\\Windows\\system32
Total Physical Memory:     16,384 MB
Available Physical Memory: 8,192 MB
`;
        addLines({ type: 'output', text: out });
        break;
      }

      case 'tasklist': {
        let out = `\nImage Name                     PID Session Name        Session#    Mem Usage\n`;
        out += `========================= ======== ================ =========== ============\n`;
        [
          ['System Idle Process', '0', 'Services', '0', '8 K'],
          ['System', '4', 'Services', '0', '144 K'],
          ['smss.exe', '448', 'Services', '0', '1,040 K'],
          ['csrss.exe', '652', 'Services', '0', '5,156 K'],
          ['wininit.exe', '764', 'Services', '0', '6,584 K'],
          ['services.exe', '840', 'Services', '0', '8,648 K'],
          ['lsass.exe', '864', 'Services', '0', '18,432 K'],
          ['svchost.exe', '1032', 'Services', '0', '32,768 K'],
          ['dwm.exe', '1620', 'Console', '1', '42,100 K'],
          ['explorer.exe', '3412', 'Console', '1', '78,432 K'],
          ['chrome.exe', '4520', 'Console', '1', '256,840 K'],
          ['discord.exe', '5120', 'Console', '1', '182,400 K'],
          ['code.exe', '6240', 'Console', '1', '312,560 K'],
          ['taskmgr.exe', '7120', 'Console', '1', '24,320 K'],
        ].forEach(([name, pid, sess, num, mem]) => {
          out += `${name.padEnd(26)} ${pid.padStart(8)} ${sess.padEnd(17)} ${num.padStart(11)} ${mem.padStart(12)}\n`;
        });
        addLines({ type: 'output', text: out });
        break;
      }

      case 'netstat': {
        let out = `\nActive Connections\n\n  Proto  Local Address          Foreign Address        State\n`;
        [
          ['TCP', '0.0.0.0:80', '0.0.0.0:0', 'LISTENING'],
          ['TCP', '0.0.0.0:443', '0.0.0.0:0', 'LISTENING'],
          ['TCP', '127.0.0.1:5040', '0.0.0.0:0', 'LISTENING'],
          ['TCP', '192.168.1.105:52431', '142.250.80.46:443', 'ESTABLISHED'],
          ['TCP', '192.168.1.105:53124', '52.114.132.73:443', 'ESTABLISHED'],
          ['TCP', '192.168.1.105:54000', '151.101.193.140:443', 'CLOSE_WAIT'],
        ].forEach(([proto, local, foreign, state]) => {
          out += `  ${proto.padEnd(7)}${local.padEnd(23)} ${foreign.padEnd(23)} ${state}\n`;
        });
        addLines({ type: 'output', text: out });
        break;
      }

      case 'set': {
        if (!argStr) {
          const vars = [
            'ALLUSERSPROFILE=C:\\ProgramData',
            'APPDATA=C:\\Users\\User\\AppData\\Roaming',
            'COMPUTERNAME=DESKTOP-WIN10',
            'ComSpec=C:\\Windows\\system32\\cmd.exe',
            'HOMEDRIVE=C:',
            'HOMEPATH=\\Users\\User',
            'NUMBER_OF_PROCESSORS=12',
            'OS=Windows_NT',
            'PATH=C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem',
            'PROCESSOR_ARCHITECTURE=AMD64',
            'PROCESSOR_IDENTIFIER=Intel64 Family 6 Model 154, GenuineIntel',
            'SystemDrive=C:',
            'SystemRoot=C:\\Windows',
            'TEMP=C:\\Users\\User\\AppData\\Local\\Temp',
            'USERNAME=User',
            'USERPROFILE=C:\\Users\\User',
            'WINDIR=C:\\Windows',
          ];
          addLines({ type: 'output', text: vars.join('\n') });
        }
        break;
      }

      case 'tree': {
        const contents = FS_TREE[cwd] ?? [];
        let out = `Folder PATH listing\nVolume serial number is 8C2A-D1F4\n${cwd}\n`;
        contents.forEach((item, i) => {
          out += `${i === contents.length - 1 ? '└───' : '├───'}${item}\n`;
        });
        addLines({ type: 'output', text: out });
        break;
      }

      case 'md':
      case 'mkdir':
        addLines({ type: 'output', text: '' });
        break;

      case 'color':
      case 'exit':
        addLines({ type: 'output', text: '' });
        break;

      case 'help': {
        let out = '\nFor more information on a specific command, type HELP command-name\n\n';
        [
          ['CD', 'Displays the name of or changes the current directory.'],
          ['CLS', 'Clears the screen.'],
          ['DATE', 'Displays or sets the date.'],
          ['DEL', 'Deletes one or more files.'],
          ['DIR', 'Displays a list of files and subdirectories in a directory.'],
          ['ECHO', 'Displays messages.'],
          ['EXIT', 'Quits the CMD.EXE program.'],
          ['HELP', 'Provides Help information for Windows commands.'],
          ['HOSTNAME', 'Prints the name of the current host.'],
          ['IPCONFIG', 'Display IP configuration. Use /all for full details.'],
          ['MD', 'Creates a directory.'],
          ['NETSTAT', 'Displays active TCP connections.'],
          ['PING', 'Sends ICMP Echo requests to a network host.'],
          ['SET', 'Displays environment variables.'],
          ['SYSTEMINFO', 'Displays machine specific properties and configuration.'],
          ['TASKLIST', 'Displays a list of currently running processes.'],
          ['TIME', 'Displays or sets the system time.'],
          ['TRACERT', 'Traces the route to a remote host.'],
          ['TREE', 'Graphically displays the directory structure.'],
          ['VER', 'Displays the Windows version.'],
          ['WHOAMI', 'Displays current user information.'],
        ].forEach(([c, d]) => { out += `${c.padEnd(12)} ${d}\n`; });
        addLines({ type: 'output', text: out });
        break;
      }

      default:
        addLines({ type: 'error', text: `'${cmd}' is not recognized as an internal or external command,\noperable program or batch file.` });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(newIdx);
      if (cmdHistory[newIdx] !== undefined) setInput(cmdHistory[newIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIdx = Math.max(histIdx - 1, -1);
      setHistIdx(newIdx);
      setInput(newIdx === -1 ? '' : cmdHistory[newIdx]);
    }
  };

  return (
    <div
      className={`cmd-root ${powershell ? 'cmd-ps' : ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="cmd-output">
        {lines.map((line, i) => (
          <pre key={i} className={`cmd-line cmd-${line.type}`}>{line.text}</pre>
        ))}
        <div className="cmd-input-row">
          <span className="cmd-prompt">{prompt}</span>
          <input
            ref={inputRef}
            className="cmd-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
