// ============================================================================
// src/components/HomePlayerController.jsx
// Indoor + front driveway first-person controller with:
// - Solid AABB furniture collisions (coffee table, sofa, kitchen counter,
//   piano, arcade cabinet, bed, desk, parked car — zero phasing!)
// - Open front door exit into the sunlit front yard & driveway once Friend 1
//   leaves, displaying [E] Get in Car & Drive to Class near the sedan.
// ============================================================================

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  DRIVEWAY_CAR_TARGET,
  FRONT_DOOR_TARGET,
  HOME_FURNITURE_COLLIDERS,
  MORNING_CHORES,
} from '../../data/chapter1/chapter1Data';
import { checkCameraLookAtTarget } from '../../data/shared/interactionRaycast';
import {
  clampMouseDelta,
  createPointerLockSpikeGuard,
  requestCanvasPointerLock,
} from '../../data/shared/pointerLookGuard';
import { playFootstepSound } from '../shared/AudioEngine';

function hitsCollider(x, z, canExitHouse) {
  // Check all solid AABB furniture & car colliders
  for (const box of HOME_FURNITURE_COLLIDERS) {
    if (x >= box.minX && x <= box.maxX && z >= box.minZ && z <= box.maxZ) {
      return true;
    }
  }
  // Bedroom partition walls: z = 0 for x < -0.5, x = -0.5 for z > 2.15
  if (x < -0.45 && z > -0.35 && z < 0.35) return true;
  if (z > 2.1 && x > -0.82 && x < -0.18) return true;

  // North house wall at z = -6.0 (open doorway x in [2.75, 3.65] once canExitHouse)
  const inDoorway = canExitHouse && x >= 2.75 && x <= 3.65;
  if (!inDoorway && z <= -5.55 && z >= -6.45) return true;

  // Perimeter bounds (inside house vs exterior front yard)
  if (z > -5.55) {
    if (x < -5.9 || x > 5.9 || z > 5.45) return true;
  } else {
    if (x < -6.2 || x > 8.6 || z < -16.2) return true;
  }
  return false;
}

export default function HomePlayerController({
  enabled,
  sensitivity = 1.0,
  completedChores = [],
  doorKnocked = false,
  canExitHouse = false,
  onOutsideChange,
  onHoverInteractable,
  onInteract,
}) {
  const { camera, gl } = useThree();
  const keysRef = useRef({});
  const yawRef = useRef(-2.35);
  const pitchRef = useRef(-0.08);
  const isDraggingRef = useRef(false);
  const stepTimerRef = useRef(0);
  const initializedRef = useRef(false);
  const lastHoverRef = useRef(null);
  const lastOutsideRef = useRef(false);

  useEffect(() => {
    if (!enabled || initializedRef.current) return;
    initializedRef.current = true;
    camera.position.set(-3.2, 1.65, 3.0);
    yawRef.current = -2.35;
    pitchRef.current = -0.08;
  }, [enabled, camera]);

  const onInteractRef = useRef(onInteract);
  onInteractRef.current = onInteract;

  useEffect(() => {
    if (!enabled) return undefined;
    const guard = createPointerLockSpikeGuard();

    const onKeyDown = (e) => {
      keysRef.current[e.code] = true;
      if (e.code === 'KeyE') onInteractRef.current();
    };
    const onKeyUp = (e) => {
      keysRef.current[e.code] = false;
    };
    const onMouseMove = (e) => {
      const locked = Boolean(document.pointerLockElement);
      if ((!locked && !isDraggingRef.current) || guard.shouldIgnore()) return;
      const speed = 0.0022 * sensitivity;
      yawRef.current -= clampMouseDelta(e.movementX) * speed;
      pitchRef.current = THREE.MathUtils.clamp(
        pitchRef.current - clampMouseDelta(e.movementY) * speed,
        -1.2,
        1.2
      );
    };
    const onMouseDown = (e) => {
      if (e.button === 0) {
        isDraggingRef.current = true;
        requestCanvasPointerLock();
      }
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    document.addEventListener('pointerlockchange', guard.onPointerLockChange);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    gl.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('pointerlockchange', guard.onPointerLockChange);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      gl.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [enabled, sensitivity, gl]);

  useFrame((_, delta) => {
    if (!enabled) return;
    const dt = Math.min(delta, 0.1);
    const keys = keysRef.current;

    if (keys['ArrowLeft']) yawRef.current += 1.65 * dt * sensitivity;
    if (keys['ArrowRight']) yawRef.current -= 1.65 * dt * sensitivity;

    camera.quaternion.setFromEuler(
      new THREE.Euler(pitchRef.current, yawRef.current, 0, 'YXZ')
    );

    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yawRef.current
    );
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yawRef.current
    );

    const move = new THREE.Vector3();
    if (keys['KeyW'] || keys['ArrowUp']) move.add(forward);
    if (keys['KeyS'] || keys['ArrowDown']) move.sub(forward);
    if (keys['KeyD']) move.add(right);
    if (keys['KeyA']) move.sub(right);

    const moving = move.lengthSq() > 0.001;
    const sprinting = moving && (keys['ShiftLeft'] || keys['ShiftRight']);

    if (moving) {
      move.normalize();
      const speed = sprinting ? 5.2 : 3.5;
      const curX = camera.position.x;
      const curZ = camera.position.z;
      const nextX = curX + move.x * speed * dt;
      const nextZ = curZ + move.z * speed * dt;

      // Axis-separated AABB resolution for smooth sliding along tables/walls
      if (!hitsCollider(nextX, curZ, canExitHouse)) {
        camera.position.x = nextX;
      }
      if (!hitsCollider(camera.position.x, nextZ, canExitHouse)) {
        camera.position.z = nextZ;
      }

      stepTimerRef.current += dt * (sprinting ? 10.5 : 7.0);
      camera.position.y = 1.65 + Math.sin(stepTimerRef.current) * 0.032;
      if (Math.sin(stepTimerRef.current) < -0.93) playFootstepSound(sprinting);
    } else {
      camera.position.y += (1.65 - camera.position.y) * 0.15;
    }

    const nowOutside = camera.position.z < -5.85;
    if (nowOutside !== lastOutsideRef.current) {
      lastOutsideRef.current = nowOutside;
      onOutsideChange?.(nowOutside);
    }

    // Strict close-reach (< 2.8m) + direct camera line-of-sight (dot > 0.85) check
    let nearest = null;
    let bestDist = Infinity;

    for (const chore of MORNING_CHORES) {
      if (completedChores.includes(chore.id)) continue;
      const hit = checkCameraLookAtTarget(camera, chore.position, 2.8, 0.85);
      if (hit.valid && hit.distance < bestDist) {
        bestDist = hit.distance;
        nearest = {
          id: chore.id,
          keyLabel: chore.keyLabel,
          actionLabel: chore.actionLabel,
        };
      }
    }

    if (doorKnocked && !canExitHouse) {
      const hit = checkCameraLookAtTarget(camera, FRONT_DOOR_TARGET.position, 2.8, 0.85);
      if (hit.valid && hit.distance < bestDist) {
        bestDist = hit.distance;
        nearest = {
          id: FRONT_DOOR_TARGET.id,
          keyLabel: FRONT_DOOR_TARGET.keyLabel,
          actionLabel: FRONT_DOOR_TARGET.actionLabel,
        };
      }
    }

    if (canExitHouse) {
      const hit = checkCameraLookAtTarget(camera, DRIVEWAY_CAR_TARGET.position, 2.8, 0.85);
      if (hit.valid && hit.distance < bestDist) {
        nearest = {
          id: DRIVEWAY_CAR_TARGET.id,
          keyLabel: DRIVEWAY_CAR_TARGET.keyLabel,
          actionLabel: DRIVEWAY_CAR_TARGET.actionLabel,
        };
      }
    }

    const nextKey = nearest ? nearest.id : null;
    if (nextKey !== lastHoverRef.current) {
      lastHoverRef.current = nextKey;
      onHoverInteractable(nearest);
    }
  });

  return null;
}
