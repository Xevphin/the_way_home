// ============================================================================
// src/components/EveningCampusController.jsx
// First-person controller at Universiti Alam after the Sunset Time-Skip:
// - Player walks from the Academic Hall steps across the evening plaza to
//   their parked car in the lot ([3.8, 0, 5.8]).
// - Strict line-of-sight (< 2.8m AND camera look dot > 0.85) required to
//   display 'Press "E" / To Drive to the Cafe' and trigger the fade-to-black.
// ============================================================================

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { checkCameraLookAtTarget } from '../data/interactionRaycast';
import {
  clampMouseDelta,
  createPointerLockSpikeGuard,
  requestCanvasPointerLock,
} from '../data/pointerLookGuard';
import { playFootstepSound } from './AudioEngine';

const EVENING_CAR_DOOR = [2.85, 1.05, 5.8];
const CAMPUS_CAR_COLLIDERS = [
  { minX: 2.65, maxX: 4.95, minZ: 3.45, maxZ: 8.15 },
  { minX: -8.35, maxX: -6.05, minZ: 3.65, maxZ: 8.35 },
  { minX: -4.85, maxX: -2.55, minZ: 3.65, maxZ: 8.35 },
  { minX: 6.15, maxX: 8.45, minZ: 3.65, maxZ: 8.35 },
];

export default function EveningCampusController({
  enabled,
  sensitivity = 1.0,
  onHoverInteractable,
  onEnterCar,
}) {
  const { camera, gl } = useThree();
  const keysRef = useRef({});
  const yawRef = useRef(Math.PI - 0.22); // Facing south toward the evening parking lot
  const pitchRef = useRef(-0.06);
  const isDraggingRef = useRef(false);
  const stepTimerRef = useRef(0);
  const initializedRef = useRef(false);
  const lastHoverRef = useRef(false);
  const canInteractRef = useRef(false);
  const onEnterCarRef = useRef(onEnterCar);
  onEnterCarRef.current = onEnterCar;

  useEffect(() => {
    if (!enabled || initializedRef.current) return;
    initializedRef.current = true;
    camera.position.set(0.3, 1.65, -6.2);
    yawRef.current = Math.PI - 0.22;
    pitchRef.current = -0.06;
  }, [enabled, camera]);

  useEffect(() => {
    if (!enabled) return undefined;

    const onKeyDown = (e) => {
      keysRef.current[e.code] = true;
      if (e.code === 'KeyE' && canInteractRef.current) {
        onEnterCarRef.current?.();
      }
    };
    const onKeyUp = (e) => {
      keysRef.current[e.code] = false;
    };
    const guard = createPointerLockSpikeGuard();
    const onMouseMove = (e) => {
      const locked = Boolean(document.pointerLockElement);
      if ((!locked && !isDraggingRef.current) || guard.shouldIgnore()) return;
      const spd = 0.0022 * sensitivity;
      yawRef.current -= clampMouseDelta(e.movementX) * spd;
      pitchRef.current = THREE.MathUtils.clamp(
        pitchRef.current - clampMouseDelta(e.movementY) * spd,
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
      const speed = sprinting ? 6.2 : 4.1;
      const nx = THREE.MathUtils.clamp(camera.position.x + move.x * speed * dt, -11, 11);
      const nz = THREE.MathUtils.clamp(camera.position.z + move.z * speed * dt, -14, 12);

      // Solid AABB around all parked campus sedans
      const hitsCar = CAMPUS_CAR_COLLIDERS.some(
        (c) => nx > c.minX && nx < c.maxX && nz > c.minZ && nz < c.maxZ
      );
      if (!hitsCar) {
        camera.position.x = nx;
        camera.position.z = nz;
      }

      stepTimerRef.current += dt * (sprinting ? 10.5 : 7.2);
      camera.position.y = 1.65 + Math.sin(stepTimerRef.current) * 0.035;
      if (Math.sin(stepTimerRef.current) < -0.93) playFootstepSound(sprinting);
    } else {
      camera.position.y += (1.65 - camera.position.y) * 0.15;
    }

    // Strict close-reach (< 2.8m) + direct camera line-of-sight (dot > 0.85) check
    const hit = checkCameraLookAtTarget(camera, EVENING_CAR_DOOR, 2.8, 0.85);
    canInteractRef.current = hit.valid;
    if (hit.valid !== lastHoverRef.current) {
      lastHoverRef.current = hit.valid;
      onHoverInteractable(
        hit.valid
          ? {
              id: 'evening_car',
              keyLabel: 'Press "E"',
              actionLabel: 'To Drive to the Cafe',
            }
          : null
      );
    }
  });

  return null;
}
