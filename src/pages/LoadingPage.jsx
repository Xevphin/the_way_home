// ============================================================================
// src/pages/LoadingPage.jsx
// Seamless dark misty canvas with subtle floating dust particles, staggered
// fade-in typography for Surah Fatir (35:6) in authentic Amiri Arabic serif,
// and a thin golden progress line along the bottom.
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { QURAN_VERSE_DATA } from '../data/chapter1/objectivesData';

export default function LoadingPage({ onFinishedLoading, verse = QURAN_VERSE_DATA }) {
  const [progressPct, setProgressPct] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  // Subtle floating dust motes drifting across the seamless dark misty canvas
  const dustParticles = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        left: `${(i * 19 + 7) % 96}%`,
        top: `${(i * 29 + 11) % 92}%`,
        size: 2 + (i % 3),
        delay: `${(i % 7) * 0.6}s`,
        duration: `${6 + (i % 5) * 1.8}s`,
      })),
    []
  );

  useEffect(() => {
    const startTime = performance.now();
    const durationMs = 4400;

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgressPct(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setFadingOut(true);
        setTimeout(() => onFinishedLoading(), 700);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [onFinishedLoading]);

  return (
    <div className={`loading-page ${fadingOut ? 'fade-out' : ''}`}>
      {/* Floating Dust Motes Layer */}
      <div className="dust-field" aria-hidden="true">
        {dustParticles.map((p) => (
          <span
            key={p.id}
            className="dust-mote"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Seamless Borderless Verse Typography with Staggered Fade-In */}
      <div className="loading-verse-seamless">
        <p className="verse-arabic-text stagger-1" dir="rtl" lang="ar">
          {verse.arabic}
        </p>

        <blockquote className="verse-translation-text stagger-2">
          <em>{verse.translation}</em>
        </blockquote>

        <div className="verse-citation-text stagger-3">
          {verse.citation}
        </div>
      </div>

      {/* Thin Golden Progress Line at the Bottom */}
      <div className="bottom-golden-loader">
        <div className="loading-status-caption">
          <span>THE WAY HOME</span>
          <span>{progressPct}%</span>
        </div>
        <div className="golden-line-track">
          <div
            className="golden-line-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
