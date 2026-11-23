// ============================================================================
// src/pages/Chapter1Page.jsx
// Chapter 1 — Morning Routine & The Invitation:
// - Uses clean borderless ObjectiveHud ("Chapter 1:")
// - Large centered slow-fading control & interaction prompts
// - Line-of-sight (< 2.8m & dot > 0.85) interaction checks
// - Complete exterior neighborhood & driveway car transition into Sprint 2
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { MORNING_CHORES, getChapter1Task } from '../data/chapter1Data';
import { getSubtitleDurationMs } from '../data/dialogueTiming';
import useCutsceneSkip from '../hooks/useCutsceneSkip';
import HomeInterior from '../components/HomeInterior';
import MorningCutscene from '../components/MorningCutscene';
import HomePlayerController from '../components/HomePlayerController';
import DoorFriendCutscene from '../components/DoorFriendCutscene';
import OpeningCreditsOverlay from '../components/OpeningCreditsOverlay';
import ChapterTitleCard from '../components/ChapterTitleCard';
import ObjectiveHud from '../components/ObjectiveHud';
import TutorialPrompts from '../components/TutorialPrompts';
import SafeZoneBanner from '../components/SafeZoneBanner';
import {
  playChoreChime,
  playDoorKnock,
  playDoorLatch,
  setMorningVolume,
} from '../components/MorningAudio';
import {
  startMorningMusic,
  startMorningOutdoorAmbience,
  stopMorningMusic,
  stopMorningOutdoorAmbience,
} from '../components/AmbientMusicAudio';

function releasePointer() {
  if (document.pointerLockElement && document.exitPointerLock) {
    document.exitPointerLock();
  }
}

export default function Chapter1Page({
  settings,
  paused = false,
  onReturnToMenu,
  onStartSprint2,
}) {
  const [phase, setPhase] = useState('WAKE_CUTSCENE'); // 'WAKE_CUTSCENE' | 'EXPLORE' | 'DOOR_CUTSCENE'
  const [wakeState, setWakeState] = useState({
    blinkOpening: true,
    tag: '08:15 AM',
    caption: 'Ugh... that morning sun is already bright.',
  });
  const [completedChores, setCompletedChores] = useState([]);
  const [doorKnocked, setDoorKnocked] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [canExitHouse, setCanExitHouse] = useState(false);
  const [hoverInteractable, setHoverInteractable] = useState(null);
  const [creditsFinished, setCreditsFinished] = useState(false);
  const [subtitle, setSubtitle] = useState(null);
  const [isOutside, setIsOutside] = useState(false);

  const subTimerRef = useRef(null);
  const knockTimerRef = useRef(null);

  useEffect(() => {
    setMorningVolume(settings.volume);
  }, [settings.volume]);

  // Warm slice-of-life indoor music -> switches smoothly to morning birds & breeze outside
  useEffect(() => {
    if (paused) return undefined;
    if (isOutside) {
      stopMorningMusic();
      startMorningOutdoorAmbience();
    } else {
      stopMorningOutdoorAmbience();
      startMorningMusic();
    }
    return () => {
      stopMorningMusic();
      stopMorningOutdoorAmbience();
    };
  }, [paused, isOutside]);

  useEffect(
    () => () => {
      clearTimeout(subTimerRef.current);
      clearTimeout(knockTimerRef.current);
    },
    []
  );

  const showTimedSubtitle = useCallback((tag, text, ms = 0) => {
    const minDur = getSubtitleDurationMs(text, tag);
    setSubtitle({ tag, text });
    clearTimeout(subTimerRef.current);
    subTimerRef.current = setTimeout(() => setSubtitle(null), Math.max(ms, minDur));
  }, []);

  const finishWakeCutscene = useCallback(() => {
    setPhase('EXPLORE');
    setWakeState({ blinkOpening: false, tag: '', caption: '' });
  }, []);

  const handleDoorComplete = useCallback(() => {
    setCanExitHouse(true);
    setDoorOpen(true);
    setPhase('EXPLORE');
    showTimedSubtitle(
      '',
      "Time to head out to the car before I'm late for class.",
      4800
    );
  }, [showTimedSubtitle]);

  // Consistent debounced [SPACE] skip for BOTH morning wake-up AND Amir's front door cutscene
  useCutsceneSkip(
    !paused && (phase === 'WAKE_CUTSCENE' || phase === 'DOOR_CUTSCENE'),
    phase === 'WAKE_CUTSCENE' ? finishWakeCutscene : handleDoorComplete
  );

  const handleInteract = useCallback(() => {
    if (phase !== 'EXPLORE' || !hoverInteractable) return;
    const id = hoverInteractable.id;

    if (id === 'front_door' && doorKnocked && !canExitHouse) {
      // Keep pointer locked smoothly across Amir's porch dialogue
      setHoverInteractable(null);
      setPhase('DOOR_CUTSCENE');
      return;
    }

    if (id === 'driveway_car' && canExitHouse) {
      playDoorLatch(false);
      stopMorningMusic();
      stopMorningOutdoorAmbience();
      onStartSprint2();
      return;
    }

    const chore = MORNING_CHORES.find((c) => c.id === id);
    if (!chore || completedChores.includes(chore.id)) return;

    playChoreChime();
    const nextCompleted = [...completedChores, chore.id];
    setCompletedChores(nextCompleted);
    showTimedSubtitle('', chore.thought, 4600);

    if (nextCompleted.length === MORNING_CHORES.length && !doorKnocked) {
      knockTimerRef.current = setTimeout(() => {
        playDoorKnock();
        setDoorKnocked(true);
        showTimedSubtitle(
          'FRONT DOOR',
          'Knock, knock, knock — someone is at the front door.',
          5200
        );
      }, 1100);
    }
  }, [
    phase,
    hoverInteractable,
    doorKnocked,
    canExitHouse,
    completedChores,
    showTimedSubtitle,
    onStartSprint2,
  ]);

  const handleCreditsFinished = useCallback(() => setCreditsFinished(true), []);

  const handleMenu = useCallback(() => {
    releasePointer();
    onReturnToMenu();
  }, [onReturnToMenu]);

  const activeTask = getChapter1Task({
    completedChores,
    doorKnocked,
    friendDone: canExitHouse,
  });

  return (
    <div className="chapter1-page">
      {!paused && (
        <button type="button" className="top-menu-escape-btn morning" onClick={handleMenu}>
          ← Menu
        </button>
      )}

      <Canvas dpr={[1, 1.5]} shadows camera={{ fov: 62, near: 0.08, far: 140, position: [-5.05, 0.94, 4.15] }}>
        <color attach="background" args={['#9ec9f2']} />
        <fog attach="fog" args={['#cde3f7', 26, 85]} />

        <HomeInterior
          completedChores={completedChores}
          doorOpen={doorOpen}
          doorKnocked={doorKnocked}
          canExitHouse={canExitHouse}
        />

        <MorningCutscene
          active={phase === 'WAKE_CUTSCENE'}
          paused={paused}
          onUpdateState={setWakeState}
          onComplete={finishWakeCutscene}
        />

        <HomePlayerController
          enabled={phase === 'EXPLORE' && !paused}
          sensitivity={settings.sensitivity}
          completedChores={completedChores}
          doorKnocked={doorKnocked}
          canExitHouse={canExitHouse}
          onOutsideChange={setIsOutside}
          onHoverInteractable={setHoverInteractable}
          onInteract={handleInteract}
        />

        <DoorFriendCutscene
          visible={(doorKnocked || phase === 'DOOR_CUTSCENE') && !canExitHouse}
          active={phase === 'DOOR_CUTSCENE'}
          onDoorOpenChange={setDoorOpen}
          onSubtitleChange={setSubtitle}
          onComplete={handleDoorComplete}
        />
      </Canvas>

      {phase === 'WAKE_CUTSCENE' && wakeState.blinkOpening && !paused && (
        <div className="morning-blink-overlay" aria-hidden="true" />
      )}

      <ChapterTitleCard active={!paused} title="CHAPTER 1" />

      {!paused && phase === 'EXPLORE' && (
        <>
          <ObjectiveHud chapterTitle="Chapter 1:" customTaskText={activeTask} />
          <TutorialPrompts
            active={creditsFinished}
            morningMode={true}
            suppress={Boolean(hoverInteractable)}
          />
        </>
      )}

      <OpeningCreditsOverlay
        active={phase === 'EXPLORE' && !canExitHouse && !paused}
        onFinished={handleCreditsFinished}
      />

      <SafeZoneBanner
        hidden={paused}
        hoverInteractable={hoverInteractable}
        subtitle={subtitle}
        isCutscene={phase === 'WAKE_CUTSCENE' || phase === 'DOOR_CUTSCENE'}
        cutsceneTag={phase === 'WAKE_CUTSCENE' ? wakeState.tag : subtitle?.tag}
        cutsceneCaption={phase === 'WAKE_CUTSCENE' ? wakeState.caption : subtitle?.text}
        onSkipCutscene={
          phase === 'WAKE_CUTSCENE' ? finishWakeCutscene : handleDoorComplete
        }
      />
    </div>
  );
}
