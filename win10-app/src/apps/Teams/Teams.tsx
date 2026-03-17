import { useState, useRef, useEffect } from 'react';
import './Teams.css';

interface DmContact {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  lastMsg: string;
  time: string;
  unread?: number;
}

interface TeamChannel {
  id: string;
  name: string;
  unread?: number;
}

interface Team {
  id: string;
  name: string;
  avatar: string;
  channels: TeamChannel[];
}

interface Message {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  isMe?: boolean;
}

const DM_CONTACTS: DmContact[] = [
  { id: 'sarah', name: 'Sarah Johnson', avatar: '👩', role: 'Product Manager', status: 'online', lastMsg: 'Can you review the Q4 report?', time: '2:34 PM', unread: 2 },
  { id: 'mike', name: 'Mike Chen', avatar: '👨', role: 'Senior Developer', status: 'online', lastMsg: 'PR is ready for review', time: '1:12 PM' },
  { id: 'emma', name: 'Emma Davis', avatar: '👩‍💼', role: 'UX Designer', status: 'busy', lastMsg: 'Mockups attached', time: '11:48 AM' },
  { id: 'ryan', name: 'Ryan Martinez', avatar: '🧑', role: 'DevOps Engineer', status: 'away', lastMsg: 'Pipeline is green ✅', time: 'Yesterday', unread: 1 },
  { id: 'lisa', name: 'Lisa Thompson', avatar: '👩‍🔬', role: 'Data Analyst', status: 'online', lastMsg: 'Sending over the metrics now', time: 'Yesterday' },
  { id: 'james', name: 'James Wilson', avatar: '👨‍💻', role: 'Frontend Dev', status: 'offline', lastMsg: 'LGTM! Merging now', time: 'Mon' },
  { id: 'sophia', name: 'Sophia Lee', avatar: '👩‍🎨', role: 'Marketing Lead', status: 'online', lastMsg: 'Campaign assets are ready', time: 'Mon', unread: 4 },
  { id: 'alex', name: 'Alex Turner', avatar: '🧑‍💼', role: 'Project Manager', status: 'online', lastMsg: 'Sprint planning at 3pm!', time: 'Mon' },
  { id: 'rachel', name: 'Rachel Kim', avatar: '👩‍💻', role: 'Backend Dev', status: 'busy', lastMsg: 'DB migration complete', time: 'Fri' },
  { id: 'david', name: 'David Park', avatar: '👨‍🔬', role: 'ML Engineer', status: 'away', lastMsg: 'Model accuracy at 94%', time: 'Fri' },
  { id: 'jessica', name: 'Jessica Brown', avatar: '👩‍🏫', role: 'HR Manager', status: 'online', lastMsg: 'Team building next Friday!', time: 'Thu' },
  { id: 'tom', name: 'Tom Anderson', avatar: '👨‍💼', role: 'CEO', status: 'busy', lastMsg: 'Great work on the launch!', time: 'Thu' },
  { id: 'nina', name: 'Nina Patel', avatar: '👩‍🚀', role: 'QA Engineer', status: 'online', lastMsg: 'All tests passing', time: 'Wed', unread: 3 },
  { id: 'chris', name: 'Chris Evans', avatar: '🧑‍🔧', role: 'SysAdmin', status: 'offline', lastMsg: 'Server maintenance tonight', time: 'Wed' },
  { id: 'amanda', name: 'Amanda Foster', avatar: '👩‍🎤', role: 'Content Writer', status: 'online', lastMsg: 'Blog post is live!', time: 'Tue' },
  { id: 'kevin', name: 'Kevin Zhang', avatar: '👨‍🎓', role: 'Security Engineer', status: 'online', lastMsg: 'Security audit done', time: 'Tue' },
  { id: 'olivia', name: 'Olivia Wilson', avatar: '👩‍💻', role: 'Cloud Architect', status: 'away', lastMsg: 'AWS costs down 30%!', time: 'Mon' },
  { id: 'marcus', name: 'Marcus Johnson', avatar: '🧑‍🎨', role: 'Brand Designer', status: 'online', lastMsg: 'New logo options attached', time: 'Mon' },
  { id: 'priya', name: 'Priya Singh', avatar: '👩‍💼', role: 'Scrum Master', status: 'busy', lastMsg: 'Retrospective at 5pm', time: 'Last week' },
  { id: 'ethan', name: 'Ethan Moore', avatar: '👨‍💻', role: 'Mobile Dev', status: 'online', lastMsg: 'App store submission done', time: 'Last week' },
  { id: 'isabella', name: 'Isabella Cruz', avatar: '👩‍🔬', role: 'Research Lead', status: 'offline', lastMsg: 'Research doc shared', time: 'Last week' },
  { id: 'tyler', name: 'Tyler Roberts', avatar: '🧑‍💻', role: 'Full Stack Dev', status: 'online', lastMsg: 'Feature is deployed', time: 'Last week' },
  { id: 'zara', name: 'Zara Ahmed', avatar: '👩‍🎓', role: 'Intern', status: 'online', lastMsg: 'Thanks for the feedback!', time: 'Last week' },
  { id: 'brandon', name: 'Brandon Hall', avatar: '👨‍🏫', role: 'Tech Lead', status: 'busy', lastMsg: 'Architecture review tomorrow', time: 'Last week' },
  { id: 'claire', name: 'Claire Young', avatar: '👩‍🔧', role: 'Infra Engineer', status: 'away', lastMsg: 'K8s upgrade complete', time: 'Last week' },
];

const TEAMS: Team[] = [
  {
    id: 'engineering', name: '⚙️ Engineering', avatar: '⚙️', channels: [
      { id: 'general', name: 'General', unread: 3 },
      { id: 'announcements', name: 'Announcements' },
      { id: 'backend', name: 'Backend', unread: 1 },
      { id: 'frontend', name: 'Frontend' },
      { id: 'devops', name: 'DevOps', unread: 2 },
      { id: 'mobile', name: 'Mobile' },
      { id: 'code-review', name: 'Code Review' },
      { id: 'incidents', name: '🚨 Incidents' },
      { id: 'on-call', name: 'On-Call Rotation' },
    ],
  },
  {
    id: 'product', name: '📦 Product', avatar: '📦', channels: [
      { id: 'general', name: 'General' },
      { id: 'roadmap', name: 'Roadmap', unread: 5 },
      { id: 'design', name: 'Design Reviews' },
      { id: 'user-research', name: 'User Research' },
      { id: 'feature-requests', name: 'Feature Requests' },
      { id: 'bug-tracking', name: 'Bug Tracking', unread: 2 },
    ],
  },
  {
    id: 'marketing', name: '📣 Marketing', avatar: '📣', channels: [
      { id: 'general', name: 'General' },
      { id: 'campaigns', name: 'Campaigns', unread: 1 },
      { id: 'social-media', name: 'Social Media' },
      { id: 'content', name: 'Content Creation' },
      { id: 'analytics', name: 'Analytics' },
      { id: 'brand', name: 'Brand Assets' },
    ],
  },
  {
    id: 'hr', name: '👥 People & HR', avatar: '👥', channels: [
      { id: 'general', name: 'General' },
      { id: 'announcements', name: 'Announcements' },
      { id: 'onboarding', name: 'Onboarding' },
      { id: 'team-building', name: 'Team Building' },
      { id: 'benefits', name: 'Benefits' },
    ],
  },
  {
    id: 'all', name: '🏢 Company-Wide', avatar: '🏢', channels: [
      { id: 'general', name: 'General', unread: 8 },
      { id: 'water-cooler', name: '💧 Water Cooler', unread: 12 },
      { id: 'kudos', name: '🌟 Kudos' },
      { id: 'events', name: '📅 Events' },
      { id: 'jobs', name: '💼 Open Positions' },
    ],
  },
];

const INIT_MSGS: Record<string, Message[]> = {
  sarah: [
    { id: '1', user: 'Sarah Johnson', avatar: '👩', text: 'Hey! Can you take a look at the Q4 report when you get a chance?', time: '2:30 PM' },
    { id: '2', user: 'Sarah Johnson', avatar: '👩', text: 'I need your sign-off before the board meeting tomorrow', time: '2:31 PM' },
    { id: '3', user: 'You', avatar: '🙂', text: 'Sure, I\'ll review it this afternoon', time: '2:32 PM', isMe: true },
    { id: '4', user: 'Sarah Johnson', avatar: '👩', text: 'Can you review the Q4 report?', time: '2:34 PM' },
  ],
  mike: [
    { id: '1', user: 'Mike Chen', avatar: '👨', text: 'Hey, I just pushed the auth refactor to the feature branch', time: '12:55 PM' },
    { id: '2', user: 'You', avatar: '🙂', text: 'Nice! I\'ll take a look. Did the tests pass?', time: '12:58 PM', isMe: true },
    { id: '3', user: 'Mike Chen', avatar: '👨', text: 'All 247 tests passing ✅ CI is green', time: '1:00 PM' },
    { id: '4', user: 'Mike Chen', avatar: '👨', text: 'PR is ready for review', time: '1:12 PM' },
  ],
  'engineering:general': [
    { id: '1', user: 'Alex Turner', avatar: '🧑‍💼', text: 'Good morning team! Sprint planning at 10am today', time: '9:01 AM' },
    { id: '2', user: 'Ryan Martinez', avatar: '🧑', text: 'On it! Also heads up — prod deployment is scheduled for 6pm', time: '9:08 AM' },
    { id: '3', user: 'Rachel Kim', avatar: '👩‍💻', text: 'DB migration ran successfully overnight 🎉', time: '9:15 AM' },
    { id: '4', user: 'Mike Chen', avatar: '👨', text: 'Great news Rachel! That was a big one', time: '9:17 AM' },
    { id: '5', user: 'Kevin Zhang', avatar: '👨‍🎓', text: 'Security audit results are in — we\'re looking clean. Full report in the wiki', time: '9:30 AM' },
    { id: '6', user: 'Tom Anderson', avatar: '👨‍💼', text: 'Fantastic work everyone! Really proud of what the team accomplished this sprint 🚀', time: '10:02 AM' },
    { id: '7', user: 'Sarah Johnson', avatar: '👩', text: 'Reminder: design reviews at 2pm. Figma links in the meeting invite', time: '11:00 AM' },
    { id: '8', user: 'James Wilson', avatar: '👨‍💻', text: 'FYI I\'m getting some odd TypeScript errors on the new auth flow. Has anyone seen this before?', time: '11:22 AM' },
    { id: '9', user: 'Tyler Roberts', avatar: '🧑‍💻', text: 'Might be the strict null checks - did you update your tsconfig?', time: '11:25 AM' },
    { id: '10', user: 'James Wilson', avatar: '👨‍💻', text: 'That fixed it! Thanks Tyler 🙏', time: '11:28 AM' },
  ],
  'all:water-cooler': [
    { id: '1', user: 'Jessica Brown', avatar: '👩‍🏫', text: 'Who else is watching the new season of Succession? No spoilers!', time: '9:00 AM' },
    { id: '2', user: 'Amanda Foster', avatar: '👩‍🎤', text: 'I am!! It\'s so good 😍', time: '9:02 AM' },
    { id: '3', user: 'Marcus Johnson', avatar: '🧑‍🎨', text: 'Not yet but it\'s in my watchlist', time: '9:05 AM' },
    { id: '4', user: 'Sophia Lee', avatar: '👩', text: 'I\'m more of a cooking show person tbh 😄', time: '9:08 AM' },
    { id: '5', user: 'Ethan Moore', avatar: '👨‍💻', text: 'Anyone catch the game last night? 🏀', time: '9:10 AM' },
    { id: '6', user: 'Brandon Hall', avatar: '👨‍🏫', text: 'What a game! That last quarter was insane', time: '9:12 AM' },
    { id: '7', user: 'Zara Ahmed', avatar: '👩‍🎓', text: 'Good morning everyone! Happy Friday!! 🎉', time: '9:15 AM' },
    { id: '8', user: 'Chris Evans', avatar: '🧑‍🔧', text: 'Friday coffee run in 30 mins, who\'s in?', time: '9:18 AM' },
    { id: '9', user: 'Priya Singh', avatar: '👩‍💼', text: '☕ I\'m in! Can you grab me an oat milk latte?', time: '9:19 AM' },
    { id: '10', user: 'Olivia Wilson', avatar: '👩‍💻', text: 'Same please! And maybe a croissant 🥐', time: '9:20 AM' },
    { id: '11', user: 'David Park', avatar: '👨‍🔬', text: 'lol the coffee run is going to be a huge order', time: '9:22 AM' },
    { id: '12', user: 'Tom Anderson', avatar: '👨‍💼', text: 'Put it on the company card! You all deserve it 😊', time: '9:30 AM' },
  ],
};

type SideView = 'chat' | 'teams' | 'calendar' | 'calls' | 'files';

export default function Teams() {
  const [view, setView] = useState<SideView>('chat');
  const [selectedDm, setSelectedDm] = useState<DmContact>(DM_CONTACTS[0]);
  const [selectedTeam, setSelectedTeam] = useState<Team>(TEAMS[0]);
  const [selectedChannel, setSelectedChannel] = useState<TeamChannel>(TEAMS[0].channels[0]);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INIT_MSGS);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [collapsedTeams, setCollapsedTeams] = useState<Set<string>>(new Set());
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, selectedDm, selectedChannel]);

  const msgKey = view === 'chat' ? selectedDm.id : `${selectedTeam.id}:${selectedChannel.id}`;
  const msgs = messages[msgKey] ?? [];

  const send = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      user: 'You', avatar: '🙂', text: input, isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(m => ({ ...m, [msgKey]: [...(m[msgKey] ?? []), msg] }));
    setInput('');
  };

  const toggleTeam = (id: string) => setCollapsedTeams(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const statusClass = (s: string) => `teams-status teams-status-${s === 'online' ? 'online' : s === 'busy' ? 'busy' : s === 'away' ? 'away' : 'offline'}`;

  const headerInfo = view === 'chat'
    ? { avatar: selectedDm.avatar, name: selectedDm.name, sub: selectedDm.role }
    : { avatar: selectedTeam.avatar, name: `${selectedTeam.name} > ${selectedChannel.name}`, sub: `${selectedTeam.channels.length} channels` };

  const filteredContacts = DM_CONTACTS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="teams-root">
      {/* Activity rail */}
      <div className="teams-rail">
        {[
          ['chat', '💬', 'Chat', 6],
          ['teams', '👥', 'Teams', 0],
          ['calendar', '📅', 'Calendar', 0],
          ['calls', '📞', 'Calls', 0],
          ['files', '📁', 'Files', 0],
        ].map(([id, icon, label, badge]) => (
          <button key={id} className={`teams-rail-btn ${view === id ? 'active' : ''}`} onClick={() => setView(id as SideView)}>
            <span className="teams-rail-icon">{icon}</span>
            <span>{label}</span>
            {(badge as number) > 0 && <span className="teams-badge">{badge}</span>}
          </button>
        ))}
      </div>

      {/* Sidebar */}
      <div className="teams-sidebar">
        <div className="teams-sidebar-header">
          {view === 'chat' ? 'Chat' : view === 'teams' ? 'Teams' : view === 'calendar' ? 'Calendar' : view === 'calls' ? 'Calls' : 'Files'}
          <span style={{ fontSize: 18, cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>✏️</span>
        </div>
        <input
          className="teams-sidebar-search"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="teams-list">
          {view === 'chat' && filteredContacts.map(c => (
            <div
              key={c.id}
              className={`teams-chat-item ${selectedDm.id === c.id ? 'active' : ''}`}
              onClick={() => { setSelectedDm(c); setView('chat'); }}
            >
              <div className="teams-chat-avatar">
                {c.avatar}
                <span className={statusClass(c.status)} style={{ position: 'absolute', bottom: 0, right: 0 }} />
              </div>
              <div className="teams-chat-info">
                <div className={`teams-chat-name ${c.unread ? 'teams-ch-unread' : ''}`}>{c.name}</div>
                <div className="teams-chat-preview">{c.lastMsg}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span className="teams-chat-time">{c.time}</span>
                {c.unread && <span className="teams-unread-count">{c.unread}</span>}
              </div>
            </div>
          ))}

          {view === 'teams' && TEAMS.map(team => (
            <div key={team.id} className="teams-channel-group">
              <div className="teams-channel-group-header" onClick={() => toggleTeam(team.id)}>
                <span style={{ fontSize: 10, color: '#888' }}>{collapsedTeams.has(team.id) ? '▶' : '▼'}</span>
                {team.name}
              </div>
              {!collapsedTeams.has(team.id) && team.channels.map(ch => (
                <div
                  key={ch.id}
                  className={`teams-channel-item ${selectedTeam.id === team.id && selectedChannel.id === ch.id ? 'active' : ''}`}
                  onClick={() => { setSelectedTeam(team); setSelectedChannel(ch); setView('teams'); }}
                >
                  <span style={{ color: '#888' }}>#</span>
                  <span className={ch.unread ? 'teams-ch-unread' : ''}>{ch.name}</span>
                  {ch.unread && <span className="teams-unread-count" style={{ marginLeft: 'auto' }}>{ch.unread}</span>}
                </div>
              ))}
            </div>
          ))}

          {view === 'calendar' && (
            <div style={{ padding: 16, color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
              <div style={{ fontWeight: 700, color: '#fff', marginBottom: 12 }}>Today's Schedule</div>
              {[
                ['9:00 AM', 'Daily Standup', '15 min'],
                ['10:00 AM', 'Sprint Planning', '1 hr'],
                ['2:00 PM', 'Design Review', '45 min'],
                ['3:00 PM', '1:1 with Sarah', '30 min'],
                ['5:00 PM', 'Team Retrospective', '1 hr'],
              ].map(([time, name, dur]) => (
                <div key={name} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 11, color: '#8b83ff' }}>{time} · {dur}</div>
                  <div style={{ color: '#fff', marginTop: 2 }}>{name}</div>
                </div>
              ))}
            </div>
          )}

          {view === 'calls' && (
            <div style={{ padding: 16, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              <div style={{ fontWeight: 700, color: '#fff', marginBottom: 12 }}>Recent Calls</div>
              {[
                ['👩', 'Sarah Johnson', '2:34 PM', 'Missed'],
                ['👨', 'Mike Chen', '1:00 PM', '8 min'],
                ['👨‍💼', 'Tom Anderson', 'Yesterday', '24 min'],
                ['🧑', 'Ryan Martinez', 'Yesterday', '5 min'],
                ['👩‍🔬', 'Rachel Kim', 'Mon', '12 min'],
              ].map(([av, name, time, dur]) => (
                <div key={name} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 20 }}>{av}</span>
                  <div>
                    <div style={{ color: '#fff' }}>{name}</div>
                    <div style={{ fontSize: 11 }}>{time} · {dur}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: 18, color: dur === 'Missed' ? '#d83b01' : '#92c353' }}>
                    {dur === 'Missed' ? '📵' : '📞'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {view === 'files' && (
            <div style={{ padding: 16, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              <div style={{ fontWeight: 700, color: '#fff', marginBottom: 12 }}>Recent Files</div>
              {[
                ['📊', 'Q4 Report.xlsx', 'Sarah Johnson', '2h ago'],
                ['📝', 'Sprint Planning.docx', 'Alex Turner', '4h ago'],
                ['🎨', 'Mockups v3.fig', 'Emma Davis', 'Yesterday'],
                ['📑', 'Architecture Proposal.pdf', 'Brandon Hall', 'Yesterday'],
                ['📊', 'Marketing Analytics.xlsx', 'Sophia Lee', 'Mon'],
                ['🗒️', 'Meeting Notes.docx', 'Priya Singh', 'Mon'],
              ].map(([icon, name, by, when]) => (
                <div key={name} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: '#fff' }}>{icon} {name}</div>
                  <div style={{ fontSize: 11, marginTop: 2 }}>{by} · {when}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="teams-main">
        {(view === 'chat' || view === 'teams') && (
          <>
            <div className="teams-chat-header">
              <span className="teams-chat-header-avatar">{headerInfo.avatar}</span>
              <div>
                <div className="teams-chat-header-name">{headerInfo.name}</div>
                <div className="teams-chat-header-sub">{headerInfo.sub}</div>
              </div>
              <div className="teams-header-actions">
                <span title="Video call">📹</span>
                <span title="Audio call">📞</span>
                <span title="Screen share">🖥️</span>
                <span title="Search">🔍</span>
                <span title="More">⋯</span>
              </div>
            </div>

            <div className="teams-messages">
              {msgs.length === 0 && (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', marginTop: 60 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{headerInfo.avatar}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{headerInfo.name}</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>Start the conversation</div>
                </div>
              )}
              {msgs.map((m, i) => {
                const showHeader = i === 0 || msgs[i-1].user !== m.user;
                return (
                  <div key={m.id} className={`teams-msg ${showHeader ? '' : 'cont'}`}>
                    {showHeader ? <span className="teams-msg-avatar">{m.avatar}</span> : <span className="teams-msg-spacer" />}
                    <div className="teams-msg-content">
                      {showHeader && (
                        <div className="teams-msg-header">
                          <span className="teams-msg-user" style={{ color: m.isMe ? '#8b83ff' : '#e0e0e0' }}>{m.user}</span>
                          <span className="teams-msg-time">{m.time}</span>
                        </div>
                      )}
                      <div className="teams-msg-text">{m.text}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <div className="teams-input-area">
              <div className="teams-input-toolbar">
                <span title="Attach">📎</span>
                <span title="Emoji">😊</span>
                <span title="GIF">GIF</span>
                <span title="Format">A</span>
                <span title="Loop">🔁</span>
              </div>
              <div className="teams-input-box">
                <input
                  className="teams-input"
                  placeholder={`Message ${view === 'chat' ? selectedDm.name : selectedChannel.name}`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                />
                <button className="teams-send-btn" onClick={send}>➤</button>
              </div>
            </div>
          </>
        )}

        {view === 'calendar' && (
          <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📅 This Week</div>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, di) => (
              <div key={day} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: di === 0 ? '#8b83ff' : 'rgba(255,255,255,0.7)', marginBottom: 6 }}>{day}</div>
                {di === 0 ? (
                  ['9:00 Daily Standup', '10:00 Sprint Planning', '2:00 Design Review', '3:00 1:1 with Sarah'].map(e => (
                    <div key={e} style={{ background: 'rgba(99,91,255,0.15)', border: '1px solid rgba(99,91,255,0.3)', borderRadius: 4, padding: '6px 10px', marginBottom: 4, fontSize: 12 }}>{e}</div>
                  ))
                ) : di === 2 ? (
                  ['9:00 Architecture Review', '2:00 All-Hands Meeting'].map(e => (
                    <div key={e} style={{ background: 'rgba(99,91,255,0.15)', border: '1px solid rgba(99,91,255,0.3)', borderRadius: 4, padding: '6px 10px', marginBottom: 4, fontSize: 12 }}>{e}</div>
                  ))
                ) : di === 4 ? (
                  ['9:00 Sprint Review', '11:00 Team Lunch 🍕'].map(e => (
                    <div key={e} style={{ background: 'rgba(99,91,255,0.15)', border: '1px solid rgba(99,91,255,0.3)', borderRadius: 4, padding: '6px 10px', marginBottom: 4, fontSize: 12 }}>{e}</div>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>No meetings scheduled</div>
                )}
              </div>
            ))}
          </div>
        )}

        {view === 'calls' && (
          <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📞 Calls</div>
            <div style={{ marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>Recent</div>
            {[
              { name: 'Alex Chen', time: 'Today 10:14 AM', type: 'incoming', duration: '24:07' },
              { name: 'Sarah Mitchell', time: 'Today 9:02 AM', type: 'outgoing', duration: '8:42' },
              { name: 'Jordan Lee', time: 'Yesterday 3:45 PM', type: 'missed', duration: '' },
              { name: 'Engineering Team', time: 'Yesterday 2:00 PM', type: 'incoming', duration: '1:02:18' },
              { name: 'Jordan Lee', time: 'Mar 14, 11:30 AM', type: 'outgoing', duration: '5:31' },
              { name: 'HR Department', time: 'Mar 13, 3:00 PM', type: 'incoming', duration: '12:04' },
              { name: 'Alex Chen', time: 'Mar 12, 1:15 PM', type: 'missed', duration: '' },
              { name: 'Sarah Mitchell', time: 'Mar 11, 9:45 AM', type: 'outgoing', duration: '18:33' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,91,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {c.name.includes('Team') || c.name.includes('Department') ? '👥' : '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: c.type === 'missed' ? '#ed4245' : 'rgba(255,255,255,0.5)' }}>
                    {c.type === 'incoming' ? '↙ Incoming' : c.type === 'outgoing' ? '↗ Outgoing' : '↙ Missed'} · {c.time}
                    {c.duration && ` · ${c.duration}`}
                  </div>
                </div>
                <button style={{ background: 'rgba(99,91,255,0.2)', border: 'none', borderRadius: 4, color: '#fff', padding: '4px 10px', cursor: 'pointer', fontSize: 14 }}>📞</button>
              </div>
            ))}
          </div>
        )}

        {view === 'files' && (
          <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📁 Files</div>
            <div style={{ marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>Recent</div>
            {[
              { name: 'Q2_Roadmap.pptx', size: '2.4 MB', modified: 'Today', owner: 'Alex Chen', icon: '📊' },
              { name: 'Sprint_Planning_Notes.docx', size: '48 KB', modified: 'Today', owner: 'You', icon: '📝' },
              { name: 'Architecture_Diagram.png', size: '1.1 MB', modified: 'Yesterday', owner: 'Jordan Lee', icon: '🖼️' },
              { name: 'Budget_2026.xlsx', size: '312 KB', modified: 'Mar 14', owner: 'Sarah Mitchell', icon: '📈' },
              { name: 'API_Spec_v3.pdf', size: '890 KB', modified: 'Mar 13', owner: 'Alex Chen', icon: '📄' },
              { name: 'Design_System.fig', size: '14.2 MB', modified: 'Mar 12', owner: 'Jordan Lee', icon: '🎨' },
              { name: 'Onboarding_Checklist.docx', size: '28 KB', modified: 'Mar 10', owner: 'HR Team', icon: '✅' },
              { name: 'Infrastructure_Cost_Report.xlsx', size: '204 KB', modified: 'Mar 9', owner: 'You', icon: '📈' },
              { name: 'Meeting_Recording_Mar8.mp4', size: '224 MB', modified: 'Mar 8', owner: 'Teams', icon: '🎥' },
              { name: 'Release_Notes_v2.1.md', size: '12 KB', modified: 'Mar 7', owner: 'You', icon: '📝' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 12, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}>
                <div style={{ fontSize: 24 }}>{f.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{f.modified} · {f.size} · {f.owner}</div>
                </div>
                <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, color: 'rgba(255,255,255,0.7)', padding: '3px 8px', cursor: 'pointer', fontSize: 11 }}>Open</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
