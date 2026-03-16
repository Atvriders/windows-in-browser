// Windows 10 sounds synthesized via Web Audio API

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(
  freq: number,
  startTime: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
  fadeOut = true,
) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + startTime);
  gain.gain.setValueAtTime(0, c.currentTime + startTime);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + startTime + 0.01);
  if (fadeOut) {
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + startTime + duration);
  }
  osc.start(c.currentTime + startTime);
  osc.stop(c.currentTime + startTime + duration + 0.05);
}

/** Windows 10 startup chime – soft ascending chord */
export function playStartup() {
  try {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
    // Gentle 4-note ascending melody like the Win10 chime
    const notes = [
      { freq: 392, t: 0.0, dur: 0.6, vol: 0.08 },   // G4
      { freq: 523, t: 0.3, dur: 0.6, vol: 0.09 },   // C5
      { freq: 659, t: 0.6, dur: 0.7, vol: 0.10 },   // E5
      { freq: 784, t: 0.9, dur: 1.2, vol: 0.09 },   // G5
      { freq: 1047, t: 1.1, dur: 1.0, vol: 0.07 },  // C6 (softer high)
    ];
    notes.forEach(n => playTone(n.freq, n.t, n.dur, n.vol, 'sine'));
    // Add a soft pad chord underneath
    [261, 329, 392].forEach(f => playTone(f, 0.0, 1.8, 0.03, 'triangle'));
  } catch (e) { /* audio blocked */ }
}

/** Short notification ding */
export function playNotification() {
  try {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
    playTone(880, 0, 0.3, 0.12, 'sine');
    playTone(1320, 0.15, 0.4, 0.10, 'sine');
  } catch (e) { /* */ }
}

/** Windows error / exclamation sound */
export function playError() {
  try {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
    playTone(440, 0, 0.18, 0.14, 'sawtooth');
    playTone(330, 0.16, 0.22, 0.12, 'sawtooth');
  } catch (e) { /* */ }
}

/** Soft click / UI tap */
export function playClick() {
  try {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
    playTone(800, 0, 0.04, 0.06, 'triangle');
  } catch (e) { /* */ }
}

/** Window maximize / minimize whoosh */
export function playWhoosh() {
  try {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.12);
    gain.gain.setValueAtTime(0.07, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.15);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.2);
  } catch (e) { /* */ }
}

/** Device connect / success ding */
export function playSuccess() {
  try {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
    playTone(523, 0, 0.15, 0.10, 'sine');
    playTone(659, 0.12, 0.15, 0.10, 'sine');
    playTone(784, 0.24, 0.35, 0.12, 'sine');
  } catch (e) { /* */ }
}

/** Update installed / restart ready chime */
export function playUpdateDone() {
  try {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
    playTone(523, 0, 0.2, 0.08, 'sine');
    playTone(659, 0.18, 0.2, 0.08, 'sine');
    playTone(784, 0.36, 0.2, 0.08, 'sine');
    playTone(1047, 0.54, 0.5, 0.10, 'sine');
  } catch (e) { /* */ }
}
