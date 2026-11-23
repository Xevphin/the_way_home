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

    const target = catchPosRef.current
      ? catchPosRef.current.clone()
      : camera.position.clone().add(new THREE.Vector3(0, 0, -2));
    target.y = camera.position.y;
    if (target.distanceTo(camera.position) < 0.05) target.z -= 1;

    tmp.matrix.lookAt(camera.position, target, tmp.up);
    targetQuatRef.current.setFromRotationMatrix(tmp.matrix);
  }, [active, camera, catchPosRef, tmp]);

  useFrame((_, delta) => {
    if (!modelRef.current || !lightRef.current) return;
    if (!active) {
      modelRef.current.visible = false;
      lightRef.current.intensity = 0; // Light stays mounted: no shader recompiles
      return;
    }

    elapsedRef.current += Math.min(delta, 0.05);
    const t = elapsedRef.current;
    const rand = () => Math.random() - 0.5;

    // 1) Whip the camera toward the spirit (ease-out cubic)
    const snap = Math.min(1, t / 0.18);
    camera.quaternion.slerpQuaternions(
      startQuatRef.current,
      targetQuatRef.current,
      1 - Math.pow(1 - snap, 3)
    );

    // Escalating violent camera shake
    const shake = t > 0.18 ? 0.035 + Math.min(t, 1.2) * 0.035 : 0.01;
    const base = basePosRef.current;
    camera.position.set(base.x + rand() * shake, base.y + rand() * shake, base.z + rand() * shake);

    // 2) Lunge the face from 3.2m to 0.42m in front of the lens
    const lunge = THREE.MathUtils.clamp((t - 0.12) / 0.5, 0, 1);
    const dist = THREE.MathUtils.lerp(3.2, 0.42, lunge * lunge);
    camera.getWorldDirection(tmp.forward);
    tmp.face.copy(camera.position).addScaledVector(tmp.forward, dist);

    const jitter = lunge >= 1 ? 0.05 : 0.02;
    modelRef.current.visible = true;
    modelRef.current.position.set(
      tmp.face.x + rand() * jitter,
      tmp.face.y - HEAD_HEIGHT + rand() * jitter,
      tmp.face.z + rand() * jitter
    );
    modelRef.current.lookAt(camera.position.x, modelRef.current.position.y, camera.position.z);
    modelRef.current.rotation.z += rand() * 0.12;

    // 3) Flickering crimson light catching the gaunt face
    lightRef.current.position
      .copy(camera.position)
      .addScaledVector(tmp.forward, Math.max(0.15, dist * 0.45));
    lightRef.current.position.y += 0.25;
    lightRef.current.intensity = Math.random() > 0.25 ? 2.2 + Math.random() * 2.5 : 0.3;
  });

  return (
    <>
      <ShadowStalkerModel
        ref={modelRef}
        visible={false}
        frenzy
        eyeColor="#ff3b2b"
        eyeScale={1.6}
      />
      <pointLight
        ref={lightRef}
        color="#ff5a3c"
        intensity={0}
        distance={5}
        decay={1.6}
      />
    </>
  );
}
