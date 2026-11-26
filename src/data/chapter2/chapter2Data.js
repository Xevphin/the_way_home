// ============================================================================
// src/data/chapter2/chapter2Data.js
// Data, dialogue scripts, 200m endless road victim body milestones, Lurker
// ultimatum lines, and Gameplay 2 morning bedroom chores for Chapter 2.
// ============================================================================

export const CH2_DOOR_Z = -200;
export const CH2_LURKER_Z = -197.2;
export const CH2_CUTSCENE2_TRIGGER_Z = -186.5;

export const CH2_CUTSCENE1_LINES = [
  {
    atSec: 1.4,
    tag: 'YOU',
    text: 'Ughh... where am I...? Everything is just fog...',
  },
  {
    atSec: 4.9,
    tag: 'YOU',
    text: "Wait... 'Welcome to Lembah Batu'... no, how am I back on Route 312?!",
  },
  {
    atSec: 8.8,
    tag: 'INNER THOUGHT',
    text: 'No trees, no cars, nothing... just this road and my flashlight. I have to keep walking.',
  },
];

// Spawned progressively along the 200m road ONLY after Chapter 2 opening credits finish!
export const CH2_VICTIM_MILESTONES = [
  {
    id: 'victim_1',
    triggerZ: -32,
    pos: [-1.35, 0, -48.0],
    rotY: 0.48,
    puddleScale: 1.35,
    shirtColor: '#a6adb8',
    reaction: 'What the—is that someone lying on the asphalt?! Oh God, there is blood everywhere...',
  },
  {
    id: 'victim_2',
    triggerZ: -64,
    pos: [1.55, 0, -80.0],
    rotY: -0.92,
    puddleScale: 1.6,
    shirtColor: '#98a3b0',
    reaction: 'Another one?! No, no, no... these people were all motorists from Route 312...',
  },
  {
    id: 'victim_3',
    triggerZ: -96,
    pos: [-1.6, 0, -112.0],
    rotY: 1.25,
    puddleScale: 1.75,
    shirtColor: '#b0a89f',
    reaction: "There's more of them stretched across the road... why is the whispering getting louder?!",
  },
  {
    id: 'victim_4',
    triggerZ: -128,
    pos: [1.35, 0, -144.0],
    rotY: -0.45,
    puddleScale: 1.9,
    shirtColor: '#9ca6b2',
    reaction: 'My legs feel heavy... I cannot even run. Something is waiting up ahead in the mist...',
  },
  {
    id: 'victim_5',
    triggerZ: -156,
    pos: [-1.1, 0, -172.0],
    rotY: 0.72,
    puddleScale: 2.05,
    shirtColor: '#aeb5bf',
    reaction: 'A wooden door standing right in the middle of the road... and that thing is standing in front of it!',
  },
];

export const CH2_ULTIMATUM_SCRIPT = [
  {
    tag: 'THE LURKER',
    text: 'Look closely at what lies behind you... every soul who wanders down Route 312 belongs to this fog.',
    durationMs: 4200,
  },
  {
    tag: 'THE LURKER',
    text: 'More will come tonight. More will stall. And they will keep dying one by one.',
    durationMs: 3900,
  },
  {
    tag: 'THE LURKER',
    text: 'Do not try to play the hero and save these poor souls... because if you do—',
    durationMs: 3100,
  },
];

export const CH2_MORNING_CHORES = [
  {
    id: 'ch2_phone',
    label: 'Check your buzzing phone on the bedside table',
    keyLabel: 'Press "E"',
    actionLabel: 'To Check Bedside Phone',
    position: [-5.35, 0.72, 2.55],
    toast:
      'Three missed messages from Hafiz and a local news alert about Route 312... Just a nightmare. Thank God.',
  },
  {
    id: 'ch2_freshen',
    label: 'Wash your face in the kitchen sink',
    keyLabel: 'Press "E"',
    actionLabel: 'To Wash Cold Water on Face',
    position: [-4.4, 0.96, -4.8],
    toast:
      'Cold water helps... my heart is still racing, but I am safe at home.',
  },
  {
    id: 'ch2_keys',
    label: 'Grab your keys from the living room table',
    keyLabel: 'Press "E"',
    actionLabel: 'To Grab Car & House Keys',
    position: [3.0, 0.56, 2.55],
    toast:
      'Got my keys. I cannot shake that warning... I need to meet Hafiz and figure out what is happening on Route 312.',
  },
];

export const CH2_FRONT_DOOR_TARGET = {
  id: 'ch2_front_door',
  keyLabel: 'Press "E"',
  actionLabel: 'To Step Outside & Finish Chapter 2',
  position: [3.2, 1.3, -5.8],
};

export function getChapter2MorningTask(completedIds) {
  const next = CH2_MORNING_CHORES.find((c) => !completedIds.includes(c.id));
  if (next) return `${next.label} (${completedIds.length}/${CH2_MORNING_CHORES.length})`;
  return 'Head out the front door';
}
