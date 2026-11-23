// ============================================================================
// src/data/sprint2Data.js
// Waypoints, open-town buildings/warungs/parked cars, and Friend 2 (Hakim)
// campus dialogue script for Sprint 2 (Drive to University & Sunset Skip).
// ============================================================================

export const TOWN_ROUTE_POINTS = [
  [0, 0, 10],
  [0.5, 0, -16],
  [4.5, 0, -44],
  [2.0, 0, -76],
  [-4.5, 0, -108],
  [-2.5, 0, -140],
  [0, 0, -168],
];

export const TOWN_HOUSES = [
  { x: -16, z: -8, w: 7.5, h: 4.2, d: 6.2, wall: '#e8d8c3', roof: '#8f4730', rot: 0.08 },
  { x: 17, z: -18, w: 8.2, h: 4.6, d: 6.5, wall: '#dce4e8', roof: '#4a5c6e', rot: -0.1 },
  { x: -18, z: -36, w: 7.8, h: 4.4, d: 6.0, wall: '#f0e2c8', roof: '#7c452d', rot: 0.14 },
  { x: 22, z: -50, w: 8.5, h: 5.0, d: 7.0, wall: '#e3d5c8', roof: '#5e4637', rot: -0.05 },
  { x: -15, z: -68, w: 7.2, h: 4.1, d: 5.8, wall: '#d8e3d5', roof: '#6b4932', rot: 0.05 },
  { x: 19, z: -84, w: 8.4, h: 4.8, d: 6.4, wall: '#ede1d1', roof: '#82402b', rot: -0.12 },
  { x: -22, z: -98, w: 8.0, h: 4.4, d: 6.2, wall: '#e2d7cc', roof: '#4c5766', rot: 0.1 },
  { x: 16, z: -116, w: 7.6, h: 4.5, d: 6.0, wall: '#f2e8d8', roof: '#85442e', rot: -0.08 },
  { x: -19, z: -132, w: 8.2, h: 4.6, d: 6.5, wall: '#dce0e6', roof: '#4e5d6b', rot: 0.06 },
  { x: 18, z: -148, w: 9.0, h: 5.2, d: 6.8, wall: '#eadbc7', roof: '#7a422d', rot: -0.04 },
];

export const TOWN_WARUNGS = [
  { x: -9.5, z: -22, awning: '#c94a38', rot: 0.12 },
  { x: 12.2, z: -60, awning: '#2f7a68', rot: -0.15 },
  { x: -11.5, z: -114, awning: '#d48628', rot: 0.1 },
];

export const TOWN_PARKED_CARS = [
  { x: -7.6, z: -12, color: '#a83c32', rot: 0.05 },
  { x: 11.4, z: -42, color: '#3b648c', rot: -0.08 },
  { x: -10.8, z: -88, color: '#d4d8de', rot: 0.12 },
  { x: 7.8, z: -128, color: '#456b4e', rot: -0.04 },
];

export const TOWN_DRIVE_SUBTITLES = [
  {
    timeSec: 0.6,
    tag: '08:28 AM',
    text: 'Clear morning traffic through town... Look around freely while heading to campus.',
  },
  {
    timeSec: 5.2,
    tag: '',
    text: 'The roadside stalls are already open. Feels like a completely normal Friday.',
  },
  {
    timeSec: 10.0,
    tag: '',
    text: 'Pulling up to campus now—looks like Hakim is waiting near the entrance.',
  },
];

export const CAMPUS_DIALOGUE_SCRIPT = [
  {
    speaker: 'YOU',
    text: "Hey Hakim! Amir just stopped by my place—invited me to a cafe hangout about ten minutes away this evening. What do you think?",
    durationMs: 4400,
    playerNod: false,
    friendTalk: false,
  },
  {
    speaker: 'HAKIM (FRIEND)',
    text: "Honestly? You should go, man. You've been grinding assignments nonstop for the past few days—it'll be a great way to lift off all that stress.",
    durationMs: 4600,
    playerNod: false,
    friendTalk: true,
  },
  {
    speaker: 'HAKIM (FRIEND)',
    text: "Just don't forget—as a student, commitment still has to be top priority.",
    durationMs: 3800,
    playerNod: false,
    friendTalk: true,
  },
  {
    speaker: 'YOU',
    text: "Yeah, you're totally right. Let's focus on getting through today's classes first before I head out tonight.",
    durationMs: 4000,
    playerNod: true,
    friendTalk: false,
  },
];
