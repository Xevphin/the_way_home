// ============================================================================
// src/components/DoorFriendCutscene.jsx
// Uses ArticulatedCharacter for Friend 1 (Amir) on the sunlit front porch:
// - Walks up the last steps to the porch with full limb swing & step bob
// - Waves cheerfully, delivers natural invite dialogue with film subtitles
// - Waves goodbye ("Awesome, it'll be this evening—hope to see you there!")
//   and walks smoothly down the porch path before handing control back so
//   the player can head out the front door to their car in the driveway.
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FRIEND_DIALOGUE_SCRIPT } from '../data/chapter1Data';
import { getSubtitleDurationMs } from '../data/dialogueTiming';
import { playDoorLatch } from './MorningAudio';
import ArticulatedCharacter from './ArticulatedCharacter';

export default function DoorFriendCutscene({
  visible,
  active,
  onDoorOpenChange,
  onSubtitleChange,
  onComplete,
}) {
  const { camera } = useThree();
  const groupRef = useRef();
  const elapsedRef = useRef(0);
  const doneRef = useRef(false);

  const [animMode, setAnimMode] = useState('IDLE'); // 'WALK_IN' | 'WAVE' | 'TALK' | 'LEAVE'

  useEffect(() => {
    if (!active) return undefined;
    elapsedRef.current = 0;
    doneRef.current = false;
    setAnimMode('WALK_IN');

    playDoorLatch(true);
    onDoorOpenChange(true);

    const timers = [];
    // Brief walk-up onto the porch as door opens (0.0s - 0.8s)
    timers.push(setTimeout(() => setAnimMode('WAVE'), 750));

    let accMs = 900;
    FRIEND_DIALOGUE_SCRIPT.forEach((line, idx) => {
      const dur = getSubtitleDurationMs(line.text, line.speaker);
      timers.push(
        setTimeout(() => {
          onSubtitleChange({ tag: line.speaker, text: line.text });
          if (idx === FRIEND_DIALOGUE_SCRIPT.length - 1) setAnimMode('WAVE');
          else setAnimMode(line.speaker === 'YOU' ? 'IDLE' : 'TALK');
        }, accMs)
      );
      accMs += dur;
    });

    // Friend 1 turns and walks naturally away down the sunlit front yard path
    timers.push(setTimeout(() => setAnimMode('LEAVE'), accMs - 650));

    timers.push(
      setTimeout(() => {
        onSubtitleChange(null);
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete();
        }
      }, accMs + 2100)
    );

    return () => timers.forEach((t) => clearTimeout(t));
  }, [active, onDoorOpenChange, onSubtitleChange, onComplete]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);

    if (groupRef.current && visible) {
      if (animMode === 'WALK_IN') {
        groupRef.current.position.z = Math.min(
          -7.25,
          groupRef.current.position.z + dt * 1.5
        );
        groupRef.current.rotation.y = 0;
      } else if (animMode === 'LEAVE') {
        groupRef.current.position.x -= dt * 1.35;
        groupRef.current.position.z -= dt * 1.45;
        groupRef.current.rotation.y += (-2.35 - groupRef.current.rotation.y) * dt * 4.5;
      } else {
        groupRef.current.position.set(3.25, 0, -7.25);
        groupRef.current.rotation.y = 0;
      }
    }

    if (!active) return;
    elapsedRef.current += dt;

    camera.position.lerp(new THREE.Vector3(3.2, 1.62, -4.85), Math.min(1, dt * 3.8));
    const lookTarget = groupRef.current
      ? new THREE.Vector3(
          groupRef.current.position.x,
          1.52,
          groupRef.current.position.z
        )
      : new THREE.Vector3(3.25, 1.52, -7.25);
    camera.lookAt(lookTarget);
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[3.25, 0, -8.35]}>
      <ArticulatedCharacter
        shirtColor="#c45c3e"
        sleeveColor="#b55135"
        pantsColor="#2b3d54"
        isWalking={animMode === 'WALK_IN' || animMode === 'LEAVE'}
        isWaving={animMode === 'WAVE'}
        isTalking={animMode === 'TALK'}
      />
    </group>
  );
}
