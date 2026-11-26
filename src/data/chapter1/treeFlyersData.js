// ============================================================================
// src/data/treeFlyersData.js
// 10 weathered Missing Person posters ("HILANG / MISSING") and child-drawn
// Lurker sketches nailed to roadside & deep-trail forest tree trunks.
// Each entry doubles as a PlayerController [E] inspectable target!
// ============================================================================

export const TREE_FLYERS = [
  {
    id: 'tree_flyer_1',
    kind: 'missing',
    variant: 0,
    position: [-5.65, 1.62, -16.5],
    rotY: 1.42,
    tiltZ: 0.05,
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Missing Person Poster',
    radius: 3.4,
    reaction:
      'A faded "HILANG / MISSING" poster nailed to the bark... last seen right here on Route 312.',
  },
  {
    id: 'tree_flyer_2',
    kind: 'sketch',
    variant: 0,
    position: [5.65, 1.56, -35.0],
    rotY: -1.48,
    tiltZ: -0.07,
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Child Sketch',
    radius: 3.4,
    reaction:
      '"HE WATCHES FROM THE TREES"... A child drew that tall hooded figure with hollow black eyes.',
  },
  {
    id: 'tree_flyer_3',
    kind: 'missing',
    variant: 1,
    position: [14.5, 1.58, -44.2],
    rotY: -0.55,
    tiltZ: 0.04,
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Missing Person Poster',
    radius: 3.4,
    reaction:
      'Another missing motorist from Lembah Batu... the bottom tear-off phone tabs are completely soaked.',
  },
  {
    id: 'tree_flyer_4',
    kind: 'sketch',
    variant: 1,
    position: [-14.2, 1.6, -63.0],
    rotY: 0.68,
    tiltZ: -0.05,
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Child Sketch',
    radius: 3.4,
    reaction:
      '"DON\'T LOOK AT HIS EYES"... Whoever nailed this notebook page here was terrified.',
  },
  {
    id: 'tree_flyer_5',
    kind: 'missing',
    variant: 2,
    position: [-5.65, 1.64, -84.0],
    rotY: 1.5,
    tiltZ: -0.06,
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Missing Person Poster',
    radius: 3.4,
    reaction:
      'Three weeks missing near Kampung Hulu... car found stalled with the hazards still blinking.',
  },
  {
    id: 'tree_flyer_6',
    kind: 'sketch',
    variant: 2,
    position: [-26.5, 1.55, -97.5],
    rotY: 0.42,
    tiltZ: 0.08,
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Child Sketch',
    radius: 3.4,
    reaction:
      '"NO ESCAPE" scratched in red crayon across a dark forest drawing... my skin is crawling.',
  },
  {
    id: 'tree_flyer_7',
    kind: 'missing',
    variant: 0,
    position: [5.65, 1.6, -114.0],
    rotY: -1.52,
    tiltZ: 0.04,
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Missing Person Poster',
    radius: 3.4,
    reaction:
      'Rain-stained missing flyer... how many people have vanished along this stretch of road?',
  },
  {
    id: 'tree_flyer_8',
    kind: 'sketch',
    variant: 3,
    position: [26.0, 1.58, -143.0],
    rotY: -0.48,
    tiltZ: -0.06,
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Child Sketch',
    radius: 3.4,
    reaction:
      '"IT STANDS ON THE ROAD"... Just like the thing that stepped in front of my headlights.',
  },
  {
    id: 'tree_flyer_9',
    kind: 'missing',
    variant: 1,
    position: [-34.0, 1.62, -155.5],
    rotY: 0.38,
    tiltZ: 0.06,
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Missing Person Poster',
    radius: 3.4,
    reaction:
      'A forestry volunteer disappeared near the watchtower trail... "LAST SEEN NEAR ROUTE 312".',
  },
  {
    id: 'tree_flyer_10',
    kind: 'sketch',
    variant: 4,
    position: [-5.65, 1.56, -206.0],
    rotY: 1.46,
    tiltZ: -0.05,
    keyLabel: 'Press "E"',
    actionLabel: 'To Inspect Child Sketch',
    radius: 3.4,
    reaction:
      '"DON\'T FOLLOW THE LIGHTS"... Every warning out here points straight to the same thing.',
  },
];

export function getTreeFlyerById(id) {
  return TREE_FLYERS.find((f) => f.id === id) || null;
}
