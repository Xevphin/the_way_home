// ============================================================================
// src/components/NightSkyDome.jsx
// Reusable starry night/dusk sky dome replacing flat black void backgrounds:
// - Gradient twilight/midnight sky sphere (BackSide)
// - Twinkling procedural starfield points
// - Subtle translucent horizon cloud bands
// - Glowing moon with soft atmospheric halo & cool directional moonlight
// ============================================================================

import React, { useMemo } from 'react';
import * as THREE from 'three';

function makeSkyGradientTexture(variant) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 512;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 512);

  if (variant === 'dusk') {
    grad.addColorStop(0.0, '#0d1024');
    grad.addColorStop(0.32, '#1d1c3d');
    grad.addColorStop(0.52, '#4f2c52');
    grad.addColorStop(0.64, '#a64d42');
    grad.addColorStop(0.75, '#2b2038');
    grad.addColorStop(1.0, '#0e1018');
  } else {
    // Deep starry midnight sky with subtle indigo-blue horizon glow
    grad.addColorStop(0.0, '#040712');
    grad.addColorStop(0.38, '#0b132b');
    grad.addColorStop(0.58, '#172544');
    grad.addColorStop(0.72, '#1c2b47');
    grad.addColorStop(1.0, '#070a12');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

export default function NightSkyDome({
  variant = 'midnight', // 'dusk' | 'midnight'
  moonPosition = [-34, 34, -85],
}) {
  const skyTex = useMemo(() => makeSkyGradientTexture(variant), [variant]);

  // Deterministic twinkling star positions scattered across upper sky hemisphere
  const starPositions = useMemo(() => {
    const count = 320;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = ((i * 137.5) % 360) * (Math.PI / 180);
      const phi = (0.08 + ((i * 29) % 100) * 0.0042) * Math.PI;
      const r = 135;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi) + 8;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 30;
    }
    return arr;
  }, []);

  // Subtle horizon cloud wisps catching moonlight/dusk glow
  const clouds = useMemo(
    () => [
      { pos: [-45, 22, -98], scale: [18, 3.2, 5] },
      { pos: [28, 26, -105], scale: [22, 3.6, 5] },
      { pos: [-8, 19, -110], scale: [26, 2.8, 5] },
      { pos: [52, 20, -90], scale: [16, 3.0, 5] },
    ],
    []
  );

  const cloudColor = variant === 'dusk' ? '#7a4b68' : '#243554';

  return (
    <group>
      {/* Gradient Starry Night Sky Dome */}
      <mesh position={[0, 0, -35]}>
        <sphereGeometry args={[155, 24, 20]} />
        <meshBasicMaterial map={skyTex} side={THREE.BackSide} fog={false} />
      </mesh>

      {/* Starfield Points */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starPositions.length / 3}
            array={starPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#e8f1ff"
          size={0.75}
          sizeAttenuation
          transparent
          opacity={variant === 'dusk' ? 0.72 : 0.92}
          fog={false}
        />
      </points>

      {/* Glowing Moon & Soft Atmospheric Halo */}
      <group position={moonPosition}>
        <mesh>
          <sphereGeometry args={[4.2, 20, 20]} />
          <meshBasicMaterial color="#fff8de" fog={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[7.4, 20, 20]} />
          <meshBasicMaterial
            color={variant === 'dusk' ? '#ffd2a8' : '#a8c8f0'}
            transparent
            opacity={0.18}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      </group>

      {/* Subtle Horizon Cloud Wisps */}
      {clouds.map((cl, i) => (
        <mesh key={i} position={cl.pos} scale={cl.scale}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshBasicMaterial
            color={cloudColor}
            transparent
            opacity={0.28}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      ))}
    </group>
  );
}
