// ============================================================================
// src/components/trailer/TrailerOverlays.jsx
// Synchronized cinematic overlays for the 50-second Chapter 1 Trailer:
// - Letterbox bars, vignette & subtle film grain
// - Act 1 minimal serif hook ("SOME ROADS DON'T LEAD BACK.")
// - Act 3C authentic Night Car Chase HUD flash ("CAR HEALTH" / "DISTANCE TO SAFETY")
// - Act 4 red fog glare flare & 1.0s jumpscare screen-space glitch layer
// - Act 5 Title Card, Credits, "PLAY NOW ON ITCH.IO" callout & Replay / Menu actions
// ============================================================================

import React from 'react';
import { MAX_INTEGRITY } from '../../data/chapter1/escapeChaseData';

export default function TrailerOverlays({
  state,
  onReplay,
  onExit,
}) {
  const {
    blackCurtain,
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
  } = state;

  return (
    <>
      {/* Subtle 2.35:1 Cinema Letterbox & Atmospheric Vignette */}
      <div className="trailer-vignette" aria-hidden="true" />
      {!isJumpscare && (
        <>
          <div className="trailer-letterbox top" aria-hidden="true" />
          <div className="trailer-letterbox bottom" aria-hidden="true" />
        </>
      )}

      {/* Act 3C Brief Authentic Chapter 1 Escape Chase HUD Flash */}
      {showChaseHud && (
        <div className="chase-hud-top trailer-chase-hud" role="status" aria-label="Escape Chase HUD Preview">
          <div className="chase-metric-block">
            <span className="chase-hud-label">CAR HEALTH</span>
            <div className="chase-integrity-pips">
              {Array.from({ length: MAX_INTEGRITY }).map((_, i) => (
                <span key={i} className={`chase-pip ${i < chaseHealth ? 'active' : ''}`} />
              ))}
            </div>
          </div>

          <div className="chase-metric-block wide">
            <div className="chase-distance-row">
              <span className="chase-hud-label">DISTANCE TO SAFETY</span>
              <span className="chase-distance-val">{chaseMeters}m</span>
            </div>
            <div className="chase-progress-track">
              <div className="chase-progress-fill" style={{ width: `${chaseProgress}%` }} />
            </div>
          </div>
        </div>
      )}

      {chaseHitFlash && <div className="chase-hit-flash" aria-hidden="true" />}

      {/* Act 4 Blinding Red Headlights Fog Wash */}
      {redGlareOverlay > 0.01 && (
        <div
          className="trailer-red-glare"
          style={{ opacity: redGlareOverlay }}
          aria-hidden="true"
        />
      )}

      {/* Act 4 Instant 1.0s Jumpscare Glitch & Vignette Overlay */}
      {isJumpscare && (
        <div className="jumpscare-layer" aria-hidden="true">
          <div className="js-rgb-split red" />
          <div className="js-rgb-split cyan" />
          <div className="js-static" />
          <div className="js-vignette" />
        </div>
      )}

      {/* Fade / Smash-Cut Pitch-Black Curtain */}
      {blackCurtain > 0.005 && (
        <div
          className="trailer-black-curtain"
          style={{ opacity: blackCurtain }}
          aria-hidden="true"
        />
      )}

      {/* Act 1 Hook Typography: Minimal Centered Serif */}
      {hookOpacity > 0.01 && (
        <div className="trailer-hook-layer" style={{ opacity: hookOpacity }}>
          <p className="trailer-hook-text">SOME ROADS DON&apos;T LEAD BACK.</p>
        </div>
      )}

      {/* Act 5 Title Card & Outro (43.5s - 50.0s+) */}
      {titleOpacity > 0.01 && (
        <div className="trailer-outro-layer">
          <div className="trailer-outro-card">
            <h1 className="trailer-outro-title" style={{ opacity: titleOpacity }}>
              THE WAY HOME
            </h1>
            <div className="trailer-outro-chapter" style={{ opacity: titleOpacity }}>
              CHAPTER 1
            </div>

            <div className="trailer-outro-divider" style={{ opacity: creditsOpacity }} />

            <div className="trailer-outro-credits" style={{ opacity: creditsOpacity }}>
              <p className="trailer-credit-primary">Directed &amp; Written by Xevphin</p>
              <p className="trailer-credit-secondary">
                3D Level Design &amp; Sound: Gemini Neon | Environment Assets: Kenney.nl
              </p>
            </div>

            <div className="trailer-outro-cta" style={{ opacity: ctaOpacity }}>
              PLAY NOW ON ITCH.IO
            </div>

            {finished && (
              <div className="trailer-outro-actions">
                <button type="button" className="trailer-action-btn primary" onClick={onReplay}>
                  Replay Trailer
                </button>
                <button type="button" className="trailer-action-btn" onClick={onExit}>
                  Main Menu
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ultra-subtle corner Exit control (stays unobtrusive for clean recording) */}
      {!finished && (
        <button
          type="button"
          className="trailer-exit-subtle"
          onClick={onExit}
          aria-label="Exit Trailer"
        >
          Exit [ESC]
        </button>
      )}
    </>
  );
}
