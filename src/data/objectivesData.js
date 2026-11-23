// ============================================================================
// src/data/objectivesData.js
// Defines Quran verse data, minimalist progressive tasks (with no keybind
// text), scavenging items, Safe Zones, and world interactables.
// ============================================================================

export const QURAN_VERSE_DATA = {
  arabic:
    'إِنَّ الشَّيْطَانَ لَكُمْ عَدُوٌّ فَاتَّخِذُوهُ عَدُوًّا ۚ إِنَّمَا يَدْعُو حِزْبَهُ لِيَكُونُوا مِنْ أَصْحَابِ السَّعِيرِ',
  translation:
    '"Indeed, Satan is an enemy to you; so take him as an enemy. He only invites his party to be among the companions of the Blaze."',
  citation: 'Surah Fatir (35:6)',
};

export const SCAVENGE_ITEMS = [
  {
    id: 'item_map',
    name: 'Folding Road Map',
    shortName: 'Road Map',
    locationLabel: 'Abandoned Roadside Stall (West, 20m N)',
    position: [-6.0, 1.02, -18.0],
    toast:
      "Someone left a folded map here... And why do I feel like I'm being watched from the trees?",
  },
  {
    id: 'item_batteries',
    name: 'Spare Batteries',
    shortName: 'Batteries',
    locationLabel: 'Wooden Forest Hut (West, 60m N)',
    position: [-7.2, 1.05, -60.0],
    toast:
      'Fresh batteries—thank God. My flashlight beam was barely holding out against this fog.',
  },
  {
    id: 'item_gate_key',
    name: 'Roadside Gate Key',
    shortName: 'Gate Key',
    locationLabel: 'Caretaker Watch Booth (East, 98m N)',
    position: [6.5, 1.05, -98.0],
    toast:
      'A heavy brass padlock key... This has to open the North Highway Gate.',
  },
];

export const SAFE_ZONES = [
  {
    id: 'surau_sanctuary',
    name: 'Kampung Roadside Surau',
    position: [13.5, 0, -44.0],
    rotationY: -0.24,
    radius: 7.4,
    respawnPoint: [9.2, 1.7, -43.0],
    respawnYaw: Math.PI / 2,
  },
  {
    id: 'wakaf_sanctuary',
    name: 'Wayfarer Lantern Wakaf',
    position: [15.2, 0, -184.0],
    rotationY: -0.32,
    radius: 6.8,
    respawnPoint: [10.8, 1.7, -183.0],
    respawnYaw: Math.PI / 2,
  },
];

export const WORLD_INTERACTABLES = {
  carBumper: {
    id: 'inspect_car',
    name: 'Dented Front Bumper',
    position: [1.2, 0.95, -2.2],
    interactRadius: 2.8,
  },
  northGate: {
    id: 'north_gate',
    name: 'North Highway Gate',
    position: [0, 1.35, -114.0],
    interactRadius: 2.8,
  },
  highwayOverlook: {
    id: 'highway_overlook',
    name: 'Main Highway Overlook',
    position: [0, 1.4, -131.0],
    interactRadius: 2.8,
  },
};

// Returns the single active borderless objective text (no keybinds like [E])
export function getActiveTaskPrompt(progress) {
  if (progress.demoCompleted) {
    return 'Reached the Main Highway Overlook';
  }
  if (!progress.carInspected) {
    return 'Inspect the front bumper of your car';
  }
  if (progress.collectedItems.length < SCAVENGE_ITEMS.length) {
    return `Search the abandoned roadside stall and wooden hut for supplies (${progress.collectedItems.length}/3)`;
  }
  if (!progress.gateUnlocked) {
    return 'Use the Gate Key to unlock the North Highway Gate';
  }
  return 'Walk through the open gate to the Main Highway Overlook';
}
