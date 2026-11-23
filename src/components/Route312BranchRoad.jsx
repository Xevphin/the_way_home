// ============================================================================
// src/components/Route312BranchRoad.jsx
// Shared seamless curved off-ramp road (Route 312 Lembah Batu) used by BOTH
// EveningHighwayScene.jsx and NightTrafficDetour.jsx so the junction matches
// consistently between evening and midnight:
// - Single continuous flared BufferGeometry asphalt ribbon (+0.01m above E18)
// - Unbroken outer left white shoulder line curving smoothly from x = -5.6
// - Inner right white shoulder line starting cleanly after the highway gore
// - Dashed yellow centerline & dense Kenney pine forest trees framing the exit
// ============================================================================

import React, { useMemo } from 'react';
import * as THREE from 'three';
import ModelAsset from './ModelAsset';
import { MODELS } from '../data/modelCatalog';

export function createRoute312Curve() {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.8, 0, -35.0),
    new THREE.Vector3(-2.6, 0, -42.5),
    new THREE.Vector3(-7.4, 0, -51.5),
    new THREE.Vector3(-16.5, 0, -63.0),
    new THREE.Vector3(-29.5, 0, -79.0),
    new THREE.Vector3(-46.5, 0, -102.0),
    new THREE.Vector3(-64.5, 0, -130.0),
  ]);
}

function buildRibbonGeometry(pointsLeft, pointsRight, y) {
  const count = pointsLeft.length;
  const positions = new Float32Array(count * 2 * 3);
  const indices = [];

  for (let i = 0; i < count; i++) {
    const l = pointsLeft[i];
    const r = pointsRight[i];
    positions[i * 6 + 0] = l.x;
    positions[i * 6 + 1] = y;
    positions[i * 6 + 2] = l.z;
    positions[i * 6 + 3] = r.x;
    positions[i * 6 + 4] = y;
    positions[i * 6 + 5] = r.z;

    if (i < count - 1) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = (i + 1) * 2;
      const d = (i + 1) * 2 + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

const BRANCH_TREES = [
  [-15.5, -47], [-20.5, -54], [-26.5, -62], [-34.5, -72], [-43.0, -84], [-53.0, -98],
  [-8.5, -59], [-13.5, -67], [-20.5, -77], [-28.5, -89], [-38.0, -102], [-48.0, -116],
];

export default function Route312BranchRoad({
  asphaltColor = '#1b2028',
  shoulderColor = '#d8e0eb',
  treeTint = '#3b5443',
}) {
  const { asphaltGeom, leftLineGeom, rightLineGeom, centerDashes } = useMemo(() => {
    const curve = createRoute312Curve();
    const steps = 48;
    const aspL = [];
    const aspR = [];
    const shLInner = [];
    const shLOuter = [];
    const shRInner = [];
    const shROuter = [];
    const dashes = [];

    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const pt = curve.getPointAt(u);
      const tan = curve.getTangentAt(u).normalize();
      // Right-hand perpendicular in XZ plane (pointing right of travel direction)
      const right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

      // At the merge throat (u < 0.14), flare left edge flush with main E18 (-6.2)
      // and tuck right edge cleanly inside the E18 asphalt so there is zero seam
      const mergeT = Math.min(1, u / 0.14);
      const leftHalf = THREE.MathUtils.lerp(4.4, 3.6, mergeT);
      const rightHalf = THREE.MathUtils.lerp(0.6, 3.6, mergeT);

      aspL.push(pt.clone().addScaledVector(right, -leftHalf));
      aspR.push(pt.clone().addScaledVector(right, rightHalf));

      // Continuous outer (left) white shoulder line starting flush at x = -5.6
      const shOffset = THREE.MathUtils.lerp(3.8, 3.2, mergeT);
      shLOuter.push(pt.clone().addScaledVector(right, -(shOffset + 0.09)));
      shLInner.push(pt.clone().addScaledVector(right, -(shOffset - 0.09)));

      // Inner (right) white shoulder line starts cleanly once outside main E18 edge (-5.6)
      const rEdge = pt.clone().addScaledVector(right, 3.2);
      if (u >= 0.21 && rEdge.x <= -5.55) {
        shRInner.push(pt.clone().addScaledVector(right, 3.2 - 0.09));
        shROuter.push(pt.clone().addScaledVector(right, 3.2 + 0.09));
      }

      if (i >= 8 && i < steps && i % 3 === 0) {
        const next = curve.getPointAt((i + 1) / steps);
        const mid = pt.clone().add(next).multiplyScalar(0.5);
        const len = pt.distanceTo(next) * 0.82;
        const angle = Math.atan2(next.x - pt.x, next.z - pt.z);
        dashes.push({ id: i, pos: [mid.x, 0.028, mid.z], len, angle });
      }
    }

    return {
      asphaltGeom: buildRibbonGeometry(aspL, aspR, 0.02),
      leftLineGeom: buildRibbonGeometry(shLOuter, shLInner, 0.027),
      rightLineGeom:
        shRInner.length >= 2 ? buildRibbonGeometry(shRInner, shROuter, 0.027) : null,
      centerDashes: dashes,
    };
  }, []);

  return (
    <group>
      {/* Seamless Flared Branch Asphalt (+0.01m above main E18 highway y = 0.01) */}
      <mesh geometry={asphaltGeom} receiveShadow>
        <meshStandardMaterial color={asphaltColor} roughness={0.82} metalness={0.14} />
      </mesh>

      {/* Unbroken Curved Outer Left White Shoulder Line Merging From E18 */}
      <mesh geometry={leftLineGeom}>
        <meshBasicMaterial color={shoulderColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner Right White Shoulder Line (Starts Cleanly Past E18 Gore Point) */}
      {rightLineGeom && (
        <mesh geometry={rightLineGeom}>
          <meshBasicMaterial color={shoulderColor} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Dashed Yellow Centerline Along Route 312 */}
      {centerDashes.map((d) => (
        <mesh
          key={d.id}
          position={d.pos}
          rotation={[-Math.PI / 2, 0, d.angle]}
        >
          <planeGeometry args={[0.15, d.len]} />
          <meshBasicMaterial color="#c4a042" />
        </mesh>
      ))}

      {/* Real Kenney Pine Forest Trees Framing Both Sides of Route 312 */}
      {BRANCH_TREES.map(([tx, tz], i) => (
        <ModelAsset
          key={i}
          url={i % 2 === 0 ? MODELS.pineTall : MODELS.pineAlt}
          position={[tx, 0, tz]}
          targetHeight={8.6}
          tint={treeTint}
        />
      ))}
    </group>
  );
}
