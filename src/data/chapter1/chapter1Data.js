// ============================================================================
// src/data/chapter1Data.js
// Data for Sprint 1 (Chapter 1 — Morning Routine & The Invitation):
// - 3 morning chores, Front Door, Driveway Car interactable (no [E] in tasks)
// - Solid AABB furniture colliders
// - Opening credits cards, Friend 1 dialogue, and active task helper
// ============================================================================

export const MORNING_CHORES = [
  {
    id: 'chore_bag',
    label: 'University Bag',
    keyLabel: 'Press "E"',
    actionLabel: 'To Grab University Bag',
    position: [-1.82, 0.99, 4.91],
    radius: 2.6,
    thought: 'Got my laptop and lecture folder packed. Almost forgot my charger.',
  },
  {
    id: 'chore_coffee',
    label: 'Morning Coffee',
    keyLabel: 'Press "E"',
    actionLabel: 'To Pour Morning Coffee',
    position: [-3.12, 1.07, -4.96],
    radius: 2.6,
    thought: 'Hot coffee... definitely needed that before a two-hour morning seminar.',
  },
  {
    id: 'chore_notes',
    label: 'Assignment Notes',
    keyLabel: 'Press "E"',
    actionLabel: 'To Check Assignment Notes',
    position: [3.35, 0.54, 2.35],
    radius: 2.7,
    thought: 'Submission is due tonight at midnight—good thing I finished the draft early.',
  },
];

export const FRONT_DOOR_TARGET = {
  id: 'front_door',
  keyLabel: 'Press "E"',
  actionLabel: 'To Answer the Front Door',
  position: [3.2, 1.25, -5.85],
  radius: 2.7,
};

export const DRIVEWAY_CAR_TARGET = {
  id: 'driveway_car',
  keyLabel: 'Press "E"',
  actionLabel: 'To Get in Car & Drive to Class',
  position: [4.7, 1.05, -12.4],
  radius: 2.8,
};

// Solid AABB bounding boxes (includes 0.35m player shoulder buffer)
export const HOME_FURNITURE_COLLIDERS = [
  { id: 'bed', minX: -5.95, maxX: -3.25, minZ: 3.05, maxZ: 5.35 },
  { id: 'nightstand', minX: -5.95, maxX: -4.85, minZ: 2.0, maxZ: 3.05 },
  { id: 'desk', minX: -3.25, maxX: -1.15, minZ: 4.3, maxZ: 5.75 },
  { id: 'kitchen_counter', minX: -5.45, maxX: -1.0, minZ: -5.95, maxZ: -4.25 },
  { id: 'coffee_table', minX: 1.85, maxX: 4.15, minZ: 1.65, maxZ: 3.45 },
  { id: 'sofa_south', minX: 0.9, maxX: 6.1, minZ: 4.1, maxZ: 5.95 },
  { id: 'sofa_east', minX: 4.85, maxX: 6.35, minZ: 0.95, maxZ: 4.35 },
  { id: 'piano', minX: -0.45, maxX: 0.95, minZ: 2.65, maxZ: 4.75 },
  { id: 'arcade', minX: 5.15, maxX: 6.4, minZ: 4.65, maxZ: 5.95 },
  { id: 'driveway_sedan', minX: 4.05, maxX: 6.35, minZ: -14.7, maxZ: -10.1 },
  // Exterior front yard picket fences (z = -16.6) & side yard fence boundaries
  { id: 'front_yard_fence_west', minX: -7.2, maxX: 0.45, minZ: -17.0, maxZ: -16.1 },
  { id: 'front_yard_fence_east', minX: 7.55, maxX: 11.6, minZ: -17.0, maxZ: -16.1 },
  { id: 'driveway_side_fence_west', minX: -6.6, maxX: -5.85, minZ: -16.6, maxZ: -5.8 },
  { id: 'driveway_side_fence_east', minX: 8.25, maxX: 9.0, minZ: -16.6, maxZ: -5.8 },
];

export const OPENING_CREDITS = [
  {
    id: 'directed',
    eyebrow: 'DIRECTED & WRITTEN BY',
    title: 'XEVPHIN',
    subtitle: '',
    delayMs: 1200,
    durationMs: 2200,
  },
  {
    id: 'story',
    eyebrow: 'STORY & NARRATIVE DIRECTION',
    title: 'XEVPHIN',
    subtitle: '',
    delayMs: 3600,
    durationMs: 2200,
  },
  {
    id: 'level',
    eyebrow: '3D LEVEL DESIGN & ATMOSPHERE',
    title: 'GEMINI NEON',
    subtitle: '',
    delayMs: 6000,
    durationMs: 2200,
  },
  {
    id: 'audio',
    eyebrow: 'PROCEDURAL SOUND & HORROR SCORE',
    title: 'GEMINI NEON',
    subtitle: '',
    delayMs: 8400,
    durationMs: 2200,
  },
  {
    id: 'assets',
    eyebrow: '3D ENVIRONMENT ASSETS',
    title: 'KENNEY.NL ASSET KITS',
    subtitle: '',
    delayMs: 10800,
    durationMs: 2300,
  },
];

export const FRIEND_DIALOGUE_SCRIPT = [
  {
    speaker: 'AMIR (FRIEND)',
    text: "Morning! Saw your bedroom light on—figured you were up getting ready for class.",
    durationMs: 3400,
  },
  {
    speaker: 'AMIR (FRIEND)',
    text: "Hey, a few of us are hanging out at the lakeside cafe after lectures later. You should totally come!",
    durationMs: 3800,
  },
  {
    speaker: 'YOU',
    text: "Sounds good, honestly I could use a break after today's seminar. Count me in.",
    durationMs: 3200,
  },
  {
    speaker: 'AMIR (FRIEND)',
    text: "Awesome, it'll be this evening—hope to see you there!",
    durationMs: 3400,
  },
];

// Clean objective strings with NO keybind text like ([E])
export function getChapter1Task({ completedChores, doorKnocked, friendDone }) {
  if (friendDone) {
    return 'Head outside to your car and drive to class';
  }
  if (doorKnocked) {
    return 'Answer the front door';
  }
  const done = completedChores.length;
  if (done === 0) {
    return 'Grab your university bag from the bedroom desk';
  }
  const missing = MORNING_CHORES.filter((c) => !completedChores.includes(c.id));
  return missing[0]
    ? `Finish morning routine (${done}/3) — ${missing[0].label}`
    : 'Answer the front door';
}
