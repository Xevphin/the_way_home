// ============================================================================
// src/pages/Sprint4Page.jsx
// Seamless Cafe Hangout -> Late-Night Highway Traffic Jam & Route 312 Detour:
// - Preloads ALL forest GLB models ahead of time for zero-lag crash transition
// - Smooth 0.8s fade-to-black curtain before handing off into GamePage's
//   0.8s fade-from-black FM Radio Forest Crash Cutscene!
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import CafeHangoutScene from '../components/CafeHangoutScene';
import NightTrafficDetour from '../components/NightTrafficDetour';
import PhoneTimeOverlay from '../components/PhoneTimeOverlay';
import TypewriterSubtitle from '../components/TypewriterSubtitle';
import useCutsceneSkip from '../hooks/useCutsceneSkip';
import { preloadAllForestModels } from '../data/modelCatalog';
import { saveActiveCheckpoint } from '../utils/saveStorage';

export default function Sprint4Page({
  onReturnToMenu,
  onStartMidnightChapter,
}) {
  const [stage, setStage] = useState('CAFE_HANGOUT'); // 'CAFE_HANGOUT' | 'NIGHT_DETOUR'
  const [subtitle, setSubtitle] = useState(null);
  const [mood, setMood] = useState({ spooky: false, montage: false, showPhone: false });
  const [fadingOut, setFadingOut] = useState(false);
  const fadeTimerRef = useRef(null);

  useEffect(() => {
    preloadAllForestModels();
    import('./GamePage'); // Preload lazy chunk so Route 312 -> Forest handoff has 0ms gap
    return () => clearTimeout(fadeTimerRef.current);
  }, []);

  const advanceStage = useCallback(() => {
    if (fadingOut) return;
    setSubtitle(null);
    setMood({ spooky: false, montage: false, showPhone: false });
    if (stage === 'CAFE_HANGOUT') {
      saveActiveCheckpoint('NIGHT_TRAFFIC_DETOUR');
      setStage('NIGHT_DETOUR');
    } else {
      // Crisp 0.5s fade-out + 0.2s hold with timestamp caption -> 0.5s fade-in in GamePage
      setFadingOut(true);
      fadeTimerRef.current = setTimeout(() => {
        onStartMidnightChapter();
      }, 700);
    }
  }, [stage, fadingOut, onStartMidnightChapter]);

  useCutsceneSkip(!fadingOut, advanceStage);

  const isHangout = stage === 'CAFE_HANGOUT';

  return (
    <div className="chapter1-page">
      <button
        type="button"
        className="top-menu-escape-btn morning"
        onClick={onReturnToMenu}
      >
        ← Menu
      </button>

      <Canvas dpr={[1, 1.5]} shadows camera={{ fov: 60, near: 0.08, far: 240, position: [-1.5, 1.4, -3.5] }}>
        <color attach="background" args={[isHangout ? '#0b1021' : '#050814']} />
        <fog attach="fog" args={[isHangout ? '#171a2b' : '#0b1326', 35, 150]} />

        {isHangout ? (
          <CafeHangoutScene
            active={true}
            onSubtitleChange={setSubtitle}
            onMoodChange={setMood}
            onComplete={advanceStage}
          />
        ) : (
          <NightTrafficDetour
            active={true}
            onSubtitleChange={setSubtitle}
            onComplete={advanceStage}
          />
        )}
      </Canvas>

      {isHangout && mood.spooky && <div className="spooky-cafe-vignette" aria-hidden="true" />}
      {isHangout && mood.montage && <div className="montage-warm-glow" aria-hidden="true" />}
      <PhoneTimeOverlay visible={isHangout && mood.showPhone} />

      {subtitle && (
        <TypewriterSubtitle tag={subtitle.tag} text={subtitle.text} inCutscene={true} />
      )}

      {!fadingOut && (
        <button
          type="button"
          className="skip-cutscene-minimal morning"
          onClick={advanceStage}
        >
          Skip [SPACE]
        </button>
      )}

      {/* Crisp 1.2s Cross-Fade Curtain Into Midnight Forest Cutscene */}
      <div
        className="smooth-fade-curtain"
        style={{ opacity: fadingOut ? 1 : 0 }}
        aria-hidden="true"
      >
        {fadingOut && (
          <div className="fade-transition-caption">
            11:41 PM — Route 312, Lembah Batu
          </div>
        )}
      </div>
    </div>
  );
}
