// ============================================================================
// src/components/ChapterTitleCard.jsx
// Cinematic centered "CHAPTER 1" title card that fades in cleanly at top: 34%
// (well above lower-center tutorial & interaction prompts), holds for ~3.5s,
// and fades out smoothly over the sunlit morning bedroom.
// ============================================================================

import React, { useEffect, useState } from 'react';

export default function ChapterTitleCard({
  active = false,
  title = 'CHAPTER 1',
  subtitle = 'First Encounter',
  durationMs = 4600,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return undefined;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(timer);
  }, [active, durationMs]);

  if (!visible) return null;

  return (
    <div className="chapter-title-card-overlay" aria-live="polite">
      <div className="chapter-title-card-text">{title}</div>
      <div className="chapter-title-card-rule" aria-hidden="true" />
      {subtitle && (
        <div
          className="chapter-title-card-sub"
          style={{
            marginTop: '0.65rem',
            fontSize: '0.95rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(255, 245, 228, 0.88)',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.75)',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
