import { useState } from 'react';
import './VMManager.css';

type VMStatus = 'running' | 'stopped' | 'paused' | 'error';
type ISOCategory = 'windows-client' | 'windows-server' | 'linux-desktop' | 'linux-server' | 'security' | 'network' | 'homelab' | 'container';
type Tab = 'vms' | 'isos' | 'k3s';

interface VM {
  id: string; name: string; status: VMStatus;
  os: string; cpus: number; ram: string; disk: string;
}

interface ISO {
  id: string; filename: string; category: ISOCategory;
  os: string; size: string; added: string; arch: string;
}

interface K3sNode {
  name: string; role: 'server' | 'agent';
  status: 'Ready' | 'NotReady'; version: string; ip: string; age: string;
}

interface Addon {
  name: string; desc: string; enabled: boolean;
}

// ── VMs ──────────────────────────────────────────────────────────────────────
const INITIAL_VMS: VM[] = [
  { id: 'v1',  name: 'pve-node-01',    status: 'running', os: 'Proxmox VE 8.1',         cpus: 8, ram: '32 GB',  disk: '2 TB'   },
  { id: 'v2',  name: 'win-dc-01',      status: 'running', os: 'Windows Server 2022',     cpus: 4, ram: '8 GB',   disk: '100 GB' },
  { id: 'v3',  name: 'ubuntu-web',     status: 'running', os: 'Ubuntu 22.04 LTS',        cpus: 2, ram: '4 GB',   disk: '50 GB'  },
  { id: 'v4',  name: 'kali-pentest',   status: 'stopped', os: 'Kali Linux 2024.1',       cpus: 4, ram: '8 GB',   disk: '80 GB'  },
  { id: 'v5',  name: 'truenas-scale',  status: 'running', os: 'TrueNAS SCALE 24.04',     cpus: 4, ram: '16 GB',  disk: '8 TB'   },
  { id: 'v6',  name: 'k3s-server-01',  status: 'running', os: 'Ubuntu 22.04 LTS',        cpus: 4, ram: '8 GB',   disk: '100 GB' },
  { id: 'v7',  name: 'k3s-agent-01',   status: 'running', os: 'Ubuntu 22.04 LTS',        cpus: 2, ram: '4 GB',   disk: '50 GB'  },
  { id: 'v8',  name: 'k3s-agent-02',   status: 'running', os: 'Ubuntu 22.04 LTS',        cpus: 2, ram: '4 GB',   disk: '50 GB'  },
  { id: 'v9',  name: 'pfsense-router', status: 'running', os: 'pfSense 2.7.0',           cpus: 2, ram: '2 GB',   disk: '16 GB'  },
  { id: 'v10', name: 'win10-dev',      status: 'paused',  os: 'Windows 10 22H2',         cpus: 4, ram: '8 GB',   disk: '120 GB' },
];

// ── ISOs ─────────────────────────────────────────────────────────────────────
const ISOS: ISO[] = [
  // Windows Client — every release
  { id: 'wc01', filename: 'Windows_1.0_1985.img',                        category: 'windows-client', os: 'Windows 1.0',                           size: '360 KB', added: '1985-11-20', arch: 'x86'  },
  { id: 'wc02', filename: 'Windows_2.0_1987.img',                        category: 'windows-client', os: 'Windows 2.0',                           size: '720 KB', added: '1987-12-09', arch: 'x86'  },
  { id: 'wc03', filename: 'Windows_3.0_1990.img',                        category: 'windows-client', os: 'Windows 3.0',                           size: '5.3 MB', added: '1990-05-22', arch: 'x86'  },
  { id: 'wc04', filename: 'Windows_3.1_1992.img',                        category: 'windows-client', os: 'Windows 3.1',                           size: '6.4 MB', added: '1992-04-06', arch: 'x86'  },
  { id: 'wc05', filename: 'Windows_3.11_WFW.img',                        category: 'windows-client', os: 'Windows 3.11 for Workgroups',           size: '7.2 MB', added: '1993-11-08', arch: 'x86'  },
  { id: 'wc06', filename: 'Windows_95_OSR2.iso',                         category: 'windows-client', os: 'Windows 95 OSR2',                       size: '344 MB', added: '1995-08-24', arch: 'x86'  },
  { id: 'wc07', filename: 'Windows_98_First_Edition.iso',                category: 'windows-client', os: 'Windows 98',                            size: '507 MB', added: '1998-06-25', arch: 'x86'  },
  { id: 'wc08', filename: 'Windows_98_SE.iso',                           category: 'windows-client', os: 'Windows 98 SE',                         size: '542 MB', added: '1999-05-05', arch: 'x86'  },
  { id: 'wc09', filename: 'Windows_ME.iso',                              category: 'windows-client', os: 'Windows ME',                            size: '484 MB', added: '2000-09-14', arch: 'x86'  },
  { id: 'wc10', filename: 'Windows_2000_Pro_SP4.iso',                    category: 'windows-client', os: 'Windows 2000 Professional SP4',         size: '619 MB', added: '2000-02-17', arch: 'x86'  },
  { id: 'wc11', filename: 'Windows_XP_Pro_SP3_x86.iso',                  category: 'windows-client', os: 'Windows XP Professional SP3',           size: '617 MB', added: '2001-10-25', arch: 'x86'  },
  { id: 'wc12', filename: 'Windows_XP_Pro_SP2_x64.iso',                  category: 'windows-client', os: 'Windows XP Professional x64',           size: '628 MB', added: '2005-04-25', arch: 'x64'  },
  { id: 'wc13', filename: 'Windows_Vista_Ultimate_SP2_x64.iso',          category: 'windows-client', os: 'Windows Vista Ultimate SP2',            size: '3.98 GB', added: '2007-01-30', arch: 'x64' },
  { id: 'wc14', filename: 'Windows_7_Ultimate_SP1_x64.iso',              category: 'windows-client', os: 'Windows 7 Ultimate SP1',                size: '3.11 GB', added: '2009-10-22', arch: 'x64' },
  { id: 'wc15', filename: 'Windows_8_Pro_x64.iso',                       category: 'windows-client', os: 'Windows 8 Pro',                         size: '3.57 GB', added: '2012-10-26', arch: 'x64' },
  { id: 'wc16', filename: 'Windows_8.1_Pro_x64.iso',                     category: 'windows-client', os: 'Windows 8.1 Pro',                       size: '3.83 GB', added: '2013-10-17', arch: 'x64' },
  { id: 'wc17', filename: 'Win10_1507_x64.iso',                          category: 'windows-client', os: 'Windows 10 1507 (RTM)',                  size: '3.72 GB', added: '2015-07-29', arch: 'x64' },
  { id: 'wc18', filename: 'Win10_1511_x64.iso',                          category: 'windows-client', os: 'Windows 10 1511 (November Update)',      size: '3.80 GB', added: '2015-11-10', arch: 'x64' },
  { id: 'wc19', filename: 'Win10_1607_x64.iso',                          category: 'windows-client', os: 'Windows 10 1607 (Anniversary Update)',   size: '3.86 GB', added: '2016-08-02', arch: 'x64' },
  { id: 'wc20', filename: 'Win10_1703_x64.iso',                          category: 'windows-client', os: 'Windows 10 1703 (Creators Update)',      size: '4.03 GB', added: '2017-04-05', arch: 'x64' },
  { id: 'wc21', filename: 'Win10_1709_x64.iso',                          category: 'windows-client', os: 'Windows 10 1709 (Fall Creators Update)', size: '4.09 GB', added: '2017-10-17', arch: 'x64' },
  { id: 'wc22', filename: 'Win10_1803_x64.iso',                          category: 'windows-client', os: 'Windows 10 1803 (April 2018 Update)',    size: '4.27 GB', added: '2018-04-30', arch: 'x64' },
  { id: 'wc23', filename: 'Win10_1809_x64.iso',                          category: 'windows-client', os: 'Windows 10 1809 (October 2018 Update)',  size: '4.32 GB', added: '2018-10-02', arch: 'x64' },
  { id: 'wc24', filename: 'Win10_1903_x64.iso',                          category: 'windows-client', os: 'Windows 10 1903 (May 2019 Update)',      size: '4.48 GB', added: '2019-05-21', arch: 'x64' },
  { id: 'wc25', filename: 'Win10_1909_x64.iso',                          category: 'windows-client', os: 'Windows 10 1909 (November 2019 Update)', size: '4.52 GB', added: '2019-11-12', arch: 'x64' },
  { id: 'wc26', filename: 'Win10_2004_x64.iso',                          category: 'windows-client', os: 'Windows 10 2004 (May 2020 Update)',      size: '4.85 GB', added: '2020-05-27', arch: 'x64' },
  { id: 'wc27', filename: 'Win10_20H2_x64.iso',                          category: 'windows-client', os: 'Windows 10 20H2 (October 2020 Update)', size: '4.90 GB', added: '2020-10-20', arch: 'x64' },
  { id: 'wc28', filename: 'Win10_21H1_x64.iso',                          category: 'windows-client', os: 'Windows 10 21H1 (May 2021 Update)',      size: '4.95 GB', added: '2021-05-18', arch: 'x64' },
  { id: 'wc29', filename: 'Win10_21H2_x64.iso',                          category: 'windows-client', os: 'Windows 10 21H2 (November 2021 Update)', size: '5.07 GB', added: '2021-11-16', arch: 'x64' },
  { id: 'wc30', filename: 'Win10_22H2_x64.iso',                          category: 'windows-client', os: 'Windows 10 22H2 (October 2022 Update)', size: '5.29 GB', added: '2022-10-18', arch: 'x64' },
  { id: 'wc31', filename: 'Win10_23H2_x64.iso',                          category: 'windows-client', os: 'Windows 10 23H2 (November 2023 Update)', size: '5.47 GB', added: '2023-10-31', arch: 'x64' },
  { id: 'wc32', filename: 'Win10_24H2_x64.iso',                          category: 'windows-client', os: 'Windows 10 24H2 (2024 Update)',          size: '5.63 GB', added: '2024-10-08', arch: 'x64' },
  { id: 'wc33', filename: 'Win11_21H2_x64.iso',                          category: 'windows-client', os: 'Windows 11 21H2 (RTM)',                  size: '5.14 GB', added: '2021-10-05', arch: 'x64' },
  { id: 'wc34', filename: 'Win11_22H2_x64.iso',                          category: 'windows-client', os: 'Windows 11 22H2',                        size: '5.37 GB', added: '2022-09-20', arch: 'x64' },
  { id: 'wc35', filename: 'Win11_23H2_x64.iso',                          category: 'windows-client', os: 'Windows 11 23H2',                        size: '5.68 GB', added: '2023-10-31', arch: 'x64' },
  { id: 'wc36', filename: 'Win11_24H2_x64.iso',                          category: 'windows-client', os: 'Windows 11 24H2',                        size: '5.82 GB', added: '2024-10-01', arch: 'x64' },

  // Windows Server — every release
  { id: 'ws01', filename: 'WinNT_3.1_Server.img',                        category: 'windows-server', os: 'Windows NT 3.1 Server',                 size: '35 MB',   added: '1993-07-27', arch: 'x86'  },
  { id: 'ws02', filename: 'WinNT_3.5_Server.img',                        category: 'windows-server', os: 'Windows NT 3.5 Server',                 size: '72 MB',   added: '1994-09-21', arch: 'x86'  },
  { id: 'ws03', filename: 'WinNT_3.51_Server.img',                       category: 'windows-server', os: 'Windows NT 3.51 Server',                size: '88 MB',   added: '1995-05-30', arch: 'x86'  },
  { id: 'ws04', filename: 'WinNT_4.0_Server_SP6a.iso',                   category: 'windows-server', os: 'Windows NT 4.0 Server SP6a',            size: '355 MB',  added: '1996-07-29', arch: 'x86'  },
  { id: 'ws05', filename: 'Win2000_Server_SP4.iso',                       category: 'windows-server', os: 'Windows 2000 Server SP4',               size: '674 MB',  added: '2000-02-17', arch: 'x86'  },
  { id: 'ws06', filename: 'WinServer2003_SP2_x86.iso',                    category: 'windows-server', os: 'Windows Server 2003 SP2',               size: '637 MB',  added: '2003-04-24', arch: 'x86'  },
  { id: 'ws07', filename: 'WinServer2003_R2_SP2_x64.iso',                 category: 'windows-server', os: 'Windows Server 2003 R2 SP2 x64',        size: '2.33 GB', added: '2005-12-06', arch: 'x64'  },
  { id: 'ws08', filename: 'WinServer2008_SP2_x64.iso',                    category: 'windows-server', os: 'Windows Server 2008 SP2',               size: '3.26 GB', added: '2008-02-27', arch: 'x64'  },
  { id: 'ws09', filename: 'WinServer2008_R2_SP1_x64.iso',                 category: 'windows-server', os: 'Windows Server 2008 R2 SP1',            size: '3.12 GB', added: '2009-10-22', arch: 'x64'  },
  { id: 'ws10', filename: 'WinServer2012_x64.iso',                        category: 'windows-server', os: 'Windows Server 2012',                   size: '3.57 GB', added: '2012-09-04', arch: 'x64'  },
  { id: 'ws11', filename: 'WinServer2012_R2_x64.iso',                     category: 'windows-server', os: 'Windows Server 2012 R2',                size: '4.12 GB', added: '2013-10-18', arch: 'x64'  },
  { id: 'ws12', filename: 'WinServer2016_x64.iso',                        category: 'windows-server', os: 'Windows Server 2016',                   size: '6.13 GB', added: '2016-10-12', arch: 'x64'  },
  { id: 'ws13', filename: 'WinServer2019_x64.iso',                        category: 'windows-server', os: 'Windows Server 2019',                   size: '4.93 GB', added: '2018-11-13', arch: 'x64'  },
  { id: 'ws14', filename: 'WinServer2022_x64.iso',                        category: 'windows-server', os: 'Windows Server 2022',                   size: '5.07 GB', added: '2021-08-18', arch: 'x64'  },
  { id: 'ws15', filename: 'WinServer2025_x64.iso',                        category: 'windows-server', os: 'Windows Server 2025',                   size: '5.46 GB', added: '2024-11-01', arch: 'x64'  },

  // Linux Desktop
  { id: 'ld01', filename: 'ubuntu-22.04.3-desktop-amd64.iso',             category: 'linux-desktop',  os: 'Ubuntu 22.04.3 LTS Desktop',            size: '4.7 GB',  added: '2023-08-10', arch: 'x64'  },
  { id: 'ld02', filename: 'ubuntu-24.04-desktop-amd64.iso',               category: 'linux-desktop',  os: 'Ubuntu 24.04 LTS Desktop',              size: '5.1 GB',  added: '2024-04-25', arch: 'x64'  },
  { id: 'ld03', filename: 'Fedora-Workstation-Live-41.iso',               category: 'linux-desktop',  os: 'Fedora Workstation 41',                 size: '2.3 GB',  added: '2024-10-29', arch: 'x64'  },
  { id: 'ld04', filename: 'linuxmint-21.3-cinnamon-64bit.iso',            category: 'linux-desktop',  os: 'Linux Mint 21.3 Cinnamon',              size: '2.7 GB',  added: '2024-01-12', arch: 'x64'  },
  { id: 'ld05', filename: 'pop-os_22.04_amd64_intel_40.iso',              category: 'linux-desktop',  os: 'Pop!_OS 22.04',                         size: '2.3 GB',  added: '2024-03-15', arch: 'x64'  },
  { id: 'ld06', filename: 'manjaro-gnome-23.1-240113.iso',                category: 'linux-desktop',  os: 'Manjaro GNOME 23.1',                    size: '3.8 GB',  added: '2024-01-13', arch: 'x64'  },
  { id: 'ld07', filename: 'zorin-os-17-core-64-bit.iso',                  category: 'linux-desktop',  os: 'Zorin OS 17 Core',                      size: '3.5 GB',  added: '2023-12-07', arch: 'x64'  },

  // Linux Server
  { id: 'ls01', filename: 'ubuntu-22.04.3-live-server-amd64.iso',         category: 'linux-server',   os: 'Ubuntu 22.04.3 LTS Server',             size: '1.8 GB',  added: '2023-08-10', arch: 'x64'  },
  { id: 'ls02', filename: 'debian-12.4.0-amd64-netinst.iso',              category: 'linux-server',   os: 'Debian 12.4 Bookworm',                  size: '659 MB',  added: '2024-01-06', arch: 'x64'  },
  { id: 'ls03', filename: 'Rocky-9.3-x86_64-dvd.iso',                     category: 'linux-server',   os: 'Rocky Linux 9.3',                       size: '9.4 GB',  added: '2023-11-12', arch: 'x64'  },
  { id: 'ls04', filename: 'AlmaLinux-9.3-x86_64-dvd.iso',                 category: 'linux-server',   os: 'AlmaLinux 9.3',                         size: '9.1 GB',  added: '2023-11-14', arch: 'x64'  },
  { id: 'ls05', filename: 'CentOS-Stream-9-latest-x86_64-dvd1.iso',       category: 'linux-server',   os: 'CentOS Stream 9',                       size: '9.8 GB',  added: '2024-01-15', arch: 'x64'  },
  { id: 'ls06', filename: 'rhel-9.3-x86_64-dvd.iso',                      category: 'linux-server',   os: 'RHEL 9.3',                              size: '8.9 GB',  added: '2023-11-07', arch: 'x64'  },
  { id: 'ls07', filename: 'archlinux-2024.01.01-x86_64.iso',              category: 'linux-server',   os: 'Arch Linux 2024.01.01',                 size: '874 MB',  added: '2024-01-01', arch: 'x64'  },
  { id: 'ls08', filename: 'FreeBSD-14.0-RELEASE-amd64-dvd1.iso',          category: 'linux-server',   os: 'FreeBSD 14.0 RELEASE',                  size: '4.6 GB',  added: '2023-11-21', arch: 'x64'  },

  // Security
  { id: 'se01', filename: 'kali-linux-2024.1-installer-amd64.iso',        category: 'security',       os: 'Kali Linux 2024.1',                     size: '4.1 GB',  added: '2024-02-26', arch: 'x64'  },
  { id: 'se02', filename: 'Parrot-security-6.0_amd64.iso',                category: 'security',       os: 'Parrot OS Security 6.0',                size: '4.9 GB',  added: '2024-04-30', arch: 'x64'  },
  { id: 'se03', filename: 'blackarch-linux-full-2024.01.01-x86_64.iso',   category: 'security',       os: 'BlackArch Linux 2024.01.01',            size: '21.5 GB', added: '2024-01-01', arch: 'x64'  },
  { id: 'se04', filename: 'tails-amd64-6.0.iso',                          category: 'security',       os: 'Tails 6.0',                             size: '1.4 GB',  added: '2024-03-05', arch: 'x64'  },

  // Network/Firewall
  { id: 'nw01', filename: 'pfSense-CE-2.7.2-RELEASE-amd64.iso',           category: 'network',        os: 'pfSense CE 2.7.2',                      size: '1.07 GB', added: '2024-01-09', arch: 'x64'  },
  { id: 'nw02', filename: 'OPNsense-24.1-dvd-amd64.iso',                  category: 'network',        os: 'OPNsense 24.1',                         size: '1.7 GB',  added: '2024-01-31', arch: 'x64'  },
  { id: 'nw03', filename: 'vyos-1.4.0-amd64.iso',                         category: 'network',        os: 'VyOS 1.4.0 (sagitta)',                  size: '510 MB',  added: '2023-12-01', arch: 'x64'  },

  // Homelab
  { id: 'hl01', filename: 'proxmox-ve_8.1-2.iso',                         category: 'homelab',        os: 'Proxmox VE 8.1',                        size: '1.1 GB',  added: '2023-12-22', arch: 'x64'  },
  { id: 'hl02', filename: 'TrueNAS-SCALE-24.04.0.iso',                    category: 'homelab',        os: 'TrueNAS SCALE 24.04',                   size: '2.0 GB',  added: '2024-05-21', arch: 'x64'  },
  { id: 'hl03', filename: 'VMware-VMvisor-Installer-8.0U2.x86_64.iso',    category: 'homelab',        os: 'VMware ESXi 8.0 U2',                    size: '568 MB',  added: '2023-09-21', arch: 'x64'  },
  { id: 'hl04', filename: 'unRAID-6.12.10.zip',                           category: 'homelab',        os: 'Unraid 6.12.10',                        size: '378 MB',  added: '2024-02-01', arch: 'x64'  },
  { id: 'hl05', filename: 'xcp-ng-8.3.0.iso',                             category: 'homelab',        os: 'XCP-ng 8.3.0',                          size: '1.1 GB',  added: '2024-03-08', arch: 'x64'  },

  // Container / k8s
  { id: 'co01', filename: 'k3os-amd64.iso',                               category: 'container',      os: 'K3OS v0.21.5 (k3s built-in)',            size: '284 MB',  added: '2023-08-15', arch: 'x64'  },
  { id: 'co02', filename: 'talos-amd64.iso',                              category: 'container',      os: 'Talos Linux 1.6.4',                     size: '98 MB',   added: '2024-01-25', arch: 'x64'  },
  { id: 'co03', filename: 'flatcar_production_iso_image.iso',             category: 'container',      os: 'Flatcar Container Linux 3815.2.0',      size: '436 MB',  added: '2024-01-18', arch: 'x64'  },
  { id: 'co04', filename: 'alpine-virt-3.19.0-x86_64.iso',               category: 'container',      os: 'Alpine Linux 3.19 (virt)',              size: '57 MB',   added: '2023-12-07', arch: 'x64'  },
  { id: 'co05', filename: 'rancheros-v1.5.8.iso',                         category: 'container',      os: 'RancherOS v1.5.8',                      size: '164 MB',  added: '2024-01-10', arch: 'x64'  },
];

const CAT_LABELS: Record<ISOCategory, string> = {
  'windows-client': '🪟 Windows Client',
  'windows-server': '🗄️ Windows Server',
  'linux-desktop':  '🐧 Linux Desktop',
  'linux-server':   '🖥️ Linux Server',
  'security':       '🔒 Security',
  'network':        '🔌 Network / Firewall',
  'homelab':        '🏠 Homelab',
  'container':      '⎈ Container / k8s',
};

const INITIAL_K3S_NODES: K3sNode[] = [
  { name: 'k3s-server-01', role: 'server', status: 'Ready', version: 'v1.28.5+k3s1', ip: '10.0.1.10', age: '12d' },
  { name: 'k3s-agent-01',  role: 'agent',  status: 'Ready', version: 'v1.28.5+k3s1', ip: '10.0.1.11', age: '12d' },
  { name: 'k3s-agent-02',  role: 'agent',  status: 'Ready', version: 'v1.28.5+k3s1', ip: '10.0.1.12', age: '12d' },
];

const INITIAL_ADDONS: Addon[] = [
  { name: 'Traefik',       desc: 'Ingress controller (built-in)',        enabled: true  },
  { name: 'MetalLB',       desc: 'Bare-metal load balancer',             enabled: false },
  { name: 'Longhorn',      desc: 'Distributed block storage',            enabled: true  },
  { name: 'cert-manager',  desc: 'Automatic TLS certificate management', enabled: true  },
  { name: 'Rancher',       desc: 'Multi-cluster management UI',          enabled: false },
  { name: 'ArgoCD',        desc: 'GitOps continuous delivery',           enabled: false },
  { name: 'Prometheus',    desc: 'Metrics & alerting stack',             enabled: true  },
  { name: 'Grafana',       desc: 'Observability dashboards',             enabled: true  },
];

function vmStatusColor(s: VMStatus) {
  if (s === 'running') return '#2ecc71';
  if (s === 'stopped') return '#e74c3c';
  if (s === 'paused')  return '#f39c12';
  return '#e74c3c';
}

// ── Component ────────────────────────────────────────────────────────────────
export default function VMManager() {
  const [tab, setTab]           = useState<Tab>('vms');
  const [vms, setVms]           = useState<VM[]>(INITIAL_VMS);
  const [selectedVm, setSelectedVm] = useState<VM | null>(INITIAL_VMS[0]);
  const [isoCat, setIsoCat]     = useState<ISOCategory | 'all'>('all');
  const [isoSearch, setIsoSearch] = useState('');
  const [nodes, setNodes]       = useState<K3sNode[]>(INITIAL_K3S_NODES);
  const [addons, setAddons]     = useState<Addon[]>(INITIAL_ADDONS);
  const [k3sChannel, setK3sChannel] = useState<'stable' | 'latest' | 'testing'>('stable');
  const [deploying, setDeploying] = useState(false);
  const [deployDone, setDeployDone] = useState(false);
  const [k3sServerUrl] = useState('https://10.0.1.10:6443');
  const [showKubeconfig, setShowKubeconfig] = useState(false);

  // VM actions
  const vmAction = (action: string, vm: VM) => {
    setVms(prev => prev.map(v => {
      if (v.id !== vm.id) return v;
      if (action === 'start')    return { ...v, status: 'running' };
      if (action === 'stop')     return { ...v, status: 'stopped' };
      if (action === 'pause')    return { ...v, status: 'paused'  };
      return v;
    }));
    setSelectedVm(prev => prev?.id === vm.id ? { ...prev, status: action === 'start' ? 'running' : action === 'stop' ? 'stopped' : 'paused' } : prev);
  };

  // Deploy k3s agent
  const deployAgent = () => {
    setDeploying(true);
    setTimeout(() => {
      const n = nodes.length;
      setNodes(prev => [...prev, {
        name: `k3s-agent-0${n}`,
        role: 'agent', status: 'Ready',
        version: 'v1.28.5+k3s1',
        ip: `10.0.1.${10 + n}`,
        age: '0d',
      }]);
      setDeploying(false);
      setDeployDone(true);
      setTimeout(() => setDeployDone(false), 3000);
    }, 2200);
  };

  // ISO filter
  const filteredISOs = ISOS.filter(iso =>
    (isoCat === 'all' || iso.category === isoCat) &&
    (isoSearch === '' || iso.os.toLowerCase().includes(isoSearch.toLowerCase()) ||
      iso.filename.toLowerCase().includes(isoSearch.toLowerCase()))
  );

  const kubeconfig = `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: LS0tLS1CRU...
    server: ${k3sServerUrl}
  name: homelab-k3s
contexts:
- context:
    cluster: homelab-k3s
    user: homelab-k3s-admin
  name: homelab-k3s
current-context: homelab-k3s
kind: Config
preferences: {}
users:
- name: homelab-k3s-admin
  user:
    client-certificate-data: LS0tLS1CRU...
    client-key-data: LS0tLS1CRU...`;

  return (
    <div className="vmm-root">
      {/* ── Sidebar ── */}
      <div className="vmm-sidebar">
        <div className="vmm-sidebar-title">VM Manager</div>
        <button className={`vmm-nav ${tab === 'vms'  ? 'active' : ''}`} onClick={() => setTab('vms')}>
          🖥️ Virtual Machines
        </button>
        <button className={`vmm-nav ${tab === 'isos' ? 'active' : ''}`} onClick={() => setTab('isos')}>
          💿 ISO Library
        </button>
        <button className={`vmm-nav ${tab === 'k3s'  ? 'active' : ''}`} onClick={() => setTab('k3s')}>
          ⎈ k3s Cluster
        </button>
        <div className="vmm-sidebar-section">QUICK STATS</div>
        <div className="vmm-stat"><span>VMs Running</span><span className="vmm-stat-val green">{vms.filter(v => v.status === 'running').length}</span></div>
        <div className="vmm-stat"><span>VMs Stopped</span><span className="vmm-stat-val red">{vms.filter(v => v.status === 'stopped').length}</span></div>
        <div className="vmm-stat"><span>ISOs Stored</span><span className="vmm-stat-val blue">{ISOS.length}</span></div>
        <div className="vmm-stat"><span>k3s Nodes</span><span className="vmm-stat-val green">{nodes.filter(n => n.status === 'Ready').length}/{nodes.length}</span></div>
      </div>

      {/* ── Main ── */}
      <div className="vmm-main">

        {/* ══ VMs Tab ══ */}
        {tab === 'vms' && (
          <div className="vmm-vms">
            <div className="vmm-toolbar">
              <span className="vmm-section-title">Virtual Machines</span>
              <button className="vmm-btn-primary">+ New VM</button>
            </div>
            <div className="vmm-vm-table">
              <div className="vmm-vm-header">
                <span>Name</span><span>Status</span><span>OS</span>
                <span>vCPUs</span><span>RAM</span><span>Disk</span><span>Actions</span>
              </div>
              {vms.map(vm => (
                <div
                  key={vm.id}
                  className={`vmm-vm-row ${selectedVm?.id === vm.id ? 'selected' : ''}`}
                  onClick={() => setSelectedVm(vm)}
                >
                  <span className="vmm-vm-name">🖥️ {vm.name}</span>
                  <span className="vmm-vm-status" style={{ color: vmStatusColor(vm.status) }}>
                    ⬤ {vm.status}
                  </span>
                  <span className="vmm-vm-os">{vm.os}</span>
                  <span>{vm.cpus}</span>
                  <span>{vm.ram}</span>
                  <span>{vm.disk}</span>
                  <span className="vmm-vm-actions" onClick={e => e.stopPropagation()}>
                    {vm.status !== 'running' && (
                      <button className="vmm-act-btn green" onClick={() => vmAction('start', vm)} title="Start">▶</button>
                    )}
                    {vm.status === 'running' && (
                      <button className="vmm-act-btn amber" onClick={() => vmAction('pause', vm)} title="Pause">⏸</button>
                    )}
                    {vm.status !== 'stopped' && (
                      <button className="vmm-act-btn red" onClick={() => vmAction('stop', vm)} title="Stop">⏹</button>
                    )}
                  </span>
                </div>
              ))}
            </div>
            {selectedVm && (
              <div className="vmm-vm-detail">
                <div className="vmm-detail-title">Summary — {selectedVm.name}</div>
                <div className="vmm-detail-grid">
                  <span>Name</span><span>{selectedVm.name}</span>
                  <span>Status</span><span style={{ color: vmStatusColor(selectedVm.status) }}>{selectedVm.status}</span>
                  <span>OS</span><span>{selectedVm.os}</span>
                  <span>vCPUs</span><span>{selectedVm.cpus}</span>
                  <span>RAM</span><span>{selectedVm.ram}</span>
                  <span>Disk</span><span>{selectedVm.disk}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ ISOs Tab ══ */}
        {tab === 'isos' && (
          <div className="vmm-isos">
            <div className="vmm-toolbar">
              <span className="vmm-section-title">ISO Library — {ISOS.length} images</span>
            </div>
            <div className="vmm-iso-filters">
              <input
                className="vmm-iso-search"
                placeholder="🔍 Search ISOs..."
                value={isoSearch}
                onChange={e => setIsoSearch(e.target.value)}
              />
              <div className="vmm-iso-cats">
                <button className={`vmm-cat-btn ${isoCat === 'all' ? 'active' : ''}`} onClick={() => setIsoCat('all')}>All</button>
                {(Object.keys(CAT_LABELS) as ISOCategory[]).map(c => (
                  <button key={c} className={`vmm-cat-btn ${isoCat === c ? 'active' : ''}`} onClick={() => setIsoCat(c)}>
                    {CAT_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>
            <div className="vmm-iso-table">
              <div className="vmm-iso-header">
                <span>Filename</span><span>OS</span><span>Arch</span><span>Size</span><span>Added</span>
              </div>
              <div className="vmm-iso-list">
                {filteredISOs.map(iso => (
                  <div key={iso.id} className="vmm-iso-row">
                    <span className="vmm-iso-filename">💿 {iso.filename}</span>
                    <span className="vmm-iso-os">{iso.os}</span>
                    <span className="vmm-iso-arch">{iso.arch}</span>
                    <span className="vmm-iso-size">{iso.size}</span>
                    <span className="vmm-iso-date">{iso.added}</span>
                  </div>
                ))}
                {filteredISOs.length === 0 && (
                  <div className="vmm-iso-empty">No ISOs match your filter.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ k3s Tab ══ */}
        {tab === 'k3s' && (
          <div className="vmm-k3s">
            <div className="vmm-toolbar">
              <span className="vmm-section-title">k3s Cluster Management</span>
            </div>

            {/* Cluster info bar */}
            <div className="vmm-k3s-info">
              <div className="vmm-k3s-info-item">
                <span className="vmm-k3s-info-label">Server URL</span>
                <span className="vmm-k3s-info-val">{k3sServerUrl}</span>
              </div>
              <div className="vmm-k3s-info-item">
                <span className="vmm-k3s-info-label">Version</span>
                <span className="vmm-k3s-info-val">v1.28.5+k3s1</span>
              </div>
              <div className="vmm-k3s-info-item">
                <span className="vmm-k3s-info-label">Channel</span>
                <select className="vmm-k3s-select" value={k3sChannel} onChange={e => setK3sChannel(e.target.value as typeof k3sChannel)}>
                  <option value="stable">stable</option>
                  <option value="latest">latest</option>
                  <option value="testing">testing</option>
                </select>
              </div>
              <div className="vmm-k3s-info-item">
                <span className="vmm-k3s-info-label">Cluster Token</span>
                <span className="vmm-k3s-info-val vmm-token">K10••••••••••••••••••••••••••••••••</span>
              </div>
            </div>

            {/* Nodes */}
            <div className="vmm-k3s-section-title">Nodes ({nodes.length})</div>
            <div className="vmm-k3s-nodes">
              <div className="vmm-k3s-nodes-header">
                <span>Name</span><span>Role</span><span>Status</span>
                <span>Version</span><span>Internal IP</span><span>Age</span>
              </div>
              {nodes.map(n => (
                <div key={n.name} className="vmm-k3s-node-row">
                  <span>⬡ {n.name}</span>
                  <span className={`vmm-k3s-role vmm-k3s-role-${n.role}`}>{n.role}</span>
                  <span className={`vmm-k3s-ready ${n.status === 'Ready' ? 'ready' : 'notready'}`}>{n.status}</span>
                  <span className="vmm-mono">{n.version}</span>
                  <span className="vmm-mono">{n.ip}</span>
                  <span>{n.age}</span>
                </div>
              ))}
            </div>

            {/* Deploy */}
            <div className="vmm-k3s-deploy">
              <div className="vmm-k3s-section-title">Scale Cluster</div>
              <div className="vmm-k3s-deploy-row">
                <button
                  className={`vmm-btn-primary ${deploying ? 'vmm-btn-busy' : ''}`}
                  onClick={deployAgent}
                  disabled={deploying}
                >
                  {deploying ? '⟳ Joining agent…' : '+ Join Agent Node'}
                </button>
                <button className="vmm-btn-secondary">+ Add Server Node (HA)</button>
                <button className="vmm-btn-secondary" onClick={() => setShowKubeconfig(p => !p)}>
                  {showKubeconfig ? 'Hide' : 'Show'} kubeconfig
                </button>
              </div>
              {deployDone && <div className="vmm-k3s-success">✔ Agent node joined successfully!</div>}
            </div>

            {/* kubeconfig */}
            {showKubeconfig && (
              <div className="vmm-k3s-kubeconfig">
                <div className="vmm-k3s-section-title">kubeconfig</div>
                <pre className="vmm-k3s-pre">{kubeconfig}</pre>
              </div>
            )}

            {/* Add-ons */}
            <div className="vmm-k3s-section-title">Add-ons</div>
            <div className="vmm-k3s-addons">
              {addons.map(a => (
                <div key={a.name} className="vmm-addon-row">
                  <input
                    type="checkbox"
                    checked={a.enabled}
                    onChange={() => setAddons(prev => prev.map(x => x.name === a.name ? { ...x, enabled: !x.enabled } : x))}
                  />
                  <span className="vmm-addon-name">{a.name}</span>
                  <span className="vmm-addon-desc">{a.desc}</span>
                  <span className={`vmm-addon-status ${a.enabled ? 'enabled' : 'disabled'}`}>
                    {a.enabled ? 'Installed' : 'Available'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
