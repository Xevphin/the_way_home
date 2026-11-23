// ============================================================================
// src/data/forestTrailData.js
// Slender: The Arrival (Oakside Park)-inspired interconnected looping dirt
// trail network branching off both sides of the main Route 312 asphalt road:
// - Circular clearing ring loops around all 8 sites
// - Inner & outer parallel curved woodland loops + cross-connectors + spurs
// - Keeps every dirt footpath & clearing 100% free of tree/boulder obstacles
// ============================================================================

export const DIRT_TURNOFFS = [
  // East Side Clearings & Road Turnoffs (Sites 1..5)
  { pos: [8.4, 0.014, -43.0], rotY: -0.18, size: [9.5, 4.4] },
  { pos: [13.5, 0.015, -44.0], rotY: -0.24, size: [11.4, 11.0] },
  { pos: [10.5, 0.014, -124.0], rotY: -0.22, size: [11.6, 4.0] },
  { pos: [17.2, 0.015, -124.0], rotY: -0.38, size: [11.2, 11.2] },
  { pos: [9.4, 0.014, -138.0], rotY: -0.16, size: [10.8, 4.4] },
  { pos: [14.8, 0.015, -138.0], rotY: -0.26, size: [10.6, 10.6] },
  { pos: [7.4, 0.014, -154.0], rotY: -0.14, size: [7.6, 8.0] },
  { pos: [9.2, 0.014, -183.2], rotY: -0.22, size: [10.4, 3.8] },
  { pos: [15.2, 0.015, -184.0], rotY: -0.32, size: [10.6, 10.4] },
  // West Side Clearings & Road Turnoffs (Sites 6..9)
  { pos: [-9.6, 0.014, -64.0], rotY: 0.2, size: [11.8, 4.4] },
  { pos: [-16.4, 0.015, -64.0], rotY: 0.34, size: [11.6, 11.6] },
  { pos: [-9.2, 0.014, -96.5], rotY: 0.14, size: [11.5, 4.6] },
  { pos: [-15.6, 0.015, -96.0], rotY: 0.26, size: [12.0, 12.0] },
  { pos: [-27.2, 0.015, -96.0], rotY: 0.1, size: [6.4, 6.4] },
  { pos: [-11.5, 0.014, -156.0], rotY: 0.12, size: [15.2, 4.0] },
  { pos: [-21.5, 0.015, -156.0], rotY: 0.18, size: [12.2, 12.0] },
  { pos: [-8.8, 0.014, -222.4], rotY: 0.12, size: [10.8, 5.2] },
  { pos: [-14.6, 0.015, -222.0], rotY: 0.22, size: [12.6, 12.6] },
];

// Interconnected Oakside Park double-loops, cross-trails & site perimeter rings
export const FOREST_TRAIL_WAYPOINTS = [
  // EAST LOOP 1-2: Kampung Surau (Site 1, -44) <-> Outer Ruin / Stilt House #2 (Site 2, -124)
  { a: [14.5, -48], b: [22.0, -64], w: 2.9 },
  { a: [22.0, -64], b: [26.5, -86], w: 2.9 },
  { a: [26.5, -86], b: [25.0, -108], w: 2.9 },
  { a: [25.0, -108], b: [18.8, -121], w: 2.9 },
  { a: [13.5, -49], b: [13.0, -74], w: 2.7 },
  { a: [13.0, -74], b: [13.8, -98], w: 2.7 },
  { a: [13.8, -98], b: [16.2, -119], w: 2.7 },
  { a: [13.4, -86], b: [26.5, -86], w: 2.6 }, // Mid-loop cross-trail

  // EAST LOOP 2-3-4: Stilt House #2 (-124) <-> Rubber Shed (Site 3, -138) + Bus Shelter Spur (Site 4, -154)
  { a: [16.8, -127], b: [15.2, -134], w: 2.9 },
  { a: [19.5, -125], b: [25.5, -134], w: 2.8 },
  { a: [25.5, -134], b: [24.0, -145], w: 2.8 },
  { a: [24.0, -145], b: [16.2, -142], w: 2.8 },
  { a: [14.0, -142], b: [10.2, -152], w: 2.7 }, // Spur to Site 4

  // EAST LOOP 3-5: Rubber Shed (-138) <-> Mossy Wakaf (Site 5, -184) + Upper Oakside Split-Ring Loop
  { a: [18.5, -142], b: [25.5, -160], w: 2.9 },
  { a: [25.5, -160], b: [24.0, -178], w: 2.9 },
  { a: [24.0, -178], b: [17.5, -184], w: 2.9 },
  { a: [13.5, -142], b: [12.8, -164], w: 2.7 },
  { a: [12.8, -164], b: [14.2, -180], w: 2.7 },
  { a: [17.5, -184], b: [23.2, -193], w: 2.7 },
  { a: [23.2, -193], b: [16.5, -198], w: 2.7 },
  { a: [16.5, -198], b: [13.2, -188], w: 2.7 },
  { a: [15.2, -184], b: [17.8, -196], w: 2.4 }, // Central split path inside Site 5 loop

  // WEST LOOP 6-7: Stilt House #1 (Site 6, -64) <-> Forestry Office (Site 7, -96) + West Spur
  { a: [-17.8, -68], b: [-25.2, -78], w: 2.9 },
  { a: [-25.2, -78], b: [-25.5, -90], w: 2.9 },
  { a: [-25.5, -90], b: [-18.2, -96], w: 2.9 },
  { a: [-15.0, -68], b: [-13.2, -82], w: 2.7 },
  { a: [-13.2, -82], b: [-14.8, -92], w: 2.7 },
  { a: [-19.2, -96], b: [-27.2, -96], w: 2.7 }, // Spur to west cache (Site 9 style)

  // WEST LOOP 7-8-9: Forestry Office (-96) <-> Ranger Watchtower (Site 8, -156) <-> Phantom Stall (-222)
  { a: [-18.5, -101], b: [-26.5, -118], w: 2.9 },
  { a: [-26.5, -118], b: [-27.2, -138], w: 2.9 },
  { a: [-27.2, -138], b: [-22.5, -152], w: 2.9 },
  { a: [-15.0, -101], b: [-15.2, -126], w: 2.7 },
  { a: [-15.2, -126], b: [-19.5, -151], w: 2.7 },
  { a: [-15.2, -126], b: [-26.8, -126], w: 2.6 }, // Mid-loop cross-trail
  { a: [-22.5, -161], b: [-26.2, -184], w: 2.9 },
  { a: [-26.2, -184], b: [-23.5, -206], w: 2.9 },
  { a: [-23.5, -206], b: [-16.2, -220], w: 2.9 },
  { a: [-19.5, -161], b: [-15.5, -190], w: 2.7 },
  { a: [-15.5, -190], b: [-14.2, -217], w: 2.7 },
];

export const FOREST_TRAIL_MESHES = FOREST_TRAIL_WAYPOINTS.map((seg, idx) => {
  const dx = seg.b[0] - seg.a[0];
  const dz = seg.b[1] - seg.a[1];
  const len = Math.hypot(dx, dz) + 1.6;
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
    if (Math.hypot(x - px, z - pz) < seg.w * 0.5 + 1.25 + pad) {
      return true;
    }
  }
  return false;
}
