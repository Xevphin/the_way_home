// ============================================================================
// src/components/chapter2/Chapter2Audio.js
// 100% procedural Web Audio for Chapter 2 ("Unknown Mystery"):
// - startEndlessRoadDrone / stopEndlessRoadDrone: Nightmare Road Ambience
//   (hollow sub-bass wind drone + bandpassed wind gusts + eerie metallic shimmer)
// - playHeavyPantingBurst: panicked heavy breathing after the nightmare wake-up
// - startPhoneBuzzLoop / stopPhoneBuzzLoop: vibrating bedside phone & ping
// ============================================================================

let ctx = null;
let master = null;
let breathBuf = null;
let windBuf = null;
let droneRig = null;
let phoneInterval = null;
let volume = 0.75;

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

  if (!breathBuf || breathBuf.sampleRate !== ctx.sampleRate) {
    const len = Math.floor(ctx.sampleRate * 1.5);
    breathBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = breathBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i += 1) {
      last = last * 0.74 + (Math.random() * 2 - 1) * 0.26;
      d[i] = last * 1.6;
    }
  }

  if (!windBuf || windBuf.sampleRate !== ctx.sampleRate) {
    const len = Math.floor(ctx.sampleRate * 3.5);
    windBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = windBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i += 1) {
      last = last * 0.88 + (Math.random() * 2 - 1) * 0.12;
      d[i] = last * 2.1;
    }
  }
  return ctx;
}

export function setChapter2AudioVolume(vol) {
  volume = Math.max(0, Math.min(1, vol));
  if (master && ctx) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
}

// Nightmare Road Ambience: hollow sub-bass wind drone + eerie metallic shimmer
export function startEndlessRoadDrone() {
  const c = ensureAudio();
  if (!c || !master || droneRig) return;
  const now = c.currentTime;

  const bus = c.createGain();
  bus.gain.setValueAtTime(0.001, now);
  bus.gain.linearRampToValueAtTime(1.0, now + 1.4);
  bus.connect(master);

  // 1) Hollow sub-bass drone (44 Hz sine + 66 Hz triangle)
  const sub1 = c.createOscillator();
  const sub2 = c.createOscillator();
  const subLP = c.createBiquadFilter();
  const subGain = c.createGain();
  sub1.type = 'sine';
  sub1.frequency.value = 44;
  sub2.type = 'triangle';
  sub2.frequency.value = 66.2;
  subLP.type = 'lowpass';
  subLP.frequency.value = 175;
  subGain.gain.value = 0.22;
  sub1.connect(subLP);
  sub2.connect(subLP);
  subLP.connect(subGain);
  subGain.connect(bus);

  // 2) Hollow wind-gust noise swept slowly at 0.18 Hz
  const wind = c.createBufferSource();
  wind.buffer = windBuf;
  wind.loop = true;
  const windBP = c.createBiquadFilter();
  windBP.type = 'bandpass';
  windBP.frequency.value = 260;
  windBP.Q.value = 3.2;
  const windLfo = c.createOscillator();
  const windDepth = c.createGain();
  windLfo.type = 'sine';
  windLfo.frequency.value = 0.18;
  windDepth.gain.value = 110;
  windLfo.connect(windDepth);
  windDepth.connect(windBP.frequency);
  const windGain = c.createGain();
  windGain.gain.value = 0.16;
  wind.connect(windBP);
  windBP.connect(windGain);
  windGain.connect(bus);

  // 3) Faint eerie metallic shimmer (detuned high harmonics + slow 0.27 Hz breathing)
  const shim1 = c.createOscillator();
  const shim2 = c.createOscillator();
  shim1.type = 'sine';
  shim1.frequency.value = 1320;
  shim2.type = 'triangle';
  shim2.frequency.value = 1985;
  const shimBP = c.createBiquadFilter();
  shimBP.type = 'bandpass';
  shimBP.frequency.value = 1620;
  shimBP.Q.value = 6.5;
  const shimGain = c.createGain();
  shimGain.gain.value = 0.022;
  const shimLfo = c.createOscillator();
  const shimLfoDepth = c.createGain();
  shimLfo.type = 'sine';
  shimLfo.frequency.value = 0.27;
  shimLfoDepth.gain.value = 0.015;
  shimLfo.connect(shimLfoDepth);
  shimLfoDepth.connect(shimGain.gain);
  shim1.connect(shimBP);
  shim2.connect(shimBP);
  shimBP.connect(shimGain);
  shimGain.connect(bus);

  const stoppables = [sub1, sub2, wind, windLfo, shim1, shim2, shimLfo];
  stoppables.forEach((n) => n.start(now));
  droneRig = { bus, stoppables };
}

export function stopEndlessRoadDrone() {
  if (!droneRig || !ctx) return;
  const now = ctx.currentTime;
  try {
    droneRig.bus.gain.setTargetAtTime(0.0001, now, 0.1);
    droneRig.stoppables.forEach((n) => n.stop(now + 0.4));
  } catch {
    // Ignore stop race
  }
  droneRig = null;
}

// Heavy panicked gasping & panting breath sequence (~4.2s) on nightmare wake-up
export function playHeavyPantingBurst() {
  const c = ensureAudio();
  if (!c || !master || !breathBuf) return;
  const now = c.currentTime;

  [0.05, 0.85, 1.68, 2.55, 3.45].forEach((offset, idx) => {
    const start = now + offset;
    const isInhale = idx % 2 === 0;
    const src = c.createBufferSource();
    src.buffer = breathBuf;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(isInhale ? 760 : 520, start);
    bp.frequency.linearRampToValueAtTime(isInhale ? 1080 : 390, start + 0.48);
    bp.Q.value = 2.6;

    const g = c.createGain();
    const peak = Math.max(0.16, 0.46 - idx * 0.055);
    g.gain.setValueAtTime(0.001, start);
    g.gain.linearRampToValueAtTime(peak, start + 0.16);
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.62);

    src.connect(bp);
    bp.connect(g);
    g.connect(master);
    src.start(start);
    src.stop(start + 0.65);
  });
}

function triggerSinglePhoneBuzz() {
  const c = ensureAudio();
  if (!c || !master) return;
  const now = c.currentTime;

  [0, 0.24].forEach((off) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 128;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 280;
    g.gain.setValueAtTime(0.001, now + off);
    g.gain.linearRampToValueAtTime(0.15, now + off + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + off + 0.19);
    osc.connect(lp);
    lp.connect(g);
    g.connect(master);
    osc.start(now + off);
    osc.stop(now + off + 0.21);
  });

  const ping = c.createOscillator();
  const pg = c.createGain();
  ping.type = 'sine';
  ping.frequency.setValueAtTime(1180, now + 0.02);
  ping.frequency.exponentialRampToValueAtTime(1480, now + 0.18);
  pg.gain.setValueAtTime(0.09, now + 0.02);
  pg.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
  ping.connect(pg);
  pg.connect(master);
  ping.start(now + 0.02);
  ping.stop(now + 0.28);
}

export function startPhoneBuzzLoop() {
  stopPhoneBuzzLoop();
  triggerSinglePhoneBuzz();
  phoneInterval = setInterval(triggerSinglePhoneBuzz, 2600);
}

export function stopPhoneBuzzLoop() {
  if (phoneInterval) {
    clearInterval(phoneInterval);
    phoneInterval = null;
  }
}
