// ============================================================================
// src/pages/EpiloguePage.jsx
// Chapter 1 Climax & Extended Finale Orchestrator:
// 1. USTAZ_DOME      — Uncle slams golden-white dome + asphalt shockwave + flash
// 2. ARRIVAL_247     — Parked home at 02:47 AM with glowing phone lock-screen
// 3. NEXT_MORNING    — 3s tired eye-blink wake-up (08:30 AM), 3 chores, knock,
//                      and Hafiz front-door cutscene (fixed zero cutoff!)
// 4. SOFA_REVELATION -> END_CREDITS -> POST-CREDITS TEASER (Chapter1FinaleEnding)
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import UstazLightDomeCutscene from '../components/UstazLightDomeCutscene';
import NightArrival247Scene from '../components/NightArrival247Scene';
import NextMorningEpilogue from '../components/NextMorningEpilogue';
import Chapter1FinaleEnding from '../components/Chapter1FinaleEnding';
import PhoneTimeOverlay from '../components/PhoneTimeOverlay';
import TypewriterSubtitle from '../components/TypewriterSubtitle';
import PickupToast from '../components/PickupToast';
import useCutsceneSkip from '../hooks/useCutsceneSkip';
import { EPILOGUE_CHORES, getEpilogueTask } from '../data/epilogueData';
import { playChoreChime, playDoorKnock } from '../components/MorningAudio';
import {
  startMorningMusic,
  stopAllSceneAmbience,
} from '../components/AmbientMusicAudio';

function releasePointer() {
  if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
}

export default function EpiloguePage({
  settings,
  paused = false,
  initialStage = 'USTAZ_DOME',
  onOpenPause,
  onReturnToMenu,
}) {
  const [stage, setStage] = useState(initialStage);
  const [fadeOpacity, setFadeOpacity] = useState(0);
  const [ustazFlash, setUstazFlash] = useState(false);
  const [wakeBlink, setWakeBlink] = useState(false);
  const [subtitle, setSubtitle] = useState(null);
  const [completedChores, setCompletedChores] = useState([]);
  const [doorKnocked, setDoorKnocked] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [hafizActive, setHafizActive] = useState(false);
  const [hoverInteractable, setHoverInteractable] = useState(null);
  const [pickupToast, setPickupToast] = useState(null);
  const subTimerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const flashTimerRef = useRef(null);
  const wakeTimerRef = useRef(null);

  useEffect(() => {
    if (stage === 'NEXT_MORNING') {
      startMorningMusic();
      setFadeOpacity(0);
      setWakeBlink(true);
      wakeTimerRef.current = setTimeout(() => setWakeBlink(false), 3150);
      setSubtitle({
        tag: '08:30 AM • NEXT MORNING',
        text: "Barely slept four hours... My head is pounding. Let me wash my face and tidy up before anyone comes over.",
      });
      subTimerRef.current = setTimeout(() => setSubtitle(null), 6200);
    } else if (stage === 'SOFA_REVELATION' || stage === 'END_CREDITS') {
      stopAllSceneAmbience();
      clearTimeout(subTimerRef.current);
      setFadeOpacity(0);
    }
    return () => {
      clearTimeout(subTimerRef.current);
      clearTimeout(toastTimerRef.current);
      clearTimeout(flashTimerRef.current);
      clearTimeout(wakeTimerRef.current);
    };
  }, [stage]);

  useEffect(() => () => stopAllSceneAmbience(), []);

  const showTimedSub = useCallback((tag, text, ms = 5200) => {
    clearTimeout(subTimerRef.current);
    setSubtitle({ tag, text });
    subTimerRef.current = setTimeout(() => setSubtitle(null), ms);
  }, []);

  const handleUstazImpactFlash = useCallback(() => {
    setUstazFlash(true);
    clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setUstazFlash(false), 280);
  }, []);

  const advanceToArrival = useCallback(() => {
    clearTimeout(subTimerRef.current);
    setSubtitle(null);
    setFadeOpacity(0);
    setStage('ARRIVAL_247');
  }, []);

  const advanceToMorning = useCallback(() => {
    clearTimeout(subTimerRef.current);
    setSubtitle(null);
    setFadeOpacity(0);
    setStage('NEXT_MORNING');
  }, []);

  const advanceToSofaRevelation = useCallback(() => {
    clearTimeout(subTimerRef.current);
    setSubtitle(null);
    // Smooth 0.8s fade-to-black after Hafiz greets you at the door -> Sofa Revelation!
    setFadeOpacity(1);
    setTimeout(() => {
      setHafizActive(false);
      setFadeOpacity(0);
      setStage('SOFA_REVELATION');
    }, 820);
  }, []);

  const handleSkipCurrent = useCallback(() => {
    if (stage === 'USTAZ_DOME') advanceToArrival();
    else if (stage === 'ARRIVAL_247') advanceToMorning();
    else if (stage === 'NEXT_MORNING' && hafizActive) advanceToSofaRevelation();
  }, [stage, hafizActive, advanceToArrival, advanceToMorning, advanceToSofaRevelation]);

  const isCutsceneBeat =
    stage === 'USTAZ_DOME' || stage === 'ARRIVAL_247' || (stage === 'NEXT_MORNING' && hafizActive);

  useCutsceneSkip(isCutsceneBeat && !paused, handleSkipCurrent);

  const handleMorningInteract = useCallback(() => {
    if (!hoverInteractable || hafizActive || paused) return;

    if (hoverInteractable.id === 'ep_front_door') {
      // Clear any pending subtitle timer so Hafiz's dialogue NEVER cuts off mid-sentence!
      clearTimeout(subTimerRef.current);
      setSubtitle(null);
      setHoverInteractable(null);
      setHafizActive(true);
      return;
    }

    const chore = EPILOGUE_CHORES.find((c) => c.id === hoverInteractable.id);
    if (!chore || completedChores.includes(chore.id)) return;

    playChoreChime();
    const next = [...completedChores, chore.id];
    setCompletedChores(next);
    setHoverInteractable(null);
    setPickupToast({ id: Date.now(), label: chore.label });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setPickupToast(null), 1250);
    showTimedSub('INNER THOUGHT', chore.toast, 4600);

    if (next.length === EPILOGUE_CHORES.length && !doorKnocked) {
      setTimeout(() => {
        playDoorKnock();
        setDoorKnocked(true);
        showTimedSub('FRONT DOOR', 'Someone is knocking at the front door... probably Hafiz.', 4800);
      }, 1500);
    }
  }, [hoverInteractable, hafizActive, paused, completedChores, doorKnocked, showTimedSub]);

  const handleMenu = useCallback(() => {
    stopAllSceneAmbience();
    releasePointer();
    onReturnToMenu?.();
  }, [onReturnToMenu]);

  // Extended Finale: Sofa Revelation -> Jinn Flashback -> Rolling Credits -> Post-Credits Teaser
  if (stage === 'SOFA_REVELATION' || stage === 'END_CREDITS') {
    return (
      <Chapter1FinaleEnding
        initialStage={stage}
        paused={paused}
        onOpenPause={onOpenPause}
        onReturnToMenu={handleMenu}
      />
    );
  }

  return (
    <div className="game-page">
      {!paused && (
        <button type="button" className="top-menu-escape-btn" onClick={onOpenPause || handleMenu}>
          ← Menu
        </button>
      )}

      <Canvas dpr={[1, 1.5]} shadows camera={{ fov: 62, near: 0.1, far: 160 }}>
        {stage === 'USTAZ_DOME' && (
          <UstazLightDomeCutscene
            paused={paused}
            onSubtitle={setSubtitle}
            onFadeChange={setFadeOpacity}
            onImpactFlash={handleUstazImpactFlash}
            onComplete={advanceToArrival}
          />
        )}
        {stage === 'ARRIVAL_247' && (
          <NightArrival247Scene
            onSubtitle={setSubtitle}
            onFadeChange={setFadeOpacity}
            onComplete={advanceToMorning}
          />
        )}
        {stage === 'NEXT_MORNING' && (
          <NextMorningEpilogue
            enabled={!hafizActive && !paused}
            sensitivity={settings?.sensitivity ?? 1.0}
            completedChores={completedChores}
            doorKnocked={doorKnocked}
            doorOpen={doorOpen}
            hafizActive={hafizActive}
            onHoverInteractable={setHoverInteractable}
            onInteract={handleMorningInteract}
            onDoorOpenChange={setDoorOpen}
            onSubtitleChange={setSubtitle}
            onHafizComplete={advanceToSofaRevelation}
          />
        )}
      </Canvas>

      {ustazFlash && <div className="ustaz-impact-flash" aria-hidden="true" />}
      {wakeBlink && <div className="wake-blink-overlay" aria-hidden="true" />}
      <div className="smooth-fade-curtain" style={{ opacity: fadeOpacity }} aria-hidden="true" />

      <PhoneTimeOverlay visible={stage === 'ARRIVAL_247'} variant="arrival" />

      {stage === 'NEXT_MORNING' && !hafizActive && !paused && (
        <>
          <div className="minimal-task-hud">
            <div className="minimal-task-chapter">EPILOGUE • 08:30 AM NEXT MORNING</div>
            <div className="minimal-task-text">
              {getEpilogueTask(completedChores, doorKnocked)}
            </div>
          </div>
          <div className="center-reticle-dot" />
          {hoverInteractable && (
            <div className="center-control-prompt" role="status">
              <div className="center-prompt-headline">{hoverInteractable.keyLabel}</div>
              <div className="center-prompt-subtext">{hoverInteractable.actionLabel}</div>
            </div>
          )}
        </>
      )}

      <PickupToast toast={pickupToast} />

      {subtitle && (
        <TypewriterSubtitle tag={subtitle.tag} text={subtitle.text} inCutscene={isCutsceneBeat} />
      )}

      {isCutsceneBeat && !paused && (
        <button type="button" className="skip-cutscene-minimal" onClick={handleSkipCurrent}>
          Skip [SPACE]
        </button>
      )}
    </div>
  );
}
