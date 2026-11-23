// ============================================================================
// src/components/DialogueVoiceAudio.js
// Undertale-style procedural Web Audio typewriter voice blips with distinct
// pitch & timbre profiles per character (Protagonist, Amir, Hakim, Man in
// White at the Surau, and eerie distorted whisper at the Phantom Stall).
// ============================================================================

let voiceCtx = null;
let voiceGain = null;
let voiceVol = 0.75;

function ensureVoiceCtx() {
  if (typeof window === 'undefined') return null;
  if (!voiceCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    voiceCtx = new Ctx();
    voiceGain = voiceCtx.createGain();
    voiceGain.gain.value = voiceVol;
    voiceGain.connect(voiceCtx.destination);
  }
  if (voiceCtx.state === 'suspended') {
    voiceCtx.resume().catch(() => {});
  }
  return voiceCtx;
}

export function setVoiceVolume(v) {
  voiceVol = Math.max(0, Math.min(1, v));
  if (voiceGain && voiceCtx) {
    voiceGain.gain.setTargetAtTime(voiceVol, voiceCtx.currentTime, 0.05);
  }
}

function getProfile(tag = '') {
  const t = String(tag).toUpperCase();
  if (t.includes('UNISON') || t.includes('WHISPER') || t.includes('PHANTOM')) {
    return { base: 92, spread: 24, type: 'sawtooth', gain: 0.075, dur: 0.065, distort: true };
  }
  if (t.includes('UNCLE') || t.includes('MAN IN WHITE') || t.includes('ELDER') || t.includes('SURAU')) {
    return { base: 186, spread: 22, type: 'sine', gain: 0.085, dur: 0.055, distort: false };
  }
  if (t.includes('HAFIZ')) {
    return { base: 365, spread: 42, type: 'triangle', gain: 0.068, dur: 0.044, distort: false };
  }
  if (t.includes('AMIR')) {
    return { base: 430, spread: 58, type: 'triangle', gain: 0.068, dur: 0.042, distort: false };
  }
  if (t.includes('HAKIM')) {
    return { base: 246, spread: 30, type: 'triangle', gain: 0.072, dur: 0.046, distort: false };
  }
  // Default: Protagonist ('YOU', 'INNER THOUGHT', timestamps)
  return { base: 308, spread: 34, type: 'triangle', gain: 0.055, dur: 0.038, distort: false };
}

export function playVoiceBlip(speakerTag = '') {
  const ctx = ensureVoiceCtx();
  if (!ctx || !voiceGain) return;
  const now = ctx.currentTime;
  const prof = getProfile(speakerTag);

  const osc = ctx.createOscillator();
  const filt = ctx.createBiquadFilter();
  const g = ctx.createGain();

  osc.type = prof.type;
  const freq = prof.base + (Math.random() - 0.5) * prof.spread;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(
    prof.distort ? freq * 0.72 : freq * 1.04,
    now + prof.dur
  );

  filt.type = prof.distort ? 'bandpass' : 'lowpass';
  filt.frequency.value = prof.distort ? 420 : 1850;
  filt.Q.value = prof.distort ? 3.5 : 0.8;

  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(prof.gain, now + 0.007);
  g.gain.exponentialRampToValueAtTime(0.0001, now + prof.dur);

  osc.connect(filt);
  filt.connect(g);
  g.connect(voiceGain);
  osc.start(now);
  osc.stop(now + prof.dur + 0.01);
}
