// ============================================================================
// src/hooks/useMidnightScares.js
// Dedicated controller for brief, NON-LETHAL psychological forest scares:
// - Flashlight flicker, Forestry Office window shadow dart, Ranger Watchtower
//   doorway silhouette dart, behind-you whisper chill, and sudden window bang
//   (terrifying atmosphere without causing game-over deaths during exploration!)
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { playDoorSlamScare, playWhisperScare } from '../components/ForestAmbienceAudio';

export default function useMidnightScares({ showSubtitle }) {
  const [flashlightFlicker, setFlashlightFlicker] = useState(false);
  const [windowScareActive, setWindowScareActive] = useState(false);
  const [watchtowerScareActive, setWatchtowerScareActive] = useState(false);
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

  return {
    flashlightFlicker,
    windowScareActive,
    watchtowerScareActive,
    triggerFlicker,
    triggerOfficeWindowScare,
    triggerWatchtowerDart,
    triggerBehindWhisper,
  };
}
