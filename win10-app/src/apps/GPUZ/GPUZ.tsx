import { useState, useEffect } from 'react';
import './GPUZ.css';

type GpuzTab = 'Graphics Card' | 'Sensors';

interface SensorReading {
  label: string;
  value: number;
  unit: string;
  base: number;
  variance: number;
  min: number;
  max: number;
  barMax: number;
  barColor: 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'teal';
}

function randVariance(base: number, variance: number): number {
  return base + (Math.random() - 0.5) * 2 * variance;
}

function buildSensors(): SensorReading[] {
  return [
    {
      label: 'GPU Core Clock',
      value: randVariance(2520, 50),
      unit: 'MHz',
      base: 2520, variance: 50,
      min: 2450, max: 2610,
      barMax: 3000,
      barColor: 'green',
    },
    {
      label: 'GPU Memory Clock',
      value: randVariance(5251, 20),
      unit: 'MHz',
      base: 5251, variance: 20,
      min: 5200, max: 5300,
      barMax: 6000,
      barColor: 'blue',
    },
    {
      label: 'GPU Temperature',
      value: randVariance(44, 2),
      unit: '°C',
      base: 44, variance: 2,
      min: 40, max: 48,
      barMax: 100,
      barColor: 'orange',
    },
    {
      label: 'Hot Spot Temp',
      value: randVariance(56, 3),
      unit: '°C',
      base: 56, variance: 3,
      min: 50, max: 62,
      barMax: 110,
      barColor: 'orange',
    },
    {
      label: 'Fan Speed',
      value: randVariance(1540, 50),
      unit: 'RPM',
      base: 1540, variance: 50,
      min: 1450, max: 1660,
      barMax: 3500,
      barColor: 'teal',
    },
    {
      label: 'Fan Speed %',
      value: randVariance(38, 2),
      unit: '%',
      base: 38, variance: 2,
      min: 35, max: 42,
      barMax: 100,
      barColor: 'teal',
    },
    {
      label: 'GPU Load',
      value: randVariance(22, 10),
      unit: '%',
      base: 22, variance: 10,
      min: 5, max: 45,
      barMax: 100,
      barColor: 'purple',
    },
    {
      label: 'Memory Used',
      value: randVariance(2048, 100),
      unit: 'MB',
      base: 2048, variance: 100,
      min: 1900, max: 2250,
      barMax: 12288,
      barColor: 'blue',
    },
    {
      label: 'Power Consumption',
      value: randVariance(58, 10),
      unit: 'W',
      base: 58, variance: 10,
      min: 42, max: 74,
      barMax: 220,
      barColor: 'red',
    },
    {
      label: 'PCIe Bus Speed',
      value: 16,
      unit: 'x',
      base: 16, variance: 0,
      min: 16, max: 16,
      barMax: 16,
      barColor: 'green',
    },
  ];
}

function fmtValue(s: SensorReading): string {
  if (s.unit === 'MHz') return `${Math.round(s.value)} ${s.unit}`;
  if (s.unit === '°C')  return `${s.value.toFixed(1)} ${s.unit}`;
  if (s.unit === 'RPM') return `${Math.round(s.value)} ${s.unit}`;
  if (s.unit === '%')   return `${Math.round(s.value)} ${s.unit}`;
  if (s.unit === 'MB')  return `${Math.round(s.value)} ${s.unit}`;
  if (s.unit === 'W')   return `${s.value.toFixed(1)} ${s.unit}`;
  if (s.unit === 'x')   return `x${s.value}`;
  return `${s.value} ${s.unit}`;
}

function barPct(val: number, barMax: number): number {
  return Math.min(100, Math.max(0, (val / barMax) * 100));
}

function GpuzRow({ label, value, extra }: { label: string; value: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="gpuz-row">
      <div className="gpuz-row-label">{label}</div>
      <div className="gpuz-row-value">
        {value}
        {extra}
      </div>
    </div>
  );
}

function GpuzSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="gpuz-section">
      <div className="gpuz-section-title">
        <span className="gpuz-section-title-dot" />
        {title}
      </div>
      {children}
    </div>
  );
}

export default function GPUZ() {
  const [tab, setTab] = useState<GpuzTab>('Graphics Card');
  const [sensors, setSensors] = useState<SensorReading[]>(buildSensors);

  useEffect(() => {
    const id = setInterval(() => setSensors(buildSensors()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="gpuz-root">

      {/* Header */}
      <div className="gpuz-header">
        <div className="gpuz-logo">
          <div className="gpuz-logo-icon">GPU</div>
          <div className="gpuz-logo-text">
            <span className="gpuz-logo-title">GPU-Z</span>
            <span className="gpuz-logo-sub">GPU INFORMATION UTILITY</span>
          </div>
        </div>
        <div className="gpuz-header-right">
          <span className="gpuz-version">Version 2.57.0</span>
          <span className="gpuz-vendor-logo">NVIDIA</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="gpuz-tabs">
        {(['Graphics Card', 'Sensors'] as GpuzTab[]).map(t => (
          <button
            key={t}
            className={`gpuz-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="gpuz-body">

        {/* ── Graphics Card tab ── */}
        {tab === 'Graphics Card' && (
          <>
            <GpuzSection title="Card">
              <GpuzRow label="Name"         value="NVIDIA GeForce RTX 4070"
                extra={<button className="gpuz-lookup-btn">[...]</button>} />
              <GpuzRow label="GPU"          value="AD104" />
              <GpuzRow label="Technology"   value="4nm (TSMC N4P)" />
              <GpuzRow label="Die Size"     value="294 mm²" />
              <GpuzRow label="Release Date" value="Jan 3rd, 2023" />
              <GpuzRow label="BIOS Version" value="95.02.3c.00.9e"
                extra={<button className="gpuz-lookup-btn">[...]</button>} />
              <GpuzRow label="Subvendor"    value="ASUS" />
              <GpuzRow label="Device ID"    value="10DE 2786"
                extra={<button className="gpuz-lookup-btn">[...]</button>} />
            </GpuzSection>

            <GpuzSection title="Interface">
              <GpuzRow
                label="Bus Interface"
                value={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    PCIe 4.0 x16 @ x16 4.0
                    <div className="gpuz-pcie-bar">
                      {Array.from({ length: 16 }, (_, i) => (
                        <div key={i} className="gpuz-pcie-lane" />
                      ))}
                    </div>
                  </span>
                }
              />
            </GpuzSection>

            <GpuzSection title="Shaders / ROPs / TMUs">
              <GpuzRow label="Unified Shaders"   value="5888" />
              <GpuzRow label="TMUs"               value="184" />
              <GpuzRow label="ROPs"               value="64" />
              <GpuzRow label="Shader Model"       value="6.7" />
              <GpuzRow label="Pixel Fillrate"     value="126.2 GP/s" />
              <GpuzRow label="Texture Fillrate"   value="450.6 GT/s" />
            </GpuzSection>

            <GpuzSection title="Memory">
              <GpuzRow label="Memory Type"        value="GDDR6X" />
              <GpuzRow label="Memory Size"        value="12288 MB" />
              <GpuzRow label="Memory Bus"         value="192 bit" />
              <GpuzRow label="Bandwidth"          value="504.2 GB/s" />
            </GpuzSection>

            <GpuzSection title="Driver / API">
              <GpuzRow label="Driver Version"     value="546.33 / 30.0.15.4633" />
              <GpuzRow label="Driver Date"        value="Nov 8, 2023" />
              <GpuzRow label="DirectX Support"    value="12 Ultimate (12_2)" />
              <GpuzRow label="OpenGL"             value="4.6" />
              <GpuzRow label="Vulkan"             value="1.3" />
              <GpuzRow label="CUDA"               value="8.9" />
              <GpuzRow label="Compute Capability" value="8.9 (Ada Lovelace)" />
            </GpuzSection>

            <GpuzSection title="Clocks">
              <GpuzRow label="GPU Clock"          value="1920 MHz (Base)" />
              <GpuzRow label="Boost Clock"        value="2475 MHz" />
              <GpuzRow label="Memory Clock"       value="1313 MHz (10502 MHz effective)" />
              <GpuzRow label="Default Clock"      value="1920 MHz" />
            </GpuzSection>
          </>
        )}

        {/* ── Sensors tab ── */}
        {tab === 'Sensors' && (
          <div className="gpuz-sensors-wrap">
            <GpuzSection title="NVIDIA GeForce RTX 4070 — Live Readings">
              {sensors.map(s => (
                <div key={s.label} className="gpuz-sensor-row">
                  <div className="gpuz-sensor-label">{s.label}</div>
                  <div className="gpuz-sensor-value">{fmtValue(s)}</div>
                  <div className="gpuz-sensor-bar-wrap">
                    <div className="gpuz-sensor-bar-track">
                      <div
                        className={`gpuz-sensor-bar-fill ${s.barColor}`}
                        style={{ width: `${barPct(s.value, s.barMax)}%` }}
                      />
                    </div>
                    <span className="gpuz-sensor-range">
                      {s.unit === 'x'
                        ? `max x${s.barMax}`
                        : `max ${s.barMax} ${s.unit}`
                      }
                    </span>
                  </div>
                </div>
              ))}
            </GpuzSection>

            <GpuzSection title="Observed Min / Max">
              {sensors.map(s => (
                <div key={s.label} className="gpuz-sensor-row">
                  <div className="gpuz-sensor-label">{s.label}</div>
                  <div className="gpuz-sensor-value" style={{ color: '#2196f3' }}>
                    {s.unit === 'MHz' || s.unit === 'RPM' || s.unit === 'MB'
                      ? `${Math.round(s.min)} ${s.unit}`
                      : s.unit === 'x'
                      ? `x${s.min}`
                      : `${s.min.toFixed(1)} ${s.unit}`
                    }
                  </div>
                  <div className="gpuz-sensor-bar-wrap">
                    <div className="gpuz-sensor-bar-track">
                      <div
                        className={`gpuz-sensor-bar-fill ${s.barColor}`}
                        style={{ width: `${barPct(s.max, s.barMax)}%`, opacity: 0.6 }}
                      />
                    </div>
                    <span className="gpuz-sensor-range" style={{ color: '#e53935' }}>
                      {s.unit === 'MHz' || s.unit === 'RPM' || s.unit === 'MB'
                        ? `max ${Math.round(s.max)} ${s.unit}`
                        : s.unit === 'x'
                        ? `x${s.max}`
                        : `max ${s.max.toFixed(1)} ${s.unit}`
                      }
                    </span>
                  </div>
                </div>
              ))}
            </GpuzSection>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="gpuz-footer">
        <div className="gpuz-footer-btns">
          <button className="gpuz-btn">Save to File</button>
          <button className="gpuz-btn gpuz-btn-primary">Submit to DB</button>
        </div>
        <div className="gpuz-footer-sensor-status">
          {tab === 'Sensors' && (
            <>
              <div className="gpuz-sensor-indicator" />
              <span>Sensors active — refreshing every 1s</span>
            </>
          )}
          {tab === 'Graphics Card' && (
            <span style={{ color: '#888' }}>NVIDIA GeForce RTX 4070 — ASUS</span>
          )}
        </div>
        <button className="gpuz-btn">Close</button>
      </div>
    </div>
  );
}
