import { useState, useRef, useEffect } from 'react';
import './Discord.css';

interface Channel { id: string; name: string; type: 'text' | 'voice' | 'category'; }
interface Message { id: string; user: string; avatar: string; text: string; time: string; }
interface Server { id: string; icon: string; name: string; unread?: number; }
interface DmUser { name: string; avatar: string; status: 'online' | 'idle' | 'dnd' | 'offline'; game?: string; unread?: number; }

const SERVERS: Server[] = [
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
  const [server, setServer] = useState('friends');
  const [channel, setChannel] = useState('general');
  const [messages, setMessages] = useState<Record<string, Message[]>>(INIT_MSGS);
  const [input, setInput] = useState('');
  const [dmOpen, setDmOpen] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [memberSearch, setMemberSearch] = useState('');
  const [micMuted, setMicMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
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
          items.push(
            <button key={ch.id} className={`discord-ch-item discord-voice-ch ${channel === ch.id ? 'active' : ''}`} onClick={() => setChannel(ch.id)}>
              🔊 {ch.name}
            </button>
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
        <div className="discord-user-bar">
          <span className="discord-user-avatar">🙂</span>
          <div><div className="discord-user-name">You</div><div className="discord-user-tag">#0001</div></div>
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
            const showHeader = i === 0 || msgs[i-1].user !== m.user;
            return (
              <div key={m.id} className={`discord-msg ${showHeader ? 'with-header' : 'cont'}`}>
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
        {!dmOpen && (
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
