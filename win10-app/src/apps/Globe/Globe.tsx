import { useState, useRef, useCallback, useEffect } from 'react';
import './Globe.css';

/* ── Layer visibility toggle type ── */
interface LayerVisibility {
  conflictZones: boolean;
  threatRings: boolean;
  countries: boolean;
  labels: boolean;
}

/* ── Conflict zones (lat/lng centers) ── */
interface ConflictZone {
  name: string;
  lat: number;
  lng: number;
  radiusKm: number; // active combat radius
}

const CONFLICT_ZONES: ConflictZone[] = [
  { name: 'Ukraine', lat: 48.5, lng: 37.0, radiusKm: 200 },
  { name: 'Gaza', lat: 31.4, lng: 34.4, radiusKm: 40 },
  { name: 'Sudan', lat: 15.5, lng: 32.5, radiusKm: 300 },
  { name: 'Myanmar', lat: 19.8, lng: 96.2, radiusKm: 250 },
  { name: 'Syria', lat: 35.0, lng: 38.0, radiusKm: 180 },
  { name: 'Yemen', lat: 15.5, lng: 44.2, radiusKm: 200 },
  { name: 'Somalia', lat: 5.2, lng: 46.2, radiusKm: 200 },
  { name: 'DR Congo', lat: -1.5, lng: 29.0, radiusKm: 250 },
  { name: 'Sahel Region', lat: 14.0, lng: 2.0, radiusKm: 350 },
  { name: 'Ethiopia (Amhara)', lat: 11.5, lng: 39.5, radiusKm: 150 },
];

/* ── Threat ring definitions ── */
const THREAT_RINGS = [
  { minKm: 0, maxKm: 100, color: 'rgba(220,38,38,', label: 'Active Combat' },
  { minKm: 100, maxKm: 300, color: 'rgba(234,138,30,', label: 'High Threat' },
  { minKm: 300, maxKm: 500, color: 'rgba(220,190,40,', label: 'Elevated' },
];

/* ── Country/region polygons (simplified center-points + bounding for label placement) ── */
interface Country {
  name: string;
  lat: number;
  lng: number;
}

const COUNTRIES: Country[] = [
  { name: 'USA', lat: 39.8, lng: -98.5 },
  { name: 'Canada', lat: 56.1, lng: -106.3 },
  { name: 'Brazil', lat: -14.2, lng: -51.9 },
  { name: 'UK', lat: 55.4, lng: -3.4 },
  { name: 'France', lat: 46.2, lng: 2.2 },
  { name: 'Germany', lat: 51.2, lng: 10.4 },
  { name: 'Poland', lat: 51.9, lng: 19.1 },
  { name: 'Ukraine', lat: 48.4, lng: 31.2 },
  { name: 'Russia', lat: 61.5, lng: 105.3 },
  { name: 'Turkey', lat: 39.0, lng: 35.2 },
  { name: 'Iran', lat: 32.4, lng: 53.7 },
  { name: 'Saudi Arabia', lat: 23.9, lng: 45.1 },
  { name: 'Egypt', lat: 26.8, lng: 30.8 },
  { name: 'Nigeria', lat: 9.1, lng: 8.7 },
  { name: 'Kenya', lat: -0.02, lng: 37.9 },
  { name: 'South Africa', lat: -30.6, lng: 22.9 },
  { name: 'India', lat: 20.6, lng: 78.9 },
  { name: 'China', lat: 35.9, lng: 104.2 },
  { name: 'Japan', lat: 36.2, lng: 138.3 },
  { name: 'Australia', lat: -25.3, lng: 133.8 },
  { name: 'Israel', lat: 31.0, lng: 34.9 },
  { name: 'Jordan', lat: 30.6, lng: 36.2 },
  { name: 'Lebanon', lat: 33.9, lng: 35.9 },
  { name: 'Iraq', lat: 33.2, lng: 43.7 },
  { name: 'Pakistan', lat: 30.4, lng: 69.3 },
  { name: 'Thailand', lat: 15.9, lng: 100.9 },
  { name: 'Ethiopia', lat: 9.1, lng: 40.5 },
  { name: 'DR Congo', lat: -4.0, lng: 21.8 },
  { name: 'Sudan', lat: 12.9, lng: 30.2 },
  { name: 'Chad', lat: 15.5, lng: 18.7 },
  { name: 'Niger', lat: 17.6, lng: 8.1 },
  { name: 'Mali', lat: 17.6, lng: -4.0 },
  { name: 'Mexico', lat: 23.6, lng: -102.6 },
  { name: 'Colombia', lat: 4.6, lng: -74.3 },
  { name: 'Argentina', lat: -38.4, lng: -63.6 },
  { name: 'Indonesia', lat: -0.8, lng: 113.9 },
  { name: 'Romania', lat: 45.9, lng: 24.9 },
  { name: 'Moldova', lat: 47.4, lng: 28.4 },
  { name: 'Belarus', lat: 53.7, lng: 27.9 },
  { name: 'Myanmar', lat: 19.8, lng: 96.2 },
  { name: 'Somalia', lat: 5.2, lng: 46.2 },
  { name: 'Yemen', lat: 15.6, lng: 48.5 },
  { name: 'Syria', lat: 35.0, lng: 38.0 },
  { name: 'Eritrea', lat: 15.2, lng: 39.8 },
  { name: 'Djibouti', lat: 11.6, lng: 43.1 },
  { name: 'Oman', lat: 21.5, lng: 56.0 },
  { name: 'Bangladesh', lat: 23.7, lng: 90.4 },
  { name: 'Laos', lat: 19.9, lng: 102.5 },
];

/* ── Simplified continent outlines (polylines for visual reference) ── */
// Each continent is an array of [lat, lng] points forming a rough outline
const CONTINENT_OUTLINES: { name: string; points: [number, number][] }[] = [
  {
    name: 'North America',
    points: [
      [70, -165], [72, -130], [68, -90], [58, -65], [48, -55],
      [30, -80], [25, -80], [20, -105], [15, -90], [10, -84],
      [10, -78], [30, -115], [48, -125], [55, -135], [60, -150], [70, -165],
    ],
  },
  {
    name: 'South America',
    points: [
      [12, -72], [10, -62], [5, -52], [-5, -35], [-15, -40],
      [-23, -43], [-34, -54], [-42, -64], [-50, -72], [-55, -68],
      [-55, -74], [-46, -76], [-35, -72], [-18, -70], [-5, -80],
      [5, -78], [12, -72],
    ],
  },
  {
    name: 'Europe',
    points: [
      [71, 28], [70, 40], [60, 30], [55, 28], [50, 40],
      [45, 40], [42, 28], [36, 28], [38, -9], [43, -9],
      [48, -5], [51, 2], [55, 12], [58, 10], [63, 5],
      [68, 15], [71, 28],
    ],
  },
  {
    name: 'Africa',
    points: [
      [37, -10], [37, 10], [32, 32], [30, 33], [22, 37],
      [12, 44], [5, 42], [-2, 42], [-12, 50], [-26, 33],
      [-35, 18], [-35, 28], [-22, 35], [-10, 40],
      [-35, 20], [-30, 28], [-15, 12], [-5, 10], [5, -5],
      [5, -16], [15, -17], [22, -17], [32, -5], [37, -10],
    ],
  },
  {
    name: 'Asia',
    points: [
      [70, 40], [75, 100], [72, 140], [65, 170], [55, 160],
      [50, 140], [40, 130], [35, 130], [22, 120], [15, 110],
      [8, 105], [1, 104], [-8, 110], [8, 98], [22, 88],
      [25, 68], [22, 60], [12, 44], [30, 34], [32, 35],
      [37, 36], [42, 44], [45, 40], [50, 40], [55, 28],
      [60, 30], [70, 40],
    ],
  },
  {
    name: 'Australia',
    points: [
      [-12, 130], [-15, 140], [-20, 148], [-28, 153],
      [-35, 150], [-37, 145], [-35, 135], [-32, 115],
      [-24, 114], [-15, 125], [-12, 130],
    ],
  },
];

/* ── Haversine distance (km) ── */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── Equirectangular projection helpers ── */

/* ── Km to pixel scale ── */
function kmToPixels(km: number, lat: number, zoom: number, height: number): number {
  // At equator, 1 degree lat ~ 111km. Each degree takes (height*zoom/180) pixels.
  const pxPerDegree = (height * zoom) / 180;
  const degreesPerKm = 1 / (111 * Math.cos((lat * Math.PI) / 180 + 0.001));
  return km * degreesPerKm * pxPerDegree;
}

export default function Globe() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [centerLng, setCenterLng] = useState(30);
  const [centerLat, setCenterLat] = useState(20);
  const [zoom, setZoom] = useState(1.8);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, cLng: 0, cLat: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 900, h: 600 });
  const [layers, setLayers] = useState<LayerVisibility>({
    conflictZones: true,
    threatRings: false,
    countries: true,
    labels: true,
  });

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = size.w;
  const H = size.h;

  /* ── Projection wrapper using both lat and lng ── */
  const proj = useCallback(
    (lat: number, lng: number) => {
      const x = W / 2 + ((lng - centerLng) * W * zoom) / 360;
      const y = H / 2 - ((lat - centerLat) * H * zoom) / 180;
      const visible = x >= -80 && x <= W + 80 && y >= -80 && y <= H + 80;
      return { x, y, visible };
    },
    [centerLng, centerLat, zoom, W, H]
  );

  const kmToPx = useCallback(
    (km: number, lat: number) => kmToPixels(km, lat, zoom, H),
    [zoom, H]
  );

  /* ── Drag to pan ── */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, cLng: centerLng, cLat: centerLat };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const lngPerPx = 360 / (W * zoom);
    const latPerPx = 180 / (H * zoom);
    setCenterLng(dragStart.current.cLng - dx * lngPerPx);
    setCenterLat(dragStart.current.cLat + dy * latPerPx);
  };

  const handleMouseUp = () => setDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.8, Math.min(12, z * (e.deltaY < 0 ? 1.15 : 0.87))));
  };

  const toggleLayer = (key: keyof LayerVisibility) => {
    setLayers((l) => ({ ...l, [key]: !l[key] }));
  };

  /* ── Render graticule (grid lines) ── */
  const renderGraticule = () => {
    const lines: JSX.Element[] = [];
    // Longitude lines every 30 degrees
    for (let lng = -180; lng <= 180; lng += 30) {
      const pts: string[] = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        const { x, y } = proj(lat, lng);
        pts.push(`${x},${y}`);
      }
      lines.push(
        <polyline
          key={`lng-${lng}`}
          points={pts.join(' ')}
          fill="none"
          stroke="rgba(80,80,80,0.15)"
          strokeWidth={0.5}
        />
      );
    }
    // Latitude lines every 30 degrees
    for (let lat = -90; lat <= 90; lat += 30) {
      const pts: string[] = [];
      for (let lng = -180; lng <= 180; lng += 5) {
        const { x, y } = proj(lat, lng);
        pts.push(`${x},${y}`);
      }
      lines.push(
        <polyline
          key={`lat-${lat}`}
          points={pts.join(' ')}
          fill="none"
          stroke="rgba(80,80,80,0.15)"
          strokeWidth={0.5}
        />
      );
    }
    return lines;
  };

  /* ── Render continent outlines ── */
  const renderContinents = () =>
    CONTINENT_OUTLINES.map((c) => {
      const pts = c.points.map(([lat, lng]) => {
        const { x, y } = proj(lat, lng);
        return `${x},${y}`;
      });
      return (
        <polygon
          key={c.name}
          points={pts.join(' ')}
          fill="rgba(60,80,60,0.12)"
          stroke="rgba(100,140,100,0.4)"
          strokeWidth={1}
        />
      );
    });

  /* ── Render threat rings (concentric circles around each conflict zone) ── */
  const renderThreatRings = () => {
    if (!layers.threatRings) return null;
    const elements: JSX.Element[] = [];
    // Render outermost first so inner rings paint on top
    for (let ri = THREAT_RINGS.length - 1; ri >= 0; ri--) {
      const ring = THREAT_RINGS[ri];
      CONFLICT_ZONES.forEach((cz) => {
        const { x, y, visible } = proj(cz.lat, cz.lng);
        if (!visible) return;
        const outerR = kmToPx(ring.maxKm, cz.lat);
        const innerR = kmToPx(ring.minKm, cz.lat);
        if (outerR < 1) return;
        // Use two circles to create a ring effect; the outer is the fill
        const alpha = ri === 0 ? 0.06 : ri === 1 ? 0.045 : 0.03;
        elements.push(
          <circle
            key={`threat-${cz.name}-${ri}`}
            cx={x}
            cy={y}
            r={outerR}
            fill={ring.color + alpha + ')'}
            stroke={ring.color + (alpha + 0.04) + ')'}
            strokeWidth={0.5}
          />
        );
        // If there's an inner radius, paint over with background to create ring
        if (innerR > 1 && ri > 0) {
          // We don't cut out — the layered approach with decreasing alpha
          // naturally creates the ring appearance
        }
      });
    }
    return elements;
  };

  /* ── Render conflict zone markers ── */
  const renderConflictZones = () => {
    if (!layers.conflictZones) return null;
    return CONFLICT_ZONES.map((cz) => {
      const { x, y, visible } = proj(cz.lat, cz.lng);
      if (!visible) return null;
      const r = kmToPx(cz.radiusKm, cz.lat);
      const isHovered = hovered === cz.name;
      return (
        <g key={`cz-${cz.name}`}>
          {/* Active zone fill */}
          <circle
            cx={x}
            cy={y}
            r={Math.max(r, 4)}
            fill="rgba(220,38,38,0.12)"
            stroke="rgba(220,38,38,0.6)"
            strokeWidth={isHovered ? 2 : 1}
            strokeDasharray={isHovered ? 'none' : '4,2'}
            onMouseEnter={() => setHovered(cz.name)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          />
          {/* Pulsing center dot */}
          <circle
            cx={x}
            cy={y}
            r={3}
            fill="rgba(220,38,38,0.9)"
            className="globe-pulse"
          />
          {/* Label */}
          {(isHovered || zoom > 3) && (
            <text
              x={x}
              y={y - Math.max(r, 4) - 6}
              textAnchor="middle"
              fill="#ff6b6b"
              fontSize={11}
              fontWeight={600}
              className="globe-label"
            >
              {cz.name}
            </text>
          )}
        </g>
      );
    });
  };

  /* ── Render country labels ── */
  const renderCountryLabels = () => {
    if (!layers.labels || !layers.countries) return null;
    return COUNTRIES.map((c) => {
      const { x, y, visible } = proj(c.lat, c.lng);
      if (!visible) return null;
      // Only show labels when zoomed enough
      if (zoom < 1.5) return null;
      // Check threat level for coloring
      let minDist = Infinity;
      for (const cz of CONFLICT_ZONES) {
        const d = haversineKm(c.lat, c.lng, cz.lat, cz.lng);
        if (d < minDist) minDist = d;
      }
      let color = 'rgba(180,190,200,0.5)';
      if (minDist < 100) color = 'rgba(220,70,70,0.7)';
      else if (minDist < 300) color = 'rgba(234,138,30,0.6)';
      else if (minDist < 500) color = 'rgba(220,190,40,0.5)';

      const fontSize = zoom > 4 ? 11 : zoom > 2.5 ? 9 : 7;
      return (
        <text
          key={`country-${c.name}`}
          x={x}
          y={y}
          textAnchor="middle"
          fill={color}
          fontSize={fontSize}
          fontFamily="Segoe UI, sans-serif"
        >
          {c.name}
        </text>
      );
    });
  };

  /* ── Render country dots ── */
  const renderCountryDots = () => {
    if (!layers.countries) return null;
    return COUNTRIES.map((c) => {
      const { x, y, visible } = proj(c.lat, c.lng);
      if (!visible) return null;
      // Threat-level coloring based on proximity to nearest conflict
      let minDist = Infinity;
      for (const cz of CONFLICT_ZONES) {
        const d = haversineKm(c.lat, c.lng, cz.lat, cz.lng);
        if (d < minDist) minDist = d;
      }
      let fill = 'rgba(100,140,180,0.4)';
      let r = 2;
      if (minDist < 100) { fill = 'rgba(220,38,38,0.7)'; r = 3.5; }
      else if (minDist < 300) { fill = 'rgba(234,138,30,0.6)'; r = 3; }
      else if (minDist < 500) { fill = 'rgba(220,190,40,0.5)'; r = 2.5; }
      return (
        <circle
          key={`dot-${c.name}`}
          cx={x}
          cy={y}
          r={r}
          fill={fill}
        />
      );
    });
  };

  return (
    <div className="globe-root">
      {/* Toolbar */}
      <div className="globe-toolbar">
        <div className="globe-toolbar-title">Global Conflict Monitor</div>
        <div className="globe-toolbar-layers">
          {(Object.keys(layers) as (keyof LayerVisibility)[]).map((key) => (
            <label key={key} className="globe-layer-toggle">
              <input
                type="checkbox"
                checked={layers[key]}
                onChange={() => toggleLayer(key)}
              />
              <span>{key === 'conflictZones' ? 'Conflicts' : key === 'threatRings' ? 'Threat Rings' : key === 'countries' ? 'Countries' : 'Labels'}</span>
            </label>
          ))}
        </div>
        <div className="globe-toolbar-zoom">
          <button onClick={() => setZoom((z) => Math.min(12, z * 1.3))}>+</button>
          <span>{zoom.toFixed(1)}x</span>
          <button onClick={() => setZoom((z) => Math.max(0.8, z / 1.3))}>-</button>
          <button className="globe-reset-btn" onClick={() => { setCenterLng(30); setCenterLat(20); setZoom(1.8); }}>Reset</button>
        </div>
      </div>

      {/* SVG Viewport */}
      <div
        className="globe-viewport"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          width={W}
          height={H}
          className="globe-svg"
        >
          {/* Background */}
          <rect width={W} height={H} fill="#0a0e14" />

          {/* Graticule grid */}
          {renderGraticule()}

          {/* Continent outlines */}
          {renderContinents()}

          {/* Threat rings (behind conflict zones) */}
          {renderThreatRings()}

          {/* Country dots */}
          {renderCountryDots()}

          {/* Conflict zone polygons */}
          {renderConflictZones()}

          {/* Country labels (on top) */}
          {renderCountryLabels()}
        </svg>

        {/* Hover tooltip */}
        {hovered && (
          <div className="globe-tooltip">
            <div className="globe-tooltip-title">{hovered}</div>
            <div className="globe-tooltip-status">Active Conflict Zone</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="globe-legend">
        <div className="globe-legend-title">Threat Level</div>
        <div className="globe-legend-item">
          <span className="globe-legend-dot" style={{ background: '#dc2626' }} />
          Active Combat (&lt;100km)
        </div>
        <div className="globe-legend-item">
          <span className="globe-legend-dot" style={{ background: '#ea8a1e' }} />
          High Threat (100-300km)
        </div>
        <div className="globe-legend-item">
          <span className="globe-legend-dot" style={{ background: '#dcbe28' }} />
          Elevated (300-500km)
        </div>
        <div className="globe-legend-item">
          <span className="globe-legend-dot" style={{ background: 'rgba(100,140,180,0.6)' }} />
          Normal
        </div>
      </div>
    </div>
  );
}
