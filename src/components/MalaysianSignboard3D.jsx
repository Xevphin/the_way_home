// ============================================================================
// src/components/MalaysianSignboard3D.jsx
// Renders the 3-tier Malaysian green-and-blue directional highway signboard
// matching the attached reference image:
// - Top (Green):    ↑ [E18] Taman Permai / Pusat Bandar
// - Middle (Blue):  ↑ [204] Bandar Seri Putra
// - Bottom (Blue):  ← [312] Lembah Batu / Kampung Hulu
// ============================================================================

import React, { useMemo } from 'react';
import * as THREE from 'three';

function drawHexShield(ctx, cx, cy, w, h, code) {
  const hw = w / 2;
  const hh = h / 2;
  const cut = 14;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - hw + cut, cy - hh);
  ctx.lineTo(cx + hw - cut, cy - hh);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx + hw - cut, cy + hh);
  ctx.lineTo(cx - hw + cut, cy + hh);
  ctx.lineTo(cx - hw, cy);
  ctx.closePath();
  ctx.fillStyle = '#f5b800';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#111111';
  ctx.stroke();

  ctx.fillStyle = '#111111';
  ctx.font = 'bold 42px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(code, cx, cy + 2);
  ctx.restore();
}

function drawUpArrow(ctx, cx, cy) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 44);
  ctx.lineTo(cx + 30, cy - 8);
  ctx.lineTo(cx + 11, cy - 8);
  ctx.lineTo(cx + 11, cy + 44);
  ctx.lineTo(cx - 11, cy + 44);
  ctx.lineTo(cx - 11, cy - 8);
  ctx.lineTo(cx - 30, cy - 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawLeftArrow(ctx, cx, cy) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx - 46, cy);
  ctx.lineTo(cx - 10, cy - 30);
  ctx.lineTo(cx - 10, cy - 11);
  ctx.lineTo(cx + 44, cy - 11);
  ctx.lineTo(cx + 44, cy + 11);
  ctx.lineTo(cx - 10, cy + 11);
  ctx.lineTo(cx - 10, cy + 30);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function makeMalaysianSignTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 630;
  const ctx = c.getContext('2d');

  // Panel 1 (Top — Expressway Green #007a4d)
  ctx.fillStyle = '#007a4d';
  ctx.fillRect(8, 8, 1008, 192);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, 996, 180);
  drawUpArrow(ctx, 88, 104);
  drawHexShield(ctx, 215, 104, 134, 76, 'E18');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 46px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Taman Permai / Pusat Bandar', 315, 106);

  // Panel 2 (Middle — Federal Trunk Blue #0055a5)
  ctx.fillStyle = '#0055a5';
  ctx.fillRect(8, 210, 1008, 192);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 216, 996, 180);
  drawUpArrow(ctx, 88, 306);
  drawHexShield(ctx, 215, 306, 134, 76, '204');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px sans-serif';
  ctx.fillText('Bandar Seri Putra', 315, 308);

  // Panel 3 (Bottom — Left Exit Federal Trunk Blue #0055a5)
  ctx.fillStyle = '#0055a5';
  ctx.fillRect(8, 412, 1008, 210);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 418, 996, 198);
  drawLeftArrow(ctx, 92, 516);
  drawHexShield(ctx, 215, 516, 134, 76, '312');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText('Lembah Batu', 315, 488);
  ctx.fillText('Kampung Hulu', 315, 548);

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

export default function MalaysianSignboard3D({ position = [-5.2, 0, -45] }) {
  const signTex = useMemo(() => makeMalaysianSignTexture(), []);

  return (
    <group position={position}>
      {/* 3 Galvanized Steel Support Posts */}
      {[-2.1, 0, 2.1].map((px, i) => (
        <mesh key={i} position={[px, 2.25, -0.12]} castShadow>
          <cylinderGeometry args={[0.1, 0.11, 4.5, 12]} />
          <meshStandardMaterial color="#8d99a6" metalness={0.65} roughness={0.35} />
        </mesh>
      ))}

      {/* Signboard Backing & High-Contrast Reflective Front Face */}
      <mesh position={[0, 3.65, -0.05]} castShadow>
        <boxGeometry args={[6.4, 3.9, 0.1]} />
        <meshStandardMaterial color="#55606e" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 3.65, 0.02]}>
        <planeGeometry args={[6.35, 3.85]} />
        <meshStandardMaterial
          map={signTex}
          roughness={0.35}
          emissive="#ffffff"
          emissiveMap={signTex}
          emissiveIntensity={0.42}
        />
      </mesh>

      {/* Signboard Illumination Light so all 3 routes read crisply at dusk */}
      <pointLight position={[0, 3.8, 3.2]} color="#fff8e8" intensity={5.5} distance={14} />
    </group>
  );
}
