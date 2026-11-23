// ============================================================================
// src/components/ShadowStalkerModel.jsx
// Visual-only mesh for the Evil Spirit: tall gaunt floating dark shroud,
// hunched mantle, gaunt face with gaping mouth, faint glowing eyes, long
// drooping arms, and trailing shadow wisps. Animates its own twitching.
// Used by ShadowStalker.jsx (AI) and JumpscareLunge3D.jsx (jumpscare).
// ============================================================================

import React, { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const ShadowStalkerModel = forwardRef(function ShadowStalkerModel(
  { shroudMatRef, frenzy = false, eyeColor = '#ffbe8a', eyeScale = 1, ...rest },
  ref
) {
  const headRef = useRef();
  const wispsRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Unnatural head twitching (constant and violent while in frenzy)
    if (headRef.current) {
      const twitching = frenzy || Math.sin(t * 3.1) > 0.86;
      const speed = frenzy ? 90 : 48;
      const amp = frenzy ? 0.55 : 0.36;
      headRef.current.rotation.z = twitching
        ? Math.sin(t * speed) * amp
        : Math.sin(t * 1.4) * 0.08;
      headRef.current.rotation.x = twitching
        ? 0.2 + (frenzy ? Math.sin(t * 70) * 0.25 : 0)
        : 0.06;
    }

    // Trailing shadow wisps drifting behind the shroud
    if (wispsRef.current) {
      wispsRef.current.children.forEach((wisp, idx) => {
        wisp.position.x = Math.sin(t * 2.1 + idx * 1.5) * 0.36;
        wisp.position.y = 0.7 + idx * 0.48 + Math.cos(t * 2.6 + idx) * 0.14;
        wisp.position.z = -0.35 - idx * 0.12 + Math.sin(t * 1.8 + idx) * 0.15;
      });
    }
  });

  return (
    <group ref={ref} {...rest}>
      {/* Tall Tattered Lower Shroud (open cone, double-sided) */}
      <mesh position={[0, 1.35, 0]}>
        <coneGeometry args={[0.68, 2.7, 9, 1, true]} />
        <meshStandardMaterial
          ref={shroudMatRef}
          color="#040508"
          roughness={1}
          transparent
          opacity={0.94}
          side={2}
        />
      </mesh>

      {/* Gaunt Inner Torso */}
      <mesh position={[0, 1.95, 0.04]}>
        <cylinderGeometry args={[0.24, 0.14, 1.4, 8]} />
        <meshStandardMaterial color="#020305" roughness={1} />
      </mesh>

      {/* Hunched Bony Shoulders & Hooded Mantle */}
      <mesh position={[0, 2.55, 0.06]} scale={[1.45, 0.72, 0.82]}>
        <sphereGeometry args={[0.34, 10, 10]} />
        <meshStandardMaterial color="#05060a" roughness={1} />
      </mesh>

      {/* Twitching Head: hood, gaunt face, gaping mouth & glowing eyes */}
      <group ref={headRef} position={[0, 2.95, 0.12]}>
        <mesh scale={[0.85, 1.15, 0.95]}>
          <sphereGeometry args={[0.26, 12, 12]} />
          <meshStandardMaterial color="#020305" roughness={1} />
        </mesh>
        {/* Sunken grey-ash face plate under the cowl */}
        <mesh position={[0, -0.03, 0.15]} scale={[0.62, 0.95, 0.4]}>
          <sphereGeometry args={[0.24, 12, 12]} />
          <meshStandardMaterial color="#2a2c31" roughness={0.95} />
        </mesh>
        {/* Elongated gaping black mouth */}
        <mesh position={[0, -0.15, 0.24]} scale={[0.55, 1.5, 0.3]}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Faint piercing eyes deep in the sockets */}
        {[-0.075, 0.075].map((xOff, i) => (
          <mesh key={i} position={[xOff, 0.03, 0.24]} scale={eyeScale}>
            <sphereGeometry args={[0.024, 8, 8]} />
            <meshBasicMaterial color={eyeColor} />
          </mesh>
        ))}
      </group>

      {/* Elongated Drooping Arms */}
      {[-0.5, 0.5].map((xOff, i) => (
        <group
          key={i}
          position={[xOff, 2.38, 0.08]}
          rotation={[0.42, 0, xOff < 0 ? 0.16 : -0.16]}
        >
          <mesh position={[0, -0.78, 0]}>
            <cylinderGeometry args={[0.055, 0.025, 1.65, 7]} />
            <meshStandardMaterial color="#030407" roughness={1} />
          </mesh>
        </group>
      ))}

      {/* Trailing Shadow Wisps */}
      <group ref={wispsRef}>
        {[0, 1, 2, 3].map((idx) => (
          <mesh key={idx} position={[0, 0.8 + idx * 0.45, -0.4]}>
            <sphereGeometry args={[0.24 - idx * 0.03, 8, 8]} />
            <meshStandardMaterial
              color="#070a10"
              transparent
              opacity={0.48}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
});

export default ShadowStalkerModel;
