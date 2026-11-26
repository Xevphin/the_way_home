// ============================================================================
// src/hooks/useMidnightScares.js
// Dedicated controller for brief, NON-LETHAL psychological forest scares:
// - Flashlight flicker, Forestry Office window shadow dart, Ranger Watchtower
//   doorway silhouette dart, behind-you whisper chill, and sudden window bang
//   (terrifying atmosphere without causing game-over deaths during exploration!)
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { playJumpscareScream } from '../components/JumpscareAudio';
import { playDoorSlamScare, playWhisperScare } from '../components/ForestAmbienceAudio';

const DEATH_WHISPERS = [
  'Never stray from the lantern light after midnight...',
  'Shine your beam directly into its eyes before it reaches you...',
  'The valley keeps those who linger in the dark...',
];

export default function useMidnightScares({ showSubtitle }) {
  const [flashlightFlicker, setFlashlightFlicker] = useState(false);
  const [windowScareActive, setWindowScareActive] = useState(false);
  const [watchtowerScareActive, setWatchtowerScareActive] = useState(false);
  const [deathPhase, setDeathPhase] = useState(null); // null | 'JUMPSCARE' | 'DEATH'
  const [deathWhisper, setDeathWhisper] = useState(DEATH_WHISPERS[0]);
  const catchPosRef = useRef(new THREE.Vector3(-11.5, 0, -28.0));
  const timersRef = useRef([]);

  useEffect(() => () => timersRef.current.forEach((t) => clearTimeout(t)), []);

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const triggerFlicker = useCallback(
    (ms = 1400) => {
      setFlashlightFlicker(true);
      schedule(() => setFlashlightFlicker(false), ms);
    },
    [schedule]
  );

  // Brief non-lethal window bang + shadow dart after reading Forestry Memo
  const triggerOfficeWindowScare = useCallback(() => {
    schedule(() => {
      playDoorSlamScare();
      setWindowScareActive(true);
      triggerFlicker(1600);
      showSubtitle(
        {
          tag: 'INNER THOUGHT',
          text: 'Did something just slam the window outside?! ...Stay near the Surau and Wakaf light!',
        },
        5400
      );
      schedule(() => setWindowScareActive(false), 1850);
    }, 550);
  }, [schedule, triggerFlicker, showSubtitle]);

  // Brief non-lethal doorway shadow dart at the Old Ranger Watchtower
  const triggerWatchtowerDart = useCallback(() => {
    playDoorSlamScare();
    setWatchtowerScareActive(true);
    triggerFlicker(1350);
    showSubtitle(
      {
        tag: 'INNER THOUGHT',
        text: 'Someone just darted past the watchtower doorway! ...Who is out here?!',
      },
      4800
    );
    schedule(() => setWatchtowerScareActive(false), 1650);
  }, [schedule, triggerFlicker, showSubtitle]);

  // Brief non-lethal icy whisper right behind the player on key/tool pickups
  const triggerBehindWhisper = useCallback(
    (thoughtText) => {
      playWhisperScare();
      triggerFlicker(1250);
      if (thoughtText) {
        showSubtitle({ tag: 'INNER THOUGHT', text: thoughtText }, 4800);
      }
    },
    [triggerFlicker, showSubtitle]
  );

  // Full 1.1s violent 3D jumpscare lunge -> transitions to Death / Try Again screen
  const triggerLurkerCatch = useCallback(
    (catchPos) => {
      if (deathPhase) return;
      if (catchPos) catchPosRef.current.copy(catchPos);
      playJumpscareScream();
      setDeathWhisper(DEATH_WHISPERS[Math.floor(Math.random() * DEATH_WHISPERS.length)]);
      setDeathPhase('JUMPSCARE');
      schedule(() => {
        if (document.pointerLockElement && document.exitPointerLock) {
          document.exitPointerLock();
        }
        setDeathPhase('DEATH');
      }, 1000);
    },
    [deathPhase, schedule]
  );

  const clearDeathPhase = useCallback(() => {
    setDeathPhase(null);
  }, []);

  return {
    flashlightFlicker,
    windowScareActive,
    watchtowerScareActive,
    deathPhase,
    deathWhisper,
    catchPosRef,
    triggerFlicker,
    triggerOfficeWindowScare,
    triggerWatchtowerDart,
    triggerBehindWhisper,
    triggerLurkerCatch,
    clearDeathPhase,
  };
}
