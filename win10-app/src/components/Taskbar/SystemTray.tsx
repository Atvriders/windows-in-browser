import { useState, useEffect, useRef } from 'react';
import { useWindowStore } from '../../store/useWindowStore';
import './SystemTray.css';

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

export default function SystemTray() {
  const { openWindow } = useWindowStore();
  const [time, setTime] = useState(new Date());
  const [showNetwork, setShowNetwork] = useState(false);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'wifi' | 'bluetooth'>('wifi');
  const [connectedWifi, setConnectedWifi] = useState('HomeNetwork_5G');

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
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });

  const batteryColor = battery > 40 ? '#4caf50' : battery > 20 ? '#ff9800' : '#f44336';

  return (
    <div className="system-tray" ref={panelRef}>
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

      <button className="tray-icon" title="Network" onClick={() => { setShowNetwork(p => !p); setShowBattery(false); }}>
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

      <div className="tray-clock">
        <div className="tray-time">{timeStr}</div>
        <div className="tray-date">{dateStr}</div>
      </div>
    </div>
  );
}
