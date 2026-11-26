// ============================================================================
// src/data/midnightColliders.js
// Midnight Valley movement helpers:
// - Solid AABB fence colliders for Route 312 wooden roadside guardrails
//   (leaving all designated clearing & Oakside trail turnoffs wide open) and
//   the Old Ranger Watchtower timber perimeter yard fences
// - Smooth floor & wooden stair elevation for Surau, Wakaf, Stilt Houses & Watchtower
// ============================================================================

import { LANDMARK_TRANSFORMS } from './midnightLandmarksData';
import { ROADSIDE_GUARDRAIL_SEGMENTS } from '../../components/chapter1/RoadsideProps';

function toLocal(x, z, origin) {
  const dx = x - origin.x;
  const dz = z - origin.z;
  const c = Math.cos(-origin.rotY);
  const s = Math.sin(-origin.rotY);
  return { lx: dx * c - dz * s, lz: dx * s + dz * c };
}

function getStiltHouseElevation(h) {
  if (h.lx >= 1.25 && h.lx <= 2.75 && Math.abs(h.lz) <= 2.75) return 1.08;
  if (h.lx > 2.75 && h.lx <= 4.15 && h.lz >= -0.25 && h.lz <= 1.85) {
    return Math.max(0, Math.min(1, (4.15 - h.lx) / 1.4)) * 1.08;
  }
  return 0;
}

// Solid invisible fence colliders matching all roadside guardrails & compound yard fences
export function hitsMidnightCollider(x, z) {
  // 1) Route 312 continuous wooden roadside guardrail fences (openings at every trail turnoff)
  for (const seg of ROADSIDE_GUARDRAIL_SEGMENTS) {
    const xPos = seg.side * 4.85;
    if (Math.abs(x - xPos) < 0.42) {
      const zMin = Math.min(seg.zStart, seg.zEnd);
      const zMax = Math.max(seg.zStart, seg.zEnd);
      if (z >= zMin - 0.25 && z <= zMax + 0.25) return true;
    }
  }

  // 2) Old Ranger Watchtower timber perimeter yard fences (local lz = ±4.5, lx in [-4.4, +4.4])
  const wt = toLocal(x, z, LANDMARK_TRANSFORMS.rangerWatchtower);
  if (
    wt.lx >= -4.75 &&
    wt.lx <= 4.75 &&
    (Math.abs(wt.lz - 4.5) < 0.42 || Math.abs(wt.lz + 4.5) < 0.42)
  ) {
    return true;
  }

  return false;
}

// Smooth floor & wooden stair elevation for Surau (0.64m), Wakaf (0.56m), Stilt Houses (1.08m) & Watchtower (0.16m)
export function getGroundElevationAt(x, z) {
  const su = toLocal(x, z, LANDMARK_TRANSFORMS.surau);
  if (su.lx >= -2.75 && su.lx <= 3.15 && Math.abs(su.lz) <= 3.1) return 0.64;
  if (su.lx >= -3.95 && su.lx < -2.75 && Math.abs(su.lz) <= 1.75) {
    return Math.max(0, Math.min(1, (su.lx + 3.95) / 1.2)) * 0.64;
  }

  const wk = toLocal(x, z, LANDMARK_TRANSFORMS.wakaf);
  if (wk.lx >= -2.35 && wk.lx <= 2.35 && Math.abs(wk.lz) <= 2.35) return 0.56;
  if (wk.lx > 2.35 && wk.lx <= 3.3 && Math.abs(wk.lz) <= 1.45) {
    return Math.max(0, Math.min(1, (3.3 - wk.lx) / 0.95)) * 0.56;
  }

  const h1Elev = getStiltHouseElevation(toLocal(x, z, LANDMARK_TRANSFORMS.stiltHouse1));
  if (h1Elev > 0) return h1Elev;
  const h2Elev = getStiltHouseElevation(toLocal(x, z, LANDMARK_TRANSFORMS.stiltHouse2));
  if (h2Elev > 0) return h2Elev;

  const wt = toLocal(x, z, LANDMARK_TRANSFORMS.rangerWatchtower);
  if (wt.lx >= -2.7 && wt.lx <= 2.7 && Math.abs(wt.lz) <= 2.8) return 0.16;

  return 0;
}
