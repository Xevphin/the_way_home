// ============================================================================
// src/components/chapter2/Chapter2MorningScene.jsx
// Chapter 2 Gameplay 2 — False Awakening Morning Bedroom (08:30 AM):
// - Reuses HomeInterior (08:30 bedside digital clock) + solid AABB colliders
// - Initial 3.0s panicked wake-up camera sway while bedside phone vibrates
// - Morning chores (bedside phone, kitchen sink, living room keys) -> opening
//   the front house door ([E]) snaps into the Movie Studio Plot Twist!
// ============================================================================

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import HomeInterior from '../shared/HomeInterior';
import { HOME_FURNITURE_COLLIDERS } from '../../data/chapter1/chapter1Data';
import { CH2_FRONT_DOOR_TARGET, CH2_MORNING_CHORES } from '../../data/chapter2/chapter2Data';
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

function Chapter2MorningProps({ completedIds, phoneRinging }) {
  const phoneRef = useRef();
  const hasPhone = completedIds.includes('ch2_phone');
  const hasFreshen = completedIds.includes('ch2_freshen');
  const hasKeys = completedIds.includes('ch2_keys');

  useFrame(({ clock }) => {
    if (!phoneRef.current) return;
    if (phoneRinging && !hasPhone) {
      const t = clock.getElapsedTime();
      const pulse = Math.sin(t * 2.4) > 0.35 ? 1 : 0;
      phoneRef.current.position.x = -5.35 + pulse * Math.sin(t * 68) * 0.012;
      phoneRef.current.position.z = 2.55 + pulse * Math.cos(t * 54) * 0.012;
    } else {
      phoneRef.current.position.set(-5.35, 0.72, 2.55);
    }
  });

  return (
    <group>
      {/* Buzzing Glowing Bedside Smartphone on Nightstand */}
      <group ref={phoneRef} position={[-5.35, 0.72, 2.55]} rotation={[0, 0.35, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.09, 0.014, 0.17]} />
          <meshStandardMaterial color="#181b22" roughness={0.35} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.075, 0.145]} />
          <meshStandardMaterial
            color={hasPhone ? '#1e293b' : '#93c5fd'}
            emissive={hasPhone ? '#000000' : '#60a5fa'}
            emissiveIntensity={hasPhone ? 0 : 1.9}
          />
        </mesh>
      </group>

      {/* Kitchen Cold Water Wash Basin Gleam */}
      {!hasFreshen && (
        <mesh position={[-4.4, 0.96, -4.8]}>
          <cylinderGeometry args={[0.22, 0.18, 0.06, 16]} />
          <meshStandardMaterial color="#87d8ff" roughness={0.2} metalness={0.15} />
        </mesh>
      )}

      {/* Car & House Keys on Living Room Coffee Table */}
      {!hasKeys && (
        <group position={[3.0, 0.56, 2.55]} rotation={[0, 0.5, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.04, 0.009, 8, 14]} />
            <meshStandardMaterial color="#d4af37" emissive="#e8c35a" emissiveIntensity={0.45} metalness={0.85} />
          </mesh>
          <mesh position={[0.08, 0, 0]}>
            <boxGeometry args={[0.12, 0.012, 0.032]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function Chapter2MorningScene({
  enabled,
  sensitivity = 1.0,
  completedIds = [],
  phoneRinging = true,
  onHoverInteractable,
  onInteract,
}) {
  const { camera, gl } = useThree();
  const keysRef = useRef({});
  const yawRef = useRef(-2.35);
  const pitchRef = useRef(-0.08);
  const draggingRef = useRef(false);
  const stepTimerRef = useRef(0);
  const wakeElapsedRef = useRef(0);
  const lastHoverRef = useRef(null);
  const onInteractRef = useRef(onInteract);
  onInteractRef.current = onInteract;

  useEffect(() => {
    wakeElapsedRef.current = 0;
    camera.position.set(-4.6, 1.05, 3.6);
    yawRef.current = -2.35;
    pitchRef.current = -0.12;
  }, [camera]);

  useEffect(() => {
    if (!enabled) return undefined;
    const guard = createPointerLockSpikeGuard();
    const onDown = (e) => {
      keysRef.current[e.code] = true;
      if (e.code === 'KeyE') onInteractRef.current?.();
    };
    const onUp = (e) => { keysRef.current[e.code] = false; };
    const onMove = (e) => {
      if ((!document.pointerLockElement && !draggingRef.current) || guard.shouldIgnore()) return;
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
        draggingRef.current = true;
        requestCanvasPointerLock();
      }
    };
    const onMouseUp = () => { draggingRef.current = false; };

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
    const dt = Math.min(delta, 0.08);
    wakeElapsedRef.current += dt;
    const we = wakeElapsedRef.current;

    if (we < 3.0) {
      const p = THREE.MathUtils.smoothstep(we, 0.2, 2.9);
      const sway = Math.sin(we * 6.5) * (1 - p) * 0.07;
      camera.position.set(
        THREE.MathUtils.lerp(-4.6, -3.2, p),
        THREE.MathUtils.lerp(1.05, 1.65, p) + Math.abs(sway) * 0.4,
        THREE.MathUtils.lerp(3.6, 3.0, p)
      );
      camera.quaternion.setFromEuler(
        new THREE.Euler(-0.12 + sway * 0.7, -2.35 + sway * 1.4, sway * 0.5, 'YXZ')
      );
      return;
    }

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

    const allChoresDone = completedIds.length >= CH2_MORNING_CHORES.length;
    let nearest = null;
    let best = Infinity;
    for (const c of CH2_MORNING_CHORES) {
      if (completedIds.includes(c.id)) continue;
      const hit = checkCameraLookAtTarget(camera, c.position, 2.8, 0.85);
      if (hit.valid && hit.distance < best) {
        best = hit.distance;
        nearest = { id: c.id, keyLabel: c.keyLabel, actionLabel: c.actionLabel };
      }
    }
    if (allChoresDone) {
      const hit = checkCameraLookAtTarget(camera, CH2_FRONT_DOOR_TARGET.position, 2.8, 0.85);
      if (hit.valid && hit.distance < best) {
        nearest = {
          id: CH2_FRONT_DOOR_TARGET.id,
          keyLabel: CH2_FRONT_DOOR_TARGET.keyLabel,
          actionLabel: 'To Open Front Door',
        };
      }
    }
    const key = nearest ? nearest.id : null;
    if (key !== lastHoverRef.current) {
      lastHoverRef.current = key;
      onHoverInteractable?.(nearest);
    }
  });

  return (
    <>
      <color attach="background" args={['#c8e5ff']} />
      <HomeInterior
        completedChores={['chore_alarm', 'chore_laptop', 'chore_coffee']}
        doorOpen={false}
        doorKnocked={false}
        canExitHouse={false}
        clockText="08:30"
        dayLabel="AM  •  SUN"
      />
      <Chapter2MorningProps completedIds={completedIds} phoneRinging={phoneRinging} />
    </>
  );
}
