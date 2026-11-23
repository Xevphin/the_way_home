// ============================================================================
// src/components/SeatedCharacter3D.jsx
// Clean seated articulated character matching ArticulatedCharacter's exact
// stylized proportions (same head, hair cap & simple dark eyes — no white
// sclera rings) with proper 90-degree seated thighs/shins and both full arms
// resting naturally on the lap so characters sit ON TOP of sofa cushions
// with zero phasing into the couch or coffee table.
// ============================================================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function SeatedCharacter3D({
  position = [0, 0, 0],
  rotationY = 0,
  shirtColor = '#3b4d66',
  sleeveColor = '#324259',
  pantsColor = '#27313d',
  skinColor = '#d9a67c',
  hairColor = '#1f1b18',
  isTalking = false,
}) {
  const headRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const torsoRef = useRef();

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);
    const lerp = Math.min(1, dt * 8);

    if (torsoRef.current) {
      torsoRef.current.position.y = 0.78 + Math.sin(t * 2.0) * 0.006;
    }

    if (headRef.current) {
      const nod = isTalking ? Math.sin(t * 3.2) * 0.065 : Math.sin(t * 1.4) * 0.015;
      const turn = isTalking ? Math.sin(t * 1.8) * 0.08 : 0;
      headRef.current.rotation.x += (nod - headRef.current.rotation.x) * lerp;
      headRef.current.rotation.y += (turn - headRef.current.rotation.y) * lerp;
    }

    if (leftArmRef.current) {
      const targetX = isTalking ? -0.52 + Math.sin(t * 3.8) * 0.12 : -0.44;
      leftArmRef.current.rotation.x += (targetX - leftArmRef.current.rotation.x) * lerp;
    }
    if (rightArmRef.current) {
      const targetX = isTalking ? -0.56 + Math.cos(t * 3.5) * 0.13 : -0.44;
      rightArmRef.current.rotation.x += (targetX - rightArmRef.current.rotation.x) * lerp;
    }
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Hips / Pelvis Resting Cleanly ON TOP of Seat Cushion (y = 0.48) */}
      <mesh position={[0, 0.48, 0.04]} castShadow>
        <boxGeometry args={[0.46, 0.15, 0.32]} />
        <meshStandardMaterial color={pantsColor} roughness={0.85} />
      </mesh>

      {/* Proper 90-Degree Seated Legs: Horizontal Thighs + Vertical Shins + Shoes */}
      {[-0.14, 0.14].map((lx, idx) => (
        <group key={idx} position={[lx, 0.48, 0.06]}>
          {/* Thigh extending horizontally forward (+Z) across cushion */}
          <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.095, 0.088, 0.42, 10]} />
            <meshStandardMaterial color={pantsColor} roughness={0.85} />
          </mesh>
          {/* Knee joint */}
          <mesh position={[0, -0.01, 0.4]}>
            <sphereGeometry args={[0.086, 10, 10]} />
            <meshStandardMaterial color={pantsColor} roughness={0.85} />
          </mesh>
          {/* Shin bending 90 degrees straight down toward floor rug */}
          <mesh position={[0, -0.22, 0.4]} castShadow>
            <cylinderGeometry args={[0.082, 0.072, 0.42, 10]} />
            <meshStandardMaterial color={pantsColor} roughness={0.85} />
          </mesh>
          {/* Shoe resting cleanly flat on the rug (y = 0.045) */}
          <mesh position={[0, -0.435, 0.45]}>
            <boxGeometry args={[0.14, 0.08, 0.23]} />
            <meshStandardMaterial color="#1f2329" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Upper Body Group (Torso + Full Articulated Arms + Matching Clean Head) */}
      <group ref={torsoRef} position={[0, 0.78, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.48, 0.6, 0.26]} />
          <meshStandardMaterial color={shirtColor} roughness={0.82} />
        </mesh>

        {/* Both Full Arms (Upper Arm -> Bent Forearm -> Hand Resting on Lap) */}
        {[
          { side: -1, ref: leftArmRef },
          { side: 1, ref: rightArmRef },
        ].map(({ side, ref }) => (
          <group
            key={side}
            ref={ref}
            position={[side * 0.27, 0.22, 0]}
            rotation={[-0.44, 0, side * -0.1]}
          >
            <mesh>
              <sphereGeometry args={[0.082, 10, 10]} />
              <meshStandardMaterial color={sleeveColor} roughness={0.82} />
            </mesh>
            <mesh position={[side * 0.01, -0.17, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.062, 0.34, 8]} />
              <meshStandardMaterial color={sleeveColor} roughness={0.82} />
            </mesh>
            {/* Bent Forearm & Hand Resting Naturally Forward Over Lap */}
            <group position={[side * 0.01, -0.34, 0]} rotation={[-0.85, side * -0.22, 0]}>
              <mesh position={[0, -0.13, 0]} castShadow>
                <cylinderGeometry args={[0.058, 0.052, 0.28, 8]} />
                <meshStandardMaterial color={sleeveColor} roughness={0.82} />
              </mesh>
              <mesh position={[0, -0.29, 0]}>
                <sphereGeometry args={[0.062, 10, 10]} />
                <meshStandardMaterial color={skinColor} roughness={0.75} />
              </mesh>
            </group>
          </group>
        ))}

        {/* Matching Clean Stylized Head, Hair Cap & Simple Dark Eyes (No White Sclera!) */}
        <group ref={headRef} position={[0, 0.46, 0.02]}>
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
    </group>
  );
}
