// ============================================================================
// src/components/SafeZoneBanner.jsx
// Borderless cinematic UI overlays:
// - Softly glowing golden Safe Zone sanctuary typography
// - Large centered slow-fading interaction prompt ('Press "E"' / 'To ...')
// - Film-style borderless bottom-center subtitles
// ============================================================================

import React, { useEffect, useState } from 'react';
import TypewriterSubtitle from './TypewriterSubtitle';

export default function SafeZoneBanner({
  activeSafeZone,
  hoverInteractable,
  subtitle = null,
  threatLevel = 0,
  isCutscene = false,
  cutsceneTag = '',
  cutsceneCaption = '',
  onSkipCutscene,
  hidden = false,
}) {
  const [safeSoftened, setSafeSoftened] = useState(false);
  // Keep last prompt rendered while fading out smoothly so it never snaps off
  const [displayedPrompt, setDisplayedPrompt] = useState(null);
  const [promptVisible, setPromptVisible] = useState(false);

  useEffect(() => {
    if (!activeSafeZone) {
      setSafeSoftened(false);
      return undefined;
    }
    setSafeSoftened(false);
    const timer = setTimeout(() => setSafeSoftened(true), 3500);
    return () => clearTimeout(timer);
  }, [activeSafeZone]);

  useEffect(() => {
    if (hoverInteractable && !isCutscene) {
      setDisplayedPrompt(hoverInteractable);
      setPromptVisible(true);
      return undefined;
    }
    setPromptVisible(false);
    const t = setTimeout(() => setDisplayedPrompt(null), 550);
    return () => clearTimeout(t);
  }, [hoverInteractable, isCutscene]);

  if (hidden) return null;

  const activeLine = isCutscene
    ? cutsceneCaption
      ? { tag: cutsceneTag, text: cutsceneCaption }
      : null
    : subtitle;

  return (
    <>
      {threatLevel > 0.05 && !activeSafeZone && (
        <div
          className="stalker-distortion-vignette"
          style={{ opacity: Math.min(0.92, threatLevel * 0.95) }}
        />
      )}

      {activeSafeZone && !isCutscene && (
        <div
          className={`safe-zone-glow ${safeSoftened ? 'softened' : ''}`}
          role="status"
        >
          <div className="safe-zone-title-row">
            <span className="safe-zone-lantern" aria-hidden="true">
              ✦
            </span>
            <span className="safe-zone-label">SAFE ZONE</span>
            <span className="safe-zone-sep">•</span>
            <span className="safe-zone-place">{activeSafeZone.name}</span>
          </div>
          <div className="safe-zone-whisper">
            The lurking evil cannot cross this threshold.
          </div>
        </div>
      )}

      {!isCutscene && <div className="center-reticle-dot" />}

      {/* Large Centered Two-Line Interaction Prompt (Matches UI Concept) */}
      {displayedPrompt && !isCutscene && (
        <div
          className={`center-control-prompt ${!promptVisible ? 'fading-out' : ''}`}
          role="status"
        >
          <div className="center-prompt-headline">
            {displayedPrompt.keyLabel || 'Press "E"'}
          </div>
          <div className="center-prompt-subtext">
            {displayedPrompt.actionLabel || displayedPrompt.prompt || 'To Interact'}
          </div>
        </div>
      )}

      {/* Borderless Film Subtitles With Undertale-Style Voice Blips */}
      {activeLine && (
        <TypewriterSubtitle
          tag={activeLine.tag}
          text={activeLine.text}
          inCutscene={isCutscene}
        />
      )}

      {isCutscene && (
        <button
          type="button"
          className="skip-cutscene-minimal"
          onClick={onSkipCutscene}
        >
          Skip [SPACE]
        </button>
      )}
    </>
  );
}
