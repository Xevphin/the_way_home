// ============================================================================
// src/components/DenseForestFoliage.jsx
// 60 FPS GPU-instanced deep forest & Oakside-style branching trail network:
// - Batches ~500+ Kenney trees, bushes & forest-floor props into ~16
//   InstancedModelBatch draw calls (zero mid-cutscene lag, dynamic shadows off)
// - Renders winding woodland dirt trails looping between all 8 landmarks
// - Drifting low volumetric ground mist patches rolling through the trees
// ============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import InstancedModelBatch from '../shared/InstancedModelBatch';
import ForestTrailMarkers from './ForestTrailMarkers';
import {
  FOREST_BUSH_VARIANTS,
  FOREST_FLOOR_VARIANTS,
  FOREST_TREE_VARIANTS,
} from '../../data/shared/modelCatalog';
import { isInsideClearing } from '../../data/chapter1/midnightLandmarksData';
import { DIRT_TURNOFFS, FOREST_TRAIL_MESHES } from '../../data/chapter1/forestTrailData';

let cachedMistTex = null;
function getGroundMistTexture() {
  if (cachedMistTex) return cachedMistTex;
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, 'rgba(148, 174, 206, 0.24)');
  g.addColorStop(0.55, 'rgba(116, 142, 174, 0.10)');
  g.addColorStop(1, 'rgba(90, 110, 140, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  cachedMistTex = new THREE.CanvasTexture(c);
  cachedMistTex.needsUpdate = true;
  return cachedMistTex;
}

function groupByUrl(items) {
  const map = new Map();
  items.forEach((item) => {
    if (!map.has(item.url)) map.set(item.url, []);
    map.get(item.url).push(item);
  });
  return Array.from(map.entries());
}

export default function DenseForestFoliage({ compactMenu = false }) {
  const mistGroupRef = useRef();
  const mistTex = useMemo(() => getGroundMistTexture(), []);

  const { treeGroups, bushGroups, floorGroups, fogPatches } = useMemo(() => {
    const tList = [];
    const bList = [];
    const fList = [];
    const mList = [];

    let seed = 4207;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const zStart = compactMenu ? 12 : 118;
    const zEnd = compactMenu ? -86 : -302;
    const zStep = compactMenu ? 4.8 : 7.8;

    // Deep-Woods Layered Forest Rings enveloping Route 312 & all Oakside trails out to x = ±112m
    for (let z = zStart; z >= zEnd; z -= zStep) {
      [-1, 1].forEach((side) => {
        const rings = compactMenu ? [9.2, 16.5] : [10.0, 26.0, 45.0, 66.0, 88.0, 110.0];
        rings.forEach((baseDist, rIdx) => {
          const x = side * (baseDist + rand() * 12.0);
          const tz = z + (rand() - 0.5) * 6.2;
          if (isInsideClearing(x, tz, 0.8)) return;
          const vIdx = Math.floor(rand() * FOREST_TREE_VARIANTS.length);
          const h = (rIdx === 0 ? 7.6 : rIdx <= 2 ? 9.8 : 11.8) + rand() * 3.0;
          tList.push({
            url: FOREST_TREE_VARIANTS[vIdx],
            pos: [x, 0, tz],
            rotY: rand() * Math.PI * 2,
            h,
          });
        });

        // Understory bushes & tall ferns lining road edge, deep trails & clearings
        if (rand() > 0.25) {
          const bx = side * (7.5 + rand() * 98.0);
          const bz = z + (rand() - 0.5) * 6.4;
          if (!isInsideClearing(bx, bz, -0.35)) {
            const bIdx = Math.floor(rand() * FOREST_BUSH_VARIANTS.length);
            bList.push({
              url: FOREST_BUSH_VARIANTS[bIdx],
              pos: [bx, 0, bz],
              rotY: rand() * Math.PI * 2,
              h: 1.05 + rand() * 0.95,
            });
          }
        }

        // Mossy boulders, old stumps & fallen logs on deep forest floor
        if (!compactMenu && rand() > 0.58) {
          const fx = side * (8.5 + rand() * 96.0);
          const fz = z + (rand() - 0.5) * 6.0;
          if (!isInsideClearing(fx, fz, -0.3)) {
            const fIdx = Math.floor(rand() * FOREST_FLOOR_VARIANTS.length);
            fList.push({
              url: FOREST_FLOOR_VARIANTS[fIdx],
              pos: [fx, 0, fz],
              rotY: rand() * Math.PI * 2,
              h: fIdx <= 1 ? 1.15 + rand() * 0.85 : 0.72 + rand() * 0.45,
            });
          }
        }
      });
    }

    const fogStep = compactMenu ? 14 : 14;
    for (let z = compactMenu ? -10 : 72; z >= zEnd + 10; z -= fogStep) {
      mList.push({
        id: `fg_${mList.length}`,
        x: (rand() - 0.5) * 24,
        y: 0.45 + rand() * 0.95,
        z,
        size: 22 + rand() * 14,
        speed: 0.16 + rand() * 0.18,
        phase: rand() * Math.PI * 2,
      });
    }

    return {
      treeGroups: groupByUrl(tList),
      bushGroups: groupByUrl(bList),
      floorGroups: groupByUrl(fList),
      fogPatches: mList,
    };
  }, [compactMenu]);

  useFrame(({ clock }) => {
    if (!mistGroupRef.current) return;
    const t = clock.getElapsedTime();
    mistGroupRef.current.children.forEach((mesh, i) => {
      const p = fogPatches[i];
      if (!p) return;
      mesh.position.x = p.x + Math.sin(t * p.speed + p.phase) * 2.6;
    });
  });

  return (
    <group>
      {/* Organic Muddy Dirt Clearings & Oakside-Style Winding Woodland Trails */}
      {!compactMenu && (
        <>
          {DIRT_TURNOFFS.map((dt, idx) => (
            <mesh key={`cl_${idx}`} position={dt.pos} rotation={[-Math.PI / 2, 0, dt.rotY]}>
              <planeGeometry args={dt.size} />
              <meshLambertMaterial color="#241e18" />
            </mesh>
          ))}
          {FOREST_TRAIL_MESHES.map((tr) => (
            <mesh key={tr.id} position={tr.pos} rotation={[-Math.PI / 2, 0, tr.rotY]}>
              <planeGeometry args={tr.size} />
              <meshLambertMaterial color="#292119" />
            </mesh>
          ))}
          <ForestTrailMarkers />
        </>
      )}

      {/* GPU-Instanced Forest Trees (~7 draw calls instead of 500+!) */}
      {treeGroups.map(([url, instances]) => (
        <InstancedModelBatch key={url} url={url} instances={instances} tint="#415c4a" />
      ))}

      {/* GPU-Instanced Understory Bushes & Ferns */}
      {bushGroups.map(([url, instances]) => (
        <InstancedModelBatch key={url} url={url} instances={instances} tint="#395240" />
      ))}

      {/* GPU-Instanced Forest Floor Rocks, Stumps & Fallen Logs */}
      {floorGroups.map(([url, instances]) => (
        <InstancedModelBatch key={url} url={url} instances={instances} tint="#5c615a" />
      ))}

      {/* Low Drifting Ground Mist Sheets */}
      {mistTex && (
        <group ref={mistGroupRef}>
          {fogPatches.map((fg) => (
            <mesh key={fg.id} position={[fg.x, fg.y, fg.z]} rotation={[-Math.PI / 2, 0, fg.phase]}>
              <planeGeometry args={[fg.size, fg.size]} />
              <meshBasicMaterial map={mistTex} transparent opacity={0.68} depthWrite={false} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
