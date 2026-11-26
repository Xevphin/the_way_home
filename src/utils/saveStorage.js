// ============================================================================
// src/utils/saveStorage.js
// Sandboxed-iframe-safe localStorage persistence for "The Way Home" (itch.io):
// - Single two-tier save key (`twh_save_v1`):
//   1) `activeScene` — current mid-run checkpoint (cleared on New Game or Credits)
//   2) `completedChapter1` & `settings` — permanent across runs
// - All localStorage access wrapped in try/catch so restricted iframes never throw.
// ============================================================================

export const SAVE_STORAGE_KEY = 'twh_save_v1';

const LEGACY_SETTINGS_KEY = 'the_way_home_settings_v1';
const LEGACY_COMPLETE_KEY = 'the_way_home_ch1_complete_v1';
const LEGACY_SAVE_KEY = 'the_way_home_ch1_save_v1';

export const DEFAULT_SETTINGS = {
  volume: 0.75,
  sensitivity: 1.0,
};

export const CHECKPOINT_LABELS = {
  MORNING_APARTMENT: 'Morning Routine',
  CAMPUS_WALK: 'Universiti Alam',
  HIGHWAY_EVENING: 'Evening Highway',
  CAFE_HANGOUT: 'Late-Night Cafe',
  NIGHT_TRAFFIC_DETOUR: 'Route 312 Detour',
  FOREST_RADIO_CUTSCENE: 'Route 312 Approach',
  MIDNIGHT_FOREST: 'Midnight Forest',
  ESCAPE_CHASE: 'Escape Chase',
  USTAZ_DOME: 'Ustaz Light Dome',
  ARRIVAL_HOME: '02:47 AM Arrival',
  EPILOGUE_MORNING: 'The Next Morning',
  SOFA_REVELATION: 'Sofa Revelation',
  CHAPTER_2: 'Chapter 2: Unknown Mystery',
};

const SCREEN_TO_CHECKPOINT = {
  CHAPTER_1: 'MORNING_APARTMENT',
  SPRINT_2: 'CAMPUS_WALK',
  SPRINT_3: 'HIGHWAY_EVENING',
  SPRINT_4: 'CAFE_HANGOUT',
  FOREST_RADIO: 'FOREST_RADIO_CUTSCENE',
  MIDNIGHT_FOREST: 'MIDNIGHT_FOREST',
  ESCAPE_CHASE: 'ESCAPE_CHASE',
  EPILOGUE: 'USTAZ_DOME',
  USTAZ_DOME: 'USTAZ_DOME',
  ARRIVAL_247: 'ARRIVAL_HOME',
  EPILOGUE_MORNING: 'EPILOGUE_MORNING',
  SOFA_REVELATION: 'SOFA_REVELATION',
  CHAPTER_2: 'CHAPTER_2',
  CH2_CUTSCENE_1: 'CHAPTER_2',
  CH2_GAMEPLAY_1: 'CHAPTER_2',
  CH2_CUTSCENE_2: 'CHAPTER_2',
  CH2_GAMEPLAY_2: 'CHAPTER_2',
};

const CHECKPOINT_TO_SCREEN = {
  MORNING_APARTMENT: 'CHAPTER_1',
  CAMPUS_WALK: 'SPRINT_2',
  HIGHWAY_EVENING: 'SPRINT_3',
  CAFE_HANGOUT: 'SPRINT_4',
  NIGHT_TRAFFIC_DETOUR: 'SPRINT_4',
  FOREST_RADIO_CUTSCENE: 'MIDNIGHT_FOREST',
  MIDNIGHT_FOREST: 'MIDNIGHT_FOREST',
  ESCAPE_CHASE: 'ESCAPE_CHASE',
  USTAZ_DOME: 'USTAZ_DOME',
  ARRIVAL_HOME: 'ARRIVAL_247',
  EPILOGUE_MORNING: 'EPILOGUE_MORNING',
  SOFA_REVELATION: 'SOFA_REVELATION',
  CHAPTER_2: 'CH2_CUTSCENE_1',
};

function clampSettings(raw) {
  return {
    volume:
      typeof raw?.volume === 'number'
        ? Math.max(0, Math.min(1, raw.volume))
        : DEFAULT_SETTINGS.volume,
    sensitivity:
      typeof raw?.sensitivity === 'number'
        ? Math.max(0.3, Math.min(2.5, raw.sensitivity))
        : DEFAULT_SETTINGS.sensitivity,
  };
}

export function normalizeCheckpoint(sceneOrScreen) {
  if (!sceneOrScreen) return null;
  if (CHECKPOINT_LABELS[sceneOrScreen]) return sceneOrScreen;
  return SCREEN_TO_CHECKPOINT[sceneOrScreen] || null;
}

export function checkpointToScreen(checkpoint) {
  const key = normalizeCheckpoint(checkpoint);
  return key ? CHECKPOINT_TO_SCREEN[key] || 'CHAPTER_1' : 'CHAPTER_1';
}

function readLegacyFallback() {
  let activeScene = null;
  let completedChapter1 = false;
  let settings = { ...DEFAULT_SETTINGS };
  try {
    const legacyStage = localStorage.getItem(LEGACY_SAVE_KEY);
    activeScene = normalizeCheckpoint(legacyStage);
    completedChapter1 = localStorage.getItem(LEGACY_COMPLETE_KEY) === 'true';
    const rawSettings = localStorage.getItem(LEGACY_SETTINGS_KEY);
    if (rawSettings) settings = clampSettings(JSON.parse(rawSettings));
  } catch {
    // Ignore restricted storage environments
  }
  return { activeScene, completedChapter1, settings };
}

export function readSaveData() {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return readLegacyFallback();
    const parsed = JSON.parse(raw);
    return {
      activeScene: normalizeCheckpoint(parsed?.activeScene),
      completedChapter1: Boolean(parsed?.completedChapter1),
      settings: clampSettings(parsed?.settings),
    };
  } catch {
    return {
      activeScene: null,
      completedChapter1: false,
      settings: { ...DEFAULT_SETTINGS },
    };
  }
}

function writeSaveData(data) {
  try {
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota / sandboxed iframe errors
  }
  return data;
}

export function saveActiveCheckpoint(sceneOrScreen) {
  const checkpoint = normalizeCheckpoint(sceneOrScreen);
  if (!checkpoint) return null;
  const current = readSaveData();
  writeSaveData({ ...current, activeScene: checkpoint });
  return checkpoint;
}

export function clearActiveCheckpoint() {
  const current = readSaveData();
  writeSaveData({ ...current, activeScene: null });
}

export function getActiveCheckpoint() {
  return readSaveData().activeScene;
}

export function hasCompletedChapter1() {
  return readSaveData().completedChapter1;
}

// Reaching CREDITS permanently unlocks Chapter 1 completion and clears activeScene
export function markChapter1Completed() {
  const current = readSaveData();
  writeSaveData({
    ...current,
    activeScene: null,
    completedChapter1: true,
  });
}

export function loadUserSettings() {
  return readSaveData().settings;
}

export function saveUserSettings(partial) {
  const current = readSaveData();
  const nextSettings = clampSettings({ ...current.settings, ...partial });
  writeSaveData({ ...current, settings: nextSettings });
  return nextSettings;
}
