// ============================================================================
// src/components/PlayerController.jsx
// Zero-snap first-person controller for Chapter 1 Midnight Valley:
// - Exclusive mutable yawRef/pitchRef camera rotation in useFrame with
//   clampMouseDelta ([-90, +90]) & pointerlockchange spike guard
// - Expanded Oakside trail bounds (x in [-30, +30]), strict locked-shed
//   AABB collisions, and flashlight-independent [E] pickups & lore reads!
// ============================================================================

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  MIDNIGHT_LANDMARKS,
  getGroundElevationAt,
  hitsMidnightCollider,
} from '../data/midnightLandmarksData';
import { getSafeZoneAtPosition } from '../data/gameState';
import { getFlashlightBeamTexture } from '../data/flashlightBeamTexture';
import { TREE_FLYERS } from '../data/treeFlyersData';
import { checkCameraLookAtTarget } from '../data/interactionRaycast';
import {
  clampMouseDelta,
  createPointerLockSpikeGuard,
  requestCanvasPointerLock,
} from '../data/pointerLookGuard';
import { playFootstepSound } from './AudioEngine';

export default function PlayerController({
  enabled,
  sensitivity = 1.0,
  flashlightOn,
  flashlightFlicker = false,
  batteryLevel = 100,
  progress,
  playerPosRef,
  playerYawRef,
  respawnTrigger,
  onToggleFlashlight,
  onToggleTornMap,
  onHoverInteractable,
  onInteract,
  onEnterSafeZone,
}) {
  const { camera, gl } = useThree();
  const keysRef = useRef({});
  const yawRef = useRef(-0.45);
  const pitchRef = useRef(-0.08);
  const isDraggingRef = useRef(false);
  const stepTimerRef = useRef(0);
  const currentSafeIdRef = useRef(null);
  const currentHoverIdRef = useRef(null);

  const spotLightRef = useRef();
  const fillLightRef = useRef();
  const spotTargetRef = useRef(new THREE.Object3D());
  const beamMap = useMemo(() => getFlashlightBeamTexture(), []);
  const initializedRef = useRef(false);
  const lastRespawnTriggerRef = useRef(-1);

  // Keep fresh callbacks in refs so React re-renders NEVER reset camera or drop mouse listeners
  const cbRef = useRef({});
  cbRef.current = {
    onToggleFlashlight,
    onToggleTornMap,
    onInteract,
    hasTornMap: progress.hasTornMap,
  };

  useEffect(() => {
    if (!enabled) return;
    const shouldSpawn =
      !initializedRef.current || respawnTrigger !== lastRespawnTriggerRef.current;
    if (!shouldSpawn) return;
    initializedRef.current = true;
    lastRespawnTriggerRef.current = respawnTrigger;

    if (respawnTrigger > 0) {
      camera.position.copy(playerPosRef.current);
      yawRef.current = playerYawRef.current || 0;
      pitchRef.current = -0.04;
      return;
    }
    const [rx, ry, rz] = progress.lastRespawnPoint || [-0.8, 1.7, -0.5];
    camera.position.set(rx, ry, rz);
    playerPosRef.current.set(rx, ry, rz);
    yawRef.current = typeof progress.lastRespawnYaw === 'number' ? progress.lastRespawnYaw : -0.45;
    pitchRef.current = -0.06;
  }, [enabled, respawnTrigger, camera, playerPosRef, playerYawRef, progress.lastRespawnPoint, progress.lastRespawnYaw]);

  useEffect(() => {
    if (!enabled) return undefined;
    const guard = createPointerLockSpikeGuard();

    const handleKeyDown = (e) => {
      keysRef.current[e.code] = true;
      if (e.code === 'KeyF') cbRef.current.onToggleFlashlight?.();
      else if (e.code === 'KeyE') cbRef.current.onInteract?.();
      else if (e.code === 'KeyM' && cbRef.current.hasTornMap) cbRef.current.onToggleTornMap?.();
    };
    const handleKeyUp = (e) => { keysRef.current[e.code] = false; };
    const handleMouseMove = (e) => {
      const isLocked = Boolean(document.pointerLockElement);
      if ((!isLocked && !isDraggingRef.current) || guard.shouldIgnore()) return;
      const speed = 0.0022 * sensitivity;
      yawRef.current -= clampMouseDelta(e.movementX) * speed;
      pitchRef.current = THREE.MathUtils.clamp(
        pitchRef.current - clampMouseDelta(e.movementY) * speed,
        -1.25,
        1.25
      );
    };
    const handleMouseDown = (e) => {
      if (e.button === 0) {
        isDraggingRef.current = true;
        requestCanvasPointerLock();
      }
    };
    const handleMouseUp = () => { isDraggingRef.current = false; };

    document.addEventListener('pointerlockchange', guard.onPointerLockChange);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('pointerlockchange', guard.onPointerLockChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled, sensitivity, gl]);

  useFrame(({ clock }, delta) => {
    if (!enabled) return;
    const dt = Math.min(delta, 0.1);
    const keys = keysRef.current;

    if (keys['ArrowLeft']) yawRef.current += 1.65 * dt * sensitivity;
    if (keys['ArrowRight']) yawRef.current -= 1.65 * dt * sensitivity;

    camera.quaternion.setFromEuler(new THREE.Euler(pitchRef.current, yawRef.current, 0, 'YXZ'));
    playerYawRef.current = yawRef.current;

    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current);
    const moveDir = new THREE.Vector3();
    if (keys['KeyW'] || keys['ArrowUp']) moveDir.add(forward);
    if (keys['KeyS'] || keys['ArrowDown']) moveDir.sub(forward);
    if (keys['KeyD']) moveDir.add(right);
    if (keys['KeyA']) moveDir.sub(right);

    const isMoving = moveDir.lengthSq() > 0.001;
    const isSprinting = isMoving && (keys['ShiftLeft'] || keys['ShiftRight']);
    const groundY = getGroundElevationAt(camera.position.x, camera.position.z);

    if (isMoving) {
      moveDir.normalize();
      const speed = isSprinting ? 7.2 : 4.8;
      const nx = THREE.MathUtils.clamp(camera.position.x + moveDir.x * speed * dt, -122.0, 122.0);
      const nz = THREE.MathUtils.clamp(camera.position.z + moveDir.z * speed * dt, -290.0, 14.0);
      const colState = { shedUnlocked: progress.shedUnlocked };
      if (!hitsMidnightCollider(nx, camera.position.z, colState)) camera.position.x = nx;
      if (!hitsMidnightCollider(camera.position.x, nz, colState)) camera.position.z = nz;

      stepTimerRef.current += dt * (isSprinting ? 11.5 : 7.5);
      const nextGroundY = getGroundElevationAt(camera.position.x, camera.position.z);
      const targetY = nextGroundY + 1.7 + Math.sin(stepTimerRef.current) * 0.045;
      camera.position.y += (targetY - camera.position.y) * Math.min(1, dt * 14);
      if (Math.sin(stepTimerRef.current) < -0.92) playFootstepSound(isSprinting);
    } else {
      camera.position.y += (groundY + 1.7 - camera.position.y) * Math.min(1, dt * 12);
    }

    playerPosRef.current.copy(camera.position);

    const powerFactor = batteryLevel <= 1 ? 0 : Math.max(0.55, batteryLevel / 100);
    if (spotLightRef.current) {
      spotLightRef.current.position.copy(camera.position);
      const aimDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      spotTargetRef.current.position.copy(camera.position).addScaledVector(aimDir, 12);
      spotTargetRef.current.updateMatrixWorld();
      spotLightRef.current.target = spotTargetRef.current;
      if (flashlightFlicker && flashlightOn && batteryLevel > 1) {
        spotLightRef.current.intensity =
          Math.sin(clock.getElapsedTime() * 48) > -0.15 ? 55 * powerFactor : 2.5;
      } else {
        spotLightRef.current.intensity = flashlightOn && batteryLevel > 1 ? 55 * powerFactor : 0;
      }
    }
    if (fillLightRef.current) {
      fillLightRef.current.position.copy(camera.position);
    }

    const zone = getSafeZoneAtPosition(camera.position.x, camera.position.z);
    const zoneId = zone ? zone.id : null;
    if (zoneId !== currentSafeIdRef.current) {
      currentSafeIdRef.current = zoneId;
      onEnterSafeZone(zone);
    }

    // Flashlight-independent [E] interactables (works whether flashlight is ON or OFF!)
    const allPartsFound = progress.hasBelt && progress.hasBatteryCell && progress.hasStarterRelay;
    const candidates = [];
    if (allPartsFound) candidates.push(MIDNIGHT_LANDMARKS.repairCar);
    else if (!progress.carInspected) candidates.push(MIDNIGHT_LANDMARKS.carBumper);
    if (!progress.milestoneRead) candidates.push(MIDNIGHT_LANDMARKS.milestone);
    candidates.push({
      ...MIDNIGHT_LANDMARKS.surauElder,
      actionLabel: progress.elderSpoken ? 'To Greet Uncle' : 'To Speak With Uncle',
    });
    if (!progress.hasTornMap) candidates.push(MIDNIGHT_LANDMARKS.tornMap);
    if (!progress.hasCrowbar) candidates.push(MIDNIGHT_LANDMARKS.heavyCrowbar);
    if (!progress.hasBelt) {
      candidates.push({
        ...MIDNIGHT_LANDMARKS.boardedCrate,
        actionLabel: progress.cratePried
          ? 'To Pick Up Alternator Belt (Car Part)'
          : progress.hasCrowbar
            ? 'To Pry Open Crate With Crowbar'
            : 'To Inspect Boarded-Up Porch Crate',
      });
    }
    candidates.push(MIDNIGHT_LANDMARKS.forestryMemo, MIDNIGHT_LANDMARKS.localNewspaper, MIDNIGHT_LANDMARKS.missingPoster, MIDNIGHT_LANDMARKS.loggingPamphlet);
    if (!progress.hasIronKey) candidates.push(MIDNIGHT_LANDMARKS.ironKey);
    if (!progress.shedUnlocked) {
      candidates.push({
        ...MIDNIGHT_LANDMARKS.shedDoor,
        actionLabel: progress.hasIronKey ? 'To Unlock Shed With Iron Key' : 'To Inspect Padlocked Shed Door',
      });
    } else if (!progress.hasBatteryCell) {
      candidates.push(MIDNIGHT_LANDMARKS.batteryCell);
    }
    if (!progress.shelterRead) candidates.push(MIDNIGHT_LANDMARKS.busShelter);
    if (!progress.chestUnlocked) candidates.push(MIDNIGHT_LANDMARKS.wakafChest);
    if (!progress.stallRevealed) candidates.push(MIDNIGHT_LANDMARKS.phantomStall);
    candidates.push(...TREE_FLYERS);

    let nearest = null;
    let bestDist = Infinity;
    for (const c of candidates) {
      const hit = checkCameraLookAtTarget(camera, c.position, c.radius, 0.78);
      if (hit.valid && hit.distance < bestDist) {
        bestDist = hit.distance;
        nearest = { id: c.id, keyLabel: c.keyLabel, actionLabel: c.actionLabel };
      }
    }

    const nextKey = nearest ? `${nearest.id}:${nearest.actionLabel}` : null;
    if (nextKey !== currentHoverIdRef.current) {
      currentHoverIdRef.current = nextKey;
      onHoverInteractable(nearest);
    }
  });

  const powerFactor = batteryLevel <= 1 ? 0 : Math.max(0.55, batteryLevel / 100);
  const beamIntensity = flashlightOn && batteryLevel > 1 ? 55 * powerFactor : 0;
  const fillIntensity = flashlightOn && batteryLevel > 1 ? 1.8 * powerFactor : 0;

  // castShadow={true} + mounted target enables Three.js SpotLight.map concentric-ring projection!
  return (
    <>
      <primitive object={spotTargetRef.current} />
      <spotLight
        ref={spotLightRef}
        target={spotTargetRef.current}
        color="#f5f8ff"
        map={beamMap}
        intensity={beamIntensity}
        distance={65}
        angle={0.58}
        penumbra={0.35}
        decay={1.25}
        castShadow={true}
        shadow-mapSize={[512, 512]}
        shadow-camera-near={0.4}
        shadow-camera-far={65}
        shadow-bias={-0.0005}
      />
      <pointLight
        ref={fillLightRef}
        color="#e8f0ff"
        intensity={fillIntensity}
        distance={8}
        decay={2}
      />
    </>
  );
}
