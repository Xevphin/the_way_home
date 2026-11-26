// ============================================================================
// src/components/chapter2/StudioAudio.js
// 100% procedural Web Audio for Chapter 2's Movie Studio Soundstage:
// - playClapperboardSnap(): crisp wooden film slate CLACK! on Cutscene 2 snap
// - playBroDapClasp(): satisfying crisp palm-slap + warm handshake clasp
// - startStudioAmbience() / stopStudioAmbience(): cheerful, upbeat major-key
//   acoustic/lo-fi studio break BGM loop (plucked chords + light bouncy beat)
// ============================================================================

let ctx = null;
let master = null;
let noiseBuf = null;
let bgmTimer = null;
let bgmStep = 0;
let volume = 0.75;

const STUDIO_CHORDS = [
  [261.63, 329.63, 392.0, 493.88], // Cmaj7
  [220.0, 261.63, 329.63, 392.0],  // Am7
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [196.0, 246.94, 293.66, 392.0],  // G6
];
const MELODY_NOTES = [523.25, 659.25, 587.33, 783.99, 659.25, 523.25, 587.33, 659.25];

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
    const len = Math.floor(ctx.sampleRate * 0.25);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i += 1) d[i] = Math.random() * 2 - 1;
  }
  return ctx;
}

export function setStudioAudioVolume(vol) {
  volume = Math.max(0, Math.min(1, vol));
  if (master && ctx) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
}

// Crisp wooden film slate CLACK! when snapping into the movie studio
export function playClapperboardSnap() {
  const c = ensureAudio();
  if (!c || !master || !noiseBuf) return;
  const now = c.currentTime;

  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1850;
  bp.Q.value = 2.8;
  const g = c.createGain();
  g.gain.setValueAtTime(0.95, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
  src.connect(bp);
  bp.connect(g);
  g.connect(master);
  src.start(now);
  src.stop(now + 0.065);

  const wood = c.createOscillator();
  const wg = c.createGain();
  wood.type = 'triangle';
  wood.frequency.setValueAtTime(640, now);
  wood.frequency.exponentialRampToValueAtTime(210, now + 0.045);
  wg.gain.setValueAtTime(0.5, now);
  wg.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  wood.connect(wg);
  wg.connect(master);
  wood.start(now);
  wood.stop(now + 0.06);
}

// Crisp bro-dap palm slap + warm hand clasp when dapping up Uncle / Ustaz
export function playBroDapClasp() {
  const c = ensureAudio();
  if (!c || !master || !noiseBuf) return;
  const now = c.currentTime;

  const slap = c.createBufferSource();
  slap.buffer = noiseBuf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1420;
  bp.Q.value = 1.9;
  const sg = c.createGain();
  sg.gain.setValueAtTime(0.85, now);
  sg.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
  slap.connect(bp);
  bp.connect(sg);
  sg.connect(master);
  slap.start(now);
  slap.stop(now + 0.085);

  const thump = c.createOscillator();
  const tg = c.createGain();
  thump.type = 'sine';
  thump.frequency.setValueAtTime(210, now);
  thump.frequency.exponentialRampToValueAtTime(88, now + 0.09);
  tg.gain.setValueAtTime(0.55, now);
  tg.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  thump.connect(tg);
  tg.connect(master);
  thump.start(now);
  thump.stop(now + 0.11);
}

function playPluckNote(c, now, freq, peakGain, dur = 0.45, type = 'triangle') {
  const osc = c.createOscillator();
  const lp = c.createBiquadFilter();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(2400, now);
  lp.frequency.exponentialRampToValueAtTime(680, now + dur);
  g.gain.setValueAtTime(0.001, now);
  g.gain.linearRampToValueAtTime(peakGain, now + 0.014);
  g.gain.exponentialRampToValueAtTime(0.0005, now + dur);
  osc.connect(lp);
  lp.connect(g);
  g.connect(master);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

function playLightShaker(c, now, accent) {
  if (!noiseBuf) return;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 5200;
  const g = c.createGain();
  g.gain.setValueAtTime(accent ? 0.045 : 0.022, now);
  g.gain.exponentialRampToValueAtTime(0.0005, now + 0.045);
  src.connect(hp);
  hp.connect(g);
  g.connect(master);
  src.start(now);
  src.stop(now + 0.055);
}

// Cheerful, upbeat acoustic/lo-fi studio BGM loop (~112 BPM eighth-note groove)
export function startStudioAmbience() {
  const c = ensureAudio();
  if (!c || !master || bgmTimer) return;
  bgmStep = 0;

  const tick = () => {
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const bar = Math.floor(bgmStep / 8) % STUDIO_CHORDS.length;
    const beat = bgmStep % 8;
    const chord = STUDIO_CHORDS[bar];

    // Strummed warm acoustic major-key chord on beats 0 and 4
    if (beat === 0 || beat === 4) {
      chord.forEach((hz, idx) => {
        playPluckNote(ctx, now + idx * 0.024, hz, beat === 0 ? 0.075 : 0.05, 0.72, 'triangle');
      });
    }
    // Bouncy warm bass root note on beats 0, 3, 6
    if (beat === 0 || beat === 3 || beat === 6) {
      playPluckNote(ctx, now, chord[0] * 0.5, 0.11, 0.36, 'sine');
    }
    // Cheerful plucked melody sparkle on off-beats
    if (beat === 2 || beat === 5 || beat === 7) {
      const mNote = MELODY_NOTES[(bgmStep + bar) % MELODY_NOTES.length];
      playPluckNote(ctx, now, mNote, 0.048, 0.34, 'sine');
    }
    // Light lo-fi shaker groove
    playLightShaker(ctx, now, beat % 2 === 0);
    bgmStep = (bgmStep + 1) % 32;
  };

  tick();
  bgmTimer = setInterval(tick, 268);
}

export function stopStudioAmbience() {
  if (bgmTimer) {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }
}
