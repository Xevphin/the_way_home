// ============================================================================
// src/components/HafizDoorCutscene.jsx
// Next-Morning Epilogue front-door cutscene with friend Hafiz (stylized
// ArticulatedCharacter kept unchanged) reacting worriedly to your pale face:
// - Opens the front door smoothly (playDoorLatch)
// - Full typewriter timing via getSubtitleDurationMs (never cuts off mid-line!)
// - Transitions cleanly into the Chapter 1 cliffhanger ending card.
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ArticulatedCharacter from './ArticulatedCharacter';
import { HAFIZ_DOOR_SCRIPT } from '../data/epilogueData';
import { getSubtitleDurationMs } from '../data/dialogueTiming';
import { playDoorLatch } from './MorningAudio';

export default function HafizDoorCutscene({
  visible,
  active,
  onDoorOpenChange,
  onSubtitleChange,
  onComplete,
}) {
  const { camera } = useThree();
  const groupRef = useRef();
  const doneRef = useRef(false);
  const [animMode, setAnimMode] = useState('IDLE');

  useEffect(() => {
    if (!active) return undefined;
    doneRef.current = false;
    setAnimMode('IDLE');

    playDoorLatch(true);
    onDoorOpenChange(true);

    const timers = [];
    let accMs = 700;
    HAFIZ_DOOR_SCRIPT.forEach((line) => {
      const dur = getSubtitleDurationMs(line.text, line.speaker);
      timers.push(
        setTimeout(() => {
          onSubtitleChange({ tag: line.speaker, text: line.text });
          setAnimMode(line.speaker === 'HAFIZ' ? 'TALK' : 'IDLE');
        }, accMs)
      );
      accMs += dur;
    });

    timers.push(
      setTimeout(() => {
        onSubtitleChange(null);
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete?.();
        }
      }, accMs + 750)
    );

    return () => timers.forEach((t) => clearTimeout(t));
  }, [active, onDoorOpenChange, onSubtitleChange, onComplete]);

  useFrame((_, delta) => {
    if (!active) return;
    const dt = Math.min(delta, 0.1);
    camera.position.lerp(new THREE.Vector3(3.2, 1.62, -4.85), Math.min(1, dt * 3.8));
    camera.lookAt(3.25, 1.54, -7.25);
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[3.25, 0, -7.25]}>
      <ArticulatedCharacter
        shirtColor="#2f6b63"
        sleeveColor="#275c55"
        pantsColor="#27313d"
        isWalking={false}
        isWaving={false}
        isTalking={animMode === 'TALK'}
      />
    </group>
  );
}
