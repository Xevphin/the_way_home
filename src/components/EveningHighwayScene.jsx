// ============================================================================
// src/components/EveningHighwayScene.jsx
// Sprint 3 Beat 1 & 2 (Upgraded with Real Kenney .glb Assets):
// - Real Kenney Car Kit AI traffic passing in both lanes
// - Real Kenney curved highway streetlights lining both sides & median
// - 3-Route Malaysian Signboard mounted 100% OFF the asphalt on the left grass
//   verge (x = -10.2, z = -34.5) ahead of the branching Route 312 left exit
// - Deep starry dusk sky dome, clouds & moon (NightSkyDome)
// ============================================================================

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import StalledSedan from './StalledSedan';
import TrafficCarModel from './TrafficCarModel';
import MalaysianSignboard3D from './MalaysianSignboard3D';
import NightSkyDome from './NightSkyDome';
import ModelAsset from './ModelAsset';
import Route312BranchRoad from './Route312BranchRoad';
import { MODELS } from '../data/modelCatalog';
import { getSubtitleDurationMs, getSubtitleStepMs } from '../data/dialogueTiming';
import {
  startDrivingEngineAudio,
  stopDrivingEngineAudio,
} from './AmbientMusicAudio';

const RAW_HIGHWAY_LINES = [
  {
    tag: '',
    text: 'Cruising along the evening highway toward the cafe... traffic is moving pretty smoothly.',
  },
  {
    tag: 'INNER THOUGHT',
    text: 'Wait—junction ahead. Route 312 on the left cuts through Lembah Batu and Kampung Hulu... completely unlit into the dark forest.',
  },
  {
    tag: 'INNER THOUGHT',
    text: "No way I'm taking a dark rural trunk road right now. Common sense says stay straight on the lit E18 highway toward Taman Permai.",
  },
];

// Dynamically compute subtitle timings so no highway line ever cuts off mid-typing (+0.9s pause)
function buildHighwayTimeline() {
  let cursor = 0.4;
  const lines = RAW_HIGHWAY_LINES.map((entry) => {
    const start = cursor;
    const typingSec = (entry.text.length * getSubtitleStepMs(entry.tag)) / 1000;
    const durSec = Math.max(getSubtitleDurationMs(entry.text, entry.tag) / 1000, typingSec + 0.9);
    cursor = start + durSec;
    return { ...entry, time: start };
  });
  return { lines, totalSec: cursor + 0.2 };
}
const HIGHWAY_TIMELINE = buildHighwayTimeline();

export default function EveningHighwayScene({
  active,
  onSubtitleChange,
  onComplete,
}) {
  const { camera } = useThree();
  const playerCarRef = useRef();
  const trafficGroupRef = useRef();
  const elapsedRef = useRef(0);
  const doneRef = useRef(false);
  const lastSubIdxRef = useRef(-1);

  const aiTraffic = useMemo(
    () => [
      // Same-direction adjacent lane (laneX = 2.1, >= 38m spacing, matched cruise speed)
      { id: 0, laneX: 2.1, startZ: 28, speed: 11.4, dir: -1 },
      { id: 1, laneX: 2.1, startZ: -14, speed: 11.0, dir: -1 },
      { id: 2, laneX: 2.1, startZ: -56, speed: 11.8, dir: -1 },
      // Faster opposite-direction traffic across the concrete median (laneX = 6.8 & 10.2)
      { id: 3, laneX: 6.8, startZ: -120, speed: 15.2, dir: 1 },
      { id: 4, laneX: 10.2, startZ: -65, speed: 14.4, dir: 1 },
      { id: 5, laneX: 6.8, startZ: -15, speed: 16.0, dir: 1 },
    ],
    []
  );

  const laneDashes = useMemo(() => {
    const arr = [];
    for (let z = 64; z >= -168; z -= 7) arr.push(z);
    return arr;
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    elapsedRef.current = 0;
    doneRef.current = false;
    lastSubIdxRef.current = -1;
    startDrivingEngineAudio();
    return () => stopDrivingEngineAudio();
  }, [active]);

  useFrame((_, delta) => {
    if (!active || !playerCarRef.current) return;
    const dt = Math.min(delta, 0.1);
    elapsedRef.current += dt;
    const t = elapsedRef.current;

    for (let i = HIGHWAY_TIMELINE.lines.length - 1; i >= 0; i--) {
      if (t >= HIGHWAY_TIMELINE.lines[i].time && lastSubIdxRef.current < i) {
        lastSubIdxRef.current = i;
        onSubtitleChange({
          tag: HIGHWAY_TIMELINE.lines[i].tag,
          text: HIGHWAY_TIMELINE.lines[i].text,
        });
        break;
      }
    }

    const total = HIGHWAY_TIMELINE.totalSec;
    const tSign = HIGHWAY_TIMELINE.lines[1].time;
    const tPass = HIGHWAY_TIMELINE.lines[2].time + 2.5;
    // Realistic highway cruising speed across existing duration (z = 55 -> -145)
    const carZ = THREE.MathUtils.lerp(55, -145, Math.min(1, t / total));

    const carX = -1.8;
    playerCarRef.current.position.set(carX, 0, carZ);

    if (trafficGroupRef.current) {
      const span = 220;
      trafficGroupRef.current.children.forEach((mesh, idx) => {
        const cfg = aiTraffic[idx];
        let z = cfg.startZ + cfg.dir * cfg.speed * t;
        if (cfg.dir < 0) {
          while (z < -165) z += span;
          // Hard longitudinal spacing guard (>= 26m from carZ) so zero phasing ever occurs
          if (Math.abs(z - carZ) < 26) z = z < carZ ? carZ - 28 : carZ + 28;
        } else {
          while (z > 65) z -= span;
        }
        mesh.position.set(cfg.laneX, 0, z);
      });
    }

    if (t < tSign - 0.3) {
      camera.position.set(carX - 2.45, 1.25, carZ - 4.0);
      camera.lookAt(carX + 0.5, 0.92, carZ + 1.2);
    } else if (t < tPass + 0.4) {
      const p = Math.min(1, (t - (tSign - 0.3)) / 1.8);
      const s = p * p * (3 - 2 * p);
      camera.position.set(
        THREE.MathUtils.lerp(carX - 2.45, -4.6, s),
        THREE.MathUtils.lerp(1.25, 2.65, s),
        THREE.MathUtils.lerp(carZ - 4.0, carZ + 6.8, s)
      );
      camera.lookAt(-7.2, 2.7, -34.5);
    } else {
      camera.position.set(-4.6, 2.55, -22.5);
      camera.lookAt(carX, 1.1, carZ - 6.0);
    }

    if (t >= total && !doneRef.current) {
      doneRef.current = true;
      onSubtitleChange(null);
      onComplete();
    }
  });

  if (!active) return null;

  return (
    <group>
      <NightSkyDome variant="dusk" moonPosition={[-30, 30, -92]} />
      <ambientLight intensity={0.65} color="#b79ec4" />
      <hemisphereLight args={['#5e497a', '#242b29', 0.65]} />
      <directionalLight position={[-28, 16, -45]} intensity={1.45} color="#ffb37a" castShadow />
      <directionalLight position={[22, 10, 28]} intensity={0.44} color="#8fa8d9" />

      {/* Ground Grass Terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -40]} receiveShadow>
        <planeGeometry args={[200, 240]} />
        <meshStandardMaterial color="#1b261b" roughness={0.95} />
      </mesh>

      {/* Dark Asphalt 4-Lane Dual-Carriageway Highway (Subtle Specular Road Sheen) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.0, 0.01, -40]} receiveShadow>
        <planeGeometry args={[18.8, 220]} />
        <meshStandardMaterial color="#1f242c" roughness={0.48} metalness={0.18} />
      </mesh>
      {/* White Highway Edge Lines (Split Left Edge Cleanly Into Seamless Route 312 Off-Ramp) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.6, 0.025, 16.5]}>
        <planeGeometry args={[0.18, 103]} />
        <meshBasicMaterial color="#dfe6f0" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.6, 0.025, -104]}>
        <planeGeometry args={[0.18, 95]} />
        <meshBasicMaterial color="#dfe6f0" />
      </mesh>
      {[3.55, 4.65, 11.8].map((sx, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[sx, 0.025, -40]}>
          <planeGeometry args={[0.18, 215]} />
          <meshBasicMaterial color="#dfe6f0" />
        </mesh>
      ))}
      {laneDashes.map((dz) => (
        <React.Fragment key={dz}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.0, 0.025, dz]}>
            <planeGeometry args={[0.18, 3.2]} />
            <meshBasicMaterial color="#f0c44d" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.1, 0.025, dz]}>
            <planeGeometry args={[0.18, 3.2]} />
            <meshBasicMaterial color="#f0c44d" />
          </mesh>
        </React.Fragment>
      ))}

      {/* Concrete Median Barrier */}
      <mesh position={[4.1, 0.45, -40]} castShadow>
        <boxGeometry args={[0.45, 0.9, 210]} />
        <meshStandardMaterial color="#8d95a0" roughness={0.8} />
      </mesh>

      {/* Identical Curved Branching Left Exit Road (Route 312 Lembah Batu) */}
      <Route312BranchRoad
        asphaltColor="#1d222a"
        shoulderColor="#dfe6f0"
        treeTint="#3e5746"
      />

      {/* Concrete Flyover Overpass Deck & Pillars on Right */}
      <group position={[1.8, 0, -40]}>
        <mesh position={[0, 7.6, 0]} castShadow>
          <boxGeometry args={[7.2, 1.25, 195]} />
          <meshStandardMaterial color="#7d8590" roughness={0.82} />
        </mesh>
        {[-10, -38, -68, -98].map((pz, i) => (
          <mesh key={i} position={[2.2, 3.7, pz]} castShadow>
            <boxGeometry args={[1.4, 7.4, 1.8]} />
            <meshStandardMaterial color="#6e7680" roughness={0.85} />
          </mesh>
        ))}
      </group>

      {/* Real Kenney Curved Streetlights Curving Inward Over Highway Lanes + Lit Bulbs */}
      {[12, -12, -38, -64, -90].map((lz, i) => (
        <group key={`R_${i}`} position={[3.9, 0, lz]}>
          <ModelAsset url={MODELS.streetlight} rotation={[0, Math.PI / 2, 0]} targetHeight={7.2} />
          <mesh position={[-1.45, 6.95, 0]}>
            <sphereGeometry args={[0.2, 10, 10]} />
            <meshBasicMaterial color="#ffe39e" />
          </mesh>
          <pointLight position={[-1.45, 6.65, 0]} color="#ffb84d" intensity={9.5} distance={28} />
        </group>
      ))}
      {[14, -8, -64, -90].map((lz, i) => (
        <group key={`L_${i}`} position={[-7.6, 0, lz]}>
          <ModelAsset url={MODELS.streetlight} rotation={[0, -Math.PI / 2, 0]} targetHeight={7.2} />
          <mesh position={[1.45, 6.95, 0]}>
            <sphereGeometry args={[0.2, 10, 10]} />
            <meshBasicMaterial color="#ffe39e" />
          </mesh>
          <pointLight position={[1.45, 6.65, 0]} color="#ffb84d" intensity={8.5} distance={26} />
        </group>
      ))}

      {/* 3-Route Malaysian Signboard Mounted 100% ON THE LEFT GRASS VERGE (x = -10.2, z = -34.5) */}
      <MalaysianSignboard3D position={[-10.2, 0, -34.5]} />

      {/* Player's Real Sedan.glb */}
      <group ref={playerCarRef} position={[-1.8, 0, 20]}>
        <StalledSedan position={[0, 0, 0]} isDented={false} headlightPower={0.9} hazardsOn={false} />
      </group>

      {/* Active Real Kenney Car Kit AI Traffic Cars Passing in Both Lanes */}
      <group ref={trafficGroupRef}>
        {aiTraffic.map((car) => (
          <TrafficCarModel
            key={car.id}
            variantIndex={car.id}
            position={[car.laneX, 0, car.startZ]}
            rotation={[0, car.dir > 0 ? Math.PI : 0, 0]}
            lightsOn={true}
          />
        ))}
      </group>
    </group>
  );
}
