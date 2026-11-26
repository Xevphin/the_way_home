// ============================================================================
// src/components/TownWorld3D.jsx
// Open-world sunlit town powered by real Kenney .glb assets:
// - Suburban houses (building-type-a/b/e), parked cars (Car Kit), oak &
//   detailed trees (Nature Kit), highway signs (City Roads), roadside warungs,
//   persistent Universiti Alam campus with signage, and living pedestrians.
// ============================================================================

import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  TOWN_HOUSES,
  TOWN_PARKED_CARS,
  TOWN_ROUTE_POINTS,
  TOWN_WARUNGS,
} from '../../data/chapter1/sprint2Data';
import BackgroundNPCs from '../shared/BackgroundNPCs';
import ModelAsset from '../shared/ModelAsset';
import TrafficCarModel from '../shared/TrafficCarModel';
import { CampusArchBanner, CampusWelcomeBoard } from './UniversitiAlamSignage';
import { HOUSE_VARIANTS, MODELS } from '../../data/shared/modelCatalog';

export default function TownWorld3D() {
  const { roadSegments, trees } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      TOWN_ROUTE_POINTS.map((p) => new THREE.Vector3(...p))
    );
    const segs = [];
    const steps = 44;
    for (let i = 0; i < steps; i++) {
      const p0 = curve.getPoint(i / steps);
      const p1 = curve.getPoint((i + 1) / steps);
      const mid = p0.clone().add(p1).multiplyScalar(0.5);
      const len = p0.distanceTo(p1) + 0.4;
      const angle = Math.atan2(p1.x - p0.x, p1.z - p0.z);
      segs.push({ id: i, pos: [mid.x, 0.02, mid.z], len, angle, dash: i % 2 === 0 });
    }

    const treeList = [];
    for (let i = 0; i < 42; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const z = 8 - i * 4.1;
      const x = side * (12.5 + ((i * 19) % 14));
      const nearCrossroad = Math.abs(z + 44) < 7.0 || Math.abs(z + 108) < 7.0;
      const nearHouse = TOWN_HOUSES.some(
        (h) => Math.abs(x - h.x) < h.w * 0.5 + 3.5 && Math.abs(z - h.z) < h.d * 0.5 + 3.5
      );
      const nearWarung = TOWN_WARUNGS.some(
        (w) => Math.abs(x - w.x) < 4.8 && Math.abs(z - w.z) < 4.5
      );
      if (nearCrossroad || nearHouse || nearWarung) continue;
      treeList.push({ id: i, x, z, h: 5.2 + (i % 3) * 0.9, alt: i % 2 === 0 });
    }
    return { roadSegments: segs, trees: treeList };
  }, []);

  return (
    <group>
      <ambientLight intensity={0.72} color="#fff9ee" />
      <hemisphereLight args={['#a9d4ff', '#6b9454', 0.56]} />
      <directionalLight position={[28, 42, 18]} intensity={1.82} color="#fff2d6" castShadow />
      <directionalLight position={[-24, 18, -32]} intensity={0.45} color="#cbe2ff" />

      {/* Open Town Green Ground Terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -82]} receiveShadow>
        <planeGeometry args={[180, 230]} />
        <meshStandardMaterial color="#5d8c4d" roughness={0.95} />
      </mesh>

      {/* Winding Asphalt Road Ribbon with Subtle Specular Sheen */}
      {roadSegments.map((seg) => (
        <group key={seg.id} position={seg.pos} rotation={[0, seg.angle, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[8.4, seg.len]} />
            <meshStandardMaterial color="#343a44" roughness={0.54} metalness={0.14} />
          </mesh>
          {seg.dash && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <planeGeometry args={[0.18, seg.len * 0.55]} />
              <meshBasicMaterial color="#e6be4c" />
            </mesh>
          )}
        </group>
      ))}

      {/* Intersecting Cross-Roads */}
      {[-44, -108].map((cz, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, cz]} receiveShadow>
          <planeGeometry args={[95, 7.0]} />
          <meshStandardMaterial color="#383e48" roughness={0.88} />
        </mesh>
      ))}

      {/* Real Kenney Curved Streetlights & White Picket Fences Along Town Road */}
      {[
        [-5.8, -16], [6.4, -30], [9.4, -56], [-6.6, -78], [-9.2, -100], [5.8, -124], [-6.4, -148],
      ].map(([lx, lz], i) => (
        <ModelAsset
          key={`sl_${i}`}
          url={MODELS.streetlight}
          position={[lx, 0, lz]}
          rotation={[0, lx < 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
          targetHeight={6.2}
        />
      ))}
      {TOWN_HOUSES.slice(0, 6).map((h, i) => (
        <ModelAsset
          key={`pf_${i}`}
          url={MODELS.picketFence}
          position={[h.x < 0 ? h.x + 4.4 : h.x - 4.4, 0, h.z]}
          rotation={[0, Math.PI / 2, 0]}
          targetWidth={4.2}
        />
      ))}

      {/* Real Kenney Suburban Houses Along Town Road */}
      {TOWN_HOUSES.map((h, i) => (
        <ModelAsset
          key={i}
          url={HOUSE_VARIANTS[i % HOUSE_VARIANTS.length]}
          position={[h.x, 0, h.z]}
          rotation={[0, h.x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
          targetHeight={6.8}
        />
      ))}

      {/* Roadside Wooden Stalls / Warungs */}
      {TOWN_WARUNGS.map((w, i) => (
        <group key={i} position={[w.x, 0, w.z]} rotation={[0, w.rot, 0]}>
          <mesh position={[0, 0.08, 0]} receiveShadow>
            <boxGeometry args={[4.4, 0.16, 3.2]} />
            <meshStandardMaterial color="#7a5b3e" roughness={0.88} />
          </mesh>
          {[[-1.9, -1.3], [1.9, -1.3], [-1.9, 1.3], [1.9, 1.3]].map(([px, pz], pi) => (
            <mesh key={pi} position={[px, 1.35, pz]}>
              <boxGeometry args={[0.15, 2.6, 0.15]} />
              <meshStandardMaterial color="#593d27" />
            </mesh>
          ))}
          <mesh position={[0, 2.7, 0]} rotation={[0.14, 0, 0]} castShadow>
            <boxGeometry args={[4.7, 0.14, 3.6]} />
            <meshStandardMaterial color={w.awning} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.92, 0.75]}>
            <boxGeometry args={[3.4, 0.85, 0.75]} />
            <meshStandardMaterial color="#8f6845" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Real Kenney Car Kit Parked Roadside Vehicles */}
      {TOWN_PARKED_CARS.map((c, i) => (
        <TrafficCarModel
          key={i}
          variantIndex={i}
          position={[c.x, 0, c.z]}
          rotation={[0, c.rot, 0]}
        />
      ))}

      {/* Persistent Universiti Alam Campus at North End of Town Map (z = -182) */}
      <group position={[0, 0, -182]}>
        {[-6.2, 6.2].map((gx, i) => (
          <mesh key={i} position={[gx, 2.8, 10]} castShadow>
            <boxGeometry args={[1.2, 5.6, 1.2]} />
            <meshStandardMaterial color="#d8cfc0" roughness={0.8} />
          </mesh>
        ))}
        <CampusArchBanner position={[0, 5.3, 10]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 2]} receiveShadow>
          <planeGeometry args={[30, 14]} />
          <meshStandardMaterial color="#383e47" roughness={0.88} />
        </mesh>
        <mesh position={[0, 5.5, -16]} castShadow receiveShadow>
          <boxGeometry args={[26, 11, 11]} />
          <meshStandardMaterial color="#ded5c6" roughness={0.82} />
        </mesh>
        <mesh position={[0, 11.4, -16]}>
          <boxGeometry args={[27.2, 0.9, 12.2]} />
          <meshStandardMaterial color="#7d422d" roughness={0.78} />
        </mesh>
        <mesh position={[0, 4.4, -9.2]} castShadow>
          <boxGeometry args={[11.2, 0.7, 3.6]} />
          <meshStandardMaterial color="#ebe4d8" roughness={0.75} />
        </mesh>
        {[-4.4, -1.8, 1.8, 4.4].map((cx, i) => (
          <mesh key={i} position={[cx, 2.2, -8.2]} castShadow>
            <cylinderGeometry args={[0.26, 0.3, 4.4, 12]} />
            <meshStandardMaterial color="#f2ede4" roughness={0.7} />
          </mesh>
        ))}
        <CampusWelcomeBoard position={[0, 5.4, -7.25]} />
      </group>

      {/* Living Roadside Pedestrians & Warung Patrons */}
      <BackgroundNPCs
        npcs={[
          { id: 'tw_1', pos: [-6.2, 0, -18], endPos: [-5.8, 0, -38], speed: 0.18, shirt: '#b84b39' },
          { id: 'tw_2', pos: [-9.2, 0, -21], rotY: 1.2, shirt: '#3b7355', talking: true },
          { id: 'tw_3', pos: [11.5, 0, -59], rotY: -1.4, shirt: '#c98a2c', talking: true },
          { id: 'tw_4', pos: [7.2, 0, -72], endPos: [5.5, 0, -96], speed: 0.16, shirt: '#395d85' },
          { id: 'tw_5', pos: [-8.2, 0, -122], endPos: [-6.4, 0, -148], speed: 0.17, shirt: '#6c4b7d' },
        ]}
      />

      {/* Real Kenney Nature Kit Trees */}
      {trees.map((t) => (
        <ModelAsset
          key={t.id}
          url={t.alt ? MODELS.oakTree : MODELS.detailedTree}
          position={[t.x, 0, t.z]}
          targetHeight={t.h}
        />
      ))}
    </group>
  );
}
