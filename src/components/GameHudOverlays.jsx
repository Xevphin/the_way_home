// ============================================================================
// src/components/GameHudOverlays.jsx
// Dedicated HUD, modal & feedback overlay stack for Chapter 1 Midnight Forest:
// - ObjectiveHud, InventoryHud, TutorialPrompts, 1.2s PickupToast
// - Forestry Memo, 4-Digit Riddle Chest Padlock, Torn Sketch Map
// - SafeZoneBanner (subtitles, prompts, stalker distortion) & JumpscareOverlay
// ============================================================================

import React from 'react';
import ObjectiveHud from './ObjectiveHud';
import InventoryHud from './InventoryHud';
import TutorialPrompts from './TutorialPrompts';
import DocumentReaderModal from './DocumentReaderModal';
import ChestPadlockModal from './ChestPadlockModal';
import TornMapModal from './TornMapModal';
import SafeZoneBanner from './SafeZoneBanner';
import PickupToast from './PickupToast';
import JumpscareOverlay from './JumpscareOverlay';

export default function GameHudOverlays({
  showHud,
  paused,
  inCutscene,
  anyModalOpen,
  elderTalking,
  shockRecovery,
  flashStrobe,
  progress,
  flashlightOn,
  batteryLevel,
  activeSafeZone,
  hoverInteractable,
  subtitle,
  threatLevel,
  cutsceneState,
  pickupToast,
  activeDocId,
  padlockOpen,
  tornMapOpen,
  deathPhase,
  deathWhisper,
  onToggleTornMap,
  onCloseDoc,
  onUnlockChest,
  onClosePadlock,
  onCloseTornMap,
  onSkipCutscene,
  onRespawn,
  onMenu,
}) {
  return (
    <>
      {shockRecovery && <div className="crash-shock-overlay" aria-hidden="true" />}
      {flashStrobe && <div className="hallucination-strobe-overlay" aria-hidden="true" />}

      {showHud && (
        <>
          <ObjectiveHud progress={progress} />
          <InventoryHud
            flashlightOn={flashlightOn}
            batteryLevel={batteryLevel}
            progress={progress}
            onToggleTornMap={onToggleTornMap}
          />
          <TutorialPrompts
            active={!anyModalOpen && !elderTalking}
            suppress={Boolean(hoverInteractable) || elderTalking}
          />
        </>
      )}

      <PickupToast toast={pickupToast} />

      <DocumentReaderModal docId={activeDocId} onClose={onCloseDoc} />
      <ChestPadlockModal
        open={padlockOpen}
        memoRead={progress.memoRead}
        milestoneRead={progress.milestoneRead}
        onUnlock={onUnlockChest}
        onClose={onClosePadlock}
      />
      <TornMapModal open={tornMapOpen} progress={progress} onClose={onCloseTornMap} />

      <SafeZoneBanner
        hidden={progress.chapterCompleted || paused || anyModalOpen || Boolean(deathPhase)}
        activeSafeZone={activeSafeZone}
        hoverInteractable={elderTalking ? null : hoverInteractable}
        subtitle={subtitle}
        threatLevel={threatLevel}
        isCutscene={inCutscene}
        cutsceneTag={cutsceneState.captionTag}
        cutsceneCaption={cutsceneState.caption}
        onSkipCutscene={onSkipCutscene}
      />

      <JumpscareOverlay
        phase={deathPhase}
        whisper={deathWhisper}
        sanctuaryName={progress.lastSafeZoneName}
        onRespawn={onRespawn}
        onReturnToMenu={onMenu}
      />
    </>
  );
}
