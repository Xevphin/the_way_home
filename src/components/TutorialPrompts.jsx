// ============================================================================
// src/components/TutorialPrompts.jsx
// Large, centered lower-middle control prompts:
// - Bold headline: 'Use WASD', 'Press "F"', 'Press "E"' (no map hint)
// - Smoothly fades in, lingers for ~5.5s, and slowly fades out over 1.4s
// ============================================================================

import React, { useEffect, useState } from 'react';

const NIGHT_HINTS = [
  { id: 'move', headline: 'Use WASD', subtext: 'To Move & Hold SHIFT To Sprint' },
  { id: 'light', headline: 'Press "F"', subtext: 'To Use Your Flashlight In The Dark' },
  { id: 'interact', headline: 'Press "E"', subtext: 'To Inspect Landmarks & Clues' },
];

const MORNING_HINTS = [
  { id: 'move_morning', headline: 'Use WASD', subtext: 'To Move Around Your Home' },
  { id: 'look_morning', headline: 'Look & Press "E"', subtext: 'To Interact With Highlighted Tasks' },
];

export default function TutorialPrompts({
  active,
  morningMode = false,
  suppress = false,
}) {
  const hintsList = morningMode ? MORNING_HINTS : NIGHT_HINTS;
  const [stepIdx, setStepIdx] = useState(0);
  const [phase, setPhase] = useState('hidden'); // 'hidden' | 'visible' | 'fading'

  const currentHint = stepIdx < hintsList.length ? hintsList[stepIdx] : null;

  useEffect(() => {
    if (!active || !currentHint || suppress) {
      setPhase('hidden');
      return undefined;
    }

    let lingerTimer;
    let nextTimer;
    const startDelay = setTimeout(() => {
      setPhase('visible');
      lingerTimer = setTimeout(() => {
        setPhase('fading');
        nextTimer = setTimeout(() => {
          setStepIdx((prev) => prev + 1);
        }, 1450);
      }, 5500);
    }, 650);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(lingerTimer);
      clearTimeout(nextTimer);
    };
  }, [active, suppress, stepIdx, currentHint]);

  if (!active || !currentHint || phase === 'hidden' || suppress) return null;

  return (
    <div
      className={`center-control-prompt ${phase === 'fading' ? 'fading-out' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="center-prompt-headline">{currentHint.headline}</div>
      <div className="center-prompt-subtext">{currentHint.subtext}</div>
    </div>
  );
}
