import { useState, useRef } from 'react';
import './Browser.css';

interface Props { initialUrl?: string; }

const DEFAULT_URL = 'https://www.google.com';
const PROXY = '/proxy?url=';

const BOOKMARKS = [
  { label: 'Google', url: 'https://www.google.com', icon: '🔍' },
  { label: 'YouTube', url: 'https://www.youtube.com', icon: '▶️' },
  { label: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { label: 'Reddit', url: 'https://www.reddit.com', icon: '🤖' },
  { label: 'Wikipedia', url: 'https://www.wikipedia.org', icon: '📖' },
  { label: 'Waterburp', url: 'https://www.waterburp.com', icon: '💧' },
  { label: 'Hacker News', url: 'https://news.ycombinator.com', icon: '📰' },
  { label: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '💬' },
  { label: 'Twitter/X', url: 'https://www.twitter.com', icon: '🐦' },
  { label: 'Netflix', url: 'https://www.netflix.com', icon: '🎬' },
];

// Convert YouTube URLs to embeddable format, proxy everything else
function resolveUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube-nocookie.com/embed/${u.searchParams.get('v')}?autoplay=0`;
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube-nocookie.com/embed${u.pathname}`;
    }
    if (u.hostname.includes('youtube.com')) {
      return 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ';
    }
  } catch { /* not a valid URL */ }
  return PROXY + encodeURIComponent(url);
}

export default function Browser({ initialUrl }: Props) {
  const [url, setUrl] = useState(initialUrl ?? DEFAULT_URL);
  const [inputUrl, setInputUrl] = useState(initialUrl ?? DEFAULT_URL);
  const [historyStack, setHistoryStack] = useState([initialUrl ?? DEFAULT_URL]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigate = (target: string) => {
    let finalUrl = target.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      // Check if it looks like a URL or a search query
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
    setIframeKey(k => k + 1);
    setShowBookmarks(false);
  };

  const goBack = () => {
    if (historyIdx > 0) {
      const newIdx = historyIdx - 1;
      setHistoryIdx(newIdx);
      setUrl(historyStack[newIdx]);
      setInputUrl(historyStack[newIdx]);
      setIframeKey(k => k + 1);
    }
  };

  const goForward = () => {
    if (historyIdx < historyStack.length - 1) {
      const newIdx = historyIdx + 1;
      setHistoryIdx(newIdx);
      setUrl(historyStack[newIdx]);
      setInputUrl(historyStack[newIdx]);
      setIframeKey(k => k + 1);
    }
  };

  const reload = () => setIframeKey(k => k + 1);

  return (
    <div className="browser">
      <div className="browser-toolbar">
        <button className="browser-nav-btn" onClick={goBack} disabled={historyIdx <= 0}>‹</button>
        <button className="browser-nav-btn" onClick={goForward} disabled={historyIdx >= historyStack.length - 1}>›</button>
        <button className="browser-nav-btn" onClick={reload} title="Reload">↻</button>
        <form className="browser-url-form" onSubmit={e => { e.preventDefault(); navigate(inputUrl); }}>
          <div className="browser-url-wrap">
            <span className="browser-secure-icon">🔒</span>
            <input
              className="browser-url-input"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              onFocus={e => { e.target.select(); setShowBookmarks(false); }}
              spellCheck={false}
            />
          </div>
          <button type="submit" className="browser-go-btn">Go</button>
        </form>
        <button className="browser-nav-btn" title="Bookmarks" onClick={() => setShowBookmarks(b => !b)}>⭐</button>
      </div>
      <div className="browser-bookmarks-bar">
        {BOOKMARKS.map(b => (
          <button key={b.url} className="browser-bookmark" onClick={() => navigate(b.url)}>
            <span>{b.icon}</span> {b.label}
          </button>
        ))}
      </div>
      {showBookmarks && (
        <div className="browser-bookmark-panel">
          <div className="browser-bp-title">Bookmarks</div>
          {BOOKMARKS.map(b => (
            <button key={b.url} className="browser-bp-item" onClick={() => navigate(b.url)}>
              <span>{b.icon}</span>
              <div>
                <div className="browser-bp-name">{b.label}</div>
                <div className="browser-bp-url">{b.url}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="browser-content">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={resolveUrl(url)}
          className="browser-iframe"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
          title="browser"
        />
      </div>
    </div>
  );
}
