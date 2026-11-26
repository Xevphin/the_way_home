// ============================================================================
// src/components/ChaseThemeAudio.js
// Dedicated Web Audio synthesizer for the Chapter 1 Escape Chase:
// - Procedural horror chase theme (pulsing bass synth, heartbeat percussion,
//   rising dissonant horror strings/pad)
// - Tire-screech SFX on sharp steering turns
// - 2-second hood-slam + starter crank + engine ignition catch sequence
// ============================================================================

let ctx = null;
let master = null;
let volume = 0.75;
let chaseInterval = null;
let chaseNodes = [];
let lastScreechTime = 0;

function ensureCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function setChaseAudioVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  if (master && ctx) {
    master.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
  }
}

export function stopEscapeChaseTheme() {
  if (chaseInterval) {
    clearInterval(chaseInterval);
    chaseInterval = null;
  }
  chaseNodes.forEach((n) => {
    try {
      n.stop?.();
      n.disconnect?.();
    } catch {
      // Ignore already stopped nodes
    }
  });
  chaseNodes = [];
}

// Tense driving procedural horror chase theme: pulsing bass + heartbeat drums + rising dissonance
export function startEscapeChaseTheme() {
  stopEscapeChaseTheme();
  const c = ensureCtx();
  if (!c || !master) return;

  const bus = c.createGain();
  bus.gain.setValueAtTime(0.001, c.currentTime);
  bus.gain.linearRampToValueAtTime(0.52, c.currentTime + 0.5);
  bus.connect(master);

  // Rising dissonant horror tritone pad (F#3 -> C4 eerie tension)
  const padA = c.createOscillator();
  const padB = c.createOscillator();
  const padFilter = c.createBiquadFilter();
  const padGain = c.createGain();
  padA.type = 'sawtooth';
  padB.type = 'sawtooth';
  padA.frequency.setValueAtTime(185, c.currentTime);
  padA.frequency.linearRampToValueAtTime(220, c.currentTime + 24);
  padB.frequency.setValueAtTime(261.63, c.currentTime);
  padB.frequency.linearRampToValueAtTime(311.13, c.currentTime + 24);
  padFilter.type = 'bandpass';
  padFilter.frequency.setValueAtTime(640, c.currentTime);
  padFilter.frequency.linearRampToValueAtTime(1450, c.currentTime + 24);
  padFilter.Q.value = 1.8;
  padGain.gain.setValueAtTime(0.055, c.currentTime);
  padA.connect(padFilter);
  padB.connect(padFilter);
  padFilter.connect(padGain);
  padGain.connect(bus);
  padA.start();
  padB.start();
  chaseNodes.push(padA, padB, padFilter, padGain, bus);

  // 16th-note pulsing bass ostinato + heavy heartbeat percussion (150 BPM feel)
  const bassNotes = [55, 55, 58.27, 55, 65.41, 55, 61.74, 51.91];
  let step = 0;

  const tick = () => {
    if (!ctx || !chaseNodes.length) return;
    const now = ctx.currentTime;

    // Pulsing dark sawtooth bass synth
    const osc = ctx.createOscillator();
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(bassNotes[step % bassNotes.length], now);
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(step % 4 === 0 ? 480 : 280, now);
    g.gain.setValueAtTime(0.22, now);
    g.gain.exponentialRampToValueAtTime(0.002, now + 0.17);
    osc.connect(lp);
    lp.connect(g);
    g.connect(bus);
    osc.start(now);
    osc.stop(now + 0.18);

    // Heartbeat kick percussion on steps 0 & 1 of each bar
    if (step % 4 === 0 || step % 4 === 1) {
      const k = ctx.createOscillator();
      const kg = ctx.createGain();
      k.type = 'sine';
      k.frequency.setValueAtTime(step % 4 === 0 ? 96 : 74, now);
      k.frequency.exponentialRampToValueAtTime(28, now + 0.14);
      kg.gain.setValueAtTime(step % 4 === 0 ? 0.42 : 0.28, now);
      kg.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      k.connect(kg);
      kg.connect(bus);
      k.start(now);
      k.stop(now + 0.17);
    }

    step += 1;
  };

  tick();
  chaseInterval = setInterval(tick, 185);
}

// Sharp rubber tire-screech SFX on hard lane swerves (rate-limited for realism)
export function playTireScreech() {
  const c = ensureCtx();
  if (!c || !master) return;
  const now = c.currentTime;
  if (now - lastScreechTime < 0.48) return;
  lastScreechTime = now;

  const len = Math.floor(c.sampleRate * 0.28);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
  }
  const src = c.createBufferSource();
  src.buffer = buf;

  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(1620, now);
  bp.frequency.exponentialRampToValueAtTime(1180, now + 0.26);
  bp.Q.value = 6.5;

  const g = c.createGain();
  g.gain.setValueAtTime(0.24, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

  src.connect(bp);
  bp.connect(g);
  g.connect(master);
  src.start(now);
}

// 2-second hood-slam + starter crank + engine ignition catch before Lurker roars!
export function playCarIgnitionSequence() {
  const c = ensureCtx();
  if (!c || !master) return;
  const now = c.currentTime;

  // 0.0s Metallic hood slam
  const slam = c.createOscillator();
  const slamG = c.createGain();
  slam.type = 'triangle';
  slam.frequency.setValueAtTime(135, now);
  slam.frequency.exponentialRampToValueAtTime(34, now + 0.18);
  slamG.gain.setValueAtTime(0.65, now);
  slamG.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  slam.connect(slamG);
  slamG.connect(master);
  slam.start(now);
  slam.stop(now + 0.24);

  // 0.42s - 1.25s Starter motor cranking pulses
  [0.42, 0.68, 0.94, 1.18].forEach((off) => {
    const cr = c.createOscillator();
    const cg = c.createGain();
    cr.type = 'sawtooth';
    cr.frequency.setValueAtTime(92, now + off);
    cr.frequency.linearRampToValueAtTime(118, now + off + 0.15);
    cg.gain.setValueAtTime(0.18, now + off);
    cg.gain.exponentialRampToValueAtTime(0.001, now + off + 0.18);
    cr.connect(cg);
    cg.connect(master);
    cr.start(now + off);
    cr.stop(now + off + 0.19);
  });

  // 1.42s Engine roars to life!
  const roar = c.createOscillator();
  const lp = c.createBiquadFilter();
  const rg = c.createGain();
  roar.type = 'sawtooth';
  roar.frequency.setValueAtTime(64, now + 1.42);
  roar.frequency.exponentialRampToValueAtTime(142, now + 1.75);
  roar.frequency.exponentialRampToValueAtTime(86, now + 2.15);
  lp.type = 'lowpass';
  lp.frequency.value = 380;
  rg.gain.setValueAtTime(0.01, now + 1.42);
  rg.gain.linearRampToValueAtTime(0.36, now + 1.68);
  rg.gain.exponentialRampToValueAtTime(0.002, now + 2.2);
  roar.connect(lp);
  lp.connect(rg);
  rg.connect(master);
  roar.start(now + 1.42);
  roar.stop(now + 2.22);
}
