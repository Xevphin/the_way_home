// ============================================================================
// src/components/MorningAudio.js
// Procedural Web Audio sound effects for Chapter 1 (Morning Routine):
// - Soft bedside digital alarm beep
// - Chore interaction / coffee pour chime
// - Realistic 3-rap wooden front door knock
// - Door latch & gentle creak open/close
// ============================================================================

let ctx = null;
let gainNode = null;
let volLevel = 0.75;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    gainNode = ctx.createGain();
    gainNode.gain.value = volLevel;
    gainNode.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function setMorningVolume(v) {
  volLevel = Math.max(0, Math.min(1, v));
  if (gainNode && ctx) {
    gainNode.gain.setTargetAtTime(volLevel, ctx.currentTime, 0.05);
  }
}

// Gentle digital bedside alarm double-beep
export function playMorningAlarmBeep() {
  const c = getCtx();
  if (!c || !gainNode) return;
  const now = c.currentTime;
  [0, 0.18].forEach((offset) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1180, now + offset);
    g.gain.setValueAtTime(0.08, now + offset);
    g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
    osc.connect(g);
    g.connect(gainNode);
    osc.start(now + offset);
    osc.stop(now + offset + 0.13);
  });
}

// Soft pleasant confirmation sound for completing a morning chore
export function playChoreChime() {
  const c = getCtx();
  if (!c || !gainNode) return;
  const now = c.currentTime;
  [523.25, 659.25].forEach((freq, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.08);
    g.gain.setValueAtTime(0.11, now + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.45 + i * 0.08);
    osc.connect(g);
    g.connect(gainNode);
    osc.start(now + i * 0.08);
    osc.stop(now + 0.5 + i * 0.08);
  });
}

// Clear 3-rap wooden front door knock (knock-knock-knock)
export function playDoorKnock() {
  const c = getCtx();
  if (!c || !gainNode) return;
  const now = c.currentTime;
  [0, 0.24, 0.48].forEach((offset, idx) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(idx === 1 ? 165 : 148, now + offset);
    osc.frequency.exponentialRampToValueAtTime(52, now + offset + 0.09);
    g.gain.setValueAtTime(0.45, now + offset);
    g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.11);
    osc.connect(g);
    g.connect(gainNode);
    osc.start(now + offset);
    osc.stop(now + offset + 0.12);
  });
}

// Wooden front door latch click & soft creak
export function playDoorLatch(opening = true) {
  const c = getCtx();
  if (!c || !gainNode) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(opening ? 190 : 140, now);
  osc.frequency.exponentialRampToValueAtTime(opening ? 310 : 75, now + 0.22);
  g.gain.setValueAtTime(0.09, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  osc.connect(g);
  g.connect(gainNode);
  osc.start(now);
  osc.stop(now + 0.26);
}

let spookyOsc = null;
let spookyGain = null;

// Eerie low ambient tension drone during Amir's spooky Lembah Batu wiki story
export function setSpookyStoryDrone(active) {
  const c = getCtx();
  if (!c || !gainNode) return;
  const now = c.currentTime;
  if (active) {
    if (spookyOsc) return;
    spookyOsc = c.createOscillator();
    spookyGain = c.createGain();
    spookyOsc.type = 'sawtooth';
    spookyOsc.frequency.setValueAtTime(54, now);
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);
    spookyGain.gain.setValueAtTime(0.001, now);
    spookyGain.gain.linearRampToValueAtTime(0.11, now + 1.2);
    spookyOsc.connect(filter);
    filter.connect(spookyGain);
    spookyGain.connect(gainNode);
    spookyOsc.start(now);
  } else if (spookyOsc && spookyGain) {
    try {
      spookyGain.gain.linearRampToValueAtTime(0.0001, now + 0.7);
      spookyOsc.stop(now + 0.75);
    } catch {
      // Ignore already stopped oscillator
    }
    spookyOsc = null;
    spookyGain = null;
  }
}
