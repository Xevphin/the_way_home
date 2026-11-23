// ============================================================================
// src/components/Chapter1FinaleEnding.jsx
// Clean Finale Ending Orchestrator:
// 1. SOFA_REVELATION — Living room sofa talk with Hafiz -> tight eye close-up
//    -> ethereal Surau Jinn Flashback -> "This... means nothing..." smash-cut!
// 2. END_CREDITS     — Rolling movie end credits -> Post-Credits Route 312
//    stinger -> "THE WAY HOME WILL RETURN" + Return to Main Menu.
// ============================================================================

import React, { useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import SofaRevelationScene from './SofaRevelationScene';
import EndCreditsSequence from './EndCreditsSequence';
import TypewriterSubtitle from './TypewriterSubtitle';
import useCutsceneSkip from '../hooks/useCutsceneSkip';

export default function Chapter1FinaleEnding({
  initialStage = 'SOFA_REVELATION',
  paused = false,
  onOpenPause,
  onReturnToMenu,
}) {
  const [stage, setStage] = useState(initialStage); // 'SOFA_REVELATION' | 'END_CREDITS'
  const [subtitle, setSubtitle] = useState(null);
  const [entryFade, setEntryFade] = useState(initialStage === 'SOFA_REVELATION' ? 1 : 0);

  useEffect(() => {
    if (stage !== 'SOFA_REVELATION') return undefined;
    const t = setTimeout(() => setEntryFade(0), 60);
    return () => clearTimeout(t);
  }, [stage]);

  const handleSmashCutToBlack = useCallback(() => {
    setSubtitle(null);
    setStage('END_CREDITS');
  }, []);

  useCutsceneSkip(stage === 'SOFA_REVELATION' && !paused, handleSmashCutToBlack);

  if (stage === 'END_CREDITS') {
    return <EndCreditsSequence onReturnToMenu={onReturnToMenu} />;
  }

  return (
    <div className="game-page">
      <div className="smooth-fade-curtain" style={{ opacity: entryFade }} aria-hidden="true" />

      {!paused && (
        <button
          type="button"
          className="top-menu-escape-btn"
          onClick={onOpenPause || onReturnToMenu}
        >
          ← Menu
        </button>
      )}

      <Canvas dpr={[1, 1.5]} shadows camera={{ fov: 56, near: 0.06, far: 120 }}>
        <SofaRevelationScene
          paused={paused}
          onSubtitleChange={setSubtitle}
          onSmashCutToBlack={handleSmashCutToBlack}
        />
      </Canvas>

      {subtitle && (
        <TypewriterSubtitle tag={subtitle.tag} text={subtitle.text} inCutscene={true} />
      )}

      <div className="smooth-fade-curtain" style={{ opacity: entryFade }} aria-hidden="true" />

      {!paused && (
        <button
          type="button"
          className="skip-cutscene-minimal"
          onClick={handleSmashCutToBlack}
        >
          Skip [SPACE]
        </button>
      )}
    </div>
  );
}
