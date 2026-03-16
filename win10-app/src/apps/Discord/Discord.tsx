import { useState, useRef, useEffect } from 'react';
import './Discord.css';

const SERVERS = [
  { id: 'friends', icon: '👥', name: 'Friends' },
  { id: 'gaming', icon: '🎮', name: 'Gaming Hub' },
  { id: 'dev', icon: '💻', name: 'Dev Community' },
  { id: 'music', icon: '🎵', name: 'Music Lovers' },
];

const CHANNELS: Record<string, { id: string; name: string; type: 'text' | 'voice' }[]> = {
  friends: [
    { id: 'general', name: 'general', type: 'text' },
    { id: 'memes', name: 'memes', type: 'text' },
    { id: 'gaming-chat', name: 'gaming-chat', type: 'text' },
    { id: 'vc-main', name: 'Main VC', type: 'voice' },
    { id: 'vc-gaming', name: 'Gaming VC', type: 'voice' },
  ],
  gaming: [
    { id: 'announcements', name: 'announcements', type: 'text' },
    { id: 'cs2', name: 'counter-strike-2', type: 'text' },
    { id: 'valorant', name: 'valorant', type: 'text' },
    { id: 'minecraft', name: 'minecraft', type: 'text' },
    { id: 'lobby', name: 'Lobby', type: 'voice' },
  ],
  dev: [
    { id: 'help', name: 'help', type: 'text' },
    { id: 'showcase', name: 'showcase', type: 'text' },
    { id: 'random', name: 'random', type: 'text' },
    { id: 'pair-programming', name: 'Pair Programming', type: 'voice' },
  ],
  music: [
    { id: 'recs', name: 'recommendations', type: 'text' },
    { id: 'discuss', name: 'discussion', type: 'text' },
    { id: 'listening', name: 'Listening Party', type: 'voice' },
  ],
};

interface Message { id: string; user: string; avatar: string; text: string; time: string; }

const INIT_MSGS: Record<string, Message[]> = {
  general: [
    { id: '1', user: 'Alex', avatar: '😎', text: 'hey everyone!', time: 'Today at 2:34 PM' },
    { id: '2', user: 'Sarah', avatar: '🦊', text: 'hey! what\'s up?', time: 'Today at 2:35 PM' },
    { id: '3', user: 'Mike', avatar: '🐻', text: 'anyone want to play some games tonight?', time: 'Today at 2:40 PM' },
    { id: '4', user: 'Sarah', avatar: '🦊', text: 'I\'m down for Valorant', time: 'Today at 2:41 PM' },
    { id: '5', user: 'Jake', avatar: '🦁', text: 'lmk when you guys start', time: 'Today at 3:00 PM' },
  ],
  announcements: [
    { id: '1', user: 'Admin', avatar: '⚡', text: '🎮 Welcome to Gaming Hub! Rules: Be respectful, no spam, have fun!', time: 'Jan 15 at 9:00 AM' },
    { id: '2', user: 'Admin', avatar: '⚡', text: '🏆 Monthly tournament sign-ups are open! React with ✅ to join.', time: 'Mar 10 at 6:00 PM' },
  ],
  help: [
    { id: '1', user: 'newbie', avatar: '🐣', text: 'how do I center a div in CSS?', time: 'Today at 11:20 AM' },
    { id: '2', user: 'CodeWiz', avatar: '🧙', text: 'use flexbox: display: flex; align-items: center; justify-content: center;', time: 'Today at 11:22 AM' },
    { id: '3', user: 'newbie', avatar: '🐣', text: 'oh that works! thanks so much', time: 'Today at 11:23 AM' },
    { id: '4', user: 'CodeWiz', avatar: '🧙', text: 'no problem! also grid works great for centering', time: 'Today at 11:24 AM' },
  ],
};

const ONLINE_USERS: Record<string, { name: string; avatar: string; status: 'online' | 'idle' | 'dnd' }[]> = {
  friends: [
    { name: 'Sarah', avatar: '🦊', status: 'online' },
    { name: 'Mike', avatar: '🐻', status: 'online' },
    { name: 'Jake', avatar: '🦁', status: 'idle' },
    { name: 'Emma', avatar: '🐱', status: 'dnd' },
    { name: 'Chris', avatar: '🐼', status: 'idle' },
  ],
};

export default function Discord() {
  const [server, setServer] = useState('friends');
  const [channel, setChannel] = useState('general');
  const [messages, setMessages] = useState<Record<string, Message[]>>(INIT_MSGS);
  const [input, setInput] = useState('');
  const [dmOpen, setDmOpen] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, channel]);

  const send = () => {
    if (!input.trim()) return;
    const key = dmOpen ?? channel;
    const msg: Message = { id: Date.now().toString(), user: 'You', avatar: '🙂', text: input, time: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` };
    setMessages(m => ({ ...m, [key]: [...(m[key] ?? []), msg] }));
    setInput('');
  };

  const channels = CHANNELS[server] ?? [];
  const currentCh = channels.find(c => c.id === channel);
  const msgs = messages[dmOpen ?? channel] ?? [];
  const onlineUsers = ONLINE_USERS[server] ?? [];

  return (
    <div className="discord-root">
      {/* Server list */}
      <div className="discord-servers">
        <div className="discord-dm-icon" title="Direct Messages" onClick={() => setDmOpen('home')}>💬</div>
        <div className="discord-divider-h" />
        {SERVERS.map(s => (
          <button key={s.id} className={`discord-server-icon ${server === s.id && !dmOpen ? 'active' : ''}`} onClick={() => { setServer(s.id); setDmOpen(null); setChannel(CHANNELS[s.id][0]?.id ?? ''); }} title={s.name}>
            {s.icon}
          </button>
        ))}
      </div>

      {/* Channel/DM list */}
      <div className="discord-sidebar">
        <div className="discord-server-name">{dmOpen ? 'Direct Messages' : (SERVERS.find(s => s.id === server)?.name ?? '')}</div>
        {!dmOpen ? (
          <>
            <div className="discord-ch-category">TEXT CHANNELS</div>
            {channels.filter(c => c.type === 'text').map(c => (
              <button key={c.id} className={`discord-ch-item ${channel === c.id ? 'active' : ''}`} onClick={() => setChannel(c.id)}>
                # {c.name}
              </button>
            ))}
            <div className="discord-ch-category" style={{ marginTop: 8 }}>VOICE CHANNELS</div>
            {channels.filter(c => c.type === 'voice').map(c => (
              <button key={c.id} className="discord-ch-item discord-voice-ch" onClick={() => {}}>
                🔊 {c.name}
              </button>
            ))}
          </>
        ) : (
          <>
            {onlineUsers.map(u => (
              <button key={u.name} className="discord-dm-item" onClick={() => setDmOpen(u.name)}>
                <span className="discord-dm-avatar">{u.avatar}</span>
                <span>{u.name}</span>
                <span className={`discord-status discord-status-${u.status}`} />
              </button>
            ))}
          </>
        )}
        <div className="discord-user-bar">
          <span className="discord-user-avatar">🙂</span>
          <div><div className="discord-user-name">You</div><div className="discord-user-tag">#0001</div></div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <button className="discord-user-btn">🎤</button>
            <button className="discord-user-btn">🔊</button>
            <button className="discord-user-btn">⚙️</button>
          </div>
        </div>
      </div>

      {/* Main chat */}
      <div className="discord-chat">
        <div className="discord-chat-header">
          <span style={{ color: '#72767d', marginRight: 8 }}>{currentCh?.type === 'text' ? '#' : '🔊'}</span>
          <span className="discord-chat-name">{currentCh?.name ?? channel}</span>
        </div>
        <div className="discord-messages">
          {msgs.length === 0 && (
            <div className="discord-empty">
              <div style={{ fontSize: 48, marginBottom: 8 }}>#</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Welcome to #{currentCh?.name ?? channel}!</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4 }}>This is the start of the channel.</div>
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
          <input
            className="discord-input"
            placeholder={`Message #${currentCh?.name ?? channel}`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
          />
          <button className="discord-send" onClick={send}>➤</button>
        </div>
      </div>

      {/* Members list */}
      <div className="discord-members">
        {onlineUsers.length > 0 && (
          <>
            <div className="discord-members-category">ONLINE — {onlineUsers.filter(u => u.status !== 'dnd').length}</div>
            {onlineUsers.map(u => (
              <div key={u.name} className="discord-member-item">
                <div style={{ position: 'relative' }}>
                  <span className="discord-member-avatar">{u.avatar}</span>
                  <span className={`discord-status discord-status-${u.status}`} style={{ position: 'absolute', bottom: 0, right: 0 }} />
                </div>
                <span className="discord-member-name">{u.name}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
