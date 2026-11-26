// ============================================================================
// src/components/BackgroundNPCs.jsx
// Renders living background pedestrians using ArticulatedCharacter:
// - Walkers patrolling smoothly between startPos and endPos with full
//   sinusoidal limb swing & step bob
// - Stationary/chatting pedestrians standing at stalls, sidewalks, or campus
// ============================================================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ArticulatedCharacter from './ArticulatedCharacter';

function SingleNPC({ npc, index }) {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (!groupRef.current || !npc.endPos) return;
    const t = clock.getElapsedTime() * (npc.speed || 0.35) + (npc.phase || index * 1.3);
    // Triangle wave 0 -> 1 -> 0 for smooth back-and-forth sidewalk walking
    const cycle = t % 2;
    const u = cycle <= 1 ? cycle : 2 - cycle;
    const forwardDir = cycle <= 1 ? 1 : -1;

    const x = THREE.MathUtils.lerp(npc.pos[0], npc.endPos[0], u);
    const z = THREE.MathUtils.lerp(npc.pos[2], npc.endPos[2], u);
    groupRef.current.position.set(x, npc.pos[1] || 0, z);

    const dx = (npc.endPos[0] - npc.pos[0]) * forwardDir;
    const dz = (npc.endPos[2] - npc.pos[2]) * forwardDir;
    groupRef.current.rotation.y = Math.atan2(dx, dz);
  });

  const isWalker = Boolean(npc.endPos);

  return (
    <group
      ref={groupRef}
      position={npc.pos}
      rotation={[0, npc.rotY || 0, 0]}
    >
      <ArticulatedCharacter
        shirtColor={npc.shirt || '#3b6e8c'}
        sleeveColor={npc.sleeve || npc.shirt || '#325f7a'}
        pantsColor={npc.pants || '#2c3540'}
        skinColor={npc.skin || '#d9a67c'}
        hairColor={npc.hair || '#1c1917'}
        isWalking={isWalker}
        isTalking={Boolean(npc.talking)}
        isWaving={Boolean(npc.waving)}
      />
    </group>
  );
}

export default function BackgroundNPCs({ npcs = [] }) {
  return (
    <group>
      {npcs.map((npc, idx) => (
        <SingleNPC key={npc.id || idx} npc={npc} index={idx} />
      ))}
    </group>
  );
}
