// ============================================================================
// src/data/sprint4Data.js
// Dialogue & choreography data for Sprint 4:
// 1) Cafe Hangout with Amir (routine chat, spooky Lembah Batu wiki legend,
//    GPA celebration montage, and 11:25 PM phone check)
// 2) Late-Night Highway Traffic Jam & Route 312 Lembah Batu Detour Decision
// ============================================================================

export const CAFE_HANGOUT_SCRIPT = [
  {
    speaker: 'AMIR (FRIEND)',
    text: "Glad you actually made it out tonight! How'd the rest of your day go after I stopped by?",
    durationMs: 3600,
    mode: 'NORMAL',
    amirTalk: true,
  },
  {
    speaker: 'YOU',
    text: 'Same old routine—two hours of lectures, endless assignment notes, and Hakim reminding me to stay focused.',
    durationMs: 3800,
    mode: 'NORMAL',
    amirTalk: false,
  },
  {
    speaker: 'AMIR (FRIEND)',
    text: 'Speaking of driving late... I just read the creepiest post on a local paranormal wiki about the old forest stretch past Lembah Batu.',
    durationMs: 4200,
    mode: 'SPOOKY',
    amirTalk: true,
  },
  {
    speaker: 'AMIR (FRIEND)',
    text: 'They say cars stall out at midnight for no reason under those trees—and a tall shadow stalks anyone who steps outside the light.',
    durationMs: 4400,
    mode: 'SPOOKY',
    amirTalk: true,
  },
  {
    speaker: 'YOU',
    text: "Come on, Amir—you actually believe those late-night wiki threads? Sounds like classic internet nonsense. Let's eat before it gets cold.",
    durationMs: 4200,
    mode: 'NORMAL',
    amirTalk: false,
  },
  {
    speaker: 'AMIR (FRIEND)',
    text: "Haha, alright, fair enough! Anyway—congrats on scoring such a killer GPA this semester! Here's to surviving finals week!",
    durationMs: 4000,
    mode: 'CELEBRATE',
    amirTalk: true,
  },
  {
    speaker: 'LATER THAT NIGHT',
    text: 'Hours pass easily over warm teh tarik, plates of nasi lemak, and easy laughter...',
    durationMs: 3600,
    mode: 'MONTAGE',
    amirTalk: true,
  },
  {
    speaker: 'YOU',
    text: "Whoa—it's already 11:25 PM. I've got an early morning lecture tomorrow, I really need to head home now.",
    durationMs: 4200,
    mode: 'PHONE',
    amirTalk: false,
  },
  {
    speaker: 'AMIR (FRIEND)',
    text: 'Totally get it—drive safe, man! Text me once you get back home!',
    durationMs: 3200,
    mode: 'GOODBYE',
    amirTalk: true,
  },
];

export const NIGHT_DETOUR_SCRIPT = [
  {
    timeSec: 0.6,
    tag: '11:32 PM',
    text: "Still wide awake after that teh tarik... Shouldn't take long cruising straight home on E18.",
  },
  {
    timeSec: 4.0,
    tag: 'INNER THOUGHT',
    text: "Seriously? A gridlock at this hour... If I sit in this jam, I won't get any sleep before tomorrow's lecture.",
  },
  {
    timeSec: 8.2,
    tag: 'INNER THOUGHT',
    text: "Wait—Route 312 on the left cuts through Lembah Batu and Kampung Hulu... It's unlit, but it bypasses the whole jam.",
  },
  {
    timeSec: 12.2,
    tag: '11:36 PM',
    text: 'Just keep the high beams on and drive straight through. How bad can a shortcut be?',
  },
];

export const FOREST_RADIO_SCRIPT = [
  {
    time: 0.6,
    tag: '11:41 PM • 98.4 FM',
    text: 'That spooky wiki story Amir was going on about at the cafe... ghosts stalling cars out here at midnight. People really believe anything they read online.',
  },
  {
    time: 5.4,
    tag: 'INNER THOUGHT',
    text: "Whatever. Just keep the radio up, stay focused on the road, and I'll be in bed in ten minutes.",
  },
  {
    time: 9.75,
    tag: '',
    text: 'WAIT—WHAT IS THAT?!',
  },
];
