// ============================================================================
// src/components/CampusEncounter.jsx
// Places Friend 2 (Hakim) near the Academic Hall entrance, smoothly walks the
// player's camera up the campus walkway to greet him, plays the 4-line
// conversation with expressive gestures & player nodding, then triggers the
// Sunset Time-Skip Transition.
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMPUS_DIALOGUE_SCRIPT } from '../data/sprint2Data';
import { getSubtitleDurationMs } from '../data/dialogueTiming';
import ArticulatedCharacter from './ArticulatedCharacter';

export default function CampusEncounter({
  active,
  onSubtitleChange,
  onComplete,
}) {
  const { camera } = useThree();
  const elapsedRef = useRef(0);
  const doneRef = useRef(false);
  const [friendTalking, setFriendTalking] = useState(false);
  const [playerNodding, setPlayerNodding] = useState(false);

  useEffect(() => {
    if (!active) return undefined;
    elapsedRef.current = 0;
    doneRef.current = false;
    setFriendTalking(false);
    setPlayerNodding(false);

    const timers = [];
    let accMs = 1500; // Walk up campus walkway for 1.5s first

    CAMPUS_DIALOGUE_SCRIPT.forEach((line) => {
      const dur = getSubtitleDurationMs(line.text, line.speaker);
      timers.push(
        setTimeout(() => {
          onSubtitleChange({ tag: line.speaker, text: line.text });
          setFriendTalking(line.friendTalk);
          setPlayerNodding(line.playerNod);
        }, accMs)
      );
      accMs += dur;
    });

    timers.push(
      setTimeout(() => {
        setFriendTalking(false);
        setPlayerNodding(false);
        onSubtitleChange(null);
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete();
        }
      }, accMs + 600)
    );

    return () => timers.forEach((t) => clearTimeout(t));
  }, [active, onSubtitleChange, onComplete]);

  useFrame(({ clock }, delta) => {
    if (!active) return;
    const dt = Math.min(delta, 0.1);
    elapsedRef.current += dt;
    const t = elapsedRef.current;

    // 0.0s - 1.5s: Walk smoothly from parked car along campus walkway toward Hakim
    const walkP = Math.min(1, t / 1.5);
    const smooth = walkP * walkP * (3 - 2 * walkP);
    const camX = THREE.MathUtils.lerp(2.2, 0.25, smooth);
    const camZ = THREE.MathUtils.lerp(2.5, -9.6, smooth);
    const stepBob = walkP < 1 ? Math.sin(t * 10) * 0.04 : Math.sin(t * 1.8) * 0.008;
    camera.position.set(camX, 1.65 + stepBob, camZ);

    // Subtle vertical camera nod when player agrees with Hakim's advice
    const nodOffset = playerNodding
      ? Math.sin(clock.getElapsedTime() * 6.5) * 0.12
      : 0;
    camera.lookAt(0.1, 1.56 + nodOffset, -12.4);
  });

  if (!active) return null;

  return (
    <group position={[0.1, 0, -12.4]} rotation={[0, 0, 0]}>
      <ArticulatedCharacter
        shirtColor="#243f63"
        sleeveColor="#1d3554"
        pantsColor="#2e343d"
        skinColor="#d4a076"
        hairColor="#181614"
        isWalking={false}
        isWaving={elapsedRef.current < 1.8}
        isTalking={friendTalking}
      />
    </group>
  );
}
