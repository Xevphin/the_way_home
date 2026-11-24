// ============================================================================
// src/components/NightTrafficDetour.jsx
// Sprint 4 Beat 2 — Late-Night Highway Traffic Jam & Route 312 Detour:
// - First-person driver POV on lit asphalt E18 highway under NightSkyDome
// - 14 Real Kenney Car Kit .glb jammed vehicles with glowing red brake lights
// - 3-Route Malaysian Signboard mounted 100% OFF the asphalt on the left grass
//   verge (x = -10.2, z = -34.5) under a lone flickering Kenney streetlight
// - Smooth curved branching left-turn asphalt road (Route 312) starting AFTER
//   the signboard; player's car steers smoothly down the center of the branch!
// ============================================================================

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { NIGHT_DETOUR_SCRIPT } from '../data/sprint4Data';
import { getSubtitleDurationMs, getSubtitleStepMs } from '../data/dialogueTiming';
import StalledSedan from './StalledSedan';
import TrafficCarModel from './TrafficCarModel';
import CarCabinOverlay3D from './CarCabinOverlay3D';
import MalaysianSignboard3D from './MalaysianSignboard3D';
import NightSkyDome from './NightSkyDome';
import ModelAsset from './ModelAsset';
import Route312BranchRoad, { createRoute312Curve } from './Route312BranchRoad';
import RainMistStreaks3D from './RainMistStreaks3D';
import { MODELS } from '../data/modelCatalog';
import {
  startDrivingEngineAudio,
  stopDrivingEngineAudio,
} from './AmbientMusicAudio';

// Dynamically compute every detour subtitle cue so NO line ever cuts off mid-typing (+0.9s reading pause!)
function buildDetourTimeline() {
  let cursor = 0.6;
  const lines = NIGHT_DETOUR_SCRIPT.map((entry) => {
    const startSec = cursor;
    const typingSec = (entry.text.length * getSubtitleStepMs(entry.tag)) / 1000;
    const durSec = Math.max(getSubtitleDurationMs(entry.text, entry.tag) / 1000, typingSec + 0.9);
    cursor = startSec + durSec;
    return { ...entry, timeSec: startSec };
  });
  const turnStart = lines[2].timeSec + 2.4;
  return { lines, turnStart, totalSec: cursor + 0.2 };
}
const DETOUR_TIMELINE = buildDetourTimeline();

export default function NightTrafficDetour({
  active,
  onSubtitleChange,
  onComplete,
}) {
  const { camera } = useThree();
  const carGroupRef = useRef();
  const jamGroupRef = useRef();
  const flickerLightRef = useRef();
  const elapsedRef = useRef(0);
  const doneRef = useRef(false);
  const lastSubRef = useRef(-1);
  const steerAngleRef = useRef(0);
  const lastHeadingRef = useRef(0);

  // Shared Route 312 branching left-turn spline (exact match with Route312BranchRoad)
  const { detourCurve, jammedCars, laneDashes } = useMemo(() => {
    const curve = createRoute312Curve();

    const jam = [];
    for (let i = 0; i < 14; i++) {
      const laneX = i % 2 === 0 ? -1.8 : 1.8;
      // Jam starts at z = -48 so the left off-ramp throat (-35..-46) is cleanly open!
      const z = -48 - Math.floor(i / 2) * 7.4 - (i % 2) * 2.4;
      jam.push({ id: i, x: laneX, z });
    }

    const dashes = [];
    for (let z = 58; z >= -150; z -= 7) dashes.push(z);
    return { detourCurve: curve, jammedCars: jam, laneDashes: dashes };
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    elapsedRef.current = 0;
    doneRef.current = false;
    lastSubRef.current = -1;
    startDrivingEngineAudio();
    return () => stopDrivingEngineAudio();
  }, [active]);

  useFrame(({ clock }, delta) => {
    if (!active || !carGroupRef.current) return;
    const dt = Math.min(delta, 0.1);
    elapsedRef.current += dt;
    const t = elapsedRef.current;

    for (let i = DETOUR_TIMELINE.lines.length - 1; i >= 0; i--) {
      if (t >= DETOUR_TIMELINE.lines[i].timeSec && lastSubRef.current < i) {
        lastSubRef.current = i;
        onSubtitleChange({
          tag: DETOUR_TIMELINE.lines[i].tag,
          text: DETOUR_TIMELINE.lines[i].text,
        });
        break;
      }
    }

    if (flickerLightRef.current) {
      flickerLightRef.current.intensity =
        Math.sin(clock.getElapsedTime() * 19) > -0.65 ? 9.0 : 1.4;
    }
    if (jamGroupRef.current) {
      jamGroupRef.current.position.z = -t * 0.14;
    }

    let carX = -1.8;
    let carZ = 18;
    let heading = 0;
    const tSlow = DETOUR_TIMELINE.lines[1].timeSec;
    const tTurn = DETOUR_TIMELINE.turnStart;
    const total = DETOUR_TIMELINE.totalSec;

    if (t < tSlow) {
      const p = t / tSlow;
      carZ = THREE.MathUtils.lerp(18, -22, 1 - Math.pow(1 - p, 2));
    } else if (t < tTurn) {
      const p = (t - tSlow) / Math.max(1, tTurn - tSlow);
      carZ = THREE.MathUtils.lerp(-22, -35.0, p);
    } else {
      const rawP = Math.min(1, (t - tTurn) / Math.max(1, total - tTurn));
      // Accelerate smoothly all the way down the extended Route 312 dark forest tunnel (u -> 1.0)
      const u = Math.min(0.985, Math.pow(rawP, 1.35));
      const pos = detourCurve.getPointAt(u);
      const next = detourCurve.getPointAt(Math.min(1, u + 0.015));
      carX = pos.x;
      carZ = pos.z;
      heading = Math.atan2(-(next.x - pos.x), -(next.z - pos.z));
    }

    carGroupRef.current.position.set(carX, 0, carZ);
    carGroupRef.current.rotation.set(0, heading, 0);
    steerAngleRef.current = THREE.MathUtils.clamp((heading - lastHeadingRef.current) * 26, -0.85, 0.85);
    lastHeadingRef.current = heading;

    const seatLocal = new THREE.Vector3(-0.36, 1.18 + Math.sin(t * 11) * 0.006, 0.06);
    seatLocal.applyAxisAngle(new THREE.Vector3(0, 1, 0), heading);
    camera.position.set(carX + seatLocal.x, seatLocal.y, carZ + seatLocal.z);

    // Smooth head glance left toward the <- 312 signboard on the left grass verge
    const glanceStart = DETOUR_TIMELINE.lines[2].timeSec;
    const glanceEnd = tTurn - 0.3;
    let headYawOffset = 0;
    let headPitch = -0.02;
    if (t >= glanceStart && t < glanceEnd) {
      const lookP = Math.sin(((t - glanceStart) / Math.max(1, glanceEnd - glanceStart)) * Math.PI);
      headYawOffset = lookP * 0.44;
      headPitch = lookP * 0.1;
    }
    camera.quaternion.setFromEuler(
      new THREE.Euler(headPitch, heading + headYawOffset, 0, 'YXZ')
    );

    if (t >= total && !doneRef.current) {
      doneRef.current = true;
      onSubtitleChange(null);
      onComplete();
    }
  });

  if (!active) return null;

  return (
    <group>
      <NightSkyDome variant="midnight" moonPosition={[-34, 34, -92]} />
      <ambientLight intensity={0.46} color="#6f87b5" />
      <directionalLight position={[-26, 28, -45]} intensity={0.78} color="#9bb8e8" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -45]} receiveShadow>
        <planeGeometry args={[200, 240]} />
        <meshStandardMaterial color="#101812" roughness={0.96} />
      </mesh>

      {/* Dark Asphalt E18 Highway (x in [-6.4, +12.4], y = 0.01) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.0, 0.01, -45]} receiveShadow>
        <planeGeometry args={[18.8, 240]} />
        <meshStandardMaterial color="#1a1f27" roughness={0.76} metalness={0.16} />
      </mesh>
      {/* White Highway Edge Lines at y = 0.025 (zero Z-fighting, split cleanly into Route 312 off-ramp) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.6, 0.025, 19.5]}>
        <planeGeometry args={[0.18, 109]} />
        <meshBasicMaterial color="#d8e0eb" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.6, 0.025, -109]}>
        <planeGeometry args={[0.18, 106]} />
        <meshBasicMaterial color="#d8e0eb" />
      </mesh>
      {[3.55, 4.65, 11.8].map((sx, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[sx, 0.025, -45]}>
          <planeGeometry args={[0.18, 236]} />
          <meshBasicMaterial color="#d8e0eb" />
        </mesh>
      ))}
      {laneDashes.map((dz) => (
        <React.Fragment key={dz}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.0, 0.025, dz]}>
            <planeGeometry args={[0.18, 3.2]} />
            <meshBasicMaterial color="#e8be4a" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.1, 0.025, dz]}>
            <planeGeometry args={[0.18, 3.2]} />
            <meshBasicMaterial color="#e8be4a" />
          </mesh>
        </React.Fragment>
      ))}

      <mesh position={[4.1, 0.45, -45]}>
        <boxGeometry args={[0.45, 0.9, 210]} />
        <meshStandardMaterial color="#757d88" roughness={0.85} />
      </mesh>

      {/* Seamless Curved Off-Ramp Branch (Route 312 Lembah Batu) & Pine Forest */}
      <Route312BranchRoad
        asphaltColor="#1a1f27"
        shoulderColor="#d8e0eb"
        treeTint="#3b5443"
      />

      {/* Real Kenney Highway Streetlights Curving Inward Over Lanes + Lit Bulbs */}
      {[12, -12, -38, -68, -98].map((lz, i) => (
        <group key={i} position={[3.9, 0, lz]}>
          <ModelAsset url={MODELS.streetlight} rotation={[0, Math.PI / 2, 0]} targetHeight={7.2} />
          <mesh position={[-1.45, 6.95, 0]}>
            <sphereGeometry args={[0.2, 10, 10]} />
            <meshBasicMaterial color="#ffe39e" />
          </mesh>
          <pointLight position={[-1.45, 6.65, 0]} color="#ffb84d" intensity={8.5} distance={26} />
        </group>
      ))}
      <group position={[-13.8, 0, -34.5]}>
        <ModelAsset url={MODELS.streetlight} rotation={[0, -Math.PI / 2, 0]} targetHeight={7.0} />
        <mesh position={[1.4, 6.75, 0]}>
          <sphereGeometry args={[0.2, 10, 10]} />
          <meshBasicMaterial color="#ffdf8e" />
        </mesh>
        <pointLight ref={flickerLightRef} position={[2.2, 6.4, 1.5]} color="#ffc166" intensity={9.5} distance={28} />
      </group>

      {/* 3-Route Malaysian Signboard Mounted 100% ON THE LEFT GRASS VERGE (x = -10.2, z = -34.5) */}
      <MalaysianSignboard3D position={[-10.2, 0, -34.5]} />

      {/* 14 Real Kenney Car Kit .glb Jammed Cars with Vivid Red Brake Lights */}
      <group ref={jamGroupRef}>
        {jammedCars.map((c) => (
          <TrafficCarModel
            key={c.id}
            variantIndex={c.id}
            position={[c.x, 0, c.z]}
            lightsOn={true}
            braking={true}
          />
        ))}
        <pointLight position={[0, 1.2, -46]} color="#ff2424" intensity={7.0} distance={20} />
        <pointLight position={[0, 1.2, -62]} color="#ff2424" intensity={6.5} distance={22} />
      </group>

      {/* Player's First-Person Sedan Cabin & High Beams */}
      <group ref={carGroupRef} position={[-1.8, 0, 18]}>
        <StalledSedan
          position={[0, 0, 0]}
          isDented={false}
          headlightPower={1.05}
          hazardsOn={false}
          interiorView={true}
        />
        <CarCabinOverlay3D
          visible={true}
          hazardsOn={false}
          showFlashFigure={false}
          radioActive={true}
          steerAngleRef={steerAngleRef}
        />
      </group>
      <RainMistStreaks3D count={44} speed={11.5} opacity={0.28} streakLength={0.82} />
    </group>
  );
}
