// ============================================================================
// src/data/chapter2/studioSetData.js
// Data for Chapter 2's Movie Studio Behind-the-Scenes Plot Twist:
// - Cutscene 2 ("CUT!! Alright, that's a wrap!") dialogue exchange
// - Solid AABB soundstage colliders + interactive cast, crew & exit door
// ============================================================================

export const STUDIO_CUTSCENE_SCRIPT = [
  {
    tag: 'DIRECTOR',
    text: "CUT!! Alright, that's a wrap! Solid take, everyone!",
    durationMs: 3200,
  },
  {
    tag: 'YOU',
    text: 'Well, thanks for that, boss.',
    durationMs: 2400,
  },
  {
    tag: 'DIRECTOR',
    text: "Go take a break with the rest of the actors for now—we're going to continue filming Chapter 2 shortly.",
    durationMs: 4200,
  },
];

// Solid AABB colliders (with 0.35m player shoulder buffer) inside the 28m x 28m soundstage
export const STUDIO_COLLIDERS = [
  // Standalone wooden door prop frame at center-south
  { id: 'door_prop', minX: -1.1, maxX: 1.1, minZ: 4.55, maxZ: 5.45 },
  // Director's playback monitor desk
  { id: 'monitor_desk', minX: -2.2, maxX: 2.2, minZ: -5.4, maxZ: -3.2 },
  // Camera dolly rig on tracks (west-center)
  { id: 'camera_dolly', minX: -6.4, maxX: -4.2, minZ: -2.2, maxZ: 2.6 },
  // Cast lounge sofa & gaming TV stand (west-north)
  { id: 'lounge_sofa', minX: -11.4, maxX: -6.6, minZ: -9.8, maxZ: -7.6 },
  { id: 'gaming_tv', minX: -10.8, maxX: -7.2, minZ: -12.6, maxZ: -11.4 },
  // Craft services coffee station (east-north)
  { id: 'coffee_table', minX: 7.4, maxX: 11.4, minZ: -9.6, maxZ: -7.2 },
];

export const STUDIO_INTERACTABLES = [
  {
    id: 'studio_director',
    keyLabel: 'Press "E"',
    actionLabel: 'To Talk With the Director',
    position: [0.0, 1.45, -3.1],
    radius: 3.2,
    tag: 'DIRECTOR',
    line: "Man, the fog machine almost choked the boom mic on that last shot! Grab some water—next scene is gonna blow everyone's minds.",
  },
  {
    id: 'studio_cameraman',
    keyLabel: 'Press "E"',
    actionLabel: 'To Talk With the Cameraman',
    position: [-5.1, 1.45, 0.4],
    radius: 3.2,
    tag: 'CAMERAMAN',
    line: 'Did you see that dolly zoom on the Route 312 sign? Pure cinema, bro. Just resetting the focus ring before the next take.',
  },
  {
    id: 'studio_lurker',
    keyLabel: 'Press "E"',
    actionLabel: 'To Chat With the Lurker Actor',
    position: [-9.0, 1.25, -8.4],
    radius: 3.2,
    tag: 'LURKER ACTOR',
    line: "Bro, this black shroud is like a portable sauna... hold on, don't distract me, Amir is spamming the same combo again!",
  },
  {
    id: 'studio_amir',
    keyLabel: 'Press "E"',
    actionLabel: 'To Chat With Amir',
    position: [-10.3, 1.25, -8.4],
    radius: 3.0,
    tag: 'AMIR',
    line: "Haha, 3-0 against the forest demon! Imagine being scared of a guy who can't even block a low kick.",
  },
  {
    id: 'studio_hafiz',
    keyLabel: 'Press "E"',
    actionLabel: 'To Chat With Hafiz',
    position: [-7.7, 1.25, -8.4],
    radius: 3.0,
    tag: 'HAFIZ',
    line: "Winner plays me next! By the way, your panicked face in the endless fog was Oscar-worthy, man.",
  },
  {
    id: 'studio_uncle',
    keyLabel: 'Press "E"',
    actionLabel: 'To Dap Up Uncle / Ustaz',
    position: [8.4, 1.45, -6.5],
    radius: 3.2,
    tag: 'UNCLE / USTAZ',
    line: 'Solid acting out there, nephew. Take a breather and grab a kopi—even spirits respect a good brew between takes.',
  },
  {
    id: 'studio_exit_door',
    keyLabel: 'Press "E"',
    actionLabel: 'To Wrap Up Break & Finish Chapter 2',
    position: [0.0, 1.45, -13.2],
    radius: 3.2,
    tag: '',
    line: '',
  },
];

export function getStudioInteractableById(id) {
  return STUDIO_INTERACTABLES.find((item) => item.id === id) || null;
}
