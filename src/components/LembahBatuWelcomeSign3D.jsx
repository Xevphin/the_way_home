// ============================================================================
// src/components/LembahBatuWelcomeSign3D.jsx
// Weathered "Welcome to Lembah Batu" roadside signboard crafted for the
// finalized Main Menu 3D cover scene:
// - Procedural aged dark-green enameled canvas texture with subtle rust
//   streaks, moss wear, water stains & crisp "WELCOME TO LEMBAH BATU" text
// - Twin timber/steel posts anchored into mossy stones on the forest verge
// - Warm hanging corner lantern casting a subtle volumetric rim glow across
//   the weathered sign face amid drifting night fog
// ============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function createWelcomeSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  // Deep weathered Malaysian rural signboard forest-green enamel base
  const bg = ctx.createLinearGradient(0, 0, 0, 384);
  bg.addColorStop(0, '#122921');
  bg.addColorStop(0.55, '#18362c');
  bg.addColorStop(1, '#0e201a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 768, 384);

  // Subtle weathered grime, damp streaks & rust mottling along corners
  for (let i = 0; i < 42; i++) {
    const x = (i * 97) % 768;
    const y = (i * 53) % 384;
    const w = 18 + (i % 6) * 14;
    const h = 30 + (i % 5) * 28;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(62, 34, 18, 0.22)' : 'rgba(6, 12, 10, 0.2)';
    ctx.fillRect(x, y, w, h);
  }

  // Aged off-white / muted gold double border
  ctx.strokeStyle = 'rgba(232, 220, 188, 0.72)';
  ctx.lineWidth = 7;
  ctx.strokeRect(20, 20, 728, 344);
  ctx.strokeStyle = 'rgba(232, 220, 188, 0.26)';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, 704, 320);

  // Typography: Single weathered "WELCOME TO LEMBAH BATU" signboard
  ctx.textAlign = 'center';
  ctx.fillStyle = '#efe9d8';
  ctx.font = '700 44px Georgia, serif';
  ctx.fillText('WELCOME TO', 384, 146);

  ctx.fillStyle = '#f8e6b8';
  ctx.font = '900 68px Georgia, serif';
  ctx.fillText('LEMBAH BATU', 384, 232);

  // Subtle gold hairline & faded lower motto
  ctx.fillStyle = 'rgba(232, 194, 114, 0.55)';
  ctx.fillRect(190, 266, 388, 2);

  ctx.fillStyle = 'rgba(205, 214, 208, 0.65)';
  ctx.font = '500 20px monospace';
  ctx.fillText('VALLEY DISTRICT • DRIVE WITH CAUTION', 384, 314);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

export default function LembahBatuWelcomeSign3D({
  position = [4.0, 0, -29.2],
  rotation = [0, -0.34, 0],
}) {
  const signTex = useMemo(() => createWelcomeSignTexture(), []);
  const lanternLightRef = useRef();

  useFrame(({ clock }) => {
    if (!lanternLightRef.current) return;
    const t = clock.getElapsedTime();
    lanternLightRef.current.intensity = 6.2 + Math.sin(t * 2.4) * 0.45 + Math.sin(t * 7.3) * 0.18;
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Twin Weathered Timber/Steel Support Posts */}
      {[-1.55, 1.55].map((px, i) => (
        <group key={i} position={[px, 0, 0]}>
          <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.08, 0.095, 3.1, 10]} />
            <meshStandardMaterial color="#3c332b" roughness={0.9} metalness={0.22} />
          </mesh>
          {/* Mossy Base Stone Anchor */}
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.24, 0.3, 0.28, 7]} />
            <meshStandardMaterial color="#3a453c" roughness={0.96} />
          </mesh>
        </group>
      ))}

      {/* Main Weathered Signboard Panel & Rusted Metal Backing */}
      <mesh position={[0, 2.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.72, 1.88, 0.12]} />
        <meshStandardMaterial color="#252c28" roughness={0.84} metalness={0.3} />
      </mesh>
      <mesh position={[0, 2.28, 0.068]}>
        <planeGeometry args={[3.58, 1.76]} />
        <meshStandardMaterial map={signTex} roughness={0.62} metalness={0.14} />
      </mesh>

      {/* Hanging Warm Amber Roadside Lantern on Left Bracket (Volumetric Rim Glow) */}
      <group position={[-1.72, 3.02, 0.34]}>
        <mesh position={[0.12, 0.14, -0.18]}>
          <boxGeometry args={[0.38, 0.05, 0.46]} />
          <meshStandardMaterial color="#2c2926" roughness={0.8} metalness={0.45} />
        </mesh>
        <mesh position={[0, -0.08, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.26, 8]} />
          <meshStandardMaterial
            color="#ffe5a3"
            emissive="#ffae3d"
            emissiveIntensity={2.1}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, -0.08, 0]}>
          <sphereGeometry args={[0.36, 14, 12]} />
          <meshBasicMaterial color="#ffca72" transparent opacity={0.12} depthWrite={false} />
        </mesh>
        <pointLight
          ref={lanternLightRef}
          position={[0.45, -0.22, 0.65]}
          color="#ffc46b"
          intensity={6.2}
          distance={14}
          decay={1.6}
        />
      </group>
    </group>
  );
}
