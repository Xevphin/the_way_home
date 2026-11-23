// ============================================================================
// src/data/dialogueTiming.js
// Shared global subtitle & dialogue duration calculator:
// Guarantees typewriter animation ALWAYS finishes typing the full sentence
// plus generous reading time before advancing to the next beat:
//   typingDuration + Math.max(2400, text.length * 48)
// ============================================================================

export const CHAR_TYPING_MS = 26;
export const EERIE_TYPING_MS = 46;

export function getSubtitleStepMs(tag = '') {
  return String(tag).toUpperCase().includes('UNISON')
    ? EERIE_TYPING_MS
    : CHAR_TYPING_MS;
}

export function getSubtitleDurationMs(text = '', tag = '') {
  const len = String(text || '').length;
  if (len === 0) return 2400;
  const typingDuration = len * getSubtitleStepMs(tag);
  return typingDuration + Math.max(2400, len * 48);
}
