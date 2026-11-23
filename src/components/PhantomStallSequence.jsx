// ============================================================================
// src/components/PhantomStallSequence.jsx
// Scripted ~9.5-second first-person psychological hallucination sequence at
// the Phantom Roadside Stall:
// - Player sits down at the warm warung table to ask the quiet diners for help
// - Dead silence -> all diners freeze & snap heads in unison to stare directly
//   into the camera and whisper: "You should not have come here."
// - Sharp audio sting + blinding strobe flash -> reveals pitch-dark abandoned
//   stall covered in pulsing organic veins -> player stumbles back in shock
//   recalling Amir's cafe wiki story!
// ============================================================================

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  playHallucinationSting,
  setAmbienceSilence,
} from './ForestAmbienceAudio';
import { getSubtitleDurationMs } from '../data/dialogueTiming';

const BEAT_LINES = {
  b1: { tag: 'YOU', text: 'Excuse me—my car just broke down back on the road. Do you have signal or a phone I can use?' },
  b2: { tag: 'INNER THOUGHT', text: "Wait... why isn't anyone answering? Their food isn't even steaming..." },
  b3: { tag: 'WHISPERING IN UNISON', text: 'You should not have come here.' },
  b4: { tag: 'INNER THOUGHT', text: "No... no way. Amir's story at the cafe—this is the exact place he was talking about..." },
};

const T_B1 = 0.25;
const T_B2 = T_B1 + getSubtitleDurationMs(BEAT_LINES.b1.text, BEAT_LINES.b1.tag) / 1000;
const T_B3 = T_B2 + getSubtitleDurationMs(BEAT_LINES.b2.text, BEAT_LINES.b2.tag) / 1000;
const T_FLASH = T_B3 + getSubtitleDurationMs(BEAT_LINES.b3.text, BEAT_LINES.b3.tag) / 1000;
const T_CLEAR = T_FLASH + 0.65;
const SEQUENCE_DURATION = T_CLEAR + 3.2;

export default function PhantomStallSequence({
  active,
  playerPosRef,
  playerYawRef,
  onDinersStare,
  onFlashStrobe,
  onRevealReality,
  onSubtitle,
  onComplete,
}) {
  const { camera } = useThree();
  const elapsedRef = useRef(0);
  const startPosRef = useRef(new THREE.Vector3(-4.2, 1.7, -214.5));
  const stageFlagsRef = useRef({ s1: false, s2: false, s3: false, s4: false, s5: false, done: false });

  useEffect(() => {
    if (!active) return undefined;
    elapsedRef.current = 0;
    startPosRef.current.copy(camera.position);
    stageFlagsRef.current = { s1: false, s2: false, s3: false, s4: false, s5: false, done: false };
    onDinersStare(false);
    onFlashStrobe(false);
    return () => {
      onFlashStrobe(false);
      setAmbienceSilence(false);
    };
  }, [active, camera, onDinersStare, onFlashStrobe]);

  useFrame((_, delta) => {
    if (!active) return;
    const dt = Math.min(delta, 0.1);
    elapsedRef.current += dt;
    const t = elapsedRef.current;
    const f = stageFlagsRef.current;

    // Beat 1: Sit down at the warm warung table (full read time before Beat 2)
    if (!f.s1 && t >= T_B1) {
      f.s1 = true;
      onSubtitle(BEAT_LINES.b1, getSubtitleDurationMs(BEAT_LINES.b1.text, BEAT_LINES.b1.tag));
    }

    // Beat 2: Uncanny silence falls over the warung
    if (!f.s2 && t >= T_B2) {
      f.s2 = true;
      setAmbienceSilence(true);
      onSubtitle(BEAT_LINES.b2, getSubtitleDurationMs(BEAT_LINES.b2.text, BEAT_LINES.b2.tag));
    }

    // Beat 3: All diners freeze & snap heads in unison directly at player
    if (!f.s3 && t >= T_B3) {
      f.s3 = true;
      onDinersStare(true);
      onSubtitle(BEAT_LINES.b3, getSubtitleDurationMs(BEAT_LINES.b3.text, BEAT_LINES.b3.tag));
    }

    // Beat 4: Sharp sting + strobe flash -> reveal pitch-dark veined reality!
    if (!f.s4 && t >= T_FLASH) {
      f.s4 = true;
      playHallucinationSting();
      onFlashStrobe(true);
      onRevealReality();
    }

    // Beat 5: Strobe clears, player stumbles back recalling Amir's story
    if (!f.s5 && t >= T_CLEAR) {
      f.s5 = true;
      onFlashStrobe(false);
      onSubtitle(BEAT_LINES.b4, getSubtitleDurationMs(BEAT_LINES.b4.text, BEAT_LINES.b4.tag));
    }

    // Camera choreography aligned to the rotated West Forest Clearing ([-14.6, 0, -222.0])
    const seatPos = new THREE.Vector3(-11.35, 1.38, -221.95);
    const stumblePos = new THREE.Vector3(-8.4, 1.66, -222.4);
    const lookDiners = new THREE.Vector3(-13.4, 1.36, -221.9);

    if (t < 2.2) {
      const p = Math.min(1, t / 2.2);
      const s = p * p * (3 - 2 * p);
      camera.position.lerpVectors(startPosRef.current, seatPos, s);
      camera.lookAt(lookDiners);
    } else if (t < T_FLASH) {
      const dreadJitter = t > T_B3 ? (Math.random() - 0.5) * 0.025 : 0;
      camera.position.set(
        seatPos.x + dreadJitter,
        seatPos.y + Math.sin(t * 2.1) * 0.012 + dreadJitter,
        seatPos.z
      );
      camera.lookAt(lookDiners.x, lookDiners.y + (t > T_B3 ? 0.05 : 0), lookDiners.z);
    } else {
      // Violent stumble backward into the dark dirt clearing!
      const p = Math.min(1, (t - T_FLASH) / 1.85);
      const ease = 1 - Math.pow(1 - p, 2);
      const tremor = Math.max(0, 1 - (t - T_FLASH) / 2.4) * 0.14;
      camera.position.lerpVectors(seatPos, stumblePos, ease);
      camera.position.x += (Math.random() - 0.5) * tremor;
      camera.position.y += (Math.random() - 0.5) * tremor;
      camera.lookAt(-14.4, 1.35, -222.0);
    }

    if (t >= SEQUENCE_DURATION && !f.done) {
      f.done = true;
      onFlashStrobe(false);
      onDinersStare(false);
      setAmbienceSilence(false);
      playerPosRef.current.copy(stumblePos);
      playerYawRef.current = Math.PI / 2; // Facing west toward the revealed stall
      onComplete();
    }
  });

  return null;
}
