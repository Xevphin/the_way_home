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
  onCutsceneUpdate,
  onImpactShock,
  onComplete,
}) {
  const { camera } = useThree();
  const elapsedRef = useRef(0);
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

  // Dynamic beat schedule ensuring both FM Radio lines finish typing + full read time
  const schedule = useMemo(() => {
    const line1 = FOREST_RADIO_SCRIPT[0];
    const line2 = FOREST_RADIO_SCRIPT[1];
    const d1 = getSubtitleDurationMs(line1.text, line1.tag) / 1000;
    const d2 = getSubtitleDurationMs(line2.text, line2.tag) / 1000;
    const t1 = 0.5;
    const t2 = t1 + d1;
    const flashStart = t2 + d2;
    const impactTime = flashStart + 0.65;
    const exitStart = impactTime + 2.0;
    const total = exitStart + 2.3;
    return { line1, line2, t1, t2, flashStart, impactTime, exitStart, total };
  }, []);

  useEffect(() => {
    if (!active || paused) return undefined;
    elapsedRef.current = 0;
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

    // BEAT 2A: Tall dark figure flashes straight across high beams!
    if (t < schedule.impactTime) {
      const p = (t - schedule.flashStart) / (schedule.impactTime - schedule.flashStart);
      const carZ = THREE.MathUtils.lerp(2.6, 0.0, p);
      if (sedanGroupRef.current) sedanGroupRef.current.position.set(1.2, 0, carZ);
      camera.position.set(0.84, 1.18, carZ + 0.06);
      lookTargetRef.current.set(1.15, 1.32, carZ - 5.2);
      camera.lookAt(lookTargetRef.current);

      emitCutsceneState({
        inCabin: true,
        isDented: false,
        headlightPower: 2.3,
        hazardsOn: false,
        showFlashFigure: true,
        radioStatic: false,
        captionTag: '',
        caption: 'WAIT—WHAT IS THAT?!',
      });
      return;
    }

    // BEAT 2B: Tire screech, FM static cut, metallic CRUNCH, jolt & 0.35s black shock cut
    if (!crashPlayedRef.current) {
      crashPlayedRef.current = true;
      stopDrivingEngineAudio();
      triggerRadioStaticCut();
      onImpactShock?.();
    }
    if (sedanGroupRef.current) sedanGroupRef.current.position.set(1.2, 0, 0);

    if (t < schedule.exitStart) {
      const age = t - schedule.impactTime;
      if (age > 0.65 && !sputterPlayedRef.current) {
        sputterPlayedRef.current = true;
        playEngineSputter();
      }
      const hazardsActive = age > 0.9;
      if (hazardsActive) {
        hazardTickRef.current += dt;
        if (hazardTickRef.current >= 0.41) {
          hazardTickRef.current = 0;
          playHazardClick(hazardHighRef.current);
          hazardHighRef.current = !hazardHighRef.current;
        }
      }

      const decay = Math.max(0, 1 - age / 1.45);
      const sx = (Math.random() - 0.5) * 0.34 * decay;
      const sy = (Math.random() - 0.5) * 0.28 * decay;

      camera.position.set(0.84 + sx, 1.18 + sy, 0.06);
      lookTargetRef.current.set(0.95 + sx * 2, 0.98 + sy * 2, -12.0);
      camera.lookAt(lookTargetRef.current);

      // Avoid 60fps React re-renders on impact: lights snap dark during 0.35s shock cut, then dim to 0.42
      emitCutsceneState({
        inCabin: true,
        isDented: true,
        headlightPower: age < 0.35 ? 0.04 : 0.42,
        hazardsOn: hazardsActive,
        showFlashFigure: false,
        radioStatic: true,
        captionTag: age > 0.75 ? MONOLOGUE.cutsceneBeat2Dead.tag : '',
        caption: age > 0.75 ? MONOLOGUE.cutsceneBeat2Dead.text : 'WAIT—WHAT IS THAT?!',
      });
      return;
    }

    // BEAT 3: Step out driver's door directly beside the stalled car at [-0.8, 1.7, -0.5]
    if (t < schedule.total) {
      const p = (t - schedule.exitStart) / (schedule.total - schedule.exitStart);
      const s = p * p * (3 - 2 * p);
      camera.position.set(
        THREE.MathUtils.lerp(0.55, -0.8, s),
        THREE.MathUtils.lerp(1.25, 1.7, s),
        THREE.MathUtils.lerp(0.05, -0.5, s)
      );
      lookTargetRef.current.set(
        THREE.MathUtils.lerp(0.6, 1.2, s),
        THREE.MathUtils.lerp(1.05, 0.85, s),
        THREE.MathUtils.lerp(-14.0, -2.2, s)
      );
      camera.lookAt(lookTargetRef.current);

      emitCutsceneState({
        inCabin: false,
        isDented: true,
        headlightPower: 0.42,
        hazardsOn: true,
        showFlashFigure: false,
        radioStatic: true,
        captionTag: MONOLOGUE.cutsceneBeat3Exit.tag,
        caption: MONOLOGUE.cutsceneBeat3Exit.text,
      });
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
