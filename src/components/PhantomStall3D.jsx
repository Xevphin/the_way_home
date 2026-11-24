// ============================================================================
// src/components/PhantomStall3D.jsx
// Signature Chapter 1 Psychological Horror Set-Piece at [-8.5, 0, -215.0]:
// - Phase A (revealed=false): Warmly lit roadside warung bustling with 4
//   uncanny diners quietly eating/ordering; when dinersStare=true, all 4
//   freeze and snap their heads in unison to stare straight at the player.
// - Phase B (revealed=true): Pitch-dark, rotted abandoned stall covered in
//   pulsing crimson-black organic veins & tendrils with zero people anywhere.
// ============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ModelAsset from './ModelAsset';
import { MODELS } from '../data/modelCatalog';
import { LANDMARK_TRANSFORMS } from '../data/midnightLandmarksData';

// Local offsets inside the rotated Phantom Stall clearing ([-14.6, 0, -222.0], rotY=0.22)
const DINER_CONFIGS = [
  { id: 'd1', pos: [1.55, 0, 1.4], baseYaw: 0.4, shirt: '#3e5446', seated: true },
  { id: 'd2', pos: [1.7, 0, -0.75], baseYaw: -0.35, shirt: '#7a473a', seated: true },
  { id: 'd3', pos: [0.55, 0, 0.45], baseYaw: 1.4, shirt: '#485266', seated: false },
  { id: 'd4', pos: [2.15, 0, -2.1], baseYaw: 0.9, shirt: '#665b45', seated: true },
];

const PLAYER_SEAT_LOCAL = new THREE.Vector3(3.15, 1.38, 0.75);

function UncannyDiner({ cfg, stare }) {
  const headRef = useRef();
  const armRef = useRef();

  const targetHeadYaw = useMemo(() => {
    const dx = PLAYER_SEAT_LOCAL.x - cfg.pos[0];
    const dz = PLAYER_SEAT_LOCAL.z - cfg.pos[2];
    const localAngle = Math.atan2(dx, dz);
    return localAngle - cfg.baseYaw;
  }, [cfg.pos, cfg.baseYaw]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    if (headRef.current) {
      const desired = stare ? targetHeadYaw : Math.sin(t * 0.8 + cfg.pos[2]) * 0.12;
      headRef.current.rotation.y += (desired - headRef.current.rotation.y) * Math.min(1, delta * (stare ? 14 : 3));
    }
    if (armRef.current) {
      armRef.current.rotation.x = stare ? 0 : -0.45 + Math.sin(t * 2.2 + cfg.pos[0]) * 0.16;
    }
  });

  const yOff = cfg.seated ? -0.26 : 0;

  return (
    <group position={[cfg.pos[0], yOff, cfg.pos[2]]} rotation={[0, cfg.baseYaw, 0]}>
      {/* Torso */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.42, 0.56, 0.24]} />
        <meshStandardMaterial color={cfg.shirt} roughness={0.85} />
      </mesh>
      {/* Legs */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.36, 0.65, 0.24]} />
        <meshStandardMaterial color="#1f232b" roughness={0.9} />
      </mesh>
      {/* Articulated Eating Arm */}
      <mesh ref={armRef} position={[0.26, 1.15, 0.12]}>
        <boxGeometry args={[0.12, 0.44, 0.12]} />
        <meshStandardMaterial color={cfg.shirt} roughness={0.85} />
      </mesh>
      {/* Head + Uncanny Eyes That Snap Straight Toward the Player */}
      <group ref={headRef} position={[0, 1.58, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.155, 12, 12]} />
          <meshStandardMaterial color={stare ? '#c2b9ad' : '#d4b499'} roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.06, -0.02]}>
          <sphereGeometry args={[0.158, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#161414" roughness={0.9} />
        </mesh>
        {[-0.052, 0.052].map((ex, i) => (
          <mesh key={i} position={[ex, 0.015, 0.142]}>
            <sphereGeometry args={[stare ? 0.028 : 0.017, 8, 8]} />
            <meshBasicMaterial color={stare ? '#f5f2e6' : '#141212'} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function PulsingOrganicVeins() {
  const veinsRef = useRef();

  const veinGeometries = useMemo(() => {
    const paths = [
      [[-2.2, 0.1, -3.2], [-2.1, 1.2, -2.5], [-1.9, 2.3, -1.8], [-0.4, 2.7, -1.2], [1.6, 2.55, -0.8]],
      [[1.9, 0.05, 3.1], [1.85, 1.3, 2.7], [1.65, 2.4, 1.8], [0.2, 2.65, 0.8], [-1.4, 2.2, 0.2]],
      [[-1.8, 0.1, 1.5], [-1.2, 0.85, 0.9], [-0.2, 1.05, 0.2], [0.6, 0.95, -0.9], [1.3, 0.12, -2.1]],
      [[1.9, 0.05, -3.2], [1.75, 1.1, -2.9], [1.9, 2.2, -2.5], [0.6, 2.6, -2.2], [-1.2, 2.4, -2.6]],
      [[-2.0, 0.1, -0.2], [-1.7, 1.4, 0.1], [-0.8, 2.5, 0.4], [0.9, 2.55, 1.6], [1.8, 1.4, 2.8]],
    ];
    return paths.map((pts, idx) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
      return new THREE.TubeGeometry(curve, 24, 0.075 + (idx % 2) * 0.03, 7, false);
    });
  }, []);

  useFrame(({ clock }) => {
    if (!veinsRef.current) return;
    const pulse = 1.0 + Math.sin(clock.getElapsedTime() * 3.8) * 0.07;
    veinsRef.current.children.forEach((m, i) => {
      const s = 1 + Math.sin(clock.getElapsedTime() * 4.2 + i * 1.1) * 0.09;
      m.scale.set(pulse, s, pulse);
      if (m.material) m.material.emissiveIntensity = 0.45 + Math.sin(clock.getElapsedTime() * 4.5 + i) * 0.28;
    });
  });

  return (
    <group ref={veinsRef}>
      {veinGeometries.map((geom, i) => (
        <mesh key={i} geometry={geom}>
          <meshStandardMaterial
            color="#2b080c"
            emissive="#6e0e18"
            emissiveIntensity={0.55}
            roughness={0.32}
            metalness={0.18}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function PhantomStall3D({ dinersStare = false, revealed = false }) {
  const { x, z, rotY } = LANDMARK_TRANSFORMS.phantomStall;
  const illusionGroupRef = useRef();
  const veinsGroupRef = useRef();
  const bulbMatsRef = useRef([]);
  const awningMatRef = useRef();

  // Pure ref positioning (parked at y=-50) + emissiveIntensity glow (0 dynamic 3D lights -> 0ms shader compile!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (illusionGroupRef.current) illusionGroupRef.current.position.y = revealed ? -50 : 0;
    if (veinsGroupRef.current) veinsGroupRef.current.position.y = revealed ? 0 : -50;

    const flicker = dinersStare ? (Math.sin(t * 28) > -0.25 ? 2.4 : 0.45) : 3.2;
    for (let i = 0; i < bulbMatsRef.current.length; i += 1) {
      const mat = bulbMatsRef.current[i];
      if (mat) mat.emissiveIntensity = revealed ? 0 : flicker;
    }
    if (awningMatRef.current) {
      awningMatRef.current.emissiveIntensity = revealed ? 0.04 : dinersStare ? flicker * 0.22 : 0.55;
    }
  });

  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <group>
        {/* Floor Slab & Rotted / Warm Wooden Roof */}
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[5.4, 0.12, 8.2]} />
          <meshLambertMaterial color={revealed ? '#1a1716' : '#4a3d31'} />
        </mesh>
        <mesh position={[0.1, 2.82, 0]} rotation={[0, 0, revealed ? 0.14 : -0.1]}>
          <boxGeometry args={[5.8, 0.16, 8.6]} />
          <meshStandardMaterial
            ref={awningMatRef}
            color={revealed ? '#1b1615' : '#633728'}
            emissive="#ff9f43"
            emissiveIntensity={0.55}
            roughness={0.85}
          />
        </mesh>
        {/* Wooden Support Posts */}
        {[[-2.1, -3.5], [1.9, -3.5], [-2.1, 3.5], [1.9, 3.5]].map(([px, pz], i) => (
          <mesh key={i} position={[px, 1.42, pz]} rotation={[0, 0, revealed && i === 1 ? 0.12 : 0]}>
            <boxGeometry args={[0.2, 2.8, 0.2]} />
            <meshLambertMaterial color={revealed ? '#211917' : '#4f3522'} />
          </mesh>
        ))}
        {/* Back Wall & Cooking Counter */}
        <mesh position={[-2.1, 1.42, 0]}>
          <boxGeometry args={[0.18, 2.75, 7.2]} />
          <meshLambertMaterial color={revealed ? '#181414' : '#573c28'} />
        </mesh>
        <mesh position={[-0.75, 0.56, 0]}>
          <boxGeometry args={[1.15, 0.96, 5.4]} />
          <meshLambertMaterial color={revealed ? '#1c1715' : '#6e4c32'} />
        </mesh>

        {/* PHASE A: Always visible=true (parked at y=-50 via ref on reveal; emissive-only glow, zero lights!) */}
        <group ref={illusionGroupRef}>
          {[-2.4, -0.8, 0.8, 2.4].map((bz, i) => (
            <mesh key={i} position={[1.45, 2.52, bz]}>
              <sphereGeometry args={[0.13, 10, 10]} />
              <meshStandardMaterial
                ref={(el) => { bulbMatsRef.current[i] = el; }}
                color={dinersStare ? '#ffd29e' : '#ffe59c'}
                emissive={dinersStare ? '#ff9d52' : '#ffcf66'}
                emissiveIntensity={3.2}
                roughness={0.2}
              />
            </mesh>
          ))}
          <ModelAsset url={MODELS.roundTable} position={[2.25, 0.1, -0.6]} targetHeight={0.78} />
          <ModelAsset url={MODELS.roundTable} position={[2.35, 0.1, 1.65]} targetHeight={0.78} />
          {[[-0.6, 2.25], [1.65, 2.35]].map(([tz, tx], idx) => (
            <mesh key={idx} position={[tx, 0.9, tz]}>
              <cylinderGeometry args={[0.2, 0.16, 0.04, 12]} />
              <meshLambertMaterial color="#ede8dd" />
            </mesh>
          ))}
          {DINER_CONFIGS.map((cfg) => (
            <UncannyDiner key={cfg.id} cfg={cfg} stare={dinersStare} />
          ))}
        </group>

        {/* PHASE B: Pitch-Dark Rotted Reality Veins (always visible=true, parked at y=-50 via ref until reveal!) */}
        <group ref={veinsGroupRef} position={[0, -50, 0]}>
          <PulsingOrganicVeins />
        </group>
      </group>
    </group>
  );
}
