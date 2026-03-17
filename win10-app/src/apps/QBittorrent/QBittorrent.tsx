import { useState, useEffect, useCallback } from 'react';
import './QBittorrent.css';

type TorrentStatus = 'seeding' | 'downloading' | 'paused';
type DetailTab = 'General' | 'Trackers' | 'Peers' | 'Content';
type FilterKey = 'All' | 'Downloading' | 'Seeding' | 'Paused' | 'Completed' | string;

interface TorrentFile {
  name: string;
  size: string;
  progress: number;
  priority: string;
}

interface Torrent {
  id: number;
  name: string;
  size: string;
  sizeBytes: number;
  done: number;         // 0–100
  status: TorrentStatus;
  seeds: number;
  peers: number;
  dlSpeed: number;      // KB/s
  ulSpeed: number;      // KB/s
  eta: string;
  added: string;
  savePath: string;
  hash: string;
  category: string;
  tracker: string;
  typeIcon: string;
  files: TorrentFile[];
}

function mk(id: number, name: string, size: string, sizeGB: number,
  savePath: string, icon: string, seeds: number, ul: number,
  files: [string, string][], added = '2022-06-01 10:00'): Torrent {
  const hash = id.toString(16).padStart(8, '0').repeat(5);
  return {
    id, name, size, sizeBytes: Math.round(sizeGB * 1073741824),
    done: 100, status: 'seeding', seeds, peers: Math.round(seeds * 0.07),
    dlSpeed: 0, ulSpeed: ul, eta: '∞', added, savePath, hash,
    category: 'Archive.org', tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: icon,
    files: files.map(([n, s]) => ({ name: n, size: s, progress: 100, priority: 'Normal' })),
  };
}

const INITIAL_TORRENTS: Torrent[] = [
  {
    id: 1,
    name: 'ubuntu-23.10-desktop-amd64.iso',
    size: '4.6 GB', sizeBytes: 4939212800,
    done: 100, status: 'seeding',
    seeds: 312, peers: 0,
    dlSpeed: 0, ulSpeed: 87,
    eta: '∞',
    added: '2024-01-12 14:22',
    savePath: 'D:\\Downloads\\',
    hash: 'a6bfbe43027f7b9a2e9fe7f7bb2c89c891d2df5c',
    category: 'Linux ISOs',
    tracker: 'https://torrent.ubuntu.com/announce',
    typeIcon: '💿',
    files: [{ name: 'ubuntu-23.10-desktop-amd64.iso', size: '4.6 GB', progress: 100, priority: 'Normal' }],
  },
  {
    id: 2,
    name: 'debian-12.4.0-amd64-DVD-1.iso',
    size: '3.7 GB', sizeBytes: 3972005888,
    done: 100, status: 'seeding',
    seeds: 148, peers: 3,
    dlSpeed: 0, ulSpeed: 43,
    eta: '∞',
    added: '2024-01-08 09:11',
    savePath: 'D:\\Downloads\\',
    hash: '3d5a9be9f8c5d812de8e0ad1d1c82c9b9e2c4a1d',
    category: 'Linux ISOs',
    tracker: 'https://cdimage.debian.org/cdimage/tracker/announce',
    typeIcon: '💿',
    files: [
      { name: 'debian-12.4.0-amd64-DVD-1.iso', size: '3.7 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 3,
    name: 'Cyberpunk.2077.Update.2.1.CODEX',
    size: '70.4 GB', sizeBytes: 75585822720,
    done: 67, status: 'downloading',
    seeds: 892, peers: 241,
    dlSpeed: 2840, ulSpeed: 120,
    eta: '2h 14m',
    added: '2024-01-15 20:07',
    savePath: 'E:\\Games\\',
    hash: 'b9c7d4e1a2f3c8d5e6a7b8c9d0e1f2a3b4c5d6e7',
    category: 'Games',
    tracker: 'udp://tracker.opentrackr.org:1337/announce',
    typeIcon: '🎮',
    files: [
      { name: 'setup_cyberpunk2077.exe', size: '2.1 MB', progress: 100, priority: 'High' },
      { name: 'data1.bin', size: '35.2 GB', progress: 100, priority: 'Normal' },
      { name: 'data2.bin', size: '35.1 GB', progress: 34, priority: 'Normal' },
    ],
  },
  {
    id: 4,
    name: 'The.Dark.Knight.2008.2160p.UHD.BluRay.x265.10bit.HDR',
    size: '58.3 GB', sizeBytes: 62588715008,
    done: 100, status: 'seeding',
    seeds: 67, peers: 12,
    dlSpeed: 0, ulSpeed: 230,
    eta: '∞',
    added: '2024-01-03 18:44',
    savePath: 'F:\\Movies\\',
    hash: 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
    category: 'Movies',
    tracker: 'udp://open.demonii.com:1337/announce',
    typeIcon: '🎬',
    files: [
      { name: 'The.Dark.Knight.2008.2160p.mkv', size: '57.9 GB', progress: 100, priority: 'Normal' },
      { name: 'The.Dark.Knight.2008.srt', size: '82 KB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 5,
    name: 'Breaking.Bad.S01-S05.Complete.1080p.BluRay.x264',
    size: '92.1 GB', sizeBytes: 98897203200,
    done: 100, status: 'seeding',
    seeds: 201, peers: 34,
    dlSpeed: 0, ulSpeed: 156,
    eta: '∞',
    added: '2023-12-28 11:32',
    savePath: 'F:\\TV Shows\\',
    hash: 'd2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1',
    category: 'TV Shows',
    tracker: 'udp://tracker.leechers-paradise.org:6969/announce',
    typeIcon: '📺',
    files: [
      { name: 'Season 01', size: '14.2 GB', progress: 100, priority: 'Normal' },
      { name: 'Season 02', size: '17.8 GB', progress: 100, priority: 'Normal' },
      { name: 'Season 03', size: '19.4 GB', progress: 100, priority: 'Normal' },
      { name: 'Season 04', size: '20.1 GB', progress: 100, priority: 'Normal' },
      { name: 'Season 05', size: '20.6 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 6,
    name: 'Elden.Ring.v1.10.CODEX',
    size: '60.5 GB', sizeBytes: 64966082560,
    done: 23, status: 'downloading',
    seeds: 1240, peers: 388,
    dlSpeed: 4210, ulSpeed: 185,
    eta: '4h 02m',
    added: '2024-01-15 21:55',
    savePath: 'E:\\Games\\',
    hash: 'e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
    category: 'Games',
    tracker: 'udp://tracker.opentrackr.org:1337/announce',
    typeIcon: '🎮',
    files: [
      { name: 'EldenRing_Setup.exe', size: '1.3 MB', progress: 100, priority: 'High' },
      { name: 'EldenRing_Data.bin', size: '60.5 GB', progress: 23, priority: 'Normal' },
    ],
  },
  {
    id: 7,
    name: 'Oppenheimer.2023.2160p.IMAX.BluRay.x265.HDR10+',
    size: '74.2 GB', sizeBytes: 79659622400,
    done: 100, status: 'seeding',
    seeds: 134, peers: 18,
    dlSpeed: 0, ulSpeed: 312,
    eta: '∞',
    added: '2024-01-10 16:20',
    savePath: 'F:\\Movies\\',
    hash: 'f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3',
    category: 'Movies',
    tracker: 'udp://open.demonii.com:1337/announce',
    typeIcon: '🎬',
    files: [
      { name: 'Oppenheimer.2023.2160p.IMAX.mkv', size: '73.8 GB', progress: 100, priority: 'Normal' },
      { name: 'Oppenheimer.srt', size: '98 KB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 8,
    name: 'The.Last.of.Us.S01.Complete.2160p.MAX.WEBRip',
    size: '48.7 GB', sizeBytes: 52293836800,
    done: 100, status: 'paused',
    seeds: 0, peers: 0,
    dlSpeed: 0, ulSpeed: 0,
    eta: '∞',
    added: '2024-01-05 13:15',
    savePath: 'F:\\TV Shows\\',
    hash: 'a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4',
    category: 'TV Shows',
    tracker: 'udp://tracker.leechers-paradise.org:6969/announce',
    typeIcon: '📺',
    files: [
      { name: 'TLOU.S01E01.2160p.mkv', size: '5.4 GB', progress: 100, priority: 'Normal' },
      { name: 'TLOU.S01E02.2160p.mkv', size: '5.1 GB', progress: 100, priority: 'Normal' },
      { name: 'TLOU.S01E03.2160p.mkv', size: '6.2 GB', progress: 100, priority: 'Normal' },
      { name: 'TLOU.S01E04.2160p.mkv', size: '4.8 GB', progress: 100, priority: 'Normal' },
      { name: 'TLOU.S01E05.2160p.mkv', size: '5.9 GB', progress: 100, priority: 'Normal' },
      { name: 'TLOU.S01E06.2160p.mkv', size: '5.3 GB', progress: 100, priority: 'Normal' },
      { name: 'TLOU.S01E07.2160p.mkv', size: '4.9 GB', progress: 100, priority: 'Normal' },
      { name: 'TLOU.S01E08.2160p.mkv', size: '5.2 GB', progress: 100, priority: 'Normal' },
      { name: 'TLOU.S01E09.2160p.mkv', size: '5.9 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 9,
    name: 'Arch.Linux.2024.01.01-x86_64.iso',
    size: '903 MB', sizeBytes: 946864128,
    done: 100, status: 'seeding',
    seeds: 87, peers: 5,
    dlSpeed: 0, ulSpeed: 28,
    eta: '∞',
    added: '2024-01-02 08:00',
    savePath: 'D:\\Downloads\\',
    hash: 'b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
    category: 'Linux ISOs',
    tracker: 'https://archlinux.org/announce',
    typeIcon: '💿',
    files: [{ name: 'archlinux-2024.01.01-x86_64.iso', size: '903 MB', progress: 100, priority: 'Normal' }],
  },
  {
    id: 10,
    name: 'Baldurs.Gate.3.v4.1.1.3367634.FLT',
    size: '122.7 GB', sizeBytes: 131760087040,
    done: 48, status: 'downloading',
    seeds: 2187, peers: 612,
    dlSpeed: 5920, ulSpeed: 240,
    eta: '5h 51m',
    added: '2024-01-15 19:30',
    savePath: 'E:\\Games\\',
    hash: 'c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
    category: 'Games',
    tracker: 'udp://tracker.opentrackr.org:1337/announce',
    typeIcon: '🎮',
    files: [
      { name: 'BG3_Setup.exe', size: '4.2 MB', progress: 100, priority: 'High' },
      { name: 'BG3_Data_Part1.bin', size: '61.3 GB', progress: 100, priority: 'Normal' },
      { name: 'BG3_Data_Part2.bin', size: '61.2 GB', progress: 0, priority: 'Normal' },
    ],
  },
  {
    id: 11,
    name: 'Interstellar.2014.4K.UHD.BluRay.HDR.DolbyAtmos',
    size: '55.8 GB', sizeBytes: 59907809280,
    done: 100, status: 'seeding',
    seeds: 98, peers: 7,
    dlSpeed: 0, ulSpeed: 95,
    eta: '∞',
    added: '2023-12-20 22:18',
    savePath: 'F:\\Movies\\',
    hash: 'd8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
    category: 'Movies',
    tracker: 'udp://open.demonii.com:1337/announce',
    typeIcon: '🎬',
    files: [
      { name: 'Interstellar.2014.4K.UHD.mkv', size: '55.5 GB', progress: 100, priority: 'Normal' },
      { name: 'Interstellar.2014.en.srt', size: '78 KB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 12,
    name: 'Fedora-Workstation-Live-x86_64-39-1.5.iso',
    size: '2.1 GB', sizeBytes: 2254857830,
    done: 100, status: 'paused',
    seeds: 0, peers: 0,
    dlSpeed: 0, ulSpeed: 0,
    eta: '∞',
    added: '2023-12-15 10:45',
    savePath: 'D:\\Downloads\\',
    hash: 'e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
    category: 'Linux ISOs',
    tracker: 'https://torrent.fedoraproject.org/announce',
    typeIcon: '💿',
    files: [{ name: 'Fedora-Workstation-Live-x86_64-39-1.5.iso', size: '2.1 GB', progress: 100, priority: 'Normal' }],
  },
  // ── Archive.org seeding torrents ──────────────────────────────────────────
  {
    id: 13,
    name: 'Grateful Dead Live Collection 1969-1995 (FLAC)',
    size: '2.1 TB', sizeBytes: 2310000000000,
    done: 100, status: 'seeding',
    seeds: 847, peers: 52,
    dlSpeed: 0, ulSpeed: 420,
    eta: '∞',
    added: '2023-09-04 11:30',
    savePath: 'Z:\\Archive.org\\Grateful Dead Live Concerts\\',
    hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎸',
    files: [
      { name: 'gd1977-05-08.aud.hagen.23692 (Cornell)/', size: '840 MB', progress: 100, priority: 'Normal' },
      { name: 'gd1972-05-04.sbd.miller.74228/', size: '920 MB', progress: 100, priority: 'Normal' },
      { name: 'gd1974-06-16.sbd.12244/', size: '780 MB', progress: 100, priority: 'Normal' },
      { name: 'gd1969-08-16.sbd.22661/', size: '640 MB', progress: 100, priority: 'Normal' },
      { name: '...1,200+ more shows/', size: '2.1 TB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 14,
    name: 'NASA Apollo Mission Films - Complete Archive',
    size: '840 GB', sizeBytes: 902194483200,
    done: 100, status: 'seeding',
    seeds: 1204, peers: 87,
    dlSpeed: 0, ulSpeed: 185,
    eta: '∞',
    added: '2023-07-20 14:12',
    savePath: 'Z:\\Archive.org\\NASA Films and Images\\',
    hash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🚀',
    files: [
      { name: 'Apollo_11_Mission_Footage_1969.mp4', size: '128 GB', progress: 100, priority: 'Normal' },
      { name: 'Apollo_17_Lunar_Surface_EVA.mp4', size: '94 GB', progress: 100, priority: 'Normal' },
      { name: 'Saturn_V_Launch_Complete_Footage.mp4', size: '72 GB', progress: 100, priority: 'Normal' },
      { name: 'Hubble_Deep_Field_Collection/', size: '340 GB', progress: 100, priority: 'Normal' },
      { name: 'Mars_Rover_Curiosity_First_Year.mp4', size: '82 GB', progress: 100, priority: 'Normal' },
      { name: 'Voyager_Mission_Documentary.mp4', size: '24 GB', progress: 100, priority: 'Normal' },
      { name: 'Apollo_8_Earthrise_Original_Scans/', size: '100 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 15,
    name: 'Internet Archive MS-DOS Games Library',
    size: '120 GB', sizeBytes: 128849018880,
    done: 100, status: 'seeding',
    seeds: 3241, peers: 189,
    dlSpeed: 0, ulSpeed: 96,
    eta: '∞',
    added: '2023-05-14 09:00',
    savePath: 'Z:\\Archive.org\\MS-DOS and Classic PC Games\\',
    hash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🕹️',
    files: [
      { name: 'Doom_1993.zip', size: '2.4 MB', progress: 100, priority: 'Normal' },
      { name: 'Wolfenstein_3D_1992.zip', size: '1.2 MB', progress: 100, priority: 'Normal' },
      { name: 'Monkey_Island_1990.zip', size: '8.4 MB', progress: 100, priority: 'Normal' },
      { name: 'Day_of_the_Tentacle_1993.zip', size: '14.2 MB', progress: 100, priority: 'Normal' },
      { name: 'SimCity_2000_1993.zip', size: '6.1 MB', progress: 100, priority: 'Normal' },
      { name: 'Civilization_I_1991.zip', size: '3.8 MB', progress: 100, priority: 'Normal' },
      { name: '...2,500+ titles/', size: '120 GB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 16,
    name: 'Prelinger Archives - Social Guidance Films 1930-1970',
    size: '1.2 TB', sizeBytes: 1288490188800,
    done: 100, status: 'seeding',
    seeds: 412, peers: 28,
    dlSpeed: 0, ulSpeed: 67,
    eta: '∞',
    added: '2023-06-01 15:44',
    savePath: 'Z:\\Archive.org\\Prelinger Archives\\',
    hash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎞️',
    files: [
      { name: 'Duck_and_Cover_1951.mp4', size: '820 MB', progress: 100, priority: 'Normal' },
      { name: 'A_Date_With_Your_Family_1950.mp4', size: '640 MB', progress: 100, priority: 'Normal' },
      { name: 'Design_for_Dreaming_1956.mp4', size: '540 MB', progress: 100, priority: 'Normal' },
      { name: 'Are_You_Popular_1947.mp4', size: '420 MB', progress: 100, priority: 'Normal' },
      { name: '...2,100+ films/', size: '1.2 TB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 17,
    name: 'Old Time Radio - Complete Archive (1930s-1960s)',
    size: '780 GB', sizeBytes: 837758566400,
    done: 100, status: 'seeding',
    seeds: 689, peers: 41,
    dlSpeed: 0, ulSpeed: 112,
    eta: '∞',
    added: '2023-04-10 18:20',
    savePath: 'Z:\\Archive.org\\Old Time Radio\\',
    hash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '📻',
    files: [
      { name: 'Suspense! (1942-1962) - 945 episodes/', size: '180 GB', progress: 100, priority: 'Normal' },
      { name: 'Jack Benny Program (1932-1955)/', size: '140 GB', progress: 100, priority: 'Normal' },
      { name: 'The Shadow (1937-1954)/', size: '120 GB', progress: 100, priority: 'Normal' },
      { name: 'War of the Worlds - Orson Welles 1938.mp3', size: '52 MB', progress: 100, priority: 'Normal' },
      { name: 'Gunsmoke Radio (1952-1961)/', size: '200 GB', progress: 100, priority: 'Normal' },
      { name: '...40+ shows archived/', size: '780 GB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 18,
    name: '78rpm Recordings Project - Jazz and Blues 1900-1950',
    size: '1.8 TB', sizeBytes: 1932735283200,
    done: 100, status: 'seeding',
    seeds: 924, peers: 63,
    dlSpeed: 0, ulSpeed: 234,
    eta: '∞',
    added: '2023-03-22 10:05',
    savePath: 'Z:\\Archive.org\\78rpm Recordings\\',
    hash: 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎷',
    files: [
      { name: 'Robert Johnson - Complete Recordings (1936-37)/', size: '240 MB', progress: 100, priority: 'Normal' },
      { name: 'Bessie Smith - Essential Collection/', size: '380 MB', progress: 100, priority: 'Normal' },
      { name: 'Louis Armstrong - Hot Fives and Sevens/', size: '290 MB', progress: 100, priority: 'Normal' },
      { name: 'Billie Holiday - Original Recordings 1933-1942/', size: '640 MB', progress: 100, priority: 'Normal' },
      { name: 'Duke Ellington - Early Years/', size: '520 MB', progress: 100, priority: 'Normal' },
      { name: '...15,000+ tracks total/', size: '1.8 TB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 19,
    name: 'Public Domain Classic Films Collection',
    size: '2.4 TB', sizeBytes: 2576980377600,
    done: 100, status: 'seeding',
    seeds: 1872, peers: 124,
    dlSpeed: 0, ulSpeed: 387,
    eta: '∞',
    added: '2023-02-14 12:00',
    savePath: 'Z:\\Archive.org\\',
    hash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎬',
    files: [
      { name: 'Metropolis_1927_Restored.mp4', size: '14.2 GB', progress: 100, priority: 'Normal' },
      { name: 'Nosferatu_1922_4K_Restoration.mp4', size: '18.4 GB', progress: 100, priority: 'Normal' },
      { name: 'The_General_1926_Buster_Keaton.mp4', size: '8.6 GB', progress: 100, priority: 'Normal' },
      { name: 'Sherlock_Jr_1924.mp4', size: '4.2 GB', progress: 100, priority: 'Normal' },
      { name: 'The_Kid_1921_Charlie_Chaplin.mp4', size: '6.8 GB', progress: 100, priority: 'Normal' },
      { name: 'Night_of_the_Living_Dead_1968.mp4', size: '9.1 GB', progress: 100, priority: 'Normal' },
      { name: '...800+ films total/', size: '2.4 TB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 20,
    name: 'LibriVox Audiobooks Complete Collection',
    size: '340 GB', sizeBytes: 365072220160,
    done: 100, status: 'seeding',
    seeds: 2105, peers: 98,
    dlSpeed: 0, ulSpeed: 143,
    eta: '∞',
    added: '2023-01-30 08:30',
    savePath: 'N:\\Audiobooks\\',
    hash: 'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '📚',
    files: [
      { name: 'Jane_Eyre_Charlotte_Bronte/', size: '12.4 GB', progress: 100, priority: 'Normal' },
      { name: 'War_and_Peace_Tolstoy/', size: '28.6 GB', progress: 100, priority: 'Normal' },
      { name: 'The_Complete_Works_of_Shakespeare/', size: '44.2 GB', progress: 100, priority: 'Normal' },
      { name: 'Moby_Dick_Herman_Melville/', size: '16.8 GB', progress: 100, priority: 'Normal' },
      { name: 'Don_Quixote_Cervantes/', size: '38.4 GB', progress: 100, priority: 'Normal' },
      { name: '...12,000+ books total/', size: '340 GB total', progress: 100, priority: 'Normal' },
    ],
  },
  // ── Live Music Archive concerts ──────────────────────────────────────────
  {
    id: 22,
    name: 'Phish - Complete SBD Collection 1989-2023 (FLAC)',
    size: '4.8 TB', sizeBytes: 5154082545664,
    done: 100, status: 'seeding',
    seeds: 2341, peers: 187,
    dlSpeed: 0, ulSpeed: 890,
    eta: '∞',
    added: '2023-01-15 10:00',
    savePath: 'Q:\\Live Music Archive\\Phish\\',
    hash: 'a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎸',
    files: [
      { name: '1993-08-02 - Alpine Valley WI (SBD)/', size: '920 MB', progress: 100, priority: 'Normal' },
      { name: '1994-10-31 - Glens Falls NY Halloween (SBD)/', size: '1.1 GB', progress: 100, priority: 'Normal' },
      { name: '1997-12-31 - Madison Square Garden NYE (SBD)/', size: '1.4 GB', progress: 100, priority: 'Normal' },
      { name: '...1,800+ shows total/', size: '4.8 TB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 23,
    name: 'Widespread Panic - Complete Archive 1987-2022 (FLAC)',
    size: '2.9 TB', sizeBytes: 3114761871360,
    done: 100, status: 'seeding',
    seeds: 876, peers: 54,
    dlSpeed: 0, ulSpeed: 430,
    eta: '∞',
    added: '2023-02-10 12:30',
    savePath: 'Q:\\Live Music Archive\\Widespread Panic\\',
    hash: 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎸',
    files: [
      { name: '1997-03-01 - Atlanta GA (SBD)/', size: '780 MB', progress: 100, priority: 'Normal' },
      { name: '2001-07-08 - Red Rocks CO (SBD)/', size: '1.1 GB', progress: 100, priority: 'Normal' },
      { name: '...1,100+ shows total/', size: '2.9 TB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 24,
    name: 'Dead & Company - Complete Run 2015-2023 (SBD/AUD)',
    size: '1.6 TB', sizeBytes: 1717986918400,
    done: 100, status: 'seeding',
    seeds: 1450, peers: 92,
    dlSpeed: 0, ulSpeed: 320,
    eta: '∞',
    added: '2023-04-01 09:15',
    savePath: 'Q:\\Live Music Archive\\Dead & Company\\',
    hash: 'c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎸',
    files: [
      { name: '2016 Summer Tour - 28 shows/', size: '340 GB', progress: 100, priority: 'Normal' },
      { name: '2017 Summer Tour - 30 shows/', size: '380 GB', progress: 100, priority: 'Normal' },
      { name: '2018 Summer Tour - 29 shows/', size: '360 GB', progress: 100, priority: 'Normal' },
      { name: '2019 Summer Tour - 30 shows/', size: '380 GB', progress: 100, priority: 'Normal' },
      { name: '2021 Fall Tour - 18 shows/', size: '140 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 25,
    name: 'String Cheese Incident - Complete Archive 1993-2021',
    size: '1.2 TB', sizeBytes: 1288490188800,
    done: 100, status: 'seeding',
    seeds: 534, peers: 31,
    dlSpeed: 0, ulSpeed: 178,
    eta: '∞',
    added: '2023-05-20 16:00',
    savePath: 'Q:\\Live Music Archive\\String Cheese Incident\\',
    hash: 'd3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎸',
    files: [
      { name: '2001-07-20 Horning\'s Hideout OR/', size: '1.2 GB', progress: 100, priority: 'Normal' },
      { name: '2003-08-09 Telluride CO/', size: '980 MB', progress: 100, priority: 'Normal' },
      { name: '...800+ shows total/', size: '1.2 TB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 26,
    name: 'Dave Matthews Band - Complete Taper Archive 1991-2019',
    size: '3.4 TB', sizeBytes: 3649152819200,
    done: 100, status: 'seeding',
    seeds: 1890, peers: 143,
    dlSpeed: 0, ulSpeed: 560,
    eta: '∞',
    added: '2023-03-18 14:45',
    savePath: 'Q:\\Live Music Archive\\Dave Matthews Band\\',
    hash: 'e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎸',
    files: [
      { name: '1995-07-09 Sugarbush VT (SBD Master)/', size: '1.4 GB', progress: 100, priority: 'Normal' },
      { name: '1998-12-31 MSG NYE (SBD)/', size: '1.8 GB', progress: 100, priority: 'Normal' },
      { name: '2008-08-23 The Gorge WA (SBD)/', size: '2.1 GB', progress: 100, priority: 'Normal' },
      { name: '...2,200+ shows total/', size: '3.4 TB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 27,
    name: 'Umphrey\'s McGee - Complete taper collection 2000-2022',
    size: '980 GB', sizeBytes: 1052266782720,
    done: 100, status: 'seeding',
    seeds: 421, peers: 26,
    dlSpeed: 0, ulSpeed: 134,
    eta: '∞',
    added: '2023-06-12 11:20',
    savePath: 'Q:\\Live Music Archive\\Umphrey\'s McGee\\',
    hash: 'f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎸',
    files: [
      { name: '2007-12-31 Rosemont IL NYE/', size: '2.4 GB', progress: 100, priority: 'Normal' },
      { name: '...700+ shows total/', size: '980 GB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 28,
    name: 'Bob Dylan - Bootleg Archive 1961-2012 (Audience Recordings)',
    size: '2.1 TB', sizeBytes: 2254857830400,
    done: 100, status: 'seeding',
    seeds: 3201, peers: 218,
    dlSpeed: 0, ulSpeed: 670,
    eta: '∞',
    added: '2023-02-28 08:00',
    savePath: 'Q:\\Live Music Archive\\Bob Dylan\\',
    hash: 'a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎵',
    files: [
      { name: '1966-05-17 Free Trade Hall Manchester (Royal Albert Hall)/', size: '640 MB', progress: 100, priority: 'Normal' },
      { name: '1975-10-30 Rolling Thunder Revue Boston/', size: '920 MB', progress: 100, priority: 'Normal' },
      { name: '1984 European Tour - 27 nights/', size: '18 GB', progress: 100, priority: 'Normal' },
      { name: '...3,400+ shows total/', size: '2.1 TB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 29,
    name: 'Neil Young - Complete Taper Archive 1966-2015',
    size: '1.8 TB', sizeBytes: 1932735283200,
    done: 100, status: 'seeding',
    seeds: 2140, peers: 156,
    dlSpeed: 0, ulSpeed: 445,
    eta: '∞',
    added: '2023-03-05 17:30',
    savePath: 'Q:\\Live Music Archive\\Neil Young\\',
    hash: 'b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎵',
    files: [
      { name: '1970-08-30 Fillmore East NY/', size: '780 MB', progress: 100, priority: 'Normal' },
      { name: '1973-01-10 Nashville TN Massey Hall (SBD)/', size: '820 MB', progress: 100, priority: 'Normal' },
      { name: '...2,800+ shows total/', size: '1.8 TB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 30,
    name: 'Bruce Springsteen - Complete Audience Collection 1973-2023',
    size: '5.2 TB', sizeBytes: 5583457021952,
    done: 100, status: 'seeding',
    seeds: 4520, peers: 301,
    dlSpeed: 0, ulSpeed: 1240,
    eta: '∞',
    added: '2022-12-01 20:00',
    savePath: 'Q:\\Live Music Archive\\Bruce Springsteen\\',
    hash: 'c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎵',
    files: [
      { name: '1978-08-09 Agora Cleveland OH (SBD Legendary)/', size: '1.2 GB', progress: 100, priority: 'Normal' },
      { name: '1984-09-13 Philadelphia PA Born in the USA/', size: '2.4 GB', progress: 100, priority: 'Normal' },
      { name: '2009-02-28 Tampa FL Working on a Dream/', size: '3.1 GB', progress: 100, priority: 'Normal' },
      { name: '...5,200+ shows total/', size: '5.2 TB total', progress: 100, priority: 'Normal' },
    ],
  },
  // ── Archive.org Texts/Books ───────────────────────────────────────────────
  {
    id: 31,
    name: 'Project Gutenberg Complete Mirror - 70,000 ebooks',
    size: '65 GB', sizeBytes: 69793218560,
    done: 100, status: 'seeding',
    seeds: 8920, peers: 412,
    dlSpeed: 0, ulSpeed: 234,
    eta: '∞',
    added: '2022-11-01 12:00',
    savePath: 'R:\\Archive.org Texts\\Project Gutenberg Mirror\\',
    hash: 'd9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '📖',
    files: [
      { name: 'gutenberg_catalog_2023.csv', size: '12 MB', progress: 100, priority: 'Normal' },
      { name: 'epub/', size: '42 GB', progress: 100, priority: 'Normal' },
      { name: 'txt/', size: '14 GB', progress: 100, priority: 'Normal' },
      { name: 'html/', size: '9 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 32,
    name: 'Hathi Trust Public Domain Books - Pre-1928 Scan Archive',
    size: '12.4 TB', sizeBytes: 13314992332800,
    done: 100, status: 'seeding',
    seeds: 1240, peers: 87,
    dlSpeed: 0, ulSpeed: 345,
    eta: '∞',
    added: '2022-08-15 14:00',
    savePath: 'R:\\Archive.org Texts\\',
    hash: 'e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '📚',
    files: [
      { name: 'Literature - Fiction pre-1928/', size: '3.2 TB', progress: 100, priority: 'Normal' },
      { name: 'Science and Technology pre-1928/', size: '2.8 TB', progress: 100, priority: 'Normal' },
      { name: 'History and Biography pre-1928/', size: '2.4 TB', progress: 100, priority: 'Normal' },
      { name: 'Law and Government pre-1928/', size: '1.6 TB', progress: 100, priority: 'Normal' },
      { name: 'Foreign Language Works/', size: '2.4 TB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 33,
    name: 'Vintage Magazine Archive - Popular Science and Mechanics 1870-1970',
    size: '2.8 TB', sizeBytes: 3005669498880,
    done: 100, status: 'seeding',
    seeds: 1890, peers: 123,
    dlSpeed: 0, ulSpeed: 278,
    eta: '∞',
    added: '2023-01-20 10:30',
    savePath: 'R:\\Archive.org Texts\\Vintage Magazines Archive\\',
    hash: 'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '📰',
    files: [
      { name: 'Popular_Science_1872-1960/', size: '840 GB', progress: 100, priority: 'Normal' },
      { name: 'Popular_Mechanics_1902-1970/', size: '780 GB', progress: 100, priority: 'Normal' },
      { name: 'Scientific_American_1845-1970/', size: '920 GB', progress: 100, priority: 'Normal' },
      { name: 'National_Geographic_1888-1970/', size: '260 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 34,
    name: 'Comic Books Pre-Code Horror and Crime 1948-1955',
    size: '880 GB', sizeBytes: 944892518400,
    done: 100, status: 'seeding',
    seeds: 2450, peers: 178,
    dlSpeed: 0, ulSpeed: 189,
    eta: '∞',
    added: '2023-07-04 15:00',
    savePath: 'R:\\Archive.org Texts\\Comic Books and Graphic Novels\\',
    hash: 'a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '📖',
    files: [
      { name: 'EC_Comics_Complete - Tales From The Crypt/', size: '180 GB', progress: 100, priority: 'Normal' },
      { name: 'EC_Comics_Complete - Vault of Horror/', size: '160 GB', progress: 100, priority: 'Normal' },
      { name: 'EC_Comics_Complete - Crime SuspenStories/', size: '140 GB', progress: 100, priority: 'Normal' },
      { name: 'Harvey_Comics_Archive - Black Cat/', size: '120 GB', progress: 100, priority: 'Normal' },
      { name: 'Charlton_Horror_Comics/', size: '280 GB', progress: 100, priority: 'Normal' },
    ],
  },
  // ── Educational / Academic ───────────────────────────────────────────────
  {
    id: 35,
    name: 'MIT OpenCourseWare Full Archive 2010-2020',
    size: '4.2 TB', sizeBytes: 4508748955648,
    done: 100, status: 'seeding',
    seeds: 5640, peers: 387,
    dlSpeed: 0, ulSpeed: 890,
    eta: '∞',
    added: '2022-09-01 08:00',
    savePath: 'R:\\Educational Content\\MIT OpenCourseWare Mirror 2010-2020\\',
    hash: 'b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎓',
    files: [
      { name: 'Mathematics/', size: '420 GB', progress: 100, priority: 'Normal' },
      { name: 'Physics/', size: '380 GB', progress: 100, priority: 'Normal' },
      { name: 'Electrical Engineering/', size: '560 GB', progress: 100, priority: 'Normal' },
      { name: 'Computer Science/', size: '780 GB', progress: 100, priority: 'Normal' },
      { name: 'Biology and Neuroscience/', size: '340 GB', progress: 100, priority: 'Normal' },
      { name: 'Economics/', size: '280 GB', progress: 100, priority: 'Normal' },
      { name: 'Humanities/', size: '440 GB', progress: 100, priority: 'Normal' },
      { name: '...2,400 courses total/', size: '4.2 TB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 36,
    name: 'Feynman Lectures - Complete Video Archive + Extras',
    size: '120 GB', sizeBytes: 128849018880,
    done: 100, status: 'seeding',
    seeds: 7890, peers: 501,
    dlSpeed: 0, ulSpeed: 456,
    eta: '∞',
    added: '2022-10-12 11:00',
    savePath: 'R:\\Educational Content\\Feynman Lectures Video Archive\\',
    hash: 'c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '⚛️',
    files: [
      { name: 'Cornell_Lectures_1964 - Character of Physical Law - 7 lectures/', size: '28 GB', progress: 100, priority: 'Normal' },
      { name: 'Caltech_Physics_1-3_Complete/', size: '72 GB', progress: 100, priority: 'Normal' },
      { name: 'Project_Tuva_Complete/', size: '14 GB', progress: 100, priority: 'Normal' },
      { name: 'Nobel_Prize_Lecture_1965.mp4', size: '2.4 GB', progress: 100, priority: 'Normal' },
      { name: 'Feynman_on_Computers_1985.mp4', size: '3.8 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 37,
    name: 'Khan Academy Complete Mirror 2012 - All Subjects',
    size: '220 GB', sizeBytes: 236223201280,
    done: 100, status: 'seeding',
    seeds: 4210, peers: 289,
    dlSpeed: 0, ulSpeed: 312,
    eta: '∞',
    added: '2022-12-15 14:00',
    savePath: 'R:\\Educational Content\\Khan Academy Complete Archive 2012\\',
    hash: 'd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎓',
    files: [
      { name: 'math/', size: '62 GB', progress: 100, priority: 'Normal' },
      { name: 'science/', size: '58 GB', progress: 100, priority: 'Normal' },
      { name: 'humanities/', size: '44 GB', progress: 100, priority: 'Normal' },
      { name: 'computing/', size: '32 GB', progress: 100, priority: 'Normal' },
      { name: 'economics/', size: '24 GB', progress: 100, priority: 'Normal' },
    ],
  },
  // ── Archive.org Video ────────────────────────────────────────────────────
  {
    id: 38,
    name: 'Classic Hollywood Pre-Code Films 1930-1934',
    size: '3.6 TB', sizeBytes: 3865470566400,
    done: 100, status: 'seeding',
    seeds: 1240, peers: 94,
    dlSpeed: 0, ulSpeed: 289,
    eta: '∞',
    added: '2023-02-20 16:00',
    savePath: 'R:\\Archive.org Video\\Classic Hollywood Films 1920-1950\\',
    hash: 'e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎬',
    files: [
      { name: 'MGM_Pre-Code_1930-1934 - 840 films/', size: '1.2 TB', progress: 100, priority: 'Normal' },
      { name: 'Warner_Bros_Pre-Code - 620 films/', size: '980 GB', progress: 100, priority: 'Normal' },
      { name: 'RKO_Pre-Code - 480 films/', size: '840 GB', progress: 100, priority: 'Normal' },
      { name: 'Paramount_Pre-Code - 390 films/', size: '580 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 39,
    name: 'Three Stooges - Complete Columbia Shorts 1934-1959',
    size: '180 GB', sizeBytes: 193273528320,
    done: 100, status: 'seeding',
    seeds: 3410, peers: 234,
    dlSpeed: 0, ulSpeed: 134,
    eta: '∞',
    added: '2023-01-01 12:00',
    savePath: 'R:\\Archive.org Video\\Classic Hollywood Films 1920-1950\\',
    hash: 'f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎬',
    files: [
      { name: '190_Columbia_Shorts_1934-1959/', size: '180 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 40,
    name: 'Experimental Cinema Archive - Stan Brakhage Complete Works',
    size: '240 GB', sizeBytes: 257698037760,
    done: 100, status: 'seeding',
    seeds: 421, peers: 28,
    dlSpeed: 0, ulSpeed: 78,
    eta: '∞',
    added: '2023-04-14 11:00',
    savePath: 'R:\\Archive.org Video\\Independent and Experimental Cinema\\',
    hash: 'a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎞️',
    files: [
      { name: 'Dog_Star_Man_1961-1964/', size: '24 GB', progress: 100, priority: 'Normal' },
      { name: 'Scenes_from_Under_Childhood/', size: '18 GB', progress: 100, priority: 'Normal' },
      { name: 'The_Act_of_Seeing_With_Ones_Own_Eyes/', size: '4.2 GB', progress: 100, priority: 'Normal' },
      { name: '...380+ films total/', size: '240 GB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 41,
    name: 'British Pathe Complete Newsreel Archive 1896-1976',
    size: '8.4 TB', sizeBytes: 9018367401984,
    done: 100, status: 'seeding',
    seeds: 2340, peers: 178,
    dlSpeed: 0, ulSpeed: 567,
    eta: '∞',
    added: '2022-07-04 10:00',
    savePath: 'R:\\Archive.org Video\\News Footage Archive\\',
    hash: 'b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '📽️',
    files: [
      { name: '1896-1920 Silent Era Newsreels/', size: '840 GB', progress: 100, priority: 'Normal' },
      { name: '1920-1939 Between the Wars/', size: '1.4 TB', progress: 100, priority: 'Normal' },
      { name: '1939-1945 WWII Coverage/', size: '2.1 TB', progress: 100, priority: 'Normal' },
      { name: '1945-1960 Post-War Period/', size: '1.8 TB', progress: 100, priority: 'Normal' },
      { name: '1960-1976 Final Years/', size: '2.3 TB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 42,
    name: 'Alan Lomax World Music Field Recordings 1935-1990',
    size: '1.4 TB', sizeBytes: 1502999756800,
    done: 100, status: 'seeding',
    seeds: 1890, peers: 134,
    dlSpeed: 0, ulSpeed: 267,
    eta: '∞',
    added: '2023-01-09 09:30',
    savePath: 'Q:\\Archive.org Audio Collections\\Alan Lomax Collection\\',
    hash: 'c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎙️',
    files: [
      { name: 'American South Field Recordings 1936-1942/', size: '280 GB', progress: 100, priority: 'Normal' },
      { name: 'British Isles Folk Music 1950-1958/', size: '240 GB', progress: 100, priority: 'Normal' },
      { name: 'Spain and Italy Field Recordings 1952-1958/', size: '220 GB', progress: 100, priority: 'Normal' },
      { name: 'Caribbean and West Indies 1935-1939/', size: '180 GB', progress: 100, priority: 'Normal' },
      { name: 'Eastern Europe Field Recordings/', size: '160 GB', progress: 100, priority: 'Normal' },
      { name: 'Africa Field Recordings 1963-1965/', size: '320 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 43,
    name: 'Folkways Records Complete Digital Archive',
    size: '2.2 TB', sizeBytes: 2362232012800,
    done: 100, status: 'seeding',
    seeds: 1230, peers: 89,
    dlSpeed: 0, ulSpeed: 198,
    eta: '∞',
    added: '2023-02-05 13:00',
    savePath: 'Q:\\Archive.org Audio Collections\\Folkways Records Digital Archive\\',
    hash: 'd1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎵',
    files: [
      { name: 'Folk and Traditional Music - 1200 albums/', size: '480 GB', progress: 100, priority: 'Normal' },
      { name: 'World Music - 840 albums/', size: '380 GB', progress: 100, priority: 'Normal' },
      { name: 'Blues and Roots - 620 albums/', size: '290 GB', progress: 100, priority: 'Normal' },
      { name: 'Jazz and Big Band - 480 albums/', size: '240 GB', progress: 100, priority: 'Normal' },
      { name: 'Spoken Word and Documentary/', size: '280 GB', progress: 100, priority: 'Normal' },
      { name: 'Children\'s Music - 360 albums/', size: '180 GB', progress: 100, priority: 'Normal' },
      { name: 'Labor and Political Songs/', size: '90 GB', progress: 100, priority: 'Normal' },
      { name: 'Science and Education Records/', size: '60 GB', progress: 100, priority: 'Normal' },
      { name: 'Protest and Topical Songs/', size: '140 GB', progress: 100, priority: 'Normal' },
      { name: 'New Age and Electronic/', size: '160 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 44,
    name: 'TV News Archive - CNN 1980-2000 Selected Broadcasts',
    size: '3.8 TB', sizeBytes: 4079870877696,
    done: 100, status: 'seeding',
    seeds: 891, peers: 67,
    dlSpeed: 0, ulSpeed: 234,
    eta: '∞',
    added: '2022-11-20 16:00',
    savePath: 'R:\\TV News Archive\\CNN Archive 1980-2010\\',
    hash: 'e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '📺',
    files: [
      { name: '1980 - CNN Launch Day and First Year/', size: '120 GB', progress: 100, priority: 'Normal' },
      { name: '1986 - Challenger Disaster Coverage/', size: '48 GB', progress: 100, priority: 'Normal' },
      { name: '1989 - Berlin Wall Falls Coverage/', size: '64 GB', progress: 100, priority: 'Normal' },
      { name: '1991 - Gulf War Live Coverage/', size: '420 GB', progress: 100, priority: 'Normal' },
      { name: '1995 - OJ Simpson Trial Complete/', size: '680 GB', progress: 100, priority: 'Normal' },
      { name: '2000 - Election Night Coverage/', size: '94 GB', progress: 100, priority: 'Normal' },
      { name: '...12,000+ broadcast hours total/', size: '3.8 TB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 45,
    name: 'C-SPAN Archive - Congressional Proceedings 1982-2000',
    size: '6.2 TB', sizeBytes: 6657867227136,
    done: 100, status: 'seeding',
    seeds: 432, peers: 31,
    dlSpeed: 0, ulSpeed: 145,
    eta: '∞',
    added: '2022-10-01 10:00',
    savePath: 'R:\\TV News Archive\\',
    hash: 'f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🏛️',
    files: [
      { name: 'House_Floor_Proceedings_1982-2000/', size: '2.4 TB', progress: 100, priority: 'Normal' },
      { name: 'Senate_Floor_Proceedings_1986-2000/', size: '1.8 TB', progress: 100, priority: 'Normal' },
      { name: 'Congressional_Hearings_Selected/', size: '1.2 TB', progress: 100, priority: 'Normal' },
      { name: 'Presidential_Press_Conferences/', size: '480 GB', progress: 100, priority: 'Normal' },
      { name: 'Inauguration_Ceremonies_1981-2001/', size: '320 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 46,
    name: 'Voice of America - Complete Shortwave Archive 1942-1991',
    size: '1.1 TB', sizeBytes: 1181116006400,
    done: 100, status: 'seeding',
    seeds: 678, peers: 45,
    dlSpeed: 0, ulSpeed: 112,
    eta: '∞',
    added: '2023-03-10 14:00',
    savePath: 'R:\\TV News Archive\\',
    hash: 'a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '📻',
    files: [
      { name: 'WWII_Broadcasts_1942-1945/', size: '180 GB', progress: 100, priority: 'Normal' },
      { name: 'Cold_War_Broadcasts_1946-1991/', size: '780 GB', progress: 100, priority: 'Normal' },
      { name: 'Radio_Free_Europe_Mirror_1950-1989/', size: '140 GB', progress: 100, priority: 'Normal' },
    ],
  },
  // ── Software collections ─────────────────────────────────────────────────
  {
    id: 47,
    name: 'Flash Games Archive - Newgrounds 2000-2010 Complete',
    size: '340 GB', sizeBytes: 365072220160,
    done: 100, status: 'seeding',
    seeds: 5670, peers: 412,
    dlSpeed: 0, ulSpeed: 234,
    eta: '∞',
    added: '2023-05-05 10:00',
    savePath: 'R:\\Software and Games Archive\\Flash Games Archive\\',
    hash: 'b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🕹️',
    files: [
      { name: 'Newgrounds_Classic_2000-2005/', size: '120 GB', progress: 100, priority: 'Normal' },
      { name: 'Newgrounds_2005-2010/', size: '140 GB', progress: 100, priority: 'Normal' },
      { name: 'Addicting_Games_Mirror/', size: '48 GB', progress: 100, priority: 'Normal' },
      { name: 'Adult_Swim_Games_Archive/', size: '32 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 48,
    name: 'Commodore 64 Complete Game Library - 20,000 titles',
    size: '28 GB', sizeBytes: 30064771072,
    done: 100, status: 'seeding',
    seeds: 4230, peers: 298,
    dlSpeed: 0, ulSpeed: 89,
    eta: '∞',
    added: '2023-06-21 12:00',
    savePath: 'R:\\Software and Games Archive\\Commodore 64 Game Library\\',
    hash: 'c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '💽',
    files: [
      { name: 'Action_Games_C64/', size: '5.4 GB', progress: 100, priority: 'Normal' },
      { name: 'Adventure_and_RPG_C64/', size: '4.8 GB', progress: 100, priority: 'Normal' },
      { name: 'Sports_Games_C64/', size: '3.2 GB', progress: 100, priority: 'Normal' },
      { name: 'Strategy_Games_C64/', size: '4.1 GB', progress: 100, priority: 'Normal' },
      { name: 'Demos_and_Scene_Releases_C64/', size: '8.6 GB', progress: 100, priority: 'Normal' },
      { name: 'Educational_C64/', size: '1.9 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 49,
    name: 'Amiga Games and Demo Scene - Complete Archive 1985-2000',
    size: '62 GB', sizeBytes: 66571993088,
    done: 100, status: 'seeding',
    seeds: 2890, peers: 198,
    dlSpeed: 0, ulSpeed: 78,
    eta: '∞',
    added: '2023-07-15 10:00',
    savePath: 'R:\\Software and Games Archive\\Amiga Games Complete\\',
    hash: 'd7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '💽',
    files: [
      { name: 'Bitmap_Brothers_Complete/', size: '4.2 GB', progress: 100, priority: 'Normal' },
      { name: 'Team_17_Complete/', size: '5.8 GB', progress: 100, priority: 'Normal' },
      { name: 'Psygnosis_Complete/', size: '6.4 GB', progress: 100, priority: 'Normal' },
      { name: 'Demo_Scene_1988-2000/', size: '38 GB', progress: 100, priority: 'Normal' },
      { name: 'PD_Software_Libraries/', size: '7.6 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 50,
    name: 'LucasArts Complete Game Archive 1984-2001',
    size: '44 GB', sizeBytes: 47244640256,
    done: 100, status: 'seeding',
    seeds: 6780, peers: 478,
    dlSpeed: 0, ulSpeed: 145,
    eta: '∞',
    added: '2023-08-01 09:00',
    savePath: 'R:\\Software and Games Archive\\DOS\\/Windows Games 1990-1999\\',
    hash: 'e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎮',
    files: [
      { name: 'Monkey_Island_Series/', size: '4.8 GB', progress: 100, priority: 'Normal' },
      { name: 'Indiana_Jones_Games/', size: '3.6 GB', progress: 100, priority: 'Normal' },
      { name: 'Star_Wars_Games/', size: '8.2 GB', progress: 100, priority: 'Normal' },
      { name: 'Day_of_the_Tentacle_Sam_Max/', size: '2.4 GB', progress: 100, priority: 'Normal' },
      { name: 'Grim_Fandango_Full_Throttle/', size: '5.6 GB', progress: 100, priority: 'Normal' },
      { name: 'Maniac_Mansion_Loom/', size: '1.2 GB', progress: 100, priority: 'Normal' },
      { name: 'TIE_Fighter_X-Wing_Series/', size: '12.4 GB', progress: 100, priority: 'Normal' },
      { name: 'Jedi_Knight_Series/', size: '6.0 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 51,
    name: 'Apple II and Early Mac Software Archive 1977-1995',
    size: '18 GB', sizeBytes: 19327352832,
    done: 100, status: 'seeding',
    seeds: 1890, peers: 134,
    dlSpeed: 0, ulSpeed: 67,
    eta: '∞',
    added: '2023-09-01 10:00',
    savePath: 'R:\\Software and Games Archive\\Apple II Software Archive\\',
    hash: 'f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '💾',
    files: [
      { name: 'Sierra_On-Line_Apple_II/', size: '3.8 GB', progress: 100, priority: 'Normal' },
      { name: 'Infocom_Text_Adventures/', size: '1.4 GB', progress: 100, priority: 'Normal' },
      { name: 'Broderbund_Complete/', size: '2.6 GB', progress: 100, priority: 'Normal' },
      { name: 'Early_Mac_System_Software/', size: '4.2 GB', progress: 100, priority: 'Normal' },
      { name: 'HyperCard_Stacks_Collection/', size: '6.0 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 52,
    name: 'Classic Jazz Archive - Blue Note, Prestige, Riverside 1949-1969',
    size: '1.6 TB', sizeBytes: 1717986918400,
    done: 100, status: 'seeding',
    seeds: 2340, peers: 167,
    dlSpeed: 0, ulSpeed: 345,
    eta: '∞',
    added: '2023-01-25 10:00',
    savePath: 'Q:\\Archive.org Audio Collections\\Blue Note Records 1939-1967\\',
    hash: 'a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎷',
    files: [
      { name: 'Blue_Note_1500_Series_Complete/', size: '380 GB', progress: 100, priority: 'Normal' },
      { name: 'Blue_Note_4000_Series_Complete/', size: '420 GB', progress: 100, priority: 'Normal' },
      { name: 'Prestige_Records_1949-1971/', size: '340 GB', progress: 100, priority: 'Normal' },
      { name: 'Riverside_Records_1953-1964/', size: '280 GB', progress: 100, priority: 'Normal' },
      { name: 'Impulse_Records_1960-1975/', size: '180 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 53,
    name: 'Mogwai - Complete Concert Archive 1996-2022',
    size: '420 GB', sizeBytes: 451021897728,
    done: 100, status: 'seeding',
    seeds: 654, peers: 43,
    dlSpeed: 0, ulSpeed: 89,
    eta: '∞',
    added: '2023-10-01 12:00',
    savePath: 'Q:\\Live Music Archive\\Mogwai\\',
    hash: 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎸',
    files: [
      { name: '1997-08-16_Glasgow_UK/', size: '820 MB', progress: 100, priority: 'Normal' },
      { name: '2001-10-27_London_UK/', size: '1.1 GB', progress: 100, priority: 'Normal' },
      { name: '...340+ shows total/', size: '420 GB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 54,
    name: 'Explosions in the Sky - Taper Archive + Officially Released',
    size: '280 GB', sizeBytes: 300647710720,
    done: 100, status: 'seeding',
    seeds: 892, peers: 56,
    dlSpeed: 0, ulSpeed: 67,
    eta: '∞',
    added: '2023-11-05 14:00',
    savePath: 'Q:\\Live Music Archive\\Explosions in the Sky\\',
    hash: 'c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎸',
    files: [
      { name: '2004-09-10_Austin_TX (SBD)/', size: '1.4 GB', progress: 100, priority: 'Normal' },
      { name: '2007-06-09_Bonnaroo_TN/', size: '1.8 GB', progress: 100, priority: 'Normal' },
      { name: '...200+ shows total/', size: '280 GB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 55,
    name: 'King Crimson - Complete Bootleg Archive 1969-2021',
    size: '2.4 TB', sizeBytes: 2576980377600,
    done: 100, status: 'seeding',
    seeds: 1890, peers: 134,
    dlSpeed: 0, ulSpeed: 345,
    eta: '∞',
    added: '2023-01-30 10:00',
    savePath: 'Q:\\Live Music Archive\\King Crimson\\',
    hash: 'd3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎸',
    files: [
      { name: '1969_Hyde_Park_Complete/', size: '840 MB', progress: 100, priority: 'Normal' },
      { name: '1972_USA_Tour_Complete/', size: '8.4 GB', progress: 100, priority: 'Normal' },
      { name: '1974_Asbury_Park_Complete/', size: '6.2 GB', progress: 100, priority: 'Normal' },
      { name: '1981-1984_Discipline_Era_Shows/', size: '42 GB', progress: 100, priority: 'Normal' },
      { name: '...1,200+ shows total/', size: '2.4 TB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 56,
    name: 'Swans - Complete Taper Archive 1982-2019',
    size: '1.2 TB', sizeBytes: 1288490188800,
    done: 100, status: 'seeding',
    seeds: 567, peers: 38,
    dlSpeed: 0, ulSpeed: 145,
    eta: '∞',
    added: '2023-07-22 11:00',
    savePath: 'Q:\\Live Music Archive\\Swans\\',
    hash: 'e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎸',
    files: [
      { name: '1985-11-08_CBGB_NY/', size: '1.2 GB', progress: 100, priority: 'Normal' },
      { name: '1996_Dissolution_Tour/', size: '12 GB', progress: 100, priority: 'Normal' },
      { name: '2012-2016_Reunion_Era/', size: '340 GB', progress: 100, priority: 'Normal' },
      { name: '...800+ shows total/', size: '1.2 TB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 57,
    name: 'Grateful Dead - Dick\'s Picks & Dave\'s Picks Mastered (FLAC)',
    size: '3.2 TB', sizeBytes: 3435973836800,
    done: 100, status: 'seeding',
    seeds: 5420, peers: 389,
    dlSpeed: 0, ulSpeed: 978,
    eta: '∞',
    added: '2022-06-01 08:00',
    savePath: 'Q:\\Live Music Archive\\',
    hash: 'f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎸',
    files: [
      { name: 'Dicks_Picks_Vol_01-36/', size: '1.8 TB', progress: 100, priority: 'Normal' },
      { name: 'Daves_Picks_Vol_01-48/', size: '1.4 TB', progress: 100, priority: 'Normal' },
    ],
  },
  // ── S: Drive torrents ────────────────────────────────────────────────────
  {
    id: 58,
    name: 'John Peel BBC Sessions Complete 1967-2004 - 4000+ Sessions',
    size: '8.4 TB', sizeBytes: 9018367401984,
    done: 100, status: 'seeding',
    seeds: 7840, peers: 567,
    dlSpeed: 0, ulSpeed: 1890,
    eta: '∞',
    added: '2022-05-01 10:00',
    savePath: 'S:\\Radio Sessions Archive\\BBC Radio Sessions\\John Peel Sessions Complete 1967-2004 - 4,000+ sessions\\',
    hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '📻',
    files: [
      { name: '1967-1969 First Peel Sessions - Pink Floyd, Jimi Hendrix.../', size: '480 GB', progress: 100, priority: 'Normal' },
      { name: '1970-1975 Glam and Prog Era/', size: '640 GB', progress: 100, priority: 'Normal' },
      { name: '1976-1980 Punk and New Wave/', size: '780 GB', progress: 100, priority: 'Normal' },
      { name: '1981-1985 Post-Punk and Indie/', size: '920 GB', progress: 100, priority: 'Normal' },
      { name: '1986-1990 Madchester and Shoegaze/', size: '1.1 TB', progress: 100, priority: 'Normal' },
      { name: '1991-1995 Britpop and Grunge/', size: '1.2 TB', progress: 100, priority: 'Normal' },
      { name: '1996-2000 Electronic and DnB/', size: '1.4 TB', progress: 100, priority: 'Normal' },
      { name: '2001-2004 Final Years/', size: '1.8 TB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 59,
    name: 'KEXP Live Performances Archive 2007-2022',
    size: '2.8 TB', sizeBytes: 3005669498880,
    done: 100, status: 'seeding',
    seeds: 4230, peers: 312,
    dlSpeed: 0, ulSpeed: 678,
    eta: '∞',
    added: '2022-09-15 12:00',
    savePath: 'S:\\Radio Sessions Archive\\American Radio\\KEXP Live Performances Archive\\',
    hash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎵',
    files: [
      { name: '2007-2010 Early Archive/', size: '420 GB', progress: 100, priority: 'Normal' },
      { name: '2010-2015 HD Era/', size: '780 GB', progress: 100, priority: 'Normal' },
      { name: '2015-2020 4K Archive/', size: '1.2 TB', progress: 100, priority: 'Normal' },
      { name: '2020-2022 Pandemic Sessions/', size: '400 GB', progress: 100, priority: 'Normal' },
      { name: '...12,000+ performances total/', size: '2.8 TB total', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 60,
    name: 'Fela Kuti - Complete Discography Remastered FLAC',
    size: '180 GB', sizeBytes: 193273528320,
    done: 100, status: 'seeding',
    seeds: 2140, peers: 156,
    dlSpeed: 0, ulSpeed: 134,
    eta: '∞',
    added: '2023-04-20 09:00',
    savePath: 'S:\\World Music Archive\\African Music\\Fela Kuti Complete Discography FLAC\\',
    hash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎺',
    files: [
      { name: 'Afrobeat_Period_1970-1977 - 22 albums/', size: '64 GB', progress: 100, priority: 'Normal' },
      { name: 'Afrobeat_Period_1977-1992 - 16 albums/', size: '52 GB', progress: 100, priority: 'Normal' },
      { name: 'Collaborations_and_Live/', size: '42 GB', progress: 100, priority: 'Normal' },
      { name: 'FEST_Africa_70_Recordings/', size: '22 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 61,
    name: 'Astor Piazzolla - Complete Recordings and Buenos Aires Archives',
    size: '220 GB', sizeBytes: 236223201280,
    done: 100, status: 'seeding',
    seeds: 1780, peers: 124,
    dlSpeed: 0, ulSpeed: 145,
    eta: '∞',
    added: '2023-05-10 11:00',
    savePath: 'S:\\World Music Archive\\Latin and South American\\Astor Piazzolla FLAC Collection\\',
    hash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎹',
    files: [
      { name: 'Studio_Albums_1954-1990/', size: '84 GB', progress: 100, priority: 'Normal' },
      { name: 'Live_Performances/', size: '92 GB', progress: 100, priority: 'Normal' },
      { name: 'Libertango_Variations_Collection/', size: '44 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 62,
    name: 'Nusrat Fateh Ali Khan - Complete Qawwali Archive',
    size: '340 GB', sizeBytes: 365072220160,
    done: 100, status: 'seeding',
    seeds: 3420, peers: 245,
    dlSpeed: 0, ulSpeed: 234,
    eta: '∞',
    added: '2023-06-01 10:00',
    savePath: 'S:\\World Music Archive\\Middle East and North Africa\\Nusrat Fateh Ali Khan FLAC\\',
    hash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎤',
    files: [
      { name: 'WOMAD_Live_Sessions_1985-1997/', size: '84 GB', progress: 100, priority: 'Normal' },
      { name: 'Real_World_Records_Sessions/', size: '68 GB', progress: 100, priority: 'Normal' },
      { name: 'Pakistan_Radio_Sessions/', size: '120 GB', progress: 100, priority: 'Normal' },
      { name: 'Shahen-Shah_Complete_Concerts/', size: '68 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 63,
    name: 'Concert Films Archive - Woodstock 1969 Complete Original Footage',
    size: '4.2 TB', sizeBytes: 4508748955648,
    done: 100, status: 'seeding',
    seeds: 12400, peers: 890,
    dlSpeed: 0, ulSpeed: 2340,
    eta: '∞',
    added: '2022-08-15 09:00',
    savePath: 'S:\\Concert Films Archive\\Woodstock 1970 Director\'s Cut\\',
    hash: 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎬',
    files: [
      { name: 'Woodstock_1969_Original_Film_4K_Restoration.mkv', size: '128 GB', progress: 100, priority: 'Normal' },
      { name: 'Woodstock_Uncut_Footage_Hendrix.mkv', size: '48 GB', progress: 100, priority: 'Normal' },
      { name: 'Woodstock_Uncut_Footage_Joplin.mkv', size: '32 GB', progress: 100, priority: 'Normal' },
      { name: 'Woodstock_Uncut_Footage_Who.mkv', size: '56 GB', progress: 100, priority: 'Normal' },
      { name: 'Woodstock_Uncut_Footage_CSNY.mkv', size: '44 GB', progress: 100, priority: 'Normal' },
      { name: 'Woodstock_Uncut_Footage_Santana.mkv', size: '38 GB', progress: 100, priority: 'Normal' },
      { name: 'Woodstock_Uncut_Footage_Sly_Stone.mkv', size: '42 GB', progress: 100, priority: 'Normal' },
      { name: 'Woodstock_Uncut_Footage_Jefferson_Airplane.mkv', size: '36 GB', progress: 100, priority: 'Normal' },
      { name: 'Woodstock_Uncut_Footage_Creedence.mkv', size: '28 GB', progress: 100, priority: 'Normal' },
      { name: 'Woodstock_Uncut_Footage_The_Band.mkv', size: '52 GB', progress: 100, priority: 'Normal' },
      { name: 'Woodstock_Interview_Archive/', size: '380 GB', progress: 100, priority: 'Normal' },
      { name: 'Woodstock_50th_Anniversary_Box_Set_Extras/', size: '3.4 TB', progress: 100, priority: 'Normal' },
    ],
  },
  // ── T: Drive torrents ────────────────────────────────────────────────────
  {
    id: 64,
    name: 'FSA-OWI Photograph Archive 1935-1945 - 175,000 Photos',
    size: '820 GB', sizeBytes: 880103120896,
    done: 100, status: 'seeding',
    seeds: 3240, peers: 234,
    dlSpeed: 0, ulSpeed: 345,
    eta: '∞',
    added: '2022-11-01 10:00',
    savePath: 'T:\\Photography Archives\\FSA-OWI Photograph Collection Complete\\',
    hash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '📷',
    files: [
      { name: 'Dorothea_Lange_Prints/', size: '84 GB', progress: 100, priority: 'Normal' },
      { name: 'Walker_Evans_Prints/', size: '72 GB', progress: 100, priority: 'Normal' },
      { name: 'Ben_Shahn_Prints/', size: '64 GB', progress: 100, priority: 'Normal' },
      { name: 'Russell_Lee_Prints/', size: '92 GB', progress: 100, priority: 'Normal' },
      { name: 'John_Vachon_Prints/', size: '68 GB', progress: 100, priority: 'Normal' },
      { name: 'Arthur_Rothstein_Prints/', size: '78 GB', progress: 100, priority: 'Normal' },
      { name: 'Gordon_Parks_Early_Work/', size: '44 GB', progress: 100, priority: 'Normal' },
      { name: 'Color_Prints_Kodachrome_1939-1944/', size: '318 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 65,
    name: 'New York Times Historical Archive 1851-1980 - Complete PDF',
    size: '18.4 TB', sizeBytes: 19760115056640,
    done: 100, status: 'seeding',
    seeds: 2140, peers: 167,
    dlSpeed: 0, ulSpeed: 890,
    eta: '∞',
    added: '2022-06-01 08:00',
    savePath: 'T:\\Historical Periodicals\\The New York Times Historical Archive 1851-1980\\',
    hash: 'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '📰',
    files: [
      { name: '1851-1870 Civil War Era/', size: '1.2 TB', progress: 100, priority: 'Normal' },
      { name: '1870-1900 Gilded Age/', size: '1.8 TB', progress: 100, priority: 'Normal' },
      { name: '1900-1920 Progressive Era/', size: '2.1 TB', progress: 100, priority: 'Normal' },
      { name: '1920-1940 Jazz Age and Depression/', size: '2.4 TB', progress: 100, priority: 'Normal' },
      { name: '1940-1950 WWII Coverage/', size: '2.8 TB', progress: 100, priority: 'Normal' },
      { name: '1950-1965 Cold War/', size: '3.2 TB', progress: 100, priority: 'Normal' },
      { name: '1965-1980 Vietnam and Watergate/', size: '4.9 TB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 66,
    name: 'LIFE Magazine Complete Archive 1936-1972 - High Resolution',
    size: '6.8 TB', sizeBytes: 7301444935680,
    done: 100, status: 'seeding',
    seeds: 4560, peers: 334,
    dlSpeed: 0, ulSpeed: 567,
    eta: '∞',
    added: '2022-07-15 12:00',
    savePath: 'T:\\Photography Archives\\LIFE Magazine Photo Archive Pre-1972\\',
    hash: 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '📸',
    files: [
      { name: '1936-1940 Pre-WWII Issues/', size: '480 GB', progress: 100, priority: 'Normal' },
      { name: '1941-1945 WWII Coverage Complete/', size: '920 GB', progress: 100, priority: 'Normal' },
      { name: '1946-1955 Post-War America/', size: '1.1 TB', progress: 100, priority: 'Normal' },
      { name: '1956-1963 Civil Rights and Cold War/', size: '1.4 TB', progress: 100, priority: 'Normal' },
      { name: '1964-1972 Vietnam and Counterculture/', size: '2.9 TB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 67,
    name: 'NASA Technical Reports Server - Complete Archive 1958-2000',
    size: '14.2 TB', sizeBytes: 15253926952960,
    done: 100, status: 'seeding',
    seeds: 1890, peers: 134,
    dlSpeed: 0, ulSpeed: 456,
    eta: '∞',
    added: '2022-04-01 09:00',
    savePath: 'T:\\Academic and Scientific Archives\\NASA Technical Reports 1958-2000\\',
    hash: 'd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🔬',
    files: [
      { name: 'NACA_Reports_1915-1957/', size: '1.4 TB', progress: 100, priority: 'Normal' },
      { name: 'Mercury_Program_Reports/', size: '340 GB', progress: 100, priority: 'Normal' },
      { name: 'Gemini_Program_Technical_Reports/', size: '480 GB', progress: 100, priority: 'Normal' },
      { name: 'Apollo_Program_Technical_Archive/', size: '2.8 TB', progress: 100, priority: 'Normal' },
      { name: 'Skylab_Technical_Reports/', size: '640 GB', progress: 100, priority: 'Normal' },
      { name: 'Space_Shuttle_Design_Reports/', size: '2.1 TB', progress: 100, priority: 'Normal' },
      { name: 'Hubble_Development_Reports/', size: '980 GB', progress: 100, priority: 'Normal' },
      { name: 'Deep_Space_Network_Reports/', size: '1.2 TB', progress: 100, priority: 'Normal' },
      { name: 'General_Research_Reports/', size: '4.2 TB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 68,
    name: 'arXiv Preprint Mirror - Physics, Math, CS 1991-2020',
    size: '320 GB', sizeBytes: 343597383680,
    done: 100, status: 'seeding',
    seeds: 8920, peers: 634,
    dlSpeed: 0, ulSpeed: 890,
    eta: '∞',
    added: '2022-03-15 10:00',
    savePath: 'T:\\Academic and Scientific Archives\\',
    hash: 'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '📐',
    files: [
      { name: 'physics_1991-2020 - 1.2M papers/', size: '94 GB', progress: 100, priority: 'Normal' },
      { name: 'math_1991-2020 - 800K papers/', size: '78 GB', progress: 100, priority: 'Normal' },
      { name: 'cs_1991-2020 - 600K papers/', size: '62 GB', progress: 100, priority: 'Normal' },
      { name: 'q-bio_1991-2020 - 180K papers/', size: '28 GB', progress: 100, priority: 'Normal' },
      { name: 'econ_1991-2020 - 60K papers/', size: '14 GB', progress: 100, priority: 'Normal' },
      { name: 'eess_1991-2020 - 240K papers/', size: '44 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 69,
    name: 'Bell Labs Technical Reports and Memos 1925-1984',
    size: '2.4 TB', sizeBytes: 2576980377600,
    done: 100, status: 'seeding',
    seeds: 1240, peers: 89,
    dlSpeed: 0, ulSpeed: 267,
    eta: '∞',
    added: '2022-10-20 11:00',
    savePath: 'T:\\Academic and Scientific Archives\\Bell Labs Technical Memos 1925-1984\\',
    hash: 'f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '⚗️',
    files: [
      { name: 'Transistor_Development_Records_1947/', size: '24 GB', progress: 100, priority: 'Normal' },
      { name: 'Shannon_Information_Theory_Papers/', size: '8 GB', progress: 100, priority: 'Normal' },
      { name: 'Unix_Development_Documentation/', size: '48 GB', progress: 100, priority: 'Normal' },
      { name: 'C_Language_Development_Memos/', size: '12 GB', progress: 100, priority: 'Normal' },
      { name: 'Bell_System_Technical_Journal_1922-1983/', size: '1.8 TB', progress: 100, priority: 'Normal' },
      { name: 'Murray_Hill_Internal_Reports/', size: '520 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 70,
    name: 'Grateful Dead - Road Trips Series + Spring 1990 Complete',
    size: '1.8 TB', sizeBytes: 1932735283200,
    done: 100, status: 'seeding',
    seeds: 3450, peers: 245,
    dlSpeed: 0, ulSpeed: 678,
    eta: '∞',
    added: '2023-11-20 09:00',
    savePath: 'Q:\\Live Music Archive\\',
    hash: 'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '🎸',
    files: [
      { name: 'Road_Trips_Vol_1-4_Complete/', size: '480 GB', progress: 100, priority: 'Normal' },
      { name: 'Spring_1990_Complete_Tour/', size: '840 GB', progress: 100, priority: 'Normal' },
      { name: 'Summer_1987_Complete_Tour/', size: '480 GB', progress: 100, priority: 'Normal' },
    ],
  },
  {
    id: 21,
    name: 'Internet Archive Software Collection - Vintage Software',
    size: '560 GB', sizeBytes: 601295421440,
    done: 100, status: 'seeding',
    seeds: 1340, peers: 71,
    dlSpeed: 0, ulSpeed: 89,
    eta: '∞',
    added: '2023-08-19 16:55',
    savePath: 'Z:\\Archive.org\\',
    hash: 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
    category: 'Archive.org',
    tracker: 'http://bt1.archive.org:6969/announce',
    typeIcon: '💽',
    files: [
      { name: 'Windows_3.1_Original_Disks/', size: '18 MB', progress: 100, priority: 'Normal' },
      { name: 'MacOS_System_7_1991/', size: '6.4 MB', progress: 100, priority: 'Normal' },
      { name: 'Microsoft_Office_97/', size: '420 MB', progress: 100, priority: 'Normal' },
      { name: 'Netscape_Navigator_4.0/', size: '12 MB', progress: 100, priority: 'Normal' },
      { name: 'Lotus_123_Collection/', size: '240 MB', progress: 100, priority: 'Normal' },
      { name: '...50,000+ software titles/', size: '560 GB total', progress: 100, priority: 'Normal' },
    ],
  },
  // ── Grateful Dead live concerts ──────────────────────────────────
  mk(71,'Grateful Dead Live at Cornell 1977-05-08','32.4 GB',32.4,'Q:\\Live-Music\\Grateful-Dead\\','🎵',847,156,[['Cornell_1977-05-08_FLAC/','32.4 GB']]),
  mk(72,'Grateful Dead Europe 1972 Complete Tour','48.2 GB',48.2,'Q:\\Live-Music\\Grateful-Dead\\','🎵',612,89,[['Europe_72_Complete_FLAC/','48.2 GB']]),
  mk(73,'Grateful Dead Live at Fillmore West 1969','28.7 GB',28.7,'Q:\\Live-Music\\Grateful-Dead\\','🎵',534,74,[['Fillmore_West_1969_FLAC/','28.7 GB']]),
  mk(74,'Grateful Dead Veneta Oregon 1972-08-27','24.1 GB',24.1,'Q:\\Live-Music\\Grateful-Dead\\','🎵',489,67,[['Veneta_OR_1972_FLAC/','24.1 GB']]),
  mk(75,'Grateful Dead American Beauty Era 1970 Collection','36.9 GB',36.9,'Q:\\Live-Music\\Grateful-Dead\\','🎵',445,61,[['GD_1970_Collection_FLAC/','36.9 GB']]),
  mk(76,'Grateful Dead Wall of Sound Tour 1974','41.3 GB',41.3,'Q:\\Live-Music\\Grateful-Dead\\','🎵',398,55,[['WallOfSound_1974_FLAC/','41.3 GB']]),
  mk(77,'Grateful Dead 1978 Collections','33.8 GB',33.8,'Q:\\Live-Music\\Grateful-Dead\\','🎵',367,51,[['GD_1978_FLAC/','33.8 GB']]),
  mk(78,"Grateful Dead Dick's Picks Vol 1-10",'82.4 GB',82.4,'Q:\\Live-Music\\Grateful-Dead\\','🎵',623,88,[["Dick's_Picks_V1-V10_FLAC/",'82.4 GB']]),
  mk(79,"Grateful Dead Dick's Picks Vol 11-20",'79.1 GB',79.1,'Q:\\Live-Music\\Grateful-Dead\\','🎵',598,83,[["Dick's_Picks_V11-V20_FLAC/",'79.1 GB']]),
  mk(80,"Grateful Dead Dick's Picks Vol 21-36",'94.6 GB',94.6,'Q:\\Live-Music\\Grateful-Dead\\','🎵',576,79,[["Dick's_Picks_V21-V36_FLAC/",'94.6 GB']]),
  mk(81,"Grateful Dead Dave's Picks Complete Collection",'312.4 GB',312.4,'Q:\\Live-Music\\Grateful-Dead\\','🎵',741,104,[["Dave's_Picks_Complete_FLAC/",'312.4 GB']]),
  mk(82,'Grateful Dead 1966-1968 Vault Recordings','44.7 GB',44.7,'Q:\\Live-Music\\Grateful-Dead\\','🎵',412,57,[['GD_1966-1968_FLAC/','44.7 GB']]),
  mk(83,'Grateful Dead 1971 Skull & Roses Era','29.3 GB',29.3,'Q:\\Live-Music\\Grateful-Dead\\','🎵',387,54,[['GD_1971_FLAC/','29.3 GB']]),
  mk(84,'Grateful Dead 1973 Complete Collection','52.8 GB',52.8,'Q:\\Live-Music\\Grateful-Dead\\','🎵',423,59,[['GD_1973_FLAC/','52.8 GB']]),
  mk(85,'Grateful Dead 1975-1976 Collection','38.4 GB',38.4,'Q:\\Live-Music\\Grateful-Dead\\','🎵',356,50,[['GD_1975-76_FLAC/','38.4 GB']]),
  mk(86,'Grateful Dead 1987-1995 Final Years','67.2 GB',67.2,'Q:\\Live-Music\\Grateful-Dead\\','🎵',334,47,[['GD_1987-1995_FLAC/','67.2 GB']]),
  // ── Phish live concerts ──────────────────────────────────────────
  mk(87,'Phish Live 1989-1991 Early Years','29.4 GB',29.4,'Q:\\Live-Music\\Phish\\','🎵',562,78,[['Phish_1989-91_FLAC/','29.4 GB']]),
  mk(88,'Phish Live 1992-1994 Collection','44.8 GB',44.8,'Q:\\Live-Music\\Phish\\','🎵',534,74,[['Phish_1992-94_FLAC/','44.8 GB']]),
  mk(89,'Phish Live 1995-1997 Collection','56.3 GB',56.3,'Q:\\Live-Music\\Phish\\','🎵',489,68,[['Phish_1995-97_FLAC/','56.3 GB']]),
  mk(90,'Phish Live 1998-2000 Collection','48.7 GB',48.7,'Q:\\Live-Music\\Phish\\','🎵',467,65,[['Phish_1998-2000_FLAC/','48.7 GB']]),
  mk(91,'Phish Live 2002-2004 Collection','38.2 GB',38.2,'Q:\\Live-Music\\Phish\\','🎵',412,58,[['Phish_2002-04_FLAC/','38.2 GB']]),
  mk(92,'Phish Live 2009 Comeback Tour','31.6 GB',31.6,'Q:\\Live-Music\\Phish\\','🎵',445,62,[['Phish_2009_FLAC/','31.6 GB']]),
  mk(93,'Phish Live 2010-2012 Collection','42.9 GB',42.9,'Q:\\Live-Music\\Phish\\','🎵',423,59,[['Phish_2010-12_FLAC/','42.9 GB']]),
  mk(94,"Phish Baker's Dozen MSG 2017 Complete",'38.4 GB',38.4,'Q:\\Live-Music\\Phish\\','🎵',534,74,[["Phish_Bakers_Dozen_2017_FLAC/",'38.4 GB']]),
  mk(95,'Phish Clifford Ball 1996 Festival Complete','22.7 GB',22.7,'Q:\\Live-Music\\Phish\\','🎵',389,54,[['Clifford_Ball_1996_FLAC/','22.7 GB']]),
  mk(96,'Phish IT Festival 2003 Complete','26.4 GB',26.4,'Q:\\Live-Music\\Phish\\','🎵',367,51,[['Phish_IT_2003_FLAC/','26.4 GB']]),
  mk(97,'Phish Coventry 2004 Final Shows','18.9 GB',18.9,'Q:\\Live-Music\\Phish\\','🎵',345,48,[['Phish_Coventry_2004_FLAC/','18.9 GB']]),
  mk(98,'Phish NYE MSG Runs 2012-2022 Collection','84.3 GB',84.3,'Q:\\Live-Music\\Phish\\','🎵',478,67,[['Phish_NYE_Collection_FLAC/','84.3 GB']]),
  mk(99,'Phish 2013-2015 Collection','46.8 GB',46.8,'Q:\\Live-Music\\Phish\\','🎵',412,58,[['Phish_2013-15_FLAC/','46.8 GB']]),
  mk(100,'Phish 2016-2018 Collection','48.2 GB',48.2,'Q:\\Live-Music\\Phish\\','🎵',398,56,[['Phish_2016-18_FLAC/','48.2 GB']]),
  mk(101,'Phish 2019-2023 Collection','52.1 GB',52.1,'Q:\\Live-Music\\Phish\\','🎵',378,53,[['Phish_2019-23_FLAC/','52.1 GB']]),
  // ── Other live music ─────────────────────────────────────────────
  mk(102,'Bruce Springsteen Live 1975-1985 Complete Collection','94.7 GB',94.7,'Q:\\Live-Music\\Springsteen\\','🎵',623,87,[['Springsteen_1975-85_FLAC/','94.7 GB']]),
  mk(103,'Neil Young Live 1970-1980 Collection','52.3 GB',52.3,'Q:\\Live-Music\\Neil-Young\\','🎵',489,68,[['NeilYoung_1970-80_FLAC/','52.3 GB']]),
  mk(104,'Bob Dylan Live 1966-1975 Collection','61.8 GB',61.8,'Q:\\Live-Music\\Bob-Dylan\\','🎵',534,75,[['Dylan_1966-75_FLAC/','61.8 GB']]),
  mk(105,'Allman Brothers Live at Fillmore East 1971','28.4 GB',28.4,'Q:\\Live-Music\\Allman-Brothers\\','🎵',712,100,[['Allman_Fillmore_1971_FLAC/','28.4 GB']]),
  mk(106,'Led Zeppelin BBC Sessions Complete Collection','18.3 GB',18.3,'Q:\\Live-Music\\Led-Zeppelin\\','🎵',823,115,[['LedZep_BBC_FLAC/','18.3 GB']]),
  mk(107,'Pink Floyd Live at Pompeii 1971 and Rarities','12.7 GB',12.7,'Q:\\Live-Music\\Pink-Floyd\\','🎵',678,95,[['PinkFloyd_Pompeii_FLAC/','12.7 GB']]),
  mk(108,'The Band Last Waltz Collection','14.2 GB',14.2,'Q:\\Live-Music\\The-Band\\','🎵',567,79,[['TheBand_LastWaltz_FLAC/','14.2 GB']]),
  mk(109,'Jefferson Airplane Starship Live Collection','38.6 GB',38.6,'Q:\\Live-Music\\Jefferson-Airplane\\','🎵',312,44,[['JeffersonAirplane_Live_FLAC/','38.6 GB']]),
  mk(110,'Crosby Stills Nash Young Live Collection','44.9 GB',44.9,'Q:\\Live-Music\\CSNY\\','🎵',445,62,[['CSNY_Live_FLAC/','44.9 GB']]),
  mk(111,'The Doors Live Complete Collection','29.8 GB',29.8,'Q:\\Live-Music\\The-Doors\\','🎵',623,87,[['Doors_Live_FLAC/','29.8 GB']]),
  mk(112,'Jimi Hendrix Live Complete Collection','32.1 GB',32.1,'Q:\\Live-Music\\Hendrix\\','🎵',734,103,[['Hendrix_Live_FLAC/','32.1 GB']]),
  mk(113,'Janis Joplin Live Complete Collection','22.4 GB',22.4,'Q:\\Live-Music\\Joplin\\','🎵',489,68,[['Joplin_Live_FLAC/','22.4 GB']]),
  mk(114,'Radiohead Live Collection 1992-2012','72.8 GB',72.8,'Q:\\Live-Music\\Radiohead\\','🎵',534,75,[['Radiohead_Live_FLAC/','72.8 GB']]),
  mk(115,'Wilco Live Collection 1994-2015','64.3 GB',64.3,'Q:\\Live-Music\\Wilco\\','🎵',367,51,[['Wilco_Live_FLAC/','64.3 GB']]),
  mk(116,'moe. Live Collection 1994-2020','88.6 GB',88.6,'Q:\\Live-Music\\moe\\','🎵',312,44,[['moe_Live_FLAC/','88.6 GB']]),
  mk(117,'String Cheese Incident Live Collection','76.2 GB',76.2,'Q:\\Live-Music\\SCI\\','🎵',334,47,[['SCI_Live_FLAC/','76.2 GB']]),
  mk(118,'Widespread Panic Live Collection','94.1 GB',94.1,'Q:\\Live-Music\\Widespread-Panic\\','🎵',356,50,[['WSP_Live_FLAC/','94.1 GB']]),
  mk(119,'Umphrey\'s McGee Live Collection 1997-2020','82.4 GB',82.4,'Q:\\Live-Music\\Umphreys\\','🎵',323,45,[['UM_Live_FLAC/','82.4 GB']]),
  mk(120,'Dark Star Orchestra Live Collection','68.9 GB',68.9,'Q:\\Live-Music\\DSO\\','🎵',289,40,[['DSO_Live_FLAC/','68.9 GB']]),
  mk(121,'Phil Lesh and Friends Live Collection','48.3 GB',48.3,'Q:\\Live-Music\\PhilLesh\\','🎵',312,44,[['PhilLesh_Live_FLAC/','48.3 GB']]),
  mk(122,'Dead and Company Live 2015-2023','92.7 GB',92.7,'Q:\\Live-Music\\Dead-and-Co\\','🎵',445,62,[['DeadCo_Live_FLAC/','92.7 GB']]),
  mk(123,'Tedeschi Trucks Band Live Collection','54.8 GB',54.8,'Q:\\Live-Music\\TTB\\','🎵',378,53,[['TTB_Live_FLAC/','54.8 GB']]),
  mk(124,"Gov't Mule Live Collection 1994-2022",'78.3 GB',78.3,'Q:\\Live-Music\\Govts-Mule\\','🎵',345,48,[["GovtMule_Live_FLAC/",'78.3 GB']]),
  mk(125,'King Crimson Live 1969-1974 Collection','36.4 GB',36.4,'Q:\\Live-Music\\King-Crimson\\','🎵',423,59,[['KingCrimson_Live_FLAC/','36.4 GB']]),
  mk(126,'Frank Zappa Live Collection 1968-1988','124.8 GB',124.8,'Q:\\Live-Music\\Zappa\\','🎵',489,68,[['Zappa_Live_FLAC/','124.8 GB']]),
  mk(127,'Velvet Underground Live Collection','24.6 GB',24.6,'Q:\\Live-Music\\VU\\','🎵',534,75,[['VU_Live_FLAC/','24.6 GB']]),
  mk(128,'Leftover Salmon Live Collection','58.2 GB',58.2,'Q:\\Live-Music\\Leftover-Salmon\\','🎵',267,37,[['LeftoverSalmon_Live_FLAC/','58.2 GB']]),
  mk(129,'Railroad Earth Live Collection','46.7 GB',46.7,'Q:\\Live-Music\\Railroad-Earth\\','🎵',256,36,[['RailroadEarth_Live_FLAC/','46.7 GB']]),
  mk(130,'Yonder Mountain String Band Live Collection','52.4 GB',52.4,'Q:\\Live-Music\\YMSB\\','🎵',245,34,[['YMSB_Live_FLAC/','52.4 GB']]),
  mk(131,'Warren Haynes Band Live Collection','44.1 GB',44.1,'Q:\\Live-Music\\Warren-Haynes\\','🎵',278,39,[['WarrenHaynes_Live_FLAC/','44.1 GB']]),
  mk(132,'Derek Trucks Band Live Collection','38.7 GB',38.7,'Q:\\Live-Music\\Derek-Trucks\\','🎵',289,40,[['DerekTrucks_Live_FLAC/','38.7 GB']]),
  mk(133,'Mickey Hart Band Live Collection','28.4 GB',28.4,'Q:\\Live-Music\\Mickey-Hart\\','🎵',256,36,[['MickeyHart_Live_FLAC/','28.4 GB']]),
  mk(134,'Captain Beefheart Live Collection','18.9 GB',18.9,'Q:\\Live-Music\\Beefheart\\','🎵',312,44,[['Beefheart_Live_FLAC/','18.9 GB']]),
  mk(135,'John Coltrane Live Collection 1957-1967','34.8 GB',34.8,'Q:\\Live-Music\\Coltrane\\','🎵',567,79,[['Coltrane_Live_FLAC/','34.8 GB']]),
  mk(136,'Miles Davis Live 1964-1975 Collection','42.6 GB',42.6,'Q:\\Live-Music\\Miles-Davis\\','🎵',589,82,[['Davis_Live_FLAC/','42.6 GB']]),
  // ── Classical music ──────────────────────────────────────────────
  mk(137,'Bach Complete Works FLAC 170-disc Collection','284.7 GB',284.7,'U:\\Classical\\Bach\\','🎼',423,59,[['Bach_Complete_Works_FLAC/','284.7 GB']]),
  mk(138,'Beethoven Complete Symphonies Multiple Orchestras','48.3 GB',48.3,'U:\\Classical\\Beethoven\\','🎼',534,75,[['Beethoven_Symphonies_FLAC/','48.3 GB']]),
  mk(139,'Mozart Complete Works Philips 180-disc Box','312.4 GB',312.4,'U:\\Classical\\Mozart\\','🎼',489,68,[['Mozart_Complete_FLAC/','312.4 GB']]),
  mk(140,'Brahms Complete Works FLAC Collection','86.2 GB',86.2,'U:\\Classical\\Brahms\\','🎼',367,51,[['Brahms_Complete_FLAC/','86.2 GB']]),
  mk(141,'Chopin Complete Works FLAC Collection','62.8 GB',62.8,'U:\\Classical\\Chopin\\','🎼',445,62,[['Chopin_Complete_FLAC/','62.8 GB']]),
  mk(142,'Schubert Complete Works FLAC Collection','124.6 GB',124.6,'U:\\Classical\\Schubert\\','🎼',378,53,[['Schubert_Complete_FLAC/','124.6 GB']]),
  mk(143,'Handel Messiah Collection 12 Recordings','18.4 GB',18.4,'U:\\Classical\\Handel\\','🎼',312,44,[['Handel_Messiah_FLAC/','18.4 GB']]),
  mk(144,'Vivaldi Complete Works FLAC Naïve Collection','148.3 GB',148.3,'U:\\Classical\\Vivaldi\\','🎼',334,47,[['Vivaldi_Complete_FLAC/','148.3 GB']]),
  mk(145,'Wagner Ring Cycle 6 Complete Recordings','124.8 GB',124.8,'U:\\Classical\\Wagner\\','🎼',289,40,[['Wagner_Ring_FLAC/','124.8 GB']]),
  mk(146,'Tchaikovsky Complete Symphonies FLAC','38.6 GB',38.6,'U:\\Classical\\Tchaikovsky\\','🎼',356,50,[['Tchaikovsky_Symphonies_FLAC/','38.6 GB']]),
  mk(147,'Mahler Complete Symphonies FLAC','72.4 GB',72.4,'U:\\Classical\\Mahler\\','🎼',323,45,[['Mahler_Complete_FLAC/','72.4 GB']]),
  mk(148,'Debussy Complete Works FLAC Collection','54.2 GB',54.2,'U:\\Classical\\Debussy\\','🎼',289,40,[['Debussy_Complete_FLAC/','54.2 GB']]),
  mk(149,'Verdi Opera Complete Collection FLAC','184.6 GB',184.6,'U:\\Classical\\Verdi\\','🎼',312,44,[['Verdi_Operas_FLAC/','184.6 GB']]),
  mk(150,'Puccini Opera Complete Collection FLAC','124.3 GB',124.3,'U:\\Classical\\Puccini\\','🎼',334,47,[['Puccini_Operas_FLAC/','124.3 GB']]),
  mk(151,'Baroque Masters Complete Collection FLAC','214.8 GB',214.8,'U:\\Classical\\Baroque\\','🎼',267,37,[['Baroque_Complete_FLAC/','214.8 GB']]),
  mk(152,'Romantic Era Symphonies Complete Collection','168.4 GB',168.4,'U:\\Classical\\Romantic\\','🎼',256,36,[['Romantic_Symphonies_FLAC/','168.4 GB']]),
  mk(153,'Glenn Gould Bach Goldberg Variations All Recordings','8.4 GB',8.4,'U:\\Classical\\Gould\\','🎼',623,87,[['Gould_Goldberg_FLAC/','8.4 GB']]),
  mk(154,'Karajan Berlin Philharmonic Complete DG Recordings','484.2 GB',484.2,'U:\\Classical\\Karajan\\','🎼',378,53,[['Karajan_BPO_FLAC/','484.2 GB']]),
  mk(155,'Leonard Bernstein Complete Deutsche Grammophon','312.7 GB',312.7,'U:\\Classical\\Bernstein\\','🎼',345,48,[['Bernstein_Complete_FLAC/','312.7 GB']]),
  mk(156,'Vladimir Horowitz Complete RCA Recordings','124.6 GB',124.6,'U:\\Classical\\Horowitz\\','🎼',412,58,[['Horowitz_RCA_FLAC/','124.6 GB']]),
  mk(157,'Sviatoslav Richter Live Recordings Archive','168.4 GB',168.4,'U:\\Classical\\Richter\\','🎼',389,54,[['Richter_Live_FLAC/','168.4 GB']]),
  mk(158,'Arthur Rubinstein Complete RCA Recordings','204.8 GB',204.8,'U:\\Classical\\Rubinstein\\','🎼',367,51,[['Rubinstein_RCA_FLAC/','204.8 GB']]),
  mk(159,'Piano Concerto Masters 50-disc Collection','84.6 GB',84.6,'U:\\Classical\\Piano-Concertos\\','🎼',289,40,[['Piano_Concertos_FLAC/','84.6 GB']]),
  mk(160,'String Quartet Masters Complete Collection','148.3 GB',148.3,'U:\\Classical\\String-Quartets\\','🎼',267,37,[['String_Quartets_FLAC/','148.3 GB']]),
  mk(161,'Early Music Vocal Collection FLAC','68.4 GB',68.4,'U:\\Classical\\Early-Music\\','🎼',234,33,[['Early_Music_Vocal_FLAC/','68.4 GB']]),
  mk(162,'Classical Guitar Masters Complete Collection','54.8 GB',54.8,'U:\\Classical\\Guitar\\','🎼',245,34,[['Classical_Guitar_FLAC/','54.8 GB']]),
  mk(163,'Stravinsky Complete Works FLAC','96.4 GB',96.4,'U:\\Classical\\Stravinsky\\','🎼',312,44,[['Stravinsky_Complete_FLAC/','96.4 GB']]),
  mk(164,'Shostakovich Complete Symphonies FLAC','68.2 GB',68.2,'U:\\Classical\\Shostakovich\\','🎼',289,40,[['Shostakovich_Symphonies_FLAC/','68.2 GB']]),
  mk(165,'Sibelius Complete Works FLAC Collection','84.6 GB',84.6,'U:\\Classical\\Sibelius\\','🎼',256,36,[['Sibelius_Complete_FLAC/','84.6 GB']]),
  mk(166,'Prokofiev Complete Works FLAC Collection','112.4 GB',112.4,'U:\\Classical\\Prokofiev\\','🎼',267,37,[['Prokofiev_Complete_FLAC/','112.4 GB']]),
  mk(167,'Bartok Complete Works FLAC Collection','74.8 GB',74.8,'U:\\Classical\\Bartok\\','🎼',278,39,[['Bartok_Complete_FLAC/','74.8 GB']]),
  mk(168,'Dvorak Complete Works FLAC Collection','96.2 GB',96.2,'U:\\Classical\\Dvorak\\','🎼',289,40,[['Dvorak_Complete_FLAC/','96.2 GB']]),
  mk(169,'Ravel Complete Works FLAC Collection','48.6 GB',48.6,'U:\\Classical\\Ravel\\','🎼',298,42,[['Ravel_Complete_FLAC/','48.6 GB']]),
  mk(170,'Rossini Opera Complete Collection FLAC','148.3 GB',148.3,'U:\\Classical\\Rossini\\','🎼',256,36,[['Rossini_Operas_FLAC/','148.3 GB']]),
  mk(171,'Monteverdi Madrigals Complete Collection','38.4 GB',38.4,'U:\\Classical\\Monteverdi\\','🎼',234,33,[['Monteverdi_FLAC/','38.4 GB']]),
  mk(172,'Arturo Toscanini Complete NBC Recordings','284.6 GB',284.6,'U:\\Classical\\Toscanini\\','🎼',312,44,[['Toscanini_NBC_FLAC/','284.6 GB']]),
  mk(173,'Wilhelm Furtwangler Complete Recordings','248.4 GB',248.4,'U:\\Classical\\Furtwangler\\','🎼',298,42,[['Furtwangler_Complete_FLAC/','248.4 GB']]),
  mk(174,'Bruno Walter Complete Columbia Recordings','184.2 GB',184.2,'U:\\Classical\\Walter\\','🎼',278,39,[['Walter_Columbia_FLAC/','184.2 GB']]),
  mk(175,'Yehudi Menuhin Complete EMI Recordings','168.8 GB',168.8,'U:\\Classical\\Menuhin\\','🎼',256,36,[['Menuhin_EMI_FLAC/','168.8 GB']]),
  mk(176,'Violin Concerto Masters 40-disc Collection','64.2 GB',64.2,'U:\\Classical\\Violin-Concertos\\','🎼',245,34,[['Violin_Concertos_FLAC/','64.2 GB']]),
  // ── Jazz ─────────────────────────────────────────────────────────
  mk(177,'Miles Davis Complete Blue Note Sessions FLAC','48.6 GB',48.6,'U:\\Jazz\\Miles-Davis\\','🎷',567,79,[['Davis_BlueNote_FLAC/','48.6 GB']]),
  mk(178,'John Coltrane Complete Impulse Recordings','124.8 GB',124.8,'U:\\Jazz\\Coltrane\\','🎷',612,86,[['Coltrane_Impulse_FLAC/','124.8 GB']]),
  mk(179,'Charlie Parker Complete Savoy Sessions','38.4 GB',38.4,'U:\\Jazz\\Parker\\','🎷',534,75,[['Parker_Savoy_FLAC/','38.4 GB']]),
  mk(180,'Duke Ellington Complete Cotton Club Recordings','84.6 GB',84.6,'U:\\Jazz\\Ellington\\','🎷',489,68,[['Ellington_Complete_FLAC/','84.6 GB']]),
  mk(181,'Louis Armstrong Hot Five and Seven Collection','28.4 GB',28.4,'U:\\Jazz\\Armstrong\\','🎷',623,87,[['Armstrong_HotFive_FLAC/','28.4 GB']]),
  mk(182,'Thelonious Monk Complete Blue Note Sessions','48.2 GB',48.2,'U:\\Jazz\\Monk\\','🎷',534,75,[['Monk_BlueNote_FLAC/','48.2 GB']]),
  mk(183,'Bill Evans Complete Riverside Recordings','68.4 GB',68.4,'U:\\Jazz\\BillEvans\\','🎷',567,79,[['Evans_Riverside_FLAC/','68.4 GB']]),
  mk(184,'Art Blakey Jazz Messengers Complete Sessions','94.6 GB',94.6,'U:\\Jazz\\ArtBlakey\\','🎷',445,62,[['Blakey_Complete_FLAC/','94.6 GB']]),
  mk(185,'Clifford Brown Complete Blue Note Sessions','32.4 GB',32.4,'U:\\Jazz\\CliffordBrown\\','🎷',412,58,[['CliffordBrown_FLAC/','32.4 GB']]),
  mk(186,'Charles Mingus Complete Debut Recordings','44.8 GB',44.8,'U:\\Jazz\\Mingus\\','🎷',489,68,[['Mingus_Debut_FLAC/','44.8 GB']]),
  mk(187,'Sonny Rollins Complete Prestige Sessions','58.6 GB',58.6,'U:\\Jazz\\Rollins\\','🎷',423,59,[['Rollins_Prestige_FLAC/','58.6 GB']]),
  mk(188,'Ornette Coleman Complete Atlantic Sessions','42.4 GB',42.4,'U:\\Jazz\\Coleman\\','🎷',378,53,[['Coleman_Atlantic_FLAC/','42.4 GB']]),
  mk(189,'Dave Brubeck Complete Columbia Sessions','74.2 GB',74.2,'U:\\Jazz\\Brubeck\\','🎷',445,62,[['Brubeck_Columbia_FLAC/','74.2 GB']]),
  mk(190,'Wes Montgomery Complete Riverside Sessions','52.8 GB',52.8,'U:\\Jazz\\Montgomery\\','🎷',412,58,[['Montgomery_Riverside_FLAC/','52.8 GB']]),
  mk(191,'Herbie Hancock Complete Blue Note Sessions','64.6 GB',64.6,'U:\\Jazz\\Hancock\\','🎷',489,68,[['Hancock_BlueNote_FLAC/','64.6 GB']]),
  mk(192,'Wayne Shorter Complete Blue Note Sessions','58.4 GB',58.4,'U:\\Jazz\\Shorter\\','🎷',456,64,[['Shorter_BlueNote_FLAC/','58.4 GB']]),
  mk(193,'McCoy Tyner Complete Impulse Sessions','48.2 GB',48.2,'U:\\Jazz\\Tyner\\','🎷',389,54,[['Tyner_Impulse_FLAC/','48.2 GB']]),
  mk(194,'Dexter Gordon Complete Blue Note Sessions','62.4 GB',62.4,'U:\\Jazz\\DexterGordon\\','🎷',367,51,[['Gordon_BlueNote_FLAC/','62.4 GB']]),
  mk(195,'Lee Morgan Complete Blue Note Sessions','54.8 GB',54.8,'U:\\Jazz\\LeeMorgan\\','🎷',345,48,[['Morgan_BlueNote_FLAC/','54.8 GB']]),
  mk(196,'Grant Green Complete Blue Note Sessions','48.6 GB',48.6,'U:\\Jazz\\GrantGreen\\','🎷',334,47,[['Green_BlueNote_FLAC/','48.6 GB']]),
  mk(197,'Freddie Hubbard Complete Blue Note Sessions','52.4 GB',52.4,'U:\\Jazz\\FredHubbard\\','🎷',323,45,[['Hubbard_BlueNote_FLAC/','52.4 GB']]),
  mk(198,'Eric Dolphy Complete Prestige Sessions','38.6 GB',38.6,'U:\\Jazz\\Dolphy\\','🎷',356,50,[['Dolphy_Prestige_FLAC/','38.6 GB']]),
  mk(199,'Stan Getz Complete Verve Sessions','84.2 GB',84.2,'U:\\Jazz\\Getz\\','🎷',412,58,[['Getz_Verve_FLAC/','84.2 GB']]),
  mk(200,'Chet Baker Complete Pacific Jazz Sessions','68.4 GB',68.4,'U:\\Jazz\\ChetBaker\\','🎷',445,62,[['Baker_PacificJazz_FLAC/','68.4 GB']]),
  mk(201,'Oscar Peterson Complete Verve Sessions','94.6 GB',94.6,'U:\\Jazz\\Peterson\\','🎷',423,59,[['Peterson_Verve_FLAC/','94.6 GB']]),
  mk(202,'Bud Powell Complete Blue Note Sessions','42.8 GB',42.8,'U:\\Jazz\\BudPowell\\','🎷',378,53,[['Powell_BlueNote_FLAC/','42.8 GB']]),
  mk(203,'Ahmad Jamal Complete Argo Sessions','48.4 GB',48.4,'U:\\Jazz\\Jamal\\','🎷',312,44,[['Jamal_Argo_FLAC/','48.4 GB']]),
  mk(204,'Modern Jazz Quartet Complete Atlantic Sessions','62.6 GB',62.6,'U:\\Jazz\\MJQ\\','🎷',289,40,[['MJQ_Atlantic_FLAC/','62.6 GB']]),
  mk(205,'Newport Jazz Festival 1958-1965 Collection','48.2 GB',48.2,'U:\\Jazz\\Newport\\','🎷',489,68,[['Newport_FLAC/','48.2 GB']]),
  mk(206,'Blue Note Records Complete 1939-1967 Archive','624.8 GB',624.8,'U:\\Jazz\\BlueNote-Complete\\','🎷',534,75,[['BlueNote_Complete_FLAC/','624.8 GB']]),
  mk(207,'Prestige Records Complete 1949-1969 Archive','484.6 GB',484.6,'U:\\Jazz\\Prestige-Complete\\','🎷',489,68,[['Prestige_Complete_FLAC/','484.6 GB']]),
  mk(208,'Smithsonian Jazz Collection Complete Archive','84.4 GB',84.4,'U:\\Jazz\\Smithsonian\\','🎷',412,58,[['Smithsonian_Jazz_FLAC/','84.4 GB']]),
  mk(209,'Jazz at Massey Hall 1953 Complete Sessions','8.6 GB',8.6,'U:\\Jazz\\MasseyHall\\','🎷',623,87,[['MasseyHall_1953_FLAC/','8.6 GB']]),
  mk(210,'Gerry Mulligan Complete Capitol Sessions','48.2 GB',48.2,'U:\\Jazz\\Mulligan\\','🎷',289,40,[['Mulligan_Capitol_FLAC/','48.2 GB']]),
  mk(211,'Lee Konitz Complete Verve Sessions','42.4 GB',42.4,'U:\\Jazz\\Konitz\\','🎷',267,37,[['Konitz_Verve_FLAC/','42.4 GB']]),
  mk(212,'Elvin Jones Complete Blue Note Sessions','44.8 GB',44.8,'U:\\Jazz\\ElvinJones\\','🎷',278,39,[['ElvinJones_BlueNote_FLAC/','44.8 GB']]),
  mk(213,'Paul Desmond Complete RCA Sessions','36.4 GB',36.4,'U:\\Jazz\\Desmond\\','🎷',256,36,[['Desmond_RCA_FLAC/','36.4 GB']]),
  mk(214,'Lennie Tristano Complete Capitol Sessions','28.6 GB',28.6,'U:\\Jazz\\Tristano\\','🎷',234,33,[['Tristano_FLAC/','28.6 GB']]),
  mk(215,'Andrew Hill Complete Blue Note Sessions','38.4 GB',38.4,'U:\\Jazz\\AndrewHill\\','🎷',245,34,[['Hill_BlueNote_FLAC/','38.4 GB']]),
  mk(216,'Horace Silver Complete Blue Note Sessions','56.2 GB',56.2,'U:\\Jazz\\HoraceSilver\\','🎷',312,44,[['Silver_BlueNote_FLAC/','56.2 GB']]),
  // ── Blues / Folk / Country / Gospel ─────────────────────────────
  mk(217,'Robert Johnson Complete Recordings Remastered','2.4 GB',2.4,'U:\\Blues-Folk\\RobertJohnson\\','🎸',789,110,[['RobertJohnson_Complete_FLAC/','2.4 GB']]),
  mk(218,'Muddy Waters Complete Chess Sessions','48.6 GB',48.6,'U:\\Blues-Folk\\MuddyWaters\\','🎸',534,75,[['MuddyWaters_Chess_FLAC/','48.6 GB']]),
  mk(219,'Howlin Wolf Complete Chess Sessions','42.4 GB',42.4,'U:\\Blues-Folk\\HowlinWolf\\','🎸',489,68,[['HowlinWolf_Chess_FLAC/','42.4 GB']]),
  mk(220,'BB King Live at the Regal Complete Recordings','8.4 GB',8.4,'U:\\Blues-Folk\\BBKing\\','🎸',623,87,[['BBKing_Regal_FLAC/','8.4 GB']]),
  mk(221,'Lightnin Hopkins Complete Recordings Archive','64.8 GB',64.8,'U:\\Blues-Folk\\Lightnin\\','🎸',345,48,[['Lightnin_Complete_FLAC/','64.8 GB']]),
  mk(222,'Son House Complete Library of Congress Recordings','12.6 GB',12.6,'U:\\Blues-Folk\\SonHouse\\','🎸',412,58,[['SonHouse_LoC_FLAC/','12.6 GB']]),
  mk(223,'Lead Belly Complete Smithsonian Sessions','38.4 GB',38.4,'U:\\Blues-Folk\\LeadBelly\\','🎸',445,62,[['LeadBelly_Smithsonian_FLAC/','38.4 GB']]),
  mk(224,'Mississippi John Hurt Complete Recordings','18.6 GB',18.6,'U:\\Blues-Folk\\MSJohnHurt\\','🎸',378,53,[['MSJohnHurt_FLAC/','18.6 GB']]),
  mk(225,'Skip James Complete Recordings Archive','14.4 GB',14.4,'U:\\Blues-Folk\\SkipJames\\','🎸',356,50,[['SkipJames_FLAC/','14.4 GB']]),
  mk(226,'Woody Guthrie Complete Archive Collection','84.6 GB',84.6,'U:\\Blues-Folk\\WoodyGuthrie\\','🎸',534,75,[['Guthrie_Complete_FLAC/','84.6 GB']]),
  mk(227,'Pete Seeger Complete Recordings Archive','72.4 GB',72.4,'U:\\Blues-Folk\\PeteSeeger\\','🎸',489,68,[['Seeger_Complete_FLAC/','72.4 GB']]),
  mk(228,'Joan Baez Complete Vanguard Sessions','54.8 GB',54.8,'U:\\Blues-Folk\\JoanBaez\\','🎸',412,58,[['Baez_Vanguard_FLAC/','54.8 GB']]),
  mk(229,'Bob Dylan Complete Basement Tapes Collection','18.4 GB',18.4,'U:\\Blues-Folk\\Dylan-Basement\\','🎸',623,87,[['Dylan_BasementTapes_FLAC/','18.4 GB']]),
  mk(230,'Hank Williams Complete Recordings Archive','32.6 GB',32.6,'U:\\Blues-Folk\\HankWilliams\\','🎸',567,79,[['HankWilliams_FLAC/','32.6 GB']]),
  mk(231,'Jimmie Rodgers Complete Recordings Archive','24.4 GB',24.4,'U:\\Blues-Folk\\JimmieRodgers\\','🎸',489,68,[['JimmieRodgers_FLAC/','24.4 GB']]),
  mk(232,'Carter Family Complete RCA Sessions','28.6 GB',28.6,'U:\\Blues-Folk\\CarterFamily\\','🎸',445,62,[['CarterFamily_RCA_FLAC/','28.6 GB']]),
  mk(233,'Johnny Cash Complete Sun Sessions Archive','18.8 GB',18.8,'U:\\Blues-Folk\\JohnnyCash\\','🎸',534,75,[['Cash_Sun_FLAC/','18.8 GB']]),
  mk(234,'Appalachian Folk Music Complete Collection','48.4 GB',48.4,'U:\\Blues-Folk\\Appalachian\\','🎸',289,40,[['Appalachian_Folk_FLAC/','48.4 GB']]),
  mk(235,'Alan Lomax Southern Journey Field Recordings','62.8 GB',62.8,'U:\\Blues-Folk\\AlanLomax\\','🎸',412,58,[['Lomax_SouthernJourney_FLAC/','62.8 GB']]),
  mk(236,'Arhoolie Records Complete Blues Collection','124.6 GB',124.6,'U:\\Blues-Folk\\Arhoolie\\','🎸',345,48,[['Arhoolie_Complete_FLAC/','124.6 GB']]),
  mk(237,'Folkways Records Complete Archive','284.8 GB',284.8,'U:\\Blues-Folk\\Folkways\\','🎸',423,59,[['Folkways_Complete_FLAC/','284.8 GB']]),
  mk(238,'Gospel Music Archive 1920s-1960s Complete','68.4 GB',68.4,'U:\\Blues-Folk\\Gospel\\','🎸',356,50,[['Gospel_1920s-60s_FLAC/','68.4 GB']]),
  mk(239,'Sacred Harp Singing Complete Collection','28.4 GB',28.4,'U:\\Blues-Folk\\SacredHarp\\','🎸',267,37,[['SacredHarp_FLAC/','28.4 GB']]),
  mk(240,'Cajun and Zydeco Music Archive Complete','42.6 GB',42.6,'U:\\Blues-Folk\\Cajun\\','🎸',234,33,[['Cajun_Zydeco_FLAC/','42.6 GB']]),
  mk(241,'Old-Time String Band Complete Collection','38.4 GB',38.4,'U:\\Blues-Folk\\OldTime\\','🎸',245,34,[['OldTime_StringBand_FLAC/','38.4 GB']]),
  mk(242,'Mountain Music of Kentucky Archive','22.6 GB',22.6,'U:\\Blues-Folk\\Mountain\\','🎸',212,30,[['MountainMusic_KY_FLAC/','22.6 GB']]),
  mk(243,'Merle Haggard Complete Capitol Sessions','64.8 GB',64.8,'U:\\Blues-Folk\\MerleHaggard\\','🎸',312,44,[['Haggard_Capitol_FLAC/','64.8 GB']]),
  mk(244,'Loretta Lynn Complete Decca Sessions','58.4 GB',58.4,'U:\\Blues-Folk\\LorettaLynn\\','🎸',289,40,[['LLynn_Decca_FLAC/','58.4 GB']]),
  mk(245,'Patsy Cline Complete MCA Sessions','28.6 GB',28.6,'U:\\Blues-Folk\\PatsyCline\\','🎸',389,54,[['PatsyCline_FLAC/','28.6 GB']]),
  mk(246,'Field Recordings of American Folk Music 1930s-1950s','84.6 GB',84.6,'U:\\Blues-Folk\\FieldRecordings\\','🎸',367,51,[['FieldRecordings_FLAC/','84.6 GB']]),
  // ── Texts and books ──────────────────────────────────────────────
  mk(247,'Project Gutenberg Complete Archive 2024 Snapshot','68.4 GB',68.4,'W:\\Texts\\Gutenberg\\','📚',623,87,[['Gutenberg_2024_EPUB/','42.4 GB'],['Gutenberg_2024_TXT/','26.0 GB']]),
  mk(248,'Standard Ebooks Complete Collection 2024','8.6 GB',8.6,'W:\\Texts\\StandardEbooks\\','📚',489,68,[['StandardEbooks_EPUB/','8.6 GB']]),
  mk(249,'Internet Archive Open Library 1M Books Collection','2840.0 GB',2840.0,'W:\\Texts\\OpenLibrary\\','📚',234,33,[['OpenLibrary_DJVU/','1680 GB'],['OpenLibrary_PDF/','1160 GB']]),
  mk(250,'HathiTrust Public Domain Collection Vol.1','484.6 GB',484.6,'W:\\Texts\\HathiTrust\\','📚',312,44,[['HathiTrust_Vol1_PDF/','484.6 GB']]),
  mk(251,'HathiTrust Public Domain Collection Vol.2','512.4 GB',512.4,'W:\\Texts\\HathiTrust\\','📚',289,40,[['HathiTrust_Vol2_PDF/','512.4 GB']]),
  mk(252,'Library of Congress Digital Collections Archive','284.8 GB',284.8,'W:\\Texts\\LoC\\','📚',423,59,[['LoC_Digital_Collections/','284.8 GB']]),
  mk(253,'British Library Public Domain Books Archive','368.4 GB',368.4,'W:\\Texts\\BritishLibrary\\','📚',345,48,[['BritLib_PublicDomain_PDF/','368.4 GB']]),
  mk(254,'World Digital Library Complete Archive','124.6 GB',124.6,'W:\\Texts\\WDL\\','📚',267,37,[['WDL_Complete_PDF/','124.6 GB']]),
  mk(255,'Digital Public Library of America Collection','184.2 GB',184.2,'W:\\Texts\\DPLA\\','📚',289,40,[['DPLA_Collection/','184.2 GB']]),
  mk(256,'Philosophy Classics Complete EPUB Collection','12.4 GB',12.4,'W:\\Texts\\Philosophy\\','📚',445,62,[['Philosophy_Classics_EPUB/','12.4 GB']]),
  mk(257,'Scientific Literature 1800s-1950s Archive','248.6 GB',248.6,'W:\\Texts\\Science\\','📚',378,53,[['Scientific_Lit_PDF/','248.6 GB']]),
  mk(258,'Historical Technical Manuals Archive 1900-1970','124.8 GB',124.8,'W:\\Texts\\Technical\\','📚',312,44,[['Technical_Manuals_PDF/','124.8 GB']]),
  mk(259,'Pulp Fiction Magazines 1920s-1960s Archive','312.4 GB',312.4,'W:\\Texts\\Pulp\\','📚',356,50,[['Pulp_Magazines_CBZ/','312.4 GB']]),
  mk(260,'Science Fiction Classics Complete Collection EPUB','18.4 GB',18.4,'W:\\Texts\\SciFi\\','📚',489,68,[['SciFi_Classics_EPUB/','18.4 GB']]),
  mk(261,'Mystery and Detective Fiction Archive EPUB','22.6 GB',22.6,'W:\\Texts\\Mystery\\','📚',412,58,[['Mystery_EPUB/','22.6 GB']]),
  mk(262,'Poetry Archive Complete Collection EPUB','8.4 GB',8.4,'W:\\Texts\\Poetry\\','📚',345,48,[['Poetry_Archive_EPUB/','8.4 GB']]),
  mk(263,'Natural History Books Collection 1800s-1950s','84.6 GB',84.6,'W:\\Texts\\NaturalHistory\\','📚',267,37,[['NaturalHistory_PDF/','84.6 GB']]),
  mk(264,'Vintage Medical Textbooks 1800s-1960s Collection','68.4 GB',68.4,'W:\\Texts\\Medical\\','📚',234,33,[['Medical_Texts_PDF/','68.4 GB']]),
  mk(265,'Law and Legal History Archive 1800s-1970s','124.6 GB',124.6,'W:\\Texts\\Law\\','📚',289,40,[['Law_Archive_PDF/','124.6 GB']]),
  mk(266,'Folklore and Mythology Archive Complete','28.4 GB',28.4,'W:\\Texts\\Folklore\\','📚',312,44,[['Folklore_Mythology_EPUB/','28.4 GB']]),
  mk(267,'Childrens Books Classic Collection EPUB','14.6 GB',14.6,'W:\\Texts\\Childrens\\','📚',423,59,[['Childrens_Classic_EPUB/','14.6 GB']]),
  mk(268,'Religion and Philosophy Texts Archive','48.4 GB',48.4,'W:\\Texts\\Religion\\','📚',256,36,[['Religion_Texts_PDF/','48.4 GB']]),
  mk(269,'Linguistics and Language Studies Archive','38.6 GB',38.6,'W:\\Texts\\Linguistics\\','📚',234,33,[['Linguistics_PDF/','38.6 GB']]),
  mk(270,'Anthropology Field Studies Collection','62.4 GB',62.4,'W:\\Texts\\Anthropology\\','📚',245,34,[['Anthropology_PDF/','62.4 GB']]),
  mk(271,'Vintage Science Textbooks 1800s-1960s Archive','84.8 GB',84.8,'W:\\Texts\\ScienceTexts\\','📚',267,37,[['Science_Textbooks_PDF/','84.8 GB']]),
  mk(272,'Adventure Novels Collection 1800s-1950s EPUB','16.4 GB',16.4,'W:\\Texts\\Adventure\\','📚',289,40,[['Adventure_Novels_EPUB/','16.4 GB']]),
  mk(273,'Drama and Theater Scripts Archive','22.6 GB',22.6,'W:\\Texts\\Drama\\','📚',212,30,[['Drama_Scripts_PDF/','22.6 GB']]),
  mk(274,'Travel and Exploration Books Archive','48.4 GB',48.4,'W:\\Texts\\Travel\\','📚',234,33,[['Travel_Books_PDF/','48.4 GB']]),
  mk(275,'Economic History Books Collection Archive','54.6 GB',54.6,'W:\\Texts\\Economics\\','📚',245,34,[['Economic_History_PDF/','54.6 GB']]),
  mk(276,'Military History Books Archive 1800s-1960s','72.4 GB',72.4,'W:\\Texts\\Military\\','📚',267,37,[['Military_History_PDF/','72.4 GB']]),
  mk(277,'Art History Books Collection Archive','68.8 GB',68.8,'W:\\Texts\\ArtHistory\\','📚',289,40,[['Art_History_PDF/','68.8 GB']]),
  mk(278,'Architecture Books Archive 1800s-1960s','58.4 GB',58.4,'W:\\Texts\\Architecture\\','📚',234,33,[['Architecture_PDF/','58.4 GB']]),
  mk(279,'Photography History Books Collection','42.6 GB',42.6,'W:\\Texts\\Photography\\','📚',245,34,[['Photography_Books_PDF/','42.6 GB']]),
  mk(280,'Film and Cinema History Books Archive','38.4 GB',38.4,'W:\\Texts\\Cinema\\','📚',256,36,[['Cinema_Books_PDF/','38.4 GB']]),
  mk(281,'Music Theory and History Books Collection','32.6 GB',32.6,'W:\\Texts\\MusicTheory\\','📚',267,37,[['Music_Theory_PDF/','32.6 GB']]),
  mk(282,'Europeana Public Domain Books Archive','284.6 GB',284.6,'W:\\Texts\\Europeana\\','📚',289,40,[['Europeana_PDF/','284.6 GB']]),
  // ── Historical newspapers ────────────────────────────────────────
  mk(283,'New York Times Archive 1851-1980 Complete PDF','1248.6 GB',1248.6,'W:\\Newspapers\\NYT\\','📰',534,75,[['NYT_1851-1980_PDF/','1248.6 GB']]),
  mk(284,'The Guardian and Observer Archive 1821-1990','984.4 GB',984.4,'W:\\Newspapers\\Guardian\\','📰',423,59,[['Guardian_1821-1990_PDF/','984.4 GB']]),
  mk(285,'Washington Post Archive 1877-1970','624.8 GB',624.8,'W:\\Newspapers\\WashPost\\','📰',367,51,[['WashPost_1877-1970_PDF/','624.8 GB']]),
  mk(286,'Chicago Tribune Archive 1847-1970','584.6 GB',584.6,'W:\\Newspapers\\ChiTribune\\','📰',312,44,[['ChiTribune_1847-1970_PDF/','584.6 GB']]),
  mk(287,'Los Angeles Times Archive 1881-1970','512.4 GB',512.4,'W:\\Newspapers\\LATimes\\','📰',289,40,[['LATimes_1881-1970_PDF/','512.4 GB']]),
  mk(288,'Le Monde Archive 1944-1990 Complete','384.6 GB',384.6,'W:\\Newspapers\\LeMonde\\','📰',245,34,[['LeMonde_1944-1990_PDF/','384.6 GB']]),
  mk(289,'The Times of London Archive 1785-1980','1124.8 GB',1124.8,'W:\\Newspapers\\TimesLondon\\','📰',289,40,[['TimesLondon_1785-1980_PDF/','1124.8 GB']]),
  mk(290,'Scientific American Archive 1845-1980 Complete','284.6 GB',284.6,'W:\\Newspapers\\SciAm\\','📰',445,62,[['SciAm_1845-1980_PDF/','284.6 GB']]),
  mk(291,'Popular Science Archive 1872-1980','248.4 GB',248.4,'W:\\Newspapers\\PopSci\\','📰',378,53,[['PopSci_1872-1980_PDF/','248.4 GB']]),
  mk(292,'Popular Mechanics Archive 1902-1980','212.6 GB',212.6,'W:\\Newspapers\\PopMech\\','📰',356,50,[['PopMech_1902-1980_PDF/','212.6 GB']]),
  mk(293,'Life Magazine Complete Archive 1936-1972','384.8 GB',384.8,'W:\\Newspapers\\Life\\','📰',489,68,[['Life_1936-1972_PDF/','384.8 GB']]),
  mk(294,'Look Magazine Archive 1937-1971','224.6 GB',224.6,'W:\\Newspapers\\Look\\','📰',312,44,[['Look_1937-1971_PDF/','224.6 GB']]),
  mk(295,'Saturday Evening Post Archive 1821-1969','484.6 GB',484.6,'W:\\Newspapers\\SEP\\','📰',334,47,[['SEP_1821-1969_PDF/','484.6 GB']]),
  mk(296,"Harper's Magazine Archive 1850-1980",'284.4 GB',284.4,'W:\\Newspapers\\Harpers\\','📰',289,40,[["Harpers_1850-1980_PDF/",'284.4 GB']]),
  mk(297,'The Atlantic Archive 1857-1980','268.6 GB',268.6,'W:\\Newspapers\\Atlantic\\','📰',312,44,[['Atlantic_1857-1980_PDF/','268.6 GB']]),
  mk(298,'Time Magazine Archive 1923-1970','248.4 GB',248.4,'W:\\Newspapers\\Time\\','📰',389,54,[['Time_1923-1970_PDF/','248.4 GB']]),
  mk(299,'National Geographic Archive 1888-1970','312.6 GB',312.6,'W:\\Newspapers\\NatGeo\\','📰',423,59,[['NatGeo_1888-1970_PDF/','312.6 GB']]),
  mk(300,'Punch Magazine Complete Archive 1841-1992','184.8 GB',184.8,'W:\\Newspapers\\Punch\\','📰',245,34,[['Punch_1841-1992_PDF/','184.8 GB']]),
  mk(301,'Variety Magazine Archive 1905-1970','168.4 GB',168.4,'W:\\Newspapers\\Variety\\','📰',267,37,[['Variety_1905-1970_PDF/','168.4 GB']]),
  mk(302,'Billboard Magazine Archive 1894-1970','148.6 GB',148.6,'W:\\Newspapers\\Billboard\\','📰',289,40,[['Billboard_1894-1970_PDF/','148.6 GB']]),
  mk(303,'Rolling Stone Archive 1967-1990 Complete','84.4 GB',84.4,'W:\\Newspapers\\RollingStone\\','📰',445,62,[['RollingStone_1967-1990_PDF/','84.4 GB']]),
  mk(304,'Downbeat Magazine Archive 1934-1980','68.6 GB',68.6,'W:\\Newspapers\\Downbeat\\','📰',312,44,[['Downbeat_1934-1980_PDF/','68.6 GB']]),
  mk(305,'Radio Times Archive 1923-1980','112.4 GB',112.4,'W:\\Newspapers\\RadioTimes\\','📰',234,33,[['RadioTimes_1923-1980_PDF/','112.4 GB']]),
  mk(306,'Der Spiegel Archive 1947-1995','184.6 GB',184.6,'W:\\Newspapers\\Spiegel\\','📰',267,37,[['Spiegel_1947-1995_PDF/','184.6 GB']]),
  mk(307,'The Illustrated London News Archive 1842-1971','224.8 GB',224.8,'W:\\Newspapers\\ILN\\','📰',289,40,[['ILN_1842-1971_PDF/','224.8 GB']]),
  mk(308,'Newsweek Archive 1933-1970','164.4 GB',164.4,'W:\\Newspapers\\Newsweek\\','📰',245,34,[['Newsweek_1933-1970_PDF/','164.4 GB']]),
  mk(309,'Motor Trend Archive 1949-1980','82.6 GB',82.6,'W:\\Newspapers\\MotorTrend\\','📰',212,30,[['MotorTrend_1949-1980_PDF/','82.6 GB']]),
  mk(310,'Popular Electronics Archive 1954-1980','64.4 GB',64.4,'W:\\Newspapers\\PopElectronics\\','📰',234,33,[['PopElectronics_1954-1980_PDF/','64.4 GB']]),
  // ── Silent films ─────────────────────────────────────────────────
  mk(311,'Chaplin Complete Silent Films Collection 4K Scans','284.6 GB',284.6,'V:\\Silent-Films\\Chaplin\\','🎬',534,75,[['Chaplin_Complete_4K/','284.6 GB']]),
  mk(312,'Buster Keaton Complete Silent Films Archive','184.4 GB',184.4,'V:\\Silent-Films\\Keaton\\','🎬',489,68,[['Keaton_Complete_FLAC/','184.4 GB']]),
  mk(313,'Harold Lloyd Complete Silent Films Collection','148.6 GB',148.6,'V:\\Silent-Films\\Lloyd\\','🎬',412,58,[['Lloyd_Complete/','148.6 GB']]),
  mk(314,'Mack Sennett Keystone Studios Collection','124.4 GB',124.4,'V:\\Silent-Films\\Keystone\\','🎬',312,44,[['Keystone_Collection/','124.4 GB']]),
  mk(315,'DW Griffith Complete Films Collection','164.8 GB',164.8,'V:\\Silent-Films\\Griffith\\','🎬',289,40,[['Griffith_Complete/','164.8 GB']]),
  mk(316,'Fritz Lang Silent Films Collection','84.6 GB',84.6,'V:\\Silent-Films\\Fritz-Lang\\','🎬',378,53,[['FritzLang_Silent/','84.6 GB']]),
  mk(317,'FW Murnau Complete Films Collection','68.4 GB',68.4,'V:\\Silent-Films\\Murnau\\','🎬',345,48,[['Murnau_Complete/','68.4 GB']]),
  mk(318,'Sergei Eisenstein Complete Films Archive','82.6 GB',82.6,'V:\\Silent-Films\\Eisenstein\\','🎬',423,59,[['Eisenstein_Complete/','82.6 GB']]),
  mk(319,'German Expressionist Cinema Archive','124.8 GB',124.8,'V:\\Silent-Films\\German-Expressionism\\','🎬',312,44,[['GermanExpressionism/','124.8 GB']]),
  mk(320,'Soviet Silent Cinema Complete Archive','148.4 GB',148.4,'V:\\Silent-Films\\Soviet\\','🎬',267,37,[['Soviet_Silent_Cinema/','148.4 GB']]),
  mk(321,'French Avant-Garde Cinema 1920s Archive','64.6 GB',64.6,'V:\\Silent-Films\\French-AvantGarde\\','🎬',234,33,[['French_AvantGarde_1920s/','64.6 GB']]),
  mk(322,'Early Nickelodeon Films 1894-1910 Collection','84.4 GB',84.4,'V:\\Silent-Films\\Nickelodeon\\','🎬',312,44,[['Nickelodeon_1894-1910/','84.4 GB']]),
  mk(323,'Edison Manufacturing Company Films Archive','124.6 GB',124.6,'V:\\Silent-Films\\Edison\\','🎬',289,40,[['Edison_Films/','124.6 GB']]),
  mk(324,'Lumiere Brothers Complete Films Collection','28.4 GB',28.4,'V:\\Silent-Films\\Lumiere\\','🎬',489,68,[['Lumiere_Complete/','28.4 GB']]),
  mk(325,'Georges Melies Complete Films Collection','42.6 GB',42.6,'V:\\Silent-Films\\Melies\\','🎬',445,62,[['Melies_Complete/','42.6 GB']]),
  mk(326,'Newsreels 1910-1930 Complete Collection','184.8 GB',184.8,'V:\\Silent-Films\\Newsreels\\','🎬',267,37,[['Newsreels_1910-1930/','184.8 GB']]),
  mk(327,'Early Animation 1906-1930 Collection','48.4 GB',48.4,'V:\\Silent-Films\\Early-Animation\\','🎬',312,44,[['EarlyAnimation_1906-1930/','48.4 GB']]),
  mk(328,'Abel Gance Silent Films Collection','28.6 GB',28.6,'V:\\Silent-Films\\Gance\\','🎬',245,34,[['Gance_Films/','28.6 GB']]),
  mk(329,'Carl Dreyer Complete Films Archive','32.4 GB',32.4,'V:\\Silent-Films\\Dreyer\\','🎬',267,37,[['Dreyer_Complete/','32.4 GB']]),
  mk(330,'Dziga Vertov Complete Films Collection','24.8 GB',24.8,'V:\\Silent-Films\\Vertov\\','🎬',256,36,[['Vertov_Complete/','24.8 GB']]),
  // ── Documentary archives ─────────────────────────────────────────
  mk(331,'Prelinger Archives Industrial Films Complete','284.6 GB',284.6,'V:\\Documentaries\\Prelinger\\','🎬',534,75,[['Prelinger_Industrial_Complete/','284.6 GB']]),
  mk(332,'US Government Propaganda Films 1940s-1960s','184.4 GB',184.4,'V:\\Documentaries\\USGov\\','🎬',412,58,[['USGov_Propaganda/','184.4 GB']]),
  mk(333,'NASA Films Complete Archive 1958-2000','248.6 GB',248.6,'V:\\Documentaries\\NASA\\','🎬',623,87,[['NASA_Films_Complete/','248.6 GB']]),
  mk(334,'National Film Board of Canada Archive','312.8 GB',312.8,'V:\\Documentaries\\NFB-Canada\\','🎬',289,40,[['NFB_Canada_Archive/','312.8 GB']]),
  mk(335,'Civil Rights Era Documentary Collection','64.4 GB',64.4,'V:\\Documentaries\\CivilRights\\','🎬',445,62,[['CivilRights_Docs/','64.4 GB']]),
  mk(336,'Vietnam War Documentary Archive','84.6 GB',84.6,'V:\\Documentaries\\Vietnam\\','🎬',378,53,[['Vietnam_Docs/','84.6 GB']]),
  mk(337,'Cold War Documentary Complete Collection','124.8 GB',124.8,'V:\\Documentaries\\ColdWar\\','🎬',312,44,[['ColdWar_Docs/','124.8 GB']]),
  mk(338,'World War II Documentary Archive Vol.1','184.6 GB',184.6,'V:\\Documentaries\\WWII\\','🎬',489,68,[['WWII_Docs_Vol1/','184.6 GB']]),
  mk(339,'World War II Documentary Archive Vol.2','184.4 GB',184.4,'V:\\Documentaries\\WWII\\','🎬',467,65,[['WWII_Docs_Vol2/','184.4 GB']]),
  mk(340,'Great Depression Documentary Archive','68.4 GB',68.4,'V:\\Documentaries\\Depression\\','🎬',289,40,[['Depression_Docs/','68.4 GB']]),
  mk(341,'New Deal Era Films Collection Archive','48.6 GB',48.6,'V:\\Documentaries\\NewDeal\\','🎬',267,37,[['NewDeal_Films/','48.6 GB']]),
  mk(342,'Atomic Age Documentary Archive','42.4 GB',42.4,'V:\\Documentaries\\AtomicAge\\','🎬',312,44,[['AtomicAge_Docs/','42.4 GB']]),
  mk(343,'Rock and Roll Era Documentary Collection','56.8 GB',56.8,'V:\\Documentaries\\RockEra\\','🎬',356,50,[['RockEra_Docs/','56.8 GB']]),
  mk(344,'Folk Music Revival Documentary Archive','38.4 GB',38.4,'V:\\Documentaries\\FolkRevival\\','🎬',289,40,[['FolkRevival_Docs/','38.4 GB']]),
  mk(345,'Natural World Documentary Archive Collection','124.6 GB',124.6,'V:\\Documentaries\\Nature\\','🎬',412,58,[['Nature_Docs/','124.6 GB']]),
  mk(346,'Ocean Exploration Documentary Collection','64.8 GB',64.8,'V:\\Documentaries\\Ocean\\','🎬',345,48,[['Ocean_Docs/','64.8 GB']]),
  mk(347,'Anthropology and Ethnographic Film Collection','84.4 GB',84.4,'V:\\Documentaries\\Anthropology\\','🎬',267,37,[['Anthropology_Films/','84.4 GB']]),
  mk(348,'Space Age Documentary Archive 1957-1980','72.6 GB',72.6,'V:\\Documentaries\\SpaceAge\\','🎬',389,54,[['SpaceAge_Docs/','72.6 GB']]),
  mk(349,'Labor History Documentary Archive','44.4 GB',44.4,'V:\\Documentaries\\Labor\\','🎬',245,34,[['Labor_Docs/','44.4 GB']]),
  mk(350,'Environmental Documentary Collection Archive','58.6 GB',58.6,'V:\\Documentaries\\Environment\\','🎬',312,44,[['Environment_Docs/','58.6 GB']]),
  mk(351,'Sports History Documentary Archive','68.4 GB',68.4,'V:\\Documentaries\\Sports\\','🎬',289,40,[['Sports_Docs/','68.4 GB']]),
  mk(352,'Jazz Age Documentary Collection Archive','32.6 GB',32.6,'V:\\Documentaries\\JazzAge\\','🎬',256,36,[['JazzAge_Docs/','32.6 GB']]),
  mk(353,'Korean War Documentary Collection','38.4 GB',38.4,'V:\\Documentaries\\KoreanWar\\','🎬',234,33,[['KoreanWar_Docs/','38.4 GB']]),
  mk(354,'Womens Rights Documentary Collection','28.6 GB',28.6,'V:\\Documentaries\\WomensRights\\','🎬',267,37,[['WomensRights_Docs/','28.6 GB']]),
  mk(355,'CBS NBC ABC News Documentary Archives 1960s','84.8 GB',84.8,'V:\\Documentaries\\TVNews\\','🎬',312,44,[['TVNews_Docs/','84.8 GB']]),
  mk(356,'PBS Frontline Archive Complete Collection','48.4 GB',48.4,'V:\\Documentaries\\Frontline\\','🎬',345,48,[['Frontline_Archive/','48.4 GB']]),
  // ── Animation archives ───────────────────────────────────────────
  mk(357,'Fleischer Studios Complete Archive Betty Boop Superman','184.6 GB',184.6,'V:\\Animation\\Fleischer\\','🎬',489,68,[['Fleischer_Complete/','184.6 GB']]),
  mk(358,'Van Beuren Studios Complete Collection','64.4 GB',64.4,'V:\\Animation\\VanBeuren\\','🎬',312,44,[['VanBeuren_Complete/','64.4 GB']]),
  mk(359,'Terrytoons Complete Archive Mighty Mouse','124.8 GB',124.8,'V:\\Animation\\Terrytoons\\','🎬',267,37,[['Terrytoons_Complete/','124.8 GB']]),
  mk(360,'Walter Lantz Early Cartoons Woody Woodpecker','148.4 GB',148.4,'V:\\Animation\\Lantz\\','🎬',289,40,[['Lantz_Cartoons/','148.4 GB']]),
  mk(361,'MGM Cartoon Archive Pre-1948 Tom and Jerry','184.6 GB',184.6,'V:\\Animation\\MGM\\','🎬',356,50,[['MGM_Cartoons_Pre1948/','184.6 GB']]),
  mk(362,'Columbia Screen Gems Cartoon Archive','84.4 GB',84.4,'V:\\Animation\\Columbia\\','🎬',234,33,[['Columbia_Cartoons/','84.4 GB']]),
  mk(363,'UPA Animation Archive Mr Magoo Gerald McBoing','64.6 GB',64.6,'V:\\Animation\\UPA\\','🎬',267,37,[['UPA_Animation/','64.6 GB']]),
  mk(364,'Soviet Soyuzmultfilm Animation Archive','184.8 GB',184.8,'V:\\Animation\\Soyuzmultfilm\\','🎬',312,44,[['Soyuzmultfilm_Archive/','184.8 GB']]),
  mk(365,'Eastern European Animation Archive','124.4 GB',124.4,'V:\\Animation\\EasternEurope\\','🎬',245,34,[['EasternEurope_Animation/','124.4 GB']]),
  mk(366,'French Animation Archive 1920s-1960s','68.6 GB',68.6,'V:\\Animation\\French\\','🎬',212,30,[['French_Animation/','68.6 GB']]),
  mk(367,'Vintage Educational Animation Archive','48.4 GB',48.4,'V:\\Animation\\Educational\\','🎬',234,33,[['Educational_Animation/','48.4 GB']]),
  mk(368,'Advertising Animation Archive 1950s-1970s','42.6 GB',42.6,'V:\\Animation\\Advertising\\','🎬',189,26,[['Advertising_Animation/','42.6 GB']]),
  mk(369,'Paramount Cartoon Studios Collection','84.8 GB',84.8,'V:\\Animation\\Paramount\\','🎬',267,37,[['Paramount_Cartoons/','84.8 GB']]),
  mk(370,'Leon Schlesinger Early Warner Bros Cartoons','128.4 GB',128.4,'V:\\Animation\\EarlyWarnerBros\\','🎬',312,44,[['EarlyWB_Cartoons/','128.4 GB']]),
  mk(371,'Japanese Pre-War Animation Collection','38.4 GB',38.4,'V:\\Animation\\Japanese-PreWar\\','🎬',189,26,[['Japan_PreWar_Animation/','38.4 GB']]),
  // ── Software and games ───────────────────────────────────────────
  mk(372,'Atari 2600 Complete ROM Collection No-Intro','8.4 GB',8.4,'V:\\Software\\Atari-2600\\','💽',623,87,[['Atari2600_NoIntro_ROM/','8.4 GB']]),
  mk(373,'ColecoVision Complete ROM Collection','2.4 GB',2.4,'V:\\Software\\ColecoVision\\','💽',489,68,[['ColecoVision_ROM/','2.4 GB']]),
  mk(374,'Mattel Intellivision Complete ROM Collection','1.8 GB',1.8,'V:\\Software\\Intellivision\\','💽',412,58,[['Intellivision_ROM/','1.8 GB']]),
  mk(375,'TRS-80 Software Archive Complete','12.4 GB',12.4,'V:\\Software\\TRS-80\\','💽',312,44,[['TRS80_Software/','12.4 GB']]),
  mk(376,'Apple II Software Complete Archive','84.6 GB',84.6,'V:\\Software\\Apple-II\\','💽',445,62,[['AppleII_Complete/','84.6 GB']]),
  mk(377,'Commodore 64 Software Complete Archive','124.8 GB',124.8,'V:\\Software\\C64\\','💽',534,75,[['C64_Complete/','124.8 GB']]),
  mk(378,'Commodore Amiga Software Complete Archive','184.6 GB',184.6,'V:\\Software\\Amiga\\','💽',456,64,[['Amiga_Complete/','184.6 GB']]),
  mk(379,'Atari ST Software Complete Archive','84.4 GB',84.4,'V:\\Software\\AtariST\\','💽',378,53,[['AtariST_Complete/','84.4 GB']]),
  mk(380,'DOS Games Complete Collection 1981-1995','248.8 GB',248.8,'V:\\Software\\DOS-Games\\','💽',623,87,[['DOS_Games_Complete/','248.8 GB']]),
  mk(381,'Windows 3.x and 95 Games Archive','164.6 GB',164.6,'V:\\Software\\Win3x-95\\','💽',489,68,[['Win3x_95_Games/','164.6 GB']]),
  mk(382,'Mac Classic Software Archive 1984-1994','84.4 GB',84.4,'V:\\Software\\MacClassic\\','💽',345,48,[['MacClassic_Software/','84.4 GB']]),
  mk(383,'BBC Micro Software Archive Complete','28.6 GB',28.6,'V:\\Software\\BBCMicro\\','💽',267,37,[['BBCMicro_Complete/','28.6 GB']]),
  mk(384,'Sinclair ZX Spectrum Complete Archive','64.8 GB',64.8,'V:\\Software\\ZXSpectrum\\','💽',423,59,[['ZXSpectrum_Complete/','64.8 GB']]),
  mk(385,'Amstrad CPC Software Archive Complete','48.4 GB',48.4,'V:\\Software\\AmstradCPC\\','💽',289,40,[['AmstradCPC_Complete/','48.4 GB']]),
  mk(386,'MSX Computer Software Archive Complete','84.6 GB',84.6,'V:\\Software\\MSX\\','💽',312,44,[['MSX_Complete/','84.6 GB']]),
  mk(387,'CP/M Software Complete Archive','18.4 GB',18.4,'V:\\Software\\CPM\\','💽',234,33,[['CPM_Complete/','18.4 GB']]),
  mk(388,'PLATO System Software Archive','12.6 GB',12.6,'V:\\Software\\PLATO\\','💽',189,26,[['PLATO_Archive/','12.6 GB']]),
  mk(389,'Infocom Interactive Fiction Complete Archive','2.4 GB',2.4,'V:\\Software\\Infocom\\','💽',534,75,[['Infocom_Complete/','2.4 GB']]),
  mk(390,'Sierra On-Line Complete Game Archive','48.6 GB',48.6,'V:\\Software\\Sierra\\','💽',623,87,[['Sierra_Complete/','48.6 GB']]),
  mk(391,'LucasArts Complete Adventure Game Archive','38.4 GB',38.4,'V:\\Software\\LucasArts\\','💽',567,79,[['LucasArts_Complete/','38.4 GB']]),
  mk(392,'id Software Complete Archive Quake Doom Wolfenstein','28.6 GB',28.6,'V:\\Software\\idSoftware\\','💽',712,100,[['idSoftware_Complete/','28.6 GB']]),
  mk(393,'Apogee Software Complete Archive Duke Nukem','22.4 GB',22.4,'V:\\Software\\Apogee\\','💽',578,81,[['Apogee_Complete/','22.4 GB']]),
  mk(394,'Origin Systems Complete Archive Ultima','42.8 GB',42.8,'V:\\Software\\Origin\\','💽',489,68,[['Origin_Complete/','42.8 GB']]),
  mk(395,'Looking Glass Studios Complete Archive Thief','18.6 GB',18.6,'V:\\Software\\LookingGlass\\','💽',445,62,[['LookingGlass_Complete/','18.6 GB']]),
  mk(396,'Microprose Complete Archive Civilization Xcom','64.4 GB',64.4,'V:\\Software\\Microprose\\','💽',534,75,[['Microprose_Complete/','64.4 GB']]),
  mk(397,'Interplay Complete Archive Fallout Baldurs Gate','84.6 GB',84.6,'V:\\Software\\Interplay\\','💽',489,68,[['Interplay_Complete/','84.6 GB']]),
  mk(398,'Epyx Software Complete Archive','22.4 GB',22.4,'V:\\Software\\Epyx\\','💽',312,44,[['Epyx_Complete/','22.4 GB']]),
  mk(399,'Activision Atari 2600 Complete Archive','8.4 GB',8.4,'V:\\Software\\ActivisionAtari\\','💽',356,50,[['Activision_Atari_Complete/','8.4 GB']]),
  mk(400,'MAME Arcade Complete ROM Set Full Nag','384.8 GB',384.8,'V:\\Software\\MAME\\','💽',678,95,[['MAME_Complete_ROM/','384.8 GB']]),
  mk(401,'ScummVM Adventure Games Complete Archive','124.6 GB',124.6,'V:\\Software\\ScummVM\\','💽',534,75,[['ScummVM_Games/','124.6 GB']]),
  mk(402,'Early PC Shareware Collection 1980s-1990s','48.4 GB',48.4,'V:\\Software\\Shareware\\','💽',389,54,[['PC_Shareware_1980s-90s/','48.4 GB']]),
  mk(403,'Public Domain Software Collection Complete','28.6 GB',28.6,'V:\\Software\\PD-Software\\','💽',267,37,[['PD_Software_Complete/','28.6 GB']]),
  mk(404,'Vintage Console Emulation Complete Pack','124.8 GB',124.8,'V:\\Software\\Console-Emulation\\','💽',445,62,[['Console_Emulation_Pack/','124.8 GB']]),
  mk(405,'Early Unix Software Archive Bell Labs','18.4 GB',18.4,'V:\\Software\\Unix-Archive\\','💽',312,44,[['Unix_Software_Archive/','18.4 GB']]),
  // ── Radio and audio drama ────────────────────────────────────────
  mk(406,'BBC Radio Archive 1930s-1980s Complete','384.6 GB',384.6,'W:\\Radio\\BBC\\','📻',423,59,[['BBC_Radio_1930s-1980s/','384.6 GB']]),
  mk(407,'NBC Radio Archive 1920s-1960s Complete','284.4 GB',284.4,'W:\\Radio\\NBC\\','📻',345,48,[['NBC_Radio_1920s-1960s/','284.4 GB']]),
  mk(408,'CBS Radio Archive 1930s-1960s Complete','248.6 GB',248.6,'W:\\Radio\\CBS\\','📻',312,44,[['CBS_Radio_1930s-1960s/','248.6 GB']]),
  mk(409,'OTR Old Time Radio Comedy Complete Archive','184.8 GB',184.8,'W:\\Radio\\OTR-Comedy\\','📻',489,68,[['OTR_Comedy_Complete/','184.8 GB']]),
  mk(410,'OTR Mystery Theater Complete Archive','164.4 GB',164.4,'W:\\Radio\\OTR-Mystery\\','📻',445,62,[['OTR_Mystery_Complete/','164.4 GB']]),
  mk(411,'OTR Science Fiction Radio Dramas Archive','84.6 GB',84.6,'W:\\Radio\\OTR-SciFi\\','📻',378,53,[['OTR_SciFi_Archive/','84.6 GB']]),
  mk(412,'OTR Western Radio Programs Complete Archive','124.4 GB',124.4,'W:\\Radio\\OTR-Western\\','📻',312,44,[['OTR_Western_Complete/','124.4 GB']]),
  mk(413,'OTR Horror Radio Dramas Collection','64.8 GB',64.8,'W:\\Radio\\OTR-Horror\\','📻',289,40,[['OTR_Horror_Collection/','64.8 GB']]),
  mk(414,'Radio Free Europe Archive 1950s-1980s','184.6 GB',184.6,'W:\\Radio\\RFE\\','📻',234,33,[['RFE_Archive/','184.6 GB']]),
  mk(415,'Voice of America Archive 1942-1980','148.4 GB',148.4,'W:\\Radio\\VOA\\','📻',245,34,[['VOA_Archive/','148.4 GB']]),
  mk(416,'Armed Forces Radio Service Archive','84.6 GB',84.6,'W:\\Radio\\AFRS\\','📻',189,26,[['AFRS_Archive/','84.6 GB']]),
  mk(417,'Radio Caroline Pirate Radio Archive','48.4 GB',48.4,'W:\\Radio\\Caroline\\','📻',289,40,[['RadioCaroline_Archive/','48.4 GB']]),
  mk(418,'Shortwave Radio Recordings Archive 1940s-1990s','124.6 GB',124.6,'W:\\Radio\\Shortwave\\','📻',212,30,[['Shortwave_1940s-1990s/','124.6 GB']]),
  mk(419,'Presidential Speeches Complete Archive 1900-2000','18.4 GB',18.4,'W:\\Radio\\Speeches\\','📻',534,75,[['Presidential_Speeches/','18.4 GB']]),
  mk(420,'WPA Oral History Project Complete Archive','48.6 GB',48.6,'W:\\Radio\\WPA\\','📻',312,44,[['WPA_OralHistory/','48.6 GB']]),
  mk(421,'Studs Terkel Radio Collection Complete','84.4 GB',84.4,'W:\\Radio\\SturdsTerkel\\','📻',389,54,[['SterdsTerkel_Radio/','84.4 GB']]),
  mk(422,'Fresh Air NPR Archive 1987-2000','64.8 GB',64.8,'W:\\Radio\\FreshAir\\','📻',445,62,[['FreshAir_1987-2000/','64.8 GB']]),
  mk(423,'This American Life Archive 1995-2010','82.4 GB',82.4,'W:\\Radio\\TAL\\','📻',489,68,[['TAL_1995-2010/','82.4 GB']]),
  mk(424,'Pacifica Radio Archive Complete Collection','184.6 GB',184.6,'W:\\Radio\\Pacifica\\','📻',312,44,[['Pacifica_Archive/','184.6 GB']]),
  mk(425,'Literary Readings Archive 1950s-1980s','48.4 GB',48.4,'W:\\Radio\\Literary\\','📻',267,37,[['Literary_Readings/','48.4 GB']]),
  mk(426,'Oral History Collection American Life Complete','84.6 GB',84.6,'W:\\Radio\\OralHistory\\','📻',289,40,[['OralHistory_AmericanLife/','84.6 GB']]),
  mk(427,'OTR Adventure Programs Complete Archive','104.8 GB',104.8,'W:\\Radio\\OTR-Adventure\\','📻',256,36,[['OTR_Adventure_Complete/','104.8 GB']]),
  // ── Academic and scientific ──────────────────────────────────────
  mk(428,'MIT OpenCourseWare Complete Archive 2001-2020','284.6 GB',284.6,'R:\\Academic\\MIT-OCW\\','🔬',534,75,[['MIT_OCW_Complete/','284.6 GB']]),
  mk(429,'Stanford Engineering Lectures Archive','124.4 GB',124.4,'R:\\Academic\\Stanford\\','🔬',445,62,[['Stanford_Lectures/','124.4 GB']]),
  mk(430,'Harvard Open Learning Collection Complete','148.6 GB',148.6,'R:\\Academic\\Harvard\\','🔬',412,58,[['Harvard_OpenLearning/','148.6 GB']]),
  mk(431,'Yale Open Courses Complete Archive','112.4 GB',112.4,'R:\\Academic\\Yale\\','🔬',378,53,[['Yale_OpenCourses/','112.4 GB']]),
  mk(432,'Berkeley Webcast Lectures Archive 2001-2020','184.8 GB',184.8,'R:\\Academic\\Berkeley\\','🔬',356,50,[['Berkeley_Webcasts/','184.8 GB']]),
  mk(433,'Feynman Physics Lectures Complete Collection','18.4 GB',18.4,'R:\\Academic\\Feynman\\','🔬',712,100,[['Feynman_Lectures_Complete/','18.4 GB']]),
  mk(434,'Carl Sagan Cosmos and Lectures Archive','28.6 GB',28.6,'R:\\Academic\\Sagan\\','🔬',623,87,[['Sagan_Complete/','28.6 GB']]),
  mk(435,'Richard Feynman Messenger Lectures Video','12.4 GB',12.4,'R:\\Academic\\Feynman-Messenger\\','🔬',678,95,[['Feynman_Messenger_Video/','12.4 GB']]),
  mk(436,'NASA Technical Reports Server Complete Archive','484.6 GB',484.6,'R:\\Academic\\NASA-Tech\\','🔬',534,75,[['NASA_Tech_Reports/','484.6 GB']]),
  mk(437,'NACA Research Memoranda Archive 1915-1958','124.8 GB',124.8,'R:\\Academic\\NACA\\','🔬',445,62,[['NACA_Research/','124.8 GB']]),
  mk(438,'JPL Technical Reports Archive Complete','84.6 GB',84.6,'R:\\Academic\\JPL\\','🔬',389,54,[['JPL_Tech_Reports/','84.6 GB']]),
  mk(439,'Bell Labs Technical Journal Complete 1922-1983','184.4 GB',184.4,'R:\\Academic\\BellLabs\\','🔬',489,68,[['BellLabs_Journal_Complete/','184.4 GB']]),
  mk(440,'IBM Research Reports Archive 1957-1995','124.6 GB',124.6,'R:\\Academic\\IBM-Research\\','🔬',312,44,[['IBM_Research_Archive/','124.6 GB']]),
  mk(441,'RAND Corporation Reports Archive 1948-1990','168.4 GB',168.4,'R:\\Academic\\RAND\\','🔬',289,40,[['RAND_Reports/','168.4 GB']]),
  mk(442,'arXiv Physics Preprints 1991-2005 Mirror','284.8 GB',284.8,'R:\\Academic\\arXiv-Physics\\','🔬',534,75,[['arXiv_Physics_1991-2005/','284.8 GB']]),
  mk(443,'arXiv Mathematics Preprints 1992-2005 Mirror','184.6 GB',184.6,'R:\\Academic\\arXiv-Math\\','🔬',489,68,[['arXiv_Math_1992-2005/','184.6 GB']]),
  mk(444,'arXiv Computer Science Preprints 1993-2005','148.4 GB',148.4,'R:\\Academic\\arXiv-CS\\','🔬',456,64,[['arXiv_CS_1993-2005/','148.4 GB']]),
  mk(445,'PubMed Open Access Articles Archive','384.6 GB',384.6,'R:\\Academic\\PubMed\\','🔬',423,59,[['PubMed_OA_Archive/','384.6 GB']]),
  mk(446,'JSTOR Early Journal Content Archive','284.8 GB',284.8,'R:\\Academic\\JSTOR\\','🔬',389,54,[['JSTOR_Early_Content/','284.8 GB']]),
  mk(447,'Philosophical Transactions Royal Society 1665-1900','64.6 GB',64.6,'R:\\Academic\\Phil-Trans\\','🔬',345,48,[['Phil_Trans_1665-1900/','64.6 GB']]),
  mk(448,'Nature Magazine Archive 1869-1980','184.4 GB',184.4,'R:\\Academic\\Nature\\','🔬',312,44,[['Nature_1869-1980/','184.4 GB']]),
  mk(449,'Science Magazine Archive 1880-1980','168.6 GB',168.6,'R:\\Academic\\Science-Mag\\','🔬',289,40,[['Science_1880-1980/','168.6 GB']]),
  mk(450,'Physical Review Archive 1893-1970 APS','248.4 GB',248.4,'R:\\Academic\\PhysRev\\','🔬',356,50,[['PhysRev_1893-1970/','248.4 GB']]),
  mk(451,'Proceedings National Academy Sciences 1915-1980','148.6 GB',148.6,'R:\\Academic\\PNAS\\','🔬',312,44,[['PNAS_1915-1980/','148.6 GB']]),
  mk(452,'Journal ACM Archive 1954-1990 Complete','48.4 GB',48.4,'R:\\Academic\\JACM\\','🔬',289,40,[['JACM_1954-1990/','48.4 GB']]),
  mk(453,'IEEE Annals History of Computing Archive','38.6 GB',38.6,'R:\\Academic\\IEEE-Annals\\','🔬',267,37,[['IEEE_Annals/','38.6 GB']]),
  mk(454,'American Mathematical Monthly Archive 1894-1970','84.4 GB',84.4,'R:\\Academic\\AMM\\','🔬',234,33,[['AMM_1894-1970/','84.4 GB']]),
  mk(455,'Annals of Mathematics Archive 1884-1970','68.6 GB',68.6,'R:\\Academic\\AnnalsMath\\','🔬',245,34,[['AnnalsMath_1884-1970/','68.6 GB']]),
  mk(456,'American Journal of Physics Archive 1933-1980','48.4 GB',48.4,'R:\\Academic\\AJP\\','🔬',289,40,[['AJP_1933-1980/','48.4 GB']]),
  mk(457,'Astronomical Journal Archive 1849-1980','84.6 GB',84.6,'R:\\Academic\\AJ\\','🔬',312,44,[['AJ_1849-1980/','84.6 GB']]),
  mk(458,'Astrophysical Journal Archive 1895-1980','124.4 GB',124.4,'R:\\Academic\\ApJ\\','🔬',289,40,[['ApJ_1895-1980/','124.4 GB']]),
  mk(459,'Journal Chemical Society Archive 1847-1970','84.8 GB',84.8,'R:\\Academic\\JCS\\','🔬',256,36,[['JCS_1847-1970/','84.8 GB']]),
  mk(460,'American Chemical Society Complete Archive','184.6 GB',184.6,'R:\\Academic\\ACS\\','🔬',289,40,[['ACS_Archive/','184.6 GB']]),
  mk(461,'Biochemical Journal Archive 1906-1970','68.4 GB',68.4,'R:\\Academic\\BiochemJ\\','🔬',234,33,[['BiochemJ_1906-1970/','68.4 GB']]),
  mk(462,'Cold Spring Harbor Symposia Complete Archive','48.6 GB',48.6,'R:\\Academic\\CSH\\','🔬',267,37,[['CSH_Symposia/','48.6 GB']]),
  mk(463,'Genetics Journal Archive 1916-1970','38.4 GB',38.4,'R:\\Academic\\Genetics\\','🔬',245,34,[['Genetics_1916-1970/','38.4 GB']]),
  mk(464,'Evolution Journal Archive 1947-1980','32.6 GB',32.6,'R:\\Academic\\Evolution\\','🔬',234,33,[['Evolution_1947-1980/','32.6 GB']]),
  mk(465,'Ecology Journal Archive 1920-1970','28.4 GB',28.4,'R:\\Academic\\Ecology\\','🔬',212,30,[['Ecology_1920-1970/','28.4 GB']]),
  mk(466,'American Naturalist Archive 1867-1970','64.6 GB',64.6,'R:\\Academic\\AmNaturalist\\','🔬',245,34,[['AmNaturalist_1867-1970/','64.6 GB']]),
  mk(467,'Smithsonian Contributions to Knowledge Archive','84.4 GB',84.4,'R:\\Academic\\Smithsonian-Contrib\\','🔬',289,40,[['Smithsonian_Contrib/','84.4 GB']]),
  mk(468,'Geological Society of America Archive','68.6 GB',68.6,'R:\\Academic\\GSA\\','🔬',234,33,[['GSA_Archive/','68.6 GB']]),
  mk(469,'American Geophysical Union Archive','48.4 GB',48.4,'R:\\Academic\\AGU\\','🔬',212,30,[['AGU_Archive/','48.4 GB']]),
  mk(470,'USGS Topographic Maps Historical Archive','384.8 GB',384.8,'R:\\Academic\\USGS\\','🔬',312,44,[['USGS_TopoMaps/','384.8 GB']]),
  mk(471,'NOAA Climate Data Historical Archive','284.6 GB',284.6,'R:\\Academic\\NOAA\\','🔬',289,40,[['NOAA_Climate_Archive/','284.6 GB']]),
  mk(472,'NASA Climate Research Archive','184.4 GB',184.4,'R:\\Academic\\NASA-Climate\\','🔬',312,44,[['NASA_Climate/','184.4 GB']]),
  mk(473,'Manhattan Project Documents Declassified Archive','48.6 GB',48.6,'R:\\Academic\\Manhattan\\','🔬',489,68,[['Manhattan_Project_Docs/','48.6 GB']]),
  mk(474,'Declassified CIA Documents 1947-1980 Archive','84.4 GB',84.4,'R:\\Academic\\CIA-Declassified\\','🔬',445,62,[['CIA_Declassified_1947-1980/','84.4 GB']]),
  mk(475,'Congressional Record 1873-1970 Complete','484.6 GB',484.6,'R:\\Academic\\Congress\\','🔬',267,37,[['Congressional_Record/','484.6 GB']]),
  mk(476,'Supreme Court Decisions 1791-1970 Complete','48.4 GB',48.4,'R:\\Academic\\SCOTUS\\','🔬',356,50,[['SCOTUS_1791-1970/','48.4 GB']]),
  mk(477,'US Patent Office Records 1790-1970 Archive','284.8 GB',284.8,'R:\\Academic\\Patents\\','🔬',312,44,[['USPTO_1790-1970/','284.8 GB']]),
  mk(478,'Census Bureau Historical Data Archive 1790-1970','64.6 GB',64.6,'R:\\Academic\\Census\\','🔬',289,40,[['Census_1790-1970/','64.6 GB']]),
  mk(479,'State Department Foreign Relations Archive FRUS','124.8 GB',124.8,'R:\\Academic\\StateDept\\','🔬',234,33,[['FRUS_Archive/','124.8 GB']]),
  mk(480,'Federal Register Archive 1936-1970 Complete','48.4 GB',48.4,'R:\\Academic\\FedRegister\\','🔬',245,34,[['Federal_Register/','48.4 GB']]),
  mk(481,'NIH Research Archive 1940-1980 Complete','184.6 GB',184.6,'R:\\Academic\\NIH\\','🔬',312,44,[['NIH_Research_1940-1980/','184.6 GB']]),
  mk(482,'CDC Historical Epidemiology Archive','84.4 GB',84.4,'R:\\Academic\\CDC\\','🔬',289,40,[['CDC_Epidemiology/','84.4 GB']]),
  mk(483,'USDA Historical Reports Archive 1862-1970','124.6 GB',124.6,'R:\\Academic\\USDA\\','🔬',234,33,[['USDA_Reports/','124.6 GB']]),
  mk(484,'Albert Einstein Archive Digitized Complete','28.4 GB',28.4,'R:\\Academic\\Einstein\\','🔬',623,87,[['Einstein_Archive/','28.4 GB']]),
  mk(485,'Niels Bohr Archive Digitized Complete','18.6 GB',18.6,'R:\\Academic\\Bohr\\','🔬',489,68,[['Bohr_Archive/','18.6 GB']]),
  mk(486,'Marie Curie Papers Archive Digitized','12.4 GB',12.4,'R:\\Academic\\Curie\\','🔬',534,75,[['Curie_Papers/','12.4 GB']]),
  mk(487,'Darwin Correspondence Complete Archive','8.6 GB',8.6,'R:\\Academic\\Darwin\\','🔬',489,68,[['Darwin_Correspondence/','8.6 GB']]),
  mk(488,'Newton Papers Digital Archive Complete','14.4 GB',14.4,'R:\\Academic\\Newton\\','🔬',512,72,[['Newton_Papers/','14.4 GB']]),
  mk(489,'Los Alamos Pre-Print Archive Physics','284.6 GB',284.6,'R:\\Academic\\LANL\\','🔬',345,48,[['LANL_Preprints/','284.6 GB']]),
  mk(490,'MIT AI Lab Technical Reports 1959-2000','48.4 GB',48.4,'R:\\Academic\\MIT-AI-Lab\\','🔬',389,54,[['MIT_AI_Lab_Reports/','48.4 GB']]),
  mk(491,'Stanford Linear Accelerator SLAC Reports','84.6 GB',84.6,'R:\\Academic\\SLAC\\','🔬',312,44,[['SLAC_Reports/','84.6 GB']]),
  mk(492,'Oceanography Complete Journal Archive','64.4 GB',64.4,'R:\\Academic\\Oceanography\\','🔬',212,30,[['Oceanography_Archive/','64.4 GB']]),
  mk(493,'Meteorological Office Research Archive 1850-1980','84.8 GB',84.8,'R:\\Academic\\Meteorology\\','🔬',234,33,[['Meteorology_Archive/','84.8 GB']]),
  mk(494,'National Geographic Research Archive Complete','124.6 GB',124.6,'R:\\Academic\\NatGeo-Research\\','🔬',356,50,[['NatGeo_Research/','124.6 GB']]),
  mk(495,'FDA Historical Documents Archive 1930-1980','48.4 GB',48.4,'R:\\Academic\\FDA\\','🔬',245,34,[['FDA_Historical/','48.4 GB']]),
  mk(496,'EPA Historical Research Archive 1970-1990','38.6 GB',38.6,'R:\\Academic\\EPA\\','🔬',234,33,[['EPA_Historical/','38.6 GB']]),
  mk(497,'NSA Historical Documents Archive Declassified','28.4 GB',28.4,'R:\\Academic\\NSA-Declassified\\','🔬',312,44,[['NSA_Historical/','28.4 GB']]),
  mk(498,'Icarus Planetary Science Journal Archive','42.6 GB',42.6,'R:\\Academic\\Icarus\\','🔬',267,37,[['Icarus_Archive/','42.6 GB']]),
  mk(499,'Journal of Biological Chemistry Archive','84.4 GB',84.4,'R:\\Academic\\JBC\\','🔬',234,33,[['JBC_Archive/','84.4 GB']]),
  mk(500,'Communications of the ACM Archive 1958-1990','38.6 GB',38.6,'R:\\Academic\\CACM\\','🔬',289,40,[['CACM_1958-1990/','38.6 GB']]),
  mk(501,'Mathematical Reviews Archive 1940-1970','28.4 GB',28.4,'R:\\Academic\\MathReviews\\','🔬',212,30,[['MathReviews_1940-1970/','28.4 GB']]),
  mk(502,'US Bureau of Labor Statistics Historical Archive','48.6 GB',48.6,'R:\\Academic\\BLS\\','🔬',234,33,[['BLS_Historical/','48.6 GB']]),
  mk(503,'NOAA National Weather Service Historical Data','184.8 GB',184.8,'R:\\Academic\\NWS\\','🔬',267,37,[['NWS_Historical/','184.8 GB']]),
  mk(504,'Annals of Statistics Archive 1930-1980','32.4 GB',32.4,'R:\\Academic\\AnnalsStats\\','🔬',212,30,[['AnnalsStats/','32.4 GB']]),
  mk(505,'American Sociological Review Archive 1936-1980','48.6 GB',48.6,'R:\\Academic\\ASR\\','🔬',234,33,[['ASR_1936-1980/','48.6 GB']]),
  mk(506,'American Economic Review Archive 1911-1980','64.4 GB',64.4,'R:\\Academic\\AER\\','🔬',245,34,[['AER_1911-1980/','64.4 GB']]),
  mk(507,'Journal of Political Economy Archive 1892-1980','56.8 GB',56.8,'R:\\Academic\\JPE\\','🔬',234,33,[['JPE_1892-1980/','56.8 GB']]),
  mk(508,'Econometrica Archive 1933-1980','38.4 GB',38.4,'R:\\Academic\\Econometrica\\','🔬',212,30,[['Econometrica_1933-1980/','38.4 GB']]),
  mk(509,'American Historical Review Archive 1895-1980','64.6 GB',64.6,'R:\\Academic\\AHR\\','🔬',234,33,[['AHR_1895-1980/','64.6 GB']]),
  mk(510,'Foreign Affairs Archive 1922-1980','42.4 GB',42.4,'R:\\Academic\\ForeignAffairs\\','🔬',289,40,[['ForeignAffairs_1922-1980/','42.4 GB']]),
  mk(511,'Scientific Reports Archive Pre-Publication','284.6 GB',284.6,'R:\\Academic\\SciReports\\','🔬',312,44,[['SciReports_Archive/','284.6 GB']]),
  mk(512,'UN General Assembly Official Records Archive','84.4 GB',84.4,'R:\\Academic\\UNGA\\','🔬',267,37,[['UNGA_Records/','84.4 GB']]),
  mk(513,'Smithsonian Institution Libraries Archive','124.6 GB',124.6,'R:\\Academic\\Smithsonian-Lib\\','🔬',312,44,[['Smithsonian_Libraries/','124.6 GB']]),
  mk(514,'National Archives Microfilm Publications Archive','284.8 GB',284.8,'R:\\Academic\\NARA\\','🔬',289,40,[['NARA_Microfilm/','284.8 GB']]),
  mk(515,'World Bank Historical Reports Archive','84.6 GB',84.6,'R:\\Academic\\WorldBank\\','🔬',234,33,[['WorldBank_Reports/','84.6 GB']]),
  mk(516,'IMF Historical Publications Archive','68.4 GB',68.4,'R:\\Academic\\IMF\\','🔬',212,30,[['IMF_Historical/','68.4 GB']]),
  mk(517,'WHO Historical Reports Archive 1948-1990','48.6 GB',48.6,'R:\\Academic\\WHO\\','🔬',245,34,[['WHO_Historical/','48.6 GB']]),
  mk(518,'FAO Agricultural Reports Archive 1945-1990','64.4 GB',64.4,'R:\\Academic\\FAO\\','🔬',212,30,[['FAO_Reports/','64.4 GB']]),
  mk(519,'UNEP Environmental Research Archive','42.6 GB',42.6,'R:\\Academic\\UNEP\\','🔬',189,26,[['UNEP_Research/','42.6 GB']]),
  mk(520,'Internet Archive Complete Software Library 2024','1284.6 GB',1284.6,'R:\\Academic\\IA-Software\\','🔬',623,87,[['IA_Software_Library_2024/','1284.6 GB']]),
  mk(521,'Archive.org Complete Metadata Snapshot 2024','284.8 GB',284.8,'R:\\Academic\\IA-Metadata\\','🔬',489,68,[['IA_Metadata_2024/','284.8 GB']]),
];

const CATEGORIES = [
  { name: 'Linux ISOs',  color: '#f97316' },
  { name: 'Games',       color: '#a855f7' },
  { name: 'Movies',      color: '#3b82f6' },
  { name: 'TV Shows',    color: '#14b8a6' },
  { name: 'Archive.org', color: '#f59e0b' },
];

function fmtSpeed(kbs: number): string {
  if (kbs === 0) return '—';
  if (kbs < 1024) return `${kbs} KB/s`;
  return `${(kbs / 1024).toFixed(1)} MB/s`;
}

function statusClass(s: TorrentStatus): string {
  return `qbt-status-${s}`;
}

function statusLabel(s: TorrentStatus): string {
  if (s === 'seeding')     return 'Seeding';
  if (s === 'downloading') return 'Downloading';
  return 'Paused';
}

function randVariance(base: number, variance: number): number {
  return Math.round(base + (Math.random() - 0.5) * 2 * variance);
}

export default function QBittorrent() {
  const [torrents, setTorrents] = useState<Torrent[]>(INITIAL_TORRENTS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterKey>('All');
  const [detailTab, setDetailTab] = useState<DetailTab>('General');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  // Animate download speeds every second
  useEffect(() => {
    const id = setInterval(() => {
      setTorrents(prev => prev.map(t => {
        if (t.status !== 'downloading') return t;
        const newDl = Math.max(100, randVariance(t.dlSpeed || 3000, 800));
        const newUl = Math.max(10, randVariance(t.ulSpeed || 150, 50));
        const newDone = Math.min(100, t.done + 0.05);
        return { ...t, dlSpeed: newDl, ulSpeed: newUl, done: newDone };
      }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pauseTorrent = () => {
    if (!selectedId) { showToast('Select a torrent first'); return; }
    setTorrents(prev => prev.map(t => t.id === selectedId && t.status !== 'paused' ? { ...t, status: 'paused', dlSpeed: 0, ulSpeed: 0 } : t));
  };

  const resumeTorrent = () => {
    if (!selectedId) { showToast('Select a torrent first'); return; }
    setTorrents(prev => prev.map(t => t.id === selectedId && t.status === 'paused' ? { ...t, status: t.done === 100 ? 'seeding' : 'downloading', dlSpeed: t.done < 100 ? 2500 : 0, ulSpeed: 80 } : t));
  };

  const deleteTorrent = () => {
    if (!selectedId) { showToast('Select a torrent first'); return; }
    const t = torrents.find(x => x.id === selectedId);
    if (t) { setTorrents(prev => prev.filter(x => x.id !== selectedId)); setSelectedId(null); showToast(`Removed: ${t.name}`); }
  };

  const filteredTorrents = torrents.filter(t => {
    if (filter === 'All')         return true;
    if (filter === 'Downloading') return t.status === 'downloading';
    if (filter === 'Seeding')     return t.status === 'seeding';
    if (filter === 'Paused')      return t.status === 'paused';
    if (filter === 'Completed')   return t.done === 100;
    // category filter
    return t.category === filter;
  });

  const counts = {
    All:         torrents.length,
    Downloading: torrents.filter(t => t.status === 'downloading').length,
    Seeding:     torrents.filter(t => t.status === 'seeding').length,
    Paused:      torrents.filter(t => t.status === 'paused').length,
    Completed:   torrents.filter(t => t.done === 100).length,
  };

  const selected = torrents.find(t => t.id === selectedId) ?? null;

  const totalDl = torrents.reduce((s, t) => s + t.dlSpeed, 0);
  const totalUl = torrents.reduce((s, t) => s + t.ulSpeed, 0);

  const handleRowClick = useCallback((id: number) => {
    setSelectedId(prev => prev === id ? null : id);
  }, []);

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'All',         label: 'All' },
    { key: 'Downloading', label: 'Downloading' },
    { key: 'Seeding',     label: 'Seeding' },
    { key: 'Paused',      label: 'Paused' },
    { key: 'Completed',   label: 'Completed' },
  ];

  return (
    <div className="qbt-root">
      {toast && <div style={{ position: 'absolute', top: 6, right: 6, background: '#1a1a2e', color: '#e0e0e0', padding: '5px 12px', borderRadius: 4, fontSize: 11, zIndex: 100, border: '1px solid #444', maxWidth: 360 }}>{toast}</div>}

      {/* ── Toolbar ── */}
      <div className="qbt-toolbar">
        <button className="qbt-toolbar-btn" title="Add Torrent" onClick={() => showToast('Add Torrent — drag a .torrent file here')}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M9 2a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H4a1 1 0 1 1 0-2h4V3a1 1 0 0 1 1-1z"/>
          </svg>
          Add Torrent
        </button>
        <button className="qbt-toolbar-btn" title="Add Magnet Link" onClick={() => showToast('Add Magnet Link — paste a magnet:// URI')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 15A6 6 0 1 0 18 9"/>
            <path d="M6 15v3m6-9v3m6-3v3"/>
          </svg>
          Add Magnet
        </button>
        <div className="qbt-toolbar-sep" />
        <button className="qbt-toolbar-btn" title="Pause" onClick={pauseTorrent}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <rect x="4" y="3" width="4" height="12" rx="1"/>
            <rect x="10" y="3" width="4" height="12" rx="1"/>
          </svg>
          Pause
        </button>
        <button className="qbt-toolbar-btn" title="Resume" onClick={resumeTorrent}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M5 3l11 6-11 6V3z"/>
          </svg>
          Resume
        </button>
        <div className="qbt-toolbar-sep" />
        <button className="qbt-toolbar-btn" title="Delete" onClick={deleteTorrent}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M7 2h4l1 1h3v2H3V3h3l1-1zm-3 4h10l-1 10H5L4 6zm3 2v6h1V8H7zm3 0v6h1V8h-1z"/>
          </svg>
          Delete
        </button>
        <div className="qbt-toolbar-sep" />
        <button className="qbt-toolbar-btn" title="Move Up">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M9 4l6 7H3l6-7z"/>
          </svg>
          Up Priority
        </button>
        <button className="qbt-toolbar-btn" title="Move Down">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M9 14L3 7h12l-6 7z"/>
          </svg>
          Down Priority
        </button>
      </div>

      {/* ── Main area ── */}
      <div className="qbt-main">

        {/* Sidebar */}
        <div className="qbt-sidebar">
          <div className="qbt-sidebar-section">
            <div className="qbt-sidebar-title">Status</div>
            {FILTERS.map(f => (
              <div
                key={f.key}
                className={`qbt-sidebar-item ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                <span className="qbt-sidebar-item-label">
                  {f.key === 'All'         && <span>🗂</span>}
                  {f.key === 'Downloading' && <span>⬇</span>}
                  {f.key === 'Seeding'     && <span>⬆</span>}
                  {f.key === 'Paused'      && <span>⏸</span>}
                  {f.key === 'Completed'   && <span>✅</span>}
                  {f.label}
                </span>
                <span className="qbt-sidebar-count">{counts[f.key as keyof typeof counts]}</span>
              </div>
            ))}
          </div>
          <div className="qbt-sidebar-section">
            <div className="qbt-sidebar-title">Categories</div>
            {CATEGORIES.map(cat => (
              <div
                key={cat.name}
                className={`qbt-sidebar-item ${filter === cat.name ? 'active' : ''}`}
                onClick={() => setFilter(cat.name)}
              >
                <span className="qbt-sidebar-item-label">
                  <span className="qbt-cat-dot" style={{ background: cat.color }} />
                  {cat.name}
                </span>
                <span className="qbt-sidebar-count">
                  {torrents.filter(t => t.category === cat.name).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Torrent list + detail panel */}
        <div className="qbt-right">

          {/* Torrent table */}
          <div className="qbt-list-wrap">
            <table className="qbt-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th style={{ minWidth: 220 }}>Name</th>
                  <th style={{ width: 72 }}>Size</th>
                  <th style={{ width: 120 }}>Done</th>
                  <th style={{ width: 90 }}>Status</th>
                  <th style={{ width: 50 }}>Seeds</th>
                  <th style={{ width: 50 }}>Peers</th>
                  <th style={{ width: 80 }}>Speed ↓</th>
                  <th style={{ width: 80 }}>Speed ↑</th>
                  <th style={{ width: 70 }}>ETA</th>
                </tr>
              </thead>
              <tbody>
                {filteredTorrents.map((t, idx) => (
                  <tr
                    key={t.id}
                    className={selectedId === t.id ? 'selected' : ''}
                    onClick={() => handleRowClick(t.id)}
                  >
                    <td>{idx + 1}</td>
                    <td title={t.name}>
                      <div className="qbt-name-cell">
                        <span className="qbt-type-icon">{t.typeIcon}</span>
                        <span className="qbt-name-text">{t.name}</span>
                      </div>
                    </td>
                    <td>{t.size}</td>
                    <td>
                      <div className="qbt-done-cell">
                        <div className="qbt-progress-wrap">
                          <div
                            className={`qbt-progress-bar ${t.status}`}
                            style={{ width: `${t.done}%` }}
                          />
                        </div>
                        <span className="qbt-done-pct">{t.done.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className={statusClass(t.status)}>{statusLabel(t.status)}</td>
                    <td style={{ color: t.seeds > 0 ? '#4ade80' : '#666' }}>{t.seeds}</td>
                    <td style={{ color: t.peers > 0 ? '#60a5fa' : '#666' }}>{t.peers}</td>
                    <td style={{ color: t.dlSpeed > 0 ? '#60a5fa' : '#666' }}>{fmtSpeed(t.dlSpeed)}</td>
                    <td style={{ color: t.ulSpeed > 0 ? '#4ade80' : '#666' }}>{fmtSpeed(t.ulSpeed)}</td>
                    <td style={{ color: '#aaa' }}>{t.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          <div className="qbt-detail-panel">
            <div className="qbt-detail-tabs">
              {(['General', 'Trackers', 'Peers', 'Content'] as DetailTab[]).map(tab => (
                <button
                  key={tab}
                  className={`qbt-detail-tab ${detailTab === tab ? 'active' : ''}`}
                  onClick={() => setDetailTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="qbt-detail-body">
              {!selected ? (
                <div className="qbt-detail-empty">Select a torrent to view details</div>
              ) : (
                <>
                  {detailTab === 'General' && (
                    <div className="qbt-detail-grid">
                      <span className="qbt-detail-label">Save Path:</span>
                      <span className="qbt-detail-value">{selected.savePath}</span>
                      <span className="qbt-detail-label">Added:</span>
                      <span className="qbt-detail-value">{selected.added}</span>

                      <span className="qbt-detail-label">Total Size:</span>
                      <span className="qbt-detail-value">{selected.size}</span>
                      <span className="qbt-detail-label">Category:</span>
                      <span className="qbt-detail-value">{selected.category}</span>

                      <span className="qbt-detail-label">Downloaded:</span>
                      <span className="qbt-detail-value">
                        {(selected.sizeBytes * selected.done / 100 / 1073741824).toFixed(2)} GiB
                      </span>
                      <span className="qbt-detail-label">Ratio:</span>
                      <span className="qbt-detail-value">
                        {selected.status === 'seeding' ? (Math.random() * 2 + 1).toFixed(3) : '0.000'}
                      </span>

                      <span className="qbt-detail-label">Status:</span>
                      <span className={`qbt-detail-value ${statusClass(selected.status)}`}>
                        {statusLabel(selected.status)}
                      </span>
                      <span className="qbt-detail-label">Seeds:</span>
                      <span className="qbt-detail-value">{selected.seeds} ({selected.seeds} total)</span>

                      <span className="qbt-detail-label">Hash:</span>
                      <span className="qbt-detail-value" style={{ fontFamily: 'monospace', fontSize: '10px', gridColumn: '2 / 5' }}>
                        {selected.hash}
                      </span>
                    </div>
                  )}

                  {detailTab === 'Trackers' && (
                    <div className="qbt-trackers-list">
                      <div className="qbt-tracker-row">
                        <span className="qbt-tracker-url">{selected.tracker}</span>
                        <span className="qbt-tracker-stat" style={{ color: '#4ade80' }}>Working</span>
                        <span className="qbt-tracker-stat">{selected.seeds} seeds</span>
                      </div>
                      <div className="qbt-tracker-row">
                        <span className="qbt-tracker-url">udp://tracker.coppersurfer.tk:6969/announce</span>
                        <span className="qbt-tracker-stat" style={{ color: '#4ade80' }}>Working</span>
                        <span className="qbt-tracker-stat">{Math.floor(selected.seeds * 0.7)} seeds</span>
                      </div>
                      <div className="qbt-tracker-row">
                        <span className="qbt-tracker-url">udp://9.rarbg.to:2920/announce</span>
                        <span className="qbt-tracker-stat" style={{ color: '#f59e0b' }}>Not contacted</span>
                        <span className="qbt-tracker-stat">—</span>
                      </div>
                      <div className="qbt-tracker-row">
                        <span className="qbt-tracker-url">udp://tracker.internetwarriors.net:1337/announce</span>
                        <span className="qbt-tracker-stat" style={{ color: '#f87171' }}>Not working</span>
                        <span className="qbt-tracker-stat">—</span>
                      </div>
                    </div>
                  )}

                  {detailTab === 'Peers' && (
                    <table className="qbt-peers-table">
                      <thead>
                        <tr>
                          <th>IP</th>
                          <th>Port</th>
                          <th>Client</th>
                          <th>Progress</th>
                          <th>Down Speed</th>
                          <th>Up Speed</th>
                          <th>Flags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.peers > 0 ? (
                          Array.from({ length: Math.min(selected.peers, 6) }, (_, i) => (
                            <tr key={i}>
                              <td style={{ fontFamily: 'monospace' }}>
                                {`${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`}
                              </td>
                              <td>{Math.floor(Math.random() * 40000 + 10000)}</td>
                              <td style={{ color: '#aaa' }}>
                                {['qBittorrent 4.6.2', 'µTorrent 3.5.5', 'Transmission 4.0', 'Deluge 2.1', 'rTorrent 0.9.8', 'Vuze 5.7'][i % 6]}
                              </td>
                              <td>{(Math.random() * 80 + 10).toFixed(1)}%</td>
                              <td style={{ color: '#60a5fa' }}>{fmtSpeed(Math.floor(Math.random() * 500 + 50))}</td>
                              <td style={{ color: '#4ade80' }}>{fmtSpeed(Math.floor(Math.random() * 200 + 20))}</td>
                              <td style={{ color: '#888' }}>D</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} style={{ color: '#666', textAlign: 'center', padding: '12px' }}>
                              No connected peers
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {detailTab === 'Content' && (
                    <table className="qbt-content-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Size</th>
                          <th>Progress</th>
                          <th>Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.files.map((f, i) => (
                          <tr key={i}>
                            <td>{f.name}</td>
                            <td>{f.size}</td>
                            <td>
                              <div className="qbt-done-cell">
                                <div className="qbt-progress-wrap" style={{ width: 60 }}>
                                  <div
                                    className={`qbt-progress-bar ${selected.status}`}
                                    style={{ width: `${f.progress}%` }}
                                  />
                                </div>
                                <span>{f.progress}%</span>
                              </div>
                            </td>
                            <td style={{ color: f.priority === 'High' ? '#f59e0b' : '#888' }}>{f.priority}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="qbt-statusbar">
        <span className="qbt-statusbar-item">
          <span className="label">DHT:</span>
          <span className="val" style={{ color: '#4ade80' }}>●</span>
          <span className="val">2,847 nodes</span>
        </span>
        <span className="qbt-statusbar-sep">|</span>
        <span className="qbt-statusbar-item">
          <span className="label">↓</span>
          <span className="val" style={{ color: '#60a5fa' }}>{fmtSpeed(totalDl)}</span>
        </span>
        <span className="qbt-statusbar-item">
          <span className="label">↑</span>
          <span className="val" style={{ color: '#4ade80' }}>{fmtSpeed(totalUl)}</span>
        </span>
        <span className="qbt-statusbar-sep">|</span>
        <span className="qbt-statusbar-item">
          <span className="label">Free space:</span>
          <span className="val">324.8 GB</span>
        </span>
        <span className="qbt-statusbar-sep">|</span>
        <span className="qbt-statusbar-item">
          <span className="label">Torrents:</span>
          <span className="val">{filteredTorrents.length} shown / {torrents.length} total</span>
        </span>
      </div>
    </div>
  );
}
