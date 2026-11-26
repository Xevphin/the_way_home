// ============================================================================
// src/components/MorningCutscene.jsx
// First-person morning bedroom wake-up cutscene (~6.8s, skippable [SPACE]):
// 1) Wakes up lying in bed beneath warm morning sunlight & curtains
// 2) Turns head to look closely at the glowing 08:15 AM bedside clock
// 3) Sits up and stands smoothly in the bedroom, handing control to player
// ============================================================================

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { playMorningAlarmBeep } from './MorningAudio';

export default function MorningCutscene({
  active,
  paused = false,
  onUpdateState,
  onComplete,
}) {
  const { camera } = useThree();
  const elapsedRef = useRef(0);
  const alarmPlayedRef = useRef(false);
  const lookRef = useRef(new THREE.Vector3(-3.4, 1.9, 5.5));
  const lastStageRef = useRef('');

  useEffect(() => {
    if (!active) return;
    elapsedRef.current = 0;
    alarmPlayedRef.current = false;
    lastStageRef.current = '';
  }, [active]);

  useFrame((_, delta) => {
    if (!active) return;

    // Hold Frame 1 while preloading underneath LoadingPage
    if (paused) {
      camera.position.set(-5.05, 0.94, 4.15);
      lookRef.current.set(-3.4, 1.85, 5.6);
      camera.lookAt(lookRef.current);
      return;
    }

    const dt = Math.min(delta, 0.1);
    elapsedRef.current += dt;
    const t = elapsedRef.current;

    // PHASE 1 (0.0s - 1.8s): Eyes open in bed, warm morning light through curtains
    if (t < 1.8) {
      const p = t / 1.8;
      if (t > 0.35 && !alarmPlayedRef.current) {
        alarmPlayedRef.current = true;
        playMorningAlarmBeep();
      }
      camera.position.set(-5.05, 0.94, 4.15);
      lookRef.current.set(
        THREE.MathUtils.lerp(-3.6, -4.4, p),
        THREE.MathUtils.lerp(2.1, 1.35, p),
        THREE.MathUtils.lerp(5.5, 4.2, p)
      );
      camera.lookAt(lookRef.current);
      if (lastStageRef.current !== 'wake') {
        lastStageRef.current = 'wake';
        onUpdateState({
          blinkOpening: true,
          tag: '',
          caption: 'Ugh... that morning sun is already bright.',
        });
      }
      return;
    }

    // PHASE 2 (1.8s - 4.4s): Turn head toward the bedside digital clock (08:15 AM)
    if (t < 4.4) {
      const p = Math.min(1, (t - 1.8) / 1.4);
      const smooth = p * p * (3 - 2 * p);
      camera.position.set(
        THREE.MathUtils.lerp(-5.05, -4.95, smooth),
        THREE.MathUtils.lerp(0.94, 0.96, smooth),
        THREE.MathUtils.lerp(4.15, 3.35, smooth)
      );
      lookRef.current.set(
        THREE.MathUtils.lerp(-4.4, -5.41, smooth),
        THREE.MathUtils.lerp(1.35, 0.78, smooth),
        THREE.MathUtils.lerp(4.2, 2.59, smooth)
      );
      camera.lookAt(lookRef.current);
      if (lastStageRef.current !== 'clock') {
        lastStageRef.current = 'clock';
        onUpdateState({
          blinkOpening: false,
          tag: '',
          caption: "8:15 already... I'd better get ready before morning class.",
        });
      }
      return;
    }

    // PHASE 3 (4.4s - 6.8s): Sit up and step out of bed into first-person view
    if (t < 6.8) {
      const p = (t - 4.4) / 2.4;
      const smooth = p * p * (3 - 2 * p);
      camera.position.set(
        THREE.MathUtils.lerp(-4.95, -3.2, smooth),
        THREE.MathUtils.lerp(0.96, 1.65, smooth),
        THREE.MathUtils.lerp(3.35, 3.0, smooth)
      );
      lookRef.current.set(
        THREE.MathUtils.lerp(-5.41, -1.8, smooth),
        THREE.MathUtils.lerp(0.78, 1.4, smooth),
        THREE.MathUtils.lerp(2.59, 4.4, smooth)
      );
      camera.lookAt(lookRef.current);
      if (lastStageRef.current !== 'stand') {
        lastStageRef.current = 'stand';
        onUpdateState({
          blinkOpening: false,
          tag: '',
          caption: 'Grab my bag, pour some coffee, and double-check my notes.',
        });
      }
      return;
    }

    onUpdateState({ blinkOpening: false, tag: '', caption: '' });
    onComplete();
  });

  return null;
}
