// ============================================================================
// src/components/OpeningCreditsOverlay.jsx
// Non-blocking movie-style opening credits that smoothly fade in and out in
// the lower-left while the player explores their home doing morning chores.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { OPENING_CREDITS } from '../data/chapter1Data';

export default function OpeningCreditsOverlay({ active, onFinished }) {
  const [activeCard, setActiveCard] = useState(null);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!active) return undefined;

    const timers = [];
    let latestEndMs = 0;

    OPENING_CREDITS.forEach((card) => {
      const showT = setTimeout(() => {
        setFadingOut(false);
        setActiveCard(card);
      }, card.delayMs);

      const fadeT = setTimeout(() => {
        setFadingOut(true);
      }, card.delayMs + card.durationMs - 700);

      const clearT = setTimeout(() => {
        setActiveCard((cur) => (cur && cur.id === card.id ? null : cur));
      }, card.delayMs + card.durationMs);

      latestEndMs = Math.max(latestEndMs, card.delayMs + card.durationMs);
      timers.push(showT, fadeT, clearT);
    });

    if (onFinished) {
      timers.push(setTimeout(() => onFinished(), latestEndMs + 400));
    }

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [active, onFinished]);

  if (!active || !activeCard) return null;

  return (
    <div
      key={activeCard.id}
      className={`movie-credits-float ${fadingOut ? 'fading-out' : ''}`}
      aria-live="polite"
    >
      {activeCard.eyebrow && (
        <div className="credits-card-eyebrow">{activeCard.eyebrow}</div>
      )}
      <div className="credits-card-title">{activeCard.title}</div>
      {activeCard.subtitle && (
        <div className="credits-card-sub">{activeCard.subtitle}</div>
      )}
    </div>
  );
}
