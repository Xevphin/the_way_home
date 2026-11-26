// ============================================================================
// src/data/trailer/trailerCameraChoreography.js
// Pure per-frame camera, flashlight, Shadow Lurker, and car chase pose solver
// for TrailerScene3D.jsx across all 12 shots of the 50-second trailer.
// ============================================================================

import * as THREE from 'three';
import { smoothstep } from './trailerTimeline';

const LURKER_HEAD_Y = 2.95;

export function applyTrailerShotPose({
  t,
  shot,
  climaxCut,
  camera,
  lurkerObj,
  voidPlaneObj,
  scareLightObj,
  carPose,
  tmp,
}) {
  let flashIntensity = 0;
  let fillIntensity = 0;
  let flashYawOff = 0;
  let flashPitchOff = 0;
  let lurkerParked = true;
  let scareLightIntensity = 0;
  let voidActive = false;
  camera.rotation.z = 0;

  if (shot.id === 'HOOK') {
    const p = smoothstep(shot.progress);
    camera.position.set(0.32 - p * 0.42, 1.26 + Math.sin(t * 0.7) * 0.03, -2.6 - p * 5.8);
    tmp.look.set(0.45, 1.02, -23.5);
    camera.lookAt(tmp.look);
  } else if (shot.id === 'FOREST_GLIDE') {
    const p = shot.progress;
    const bob = Math.sin(t * 4.4) * 0.045;
    camera.position.set(-1.7 - p * 1.15, 1.66 + bob, -6.2 - p * 7.2);
    const sweepX = Math.sin(shot.localTime * 1.35) * 3.8;
    tmp.look.set(-3.4 + sweepX, 1.75 + Math.cos(t * 1.8) * 0.14, -17.5 - p * 6.5);
    camera.lookAt(tmp.look);
    flashIntensity = 58;
    fillIntensity = 1.6;
    flashYawOff = Math.sin(shot.localTime * 2.1) * 0.16;
  } else if (shot.id === 'FLYER_MISSING') {
    const p = smoothstep(shot.progress);
    camera.position.set(-4.18 - p * 0.18, 1.54 + p * 0.14, -16.12 - p * 0.28);
    tmp.look.set(-5.65, 1.61, -16.5);
    camera.lookAt(tmp.look);
    flashIntensity = 30;
    fillIntensity = 1.2;
  } else if (shot.id === 'FLYER_SKETCH') {
    const p = smoothstep(shot.progress);
    camera.position.set(4.24 + p * 0.1, 1.44 + p * 0.2, -34.82 - p * 0.14);
    tmp.look.set(5.65, 1.55 + p * 0.05, -35.0);
    camera.lookAt(tmp.look);
    flashIntensity = 28;
    fillIntensity = 1.2;
  } else if (shot.id === 'DISTANT_LURKER') {
    const p = shot.progress;
    const bob = Math.sin(t * 3.8) * 0.032;
    camera.position.set(-0.2 + p * 0.25, 1.68 + bob, -42.5 - p * 2.8);
    const sweep = smoothstep(Math.min(1, shot.localTime / 2.75));
    tmp.look.set(-5.6 + sweep * 6.0, 1.85, -61.5);
    camera.lookAt(tmp.look);
    flashIntensity = 64;
    fillIntensity = 1.5;
    lurkerParked = false;
    if (lurkerObj) {
      lurkerObj.position.set(0.32, 0, -61.5);
      lurkerObj.scale.setScalar(0.96);
      lurkerObj.rotation.set(0, 0, 0);
    }
  } else if (shot.id === 'LURKER_WHIP') {
    const whip = smoothstep(Math.min(1, shot.localTime / 0.42));
    const shake = shot.localTime > 2.6 ? 0.045 : 0.012;
    camera.position.set(
      (Math.random() - 0.5) * shake,
      1.88 + (Math.random() - 0.5) * shake,
      -72.9
    );
    tmp.look.set(
      THREE.MathUtils.lerp(4.4, 0.0, whip),
      2.28,
      THREE.MathUtils.lerp(-73.3, -75.9, whip)
    );
    camera.lookAt(tmp.look);

    const flicker = shot.localTime > 2.6 && Math.sin(t * 46) < -0.25;
    flashIntensity = shot.localTime < 0.08 ? 0 : flicker ? 6 : 42;
    fillIntensity = shot.localTime < 0.08 ? 0 : 1.7;
    lurkerParked = false;
    if (lurkerObj) {
      const creep = Math.min(0.65, shot.localTime * 0.11);
      lurkerObj.position.set(0, 0, -75.85 + creep);
      lurkerObj.scale.setScalar(0.84);
      lurkerObj.rotation.set(0, 0, 0);
    }
    if (scareLightObj) {
      scareLightObj.position.set(0.25, 2.35, -74.5);
      scareLightIntensity = shot.localTime < 0.08 ? 0 : flicker ? 0.4 : 2.0;
    }
  } else if (shot.id === 'SPRINT_WOODS') {
    const p = shot.progress;
    const sx = 9.65 + Math.sin(shot.localTime * 3.1) * 1.15;
    const sz = -78.0 - p * 24.5;
    const bob = Math.abs(Math.sin(t * 11.5)) * 0.16;
    camera.position.set(sx, 1.56 + bob, sz);
    tmp.look.set(sx + Math.cos(shot.localTime * 2.7) * 2.2, 1.5 + Math.sin(t * 7.5) * 0.18, sz - 10);
    camera.lookAt(tmp.look);
    camera.rotation.z = Math.sin(t * 6.2) * 0.085;
    flashIntensity = 62;
    fillIntensity = 1.5;
    flashYawOff = Math.sin(t * 10) * 0.14;
    flashPitchOff = Math.cos(t * 12) * 0.08;
  } else if (shot.id === 'CAR_CHASE') {
    const lt = shot.localTime;
    const zPos = -112 - lt * 26.5;
    const xPos = Math.sin(lt * 1.95) * 1.85;
    const steer = Math.cos(lt * 1.95);
    carPose.x = xPos;
    carPose.z = zPos;
    carPose.steer = steer;
    carPose.yaw = -steer * 0.08;

    const roadVib = Math.sin(t * 36) * 0.014;
    camera.position.set(xPos - 0.36, 1.25 + roadVib, zPos + 0.06);
    tmp.look.set(xPos - 0.15 + steer * 1.8, 1.18 + roadVib, zPos - 22);
    camera.lookAt(tmp.look);
    camera.rotation.z = -steer * 0.035;
  } else if (shot.id === 'CLIMAX_CUTS' && climaxCut) {
    const rand = () => Math.random() - 0.5;
    if (climaxCut.kind === 'FLICKER_WOODS') {
      const zCut = -84 - (climaxCut.index % 5) * 4.5;
      camera.position.set(-10.2 + rand() * 0.18, 1.62 + rand() * 0.14, zCut);
      tmp.look.set(-11.8 + Math.sin(t * 18) * 3.0, 1.85, zCut - 8.0);
      camera.lookAt(tmp.look);
      camera.rotation.z = rand() * 0.22;
      flashIntensity = Math.sin(t * 58) > -0.2 ? 78 : 2;
      fillIntensity = 1.4;
    } else if (climaxCut.kind === 'JAW_LUNGE') {
      camera.position.set(rand() * 0.08, 2.32 + rand() * 0.08, -73.0);
      const dist = THREE.MathUtils.lerp(1.42, 0.58, climaxCut.intensity);
      tmp.look.set(0, 2.38, -73.0 - dist);
      camera.lookAt(tmp.look);
      lurkerParked = false;
      if (lurkerObj) {
        lurkerObj.position.set(rand() * 0.05, 2.38 - LURKER_HEAD_Y * 0.85, -73.0 - dist);
        lurkerObj.scale.setScalar(0.85);
        lurkerObj.rotation.set(0, 0, rand() * 0.2);
      }
      if (scareLightObj) {
        scareLightObj.position.set(0, 2.45, -73.0 - dist * 0.45);
        scareLightIntensity = 3.8 + Math.random() * 2.5;
      }
    } else if (climaxCut.kind === 'RED_HEADLIGHTS') {
      camera.position.set(0.45 + rand() * 0.12, 1.05 + rand() * 0.09, -15.2 + climaxCut.progress * 2.2);
      tmp.look.set(0.45, 0.88, -23.5);
      camera.lookAt(tmp.look);
      camera.rotation.z = rand() * 0.12;
    }
  } else if (shot.id === 'JUMPSCARE') {
    const rand = () => Math.random() - 0.5;
    const lunge = smoothstep(Math.min(1, shot.localTime / 0.34));
    const dist = THREE.MathUtils.lerp(0.8, 0.35, lunge);
    const shake = 0.06 + shot.localTime * 0.04;

    camera.position.set(rand() * shake, 2.4 + rand() * shake, -50.0 + rand() * shake);
    camera.lookAt(0, 2.4, -52.0);
    camera.getWorldDirection(tmp.fwd);
    tmp.face.copy(camera.position).addScaledVector(tmp.fwd, dist);

    voidActive = true;
    lurkerParked = false;
    if (voidPlaneObj) {
      voidPlaneObj.position.copy(camera.position).addScaledVector(tmp.fwd, dist + 0.48);
      voidPlaneObj.lookAt(camera.position);
    }
    if (lurkerObj) {
      lurkerObj.scale.setScalar(1.0);
      lurkerObj.position.set(
        tmp.face.x + rand() * 0.04,
        tmp.face.y - LURKER_HEAD_Y + rand() * 0.04,
        tmp.face.z + rand() * 0.04
      );
      lurkerObj.lookAt(camera.position.x, lurkerObj.position.y, camera.position.z);
      lurkerObj.rotation.z += rand() * 0.18;
    }
    if (scareLightObj) {
      scareLightObj.position.copy(camera.position).addScaledVector(tmp.fwd, dist * 0.38);
      scareLightObj.position.y += 0.1;
      scareLightIntensity = 4.6 + Math.random() * 2.2;
    }
  }

  if (lurkerParked && lurkerObj) lurkerObj.position.set(0, -80, 0);
  if (!voidActive && voidPlaneObj) voidPlaneObj.position.set(0, -80, 0);
  if (scareLightObj) scareLightObj.intensity = scareLightIntensity;

  return { flashIntensity, fillIntensity, flashYawOff, flashPitchOff };
}
