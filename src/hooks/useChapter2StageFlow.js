// ============================================================================
// src/hooks/useChapter2StageFlow.js
// Dedicated stage-timeline & audio lifecycle hook for Chapter 2:
// - Drives Cutscene 1, Gameplay 1 (14s credits safety cap), Cutscene 2
//   (Lurker ultimatum -> porcelain jumpscare), Gameplay 2 (bedroom panting &
//   buzzing phone), CH2_STUDIO_CUTSCENE ("CUT!!"), and CH2_STUDIO_BREAK BGM
// ============================================================================

import { useCallback, useEffect, useRef } from 'react';
import { CH2_CUTSCENE1_LINES, CH2_ULTIMATUM_SCRIPT } from '../data/chapter2/chapter2Data';
import { STUDIO_CUTSCENE_SCRIPT } from '../data/chapter2/studioSetData';
import { playJumpscareScream, prewarmJumpscareAudio } from '../components/shared/JumpscareAudio';
import { stopLurkerWhispers } from '../components/shared/LurkerAudio';
import { startMorningMusic, stopAllSceneAmbience } from '../components/shared/AmbientMusicAudio';
import {
  playHeavyPantingBurst,
  startEndlessRoadDrone,
  startPhoneBuzzLoop,
  stopEndlessRoadDrone,
  stopPhoneBuzzLoop,
} from '../components/chapter2/Chapter2Audio';
import {
  playClapperboardSnap,
  startStudioAmbience,
  stopStudioAmbience,
} from '../components/chapter2/StudioAudio';

export function stopAllChapter2Audio() {
  stopEndlessRoadDrone();
  stopLurkerWhispers();
  stopPhoneBuzzLoop();
  stopStudioAmbience();
  stopAllSceneAmbience();
}

export default function useChapter2StageFlow({
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
}) {
  const timersRef = useRef([]);

  const clearStageTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    clearSubQueue();
  }, [clearSubQueue]);

  useEffect(() => {
    prewarmJumpscareAudio();
    return () => {
      clearStageTimers();
      stopAllChapter2Audio();
    };
  }, [clearStageTimers]);

  useEffect(() => {
    clearStageTimers();

    if (stage === 'CUTSCENE_1') {
      stopStudioAmbience();
      startEndlessRoadDrone();
      CH2_CUTSCENE1_LINES.forEach((line) => {
        timersRef.current.push(
          setTimeout(() => setSubtitle({ tag: line.tag, text: line.text }), line.atSec * 1000)
        );
      });
      timersRef.current.push(setTimeout(() => { setSubtitle(null); setStage('GAMEPLAY_1'); }, 12400));
      return;
    }

    if (stage === 'GAMEPLAY_1') {
      startEndlessRoadDrone();
      timersRef.current.push(setTimeout(() => setCreditsDone(true), 14500));
      return;
    }

    if (stage === 'CUTSCENE_2') {
      stopLurkerWhispers();
      setHoverInteractable(null);
      setLurkerVisible(true);
      let acc = 350;
      CH2_ULTIMATUM_SCRIPT.forEach((beat) => {
        timersRef.current.push(setTimeout(() => setSubtitle({ tag: beat.tag, text: beat.text }), acc));
        acc += beat.durationMs;
      });
      timersRef.current.push(setTimeout(() => {
        setSubtitle(null);
        stopEndlessRoadDrone();
        setJumpscareActive(true);
        playJumpscareScream();
      }, acc));
      timersRef.current.push(setTimeout(() => {
        setJumpscareActive(false);
        setWakeFlash(true);
        setStage('GAMEPLAY_2');
      }, acc + 1150));
      return;
    }

    if (stage === 'GAMEPLAY_2') {
      stopEndlessRoadDrone();
      stopLurkerWhispers();
      startMorningMusic();
      playHeavyPantingBurst();
      startPhoneBuzzLoop();
      timersRef.current.push(setTimeout(() => setWakeFlash(false), 1300));
      timersRef.current.push(setTimeout(() => {
        showTimedSub('YOU', 'Hah... hah... it was just a nightmare. My phone is buzzing on the nightstand...', 5400);
      }, 1400));
      return;
    }

    if (stage === 'CH2_STUDIO_CUTSCENE') {
      stopAllChapter2Audio();
      setHoverInteractable(null);
      playClapperboardSnap();
      let acc = 300;
      STUDIO_CUTSCENE_SCRIPT.forEach((beat) => {
        timersRef.current.push(setTimeout(() => setSubtitle({ tag: beat.tag, text: beat.text }), acc));
        acc += beat.durationMs;
      });
      timersRef.current.push(setTimeout(() => { setSubtitle(null); setStage('CH2_STUDIO_BREAK'); }, acc + 300));
      return;
    }

    if (stage === 'CH2_STUDIO_BREAK') {
      stopAllSceneAmbience();
      startStudioAmbience();
    }
  }, [
    stage, clearStageTimers, setStage, setCreditsDone, setLurkerVisible,
    setJumpscareActive, setWakeFlash, setHoverInteractable, setSubtitle, showTimedSub,
  ]);

  const handleSkipCutscene = useCallback(() => {
    clearStageTimers();
    setSubtitle(null);
    if (stage === 'CUTSCENE_1') {
      setStage('GAMEPLAY_1');
    } else if (stage === 'CUTSCENE_2' && !jumpscareActive) {
      stopEndlessRoadDrone();
      setJumpscareActive(true);
      playJumpscareScream();
      timersRef.current.push(setTimeout(() => {
        setJumpscareActive(false);
        setWakeFlash(true);
        setStage('GAMEPLAY_2');
      }, 1150));
    } else if (stage === 'CH2_STUDIO_CUTSCENE') {
      setStage('CH2_STUDIO_BREAK');
    }
  }, [stage, jumpscareActive, clearStageTimers, setSubtitle, setStage, setJumpscareActive, setWakeFlash]);

  return { clearStageTimers, handleSkipCutscene };
}
