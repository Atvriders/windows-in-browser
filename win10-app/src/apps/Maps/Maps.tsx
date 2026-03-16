import { useState } from 'react';
import './Maps.css';

const PLACES = [
  { name: 'Central Park', type: 'Park', lat: 40.7851, lng: -73.9683, icon: '🌳' },
  { name: 'Times Square', type: 'Landmark', lat: 40.7580, lng: -73.9855, icon: '🌆' },
  { name: 'Empire State Building', type: 'Landmark', lat: 40.7484, lng: -73.9856, icon: '🏢' },
  { name: 'Brooklyn Bridge', type: 'Landmark', lat: 40.7061, lng: -73.9969, icon: '🌉' },
  { name: 'Statue of Liberty', type: 'Landmark', lat: 40.6892, lng: -74.0445, icon: '🗽' },
  { name: 'Grand Central Terminal', type: 'Transit', lat: 40.7527, lng: -73.9772, icon: '🚉' },
];

export default function Maps() {
  const [search, setSearch] = useState('');
  const [mapType, setMapType] = useState<'road' | 'satellite'>('road');
  const [zoom, setZoom] = useState(14);

  const filtered = PLACES.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="maps-root">
      <div className="maps-sidebar">
        <div className="maps-search-wrap">
          <input className="maps-search" placeholder="Search Maps" value={search} onChange={e => setSearch(e.target.value)} autoFocus />
          {search && <button className="maps-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className="maps-results">
          {filtered.map(p => (
            <div key={p.name} className="maps-result-item">
              <span className="maps-result-icon">{p.icon}</span>
              <div>
                <div className="maps-result-name">{p.name}</div>
                <div className="maps-result-type">{p.type} · New York, NY</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="maps-viewport">
        <div className={`maps-canvas maps-type-${mapType}`}>
          {/* Simulated map with grid */}
          <div className="maps-grid">
            {Array.from({ length: 10 }).map((_, r) =>
              Array.from({ length: 14 }).map((_, c) => (
                <div key={`${r}-${c}`} className="maps-grid-cell" />
              ))
            )}
          </div>
          {/* Roads */}
          <div className="maps-road maps-road-h" style={{ top: '30%', left: 0, right: 0 }} />
          <div className="maps-road maps-road-h" style={{ top: '55%', left: 0, right: 0 }} />
          <div className="maps-road maps-road-h" style={{ top: '75%', left: 0, right: 0 }} />
          <div className="maps-road maps-road-v" style={{ left: '25%', top: 0, bottom: 0 }} />
          <div className="maps-road maps-road-v" style={{ left: '50%', top: 0, bottom: 0 }} />
          <div className="maps-road maps-road-v" style={{ left: '75%', top: 0, bottom: 0 }} />
          {/* Place markers */}
          {PLACES.map((p, i) => (
            <div key={p.name} className="maps-marker" style={{ left: `${15 + i * 13}%`, top: `${20 + (i % 3) * 25}%` }}>
              <div className="maps-marker-bubble">{p.icon}</div>
              <div className="maps-marker-label">{p.name}</div>
            </div>
          ))}
          {/* "You are here" */}
          <div className="maps-marker maps-you" style={{ left: '50%', top: '50%' }}>
            <div className="maps-you-dot" />
          </div>
        </div>
        <div className="maps-controls">
          <div className="maps-type-switcher">
            <button className={mapType === 'road' ? 'active' : ''} onClick={() => setMapType('road')}>Map</button>
            <button className={mapType === 'satellite' ? 'active' : ''} onClick={() => setMapType('satellite')}>Satellite</button>
          </div>
          <div className="maps-zoom">
            <button onClick={() => setZoom(z => Math.min(20, z + 1))}>+</button>
            <span>{zoom}</span>
            <button onClick={() => setZoom(z => Math.max(1, z - 1))}>−</button>
          </div>
        </div>
      </div>
    </div>
  );
}
