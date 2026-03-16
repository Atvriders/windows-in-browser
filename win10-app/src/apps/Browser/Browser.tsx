import { useState, useRef } from 'react';
import './Browser.css';

interface Props { initialUrl?: string; }

const DEFAULT_URL = 'https://example.com';
const PROXY = '/proxy?url=';

const proxyUrl = (url: string) => PROXY + encodeURIComponent(url);

export default function Browser({ initialUrl }: Props) {
  const [url, setUrl] = useState(initialUrl ?? DEFAULT_URL);
  const [inputUrl, setInputUrl] = useState(initialUrl ?? DEFAULT_URL);
  const [historyStack, setHistoryStack] = useState([initialUrl ?? DEFAULT_URL]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigate = (target: string) => {
    let finalUrl = target.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    const newStack = historyStack.slice(0, historyIdx + 1).concat(finalUrl);
    setHistoryStack(newStack);
    setHistoryIdx(newStack.length - 1);
    setUrl(finalUrl);
    setInputUrl(finalUrl);
    setIframeKey(k => k + 1);
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
          <input
            className="browser-url-input"
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            onFocus={e => e.target.select()}
            spellCheck={false}
          />
          <button type="submit" className="browser-go-btn">Go</button>
        </form>
      </div>
      <div className="browser-content">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={proxyUrl(url)}
          className="browser-iframe"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title="browser"
        />
      </div>
    </div>
  );
}
