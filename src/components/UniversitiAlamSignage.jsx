// ============================================================================
// src/components/UniversitiAlamSignage.jsx
// High-resolution 3D canvas signage for Universiti Alam:
// 1) Main entrance gateway arch banner: "UNIVERSITI ALAM"
// 2) Academic Hall signboard: "WELCOME TO UNIVERSITI ALAM —
//    FACULTY OF COMPUTING & SCIENCE"
// Shared by TownWorld3D.jsx (persistent campus) and CampusWorld3D.jsx.
// ============================================================================

import React, { useMemo } from 'react';
import * as THREE from 'three';

function makeArchTexture() {
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#163759';
  ctx.fillRect(0, 0, 768, 128);
  ctx.strokeStyle = '#f0c45c';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 752, 112);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 54px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('UNIVERSITI ALAM', 384, 66);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function makeWelcomeSignTexture() {
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 192;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#143354';
  ctx.fillRect(0, 0, 768, 192);
  ctx.strokeStyle = '#f0c45c';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 752, 176);

  ctx.fillStyle = '#f8d57e';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WELCOME TO', 384, 48);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 50px serif';
  ctx.fillText('UNIVERSITI ALAM', 384, 106);

  ctx.fillStyle = '#cfe4ff';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('FACULTY OF COMPUTING & SCIENCE', 384, 154);

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

export function CampusArchBanner({ position = [0, 5.3, 0] }) {
  const archTex = useMemo(() => makeArchTexture(), []);
  return (
    <group position={[position[0], position[1], position[2] + 0.12]}>
      <mesh castShadow>
        <boxGeometry args={[13.6, 1.25, 1.32]} />
        <meshStandardMaterial color="#163759" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.68]}>
        <planeGeometry args={[13.0, 1.12]} />
        <meshStandardMaterial
          map={archTex}
          emissive="#ffffff"
          emissiveMap={archTex}
          emissiveIntensity={0.28}
        />
      </mesh>
    </group>
  );
}

export function CampusWelcomeBoard({ position = [0, 5.4, 8.65] }) {
  const welcomeTex = useMemo(() => makeWelcomeSignTexture(), []);
  return (
    <mesh position={position}>
      <planeGeometry args={[8.4, 2.1]} />
      <meshStandardMaterial
        map={welcomeTex}
        roughness={0.45}
        emissive="#ffffff"
        emissiveMap={welcomeTex}
        emissiveIntensity={0.32}
      />
    </mesh>
  );
}
