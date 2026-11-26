// ============================================================================
// src/data/trailer/trailerTimeline.js
// Deterministic 50-second shot schedule and camera/lighting state evaluator
// for "The Way Home: Chapter 1" automated in-engine cinematic trailer.
// ============================================================================

export const TRAILER_DURATION = 50.0;

export const TRAILER_SHOTS = [
  { id: 'HOOK', start: 0.0, end: 8.0 },
  { id: 'FOREST_GLIDE', start: 8.0, end: 12.2 },
  { id: 'FLYER_MISSING', start: 12.2, end: 14.2 },
  { id: 'FLYER_SKETCH', start: 14.2, end: 16.2 },
  { id: 'DISTANT_LURKER', start: 16.2, end: 20.0 },
  { id: 'LURKER_WHIP', start: 20.0, end: 26.0 },
  { id: 'SPRINT_WOODS', start: 26.0, end: 29.5 },
  { id: 'CAR_CHASE', start: 29.5, end: 34.0 },
  { id: 'CLIMAX_CUTS', start: 34.0, end: 41.0 },
  { id: 'JUMPSCARE', start: 41.0, end: 42.0 },
  { id: 'BLACK_SILENCE', start: 42.0, end: 43.5 },
  { id: 'TITLE_OUTRO', start: 43.5, end: 50.0 },
];

// Rapid ~0.3s-0.4s staccato montage cuts during Act 4 (34.0s - 41.0s)
// Motifs: 'FLICKER_WOODS' | 'JAW_LUNGE' | 'RED_HEADLIGHTS'
export const CLIMAX_MONTAGE_CUTS = [
  { start: 34.0, end: 34.42, kind: 'FLICKER_WOODS', intensity: 0.45 },
  { start: 34.42, end: 34.82, kind: 'JAW_LUNGE', intensity: 0.4 },
  { start: 34.82, end: 35.22, kind: 'RED_HEADLIGHTS', intensity: 0.55 },
  { start: 35.22, end: 35.6, kind: 'FLICKER_WOODS', intensity: 0.6 },
  { start: 35.6, end: 35.98, kind: 'JAW_LUNGE', intensity: 0.58 },
  { start: 35.98, end: 36.34, kind: 'RED_HEADLIGHTS', intensity: 0.72 },
  { start: 36.34, end: 36.7, kind: 'FLICKER_WOODS', intensity: 0.75 },
  { start: 36.7, end: 37.04, kind: 'JAW_LUNGE', intensity: 0.72 },
  { start: 37.04, end: 37.38, kind: 'RED_HEADLIGHTS', intensity: 0.85 },
  { start: 37.38, end: 37.7, kind: 'FLICKER_WOODS', intensity: 0.85 },
  { start: 37.7, end: 38.02, kind: 'JAW_LUNGE', intensity: 0.86 },
  { start: 38.02, end: 38.34, kind: 'RED_HEADLIGHTS', intensity: 0.92 },
  { start: 38.34, end: 38.64, kind: 'FLICKER_WOODS', intensity: 0.95 },
  { start: 38.64, end: 38.94, kind: 'JAW_LUNGE', intensity: 0.94 },
  { start: 38.94, end: 39.24, kind: 'RED_HEADLIGHTS', intensity: 1.0 },
  { start: 39.24, end: 39.54, kind: 'FLICKER_WOODS', intensity: 1.0 },
  { start: 39.54, end: 39.84, kind: 'JAW_LUNGE', intensity: 1.0 },
  { start: 39.84, end: 40.14, kind: 'RED_HEADLIGHTS', intensity: 1.0 },
  { start: 40.14, end: 40.42, kind: 'FLICKER_WOODS', intensity: 1.0 },
  { start: 40.42, end: 40.72, kind: 'JAW_LUNGE', intensity: 1.0 },
  { start: 40.72, end: 40.9, kind: 'RED_HEADLIGHTS', intensity: 1.0 },
  { start: 40.9, end: 41.0, kind: 'BLACK_BEAT', intensity: 1.0 },
];

export function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

export function smoothstep(t) {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

export function getActiveShot(time) {
  const t = Math.max(0, time);
  for (let i = 0; i < TRAILER_SHOTS.length; i += 1) {
    const s = TRAILER_SHOTS[i];
    if (t >= s.start && t < s.end) {
      return {
        ...s,
        localTime: t - s.start,
        progress: clamp01((t - s.start) / (s.end - s.start)),
      };
    }
  }
  const last = TRAILER_SHOTS[TRAILER_SHOTS.length - 1];
  return { ...last, localTime: Math.max(0, t - last.start), progress: 1 };
}

export function getClimaxCut(time) {
  for (let i = 0; i < CLIMAX_MONTAGE_CUTS.length; i += 1) {
    const c = CLIMAX_MONTAGE_CUTS[i];
    if (time >= c.start && time < c.end) {
      const local = time - c.start;
      const dur = c.end - c.start;
      return {
        ...c,
        index: i,
        localTime: local,
        progress: clamp01(local / dur),
        // Crisp 40ms black shutter blink right on every hard cut edge
        shutterFlash: local < 0.045,
      };
    }
  }
  return null;
}

export function evaluateOverlayState(time) {
  const t = Math.max(0, time);
  const shot = getActiveShot(t);

  // Fade-in from pitch black at 0:00-1.8s, brief cut-to-black beat at 40.9s, full black >= 42.0s
  let blackCurtain = 0;
  if (t < 1.8) {
    blackCurtain = 1 - smoothstep(t / 1.8);
  } else if (t >= 7.75 && t < 8.15) {
    blackCurtain = t < 8.0 ? smoothstep((t - 7.75) / 0.25) : 1 - smoothstep((t - 8.0) / 0.15);
  } else if (t >= 19.82 && t < 20.06) {
    blackCurtain = t < 19.98 ? 0.92 : 0.45;
  } else if (t >= 40.9 && t < 41.0) {
    blackCurtain = 1;
  } else if (t >= 42.0) {
    blackCurtain = 1;
  }

  // Act 1 hook tagline ("SOME ROADS DON'T LEAD BACK."): 1.5s -> 6.8s
  let hookOpacity = 0;
  if (t >= 1.5 && t <= 6.8) {
    if (t < 2.6) hookOpacity = smoothstep((t - 1.5) / 1.1);
    else if (t > 5.6) hookOpacity = 1 - smoothstep((t - 5.6) / 1.2);
    else hookOpacity = 1;
  }

  // Act 3C Night Car Chase HUD flash: 30.1s -> 33.4s
  const showChaseHud = t >= 30.1 && t <= 33.45;
  const chaseFrac = clamp01((t - 29.5) / 4.5);
  const chaseMeters = Math.round(288 - chaseFrac * 96);
  const chaseProgress = Math.round(28 + chaseFrac * 32);
  const chaseHealth = t > 32.1 ? 2 : 3;
  const chaseHitFlash = t >= 32.05 && t <= 32.35;

  // Act 4 red fog flash / staccato shutter / jumpscare
  const climaxCut = shot.id === 'CLIMAX_CUTS' ? getClimaxCut(t) : null;
  const redGlareOverlay =
    climaxCut && climaxCut.kind === 'RED_HEADLIGHTS' ? 0.22 + climaxCut.intensity * 0.28 : 0;
  const shutterBlack = Boolean(climaxCut?.shutterFlash);
  const isJumpscare = shot.id === 'JUMPSCARE';

  // Act 5 Title Card & Credits fade-in: 43.5s -> 50.0s+
  const titleOpacity = t >= 43.5 ? smoothstep((t - 43.5) / 1.4) : 0;
  const creditsOpacity = t >= 44.9 ? smoothstep((t - 44.9) / 1.1) : 0;
  const ctaOpacity = t >= 46.4 ? smoothstep((t - 46.4) / 1.0) : 0;
  const finished = t >= TRAILER_DURATION;

  return {
    time: t,
    shotId: shot.id,
    blackCurtain: shutterBlack ? Math.max(blackCurtain, 0.85) : blackCurtain,
    hookOpacity,
    showChaseHud,
    chaseMeters,
    chaseProgress,
    chaseHealth,
    chaseHitFlash,
    redGlareOverlay,
    isJumpscare,
    titleOpacity,
    creditsOpacity,
    ctaOpacity,
    finished,
  };
}
