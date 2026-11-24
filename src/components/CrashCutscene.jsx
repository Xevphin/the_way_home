// ============================================================================
// src/components/CrashCutscene.jsx
// Unified Chapter 1 FM Radio Forest Drive & Midnight Crash Cutscene inside
// the EXACT SAME RuralRoadWorld the player explores immediately afterward:
// - Dynamically calculates line durations via getSubtitleDurationMs so every
//   FM Radio inner monologue finishes typing & reading before the dark figure
//   flashes across the high beams!
// - Drives north (z = +112 -> z = 0) with 360° cabin, 98.4 FM radio, engine
//   hum & thick fog -> impact CRUNCH -> steps out right beside driver's door
//   at [-0.8, 1.7, -0.5] next to the stalled dented sedan!
// ============================================================================

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FOREST_RADIO_SCRIPT } from '../data/sprint4Data';
import { MONOLOGUE } from '../data/monologueData';
import { getSubtitleDurationMs } from '../data/dialogueTiming';
import { playEngineSputter, playHazardClick } from './AudioEngine';
import {
  prewarmCrashAudio,
  startFmRadioAmbience,
  stopFmRadioAmbience,
  triggerRadioStaticCut,
} from './RadioAudio';
import { prewarmCrashShockRinging } from './ForestAmbienceAudio';
import {
  startDrivingEngineAudio,
  stopDrivingEngineAudio,
} from './AmbientMusicAudio';

const START_Z = 112.0;

export default function CrashCutscene({
  active,
  paused = false,
  sedanGroupRef,
  flashFigureRef,
  onCutsceneUpdate,
  onOneShotFlash,
  onImpactShock,
  onComplete,
}) {
  const { camera } = useThree();
  const elapsedRef = useRef(0);
  const hasFlashedRef = useRef(false);
  const crashPlayedRef = useRef(false);
  const sputterPlayedRef = useRef(false);
  const hazardTickRef = useRef(0);
  const hazardHighRef = useRef(true);
  const doneRef = useRef(false);
  const lastStateKeyRef = useRef('');
  const lookTargetRef = useRef(new THREE.Vector3(0.84, 1.05, 88));

  // Only push React state updates when a cutscene field actually changes (eliminates 60fps re-render lag!)
  const emitCutsceneState = (next) => {
    const key = `${next.inCabin}|${next.isDented}|${next.headlightPower.toFixed(1)}|${next.hazardsOn}|${next.showFlashFigure}|${next.radioStatic}|${next.captionTag}|${next.caption}`;
    if (key === lastStateKeyRef.current) return;
    lastStateKeyRef.current = key;
    onCutsceneUpdate(next);
  };

  // Dynamic beat schedule ensuring EVERY pre- & post-crash line finishes typing + full reading pause!
  const schedule = useMemo(() => {
    const line1 = FOREST_RADIO_SCRIPT[0];
    const line2 = FOREST_RADIO_SCRIPT[1];
    const d1 = getSubtitleDurationMs(line1.text, line1.tag) / 1000;
    const d2 = getSubtitleDurationMs(line2.text, line2.tag) / 1000;
    const dDead = getSubtitleDurationMs(MONOLOGUE.cutsceneBeat2Dead.text, MONOLOGUE.cutsceneBeat2Dead.tag) / 1000;
    const dExit = getSubtitleDurationMs(MONOLOGUE.cutsceneBeat3Exit.text, MONOLOGUE.cutsceneBeat3Exit.tag) / 1000;
    const t1 = 0.5;
    const t2 = t1 + d1;
    const flashStart = t2 + d2;
    const impactTime = flashStart + 0.65;
    const deadStart = impactTime + 0.45;
    const swearStart = deadStart + dDead;
    const total = swearStart + dExit;
    return { line1, line2, t1, t2, flashStart, impactTime, deadStart, swearStart, total };
  }, []);

  useEffect(() => {
    if (!active || paused) return undefined;
    elapsedRef.current = 0;
    hasFlashedRef.current = false;
    crashPlayedRef.current = false;
    sputterPlayedRef.current = false;
    hazardTickRef.current = 0;
    doneRef.current = false;
    prewarmCrashAudio();
    prewarmCrashShockRinging();
    startFmRadioAmbience();
    startDrivingEngineAudio();
    return () => {
      stopFmRadioAmbience();
      stopDrivingEngineAudio();
    };
  }, [active, paused]);

  useFrame((_, delta) => {
    if (!active) return;

    if (paused) {
      if (sedanGroupRef.current) sedanGroupRef.current.position.set(1.2, 0, START_Z);
      camera.position.set(0.84, 1.18, START_Z + 0.06);
      lookTargetRef.current.set(0.84, 1.04, START_Z - 20.0);
      camera.lookAt(lookTargetRef.current);
      return;
    }

    const dt = Math.min(delta, 0.1);
    elapsedRef.current += dt;
    const t = elapsedRef.current;

    // BEAT 1: Cruising down thick foggy Route 312 listening to 98.4 FM
    if (t < schedule.flashStart) {
      const p = t / schedule.flashStart;
      const carZ = THREE.MathUtils.lerp(START_Z, 2.6, p);
      if (sedanGroupRef.current) sedanGroupRef.current.position.set(1.2, 0, carZ);
      const bob = Math.sin(t * 13.5) * 0.009;
      camera.position.set(0.84, 1.18 + bob, carZ + 0.06);
      lookTargetRef.current.set(0.84, 1.04, carZ - 22.0);
      camera.lookAt(lookTargetRef.current);

      const activeLine =
        t >= schedule.t2 ? schedule.line2 : t >= schedule.t1 ? schedule.line1 : null;
      emitCutsceneState({
        inCabin: true,
        isDented: false,
        headlightPower: 2.0,
        hazardsOn: false,
        showFlashFigure: false,
        radioStatic: false,
        captionTag: activeLine ? activeLine.tag : '',
        caption: activeLine ? activeLine.text : '',
      });
      return;
    }

    // BEAT 2A: Tall dark figure steps into high beams via PURE REF + strict one-shot 0.85 flash pop!
    if (t < schedule.impactTime) {
      if (!hasFlashedRef.current) {
        hasFlashedRef.current = true;
        onOneShotFlash?.(0.85);
      }
      const p = (t - schedule.flashStart) / (schedule.impactTime - schedule.flashStart);
      const carZ = THREE.MathUtils.lerp(2.6, 0.0, p);
      if (sedanGroupRef.current) sedanGroupRef.current.position.set(1.2, 0, carZ);
      if (flashFigureRef?.current) {
        flashFigureRef.current.position.set(THREE.MathUtils.lerp(-1.45, -0.1, Math.min(1, p * 2.2)), 0.0, -4.6);
      }
      camera.position.set(0.84, 1.18, carZ + 0.06);
      lookTargetRef.current.set(1.15, 1.32, carZ - 5.2);
      camera.lookAt(lookTargetRef.current);
      return;
    }

    // BEAT 2B: Instant 0.35s CSS black cut + pre-warmed crash audio + hide Lurker via ref (0ms hitch!)
    if (!crashPlayedRef.current) {
      crashPlayedRef.current = true;
      if (flashFigureRef?.current) flashFigureRef.current.position.set(-0.1, -50, -4.6);
      onImpactShock?.();
      stopDrivingEngineAudio();
      triggerRadioStaticCut();
    }
    if (sedanGroupRef.current) sedanGroupRef.current.position.set(1.2, 0, 0);

    // Stay in stalled cabin while BOTH post-crash lines finish typing cleanly (exit swap happens behind 0.3s black fade!)
    if (t < schedule.total) {
      const age = t - schedule.impactTime;
      if (age > 0.55 && !sputterPlayedRef.current) {
        sputterPlayedRef.current = true;
        playEngineSputter();
      }
      const hazardsActive = age > 0.8;
      if (hazardsActive) {
        hazardTickRef.current += dt;
        if (hazardTickRef.current >= 0.41) {
          hazardTickRef.current = 0;
          playHazardClick(hazardHighRef.current);
          hazardHighRef.current = !hazardHighRef.current;
        }
      }

      const decay = Math.max(0, 1 - age / 1.35);
      const sx = (Math.random() - 0.5) * 0.32 * decay;
      const sy = (Math.random() - 0.5) * 0.26 * decay;

      camera.position.set(0.84 + sx, 1.18 + sy, 0.06);
      lookTargetRef.current.set(0.95 + sx * 2, 0.98 + sy * 2, -12.0);
      camera.lookAt(lookTargetRef.current);

      if (age >= 0.12) {
        const line =
          t >= schedule.swearStart
            ? MONOLOGUE.cutsceneBeat3Exit
            : t >= schedule.deadStart
              ? MONOLOGUE.cutsceneBeat2Dead
              : { tag: '', text: '' };
        emitCutsceneState({
          inCabin: true,
          isDented: true,
          headlightPower: 0.42,
          hazardsOn: hazardsActive,
          showFlashFigure: false,
          radioStatic: true,
          captionTag: line.tag,
          caption: line.text,
        });
      }
      return;
    }

    if (!doneRef.current) {
      doneRef.current = true;
      stopFmRadioAmbience();
      stopDrivingEngineAudio();
      onComplete();
    }
  });

  return null;
}
