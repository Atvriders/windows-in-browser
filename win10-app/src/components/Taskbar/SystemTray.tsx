import { useState, useEffect, useRef } from 'react';
import { useWindowStore } from '../../store/useWindowStore';
import './SystemTray.css';

function GlobeIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: 'block' }}>
      <circle cx="8" cy="8" r="6.5" stroke={color} strokeWidth="1.4" />
      <ellipse cx="8" cy="8" rx="3.5" ry="6.5" stroke={color} strokeWidth="1.4" />
      <line x1="1.5" y1="8" x2="14.5" y2="8" stroke={color} strokeWidth="1.2" />
      <line x1="2.5" y1="4.8" x2="13.5" y2="4.8" stroke={color} strokeWidth="1" />
      <line x1="2.5" y1="11.2" x2="13.5" y2="11.2" stroke={color} strokeWidth="1" />
    </svg>
  );
}

const WIFI_NETWORKS = [
  { ssid: 'HomeNetwork_5G', signal: 4, secured: true },
  { ssid: 'HomeNetwork_2.4G', signal: 3, secured: true },
  { ssid: 'NETGEAR_5G_EXT', signal: 4, secured: true },
  { ssid: 'Neighbor_WiFi_2G', signal: 2, secured: true },
  { ssid: 'CoffeeShop_Free', signal: 3, secured: false },
  { ssid: 'Office_Network', signal: 2, secured: true },
  { ssid: 'AndroidHotspot_Mike', signal: 2, secured: true },
  { ssid: 'TP-Link_4A8C', signal: 1, secured: true },
  { ssid: 'XFINITY_WIFI_PUBLIC', signal: 3, secured: false },
  { ssid: 'Marriott_Guest', signal: 1, secured: false },
];

const BT_DEVICES = [
  { name: 'AirPods Pro', type: '🎧', connected: true },
  { name: 'Magic Keyboard', type: '⌨️', connected: true },
  { name: 'Xbox Controller', type: '🎮', connected: false },
  { name: 'iPhone 15', type: '📱', connected: false },
];

function SignalBars({ strength }: { strength: number }) {
  return (
    <span className="signal-bars">
      {[1,2,3,4].map(i => (
        <span key={i} className={`signal-bar ${i <= strength ? 'active' : ''}`} />
      ))}
    </span>
  );
}

// Battery drains from 100 to 0 over exactly 1 hour (3600 seconds)
// Each tick = 36 seconds = 1%
const BATTERY_DRAIN_INTERVAL = 36 * 1000;

function getBatteryIcon(pct: number, charging = false) {
  if (charging) return '🔋';
  if (pct > 80) return '🔋';
  if (pct > 50) return '🔋';
  if (pct > 20) return '🪫';
  if (pct > 10) return '🪫';
  return '🪫';
}

const NOTIFICATIONS = [
  { id: 1, app: 'Discord', icon: '💬', title: 'New message from Alex', body: 'hey are you free later?', time: '2 min ago' },
  { id: 2, app: 'Windows Update', icon: '🪟', title: 'Updates are ready', body: 'Restart to finish installing 3 updates.', time: '18 min ago' },
  { id: 3, app: 'Malwarebytes', icon: '🛡️', title: 'Scan complete', body: 'No threats detected in the last scan.', time: '1 hr ago' },
  { id: 4, app: 'Outlook', icon: '📧', title: 'You have 4 unread emails', body: 'Including: "Re: Project deadline"', time: '2 hr ago' },
  { id: 5, app: 'Steam', icon: '🎮', title: 'Friend online', body: 'Jake is now playing CS2', time: '3 hr ago' },
];

export default function SystemTray() {
  const { openWindow } = useWindowStore();
  const [time, setTime] = useState(new Date());
  const [showNetwork, setShowNetwork] = useState(false);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'wifi' | 'bluetooth'>('wifi');
  const [connectedWifi, setConnectedWifi] = useState('HomeNetwork_5G');
  const [showActionCenter, setShowActionCenter] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [nightLight, setNightLight] = useState(false);
  const [quietHours, setQuietHours] = useState(false);
  const actionCenterRef = useRef<HTMLDivElement>(null);

  // GlobalProtect
  const [showTrayOverflow, setShowTrayOverflow] = useState(false);
  const [gpConnected, setGpConnected] = useState(false);
  const [showGPPanel, setShowGPPanel] = useState(false);
  const [gpConnecting, setGpConnecting] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);
  const gpPanelRef = useRef<HTMLDivElement>(null);

  // Battery
  const [battery, setBattery] = useState(100);
  const [showBattery, setShowBattery] = useState(false);
  const [dead, setDead] = useState(false);
  const batteryRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Battery drain
  useEffect(() => {
    const id = setInterval(() => {
      setBattery(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setDead(true);
          return 0;
        }
        return prev - 1;
      });
    }, BATTERY_DRAIN_INTERVAL);
    return () => clearInterval(id);
  }, []);

  // Reset dead animation after 4s
  useEffect(() => {
    if (dead) {
      const t = setTimeout(() => {
        setDead(false);
        setBattery(100); // recharge
      }, 6000);
      return () => clearTimeout(t);
    }
  }, [dead]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNetwork(false);
      }
      if (batteryRef.current && !batteryRef.current.contains(e.target as Node)) {
        setShowBattery(false);
      }
      if (actionCenterRef.current && !actionCenterRef.current.contains(e.target as Node)) {
        setShowActionCenter(false);
      }
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node) &&
          gpPanelRef.current && !gpPanelRef.current.contains(e.target as Node)) {
        setShowTrayOverflow(false);
      }
      if (gpPanelRef.current && !gpPanelRef.current.contains(e.target as Node) &&
          overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setShowGPPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });

  const handleGPConnect = () => {
    setGpConnecting(true);
    setTimeout(() => {
      setGpConnecting(false);
      setGpConnected(true);
      setShowGPPanel(false);
    }, 2200);
  };

  const handleGPDisconnect = () => {
    setGpConnected(false);
    setShowGPPanel(false);
  };

  const closeAll = () => {
    setShowNetwork(false);
    setShowBattery(false);
    setShowActionCenter(false);
    setShowGPPanel(false);
  };

  const batteryColor = battery > 40 ? '#4caf50' : battery > 20 ? '#ff9800' : '#f44336';

  return (
    <div className="system-tray" ref={panelRef} style={{ position: 'relative' }}>
      {dead && (
        <div className="battery-dead-overlay">
          <div className="battery-dead-anim">
            <div className="battery-dead-icon">⚡</div>
            <div className="battery-dead-text">stealing your power to recharge</div>
            <div className="battery-dead-bar">
              <div className="battery-dead-fill" />
            </div>
          </div>
        </div>
      )}

      {showNetwork && (
        <div className="network-panel">
          <div className="network-panel-tabs">
            <button className={`np-tab ${activeTab === 'wifi' ? 'active' : ''}`} onClick={() => setActiveTab('wifi')}>🌐 Wi-Fi</button>
            <button className={`np-tab ${activeTab === 'bluetooth' ? 'active' : ''}`} onClick={() => setActiveTab('bluetooth')}>🔵 Bluetooth</button>
          </div>

          {activeTab === 'wifi' && (
            <div className="np-body">
              <div className="np-toggle-row">
                <span>Wi-Fi</span>
                <button className={`np-toggle ${wifiEnabled ? 'on' : ''}`} onClick={() => setWifiEnabled(e => !e)}>
                  <span className="np-toggle-thumb" />
                </button>
              </div>
              {wifiEnabled && (
                <>
                  <div className="np-connected-label">Connected</div>
                  <div className="np-network active">
                    <SignalBars strength={4} />
                    <div className="np-network-info">
                      <span className="np-network-name">{connectedWifi}</span>
                      <span className="np-network-status">Connected, secured</span>
                    </div>
                    <button className="np-disconnect-btn">Disconnect</button>
                  </div>
                  <div className="np-section-label">Available networks</div>
                  {WIFI_NETWORKS.filter(n => n.ssid !== connectedWifi).map(net => (
                    <div key={net.ssid} className="np-network" onClick={() => setConnectedWifi(net.ssid)}>
                      <SignalBars strength={net.signal} />
                      <div className="np-network-info">
                        <span className="np-network-name">{net.ssid}</span>
                        <span className="np-network-status">{net.secured ? 'Secured' : 'Open'}</span>
                      </div>
                      <button className="np-connect-btn" onClick={e => { e.stopPropagation(); setConnectedWifi(net.ssid); }}>Connect</button>
                    </div>
                  ))}
                  <button className="np-manage-btn" onClick={() => { setShowNetwork(false); openWindow('settings', 'Settings', { initialPage: 'network' }); }}>Network settings</button>
                </>
              )}
            </div>
          )}

          {activeTab === 'bluetooth' && (
            <div className="np-body">
              <div className="np-toggle-row">
                <span>Bluetooth</span>
                <button className={`np-toggle ${bluetoothEnabled ? 'on' : ''}`} onClick={() => setBluetoothEnabled(e => !e)}>
                  <span className="np-toggle-thumb" />
                </button>
              </div>
              {bluetoothEnabled && (
                <>
                  <div className="np-section-label">My devices</div>
                  {BT_DEVICES.map(dev => (
                    <div key={dev.name} className="np-bt-device">
                      <span className="np-bt-icon">{dev.type}</span>
                      <div className="np-network-info">
                        <span className="np-network-name">{dev.name}</span>
                        <span className="np-network-status" style={{ color: dev.connected ? '#6bc46d' : '#aaa' }}>
                          {dev.connected ? 'Connected' : 'Paired'}
                        </span>
                      </div>
                      <button className="np-disconnect-btn">{dev.connected ? 'Disconnect' : 'Connect'}</button>
                    </div>
                  ))}
                  <button className="np-manage-btn">Add a device</button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Battery popup */}
      {showBattery && (
        <div className="battery-panel" ref={batteryRef}>
          <div className="battery-panel-header">
            <span style={{ fontSize: 28 }}>{getBatteryIcon(battery)}</span>
            <div>
              <div className="battery-panel-pct">{battery}%</div>
              <div className="battery-panel-status">{battery > 20 ? 'Battery good' : battery > 10 ? 'Battery low' : 'Critical — plug in soon!'}</div>
            </div>
          </div>
          <div className="battery-panel-bar-track">
            <div className="battery-panel-bar-fill" style={{ width: `${battery}%`, background: batteryColor }} />
          </div>
          <div className="battery-panel-time">
            {battery > 0 ? `~${Math.round(battery * 0.6)} min remaining` : 'Charging…'}
          </div>
          <button className="np-manage-btn" onClick={() => { setShowBattery(false); openWindow('settings', 'Settings', { initialPage: 'system' }); }}>
            Power & battery settings
          </button>
        </div>
      )}

      {/* Action Center panel */}
      {showActionCenter && (
        <div className="action-center" ref={actionCenterRef}>
          <div className="ac-header">
            <span className="ac-title">Notification Center</span>
            {notifications.length > 0 && (
              <button className="ac-clear-all" onClick={() => setNotifications([])}>Clear all</button>
            )}
          </div>
          <div className="ac-notifications">
            {notifications.length === 0
              ? <div className="ac-no-notifs">No new notifications</div>
              : notifications.map(n => (
                <div key={n.id} className="ac-notif">
                  <span className="ac-notif-icon">{n.icon}</span>
                  <div className="ac-notif-body">
                    <div className="ac-notif-app">{n.app} · {n.time}</div>
                    <div className="ac-notif-title">{n.title}</div>
                    <div className="ac-notif-text">{n.body}</div>
                  </div>
                  <button className="ac-notif-dismiss" onClick={() => setNotifications(ns => ns.filter(x => x.id !== n.id))}>✕</button>
                </div>
              ))
            }
          </div>
          <div className="ac-quick-actions">
            <button className={`ac-qa ${wifiEnabled && !airplaneMode ? 'active' : ''}`} onClick={() => setWifiEnabled(v => !v)}>
              <span>🌐</span><span>Wi-Fi</span>
            </button>
            <button className={`ac-qa ${bluetoothEnabled ? 'active' : ''}`} onClick={() => setBluetoothEnabled(v => !v)}>
              <span>🔵</span><span>Bluetooth</span>
            </button>
            <button className={`ac-qa ${airplaneMode ? 'active' : ''}`} onClick={() => setAirplaneMode(v => !v)}>
              <span>✈️</span><span>Airplane</span>
            </button>
            <button className={`ac-qa ${nightLight ? 'active' : ''}`} onClick={() => setNightLight(v => !v)}>
              <span>🌙</span><span>Night light</span>
            </button>
            <button className={`ac-qa ${quietHours ? 'active' : ''}`} onClick={() => setQuietHours(v => !v)}>
              <span>🔕</span><span>Quiet hours</span>
            </button>
            <button className="ac-qa" onClick={() => { setShowActionCenter(false); openWindow('settings', 'Settings'); }}>
              <span>⚙️</span><span>All settings</span>
            </button>
          </div>
        </div>
      )}

      {/* Tray overflow popup */}
      {showTrayOverflow && (
        <div className="tray-overflow-popup" ref={overflowRef}>
          <button
            className="tray-overflow-icon"
            title={`GlobalProtect — ${gpConnected ? 'Connected' : 'Disconnected'}`}
            onClick={() => { setShowGPPanel(p => !p); }}
          >
            <GlobeIcon color={gpConnected ? '#4fc3f7' : '#8a8a8a'} size={18} />
          </button>
        </div>
      )}

      {/* GlobalProtect panel */}
      {showGPPanel && (
        <div className="gp-panel" ref={gpPanelRef}>
          <div className="gp-panel-header">
            <GlobeIcon color={gpConnected ? '#4fc3f7' : '#8a8a8a'} size={22} />
            <div>
              <div className="gp-panel-title">GlobalProtect</div>
              <div className="gp-panel-subtitle">Palo Alto Networks</div>
            </div>
          </div>
          <div className={`gp-status ${gpConnected ? 'gp-status-connected' : gpConnecting ? 'gp-status-connecting' : 'gp-status-disconnected'}`}>
            {gpConnecting ? (
              <><span className="gp-spinner">⟳</span> Connecting…</>
            ) : gpConnected ? (
              <><span>●</span> Connected</>
            ) : (
              <><span>●</span> Not connected</>
            )}
          </div>
          {gpConnected && (
            <div className="gp-detail-rows">
              <div className="gp-detail-row"><span>Gateway</span><span>corp-gw.vpn.corp.local</span></div>
              <div className="gp-detail-row"><span>IP</span><span>10.200.1.42</span></div>
            </div>
          )}
          <div className="gp-btn-row">
            {!gpConnected && !gpConnecting && (
              <button className="gp-connect-btn" onClick={handleGPConnect}>Connect</button>
            )}
            {gpConnected && (
              <button className="gp-disconnect-btn" onClick={handleGPDisconnect}>Disconnect</button>
            )}
          </div>
        </div>
      )}

      {/* Up arrow — show hidden icons */}
      <button
        className={`tray-overflow-btn ${showTrayOverflow ? 'active' : ''}`}
        title="Show hidden icons"
        onClick={() => { setShowTrayOverflow(p => !p); closeAll(); }}
      >
        ‹
      </button>

      <button className="tray-icon" title="Network" onClick={() => { setShowNetwork(p => !p); setShowBattery(false); setShowActionCenter(false); }}>
        {wifiEnabled ? '🌐' : '📵'}
      </button>
      <button className="tray-icon" title="Volume">🔊</button>

      {/* Battery indicator */}
      <button
        className="tray-battery"
        title={`Battery: ${battery}%`}
        onClick={() => { setShowBattery(p => !p); setShowNetwork(false); }}
      >
        <div className="tray-battery-bar">
          <div className="tray-battery-fill" style={{ width: `${battery}%`, background: batteryColor }} />
        </div>
        <span className="tray-battery-pct">{battery}%</span>
      </button>

      <button
        className="tray-icon"
        title="Action Center"
        onClick={() => { setShowActionCenter(p => !p); setShowNetwork(false); setShowBattery(false); }}
        style={{ position: 'relative' }}
      >
        🔔
        {notifications.length > 0 && (
          <span className="ac-badge">{notifications.length}</span>
        )}
      </button>

      <div className="tray-clock">
        <div className="tray-time">{timeStr}</div>
        <div className="tray-date">{dateStr}</div>
      </div>
    </div>
  );
}
