// ============================================================================
// src/data/finaleScriptData.js
// Script beats for the Chapter 1 Sofa Revelation, Jinn Flashback, Smash-Cut,
// and Rolling Movie End Credits ("THE WAY HOME — END OF CHAPTER 1").
// ============================================================================

export const SOFA_REVELATION_BEATS = [
  {
    phase: 'SOFA_YOU',
    speaker: 'YOU',
    text: 'After the cafe, the highway was completely jammed, so I took the 312 Lembah Batu detour...',
  },
  {
    phase: 'SOFA_YOU',
    speaker: 'YOU',
    text: "My car stalled in the fog, and something was hunting me. If it wasn't for that small kampung village and the kind Uncle at the Surau—I wouldn't have made it back.",
  },
  {
    phase: 'SOFA_HAFIZ',
    speaker: 'HAFIZ',
    text: 'Village? Uncle? Bro... what on earth are you talking about?',
  },
  {
    phase: 'SOFA_YOU',
    speaker: 'YOU',
    text: 'The lantern-lit Surau along Route 312! The elder in the white jubah—he helped me fix my car and raised a wall of light against the ghosts!',
  },
  {
    phase: 'SOFA_HAFIZ',
    speaker: 'HAFIZ',
    text: 'Bro, listen to me... there was NEVER any village in Lembah Batu. Nobody has ever seen that old man except you. And those things out there—they are real spirits.',
  },
  {
    phase: 'EYES_PUSH',
    speaker: 'INNER VOICE',
    text: 'What...? What does that mean?',
  },
  {
    phase: 'JINN_FLASHBACK',
    speaker: 'REVELATION',
    text: "The warm Surau lantern wasn't ordinary light—it was a benevolent Muslim jinn watching over you, shielding you from the valley's evil all along.",
  },
  {
    phase: 'SMASH_CUT',
    speaker: 'YOU',
    text: 'This... means nothing...',
    smashOnWordEnd: true,
  },
];

export const MOVIE_END_CREDITS = [
  { role: 'DIRECTED & WRITTEN BY', names: ['Xevphin'] },
  { role: 'STORY & NARRATIVE DIRECTION', names: ['Xevphin'] },
  { role: '3D LEVEL DESIGN & ATMOSPHERE', names: ['Gemini Neon'] },
  { role: 'PROCEDURAL SOUND & HORROR SCORE', names: ['Gemini Neon'] },
  { role: '3D ENVIRONMENT ASSETS', names: ['Kenney.nl Asset Kits'] },
];
