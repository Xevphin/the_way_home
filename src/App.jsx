// ============================================================================
// src/App.jsx
// Top-level router, mid-chapter localStorage auto-save, top-corner SaveIcon
// pulse, and global [ESC] Pause Overlay manager for "The Way Home".
// ============================================================================

import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import MainMenuPage from './pages/MainMenuPage';
import LoadingPage from './pages/LoadingPage';
import PauseMenuOverlay, { lockGameplayPointer } from './components/PauseMenuOverlay';
import SaveIconToast from './components/SaveIconToast';
import {
  SAVE_STAGE_LABELS,
  hasCompletedChapter1,
  loadSavedChapterProgress,
  loadUserSettings,
  saveChapterProgress,
  saveUserSettings,
} from './data/gameState';
import { preloadCoreModels } from './data/modelCatalog';
import { setMasterVolume } from './components/AudioEngine';
import { setMorningVolume } from './components/MorningAudio';
import { setRadioVolume } from './components/RadioAudio';
import { setForestAmbienceVolume } from './components/ForestAmbienceAudio';
import { setVoiceVolume } from './components/DialogueVoiceAudio';
import { setAmbientMusicVolume, stopAllSceneAmbience } from './components/AmbientMusicAudio';
import { setMenuAmbienceVolume } from './components/menuAmbience';
import { setJumpscareVolume } from './components/JumpscareAudio';
import { setChaseAudioVolume, stopEscapeChaseTheme } from './components/ChaseThemeAudio';
import {
  setFinaleAudioVolume,
  stopEndCreditsPiano,
  stopRevelationDrone,
} from './components/FinaleEndingAudio';

const Chapter1Page = lazy(() => import('./pages/Chapter1Page'));
const Sprint2Page = lazy(() => import('./pages/Sprint2Page'));
const Sprint3Page = lazy(() => import('./pages/Sprint3Page'));
const Sprint4Page = lazy(() => import('./pages/Sprint4Page'));
const GamePage = lazy(() => import('./pages/GamePage'));
const EscapeChasePage = lazy(() => import('./pages/EscapeChasePage'));
const EpiloguePage = lazy(() => import('./pages/EpiloguePage'));

preloadCoreModels();

const VALID_SCENES = new Set([
  'MAIN_MENU', 'CHAPTER_1', 'SPRINT_2', 'SPRINT_3', 'SPRINT_4',
  'FOREST_RADIO', 'MIDNIGHT_FOREST', 'NIGHT_DEMO', 'ESCAPE_CHASE',
  'EPILOGUE', 'USTAZ_DOME', 'ARRIVAL_247', 'EPILOGUE_MORNING',
  'SOFA_REVELATION', 'END_CREDITS',
]);

function resolveInitialScreen() {
  const q = new URLSearchParams(window.location.search).get('scene');
  if (q === 'FOREST_RADIO' || q === 'NIGHT_DEMO') return 'MIDNIGHT_FOREST';
  return q && VALID_SCENES.has(q) ? q : 'MAIN_MENU';
}

function applyAllVolumes(vol) {
  setMasterVolume(vol);
  setMorningVolume(vol);
  setRadioVolume(vol);
  setForestAmbienceVolume(vol);
  setVoiceVolume(vol);
  setAmbientMusicVolume(vol);
  setMenuAmbienceVolume(vol);
  setJumpscareVolume(vol);
  setChaseAudioVolume(vol);
  setFinaleAudioVolume(vol);
}

export default function App() {
  const [screen, setScreen] = useState(resolveInitialScreen);
  const [targetChapter, setTargetChapter] = useState('CHAPTER_1');
  const [pauseOpen, setPauseOpen] = useState(false);
  const [savePulse, setSavePulse] = useState(false);
  const [savedStage, setSavedStage] = useState(() => loadSavedChapterProgress());
  const [chapter1Unlocked, setChapter1Unlocked] = useState(() => hasCompletedChapter1());
  const saveTimerRef = useRef(null);
  const [settings, setSettings] = useState(() => {
    const initial = loadUserSettings();
    applyAllVolumes(initial.volume);
    return initial;
  });

  const canPause = screen !== 'MAIN_MENU' && screen !== 'LOADING';

  const triggerSavePulse = useCallback(() => {
    setSavePulse(false);
    clearTimeout(saveTimerRef.current);
    requestAnimationFrame(() => {
      setSavePulse(true);
      saveTimerRef.current = setTimeout(() => setSavePulse(false), 2250);
    });
  }, []);

  // Auto-save current Chapter 1 stage whenever entering an active chapter stage
  useEffect(() => {
    if (!SAVE_STAGE_LABELS[screen]) return;
    saveChapterProgress(screen);
    setSavedStage(screen);
    triggerSavePulse();
  }, [screen, triggerSavePulse]);

  useEffect(() => () => clearTimeout(saveTimerRef.current), []);

  const returnToMainMenu = useCallback(() => {
    setPauseOpen(false);
    stopAllSceneAmbience();
    stopEscapeChaseTheme();
    stopRevelationDrone();
    stopEndCreditsPiano();
    if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
    setChapter1Unlocked(hasCompletedChapter1());
    setSavedStage(loadSavedChapterProgress());
    setScreen('MAIN_MENU');
  }, []);

  const openPauseOverlay = useCallback(() => {
    if (!canPause) return;
    if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
    setPauseOpen(true);
  }, [canPause]);

  useEffect(() => {
    if (!canPause) return undefined;
    const onKeyDown = (e) => {
      if (e.code !== 'Escape') return;
      const openModal = document.querySelector('.modal-backdrop:not(.pause-backdrop)');
      if (openModal) return;
      e.preventDefault();
      if (pauseOpen) {
        lockGameplayPointer();
        setPauseOpen(false);
      } else {
        if (document.pointerLockElement && document.exitPointerLock) {
          document.exitPointerLock();
        }
        setPauseOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canPause, pauseOpen]);

  const handleUpdateSettings = (partial) => {
    const next = saveUserSettings(partial);
    applyAllVolumes(next.volume);
    setSettings(next);
  };

  const startStory = (chapter = 'CHAPTER_1') => {
    setPauseOpen(false);
    setTargetChapter(chapter);
    setScreen('LOADING');
  };

  const handleSelectScene = (sceneId) => {
    setPauseOpen(false);
    if (sceneId === 'CHAPTER_1' || sceneId === 'MIDNIGHT_FOREST') {
      startStory(sceneId);
    } else {
      setScreen(sceneId);
    }
  };

  const handleContinueStory = () => {
    if (!savedStage) return;
    handleSelectScene(savedStage);
  };

  const showChapter1 =
    (screen === 'LOADING' && targetChapter === 'CHAPTER_1') || screen === 'CHAPTER_1';

  const showMidnightChapter =
    (screen === 'LOADING' && targetChapter === 'MIDNIGHT_FOREST') ||
    screen === 'MIDNIGHT_FOREST';

  const isEpilogueScreen =
    screen === 'EPILOGUE' ||
    screen === 'USTAZ_DOME' ||
    screen === 'ARRIVAL_247' ||
    screen === 'EPILOGUE_MORNING' ||
    screen === 'SOFA_REVELATION' ||
    screen === 'END_CREDITS';

  const epilogueInitialStage =
    screen === 'ARRIVAL_247'
      ? 'ARRIVAL_247'
      : screen === 'EPILOGUE_MORNING'
        ? 'NEXT_MORNING'
        : screen === 'SOFA_REVELATION'
          ? 'SOFA_REVELATION'
          : screen === 'END_CREDITS'
            ? 'END_CREDITS'
            : 'USTAZ_DOME';

  return (
    <div className="app-root">
      {screen === 'MAIN_MENU' && (
        <MainMenuPage
          settings={settings}
          savedStageLabel={savedStage ? SAVE_STAGE_LABELS[savedStage] : null}
          onContinueStory={handleContinueStory}
          onStartPlay={() => startStory('CHAPTER_1')}
          onUpdateSettings={handleUpdateSettings}
        />
      )}

      <Suspense fallback={<div className="app-root" />}>
        {showChapter1 && (
          <Chapter1Page
            settings={settings}
            paused={screen === 'LOADING' || pauseOpen}
            onReturnToMenu={openPauseOverlay}
            onStartSprint2={() => setScreen('SPRINT_2')}
          />
        )}

        {screen === 'SPRINT_2' && (
          <Sprint2Page
            settings={settings}
            onReturnToMenu={openPauseOverlay}
            onStartSprint3={() => setScreen('SPRINT_3')}
          />
        )}

        {screen === 'SPRINT_3' && (
          <Sprint3Page
            onReturnToMenu={openPauseOverlay}
            onStartSprint4={() => setScreen('SPRINT_4')}
          />
        )}

        {screen === 'SPRINT_4' && (
          <Sprint4Page
            onReturnToMenu={openPauseOverlay}
            onStartMidnightChapter={() => setScreen('MIDNIGHT_FOREST')}
          />
        )}

        {showMidnightChapter && (
          <GamePage
            settings={settings}
            paused={screen === 'LOADING' || pauseOpen}
            onOpenPause={openPauseOverlay}
            onTriggerSavePulse={triggerSavePulse}
            onReturnToMenu={returnToMainMenu}
            onStartEscapeChase={() => setScreen('ESCAPE_CHASE')}
          />
        )}

        {screen === 'ESCAPE_CHASE' && (
          <EscapeChasePage
            paused={pauseOpen}
            onOpenPause={openPauseOverlay}
            onReturnToMenu={returnToMainMenu}
            onEscaped={() => setScreen('EPILOGUE')}
          />
        )}

        {isEpilogueScreen && (
          <EpiloguePage
            settings={settings}
            paused={pauseOpen}
            initialStage={epilogueInitialStage}
            onOpenPause={openPauseOverlay}
            onReturnToMenu={returnToMainMenu}
          />
        )}
      </Suspense>

      {screen === 'LOADING' && (
        <LoadingPage onFinishedLoading={() => setScreen(targetChapter)} />
      )}

      <SaveIconToast visible={savePulse && canPause} />

      <PauseMenuOverlay
        open={pauseOpen && canPause}
        settings={settings}
        onResume={() => setPauseOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        onReturnToMenu={returnToMainMenu}
      />
    </div>
  );
}
