// ============================================================================
// src/components/NextMorningEpilogue.jsx
// Next-Morning (08:30 AM) sunlit home exploration inside <Canvas>:
// - Reuses HomeInterior with solid AABB furniture collisions & persistent
//   .app-root pointer lock
// - Adds 3 distinct epilogue morning chore visuals (cold water basin, messy
//   books/laptop on living room table, cold water bottle in kitchen)
// - Launches HafizDoorCutscene when opening the front door after all 3 chores!
// ============================================================================

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import HomeInterior from '../shared/HomeInterior';
import HafizDoorCutscene from './HafizDoorCutscene';
import { HOME_FURNITURE_COLLIDERS } from '../../data/chapter1/chapter1Data';
import { EPILOGUE_CHORES, EPILOGUE_DOOR_TARGET } from '../../data/chapter1/epilogueData';
import { checkCameraLookAtTarget } from '../../data/shared/interactionRaycast';
import {
  clampMouseDelta,
  createPointerLockSpikeGuard,
  requestCanvasPointerLock,
} from '../../data/shared/pointerLookGuard';
import { playFootstepSound } from '../shared/AudioEngine';

function hitsHomeCollider(x, z) {
  for (const box of HOME_FURNITURE_COLLIDERS) {
    if (x >= box.minX && x <= box.maxX && z >= box.minZ && z <= box.maxZ) return true;
  }
  if (x < -0.45 && z > -0.35 && z < 0.35) return true;
  if (z > 2.1 && x > -0.82 && x < -0.18) return true;
  if (z <= -5.55 || z > 5.45 || x < -5.9 || x > 5.9) return true;
  return false;
}

function EpilogueChoreProps({ completedChores }) {
  const hasFace = completedChores.includes('ep_water_face');
  const hasTable = completedChores.includes('ep_tidy_table');
  const hasBottle = completedChores.includes('ep_water_bottle');

  return (
    <group>
      {/* Kitchen Cold Water Basin Gleam */}
      {!hasFace && (
        <mesh position={[-4.4, 0.96, -4.8]}>
          <cylinderGeometry args={[0.22, 0.18, 0.06, 16]} />
          <meshStandardMaterial color="#87d8ff" roughness={0.2} metalness={0.15} />
        </mesh>
      )}
      {/* Living Room Coffee Table Messy Book & Notebook Stack */}
      <group position={[3.0, 0.56, 2.55]} rotation={[0, hasTable ? 0 : 0.42, 0]}>
        <mesh position={[0, 0.03, 0]} castShadow>
          <boxGeometry args={[0.34, 0.05, 0.24]} />
          <meshStandardMaterial color="#385b8a" roughness={0.75} />
        </mesh>
        <mesh position={[hasTable ? 0 : 0.08, 0.075, hasTable ? 0 : -0.05]} rotation={[0, hasTable ? 0 : -0.35, 0]}>
          <boxGeometry args={[0.28, 0.04, 0.2]} />
          <meshStandardMaterial color="#c46a3b" roughness={0.78} />
        </mesh>
      </group>
      {/* Cold Water Bottle on Kitchen Counter */}
      {!hasBottle && (
        <group position={[-2.0, 1.08, -4.9]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.045, 0.048, 0.24, 12]} />
            <meshStandardMaterial color="#8fd6ff" transparent opacity={0.86} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.135, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.035, 10]} />
            <meshStandardMaterial color="#216db8" roughness={0.4} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function NextMorningEpilogue({
  enabled,
  sensitivity = 1.0,
  completedChores,
  doorKnocked,
  doorOpen,
  hafizActive,
  onHoverInteractable,
  onInteract,
  onDoorOpenChange,
  onSubtitleChange,
  onHafizComplete,
}) {
  const { camera, gl } = useThree();
  const keysRef = useRef({});
  const yawRef = useRef(-2.35);
  const pitchRef = useRef(-0.08);
  const isDraggingRef = useRef(false);
  const stepTimerRef = useRef(0);
  const initRef = useRef(false);
  const lastHoverRef = useRef(null);

  useEffect(() => {
    if (!enabled || initRef.current) return;
    initRef.current = true;
    camera.position.set(-3.2, 1.65, 3.0);
    yawRef.current = -2.35;
    pitchRef.current = -0.08;
  }, [enabled, camera]);

  const onInteractRef = useRef(onInteract);
  onInteractRef.current = onInteract;

  useEffect(() => {
    if (!enabled) return undefined;
    const guard = createPointerLockSpikeGuard();
    const onDown = (e) => {
      keysRef.current[e.code] = true;
      if (e.code === 'KeyE') onInteractRef.current();
    };
    const onUp = (e) => { keysRef.current[e.code] = false; };
    const onMove = (e) => {
      if ((!document.pointerLockElement && !isDraggingRef.current) || guard.shouldIgnore()) return;
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
    const onMouseUp = () => { isDraggingRef.current = false; };

    document.addEventListener('pointerlockchange', guard.onPointerLockChange);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('mousemove', onMove);
    gl.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('pointerlockchange', guard.onPointerLockChange);
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('mousemove', onMove);
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

    camera.quaternion.setFromEuler(new THREE.Euler(pitchRef.current, yawRef.current, 0, 'YXZ'));

    const fwd = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current);
    const move = new THREE.Vector3();
    if (keys['KeyW'] || keys['ArrowUp']) move.add(fwd);
    if (keys['KeyS'] || keys['ArrowDown']) move.sub(fwd);
    if (keys['KeyD']) move.add(right);
    if (keys['KeyA']) move.sub(right);

    if (move.lengthSq() > 0.001) {
      move.normalize();
      const sprint = keys['ShiftLeft'] || keys['ShiftRight'];
      const spd = sprint ? 5.0 : 3.4;
      const nx = camera.position.x + move.x * spd * dt;
      const nz = camera.position.z + move.z * spd * dt;
      if (!hitsHomeCollider(nx, camera.position.z)) camera.position.x = nx;
      if (!hitsHomeCollider(camera.position.x, nz)) camera.position.z = nz;
      stepTimerRef.current += dt * (sprint ? 10 : 6.8);
      camera.position.y = 1.65 + Math.sin(stepTimerRef.current) * 0.03;
      if (Math.sin(stepTimerRef.current) < -0.93) playFootstepSound(sprint);
    } else {
      camera.position.y += (1.65 - camera.position.y) * 0.15;
    }

    let nearest = null;
    let best = Infinity;
    for (const chore of EPILOGUE_CHORES) {
      if (completedChores.includes(chore.id)) continue;
      const hit = checkCameraLookAtTarget(camera, chore.position, 2.8, 0.85);
      if (hit.valid && hit.distance < best) {
        best = hit.distance;
        nearest = { id: chore.id, keyLabel: chore.keyLabel, actionLabel: chore.actionLabel };
      }
    }
    if (doorKnocked) {
      const hit = checkCameraLookAtTarget(camera, EPILOGUE_DOOR_TARGET.position, 2.8, 0.85);
      if (hit.valid && hit.distance < best) {
        nearest = {
          id: EPILOGUE_DOOR_TARGET.id,
          keyLabel: EPILOGUE_DOOR_TARGET.keyLabel,
          actionLabel: EPILOGUE_DOOR_TARGET.actionLabel,
        };
      }
    }
    const key = nearest ? nearest.id : null;
    if (key !== lastHoverRef.current) {
      lastHoverRef.current = key;
      onHoverInteractable(nearest);
    }
  });

  return (
    <>
      <color attach="background" args={['#c8e5ff']} />
      <HomeInterior
        completedChores={['chore_alarm', 'chore_laptop', 'chore_coffee']}
        doorOpen={doorOpen}
        doorKnocked={doorKnocked}
        canExitHouse={false}
        clockText="08:30"
        dayLabel="AM  •  SAT"
      />
      <EpilogueChoreProps completedChores={completedChores} />
      <HafizDoorCutscene
        visible={doorKnocked || hafizActive}
        active={hafizActive}
        onDoorOpenChange={onDoorOpenChange}
        onSubtitleChange={onSubtitleChange}
        onComplete={onHafizComplete}
      />
    </>
  );
}
