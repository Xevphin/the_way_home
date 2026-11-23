// ============================================================================
// src/components/RuralRoadWorld.jsx
// Single Unified Chapter 1 Midnight Forest World on Route 312 Lembah Batu:
// - Extended from z = +90 (FM Radio driving approach) to z = -310 (Valley Exit)
// - Procedural wet-sheen asphalt + DenseForestFoliage (3-ring mixed trees,
//   bushes, ferns, rocks, stumps, fallen logs, dirt turnoffs & ground fog)
// - Scattered organic landmarks: Milestone KM 14, Abandoned Forestry Office,
//   Collapsed Bus Shelter, Phantom Roadside Stall, and Far Valley Descent
// ============================================================================

import React, { useMemo } from 'react';
import RoadsideProps from './RoadsideProps';
import DenseForestFoliage from './DenseForestFoliage';
import ForestryOffice3D from './ForestryOffice3D';
import RoadsideClues3D from './RoadsideClues3D';
import PhantomStall3D from './PhantomStall3D';
import ValleyStructures3D from './ValleyStructures3D';
import ForestLoreAndWatchtower3D from './ForestLoreAndWatchtower3D';
import SurauElderNPC from './SurauElderNPC';
import LembahBatuWelcomeSign3D from './LembahBatuWelcomeSign3D';
import RainMistStreaks3D from './RainMistStreaks3D';
import { getWetAsphaltMaps } from '../data/asphaltTextures';

export default function RuralRoadWorld({
  menuBright = false,
  memoRead = false,
  hasTornMap = false,
  hasCrowbar = false,
  cratePried = false,
  hasIronKey = false,
  shedUnlocked = false,
  hasBelt = false,
  hasBatteryCell = false,
  chestUnlocked = false,
  posterRead = false,
  newspaperRead = false,
  pamphletRead = false,
  elderTalking = false,
  windowScareActive = false,
  watchtowerScareActive = false,
  milestoneRead = false,
  shelterRead = false,
  dinersStare = false,
  stallRevealed = false,
}) {
  const wetMaps = useMemo(() => getWetAsphaltMaps(), []);

  const roadDashes = useMemo(() => {
    const arr = [];
    const maxZ = menuBright ? 18 : 118;
    const minZ = menuBright ? -90 : -302;
    for (let z = maxZ; z >= minZ; z -= 6.8) arr.push(z);
    return arr;
  }, [menuBright]);

  return (
    <group>
      {/* Thick Atmospheric Lembah Batu Night Fog & Cool Moonlight */}
      <color attach="background" args={[menuBright ? '#09101a' : '#050a12']} />
      <fogExp2
        attach="fog"
        args={[menuBright ? '#0d1624' : '#0a121d', menuBright ? 0.026 : 0.032]}
      />
      <ambientLight
        intensity={menuBright ? 0.64 : 0.34}
        color={menuBright ? '#7e99c4' : '#5e769e'}
      />
      <directionalLight
        position={[-16, 32, -22]}
        intensity={menuBright ? 1.1 : 0.62}
        color="#9bb8e6"
      />

      {/* Forest Earth Terrain (Lightweight Lambert material for smooth 60 FPS) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -98]}>
        <planeGeometry args={[180, 470]} />
        <meshLambertMaterial color="#0b130d" />
      </mesh>

      {/* Damp Wet-Sheen Rural Asphalt Road (440m Unified Approach + Exploration) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -95]}>
        <planeGeometry args={[8.6, 445]} />
        <meshStandardMaterial
          map={wetMaps.map}
          bumpMap={wetMaps.bumpMap}
          bumpScale={0.032}
          roughnessMap={wetMaps.roughnessMap}
          roughness={0.72}
          metalness={0.2}
        />
      </mesh>

      {/* Road Shoulder Lines & Dashed Centerline */}
      {[-3.95, 3.95].map((xPos, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[xPos, 0.022, -95]}>
          <planeGeometry args={[0.14, 435]} />
          <meshBasicMaterial color="#586475" />
        </mesh>
      ))}
      {roadDashes.map((zPos) => (
        <mesh key={zPos} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, zPos]}>
          <planeGeometry args={[0.16, 2.7]} />
          <meshBasicMaterial color="#9c8036" />
        </mesh>
      ))}

      {/* Guardrails, Reflectors & Utility Poles Behind Guardrail */}
      <RoadsideProps compactMenu={menuBright} />

      {/* Single Shared Weathered "WELCOME TO LEMBAH BATU" Signboard on Grass Verge Behind Guardrail */}
      <LembahBatuWelcomeSign3D position={[7.2, 0, -14.5]} rotation={[0.03, -0.32, 0.04]} />

      {/* Dense 3-Ring Forestry Woods, Undergrowth, Rocks, Logs, Dirt Turnoffs & Ground Fog */}
      <DenseForestFoliage compactMenu={menuBright} />

      {/* Scattered Chapter 1 Landmarks, Surau Elder NPC & Valley Structures */}
      {!menuBright && (
        <>
          <RainMistStreaks3D count={48} speed={10.2} opacity={0.28} streakLength={0.85} />
          <SurauElderNPC isTalking={elderTalking} />
          <ValleyStructures3D
            hasTornMap={hasTornMap}
            hasBelt={hasBelt}
            cratePried={cratePried}
            shedUnlocked={shedUnlocked}
            hasBatteryCell={hasBatteryCell}
            chestUnlocked={chestUnlocked}
          />
          <ForestLoreAndWatchtower3D
            hasCrowbar={hasCrowbar}
            hasIronKey={hasIronKey}
            posterRead={posterRead}
            newspaperRead={newspaperRead}
            pamphletRead={pamphletRead}
            watchtowerScareActive={watchtowerScareActive}
          />
          <RoadsideClues3D milestoneRead={milestoneRead} shelterRead={shelterRead} />
          <ForestryOffice3D
            memoRead={memoRead}
            hasCodeNote={true}
            windowScareActive={windowScareActive}
          />
          <PhantomStall3D dinersStare={dinersStare} revealed={stallRevealed} />
        </>
      )}
    </group>
  );
}
