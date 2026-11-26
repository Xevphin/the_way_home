// ============================================================================
// src/pages/Chapter2Page.jsx
// Chapter 2 — "Unknown Mystery" Full 5-Stage Orchestrator:
// 1) CUTSCENE_1          — Eyelid wake-up on 200m mist road + Lembah Batu sign
// 2) GAMEPLAY_1          — Walk-only road, auto-finishing credits (<=14s) ->
//                          progressive bloodied bodies & rising whispers
// 3) CUTSCENE_2          — Lurker ultimatum at road door -> porcelain jumpscare
// 4) GAMEPLAY_2          — White-to-black flash into 08:30 bedroom, panting,
//                          buzzing phone & morning chores -> open front door
// 5) CH2_STUDIO_CUTSCENE -> CH2_STUDIO_BREAK -> COMPLETE (Movie Studio Twist!)
// ============================================================================

import React, { useCallback, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Chapter2EndlessRoad3D from '../components/chapter2/Chapter2EndlessRoad3D';
import Chapter2MorningScene from '../components/chapter2/Chapter2MorningScene';
import Chapter2StudioScene from '../components/chapter2/Chapter2StudioScene';
import Chapter2Overlays from '../components/chapter2/Chapter2Overlays';
import useCutsceneSkip from '../hooks/useCutsceneSkip';
import useChapter2StageFlow, { stopAllChapter2Audio } from '../hooks/useChapter2StageFlow';
import { CH2_MORNING_CHORES, CH2_VICTIM_MILESTONES } from '../data/chapter2/chapter2Data';
import { getStudioInteractableById } from '../data/chapter2/studioSetData';
import { getSubtitleDurationMs } from '../data/shared/dialogueTiming';
import { playChoreChime } from '../components/shared/MorningAudio';
import { stopAllSceneAmbience } from '../components/shared/AmbientMusicAudio';
import { stopPhoneBuzzLoop } from '../components/chapter2/Chapter2Audio';
import { playBroDapClasp } from '../components/chapter2/StudioAudio';

function releasePointer() {
  if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
}

export default function Chapter2Page({
  settings,
  paused = false,
  initialStage = 'CUTSCENE_1',
  onOpenPause,
  onReturnToMenu,
}) {
  const [stage, setStage] = useState(initialStage);
  const [creditsDone, setCreditsDone] = useState(false);
  const [spawnedCount, setSpawnedCount] = useState(0);
  const [lurkerVisible, setLurkerVisible] = useState(false);
  const [jumpscareActive, setJumpscareActive] = useState(false);
  const [wakeFlash, setWakeFlash] = useState(false);
  const [completedChores, setCompletedChores] = useState([]);
  const [phoneRinging, setPhoneRinging] = useState(true);
  const [dapTrigger, setDapTrigger] = useState(0);
  const [subtitle, setSubtitle] = useState(null);
  const [hoverInteractable, setHoverInteractable] = useState(null);

  const subTimerRef = useRef(null);
  const spawnedRef = useRef(0);
  const subBusyUntilRef = useRef(0);
  const queuedReactionRef = useRef(null);

  const clearSubQueue = useCallback(() => {
    clearTimeout(subTimerRef.current);
    subBusyUntilRef.current = 0;
    queuedReactionRef.current = null;
  }, []);

  const showTimedSub = useCallback((tag, text, ms = 4800) => {
    const dur = Math.max(ms, getSubtitleDurationMs(text, tag));
    clearTimeout(subTimerRef.current);
    setSubtitle({ tag, text });
    subBusyUntilRef.current = performance.now() + dur;
    subTimerRef.current = setTimeout(() => {
      setSubtitle(null);
      if (queuedReactionRef.current) {
        const nextText = queuedReactionRef.current;
        queuedReactionRef.current = null;
        showTimedSub('INNER THOUGHT', nextText, 4800);
      }
    }, dur);
  }, []);

  const handleCreditsDone = useCallback(() => setCreditsDone(true), []);

  const { clearStageTimers, handleSkipCutscene } = useChapter2StageFlow({
    stage,
    jumpscareActive,
    setStage,
    setCreditsDone,
    setLurkerVisible,
    setJumpscareActive,
    setWakeFlash,
    setHoverInteractable,
    setSubtitle,
    showTimedSub,
    clearSubQueue,
  });

  const handlePlayerProgressZ = useCallback(
    (z) => {
      if (!creditsDone) return;
      if (z <= -150 && !lurkerVisible) setLurkerVisible(true);
      const nextIdx = spawnedRef.current;
      if (nextIdx >= CH2_VICTIM_MILESTONES.length) return;
      const milestone = CH2_VICTIM_MILESTONES[nextIdx];
      if (z <= milestone.triggerZ) {
        spawnedRef.current = nextIdx + 1;
        setSpawnedCount(nextIdx + 1);
        if (performance.now() < subBusyUntilRef.current) queuedReactionRef.current = milestone.reaction;
        else showTimedSub('INNER THOUGHT', milestone.reaction, 4800);
      }
    },
    [creditsDone, lurkerVisible, showTimedSub]
  );

  const handleReachDoor = useCallback(() => setStage('CUTSCENE_2'), []);

  const isCutscene =
    stage === 'CUTSCENE_1' || (stage === 'CUTSCENE_2' && !jumpscareActive) || stage === 'CH2_STUDIO_CUTSCENE';
  useCutsceneSkip(isCutscene && !paused, handleSkipCutscene);

  const handleMorningInteract = useCallback(() => {
    if (!hoverInteractable || paused) return;
    if (hoverInteractable.id === 'ch2_front_door') {
      stopPhoneBuzzLoop();
      stopAllSceneAmbience();
      setHoverInteractable(null);
      setStage('CH2_STUDIO_CUTSCENE');
      return;
    }
    const chore = CH2_MORNING_CHORES.find((c) => c.id === hoverInteractable.id);
    if (!chore || completedChores.includes(chore.id)) return;
    playChoreChime();
    if (chore.id === 'ch2_phone') { stopPhoneBuzzLoop(); setPhoneRinging(false); }
    setCompletedChores((prev) => [...prev, chore.id]);
    setHoverInteractable(null);
    showTimedSub('INNER THOUGHT', chore.toast, 5200);
  }, [hoverInteractable, paused, completedChores, showTimedSub]);

  const handleStudioInteract = useCallback(() => {
    if (!hoverInteractable || paused) return;
    if (hoverInteractable.id === 'studio_exit_door') {
      stopAllChapter2Audio();
      releasePointer();
      setHoverInteractable(null);
      setStage('COMPLETE');
      return;
    }
    const target = getStudioInteractableById(hoverInteractable.id);
    if (!target) return;
    if (target.id === 'studio_uncle') { playBroDapClasp(); setDapTrigger((c) => c + 1); }
    showTimedSub(target.tag, target.line, 5200);
  }, [hoverInteractable, paused, showTimedSub]);

  const handleMenu = useCallback(() => {
    clearStageTimers();
    stopAllChapter2Audio();
    releasePointer();
    onReturnToMenu?.();
  }, [clearStageTimers, onReturnToMenu]);

  const inEndlessRoad = stage === 'CUTSCENE_1' || stage === 'GAMEPLAY_1' || stage === 'CUTSCENE_2';
  const inStudio = stage === 'CH2_STUDIO_CUTSCENE' || stage === 'CH2_STUDIO_BREAK';

  return (
    <div className={`game-page ${jumpscareActive ? 'is-jumpscare' : ''}`}>
      {!paused && !jumpscareActive && stage !== 'COMPLETE' && (
        <button type="button" className="top-menu-escape-btn" onClick={onOpenPause || handleMenu}>
          ← Menu
        </button>
      )}

      {stage !== 'COMPLETE' && (
        <Canvas dpr={[1, 1.5]} shadows camera={{ fov: 64, near: 0.08, far: 180 }}>
          {inEndlessRoad ? (
            <Chapter2EndlessRoad3D
              stage={stage}
              paused={paused}
              sensitivity={settings?.sensitivity ?? 1.0}
              spawnedCount={spawnedCount}
              lurkerVisible={lurkerVisible}
              jumpscareActive={jumpscareActive}
              onPlayerProgressZ={handlePlayerProgressZ}
              onDoorPromptChange={setHoverInteractable}
              onReachDoor={handleReachDoor}
            />
          ) : inStudio ? (
            <Chapter2StudioScene
              stage={stage}
              paused={paused}
              sensitivity={settings?.sensitivity ?? 1.0}
              dapTrigger={dapTrigger}
              onHoverInteractable={setHoverInteractable}
              onInteract={handleStudioInteract}
            />
          ) : (
            <Chapter2MorningScene
              enabled={!paused}
              sensitivity={settings?.sensitivity ?? 1.0}
              completedIds={completedChores}
              phoneRinging={phoneRinging}
              onHoverInteractable={setHoverInteractable}
              onInteract={handleMorningInteract}
            />
          )}
        </Canvas>
      )}

      <Chapter2Overlays
        stage={stage}
        paused={paused}
        isCutscene={isCutscene}
        creditsDone={creditsDone}
        jumpscareActive={jumpscareActive}
        wakeFlash={wakeFlash}
        completedChores={completedChores}
        hoverInteractable={hoverInteractable}
        subtitle={subtitle}
        onCreditsDone={handleCreditsDone}
        onSkipCutscene={handleSkipCutscene}
        onReturnToMenu={handleMenu}
      />
    </div>
  );
}
