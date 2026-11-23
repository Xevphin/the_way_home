// ============================================================================
// src/components/TrafficCarModel.jsx
// Renders a real Kenney Car Kit .glb vehicle grounded flush at y = 0, facing
// -Z forward, with optional glowing headlights and vivid red brake/taillights.
// ============================================================================

import React from 'react';
import ModelAsset from './ModelAsset';
import { TRAFFIC_VARIANTS } from '../data/modelCatalog';

export default function TrafficCarModel({
  variantIndex = 0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  lightsOn = false,
  braking = false,
}) {
  const url = TRAFFIC_VARIANTS[Math.abs(variantIndex) % TRAFFIC_VARIANTS.length];

  return (
    <group position={position} rotation={rotation}>
      {/* Kenney Car Kit vehicles face +Z natively -> rotate Math.PI to face -Z */}
      <ModelAsset
        url={url}
        rotation={[0, Math.PI, 0]}
        targetLength={4.25}
      />

      {/* Optional Glowing Headlights (Front = -Z) & Red Tail/Brake Lights (Rear = +Z) */}
      {lightsOn &&
        [-0.62, 0.62].map((hx, i) => (
          <mesh key={`h_${i}`} position={[hx, 0.56, -2.14]}>
            <boxGeometry args={[0.28, 0.13, 0.05]} />
            <meshBasicMaterial color="#fff7d6" />
          </mesh>
        ))}

      {(lightsOn || braking) &&
        [-0.64, 0.64].map((bx, i) => (
          <mesh key={`b_${i}`} position={[bx, 0.62, 2.15]}>
            <boxGeometry args={[0.34, 0.14, 0.06]} />
            <meshStandardMaterial
              color="#ff2222"
              emissive="#ff1111"
              emissiveIntensity={braking ? 4.8 : 2.2}
            />
          </mesh>
        ))}
    </group>
  );
}
