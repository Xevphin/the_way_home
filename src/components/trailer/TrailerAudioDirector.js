// ============================================================================
// src/components/trailer/TrailerAudioDirector.js
// Synchronized 50-second Web Audio cue director for the Chapter 1 Trailer.
// Reuses existing procedural synthesizers across shared/ and chapter1/, plus
// lightweight procedural radio crackle (Act 1) and tension riser (Act 4).
// ============================================================================

import {
  fadeOutMenuAmbience,
  setMenuAmbienceVolume,
  startMenuAmbience,
} from '../shared/menuAmbience';
import {
  playCrashImpactThud,
  playFootstepSound,
  playHeartbeatPulse,
  setMasterVolume,
} from '../shared/AudioEngine';
import { playFlashlightClick } from '../shared/SurfaceFootstepsAudio';
import {
  playLurkerBanishScreech,
  stopLurkerWhispers,
  updateLurkerWhisperProximity,
} from '../shared/LurkerAudio';
import {
  playJumpscareScream,
  playWindowSlamSting,
  prewarmJumpscareAudio,
  setJumpscareVolume,
} from '../shared/JumpscareAudio';
import {
  playTireScreech,
  setChaseAudioVolume,
  startEscapeChaseTheme,
  stopEscapeChaseTheme,
} from '../chapter1/ChaseThemeAudio';
import {
  setForestAmbienceVolume,
  startForestNightAmbience,
  stopForestNightAmbience,
} from '../chapter1/ForestAmbienceAudio';

function createLocalFxContext(volume) {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();
  const gain = ctx.createGain();
  gain.gain.value = volume;
  gain.connect(ctx.destination);
  return { ctx, gain };
}

export function createTrailerAudioDirector(initialVolume = 0.78) {
  let vol = Math.max(0, Math.min(1, initialVolume));
  let fx = null;
  let staticNodes = [];
  let riserNodes = [];
  let fired = new Set();
  let nextWalkStep = 8.4;
  let nextSprintStep = 26.15;
  let nextHeartbeat = 21.1;
  let nextClimaxTick = 34.0;
  let active = false;

  const syncVolumes = (v) => {
    vol = Math.max(0, Math.min(1, v));
    setMasterVolume(vol);
    setMenuAmbienceVolume(vol);
    setJumpscareVolume(vol);
    setChaseAudioVolume(vol);
    setForestAmbienceVolume(vol * 0.65);
    if (fx) fx.gain.gain.setTargetAtTime(vol, fx.ctx.currentTime, 0.05);
  };

  const ensureFx = () => {
    if (!fx) fx = createLocalFxContext(vol);
    if (fx && fx.ctx.state === 'suspended') fx.ctx.resume().catch(() => {});
    return fx;
  };

  const stopNodes = (list) => {
    list.forEach((n) => {
      try {
        n.stop?.();
        n.disconnect?.();
      } catch {
        // Ignore already-stopped nodes
      }
    });
    list.length = 0;
  };

  // Subtle FM radio static crackle layered over the Title Screen vocal hum (0:00-0:08)
  const startRadioCrackle = () => {
    stopNodes(staticNodes);
    const local = ensureFx();
    if (!local) return;
    const { ctx, gain } = local;
    const len = Math.floor(ctx.sampleRate * 3.0);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) {
      const hiss = (Math.random() * 2 - 1) * 0.07;
      const pop = Math.random() > 0.9985 ? (Math.random() * 2 - 1) * 0.82 : 0;
      data[i] = hiss + pop;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1750;
    bp.Q.value = 1.1;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.2);

    src.connect(bp);
    bp.connect(g);
    g.connect(gain);
    src.start();
    staticNodes.push(src, bp, g);
  };

  const fadeOutRadioCrackle = (sec = 0.6) => {
    if (!fx || staticNodes.length < 3) return;
    const g = staticNodes[2];
    const now = fx.ctx.currentTime;
    try {
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(Math.max(0.001, g.gain.value), now);
      g.gain.exponentialRampToValueAtTime(0.0005, now + sec);
    } catch {
      // Ignore fade error
    }
    setTimeout(() => stopNodes(staticNodes), Math.ceil(sec * 1000) + 40);
  };

  // Escalating dissonant tension riser across the Act 4 staccato montage (34.0s-40.85s)
  const startClimaxRiser = () => {
    stopNodes(riserNodes);
    const local = ensureFx();
    if (!local) return;
    const { ctx, gain } = local;
    const now = ctx.currentTime;
    const dur = 6.85;

    [110, 155.56, 233.08].forEach((base, idx) => {
      const osc = ctx.createOscillator();
      const lp = ctx.createBiquadFilter();
      const g = ctx.createGain();
      osc.type = idx === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(base, now);
      osc.frequency.exponentialRampToValueAtTime(base * 2.65, now + dur);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(340, now);
      lp.frequency.exponentialRampToValueAtTime(2400, now + dur);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(idx === 0 ? 0.16 : 0.09, now + dur - 0.15);
      g.gain.exponentialRampToValueAtTime(0.0005, now + dur);
      osc.connect(lp);
      lp.connect(g);
      g.connect(gain);
      osc.start(now);
      osc.stop(now + dur + 0.05);
      riserNodes.push(osc, lp, g);
    });
  };

  const once = (key, fn) => {
    if (fired.has(key)) return;
    fired.add(key);
    fn();
  };

  const start = () => {
    stop();
    active = true;
    fired = new Set();
    nextWalkStep = 8.4;
    nextSprintStep = 26.15;
    nextHeartbeat = 21.1;
    nextClimaxTick = 34.0;
    syncVolumes(vol);
    prewarmJumpscareAudio();
    startMenuAmbience();
    startForestNightAmbience();
    startRadioCrackle();
  };

  const unlock = () => {
    if (!active) return;
    ensureFx();
    prewarmJumpscareAudio();
    if (!fired.has('END_HUM')) startMenuAmbience();
  };

  const update = (t) => {
    if (!active) return;

    // Act 1 -> Act 2: fade radio static crackle as we step into the forest
    if (t >= 7.8) once('STOP_STATIC', () => fadeOutRadioCrackle(0.8));

    // Act 2 (8.0s - 20.0s): steady dirt footsteps + rising multi-voice whispers under the hum
    if (t >= 8.0 && t < 19.8) {
      const whisperProx = t < 9.5 ? 0.12 : Math.min(0.92, 0.14 + ((t - 9.5) / 10.2) * 0.78);
      updateLurkerWhisperProximity(whisperProx);
      if (t >= nextWalkStep && (t < 12.2 || t >= 16.2)) {
        playFootstepSound(false);
        nextWalkStep = t + 0.68;
      }
      if (t >= 12.2 && nextWalkStep < 16.2) nextWalkStep = 16.4;
    }

    // Subtle mechanical click on quick cut into flyers
    if (t >= 12.2) once('FLYER_CUT_1', () => playFlashlightClick(true));

    // Act 3A (20.0s - 26.0s): Whip-around flashlight click + wraith banish screech + accelerating heartbeat
    if (t >= 19.85) {
      once('END_HUM', () => {
        fadeOutMenuAmbience(0.28);
        stopLurkerWhispers();
      });
    }
    if (t >= 20.08) once('WHIP_CLICK', () => playFlashlightClick(true));
    if (t >= 20.42) once('BANISH_SCREECH', () => playLurkerBanishScreech());
    if (t >= 21.0 && t < 29.4 && t >= nextHeartbeat) {
      const prog = Math.min(1, (t - 21.0) / 8.0);
      playHeartbeatPulse(0.42 + prog * 0.58);
      nextHeartbeat = t + (0.72 - prog * 0.4);
    }

    // Act 3B (26.0s - 29.5s): Frantic sprinting footsteps through the woods
    if (t >= 26.0 && t < 29.45 && t >= nextSprintStep) {
      playFootstepSound(true);
      nextSprintStep = t + 0.27;
    }
    if (t >= 27.6) once('START_CHASE_THEME', () => startEscapeChaseTheme());

    // Act 3C (29.5s - 34.0s): Night Car Chase tire screech & near-miss slam
    if (t >= 31.15) once('CHASE_SCREECH', () => playTireScreech());
    if (t >= 32.08) once('CHASE_SLAM', () => playWindowSlamSting());

    // Act 4 (34.0s - 41.0s): Staccato montage clicks, tension riser, sub hits
    if (t >= 34.0) once('CLIMAX_RISER', () => startClimaxRiser());
    if (t >= 34.0 && t < 40.8 && t >= nextClimaxTick) {
      playFlashlightClick(Math.floor(t * 5) % 2 === 0);
      nextClimaxTick = t + 0.36;
    }
    if (t >= 36.7) once('CLIMAX_THUD_1', () => playCrashImpactThud());
    if (t >= 38.65) once('CLIMAX_SCREECH', () => playLurkerBanishScreech());
    if (t >= 40.88) {
      once('PRE_DROP_SILENCE', () => {
        stopEscapeChaseTheme();
        stopForestNightAmbience();
        stopNodes(riserNodes);
      });
    }

    // Smash Cut (41.0s): Full 3-layer Web Audio banshee scream + sub-bass drop + static burst
    if (t >= 41.0) once('JUMPSCARE_SCREAM', () => playJumpscareScream());

    // Act 5 (42.0s): Pure silence for title card outro
    if (t >= 42.05) {
      once('OUTRO_SILENCE', () => {
        stopLurkerWhispers();
        stopEscapeChaseTheme();
        stopForestNightAmbience();
      });
    }
  };

  const stop = () => {
    active = false;
    stopNodes(staticNodes);
    stopNodes(riserNodes);
    fadeOutMenuAmbience(0.2);
    stopLurkerWhispers();
    stopEscapeChaseTheme();
    stopForestNightAmbience();
  };

  return { start, update, stop, unlock, setVolume: syncVolumes };
}
