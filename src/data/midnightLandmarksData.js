// ============================================================================
// src/data/midnightLandmarksData.js
// Unified Chapter 1 Midnight Valley landmarks & gated progression metadata
// across 8 Oakside-style woodland clearings off Route 312 Lembah Batu:
// - Kampung Surau, Stilt House #1 (Boarded Crate -> Belt), Forestry Office
//   (Memo + Rusted Iron Key), Stilt House #2 Outer Ruin (Heavy Crowbar +
//   Newspaper), Rubber Tapper's Shed (Locked Door -> Battery Cell), Ranger
//   Watchtower (Missing Poster + Pamphlet), Mossy Wakaf (Riddle Chest ->
//   Starter Relay), and Phantom Roadside Stall.
// ============================================================================

import { isOnForestTrail } from './forestTrailData';
export { hitsMidnightCollider, getGroundElevationAt } from './midnightColliders';
export { LORE_DOCUMENTS } from './loreDocumentsData';

export const MIDNIGHT_ROAD_LENGTH = 310;

export const LANDMARK_TRANSFORMS = {
  surau: { x: 13.5, z: -44.0, rotY: -0.24 },
  stiltHouse1: { x: -16.4, z: -64.0, rotY: 0.34 },
  forestryOffice: { x: -15.6, z: -96.0, rotY: 0.26 },
  stiltHouse2: { x: 17.2, z: -124.0, rotY: -0.38 },
  rubberShed: { x: 14.8, z: -138.0, rotY: -0.26 },
  busShelter: { x: 9.6, z: -154.0, rotY: -0.18 },
  rangerWatchtower: { x: -21.5, z: -156.0, rotY: 0.18 },
  wakaf: { x: 15.2, z: -184.0, rotY: -0.32 },
  phantomStall: { x: -14.6, z: -222.0, rotY: 0.22 },
};

export const FOREST_CLEARINGS = [
  { x: 7.2, z: -14.5, r: 3.6 },
  { x: 5.4, z: -26.0, r: 2.8 },
  { x: 13.5, z: -44.0, r: 8.2 },
  { x: 7.8, z: -42.5, r: 4.2 },
  { x: -16.4, z: -64.0, r: 8.2 },
  { x: -9.2, z: -64.0, r: 4.6 },
  { x: -15.6, z: -96.0, r: 8.6 },
  { x: -8.6, z: -96.5, r: 4.8 },
  { x: 17.2, z: -124.0, r: 8.2 },
  { x: 14.8, z: -138.0, r: 7.4 },
  { x: 8.6, z: -138.0, r: 4.4 },
  { x: 9.6, z: -154.0, r: 5.8 },
  { x: -21.5, z: -156.0, r: 8.6 },
  { x: -12.0, z: -156.0, r: 4.8 },
  { x: 15.2, z: -184.0, r: 7.6 },
  { x: 8.8, z: -183.0, r: 4.2 },
  { x: -14.6, z: -222.0, r: 9.2 },
  { x: -8.2, z: -222.5, r: 4.8 },
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
    position: [13.5, 1.55, -44.5],
    radius: 4.4,
  },
  tornMap: {
    id: 'pickup_map',
    keyLabel: 'Press "E"',
    actionLabel: 'To Pick Up Torn Hand-Drawn Map',
    position: [-14.0, 1.45, -63.4],
    radius: 3.6,
  },
  boardedCrate: {
    id: 'boarded_crate',
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Boarded-Up Porch Crate',
    position: [-14.3, 1.48, -64.3],
    radius: 3.6,
  },
  heavyCrowbar: {
    id: 'pickup_crowbar',
    keyLabel: 'Press "E"',
    actionLabel: 'To Pick Up Heavy Crowbar',
    position: [15.4, 1.45, -123.5],
    radius: 3.8,
  },
  localNewspaper: {
    id: 'lore_newspaper',
    keyLabel: 'Press "E"',
    actionLabel: 'To Read Yellowed Newspaper Clipping',
    position: [15.6, 1.42, -124.8],
    radius: 3.6,
  },
  forestryMemo: {
    id: 'forestry_memo',
    keyLabel: 'Press "E"',
    actionLabel: 'To Read Pasted Official Notice',
    position: [-17.86, 1.55, -95.39],
    radius: 3.2,
  },
  ironKey: {
    id: 'pickup_iron_key',
    keyLabel: 'Press "E"',
    actionLabel: 'To Pick Up Rusted Iron Shed Key',
    position: [-16.3, 0.96, -97.6],
    radius: 3.4,
  },
  shedDoor: {
    id: 'shed_door',
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Padlocked Shed Door',
    position: [12.85, 1.25, -138.0],
    radius: 3.2,
  },
  batteryCell: {
    id: 'pickup_battery_cell',
    keyLabel: 'Press "E"',
    actionLabel: 'To Pick Up Car Battery Cell (Car Part)',
    position: [13.7, 0.95, -138.4],
    radius: 3.4,
  },
  busShelter: {
    id: 'clue_shelter',
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Dropped Surveyor Log',
    position: [9.01, 0.88, -154.11],
    radius: 3.0,
  },
  missingPoster: {
    id: 'lore_poster',
    keyLabel: 'Press "E"',
    actionLabel: 'To Read Missing Persons Poster',
    position: [-19.4, 1.55, -154.6],
    radius: 3.4,
  },
  loggingPamphlet: {
    id: 'lore_pamphlet',
    keyLabel: 'Press "E"',
    actionLabel: 'To Read Forestry Closure Pamphlet',
    position: [-22.1, 1.05, -156.4],
    radius: 3.4,
  },
  wakafChest: {
    id: 'wakaf_chest',
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Padlocked Supply Chest',
    position: [15.1, 0.95, -185.3],
    radius: 3.8,
  },
  phantomStall: {
    id: 'phantom_stall',
    keyLabel: 'Press "E"',
    actionLabel: 'To Sit Down & Ask Diners for Help',
    position: [-12.2, 1.15, -222.5],
    radius: 3.8,
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
  if (!progress.elderSpoken) return 'Approach the lantern-lit Kampung Surau ahead';
  const found =
    (progress.hasBelt ? 1 : 0) +
    (progress.hasBatteryCell ? 1 : 0) +
    (progress.hasStarterRelay ? 1 : 0);
  if (found < 3) {
    return `Explore the forest trails & unlock all 3 car parts (${found}/3)`;
  }
  return 'Return to your stalled sedan and install all 3 car components';
}
