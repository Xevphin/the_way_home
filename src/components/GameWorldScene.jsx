// ============================================================================
// src/components/GameWorldScene.jsx
// Single Unified Chapter 1 Midnight Forest 3D world inside <Canvas>:
// - Renders RuralRoadWorld + SafeZoneSanctuaries consistently across FM Radio
//   Crash Cutscene & immediate post-crash exploration
// - Activates ShadowStalker + JumpscareLunge3D ONLY AFTER the player reads
//   the Forestry Office memo or experiences the Phantom Stall hallucination!
// ============================================================================

import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import RuralRoadWorld from './RuralRoadWorld';
import StalledSedan from './StalledSedan';
import CarCabinOverlay3D from './CarCabinOverlay3D';
import SafeZoneSanctuaries from './SafeZoneSanctuaries';
import CrashCutscene from './CrashCutscene';
import PhantomStallSequence from './PhantomStallSequence';
import PlayerController from './PlayerController';
import ShadowStalker from './ShadowStalker';
import JumpscareLunge3D from './JumpscareLunge3D';

function SceneShaderWarmup() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    try {
      gl.compile(scene, camera);
    } catch {
      // Ignore WebGL compile edge cases on context loss
    }
  }, [gl, scene, camera]);
  return null;
}

export default function GameWorldScene({
  progress,
  paused,
  inCutscene,
  cutsceneState,
  sedanGroupRef,
  gameplayActive,
  jumpscareActive,
  catchPosRef,
  activeSafeZone,
  windowScareActive,
  watchtowerScareActive,
  elderTalking,
  stallSeqActive,
  dinersStare,
  flashlightFlicker,
  settings,
  flashlightOn,
  batteryLevel,
  playerPosRef,
  playerYawRef,
  respawnCount,
  onCutsceneUpdate,
  onOneShotFlash,
  onImpactShock,
  onCutsceneComplete,
  onToggleFlashlight,
  onToggleTornMap,
  onHoverInteractable,
  onInteract,
  onEnterSafeZone,
  onThreatChange,
  onCatchPlayer,
  onDinersStare,
  onFlashStrobe,
  onRevealStallReality,
  onSubtitle,
  onStallSeqComplete,
}) {
  const flashFigureRef = useRef();
  const inCabin = inCutscene && cutsceneState.inCabin;
  const activeHeadlightPower = inCutscene ? cutsceneState.headlightPower : 0.42;
  const highBeamsOn = inCabin && activeHeadlightPower > 0.5;
  const stalkerLive = Boolean(progress.stalkerAwakened) && gameplayActive;

  return (
    <>
      <SceneShaderWarmup />

      <RuralRoadWorld
        memoRead={progress.memoRead}
        hasTornMap={progress.hasTornMap}
        hasCrowbar={progress.hasCrowbar}
        cratePried={progress.cratePried}
        hasIronKey={progress.hasIronKey}
        shedUnlocked={progress.shedUnlocked}
        hasBelt={progress.hasBelt}
        hasBatteryCell={progress.hasBatteryCell}
        chestUnlocked={progress.chestUnlocked}
        posterRead={progress.posterRead}
        newspaperRead={progress.newspaperRead}
        pamphletRead={progress.pamphletRead}
        elderTalking={elderTalking}
        windowScareActive={windowScareActive}
        watchtowerScareActive={watchtowerScareActive}
        milestoneRead={progress.milestoneRead}
        shelterRead={progress.shelterRead}
        dinersStare={dinersStare}
        stallRevealed={progress.stallRevealed}
      />

      <group ref={sedanGroupRef} position={[1.2, 0, inCutscene ? 112.0 : 0]}>
        <StalledSedan
          position={[0, 0, 0]}
          isDented={inCutscene ? cutsceneState.isDented : true}
          headlightPower={activeHeadlightPower}
          hazardsOn={inCutscene ? cutsceneState.hazardsOn : true}
          inspected={progress.carInspected}
          interiorView={inCabin}
        />
        {/* Keep headlight fill lights permanently mounted (zero GPU shader recompile on flicker!) */}
        <pointLight
          position={[0, 1.6, -10.5]}
          color="#ffe9bc"
          intensity={highBeamsOn ? activeHeadlightPower * 12 : 0}
          distance={28}
          decay={1.4}
        />
        <pointLight
          position={[0, 2.1, -24.0]}
          color="#ffdca0"
          intensity={highBeamsOn ? activeHeadlightPower * 8 : 0}
          distance={32}
          decay={1.4}
        />
        <CarCabinOverlay3D
          visible={inCabin}
          hazardsOn={cutsceneState.hazardsOn}
          showFlashFigure={false}
          flashFigureRef={flashFigureRef}
          radioActive={true}
          radioStatic={Boolean(cutsceneState.radioStatic)}
        />
      </group>

      <SafeZoneSanctuaries />

      <CrashCutscene
        active={inCutscene}
        paused={paused}
        sedanGroupRef={sedanGroupRef}
        flashFigureRef={flashFigureRef}
        onCutsceneUpdate={onCutsceneUpdate}
        onOneShotFlash={onOneShotFlash}
        onImpactShock={onImpactShock}
        onComplete={onCutsceneComplete}
      />

      <PhantomStallSequence
        active={stallSeqActive}
        playerPosRef={playerPosRef}
        playerYawRef={playerYawRef}
        onDinersStare={onDinersStare}
        onFlashStrobe={onFlashStrobe}
        onRevealReality={onRevealStallReality}
        onSubtitle={onSubtitle}
        onComplete={onStallSeqComplete}
      />

      <PlayerController
        enabled={gameplayActive}
        sensitivity={settings.sensitivity}
        flashlightOn={flashlightOn}
        flashlightFlicker={flashlightFlicker}
        batteryLevel={batteryLevel}
        progress={progress}
        playerPosRef={playerPosRef}
        playerYawRef={playerYawRef}
        respawnTrigger={respawnCount}
        onToggleFlashlight={onToggleFlashlight}
        onToggleTornMap={onToggleTornMap}
        onHoverInteractable={onHoverInteractable}
        onInteract={onInteract}
        onEnterSafeZone={onEnterSafeZone}
      />

      {/* Smart Pacing: Lurker Activates Only After Forestry Memo or Phantom Stall */}
      <ShadowStalker
        active={stalkerLive}
        playerPosRef={playerPosRef}
        flashlightOn={flashlightOn}
        batteryLevel={batteryLevel}
        inSafeZone={Boolean(activeSafeZone)}
        respawnTrigger={respawnCount}
        onThreatChange={onThreatChange}
        onCatchPlayer={onCatchPlayer}
      />

      <JumpscareLunge3D active={jumpscareActive} catchPosRef={catchPosRef} />
    </>
  );
}
