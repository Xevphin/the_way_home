// ============================================================================
// src/components/menuAmbience.js
// Eerie procedural Web Audio ambient track for the Main Menu:
// - Low unsettling sub-bass drone (55 Hz / 82.4 Hz detuned sine & triangle
//   oscillators through a warm low-pass filter with slow LFO breathing)
// - Sparse, distant hollow wind/bell overtones + subtle vinyl/night air bed
// - Respects Master Volume & smoothly fades out (0.8s) on PLAY / CONTINUE
// ============================================================================

let ctx = null;
let masterGain = null;
let bedGain = null;
let masterVolume = 0.7;
let activeNodes = [];
let bellTimer = null;
let stopTimeout = null;
let isPlaying = false;

function ensureAudio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    masterGain = ctx.createGain();
    masterGain.gain.value = masterVolume;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function setMenuAmbienceVolume(vol) {
  masterVolume = Math.max(0, Math.min(1, vol));
  if (masterGain && ctx) {
    masterGain.gain.setTargetAtTime(masterVolume, ctx.currentTime, 0.08);
  }
}

function cleanupNodes() {
  if (bellTimer) {
    clearInterval(bellTimer);
    bellTimer = null;
  }
  activeNodes.forEach((n) => {
    try {
      n.stop?.();
      n.disconnect?.();
    } catch {
      // Ignore already-stopped nodes
    }
  });
  activeNodes = [];
  bedGain = null;
  isPlaying = false;
}

function triggerHollowBellOvertone() {
  if (!ctx || !bedGain || !isPlaying) return;
  const now = ctx.currentTime;
  const freqs = [220.0, 261.63, 311.13, 329.63, 196.0];
  const base = freqs[Math.floor(Math.random() * freqs.length)];

  [1, 2.01].forEach((ratio, idx) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base * ratio, now);
    osc.frequency.exponentialRampToValueAtTime(base * ratio * 0.992, now + 4.8);
    lp.type = 'lowpass';
    lp.frequency.value = 680;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(idx === 0 ? 0.055 : 0.018, now + 1.15);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 5.2);
    osc.connect(lp);
    lp.connect(g);
    g.connect(bedGain);
    osc.start(now);
    osc.stop(now + 5.4);
  });
}

export function startMenuAmbience() {
  if (isPlaying) {
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return;
  }
  clearTimeout(stopTimeout);
  const c = ensureAudio();
  if (!c || !masterGain) return;
  isPlaying = true;

  const now = c.currentTime;
  bedGain = c.createGain();
  bedGain.gain.setValueAtTime(0.0001, now);
  bedGain.gain.linearRampToValueAtTime(0.55, now + 1.6);
  bedGain.connect(masterGain);

  // Warm low-pass filter with slow LFO breathing over the sub-bass drone
  const droneLP = c.createBiquadFilter();
  droneLP.type = 'lowpass';
  droneLP.frequency.setValueAtTime(195, now);
  droneLP.Q.value = 1.4;
  droneLP.connect(bedGain);

  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 0.085;
  lfoGain.gain.value = 48;
  lfo.connect(lfoGain);
  lfoGain.connect(droneLP.frequency);
  lfo.start(now);

  // Detuned 55 Hz (A1) & 82.4 Hz (E2) unsettling sub-bass drone oscillators
  const droneSpecs = [
    { type: 'sine', freq: 55.0, gain: 0.24 },
    { type: 'triangle', freq: 55.45, gain: 0.11 },
    { type: 'sine', freq: 82.4, gain: 0.13 },
    { type: 'triangle', freq: 81.9, gain: 0.06 },
  ];
  droneSpecs.forEach(({ type, freq, gain }) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    g.gain.value = gain;
    osc.connect(g);
    g.connect(droneLP);
    osc.start(now);
    activeNodes.push(osc, g);
  });

  // Subtle night-air / vinyl hiss texture & hollow wind bed
  const airBuf = c.createBuffer(1, c.sampleRate * 3, c.sampleRate);
  const airData = airBuf.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < airData.length; i++) {
    const white = Math.random() * 2 - 1;
    brown = (brown + 0.03 * white) / 1.03;
    airData[i] = brown * 1.4 + white * 0.04;
  }
  const airSrc = c.createBufferSource();
  airSrc.buffer = airBuf;
  airSrc.loop = true;
  const airBP = c.createBiquadFilter();
  airBP.type = 'bandpass';
  airBP.frequency.value = 440;
  airBP.Q.value = 0.7;
  const airGain = c.createGain();
  airGain.gain.value = 0.14;
  airSrc.connect(airBP);
  airBP.connect(airGain);
  airGain.connect(bedGain);
  airSrc.start(now);

  activeNodes.push(lfo, lfoGain, droneLP, airSrc, airBP, airGain, bedGain);

  // Sparse distant hollow bell overtones
  setTimeout(() => triggerHollowBellOvertone(), 2600);
  bellTimer = setInterval(() => {
    if (Math.random() > 0.25) triggerHollowBellOvertone();
  }, 7800);
}

export function fadeOutMenuAmbience(durationSec = 0.8) {
  if (!isPlaying) return;
  isPlaying = false;
  if (bellTimer) {
    clearInterval(bellTimer);
    bellTimer = null;
  }
  if (ctx && bedGain) {
    const now = ctx.currentTime;
    bedGain.gain.cancelScheduledValues(now);
    bedGain.gain.setValueAtTime(Math.max(0.0001, bedGain.gain.value), now);
    bedGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
  }
  clearTimeout(stopTimeout);
  stopTimeout = setTimeout(cleanupNodes, Math.ceil(durationSec * 1000) + 60);
}
