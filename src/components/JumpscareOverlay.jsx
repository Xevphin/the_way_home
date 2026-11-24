// ============================================================================
// src/components/JumpscareOverlay.jsx
// Screen-space horror overlays for being caught by the Evil Spirit:
// - phase 'JUMPSCARE': chromatic RGB-split bands, static noise, scanlines,
//   and harsh crimson/white flash frames (1.4s, layered over the 3D lunge)
// - phase 'DEATH': full-screen "CONSUMED BY THE DARK" cinematic death screen
//   with pulsing crimson vignette, drifting ash, static, a context-aware
//   whisper, and Respawn / Return to Main Menu buttons.
// ============================================================================

import React, { useMemo } from 'react';
import { requestCanvasPointerLock } from '../data/pointerLookGuard';

export default function JumpscareOverlay({
  phase,
  whisper,
  sanctuaryName,
  onRespawn,
  onReturnToMenu,
}) {
  // Drifting ash flakes for the death screen
  const ash = useMemo(
    () =>
      Array.from({ length: 34 }).map((_, i) => ({
        id: i,
        left: `${(i * 37 + 5) % 100}%`,
        size: 2 + (i % 4),
        delay: `${(i % 9) * 0.7}s`,
        duration: `${7 + (i % 6) * 1.6}s`,
      })),
    []
  );

  if (!phase) return null;

  if (phase === 'JUMPSCARE') {
    return (
      <div className="jumpscare-layer" aria-hidden="true">
        <div className="js-rgb-split red" />
        <div className="js-rgb-split cyan" />
        <div className="js-static" />
        <div className="js-scanlines" />
        <div className="js-vignette" />
      </div>
    );
  }

  const handleTryAgain = () => {
    requestCanvasPointerLock();
    onRespawn?.();
  };

  return (
    <div className="death-screen" role="alertdialog" aria-label="You were taken by the valley">
      <div className="death-ash-field" aria-hidden="true">
        {ash.map((a) => (
          <span
            key={a.id}
            className="death-ash"
            style={{
              left: a.left,
              width: `${a.size}px`,
              height: `${a.size}px`,
              animationDelay: a.delay,
              animationDuration: a.duration,
            }}
          />
        ))}
      </div>
      <div className="death-static" aria-hidden="true" />
      <div className="death-vignette" aria-hidden="true" />

      <div className="death-content">
        <div className="death-eyebrow">THE SHADOW CAUGHT YOU</div>
        <h1 className="death-title">YOU WERE TAKEN BY THE VALLEY</h1>
        <div className="death-divider" />
        <p className="death-whisper">&ldquo;{whisper}&rdquo;</p>
        <div className="death-sanctuary">
          Latest checkpoint: <strong>{sanctuaryName}</strong>
        </div>

        <div className="death-actions">
          <button type="button" className="death-btn primary" onClick={handleTryAgain}>
            Try Again
          </button>
          <button type="button" className="death-btn" onClick={onReturnToMenu}>
            Return to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
