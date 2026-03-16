import { useState, useRef } from 'react';
import './Browser.css';

interface Props { initialUrl?: string; }

const DEFAULT_URL = 'https://www.google.com';

const BOOKMARKS = [
  { label: 'Google', url: 'https://www.google.com', icon: '🔍' },
  { label: 'YouTube', url: 'https://www.youtube.com', icon: '▶️' },
  { label: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { label: 'Reddit', url: 'https://www.reddit.com', icon: '🤖' },
  { label: 'Wikipedia', url: 'https://www.wikipedia.org', icon: '📖' },
  { label: 'Waterburp', url: 'https://www.waterburp.com', icon: '💧' },
  { label: 'Hacker News', url: 'https://news.ycombinator.com', icon: '📰' },
  { label: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '💬' },
  { label: 'Twitter/X', url: 'https://www.x.com', icon: '🐦' },
  { label: 'Netflix', url: 'https://www.netflix.com', icon: '🎬' },
];

// Detect private/LAN IP addresses for simulated device pages
function isPrivateIp(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return /^192\.168\./.test(h) || /^10\./.test(h) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
      h === 'localhost' || /^127\./.test(h);
  } catch { return false; }
}

function getHost(url: string): string {
  try { return new URL(url).hostname.toLowerCase(); } catch { return ''; }
}

function isYouTube(url: string): boolean {
  const h = getHost(url);
  return h.includes('youtube.com') || h === 'youtu.be';
}

function resolveYouTube(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube-nocookie.com/embed/${u.searchParams.get('v')}?autoplay=0`;
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube-nocookie.com/embed${u.pathname}`;
    }
  } catch { /* */ }
  return 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ';
}

// Simulated page content for known sites
function SimulatedPage({ url }: { url: string }) {
  const host = getHost(url);

  if (host.includes('google.com')) {
    return (
      <div className="edge-sim-page edge-sim-google">
        <div className="edge-goog-header">
          <div className="edge-goog-apps">⊞</div>
          <div className="edge-goog-nav">
            <span>Gmail</span><span>Images</span>
          </div>
        </div>
        <div className="edge-goog-center">
          <div className="edge-goog-logo">Google</div>
          <div className="edge-goog-search-wrap">
            <span className="edge-goog-search-icon">🔍</span>
            <input className="edge-goog-search" placeholder="Search Google or type a URL" />
            <span className="edge-goog-mic">🎤</span>
            <span className="edge-goog-cam">📷</span>
          </div>
          <div className="edge-goog-btns">
            <button className="edge-goog-btn">Google Search</button>
            <button className="edge-goog-btn">I'm Feeling Lucky</button>
          </div>
        </div>
        <div className="edge-goog-footer">
          <span>Advertising</span><span>Business</span><span>How Search works</span>
          <span style={{ marginLeft: 'auto' }}>Privacy</span><span>Terms</span><span>Settings</span>
        </div>
      </div>
    );
  }

  if (host.includes('github.com')) {
    return (
      <div className="edge-sim-page edge-sim-github">
        <div className="edge-gh-header">
          <span className="edge-gh-logo">🐙 GitHub</span>
          <div className="edge-gh-nav">
            <span>Product</span><span>Solutions</span><span>Open Source</span><span>Pricing</span>
          </div>
          <div className="edge-gh-actions">
            <button className="edge-gh-btn-outline">Sign in</button>
            <button className="edge-gh-btn-filled">Sign up</button>
          </div>
        </div>
        <div className="edge-gh-hero">
          <h1>Build and ship software on a single, collaborative platform</h1>
          <p>Join the world's most widely adopted AI-powered developer platform.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="edge-gh-btn-filled">Sign up for free</button>
            <button className="edge-gh-btn-outline">Start a free enterprise trial →</button>
          </div>
        </div>
        <div className="edge-gh-stats">
          <div className="edge-gh-stat"><div className="edge-gh-num">100M+</div><div>Developers</div></div>
          <div className="edge-gh-stat"><div className="edge-gh-num">4M+</div><div>Organizations</div></div>
          <div className="edge-gh-stat"><div className="edge-gh-num">330M+</div><div>Repositories</div></div>
          <div className="edge-gh-stat"><div className="edge-gh-num">90%</div><div>Fortune 100 companies</div></div>
        </div>
      </div>
    );
  }

  if (host.includes('reddit.com')) {
    const posts = [
      { sub: 'r/programming', title: 'I built a full Windows 10 clone in React — runs in the browser', votes: 42700, comments: 1832 },
      { sub: 'r/webdev', title: 'CSS gradients are underrated — here\'s 10 tricks you didn\'t know', votes: 18400, comments: 924 },
      { sub: 'r/technology', title: 'Microsoft releases Windows 11 update with new AI features built in', votes: 31200, comments: 2104 },
      { sub: 'r/gaming', title: 'Steam breaks all-time concurrent user record with 36 million', votes: 88500, comments: 3401 },
      { sub: 'r/worldnews', title: 'Scientists announce major breakthrough in nuclear fusion energy', votes: 124000, comments: 5820 },
    ];
    return (
      <div className="edge-sim-page edge-sim-reddit">
        <div className="edge-rd-header">
          <span className="edge-rd-logo">🤖 reddit</span>
          <div className="edge-rd-search"><span>🔍</span><input placeholder="Search Reddit" /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="edge-rd-btn-outline">Log In</button>
            <button className="edge-rd-btn-filled">Sign Up</button>
          </div>
        </div>
        <div className="edge-rd-body">
          <div className="edge-rd-feed">
            {posts.map(p => (
              <div key={p.title} className="edge-rd-post">
                <div className="edge-rd-votes">
                  <div className="edge-rd-arrow">▲</div>
                  <div className="edge-rd-count">{(p.votes / 1000).toFixed(1)}k</div>
                  <div className="edge-rd-arrow">▼</div>
                </div>
                <div className="edge-rd-content">
                  <div className="edge-rd-meta">{p.sub} • Posted by u/user</div>
                  <div className="edge-rd-title">{p.title}</div>
                  <div className="edge-rd-actions">
                    <span>💬 {p.comments} comments</span>
                    <span>🔗 Share</span>
                    <span>⭐ Save</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="edge-rd-sidebar">
            <div className="edge-rd-widget">
              <div className="edge-rd-widget-title">Home</div>
              <p style={{ fontSize: 12 }}>Your personal Reddit frontpage. Come here to check in with your favorite communities.</p>
              <button className="edge-rd-btn-filled" style={{ width: '100%' }}>Create Post</button>
              <button className="edge-rd-btn-outline" style={{ width: '100%', marginTop: 6 }}>Create Community</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (host.includes('wikipedia.org')) {
    return (
      <div className="edge-sim-page edge-sim-wiki">
        <div className="edge-wiki-header">
          <div className="edge-wiki-logo">
            <div className="edge-wiki-globe">🌐</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 20 }}>Wikipedia</div>
              <div style={{ fontSize: 11, color: '#555' }}>The Free Encyclopedia</div>
            </div>
          </div>
          <div className="edge-wiki-search">
            <input placeholder="Search Wikipedia" />
            <button>🔍</button>
          </div>
        </div>
        <div className="edge-wiki-langs">
          {['English · 6,800,000+ articles', 'Español · 1,900,000+', 'Deutsch · 2,800,000+', 'Français · 2,500,000+', 'Русский · 1,900,000+', '日本語 · 1,400,000+'].map(l => (
            <div key={l} className="edge-wiki-lang">{l}</div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 24, color: '#555', fontSize: 13 }}>
          Wikipedia is written by volunteer editors and hosted by the Wikimedia Foundation.
        </div>
      </div>
    );
  }

  if (host.includes('stackoverflow.com') || host.includes('stackexchange.com')) {
    const questions = [
      { votes: 4821, answers: 12, views: '1.2m', title: 'What is the difference between "let" and "var" in JavaScript?', tags: ['javascript', 'var', 'let'] },
      { votes: 3104, answers: 8, views: '892k', title: 'How do I check if an array includes a value in JavaScript?', tags: ['javascript', 'arrays'] },
      { votes: 2741, answers: 15, views: '760k', title: 'How to use async/await with Array.prototype.map', tags: ['javascript', 'async-await', 'promise'] },
      { votes: 1924, answers: 6, views: '540k', title: 'How to center a div in CSS?', tags: ['css', 'flexbox', 'centering'] },
    ];
    return (
      <div className="edge-sim-page edge-sim-so">
        <div className="edge-so-header">
          <span className="edge-so-logo">Stack Overflow</span>
          <input className="edge-so-search" placeholder="Search..." />
          <button className="edge-so-btn">Log in</button>
          <button className="edge-so-btn-filled">Sign up</button>
        </div>
        <div className="edge-so-body">
          <div className="edge-so-sidebar">
            {['Home', 'Questions', 'Tags', 'Users', 'Unanswered'].map(l => (
              <div key={l} className="edge-so-nav">{l}</div>
            ))}
          </div>
          <div className="edge-so-questions">
            <div className="edge-so-q-header"><h2 style={{ margin: 0 }}>Top Questions</h2></div>
            {questions.map(q => (
              <div key={q.title} className="edge-so-question">
                <div className="edge-so-stats">
                  <div className="edge-so-stat">{q.votes}<span>votes</span></div>
                  <div className="edge-so-stat edge-so-answered">{q.answers}<span>answers</span></div>
                  <div className="edge-so-stat">{q.views}<span>views</span></div>
                </div>
                <div className="edge-so-q-body">
                  <div className="edge-so-q-title">{q.title}</div>
                  <div className="edge-so-tags">{q.tags.map(t => <span key={t} className="edge-so-tag">{t}</span>)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (host.includes('news.ycombinator.com') || host.includes('ycombinator')) {
    const items = [
      { n: 1, title: 'Show HN: I built a Windows 10 simulator in React/TypeScript', pts: 842, comments: 324 },
      { n: 2, title: 'OpenAI releases GPT-5 with reasoning capabilities', pts: 1204, comments: 892 },
      { n: 3, title: 'Rust is now an allowed language in the Linux kernel', pts: 631, comments: 287 },
      { n: 4, title: 'The return of the 90s-era web aesthetic (neocities.org)', pts: 423, comments: 156 },
      { n: 5, title: 'Ask HN: What are you building?', pts: 312, comments: 480 },
    ];
    return (
      <div className="edge-sim-page" style={{ background: '#f6f6ef', fontFamily: 'Verdana, sans-serif' }}>
        <div style={{ background: '#ff6600', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ border: '1px solid #fff', padding: '2px 6px', color: '#fff', fontWeight: 700 }}>Y</div>
          <span style={{ color: '#fff', fontWeight: 700 }}>Hacker News</span>
          <span style={{ color: '#fff', marginLeft: 'auto' }}>new | past | comments | ask | show | jobs | submit</span>
        </div>
        <div style={{ padding: '8px 16px' }}>
          {items.map(item => (
            <div key={item.n} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <span style={{ color: '#828282', minWidth: 20 }}>{item.n}.</span>
              <div>
                <div style={{ fontSize: 13 }}>▲ <span style={{ color: '#000' }}>{item.title}</span></div>
                <div style={{ fontSize: 11, color: '#828282' }}>{item.pts} points | {item.comments} comments</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (host.includes('netflix.com')) {
    const shows = ['Stranger Things', 'The Crown', 'Ozark', 'Squid Game', 'Breaking Bad', 'Dark', 'Narcos', 'The Witcher'];
    return (
      <div className="edge-sim-page" style={{ background: '#141414', color: '#fff', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '12px 24px', background: 'linear-gradient(#000 0%, transparent 100%)' }}>
          <span style={{ color: '#e50914', fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>NETFLIX</span>
          <span style={{ fontSize: 13, cursor: 'pointer' }}>Home</span><span style={{ fontSize: 13, cursor: 'pointer' }}>TV Shows</span><span style={{ fontSize: 13, cursor: 'pointer' }}>Movies</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
            <span>🔍</span><span>🔔</span><span>👤</span>
          </div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ marginBottom: 20, padding: '60px 20px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 8, position: 'relative' }}>
            <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Stranger Things</div>
            <div style={{ fontSize: 14, maxWidth: 400, color: '#ccc', marginBottom: 16 }}>When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ background: '#fff', color: '#000', border: 'none', padding: '8px 20px', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>▶ Play</button>
              <button style={{ background: 'rgba(109,109,110,0.7)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>ℹ More Info</button>
            </div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Popular on Netflix</div>
          <div style={{ display: 'flex', gap: 6, overflow: 'hidden' }}>
            {shows.map(s => (
              <div key={s} style={{ minWidth: 120, height: 72, background: `hsl(${Math.random() * 360}, 40%, 25%)`, borderRadius: 4, display: 'flex', alignItems: 'flex-end', padding: 6, cursor: 'pointer', flex: '0 0 auto' }}>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (host.includes('twitter.com') || host.includes('x.com')) {
    const tweets = [
      { user: 'Elon Musk', handle: '@elonmusk', text: 'X is the future of digital communication. The everything app.', likes: 84200, rt: 12400 },
      { user: 'Microsoft', handle: '@Microsoft', text: 'Windows 11 gets smarter with new AI-powered features. Update now!', likes: 32100, rt: 8700 },
      { user: 'GitHub', handle: '@github', text: 'Copilot just got 10x better. Try it free for 30 days.', likes: 18400, rt: 5200 },
    ];
    return (
      <div className="edge-sim-page" style={{ background: '#000', color: '#fff', fontFamily: 'sans-serif', display: 'flex' }}>
        <div style={{ width: 240, borderRight: '1px solid #2f3336', padding: '12px 16px' }}>
          <div style={{ fontSize: 28, marginBottom: 24 }}>𝕏</div>
          {['Home', 'Explore', 'Notifications', 'Messages', 'Bookmarks', 'Profile'].map(n => (
            <div key={n} style={{ padding: '10px 4px', cursor: 'pointer', fontSize: 16, borderRadius: 30 }}>{n}</div>
          ))}
          <button style={{ background: '#1d9bf0', color: '#fff', border: 'none', borderRadius: 30, padding: '12px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 16, width: '100%' }}>Post</button>
        </div>
        <div style={{ flex: 1, maxWidth: 600 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #2f3336', fontSize: 18, fontWeight: 700 }}>For You</div>
          {tweets.map(t => (
            <div key={t.handle} style={{ padding: '12px 16px', borderBottom: '1px solid #2f3336' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2f3336', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>👤</div>
                <div>
                  <div style={{ fontSize: 14 }}><strong>{t.user}</strong> <span style={{ color: '#71767b' }}>{t.handle}</span></div>
                  <div style={{ fontSize: 14, marginTop: 4 }}>{t.text}</div>
                  <div style={{ display: 'flex', gap: 20, marginTop: 10, color: '#71767b', fontSize: 13 }}>
                    <span>💬 Reply</span><span>🔁 {(t.rt/1000).toFixed(1)}k</span><span>❤️ {(t.likes/1000).toFixed(1)}k</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (host.includes('waterburp.com')) {
    return (
      <div className="edge-sim-page" style={{ background: '#e8f4fd', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💧</div>
        <h1 style={{ fontSize: 32, color: '#0078d4', margin: 0 }}>Waterburp.com</h1>
        <p style={{ color: '#555', fontSize: 15, marginTop: 12 }}>The internet's #1 source for water-related content.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 24, width: '100%', maxWidth: 600 }}>
          {['💦 Water Facts', '🌊 Ocean News', '🚿 Shower Tips', '🧊 Ice Science', '🌧️ Rain Reports', '🏊 Pool Guide'].map(c => (
            <div key={c} style={{ background: '#fff', border: '1px solid #b0d8f0', borderRadius: 8, padding: 16, textAlign: 'center', cursor: 'pointer', fontSize: 14 }}>{c}</div>
          ))}
        </div>
      </div>
    );
  }

  // Private IP / LAN device pages
  if (isPrivateIp(url)) {
    try {
      const ip = new URL(url).hostname;
      // Router admin panel
      if (ip === '192.168.1.1' || ip === '10.0.0.1' || ip === '192.168.0.1') {
        return (
          <div className="edge-sim-page" style={{ background: '#1a3a5c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif' }}>
            <div style={{ background: '#0f2740', border: '1px solid #2a5080', borderRadius: 8, padding: 32, width: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ fontSize: 32 }}>📡</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>TP-Link AX3000</div>
                  <div style={{ fontSize: 12, color: '#8ab4d4' }}>Archer AX50 · {ip}</div>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#8ab4d4', display: 'block', marginBottom: 4 }}>Username</label>
                <input defaultValue="admin" style={{ width: '100%', padding: '8px 10px', background: '#1a3a5c', border: '1px solid #2a5080', borderRadius: 4, color: '#fff', fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: '#8ab4d4', display: 'block', marginBottom: 4 }}>Password</label>
                <input type="password" defaultValue="admin" style={{ width: '100%', padding: '8px 10px', background: '#1a3a5c', border: '1px solid #2a5080', borderRadius: 4, color: '#fff', fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <button style={{ width: '100%', padding: '10px', background: '#0078d4', border: 'none', borderRadius: 4, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Log In</button>
              <div style={{ marginTop: 16, fontSize: 11, color: '#8ab4d4', textAlign: 'center' }}>TP-Link Router Admin Panel · Firmware 1.2.8</div>
            </div>
          </div>
        );
      }
      // Generic device page for other LAN IPs
      const DEVICE_MAP: Record<string, { name: string; type: string; icon: string; ports: string[] }> = {
        '192.168.1.2': { name: 'DESKTOP-WIN10', type: 'Windows PC', icon: '🖥️', ports: ['80/HTTP', '445/SMB', '3389/RDP'] },
        '192.168.1.100': { name: 'iPhone-15-Pro', type: 'Apple iPhone', icon: '📱', ports: ['62078/iTunes'] },
        '192.168.1.101': { name: 'Galaxy-S24', type: 'Samsung Android', icon: '📱', ports: ['5555/ADB'] },
        '192.168.1.102': { name: 'MacBook-Pro', type: 'Apple MacBook', icon: '💻', ports: ['22/SSH', '548/AFP'] },
        '192.168.1.103': { name: 'PlayStation5', type: 'Sony PS5', icon: '🎮', ports: ['1935/RTMP', '3478/STUN'] },
        '192.168.1.104': { name: 'Xbox-Series-X', type: 'Microsoft Xbox', icon: '🎮', ports: ['3074/Xbox Live'] },
        '192.168.1.105': { name: 'Samsung-TV-65', type: 'Samsung Smart TV', icon: '📺', ports: ['8001/Tizen', '9197/DIAL'] },
        '192.168.1.110': { name: 'Chromecast', type: 'Google Chromecast', icon: '📡', ports: ['8008/Cast', '8009/Cast'] },
        '192.168.1.115': { name: 'Echo-Dot-4th', type: 'Amazon Echo', icon: '🔊', ports: ['4070/Alexa'] },
        '192.168.1.120': { name: 'RingDoorbell', type: 'Ring Video Doorbell', icon: '🔔', ports: ['443/HTTPS'] },
        '192.168.1.125': { name: 'Nest-Thermostat', type: 'Google Nest', icon: '🌡️', ports: ['9543/NEST'] },
        '192.168.1.130': { name: 'HP-LaserJet', type: 'HP Network Printer', icon: '🖨️', ports: ['80/HTTP', '9100/JetDirect', '631/IPP'] },
        '192.168.1.140': { name: 'raspberrypi', type: 'Raspberry Pi 4', icon: '🍓', ports: ['22/SSH', '80/HTTP', '5900/VNC'] },
        '192.168.1.150': { name: 'SynologyNAS', type: 'Synology NAS DS920+', icon: '💾', ports: ['5000/DSM', '5001/HTTPS', '445/SMB', '22/SSH'] },
      };
      const dev = DEVICE_MAP[ip] ?? { name: ip, type: 'Unknown Device', icon: '🖥️', ports: ['80/HTTP'] };
      return (
        <div className="edge-sim-page" style={{ background: '#f5f5f5', fontFamily: 'sans-serif', padding: 24 }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 20, background: '#fff', borderRadius: 8, border: '1px solid #ddd', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 48 }}>{dev.icon}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{dev.name}</div>
                <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{dev.type}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>IP: {ip}</div>
              </div>
              <div style={{ marginLeft: 'auto', padding: '4px 12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>● Online</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 16, background: '#fff', borderRadius: 8, border: '1px solid #ddd' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: 10 }}>Network Info</div>
                {[['IP Address', ip], ['MAC Address', `${ip.split('.').map(n => parseInt(n).toString(16).padStart(2,'0')).join(':').toUpperCase()}`], ['Hostname', dev.name], ['Subnet', '255.255.255.0'], ['Gateway', '192.168.1.1']].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <span style={{ color: '#666' }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: 16, background: '#fff', borderRadius: 8, border: '1px solid #ddd' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: 10 }}>Open Ports</div>
                {dev.ports.map(p => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', display: 'inline-block' }} />
                    <span style={{ fontWeight: 500 }}>{p.split('/')[0]}</span>
                    <span style={{ color: '#888' }}>{p.split('/')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    } catch { /* fall through */ }
  }

  // Generic simulated page
  const domainName = host.replace('www.', '').split('.')[0];
  const capName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
  return (
    <div className="edge-sim-page edge-sim-generic">
      <div className="edge-gen-icon">{capName.charAt(0)}</div>
      <div className="edge-gen-title">{url}</div>
      <div className="edge-gen-msg">
        This site cannot be displayed in the simulated browser.
      </div>
      <div className="edge-gen-sub">
        The page may require direct internet access or is blocked by the content policy.
      </div>
    </div>
  );
}

// uBlock stats (simulated)
let uBlockCount = Math.floor(Math.random() * 40) + 10;

export default function Browser({ initialUrl }: Props) {
  const [url, setUrl] = useState(initialUrl ?? DEFAULT_URL);
  const [inputUrl, setInputUrl] = useState(initialUrl ?? DEFAULT_URL);
  const [historyStack, setHistoryStack] = useState([initialUrl ?? DEFAULT_URL]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showExtensions, setShowExtensions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [tabs, setTabs] = useState([{ id: 1, url: initialUrl ?? DEFAULT_URL, title: 'New Tab' }]);
  const [activeTab] = useState(1);
  const [uBlockBlocked] = useState(uBlockCount);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);

  const navigate = (target: string) => {
    let finalUrl = target.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
        finalUrl = 'https://' + finalUrl;
      } else {
        finalUrl = 'https://www.google.com/search?q=' + encodeURIComponent(finalUrl);
      }
    }
    const newStack = historyStack.slice(0, historyIdx + 1).concat(finalUrl);
    setHistoryStack(newStack);
    setHistoryIdx(newStack.length - 1);
    setUrl(finalUrl);
    setInputUrl(finalUrl);
    setShowBookmarks(false);
    setShowExtensions(false);
    setShowMenu(false);
    setIframeKey(k => k + 1);
    // Update tab title
    setTabs(ts => ts.map(t => t.id === activeTab ? { ...t, url: finalUrl, title: getTabTitle(finalUrl) } : t));
  };

  const getTabTitle = (u: string) => {
    const h = getHost(u);
    if (h.includes('google.com')) return 'Google';
    if (h.includes('youtube.com')) return 'YouTube';
    if (h.includes('github.com')) return 'GitHub';
    if (h.includes('reddit.com')) return 'Reddit';
    if (h.includes('wikipedia.org')) return 'Wikipedia';
    if (h.includes('waterburp.com')) return 'Waterburp';
    if (h.includes('stackoverflow.com')) return 'Stack Overflow';
    if (h.includes('ycombinator.com')) return 'Hacker News';
    if (h.includes('netflix.com')) return 'Netflix';
    if (h.includes('twitter.com') || h.includes('x.com')) return 'X (Twitter)';
    try { return new URL(u).hostname.replace('www.', ''); } catch { return u; }
  };

  const goBack = () => {
    if (historyIdx > 0) {
      const newIdx = historyIdx - 1;
      setHistoryIdx(newIdx);
      const prev = historyStack[newIdx];
      setUrl(prev);
      setInputUrl(prev);
      setIframeKey(k => k + 1);
    }
  };

  const goForward = () => {
    if (historyIdx < historyStack.length - 1) {
      const newIdx = historyIdx + 1;
      setHistoryIdx(newIdx);
      const next = historyStack[newIdx];
      setUrl(next);
      setInputUrl(next);
      setIframeKey(k => k + 1);
    }
  };

  const reload = () => setIframeKey(k => k + 1);

  const isYT = isYouTube(url);

  return (
    <div className="edge-root" onClick={() => { setShowBookmarks(false); setShowExtensions(false); setShowMenu(false); }}>

      {/* Tab bar */}
      <div className="edge-tabbar" onClick={e => e.stopPropagation()}>
        {tabs.map(tab => (
          <div key={tab.id} className={`edge-tab ${tab.id === activeTab ? 'active' : ''}`}>
            <span className="edge-tab-favicon">🌐</span>
            <span className="edge-tab-title">{getTabTitle(tab.url)}</span>
            <span className="edge-tab-close" onClick={() => {}}>×</span>
          </div>
        ))}
        <button className="edge-tab-new" onClick={() => navigate(DEFAULT_URL)}>+</button>
      </div>

      {/* Toolbar */}
      <div className="edge-toolbar" onClick={e => e.stopPropagation()}>
        <button className="edge-nav-btn" onClick={goBack} disabled={historyIdx <= 0} title="Back">‹</button>
        <button className="edge-nav-btn" onClick={goForward} disabled={historyIdx >= historyStack.length - 1} title="Forward">›</button>
        <button className="edge-nav-btn" onClick={reload} title="Reload">↻</button>
        <button className="edge-nav-btn" title="Home" onClick={() => navigate(DEFAULT_URL)}>🏠</button>

        <form className="edge-url-form" onSubmit={e => { e.preventDefault(); navigate(inputUrl); }}>
          <div className="edge-url-bar">
            <span className="edge-lock-icon" title="Secure">🔒</span>
            <input
              className="edge-url-input"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              onFocus={e => { e.target.select(); }}
              spellCheck={false}
            />
            {isYT && <span className="edge-url-badge">YouTube</span>}
          </div>
        </form>

        {/* Extension: uBlock Origin */}
        <div className="edge-ext-wrap" onClick={e => { e.stopPropagation(); setShowExtensions(b => !b); setShowMenu(false); }}>
          <button className="edge-ext-btn edge-ext-ublock" title="uBlock Origin">
            <span className="edge-ext-icon">🛡️</span>
            <span className="edge-ext-badge">{uBlockBlocked}</span>
          </button>
        </div>

        {/* Extension: PDF Reader */}
        <button className="edge-ext-btn edge-ext-pdf" title="PDF Reader" onClick={e => e.stopPropagation()}>
          <span className="edge-ext-icon">📄</span>
        </button>

        <button className="edge-nav-btn" title="Add to favorites" onClick={e => { e.stopPropagation(); setShowBookmarks(b => !b); setShowExtensions(false); setShowMenu(false); }}>⭐</button>

        <button className="edge-nav-btn edge-menu-btn" title="Settings and more" onClick={e => { e.stopPropagation(); setShowMenu(b => !b); setShowBookmarks(false); setShowExtensions(false); }}>⋯</button>
      </div>

      {/* Bookmarks bar */}
      <div className="edge-bookmarks-bar" onClick={e => e.stopPropagation()}>
        {BOOKMARKS.map(b => (
          <button key={b.url} className="edge-bookmark" onClick={() => navigate(b.url)}>
            <span>{b.icon}</span> {b.label}
          </button>
        ))}
      </div>

      {/* uBlock panel */}
      {showExtensions && (
        <div className="edge-ext-panel" onClick={e => e.stopPropagation()}>
          <div className="edge-ext-panel-header">
            <span className="edge-ext-panel-icon">🛡️</span>
            <div>
              <div className="edge-ext-panel-name">uBlock Origin</div>
              <div className="edge-ext-panel-sub">Enabled on this site</div>
            </div>
          </div>
          <div className="edge-ext-panel-stat">
            <div className="edge-ext-panel-num">{uBlockBlocked}</div>
            <div className="edge-ext-panel-lbl">Requests blocked on this page</div>
          </div>
          <div className="edge-ext-panel-row">
            <span>Ads</span><span className="edge-ext-panel-badge red">{Math.floor(uBlockBlocked * 0.5)}</span>
          </div>
          <div className="edge-ext-panel-row">
            <span>Trackers</span><span className="edge-ext-panel-badge orange">{Math.floor(uBlockBlocked * 0.35)}</span>
          </div>
          <div className="edge-ext-panel-row">
            <span>Malware domains</span><span className="edge-ext-panel-badge green">0</span>
          </div>
          <button className="edge-ext-panel-btn">Open dashboard</button>
        </div>
      )}

      {/* Bookmarks panel */}
      {showBookmarks && (
        <div className="edge-bm-panel" onClick={e => e.stopPropagation()}>
          <div className="edge-bm-title">Favorites</div>
          {BOOKMARKS.map(b => (
            <button key={b.url} className="edge-bm-item" onClick={() => navigate(b.url)}>
              <span>{b.icon}</span>
              <div>
                <div className="edge-bm-name">{b.label}</div>
                <div className="edge-bm-url">{b.url}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Edge menu */}
      {showMenu && (
        <div className="edge-menu-panel" onClick={e => e.stopPropagation()}>
          {[
            ['New tab', '⊞'], ['New window', '🗔'], ['New InPrivate window', '🕵️'],
            ['—', ''],
            ['Zoom', '🔍'], ['Find on page', '🔎'], ['Print', '🖨️'], ['Save page as', '💾'],
            ['—', ''],
            ['Extensions', '🧩'], ['History', '🕐'], ['Downloads', '⬇️'],
            ['—', ''],
            ['Settings', '⚙️'], ['Help and feedback', '❓'],
          ].map(([label, icon], i) => label === '—'
            ? <div key={i} className="edge-menu-sep" />
            : <button key={label} className="edge-menu-item"><span>{icon}</span>{label}</button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="edge-content">
        {isYT ? (
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={resolveYouTube(url)}
            className="edge-iframe"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            title="YouTube"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <SimulatedPage url={url} />
        )}
      </div>
    </div>
  );
}
