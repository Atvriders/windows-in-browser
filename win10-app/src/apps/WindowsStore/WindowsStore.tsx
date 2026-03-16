import { useState } from 'react';
import './WindowsStore.css';

interface StoreApp {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: string;
  size: string;
  price: string;
  icon: string;
  description: string;
  screenshots: string[];
  publisher: string;
}

const APPS: StoreApp[] = [
  { id: 'netflix', name: 'Netflix', category: 'Entertainment', rating: 4.3, reviews: '125K', size: '62 MB', price: 'Free', icon: '🎬', publisher: 'Netflix, Inc.', description: 'Watch TV shows and movies anytime, anywhere. Members can play, pause, and resume watching without commercials.', screenshots: ['🎬','📺','🍿'] },
  { id: 'spotify', name: 'Spotify Music', category: 'Music', rating: 4.5, reviews: '890K', size: '95 MB', price: 'Free', icon: '🎵', publisher: 'Spotify AB', description: 'With Spotify, you have access to a world of music. You can listen to artists and albums, or create your own playlist.', screenshots: ['🎵','🎧','🎶'] },
  { id: 'tiktok', name: 'TikTok', category: 'Social', rating: 4.2, reviews: '432K', size: '128 MB', price: 'Free', icon: '🎭', publisher: 'TikTok Pte. Ltd.', description: 'TikTok is the destination for short-form mobile videos. Our mission is to inspire creativity and bring joy.', screenshots: ['🎭','📱','✨'] },
  { id: 'instagram', name: 'Instagram', category: 'Social', rating: 4.1, reviews: '1.2M', size: '85 MB', price: 'Free', icon: '📸', publisher: 'Meta Platforms', description: 'Instagram is a simple way to capture and share the world\'s moments. Follow your friends and family to see what they\'re up to.', screenshots: ['📸','❤️','📱'] },
  { id: 'twitter', name: 'X (Twitter)', category: 'Social', rating: 3.9, reviews: '340K', size: '72 MB', price: 'Free', icon: '🐦', publisher: 'X Corp', description: 'Join the conversation. Watch live streaming video. Express yourself, connect with friends, and get the news.', screenshots: ['🐦','📱','🌍'] },
  { id: 'whatsapp', name: 'WhatsApp Desktop', category: 'Communication', rating: 4.4, reviews: '567K', size: '115 MB', price: 'Free', icon: '💬', publisher: 'Meta Platforms', description: 'Simple. Secure. Reliable messaging for free, available on phones all over the world.', screenshots: ['💬','📱','🔒'] },
  { id: 'zoom', name: 'Zoom', category: 'Productivity', rating: 4.2, reviews: '289K', size: '178 MB', price: 'Free', icon: '📹', publisher: 'Zoom Video Communications', description: 'Zoom is a video communications app that allows you to set up virtual video and audio conferencing, webinars, live chats, screen-sharing.', screenshots: ['📹','🖥️','👥'] },
  { id: 'slack', name: 'Slack', category: 'Productivity', rating: 4.3, reviews: '156K', size: '225 MB', price: 'Free', icon: '💼', publisher: 'Slack Technologies', description: 'Slack is where work happens. Bring your team together in one place to collaborate on projects and communicate.', screenshots: ['💼','📊','💬'] },
  { id: 'notion', name: 'Notion', category: 'Productivity', rating: 4.6, reviews: '98K', size: '145 MB', price: 'Free', icon: '📋', publisher: 'Notion Labs', description: 'Notion is the all-in-one workspace where you can write, plan, collaborate and get organized.', screenshots: ['📋','✍️','📁'] },
  { id: 'figma', name: 'Figma', category: 'Design', rating: 4.7, reviews: '45K', size: '210 MB', price: 'Free', icon: '🎨', publisher: 'Figma, Inc.', description: 'Figma is a collaborative interface design tool. Design, prototype, and gather feedback all in one place with Figma.', screenshots: ['🎨','✏️','🖌️'] },
  { id: 'github', name: 'GitHub Desktop', category: 'Developer Tools', rating: 4.5, reviews: '78K', size: '182 MB', price: 'Free', icon: '🐙', publisher: 'GitHub, Inc.', description: 'Focus on what matters instead of fighting with Git. GitHub Desktop is designed to simplify your development workflow.', screenshots: ['🐙','💻','🔀'] },
  { id: 'postman', name: 'Postman', category: 'Developer Tools', rating: 4.4, reviews: '34K', size: '165 MB', price: 'Free', icon: '📮', publisher: 'Postman Inc.', description: 'Postman is an API platform for building and using APIs. Simplify each step of the API lifecycle and streamline collaboration.', screenshots: ['📮','🔌','💻'] },
  { id: 'winrar', name: 'WinRAR', category: 'Utilities', rating: 4.0, reviews: '210K', size: '8 MB', price: '$29.99', icon: '🗜️', publisher: 'win.rar GmbH', description: 'WinRAR is a powerful archive manager. It can backup your data and reduce the size of email attachments.', screenshots: ['🗜️','📦','💾'] },
  { id: '7zip', name: '7-Zip', category: 'Utilities', rating: 4.6, reviews: '445K', size: '5 MB', price: 'Free', icon: '📦', publisher: 'Igor Pavlov', description: '7-Zip is a file archiver with a high compression ratio. The main features of 7-Zip are high compression ratio and encryption.', screenshots: ['📦','🗜️','🔒'] },
  { id: 'malwarebytes', name: 'Malwarebytes', category: 'Security', rating: 4.3, reviews: '123K', size: '245 MB', price: 'Free', icon: '🛡️', publisher: 'Malwarebytes Inc.', description: 'Malwarebytes protects you against malware, ransomware, malicious websites, and other advanced online threats.', screenshots: ['🛡️','🔒','✅'] },
  { id: 'vlc', name: 'VLC media player', category: 'Video', rating: 4.7, reviews: '678K', size: '42 MB', price: 'Free', icon: '🎬', publisher: 'VideoLAN', description: 'VLC is a free and open source cross-platform multimedia player that plays most multimedia files as well as DVDs, Audio CDs, VCDs.', screenshots: ['🎬','🎵','📺'] },
  { id: 'obs', name: 'OBS Studio', category: 'Video', rating: 4.6, reviews: '89K', size: '320 MB', price: 'Free', icon: '📡', publisher: 'OBS Project', description: 'Free and open source software for video recording and live streaming. Download and start streaming quickly and easily.', screenshots: ['📡','🎥','🖥️'] },
  { id: 'canva', name: 'Canva', category: 'Design', rating: 4.5, reviews: '234K', size: '98 MB', price: 'Free', icon: '🖌️', publisher: 'Canva Pty Ltd', description: 'Canva is an online design and publishing tool with a mission to empower everyone in the world to design anything.', screenshots: ['🖌️','🎨','📄'] },
];

const CATEGORIES = ['All', 'Entertainment', 'Social', 'Productivity', 'Music', 'Communication', 'Design', 'Developer Tools', 'Utilities', 'Security', 'Video'];
const FEATURED = APPS.slice(0, 3);

export default function WindowsStore() {
  const [view, setView] = useState<'home' | 'app' | 'search'>('home');
  const [category, setCategory] = useState('All');
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null);
  const [installed, setInstalled] = useState<Set<string>>(new Set(['spotify', 'vlc']));
  const [installing, setInstalling] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const filtered = APPS.filter(a =>
    (category === 'All' || a.category === category) &&
    (a.name.toLowerCase().includes(search.toLowerCase()))
  );

  const install = (id: string) => {
    if (installed.has(id)) return;
    setInstalling(s => new Set([...s, id]));
    setTimeout(() => {
      setInstalling(s => { const n = new Set(s); n.delete(id); return n; });
      setInstalled(s => new Set([...s, id]));
    }, 2000);
  };

  const stars = (r: number) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

  if (view === 'app' && selectedApp) {
    const app = selectedApp;
    return (
      <div className="store-root">
        <div className="store-topbar">
          <button className="store-back" onClick={() => setView('home')}>← Back</button>
          <div className="store-search-wrap">
            <input className="store-search" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} onFocus={() => setView('search')} />
          </div>
        </div>
        <div className="store-app-detail">
          <div className="store-app-hero">
            <div className="store-app-hero-icon">{app.icon}</div>
            <div className="store-app-hero-info">
              <div className="store-app-hero-name">{app.name}</div>
              <div className="store-app-hero-pub">{app.publisher}</div>
              <div className="store-app-hero-cat">{app.category}</div>
              <div className="store-app-hero-stars">{stars(app.rating)} {app.rating} ({app.reviews} ratings)</div>
              <div className="store-app-hero-actions">
                <button className={`store-install-btn ${installed.has(app.id) ? 'installed' : ''}`}
                  onClick={() => install(app.id)} disabled={installing.has(app.id)}>
                  {installing.has(app.id) ? '⏳ Installing...' : installed.has(app.id) ? '✓ Installed' : `${app.price === 'Free' ? 'Get' : `Buy · ${app.price}`}`}
                </button>
                <span className="store-app-size">{app.size}</span>
              </div>
            </div>
          </div>
          <div className="store-screenshots">
            {app.screenshots.map((s, i) => (
              <div key={i} className="store-screenshot">{s}</div>
            ))}
          </div>
          <div className="store-app-desc-section">
            <h3>Description</h3>
            <p className="store-app-desc">{app.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="store-root">
      <div className="store-topbar">
        <div className="store-logo">Microsoft Store</div>
        <div className="store-search-wrap">
          <input className="store-search" placeholder="Search apps, games, movies..." value={search} onChange={e => { setSearch(e.target.value); if (e.target.value) setView('search'); else setView('home'); }} />
        </div>
      </div>
      <div className="store-body">
        <div className="store-sidebar">
          <div className="store-nav-label">Explore</div>
          <button className={`store-nav-item ${view === 'home' ? 'active' : ''}`} onClick={() => { setView('home'); setSearch(''); }}>🏠 Home</button>
          <div className="store-nav-label" style={{ marginTop: 16 }}>Categories</div>
          {CATEGORIES.map(c => (
            <button key={c} className={`store-nav-item ${category === c ? 'active' : ''}`} onClick={() => { setCategory(c); setView('home'); }}>
              {c === 'All' ? '📦' : c === 'Entertainment' ? '🎬' : c === 'Social' ? '👥' : c === 'Productivity' ? '💼' : c === 'Music' ? '🎵' : c === 'Communication' ? '💬' : c === 'Design' ? '🎨' : c === 'Developer Tools' ? '💻' : c === 'Utilities' ? '🔧' : c === 'Security' ? '🛡️' : '📹'} {c}
            </button>
          ))}
        </div>
        <div className="store-content">
          {view === 'home' && category === 'All' && !search && (
            <div className="store-featured">
              <div className="store-section-title">Featured</div>
              <div className="store-featured-grid">
                {FEATURED.map(app => (
                  <div key={app.id} className="store-featured-card" onClick={() => { setSelectedApp(app); setView('app'); }}>
                    <div className="store-featured-icon">{app.icon}</div>
                    <div className="store-featured-name">{app.name}</div>
                    <div className="store-featured-cat">{app.category}</div>
                    <div className="store-featured-price">{app.price}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="store-section-title">{search ? 'Search Results' : category === 'All' ? 'Top Apps' : category}</div>
          {filtered.length === 0 && <div className="store-no-results">No results for "{search}"</div>}
          <div className="store-grid">
            {filtered.map(app => (
              <div key={app.id} className="store-app-card" onClick={() => { setSelectedApp(app); setView('app'); }}>
                <div className="store-app-card-icon">{app.icon}</div>
                <div className="store-app-card-name">{app.name}</div>
                <div className="store-app-card-cat">{app.category}</div>
                <div className="store-app-card-stars">{stars(app.rating).substring(0,5)}</div>
                <div className="store-app-card-footer">
                  <span className="store-app-card-price">{app.price}</span>
                  <button className={`store-app-card-btn ${installed.has(app.id) ? 'installed' : ''}`}
                    onClick={e => { e.stopPropagation(); install(app.id); }}
                    disabled={installing.has(app.id)}>
                    {installing.has(app.id) ? '...' : installed.has(app.id) ? '✓' : 'Get'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
