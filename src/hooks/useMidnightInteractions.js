// ============================================================================
// src/hooks/useMidnightInteractions.js
// Dedicated interaction hook for Chapter 1 Midnight Valley Exploration:
// - Keeps cursor LOCKED across all in-game dialogues & pickups
// - One-time Uncle dialogue lock (idle warm nod/greeting on repeat [E])
// - Gated tool/key progression: Crowbar -> Boarded Crate (Alternator Belt),
//   Rusted Iron Key -> Locked Shed Door (Car Battery Cell), Riddle 6414 ->
//   Starter Relay, plus 4 readable lore documents & non-lethal scares!
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { MONOLOGUE } from '../data/chapter1/monologueData';
import { getTreeFlyerById } from '../data/chapter1/treeFlyersData';
import { getSubtitleDurationMs } from '../data/shared/dialogueTiming';
import { SURAU_ELDER_DIALOGUE } from '../components/chapter1/SurauElderNPC';
import { playSanctuaryChime } from '../components/shared/AudioEngine';
import { playChoreChime, playDoorLatch } from '../components/shared/MorningAudio';
import useMidnightScares from './useMidnightScares';

function releasePointer() {
  if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
}

export default function useMidnightInteractions({
  progress,
  setProgress,
  setBatteryLevel,
  hoverInteractable,
  setHoverInteractable,
  showSubtitle,
  onStartEscapeChase,
}) {
  const [activeDocId, setActiveDocId] = useState(null);
  const [padlockOpen, setPadlockOpen] = useState(false);
  const [tornMapOpen, setTornMapOpen] = useState(false);
  const [elderTalking, setElderTalking] = useState(false);
  const [stallSeqActive, setStallSeqActive] = useState(false);
  const [dinersStare, setDinersStare] = useState(false);
  const [flashStrobe, setFlashStrobe] = useState(false);
  const [pickupToast, setPickupToast] = useState(null);
  const [respawnCount, setRespawnCount] = useState(0);
  const elderTimersRef = useRef([]);
  const toastTimerRef = useRef(null);

  const scares = useMidnightScares({ showSubtitle });

  useEffect(() => () => {
    elderTimersRef.current.forEach((t) => clearTimeout(t));
    clearTimeout(toastTimerRef.current);
  }, []);

  const flashPickup = useCallback((label) => {
    setPickupToast({ id: Date.now(), label });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setPickupToast(null), 1250);
  }, []);

  const startSurauElderDialogue = useCallback(() => {
    if (elderTalking) return;
    if (progress.elderSpoken) {
      playSanctuaryChime(false);
      showSubtitle({ tag: 'UNCLE', text: 'Stay in the light, son. Find those three car parts and head straight home.' }, 3600);
      return;
    }

    setElderTalking(true);
    playSanctuaryChime(true);
    elderTimersRef.current.forEach((t) => clearTimeout(t));
    elderTimersRef.current = [];

    let accMs = 150;
    SURAU_ELDER_DIALOGUE.forEach((beat) => {
      const dur = getSubtitleDurationMs(beat.text, beat.speaker);
      elderTimersRef.current.push(setTimeout(() => showSubtitle({ tag: beat.speaker, text: beat.text }, dur), accMs));
      accMs += dur;
    });

    elderTimersRef.current.push(setTimeout(() => {
      setElderTalking(false);
      setProgress((prev) => ({ ...prev, elderSpoken: true }));
    }, accMs + 200));
  }, [elderTalking, progress.elderSpoken, showSubtitle, setProgress]);

  const handleCloseDoc = useCallback(() => {
    const closingId = activeDocId;
    setActiveDocId(null);
    if (closingId === 'forestry_memo') {
      setProgress((prev) => {
        if (prev.officeScareDone) return prev;
        scares.triggerOfficeWindowScare();
        return { ...prev, memoRead: true, officeScareDone: true, stalkerAwakened: true };
      });
    } else if (closingId === 'missing_poster') {
      scares.triggerWatchtowerDart();
    }
  }, [activeDocId, setProgress, scares]);

  const handleUnlockChest = useCallback(() => {
    setPadlockOpen(false);
    playSanctuaryChime(true);
    flashPickup('Starter Relay');
    setProgress((prev) => ({
      ...prev, chestUnlocked: true, hasStarterRelay: true,
      lastSafeZoneName: 'Wayfarer Lantern Wakaf', lastRespawnPoint: [71.2, 1.7, -193.0], lastRespawnYaw: -Math.PI / 2,
    }));
    showSubtitle({ tag: 'STARTER RELAY', text: 'Got the Starter Relay from the supply chest! Once I have all 3 parts, I can fix the car.' }, 5800);
  }, [setProgress, showSubtitle, flashPickup]);

  const handleToggleTornMap = useCallback(() => {
    if (!progress.hasTornMap) return;
    setTornMapOpen((prev) => {
      if (!prev) releasePointer();
      return !prev;
    });
  }, [progress.hasTornMap]);

  const openLoreDocument = useCallback(
    (docId, readField) => {
      releasePointer();
      setHoverInteractable(null);
      setActiveDocId(docId);
      setProgress((prev) => ({ ...prev, [readField]: true }));
    },
    [setHoverInteractable, setProgress]
  );

  const handleInteract = useCallback(() => {
    if (!hoverInteractable) return;
    const id = hoverInteractable.id;

    if (id === 'inspect_car') {
      playSanctuaryChime(false);
      setProgress((prev) => ({ ...prev, carInspected: true }));
      showSubtitle(MONOLOGUE.inspectBumper, 6000);
      return;
    }
    if (id === 'repair_car') {
      playChoreChime();
      setHoverInteractable(null);
      onStartEscapeChase?.();
      return;
    }
    if (id === 'surau_elder') { startSurauElderDialogue(); return; }
    if (id === 'clue_milestone') {
      setProgress((prev) => ({ ...prev, milestoneRead: true }));
      scares.triggerBehindWhisper('KM 14 — Route 312 closed years ago... Better remember that number.');
      return;
    }
    if (id === 'pickup_map') {
      playChoreChime();
      flashPickup('Torn Hand-Drawn Map');
      setProgress((prev) => ({ ...prev, hasTornMap: true }));
      showSubtitle({ tag: 'TORN MAP', text: 'Found a torn valley sketch! Press [M] anytime to inspect it.' }, 5200);
      return;
    }
    if (id === 'pickup_crowbar') {
      playChoreChime();
      flashPickup('Heavy Crowbar');
      setProgress((prev) => ({ ...prev, hasCrowbar: true }));
      scares.triggerBehindWhisper('Grabbed a Heavy Crowbar... Wait—did something just whisper behind my neck?!');
      return;
    }
    if (id === 'boarded_crate') {
      if (!progress.hasCrowbar && !progress.cratePried) {
        playDoorLatch(false);
        showSubtitle({
          tag: 'BOARDED CRATE',
          text: 'Nailed shut with thick timber planks. I need a heavy crowbar—maybe in the east outer ruin.',
        }, 5200);
        return;
      }
      if (!progress.cratePried) {
        playDoorLatch(true);
        setProgress((prev) => ({ ...prev, cratePried: true }));
        scares.triggerBehindWhisper('Pried the crate open! There is an intact Alternator Belt inside!');
        return;
      }
      playChoreChime();
      flashPickup('Alternator Belt');
      setProgress((prev) => ({ ...prev, hasBelt: true }));
      showSubtitle({ tag: 'CAR COMPONENT', text: 'Collected the Alternator Belt from the pried crate!' }, 5200);
      return;
    }
    if (id === 'pickup_iron_key') {
      playChoreChime();
      flashPickup('Rusted Iron Shed Key');
      setProgress((prev) => ({ ...prev, hasIronKey: true }));
      scares.triggerBehindWhisper('Found a Rusted Iron Key on the desk—probably unlocks the Rubber Tapper’s Shed!');
      return;
    }
    if (id === 'shed_door') {
      if (!progress.hasIronKey) {
        playDoorLatch(false);
        showSubtitle({
          tag: 'LOCKED SHED',
          text: 'A rusted iron padlock seals the shed door. The Forestry Office across the road might have the key.',
        }, 5400);
        return;
      }
      playDoorLatch(true);
      flashPickup('Shed Unlocked');
      setProgress((prev) => ({ ...prev, shedUnlocked: true }));
      scares.triggerBehindWhisper('The rusted padlock snapped open! Something banged the back wall inside...');
      return;
    }
    if (id === 'pickup_battery_cell') {
      playChoreChime();
      flashPickup('Car Battery Cell');
      setBatteryLevel?.(100);
      setProgress((prev) => ({ ...prev, hasBatteryCell: true }));
      showSubtitle({ tag: 'CAR COMPONENT', text: 'Grabbed a fresh Car Battery Cell—and topped up my flashlight!' }, 5200);
      return;
    }
    if (id === 'forestry_memo') { openLoreDocument('forestry_memo', 'memoRead'); return; }
    if (id === 'lore_poster') { openLoreDocument('missing_poster', 'posterRead'); return; }
    if (id === 'lore_newspaper') { openLoreDocument('local_newspaper', 'newspaperRead'); return; }
    if (id === 'lore_pamphlet') { openLoreDocument('logging_pamphlet', 'pamphletRead'); return; }
    if (id === 'clue_shelter') {
      setProgress((prev) => ({ ...prev, shelterRead: true }));
      scares.triggerBehindWhisper("'Survey crew pulled out after night three. Do NOT stop if you see warm lights ahead.'");
      return;
    }
    if (id === 'wakaf_chest' && !progress.chestUnlocked) {
      releasePointer();
      setHoverInteractable(null);
      setPadlockOpen(true);
      return;
    }
    if (id === 'phantom_stall' && !progress.stallRevealed) {
      setHoverInteractable(null);
      setStallSeqActive(true);
      return;
    }
    if (id.startsWith('tree_flyer_')) {
      const flyer = getTreeFlyerById(id);
      if (flyer) showSubtitle({ tag: 'INNER THOUGHT', text: flyer.reaction }, 5200);
    }
  }, [
    hoverInteractable, progress.hasCrowbar, progress.cratePried, progress.hasIronKey,
    progress.chestUnlocked, progress.stallRevealed, setProgress, setBatteryLevel,
    setHoverInteractable, showSubtitle, flashPickup, startSurauElderDialogue,
    openLoreDocument, onStartEscapeChase, scares,
  ]);

  const handleRevealStallReality = useCallback(() => {
    setProgress((prev) => ({ ...prev, stallRevealed: true, stalkerAwakened: true }));
  }, [setProgress]);

  const handleStallSeqComplete = useCallback(() => {
    setStallSeqActive(false);
    setDinersStare(false);
    setRespawnCount((c) => c + 1);
  }, []);

  const handleRespawn = useCallback(() => {
    scares.clearDeathPhase();
    setBatteryLevel?.((b) => Math.max(65, b));
    setRespawnCount((c) => c + 1);
  }, [scares, setBatteryLevel]);

  return {
    flashlightFlicker: scares.flashlightFlicker,
    windowScareActive: scares.windowScareActive,
    watchtowerScareActive: scares.watchtowerScareActive,
    deathPhase: scares.deathPhase,
    deathWhisper: scares.deathWhisper,
    catchPosRef: scares.catchPosRef,
    triggerLurkerCatch: scares.triggerLurkerCatch,
    handleRespawn,
    activeDocId,
    padlockOpen,
    setPadlockOpen,
    tornMapOpen,
    setTornMapOpen,
    elderTalking,
    stallSeqActive,
    dinersStare,
    setDinersStare,
    flashStrobe,
    setFlashStrobe,
    pickupToast,
    respawnCount,
    handleCloseDoc,
    handleUnlockChest,
    handleToggleTornMap,
    handleInteract,
    handleRevealStallReality,
    handleStallSeqComplete,
  };
}
