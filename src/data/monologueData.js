// ============================================================================
// src/data/monologueData.js
// Grounded, tense first-person inner monologue & film subtitle lines for
// "The Way Home" (inspired by Outlast / Fears to Fathom).
// ============================================================================

export const MONOLOGUE = {
  cutsceneBeat1: {
    tag: '11:42 PM',
    text: "Almost midnight... Just twenty more minutes past the forest stretch and I'm finally home.",
  },
  cutsceneBeat2Flash: {
    tag: '',
    text: 'What the—?! Something just stepped right in front of the bumper!',
  },
  cutsceneBeat2Dead: {
    tag: '11:43 PM',
    text: "The engine's completely dead. No signal either...",
  },
  cutsceneBeat3Exit: {
    tag: '',
    text: 'I swear I hit something. I need to check the front of the car.',
  },
  afterCutscene: {
    tag: '',
    text: 'I swear I hit something. I need to check the front of the car.',
  },
  inspectBumper: {
    tag: 'INNER THOUGHT',
    text: 'Nothing on the road... not a scratch of fur or blood. Just a deep dent. How is that possible?',
  },
  spotSurau: {
    tag: '',
    text: "That warm lantern light ahead... an old roadside Surau. Something tells me I'm safer inside its light.",
  },
  gateLocked: {
    tag: '',
    text: "Rusted shut with a heavy padlock... I can't force it without the key.",
  },
  gateUnlocked: {
    tag: '',
    text: 'The padlock finally gave way... I can see the warm highway lights just past the trees.',
  },
  respawned: (place) => ({
    tag: 'WHISPER',
    text: `My heart won't stop pounding... back at ${place}. Stay inside the light.`,
  }),
};

export const INITIAL_CUTSCENE_STATE = {
  inCabin: true,
  isDented: false,
  headlightPower: 1.0,
  hazardsOn: false,
  showFlashFigure: false,
  captionTag: MONOLOGUE.cutsceneBeat1.tag,
  caption: MONOLOGUE.cutsceneBeat1.text,
};

export const POST_CRASH_STATE = {
  ...INITIAL_CUTSCENE_STATE,
  inCabin: false,
  isDented: true,
  headlightPower: 0.42,
  hazardsOn: true,
  captionTag: '',
  caption: '',
};
