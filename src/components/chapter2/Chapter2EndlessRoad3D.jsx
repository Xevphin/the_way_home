// ============================================================================
// src/components/chapter2/Chapter2EndlessRoad3D.jsx
// Chapter 2 Endless Mist-Shrouded 200m Route 312 Road (Cutscene 1, Gameplay 1
// & Cutscene 2 Lurker Ultimatum + Porcelain Jumpscare):
// - Permanent ON concentric-ring tactical flashlight (no [F] toggle, no drain)
// - Walk-only movement (Shift sprint disabled) + rising proximity whispers
// - Reaching/opening the solitary door triggers Cutscene 2 (Lurker + Jumpscare)
// ============================================================================

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ShadowStalkerModel from '../shared/ShadowStalkerModel';
import JumpscareLunge3D from '../shared/JumpscareLunge3D';
import Chapter2RoadProps from './Chapter2RoadProps';
import { getWetAsphaltMaps } from '../../data/shared/asphaltTextures';
import { getFlashlightBeamTexture } from '../../data/shared/flashlightBeamTexture';
import {
  CH2_CUTSCENE2_TRIGGER_Z,
  CH2_DOOR_Z,
  CH2_LURKER_Z,
} from '../../data/chapter2/chapter2Data';
import {
  clampMouseDelta,
  createPointerLockSpikeGuard,
  requestCanvasPointerLock,
} from '../../data/shared/pointerLookGuard';
import { playFootstepSound } from '../shared/AudioEngine';
import { stopLurkerWhispers, updateLurkerWhisperProximity } from '../shared/LurkerAudio';

export default function Chapter2EndlessRoad3D({
  stage,
  paused = false,
  sensitivity = 1.0,
  spawnedCount = 0,
  lurkerVisible = false,
  jumpscareActive = false,
  onPlayerProgressZ,
  onDoorPromptChange,
  onReachDoor,
}) {
  const { camera, gl } = useThree();
  const wetMaps = useMemo(() => getWetAsphaltMaps(), []);
  const beamMap = useMemo(() => getFlashlightBeamTexture(), []);
  const spotLightRef = useRef();
  const fillLightRef = useRef();
  const spotTargetRef = useRef(new THREE.Object3D());
  const keysRef = useRef({});
  const yawRef = useRef(0);
  const pitchRef = useRef(-0.04);
  const draggingRef = useRef(false);
  const stepTimerRef = useRef(0);
  const cut1TimeRef = useRef(0);
  const nearDoorRef = useRef(false);
  const triggeredDoorRef = useRef(false);
  const lurkerPosRef = useRef(new THREE.Vector3(0, 1.7, CH2_LURKER_Z));
  const onReachDoorRef = useRef(onReachDoor);
  onReachDoorRef.current = onReachDoor;

  const roadDashes = useMemo(() => {
    const arr = [];
    for (let z = 36; z >= -260; z -= 6.8) arr.push(z);
    return arr;
  }, []);

  useEffect(() => {
    if (stage === 'CUTSCENE_1') {
      cut1TimeRef.current = 0;
      triggeredDoorRef.current = false;
      nearDoorRef.current = false;
      camera.position.set(0, 1.05, 0);
      yawRef.current = 0;
      pitchRef.current = -0.05;
    } else if (stage === 'GAMEPLAY_1') {
      camera.position.y = 1.68;
    }
  }, [stage, camera]);

  useEffect(() => {
    if (stage !== 'GAMEPLAY_1' || paused) return undefined;
    const guard = createPointerLockSpikeGuard();
    const onDown = (e) => {
      keysRef.current[e.code] = true;
      if (e.code === 'KeyE' && nearDoorRef.current && !triggeredDoorRef.current) {
        triggeredDoorRef.current = true;
        onReachDoorRef.current?.();
      }
    };
    const onUp = (e) => { keysRef.current[e.code] = false; };
    const onMove = (e) => {
      if ((!document.pointerLockElement && !draggingRef.current) || guard.shouldIgnore()) return;
      const spd = 0.0022 * sensitivity;
      yawRef.current -= clampMouseDelta(e.movementX) * spd;
      pitchRef.current = THREE.MathUtils.clamp(
        pitchRef.current - clampMouseDelta(e.movementY) * spd,
        -1.15,
        1.15
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

  useFrame(({ clock }, delta) => {
    if (paused) return;
    const dt = Math.min(delta, 0.08);
    const t = clock.getElapsedTime();

    if (spotLightRef.current) {
      spotLightRef.current.position.copy(camera.position);
      const aimDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      spotTargetRef.current.position.copy(camera.position).addScaledVector(aimDir, 12);
      spotTargetRef.current.updateMatrixWorld();
      spotLightRef.current.target = spotTargetRef.current;
      spotLightRef.current.intensity = jumpscareActive ? 0 : 58;
    }
    if (fillLightRef.current) {
      fillLightRef.current.position.copy(camera.position);
      fillLightRef.current.intensity = jumpscareActive ? 0 : 1.9;
    }
    if (jumpscareActive) return;

    // 1) Cutscene 1: Rise from asphalt & sweep flashlight beam onto roadside Lembah Batu sign (x = +6.5)
    if (stage === 'CUTSCENE_1') {
      cut1TimeRef.current += dt;
      const e = cut1TimeRef.current;
      const standP = THREE.MathUtils.smoothstep(e, 0.8, 3.6);
      camera.position.set(0, THREE.MathUtils.lerp(0.85, 1.68, standP), 0);
      const lookYaw =
        e < 3.5
          ? Math.sin(e * 0.9) * 0.5
          : e < 7.8
            ? THREE.MathUtils.lerp(0.18, -0.58, THREE.MathUtils.smoothstep(e, 3.5, 5.1))
            : THREE.MathUtils.lerp(-0.58, 0.0, THREE.MathUtils.smoothstep(e, 7.8, 9.8));
      const lookPitch =
        e >= 3.5 && e < 7.8
          ? THREE.MathUtils.lerp(-0.04, 0.06, THREE.MathUtils.smoothstep(e, 3.8, 5.2))
          : -0.04;
      camera.quaternion.setFromEuler(
        new THREE.Euler(lookPitch + Math.sin(t * 1.4) * 0.012, lookYaw, 0, 'YXZ')
      );
      return;
    }

    // 2) Cutscene 2: Lock camera straight onto the Shadow Lurker at the solitary road door
    if (stage === 'CUTSCENE_2') {
      stopLurkerWhispers();
      camera.position.lerp(new THREE.Vector3(0, 1.68, CH2_CUTSCENE2_TRIGGER_Z), Math.min(1, dt * 3.5));
      camera.lookAt(0, 2.35, CH2_LURKER_Z);
      return;
    }

    // 3) Gameplay 1: Walk-only tense movement (Shift sprint disabled!) along 200m mist road
    if (stage !== 'GAMEPLAY_1') return;
    const keys = keysRef.current;
    if (keys['ArrowLeft']) yawRef.current += 1.6 * dt * sensitivity;
    if (keys['ArrowRight']) yawRef.current -= 1.6 * dt * sensitivity;
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
      const walkSpeed = 3.6;
      camera.position.x = THREE.MathUtils.clamp(camera.position.x + move.x * walkSpeed * dt, -3.7, 3.7);
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z + move.z * walkSpeed * dt,
        CH2_CUTSCENE2_TRIGGER_Z - 0.2,
        6.0
      );
      stepTimerRef.current += dt * 6.8;
      camera.position.y = 1.68 + Math.sin(stepTimerRef.current) * 0.036;
      if (Math.sin(stepTimerRef.current) < -0.92) playFootstepSound(false);
    } else {
      camera.position.y += (1.68 - camera.position.y) * 0.15;
    }

    onPlayerProgressZ?.(camera.position.z);

    const distToDoor = Math.max(0, camera.position.z - CH2_DOOR_Z);
    const whisperProx = THREE.MathUtils.clamp((95 - distToDoor) / 81, 0, 1);
    updateLurkerWhisperProximity(whisperProx);

    const isNearDoor = camera.position.z <= CH2_CUTSCENE2_TRIGGER_Z + 3.2;
    if (isNearDoor !== nearDoorRef.current) {
      nearDoorRef.current = isNearDoor;
      onDoorPromptChange?.(
        isNearDoor ? { id: 'ch2_road_door', keyLabel: 'Press "E"', actionLabel: 'To Approach the Wooden Door' } : null
      );
    }
    if (camera.position.z <= CH2_CUTSCENE2_TRIGGER_Z && !triggeredDoorRef.current) {
      triggeredDoorRef.current = true;
      onReachDoorRef.current?.();
    }
  });

  return (
    <group>
      <primitive object={spotTargetRef.current} />
      <spotLight
        ref={spotLightRef}
        target={spotTargetRef.current}
        color="#f5f8ff"
        map={beamMap}
        intensity={jumpscareActive ? 0 : 58}
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
        intensity={jumpscareActive ? 0 : 1.9}
        distance={8.5}
        decay={2}
      />

      <color attach="background" args={['#0b080c']} />
      <fogExp2 attach="fog" args={['#120b10', 0.048]} />
      <ambientLight intensity={0.28} color="#7c6d7a" />
      <directionalLight position={[-12, 24, 10]} intensity={0.38} color="#a499b5" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -160]} receiveShadow>
        <planeGeometry args={[200, 480]} />
        <meshStandardMaterial color="#09070b" roughness={0.98} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -160]} receiveShadow>
        <planeGeometry args={[8.6, 460]} />
        <meshStandardMaterial map={wetMaps.map} bumpMap={wetMaps.bumpMap} bumpScale={0.03} roughness={0.72} />
      </mesh>
      {[-3.95, 3.95].map((xPos, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[xPos, 0.022, -160]}>
          <planeGeometry args={[0.14, 450]} />
          <meshBasicMaterial color="#6e6872" />
        </mesh>
      ))}
      {roadDashes.map((zPos) => (
        <mesh key={zPos} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, zPos]}>
          <planeGeometry args={[0.16, 2.7]} />
          <meshBasicMaterial color="#9e8240" />
        </mesh>
      ))}

      <Chapter2RoadProps spawnedCount={spawnedCount} />

      {lurkerVisible && !jumpscareActive && (
        <ShadowStalkerModel
          position={[0, 0.1, CH2_LURKER_Z]}
          frenzy={stage === 'CUTSCENE_2'}
          eyeColor="#ff2a2a"
          eyeScale={1.15}
        />
      )}

      <JumpscareLunge3D active={jumpscareActive} catchPosRef={lurkerPosRef} />
    </group>
  );
}
