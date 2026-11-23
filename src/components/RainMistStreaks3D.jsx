// ============================================================================
// src/components/RainMistStreaks3D.jsx
// Lightweight instanced rain & mist streaks that follow the active camera so
// fine nocturnal rain catches the sedan headlights & flashlight beam during
// Route 312 detour, midnight exploration, and the high-speed escape chase.
// ============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function RainMistStreaks3D({
  count = 130,
  speed = 11.5,
  spread = 18,
  opacity = 0.24,
  streakLength = 0.72,
  color = '#c7ddf5',
}) {
  const { camera } = useThree();
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        ox: (((i * 37) % 100) / 100 - 0.5) * spread,
        oy: (((i * 53) % 100) / 100) * 9.5,
        oz: (((i * 71) % 100) / 100 - 0.5) * spread - 4.0,
        spd: speed * (0.82 + ((i * 17) % 10) * 0.038),
      })),
    [count, spread, speed]
  );

  useFrame((_, delta) => {
    const inst = meshRef.current;
    if (!inst) return;
    const dt = Math.min(delta, 0.06);
    const cx = camera.position.x;
    const cz = camera.position.z;

    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      d.oy -= d.spd * dt;
      if (d.oy < 0.05) d.oy += 9.5;

      dummy.position.set(cx + d.ox, d.oy, cz + d.oz);
      dummy.rotation.set(0.14, 0, -0.06);
      dummy.scale.set(1, streakLength, 1);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
      <cylinderGeometry args={[0.008, 0.008, 1.0, 4]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
