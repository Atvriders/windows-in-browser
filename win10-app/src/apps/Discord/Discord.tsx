import { useState, useRef, useEffect } from 'react';
import './Discord.css';

interface Channel { id: string; name: string; type: 'text' | 'voice' | 'category'; }
interface Message { id: string; user: string; avatar: string; text: string; time: string; replyTo?: string; }
interface Server { id: string; icon: string; name: string; unread?: number; }
interface DmUser { name: string; avatar: string; status: 'online' | 'idle' | 'dnd' | 'offline'; game?: string; unread?: number; }
interface HLMember { name: string; avatar: string; status: 'online' | 'idle' | 'dnd' | 'offline'; badge?: string; activity?: string; }
interface VoiceMember { name: string; badge?: string; live?: boolean; muted?: boolean; }

// ─── homelab. voice channel members ──────────────────────────────────────────
const HL_VOICE_MEMBERS: Record<string, VoiceMember[]> = {
  'hl-vc-general': [
    { name: 'ATV', badge: 'HMLB', live: true },
    { name: 'Monkay [128 CPUs 720GB RAM...]', badge: 'HMLB' },
    { name: 'Phantom | PowerEdging', badge: 'HMLB' },
    { name: 'TCC (120T, 192GB, 143TB)', badge: 'BA' },
    { name: 'Test001 (KR4DJZ)' },
  ],
};

// ─── homelab. member sidebar ─────────────────────────────────────────────────
const HL_MEMBER_GROUPS: { label: string; members: HLMember[] }[] = [
  { label: 'Activity — 2', members: [
    { name: 'Skynet', avatar: '🤖', status: 'online' },
    { name: 'LabBot', avatar: '🤖', status: 'online', badge: 'APP' },
  ]},
  { label: 'Moderators — 5', members: [
    { name: 'Barracuda |dear...', avatar: '🦈', status: 'online', badge: 'HMLB' },
    { name: 'BP-Santo', avatar: '💙', status: 'online', activity: '"Once you can accept the universe..."' },
    { name: 'Phantom | PowerEdging', avatar: '👻', status: 'online', badge: 'HMLB', activity: 'YouTube Music  +1' },
    { name: 'portalBlock', avatar: '🟦', status: 'online' },
    { name: 'Romstik I...', avatar: '🟣', status: 'online', badge: 'PTN' },
  ]},
  { label: 'Reddit Mods — 2', members: [
    { name: 'Schwiing', avatar: '⚡', status: 'online', badge: 'HMLB' },
    { name: 'Danish', avatar: '🇺🇦', status: 'online', activity: 'Slava Ukraini!' },
  ]},
  { label: 'ONLINE — 12', members: [
    { name: 'CON CAC', avatar: '🏔️', status: 'online' },
    { name: 'Dash | AmourAmis', avatar: '🐱', status: 'online', activity: 'Excessively meowing' },
    { name: 'Erik I suffering from sv...', avatar: '😰', status: 'online' },
    { name: 'H1 | No More Computing', avatar: '🔺', status: 'online', badge: 'HMLB' },
    { name: 'Monkay', avatar: '🐒', status: 'online', badge: 'HMLB' },
    { name: 'Ruby (HPE/Cisco Simp)', avatar: '🔴', status: 'online' },
    { name: 'TCC', avatar: '💾', status: 'online', badge: 'BA' },
    { name: 'Atvriders', avatar: '🐱', status: 'online', badge: 'HMLB', activity: 'Sharing their screen' },
    { name: 'Test001 (KR4DJZ)', avatar: '🧪', status: 'online' },
    { name: 'portalBlock', avatar: '🟦', status: 'idle' },
    { name: 'Skynet_Observer', avatar: '🛸', status: 'idle' },
    { name: 'NUTSoverNAS', avatar: '🥜', status: 'dnd' },
  ]},
];

const SERVERS: Server[] = [
  { id: 'homelab', icon: '🖥️', name: 'homelab.', unread: 16 },
  { id: 'friends', icon: '👥', name: 'Friends Zone', unread: 3 },
  { id: 'gaming', icon: '🎮', name: 'Gaming Hub', unread: 12 },
  { id: 'dev', icon: '💻', name: 'Dev Community', unread: 1 },
  { id: 'anime', icon: '🌸', name: 'Anime & Manga' },
  { id: 'music', icon: '🎵', name: 'Music Lovers' },
  { id: 'movies', icon: '🎬', name: 'Film & TV' },
  { id: 'crypto', icon: '💰', name: 'Crypto Talk', unread: 5 },
  { id: 'art', icon: '🎨', name: 'Art & Design' },
  { id: 'science', icon: '🔬', name: 'Science Hub' },
  { id: 'sports', icon: '⚽', name: 'Sports Chat' },
  { id: 'memes', icon: '😂', name: 'Meme Factory' },
  { id: 'lofi', icon: '☕', name: 'Lofi & Chill' },
];

const CHANNELS: Record<string, Channel[]> = {
  homelab: [
    { id: 'c_hl_info', name: 'INFORMATION', type: 'category' },
    { id: 'hl-rules', name: 'rules', type: 'text' },
    { id: 'hl-announcements', name: 'announcements', type: 'text' },
    { id: 'hl-roles', name: 'roles', type: 'text' },
    { id: 'hl-partner-list', name: 'partner-list', type: 'text' },
    { id: 'c_hl_main', name: 'HOMELAB', type: 'category' },
    { id: 'hl-general', name: 'general', type: 'text' },
    { id: 'hl-feed', name: 'homelabfeed', type: 'text' },
    { id: 'hl-sales', name: 'homelabsalesfeed', type: 'text' },
    { id: 'hl-showcase', name: 'showcase', type: 'text' },
    { id: 'hl-questions', name: 'questions', type: 'text' },
    { id: 'hl-projects', name: 'projects', type: 'text' },
    { id: 'c_hl_tech', name: 'SPECIFIC TECH', type: 'category' },
    { id: 'hl-networking', name: 'networking', type: 'text' },
    { id: 'hl-selfhost', name: 'self-hosting', type: 'text' },
    { id: 'hl-proxmox', name: 'proxmox', type: 'text' },
    { id: 'hl-docker', name: 'docker', type: 'text' },
    { id: 'hl-unraid', name: 'unraid', type: 'text' },
    { id: 'hl-truenas', name: 'truenas', type: 'text' },
    { id: 'hl-3dprint', name: '3d-printing', type: 'text' },
    { id: 'c_hl_events', name: 'Community Events', type: 'category' },
    { id: 'hl-game-sunday', name: 'game-sunday-01', type: 'text' },
    { id: 'c_hl_voice', name: 'Voice', type: 'category' },
    { id: 'hl-vc-general', name: 'General Voice', type: 'voice' },
    { id: 'hl-vc-general2', name: 'General Voice (Deux)', type: 'voice' },
    { id: 'hl-vc-general3', name: 'General Voice (≡)', type: 'voice' },
    { id: 'hl-vc-afk', name: 'AFK', type: 'voice' },
  ],
  friends: [
    { id: 'c_info', name: 'INFORMATION', type: 'category' },
    { id: 'rules', name: 'rules', type: 'text' },
    { id: 'announcements', name: 'announcements', type: 'text' },
    { id: 'c_general', name: 'GENERAL', type: 'category' },
    { id: 'general', name: 'general', type: 'text' },
    { id: 'memes', name: 'memes', type: 'text' },
    { id: 'photos', name: 'photos', type: 'text' },
    { id: 'random', name: 'random', type: 'text' },
    { id: 'c_gaming', name: 'GAMING', type: 'category' },
    { id: 'gaming-chat', name: 'gaming-chat', type: 'text' },
    { id: 'lfg', name: 'looking-for-group', type: 'text' },
    { id: 'clips', name: 'clips-and-highlights', type: 'text' },
    { id: 'c_voice', name: 'VOICE CHANNELS', type: 'category' },
    { id: 'vc-main', name: 'Main VC', type: 'voice' },
    { id: 'vc-gaming', name: 'Gaming VC', type: 'voice' },
    { id: 'vc-music', name: 'Music VC', type: 'voice' },
    { id: 'vc-afk', name: 'AFK', type: 'voice' },
  ],
  gaming: [
    { id: 'c_info', name: 'SERVER INFO', type: 'category' },
    { id: 'announcements', name: 'announcements', type: 'text' },
    { id: 'rules', name: 'rules', type: 'text' },
    { id: 'roles', name: 'self-roles', type: 'text' },
    { id: 'c_general', name: 'GENERAL', type: 'category' },
    { id: 'general', name: 'general', type: 'text' },
    { id: 'off-topic', name: 'off-topic', type: 'text' },
    { id: 'news', name: 'gaming-news', type: 'text' },
    { id: 'deals', name: 'game-deals', type: 'text' },
    { id: 'c_fps', name: 'FPS GAMES', type: 'category' },
    { id: 'cs2', name: 'counter-strike-2', type: 'text' },
    { id: 'valorant', name: 'valorant', type: 'text' },
    { id: 'apex', name: 'apex-legends', type: 'text' },
    { id: 'fortnite', name: 'fortnite', type: 'text' },
    { id: 'warzone', name: 'warzone', type: 'text' },
    { id: 'c_rpg', name: 'RPG & STORY', type: 'category' },
    { id: 'rpg', name: 'rpg-discussion', type: 'text' },
    { id: 'elden', name: 'elden-ring', type: 'text' },
    { id: 'bg3', name: 'baldurs-gate-3', type: 'text' },
    { id: 'c_minecraft', name: 'MINECRAFT', type: 'category' },
    { id: 'mc-general', name: 'mc-general', type: 'text' },
    { id: 'mc-builds', name: 'mc-builds', type: 'text' },
    { id: 'mc-redstone', name: 'mc-redstone', type: 'text' },
    { id: 'c_strategy', name: 'STRATEGY', type: 'category' },
    { id: 'civ', name: 'civilization', type: 'text' },
    { id: 'totalwar', name: 'total-war', type: 'text' },
    { id: 'paradox', name: 'paradox-games', type: 'text' },
    { id: 'c_vc', name: 'VOICE', type: 'category' },
    { id: 'vc-lobby', name: 'Lobby', type: 'voice' },
    { id: 'vc-cs2', name: 'CS2 Squad', type: 'voice' },
    { id: 'vc-val', name: 'Valorant Squad', type: 'voice' },
    { id: 'vc-mc', name: 'Minecraft SMP', type: 'voice' },
  ],
  dev: [
    { id: 'c_info', name: 'INFORMATION', type: 'category' },
    { id: 'announcements', name: 'announcements', type: 'text' },
    { id: 'rules', name: 'rules', type: 'text' },
    { id: 'c_general', name: 'GENERAL', type: 'category' },
    { id: 'general', name: 'general', type: 'text' },
    { id: 'intros', name: 'introductions', type: 'text' },
    { id: 'random', name: 'random', type: 'text' },
    { id: 'c_help', name: 'HELP DESK', type: 'category' },
    { id: 'help', name: 'help', type: 'text' },
    { id: 'code-review', name: 'code-review', type: 'text' },
    { id: 'bugs', name: 'bug-reports', type: 'text' },
    { id: 'c_lang', name: 'LANGUAGES', type: 'category' },
    { id: 'js', name: 'javascript', type: 'text' },
    { id: 'py', name: 'python', type: 'text' },
    { id: 'rust', name: 'rust', type: 'text' },
    { id: 'go', name: 'golang', type: 'text' },
    { id: 'cpp', name: 'cpp', type: 'text' },
    { id: 'java', name: 'java', type: 'text' },
    { id: 'c_projects', name: 'PROJECTS', type: 'category' },
    { id: 'showcase', name: 'showcase', type: 'text' },
    { id: 'collab', name: 'collaboration', type: 'text' },
    { id: 'jobs', name: 'job-board', type: 'text' },
    { id: 'c_vc', name: 'VOICE', type: 'category' },
    { id: 'vc-gen', name: 'General', type: 'voice' },
    { id: 'vc-pair', name: 'Pair Programming', type: 'voice' },
    { id: 'vc-study', name: 'Study Room', type: 'voice' },
  ],
  anime: [
    { id: 'c_general', name: 'GENERAL', type: 'category' },
    { id: 'general', name: 'general', type: 'text' },
    { id: 'recommendations', name: 'recommendations', type: 'text' },
    { id: 'currently-watching', name: 'currently-watching', type: 'text' },
    { id: 'manga', name: 'manga', type: 'text' },
    { id: 'c_shows', name: 'SHOWS', type: 'category' },
    { id: 'seasonal', name: 'seasonal-anime', type: 'text' },
    { id: 'classics', name: 'classics', type: 'text' },
    { id: 'spoilers', name: 'spoilers', type: 'text' },
  ],
  music: [
    { id: 'c_general', name: 'GENERAL', type: 'category' },
    { id: 'general', name: 'general', type: 'text' },
    { id: 'recommendations', name: 'recommendations', type: 'text' },
    { id: 'playlist-share', name: 'playlist-share', type: 'text' },
    { id: 'c_genre', name: 'GENRES', type: 'category' },
    { id: 'hiphop', name: 'hip-hop', type: 'text' },
    { id: 'rock', name: 'rock-metal', type: 'text' },
    { id: 'electronic', name: 'electronic', type: 'text' },
    { id: 'classical', name: 'classical', type: 'text' },
    { id: 'lofi', name: 'lofi-beats', type: 'text' },
  ],
  movies: [
    { id: 'c_general', name: 'GENERAL', type: 'category' },
    { id: 'general', name: 'general', type: 'text' },
    { id: 'reviews', name: 'reviews', type: 'text' },
    { id: 'recommendations', name: 'recommendations', type: 'text' },
    { id: 'tv-shows', name: 'tv-shows', type: 'text' },
    { id: 'anime-films', name: 'anime-films', type: 'text' },
  ],
  crypto: [
    { id: 'c_general', name: 'GENERAL', type: 'category' },
    { id: 'general', name: 'general', type: 'text' },
    { id: 'news', name: 'crypto-news', type: 'text' },
    { id: 'c_coins', name: 'COINS', type: 'category' },
    { id: 'btc', name: 'bitcoin', type: 'text' },
    { id: 'eth', name: 'ethereum', type: 'text' },
    { id: 'altcoins', name: 'altcoins', type: 'text' },
    { id: 'nft', name: 'nfts', type: 'text' },
  ],
  art: [
    { id: 'c_general', name: 'GENERAL', type: 'category' },
    { id: 'general', name: 'general', type: 'text' },
    { id: 'showcase', name: 'showcase', type: 'text' },
    { id: 'critique', name: 'critique', type: 'text' },
    { id: 'resources', name: 'resources', type: 'text' },
  ],
  science: [
    { id: 'c_general', name: 'GENERAL', type: 'category' },
    { id: 'general', name: 'general', type: 'text' },
    { id: 'physics', name: 'physics', type: 'text' },
    { id: 'biology', name: 'biology', type: 'text' },
    { id: 'space', name: 'space-astronomy', type: 'text' },
    { id: 'tech', name: 'technology', type: 'text' },
  ],
  sports: [
    { id: 'c_general', name: 'GENERAL', type: 'category' },
    { id: 'general', name: 'general', type: 'text' },
    { id: 'football', name: 'football-soccer', type: 'text' },
    { id: 'basketball', name: 'basketball', type: 'text' },
    { id: 'esports', name: 'esports', type: 'text' },
  ],
  memes: [
    { id: 'c_general', name: 'GENERAL', type: 'category' },
    { id: 'general', name: 'general', type: 'text' },
    { id: 'hot', name: 'hot-memes', type: 'text' },
    { id: 'dank', name: 'dank-memes', type: 'text' },
    { id: 'cursed', name: 'cursed-images', type: 'text' },
  ],
  lofi: [
    { id: 'c_general', name: 'GENERAL', type: 'category' },
    { id: 'general', name: 'general', type: 'text' },
    { id: 'study', name: 'study-cafe', type: 'text' },
    { id: 'vc-lofi', name: 'Lofi Study Room', type: 'voice' },
    { id: 'vc-chill', name: 'Chill Zone', type: 'voice' },
  ],
};

const DM_USERS: DmUser[] = [
  { name: 'Sarah', avatar: '🦊', status: 'online', game: 'Valorant', unread: 3 },
  { name: 'Mike', avatar: '🐻', status: 'online', game: 'CS2' },
  { name: 'Jake', avatar: '🦁', status: 'idle', unread: 1 },
  { name: 'Emma', avatar: '🐱', status: 'dnd', game: 'Stardew Valley' },
  { name: 'Chris', avatar: '🐼', status: 'online' },
  { name: 'Lily', avatar: '🌸', status: 'online', game: 'Genshin Impact' },
  { name: 'Alex', avatar: '😎', status: 'offline' },
  { name: 'Zoe', avatar: '🦄', status: 'online', unread: 2 },
  { name: 'Ryan', avatar: '🐶', status: 'idle' },
  { name: 'Mia', avatar: '🦋', status: 'online', game: 'Overwatch 2' },
  { name: 'Tyler', avatar: '🦅', status: 'dnd', game: 'Elden Ring' },
  { name: 'Hannah', avatar: '🐝', status: 'online' },
  { name: 'Kevin', avatar: '🦖', status: 'offline' },
  { name: 'Sophie', avatar: '🌙', status: 'online', unread: 5 },
  { name: 'Noah', avatar: '🌊', status: 'online', game: 'Minecraft' },
  { name: 'Ava', avatar: '⭐', status: 'idle' },
  { name: 'Liam', avatar: '🏔️', status: 'online', game: 'Deep Rock Galactic' },
  { name: 'Olivia', avatar: '🌺', status: 'online' },
  { name: 'Ethan', avatar: '🦊', status: 'dnd' },
  { name: 'Chloe', avatar: '🎀', status: 'offline' },
  { name: 'Aiden', avatar: '⚡', status: 'online', game: 'Apex Legends' },
  { name: 'Grace', avatar: '🌿', status: 'online' },
  { name: 'Logan', avatar: '🦝', status: 'idle', unread: 1 },
  { name: 'Nora', avatar: '🍀', status: 'online' },
  { name: 'Mason', avatar: '🐺', status: 'offline' },
  { name: 'Ella', avatar: '🌻', status: 'online' },
  { name: 'Carter', avatar: '🦁', status: 'online', game: 'Dota 2' },
  { name: 'Abby', avatar: '🌈', status: 'idle' },
  { name: 'Lucas', avatar: '🎸', status: 'dnd' },
  { name: 'Bella', avatar: '🦋', status: 'online', unread: 8 },
];

const INIT_MSGS: Record<string, Message[]> = {
  'hl-general': [
    { id: 'h1', user: 'Skynet', avatar: '🤖', text: 'do I need to ping the one jira shill', time: 'Today at 11:14 PM' },
    { id: 'h2', user: 'SomeUser', avatar: '🔵', text: '@Ruby (HPE/Cisco Simp) much better 🖼️', time: 'Today at 11:15 PM' },
    { id: 'h3', user: 'H1 | No More Computing', avatar: '🔺', text: 'Is this the thing from two days ago?', time: 'Today at 11:16 PM' },
    { id: 'h4', user: 'H1 | No More Computing', avatar: '🔺', text: "And... It's fucking JIRA????", time: 'Today at 11:16 PM' },
    { id: 'h5', user: 'Ruby (HPE/Cisco Simp)', avatar: '🔴', text: 'which one?', time: 'Today at 11:18 PM', replyTo: 'Is this the thing from two days ago?' },
    { id: 'h6', user: 'Ruby (HPE/Cisco Simp)', avatar: '🔴', text: "yes it's JIRA\nshits fucked", time: 'Today at 11:18 PM', replyTo: "And... It's fucking JIRA????" },
    { id: 'h7', user: 'H1 | No More Computing', avatar: '🔺', text: 'Where you needed to find the Stag?', time: 'Today at 11:19 PM', replyTo: 'which one?' },
    { id: 'h8', user: 'Ruby (HPE/Cisco Simp)', avatar: '🔴', text: 'yes\nthat one', time: 'Today at 11:21 PM' },
    { id: 'h9', user: 'H1 | No More Computing', avatar: '🔺', text: 'Technology stories like this is why I hope one day I can finally retire to my little spot in the country side 6 ft beneath the turf.', time: 'Today at 11:25 PM' },
    { id: 'h10', user: 'Romstik | Observer', avatar: '🟣', text: 'fuckin flawless', time: 'Today at 11:26 PM' },
    { id: 'h11', user: 'CON CAC', avatar: '🏔️', text: 'I need to run maintenance on mine. Shit is running into the print with the rubber cover around the hot end', time: 'Today at 11:27 PM' },
  ],
  'hl-feed': [
    { id: 'f1', user: 'LabBot', avatar: '🤖', text: '📰 r/homelab — My Proxmox cluster finally hit 1M uptime hours across all nodes. NVMe tiering made the difference.', time: 'Today at 10:00 AM' },
    { id: 'f2', user: 'LabBot', avatar: '🤖', text: '📰 r/homelab — PSA: iDRAC 9 firmware 6.10 breaks IPMI on R730xd, roll back if you rely on out-of-band management.', time: 'Today at 10:22 AM' },
    { id: 'f3', user: 'LabBot', avatar: '🤖', text: '📰 r/homelab — Just set up a 10Gbe flat network with MikroTik CRS326 — under $300 and fully wire-speed.', time: 'Today at 11:05 AM' },
    { id: 'f4', user: 'LabBot', avatar: '🤖', text: '📰 r/homelab — Running 14 VMs on a single R620 with 192GB RAM. ECC doing its job every night.', time: 'Today at 11:44 AM' },
  ],
  'hl-sales': [
    { id: 's1', user: 'LabBot', avatar: '🤖', text: '💰 [FS] Dell R730xd 24-bay — 2x E5-2680v4, 256GB DDR4, 12x 4TB SAS — $450 shipped CONUS', time: 'Today at 9:15 AM' },
    { id: 's2', user: 'LabBot', avatar: '🤖', text: '💰 [FS] Ubiquiti USW-48-Pro — lightly used, all ports tested — $280 shipped', time: 'Today at 9:48 AM' },
    { id: 's3', user: 'LabBot', avatar: '🤖', text: '💰 [WTB] HPE P408i-a — need at least one in good condition for R630 expansion', time: 'Today at 10:30 AM' },
    { id: 's4', user: 'TCC', avatar: '💾', text: 'I have a P408i-a I can part with, DM me', time: 'Today at 10:35 AM' },
  ],
  'hl-showcase': [
    { id: 'sc1', user: 'Monkay', avatar: '🐒', text: 'New rack day 🎉 finally got the APC 42U in. 128 CPUs / 720GB RAM across 6 nodes now. The power bill is going to HURT', time: 'Today at 8:00 AM' },
    { id: 'sc2', user: 'TCC', avatar: '💾', text: 'Full homelab tour: 120TB raw, 192GB RAM, 143TB usable after ZFS redundancy. Took 3 years to get here', time: 'Today at 8:20 AM' },
    { id: 'sc3', user: 'Phantom | PowerEdging', avatar: '👻', text: 'My PowerEdge collection is now at 7 units. R620/R630/R720/R730xd/R740xd/R750/R7625. The R7625 is an absolute monster', time: 'Today at 9:00 AM' },
  ],
  'hl-proxmox': [
    { id: 'p1', user: 'H1 | No More Computing', avatar: '🔺', text: 'Anyone running Proxmox 8.2 on R730xd? Getting weird ZFS ARC pressure with the new kernel', time: 'Today at 7:30 AM' },
    { id: 'p2', user: 'Monkay', avatar: '🐒', text: 'yeah running it on 4 nodes — tweak arc_max in /etc/modprobe.d/zfs.conf, was the same issue', time: 'Today at 7:35 AM' },
    { id: 'p3', user: 'H1 | No More Computing', avatar: '🔺', text: 'set it to 16GB, that did it. thanks king', time: 'Today at 7:38 AM' },
    { id: 'p4', user: 'Ruby (HPE/Cisco Simp)', avatar: '🔴', text: 'PBS + Proxmox combo is unreal. 3-2-1 backup done in under 10 mins for 8TB of VM data', time: 'Today at 8:45 AM' },
  ],
  'hl-docker': [
    { id: 'd1', user: 'Romstik | Observer', avatar: '🟣', text: 'Traefik v3 dropped — reverse proxy config is SO much cleaner now, no more manual network juggling', time: 'Today at 9:00 AM' },
    { id: 'd2', user: 'CON CAC', avatar: '🏔️', text: 'still on nginx proxy manager but curious. what does the compose look like?', time: 'Today at 9:05 AM' },
    { id: 'd3', user: 'Romstik | Observer', avatar: '🟣', text: 'basically just labels in your services — traefik.http.routers.app.rule=Host(`app.local`) and done', time: 'Today at 9:08 AM' },
    { id: 'd4', user: 'portalBlock', avatar: '🟦', text: 'Portainer BE is free for 3 nodes now btw if anyone missed that', time: 'Today at 9:20 AM' },
  ],
  'hl-networking': [
    { id: 'n1', user: 'Ruby (HPE/Cisco Simp)', avatar: '🔴', text: 'Cisco Catalyst 9300 got a firmware update that breaks 802.1Q trunk on port-channel — watch out if you just patched', time: 'Today at 8:10 AM' },
    { id: 'n2', user: 'Barracuda |dear...', avatar: '🦈', text: 'Thanks for the heads up, we have 14 of those in prod 😬', time: 'Today at 8:14 AM' },
    { id: 'n3', user: 'Ruby (HPE/Cisco Simp)', avatar: '🔴', text: 'you have been warned lol. TAC case already open', time: 'Today at 8:16 AM' },
  ],
  'hl-3dprint': [
    { id: '3d1', user: 'CON CAC', avatar: '🏔️', text: 'Bambu P1S is printing beautifully after I replaced the PTFE tube on the hot end. rubber grip was coming apart', time: 'Today at 11:28 PM' },
    { id: '3d2', user: 'Phantom | PowerEdging', avatar: '👻', text: 'lol yeah the hot end cover on those is known to degrade, print a replacement in PETG-CF', time: 'Today at 11:30 PM' },
  ],
  'hl-game-sunday': [
    { id: 'gs1', user: 'Schwiing', avatar: '⚡', text: '🎮 Game Sunday is this week! Voting is open — Jackbox / Among Us / Valheim. React to vote 👇', time: 'Today at 9:00 AM' },
    { id: 'gs2', user: 'Danish', avatar: '🇺🇦', text: 'Valheim lets gooo', time: 'Today at 9:04 AM' },
    { id: 'gs3', user: 'Dash | AmourAmis', avatar: '🐱', text: 'Jackbox, I am very funny', time: 'Today at 9:07 AM' },
    { id: 'gs4', user: 'NUTSoverNAS', avatar: '🥜', text: 'Among Us — I always sus the homelab guy who has 128 CPUs', time: 'Today at 9:09 AM' },
  ],
  general: [
    { id: '1', user: 'Alex', avatar: '😎', text: 'hey everyone! what\'s good?', time: 'Today at 9:14 AM' },
    { id: '2', user: 'Sarah', avatar: '🦊', text: 'heyy!! just woke up lol', time: 'Today at 9:16 AM' },
    { id: '3', user: 'Mike', avatar: '🐻', text: 'anyone playing CS tonight?', time: 'Today at 10:02 AM' },
    { id: '4', user: 'Jake', avatar: '🦁', text: 'I\'m in! what time?', time: 'Today at 10:04 AM' },
    { id: '5', user: 'Sarah', avatar: '🦊', text: 'I\'m down for Valorant instead 😅', time: 'Today at 10:05 AM' },
    { id: '6', user: 'Mike', avatar: '🐻', text: 'nah cs is better lmao', time: 'Today at 10:06 AM' },
    { id: '7', user: 'Emma', avatar: '🐱', text: 'you guys are always arguing lol', time: 'Today at 10:08 AM' },
    { id: '8', user: 'Chris', avatar: '🐼', text: 'both games are good lol let\'s just pick one', time: 'Today at 10:10 AM' },
    { id: '9', user: 'Alex', avatar: '😎', text: 'CS wins hands down. change my mind', time: 'Today at 10:12 AM' },
    { id: '10', user: 'Sarah', avatar: '🦊', text: '😂😂😂 okay boomer', time: 'Today at 10:13 AM' },
  ],
  cs2: [
    { id: '1', user: 'KingSlayer99', avatar: '🎯', text: 'just hit Global Elite boys!!', time: 'Today at 8:22 AM' },
    { id: '2', user: 'Mike', avatar: '🐻', text: 'LETS GOOO!!! 🎉', time: 'Today at 8:23 AM' },
    { id: '3', user: 'Alex', avatar: '😎', text: 'congrats!! took long enough 😂', time: 'Today at 8:24 AM' },
    { id: '4', user: 'KingSlayer99', avatar: '🎯', text: 'bro I was stuck in LEM for 3 months lmao', time: 'Today at 8:25 AM' },
    { id: '5', user: 'Jake', avatar: '🦁', text: 'was the rank boost worth it 👀', time: 'Today at 8:26 AM' },
    { id: '6', user: 'KingSlayer99', avatar: '🎯', text: 'I would never 😤 all natural baby', time: 'Today at 8:27 AM' },
  ],
  help: [
    { id: '1', user: 'newbie', avatar: '🐣', text: 'how do I center a div in CSS? I\'ve been struggling for an hour', time: 'Today at 11:20 AM' },
    { id: '2', user: 'CodeWiz', avatar: '🧙', text: 'use flexbox: display: flex; align-items: center; justify-content: center;', time: 'Today at 11:22 AM' },
    { id: '3', user: 'newbie', avatar: '🐣', text: 'oh that works! thanks so much!', time: 'Today at 11:23 AM' },
    { id: '4', user: 'CodeWiz', avatar: '🧙', text: 'also CSS grid works great for centering — display: grid; place-items: center;', time: 'Today at 11:24 AM' },
    { id: '5', user: 'RustLord', avatar: '⚙️', text: 'or just use Rust instead 😂', time: 'Today at 11:26 AM' },
    { id: '6', user: 'CodeWiz', avatar: '🧙', text: 'lmao the frontend devs are shaking', time: 'Today at 11:27 AM' },
  ],
  announcements: [
    { id: '1', user: 'Admin', avatar: '⚡', text: '📢 Welcome to the server! Please read the rules in #rules before chatting.', time: 'Jan 1 at 12:00 AM' },
    { id: '2', user: 'Admin', avatar: '⚡', text: '🎉 We just hit 10,000 members! Thanks everyone for being awesome!', time: 'Feb 14 at 3:00 PM' },
    { id: '3', user: 'Mod', avatar: '🛡️', text: '🏆 Monthly tournament sign-ups are OPEN! React with ✅ to register. Prize pool: $500!', time: 'Mar 10 at 6:00 PM' },
  ],
  Sarah: [
    { id: '1', user: 'Sarah', avatar: '🦊', text: 'hey!! are you coming to game night Friday?', time: 'Today at 2:10 PM' },
    { id: '2', user: 'You', avatar: '🙂', text: 'yeah definitely! what are we playing?', time: 'Today at 2:12 PM' },
    { id: '3', user: 'Sarah', avatar: '🦊', text: 'thinking Valorant and maybe some Among Us after', time: 'Today at 2:13 PM' },
    { id: '4', user: 'You', avatar: '🙂', text: 'sounds fun! what time?', time: 'Today at 2:14 PM' },
    { id: '5', user: 'Sarah', avatar: '🦊', text: '8pm, Mike is hosting on his new PC setup', time: 'Today at 2:15 PM' },
    { id: '6', user: 'Sarah', avatar: '🦊', text: 'also did you see the new Valorant agent?? looks broken lol', time: 'Today at 2:16 PM' },
  ],
  Sophie: [
    { id: '1', user: 'Sophie', avatar: '🌙', text: 'yo can you help me with this Python error real quick', time: 'Today at 3:44 PM' },
    { id: '2', user: 'Sophie', avatar: '🌙', text: 'TypeError: unsupported operand type(s) for +: \'int\' and \'str\'', time: 'Today at 3:44 PM' },
    { id: '3', user: 'You', avatar: '🙂', text: 'you\'re trying to add a number and a string together. convert with int() or str()', time: 'Today at 3:46 PM' },
    { id: '4', user: 'Sophie', avatar: '🌙', text: 'omg yes that fixed it!! thank you!!', time: 'Today at 3:48 PM' },
    { id: '5', user: 'Sophie', avatar: '🌙', text: 'you\'re literally a lifesaver 🙏', time: 'Today at 3:49 PM' },
  ],
  Bella: [
    { id: '1', user: 'Bella', avatar: '🦋', text: 'HEYYY are you watching the new show??', time: 'Today at 1:00 PM' },
    { id: '2', user: 'Bella', avatar: '🦋', text: 'I just finished season 1 and I am NOT okay', time: 'Today at 1:01 PM' },
    { id: '3', user: 'Bella', avatar: '🦋', text: 'that ending!!!! 😭😭😭', time: 'Today at 1:02 PM' },
    { id: '4', user: 'Bella', avatar: '🦋', text: 'tell me you\'ve seen it', time: 'Today at 1:03 PM' },
    { id: '5', user: 'Bella', avatar: '🦋', text: 'helloooo??', time: 'Today at 1:10 PM' },
    { id: '6', user: 'Bella', avatar: '🦋', text: 'ok I know you\'re online I can see you playing cs2', time: 'Today at 1:15 PM' },
    { id: '7', user: 'Bella', avatar: '🦋', text: 'HELLO 🤡', time: 'Today at 1:22 PM' },
    { id: '8', user: 'Bella', avatar: '🦋', text: 'fine I\'m telling you anyway. character X dies. there you go.', time: 'Today at 1:30 PM' },
  ],
};

function getDefaultChannel(serverId: string): string {
  const chans = CHANNELS[serverId] ?? [];
  return chans.find(c => c.type === 'text')?.id ?? '';
}

export default function Discord() {
  const [server, setServer] = useState('homelab');
  const [channel, setChannel] = useState('hl-general');
  const [messages, setMessages] = useState<Record<string, Message[]>>(INIT_MSGS);
  const [input, setInput] = useState('');
  const [dmOpen, setDmOpen] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [memberSearch, setMemberSearch] = useState('');
  const [micMuted, setMicMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [voiceChannel, setVoiceChannel] = useState<{ id: string; name: string; serverId: string } | null>(
    { id: 'hl-vc-general', name: 'General Voice', serverId: 'homelab' }
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, channel, dmOpen]);

  const send = () => {
    if (!input.trim()) return;
    const key = dmOpen ?? channel;
    const msg: Message = {
      id: Date.now().toString(),
      user: 'You', avatar: '🙂', text: input,
      time: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };
    setMessages(m => ({ ...m, [key]: [...(m[key] ?? []), msg] }));
    setInput('');
  };

  const toggleCategory = (id: string) => setCollapsedCategories(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const channels = CHANNELS[server] ?? [];
  const currentCh = channels.find(c => c.id === channel);
  const msgs = messages[dmOpen ?? channel] ?? [];

  const onlineUsers = DM_USERS.filter(u => u.status !== 'offline');
  const filteredMembers = onlineUsers.filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase()));

  // Render channel list with category grouping
  const renderChannels = () => {
    const items: JSX.Element[] = [];
    let skipUntilNextCategory = false;

    channels.forEach((ch) => {
      if (ch.type === 'category') {
        const collapsed = collapsedCategories.has(ch.id);
        skipUntilNextCategory = collapsed;
        items.push(
          <div key={ch.id} className="discord-ch-category" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => toggleCategory(ch.id)}>
            <span style={{ fontSize: 9, color: '#96989d' }}>{collapsed ? '▶' : '▼'}</span>
            {ch.name}
          </div>
        );
      } else if (!skipUntilNextCategory) {
        if (ch.type === 'voice') {
          const vcMembers = HL_VOICE_MEMBERS[ch.id] ?? [];
          const isConnected = voiceChannel?.id === ch.id;
          items.push(
            <div key={ch.id}>
              <button
                className={`discord-ch-item discord-voice-ch ${isConnected ? 'active' : ''}`}
                onClick={() => {
                  setChannel(ch.id);
                  setVoiceChannel(isConnected ? null : { id: ch.id, name: ch.name, serverId: server });
                }}
              >
                🔊 {ch.name}
                {isConnected && <span style={{ marginLeft: 'auto', fontSize: 9, color: '#3ba55c' }}>● Live</span>}
              </button>
              {vcMembers.map(m => (
                <div key={m.name} className="discord-vc-member">
                  <span className="discord-vc-member-icon">🎙️</span>
                  <span className="discord-vc-member-name">{m.name}</span>
                  {m.live && <span className="discord-vc-live">LIVE</span>}
                  {m.badge && <span className="discord-vc-badge">{m.badge}</span>}
                  {m.muted && <span style={{ fontSize: 10, color: '#ed4245' }}>🔇</span>}
                </div>
              ))}
            </div>
          );
        } else {
          items.push(
            <button key={ch.id} className={`discord-ch-item ${channel === ch.id ? 'active' : ''}`} onClick={() => setChannel(ch.id)}>
              # {ch.name}
            </button>
          );
        }
      }
    });
    return items;
  };

  return (
    <div className="discord-root">
      {/* Server list */}
      <div className="discord-servers">
        <div className="discord-dm-icon" title="Direct Messages" onClick={() => setDmOpen('home')}>💬</div>
        <div className="discord-divider-h" />
        {SERVERS.map(s => (
          <button
            key={s.id}
            className={`discord-server-icon ${server === s.id && !dmOpen ? 'active' : ''}`}
            onClick={() => { setServer(s.id); setDmOpen(null); setChannel(getDefaultChannel(s.id)); }}
            title={s.name}
            style={{ position: 'relative' }}
          >
            {s.icon}
            {s.unread && (
              <span style={{
                position: 'absolute', bottom: 2, right: 2,
                background: '#ed4245', color: '#fff',
                fontSize: 9, borderRadius: 8, padding: '0 3px', minWidth: 14,
                textAlign: 'center', lineHeight: '14px', fontWeight: 700,
              }}>{s.unread}</span>
            )}
          </button>
        ))}
        <div className="discord-divider-h" />
        <button className="discord-server-icon" title="Add Server" style={{ color: '#3ba55c', fontSize: 22 }}>+</button>
        <button className="discord-server-icon" title="Explore Servers">🧭</button>
      </div>

      {/* Channel/DM sidebar */}
      <div className="discord-sidebar">
        <div className="discord-server-name">
          {dmOpen ? 'Direct Messages' : (SERVERS.find(s => s.id === server)?.name ?? '')}
          {!dmOpen && <span style={{ marginLeft: 'auto', color: '#96989d', cursor: 'pointer' }}>⚙️</span>}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!dmOpen ? renderChannels() : (
            <>
              <div style={{ padding: '6px 8px' }}>
                <input
                  placeholder="Find a conversation"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '4px 8px', borderRadius: 4, border: 'none', background: '#202225', color: '#dcddde', fontSize: 12 }}
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                />
              </div>
              {DM_USERS.filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase())).map(u => (
                <button
                  key={u.name}
                  className={`discord-dm-item ${dmOpen === u.name ? 'active' : ''}`}
                  onClick={() => setDmOpen(u.name)}
                >
                  <span className="discord-dm-avatar">{u.avatar}</span>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{u.name}</span>
                      {u.unread && <span style={{ background: '#ed4245', color: '#fff', borderRadius: 8, padding: '0 4px', fontSize: 10, fontWeight: 700 }}>{u.unread}</span>}
                    </div>
                    {u.game && <div style={{ fontSize: 10, color: '#96989d' }}>Playing {u.game}</div>}
                    {!u.game && <div style={{ fontSize: 10, color: u.status === 'online' ? '#3ba55c' : u.status === 'idle' ? '#faa81a' : u.status === 'dnd' ? '#ed4245' : '#747f8d' }}>{u.status}</div>}
                  </div>
                  <span className={`discord-status discord-status-${u.status}`} />
                </button>
              ))}
            </>
          )}
        </div>
        {/* Voice connected bar */}
        {voiceChannel && (
          <div className="discord-vc-bar">
            <div className="discord-vc-bar-status">
              <span className="discord-vc-bar-dot">●</span>
              <div>
                <div className="discord-vc-bar-title">Voice Connected</div>
                <div className="discord-vc-bar-sub">{voiceChannel.name} / {SERVERS.find(s => s.id === voiceChannel.serverId)?.name}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="discord-user-btn" title="Share Screen">🖥️</button>
              <button className="discord-user-btn" title="Disconnect" onClick={() => setVoiceChannel(null)} style={{ color: '#ed4245' }}>📞</button>
            </div>
          </div>
        )}
        <div className="discord-user-bar">
          <span className="discord-user-avatar">🐱</span>
          <div><div className="discord-user-name">Atvriders</div><div className="discord-user-tag">#0001</div></div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <button className="discord-user-btn" title={micMuted ? 'Unmute' : 'Mute'} onClick={() => setMicMuted(m => !m)} style={{ color: micMuted ? '#ed4245' : undefined }}>{micMuted ? '🔇' : '🎤'}</button>
            <button className="discord-user-btn" title={deafened ? 'Undeafen' : 'Deafen'} onClick={() => setDeafened(d => !d)} style={{ color: deafened ? '#ed4245' : undefined }}>{deafened ? '🔕' : '🔊'}</button>
            <button className="discord-user-btn" title="User Settings">⚙️</button>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="discord-chat">
        <div className="discord-chat-header">
          <span style={{ color: '#72767d', marginRight: 6 }}>{dmOpen && dmOpen !== 'home' ? DM_USERS.find(u => u.name === dmOpen)?.avatar ?? '💬' : (currentCh?.type === 'text' ? '#' : '🔊')}</span>
          <span className="discord-chat-name">{dmOpen && dmOpen !== 'home' ? dmOpen : (currentCh?.name ?? channel)}</span>
          {dmOpen && dmOpen !== 'home' && (
            <span style={{ marginLeft: 8, fontSize: 11, color: '#3ba55c' }}>
              {DM_USERS.find(u => u.name === dmOpen)?.status === 'online' ? '● Online' : ''}
            </span>
          )}
          {!dmOpen && server === 'homelab' && channel === 'hl-general' && (
            <span style={{ marginLeft: 8, fontSize: 12, color: '#72767d', borderLeft: '1px solid #4f545c', paddingLeft: 8, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Talk about servers and any other homelab/tech related things in here. Yes, the noob questions go here.
            </span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, color: '#96989d', fontSize: 18, cursor: 'pointer' }}>
            <span title="Search">🔍</span>
            <span title="Inbox">🔔</span>
            <span title="Toggle Members" onClick={() => setShowMembers(m => !m)} style={{ color: showMembers ? '#fff' : '#96989d' }}>👥</span>
          </div>
        </div>
        <div className="discord-messages">
          {msgs.length === 0 && (
            <div className="discord-empty">
              <div style={{ fontSize: 48, marginBottom: 8 }}>{dmOpen && dmOpen !== 'home' ? DM_USERS.find(u => u.name === dmOpen)?.avatar : '#'}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {dmOpen && dmOpen !== 'home' ? `This is the beginning of your DM with ${dmOpen}` : `Welcome to #${currentCh?.name}!`}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4 }}>This is the start of the conversation.</div>
            </div>
          )}
          {msgs.map((m, i) => {
            const showHeader = i === 0 || msgs[i-1].user !== m.user || !!m.replyTo;
            return (
              <div key={m.id} className={`discord-msg ${showHeader ? 'with-header' : 'cont'}`}>
                {m.replyTo && (
                  <div className="discord-reply-preview">
                    <span className="discord-reply-line" />
                    <span style={{ fontSize: 10, color: '#96989d', marginLeft: 4 }}>↩ {m.replyTo.length > 60 ? m.replyTo.slice(0, 60) + '…' : m.replyTo}</span>
                  </div>
                )}
                {showHeader && <span className="discord-msg-avatar">{m.avatar}</span>}
                {!showHeader && <span className="discord-msg-spacer" />}
                <div className="discord-msg-content">
                  {showHeader && <div className="discord-msg-header"><span className="discord-msg-user">{m.user}</span><span className="discord-msg-time">{m.time}</span></div>}
                  <div className="discord-msg-text">{m.text}</div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="discord-input-bar">
          <button style={{ background: 'none', border: 'none', color: '#96989d', fontSize: 20, cursor: 'pointer', padding: '0 8px' }}>+</button>
          <input
            className="discord-input"
            placeholder={dmOpen && dmOpen !== 'home' ? `Message ${dmOpen}` : `Message #${currentCh?.name ?? channel}`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
          />
          <span style={{ color: '#96989d', cursor: 'pointer', padding: '0 6px' }}>😊</span>
          <span style={{ color: '#96989d', cursor: 'pointer', padding: '0 6px' }}>🎁</span>
          <button className="discord-send" onClick={send}>➤</button>
        </div>
      </div>

      {/* Members list */}
      {showMembers && <div className="discord-members">
        {!dmOpen && server === 'homelab' && (
          <>
            {HL_MEMBER_GROUPS.map(group => (
              <div key={group.label}>
                <div className="discord-members-category">{group.label}</div>
                {group.members.map(u => (
                  <div key={u.name} className="discord-member-item">
                    <div style={{ position: 'relative' }}>
                      <span className="discord-member-avatar">{u.avatar}</span>
                      <span className={`discord-status discord-status-${u.status}`} style={{ position: 'absolute', bottom: 0, right: 0 }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div className="discord-member-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                        {u.badge && <span className="discord-vc-badge" style={{ flexShrink: 0 }}>{u.badge}</span>}
                      </div>
                      {u.activity && <div style={{ fontSize: 10, color: '#96989d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.activity}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
        {!dmOpen && server !== 'homelab' && (
          <>
            {['online', 'idle', 'dnd'].map(status => {
              const users = filteredMembers.filter(u => u.status === status);
              if (!users.length) return null;
              const label = status === 'online' ? 'ONLINE' : status === 'idle' ? 'IDLE' : 'DO NOT DISTURB';
              return (
                <div key={status}>
                  <div className="discord-members-category">{label} — {users.length}</div>
                  {users.map(u => (
                    <div key={u.name} className="discord-member-item">
                      <div style={{ position: 'relative' }}>
                        <span className="discord-member-avatar">{u.avatar}</span>
                        <span className={`discord-status discord-status-${u.status}`} style={{ position: 'absolute', bottom: 0, right: 0 }} />
                      </div>
                      <div>
                        <div className="discord-member-name">{u.name}</div>
                        {u.game && <div style={{ fontSize: 10, color: '#96989d' }}>Playing {u.game}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>}
    </div>
  );
}
