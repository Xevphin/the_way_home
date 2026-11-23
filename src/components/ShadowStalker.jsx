// ============================================================================
// src/components/ShadowStalker.jsx
// Evil Spirit Stalker AI (visuals live in ShadowStalkerModel.jsx):
// - Creeps closer while the player is in the dark (heartbeat + vignette)
// - Shining the flashlight on it makes it shudder and vanish into the fog
// - Stops abruptly at Safe Zone light boundaries and retreats
// - Fairness: pauses while inactive ([M] map / cutscene / death), 3s grace
//   after leaving a Safe Zone or respawning, 1.5s grace after unpausing
// - On catch, reports its position so the jumpscare can snap toward it
// ============================================================================

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SAFE_ZONES } from '../data/objectivesData';
import { getSafeZoneAtPosition } from '../data/gameState';
import { playHeartbeatPulse, playSpiritRecoilWhisper } from './AudioEngine';
import ShadowStalkerModel from './ShadowStalkerModel';

const BANISH_CONE_DOT = 0.8; // ~37° half-angle (wider than before)
const SAFE_EXIT_GRACE = 3.0;
const UNPAUSE_GRACE = 1.5;

export default function ShadowStalker({
  active,
  playerPosRef,
  flashlightOn,
  batteryLevel = 100,
  inSafeZone,
  respawnTrigger = 0,
  onThreatChange,
  onCatchPlayer,
}) {
  const { camera } = useThree();
  const entityRef = useRef();
  const shroudMatRef = useRef();

  const posRef = useRef(new THREE.Vector3(-11.5, 0, -28.0));
  const heartbeatTimerRef = useRef(0);
  const retreatPauseRef = useRef(0);
  const lastThreatRef = useRef(0);
  const litDurationRef = useRef(0);
  const vanishTimerRef = useRef(0);
  const graceRef = useRef(0);
  const prevSafeRef = useRef(false);
  const prevActiveRef = useRef(false);
  const pendingRespawnRef = useRef(false);
  const camForwardRef = useRef(new THREE.Vector3());
  const toSpiritRef = useRef(new THREE.Vector3());

  const sendThreat = (value) => {
    if (value !== lastThreatRef.current) {
      lastThreatRef.current = value;
      onThreatChange(value);
    }
  };

  // Flag a respawn; the next active frame banishes the spirit deep into the trees
  useEffect(() => {
    if (respawnTrigger > 0) pendingRespawnRef.current = true;
  }, [respawnTrigger]);

  useFrame(({ clock }, delta) => {
    if (!active || !entityRef.current) {
      if (entityRef.current) entityRef.current.visible = false;
      sendThreat(0);
      prevActiveRef.current = false; // Hidden & inactive until awakened (memo / phantom stall)
      return;
    }
    const dt = Math.min(delta, 0.1);
    const t = clock.getElapsedTime();
    const playerPos = playerPosRef.current;
    const entityPos = posRef.current;

    if (pendingRespawnRef.current) {
      pendingRespawnRef.current = false;
      entityPos.set(-14.0, 0, playerPos.z - 24.0);
      graceRef.current = SAFE_EXIT_GRACE;
      litDurationRef.current = 0;
      vanishTimerRef.current = 0;
    }

    // Grace windows: resuming from pause, or stepping out of a Safe Zone
    if (!prevActiveRef.current) {
      prevActiveRef.current = true;
      graceRef.current = Math.max(graceRef.current, UNPAUSE_GRACE);
    }
    if (prevSafeRef.current && !inSafeZone) {
      graceRef.current = Math.max(graceRef.current, SAFE_EXIT_GRACE);
    }
    prevSafeRef.current = inSafeZone;
    graceRef.current = Math.max(0, graceRef.current - dt);

    // Banished: hidden in the fog, then re-emerges further down the treeline
    if (vanishTimerRef.current > 0) {
      vanishTimerRef.current -= dt;
      entityRef.current.visible = false;
      sendThreat(0);
      if (vanishTimerRef.current <= 0) {
        const side = Math.random() > 0.5 ? -1 : 1;
        entityPos.set(side * (9.5 + Math.random() * 4.5), 0, playerPos.z - 22.0);
        litDurationRef.current = 0;
      }
      return;
    }
    entityRef.current.visible = true;

    const nearStartingCar = playerPos.z > -6.5;

    // Is the flashlight beam aimed directly at the spirit?
    let isDirectlyLit = false;
    if (flashlightOn && batteryLevel > 2 && !inSafeZone && !nearStartingCar) {
      camera.getWorldDirection(camForwardRef.current);
      toSpiritRef.current.set(
        entityPos.x - playerPos.x,
        1.8 - playerPos.y,
        entityPos.z - playerPos.z
      );
      const distToCam = toSpiritRef.current.length();
      if (distToCam < 26 && distToCam > 1.2) {
        toSpiritRef.current.normalize();
        isDirectlyLit = camForwardRef.current.dot(toSpiritRef.current) > BANISH_CONE_DOT;
      }
    }

    if (isDirectlyLit) {
      // Shudder violently in the beam, fade, then dissolve into the fog
      litDurationRef.current += dt;
      entityRef.current.position.set(
        entityPos.x + (Math.random() - 0.5) * 0.22,
        0.1 + (Math.random() - 0.5) * 0.1,
        entityPos.z + (Math.random() - 0.5) * 0.22
      );
      if (shroudMatRef.current) {
        shroudMatRef.current.opacity = Math.max(0.15, 0.94 - litDurationRef.current * 0.85);
      }
      if (litDurationRef.current >= 0.85) {
        playSpiritRecoilWhisper();
        vanishTimerRef.current = 5.5;
        litDurationRef.current = 0;
        if (shroudMatRef.current) shroudMatRef.current.opacity = 0.94;
      }
      return;
    }

    litDurationRef.current = Math.max(0, litDurationRef.current - dt * 1.5);
    if (shroudMatRef.current) shroudMatRef.current.opacity = 0.94;

    if (inSafeZone || nearStartingCar) {
      // Stop abruptly at the warm light boundary, then retreat into the trees
      const zone = getSafeZoneAtPosition(playerPos.x, playerPos.z);
      if (zone) {
        const dx = entityPos.x - zone.position[0];
        const dz = entityPos.z - zone.position[2];
        const distToCenter = Math.hypot(dx, dz) || 1;
        const minEdge = zone.radius + 0.9;
        if (distToCenter < minEdge + 1.6) {
          entityPos.x = zone.position[0] + (dx / distToCenter) * minEdge;
          entityPos.z = zone.position[2] + (dz / distToCenter) * minEdge;
          retreatPauseRef.current += dt;
        }
        if (retreatPauseRef.current > 1.2 || distToCenter >= minEdge + 1.6) {
          const side = zone.position[0] >= 0 ? -14.5 : 14.5;
          entityPos.x += (side - entityPos.x) * dt * 1.45;
          entityPos.z += (playerPos.z - 18.0 - entityPos.z) * dt * 0.95;
        }
      } else {
        entityPos.x += (-12.5 - entityPos.x) * dt * 1.1;
        entityPos.z += (-25.0 - entityPos.z) * dt * 1.1;
      }
      sendThreat(0);
    } else if (graceRef.current > 0) {
      // Grace window: lingers at the treeline watching, but does not advance
      retreatPauseRef.current = 0;
      const edge = entityPos.x >= 0 ? 12.5 : -12.5;
      entityPos.x += (edge - entityPos.x) * dt * 0.6;
      sendThreat(0);
    } else {
      retreatPauseRef.current = 0;
      const dx = playerPos.x - entityPos.x;
      const dz = playerPos.z - entityPos.z;
      const dist = Math.hypot(dx, dz) || 0.001;

      // Creeps faster when the player is in the dark
      const inDark = !flashlightOn || batteryLevel <= 2;
      const stalkSpeed = inDark ? 3.55 : 2.1;
      entityPos.x += (dx / dist) * stalkSpeed * dt;
      entityPos.z += (dz / dist) * stalkSpeed * dt;

      // Never cross into any Safe Zone
      for (const zone of SAFE_ZONES) {
        const zdx = entityPos.x - zone.position[0];
        const zdz = entityPos.z - zone.position[2];
        const zDist = Math.hypot(zdx, zdz) || 0.001;
        const barrier = zone.radius + 0.85;
        if (zDist < barrier) {
          entityPos.x = zone.position[0] + (zdx / zDist) * barrier;
          entityPos.z = zone.position[2] + (zdz / zDist) * barrier;
        }
      }

      const newDist = Math.hypot(playerPos.x - entityPos.x, playerPos.z - entityPos.z);
      const rawThreat = THREE.MathUtils.clamp(1 - newDist / 18.5, 0, 1);
      sendThreat(Math.round(rawThreat * 20) / 20);

      if (rawThreat > 0.14) {
        heartbeatTimerRef.current += dt;
        const interval = THREE.MathUtils.lerp(1.15, 0.4, rawThreat);
        if (heartbeatTimerRef.current >= interval) {
          heartbeatTimerRef.current = 0;
          playHeartbeatPulse(rawThreat);
        }
      }

      // Non-lethal close brush during exploration: vanishes in a cold gust & triggers scare!
      if (newDist < 2.2) {
        const catchPos = entityPos.clone();
        const side = Math.random() > 0.5 ? -1 : 1;
        entityPos.set(side * 16.0, 0, playerPos.z - 28.0);
        vanishTimerRef.current = 7.5;
        entityRef.current.visible = false;
        sendThreat(0);
        playSpiritRecoilWhisper();
        onCatchPlayer?.(catchPos);
        return;
      }
    }

    entityRef.current.position.set(entityPos.x, 0.15 + Math.sin(t * 2.1) * 0.14, entityPos.z);
    entityRef.current.lookAt(playerPos.x, 1.7, playerPos.z);
  });

  return (
    <ShadowStalkerModel
      ref={entityRef}
      visible={false}
      shroudMatRef={shroudMatRef}
      position={[-11.5, 0.15, -28.0]}
    />
  );
}
