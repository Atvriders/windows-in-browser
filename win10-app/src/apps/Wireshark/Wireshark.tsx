import { useState, useEffect, useRef } from 'react';
import { useFileSystemStore } from '../../store/useFileSystemStore';
import FilePicker from '../../components/FilePicker/FilePicker';
import './Wireshark.css';

type Proto = 'TCP' | 'UDP' | 'DNS' | 'HTTP' | 'TLS' | 'ARP' | 'ICMP';

interface Packet {
  no: number;
  time: string;
  src: string;
  dst: string;
  proto: Proto;
  len: number;
  info: string;
}

const LAN_IPS = ['192.168.1.1', '192.168.1.105', '192.168.1.110', '192.168.1.200'];
const EXT_IPS = ['8.8.8.8', '142.250.80.46', '151.101.1.140', '31.13.72.36', '185.60.216.35', '172.217.14.206', '104.244.42.65', '13.107.42.16'];
const PROTO_LIST: Proto[] = ['TCP', 'UDP', 'DNS', 'HTTP', 'TLS', 'ARP', 'ICMP'];
const PROTO_WEIGHTS = [0.35, 0.2, 0.15, 0.1, 0.12, 0.04, 0.04];

const INFOS: Record<Proto, string[]> = {
  TCP: ['[SYN] Seq=0 Win=64240 Len=0', '[ACK] Seq=1 Ack=1 Win=8192 Len=0', '[FIN, ACK] Seq=4212 Ack=289', '[PSH, ACK] Seq=289 Ack=1 Len=524', 'Connection establishment'],
  UDP: ['Source port: 5353  Destination port: 5353', 'Source port: 53  Destination port: 1025', 'mDNS query response', 'UDP datagram Len=62'],
  DNS: ['Standard query A google.com', 'Standard query response A 142.250.80.46', 'Standard query AAAA reddit.com', 'Query: discord.com type A'],
  HTTP: ['GET /favicon.ico HTTP/1.1', 'HTTP/1.1 200 OK  (text/html)', 'POST /api/metrics HTTP/1.1', 'GET / HTTP/1.1 (application/json)'],
  TLS: ['Client Hello', 'Server Hello, Certificate, Server Hello Done', 'Change Cipher Spec, Encrypted Handshake', 'Application Data', 'Encrypted Alert'],
  ARP: ['Who has 192.168.1.1? Tell 192.168.1.105', 'is at 7c:57:3c:4a:8b:12', 'Gratuitous ARP for 192.168.1.105'],
  ICMP: ['Echo (ping) request  id=0x0001, seq=1', 'Echo (ping) reply    id=0x0001, seq=1', 'Destination unreachable (Port unreachable)', 'Time-to-live exceeded'],
};

function pickProto(): Proto {
  const r = Math.random();
  let cum = 0;
  for (let i = 0; i < PROTO_LIST.length; i++) {
    cum += PROTO_WEIGHTS[i];
    if (r < cum) return PROTO_LIST[i];
  }
  return 'TCP';
}

function randIp(local: boolean) {
  return local ? LAN_IPS[Math.floor(Math.random() * LAN_IPS.length)] : EXT_IPS[Math.floor(Math.random() * EXT_IPS.length)];
}

function genPacket(no: number, elapsed: number): Packet {
  const proto = pickProto();
  const isLocal = proto === 'ARP' || Math.random() < 0.4;
  const src = isLocal ? '192.168.1.105' : randIp(Math.random() < 0.3);
  const dst = proto === 'ARP' ? randIp(true) : randIp(Math.random() < 0.4);
  const info = INFOS[proto][Math.floor(Math.random() * INFOS[proto].length)];
  const len = proto === 'ARP' ? 42 : Math.floor(Math.random() * 1400) + 60;
  return {
    no, proto, src, dst, info, len,
    time: elapsed.toFixed(6),
  };
}

function hexRow(offset: number, bytes: number[]) {
  const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join(' ');
  const ascii = bytes.map(b => (b >= 0x20 && b < 0x7f) ? String.fromCharCode(b) : '.').join('');
  return { offset: offset.toString(16).padStart(4, '0'), hex, ascii };
}

function buildHexDump(len: number) {
  const bytes: number[] = Array.from({ length: Math.min(len, 160) }, () => Math.floor(Math.random() * 256));
  const rows = [];
  for (let i = 0; i < bytes.length; i += 16) {
    rows.push(hexRow(i, bytes.slice(i, i + 16)));
  }
  return rows;
}

function buildDetail(p: Packet) {
  return [
    {
      label: `Frame ${p.no}: ${p.len} bytes on wire`,
      children: [`Encapsulation type: Ethernet (1)`, `Arrival Time: ${new Date().toUTCString()}`, `Frame Length: ${p.len} bytes`, `Capture Length: ${p.len} bytes`],
    },
    {
      label: 'Ethernet II, Src: 7c:57:3c:4a:8b:12, Dst: d8:31:cf:1a:2b:3c',
      children: [`Destination: d8:31:cf:1a:2b:3c`, `Source: 7c:57:3c:4a:8b:12`, `Type: ${p.proto === 'ARP' ? 'ARP (0x0806)' : 'IPv4 (0x0800)'}`],
    },
    ...(p.proto !== 'ARP' ? [{
      label: `Internet Protocol Version 4, Src: ${p.src}, Dst: ${p.dst}`,
      children: [`Version: 4`, `Header Length: 20 bytes`, `Total Length: ${p.len}`, `Protocol: ${p.proto === 'TCP' || p.proto === 'HTTP' || p.proto === 'TLS' ? 'TCP (6)' : 'UDP (17)'}`, `Source: ${p.src}`, `Destination: ${p.dst}`],
    }] : []),
    {
      label: `${p.proto}: ${p.info}`,
      children: [p.info, `Length: ${p.len} bytes`],
    },
  ];
}

const MAX_PACKETS = 1000;

export default function Wireshark() {
  const { driver } = useFileSystemStore();
  const [capturing, setCapturing] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [selected, setSelected] = useState<Packet | null>(null);
  const [filter, setFilter] = useState('');
  const [filterApplied, setFilterApplied] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([0, 3]));
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [openedFile, setOpenedFile] = useState<string | null>(null);
  const counterRef = useRef(0);
  const elapsedRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const openFromFS = (nodeId: string, name: string) => {
    if (!driver) return;
    const content = driver.readFile(nodeId);
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.packets)) {
        stopCapture();
        setPackets(parsed.packets as Packet[]);
        setSelected(null);
        setElapsed(parsed.duration ?? 0);
        setOpenedFile(name);
        counterRef.current = parsed.packets.length;
        elapsedRef.current = parsed.duration ?? 0;
      }
    } catch {
      // not a valid capture file
    }
    setShowFilePicker(false);
  };

  const clear = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const startCapture = () => {
    setCapturing(true);
    setPackets([]);
    counterRef.current = 0;
    elapsedRef.current = 0;
    timerRef.current = window.setInterval(() => {
      const count = Math.floor(Math.random() * 3) + 1;
      setPackets(prev => {
        const newPkts: Packet[] = [];
        for (let i = 0; i < count; i++) {
          counterRef.current++;
          elapsedRef.current += Math.random() * 0.05;
          newPkts.push(genPacket(counterRef.current, elapsedRef.current));
        }
        const combined = [...prev, ...newPkts];
        return combined.length > MAX_PACKETS ? combined.slice(combined.length - MAX_PACKETS) : combined;
      });
      setElapsed(elapsedRef.current);
    }, 120);
  };

  const stopCapture = () => {
    setCapturing(false);
    clear();
  };

  useEffect(() => () => clear(), []);

  // Auto-scroll
  useEffect(() => {
    if (capturing && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [packets, capturing]);

  const displayed = filterApplied
    ? packets.filter(p => p.proto.toLowerCase().includes(filterApplied.toLowerCase()) || p.src.includes(filterApplied) || p.dst.includes(filterApplied) || p.info.toLowerCase().includes(filterApplied.toLowerCase()))
    : packets;

  const detail = selected ? buildDetail(selected) : [];
  const hexDump = selected ? buildHexDump(selected.len) : [];

  const toggleNode = (i: number) => setExpandedNodes(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });

  return (
    <div className="ws-root">
      {/* Toolbar */}
      <div className="ws-toolbar">
        <button className={`ws-btn ${capturing ? 'active' : ''}`} onClick={capturing ? stopCapture : startCapture}>
          {capturing ? '⬛ Stop' : '▶ Start'}
        </button>
        <button className="ws-btn" onClick={() => { stopCapture(); setPackets([]); setSelected(null); setElapsed(0); }}>🔄 Restart</button>
        <div className="ws-sep" />
        <button className="ws-btn">💾 Save</button>
        <button className="ws-btn" onClick={() => setShowFilePicker(true)}>📂 Open</button>
        <div className="ws-sep" />
        <button className="ws-btn">🔍 Find</button>
        <button className="ws-btn">📊 Stats</button>
        <button className="ws-btn">🎨 Colorize</button>
      </div>

      {/* Filter bar */}
      <div className="ws-filter-bar">
        <span className="ws-filter-label">Display Filter:</span>
        <input
          className="ws-filter-input"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setFilterApplied(filter)}
          placeholder="e.g. tcp, dns, ip.addr == 192.168.1.1"
        />
        <button className="ws-filter-apply" onClick={() => setFilterApplied(filter)}>Apply</button>
        <button className="ws-btn" onClick={() => { setFilter(''); setFilterApplied(''); }}>✕</button>
      </div>

      {/* Packet list */}
      <div className="ws-packet-list" ref={listRef}>
        <div className="ws-col-headers">
          <span className="ws-col-no">No.</span>
          <span className="ws-col-time">Time</span>
          <span className="ws-col-src">Source</span>
          <span className="ws-col-dst">Destination</span>
          <span className="ws-col-proto">Protocol</span>
          <span className="ws-col-len">Length</span>
          <span className="ws-col-info">Info</span>
        </div>
        {displayed.map(p => (
          <div
            key={p.no}
            className={`ws-packet ${p.proto.toLowerCase()} ${selected?.no === p.no ? 'selected' : ''}`}
            onClick={() => setSelected(p)}
          >
            <span className="ws-col-no" style={{ paddingLeft: 6 }}>{p.no}</span>
            <span className="ws-col-time">{p.time}</span>
            <span className="ws-col-src">{p.src}</span>
            <span className="ws-col-dst">{p.dst}</span>
            <span className="ws-col-proto">{p.proto}</span>
            <span className="ws-col-len">{p.len}</span>
            <span className="ws-col-info" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.info}</span>
          </div>
        ))}
      </div>

      {/* Detail + Hex */}
      <div className="ws-lower">
        <div className="ws-detail">
          {detail.map((node, i) => (
            <div key={i} className="ws-detail-node">
              <div className="ws-detail-header" onClick={() => toggleNode(i)}>
                <span className="ws-detail-caret">{expandedNodes.has(i) ? '▼' : '▶'}</span>
                <span className="ws-detail-label">{node.label}</span>
              </div>
              {expandedNodes.has(i) && (
                <div className="ws-detail-children">
                  {node.children.map((c, j) => (
                    <div key={j} className="ws-detail-value">{c}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {!selected && <div style={{ color: '#888', padding: 8 }}>Select a packet to see details</div>}
        </div>

        <div className="ws-hex">
          {hexDump.map((row, i) => (
            <div key={i} className="ws-hex-row">
              <span className="ws-hex-offset">{row.offset}</span>
              <span className="ws-hex-bytes">{row.hex}</span>
              <span className="ws-hex-ascii">{row.ascii}</span>
            </div>
          ))}
          {!selected && <div style={{ color: '#888' }}>No data</div>}
        </div>
      </div>

      {/* Status bar */}
      <div className="ws-status">
        <span>{capturing ? <span className="ws-status-live">● LIVE</span> : '■ Stopped'}</span>
        <span>Packets: {packets.length}</span>
        <span>Displayed: {displayed.length}</span>
        <span>Elapsed: {elapsed.toFixed(3)}s</span>
        <span>{openedFile ? `File: ${openedFile}` : 'Interface: Ethernet 0'}</span>
      </div>

      {showFilePicker && (
        <FilePicker
          title="Open Capture File"
          accept={['application/vnd.tcpdump.pcap', '.pcap', '.pcapng']}
          onSelect={openFromFS}
          onClose={() => setShowFilePicker(false)}
        />
      )}
    </div>
  );
}
