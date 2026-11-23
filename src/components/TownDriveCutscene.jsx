// ============================================================================
// src/components/TownDriveCutscene.jsx
// Automated scenic first-person drive through the open town along a smooth
// CatmullRomCurve3 spline (~13.5s, skippable [SPACE]). The car steers
// automatically while the player looks around freely from the driver's seat.
// ============================================================================

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TOWN_DRIVE_SUBTITLES, TOWN_ROUTE_POINTS } from '../data/sprint2Data';
import {
  clampMouseDelta,
  createPointerLockSpikeGuard,
  requestCanvasPointerLock,
} from '../data/pointerLookGuard';
import CarCabinOverlay3D from './CarCabinOverlay3D';
import StalledSedan from './StalledSedan';
import {
  startDrivingEngineAudio,
  stopDrivingEngineAudio,
} from './AmbientMusicAudio';

const DRIVE_DURATION_SEC = 13.5;

export default function TownDriveCutscene({
  active,
  sensitivity = 1.0,
  onSubtitleChange,
  onComplete,
}) {
  const { camera, gl } = useThree();
  const carGroupRef = useRef();
  const elapsedRef = useRef(0);
  const doneRef = useRef(false);
  const lookYawOffsetRef = useRef(0);
  const lookPitchOffsetRef = useRef(-0.04);
  const steerAngleRef = useRef(0);
  const lastHeadingRef = useRef(0);
  const isDraggingRef = useRef(false);
  const keysRef = useRef({});
  const lastSubIdxRef = useRef(-1);

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        TOWN_ROUTE_POINTS.map((p) => new THREE.Vector3(...p))
      ),
    []
  );

  useEffect(() => {
    if (!active) return undefined;
    elapsedRef.current = 0;
    doneRef.current = false;
    lookYawOffsetRef.current = 0;
    lookPitchOffsetRef.current = -0.04;
    lastSubIdxRef.current = -1;

    const guard = createPointerLockSpikeGuard();
    const onKeyDown = (e) => {
      keysRef.current[e.code] = true;
    };
    const onKeyUp = (e) => {
      keysRef.current[e.code] = false;
    };
    const onMouseMove = (e) => {
      const locked = Boolean(document.pointerLockElement);
      if ((!locked && !isDraggingRef.current) || guard.shouldIgnore()) return;
      const spd = 0.0022 * sensitivity;
      lookYawOffsetRef.current = THREE.MathUtils.clamp(
        lookYawOffsetRef.current - clampMouseDelta(e.movementX) * spd,
        -2.75,
        2.75
      );
      lookPitchOffsetRef.current = THREE.MathUtils.clamp(
        lookPitchOffsetRef.current - clampMouseDelta(e.movementY) * spd,
        -0.45,
        0.55
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
    startDrivingEngineAudio();

    return () => {
      stopDrivingEngineAudio();
      document.removeEventListener('pointerlockchange', guard.onPointerLockChange);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      gl.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [active, sensitivity, gl]);

  useFrame((_, delta) => {
    if (!active || !carGroupRef.current) return;
    const dt = Math.min(delta, 0.1);
    elapsedRef.current += dt;
    const t = elapsedRef.current;

    // Keyboard 360-degree cabin free-look (can look sideways & over shoulder to backseat)
    if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
      lookYawOffsetRef.current = Math.min(2.75, lookYawOffsetRef.current + 1.8 * dt);
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
      lookYawOffsetRef.current = Math.max(-2.75, lookYawOffsetRef.current - 1.8 * dt);
    }

    // Emit scenic drive film subtitles
    for (let i = TOWN_DRIVE_SUBTITLES.length - 1; i >= 0; i--) {
      if (t >= TOWN_DRIVE_SUBTITLES[i].timeSec && lastSubIdxRef.current < i) {
        lastSubIdxRef.current = i;
        onSubtitleChange({
          tag: TOWN_DRIVE_SUBTITLES[i].tag,
          text: TOWN_DRIVE_SUBTITLES[i].text,
        });
        break;
      }
    }

    const u = Math.min(0.995, t / DRIVE_DURATION_SEC);
    const pos = curve.getPointAt(u);
    const nextPos = curve.getPointAt(Math.min(1, u + 0.015));

    // Align car forward (-Z) along spline heading & turn steering wheel smoothly with curves
    const heading = Math.atan2(-(nextPos.x - pos.x), -(nextPos.z - pos.z));
    const deltaH = THREE.MathUtils.clamp((heading - lastHeadingRef.current) * 20, -0.78, 0.78);
    lastHeadingRef.current = heading;
    steerAngleRef.current = deltaH;
    carGroupRef.current.position.set(pos.x, 0, pos.z);
    carGroupRef.current.rotation.set(0, heading, 0);

    // Position camera inside driver's seat with gentle suspension bob + free look
    const seatLocal = new THREE.Vector3(-0.36, 1.18 + Math.sin(t * 13) * 0.008, 0.05);
    seatLocal.applyAxisAngle(new THREE.Vector3(0, 1, 0), heading);
    camera.position.set(pos.x + seatLocal.x, seatLocal.y, pos.z + seatLocal.z);

    camera.quaternion.setFromEuler(
      new THREE.Euler(
        lookPitchOffsetRef.current,
        heading + lookYawOffsetRef.current,
        0,
        'YXZ'
      )
    );

    if (t >= DRIVE_DURATION_SEC && !doneRef.current) {
      doneRef.current = true;
      onSubtitleChange(null);
      onComplete();
    }
  });

  if (!active) return null;

  return (
    <group ref={carGroupRef}>
      <StalledSedan
        position={[0, 0, 0]}
        isDented={false}
        headlightPower={0}
        hazardsOn={false}
        interiorView={true}
      />
      <CarCabinOverlay3D
        visible={true}
        hazardsOn={false}
        showFlashFigure={false}
        radioActive={true}
        steerAngleRef={steerAngleRef}
      />
    </group>
  );
}
