// ============================================================================
// src/data/epilogueData.js
// Data for the Next-Morning Epilogue (08:30 AM):
// - 3 new morning chores (splash cold water on face, tidy books/laptop on
//   living room table, grab cold water bottle in kitchen)
// - Hafiz's worried front-door dialogue leading into the Chapter 1 cliffhanger
// ============================================================================

export const EPILOGUE_CHORES = [
  {
    id: 'ep_water_face',
    label: 'Splash cold water on your face',
    keyLabel: 'Press "E"',
    actionLabel: 'To Splash Cold Water on Face',
    position: [-4.4, 1.0, -4.8],
    toast:
      'Cold water stings my eyes... my hands are still trembling from last night.',
  },
  {
    id: 'ep_tidy_table',
    label: 'Tidy books & laptop on living room table',
    keyLabel: 'Press "E"',
    actionLabel: 'To Tidy Books & Laptop',
    position: [3.0, 0.55, 2.55],
    toast:
      'Books stacked, laptop closed. Just act like Route 312 was only a bad dream...',
  },
  {
    id: 'ep_water_bottle',
    label: 'Grab a cold water bottle in the kitchen',
    keyLabel: 'Press "E"',
    actionLabel: 'To Grab Cold Water Bottle',
    position: [-2.0, 1.02, -4.9],
    toast:
      'Drank half the bottle in one breath. Still cannot get that shadow out of my head...',
  },
];

export const EPILOGUE_DOOR_TARGET = {
  id: 'ep_front_door',
  keyLabel: 'Press "E"',
  actionLabel: 'To Open Front Door',
  position: [3.2, 1.3, -5.8],
};

export const HAFIZ_DOOR_SCRIPT = [
  {
    speaker: 'HAFIZ',
    text: 'Hey man, I saw your car out front—you look completely pale. Are you okay? Mind if I come in for a minute?',
  },
  {
    speaker: 'YOU',
    text: 'Hafiz... after the cafe, I took the 312 Lembah Batu shortcut home. My car stalled in the fog—and something chased me.',
  },
  {
    speaker: 'HAFIZ',
    text: 'Wait—Lembah Batu?! Nobody drives down that sealed road after midnight anymore...',
  },
  {
    speaker: 'YOU',
    text: "Yeah, come on in. Let's sit in the living room—I'll tell you everything.",
  },
];

export function getEpilogueTask(completedChores, doorKnocked) {
  if (!doorKnocked) {
    const remaining = EPILOGUE_CHORES.length - completedChores.length;
    if (remaining > 0) {
      const next = EPILOGUE_CHORES.find((c) => !completedChores.includes(c.id));
      return `${next.label} (${completedChores.length}/3)`;
    }
  }
  return 'Answer the front door';
}
