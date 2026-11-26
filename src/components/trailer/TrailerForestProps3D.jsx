// ============================================================================
// src/components/trailer/TrailerForestProps3D.jsx
// 100% procedural GPU-instanced pine forest, wooden guardrails, and glowing
// roadside reflectors for the Chapter 1 Trailer (zero .glb dependencies).
// ============================================================================

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

export function ProceduralPineForest() {
  const trunkRef = useRef();
  const tier1Ref = useRef();
  const tier2Ref = useRef();
  const tier3Ref = useRef();

  const trees = useMemo(() => {
    const list = [];
    let seed = 9187;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let z = 14; z >= -248; z -= 4.2) {
      [-1, 1].forEach((side) => {
        [6.8, 11.4, 17.5, 25.0].forEach((band, bIdx) => {
          const x = side * (band + rand() * 3.8);
          const tz = z + (rand() - 0.5) * 3.2;
          // Keep clean sightlines for hero tree flyers, welcome sign, and sprint corridor
          if (Math.abs(x - -5.65) < 2.3 && Math.abs(tz - -16.5) < 2.6) return;
          if (Math.abs(x - 5.65) < 2.3 && Math.abs(tz - -35.0) < 2.6) return;
          if (Math.abs(x - 7.2) < 2.8 && Math.abs(tz - -14.5) < 2.6) return;
          if (x > 8.1 && x < 11.2 && tz < -75 && tz > -106) return;
          list.push({
            x,
            z: tz,
            scaleH: (bIdx === 0 ? 0.92 : 1.12) + rand() * 0.45,
            scaleR: 0.88 + rand() * 0.36,
            rotY: rand() * Math.PI * 2,
          });
        });
      });
    }
    return list;
  }, []);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    trees.forEach((tr, i) => {
      dummy.rotation.set(0, tr.rotY, 0);
      dummy.position.set(tr.x, 3.0 * tr.scaleH, tr.z);
      dummy.scale.set(tr.scaleR, tr.scaleH, tr.scaleR);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tr.x, 4.1 * tr.scaleH, tr.z);
      dummy.scale.set(tr.scaleR * 1.15, tr.scaleH, tr.scaleR * 1.15);
      dummy.updateMatrix();
      tier1Ref.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tr.x, 6.0 * tr.scaleH, tr.z);
      dummy.scale.set(tr.scaleR * 0.88, tr.scaleH * 0.92, tr.scaleR * 0.88);
      dummy.updateMatrix();
      tier2Ref.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tr.x, 7.65 * tr.scaleH, tr.z);
      dummy.scale.set(tr.scaleR * 0.58, tr.scaleH * 0.82, tr.scaleR * 0.58);
      dummy.updateMatrix();
      tier3Ref.current?.setMatrixAt(i, dummy.matrix);
    });
    [trunkRef, tier1Ref, tier2Ref, tier3Ref].forEach((r) => {
      if (r.current) r.current.instanceMatrix.needsUpdate = true;
    });
  }, [trees]);

  const count = trees.length;
  return (
    <group>
      <instancedMesh ref={trunkRef} args={[null, null, count]} frustumCulled={false}>
        <cylinderGeometry args={[0.16, 0.28, 6.0, 7]} />
        <meshStandardMaterial color="#1f1812" roughness={0.96} />
      </instancedMesh>
      <instancedMesh ref={tier1Ref} args={[null, null, count]} frustumCulled={false}>
        <coneGeometry args={[1.95, 3.6, 7]} />
        <meshStandardMaterial color="#0d1a14" roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={tier2Ref} args={[null, null, count]} frustumCulled={false}>
        <coneGeometry args={[1.65, 3.2, 7]} />
        <meshStandardMaterial color="#102119" roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={tier3Ref} args={[null, null, count]} frustumCulled={false}>
        <coneGeometry args={[1.35, 2.8, 7]} />
        <meshStandardMaterial color="#13261d" roughness={0.95} />
      </instancedMesh>
    </group>
  );
}

export function ProceduralGuardrailsAndReflectors() {
  const postRef = useRef();
  const posts = useMemo(() => {
    const arr = [];
    for (let z = 14; z >= -246; z -= 6.5) {
      arr.push([-4.75, 0.45, z], [4.75, 0.45, z]);
    }
    return arr;
  }, []);

  const reflectors = useMemo(() => {
    const arr = [];
    for (let z = 10; z >= -242; z -= 14) {
      arr.push({ id: `L${z}`, x: -4.45, z, color: '#ff492e' });
      arr.push({ id: `R${z}`, x: 4.45, z, color: '#ffbf3b' });
    }
    return arr;
  }, []);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    posts.forEach(([x, y, z], i) => {
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      postRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (postRef.current) postRef.current.instanceMatrix.needsUpdate = true;
  }, [posts]);

  return (
    <group>
      {[-4.75, 4.75].map((xPos, i) => (
        <mesh key={i} position={[xPos, 0.7, -116]}>
          <boxGeometry args={[0.14, 0.18, 262]} />
          <meshStandardMaterial color="#4e3d2e" roughness={0.88} />
        </mesh>
      ))}
      <instancedMesh ref={postRef} args={[null, null, posts.length]} frustumCulled={false}>
        <boxGeometry args={[0.15, 0.9, 0.15]} />
        <meshStandardMaterial color="#3c2f23" roughness={0.9} />
      </instancedMesh>
      {reflectors.map((r) => (
        <mesh key={r.id} position={[r.x, 0.56, r.z]}>
          <boxGeometry args={[0.09, 0.12, 0.04]} />
          <meshBasicMaterial color={r.color} />
        </mesh>
      ))}
    </group>
  );
}
