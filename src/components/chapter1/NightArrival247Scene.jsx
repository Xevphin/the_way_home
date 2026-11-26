// ============================================================================
// src/components/NightArrival247Scene.jsx
// 2:47 AM Safe Arrival Home Cutscene:
// - Reuses MorningExteriorDriveway under calm moonlit night sky + warm porch
//   lantern while the player's sedan sits parked safely in the driveway
// - Paired with PhoneTimeOverlay (02:47 AM) and the shaky relief monologue
// ============================================================================

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import MorningExteriorDriveway from '../shared/MorningExteriorDriveway';
import NightSkyDome from '../shared/NightSkyDome';
import { playSanctuaryChime } from '../shared/AudioEngine';

const ARRIVAL_DURATION = 7.4;

export default function NightArrival247Scene({ onSubtitle, onFadeChange, onComplete }) {
  const { camera } = useThree();
  const elapsedRef = useRef(0);
  const flagsRef = useRef({ spoke: false, done: false });

  useEffect(() => {
    elapsedRef.current = 0;
    flagsRef.current = { spoke: false, done: false };
    onFadeChange?.(0);
    playSanctuaryChime(true);
  }, [onFadeChange]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.06);
    elapsedRef.current += dt;
    const e = elapsedRef.current;

    // Gentle relieved camera pan from the parked sedan toward the warm glowing front porch
    const k = THREE.MathUtils.smoothstep(e, 0, ARRIVAL_DURATION - 1.2);
    camera.position.set(
      THREE.MathUtils.lerp(5.8, 3.8, k),
      THREE.MathUtils.lerp(1.58, 1.66, k),
      THREE.MathUtils.lerp(-14.6, -11.4, k)
    );
    camera.lookAt(
      THREE.MathUtils.lerp(4.4, 3.2, k),
      1.45,
      THREE.MathUtils.lerp(-9.5, -6.2, k)
    );

    if (!flagsRef.current.spoke && e > 0.7) {
      flagsRef.current.spoke = true;
      onSubtitle({
        tag: 'YOU',
        text: "2:47 AM... I'm finally home. I swear I am never going back to that road ever again.",
      });
    }

    if (e > ARRIVAL_DURATION - 1.4) {
      onFadeChange?.(Math.min(1, (e - (ARRIVAL_DURATION - 1.4)) / 1.3));
    }

    if (e >= ARRIVAL_DURATION && !flagsRef.current.done) {
      flagsRef.current.done = true;
      onSubtitle(null);
      onComplete?.();
    }
  });

  return (
    <>
      <color attach="background" args={['#060a14']} />
      <fog attach="fog" args={['#080e1c', 18, 95]} />
      <NightSkyDome />
      <ambientLight intensity={0.32} color="#47608a" />
      <directionalLight position={[-12, 22, -16]} intensity={0.42} color="#8ab0e6" />

      {/* Warm Welcoming Suburban Front Porch & Streetlight Glow */}
      <pointLight position={[3.2, 2.75, -7.6]} color="#ffda96" intensity={6.5} distance={16} />
      <pointLight position={[9.5, 5.2, -17.2]} color="#ffd588" intensity={5.5} distance={22} />
      <pointLight position={[-9.5, 5.2, -17.2]} color="#ffd588" intensity={5.5} distance={22} />

      {/* Front Facade Wall + Warm Lit Living Room Window */}
      <mesh position={[0, 1.6, -6.0]} receiveShadow>
        <boxGeometry args={[13.0, 3.2, 0.25]} />
        <meshStandardMaterial color="#c8bfb2" roughness={0.88} />
      </mesh>
      <mesh position={[3.2, 1.18, -6.14]}>
        <boxGeometry args={[1.3, 2.34, 0.08]} />
        <meshStandardMaterial color="#593822" roughness={0.75} />
      </mesh>
      <mesh position={[-2.2, 1.7, -6.15]}>
        <planeGeometry args={[2.2, 1.3]} />
        <meshBasicMaterial color="#ffe4a8" />
      </mesh>

      {/* Suburban Ground Lawn & Existing Neighborhood Driveway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.14, -14]} receiveShadow>
        <planeGeometry args={[86, 54]} />
        <meshStandardMaterial color="#182419" roughness={0.96} />
      </mesh>
      <MorningExteriorDriveway nightMode={true} />
    </>
  );
}
