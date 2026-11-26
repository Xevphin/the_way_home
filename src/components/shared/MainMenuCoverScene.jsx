// ============================================================================
// src/components/MainMenuCoverScene.jsx
// Finalized Main Menu 3D cover composition:
// - Reuses RuralRoadWorld's EXACT midnight gameplay roadside signboard
//   ("Welcome to Lembah Batu" at x = 7.2, z = -29.2, both posts planted on
//   the grass verge cleanly behind the x = 4.85 wooden guardrail)
// - Camera sits naturally on the right road shoulder angled toward the sign:
//   left side shows the open misty asphalt road receding behind the menu,
//   right side frames the signboard behind the guardrail with moonlit fog!
// ============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import RuralRoadWorld from '../chapter1/RuralRoadWorld';
import NightSkyDome from './NightSkyDome';

function CoverCameraBreath() {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    camera.position.set(
      2.65 + Math.sin(t * 0.34) * 0.14,
      1.92 + Math.sin(t * 0.6) * 0.04,
      -5.3 + Math.cos(t * 0.26) * 0.12
    );
    camera.lookAt(4.75, 2.02, -14.5);
  });

  return null;
}

function DriftingFogParticles() {
  const groupRef = useRef();

  const motes = useMemo(
    () =>
      Array.from({ length: 56 }).map((_, i) => ({
        id: i,
        x: -1.5 + ((i * 23) % 14),
        y: 0.45 + ((i * 17) % 12) * 0.32,
        z: -21.5 - ((i * 19) % 16),
        scale: 0.55 + (i % 4) * 0.28,
        speed: 0.2 + (i % 5) * 0.06,
        phase: i * 0.85,
        warm: i % 3 === 0,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((mesh, idx) => {
      const m = motes[idx];
      mesh.position.x = m.x + Math.sin(t * m.speed + m.phase) * 0.8;
      mesh.position.y = m.y + Math.cos(t * m.speed * 0.8 + m.phase) * 0.22;
    });
  });

  return (
    <group ref={groupRef}>
      {motes.map((m) => (
        <mesh key={m.id} position={[m.x, m.y, m.z]} scale={m.scale}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshBasicMaterial
            color={m.warm ? '#ffe1a8' : '#b7cce6'}
            transparent
            opacity={m.warm ? 0.38 : 0.25}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function MainMenuCoverScene() {
  return (
    <>
      <CoverCameraBreath />
      <NightSkyDome />
      <RuralRoadWorld menuBright={true} />

      {/* Cool Moonlit Volumetric Rim Backlight Behind the Signboard & Pine Canopy */}
      <pointLight
        position={[7.4, 5.2, -18.6]}
        color="#789ed6"
        intensity={13.5}
        distance={28}
        decay={1.4}
      />

      <DriftingFogParticles />
    </>
  );
}
