// ============================================================================
// src/data/forestTrailData.js
// Deep-woods Oakside-style interconnected winding dirt trail network branching
// far off both sides of Route 312 (x = ±44m .. ±96m):
// - East trails: Kampung Surau (46,-46) -> Ruin #1 (86,-116) -> Rubber Shed
//   (64,-146) -> Bus Shelter (44,-162) -> Mossy Wakaf (76,-194)
// - West trails: Stilt House #1 (-48,-64) -> Forestry Office (-66,-102) ->
//   Ranger Watchtower (-96,-158) -> Phantom Stall (-64,-222)
// ============================================================================

export const DIRT_TURNOFFS = [
  // East Clearings
  { pos: [46.0, 0.015, -46.0], rotY: -0.24, size: [14.0, 13.0] },
  { pos: [86.0, 0.015, -116.0], rotY: -0.38, size: [13.5, 13.0] },
  { pos: [64.0, 0.015, -146.0], rotY: -0.26, size: [12.5, 12.0] },
  { pos: [44.0, 0.015, -162.0], rotY: -0.18, size: [10.0, 10.0] },
  { pos: [76.0, 0.015, -194.0], rotY: -0.32, size: [13.0, 12.5] },
  // West Clearings
  { pos: [-48.0, 0.015, -64.0], rotY: 0.34, size: [13.5, 13.0] },
  { pos: [-66.0, 0.015, -102.0], rotY: 0.26, size: [14.0, 13.5] },
  { pos: [-96.0, 0.015, -158.0], rotY: 0.18, size: [14.0, 13.5] },
  { pos: [-64.0, 0.015, -222.0], rotY: 0.22, size: [14.5, 14.0] },
];

export const FOREST_TRAIL_WAYPOINTS = [
  // ---- EAST ROAD TURNOFFS (connecting Route 312 x=+5 deep into East Woods) ----
  { a: [5.0, -43], b: [22.0, -44], w: 3.4 },
  { a: [22.0, -44], b: [46.0, -46], w: 3.4 }, // Road -> Kampung Surau
  { a: [5.0, -138], b: [30.0, -142], w: 3.2 },
  { a: [30.0, -142], b: [64.0, -146], w: 3.2 }, // Road -> Rubber Shed
  { a: [5.0, -184], b: [36.0, -188], w: 3.2 },
  { a: [36.0, -188], b: [76.0, -194], w: 3.2 }, // Road -> Mossy Wakaf

  // ---- EAST OAKSIDE LOOP: Surau (46,-46) <-> Ruin #1 (86,-116) <-> Shed (64,-146) <-> Wakaf (76,-194) ----
  { a: [46.0, -46], b: [74.0, -68], w: 3.1 },
  { a: [74.0, -68], b: [92.0, -94], w: 3.1 },
  { a: [92.0, -94], b: [86.0, -116], w: 3.1 },
  { a: [46.0, -46], b: [50.0, -84], w: 2.9 },
  { a: [50.0, -84], b: [62.0, -112], w: 2.9 },
  { a: [62.0, -112], b: [86.0, -116], w: 2.9 },
  { a: [86.0, -116], b: [88.0, -138], w: 3.0 },
  { a: [88.0, -138], b: [64.0, -146], w: 3.0 },
  { a: [64.0, -146], b: [44.0, -162], w: 2.9 }, // Spur to Collapsed Bus Shelter
  { a: [64.0, -146], b: [86.0, -168], w: 3.0 },
  { a: [86.0, -168], b: [76.0, -194], w: 3.0 },
  { a: [44.0, -162], b: [56.0, -182], w: 2.9 },
  { a: [56.0, -182], b: [76.0, -194], w: 2.9 },

  // ---- WEST ROAD TURNOFFS (connecting Route 312 x=-5 deep into West Woods) ----
  { a: [-5.0, -64], b: [-24.0, -64], w: 3.4 },
  { a: [-24.0, -64], b: [-48.0, -64], w: 3.4 }, // Road -> Stilt House #1
  { a: [-5.0, -96], b: [-34.0, -99], w: 3.2 },
  { a: [-34.0, -99], b: [-66.0, -102], w: 3.2 }, // Road -> Forestry Office
  { a: [-5.0, -156], b: [-48.0, -157], w: 3.2 },
  { a: [-48.0, -157], b: [-96.0, -158], w: 3.2 }, // Road -> Ranger Watchtower
  { a: [-5.0, -222], b: [-34.0, -222], w: 3.4 },
  { a: [-34.0, -222], b: [-64.0, -222], w: 3.4 }, // Road -> Phantom Stall

  // ---- WEST OAKSIDE LOOP: Stilt #1 (-48,-64) <-> Office (-66,-102) <-> Watchtower (-96,-158) <-> Stall (-64,-222) ----
  { a: [-48.0, -64], b: [-72.0, -76], w: 3.1 },
  { a: [-72.0, -76], b: [-66.0, -102], w: 3.1 },
  { a: [-48.0, -64], b: [-46.0, -86], w: 2.9 },
  { a: [-46.0, -86], b: [-66.0, -102], w: 2.9 },
  { a: [-66.0, -102], b: [-94.0, -124], w: 3.1 },
  { a: [-94.0, -124], b: [-96.0, -158], w: 3.1 },
  { a: [-66.0, -102], b: [-68.0, -136], w: 2.9 },
  { a: [-68.0, -136], b: [-96.0, -158], w: 2.9 },
  { a: [-96.0, -158], b: [-96.0, -194], w: 3.1 },
  { a: [-96.0, -194], b: [-64.0, -222], w: 3.1 },
  { a: [-68.0, -158], b: [-62.0, -192], w: 2.9 },
  { a: [-62.0, -192], b: [-64.0, -222], w: 2.9 },
];

export const FOREST_TRAIL_MESHES = FOREST_TRAIL_WAYPOINTS.map((seg, idx) => {
  const dx = seg.b[0] - seg.a[0];
  const dz = seg.b[1] - seg.a[1];
  const len = Math.hypot(dx, dz) + 2.0;
  return {
    id: `trail_${idx}`,
    pos: [(seg.a[0] + seg.b[0]) * 0.5, 0.013, (seg.a[1] + seg.b[1]) * 0.5],
    rotY: Math.atan2(dx, dz),
    size: [seg.w, len],
  };
});

export function isOnForestTrail(x, z, pad = 0) {
  for (const seg of FOREST_TRAIL_WAYPOINTS) {
    const ax = seg.a[0];
    const az = seg.a[1];
    const bx = seg.b[0];
    const bz = seg.b[1];
    const abx = bx - ax;
    const abz = bz - az;
    const lenSq = abx * abx + abz * abz;
    const t = lenSq > 0 ? Math.max(0, Math.min(1, ((x - ax) * abx + (z - az) * abz) / lenSq)) : 0;
    const px = ax + abx * t;
    const pz = az + abz * t;
    if (Math.hypot(x - px, z - pz) < seg.w * 0.5 + 1.35 + pad) {
      return true;
    }
  }
  return false;
}
