// ============================================================================
// src/components/PauseMenuOverlay.jsx
// Minimalist smoked-glass in-game [ESC] Pause & Settings Overlay:
// - Translucent smoked-glass backdrop with warm gold hairline dividers
// - Custom styled Master Volume & Mouse Sensitivity sliders
// - Dedicated Help button launching HelpModal (replaces static controls box)
// - Clean Resume & Return to Main Menu actions
// ============================================================================

import React, { useEffect, useState } from 'react';
import HelpModal from './HelpModal';
import { requestCanvasPointerLock } from '../data/pointerLookGuard';

export const lockGameplayPointer = requestCanvasPointerLock;

export default function PauseMenuOverlay({
  open,
  settings,
  onResume,
  onUpdateSettings,
  onReturnToMenu,
}) {
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (!open) setHelpOpen(false);
  }, [open]);

  if (!open) return null;

  const handleResume = () => {
    lockGameplayPointer();
    onResume();
  };

  return (
    <>
      <div
        className="modal-backdrop pause-backdrop"
        role="dialog"
        aria-label="Game Paused"
        onClick={handleResume}
      >
        <div className="glass-modal pause-glass-modal" onClick={(e) => e.stopPropagation()}>
          <div className="glass-eyebrow">THE WAY HOME</div>
          <h2 className="pause-title">PAUSED</h2>

          <div className="glass-hairline" />

          <div className="pause-sliders">
            <label className="glass-slider-group">
              <div className="glass-slider-row">
                <span>Master Volume</span>
                <span className="glass-slider-val">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                className="glass-slider"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) =>
                  onUpdateSettings({ volume: parseFloat(e.target.value) })
                }
              />
            </label>

            <label className="glass-slider-group">
              <div className="glass-slider-row">
                <span>Mouse Sensitivity</span>
                <span className="glass-slider-val">{settings.sensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                className="glass-slider"
                min="0.3"
                max="2.5"
                step="0.1"
                value={settings.sensitivity}
                onChange={(e) =>
                  onUpdateSettings({ sensitivity: parseFloat(e.target.value) })
                }
              />
            </label>
          </div>

          <div className="glass-hairline" />

          <div className="pause-nav-stack">
            <button type="button" className="glass-btn primary" onClick={handleResume}>
              Resume
            </button>
            <button type="button" className="glass-btn" onClick={() => setHelpOpen(true)}>
              Help &amp; Controls
            </button>
            <button type="button" className="glass-btn subtle" onClick={onReturnToMenu}>
              Return to Main Menu
            </button>
          </div>
        </div>
      </div>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
