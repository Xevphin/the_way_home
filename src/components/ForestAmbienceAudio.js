// ============================================================================
// src/components/ForestAmbienceAudio.js
// Dedicated Web Audio soundscape & psychological horror SFX for Chapter 1
// Midnight Exploration:
// - Layered night forest wind + tropical crickets ambience (drops to dead
//   silence during psychological scares via setAmbienceSilence)
// - Post-crash 1.5s ringing-ears shock tone
// - Distant door slam scare, breathy whisper chill, and sharp Phantom Stall
//   hallucination reveal sting
// ============================================================================

let ctx = null;
let master = null;
let ambGain = null;
let volume = 0.7;
let ambNodes = [];
let cricketTimer = null;
let isSilenced = false;
let isDucked = false;
let ringOsc = null;
let ringGain = null;

function ensureAudio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function setForestAmbienceVolume(vol) {
  volume = Math.max(0, Math.min(1, vol));
  if (master && ctx) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.06);
}

export function stopForestNightAmbience() {
  if (cricketTimer) {
    clearInterval(cricketTimer);
    cricketTimer = null;
  }
  ambNodes.forEach((n) => {
    try {
      n.stop?.();
      n.disconnect?.();
    } catch {
      // Ignore already stopped nodes
    }
  });
  ambNodes = [];
  ambGain = null;
}

export function startForestNightAmbience() {
  stopForestNightAmbience();
  const c = ensureAudio();
  if (!c || !master) return;

  const targetBed = isSilenced ? 0.001 : isDucked ? 0.42 * 0.7 : 0.42;
  ambGain = c.createGain();
  ambGain.gain.setValueAtTime(0.001, c.currentTime);
  ambGain.gain.linearRampToValueAtTime(targetBed, c.currentTime + 1.2);
  ambGain.connect(master);

  // Soft forest pine wind bed (lowpass-filtered noise with slow LFO sway)
  const buf = c.createBuffer(1, c.sampleRate * 3, c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04;
    data[i] = last * 2.2;
  }
  const wind = c.createBufferSource();
  wind.buffer = buf;
  wind.loop = true;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 340;
  const wGain = c.createGain();
  wGain.gain.value = 0.34;
  wind.connect(lp);
  lp.connect(wGain);
  wGain.connect(ambGain);
  wind.start();
  ambNodes.push(wind, lp, wGain, ambGain);

  // Rhythmic distant tropical night crickets
  cricketTimer = setInterval(() => {
    if (!ctx || !ambGain || isSilenced) return;
    const now = ctx.currentTime;
    const baseFreq = 4150 + Math.random() * 320;
    for (let p = 0; p < 3; p++) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now + p * 0.085);
      g.gain.setValueAtTime(0.0001, now + p * 0.085);
      g.gain.linearRampToValueAtTime(0.045, now + p * 0.085 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + p * 0.085 + 0.065);
      osc.connect(g);
      g.connect(ambGain);
      osc.start(now + p * 0.085);
      osc.stop(now + p * 0.085 + 0.075);
    }
  }, 1650);
}

export function setAmbienceSilence(silent) {
  isSilenced = silent;
  if (ambGain && ctx) {
    const activeBase = isDucked ? 0.42 * 0.7 : 0.42;
    ambGain.gain.setTargetAtTime(silent ? 0.0005 : activeBase, ctx.currentTime, silent ? 0.08 : 0.65);
  }
}

// Smoothly duck forest wind & crickets by ~30% during active dialogue/monologue (0.25s down, 0.4s up)
export function setForestDialogueDuck(ducked) {
  isDucked = Boolean(ducked);
  if (ambGain && ctx && !isSilenced) {
    const target = isDucked ? 0.42 * 0.7 : 0.42;
    ambGain.gain.setTargetAtTime(target, ctx.currentTime, isDucked ? 0.25 : 0.4);
  }
}

// Pre-warm ear-ringing sine oscillator at gain = 0 so triggering on crash costs 0ms
export function prewarmCrashShockRinging() {
  const c = ensureAudio();
  if (!c || !master || ringOsc) return;
  try {
    ringOsc = c.createOscillator();
    ringGain = c.createGain();
    ringOsc.type = 'sine';
    ringOsc.frequency.setValueAtTime(3420, c.currentTime);
    ringGain.gain.setValueAtTime(0.00001, c.currentTime);
    ringOsc.connect(ringGain);
    ringGain.connect(master);
    ringOsc.start();
  } catch {
    ringOsc = null;
    ringGain = null;
  }
}

// 1.5-second post-crash ear-ringing shock beat (reuses pre-warmed silent node)
export function playCrashShockRinging() {
  const c = ensureAudio();
  if (!c || !master) return;
  if (!ringOsc || !ringGain) prewarmCrashShockRinging();
  if (!ringOsc || !ringGain) return;
  const now = c.currentTime;
  ringOsc.frequency.cancelScheduledValues(now);
  ringOsc.frequency.setValueAtTime(3420, now);
  ringOsc.frequency.exponentialRampToValueAtTime(2950, now + 1.55);
  ringGain.gain.cancelScheduledValues(now);
  ringGain.gain.setValueAtTime(0.18, now);
  ringGain.gain.exponentialRampToValueAtTime(0.00001, now + 1.6);
}

// Sharp distant door slam scare inside the Abandoned Forestry Office
export function playDoorSlamScare() {
  const c = ensureAudio();
  if (!c || !master) return;
  const now = c.currentTime;
  setAmbienceSilence(true);
  setTimeout(() => setAmbienceSilence(false), 3800);

  const sub = c.createOscillator();
  const sg = c.createGain();
  sub.type = 'triangle';
  sub.frequency.setValueAtTime(115, now);
  sub.frequency.exponentialRampToValueAtTime(34, now + 0.36);
  sg.gain.setValueAtTime(0.95, now);
  sg.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
  sub.connect(sg);
  sg.connect(master);
  sub.start(now);
  sub.stop(now + 0.48);

  const nBuf = c.createBuffer(1, c.sampleRate * 0.35, c.sampleRate);
  const nd = nBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.06));
  const src = c.createBufferSource();
  src.buffer = nBuf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 420;
  const ng = c.createGain();
  ng.gain.value = 0.6;
  src.connect(bp);
  bp.connect(ng);
  ng.connect(master);
  src.start(now);
}

// Eerie whisper chill behind the player (milestone / bus shelter clues)
export function playWhisperScare() {
  const c = ensureAudio();
  if (!c || !master) return;
  const now = c.currentTime;
  setAmbienceSilence(true);
  setTimeout(() => setAmbienceSilence(false), 3200);

  const nBuf = c.createBuffer(1, c.sampleRate * 1.4, c.sampleRate);
  const nd = nBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = nBuf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(1650, now);
  bp.frequency.exponentialRampToValueAtTime(780, now + 1.2);
  bp.Q.value = 5.5;
  const g = c.createGain();
  g.gain.setValueAtTime(0.001, now);
  g.gain.linearRampToValueAtTime(0.28, now + 0.25);
  g.gain.exponentialRampToValueAtTime(0.001, now + 1.35);
  src.connect(bp);
  bp.connect(g);
  g.connect(master);
  src.start(now);
}

// Sharp dissonant psychological sting + static burst for the Phantom Stall reveal
export function playHallucinationSting() {
  const c = ensureAudio();
  if (!c || !master) return;
  const now = c.currentTime;

  [110, 116.5, 622, 659, 932].forEach((freq, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = i < 2 ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.72, now + 1.4);
    g.gain.setValueAtTime(i < 2 ? 0.28 : 0.12, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    osc.connect(g);
    g.connect(master);
    osc.start(now);
    osc.stop(now + 1.55);
  });
}
