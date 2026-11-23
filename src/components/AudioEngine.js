// ============================================================================
// src/components/AudioEngine.js
// Procedural Web Audio synthesizer for "The Way Home":
// - Car crash THUD, engine sputter, hazard relay click, flashlight click,
// - Footsteps, stalker heartbeat, spirit flashlight recoil, sanctuary chord,
// - Fright stinger.
// ============================================================================

let audioCtx = null;
let masterGain = null;
let masterVolumeValue = 0.75;

function ensureContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    audioCtx = new AudioCtx();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = masterVolumeValue;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setMasterVolume(val) {
  masterVolumeValue = Math.max(0, Math.min(1, val));
  if (masterGain && audioCtx) {
    masterGain.gain.setTargetAtTime(masterVolumeValue, audioCtx.currentTime, 0.05);
  }
}

// Sudden loud THUD when the car hits the dark figure on the road
export function playCrashImpactThud() {
  const ctx = ensureContext();
  if (!ctx || !masterGain) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(22, now + 0.5);
  gain.gain.setValueAtTime(0.9, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.62);

  const bufferSize = ctx.sampleRate * 0.4;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(720, now);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.7, now);
  nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
  noise.connect(filter);
  filter.connect(nGain);
  nGain.connect(masterGain);
  noise.start(now);
}

// Stalling engine sputter after the crash
export function playEngineSputter() {
  const ctx = ensureContext();
  if (!ctx || !masterGain) return;
  const now = ctx.currentTime;
  [0, 0.22, 0.48].forEach((offset, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(72 - i * 14, now + offset);
    osc.frequency.exponentialRampToValueAtTime(26, now + offset + 0.18);
    gain.gain.setValueAtTime(0.24, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.2);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now + offset);
    osc.stop(now + offset + 0.21);
  });
}

// Crisp relay tick-tock for amber hazard lights
export function playHazardClick(isHigh = true) {
  const ctx = ensureContext();
  if (!ctx || !masterGain) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(isHigh ? 980 : 760, now);
  gain.gain.setValueAtTime(0.065, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.03);
}

// Crisp flashlight button click [F]
export function playFlashlightClick() {
  const ctx = ensureContext();
  if (!ctx || !masterGain) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1450, now);
  osc.frequency.exponentialRampToValueAtTime(420, now + 0.045);
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.055);
}

// Soft footstep thud while walking on rural asphalt/gravel
export function playFootstepSound(isSprinting = false) {
  const ctx = ensureContext();
  if (!ctx || !masterGain) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(isSprinting ? 108 : 86, now);
  osc.frequency.exponentialRampToValueAtTime(34, now + 0.08);
  gain.gain.setValueAtTime(isSprinting ? 0.13 : 0.075, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.095);
}

// Subtle heartbeat double-thump when the Shadow Entity stalks close
export function playHeartbeatPulse(intensity = 0.5) {
  const ctx = ensureContext();
  if (!ctx || !masterGain) return;
  const now = ctx.currentTime;
  const vol = Math.min(0.55, 0.12 + intensity * 0.42);
  [0, 0.16].forEach((offset, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(idx === 0 ? 64 : 50, now + offset);
    osc.frequency.exponentialRampToValueAtTime(26, now + offset + 0.13);
    gain.gain.setValueAtTime(vol * (idx === 0 ? 1 : 0.72), now + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now + offset);
    osc.stop(now + offset + 0.15);
  });
}

// Eerie shudder/hiss when flashlight beam banishes the spirit into fog
export function playSpiritRecoilWhisper() {
  const ctx = ensureContext();
  if (!ctx || !masterGain) return;
  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.55;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.22));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(1100, now);
  bp.frequency.exponentialRampToValueAtTime(280, now + 0.5);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.32, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
  noise.connect(bp);
  bp.connect(gain);
  gain.connect(masterGain);
  noise.start(now);
}

// Calm resonant chord when entering a blessed Safe Zone or collecting an item
export function playSanctuaryChime(isSafeZone = false) {
  const ctx = ensureContext();
  if (!ctx || !masterGain) return;
  const now = ctx.currentTime;
  const freqs = isSafeZone ? [293.66, 440.0, 587.33] : [440.0, 659.25];
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, now + i * 0.06);
    gain.gain.setValueAtTime(0.11, now + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9 + i * 0.1);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now + i * 0.06);
    osc.stop(now + 1.05 + i * 0.1);
  });
}

// Sudden horror sting if caught by the lurking shadow outside a Safe Zone
export function playStalkerCatchSting() {
  const ctx = ensureContext();
  if (!ctx || !masterGain) return;
  const now = ctx.currentTime;
  [142, 153, 214].forEach((f) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f, now);
    osc.frequency.linearRampToValueAtTime(f * 0.62, now + 0.65);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.72);
  });
}

// Visceral jumpscare: shrieking detuned screech + sub-bass slam + static burst
export function playJumpscareScreech() {
  const ctx = ensureContext();
  if (!ctx || !masterGain) return;
  const now = ctx.currentTime;

  // Sub-bass impact slam
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(58, now);
  sub.frequency.exponentialRampToValueAtTime(22, now + 0.9);
  subGain.gain.setValueAtTime(1.0, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
  sub.connect(subGain);
  subGain.connect(masterGain);
  sub.start(now);
  sub.stop(now + 1.15);

  // Shrieking detuned screech cluster with violent vibrato
  [880, 932, 1245, 1760].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    osc.type = i % 2 ? 'square' : 'sawtooth';
    osc.frequency.setValueAtTime(f * 0.6, now);
    osc.frequency.exponentialRampToValueAtTime(f, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(f * 0.45, now + 1.3);
    lfo.frequency.value = 23 + i * 7;
    lfoGain.gain.value = f * 0.06;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    lfo.start(now);
    osc.stop(now + 1.4);
    lfo.stop(now + 1.4);
  });

  // Harsh static noise burst
  const len = ctx.sampleRate * 1.2;
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1800;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.32, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  noise.connect(hp);
  hp.connect(nGain);
  nGain.connect(masterGain);
  noise.start(now);
}
