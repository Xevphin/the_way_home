// ============================================================================
// src/data/gameState.js
// Manages settings persistence, initial Demo 1 gameplay state, and
// spatial Safe Zone boundary calculations.
// ============================================================================

import { SAFE_ZONES, SCAVENGE_ITEMS } from './objectivesData';

const STORAGE_KEY = 'the_way_home_settings_v1';
const CH1_COMPLETE_KEY = 'the_way_home_ch1_complete_v1';
const CH1_SAVE_KEY = 'the_way_home_ch1_save_v1';

export const SAVE_STAGE_LABELS = {
  CHAPTER_1: 'Morning Routine',
  SPRINT_2: 'Universiti Alam',
  SPRINT_3: 'Evening Highway',
  SPRINT_4: 'Late-Night Cafe',
  MIDNIGHT_FOREST: 'Midnight Forest',
  ESCAPE_CHASE: 'Escape Chase',
  EPILOGUE: 'Epilogue',
};

export function saveChapterProgress(stage) {
  if (!SAVE_STAGE_LABELS[stage]) return;
  try {
    localStorage.setItem(CH1_SAVE_KEY, stage);
  } catch {
    // Ignore storage quota errors
  }
}

export function loadSavedChapterProgress() {
  try {
    const val = localStorage.getItem(CH1_SAVE_KEY);
    return val && SAVE_STAGE_LABELS[val] ? val : null;
  } catch {
    return null;
  }
}

export function hasCompletedChapter1() {
  try {
    return localStorage.getItem(CH1_COMPLETE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markChapter1Completed() {
  try {
    localStorage.setItem(CH1_COMPLETE_KEY, 'true');
  } catch {
    // Ignore storage quota errors in restricted browsing modes
  }
}

export const DEFAULT_SETTINGS = {
  volume: 0.75,
  sensitivity: 1.0,
};

export function loadUserSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      volume:
        typeof parsed.volume === 'number'
          ? Math.max(0, Math.min(1, parsed.volume))
          : DEFAULT_SETTINGS.volume,
      sensitivity:
        typeof parsed.sensitivity === 'number'
          ? Math.max(0.3, Math.min(2.5, parsed.sensitivity))
          : DEFAULT_SETTINGS.sensitivity,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveUserSettings(partial) {
  const current = loadUserSettings();
  const next = { ...current, ...partial };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors in restricted browsing modes
  }
  return next;
}

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
