// ============================================================================
// src/components/EndCreditsSequence.jsx
// Movie-Style Vertical Rolling End Credits + Post-Credits Stinger:
// - Marks Chapter 1 completed in localStorage (unlocking Main Menu Scene Select)
// - Plays slow, melancholic procedural piano theme during the vertical crawl
// - Fades out into distant night crickets for PostCreditsTeaser3D, revealing
//   bold "It Will Return" title + clean Return to Main Menu button!
// ============================================================================

import React, { useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import PostCreditsTeaser3D from './PostCreditsTeaser3D';
import useCutsceneSkip from '../hooks/useCutsceneSkip';
import { MOVIE_END_CREDITS } from '../data/finaleScriptData';
import { markChapter1Completed } from '../data/gameState';
import {
  startForestNightAmbience,
  stopForestNightAmbience,
} from './ForestAmbienceAudio';
import {
  startEndCreditsPiano,
  stopEndCreditsPiano,
} from './FinaleEndingAudio';

const CREDITS_ROLL_MS = 22500;

export default function EndCreditsSequence({ onReturnToMenu }) {
  const [stage, setStage] = useState('CREDITS'); // 'CREDITS' | 'TEASER'
  const [showReturnTitle, setShowReturnTitle] = useState(false);

  useEffect(() => {
    markChapter1Completed();
    if (document.pointerLockElement && document.exitPointerLock) {
      document.exitPointerLock();
    }
  }, []);

  useEffect(() => {
    if (stage === 'CREDITS') {
      startEndCreditsPiano();
      const timer = setTimeout(() => setStage('TEASER'), CREDITS_ROLL_MS);
      return () => {
        clearTimeout(timer);
        stopEndCreditsPiano();
      };
    }
    stopEndCreditsPiano();
    startForestNightAmbience();
    return () => stopForestNightAmbience();
  }, [stage]);

  const handleSkipCredits = useCallback(() => {
    stopEndCreditsPiano();
    setStage('TEASER');
  }, []);

  useCutsceneSkip(stage === 'CREDITS', handleSkipCredits);

  const handleRevealTitle = useCallback(() => {
    setShowReturnTitle(true);
  }, []);

  const handleMenu = useCallback(() => {
    stopEndCreditsPiano();
    stopForestNightAmbience();
    onReturnToMenu?.();
  }, [onReturnToMenu]);

  if (stage === 'CREDITS') {
    return (
      <div className="credits-cinema-screen" role="region" aria-label="Chapter 1 End Credits">
        <div className="credits-crawl-track">
          <div className="credits-hero-eyebrow">END OF CHAPTER 1</div>
          <h1 className="credits-hero-title">THE WAY HOME</h1>
          <div className="credits-hero-divider" />

          {MOVIE_END_CREDITS.map((block) => (
            <div key={block.role} className="credits-block">
              <div className="credits-role">{block.role}</div>
              {block.names.map((name) => (
                <div key={name} className="credits-name">
                  {name}
                </div>
              ))}
            </div>
          ))}

          <div className="credits-footer-note">
            &ldquo;Follow the light before the dark finds you.&rdquo;
          </div>
        </div>

        <button
          type="button"
          className="skip-cutscene-minimal"
          onClick={handleSkipCredits}
        >
          Skip Credits [SPACE]
        </button>
      </div>
    );
  }

  return (
    <div className="game-page">
      <Canvas dpr={[1, 1.5]} shadows camera={{ fov: 56, near: 0.1, far: 160 }}>
        <PostCreditsTeaser3D onTitleReveal={handleRevealTitle} />
      </Canvas>

      <div className={`post-credits-overlay ${showReturnTitle ? 'visible' : ''}`}>
        <div className="post-credits-eyebrow">THE WAY HOME</div>
        <h1 className="post-credits-title">It Will Return</h1>
        <button type="button" className="menu-btn primary post-credits-btn" onClick={handleMenu}>
          Return to Main Menu
        </button>
      </div>
    </div>
  );
}
