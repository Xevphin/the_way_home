// ============================================================================
// src/data/pointerLookGuard.js
// Shared Chromium pointer-lock spike guard for all first-person controllers:
// - Clamps raw e.movementX / e.movementY spikes to [-90, +90] px so pointer-
//   lock boundary glitches NEVER snap or teleport the camera 180 degrees
// - Ignores the single spurious spike frame right after pointerlockchange
// ============================================================================

export const MAX_MOUSE_DELTA = 90;

export function clampMouseDelta(delta) {
  if (!Number.isFinite(delta)) return 0;
  return Math.max(-MAX_MOUSE_DELTA, Math.min(MAX_MOUSE_DELTA, delta));
}

export function createPointerLockSpikeGuard() {
  let ignoreUntil = 0;
  const onPointerLockChange = () => {
    ignoreUntil = performance.now() + 90;
  };
  const shouldIgnore = () => performance.now() < ignoreUntil;
  return { onPointerLockChange, shouldIgnore };
}

export function requestCanvasPointerLock() {
  try {
    const target = document.querySelector('canvas') || document.querySelector('.app-root');
    if (!target || document.pointerLockElement === target) return;
    const req = target.requestPointerLock?.();
    if (req && typeof req.catch === 'function') req.catch(() => {});
  } catch {
    // Ignore pointer-lock rejection on unsupported browsers
  }
}
