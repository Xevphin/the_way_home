// ============================================================================
// src/components/ForestLoreAndWatchtower3D.jsx
// Oakside-style 8th Landmark (Old Ranger Watchtower / Tool Shack) + Gated
// Tool/Key pickups & Readable Lore Props:
// - Old Ranger Watchtower at [-21.5, 0, -156.0] with wooden perimeter fence,
//   Missing Persons Poster, Forestry Closure Pamphlet & non-lethal doorway
//   shadow dart scare
// - Heavy Crowbar & Yellowed Local Newspaper on Stilt House #2 porch
// - Rusted Iron Shed Key on the Forestry Office desk
// ============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LANDMARK_TRANSFORMS } from '../../data/chapter1/midnightLandmarksData';

function makePosterTex(title, accent) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 320;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ddd2b8';
  ctx.fillRect(0, 0, 256, 320);
  ctx.fillStyle = accent;
  ctx.fillRect(14, 16, 228, 42);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 26px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(title, 128, 46);
  ctx.fillStyle = '#2a2a2e';
  ctx.fillRect(68, 76, 120, 110);
  for (let y = 208; y < 292; y += 16) {
    ctx.fillRect(24, y, 175 + ((y * 13) % 35), 6);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

export default function ForestLoreAndWatchtower3D({
  hasCrowbar = false,
  hasIronKey = false,
  posterRead = false,
  newspaperRead = false,
  pamphletRead = false,
  watchtowerScareActive = false,
}) {
  const dartRef = useRef();
  const dartProgRef = useRef(0);
  const posterTex = useMemo(() => makePosterTex('MISSING', '#961e1e'), []);
  const newsTex = useMemo(() => makePosterTex('LEMBAH NEWS', '#2e3842'), []);

  useFrame((_, delta) => {
    if (!dartRef.current) return;
    if (watchtowerScareActive && dartProgRef.current < 1) {
      dartProgRef.current = Math.min(1, dartProgRef.current + delta * 1.9);
      dartRef.current.visible = true;
      dartRef.current.position.z = THREE.MathUtils.lerp(-2.2, 2.2, dartProgRef.current);
    } else if (!watchtowerScareActive) {
      dartProgRef.current = 0;
      dartRef.current.visible = false;
    } else {
      dartRef.current.visible = false;
    }
  });

  const wt = LANDMARK_TRANSFORMS.rangerWatchtower;

  return (
    <group>
      {/* 1) OLD RANGER WATCHTOWER / TOOL SHACK (West Woodland Loop) */}
      <group position={[wt.x, 0, wt.z]} rotation={[0, wt.rotY, 0]}>
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <boxGeometry args={[5.4, 0.16, 5.6]} />
          <meshStandardMaterial color="#302820" roughness={0.94} />
        </mesh>
        {/* Back, Side & Split Front Walls (East doorway open lz in [-1.0, +1.0]) */}
        <mesh position={[-2.6, 1.65, 0]} castShadow>
          <boxGeometry args={[0.24, 3.1, 5.4]} />
          <meshStandardMaterial color="#3d3025" roughness={0.9} />
        </mesh>
        {[-2.65, 2.65].map((sz, i) => (
          <mesh key={i} position={[0, 1.65, sz]} castShadow>
            <boxGeometry args={[5.3, 3.1, 0.24]} />
            <meshStandardMaterial color="#3a2d22" roughness={0.9} />
          </mesh>
        ))}
        {[-1.85, 1.85].map((fz, i) => (
          <mesh key={i} position={[2.25, 1.65, fz]} castShadow>
            <boxGeometry args={[0.24, 3.1, 1.65]} />
            <meshStandardMaterial color="#423326" roughness={0.9} />
          </mesh>
        ))}
        {/* Watchtower Upper Deck & Slanted Tin Roof */}
        <mesh position={[0, 3.35, 0]} castShadow>
          <boxGeometry args={[6.1, 0.22, 6.2]} />
          <meshStandardMaterial color="#2a2d30" roughness={0.84} />
        </mesh>
        <mesh position={[0, 5.45, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[4.2, 1.5, 4]} />
          <meshStandardMaterial color="#24292b" roughness={0.86} />
        </mesh>
        {/* Timber Perimeter Yard Fence (Left & Right Sides) */}
        {[-4.5, 4.5].map((fz, i) => (
          <mesh key={i} position={[0, 0.68, fz]}>
            <boxGeometry args={[8.8, 0.16, 0.12]} />
            <meshStandardMaterial color="#3c2f23" roughness={0.92} />
          </mesh>
        ))}
        {/* Flickering Amber Trail Beacon Lamp Over Watchtower Door */}
        <mesh position={[2.45, 2.75, 0]}>
          <sphereGeometry args={[0.11, 8, 8]} />
          <meshBasicMaterial color="#ff9d47" />
        </mesh>
        <pointLight position={[3.2, 2.6, 0]} color="#ff9c42" intensity={4.0} distance={22} />

        {/* Readable Missing Persons Poster on Front Exterior Wall */}
        <mesh position={[2.39, 1.62, 1.55]} rotation={[0, Math.PI / 2, 0.04]}>
          <planeGeometry args={[0.58, 0.74]} />
          <meshStandardMaterial
            map={posterTex}
            emissive="#c9b48d"
            emissiveIntensity={posterRead ? 0.12 : 0.4}
          />
        </mesh>

        {/* Interior Desk + Readable Illegal Logging Pamphlet */}
        <mesh position={[-0.75, 0.45, -0.45]}>
          <boxGeometry args={[1.25, 0.86, 0.85]} />
          <meshStandardMaterial color="#473628" roughness={0.88} />
        </mesh>
        <mesh position={[-0.65, 0.9, -0.4]} rotation={[-Math.PI / 2, 0, -0.22]}>
          <planeGeometry args={[0.38, 0.48]} />
          <meshStandardMaterial
            color="#e3d5b3"
            emissive="#c7b27f"
            emissiveIntensity={pamphletRead ? 0.1 : 0.45}
          />
        </mesh>

        {/* Non-Lethal Doorway Shadow Silhouette Dart */}
        <group ref={dartRef} position={[3.4, 0, -2.2]} visible={false}>
          <mesh position={[0, 1.35, 0]}>
            <coneGeometry args={[0.45, 2.4, 8]} />
            <meshBasicMaterial color="#040508" />
          </mesh>
          <mesh position={[0, 2.55, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="#040508" />
          </mesh>
        </group>
      </group>

      {/* 2) HEAVY CROWBAR & YELLOWED NEWSPAPER ON STILT HOUSE #2 (OUTER RUIN) */}
      <group position={[15.4, 1.24, -123.5]}>
        {!hasCrowbar && (
          <group rotation={[0, 0.45, 0.18]}>
            <mesh>
              <cylinderGeometry args={[0.028, 0.028, 0.92, 8]} />
              <meshStandardMaterial
                color="#8c2b23"
                emissive="#ff6b4a"
                emissiveIntensity={0.45}
                metalness={0.65}
                roughness={0.42}
              />
            </mesh>
            <mesh position={[0, 0.44, 0.08]} rotation={[0.85, 0, 0]}>
              <boxGeometry args={[0.05, 0.18, 0.04]} />
              <meshStandardMaterial color="#58616b" metalness={0.8} roughness={0.35} />
            </mesh>
            <pointLight position={[0, 0.4, 0]} color="#ffaa66" intensity={2.1} distance={7.5} />
          </group>
        )}
      </group>
      <mesh position={[15.6, 1.2, -124.8]} rotation={[-Math.PI / 2, 0, 0.35]}>
        <planeGeometry args={[0.52, 0.42]} />
        <meshStandardMaterial
          map={newsTex}
          emissive="#bfb088"
          emissiveIntensity={newspaperRead ? 0.12 : 0.42}
        />
      </mesh>

      {/* 3) RUSTED IRON SHED KEY ON FORESTRY OFFICE DESK */}
      {!hasIronKey && (
        <group position={[-16.3, 0.92, -97.6]} rotation={[0, 0.5, 0]}>
          <mesh position={[-0.1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.055, 0.015, 8, 14]} />
            <meshStandardMaterial color="#c49a52" emissive="#f0b84a" emissiveIntensity={0.75} metalness={0.85} />
          </mesh>
          <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.014, 0.014, 0.24, 8]} />
            <meshStandardMaterial color="#b38840" emissive="#f0b84a" emissiveIntensity={0.75} metalness={0.85} />
          </mesh>
          <pointLight position={[0, 0.35, 0]} color="#ffd57a" intensity={2.2} distance={5.5} />
        </group>
      )}
    </group>
  );
}
