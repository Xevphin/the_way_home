// ============================================================================
// src/components/menuAmbience.js
// Haunting slow lone female vocal hum BGM for the Main Title Screen (~66 BPM):
// - Dual detuned formant-filtered oscillators ("mmm / ooo" bandpass formants
//   at 320 Hz & 780 Hz) with slow organic 4.8 Hz pitch vibrato
// - Gentle breathy air texture + cavernous dark feedback delay/reverb tail
// - Melancholic minor lullaby phrase over a whisper-quiet 55 Hz sub-drone
// - Respects Master Volume & smoothly fades out (0.8s) on PLAY / CONTINUE
// ============================================================================

let ctx = null;
let masterGain = null;
let bedGain = null;
let vocalBus = null;
let masterVolume = 0.7;
let activeNodes = [];
let phraseTimers = [];
let stopTimeout = null;
let isPlaying = false;

// ~66 BPM (1 beat = 909ms): melancholic minor lullaby hum phrase (Hz, beats)
const BEAT_MS = 909;
const LULLABY_PHRASE = [
  { freq: 293.66, beats: 2.0 }, // D4
  { freq: 349.23, beats: 1.5 }, // F4
  { freq: 329.63, beats: 1.5 }, // E4
  { freq: 293.66, beats: 2.5 }, // D4
  { freq: 0, beats: 1.0 },      // eerie breath pause
  { freq: 261.63, beats: 1.5 }, // C4
  { freq: 220.0, beats: 2.0 },  // A3
  { freq: 233.08, beats: 1.5 }, // Bb3
  { freq: 220.0, beats: 3.0 },  // A3 (long hollow tail)
  { freq: 0, beats: 2.5 },      // dark silence before loop
];

function ensureAudio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    masterGain = ctx.createGain();
    masterGain.gain.value = masterVolume;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function setMenuAmbienceVolume(vol) {
  masterVolume = Math.max(0, Math.min(1, vol));
  if (masterGain && ctx) {
    masterGain.gain.setTargetAtTime(masterVolume, ctx.currentTime, 0.08);
  }
}

function cleanupNodes() {
  phraseTimers.forEach((id) => clearTimeout(id));
  phraseTimers = [];
  activeNodes.forEach((n) => {
    try {
      n.stop?.();
      n.disconnect?.();
    } catch {
      // Ignore already-stopped nodes
    }
  });
  activeNodes = [];
  bedGain = null;
  vocalBus = null;
  isPlaying = false;
}

function playHumNote(freq, durSec) {
  if (!ctx || !vocalBus || !isPlaying || freq <= 0) return;
  const now = ctx.currentTime;

  // Dual detuned vocal oscillators with slow 4.8 Hz organic vibrato
  const oscA = ctx.createOscillator();
  const oscB = ctx.createOscillator();
  oscA.type = 'sawtooth';
  oscB.type = 'triangle';
  oscA.frequency.setValueAtTime(freq, now);
  oscB.frequency.setValueAtTime(freq * 1.003, now);

  const vib = ctx.createOscillator();
  const vibGain = ctx.createGain();
  vib.type = 'sine';
  vib.frequency.value = 4.8;
  vibGain.gain.setValueAtTime(0.01, now);
  vibGain.gain.linearRampToValueAtTime(freq * 0.012, now + Math.min(0.65, durSec * 0.45));
  vib.connect(vibGain);
  vibGain.connect(oscA.frequency);
  vibGain.connect(oscB.frequency);

  // Parallel "mmm / ooo" vowel formant bandpass filters (320 Hz & 780 Hz)
  const f1 = ctx.createBiquadFilter();
  f1.type = 'bandpass';
  f1.frequency.setValueAtTime(320, now);
  f1.Q.value = 4.2;

  const f2 = ctx.createBiquadFilter();
  f2.type = 'bandpass';
  f2.frequency.setValueAtTime(780, now);
  f2.Q.value = 5.0;

  const f2Gain = ctx.createGain();
  f2Gain.gain.value = 0.48;

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, now);
  env.gain.linearRampToValueAtTime(0.24, now + Math.min(0.45, durSec * 0.3));
  env.gain.setValueAtTime(0.22, now + Math.max(0.46, durSec - 0.55));
  env.gain.exponentialRampToValueAtTime(0.0001, now + durSec + 0.18);

  oscA.connect(f1);
  oscB.connect(f1);
  oscA.connect(f2);
  oscB.connect(f2);
  f1.connect(env);
  f2.connect(f2Gain);
  f2Gain.connect(env);
  env.connect(vocalBus);

  oscA.start(now);
  oscB.start(now);
  vib.start(now);
  oscA.stop(now + durSec + 0.25);
  oscB.stop(now + durSec + 0.25);
  vib.stop(now + durSec + 0.25);
}

function scheduleLullabyLoop() {
  if (!isPlaying) return;
  let offsetMs = 400;
  LULLABY_PHRASE.forEach((step) => {
    const durSec = (step.beats * BEAT_MS) / 1000;
    if (step.freq > 0) {
      phraseTimers.push(setTimeout(() => playHumNote(step.freq, durSec), offsetMs));
    }
    offsetMs += step.beats * BEAT_MS;
  });
  phraseTimers.push(setTimeout(scheduleLullabyLoop, offsetMs));
}

export function startMenuAmbience() {
  if (isPlaying) {
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return;
  }
  clearTimeout(stopTimeout);
  const c = ensureAudio();
  if (!c || !masterGain) return;
  isPlaying = true;

  const now = c.currentTime;
  bedGain = c.createGain();
  bedGain.gain.setValueAtTime(0.0001, now);
  bedGain.gain.linearRampToValueAtTime(0.62, now + 1.6);
  bedGain.connect(masterGain);

  // Dark reverberant space bus (dual feedback delay + 880 Hz warm lowpass tail)
  vocalBus = c.createGain();
  vocalBus.gain.value = 0.85;
  const dryLP = c.createBiquadFilter();
  dryLP.type = 'lowpass';
  dryLP.frequency.value = 1350;
  vocalBus.connect(dryLP);
  dryLP.connect(bedGain);

  const delayA = c.createDelay(1.2);
  delayA.delayTime.value = 0.39;
  const delayB = c.createDelay(1.2);
  delayB.delayTime.value = 0.63;
  const wetLP = c.createBiquadFilter();
  wetLP.type = 'lowpass';
  wetLP.frequency.value = 820;
  const fbGain = c.createGain();
  fbGain.gain.value = 0.48;
  const wetOut = c.createGain();
  wetOut.gain.value = 0.52;

  vocalBus.connect(delayA);
  delayA.connect(delayB);
  delayB.connect(wetLP);
  wetLP.connect(fbGain);
  fbGain.connect(delayA);
  wetLP.connect(wetOut);
  wetOut.connect(bedGain);

  // Subtle 55 Hz dark room sub-drone & breathy night air bed
  const sub = c.createOscillator();
  const subG = c.createGain();
  sub.type = 'sine';
  sub.frequency.value = 55.0;
  subG.gain.value = 0.14;
  sub.connect(subG);
  subG.connect(bedGain);
  sub.start(now);

  const airBuf = c.createBuffer(1, c.sampleRate * 3, c.sampleRate);
  const d = airBuf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.03 * w) / 1.03;
    d[i] = last * 1.1 + w * 0.035;
  }
  const air = c.createBufferSource();
  air.buffer = airBuf;
  air.loop = true;
  const airBP = c.createBiquadFilter();
  airBP.type = 'bandpass';
  airBP.frequency.value = 620;
  airBP.Q.value = 0.8;
  const airG = c.createGain();
  airG.gain.value = 0.1;
  air.connect(airBP);
  airBP.connect(airG);
  airG.connect(bedGain);
  air.start(now);

  activeNodes.push(
    sub, subG, air, airBP, airG, vocalBus, dryLP, delayA, delayB, wetLP, fbGain, wetOut, bedGain
  );
  scheduleLullabyLoop();
}

export function fadeOutMenuAmbience(durationSec = 0.8) {
  if (!isPlaying) return;
  isPlaying = false;
  phraseTimers.forEach((id) => clearTimeout(id));
  phraseTimers = [];
  if (ctx && bedGain) {
    const now = ctx.currentTime;
    bedGain.gain.cancelScheduledValues(now);
    bedGain.gain.setValueAtTime(Math.max(0.0001, bedGain.gain.value), now);
    bedGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
  }
  clearTimeout(stopTimeout);
  stopTimeout = setTimeout(cleanupNodes, Math.ceil(durationSec * 1000) + 60);
}
