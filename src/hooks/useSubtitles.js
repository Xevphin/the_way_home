// ============================================================================
// src/hooks/useSubtitles.js
// Manages borderless film subtitles (auto-dismiss timer) and triggers the
// first-time Surau sighting inner monologue when walking near the sanctuary.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { MONOLOGUE } from '../data/chapter1/monologueData';
import { getSubtitleDurationMs } from '../data/shared/dialogueTiming';

export default function useSubtitles({ gameplayActive, playerPosRef }) {
  const [subtitle, setSubtitle] = useState(null);
  const timerRef = useRef(null);
  const spottedSurauRef = useRef(false);

  const showSubtitle = useCallback((line, duration = 0) => {
    const entry = typeof line === 'string' ? { tag: '', text: line } : line;
    const minDur = getSubtitleDurationMs(entry.text, entry.tag);
    setSubtitle(entry);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSubtitle(null), Math.max(duration, minDur));
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (!gameplayActive || spottedSurauRef.current) return undefined;
    const id = setInterval(() => {
      const pz = playerPosRef.current.z;
      if (pz <= -24 && pz >= -58 && !spottedSurauRef.current) {
        spottedSurauRef.current = true;
        showSubtitle(MONOLOGUE.spotSurau, 6000);
      }
    }, 400);
    return () => clearInterval(id);
  }, [gameplayActive, playerPosRef, showSubtitle]);

  return { subtitle, showSubtitle };
}
