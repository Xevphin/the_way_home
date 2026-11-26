// ============================================================================
// src/components/chapter2/Chapter2StudioScene.jsx
// Chapter 2 Cutscene 2 (CH2_STUDIO_CUTSCENE) & Gameplay 2 (CH2_STUDIO_BREAK):
// - Brightly lit indoor film soundstage with standalone wooden door prop,
//   camera dollies, Director's video village, gaming cast lounge & coffee station
// - Full first-person movement (WASD, mouse look, [E] interact) + AABB colliders
// - Custom first-person 3D bro arm-shake / dap-up animation for Uncle / Ustaz!
// ============================================================================

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import StudioSetProps3D from './StudioSetProps3D';
import StudioCastNPCs3D from './StudioCastNPCs3D';
import { STUDIO_COLLIDERS, STUDIO_INTERACTABLES } from '../../data/chapter2/studioSetData';
import { checkCameraLookAtTarget } from '../../data/shared/interactionRaycast';
import {
  clampMouseDelta,
  createPointerLockSpikeGuard,
  requestCanvasPointerLock,
} from '../../data/shared/pointerLookGuard';
import { playFootstepSound } from '../shared/AudioEngine';

function hitsStudioCollider(x, z) {
  if (x < -13.2 || x > 13.2 || z < -13.2 || z > 13.2) return true;
  for (const box of STUDIO_COLLIDERS) {
    if (x >= box.minX && x <= box.maxX && z >= box.minZ && z <= box.maxZ) return true;
  }
  return false;
}

export default function Chapter2StudioScene({
  stage,
  paused = false,
  sensitivity = 1.0,
  dapTrigger = 0,
  onHoverInteractable,
  onInteract,
}) {
  const { camera, gl } = useThree();
  const keysRef = useRef({});
  const yawRef = useRef(0);
  const pitchRef = useRef(-0.04);
  const draggingRef = useRef(false);
  const stepTimerRef = useRef(0);
  const cutTimeRef = useRef(0);
  const lastHoverRef = useRef(null);
  const dapArmRef = useRef();
  const dapAnimRef = useRef(0);
  const onInteractRef = useRef(onInteract);
  onInteractRef.current = onInteract;

  useEffect(() => {
    if (stage === 'CH2_STUDIO_CUTSCENE') {
      cutTimeRef.current = 0;
      camera.position.set(0, 1.65, 3.6);
      yawRef.current = 0;
      pitchRef.current = -0.04;
    } else if (stage === 'CH2_STUDIO_BREAK') {
      camera.position.set(0, 1.65, 3.2);
      yawRef.current = 0;
      pitchRef.current = -0.04;
    }
  }, [stage, camera]);

  useEffect(() => {
    if (dapTrigger > 0) dapAnimRef.current = 1.15;
  }, [dapTrigger]);

  useEffect(() => {
    if (stage !== 'CH2_STUDIO_BREAK' || paused) return undefined;
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
  }, [stage, paused, sensitivity, gl]);

  useFrame((_, delta) => {
    if (paused) return;
    const dt = Math.min(delta, 0.08);

    // 1) Cutscene 2: Reveal bright movie studio soundstage & Director
    if (stage === 'CH2_STUDIO_CUTSCENE') {
      cutTimeRef.current += dt;
      const e = cutTimeRef.current;
      const pan = Math.sin(e * 0.45) * 0.55;
      camera.position.set(pan, 1.65, THREE.MathUtils.lerp(3.6, 2.2, Math.min(1, e / 6)));
      camera.lookAt(0, 1.48, -2.9);
      if (dapArmRef.current) dapArmRef.current.visible = false;
      return;
    }

    if (stage !== 'CH2_STUDIO_BREAK') return;

    // 2) Free-roam Movie Studio Break movement
    const keys = keysRef.current;
    if (keys['ArrowLeft']) yawRef.current += 1.65 * dt * sensitivity;
    if (keys['ArrowRight']) yawRef.current -= 1.65 * dt * sensitivity;

    // Subtle celebratory dip during Uncle bro dap-up
    let dapPitchBoost = 0;
    if (dapAnimRef.current > 0) {
      dapAnimRef.current = Math.max(0, dapAnimRef.current - dt);
      const p = 1 - dapAnimRef.current / 1.15;
      dapPitchBoost = -Math.sin(p * Math.PI) * 0.06;
    }
    camera.quaternion.setFromEuler(
      new THREE.Euler(pitchRef.current + dapPitchBoost, yawRef.current, 0, 'YXZ')
    );

    const fwd = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current);
    const move = new THREE.Vector3();
    if (keys['KeyW'] || keys['ArrowUp']) move.add(fwd);
    if (keys['KeyS'] || keys['ArrowDown']) move.sub(fwd);
    if (keys['KeyD']) move.add(right);
    if (keys['KeyA']) move.sub(right);

    if (move.lengthSq() > 0.001) {
      move.normalize();
      const sprinting = keys['ShiftLeft'] || keys['ShiftRight'];
      const spd = sprinting ? 5.8 : 3.8;
      const nx = camera.position.x + move.x * spd * dt;
      const nz = camera.position.z + move.z * spd * dt;
      if (!hitsStudioCollider(nx, camera.position.z)) camera.position.x = nx;
      if (!hitsStudioCollider(camera.position.x, nz)) camera.position.z = nz;
      stepTimerRef.current += dt * (sprinting ? 10.2 : 6.8);
      camera.position.y = 1.65 + Math.sin(stepTimerRef.current) * 0.032;
      if (Math.sin(stepTimerRef.current) < -0.92) playFootstepSound(sprinting);
    } else {
      camera.position.y += (1.65 - camera.position.y) * 0.15;
    }

    // Animate first-person bro arm-shake / dap-up reaching forward from right hand
    if (dapArmRef.current) {
      if (dapAnimRef.current > 0) {
        const p = 1 - dapAnimRef.current / 1.15;
        const reach = Math.sin(p * Math.PI);
        const shake = p > 0.35 && p < 0.78 ? Math.sin(p * Math.PI * 10) * 0.05 : 0;
        dapArmRef.current.visible = true;
        dapArmRef.current.position.copy(camera.position);
        dapArmRef.current.quaternion.copy(camera.quaternion);
        dapArmRef.current.translateX(0.28 - reach * 0.14);
        dapArmRef.current.translateY(-0.28 + reach * 0.12 + shake);
        dapArmRef.current.translateZ(-0.26 - reach * 0.42);
      } else {
        dapArmRef.current.visible = false;
      }
    }

    // Line-of-sight [E] interaction check for all cast, crew & exit door
    let nearest = null;
    let bestDist = Infinity;
    for (const item of STUDIO_INTERACTABLES) {
      const hit = checkCameraLookAtTarget(camera, item.position, item.radius, 0.8);
      if (hit.valid && hit.distance < bestDist) {
        bestDist = hit.distance;
        nearest = { id: item.id, keyLabel: item.keyLabel, actionLabel: item.actionLabel };
      }
    }
    const nextKey = nearest ? nearest.id : null;
    if (nextKey !== lastHoverRef.current) {
      lastHoverRef.current = nextKey;
      onHoverInteractable?.(nearest);
    }
  });

  return (
    <group>
      {/* Bright Warm-White Indoor Film Soundstage Lighting */}
      <color attach="background" args={['#2b303a']} />
      <ambientLight intensity={1.15} color="#fff7ec" />
      <directionalLight position={[6, 12, 8]} intensity={1.1} color="#fffaf0" castShadow />
      <pointLight position={[0, 6.2, -3]} color="#fff5e4" intensity={18} distance={26} />
      <pointLight position={[-9, 5.8, -8]} color="#e0eeff" intensity={14} distance={20} />
      <pointLight position={[9, 5.8, -7]} color="#ffebd2" intensity={14} distance={20} />

      <StudioSetProps3D />
      <StudioCastNPCs3D
        directorTalking={stage === 'CH2_STUDIO_CUTSCENE'}
        uncleDapping={dapTrigger > 0}
      />

      {/* First-Person Reaching Arm & Hand for Uncle / Ustaz Bro Dap-Up */}
      <group ref={dapArmRef} visible={false}>
        <mesh position={[0, 0, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.055, 0.42, 8]} />
          <meshStandardMaterial color="#3b5370" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, -0.42]}>
          <boxGeometry args={[0.095, 0.075, 0.13]} />
          <meshStandardMaterial color="#d9ab86" roughness={0.75} />
        </mesh>
      </group>
    </group>
  );
}
