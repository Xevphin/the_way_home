// ============================================================================
// src/components/ScavengeItems3D.jsx
// Renders the physical 3D meshes for the Folding Road Map, Spare Batteries,
// and Roadside Gate Key (with no floating 3D diamond markers).
// ============================================================================

import React from 'react';
import { SCAVENGE_ITEMS } from '../../data/chapter1/objectivesData';

export default function ScavengeItems3D({ progress }) {
  const hasItem = (id) => progress.collectedItems.includes(id);

  return (
    <group>
      {/* ITEM 1: Folding Road Map */}
      {!hasItem('item_map') && (
        <group position={SCAVENGE_ITEMS[0].position}>
          <mesh rotation={[-0.1, 0.35, 0]} castShadow>
            <boxGeometry args={[0.46, 0.03, 0.34]} />
            <meshStandardMaterial
              color="#dfd3b8"
              emissive="#8c7a56"
              emissiveIntensity={0.45}
            />
          </mesh>
        </group>
      )}

      {/* ITEM 2: Spare Batteries */}
      {!hasItem('item_batteries') && (
        <group position={SCAVENGE_ITEMS[1].position}>
          {[-0.08, 0.08].map((xOff, idx) => (
            <mesh
              key={idx}
              position={[xOff, 0.06, 0]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.05, 0.05, 0.22, 12]} />
              <meshStandardMaterial
                color="#d97724"
                metalness={0.7}
                roughness={0.3}
                emissive="#9c5114"
                emissiveIntensity={0.4}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* ITEM 3: Roadside Gate Key */}
      {!hasItem('item_gate_key') && (
        <group position={SCAVENGE_ITEMS[2].position}>
          <mesh position={[-0.08, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.07, 0.02, 8, 16]} />
            <meshStandardMaterial
              color="#f2c94c"
              metalness={0.85}
              roughness={0.25}
              emissive="#b88b14"
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[0.06, 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.2, 8]} />
            <meshStandardMaterial color="#f2c94c" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
      )}
    </group>
  );
}
