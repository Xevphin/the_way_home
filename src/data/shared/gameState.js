// ============================================================================
// src/data/gameState.js
// Delegates save/settings persistence to src/utils/saveStorage.js and manages
// initial Midnight Forest gameplay state & Safe Zone boundary calculations.
// ============================================================================

import { SAFE_ZONES, SCAVENGE_ITEMS } from '../chapter1/objectivesData';
export {
  CHECKPOINT_LABELS as SAVE_STAGE_LABELS,
  DEFAULT_SETTINGS,
  checkpointToScreen,
  clearActiveCheckpoint,
  getActiveCheckpoint as loadSavedChapterProgress,
  hasCompletedChapter1,
  loadUserSettings,
  markChapter1Completed,
  normalizeCheckpoint,
  saveActiveCheckpoint as saveChapterProgress,
  saveUserSettings,
} from '../../utils/saveStorage';

export function createInitialGameProgress() {
  return {
    carInspected: false,
    elderSpoken: false,
    milestoneRead: false,
    hasTornMap: false,
    hasCrowbar: false,
    cratePried: false,
    hasIronKey: false,
    shedUnlocked: false,
    hasBelt: false,
    hasBatteryCell: false,
    hasStarterRelay: false,
    memoRead: false,
    posterRead: false,
    newspaperRead: false,
    pamphletRead: false,
    officeScareDone: false,
    shelterRead: false,
    chestUnlocked: false,
    stallRevealed: false,
    stalkerAwakened: false,
    chapterCompleted: false,
    lastRespawnPoint: [-0.8, 1.7, -0.5],
    lastRespawnYaw: -0.45,
    lastSafeZoneName: 'Stalled Sedan',
  };
}

export function getCurrentObjectiveStep(progress) {
  if (!progress.carInspected) return 1;
  if (progress.collectedItems.length < SCAVENGE_ITEMS.length) return 2;
  return 3;
}

// Returns the Safe Zone object if the (x, z) position is inside its blessed radius
export function getSafeZoneAtPosition(x, z) {
  for (const zone of SAFE_ZONES) {
    const dx = x - zone.position[0];
    const dz = z - zone.position[2];
    const dist = Math.hypot(dx, dz);
    if (dist <= zone.radius) {
      return zone;
    }
  }
  return null;
}
