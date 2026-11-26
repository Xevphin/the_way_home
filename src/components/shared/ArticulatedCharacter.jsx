// ============================================================================
// src/components/ArticulatedCharacter.jsx
// Reusable articulated 3D human character (used for Friend 1 Amir & Friend 2
// Hakim) with pivoted legs, arms, torso, and head supporting:
// - Sinusoidal leg & opposite-arm walking cycle + vertical step bob
// - Friendly greeting/goodbye waving
// - Expressive idle breathing, head nods, and talking hand gestures
// ============================================================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function ArticulatedCharacter({
  shirtColor = '#c45c3e',
  sleeveColor = '#b55135',
  pantsColor = '#2b3d54',
  skinColor = '#d9a67c',
  hairColor = '#1f1b18',
  isWalking = false,
  isWaving = false,
  isTalking = false,
}) {
  const bodyRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const headRef = useRef();

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);
    const lerp = Math.min(1, dt * 10);

    // Subtle vertical step bob while walking, gentle idle breathing otherwise
    if (bodyRef.current) {
      const targetY = isWalking
        ? Math.abs(Math.sin(t * 7.6)) * 0.055
        : Math.sin(t * 2.1) * 0.012;
      bodyRef.current.position.y += (targetY - bodyRef.current.position.y) * lerp;
    }

    // Sinusoidal opposing leg swing during walking
    const legSwing = isWalking ? Math.sin(t * 7.6) * 0.52 : 0;
    if (leftLegRef.current) {
      leftLegRef.current.rotation.x += (legSwing - leftLegRef.current.rotation.x) * lerp;
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x += (-legSwing - rightLegRef.current.rotation.x) * lerp;
    }

    // Left arm: opposite walk swing OR subtle conversational gesture
    if (leftArmRef.current) {
      const targetX = isWalking
        ? -legSwing * 0.72
        : isTalking
        ? -0.32 + Math.sin(t * 4.2) * 0.16
        : 0;
      leftArmRef.current.rotation.x += (targetX - leftArmRef.current.rotation.x) * lerp;
      leftArmRef.current.rotation.z += (0.1 - leftArmRef.current.rotation.z) * lerp;
    }

    // Right arm: waving, opposite walk swing, OR expressive talking gesture
    if (rightArmRef.current) {
      const targetZ = isWaving ? 2.38 + Math.sin(t * 10.5) * 0.32 : -0.1;
      const targetX = isWaving
        ? 0.05
        : isWalking
        ? legSwing * 0.72
        : isTalking
        ? -0.38 + Math.cos(t * 3.8) * 0.18
        : 0;
      rightArmRef.current.rotation.z += (targetZ - rightArmRef.current.rotation.z) * lerp;
      rightArmRef.current.rotation.x += (targetX - rightArmRef.current.rotation.x) * lerp;
    }

    // Head subtle nod & look-around while talking
    if (headRef.current) {
      const nodX = isTalking ? Math.sin(t * 3.4) * 0.08 : 0;
      const turnY = isTalking ? Math.sin(t * 1.9) * 0.1 : 0;
      headRef.current.rotation.x += (nodX - headRef.current.rotation.x) * lerp;
      headRef.current.rotation.y += (turnY - headRef.current.rotation.y) * lerp;
    }
  });

  return (
    <group ref={bodyRef}>
      {/* Pivoted Left Leg (hip pivot at y = 0.86) */}
      <group ref={leftLegRef} position={[-0.14, 0.86, 0]}>
        <mesh position={[0, -0.43, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.085, 0.86, 10]} />
          <meshStandardMaterial color={pantsColor} roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.84, 0.05]}>
          <boxGeometry args={[0.15, 0.09, 0.24]} />
          <meshStandardMaterial color="#1f2329" roughness={0.8} />
        </mesh>
      </group>

      {/* Pivoted Right Leg (hip pivot at y = 0.86) */}
      <group ref={rightLegRef} position={[0.14, 0.86, 0]}>
        <mesh position={[0, -0.43, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.085, 0.86, 10]} />
          <meshStandardMaterial color={pantsColor} roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.84, 0.05]}>
          <boxGeometry args={[0.15, 0.09, 0.24]} />
          <meshStandardMaterial color="#1f2329" roughness={0.8} />
        </mesh>
      </group>

      {/* Torso / Jacket */}
      <mesh position={[0, 1.18, 0]} castShadow>
        <boxGeometry args={[0.48, 0.64, 0.27]} />
        <meshStandardMaterial color={shirtColor} roughness={0.82} />
      </mesh>

      {/* Pivoted Left Arm (shoulder joint at y = 1.41 + hand) */}
      <group ref={leftArmRef} position={[-0.27, 1.41, 0]}>
        <mesh>
          <sphereGeometry args={[0.085, 10, 10]} />
          <meshStandardMaterial color={sleeveColor} roughness={0.82} />
        </mesh>
        <mesh position={[-0.02, -0.26, 0]} castShadow>
          <cylinderGeometry args={[0.072, 0.062, 0.52, 8]} />
          <meshStandardMaterial color={sleeveColor} roughness={0.82} />
        </mesh>
        <mesh position={[-0.02, -0.54, 0]}>
          <sphereGeometry args={[0.065, 10, 10]} />
          <meshStandardMaterial color={skinColor} roughness={0.75} />
        </mesh>
      </group>

      {/* Pivoted Right Arm (shoulder joint at y = 1.41 + hand) */}
      <group ref={rightArmRef} position={[0.27, 1.41, 0]}>
        <mesh>
          <sphereGeometry args={[0.085, 10, 10]} />
          <meshStandardMaterial color={sleeveColor} roughness={0.82} />
        </mesh>
        <mesh position={[0.02, -0.26, 0]} castShadow>
          <cylinderGeometry args={[0.072, 0.062, 0.52, 8]} />
          <meshStandardMaterial color={sleeveColor} roughness={0.82} />
        </mesh>
        <mesh position={[0.02, -0.54, 0]}>
          <sphereGeometry args={[0.065, 10, 10]} />
          <meshStandardMaterial color={skinColor} roughness={0.75} />
        </mesh>
      </group>

      {/* Pivoted Head, Hair & Friendly Eyes */}
      <group ref={headRef} position={[0, 1.66, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.17, 14, 14]} />
          <meshStandardMaterial color={skinColor} roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.07, -0.02]}>
          <sphereGeometry args={[0.176, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
        {[-0.055, 0.055].map((ex, i) => (
          <mesh key={i} position={[ex, 0.02, 0.155]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
