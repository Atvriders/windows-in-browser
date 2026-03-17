import { useState, useEffect, useRef } from 'react';
import './OBS.css';

interface Scene {
  id: string;
  name: string;
}

interface Source {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
}

interface AudioChannel {
  id: string;
  label: string;
  volume: number;
  muted: boolean;
  meter: number[];
}

const SCENES: Scene[] = [
  { id: 'desktop', name: 'Desktop' },
  { id: 'game', name: 'Game Capture' },
  { id: 'webcam', name: 'Webcam Only' },
  { id: 'overlay', name: 'Streaming Overlay' },
];

const SOURCES_BY_SCENE: Record<string, Source[]> = {
  desktop: [
    { id: 's1', name: 'Display Capture', type: 'display', visible: true, locked: false },
    { id: 's2', name: 'Webcam', type: 'video', visible: true, locked: false },
    { id: 's3', name: 'Microphone', type: 'audio', visible: true, locked: false },
    { id: 's4', name: 'Alerts', type: 'browser', visible: true, locked: false },
  ],
  game: [
    { id: 'g1', name: 'Game Capture', type: 'game', visible: true, locked: false },
    { id: 'g2', name: 'Webcam', type: 'video', visible: true, locked: false },
    { id: 'g3', name: 'Microphone', type: 'audio', visible: true, locked: false },
    { id: 'g4', name: 'Alerts', type: 'browser', visible: true, locked: false },
    { id: 'g5', name: 'Chat Overlay', type: 'browser', visible: false, locked: false },
  ],
  webcam: [
    { id: 'w1', name: 'Webcam', type: 'video', visible: true, locked: true },
    { id: 'w2', name: 'Microphone', type: 'audio', visible: true, locked: false },
    { id: 'w3', name: 'Background', type: 'image', visible: true, locked: true },
  ],
  overlay: [
    { id: 'o1', name: 'Game Capture', type: 'game', visible: true, locked: false },
    { id: 'o2', name: 'Webcam', type: 'video', visible: true, locked: false },
    { id: 'o3', name: 'Alerts', type: 'browser', visible: true, locked: false },
    { id: 'o4', name: 'Chat Widget', type: 'browser', visible: true, locked: false },
    { id: 'o5', name: 'Microphone', type: 'audio', visible: true, locked: false },
    { id: 'o6', name: 'Background Music', type: 'audio', visible: false, locked: false },
  ],
};

const SOURCE_TYPE_ICON: Record<string, string> = {
  display: '🖥',
  video: '📷',
  audio: '🎙',
  browser: '🌐',
  game: '🎮',
  image: '🖼',
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function VUMeter({ levels, active }: { levels: number[]; active: boolean }) {
  return (
    <div className="obs-vu-meter">
      {levels.map((lvl, i) => (
        <div key={i} className="obs-vu-track">
          <div
            className={`obs-vu-bar ${active ? 'obs-vu-bar--active' : ''} ${lvl > 80 ? 'obs-vu-bar--red' : lvl > 60 ? 'obs-vu-bar--yellow' : ''}`}
            style={{ width: active ? `${lvl}%` : '0%' }}
          />
        </div>
      ))}
    </div>
  );
}

let sceneCounter = SCENES.length + 1;
let sourceCounter = 100;

export default function OBS() {
  const [activeScene, setActiveScene] = useState('desktop');
  const [previewScene, setPreviewScene] = useState('desktop');
  const [scenes, setScenes] = useState<Scene[]>(SCENES);
  const [sources, setSources] = useState<Record<string, Source[]>>(SOURCES_BY_SCENE);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [audioChannels, setAudioChannels] = useState<AudioChannel[]>([
    { id: 'desktop', label: 'Desktop Audio', volume: 75, muted: false, meter: [0, 0] },
    { id: 'mic', label: 'Mic/Aux', volume: 85, muted: false, meter: [0, 0] },
    { id: 'music', label: 'Background Music', volume: 40, muted: false, meter: [0, 0] },
  ]);

  const [showSettings, setShowSettings] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [studioMode, setStudioMode] = useState(false);
  const [streamTime, setStreamTime] = useState(0);
  const [recordTime, setRecordTime] = useState(0);
  const [cpu, setCpu] = useState(4.2);
  const [fps] = useState(30);
  const [bitrate, setBitrate] = useState(0);

  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const meterTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isActive = isStreaming || isRecording;

  // Animate audio meters when active
  useEffect(() => {
    if (isActive) {
      meterTimerRef.current = setInterval(() => {
        setAudioChannels(prev =>
          prev.map(ch => ({
            ...ch,
            meter: ch.muted
              ? [0, 0]
              : [
                  Math.floor(Math.random() * (ch.id === 'mic' ? 90 : ch.id === 'desktop' ? 70 : 45)),
                  Math.floor(Math.random() * (ch.id === 'mic' ? 85 : ch.id === 'desktop' ? 65 : 42)),
                ],
          }))
        );
        setCpu(+(3.5 + Math.random() * 4).toFixed(1));
        setBitrate(Math.floor(5800 + Math.random() * 600));
      }, 500);
    } else {
      if (meterTimerRef.current) clearInterval(meterTimerRef.current);
      setAudioChannels(prev => prev.map(ch => ({ ...ch, meter: [0, 0] })));
      setBitrate(0);
    }
    return () => {
      if (meterTimerRef.current) clearInterval(meterTimerRef.current);
    };
  }, [isActive]);

  // Stream timer
  useEffect(() => {
    if (isStreaming) {
      streamTimerRef.current = setInterval(() => setStreamTime(t => t + 1), 1000);
    } else {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
      if (!isStreaming) setStreamTime(0);
    }
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, [isStreaming]);

  // Record timer
  useEffect(() => {
    if (isRecording) {
      recordTimerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000);
    } else {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (!isRecording) setRecordTime(0);
    }
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [isRecording]);

  const toggleSourceVisibility = (sceneId: string, sourceId: string) => {
    setSources(prev => ({
      ...prev,
      [sceneId]: prev[sceneId].map(s =>
        s.id === sourceId ? { ...s, visible: !s.visible } : s
      ),
    }));
  };

  const toggleMute = (channelId: string) => {
    setAudioChannels(prev =>
      prev.map(ch =>
        ch.id === channelId ? { ...ch, muted: !ch.muted } : ch
      )
    );
  };

  const setVolume = (channelId: string, vol: number) => {
    setAudioChannels(prev =>
      prev.map(ch =>
        ch.id === channelId ? { ...ch, volume: vol } : ch
      )
    );
  };

  const handleStartStopStream = () => setIsStreaming(v => !v);
  const handleStartStopRecord = () => setIsRecording(v => !v);

  const addScene = () => {
    const id = `scene_${sceneCounter}`;
    const name = `Scene ${sceneCounter++}`;
    setScenes(prev => [...prev, { id, name }]);
    setSources(prev => ({ ...prev, [id]: [] }));
    setActiveScene(id);
    if (!studioMode) setPreviewScene(id);
  };

  const removeScene = () => {
    if (scenes.length <= 1) return;
    setScenes(prev => prev.filter(s => s.id !== activeScene));
    const next = scenes.find(s => s.id !== activeScene)!;
    setActiveScene(next.id);
    if (!studioMode) setPreviewScene(next.id);
  };

  const moveSceneUp = () => {
    setScenes(prev => {
      const i = prev.findIndex(s => s.id === activeScene);
      if (i <= 0) return prev;
      const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a;
    });
  };

  const moveSceneDown = () => {
    setScenes(prev => {
      const i = prev.findIndex(s => s.id === activeScene);
      if (i >= prev.length - 1) return prev;
      const a = [...prev]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a;
    });
  };

  const addSource = () => {
    const id = `src_${sourceCounter++}`;
    const name = `New Source ${sourceCounter - 100}`;
    setSources(prev => ({ ...prev, [activeScene]: [...(prev[activeScene] ?? []), { id, name, type: 'display', visible: true, locked: false }] }));
    setSelectedSource(id);
  };

  const removeSource = () => {
    if (!selectedSource) return;
    setSources(prev => ({ ...prev, [activeScene]: (prev[activeScene] ?? []).filter(s => s.id !== selectedSource) }));
    setSelectedSource(null);
  };

  const currentSources = sources[activeScene] ?? [];

  return (
    <div className="obs-root">
      {/* Top menu bar */}
      <div className="obs-menubar">
        {['File', 'Edit', 'View', 'Profile', 'Scene Collection', 'Tools', 'Help'].map(m => (
          <button key={m} className="obs-menu-item">{m}</button>
        ))}
      </div>

      {/* Main layout */}
      <div className="obs-body">
        {/* Left column: Scenes + Sources */}
        <div className="obs-left-col">
          {/* Scenes panel */}
          <div className="obs-panel obs-scenes-panel">
            <div className="obs-panel-header">
              <span>Scenes</span>
            </div>
            <div className="obs-panel-list">
              {scenes.map(scene => (
                <div
                  key={scene.id}
                  className={`obs-list-item ${activeScene === scene.id ? 'obs-list-item--active' : ''}`}
                  onClick={() => {
                    setActiveScene(scene.id);
                    if (!studioMode) setPreviewScene(scene.id);
                  }}
                  onDoubleClick={() => setPreviewScene(scene.id)}
                >
                  <span className="obs-scene-icon">◼</span>
                  <span className="obs-list-item-name">{scene.name}</span>
                </div>
              ))}
            </div>
            <div className="obs-panel-actions">
              <button className="obs-icon-btn" title="Add Scene" onClick={addScene}>+</button>
              <button className="obs-icon-btn" title="Remove Scene" onClick={removeScene}>−</button>
              <button className="obs-icon-btn" title="Move Up" onClick={moveSceneUp}>▲</button>
              <button className="obs-icon-btn" title="Move Down" onClick={moveSceneDown}>▼</button>
            </div>
          </div>

          {/* Sources panel */}
          <div className="obs-panel obs-sources-panel">
            <div className="obs-panel-header">
              <span>Sources</span>
            </div>
            <div className="obs-panel-list">
              {currentSources.map(source => (
                <div
                  key={source.id}
                  className={`obs-list-item ${selectedSource === source.id ? 'obs-list-item--selected' : ''}`}
                  onClick={() => setSelectedSource(source.id)}
                >
                  <button
                    className={`obs-visibility-btn ${source.visible ? '' : 'obs-visibility-btn--hidden'}`}
                    onClick={e => {
                      e.stopPropagation();
                      toggleSourceVisibility(activeScene, source.id);
                    }}
                    title={source.visible ? 'Hide' : 'Show'}
                  >
                    {source.visible ? '👁' : '🚫'}
                  </button>
                  <span className="obs-source-type-icon">{SOURCE_TYPE_ICON[source.type] ?? '■'}</span>
                  <span className={`obs-list-item-name ${!source.visible ? 'obs-list-item-name--dim' : ''}`}>
                    {source.name}
                  </span>
                  {source.locked && <span className="obs-lock-icon">🔒</span>}
                </div>
              ))}
            </div>
            <div className="obs-panel-actions">
              <button className="obs-icon-btn" title="Add Source" onClick={addSource}>+</button>
              <button className="obs-icon-btn" title="Remove Source" onClick={removeSource}>−</button>
              <button className="obs-icon-btn" title="Source Properties" onClick={() => selectedSource && setSources(prev => prev)}>⚙</button>
              <button className="obs-icon-btn" title="Move Up" onClick={() => {
                if (!selectedSource) return;
                setSources(prev => { const list = [...(prev[activeScene] ?? [])]; const i = list.findIndex(s => s.id === selectedSource); if (i > 0) { [list[i-1], list[i]] = [list[i], list[i-1]]; } return { ...prev, [activeScene]: list }; });
              }}>▲</button>
              <button className="obs-icon-btn" title="Move Down" onClick={() => {
                if (!selectedSource) return;
                setSources(prev => { const list = [...(prev[activeScene] ?? [])]; const i = list.findIndex(s => s.id === selectedSource); if (i < list.length - 1) { [list[i], list[i+1]] = [list[i+1], list[i]]; } return { ...prev, [activeScene]: list }; });
              }}>▼</button>
            </div>
          </div>
        </div>

        {/* Center: Preview */}
        <div className="obs-center-col">
          <div className="obs-preview-area">
            {studioMode && (
              <div className="obs-studio-label obs-studio-label--preview">PREVIEW</div>
            )}
            <div className="obs-preview-screen">
              <div className="obs-preview-inner">
                <div className="obs-preview-grid" />
                <div className="obs-preview-label">
                  {SCENES.find(s => s.id === (studioMode ? previewScene : activeScene))?.name ?? 'Preview'}
                </div>
                {isStreaming && (
                  <div className="obs-preview-live-badge">● LIVE</div>
                )}
                {isRecording && !isStreaming && (
                  <div className="obs-preview-rec-badge">● REC</div>
                )}
              </div>
            </div>
            {studioMode && (
              <>
                <div className="obs-studio-divider" />
                <div className="obs-studio-label obs-studio-label--program">PROGRAM</div>
                <div className="obs-preview-screen obs-program-screen">
                  <div className="obs-preview-inner obs-program-inner">
                    <div className="obs-preview-grid" />
                    <div className="obs-preview-label">
                      {SCENES.find(s => s.id === activeScene)?.name ?? 'Program'}
                    </div>
                  </div>
                </div>
                <button
                  className="obs-transition-btn"
                  onClick={() => setActiveScene(previewScene)}
                >
                  Cut
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right column: Controls */}
        <div className="obs-right-col">
          <div className="obs-panel obs-controls-panel">
            <div className="obs-panel-header">Controls</div>
            <div className="obs-controls-list">
              <button
                className={`obs-control-btn ${isStreaming ? 'obs-control-btn--stop' : 'obs-control-btn--stream'}`}
                onClick={handleStartStopStream}
              >
                <span className="obs-ctrl-icon">{isStreaming ? '■' : '▶'}</span>
                {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
              </button>
              {isStreaming && (
                <div className="obs-control-timer obs-control-timer--live">
                  <span className="obs-live-dot" /> LIVE &nbsp; {formatTime(streamTime)}
                </div>
              )}

              <button
                className={`obs-control-btn ${isRecording ? 'obs-control-btn--stop' : 'obs-control-btn--record'}`}
                onClick={handleStartStopRecord}
              >
                <span className="obs-ctrl-icon">{isRecording ? '■' : '⏺'}</span>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
              {isRecording && (
                <div className="obs-control-timer obs-control-timer--rec">
                  <span className="obs-rec-dot" /> REC &nbsp; {formatTime(recordTime)}
                </div>
              )}

              <div className="obs-controls-divider" />

              <button
                className={`obs-control-btn obs-control-btn--neutral ${studioMode ? 'obs-control-btn--active' : ''}`}
                onClick={() => setStudioMode(s => !s)}
              >
                <span className="obs-ctrl-icon">◧</span>
                Studio Mode
              </button>

              <button className="obs-control-btn obs-control-btn--neutral" onClick={() => setShowSettings(true)}>
                <span className="obs-ctrl-icon">⚙</span>
                Settings
              </button>

              <button className="obs-control-btn obs-control-btn--exit">
                <span className="obs-ctrl-icon">✕</span>
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Mixer */}
      <div className="obs-mixer">
        <div className="obs-panel-header obs-mixer-header">
          <span>Audio Mixer</span>
          <button className="obs-mixer-settings-btn" title="Audio Settings">⚙</button>
        </div>
        <div className="obs-mixer-channels">
          {audioChannels.map(ch => (
            <div key={ch.id} className="obs-audio-channel">
              <div className="obs-channel-label">{ch.label}</div>
              <VUMeter levels={ch.meter} active={isActive && !ch.muted} />
              <div className="obs-channel-controls">
                <button
                  className={`obs-mute-btn ${ch.muted ? 'obs-mute-btn--muted' : ''}`}
                  onClick={() => toggleMute(ch.id)}
                  title={ch.muted ? 'Unmute' : 'Mute'}
                >
                  {ch.muted ? '🔇' : '🔊'}
                </button>
                <div className="obs-volume-wrap">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={ch.volume}
                    onChange={e => setVolume(ch.id, +e.target.value)}
                    className="obs-volume-slider"
                    title={`${ch.volume}%`}
                  />
                  <span className="obs-volume-val">{ch.volume}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showSettings && (
        <div className="obs-settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="obs-settings-panel" onClick={e => e.stopPropagation()}>
            <div className="obs-settings-header">
              <span>⚙ Settings</span>
              <button className="obs-settings-close-btn" onClick={() => setShowSettings(false)}>✕</button>
            </div>
            <div className="obs-settings-body">
              <div className="obs-settings-section">Stream</div>
              <div className="obs-settings-row"><span>Service:</span><span>Twitch</span></div>
              <div className="obs-settings-row"><span>Server:</span><span>Auto (Recommended)</span></div>
              <div className="obs-settings-row"><span>Stream Key:</span><span>••••••••••••</span></div>
              <div className="obs-settings-section">Output</div>
              <div className="obs-settings-row"><span>Video Bitrate:</span><span>6000 Kbps</span></div>
              <div className="obs-settings-row"><span>Audio Bitrate:</span><span>160 Kbps</span></div>
              <div className="obs-settings-row"><span>Encoder:</span><span>x264</span></div>
              <div className="obs-settings-row"><span>Rate Control:</span><span>CBR</span></div>
              <div className="obs-settings-section">Video</div>
              <div className="obs-settings-row"><span>Base Resolution:</span><span>1920×1080</span></div>
              <div className="obs-settings-row"><span>Output Resolution:</span><span>1920×1080</span></div>
              <div className="obs-settings-row"><span>FPS:</span><span>30</span></div>
              <div className="obs-settings-section">Audio</div>
              <div className="obs-settings-row"><span>Sample Rate:</span><span>44.1 kHz</span></div>
              <div className="obs-settings-row"><span>Channels:</span><span>Stereo</span></div>
            </div>
            <div className="obs-settings-footer">
              <button className="obs-settings-ok-btn" onClick={() => setShowSettings(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="obs-statusbar">
        <div className="obs-status-left">
          {isStreaming ? (
            <span className="obs-status-live">
              <span className="obs-live-dot obs-live-dot--sm" />
              LIVE
            </span>
          ) : (
            <span className="obs-status-idle">Idle</span>
          )}
        </div>
        <div className="obs-status-stats">
          <span className="obs-stat">
            <span className="obs-stat-label">CPU:</span>
            <span className={`obs-stat-val ${isActive ? 'obs-stat-val--active' : ''}`}>{cpu}%</span>
          </span>
          <span className="obs-stat-sep">|</span>
          <span className="obs-stat">
            <span className="obs-stat-label">RAM:</span>
            <span className="obs-stat-val">412 MB</span>
          </span>
          <span className="obs-stat-sep">|</span>
          <span className="obs-stat">
            <span className="obs-stat-label">FPS:</span>
            <span className="obs-stat-val">{fps}</span>
          </span>
          <span className="obs-stat-sep">|</span>
          <span className="obs-stat">
            <span className="obs-stat-label">Bitrate:</span>
            <span className={`obs-stat-val ${isActive ? 'obs-stat-val--active' : ''}`}>
              {isActive ? `${bitrate} kb/s` : '0 kb/s'}
            </span>
          </span>
          <span className="obs-stat-sep">|</span>
          <span className="obs-stat">
            <span className="obs-stat-label">Dropped:</span>
            <span className="obs-stat-val">0 (0%)</span>
          </span>
          <span className="obs-stat-sep">|</span>
          <span className="obs-stat">
            <span className="obs-stat-label">Output:</span>
            <span className="obs-stat-val">1920x1080</span>
          </span>
        </div>
        <div className="obs-status-right">
          <span className="obs-stat">OBS Studio 30.1.2</span>
        </div>
      </div>
    </div>
  );
}
