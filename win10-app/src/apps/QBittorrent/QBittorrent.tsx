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
