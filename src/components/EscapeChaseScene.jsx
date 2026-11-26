// ============================================================================
// src/components/EscapeChaseScene.jsx
// 3D Gameplay Controller for the Chapter 1 Climax Escape Chase:
// - 'IGNITION_BEAT' (2.0s): Hood slams shut, engine cranks & headlights flare
// - 'ROAR_CUTSCENE' (4.2s): Enraged Shadow Lurker rears up before camera whips
//   behind the speeding sedan
// - 'DRIVING': Dynamic 3rd-person chase with final 150m speed ramp, Lurker-
//   proximity headlight flicker, tire-screech SFX on sharp turns, and brief
//   invulnerability sparks + blinking taillights after taking damage!
// ============================================================================

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import StalledSedan from './StalledSedan';
import ShadowStalkerModel from './ShadowStalkerModel';
import EscapeChaseEnvironment from './EscapeChaseEnvironment';
import {
  CHASE_DISTANCE, CHASE_HAZARDS, CHASE_SPEED, LANE_BOUND, ROAR_DURATION,
} from '../data/escapeChaseData';
import { playCrashImpactThud, playEngineSputter } from './AudioEngine';
import { playJumpscareScream, playWindowSlamSting } from './JumpscareAudio';
import { playCarIgnitionSequence, playTireScreech } from './ChaseThemeAudio';

const IGNITION_DURATION = 2.05;

export default function EscapeChaseScene({
  stage,
  paused = false,
  integrity,
  runId,
  onIgnitionDone,
  onStartDriving,
  onSubtitle,
  onProgressUpdate,
  onHitObstacle,
  onEscaped,
}) {
  const { camera } = useThree();
  const carGroupRef = useRef();
  const pursuerRef = useRef();
  const roarLurkerRef = useRef();
  const headBeamNearRef = useRef();
  const headBeamFarRef = useRef();
  const tailLightRef = useRef();
  const sparksRef = useRef();
  const lungeRefs = useRef({});
  const keysRef = useRef({});

  const phaseElapsedRef = useRef(0);
  const carXRef = useRef(0);
  const carZRef = useRef(0);
  const carRollRef = useRef(0);
  const lastSteerRef = useRef(0);
  const hitCooldownRef = useRef(0);
  const shakeRef = useRef(0);
  const lastHudSyncRef = useRef(0);
  const finishedRef = useRef(false);
  const flagsRef = useRef({ ignAudio: false, roarAudio: false, roarMid: false });

  useEffect(() => {
    phaseElapsedRef.current = 0;
    carXRef.current = 0;
    carZRef.current = 0;
    carRollRef.current = 0;
    lastSteerRef.current = 0;
    hitCooldownRef.current = 0;
    shakeRef.current = 0;
    finishedRef.current = false;
    flagsRef.current = { ignAudio: false, roarAudio: false, roarMid: false };
    CHASE_HAZARDS.forEach((h) => {
      if (h.type === 'lunge' && lungeRefs.current[h.id]) {
        lungeRefs.current[h.id].position.x = h.x;
      }
    });
  }, [runId]);

  useEffect(() => {
    phaseElapsedRef.current = 0;
  }, [stage]);

  useEffect(() => {
    const onDown = (e) => { keysRef.current[e.code] = true; };
    const onUp = (e) => { keysRef.current[e.code] = false; };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  useFrame(({ clock }, delta) => {
    if (paused) return;
    const dt = Math.min(delta, 0.06);
    const t = clock.getElapsedTime();

    // 1) 2-SECOND HOOD-SLAM & ENGINE-CRANK IGNITION BEAT
    if (stage === 'IGNITION_BEAT') {
      phaseElapsedRef.current += dt;
      const e = phaseElapsedRef.current;

      if (!flagsRef.current.ignAudio) {
        flagsRef.current.ignAudio = true;
        playCarIgnitionSequence();
        onSubtitle({ tag: 'YOU', text: 'Hood shut... come on, TURN OVER! Yes—engine caught!' });
      }

      const crankShake = e > 0.4 && e < 1.4 ? Math.sin(t * 68) * 0.035 : 0;
      const flare = e > 1.38 ? THREE.MathUtils.clamp((e - 1.38) / 0.45, 0, 1) : 0.08;
      if (headBeamNearRef.current) headBeamNearRef.current.intensity = flare * 20;
      if (headBeamFarRef.current) headBeamFarRef.current.intensity = flare * 13;

      camera.position.set(1.85 + crankShake, 1.35 + crankShake * 0.5, -2.95);
      camera.lookAt(0, 0.95, 0.4);

      if (e >= IGNITION_DURATION) onIgnitionDone?.();
      return;
    }

    // 2) ENRAGED SHADOW LURKER ROAR CUTSCENE
    if (stage === 'ROAR_CUTSCENE') {
      phaseElapsedRef.current += dt;
      const e = phaseElapsedRef.current;

      if (!flagsRef.current.roarAudio) {
        flagsRef.current.roarAudio = true;
        playJumpscareScream();
        onSubtitle({ tag: 'YOU', text: 'IT HEARD THE ENGINE—GET IN THE CAR! FLOOR IT!' });
      }

      if (roarLurkerRef.current) {
        const lungeZ = -8.5 + Math.min(1, e / 2.2) * 3.1;
        roarLurkerRef.current.position.set(Math.sin(t * 24) * 0.14, 0, lungeZ);
      }

      if (e < 2.25) {
        camera.position.set(0.35 + Math.sin(t * 52) * 0.06, 2.35 + Math.cos(t * 46) * 0.05, -3.1);
        camera.lookAt(0, 2.55, -8.5);
      } else {
        if (!flagsRef.current.roarMid) {
          flagsRef.current.roarMid = true;
          playEngineSputter();
          onSubtitle({
            tag: 'INNER THOUGHT',
            text: 'Steer around the fallen trees and shadows—make it to safety!',
          });
        }
        const k = THREE.MathUtils.smoothstep(e, 2.25, ROAR_DURATION);
        camera.position.lerpVectors(
          new THREE.Vector3(0.35, 2.35, -3.1),
          new THREE.Vector3(0, 3.35, 6.9),
          k
        );
        camera.lookAt(0, 1.15, -14.0);
      }

      if (e >= ROAR_DURATION) {
        onSubtitle(null);
        onStartDriving();
      }
      return;
    }

    if (stage !== 'DRIVING' || finishedRef.current) return;

    // 3) HIGH-SPEED THIRD-PERSON CHASE WITH FINAL 150M SPEED RAMP
    const remaining = Math.max(0, CHASE_DISTANCE + carZRef.current);
    const ramp = THREE.MathUtils.clamp((150 - remaining) / 150, 0, 1);
    const activeSpeed = CHASE_SPEED + ramp * 6.0;

    const steerDir =
      (keysRef.current['KeyD'] || keysRef.current['ArrowRight'] ? 1 : 0) -
      (keysRef.current['KeyA'] || keysRef.current['ArrowLeft'] ? 1 : 0);

    // Tire-screech SFX on sharp steering cut or rapid direction reversal
    if (steerDir !== 0 && steerDir !== lastSteerRef.current) {
      playTireScreech();
    }
    lastSteerRef.current = steerDir;

    carXRef.current = THREE.MathUtils.clamp(carXRef.current + steerDir * 8.6 * dt, -LANE_BOUND, LANE_BOUND);
    carZRef.current -= activeSpeed * dt;
    carRollRef.current += (steerDir * -0.095 - carRollRef.current) * Math.min(1, dt * 8.5);

    if (carGroupRef.current) {
      carGroupRef.current.position.set(carXRef.current, 0, carZRef.current);
      carGroupRef.current.rotation.y = -steerDir * 0.115;
      carGroupRef.current.rotation.z = carRollRef.current;
    }

    // Pursuing Shadow Lurker lunges closer in waves -> flickers sedan headlights!
    const lungeWave = Math.sin(t * 3.4);
    const gap = 3.9 + integrity * 0.8 + lungeWave * 0.65 - ramp * 0.65;
    if (pursuerRef.current) {
      const swayX = carXRef.current * 0.65 + Math.sin(t * 5.2) * 0.9;
      pursuerRef.current.position.set(swayX, 0.15 + Math.abs(Math.sin(t * 9)) * 0.25, carZRef.current + gap);
      pursuerRef.current.rotation.y = Math.PI;
    }

    const lurkerClose = gap < 5.1;
    const flicker = lurkerClose && Math.sin(t * 47) > 0.35 ? 0.35 : 1.0;
    if (headBeamNearRef.current) headBeamNearRef.current.intensity = 18 * flicker;
    if (headBeamFarRef.current) headBeamFarRef.current.intensity = 12 * flicker;

    // Brief invulnerability sparks & blinking taillights after obstacle hit
    hitCooldownRef.current = Math.max(0, hitCooldownRef.current - dt);
    shakeRef.current = Math.max(0, shakeRef.current - dt * 2.2);
    const invuln = hitCooldownRef.current > 0;
    if (tailLightRef.current) {
      tailLightRef.current.intensity = invuln ? (Math.sin(t * 42) > 0 ? 11 : 0.6) : 3.2;
    }
    if (sparksRef.current) {
      sparksRef.current.visible = invuln;
      if (invuln) sparksRef.current.rotation.z = t * 22;
    }

    for (const h of CHASE_HAZARDS) {
      let hx = h.x;
      if (h.type === 'lunge') {
        const distAhead = carZRef.current - h.z;
        const progress = THREE.MathUtils.clamp((26 - distAhead) / 18, 0, 1);
        hx = THREE.MathUtils.lerp(h.x, h.targetX, progress);
        if (lungeRefs.current[h.id]) lungeRefs.current[h.id].position.x = hx;
      }

      if (!invuln) {
        const dz = Math.abs(carZRef.current - h.z);
        const dx = Math.abs(carXRef.current - hx);
        if (dz < h.halfZ + 1.45 && dx < h.halfW + 0.72) {
          hitCooldownRef.current = 1.05;
          shakeRef.current = 0.58;
          if (h.type === 'lunge') playWindowSlamSting();
          else playCrashImpactThud();
          onHitObstacle();
        }
      }
    }

    const sx = shakeRef.current > 0 ? Math.sin(t * 60) * shakeRef.current * 0.35 : 0;
    const sy = shakeRef.current > 0 ? Math.cos(t * 54) * shakeRef.current * 0.24 : 0;
    camera.position.set(carXRef.current * 0.52 + sx, 3.35 + sy, carZRef.current + 6.9);
    camera.lookAt(carXRef.current * 0.72, 1.15, carZRef.current - 15.0);

    // Subtle dynamic FOV ramp (64 -> 72) during final 150m acceleration sprint
    const targetFov = THREE.MathUtils.lerp(64, 72, ramp);
    if (Math.abs(camera.fov - targetFov) > 0.05) {
      camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 4);
      camera.updateProjectionMatrix();
    }

    if (t - lastHudSyncRef.current > 0.1) {
      lastHudSyncRef.current = t;
      onProgressUpdate(Math.round(remaining));
    }

    if (carZRef.current <= -CHASE_DISTANCE) {
      finishedRef.current = true;
      onEscaped();
    }
  });

  return (
    <>
      <EscapeChaseEnvironment lungeRefs={lungeRefs} />

      {stage === 'ROAR_CUTSCENE' && (
        <group ref={roarLurkerRef} position={[0, 0, -8.5]}>
          <ShadowStalkerModel scale={1.18} frenzy={true} eyeColor="#ff3b3b" eyeScale={1.9} />
          <pointLight position={[0, 2.8, 1.4]} color="#ff4a4a" intensity={6} distance={10} />
        </group>
      )}

      <group ref={carGroupRef} position={[0, 0, 0]}>
        <StalledSedan position={[0, 0, 0]} isDented={true} headlightPower={stage === 'IGNITION_BEAT' ? 0.5 : 1.35} hazardsOn={true} inspected={true} />
        <pointLight ref={headBeamNearRef} position={[0, 1.4, -10.5]} color="#ffebc0" intensity={18} distance={34} decay={1.3} />
        <pointLight ref={headBeamFarRef} position={[0, 1.8, -24.0]} color="#ffdca0" intensity={12} distance={36} decay={1.4} />
        <pointLight ref={tailLightRef} position={[0, 0.9, 3.2]} color="#ff3a2e" intensity={3.2} distance={8} />
        <group ref={sparksRef} position={[0, 0.45, 2.05]} visible={false}>
          {[-0.65, -0.25, 0.25, 0.65].map((sx, i) => (
            <mesh key={i} position={[sx, (i % 2) * 0.22, 0.15]}>
              <octahedronGeometry args={[0.09, 0]} />
              <meshBasicMaterial color={i % 2 === 0 ? '#ffe066' : '#ff7b29'} />
            </mesh>
          ))}
        </group>
      </group>

      {stage === 'DRIVING' && (
        <group ref={pursuerRef} position={[0, 0, 5.5]}>
          <ShadowStalkerModel scale={1.08} frenzy={true} eyeColor="#ff4545" eyeScale={1.55} />
        </group>
      )}
    </>
  );
}
