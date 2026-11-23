// ============================================================================
// src/components/UstazLightDomeCutscene.jsx
// Chapter 1 Climax Cutscene:
// - Speeding red sedan bursts past the Lembah Batu valley boundary marker
// - Uncle (the Ustaz, white jubah & kopiah) stands firm at the threshold,
//   raising both hands to summon a massive radiant golden-white dome of light
// - The dome slams shut directly against the lunging Shadow Lurker with a
//   final deafening screech before fading cleanly to black!
// ============================================================================

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import StalledSedan from './StalledSedan';
import ShadowStalkerModel from './ShadowStalkerModel';
import NightSkyDome from './NightSkyDome';
import ModelAsset from './ModelAsset';
import { FOREST_TREE_VARIANTS } from '../data/modelCatalog';
import { playJumpscareScreech, playSanctuaryChime } from './AudioEngine';

const CUTSCENE_LEN = 8.4;

function UstazThresholdFigure({ leftArmRef, rightArmRef }) {
  return (
    <group position={[0, 0, 0]}>
      {/* White Flowing Jubah Robe */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.34, 1.44, 12]} />
        <meshStandardMaterial color="#f5f3ec" roughness={0.86} />
      </mesh>
      <mesh position={[0, 1.38, 0]} castShadow>
        <boxGeometry args={[0.46, 0.44, 0.25]} />
        <meshStandardMaterial color="#f5f3ec" roughness={0.85} />
      </mesh>
      {/* Head, Warm Silver Beard & White Kopiah */}
      <mesh position={[0, 1.72, 0]} castShadow>
        <sphereGeometry args={[0.14, 14, 14]} />
        <meshStandardMaterial color="#cca283" roughness={0.78} />
      </mesh>
      <mesh position={[0, 1.62, 0.1]} scale={[0.9, 1.0, 0.55]}>
        <sphereGeometry args={[0.095, 10, 10]} />
        <meshStandardMaterial color="#d9dfe6" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.84, 0]}>
        <cylinderGeometry args={[0.135, 0.145, 0.11, 14]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      {/* Animated Arms Raised to Summon the Golden Barrier Dome */}
      <group ref={leftArmRef} position={[-0.29, 1.44, 0]}>
        <mesh position={[0, -0.26, 0.04]} castShadow>
          <cylinderGeometry args={[0.068, 0.056, 0.52, 8]} />
          <meshStandardMaterial color="#f2efe8" roughness={0.86} />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.29, 1.44, 0]}>
        <mesh position={[0, -0.26, 0.04]} castShadow>
          <cylinderGeometry args={[0.068, 0.056, 0.52, 8]} />
          <meshStandardMaterial color="#f2efe8" roughness={0.86} />
        </mesh>
      </group>
    </group>
  );
}

export default function UstazLightDomeCutscene({
  paused = false,
  onSubtitle,
  onFadeChange,
  onImpactFlash,
  onComplete,
}) {
  const { camera } = useThree();
  const carRef = useRef();
  const lurkerRef = useRef();
  const domeRef = useRef();
  const domeMatRef = useRef();
  const domeLightRef = useRef();
  const shockRingRef = useRef();
  const shockMatRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();

  const elapsedRef = useRef(0);
  const flagsRef = useRef({ s1: false, s2: false, impact: false, done: false });

  const trees = useMemo(
    () =>
      [-20, -12, -4, 4, 12, 20].flatMap((z, i) => [
        { key: `ul_${i}`, pos: [-7.2, 0, z], v: i % 4 },
        { key: `ur_${i}`, pos: [7.2, 0, z], v: (i + 2) % 4 },
      ]),
    []
  );

  useEffect(() => {
    elapsedRef.current = 0;
    flagsRef.current = { s1: false, s2: false, impact: false, done: false };
    onFadeChange?.(0);
  }, [onFadeChange]);

  useFrame(({ clock }, delta) => {
    if (paused) return;
    const dt = Math.min(delta, 0.06);
    const t = clock.getElapsedTime();
    elapsedRef.current += dt;
    const e = elapsedRef.current;

    // 1. Speeding red sedan blasts past Uncle at the boundary threshold
    if (carRef.current) {
      const carZ = 18 - e * 14.5;
      carRef.current.position.set(1.85, 0, carZ);
    }

    // 2. Uncle raises both hands smoothly to summon the sacred golden-white barrier dome
    const raiseT = THREE.MathUtils.clamp((e - 1.5) / 1.8, 0, 1);
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -raiseT * 2.25;
      leftArmRef.current.rotation.z = raiseT * 0.45;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -raiseT * 2.25;
      rightArmRef.current.rotation.z = -raiseT * 0.45;
    }

    // 3. Expanding Radiant Golden-White Dome Slamming Shut at t = 3.2s..4.5s
    const domeGrow = THREE.MathUtils.clamp((e - 2.4) / 1.55, 0, 1);
    const domeRadius = 0.4 + Math.pow(domeGrow, 0.7) * 7.8;
    if (domeRef.current) domeRef.current.scale.setScalar(domeRadius);
    if (domeMatRef.current) {
      const pulse = 0.28 + Math.sin(t * 14) * 0.06;
      domeMatRef.current.opacity = domeGrow > 0 ? Math.min(0.46, domeGrow * pulse * 1.45) : 0;
    }
    if (domeLightRef.current) {
      domeLightRef.current.intensity = domeGrow * (28 + Math.sin(t * 18) * 5);
    }

    // 4. Pursuing Shadow Lurker lunges straight into the golden dome & recoils violently!
    if (lurkerRef.current) {
      if (e < 4.1) {
        const z = 20 - Math.min(1, e / 3.85) * 11.4;
        lurkerRef.current.position.set(Math.sin(t * 10) * 0.45, 0, z);
        lurkerRef.current.scale.setScalar(1.18);
      } else {
        const recoil = Math.min(1, (e - 4.1) / 1.8);
        const z = 8.6 + recoil * 9.5;
        lurkerRef.current.position.set(Math.sin(t * 48) * 0.32, recoil * 0.6, z);
        lurkerRef.current.scale.setScalar(Math.max(0.05, 1.18 * (1 - recoil * 0.85)));
      }
    }

    // Story Beats & Audio Triggers
    if (!flagsRef.current.s1 && e > 0.35) {
      flagsRef.current.s1 = true;
      playSanctuaryChime(true);
      onSubtitle({
        tag: 'UNCLE',
        text: 'Drive straight through the boundary—do not look back!',
      });
    }
    if (!flagsRef.current.s2 && e > 2.4) {
      flagsRef.current.s2 = true;
      playSanctuaryChime(true);
      onSubtitle({
        tag: 'UNCLE',
        text: 'I seek refuge in God from the accursed evil... You will NOT cross this sacred threshold!',
      });
    }
    if (!flagsRef.current.impact && e > 4.05) {
      flagsRef.current.impact = true;
      playJumpscareScreech();
      onImpactFlash?.();
    }

    // Expanding golden shockwave ring racing outward across the wet asphalt on impact
    if (shockRingRef.current && shockMatRef.current) {
      if (e > 4.05) {
        const st = THREE.MathUtils.clamp((e - 4.05) / 1.45, 0, 1);
        shockRingRef.current.visible = st < 1;
        shockRingRef.current.scale.setScalar(1 + st * 26);
        shockMatRef.current.opacity = (1 - st) * 0.88;
      } else {
        shockRingRef.current.visible = false;
      }
    }

    // Cinematic Camera Framing: wide hero shot keeping Uncle + dome + Lurker cleanly in frame
    const camK = THREE.MathUtils.smoothstep(e, 0, 4.4);
    camera.position.set(
      THREE.MathUtils.lerp(-4.6, -6.8, camK),
      THREE.MathUtils.lerp(2.1, 3.1, camK),
      THREE.MathUtils.lerp(-5.8, -2.6, camK)
    );
    camera.lookAt(0, 1.85, THREE.MathUtils.lerp(1.8, 4.2, camK));

    // Fade to black smoothly at the end
    if (e > 6.5) {
      onFadeChange?.(Math.min(1, (e - 6.5) / 1.6));
    }

    if (e >= CUTSCENE_LEN && !flagsRef.current.done) {
      flagsRef.current.done = true;
      onSubtitle(null);
      onComplete?.();
    }
  });

  return (
    <>
      <color attach="background" args={['#050810']} />
      <fog attach="fog" args={['#070c16', 12, 68]} />
      <NightSkyDome />
      <ambientLight intensity={0.44} color="#3a527a" />

      {/* Valley Boundary Wet Road & Dark Pines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#0b120e" roughness={0.98} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[9.4, 90]} />
        <meshStandardMaterial color="#1a2029" roughness={0.48} />
      </mesh>
      {trees.map((tr) => (
        <ModelAsset
          key={tr.key}
          url={FOREST_TREE_VARIANTS[tr.v]}
          position={tr.pos}
          targetHeight={9.2}
        />
      ))}

      {/* Sacred Boundary Threshold Stone Ring + Impact Asphalt Shockwave */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[7.4, 7.9, 48]} />
        <meshBasicMaterial color="#ffe499" transparent opacity={0.65} />
      </mesh>
      <mesh ref={shockRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} visible={false}>
        <ringGeometry args={[0.72, 1.0, 48]} />
        <meshBasicMaterial ref={shockMatRef} color="#fff4c4" transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Uncle (The Ustaz) Standing Firm at the Valley Threshold */}
      <UstazThresholdFigure leftArmRef={leftArmRef} rightArmRef={rightArmRef} />

      {/* Expanding Golden-White Dome of Light */}
      <pointLight ref={domeLightRef} position={[0, 2.4, 0.5]} color="#ffefc0" intensity={4} distance={48} />
      <mesh ref={domeRef} position={[0, 0.2, 0]} scale={0.4}>
        <sphereGeometry args={[1, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial
          ref={domeMatRef}
          color="#fff1c4"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Speeding Red Sedan Escaping Into Safety */}
      <group ref={carRef} position={[1.85, 0, 18]}>
        <StalledSedan position={[0, 0, 0]} isDented={true} headlightPower={1.35} hazardsOn={false} />
        <pointLight position={[0, 1.5, -10]} color="#ffebc2" intensity={14} distance={26} />
      </group>

      {/* Pursuing Shadow Lurker Slamming Into the Golden Barrier & Recoiling */}
      <group ref={lurkerRef} position={[0, 0, 20]}>
        <ShadowStalkerModel scale={1.18} frenzy={true} eyeColor="#ff3b3b" eyeScale={1.85} />
      </group>
    </>
  );
}
