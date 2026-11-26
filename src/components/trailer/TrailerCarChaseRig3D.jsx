// ============================================================================
// src/components/trailer/TrailerCarChaseRig3D.jsx
// First-person Night Car Chase rig for Act 3C (29.5s - 34.0s):
// - Reuses StalledSedan (interiorView mode with real dual headlight SpotLights
//   and hood) + CarCabinOverlay3D (360-deg cabin, steering wheel, static FM radio)
// - Uses Chapter 1 EscapeChaseScene near/far road-illumination light pools
//   and radial-gradient SpotLight beams (zero hard geometric ConeGeometry!)
// ============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import StalledSedan from '../shared/StalledSedan';
import CarCabinOverlay3D from '../chapter1/CarCabinOverlay3D';
import ShadowStalkerModel from '../shared/ShadowStalkerModel';
import { getFlashlightBeamTexture } from '../../data/shared/flashlightBeamTexture';

export default function TrailerCarChaseRig3D({ active = false, carPoseRef }) {
  const rigRef = useRef();
  const steerRef = useRef(0);
  const lurkerRef = useRef();
  const beamMap = useMemo(() => getFlashlightBeamTexture(), []);

  const targets = useMemo(() => {
    const l = new THREE.Object3D();
    l.position.set(-0.72, 0.12, -26);
    const r = new THREE.Object3D();
    r.position.set(0.72, 0.12, -26);
    return [l, r];
  }, []);

  useFrame(({ clock }) => {
    const pose = carPoseRef?.current;
    if (rigRef.current) {
      if (active && pose) {
        rigRef.current.position.set(pose.x, 0, pose.z);
        rigRef.current.rotation.set(0, pose.yaw || 0, (pose.steer || 0) * 0.05);
        steerRef.current = (pose.steer || 0) * 0.9;
      } else {
        rigRef.current.position.set(0, -60, 0);
      }
    }

    if (lurkerRef.current) {
      if (active && pose) {
        const t = clock.getElapsedTime();
        lurkerRef.current.position.set(2.15, 0, -176.5);
        lurkerRef.current.rotation.y = -0.35 + Math.sin(t * 14) * 0.08;
      } else {
        lurkerRef.current.position.set(0, -60, 0);
      }
    }
  });

  return (
    <>
      <group ref={rigRef} position={[0, -60, 0]}>
        {/* Reused Chapter 1 StalledSedan in unobstructed interiorView driving mode */}
        <StalledSedan
          position={[0, 0, 0]}
          isDented={false}
          headlightPower={active ? 1.35 : 0}
          hazardsOn={true}
          inspected={true}
          interiorView={true}
        />

        <CarCabinOverlay3D
          visible={active}
          hazardsOn={true}
          radioActive={true}
          radioStatic={true}
          steerAngleRef={steerRef}
        />

        {/* Soft radial-gradient high-beam SpotLights + Chapter 1 near/far road light pools */}
        {[-0.68, 0.68].map((xOff, idx) => (
          <group key={idx}>
            <primitive object={targets[idx]} />
            <spotLight
              position={[xOff, 0.72, -2.2]}
              target={targets[idx]}
              color="#fff0cc"
              map={beamMap}
              intensity={active ? 54 : 0}
              distance={68}
              angle={0.56}
              penumbra={0.62}
              decay={1.2}
            />
          </group>
        ))}

        <pointLight
          position={[0, 1.4, -10.5]}
          color="#ffebc0"
          intensity={active ? 16 : 0}
          distance={34}
          decay={1.3}
        />
        <pointLight
          position={[0, 1.8, -24.0]}
          color="#ffdca0"
          intensity={active ? 11 : 0}
          distance={36}
          decay={1.4}
        />

        {/* Dim Instrument Cluster Cabin Fill */}
        <pointLight
          position={[-0.25, 1.05, -0.35]}
          color="#5eead4"
          intensity={active ? 0.55 : 0}
          distance={2.6}
        />
      </group>

      {/* Frenzied Roadside Apparition Flashing Past the Chase Windshield */}
      <ShadowStalkerModel
        ref={lurkerRef}
        position={[0, -60, 0]}
        scale={0.86}
        frenzy={true}
        eyeColor="#ff4d4d"
        eyeScale={1.35}
      />
    </>
  );
}
