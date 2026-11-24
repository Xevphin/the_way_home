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
      if (lightRef.current) lightRef.current.intensity = 0;
      return;
    }

    elapsedRef.current += Math.min(delta, 0.05);
    const t = elapsedRef.current;
    const rand = () => Math.random() - 0.5;

    // 1) Whip the camera toward the spirit (ease-out cubic over 0.16s)
    const snap = Math.min(1, t / 0.16);
    camera.quaternion.slerpQuaternions(
      startQuatRef.current,
      targetQuatRef.current,
      1 - Math.pow(1 - snap, 3)
    );

    // Escalating violent camera shake across 1.1s lunge
    const shake = t > 0.14 ? 0.045 + Math.min(t, 1.1) * 0.045 : 0.015;
    const base = basePosRef.current;
    camera.position.set(base.x + rand() * shake, base.y + rand() * shake, base.z + rand() * shake);

    // 2) Lunge the face from 2.9m to 0.38m in front of the lens
    const lunge = THREE.MathUtils.clamp((t - 0.08) / 0.42, 0, 1);
    const dist = THREE.MathUtils.lerp(2.9, 0.38, lunge * lunge);
    camera.getWorldDirection(tmp.forward);
    tmp.face.copy(camera.position).addScaledVector(tmp.forward, dist);

    const jitter = lunge >= 1 ? 0.055 : 0.024;
    modelRef.current.position.set(
      tmp.face.x + rand() * jitter,
      tmp.face.y - HEAD_HEIGHT + rand() * jitter,
      tmp.face.z + rand() * jitter
    );
    modelRef.current.lookAt(camera.position.x, modelRef.current.position.y, camera.position.z);
    modelRef.current.rotation.z += rand() * 0.14;

    if (lightRef.current) {
      lightRef.current.position
        .copy(camera.position)
        .addScaledVector(tmp.forward, Math.max(0.15, dist * 0.45));
      lightRef.current.position.y += 0.25;
      lightRef.current.intensity = Math.random() > 0.2 ? 2.6 + Math.random() * 2.4 : 0.4;
    }
  });

  // Always visible=true (parked at y=-80 when inactive) so shader is pre-compiled on mount!
  return (
    <>
      <ShadowStalkerModel
        ref={modelRef}
        position={[0, -80, 0]}
        frenzy
        eyeColor="#ff3b2b"
        eyeScale={1.75}
      />
      <pointLight
        ref={lightRef}
        color="#ff482b"
        intensity={0}
        distance={5}
        decay={1.5}
      />
    </>
  );
}
