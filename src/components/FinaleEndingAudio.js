// ============================================================================
// src/components/FinaleEndingAudio.js
// Dedicated Web Audio score for the Chapter 1 Finale & Movie End Credits:
// - Eerie low ambient revelation drone (fades in when Hafiz reveals there was
//   never a village; cuts immediately to dead silence before the smash-cut!)
// - Slow, melancholic procedural solo piano theme during rolling End Credits
// ============================================================================

let ctx = null;
let master = null;
let volume = 0.75;
let droneNodes = [];
let pianoTimer = null;
let pianoNodes = [];

function ensureCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function setFinaleAudioVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  if (master && ctx) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
}

export function stopRevelationDrone() {
  droneNodes.forEach((n) => {
    try {
      n.stop?.();
      n.disconnect?.();
    } catch {
      // Ignore already stopped nodes
    }
  });
  droneNodes = [];
}

// Low eerie ambient drone when Hafiz reveals the Lembah Batu truth
export function startRevelationDrone() {
  if (droneNodes.length) return;
  const c = ensureCtx();
  if (!c || !master) return;

  const bus = c.createGain();
  bus.gain.setValueAtTime(0.001, c.currentTime);
  bus.gain.linearRampToValueAtTime(0.32, c.currentTime + 2.2);
  bus.connect(master);

  [51.91, 77.78, 110.0].forEach((freq, idx) => {
    const osc = c.createOscillator();
    const lp = c.createBiquadFilter();
    const g = c.createGain();
    osc.type = idx === 0 ? 'sine' : 'triangle';
    osc.frequency.value = freq;
    lp.type = 'lowpass';
    lp.frequency.value = 220;
    g.gain.value = idx === 0 ? 0.45 : 0.16;
    osc.connect(lp);
    lp.connect(g);
    g.connect(bus);
    osc.start();
    droneNodes.push(osc, lp, g);
  });
  droneNodes.push(bus);
}

export function stopEndCreditsPiano() {
  if (pianoTimer) {
    clearInterval(pianoTimer);
    pianoTimer = null;
  }
  pianoNodes.forEach((n) => {
    try {
      n.stop?.();
      n.disconnect?.();
    } catch {
      // Ignore already stopped nodes
    }
  });
  pianoNodes = [];
}

// Slow melancholic procedural solo piano theme (Am -> Fmaj7 -> Dm9 -> E7sus4)
export function startEndCreditsPiano() {
  stopEndCreditsPiano();
  const c = ensureCtx();
  if (!c || !master) return;

  const bus = c.createGain();
  bus.gain.setValueAtTime(0.001, c.currentTime);
  bus.gain.linearRampToValueAtTime(0.36, c.currentTime + 1.6);
  bus.connect(master);
  pianoNodes.push(bus);

  // Sparse reverberant melody + warm bass notes in A minor
  const sequence = [
    { bass: 110.0, notes: [329.63, 440.0, 523.25] },   // Am
    { bass: 87.31, notes: [261.63, 329.63, 440.0] },   // Fmaj7
    { bass: 146.83, notes: [293.66, 349.23, 440.0] },  // Dm
    { bass: 164.81, notes: [246.94, 329.63, 392.0] },  // Em/E7sus
  ];
  let bar = 0;

  const playBar = () => {
    if (!ctx || !pianoNodes.length) return;
    const now = ctx.currentTime;
    const chord = sequence[bar % sequence.length];
    bar += 1;

    // Warm sustaining piano bass note
    const bOsc = ctx.createOscillator();
    const bGain = ctx.createGain();
    bOsc.type = 'sine';
    bOsc.frequency.setValueAtTime(chord.bass, now);
    bGain.gain.setValueAtTime(0.001, now);
    bGain.gain.linearRampToValueAtTime(0.24, now + 0.08);
    bGain.gain.exponentialRampToValueAtTime(0.002, now + 3.2);
    bOsc.connect(bGain);
    bGain.connect(bus);
    bOsc.start(now);
    bOsc.stop(now + 3.3);

    // Gentle arpeggiated solo piano top notes
    chord.notes.forEach((f, idx) => {
      const start = now + idx * 0.72;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, start);
      g.gain.setValueAtTime(0.001, start);
      g.gain.linearRampToValueAtTime(0.14, start + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0015, start + 2.3);
      osc.connect(g);
      g.connect(bus);
      osc.start(start);
      osc.stop(start + 2.4);
    });
  };

  playBar();
  pianoTimer = setInterval(playBar, 3200);
}
