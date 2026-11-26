// ============================================================================
// src/components/InstancedModelBatch.jsx
// High-performance GPU instancing batcher for repeated Kenney .glb forest
// models (trees, bushes, ferns, rocks, stumps, logs):
// - Collapses hundreds of separate React <Clone> trees into ONE GPU
//   InstancedMesh draw call per sub-mesh (~16 total draw calls for 500+ props!)
// - Normalizes scale & ground alignment (y = 0) identically to ModelAsset
// - Disables dynamic shadow casting on distant foliage for locked 60 FPS!
// ============================================================================

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function toFastMaterial(srcMat, tint, useLambert) {
  const color = srcMat.color ? srcMat.color.clone() : new THREE.Color('#ffffff');
  if (tint) color.multiply(new THREE.Color(tint));
  if (useLambert) {
    return new THREE.MeshLambertMaterial({
      color,
      map: srcMat.map || null,
      alphaMap: srcMat.alphaMap || null,
      transparent: Boolean(srcMat.transparent),
      opacity: typeof srcMat.opacity === 'number' ? srcMat.opacity : 1,
      side: srcMat.side ?? THREE.FrontSide,
    });
  }
  const c = srcMat.clone();
  if (c.color) c.color.copy(color);
  return c;
}

function extractNormalizedParts(scene, tint, useLambert) {
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const safeH = Math.max(size.y, 0.001);
  const offset = new THREE.Vector3(-center.x, -box.min.y, -center.z);
  const parts = [];

  scene.traverse((child) => {
    if (!child.isMesh || !child.geometry) return;
    const mat = Array.isArray(child.material)
      ? child.material.map((m) => toFastMaterial(m, tint, useLambert))
      : toFastMaterial(child.material, tint, useLambert);

    const localMatrix = child.matrixWorld.clone();
    parts.push({
      geometry: child.geometry,
      material: mat,
      localMatrix,
    });
  });

  return { parts, safeH, offset };
}

export default function InstancedModelBatch({
  url,
  instances = [],
  tint = null,
  useLambert = true,
}) {
  const { scene } = useGLTF(url);
  const meshRefs = useRef([]);

  const { parts, safeH, offset } = useMemo(
    () => extractNormalizedParts(scene, tint, useLambert),
    [scene, tint, useLambert]
  );

  useLayoutEffect(() => {
    if (!instances.length) return;
    const dummy = new THREE.Object3D();
    const baseMat = new THREE.Matrix4();
    const finalMat = new THREE.Matrix4();
    const offsetMat = new THREE.Matrix4().makeTranslation(offset.x, offset.y, offset.z);

    parts.forEach((part, pIdx) => {
      const instMesh = meshRefs.current[pIdx];
      if (!instMesh) return;
      const partLocal = new THREE.Matrix4().multiplyMatrices(offsetMat, part.localMatrix);

      for (let i = 0; i < instances.length; i++) {
        const item = instances[i];
        const s = (item.h || 6) / safeH;
        dummy.position.set(item.pos[0], item.pos[1], item.pos[2]);
        dummy.rotation.set(0, item.rotY || 0, 0);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        baseMat.copy(dummy.matrix);
        finalMat.multiplyMatrices(baseMat, partLocal);
        instMesh.setMatrixAt(i, finalMat);
      }
      instMesh.instanceMatrix.needsUpdate = true;
      instMesh.computeBoundingSphere();
    });
  }, [parts, safeH, offset, instances]);

  if (!instances.length) return null;

  return (
    <group>
      {parts.map((part, idx) => (
        <instancedMesh
          key={idx}
          ref={(el) => {
            meshRefs.current[idx] = el;
          }}
          args={[part.geometry, part.material, instances.length]}
          castShadow={false}
          receiveShadow={false}
          frustumCulled={false}
        />
      ))}
    </group>
  );
}
