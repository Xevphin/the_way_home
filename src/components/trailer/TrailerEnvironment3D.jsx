// ============================================================================
// src/components/trailer/TrailerEnvironment3D.jsx
// Night forest & Route 312 road set for the Chapter 1 Trailer:
// - Reuses StalledSedan (Kenney Car Kit sedan with real dual SpotLights &
//   hazards), NightSkyDome, RainMistStreaks3D, ForestTreeFlyers3D,
//   LembahBatuWelcomeSign3D, getWetAsphaltMaps, and getFlashlightBeamTexture
// - Soft additive radial-gradient mist halos (zero hard-edged ConeGeometry)
// ============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import NightSkyDome from '../shared/NightSkyDome';
import RainMistStreaks3D from '../shared/RainMistStreaks3D';
import LembahBatuWelcomeSign3D from '../shared/LembahBatuWelcomeSign3D';
import StalledSedan from '../shared/StalledSedan';
import ForestTreeFlyers3D from '../chapter1/ForestTreeFlyers3D';
import {
  ProceduralGuardrailsAndReflectors,
  ProceduralPineForest,
} from './TrailerForestProps3D';
import { getWetAsphaltMaps } from '../../data/shared/asphaltTextures';
import { getFlashlightBeamTexture } from '../../data/shared/flashlightBeamTexture';

let cachedMistTex = null;
function getMistTexture() {
  if (cachedMistTex) return cachedMistTex;
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, 'rgba(155, 182, 214, 0.28)');
  g.addColorStop(0.55, 'rgba(110, 138, 170, 0.11)');
  g.addColorStop(1, 'rgba(80, 100, 130, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  cachedMistTex = new THREE.CanvasTexture(c);
  cachedMistTex.needsUpdate = true;
  return cachedMistTex;
}

let cachedHaloTex = null;
function getHeadlightHaloTexture() {
  if (cachedHaloTex) return cachedHaloTex;
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
  g.addColorStop(0.22, 'rgba(255, 245, 225, 0.55)');
  g.addColorStop(0.55, 'rgba(255, 220, 180, 0.16)');
  g.addColorStop(1.0, 'rgba(255, 200, 150, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  cachedHaloTex = new THREE.CanvasTexture(c);
  cachedHaloTex.needsUpdate = true;
  return cachedHaloTex;
}

// Existing Chapter 1 StalledSedan parked in the fog with soft radial mist halos & SpotLights
function DistantMistSedan({ redMode = false }) {
  const beamMap = useMemo(() => getFlashlightBeamTexture(), []);
  const haloTex = useMemo(() => getHeadlightHaloTexture(), []);
  const beamColor = redMode ? '#ff1e1e' : '#ffe9b8';
  const targets = useMemo(() => {
    const l = new THREE.Object3D();
    l.position.set(-0.66, 0.35, 16);
    const r = new THREE.Object3D();
    r.position.set(0.66, 0.35, 16);
    return [l, r];
  }, []);

  return (
    <group position={[0.45, 0, -23.5]}>
      {/* Reused Kenney Car Kit StalledSedan facing +Z toward the camera */}
      <StalledSedan
        position={[0, 0, 0]}
        rotation={[0, Math.PI, 0]}
        isDented={false}
        headlightPower={redMode ? 0 : 1.15}
        hazardsOn={true}
        inspected={true}
      />

      {/* Soft additive radial-gradient mist glow + SpotLight beams (zero hard cones) */}
      {[-0.66, 0.66].map((xOff, i) => (
        <group key={i}>
          <primitive object={targets[i]} />
          <spotLight
            position={[xOff, 0.64, 2.24]}
            target={targets[i]}
            color={beamColor}
            map={beamMap}
            intensity={redMode ? 90 : 34}
            distance={38}
            angle={0.56}
            penumbra={0.78}
            decay={1.25}
          />
          {haloTex && (
            <mesh position={[xOff, 0.64, 2.3]}>
              <planeGeometry args={[redMode ? 2.6 : 1.75, redMode ? 2.6 : 1.75]} />
              <meshBasicMaterial
                map={haloTex}
                color={beamColor}
                transparent
                opacity={redMode ? 0.42 : 0.24}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* Soft forward fog scatter pool */}
      <pointLight
        position={[0, 1.15, 5.2]}
        color={beamColor}
        intensity={redMode ? 36 : 8.5}
        distance={24}
        decay={1.5}
      />
    </group>
  );
}

export default function TrailerEnvironment3D({ redHeadlightsMode = false }) {
  const mistRef = useRef();
  const wetMaps = useMemo(() => getWetAsphaltMaps(), []);
  const mistTex = useMemo(() => getMistTexture(), []);

  const roadDashes = useMemo(() => {
    const arr = [];
    for (let z = 12; z >= -246; z -= 6.8) arr.push(z);
    return arr;
  }, []);

  const mistPatches = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: ((i * 19) % 20) - 10,
        y: 0.5 + (i % 3) * 0.45,
        z: 4 - i * 10.2,
        size: 18 + (i % 4) * 5,
        phase: i * 1.1,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!mistRef.current) return;
    const t = clock.getElapsedTime();
    mistRef.current.children.forEach((m, i) => {
      const p = mistPatches[i];
      if (p) m.position.x = p.x + Math.sin(t * 0.28 + p.phase) * 2.2;
    });
  });

  return (
    <group>
      <color attach="background" args={[redHeadlightsMode ? '#140204' : '#04080f']} />
      <fogExp2
        attach="fog"
        args={[redHeadlightsMode ? '#2b0508' : '#09111b', redHeadlightsMode ? 0.045 : 0.036]}
      />
      <NightSkyDome />
      <RainMistStreaks3D count={56} speed={12.0} opacity={0.26} streakLength={0.9} />
      <ambientLight
        intensity={redHeadlightsMode ? 0.18 : 0.28}
        color={redHeadlightsMode ? '#ff6666' : '#526b92'}
      />
      <directionalLight position={[-18, 28, -20]} intensity={0.45} color="#8baad9" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -118]}>
        <planeGeometry args={[180, 310]} />
        <meshLambertMaterial color="#09110c" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -118]}>
        <planeGeometry args={[8.6, 280]} />
        <meshStandardMaterial
          map={wetMaps.map}
          bumpMap={wetMaps.bumpMap}
          bumpScale={0.03}
          roughnessMap={wetMaps.roughnessMap}
          roughness={0.68}
          metalness={0.22}
        />
      </mesh>
      {roadDashes.map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, z]}>
          <planeGeometry args={[0.16, 2.7]} />
          <meshBasicMaterial color="#9e8238" />
        </mesh>
      ))}

      <ProceduralGuardrailsAndReflectors />
      <ProceduralPineForest />
      <LembahBatuWelcomeSign3D position={[7.2, 0, -14.5]} rotation={[0.03, -0.32, 0.04]} />
      <ForestTreeFlyers3D />
      <DistantMistSedan redMode={redHeadlightsMode} />

      {mistTex && (
        <group ref={mistRef}>
          {mistPatches.map((fg) => (
            <mesh key={fg.id} position={[fg.x, fg.y, fg.z]} rotation={[-Math.PI / 2, 0, fg.phase]}>
              <planeGeometry args={[fg.size, fg.size]} />
              <meshBasicMaterial
                map={mistTex}
                color={redHeadlightsMode ? '#ff6b6b' : '#b8cee8'}
                transparent
                opacity={0.64}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
