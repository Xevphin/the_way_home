// ============================================================================
// src/components/LurkerAudio.js
// Dedicated procedural Web Audio horror effects for the Shadow Lurker:
// 1) playLurkerBanishScreech() — ~0.85s pained wraith screech when banished by
//    the flashlight (tritone-detuned sawtooth 2500 -> 520 Hz + 34 Hz FM flutter
//    through Q=7 resonant bandpass + 1800 Hz high-passed hiss + short echo tail)
// 2) updateLurkerWhisperProximity(proximity01) / stopLurkerWhispers() —
//    distance-scaled multi-voice whisper bed (breathy noise -> dual sweeping
//    vocal-formant bandpasses ~420 Hz & ~1180 Hz -> 3.5 Hz + 5.7 Hz syllabic LFOs)
// ============================================================================

let ctx = null;
let master = null;
let echoSend = null;
let hissBuf = null;
let whisperNoiseBuf = null;
let whisperRig = null;
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

    // Short eerie echo tail for banish screech
    echoSend = ctx.createDelay(0.5);
    echoSend.delayTime.value = 0.11;
    const echoLP = ctx.createBiquadFilter();
    echoLP.type = 'lowpass';
    echoLP.frequency.value = 2100;
    const echoFb = ctx.createGain();
    echoFb.gain.value = 0.38;
    const echoWet = ctx.createGain();
    echoWet.gain.value = 0.45;

    echoSend.connect(echoLP);
    echoLP.connect(echoFb);
    echoFb.connect(echoSend);
    echoLP.connect(echoWet);
    echoWet.connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  if (!hissBuf || hissBuf.sampleRate !== ctx.sampleRate) {
    const len = Math.floor(ctx.sampleRate * 0.85);
    hissBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = hissBuf.getChannelData(0);
    for (let i = 0; i < len; i += 1) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.32));
    }
  }

  if (!whisperNoiseBuf || whisperNoiseBuf.sampleRate !== ctx.sampleRate) {
    const len = Math.floor(ctx.sampleRate * 3.0);
    whisperNoiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = whisperNoiseBuf.getChannelData(0);
    let prev = 0;
    for (let i = 0; i < len; i += 1) {
      const white = Math.random() * 2 - 1;
      // Soft pink-ish breathy tint so whispers sound vocal rather than harsh static
      prev = prev * 0.62 + white * 0.38;
      d[i] = prev * 1.45;
    }
  }
  return ctx;
}

function ensureWhisperRig() {
  const c = ensureAudio();
  if (!c || !master) return null;
  if (whisperRig) return whisperRig;

  const src = c.createBufferSource();
  src.buffer = whisperNoiseBuf;
  src.loop = true;

  // Dual sweeping vocal-formant bandpass filters (~420 Hz and ~1180 Hz)
  const formant1 = c.createBiquadFilter();
  formant1.type = 'bandpass';
  formant1.frequency.value = 420;
  formant1.Q.value = 5.5;

  const formant2 = c.createBiquadFilter();
  formant2.type = 'bandpass';
  formant2.frequency.value = 1180;
  formant2.Q.value = 6.5;

  const f1Sweep = c.createOscillator();
  const f1Depth = c.createGain();
  f1Sweep.type = 'sine';
  f1Sweep.frequency.value = 0.43;
  f1Depth.gain.value = 95;
  f1Sweep.connect(f1Depth);
  f1Depth.connect(formant1.frequency);

  const f2Sweep = c.createOscillator();
  const f2Depth = c.createGain();
  f2Sweep.type = 'sine';
  f2Sweep.frequency.value = 0.61;
  f2Depth.gain.value = 260;
  f2Sweep.connect(f2Depth);
  f2Depth.connect(formant2.frequency);

  // Irregular syllabic amplitude envelope (3.5 Hz + 5.7 Hz overlapping murmur)
  const syllabicGain = c.createGain();
  syllabicGain.gain.value = 0.52;

  const sylA = c.createOscillator();
  const sylAGain = c.createGain();
  sylA.type = 'sine';
  sylA.frequency.value = 3.5;
  sylAGain.gain.value = 0.24;
  sylA.connect(sylAGain);
  sylAGain.connect(syllabicGain.gain);

  const sylB = c.createOscillator();
  const sylBGain = c.createGain();
  sylB.type = 'triangle';
  sylB.frequency.value = 5.7;
  sylBGain.gain.value = 0.2;
  sylB.connect(sylBGain);
  sylBGain.connect(syllabicGain.gain);

  const proxGain = c.createGain();
  proxGain.gain.value = 0;

  src.connect(formant1);
  src.connect(formant2);
  formant1.connect(syllabicGain);
  formant2.connect(syllabicGain);
  syllabicGain.connect(proxGain);
  proxGain.connect(master);

  const now = c.currentTime;
  src.start(now);
  f1Sweep.start(now);
  f2Sweep.start(now);
  sylA.start(now);
  sylB.start(now);

  whisperRig = { proxGain };
  return whisperRig;
}

// ~0.85s loud supernatural wraith screech when the flashlight banishes the Lurker
export function playLurkerBanishScreech() {
  const c = ensureAudio();
  if (!c || !master || !echoSend) return;
  const now = c.currentTime;
  const dur = 0.85;

  // High-Q resonant bandpass filter (Q = 7) sweeping downward with the shriek
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 7.0;
  bp.frequency.setValueAtTime(2200, now);
  bp.frequency.exponentialRampToValueAtTime(640, now + dur);

  const screechBus = c.createGain();
  screechBus.gain.setValueAtTime(0.001, now);
  screechBus.gain.linearRampToValueAtTime(0.92, now + 0.025);
  screechBus.gain.exponentialRampToValueAtTime(0.001, now + dur);
  bp.connect(screechBus);
  screechBus.connect(master);
  screechBus.connect(echoSend);

  // 34 Hz rapid FM shriek flutter LFO
  const fmLfo = c.createOscillator();
  const fmGain = c.createGain();
  fmLfo.type = 'sine';
  fmLfo.frequency.value = 34;
  fmGain.gain.value = 145;
  fmLfo.connect(fmGain);
  fmLfo.start(now);
  fmLfo.stop(now + dur + 0.04);

  // Two dissonant tritone-detuned sawtooth oscillators sweeping 2500 Hz -> 520 Hz
  [
    { start: 2500, end: 520, detune: 21, gain: 0.44 },
    { start: 1768, end: 368, detune: -19, gain: 0.38 },
  ].forEach((v) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sawtooth';
    osc.detune.value = v.detune;
    osc.frequency.setValueAtTime(v.start, now);
    osc.frequency.exponentialRampToValueAtTime(v.end, now + dur);
    fmGain.connect(osc.frequency);
    g.gain.value = v.gain;
    osc.connect(g);
    g.connect(bp);
    osc.start(now);
    osc.stop(now + dur + 0.04);
  });

  // High-passed hissing noise burst (1800 Hz) layered into the banish scream
  const hiss = c.createBufferSource();
  hiss.buffer = hissBuf;
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1800;
  const hGain = c.createGain();
  hGain.gain.setValueAtTime(0.62, now);
  hGain.gain.exponentialRampToValueAtTime(0.002, now + 0.72);
  hiss.connect(hp);
  hp.connect(hGain);
  hGain.connect(master);
  hGain.connect(echoSend);
  hiss.start(now);
  hiss.stop(now + 0.76);
}

// Smoothly scale multi-voice whisper bed volume based on proximity [0..1]
export function updateLurkerWhisperProximity(proximity01) {
  const clamped = Math.max(0, Math.min(1, proximity01 || 0));
  if (clamped <= 0.002) {
    if (whisperRig && ctx) {
      whisperRig.proxGain.gain.setTargetAtTime(0, ctx.currentTime, 0.07);
    }
    return;
  }
  const rig = ensureWhisperRig();
  if (!rig || !ctx) return;
  const targetGain = Math.pow(clamped, 1.55) * 0.44;
  rig.proxGain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.08);
}

export function stopLurkerWhispers() {
  if (whisperRig && ctx) {
    whisperRig.proxGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
  }
}
