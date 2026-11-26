// ============================================================================
// src/components/JumpscareLunge3D.jsx
// 1.4-second 3D jumpscare when the Evil Spirit catches the player:
// 1) Snaps the camera toward where the spirit caught you (~0.18s)
// 2) Lunges the spirit's gaunt face & glowing eyes straight into the lens
//    with violent frenzied twitching and escalating camera shake
// 3) A flickering crimson light catches the face so it reads in the dark
// Screen-space glitch/static frames are handled by JumpscareOverlay.jsx.
// ============================================================================

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ShadowStalkerModel from './ShadowStalkerModel';

const HEAD_HEIGHT = 2.95; // Head centre height inside ShadowStalkerModel

export default function JumpscareLunge3D({ active, catchPosRef }) {
  const { camera } = useThree();
  const modelRef = useRef();
  const voidPlaneRef = useRef();
  const lightRef = useRef();
  const elapsedRef = useRef(0);
  const startQuatRef = useRef(new THREE.Quaternion());
  const targetQuatRef = useRef(new THREE.Quaternion());
  const basePosRef = useRef(new THREE.Vector3());

  const tmp = useMemo(
    () => ({
      forward: new THREE.Vector3(),
      face: new THREE.Vector3(),
      matrix: new THREE.Matrix4(),
      up: new THREE.Vector3(0, 1, 0),
    }),
    []
  );

  // Capture the starting view and the "look at the spirit" target rotation
  useEffect(() => {
    if (!active) return;
    elapsedRef.current = 0;
    startQuatRef.current.copy(camera.quaternion);
    basePosRef.current.copy(camera.position);

    const target = catchPosRef?.current
      ? catchPosRef.current.clone()
      : camera.position.clone().add(new THREE.Vector3(0, 0, -2));
    target.y = camera.position.y;
    if (target.distanceTo(camera.position) < 0.05) target.z -= 1;

    tmp.matrix.lookAt(camera.position, target, tmp.up);
    targetQuatRef.current.setFromRotationMatrix(tmp.matrix);
  }, [active, camera, catchPosRef, tmp]);

  useFrame((_, delta) => {
    if (!modelRef.current) return;
    if (!active) {
      modelRef.current.position.set(0, -80, 0);
      if (voidPlaneRef.current) voidPlaneRef.current.position.set(0, -80, 0);
      if (lightRef.current) lightRef.current.intensity = 0;
      return;
    }

    elapsedRef.current += Math.min(delta, 0.05);
    const t = elapsedRef.current;
    const rand = () => Math.random() - 0.5;

    // 1) Instant snap toward the spirit (0.08s) + violent high-frequency micro-shake over 1.0s
    const snap = Math.min(1, t / 0.08);
    camera.quaternion.slerpQuaternions(
      startQuatRef.current,
      targetQuatRef.current,
      1 - Math.pow(1 - snap, 3)
    );

    const shake = 0.055 + Math.min(t, 1.0) * 0.04;
    const base = basePosRef.current;
    camera.position.set(base.x + rand() * shake, base.y + rand() * shake, base.z + rand() * shake);

    // 2) Lock pale porcelain face inches from lens with rapid zoom-in lunge (0.95m -> 0.34m)
    const lunge = THREE.MathUtils.clamp(t / 0.35, 0, 1);
    const dist = THREE.MathUtils.lerp(0.95, 0.34, lunge * lunge);
    camera.getWorldDirection(tmp.forward);
    tmp.face.copy(camera.position).addScaledVector(tmp.forward, dist);

    // Place pitch-black void plane directly behind the spirit's face to black out the entire forest
    if (voidPlaneRef.current) {
      voidPlaneRef.current.position.copy(camera.position).addScaledVector(tmp.forward, dist + 0.45);
      voidPlaneRef.current.lookAt(camera.position);
    }

    const jitter = 0.038;
    modelRef.current.position.set(
      tmp.face.x + rand() * jitter,
      tmp.face.y - HEAD_HEIGHT + rand() * jitter,
      tmp.face.z + rand() * jitter
    );
    modelRef.current.lookAt(camera.position.x, modelRef.current.position.y, camera.position.z);
    modelRef.current.rotation.z += rand() * 0.16;

    if (lightRef.current) {
      lightRef.current.position
        .copy(camera.position)
        .addScaledVector(tmp.forward, Math.max(0.12, dist * 0.4));
      lightRef.current.position.y += 0.12;
      lightRef.current.intensity = 4.2 + Math.random() * 1.6;
    }
  });

  // Always visible=true (parked at y=-80 when inactive) so shader is pre-compiled on mount!
  return (
    <>
      <mesh ref={voidPlaneRef} position={[0, -80, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <ShadowStalkerModel
        ref={modelRef}
        position={[0, -80, 0]}
        frenzy
        eyeColor="#ffffff"
        eyeScale={1.25}
      />
      <pointLight
        ref={lightRef}
        color="#edf2ff"
        intensity={0}
        distance={4.5}
        decay={1.4}
      />
    </>
  );
}
