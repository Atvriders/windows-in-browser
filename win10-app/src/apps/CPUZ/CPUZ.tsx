import { useState } from 'react';
import './CPUZ.css';

type Tab = 'CPU' | 'Caches' | 'Mainboard' | 'Memory' | 'SPD' | 'Graphics' | 'About';

const TABS: Tab[] = ['CPU', 'Caches', 'Mainboard', 'Memory', 'SPD', 'Graphics', 'About'];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="cpuz-row">
      <span className="cpuz-label">{label}</span>
      <span className="cpuz-value">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="cpuz-section">
      <div className="cpuz-section-title">{title}</div>
      {children}
    </div>
  );
}

export default function CPUZ() {
  const [tab, setTab] = useState<Tab>('CPU');
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  return (
    <div className="cpuz-root">
      <div className="cpuz-header">
        <div className="cpuz-logo">CPU-Z</div>
        <div className="cpuz-version">v2.09.0 x64</div>
      </div>
      <div className="cpuz-tabs">
        {TABS.map(t => (
          <button key={t} className={`cpuz-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <div className="cpuz-body">
        {tab === 'CPU' && (
          <>
            <Section title="Processor">
              <Row label="Name" value="Intel Core i7-12700K" />
              <Row label="Code Name" value="Alder Lake" />
              <Row label="Package" value="Socket 1700 LGA" />
              <Row label="Technology" value="Intel 7 (10nm ESF)" />
              <Row label="Max TDP" value="125 W" />
              <Row label="Specification" value="12th Gen Intel Core i7-12700K" />
            </Section>
            <Section title="Clocks (Core #0)">
              <Row label="Core Speed" value="3,612.4 MHz" />
              <Row label="Multiplier" value="× 36.0" />
              <Row label="Bus Speed" value="100.3 MHz" />
              <Row label="Rated FSB" value="N/A" />
            </Section>
            <Section title="Cache">
              <Row label="L1 Data" value="5 × 48 KBytes, 12-way" />
              <Row label="L1 Inst." value="5 × 32 KBytes, 8-way" />
              <Row label="Level 2" value="5 × 1.25 MBytes, 10-way" />
              <Row label="Level 3" value="25 MBytes, 16-way" />
            </Section>
            <Section title="Selection">
              <Row label="Cores" value="12 (8P + 4E)" />
              <Row label="Threads" value="20" />
              <Row label="APIC ID" value="0" />
            </Section>
          </>
        )}
        {tab === 'Caches' && (
          <>
            <Section title="Level 1 Data Cache">
              <Row label="Size" value="5 × 48 KBytes" />
              <Row label="Descriptor" value="48-KB, 12-way set associative" />
              <Row label="Sets" value="64" />
              <Row label="Line Size" value="64 Bytes" />
            </Section>
            <Section title="Level 1 Instruction Cache">
              <Row label="Size" value="5 × 32 KBytes" />
              <Row label="Descriptor" value="32-KB, 8-way set associative" />
              <Row label="Sets" value="64" />
              <Row label="Line Size" value="64 Bytes" />
            </Section>
            <Section title="Level 2 Unified Cache">
              <Row label="Size" value="5 × 1.25 MBytes" />
              <Row label="Descriptor" value="1.25-MB, 10-way set associative" />
              <Row label="Sets" value="2048" />
              <Row label="Line Size" value="64 Bytes" />
            </Section>
            <Section title="Level 3 Unified Cache">
              <Row label="Size" value="25 MBytes" />
              <Row label="Descriptor" value="25-MB, 16-way set associative" />
              <Row label="Sets" value="16384" />
              <Row label="Line Size" value="64 Bytes" />
            </Section>
          </>
        )}
        {tab === 'Mainboard' && (
          <>
            <Section title="Motherboard">
              <Row label="Manufacturer" value="ASUSTeK COMPUTER INC." />
              <Row label="Model" value="PRIME Z690-P" />
              <Row label="Chipset" value="Intel Alder Lake-S PCH Z690" />
              <Row label="Rev." value="Rev 1.xx" />
              <Row label="Southbridge" value="Intel Z690" />
            </Section>
            <Section title="BIOS">
              <Row label="Brand" value="American Megatrends" />
              <Row label="Version" value="2703" />
              <Row label="Date" value="01/15/2024" />
            </Section>
            <Section title="Graphic Interface">
              <Row label="Version" value="PCI-Express 5.0" />
              <Row label="Transfer Rate" value="x16 @ x16 (PCIE x16)" />
              <Row label="Side Band Addressing" value="Supported, Enabled" />
            </Section>
          </>
        )}
        {tab === 'Memory' && (
          <>
            <Section title="General">
              <Row label="Type" value="DDR5" />
              <Row label="Size" value="16 GBytes" />
              <Row label="Channels #" value="Dual" />
              <Row label="DC Mode" value="Symmetric" />
              <Row label="NB Frequency" value="2200.0 MHz" />
            </Section>
            <Section title="Timings">
              <Row label="DRAM Frequency" value="2400.0 MHz" />
              <Row label="FSB:DRAM" value="1:24" />
              <Row label="CAS# Latency (CL)" value="40.0 clocks" />
              <Row label="RAS# to CAS#" value="39 clocks" />
              <Row label="RAS# Precharge (RP)" value="39 clocks" />
              <Row label="Cycle Time (tRAS)" value="77 clocks" />
              <Row label="Command Rate (CR)" value="2T" />
            </Section>
          </>
        )}
        {tab === 'SPD' && (
          <>
            <Section title="Memory Slot Selection">
              <Row label="Slot #" value="1 (occupied)" />
              <Row label="Module Size" value="8192 MBytes" />
              <Row label="Max Bandwidth" value="PC5-38400 (4800 MHz)" />
              <Row label="Manufacturer" value="Samsung" />
              <Row label="Part Number" value="M323R1GB4BB0-CQK" />
              <Row label="Serial Number" value="AE04FB2B" />
              <Row label="Mfg. Date" value="Week 22 / 2023" />
            </Section>
            <Section title="Timings Table">
              <Row label="Frequency" value="4800 MHz" />
              <Row label="CAS# Latency" value="40" />
              <Row label="RAS# to CAS#" value="39" />
              <Row label="RAS# Precharge" value="39" />
              <Row label="tRAS" value="77" />
              <Row label="Voltage" value="1.100 V" />
            </Section>
          </>
        )}
        {tab === 'Graphics' && (
          <>
            <Section title="Display Adapter">
              <Row label="Name" value="NVIDIA GeForce RTX 4070" />
              <Row label="Board Mfr." value="ASUS" />
              <Row label="Code Name" value="AD104" />
              <Row label="Technology" value="TSMC N4P (4nm)" />
              <Row label="Memory Size" value="12288 MBytes" />
              <Row label="Memory Type" value="GDDR6X" />
              <Row label="Memory Bus Width" value="192 bits" />
            </Section>
            <Section title="Clocks">
              <Row label="Core" value="1920 MHz (boost 2475 MHz)" />
              <Row label="Memory" value="1313 MHz (10500 MT/s eff.)" />
              <Row label="Shader" value="1920 MHz" />
              <Row label="ROPs/TMUs" value="64/112" />
              <Row label="Shader Processors" value="5888" />
            </Section>
          </>
        )}
        {tab === 'About' && (
          <>
            <Section title="About CPU-Z">
              <Row label="Version" value="2.09.0 x64" />
              <Row label="Author" value="CPUID" />
              <Row label="Website" value="www.cpuid.com" />
              <Row label="Build" value="Nov 15 2023" />
            </Section>
            <Section title="System">
              <Row label="Windows" value="Windows 10 Pro (x64)" />
              <Row label="Build" value="10.0.19045.3996" />
              <Row label="DirectX" value="12.0" />
              <Row label="ACPI Timer" value="Enabled" />
            </Section>
            <Section title="License">
              <Row label="Type" value="Freeware" />
              <Row label="Registration" value="Unregistered" />
            </Section>
          </>
        )}
      </div>
      <div className="cpuz-footer">
        {toast && <span style={{ flex: 1, color: '#4caf50', fontSize: 12, padding: '0 8px' }}>{toast}</span>}
        <button className="cpuz-btn" onClick={() => showToast('Validation request sent to CPUID servers...')}>Validate</button>
        <button className="cpuz-btn" onClick={() => showToast('Report saved to Desktop\\CPU-Z_i7-12700K.txt')}>Save Report (.txt)</button>
        <button className="cpuz-btn cpuz-btn-close" onClick={() => window.dispatchEvent(new CustomEvent('closeApp'))}>Close</button>
      </div>
    </div>
  );
}
