// ============================================================================
// src/components/PostCreditsTeaser3D.jsx
// Post-Credits Stinger Scene:
// - Watches from the dark forest shoulder as an unknown car's headlights peel
//   off the jammed E18 highway onto the dark "← 312 Lembah Batu" detour road
// - Reuses Route312BranchRoad, MalaysianSignboard3D, NightSkyDome & sedan.glb!
// ============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Route312BranchRoad, { createRoute312Curve } from './Route312BranchRoad';
import MalaysianSignboard3D from '../shared/MalaysianSignboard3D';
import NightSkyDome from '../shared/NightSkyDome';
import TrafficCarModel from '../shared/TrafficCarModel';
import StalledSedan from '../shared/StalledSedan';
import RainMistStreaks3D from '../shared/RainMistStreaks3D';

export default function PostCreditsTeaser3D({ onTitleReveal }) {
  const { camera } = useThree();
  const carRef = useRef();
  const elapsedRef = useRef(0);
  const revealedRef = useRef(false);
  const curve = useMemo(() => createRoute312Curve(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.06);
    elapsedRef.current += dt;
    const e = elapsedRef.current;

    // Unknown car turns off the jammed highway onto the dark Route 312 curve
    const u = THREE.MathUtils.clamp(e / 7.5, 0, 0.96);
    const pt = curve.getPointAt(u);
    const nextPt = curve.getPointAt(Math.min(1, u + 0.02));
    if (carRef.current) {
      carRef.current.position.set(pt.x, 0, pt.z);
      carRef.current.rotation.y = Math.atan2(pt.x - nextPt.x, pt.z - nextPt.z);
    }

    // Eerie static-pan camera watching from the dark verge beside the 312 signboard
    camera.position.set(-16.5, 3.1, -30.0);
    camera.lookAt(
      THREE.MathUtils.lerp(-6.5, -18.0, Math.min(1, e / 6.5)),
      1.6,
      THREE.MathUtils.lerp(-40.0, -64.0, Math.min(1, e / 6.5))
    );

    if (!revealedRef.current && e >= 4.2) {
      revealedRef.current = true;
      onTitleReveal?.();
    }
  });

  return (
    <>
      <color attach="background" args={['#03060d']} />
      <fog attach="fog" args={['#050a14', 12, 84]} />
      <NightSkyDome />
      <RainMistStreaks3D count={100} speed={11.0} opacity={0.22} streakLength={0.7} />
      <ambientLight intensity={0.28} color="#344a6e" />

      {/* Ground, Jammed E18 Highway & Seamless Route 312 Detour Branch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, -0.02, -75]}>
        <planeGeometry args={[180, 190]} />
        <meshStandardMaterial color="#0b130d" roughness={0.96} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -65]}>
        <planeGeometry args={[12.4, 150]} />
        <meshStandardMaterial color="#181d25" roughness={0.75} />
      </mesh>
      <Route312BranchRoad />

      {/* Iconic ← 312 Lembah Batu Signboard on the Left Grass Verge */}
      <MalaysianSignboard3D position={[-10.2, 0, -34.5]} />
      <pointLight position={[-10.2, 5.2, -33.0]} color="#ffc872" intensity={7.5} distance={22} />

      {/* Jammed Highway Brake Lights Ahead on E18 */}
      {[
        { x: -1.6, z: -50, v: 0 },
        { x: 2.2, z: -48, v: 2 },
        { x: -1.6, z: -60, v: 3 },
        { x: 2.2, z: -58, v: 1 },
      ].map((c, idx) => (
        <TrafficCarModel
          key={idx}
          variantIndex={c.v}
          position={[c.x, 0, c.z]}
          lightsOn={true}
          braking={true}
        />
      ))}
      <pointLight position={[0, 1.2, -52]} color="#ff2424" intensity={6.5} distance={20} />

      {/* Unknown Car's Headlights Turning Into 312 Lembah Batu */}
      <group ref={carRef} position={[-1.8, 0, -35]}>
        <StalledSedan position={[0, 0, 0]} isDented={false} headlightPower={1.35} hazardsOn={false} />
        <pointLight position={[0, 1.5, -10]} color="#ffebc2" intensity={18} distance={34} decay={1.3} />
        <pointLight position={[0, 1.8, -22]} color="#ffdca0" intensity={11} distance={32} decay={1.4} />
      </group>
    </>
  );
}
