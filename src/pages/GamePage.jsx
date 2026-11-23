// ============================================================================
// src/pages/GamePage.jsx
// Single Unified Chapter 1 Midnight Forest Experience on Route 312 Lembah Batu:
// - Smooth 0.8s fade-from-black into the FM Radio Crash Cutscene
// - Oakside-style branching forest trails, Crowbar/Iron Key gated structures,
//   4 readable lore documents, non-lethal scares & smart Shadow Stalker!
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { createInitialGameProgress } from '../data/gameState';
import { buildInitialMidnightProgress, getInitialMidnightSpawn } from '../data/midnightSpawns';
import { preloadAllForestModels } from '../data/modelCatalog';
import { INITIAL_CUTSCENE_STATE, MONOLOGUE, POST_CRASH_STATE } from '../data/monologueData';
import GameWorldScene from '../components/GameWorldScene';
import GameHudOverlays from '../components/GameHudOverlays';
import useFlashlightBattery from '../hooks/useFlashlightBattery';
import useCutsceneSkip from '../hooks/useCutsceneSkip';
import useSubtitles from '../hooks/useSubtitles';
import useMidnightInteractions from '../hooks/useMidnightInteractions';
import { playFlashlightClick, playSanctuaryChime } from '../components/AudioEngine';
import {
  playCrashShockRinging, playWhisperScare, startForestNightAmbience, stopForestNightAmbience,
} from '../components/ForestAmbienceAudio';

function releasePointer() {
  if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
}

export default function GamePage({
  settings,
  paused = false,
  onOpenPause,
  onTriggerSavePulse,
  onReturnToMenu,
  onStartEscapeChase,
}) {
  const initialSpawn = useRef(getInitialMidnightSpawn()).current;

  const [progress, setProgress] = useState(() =>
    buildInitialMidnightProgress(createInitialGameProgress(), initialSpawn)
  );
  const [inCutscene, setInCutscene] = useState(!initialSpawn.skipCutscene);
  const [cutsceneState, setCutsceneState] = useState(() =>
    initialSpawn.skipCutscene ? POST_CRASH_STATE : INITIAL_CUTSCENE_STATE
  );
  const [entryFadeOpacity, setEntryFadeOpacity] = useState(initialSpawn.skipCutscene ? 0 : 1);
  const [impactShock, setImpactShock] = useState(false);
  const [shockRecovery, setShockRecovery] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(true);
  const [activeSafeZone, setActiveSafeZone] = useState(null);
  const [hoverInteractable, setHoverInteractable] = useState(null);
  const [threatLevel, setThreatLevel] = useState(0);

  const sedanGroupRef = useRef();
  const playerPosRef = useRef(new THREE.Vector3(...initialSpawn.pos));
  const playerYawRef = useRef(initialSpawn.yaw);
  const batterySetterRef = useRef(null);

  useEffect(() => {
    preloadAllForestModels();
    if (initialSpawn.skipCutscene) return undefined;
    const t = setTimeout(() => setEntryFadeOpacity(0), 60);
    return () => clearTimeout(t);
  }, [initialSpawn.skipCutscene]);

  const handleLaunchEscapeChase = useCallback(() => {
    stopForestNightAmbience();
    onStartEscapeChase?.();
  }, [onStartEscapeChase]);

  const { subtitle, showSubtitle } = useSubtitles({
    gameplayActive: !paused && !inCutscene && !progress.chapterCompleted,
    playerPosRef,
  });

  const setBatteryProxy = useCallback((val) => {
    batterySetterRef.current?.(val);
  }, []);

  const interactions = useMidnightInteractions({
    progress,
    setProgress,
    setBatteryLevel: setBatteryProxy,
    hoverInteractable,
    setHoverInteractable,
    showSubtitle,
    onStartEscapeChase: handleLaunchEscapeChase,
  });

  const anyModalOpen =
    Boolean(interactions.activeDocId) || interactions.padlockOpen || interactions.tornMapOpen;

  const { batteryLevel, setBatteryLevel } = useFlashlightBattery({
    active: !paused && !inCutscene && !interactions.stallSeqActive && !anyModalOpen && !progress.chapterCompleted,
    flashlightOn,
    hasSpareBatteries: progress.hasBatteryCell,
    inSafeZone: Boolean(activeSafeZone),
  });
  batterySetterRef.current = setBatteryLevel;

  // Non-lethal close-brush psychological scare (no game-over death screen during exploration!)
  const handleStalkerBrush = useCallback(() => {
    playWhisperScare();
    setThreatLevel(0);
    interactions.setFlashStrobe(true);
    setTimeout(() => interactions.setFlashStrobe(false), 260);
    showSubtitle(
      {
        tag: 'INNER THOUGHT',
        text: 'It brushed right past me in the dark—shine the flashlight or get to a lantern sanctuary!',
      },
      4800
    );
  }, [interactions, showSubtitle]);

  useEffect(() => {
    if (paused) return undefined;
    startForestNightAmbience();
    return () => stopForestNightAmbience();
  }, [paused]);

  const gameplayActive = !paused && !inCutscene && !shockRecovery && !interactions.stallSeqActive && !anyModalOpen && !progress.chapterCompleted;

  const handleImpactShock = useCallback(() => {
    setImpactShock(true);
    setTimeout(() => setImpactShock(false), 400);
  }, []);

  const finishCutscene = useCallback(() => {
    if (sedanGroupRef.current) sedanGroupRef.current.position.set(1.2, 0, 0);
    playerPosRef.current.set(-0.8, 1.7, -0.5);
    playerYawRef.current = -0.45;
    playCrashShockRinging();
    setShockRecovery(true);
    // Defer free-roam mode switch by 1 animation frame so React never hitches the crash cut
    requestAnimationFrame(() => {
      setInCutscene(false);
      setCutsceneState(POST_CRASH_STATE);
    });
    setTimeout(() => {
      setShockRecovery(false);
      showSubtitle(MONOLOGUE.afterCutscene, 5200);
    }, 1550);
  }, [showSubtitle]);

  useCutsceneSkip(inCutscene && !paused, finishCutscene);

  const handleToggleFlashlight = useCallback(() => {
    playFlashlightClick();
    setFlashlightOn((prev) => !prev);
  }, []);

  const handleEnterSafeZone = useCallback((zone) => {
    setActiveSafeZone(zone);
    if (!zone) return;
    playSanctuaryChime(true);
    setProgress((prev) => {
      if (prev.lastSafeZoneName === zone.name) return prev;
      queueMicrotask(() => onTriggerSavePulse?.());
      return {
        ...prev,
        lastSafeZoneName: zone.name,
        lastRespawnPoint: zone.respawnPoint,
        lastRespawnYaw: zone.respawnYaw ?? Math.PI / 2,
      };
    });
  }, [onTriggerSavePulse]);

  const handleMenu = useCallback(() => {
    stopForestNightAmbience();
    releasePointer();
    onReturnToMenu();
  }, [onReturnToMenu]);

  const showHud =
    !inCutscene && !interactions.stallSeqActive && !progress.chapterCompleted && !paused;

  return (
    <div className="game-page">
      {!paused && (
        <button type="button" className="top-menu-escape-btn" onClick={onOpenPause || handleMenu}>
          ← Menu
        </button>
      )}

      <Canvas
        dpr={1}
        shadows={false}
        camera={{
          fov: 65,
          near: 0.08,
          far: 185,
          position: initialSpawn.skipCutscene ? initialSpawn.pos : [0.84, 1.18, 112.06],
        }}
      >
        <GameWorldScene
          progress={progress}
          paused={paused}
          inCutscene={inCutscene}
          cutsceneState={cutsceneState}
          sedanGroupRef={sedanGroupRef}
          gameplayActive={gameplayActive}
          jumpscareActive={false}
          catchPosRef={null}
          activeSafeZone={activeSafeZone}
          windowScareActive={interactions.windowScareActive}
          watchtowerScareActive={interactions.watchtowerScareActive}
          elderTalking={interactions.elderTalking}
          stallSeqActive={interactions.stallSeqActive}
          dinersStare={interactions.dinersStare}
          flashlightFlicker={interactions.flashlightFlicker}
          settings={settings}
          flashlightOn={flashlightOn}
          batteryLevel={batteryLevel}
          playerPosRef={playerPosRef}
          playerYawRef={playerYawRef}
          respawnCount={interactions.respawnCount}
          onCutsceneUpdate={setCutsceneState}
          onImpactShock={handleImpactShock}
          onCutsceneComplete={finishCutscene}
          onToggleFlashlight={handleToggleFlashlight}
          onToggleTornMap={interactions.handleToggleTornMap}
          onHoverInteractable={setHoverInteractable}
          onInteract={interactions.handleInteract}
          onEnterSafeZone={handleEnterSafeZone}
          onThreatChange={setThreatLevel}
          onCatchPlayer={handleStalkerBrush}
          onDinersStare={interactions.setDinersStare}
          onFlashStrobe={interactions.setFlashStrobe}
          onRevealStallReality={interactions.handleRevealStallReality}
          onSubtitle={showSubtitle}
          onStallSeqComplete={interactions.handleStallSeqComplete}
        />
      </Canvas>

      {impactShock && <div className="impact-shock-cut" aria-hidden="true" />}

      {/* Crisp 0.5s Fade-From-Black Curtain Entering the Forest FM Radio Cutscene */}
      <div
        className="smooth-fade-curtain"
        style={{ opacity: entryFadeOpacity }}
        aria-hidden="true"
      >
        {entryFadeOpacity > 0 && (
          <div className="fade-transition-caption">
            11:41 PM — Route 312, Lembah Batu
          </div>
        )}
      </div>

      <GameHudOverlays
        showHud={showHud}
        paused={paused}
        inCutscene={inCutscene}
        anyModalOpen={anyModalOpen}
        elderTalking={interactions.elderTalking}
        shockRecovery={shockRecovery}
        flashStrobe={interactions.flashStrobe}
        progress={progress}
        flashlightOn={flashlightOn}
        batteryLevel={batteryLevel}
        activeSafeZone={activeSafeZone}
        hoverInteractable={hoverInteractable}
        subtitle={subtitle}
        threatLevel={threatLevel}
        cutsceneState={cutsceneState}
        pickupToast={interactions.pickupToast}
        activeDocId={interactions.activeDocId}
        padlockOpen={interactions.padlockOpen}
        tornMapOpen={interactions.tornMapOpen}
        deathPhase={null}
        deathWhisper=""
        onToggleTornMap={interactions.handleToggleTornMap}
        onCloseDoc={interactions.handleCloseDoc}
        onUnlockChest={interactions.handleUnlockChest}
        onClosePadlock={() => interactions.setPadlockOpen(false)}
        onCloseTornMap={() => interactions.setTornMapOpen(false)}
        onSkipCutscene={finishCutscene}
        onRespawn={() => {}}
        onMenu={handleMenu}
      />
    </div>
  );
}
