// ============================================================================
// src/components/RoadsideProps.jsx
// GPU-instanced roadside infrastructure along Route 312 Lembah Batu:
// - Exports ROADSIDE_GUARDRAIL_SEGMENTS so midnightColliders.js registers
//   exact 1:1 solid AABB barriers along every wooden guardrail with openings
//   strictly at designated clearing & Oakside trail turnoffs!
// - Batches all ~140 guardrail posts & ~48 reflector posts into lightweight
//   InstancedMesh draw calls for locked 60 FPS!
// ============================================================================

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import ModelAsset from './ModelAsset';
import { MODELS } from '../data/modelCatalog';

export const ROADSIDE_GUARDRAIL_SEGMENTS = [
  { side: -1, zStart: 118, zEnd: -58 },
  { side: -1, zStart: -70, zEnd: -90 },
  { side: -1, zStart: -103, zEnd: -150 },
  { side: -1, zStart: -162, zEnd: -215 },
  { side: -1, zStart: -229, zEnd: -286 },
  { side: 1, zStart: 118, zEnd: -37 },
  { side: 1, zStart: -49, zEnd: -118 },
  { side: 1, zStart: -144, zEnd: -148 },
  { side: 1, zStart: -161, zEnd: -178 },
  { side: 1, zStart: -189, zEnd: -286 },
];

function SaggingWire({ start, end }) {
  const geometry = useMemo(() => {
    const mid = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2 - 0.85,
      (start[2] + end[2]) / 2,
    ];
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...end)
    );
    return new THREE.TubeGeometry(curve, 8, 0.018, 4, false);
  }, [start, end]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color="#181f29" />
    </mesh>
  );
}

export default function RoadsideProps({ compactMenu = false }) {
  const postInstRef = useRef();
  const refPostInstRef = useRef();

  const { rails, postPositions, reflectors, poleZs } = useMemo(() => {
    const railList = [];
    const posts = [];

    ROADSIDE_GUARDRAIL_SEGMENTS.forEach((seg, idx) => {
      if (compactMenu && seg.zStart < -85) return;
      const zStart = compactMenu ? Math.min(seg.zStart, 18) : seg.zStart;
      const zEnd = compactMenu ? Math.max(seg.zEnd, -85) : seg.zEnd;
      const len = Math.abs(zStart - zEnd);
      if (len < 2) return;
      const midZ = (zStart + zEnd) / 2;
      const xPos = seg.side * 4.85;
      railList.push({ id: idx, xPos, midZ, len });

      const count = Math.max(2, Math.floor(len / 5.4));
      for (let p = 0; p < count; p++) {
        posts.push([xPos, 0.45, zStart - (len * p) / (count - 1)]);
      }
    });

    const refl = [];
    const maxZ = compactMenu ? 12 : 76;
    const minZ = compactMenu ? -82 : -290;
    for (let z = maxZ; z >= minZ; z -= 14) {
      const inLeft =
        (z < -58 && z > -70) ||
        (z < -90 && z > -103) ||
        (z < -150 && z > -162) ||
        (z < -215 && z > -229);
      const inRight =
        (z < -37 && z > -49) || (z < -118 && z > -161) || (z < -178 && z > -189);
      if (!inLeft) refl.push({ id: `L_${z}`, x: -4.45, z, color: '#ff5233' });
      if (!inRight) refl.push({ id: `R_${z}`, x: 4.45, z, color: '#ffbe3d' });
    }

    const poles = compactMenu
      ? [16, -4, -22, -52, -74]
      : [72, 46, 20, -4, -22, -54, -80, -108, -136, -166, -198, -228, -258, -284];

    return { rails: railList, postPositions: posts, reflectors: refl, poleZs: poles };
  }, [compactMenu]);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    if (postInstRef.current) {
      postPositions.forEach(([x, y, z], i) => {
        dummy.position.set(x, y, z);
        dummy.updateMatrix();
        postInstRef.current.setMatrixAt(i, dummy.matrix);
      });
      postInstRef.current.instanceMatrix.needsUpdate = true;
    }
    if (refPostInstRef.current) {
      reflectors.forEach((r, i) => {
        dummy.position.set(r.x, 0.32, r.z);
        dummy.updateMatrix();
        refPostInstRef.current.setMatrixAt(i, dummy.matrix);
      });
      refPostInstRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [postPositions, reflectors]);

  return (
    <group>
      {/* Continuous Wooden Guardrail Beams */}
      {rails.map((r) => (
        <mesh key={r.id} position={[r.xPos, 0.72, r.midZ]}>
          <boxGeometry args={[0.14, 0.18, r.len]} />
          <meshStandardMaterial color="#634e3b" roughness={0.86} />
        </mesh>
      ))}

      {/* GPU-Instanced Guardrail Support Posts (1 draw call!) */}
      {postPositions.length > 0 && (
        <instancedMesh
          ref={postInstRef}
          args={[null, null, postPositions.length]}
          frustumCulled={false}
        >
          <boxGeometry args={[0.16, 0.9, 0.16]} />
          <meshStandardMaterial color="#4e3d2d" roughness={0.88} />
        </instancedMesh>
      )}

      {/* GPU-Instanced Reflector Posts + Glowing Lenses */}
      {reflectors.length > 0 && (
        <instancedMesh
          ref={refPostInstRef}
          args={[null, null, reflectors.length]}
          frustumCulled={false}
        >
          <boxGeometry args={[0.1, 0.64, 0.1]} />
          <meshStandardMaterial color="#272c33" roughness={0.85} />
        </instancedMesh>
      )}
      {reflectors.map((r) => (
        <mesh key={r.id} position={[r.x, 0.54, r.z + 0.055]}>
          <boxGeometry args={[0.09, 0.12, 0.03]} />
          <meshBasicMaterial color={r.color} />
        </mesh>
      ))}

      {/* Real Kenney Utility Poles Set Deep Behind Guardrail (x = 8.4) */}
      {poleZs.map((zPos, i) => (
        <group key={zPos}>
          <ModelAsset
            url={MODELS.utilityPole}
            position={[8.4, 0, zPos]}
            targetHeight={6.0}
            castShadow={false}
          />
          {i < poleZs.length - 1 && (
            <>
              <SaggingWire start={[7.95, 5.55, zPos]} end={[7.95, 5.55, poleZs[i + 1]]} />
              <SaggingWire start={[8.85, 5.55, zPos]} end={[8.85, 5.55, poleZs[i + 1]]} />
            </>
          )}
        </group>
      ))}
    </group>
  );
}
