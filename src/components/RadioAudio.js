// ============================================================================
// src/components/RadioAudio.js
// Procedural Web Audio synthesizer for the Forest Drive & FM Radio Cutscene:
// - Warm, mellow late-night Malaysian FM radio chord progression filtered
//   through a vintage car-stereo bandpass + gentle FM static hiss + engine hum
// - Dramatic crash cut: radio cuts to harsh static + tire screech + metal crunch
// ============================================================================

import { playCrashImpactThud } from './AudioEngine';

let audioCtx = null;
let masterGain = null;
let radioGain = null;
let radioVolume = 0.6;
let radioDucked = false;
let activeNodes = [];
let chordTimer = null;
let prewarmedStaticBuf = null;
let prewarmedCrunchBuf = null;

function ensureCrashBuffers(ctx) {
  if (!prewarmedStaticBuf || prewarmedStaticBuf.sampleRate !== ctx.sampleRate) {
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 1.4), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    prewarmedStaticBuf = buf;
  }
  if (!prewarmedCrunchBuf || prewarmedCrunchBuf.sampleRate !== ctx.sampleRate) {
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.55), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.14));
    }
    prewarmedCrunchBuf = buf;
  }
}

// Pre-warm Web Audio crash buffers & silent nodes on scene start (0ms cost on impact frame)
export function prewarmCrashAudio() {
  const ctx = ensureCtx();
  if (!ctx || !masterGain) return;
  ensureCrashBuffers(ctx);
  try {
    const now = ctx.currentTime;
    const silent = ctx.createGain();
    silent.gain.setValueAtTime(0, now);
    silent.connect(masterGain);
    const src = ctx.createBufferSource();
    src.buffer = prewarmedCrunchBuf;
    src.connect(silent);
    src.start(now);
    src.stop(now + 0.015);
  } catch {
    // Ignore pre-warm edge cases
  }
}

function ensureCtx() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = radioVolume;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setRadioVolume(vol) {
  radioVolume = Math.max(0, Math.min(1, vol));
  if (masterGain && audioCtx) {
    const target = radioVolume * (radioDucked ? 0.7 : 1);
    masterGain.gain.setTargetAtTime(target, audioCtx.currentTime, 0.05);
  }
}

export function setRadioDialogueDuck(ducked) {
  radioDucked = Boolean(ducked);
  if (masterGain && audioCtx) {
    const target = radioVolume * (radioDucked ? 0.7 : 1);
    masterGain.gain.setTargetAtTime(target, audioCtx.currentTime, radioDucked ? 0.25 : 0.4);
  }
}

export function stopFmRadioAmbience() {
  if (chordTimer) {
    clearInterval(chordTimer);
    chordTimer = null;
  }
  activeNodes.forEach((n) => {
    try {
      n.stop?.();
      n.disconnect?.();
    } catch {
      // Ignore already stopped audio nodes
    }
  });
  activeNodes = [];
  radioGain = null;
}

export function startFmRadioAmbience() {
  stopFmRadioAmbience();
  const ctx = ensureCtx();
  if (!ctx || !masterGain) return;

  // Vintage car-stereo FM bandpass filter (420Hz - 2600Hz)
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 1150;
  band.Q.value = 0.85;

  radioGain = ctx.createGain();
  radioGain.gain.setValueAtTime(0.001, ctx.currentTime);
  radioGain.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 0.8);
  band.connect(radioGain);
  radioGain.connect(masterGain);

  // Soft FM static hiss bed
  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.12;
  const hiss = ctx.createBufferSource();
  hiss.buffer = noiseBuf;
  hiss.loop = true;
  const hissGain = ctx.createGain();
  hissGain.gain.value = 0.28;
  hiss.connect(hissGain);
  hissGain.connect(band);
  hiss.start();

  // Gentle midnight car engine cabin hum
  const eng = ctx.createOscillator();
  const engGain = ctx.createGain();
  eng.type = 'triangle';
  eng.frequency.value = 56;
  engGain.gain.value = 0.14;
  eng.connect(engGain);
  engGain.connect(masterGain);
  eng.start();
  activeNodes.push(hiss, eng, band, radioGain);

  // Nostalgic late-night Malay ballad FM electric-piano chords (Am9 -> Fmaj7 -> Dm7 -> E7)
  const chords = [
    [220.0, 261.63, 329.63, 392.0],
    [174.61, 220.0, 261.63, 329.63],
    [146.83, 220.0, 261.63, 349.23],
    [164.81, 207.65, 246.94, 329.63],
  ];
  let step = 0;

  const playChord = () => {
    if (!audioCtx || !radioGain) return;
    const now = audioCtx.currentTime;
    const notes = chords[step % chords.length];
    step += 1;
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.11, now + 0.16);
      g.gain.exponentialRampToValueAtTime(0.004, now + 2.35);
      osc.connect(g);
      g.connect(band);
      osc.start(now);
      osc.stop(now + 2.4);
    });
  };

  playChord();
  chordTimer = setInterval(playChord, 2350);
}

// Abrupt radio static cut + high tire screech + metallic crunch using pre-warmed buffers (0ms alloc)
export function triggerRadioStaticCut() {
  stopFmRadioAmbience();
  const ctx = ensureCtx();
  if (!ctx || !masterGain) return;
  ensureCrashBuffers(ctx);
  const now = ctx.currentTime;

  // 1) Harsh FM static burst (reuses pre-warmed buffer)
  const staticSrc = ctx.createBufferSource();
  staticSrc.buffer = prewarmedStaticBuf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1400;
  const sGain = ctx.createGain();
  sGain.gain.setValueAtTime(0.45, now);
  sGain.gain.exponentialRampToValueAtTime(0.002, now + 1.35);
  staticSrc.connect(hp);
  hp.connect(sGain);
  sGain.connect(masterGain);
  staticSrc.start(now);

  // 2) Tire brake screech leading straight into impact
  const screech = ctx.createOscillator();
  const scFilter = ctx.createBiquadFilter();
  const scGain = ctx.createGain();
  screech.type = 'sawtooth';
  screech.frequency.setValueAtTime(1680, now);
  screech.frequency.exponentialRampToValueAtTime(920, now + 0.42);
  scFilter.type = 'bandpass';
  scFilter.frequency.value = 1450;
  scFilter.Q.value = 6;
  scGain.gain.setValueAtTime(0.24, now);
  scGain.gain.exponentialRampToValueAtTime(0.002, now + 0.45);
  screech.connect(scFilter);
  scFilter.connect(scGain);
  scGain.connect(masterGain);
  screech.start(now);
  screech.stop(now + 0.48);

  // 3) Metallic impact crunch (pre-warmed buffer + low thud)
  const crunch = ctx.createBufferSource();
  crunch.buffer = prewarmedCrunchBuf;
  const cGain = ctx.createGain();
  cGain.gain.setValueAtTime(0.52, now + 0.08);
  cGain.gain.exponentialRampToValueAtTime(0.002, now + 0.62);
  crunch.connect(cGain);
  cGain.connect(masterGain);
  crunch.start(now + 0.08);

  setTimeout(() => {
    playCrashImpactThud();
  }, 180);
}
