// ============================================================================
// src/components/EscapeChaseEnvironment.jsx
// Static & hazard 3D scenery for the Chapter 1 Escape Chase corridor:
// - Wet midnight forest highway, dashed road lines, dense tree corridor
// - Distant golden Valley Boundary glow marking the finish threshold
// - Patterned road hazards: fallen logs, jagged boulders, eerie mist bodies,
//   and dynamic lunging shadow apparitions!
// ============================================================================

import React, { useMemo } from 'react';
import ShadowStalkerModel from './ShadowStalkerModel';
import NightSkyDome from './NightSkyDome';
import RainMistStreaks3D from './RainMistStreaks3D';
import ModelAsset from './ModelAsset';
import { FOREST_TREE_VARIANTS, MODELS } from '../data/modelCatalog';
import {
  CHASE_DISTANCE,
  CHASE_HAZARDS,
  buildChaseTreeCorridor,
} from '../data/escapeChaseData';

function ChaseHazardProp({ hazard, innerRef }) {
  if (hazard.type === 'log') {
    return (
      <group position={[hazard.x, 0, hazard.z]}>
        <ModelAsset url={MODELS.fallenLog} rotation={[0, Math.PI / 2, 0]} targetWidth={1.95} />
      </group>
    );
  }
  if (hazard.type === 'boulder') {
    return (
      <group position={[hazard.x, 0, hazard.z]}>
        <ModelAsset url={MODELS.rockLargeA} targetHeight={1.12} />
      </group>
    );
  }
  if (hazard.type === 'body') {
    return (
      <group position={[hazard.x, 0, hazard.z]}>
        <mesh position={[0, 0.92, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.34, 1.84, 8]} />
          <meshStandardMaterial color="#0b0f17" roughness={0.95} />
        </mesh>
        <mesh position={[0, 1.98, 0]}>
          <sphereGeometry args={[0.2, 10, 10]} />
          <meshStandardMaterial color="#181c24" roughness={0.92} />
        </mesh>
        <mesh position={[-0.06, 2.02, 0.17]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshBasicMaterial color="#e8f1ff" />
        </mesh>
        <mesh position={[0.06, 2.02, 0.17]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshBasicMaterial color="#e8f1ff" />
        </mesh>
      </group>
    );
  }
  return (
    <group ref={innerRef} position={[hazard.x, 0, hazard.z]}>
      <ShadowStalkerModel scale={0.78} frenzy={true} eyeColor="#ff5a5a" eyeScale={1.35} />
    </group>
  );
}

export default function EscapeChaseEnvironment({ lungeRefs }) {
  const trees = useMemo(() => buildChaseTreeCorridor(), []);
  const roadStripes = useMemo(() => Array.from({ length: 62 }, (_, i) => 6 - i * 8), []);

  return (
    <>
      <color attach="background" args={['#04070e']} />
      <fog attach="fog" args={['#060b14', 10, 74]} />
      <NightSkyDome />
      <RainMistStreaks3D count={62} speed={16.5} opacity={0.3} streakLength={1.05} color="#d6e8ff" />
      <ambientLight intensity={0.42} color="#344a6e" />
      <directionalLight position={[18, 30, 12]} intensity={0.48} color="#7698c9" />

      {/* Fog-Choked Wet Asphalt Highway & Grass Shoulders */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, -225]} receiveShadow>
        <planeGeometry args={[120, 560]} />
        <meshStandardMaterial color="#0b120e" roughness={0.98} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -225]} receiveShadow>
        <planeGeometry args={[9.2, 540]} />
        <meshStandardMaterial color="#181d25" roughness={0.46} metalness={0.14} />
      </mesh>
      {roadStripes.map((sz) => (
        <mesh key={sz} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, sz]}>
          <planeGeometry args={[0.16, 3.4]} />
          <meshBasicMaterial color="#bfa34e" />
        </mesh>
      ))}

      {/* Dense Midnight Forest Corridor */}
      {trees.map((tr) => (
        <ModelAsset
          key={tr.id}
          url={FOREST_TREE_VARIANTS[tr.variant]}
          position={tr.pos}
          rotation={[0, tr.rotY, 0]}
          targetHeight={tr.height}
        />
      ))}

      {/* Distant Golden Sanctuary Glow Marking the Valley Boundary Exit */}
      <group position={[0, 0, -CHASE_DISTANCE - 8]}>
        <pointLight position={[0, 4.5, 0]} color="#ffde8a" intensity={24} distance={65} />
        <mesh position={[0, 4.2, 0]}>
          <sphereGeometry args={[4.4, 20, 16]} />
          <meshBasicMaterial color="#ffe8a3" transparent opacity={0.22} />
        </mesh>
      </group>

      {/* Road Hazards: Fallen Logs, Jagged Boulders, Mist Silhouettes, Lunging Shadows */}
      {CHASE_HAZARDS.map((h) => (
        <ChaseHazardProp
          key={h.id}
          hazard={h}
          innerRef={(el) => {
            lungeRefs.current[h.id] = el;
          }}
        />
      ))}
    </>
  );
}
