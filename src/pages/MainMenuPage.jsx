// ============================================================================
// src/pages/MainMenuPage.jsx
// Finalized commercial Main Menu for "The Way Home":
// - Live 3D cover framing the weathered "Welcome to Lembah Batu" signboard
//   shrouded in drifting night fog, warm hanging lantern & pine silhouettes
// - Clean borderless navigation: Continue (when save exists), Play Story,
//   Settings, Help, and Credits (zero spoiler tags or debug scene selectors!)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import MainMenuCoverScene from '../components/MainMenuCoverScene';
import HelpModal from '../components/HelpModal';
import { MOVIE_END_CREDITS } from '../data/finaleScriptData';
import {
  fadeOutMenuAmbience,
  setMenuAmbienceVolume,
  startMenuAmbience,
} from '../components/menuAmbience';

export default function MainMenuPage({
  settings,
  savedStageLabel = null,
  onContinueStory,
  onStartPlay,
  onUpdateSettings,
}) {
  const [activeModal, setActiveModal] = useState(null); // 'SETTINGS' | 'HELP' | 'CREDITS' | null

  useEffect(() => {
    setMenuAmbienceVolume(settings.volume);
  }, [settings.volume]);

  // Start eerie procedural ambience on first pointer/key gesture (browser autoplay compliant)
  useEffect(() => {
    const unlock = () => startMenuAmbience();
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      fadeOutMenuAmbience(0.8);
    };
  }, []);

  const handleContinue = () => {
    fadeOutMenuAmbience(0.8);
    onContinueStory();
  };

  const handleStartPlay = () => {
    fadeOutMenuAmbience(0.8);
    onStartPlay();
  };

  return (
    <div className="main-menu-page">
      {/* Full-Screen Live 3D "Welcome to Lembah Batu" Cover Scene */}
      <div className="menu-canvas-container">
        <Canvas dpr={[1, 1.5]} shadows camera={{ fov: 46, position: [2.65, 1.92, -5.3] }}>
          <MainMenuCoverScene />
        </Canvas>
      </div>

      {/* Borderless Floating Left Title & Clean Navigation */}
      <div className="menu-floating-overlay">
        <div className="menu-floating-stack">
          <h1 className="menu-title">THE WAY HOME</h1>

          <nav className="menu-nav-links" aria-label="Main Menu">
            {savedStageLabel && (
              <button
                type="button"
                className="menu-link-btn primary"
                onClick={handleContinue}
              >
                Continue
              </button>
            )}
            <button
              type="button"
              className={`menu-link-btn ${savedStageLabel ? '' : 'primary'}`}
              onClick={handleStartPlay}
            >
              New Game
            </button>
            <button
              type="button"
              className="menu-link-btn"
              onClick={() => setActiveModal('SETTINGS')}
            >
              Settings
            </button>
            <button
              type="button"
              className="menu-link-btn"
              onClick={() => setActiveModal('HELP')}
            >
              Help
            </button>
            <button
              type="button"
              className="menu-link-btn"
              onClick={() => setActiveModal('CREDITS')}
            >
              Credits
            </button>
          </nav>
        </div>
      </div>

      {/* Smoked-Glass Modal: SETTINGS */}
      {activeModal === 'SETTINGS' && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-label="Settings"
        >
          <div className="glass-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div>
                <div className="glass-eyebrow">AUDIO &amp; CAMERA</div>
                <h2 className="subpanel-title">Settings</h2>
              </div>
              <button
                type="button"
                className="modal-x-btn"
                onClick={() => setActiveModal(null)}
                aria-label="Close Settings"
              >
                ✕
              </button>
            </div>

            <div className="glass-hairline" />

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
        </div>
      )}

      {/* Smoked-Glass Modal: OFFICIAL CREDITS */}
      {activeModal === 'CREDITS' && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-label="Credits"
        >
          <div className="glass-modal credits-glass-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div>
                <div className="glass-eyebrow">THE WAY HOME • CHAPTER 1</div>
                <h2 className="subpanel-title">Credits</h2>
              </div>
              <button
                type="button"
                className="modal-x-btn"
                onClick={() => setActiveModal(null)}
                aria-label="Close Credits"
              >
                ✕
              </button>
            </div>

            <div className="glass-hairline" />

            <div className="credits-modal-list">
              {MOVIE_END_CREDITS.map((entry) => (
                <div key={entry.role} className="credits-modal-row">
                  <span className="credits-modal-role">{entry.role}</span>
                  <span className="credits-modal-name">{entry.names.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <HelpModal open={activeModal === 'HELP'} onClose={() => setActiveModal(null)} />
    </div>
  );
}
