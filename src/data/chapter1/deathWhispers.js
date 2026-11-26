// ============================================================================
// src/data/deathWhispers.js
// Chooses a chilling, context-aware whisper for the "CONSUMED BY THE DARK"
// death screen based on how the player was caught.
// ============================================================================

export function getDeathWhisper({
  flashlightOn,
  batteryLevel,
  collectedCount,
  deaths,
}) {
  if (!flashlightOn) {
    return 'You let your light go out... and the dark answered.';
  }
  if (batteryLevel < 25) {
    return 'Your light flickered and failed you. It was waiting for that moment.';
  }
  if (deaths >= 2) {
    return 'It knows your path now. It learns every time you fall.';
  }
  if (collectedCount >= 3) {
    return 'So close to the road home... and still it would not let you leave.';
  }
  if (collectedCount === 0) {
    return 'You strayed too far from the light...';
  }
  return 'It was behind you the whole time. You never looked back.';
}
