// ============================================================================
// src/pages/Sprint3Page.jsx
// Seamless Evening Highway -> 3-Route Signboard -> Cafe Arrival sequence:
// - Zero Sprint checkpoint pauses: flows directly from Cafe Arrival into the
//   Cafe Hangout & Night Detour (Sprint4Page) via a smooth fade-to-black.
// - Retains [SPACE] skip for fast testing during cinematic sequences.
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import EveningHighwayScene from '../components/EveningHighwayScene';
import CafeArrivalScene from '../components/CafeArrivalScene';
import TypewriterSubtitle from '../components/TypewriterSubtitle';
import useCutsceneSkip from '../hooks/useCutsceneSkip';

export default function Sprint3Page({
  onReturnToMenu,
  onStartSprint4,
}) {
  const [stage, setStage] = useState('HIGHWAY_DRIVE'); // 'HIGHWAY_DRIVE' | 'CAFE_ARRIVAL'
  const [subtitle, setSubtitle] = useState(null);
  const [cafeTransition, setCafeTransition] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const swapTimerRef = useRef(null);
  const revealTimerRef = useRef(null);
  const endTimerRef = useRef(null);

  useEffect(
    () => () => {
      clearTimeout(swapTimerRef.current);
      clearTimeout(revealTimerRef.current);
      clearTimeout(endTimerRef.current);
    },
    []
  );

  const advanceStage = useCallback(() => {
    if (cafeTransition || fadingOut) return;
    setSubtitle(null);
    if (stage === 'HIGHWAY_DRIVE') {
      // Smooth fade-to-black curtain with timestamp card before fading into Kafe Tasik Permai
      setCafeTransition(true);
      swapTimerRef.current = setTimeout(() => {
        setStage('CAFE_ARRIVAL');
      }, 850);
      revealTimerRef.current = setTimeout(() => {
        setCafeTransition(false);
      }, 1550);
      return;
    }
    setFadingOut(true);
    endTimerRef.current = setTimeout(() => onStartSprint4(), 650);
  }, [stage, cafeTransition, fadingOut, onStartSprint4]);

  // Safe debounced [SPACE] skip (advances one beat cleanly without skipping Sprint 4)
  useCutsceneSkip(!cafeTransition && !fadingOut, advanceStage);

  const isHighway = stage === 'HIGHWAY_DRIVE';

  return (
    <div className="chapter1-page">
      <button
        type="button"
        className="top-menu-escape-btn morning"
        onClick={onReturnToMenu}
      >
        ← Menu
      </button>

      <Canvas dpr={[1, 1.5]} shadows camera={{ fov: 60, near: 0.08, far: 240, position: [-4, 1.2, 24] }}>
        <color attach="background" args={[isHighway ? '#15142b' : '#111022']} />
        <fog attach="fog" args={[isHighway ? '#2a1f3d' : '#1e1930', 38, 155]} />
        {isHighway ? (
          <EveningHighwayScene
            active={!cafeTransition}
            onSubtitleChange={setSubtitle}
            onComplete={advanceStage}
          />
        ) : (
          <CafeArrivalScene
            active={!cafeTransition && !fadingOut}
            holdParked={fadingOut}
            onSubtitleChange={setSubtitle}
            onComplete={advanceStage}
          />
        )}
      </Canvas>

      {/* Borderless Film Subtitles With Undertale-Style Voice Blips */}
      {subtitle && !cafeTransition && !fadingOut && (
        <TypewriterSubtitle tag={subtitle.tag} text={subtitle.text} inCutscene={true} />
      )}

      {/* Skip Cutscene Button */}
      {!cafeTransition && !fadingOut && (
        <button
          type="button"
          className="skip-cutscene-minimal morning"
          onClick={advanceStage}
        >
          Skip [SPACE]
        </button>
      )}

      {/* Smooth Fade-In / Fade-Out Curtain Between Evening Highway & Cafe */}
      <div
        className="smooth-fade-curtain"
        style={{ opacity: cafeTransition ? 1 : 0 }}
        aria-hidden="true"
      >
        {cafeTransition && (
          <div className="fade-transition-caption">
            07:20 PM — Kafe Tasik Permai
          </div>
        )}
      </div>

      {/* Smooth Fade-to-Black Bridge Into Cafe Hangout */}
      {fadingOut && <div className="fade-black-overlay" aria-hidden="true" />}
    </div>
  );
}
