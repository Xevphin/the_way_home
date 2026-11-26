// ============================================================================
// src/components/JumpscareAudio.js
// High-impact 3-layer procedural Web Audio jumpscare scream & close-call sting:
// 1) Sub-Bass Impact Drop (65 Hz -> 26 Hz over 0.45s, chest-thump punch)
// 2) Dissonant Banshee Screech (detuned +19/-23 cents tritone sawtooth sweep
//    680 Hz -> 2400 Hz with 32 Hz FM flutter through high-Q resonant bandpass)
// 3) Instant Frame-1 Static Transient (0.18s high-passed white-noise burst)
// Routed through a soft-clipping WaveShaperNode + short stereo delay tail.
// Pre-warmed on gameplay start for 0ms latency on trigger!
// ============================================================================

let ctx = null;
let master = null;
let shaper = null;
let delaySend = null;
let volume = 0.75;
let staticTransientBuf = null;
let distortionCurve = null;

function makeSoftClipCurve(amount = 42) {
  const samples = 1024;
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i += 1) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

function ensureAudio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);

    // Soft-clipping WaveShaper + short eerie delay tail
    shaper = ctx.createWaveShaper();
    distortionCurve = makeSoftClipCurve(42);
    shaper.curve = distortionCurve;
    shaper.oversample = '2x';
    shaper.connect(master);

    delaySend = ctx.createDelay(0.5);
    delaySend.delayTime.value = 0.095;
    const dFilter = ctx.createBiquadFilter();
    dFilter.type = 'lowpass';
    dFilter.frequency.value = 1650;
    const dFb = ctx.createGain();
    dFb.gain.value = 0.36;
    const dWet = ctx.createGain();
    dWet.gain.value = 0.42;

    shaper.connect(delaySend);
    delaySend.connect(dFilter);
    dFilter.connect(dFb);
    dFb.connect(delaySend);
    dFilter.connect(dWet);
    dWet.connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  if (!staticTransientBuf || staticTransientBuf.sampleRate !== ctx.sampleRate) {
    const len = Math.floor(ctx.sampleRate * 0.22);
    staticTransientBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = staticTransientBuf.getChannelData(0);
    for (let i = 0; i < len; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.065));
    }
  }
  return ctx;
}

export function setJumpscareVolume(vol) {
  volume = Math.max(0, Math.min(1, vol));
  if (master && ctx) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
}

// Pre-warm AudioContext & transient buffer on gameplay start (0ms wake-up lag!)
export function prewarmJumpscareAudio() {
  const c = ensureAudio();
  if (!c || !master) return;
  try {
    const now = c.currentTime;
    const silent = c.createGain();
    silent.gain.setValueAtTime(0, now);
    silent.connect(master);
    const src = c.createBufferSource();
    src.buffer = staticTransientBuf;
    src.connect(silent);
    src.start(now);
    src.stop(now + 0.01);
  } catch {
    // Ignore pre-warm edge cases
  }
}

// Full 3-layer ~1.05s procedural jumpscare scream & sub-bass drop
export function playJumpscareScream() {
  const c = ensureAudio();
  if (!c || !shaper) return;
  const now = c.currentTime;

  // 1) Sub-Bass Impact Drop (65 Hz -> 26 Hz over 0.45s)
  ['sine', 'triangle'].forEach((type, idx) => {
    const sub = c.createOscillator();
    const g = c.createGain();
    sub.type = type;
    sub.frequency.setValueAtTime(idx === 0 ? 65 : 92, now);
    sub.frequency.exponentialRampToValueAtTime(26, now + 0.45);
    g.gain.setValueAtTime(idx === 0 ? 0.95 : 0.45, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
    sub.connect(g);
    g.connect(shaper);
    sub.start(now);
    sub.stop(now + 0.75);
  });

  // 2) Dissonant Banshee Screech (+19 / -23 cents + tritone, 680 -> 2400 Hz, 32 Hz FM flutter)
  const shriekBP = c.createBiquadFilter();
  shriekBP.type = 'bandpass';
  shriekBP.frequency.setValueAtTime(1450, now);
  shriekBP.frequency.exponentialRampToValueAtTime(2250, now + 0.35);
  shriekBP.Q.value = 5.2;
  shriekBP.connect(shaper);

  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 32;
  lfoGain.gain.value = 115;
  lfo.connect(lfoGain);
  lfo.start(now);
  lfo.stop(now + 1.08);

  [
    { start: 680, end: 2400, detune: 19, gain: 0.34 },
    { start: 680, end: 2360, detune: -23, gain: 0.34 },
    { start: 962, end: 3390, detune: 11, gain: 0.22 }, // Tritone upper shriek
  ].forEach((voice) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sawtooth';
    osc.detune.value = voice.detune;
    osc.frequency.setValueAtTime(voice.start, now);
    osc.frequency.exponentialRampToValueAtTime(voice.end, now + 0.28);
    osc.frequency.exponentialRampToValueAtTime(voice.start * 1.4, now + 1.02);
    lfoGain.connect(osc.frequency);
    g.gain.setValueAtTime(voice.gain, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.05);
    osc.connect(g);
    g.connect(shriekBP);
    osc.start(now);
    osc.stop(now + 1.06);
  });

  // 3) Instant Frame-1 Static Transient (0.18s high-passed white-noise burst on ms 0)
  const noise = c.createBufferSource();
  noise.buffer = staticTransientBuf;
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 2100;
  const nGain = c.createGain();
  nGain.gain.setValueAtTime(0.68, now);
  nGain.gain.exponentialRampToValueAtTime(0.002, now + 0.18);
  noise.connect(hp);
  hp.connect(nGain);
  nGain.connect(shaper);
  noise.start(now);
  noise.stop(now + 0.19);
}

// Secondary close-call / car window-slam scare sting for Night Car Chase lunges
export function playWindowSlamSting() {
  const c = ensureAudio();
  if (!c || !shaper) return;
  const now = c.currentTime;

  const thump = c.createOscillator();
  const tg = c.createGain();
  thump.type = 'triangle';
  thump.frequency.setValueAtTime(110, now);
  thump.frequency.exponentialRampToValueAtTime(28, now + 0.24);
  tg.gain.setValueAtTime(0.85, now);
  tg.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
  thump.connect(tg);
  tg.connect(shaper);
  thump.start(now);
  thump.stop(now + 0.3);

  const snarl = c.createOscillator();
  const sg = c.createGain();
  snarl.type = 'sawtooth';
  snarl.frequency.setValueAtTime(520, now);
  snarl.frequency.exponentialRampToValueAtTime(1480, now + 0.18);
  snarl.frequency.exponentialRampToValueAtTime(420, now + 0.42);
  sg.gain.setValueAtTime(0.28, now);
  sg.gain.exponentialRampToValueAtTime(0.001, now + 0.44);
  snarl.connect(sg);
  sg.connect(shaper);
  snarl.start(now);
  snarl.stop(now + 0.45);

  const slap = c.createBufferSource();
  slap.buffer = staticTransientBuf;
  const slGain = c.createGain();
  slGain.gain.setValueAtTime(0.55, now);
  slGain.gain.exponentialRampToValueAtTime(0.002, now + 0.16);
  slap.connect(slGain);
  slGain.connect(shaper);
  slap.start(now);
  slap.stop(now + 0.18);
}
