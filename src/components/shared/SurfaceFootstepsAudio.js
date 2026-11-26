// ============================================================================
// src/components/SurfaceFootstepsAudio.js
// Procedural Web Audio mechanical flashlight switch click ([F] toggle):
// - Crisp 20ms dual-transient mechanical switch snap (3400 Hz micro-snap +
//   1900 Hz spring detent, pitched slightly higher ON / lower OFF)
// ============================================================================

let ctx = null;
let master = null;
let noiseBuf = null;
let volume = 0.78;

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
  if (!noiseBuf || noiseBuf.sampleRate !== ctx.sampleRate) {
    const len = Math.floor(ctx.sampleRate * 0.08);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
  }
  return ctx;
}

function triggerFilteredNoise(c, dest, now, freq, q, dur, peakGain, attack = 0.001) {
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(freq, now);
  bp.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0005, now);
  g.gain.linearRampToValueAtTime(peakGain, now + attack);
  g.gain.exponentialRampToValueAtTime(0.0005, now + dur);
  src.connect(bp);
  bp.connect(g);
  g.connect(dest);
  src.start(now);
  src.stop(now + dur + 0.01);
}

function triggerToneThud(c, dest, now, startHz, endHz, dur, peakGain, type = 'triangle') {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(startHz, now);
  osc.frequency.exponentialRampToValueAtTime(endHz, now + dur);
  g.gain.setValueAtTime(peakGain, now);
  g.gain.exponentialRampToValueAtTime(0.0005, now + dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(now);
  osc.stop(now + dur + 0.01);
}

// Crisp 20ms dual-transient mechanical flashlight switch click (higher ON / lower OFF)
export function playFlashlightClick(isTurningOn = true) {
  const c = ensureAudio();
  if (!c || !master) return;
  const now = c.currentTime;
  const shift = isTurningOn ? 1.0 : 0.86;

  // Primary 3400 Hz micro-snap transient
  triggerFilteredNoise(c, master, now, 3400 * shift, 5.5, 0.012, 0.42, 0.001);
  // Secondary 1900 Hz spring detent click (+7ms offset, total ~20ms)
  triggerToneThud(c, master, now + 0.007, 1900 * shift, 920 * shift, 0.013, 0.3, 'triangle');
  triggerFilteredNoise(c, master, now + 0.007, 1900 * shift, 4.5, 0.013, 0.26, 0.001);
}
