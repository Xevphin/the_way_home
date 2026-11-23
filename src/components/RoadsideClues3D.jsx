// ============================================================================
// src/components/RoadsideClues3D.jsx
// Additional optional eerie roadside landmarks along Route 312 Lembah Batu:
// 1) Old Chipped Concrete Milestone Marker ("KM 14 — CLOSED") at [5.1, 0, -24]
// 2) Collapsed Wooden Bus Shelter with Surveyor Logbook at [7.4, 0, -152]
// ============================================================================

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { LANDMARK_TRANSFORMS } from '../data/midnightLandmarksData';

function makeMilestoneTexture() {
  const c = document.createElement('canvas');
  c.width = 160;
  c.height = 220;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#c8c3b8';
  ctx.fillRect(0, 0, 160, 220);
  ctx.fillStyle = '#24272b';
  ctx.fillRect(0, 0, 160, 48);
  ctx.fillStyle = '#f2c94c';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('312', 80, 33);
  ctx.fillStyle = '#1f2328';
  ctx.font = 'bold 34px monospace';
  ctx.fillText('KM 14', 80, 102);
  ctx.fillStyle = '#8f1f1f';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('DITUTUP', 80, 148);
  ctx.fillText('CLOSED', 80, 176);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

export default function RoadsideClues3D({ milestoneRead = false, shelterRead = false }) {
  const mileTex = useMemo(() => makeMilestoneTexture(), []);

  return (
    <group>
      {/* 1) Chipped Concrete Milestone Marker (East Mossy Verge, z = -26) */}
      <group position={[5.4, 0, -26.0]} rotation={[0, -Math.PI / 2 - 0.14, 0.06]}>
        <mesh position={[0, 0.52, 0]} castShadow>
          <boxGeometry args={[0.46, 1.04, 0.28]} />
          <meshStandardMaterial color="#8c887f" roughness={0.92} />
        </mesh>
        <mesh position={[0, 0.56, 0.145]}>
          <planeGeometry args={[0.4, 0.78]} />
          <meshStandardMaterial
            map={mileTex}
            emissive="#bfb79f"
            emissiveIntensity={milestoneRead ? 0.08 : 0.24}
          />
        </mesh>
        <pointLight position={[0, 0.8, 0.6]} color="#b8c9de" intensity={0.9} distance={5} />
      </group>

      {/* 2) Collapsed Wooden Bus Shelter & Dropped Surveyor Logbook (East Pullout Clearing) */}
      <group
        position={[LANDMARK_TRANSFORMS.busShelter.x, 0, LANDMARK_TRANSFORMS.busShelter.z]}
        rotation={[0, LANDMARK_TRANSFORMS.busShelter.rotY, 0]}
      >
        <mesh position={[0, 0.06, 0]} receiveShadow>
          <boxGeometry args={[3.2, 0.12, 5.2]} />
          <meshStandardMaterial color="#2a2d32" roughness={0.92} />
        </mesh>
        {/* Back Timber Wall */}
        <mesh position={[1.15, 1.25, 0]} castShadow>
          <boxGeometry args={[0.18, 2.4, 4.6]} />
          <meshStandardMaterial color="#3c2f24" roughness={0.88} />
        </mesh>
        {/* Tilted Collapsed Corrugated Zinc Roof */}
        <mesh position={[0, 2.32, 0.1]} rotation={[0.08, 0, -0.24]} castShadow>
          <boxGeometry args={[3.4, 0.12, 5.0]} />
          <meshStandardMaterial color="#3c464f" roughness={0.75} metalness={0.35} />
        </mesh>
        {/* Wooden Waiting Bench */}
        <mesh position={[0.42, 0.48, 0]} castShadow>
          <boxGeometry args={[0.68, 0.1, 3.6]} />
          <meshStandardMaterial color="#59412e" roughness={0.85} />
        </mesh>
        {/* Torn Yellow Hazard Tape Fluttering on Post */}
        <mesh position={[-1.1, 1.15, 2.0]}>
          <boxGeometry args={[0.14, 2.3, 0.14]} />
          <meshStandardMaterial color="#473628" roughness={0.88} />
        </mesh>
        <mesh position={[-0.45, 1.35, 2.0]} rotation={[0, 0, -0.25]}>
          <boxGeometry args={[1.25, 0.09, 0.02]} />
          <meshStandardMaterial color="#d4a72c" roughness={0.6} />
        </mesh>
        {/* Dropped Surveyor Logbook & Faint Dying Flashlight */}
        <group position={[-0.6, 0.56, 0.0]} rotation={[0, 0.35, 0]}>
          <mesh>
            <boxGeometry args={[0.36, 0.05, 0.46]} />
            <meshStandardMaterial
              color="#d8ccb2"
              emissive="#c4b087"
              emissiveIntensity={shelterRead ? 0.06 : 0.32}
            />
          </mesh>
        </group>
        <pointLight
          position={[-0.5, 1.35, 0]}
          color="#a8c7e0"
          intensity={shelterRead ? 0.7 : 1.7}
          distance={8}
        />
      </group>
    </group>
  );
}
