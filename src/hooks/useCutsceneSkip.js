// ============================================================================
// src/hooks/useCutsceneSkip.js
// Safe, debounced [SPACE] cutscene skipper shared across all chapter pages:
// - Ignores key repeat (e.repeat) and applies a 420ms mount/trigger cooldown
//   so one [SPACE] press cleanly advances ONLY the current cutscene beat and
//   never leaks into or skips the next cutscene!
// ============================================================================

import { useEffect, useRef } from 'react';

export default function useCutsceneSkip(active, onSkip) {
  const readyAtRef = useRef(0);

  useEffect(() => {
    if (!active) return undefined;
    // Brief mount grace window prevents a previous cutscene's Space press from leaking in
    readyAtRef.current = performance.now() + 420;

    const onKeyDown = (e) => {
      if (e.code !== 'Space' || e.repeat) return;
      e.preventDefault();
      const now = performance.now();
      if (now < readyAtRef.current) return;
      readyAtRef.current = now + 450;
      onSkip();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, onSkip]);
}
