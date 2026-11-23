// ============================================================================
// src/components/TypewriterSubtitle.jsx
// Borderless cinematic film subtitle renderer with Undertale-style character
// typewriter reveal & speaker-tuned Web Audio voice blips.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { playVoiceBlip } from './DialogueVoiceAudio';
import { setForestDialogueDuck } from './ForestAmbienceAudio';
import { setAmbientDialogueDuck } from './AmbientMusicAudio';
import { setRadioDialogueDuck } from './RadioAudio';
import { getSubtitleStepMs } from '../data/dialogueTiming';

function applyDialogueDucking(active) {
  setForestDialogueDuck(active);
  setAmbientDialogueDuck(active);
  setRadioDialogueDuck(active);
}

export default function TypewriterSubtitle({
  tag = '',
  text = '',
  inCutscene = false,
}) {
  const [visibleCount, setVisibleCount] = useState(0);

  // Smoothly duck wind, rain, crickets & ambient beds by ~30% while any line is active
  useEffect(() => {
    if (!text) {
      applyDialogueDucking(false);
      return undefined;
    }
    applyDialogueDucking(true);
    return () => applyDialogueDucking(false);
  }, [text]);

  useEffect(() => {
    if (!text) {
      setVisibleCount(0);
      return undefined;
    }
    setVisibleCount(1);
    let idx = 1;
    const stepMs = getSubtitleStepMs(tag);

    const timer = setInterval(() => {
      idx += 1;
      if (idx > text.length) {
        clearInterval(timer);
        return;
      }
      setVisibleCount(idx);
      const ch = text[idx - 1];
      if (ch && ch !== ' ' && ch !== '.' && idx % 2 === 0) {
        playVoiceBlip(tag);
      }
    }, stepMs);

    return () => clearInterval(timer);
  }, [text, tag]);

  if (!text) return null;

  return (
    <div
      key={text}
      className={`film-subtitle-wrap ${inCutscene ? 'in-cutscene' : ''}`}
      aria-live="polite"
    >
      {tag && <div className="film-subtitle-tag">{tag}</div>}
      <div className="film-subtitle-text">{text.slice(0, visibleCount)}</div>
    </div>
  );
}
