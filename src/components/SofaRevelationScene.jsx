// ============================================================================
// src/components/SofaRevelationScene.jsx
// Extended Chapter 1 Finale Cutscene inside <Canvas>:
// - Both YOU and Hafiz use SeatedCharacter3D (identical clean stylized face,
//   simple dark eyes, full arms, 90-degree bent legs sitting ON TOP of the
//   living room sectional sofa cushions with zero clipping!)
// - Eerie low ambient drone fades in on Hafiz's village revelation
// - Jinn Flashback plays out cleanly -> cuts back to tight eye close-up ->
//   cuts audio to dead silence -> lets "This... means nothing..." finish
//   completely before smashing to black!
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import HomeInterior from './HomeInterior';
import SeatedCharacter3D from './SeatedCharacter3D';
import JinnFlashback3D from './JinnFlashback3D';
import { SOFA_REVELATION_BEATS } from '../data/finaleScriptData';
import { getSubtitleDurationMs, getSubtitleStepMs } from '../data/dialogueTiming';
import { playCrashImpactThud, playSanctuaryChime } from './AudioEngine';
import { playWhisperScare } from './ForestAmbienceAudio';
import { startRevelationDrone, stopRevelationDrone } from './FinaleEndingAudio';

// Seated player coordinates on south sectional sofa (head at y = 1.24, facing +2.78 rad)
const YOU_POS = [2.55, 0, 4.78];
const YOU_ROT = 2.78;
const YOU_HEAD = [2.55, 1.24, 4.78];
const GAZE_X = Math.sin(YOU_ROT);
const GAZE_Z = Math.cos(YOU_ROT);

// Seated Hafiz coordinates on east sectional sofa facing toward YOU
const HAFIZ_POS = [5.15, 0, 2.65];
const HAFIZ_ROT = -1.85;

export default function SofaRevelationScene({
  paused = false,
  onSubtitleChange,
  onSmashCutToBlack,
}) {
  const { camera } = useThree();
  const [beatIndex, setBeatIndex] = useState(() => {
    const b = parseInt(new URLSearchParams(window.location.search).get('beat') || '0', 10);
    return Number.isFinite(b) && b >= 0 && b < SOFA_REVELATION_BEATS.length ? b : 0;
  });
  const beatElapsedRef = useRef(0);
  const completedRef = useRef(false);
  const audioTriggeredRef = useRef(-1);

  const currentBeat = SOFA_REVELATION_BEATS[beatIndex] || SOFA_REVELATION_BEATS[0];
  const phase = currentBeat.phase;

  useEffect(() => () => stopRevelationDrone(), []);

  // Snap camera immediately on mount so frame 1 is never occluded by walls/furniture
  useEffect(() => {
    camera.position.set(3.85, 1.32, 3.1);
    camera.lookAt(2.75, 1.06, 4.65);
  }, [camera]);

  useEffect(() => {
    if (completedRef.current) return undefined;
    beatElapsedRef.current = 0;

    onSubtitleChange({
      tag: currentBeat.speaker,
      text: currentBeat.text,
    });

    if (audioTriggeredRef.current !== beatIndex) {
      audioTriggeredRef.current = beatIndex;
      // Start eerie revelation drone when Hafiz reveals there was NEVER a village
      if (beatIndex === 4) startRevelationDrone();
      if (phase === 'EYES_PUSH') playWhisperScare();
      if (phase === 'JINN_FLASHBACK') playSanctuaryChime(true);
      // Cut all background audio to dead silence before "This... means nothing..."
      if (phase === 'SMASH_CUT') stopRevelationDrone();
    }
    return undefined;
  }, [beatIndex, currentBeat, phase, onSubtitleChange]);

  useFrame((_, delta) => {
    if (paused || completedRef.current) return;
    const dt = Math.min(delta, 0.06);
    beatElapsedRef.current += dt;

    // Generous timing: Jinn Flashback gets extra breathing room, and "This... means nothing..."
    // lingers for a full extra 2.5 seconds in dead silence after typing completes before smash-cut!
    let beatMs = getSubtitleDurationMs(currentBeat.text, currentBeat.speaker);
    if (phase === 'JINN_FLASHBACK') {
      beatMs += 900;
    } else if (currentBeat.smashOnWordEnd) {
      beatMs = currentBeat.text.length * getSubtitleStepMs(currentBeat.speaker) + 2600;
    }

    if (beatElapsedRef.current * 1000 >= beatMs) {
      // Reset elapsed SYNCHRONOUSLY so the next frame before useEffect never double-advances!
      beatElapsedRef.current = 0;
      if (beatIndex < SOFA_REVELATION_BEATS.length - 1) {
        setBeatIndex((i) => i + 1);
      } else {
        completedRef.current = true;
        stopRevelationDrone();
        playCrashImpactThud();
        onSubtitleChange(null);
        onSmashCutToBlack?.();
      }
      return;
    }

    const frac = Math.min(1, (beatElapsedRef.current * 1000) / beatMs);

    // Cinematic Camera Framing (Clean Sofa Two-Shots & Tight Eye Close-Ups)
    if (phase === 'SOFA_YOU') {
      camera.position.lerp(new THREE.Vector3(3.85, 1.32, 3.1), Math.min(1, dt * 3.8));
      camera.lookAt(2.75, 1.06, 4.65);
    } else if (phase === 'SOFA_HAFIZ') {
      camera.position.lerp(new THREE.Vector3(3.3, 1.32, 3.85), Math.min(1, dt * 3.8));
      camera.lookAt(5.05, 1.08, 2.7);
    } else if (phase === 'EYES_PUSH') {
      const dist = THREE.MathUtils.lerp(1.38, 0.64, frac);
      camera.position.set(
        YOU_HEAD[0] + GAZE_X * dist,
        YOU_HEAD[1] + 0.02,
        YOU_HEAD[2] + GAZE_Z * dist
      );
      camera.lookAt(YOU_HEAD[0], YOU_HEAD[1] + 0.01, YOU_HEAD[2]);
    } else if (phase === 'JINN_FLASHBACK') {
      camera.position.set(
        THREE.MathUtils.lerp(0.6, 0.0, frac),
        1.72,
        THREE.MathUtils.lerp(4.6, 2.65, frac)
      );
      camera.lookAt(0, 1.65, -0.35);
    } else if (phase === 'SMASH_CUT') {
      const dist = THREE.MathUtils.lerp(0.68, 0.46, frac);
      camera.position.set(
        YOU_HEAD[0] + GAZE_X * dist,
        YOU_HEAD[1] + 0.02,
        YOU_HEAD[2] + GAZE_Z * dist
      );
      camera.lookAt(YOU_HEAD[0], YOU_HEAD[1] + 0.01, YOU_HEAD[2]);
    }
  });

  if (phase === 'JINN_FLASHBACK') {
    return <JinnFlashback3D />;
  }

  return (
    <>
      <color attach="background" args={['#c8e5ff']} />
      <HomeInterior
        completedChores={['chore_alarm', 'chore_laptop', 'chore_coffee']}
        doorOpen={false}
        doorKnocked={false}
        canExitHouse={false}
      />

      {/* YOU Seated Cleanly ON TOP of the South Sectional Sofa Cushion */}
      <SeatedCharacter3D
        position={YOU_POS}
        rotationY={YOU_ROT}
        shirtColor="#3b4d66"
        sleeveColor="#324259"
        pantsColor="#27313d"
        isTalking={phase === 'SOFA_YOU'}
      />

      {/* HAFIZ Seated Cleanly ON TOP of the East Sectional Sofa Cushion */}
      <SeatedCharacter3D
        position={HAFIZ_POS}
        rotationY={HAFIZ_ROT}
        shirtColor="#2f6b63"
        sleeveColor="#275c55"
        pantsColor="#27313d"
        isTalking={phase === 'SOFA_HAFIZ'}
      />
    </>
  );
}
