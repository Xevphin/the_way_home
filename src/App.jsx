// ============================================================================
// src/App.jsx
// Top-level router, mid-chapter localStorage auto-save, top-corner SaveIcon
// pulse, and global [ESC] Pause Overlay manager for "The Way Home".
// ============================================================================

import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import MainMenuPage from './pages/MainMenuPage';
import LoadingPage from './pages/LoadingPage';
import Chapter2LoadingPage from './pages/Chapter2LoadingPage';
import PauseMenuOverlay, { lockGameplayPointer } from './components/shared/PauseMenuOverlay';
import SaveIconToast from './components/shared/SaveIconToast';
import {
  CHECKPOINT_LABELS, checkpointToScreen, clearActiveCheckpoint, getActiveCheckpoint,
  loadUserSettings, normalizeCheckpoint, saveActiveCheckpoint, saveUserSettings,
} from './utils/saveStorage';
import { preloadCoreModels } from './data/shared/modelCatalog';
import { applyAllVolumes, stopAllActiveAudio } from './utils/appAudioSync';

const Chapter1Page = lazy(() => import('./pages/Chapter1Page'));
const Chapter2Page = lazy(() => import('./pages/Chapter2Page'));
const Sprint2Page = lazy(() => import('./pages/Sprint2Page'));
const Sprint3Page = lazy(() => import('./pages/Sprint3Page'));
const Sprint4Page = lazy(() => import('./pages/Sprint4Page'));
const GamePage = lazy(() => import('./pages/GamePage'));
const EscapeChasePage = lazy(() => import('./pages/EscapeChasePage'));
const EpiloguePage = lazy(() => import('./pages/EpiloguePage'));
const TrailerPage = lazy(() => import('./pages/TrailerPage'));

preloadCoreModels();

const VALID_SCENES = new Set([
  'MAIN_MENU', 'TRAILER', 'CHAPTER_1', 'SPRINT_2', 'SPRINT_3', 'SPRINT_4',
  'FOREST_RADIO', 'MIDNIGHT_FOREST', 'NIGHT_DEMO', 'ESCAPE_CHASE',
  'EPILOGUE', 'USTAZ_DOME', 'ARRIVAL_247', 'EPILOGUE_MORNING',
  'SOFA_REVELATION', 'END_CREDITS',
  'CHAPTER_2', 'CH2_CUTSCENE_1', 'CH2_GAMEPLAY_1', 'CH2_CUTSCENE_2', 'CH2_GAMEPLAY_2',
  'CH2_STUDIO_CUTSCENE', 'CH2_STUDIO_BREAK',
]);

function resolveInitialScreen() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('trailer') === '1') return 'TRAILER';
  const q = params.get('scene');
  if (q === 'FOREST_RADIO' || q === 'NIGHT_DEMO') return 'MIDNIGHT_FOREST';
  return q && VALID_SCENES.has(q) ? q : 'MAIN_MENU';
}

export default function App() {
  const [screen, setScreen] = useState(resolveInitialScreen);
  const [targetChapter, setTargetChapter] = useState('CHAPTER_1');
  const [pauseOpen, setPauseOpen] = useState(false);
  const [savePulse, setSavePulse] = useState(false);
  const [savedStage, setSavedStage] = useState(() => getActiveCheckpoint());
  const saveTimerRef = useRef(null);
  const [settings, setSettings] = useState(() => {
    const initial = loadUserSettings();
    applyAllVolumes(initial.volume);
    return initial;
  });

  const canPause = screen !== 'MAIN_MENU' && screen !== 'LOADING' && screen !== 'CH2_LOADING' && screen !== 'TRAILER';

  const triggerSavePulse = useCallback(() => {
    setSavePulse(false);
    clearTimeout(saveTimerRef.current);
    requestAnimationFrame(() => {
      setSavePulse(true);
      saveTimerRef.current = setTimeout(() => setSavePulse(false), 2250);
    });
  }, []);

  // Auto-save active checkpoint whenever entering a major story scene
  useEffect(() => {
    const checkpoint = normalizeCheckpoint(screen);
    if (!checkpoint) return;
    saveActiveCheckpoint(checkpoint);
    setSavedStage(checkpoint);
    triggerSavePulse();
  }, [screen, triggerSavePulse]);

  useEffect(() => () => clearTimeout(saveTimerRef.current), []);

  const returnToMainMenu = useCallback(() => {
    setPauseOpen(false);
    stopAllActiveAudio();
    if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
    setSavedStage(getActiveCheckpoint());
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

  const handleNewGame = () => {
    clearActiveCheckpoint();
    setSavedStage(null);
    startStory('CHAPTER_1');
  };

  const handleContinueStory = () => {
    if (!savedStage) return;
    handleSelectScene(checkpointToScreen(savedStage));
  };

  const handleStartChapter2 = () => {
    setPauseOpen(false);
    setScreen('CH2_LOADING');
  };

  const showChapter1 =
    (screen === 'LOADING' && targetChapter === 'CHAPTER_1') || screen === 'CHAPTER_1';

  const isChapter2Screen =
    screen === 'CHAPTER_2' || screen === 'CH2_CUTSCENE_1' || screen === 'CH2_GAMEPLAY_1' ||
    screen === 'CH2_CUTSCENE_2' || screen === 'CH2_GAMEPLAY_2' ||
    screen === 'CH2_STUDIO_CUTSCENE' || screen === 'CH2_STUDIO_BREAK';

  const ch2InitialStage =
    screen === 'CH2_GAMEPLAY_1' ? 'GAMEPLAY_1'
      : screen === 'CH2_CUTSCENE_2' ? 'CUTSCENE_2'
        : screen === 'CH2_GAMEPLAY_2' ? 'GAMEPLAY_2'
          : screen === 'CH2_STUDIO_CUTSCENE' ? 'CH2_STUDIO_CUTSCENE'
            : screen === 'CH2_STUDIO_BREAK' ? 'CH2_STUDIO_BREAK'
              : 'CUTSCENE_1';

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
    screen === 'ARRIVAL_247' ? 'ARRIVAL_247'
      : screen === 'EPILOGUE_MORNING' ? 'NEXT_MORNING'
        : screen === 'SOFA_REVELATION' ? 'SOFA_REVELATION'
          : screen === 'END_CREDITS' ? 'END_CREDITS'
            : 'USTAZ_DOME';

  return (
    <div className="app-root">
      {screen === 'MAIN_MENU' && (
        <MainMenuPage
          settings={settings}
          savedStageLabel={savedStage ? CHECKPOINT_LABELS[savedStage] : null}
          onContinueStory={handleContinueStory}
          onStartPlay={handleNewGame}
          onStartChapter2={handleStartChapter2}
          onWatchTrailer={() => { setPauseOpen(false); setScreen('TRAILER'); }}
          onUpdateSettings={handleUpdateSettings}
        />
      )}

      <Suspense fallback={<div className="app-root" />}>
        {screen === 'TRAILER' && <TrailerPage settings={settings} onExitTrailer={returnToMainMenu} />}
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

        {isChapter2Screen && (
          <Chapter2Page
            settings={settings}
            paused={pauseOpen}
            initialStage={ch2InitialStage}
            onOpenPause={openPauseOverlay}
            onReturnToMenu={returnToMainMenu}
          />
        )}
      </Suspense>

      {screen === 'LOADING' && (
        <LoadingPage onFinishedLoading={() => setScreen(targetChapter)} />
      )}

      {screen === 'CH2_LOADING' && (
        <Chapter2LoadingPage onFinishedLoading={() => setScreen('CH2_CUTSCENE_1')} />
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
