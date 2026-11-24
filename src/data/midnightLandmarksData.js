// ============================================================================
// src/data/midnightLandmarksData.js
// Unified Chapter 1 Midnight Valley landmarks & gated progression metadata
// set DEEP inside the woods (x = ±44m..±96m) along Oakside-style dirt trails:
// - East trails: Kampung Surau -> Ruin #1 (Stilt House #2) -> Rubber Shed ->
//   Bus Shelter -> Mossy Wakaf
// - West trails: Stilt House #1 -> Forestry Office -> Ranger Watchtower ->
//   Phantom Roadside Stall
// ============================================================================

import { isOnForestTrail } from './forestTrailData';
export { hitsMidnightCollider, getGroundElevationAt } from './midnightColliders';
export { LORE_DOCUMENTS } from './loreDocumentsData';

export const MIDNIGHT_ROAD_LENGTH = 310;

export const LANDMARK_TRANSFORMS = {
  // East deep-woods trail network (x = +44m .. +86m)
  surau: { x: 46.0, z: -46.0, rotY: -0.24 },
  stiltHouse2: { x: 86.0, z: -116.0, rotY: -0.38 },
  rubberShed: { x: 64.0, z: -146.0, rotY: -0.26 },
  busShelter: { x: 44.0, z: -162.0, rotY: -0.18 },
  wakaf: { x: 76.0, z: -194.0, rotY: -0.32 },
  // West deep-woods trail network (x = -48m .. -96m)
  stiltHouse1: { x: -48.0, z: -64.0, rotY: 0.34 },
  forestryOffice: { x: -66.0, z: -102.0, rotY: 0.26 },
  rangerWatchtower: { x: -96.0, z: -158.0, rotY: 0.18 },
  phantomStall: { x: -64.0, z: -222.0, rotY: 0.22 },
};

// Convert a landmark's local offset (lx, ly, lz) into exact world coordinates
function toWorld(origin, lx, ly, lz) {
  const c = Math.cos(origin.rotY);
  const s = Math.sin(origin.rotY);
  return [
    Number((origin.x + lx * c + lz * s).toFixed(2)),
    ly,
    Number((origin.z - lx * s + lz * c).toFixed(2)),
  ];
}

export const FOREST_CLEARINGS = [
  { x: 7.2, z: -14.5, r: 3.6 },
  { x: 5.4, z: -26.0, r: 2.8 },
  { x: 46.0, z: -46.0, r: 9.5 },
  { x: -48.0, z: -64.0, r: 9.2 },
  { x: -66.0, z: -102.0, r: 9.6 },
  { x: 86.0, z: -116.0, r: 9.4 },
  { x: 64.0, z: -146.0, r: 8.6 },
  { x: 44.0, z: -162.0, r: 7.0 },
  { x: -96.0, z: -158.0, r: 9.6 },
  { x: 76.0, z: -194.0, r: 8.8 },
  { x: -64.0, z: -222.0, r: 10.2 },
];

export function isInsideClearing(x, z, pad = 0) {
  if (Math.abs(x) < 6.4 + pad) return true;
  if (isOnForestTrail(x, z, pad)) return true;
  return FOREST_CLEARINGS.some((c) => Math.hypot(x - c.x, z - c.z) < c.r + pad);
}

export const MIDNIGHT_LANDMARKS = {
  carBumper: {
    id: 'inspect_car',
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Dented Front Bumper',
    position: [1.2, 0.95, -2.2],
    radius: 3.0,
  },
  milestone: {
    id: 'clue_milestone',
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Chipped Milestone Marker',
    position: [5.4, 0.85, -26.0],
    radius: 3.0,
  },
  surauElder: {
    id: 'surau_elder',
    keyLabel: 'Press "E"',
    actionLabel: 'To Speak With Uncle',
    position: toWorld(LANDMARK_TRANSFORMS.surau, 0.0, 1.55, -0.5),
    radius: 4.5,
  },
  tornMap: {
    id: 'pickup_map',
    keyLabel: 'Press "E"',
    actionLabel: 'To Pick Up Torn Hand-Drawn Map',
    position: toWorld(LANDMARK_TRANSFORMS.stiltHouse1, 2.28, 1.88, -0.42),
    radius: 3.8,
  },
  boardedCrate: {
    id: 'boarded_crate',
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Boarded-Up Porch Crate',
    position: toWorld(LANDMARK_TRANSFORMS.stiltHouse1, 2.2, 1.95, -0.98),
    radius: 3.8,
  },
  heavyCrowbar: {
    id: 'pickup_crowbar',
    keyLabel: 'Press "E"',
    actionLabel: 'To Pick Up Heavy Crowbar',
    position: toWorld(LANDMARK_TRANSFORMS.stiltHouse2, -1.8, 1.45, 0.5),
    radius: 3.8,
  },
  localNewspaper: {
    id: 'lore_newspaper',
    keyLabel: 'Press "E"',
    actionLabel: 'To Read Yellowed Newspaper Clipping',
    position: toWorld(LANDMARK_TRANSFORMS.stiltHouse2, -1.6, 1.42, -0.8),
    radius: 3.6,
  },
  forestryMemo: {
    id: 'forestry_memo',
    keyLabel: 'Press "E"',
    actionLabel: 'To Read Pasted Official Notice',
    position: toWorld(LANDMARK_TRANSFORMS.forestryOffice, -2.15, 1.55, 0.6),
    radius: 3.4,
  },
  ironKey: {
    id: 'pickup_iron_key',
    keyLabel: 'Press "E"',
    actionLabel: 'To Pick Up Rusted Iron Shed Key',
    position: toWorld(LANDMARK_TRANSFORMS.forestryOffice, -0.7, 0.96, -1.6),
    radius: 3.6,
  },
  shedDoor: {
    id: 'shed_door',
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Padlocked Shed Door',
    position: toWorld(LANDMARK_TRANSFORMS.rubberShed, -1.95, 1.25, 0.0),
    radius: 3.4,
  },
  batteryCell: {
    id: 'pickup_battery_cell',
    keyLabel: 'Press "E"',
    actionLabel: 'To Pick Up Car Battery Cell (Car Part)',
    position: toWorld(LANDMARK_TRANSFORMS.rubberShed, -1.0, 0.95, -0.4),
    radius: 3.6,
  },
  busShelter: {
    id: 'clue_shelter',
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Dropped Surveyor Log',
    position: toWorld(LANDMARK_TRANSFORMS.busShelter, -0.55, 0.88, -0.1),
    radius: 3.2,
  },
  missingPoster: {
    id: 'lore_poster',
    keyLabel: 'Press "E"',
    actionLabel: 'To Read Missing Persons Poster',
    position: toWorld(LANDMARK_TRANSFORMS.rangerWatchtower, 2.0, 1.55, 1.4),
    radius: 3.6,
  },
  loggingPamphlet: {
    id: 'lore_pamphlet',
    keyLabel: 'Press "E"',
    actionLabel: 'To Read Forestry Closure Pamphlet',
    position: toWorld(LANDMARK_TRANSFORMS.rangerWatchtower, -0.6, 1.05, -0.4),
    radius: 3.6,
  },
  wakafChest: {
    id: 'wakaf_chest',
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Padlocked Supply Chest',
    position: toWorld(LANDMARK_TRANSFORMS.wakaf, -0.1, 0.95, -1.3),
    radius: 3.8,
  },
  phantomStall: {
    id: 'phantom_stall',
    keyLabel: 'Press "E"',
    actionLabel: 'To Sit Down & Ask Diners for Help',
    position: toWorld(LANDMARK_TRANSFORMS.phantomStall, 2.4, 1.15, 0.5),
    radius: 4.0,
  },
  repairCar: {
    id: 'repair_car',
    keyLabel: 'Press "E"',
    actionLabel: 'To Install All 3 Parts & Escape',
    position: [1.2, 0.95, -2.2],
    radius: 3.4,
  },
};

export function getMidnightChapter1Task(progress) {
  if (progress.chapterCompleted) return 'Escaped Lembah Batu';
  if (!progress.carInspected) return 'Inspect the front bumper of your car';
  if (!progress.elderSpoken) return 'Follow the east forest trail to Kampung Surau';
  const found =
    (progress.hasBelt ? 1 : 0) +
    (progress.hasBatteryCell ? 1 : 0) +
    (progress.hasStarterRelay ? 1 : 0);
  if (found < 3) {
    return `Explore the forest trails & unlock all 3 car parts (${found}/3)`;
  }
  return 'Return to your stalled sedan and install all 3 car components';
}
