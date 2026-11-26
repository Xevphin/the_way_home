// ============================================================================
// src/data/escapeChaseData.js
// Rebalanced road hazards, generous lane clearance gaps & roadside forest
// layout for the Chapter 1 Third-Person Car Escape Chase on Route 312.
// ============================================================================

export const CHASE_DISTANCE = 440;
export const CHASE_SPEED = 18.5;
export const LANE_BOUND = 3.25;
export const MAX_INTEGRITY = 3;
export const ROAR_DURATION = 4.2;

// Clean, fair single-lane hazards across a 9.2m highway (wide steer clearance every wave!)
export const CHASE_HAZARDS = [
  { id: 'h01', type: 'log', x: -2.2, z: -46, halfW: 0.92, halfZ: 0.58 },
  { id: 'h02', type: 'boulder', x: 2.25, z: -82, halfW: 0.78, halfZ: 0.72 },
  { id: 'h03', type: 'body', x: 0.0, z: -116, halfW: 0.65, halfZ: 0.68 },
  { id: 'h04', type: 'log', x: 2.2, z: -150, halfW: 0.92, halfZ: 0.58 },
  { id: 'h05', type: 'lunge', x: -2.8, targetX: -0.35, z: -186, halfW: 0.75, halfZ: 0.72 },
  { id: 'h06', type: 'boulder', x: -2.25, z: -220, halfW: 0.78, halfZ: 0.72 },
  { id: 'h07', type: 'body', x: 2.1, z: -254, halfW: 0.65, halfZ: 0.68 },
  { id: 'h08', type: 'log', x: -2.15, z: -288, halfW: 0.92, halfZ: 0.58 },
  { id: 'h09', type: 'lunge', x: 2.8, targetX: 0.35, z: -322, halfW: 0.75, halfZ: 0.72 },
  { id: 'h10', type: 'boulder', x: 0.0, z: -356, halfW: 0.78, halfZ: 0.72 },
  { id: 'h11', type: 'body', x: -2.2, z: -388, halfW: 0.65, halfZ: 0.68 },
  { id: 'h12', type: 'log', x: 2.2, z: -416, halfW: 0.92, halfZ: 0.58 },
];

export function buildChaseTreeCorridor() {
  const trees = [];
  for (let i = 0; i < 48; i++) {
    const z = 12 - i * 10.2;
    const jitterL = ((i * 19) % 7) * 0.35;
    const jitterR = ((i * 23) % 7) * 0.35;
    trees.push({
      id: `cl_${i}`,
      pos: [-6.6 - jitterL, 0, z],
      height: 8.6 + (i % 4) * 1.15,
      variant: i % 4,
      rotY: (i * 1.3) % 6.28,
    });
    trees.push({
      id: `cr_${i}`,
      pos: [6.6 + jitterR, 0, z - 4.2],
      height: 8.8 + ((i + 2) % 4) * 1.1,
      variant: (i + 2) % 4,
      rotY: (i * 2.1) % 6.28,
    });
  }
  return trees;
}
