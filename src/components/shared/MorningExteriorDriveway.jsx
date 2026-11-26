// ============================================================================
// src/components/MorningExteriorDriveway.jsx
// Complete lived-in exterior neighborhood powered by Kenney .glb models:
// - Suburban houses (houseA/B/E), picket fences, streetlights, parked car
// - Player's sedan.glb parked cleanly in the driveway + living pedestrians
// ============================================================================

import React, { useMemo } from 'react';
import StalledSedan from './StalledSedan';
import TrafficCarModel from './TrafficCarModel';
import BackgroundNPCs from './BackgroundNPCs';
import ModelAsset from './ModelAsset';
import { HOUSE_VARIANTS, MODELS } from '../../data/shared/modelCatalog';

export default function MorningExteriorDriveway({ nightMode = false }) {
  const neighborhoodNPCs = useMemo(
    () => [
      {
        id: 'walker_1',
        pos: [-16, -0.08, -17.6],
        endPos: [16, -0.08, -17.6],
        speed: 0.14,
        shirt: '#3b6998',
        pants: '#2c3542',
      },
      {
        id: 'walker_2',
        pos: [14, -0.08, -25.2],
        endPos: [-14, -0.08, -25.2],
        speed: 0.12,
        shirt: '#8c4a3b',
        pants: '#323842',
      },
      {
        id: 'neighbor_chat_1',
        pos: [-10.2, -0.08, -17.6],
        rotY: 1.5,
        shirt: '#487a5b',
        talking: true,
      },
      {
        id: 'neighbor_chat_2',
        pos: [-8.8, -0.08, -17.6],
        rotY: -1.5,
        shirt: '#c48b3b',
        talking: true,
      },
    ],
    []
  );

  return (
    <group>
      {/* Player's House Pitched Main Roof & Front Porch Roof Overhang */}
      <mesh position={[0, 4.65, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[10.2, 3.1, 4]} />
        <meshStandardMaterial color="#7d412c" roughness={0.8} />
      </mesh>
      <mesh position={[3.2, 3.15, -8.2]} castShadow receiveShadow>
        <boxGeometry args={[7.4, 0.22, 4.6]} />
        <meshStandardMaterial color="#e8dfd3" roughness={0.82} />
      </mesh>
      <mesh position={[3.2, 3.45, -8.2]}>
        <boxGeometry args={[7.6, 0.38, 4.8]} />
        <meshStandardMaterial color="#6e3926" roughness={0.8} />
      </mesh>

      {/* Concrete Driveway Slab & Sidewalk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.2, -0.08, -13.5]} receiveShadow>
        <planeGeometry args={[5.4, 14.0]} />
        <meshStandardMaterial color="#b7b4ad" roughness={0.88} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, -17.6]} receiveShadow>
        <planeGeometry args={[74, 1.8]} />
        <meshStandardMaterial color="#c9c4ba" roughness={0.85} />
      </mesh>

      {/* Suburban Asphalt Street & Dashed Centerline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -21.5]} receiveShadow>
        <planeGeometry args={[78, 7.4]} />
        <meshStandardMaterial color="#363c46" roughness={0.86} />
      </mesh>
      {[-18, -12, -6, 0, 6, 12, 18].map((dz) => (
        <mesh key={dz} rotation={[-Math.PI / 2, 0, 0]} position={[dz, -0.085, -21.5]}>
          <planeGeometry args={[3.2, 0.16]} />
          <meshBasicMaterial color="#e6be4c" />
        </mesh>
      ))}

      {/* Real Kenney Picket Fencing Along Front Yard */}
      {[-5.2, -1.6, 9.6].map((fx, i) => (
        <ModelAsset
          key={i}
          url={MODELS.picketFence}
          position={[fx, -0.08, -16.6]}
          targetWidth={3.4}
        />
      ))}

      {/* Real Kenney Suburban Neighboring Houses (Flush on Ground) */}
      {[
        { x: -14.8, z: -2.5, rot: 0, idx: 0 },
        { x: 17.5, z: -2.5, rot: 0, idx: 1 },
        { x: -8.5, z: -31.0, rot: Math.PI, idx: 2 },
        { x: 8.5, z: -31.0, rot: Math.PI, idx: 0 },
      ].map((nh, i) => (
        <ModelAsset
          key={i}
          url={HOUSE_VARIANTS[nh.idx]}
          position={[nh.x, -0.1, nh.z]}
          rotation={[0, nh.rot, 0]}
          targetHeight={6.6}
        />
      ))}

      {/* Real Kenney Curved Streetlights & Parked Neighbor Car */}
      {[-9.5, 9.5].map((lx, i) => (
        <ModelAsset
          key={i}
          url={MODELS.streetlight}
          position={[lx, -0.1, -17.2]}
          rotation={[0, Math.PI, 0]}
          targetHeight={5.6}
        />
      ))}
      <TrafficCarModel
        variantIndex={1}
        position={[-11.8, -0.08, -19.2]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* Player's Real Sedan.glb Parked in Driveway */}
      <StalledSedan
        position={[5.2, -0.08, -12.4]}
        rotation={[0, 0, 0]}
        isDented={nightMode}
        headlightPower={nightMode ? 0.55 : 0}
        hazardsOn={false}
      />

      {/* Living Background Pedestrians (Daytime Only) */}
      {!nightMode && <BackgroundNPCs npcs={neighborhoodNPCs} />}
    </group>
  );
}
