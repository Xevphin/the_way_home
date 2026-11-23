// ============================================================================
// src/data/interactionRaycast.js
// Strict line-of-sight + close-reach interaction helper:
// Player can ONLY interact with a target when BOTH:
// 1) Euclidean distance to target is < maxDist (default 2.8m)
// 2) Camera forward look vector points directly at the target
//    (cameraDir.dot(toTargetDir) > minDot, default 0.85)
// ============================================================================

import * as THREE from 'three';

const camDir = new THREE.Vector3();
const toTarget = new THREE.Vector3();

export function checkCameraLookAtTarget(
  camera,
  targetPos,
  maxDist = 2.8,
  minDot = 0.85
) {
  const tx = targetPos[0];
  const ty = targetPos[1] !== undefined ? targetPos[1] : 1.1;
  const tz = targetPos[2];

  const dx = tx - camera.position.x;
  const dy = ty - camera.position.y;
  const dz = tz - camera.position.z;
  const planarDist = Math.hypot(dx, dz);

  if (planarDist > maxDist) {
    return { valid: false, distance: planarDist, dot: -1 };
  }

  camera.getWorldDirection(camDir);
  toTarget.set(dx, dy, dz).normalize();
  const dot = camDir.dot(toTarget);

  return {
    valid: dot > minDot,
    distance: planarDist,
    dot,
  };
}
