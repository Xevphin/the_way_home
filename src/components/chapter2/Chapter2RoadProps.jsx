// ============================================================================
// src/components/chapter2/Chapter2RoadProps.jsx
// 100% procedural 3D props for Chapter 2's 200m Endless Route 312 Road:
// - Reuses Chapter 1's exact MalaysianSignboard3D (312 Lembah Batu) beside spawn
// - High-contrast blood-spattered victim bodies with glossy #7a0808 blood pools
// - Solitary standing wooden door at the end of the endless mist road (z = -200)
// ============================================================================

import React from 'react';
import LembahBatuWelcomeSign3D from '../shared/LembahBatuWelcomeSign3D';
import { CH2_DOOR_Z, CH2_VICTIM_MILESTONES } from '../../data/chapter2/chapter2Data';

function VictimBody({ pos, rotY, puddleScale, shirtColor }) {
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* Glossy dark-crimson #7a0808 blood pools reflecting the flashlight beam */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} receiveShadow>
        <circleGeometry args={[1.05 * puddleScale, 18]} />
        <meshStandardMaterial color="#7a0808" roughness={0.14} metalness={0.22} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.52, 0.026, 0.42]} receiveShadow>
        <circleGeometry args={[0.52 * puddleScale, 14]} />
        <meshStandardMaterial color="#690606" roughness={0.16} metalness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.48, 0.026, -0.38]} receiveShadow>
        <circleGeometry args={[0.38 * puddleScale, 12]} />
        <meshStandardMaterial color="#7a0808" roughness={0.15} metalness={0.2} />
      </mesh>

      {/* Pale-shirted torso with crimson bloodstain contrast */}
      <mesh position={[0, 0.16, -0.08]} rotation={[Math.PI / 2, 0, 0.18]} castShadow>
        <capsuleGeometry args={[0.17, 0.56, 6, 10]} />
        <meshStandardMaterial color={shirtColor} roughness={0.86} />
      </mesh>
      <mesh position={[0.04, 0.29, -0.14]} rotation={[-Math.PI / 2, 0, 0.3]}>
        <circleGeometry args={[0.18, 10]} />
        <meshStandardMaterial color="#7a0808" roughness={0.22} />
      </mesh>

      {/* Pale head & splayed pale hands clearly visible in torchlight */}
      <mesh position={[0.06, 0.16, -0.56]} castShadow>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#b8b0a6" roughness={0.82} />
      </mesh>
      <mesh position={[0.42, 0.1, -0.22]} rotation={[0, 0.45, Math.PI / 2]}>
        <cylinderGeometry args={[0.048, 0.042, 0.64, 8]} />
        <meshStandardMaterial color={shirtColor} roughness={0.86} />
      </mesh>
      <mesh position={[0.72, 0.08, -0.35]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color="#b8b0a6" roughness={0.8} />
      </mesh>

      {/* Dark trousers / legs bent across the asphalt lane */}
      <mesh position={[-0.12, 0.12, 0.52]} rotation={[Math.PI / 2, 0, -0.18]}>
        <cylinderGeometry args={[0.075, 0.062, 0.78, 8]} />
        <meshStandardMaterial color="#252b36" roughness={0.9} />
      </mesh>
      <mesh position={[0.14, 0.12, 0.54]} rotation={[Math.PI / 2, 0, 0.24]}>
        <cylinderGeometry args={[0.075, 0.062, 0.76, 8]} />
        <meshStandardMaterial color="#252b36" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function Chapter2RoadProps({ spawnedCount = 0 }) {
  return (
    <group>
      {/* Weathered "WELCOME TO LEMBAH BATU" Roadside Sign Placed Off the Road Shoulder (x = +6.5) */}
      <LembahBatuWelcomeSign3D position={[6.5, 0, -9.5]} rotation={[0, -0.45, 0]} />

      {/* Blood-Spattered Victim Bodies Spawned Progressively After Credits Finish */}
      {CH2_VICTIM_MILESTONES.slice(0, spawnedCount).map((v) => (
        <VictimBody
          key={v.id}
          pos={v.pos}
          rotY={v.rotY}
          puddleScale={v.puddleScale}
          shirtColor={v.shirtColor}
        />
      ))}

      {/* Solitary Standing Wooden Door at the End of the 200m Endless Road */}
      <group position={[0, 0, CH2_DOOR_Z]}>
        <mesh position={[0, 1.5, 0]} receiveShadow>
          <boxGeometry args={[1.55, 3.0, 0.18]} />
          <meshStandardMaterial color="#1a110d" roughness={0.88} />
        </mesh>
        <mesh position={[0, 1.48, 0.06]} receiveShadow>
          <boxGeometry args={[1.28, 2.78, 0.12]} />
          <meshStandardMaterial color="#2e1d14" roughness={0.82} />
        </mesh>
        <mesh position={[0.48, 1.35, 0.15]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color="#c99c4a" metalness={0.8} roughness={0.3} />
        </mesh>
        <pointLight position={[0, 2.4, 2.4]} color="#c9363e" intensity={5.2} distance={20} />
      </group>
    </group>
  );
}
