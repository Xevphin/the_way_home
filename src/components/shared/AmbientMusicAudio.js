// ============================================================================
// src/components/AmbientMusicAudio.js
// Procedural Web Audio environmental & music beds across Chapter 1:
// - Soft warm slice-of-life morning music indoors at home
// - Bright morning outdoor ambience (birds chirping + gentle breeze)
// - Continuous car engine hum & road roll during all driving scenes
// - Subtle Universiti Alam campus courtyard ambience
// ============================================================================

let ambCtx = null;
let ambMaster = null;
let ambVolume = 0.75;
let ambDucked = false;

const layers = {
  morningMusic: { timers: [], nodes: [] },
  morningOutdoor: { timers: [], nodes: [] },
  drivingEngine: { timers: [], nodes: [] },
  campus: { timers: [], nodes: [] },
};

function ensureAmbCtx() {
  if (typeof window === 'undefined') return null;
  if (!ambCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ambCtx = new Ctx();
    ambMaster = ambCtx.createGain();
    ambMaster.gain.value = ambVolume;
    ambMaster.connect(ambCtx.destination);
  }
  if (ambCtx.state === 'suspended') ambCtx.resume().catch(() => {});
  return ambCtx;
}

export function setAmbientMusicVolume(v) {
  ambVolume = Math.max(0, Math.min(1, v));
  if (ambMaster && ambCtx) {
    const target = ambVolume * (ambDucked ? 0.7 : 1);
    ambMaster.gain.setTargetAtTime(target, ambCtx.currentTime, 0.06);
  }
}

// Smoothly duck background ambience/music by ~30% during active dialogue/monologue
export function setAmbientDialogueDuck(ducked) {
  ambDucked = Boolean(ducked);
  if (ambMaster && ambCtx) {
    const target = ambVolume * (ambDucked ? 0.7 : 1);
    ambMaster.gain.setTargetAtTime(target, ambCtx.currentTime, ambDucked ? 0.25 : 0.4);
  }
}

function stopLayer(key) {
  const layer = layers[key];
  if (!layer) return;
  layer.timers.forEach((id) => clearInterval(id));
  layer.nodes.forEach((n) => {
    try {
      n.stop?.();
      n.disconnect?.();
    } catch {
      // Ignore already stopped nodes
    }
  });
  layer.timers = [];
  layer.nodes = [];
}

export function stopAllSceneAmbience() {
  Object.keys(layers).forEach((k) => stopLayer(k));
}

// 1) Soft, warm slice-of-life morning music indoors (Cmaj7 -> Am7 -> Fmaj7 -> G6)
export function startMorningMusic() {
  if (layers.morningMusic.timers.length) return;
  const ctx = ensureAmbCtx();
  if (!ctx || !ambMaster) return;

  const bus = ctx.createGain();
  bus.gain.setValueAtTime(0.001, ctx.currentTime);
  bus.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.4);
  bus.connect(ambMaster);
  layers.morningMusic.nodes.push(bus);

  const prog = [
    [261.63, 329.63, 392.0, 493.88],
    [220.0, 261.63, 329.63, 392.0],
    [174.61, 220.0, 261.63, 329.63],
    [196.0, 246.94, 293.66, 329.63],
  ];
  let step = 0;

  const playBar = () => {
    if (!ambCtx) return;
    const now = ambCtx.currentTime;
    const chord = prog[step % prog.length];
    step += 1;
    chord.forEach((freq, idx) => {
      const osc = ambCtx.createOscillator();
      const g = ambCtx.createGain();
      osc.type = idx === 3 ? 'sine' : 'triangle';
      const t0 = now + idx * 0.14;
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(0.14, t0 + 0.12);
      g.gain.exponentialRampToValueAtTime(0.002, t0 + 2.5);
      osc.connect(g);
      g.connect(bus);
      osc.start(t0);
      osc.stop(t0 + 2.6);
    });
  };
  playBar();
  layers.morningMusic.timers.push(setInterval(playBar, 2700));
}
export function stopMorningMusic() { stopLayer('morningMusic'); }

// 2) Bright morning outdoor ambience (birds chirping + gentle morning breeze)
export function startMorningOutdoorAmbience() {
  if (layers.morningOutdoor.timers.length) return;
  const ctx = ensureAmbCtx();
  if (!ctx || !ambMaster) return;

  const bus = ctx.createGain();
  bus.gain.setValueAtTime(0.001, ctx.currentTime);
  bus.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.9);
  bus.connect(ambMaster);

  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.18;
  const breeze = ctx.createBufferSource();
  breeze.buffer = buf;
  breeze.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 520;
  const bg = ctx.createGain();
  bg.gain.value = 0.25;
  breeze.connect(lp);
  lp.connect(bg);
  bg.connect(bus);
  breeze.start();
  layers.morningOutdoor.nodes.push(breeze, lp, bg, bus);

  const chirp = () => {
    if (!ambCtx) return;
    const now = ambCtx.currentTime;
    const f0 = 2600 + Math.random() * 1100;
    [0, 0.13].forEach((off) => {
      const osc = ambCtx.createOscillator();
      const g = ambCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f0, now + off);
      osc.frequency.exponentialRampToValueAtTime(f0 * 1.32, now + off + 0.08);
      g.gain.setValueAtTime(0.001, now + off);
      g.gain.linearRampToValueAtTime(0.09, now + off + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + off + 0.1);
      osc.connect(g);
      g.connect(bus);
      osc.start(now + off);
      osc.stop(now + off + 0.11);
    });
  };
  chirp();
  layers.morningOutdoor.timers.push(setInterval(chirp, 2100));
}
export function stopMorningOutdoorAmbience() { stopLayer('morningOutdoor'); }

// 3) Continuous car engine hum & asphalt road roll during all driving scenes
export function startDrivingEngineAudio() {
  if (layers.drivingEngine.nodes.length) return;
  const ctx = ensureAmbCtx();
  if (!ctx || !ambMaster) return;

  const bus = ctx.createGain();
  bus.gain.setValueAtTime(0.001, ctx.currentTime);
  bus.gain.linearRampToValueAtTime(0.24, ctx.currentTime + 0.7);
  bus.connect(ambMaster);

  // Warm dual-harmonic engine purr
  [54, 108].forEach((hz, idx) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = idx === 0 ? 'sawtooth' : 'triangle';
    osc.frequency.value = hz;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 175;
    g.gain.value = idx === 0 ? 0.24 : 0.12;
    osc.connect(lp);
    lp.connect(g);
    g.connect(bus);
    osc.start();
    layers.drivingEngine.nodes.push(osc, lp, g);
  });

  // Tire / road asphalt roll noise
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const roll = ctx.createBufferSource();
  roll.buffer = buf;
  roll.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 260;
  bp.Q.value = 0.7;
  const rg = ctx.createGain();
  rg.gain.value = 0.18;
  roll.connect(bp);
  bp.connect(rg);
  rg.connect(bus);
  roll.start();
  layers.drivingEngine.nodes.push(roll, bp, rg, bus);
}
export function stopDrivingEngineAudio() { stopLayer('drivingEngine'); }

// 4) Subtle Universiti Alam campus courtyard ambience (soft breeze + faint murmur)
export function startCampusAmbience() {
  if (layers.campus.nodes.length) return;
  const ctx = ensureAmbCtx();
  if (!ctx || !ambMaster) return;

  const bus = ctx.createGain();
  bus.gain.setValueAtTime(0.001, ctx.currentTime);
  bus.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.0);
  bus.connect(ambMaster);

  const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.22;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 640;
  bp.Q.value = 1.2;
  src.connect(bp);
  bp.connect(bus);
  src.start();
  layers.campus.nodes.push(src, bp, bus);
}
export function stopCampusAmbience() { stopLayer('campus'); }
