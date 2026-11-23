// ============================================================================
// src/hooks/useDeathSequence.js
// Encapsulates the 1.4s jumpscare -> "CONSUMED BY THE DARK" death screen
// transition and sanctuary respawn handler.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { getDeathWhisper } from '../data/deathWhispers';
import { MONOLOGUE } from '../data/monologueData';
import { playJumpscareScreech } from '../components/AudioEngine';

const JUMPSCARE_MS = 1400;

function releasePointer() {
  if (document.pointerLockElement && document.exitPointerLock) {
    document.exitPointerLock();
  }
}

export default function useDeathSequence({
  demoCompleted,
  flashlightOn,
  batteryLevel,
  collectedCount,
  lastSafeZoneName,
  setFlashlightOn,
  setBatteryLevel,
  setHoverInteractable,
  setThreatLevel,
  showSubtitle,
}) {
  const [deathPhase, setDeathPhase] = useState(null); // null | 'JUMPSCARE' | 'DEATH'
  const [deathWhisper, setDeathWhisper] = useState('');
  const [respawnCount, setRespawnCount] = useState(0);
  const catchPosRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const triggerCatch = useCallback(
    (catchPos) => {
      if (deathPhase || demoCompleted) return;
      catchPosRef.current = catchPos || null;
      setDeathWhisper(
        getDeathWhisper({
          flashlightOn,
          batteryLevel,
          collectedCount,
          deaths: respawnCount,
        })
      );
      setHoverInteractable(null);
      setThreatLevel(0);
      playJumpscareScreech();
      setDeathPhase('JUMPSCARE');
      timerRef.current = setTimeout(() => {
        releasePointer();
        setDeathPhase('DEATH');
      }, JUMPSCARE_MS);
    },
    [
      deathPhase,
      demoCompleted,
      flashlightOn,
      batteryLevel,
      collectedCount,
      respawnCount,
      setHoverInteractable,
      setThreatLevel,
    ]
  );

  const respawnAtSanctuary = useCallback(() => {
    setDeathPhase(null);
    setFlashlightOn(true);
    setBatteryLevel((b) => Math.max(b, 45));
    setRespawnCount((c) => c + 1);
    showSubtitle(MONOLOGUE.respawned(lastSafeZoneName), 5200);
  }, [lastSafeZoneName, setFlashlightOn, setBatteryLevel, showSubtitle]);

  const cancelDeathTimers = useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  return {
    deathPhase,
    deathWhisper,
    respawnCount,
    catchPosRef,
    triggerCatch,
    respawnAtSanctuary,
    cancelDeathTimers,
  };
}
