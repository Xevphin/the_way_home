// ============================================================================
// src/components/StalledSedan.jsx
// Player's sedan powered by Kenney Car Kit's sedan.glb (flush at y = 0):
// - Real Three.js dual headlight spotLight beams & emissive bulbs
// - Pulsing amber hazard lights (all 4 corners + spill glow)
// - Deeply dented hood crater & rising radiator steam after midnight impact
// - Clean unobstructed interiorView mode for first-person driving scenes
// ============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ModelAsset from './ModelAsset';
import { MODELS } from '../data/modelCatalog';

export default function StalledSedan({
  position = [1.2, 0, 0],
  rotation = [0, 0, 0],
  isDented = true,
  headlightPower = 0.45,
  hazardsOn = true,
  inspected = false,
  interiorView = false,
}) {
  const hazardMatsRef = useRef([]);
  const hazardLightFrontRef = useRef();
  const hazardLightRearRef = useRef();
  const steamGroupRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const blinkOn = hazardsOn && Math.sin(t * 7.6) > 0;

    hazardMatsRef.current.forEach((mat) => {
      if (mat) mat.emissiveIntensity = blinkOn ? 4.2 : 0.08;
    });
    if (hazardLightFrontRef.current) {
      hazardLightFrontRef.current.intensity = blinkOn ? 3.8 : 0.05;
    }
    if (hazardLightRearRef.current) {
      hazardLightRearRef.current.intensity = blinkOn ? 2.6 : 0.05;
    }

    if (steamGroupRef.current && isDented) {
      steamGroupRef.current.children.forEach((p, idx) => {
        const cycle = (t * 0.65 + idx * 0.33) % 1;
        p.position.y = 0.92 + cycle * 1.05;
        p.scale.setScalar(0.18 + cycle * 0.38);
      });
    }
  });

  const headlightTargets = useMemo(() => {
    const left = new THREE.Object3D();
    left.position.set(-0.68, 0.05, -18);
    const right = new THREE.Object3D();
    right.position.set(0.68, 0.05, -18);
    return [left, right];
  }, []);

  return (
    <group position={position} rotation={rotation}>
      {/* Keep Exterior GLB & Interior Hood ALWAYS visible=true (park at y=-50 -> 0ms shader compile on exit!) */}
      <group position={[0, interiorView ? -50 : 0, 0]}>
        <ModelAsset
          url={MODELS.sedan}
          rotation={[0, Math.PI, 0]}
          targetLength={4.38}
        />
      </group>
      <group position={[0, interiorView ? 0 : -50, 0]}>
        <mesh position={[0, 0.85, -1.55]}>
          <boxGeometry args={[1.82, 0.08, 1.24]} />
          <meshStandardMaterial color="#2f3c4d" roughness={0.38} metalness={0.62} />
        </mesh>
        <mesh position={[0, 1.54, -0.58]}>
          <boxGeometry args={[1.66, 0.08, 0.42]} />
          <meshStandardMaterial color="#181f29" roughness={0.8} />
        </mesh>
      </group>

      {/* Post-Crash Hood Dent Crater & Steam (parked at y=-50 until dented; light kept outside so 0 shader compile!) */}
      <group position={[0, isDented ? 0 : -50, 0]}>
        <mesh position={[0, 0.82, -1.94]} rotation={[0.38, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.24, 0.38, 12]} />
          <meshStandardMaterial color="#0b0e14" roughness={0.82} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0.9, -1.84]} rotation={[0.25, 0, 0.12]}>
          <boxGeometry args={[0.56, 0.05, 0.45]} />
          <meshStandardMaterial color="#738091" roughness={0.42} metalness={0.9} />
        </mesh>
        <group ref={steamGroupRef} position={[0, 0, -1.85]}>
          {[0, 1, 2].map((idx) => (
            <mesh key={idx} position={[(idx - 1) * 0.14, 1.0, 0]}>
              <sphereGeometry args={[0.24, 10, 10]} />
              <meshBasicMaterial
                color="#cfdbe8"
                transparent
                opacity={0.11}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      </group>
      <pointLight
        position={[0, 1.55, -2.45]}
        intensity={isDented ? (inspected ? 0.8 : 1.8) : 0}
        distance={4.8}
        color="#ffd39b"
      />

      {/* Dual Front Headlights + Permanently Mounted SpotLights (zero shader recompile on flicker!) */}
      {[-0.66, 0.66].map((xOff, i) => (
        <group key={i}>
          <primitive object={headlightTargets[i]} />
          <mesh position={[xOff, 0.62, -2.2]}>
            <boxGeometry args={[0.3, 0.14, 0.05]} />
            <meshStandardMaterial
              color="#fff8de"
              emissive="#ffe39c"
              emissiveIntensity={headlightPower > 0.05 ? 2.6 * headlightPower : 0.08}
            />
          </mesh>
          <spotLight
            position={[xOff, 0.66, -2.28]}
            target={headlightTargets[i]}
            intensity={headlightPower > 0.05 ? headlightPower * 16.0 : 0}
            distance={36}
            angle={0.48}
            penumbra={0.68}
            decay={1.4}
            color="#ffe9b8"
          />
        </group>
      ))}

      {/* Pulsing Amber Hazard Lights */}
      <group>
        {[
          [-0.86, 0.6, -2.2],
          [0.86, 0.6, -2.2],
          [-0.84, 0.64, 2.22],
          [0.84, 0.64, 2.22],
        ].map((pos, idx) => (
          <mesh key={idx} position={pos}>
            <boxGeometry args={[0.17, 0.12, 0.06]} />
            <meshStandardMaterial
              ref={(el) => {
                hazardMatsRef.current[idx] = el;
              }}
              color="#ff9900"
              emissive="#ff8400"
              emissiveIntensity={0.1}
            />
          </mesh>
        ))}
        <pointLight
          ref={hazardLightFrontRef}
          position={[0, 0.95, -2.65]}
          color="#ff9419"
          intensity={0.1}
          distance={12}
        />
        <pointLight
          ref={hazardLightRearRef}
          position={[0, 0.95, 2.65]}
          color="#ff8c19"
          intensity={0.1}
          distance={10}
        />
      </group>

      {/* Red Taillights */}
      {[-0.64, 0.64].map((xOff, i) => (
        <mesh key={i} position={[xOff, 0.64, 2.22]}>
          <boxGeometry args={[0.34, 0.14, 0.05]} />
          <meshStandardMaterial
            color="#ff2626"
            emissive="#cc1414"
            emissiveIntensity={1.6}
          />
        </mesh>
      ))}
    </group>
  );
}
