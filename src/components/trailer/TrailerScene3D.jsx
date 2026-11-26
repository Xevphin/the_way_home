// ============================================================================
// src/components/trailer/TrailerScene3D.jsx
// Master R3F 3D trailer director: advances the 50-second timeline, mounts the
// procedural environment, tactical concentric-ring SpotLight, Car Chase rig,
// and hero ShadowStalkerModel + 1.0s pitch-black void jumpscare rig.
// ============================================================================

import React, { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ShadowStalkerModel from '../shared/ShadowStalkerModel';
import TrailerEnvironment3D from './TrailerEnvironment3D';
import TrailerCarChaseRig3D from './TrailerCarChaseRig3D';
import { getFlashlightBeamTexture } from '../../data/shared/flashlightBeamTexture';
import {
  TRAILER_DURATION,
  getActiveShot,
  getClimaxCut,
} from '../../data/trailer/trailerTimeline';
import { applyTrailerShotPose } from '../../data/trailer/trailerCameraChoreography';

export default function TrailerScene3D({ playing = true, runId = 0, onTimeUpdate }) {
  const { camera } = useThree();
  const elapsedRef = useRef(0);
  const lastRunRef = useRef(runId);
  const lastNotifyRef = useRef(-1);

  const spotRef = useRef();
  const spotTargetRef = useRef(new THREE.Object3D());
  const fillLightRef = useRef();
  const lurkerRef = useRef();
  const voidPlaneRef = useRef();
  const scareLightRef = useRef();
  const carPoseRef = useRef({ x: 0, z: -112, yaw: 0, steer: 0 });

  const [sceneModes, setSceneModes] = useState({
    carChase: false,
    redHeadlights: false,
    lurkerFrenzy: false,
    lurkerEyeColor: '#f2f7ff',
    lurkerEyeScale: 1.05,
  });
  const modeKeyRef = useRef('');

  const beamMap = useMemo(() => getFlashlightBeamTexture(), []);
  const tmp = useMemo(
    () => ({
      look: new THREE.Vector3(),
      aim: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      face: new THREE.Vector3(),
    }),
    []
  );

  useFrame((_, rawDelta) => {
    if (lastRunRef.current !== runId) {
      lastRunRef.current = runId;
      elapsedRef.current = 0;
      lastNotifyRef.current = -1;
    }

    const dt = Math.min(rawDelta, 0.05);
    if (playing && elapsedRef.current < TRAILER_DURATION) {
      elapsedRef.current = Math.min(TRAILER_DURATION, elapsedRef.current + dt);
    }

    const t = elapsedRef.current;
    const shot = getActiveShot(t);
    const climaxCut = shot.id === 'CLIMAX_CUTS' ? getClimaxCut(t) : null;

    if (
      Math.abs(t - lastNotifyRef.current) >= 0.032 ||
      shot.id === 'JUMPSCARE' ||
      t >= TRAILER_DURATION
    ) {
      lastNotifyRef.current = t;
      onTimeUpdate?.(t);
    }

    // Update lightweight React mode flags only on shot-type transitions
    const nextCarChase = shot.id === 'CAR_CHASE';
    const nextRed = Boolean(climaxCut && climaxCut.kind === 'RED_HEADLIGHTS');
    const nextFrenzy =
      (shot.id === 'LURKER_WHIP' && t >= 22.6) ||
      Boolean(climaxCut && climaxCut.kind === 'JAW_LUNGE') ||
      shot.id === 'JUMPSCARE';
    const nextEyeColor = shot.id === 'JUMPSCARE' ? '#ffffff' : '#eef6ff';
    const nextEyeScale = shot.id === 'JUMPSCARE' ? 1.35 : 1.05;
    const modeKey = `${nextCarChase}|${nextRed}|${nextFrenzy}|${nextEyeColor}`;
    if (modeKey !== modeKeyRef.current) {
      modeKeyRef.current = modeKey;
      setSceneModes({
        carChase: nextCarChase,
        redHeadlights: nextRed,
        lurkerFrenzy: nextFrenzy,
        lurkerEyeColor: nextEyeColor,
        lurkerEyeScale: nextEyeScale,
      });
    }

    const { flashIntensity, fillIntensity, flashYawOff, flashPitchOff } = applyTrailerShotPose({
      t,
      shot,
      climaxCut,
      camera,
      lurkerObj: lurkerRef.current,
      voidPlaneObj: voidPlaneRef.current,
      scareLightObj: scareLightRef.current,
      carPose: carPoseRef.current,
      tmp,
    });

    if (spotRef.current) {
      spotRef.current.position.copy(camera.position);
      tmp.aim.set(flashYawOff, flashPitchOff, -1).normalize().applyQuaternion(camera.quaternion);
      spotTargetRef.current.position.copy(camera.position).addScaledVector(tmp.aim, 12);
      spotTargetRef.current.updateMatrixWorld();
      spotRef.current.target = spotTargetRef.current;
      spotRef.current.intensity = flashIntensity;
    }
    if (fillLightRef.current) {
      fillLightRef.current.position.copy(camera.position);
      fillLightRef.current.intensity = fillIntensity;
    }
  });

  return (
    <>
      <TrailerEnvironment3D redHeadlightsMode={sceneModes.redHeadlights} />
      <TrailerCarChaseRig3D active={sceneModes.carChase} carPoseRef={carPoseRef} />

      {/* Tactical Concentric-Ring SpotLight Flashlight */}
      <primitive object={spotTargetRef.current} />
      <spotLight
        ref={spotRef}
        target={spotTargetRef.current}
        color="#f5f8ff"
        map={beamMap}
        intensity={0}
        distance={68}
        angle={0.56}
        penumbra={0.34}
        decay={1.25}
        castShadow={true}
        shadow-mapSize={[512, 512]}
        shadow-camera-near={0.4}
        shadow-camera-far={65}
        shadow-bias={-0.0005}
      />
      <pointLight ref={fillLightRef} color="#e8f0ff" intensity={0} distance={8} decay={2} />

      {/* Hero Shadow Lurker + Pitch-Black Void Backdrop & Face Key Light (pre-mounted at y=-80) */}
      <mesh ref={voidPlaneRef} position={[0, -80, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <ShadowStalkerModel
        ref={lurkerRef}
        position={[0, -80, 0]}
        frenzy={sceneModes.lurkerFrenzy}
        eyeColor={sceneModes.lurkerEyeColor}
        eyeScale={sceneModes.lurkerEyeScale}
      />
      <pointLight
        ref={scareLightRef}
        color="#eef3ff"
        intensity={0}
        distance={5.5}
        decay={1.3}
      />
    </>
  );
}
