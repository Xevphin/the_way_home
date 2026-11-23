// ============================================================================
// src/hooks/useGameHotkeys.js
// Screen-level hotkey: [SPACE] skips the active driving crash cutscene.
// ============================================================================

import { useEffect } from 'react';

export default function useGameHotkeys({ cutsceneActive, onSkipCutscene }) {
  useEffect(() => {
    if (!cutsceneActive) return undefined;
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onSkipCutscene();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cutsceneActive, onSkipCutscene]);
}
