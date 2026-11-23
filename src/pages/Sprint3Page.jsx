// ============================================================================
// src/pages/Sprint3Page.jsx
// Seamless Evening Highway -> 3-Route Signboard -> Cafe Arrival sequence:
// - Zero Sprint checkpoint pauses: flows directly from Cafe Arrival into the
//   Cafe Hangout & Night Detour (Sprint4Page) via a smooth fade-to-black.
// - Retains [SPACE] skip for fast testing during cinematic sequences.
// ============================================================================

import React, { useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import EveningHighwayScene from '../components/EveningHighwayScene';
import CafeArrivalScene from '../components/CafeArrivalScene';
import ObjectiveHud from '../components/ObjectiveHud';
import TypewriterSubtitle from '../components/TypewriterSubtitle';
import useCutsceneSkip from '../hooks/useCutsceneSkip';

export default function Sprint3Page({
  onReturnToMenu,
  onStartSprint4,
}) {
  const [stage, setStage] = useState('HIGHWAY_DRIVE'); // 'HIGHWAY_DRIVE' | 'CAFE_ARRIVAL'
  const [subtitle, setSubtitle] = useState(null);
  const [fadingOut, setFadingOut] = useState(false);

  const advanceStage = useCallback(() => {
    setSubtitle(null);
    if (stage === 'HIGHWAY_DRIVE') {
      setStage('CAFE_ARRIVAL');
      return;
    }
    if (!fadingOut) {
      setFadingOut(true);
      setTimeout(() => onStartSprint4(), 650);
    }
  }, [stage, fadingOut, onStartSprint4]);

  // Safe debounced [SPACE] skip (advances one beat cleanly without skipping Sprint 4)
  useCutsceneSkip(!fadingOut, advanceStage);

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
            active={true}
            onSubtitleChange={setSubtitle}
            onComplete={advanceStage}
          />
        ) : (
          <CafeArrivalScene
            active={!fadingOut}
            holdParked={fadingOut}
            onSubtitleChange={setSubtitle}
            onComplete={advanceStage}
          />
        )}
      </Canvas>

      {/* Clean Borderless Top-Left Objective UI */}
      <ObjectiveHud
        chapterTitle="Chapter 1:"
        customTaskText={
          isHighway
            ? 'Follow the lit E18 highway toward Taman Permai'
            : 'Park outside Kafe Tasik Permai and join Amir'
        }
      />

      {/* Borderless Film Subtitles With Undertale-Style Voice Blips */}
      {subtitle && !fadingOut && (
        <TypewriterSubtitle tag={subtitle.tag} text={subtitle.text} inCutscene={true} />
      )}

      {/* Skip Cutscene Button */}
      {!fadingOut && (
        <button
          type="button"
          className="skip-cutscene-minimal morning"
          onClick={advanceStage}
        >
          Skip [SPACE]
        </button>
      )}

      {/* Smooth Fade-to-Black Bridge Into Cafe Hangout */}
      {fadingOut && <div className="fade-black-overlay" aria-hidden="true" />}
    </div>
  );
}
