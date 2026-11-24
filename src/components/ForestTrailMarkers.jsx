// ============================================================================
// src/components/ForestTrailMarkers.jsx
// Subtle visual breadcrumbs at key Oakside-style forest trail forks:
// - 16 weathered wooden trail posts with muted amber/silver reflective tape
//   strips (batched into 2 InstancedMesh draw calls, catching the flashlight)
// - 22 slow-drifting tiny fireflies hovering softly near trail junctions &
//   landmark approaches (1 InstancedMesh draw call, zero dynamic lights)
// ============================================================================

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 16 key trail junctions & road turnoffs across deep East (+44..+86) & West (-48..-96) loops
const TRAIL_POST_FORKS = [
  // East Side Road Turnoffs & Deep Trail Forks
  { pos: [6.4, -41.0], rotY: -0.35, tilt: 0.04 },
  { pos: [26.0, -45.5], rotY: 0.25, tilt: -0.04 },
  { pos: [50.0, -56.0], rotY: 0.42, tilt: -0.05 },
  { pos: [74.0, -72.0], rotY: -0.28, tilt: 0.03 },
  { pos: [6.4, -136.0], rotY: -0.4, tilt: -0.04 },
  { pos: [82.0, -124.0], rotY: 0.55, tilt: 0.05 },
  { pos: [58.0, -152.0], rotY: -0.48, tilt: -0.03 },
  { pos: [6.4, -182.0], rotY: -0.32, tilt: 0.04 },
  // West Side Road Turnoffs & Deep Trail Forks
  { pos: [-6.4, -62.0], rotY: 0.36, tilt: -0.04 },
  { pos: [-28.0, -65.5], rotY: -0.22, tilt: 0.04 },
  { pos: [-54.0, -74.0], rotY: -0.44, tilt: 0.05 },
  { pos: [-6.4, -94.0], rotY: 0.3, tilt: -0.03 },
  { pos: [-72.0, -110.0], rotY: -0.52, tilt: 0.04 },
  { pos: [-6.4, -154.0], rotY: 0.38, tilt: 0.03 },
  { pos: [-88.0, -166.0], rotY: -0.46, tilt: -0.04 },
  { pos: [-6.4, -220.0], rotY: 0.34, tilt: 0.04 },
];

export default function ForestTrailMarkers() {
  const postMeshRef = useRef();
  const tapeMeshRef = useRef();
  const fireflyMeshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 22 gentle fireflies distributed near trail forks & landmark approaches
  const fireflies = useMemo(() => {
    const list = [];
    TRAIL_POST_FORKS.forEach((fork, idx) => {
      const count = idx % 3 === 0 ? 2 : 1;
      for (let c = 0; c < count; c += 1) {
        const angle = (idx * 2.1 + c * 3.14) % (Math.PI * 2);
        const radius = 0.65 + (idx % 4) * 0.28;
        list.push({
          x: fork.pos[0] + Math.cos(angle) * radius,
          y: 0.88 + ((idx + c) % 4) * 0.19,
          z: fork.pos[1] + Math.sin(angle) * radius,
          speed: 0.65 + ((idx * 3 + c) % 5) * 0.14,
          phase: idx * 1.37 + c * 2.4,
        });
      }
    });
    return list;
  }, []);

  useLayoutEffect(() => {
    if (!postMeshRef.current || !tapeMeshRef.current) return;

    TRAIL_POST_FORKS.forEach((fork, idx) => {
      // Weathered wooden post
      dummy.position.set(fork.pos[0], 0.52, fork.pos[1]);
      dummy.rotation.set(fork.tilt, fork.rotY, -fork.tilt * 0.7);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      postMeshRef.current.setMatrixAt(idx, dummy.matrix);

      // Upper & lower weathered reflective tape bands on each post
      [0.24, 0.37].forEach((yOff, bandIdx) => {
        dummy.position.set(
          fork.pos[0] + Math.sin(fork.tilt) * yOff,
          0.52 + yOff,
          fork.pos[1]
        );
        dummy.rotation.set(fork.tilt, fork.rotY, -fork.tilt * 0.7);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        tapeMeshRef.current.setMatrixAt(idx * 2 + bandIdx, dummy.matrix);
      });
    });

    postMeshRef.current.instanceMatrix.needsUpdate = true;
    tapeMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  useFrame(({ clock }) => {
    if (!fireflyMeshRef.current) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < fireflies.length; i += 1) {
      const f = fireflies[i];
      const theta = t * f.speed + f.phase;
      dummy.position.set(
        f.x + Math.sin(theta) * 0.42,
        f.y + Math.sin(theta * 1.6) * 0.16,
        f.z + Math.cos(theta * 0.85) * 0.42
      );
      dummy.rotation.set(0, 0, 0);
      // Gentle breathing pulse so fireflies softly wink in the mist
      const pulse = 0.55 + Math.max(0, Math.sin(theta * 2.1)) * 0.65;
      dummy.scale.setScalar(pulse);
      dummy.updateMatrix();
      fireflyMeshRef.current.setMatrixAt(i, dummy.matrix);
    }
    fireflyMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* 16 Batched Weathered Timber Trail Posts */}
      <instancedMesh
        ref={postMeshRef}
        args={[null, null, TRAIL_POST_FORKS.length]}
        castShadow={false}
        receiveShadow={false}
        frustumCulled={false}
      >
        <boxGeometry args={[0.12, 1.06, 0.12]} />
        <meshLambertMaterial color="#2c2117" />
      </instancedMesh>

      {/* 32 Batched Muted Amber/Silver Reflective Tape Strips (glints in flashlight beam) */}
      <instancedMesh
        ref={tapeMeshRef}
        args={[null, null, TRAIL_POST_FORKS.length * 2]}
        castShadow={false}
        receiveShadow={false}
        frustumCulled={false}
      >
        <boxGeometry args={[0.134, 0.046, 0.134]} />
        <meshStandardMaterial
          color="#d4c39a"
          emissive="#c98e3e"
          emissiveIntensity={0.42}
          roughness={0.26}
          metalness={0.68}
        />
      </instancedMesh>

      {/* 22 Batched Slow-Drifting Tiny Forest Fireflies */}
      <instancedMesh
        ref={fireflyMeshRef}
        args={[null, null, fireflies.length]}
        castShadow={false}
        receiveShadow={false}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.028, 6, 6]} />
        <meshBasicMaterial color="#ebd678" transparent opacity={0.76} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}
