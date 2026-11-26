// ============================================================================
// src/components/ShadowStalkerModel.jsx
// Pale Hooded Spirit With Hollow Black Sockets (100% procedural, 0 lights):
// - Pitch-black hooded shroud/veil framing a pale ash-white face (#b4b8be)
// - Patrol: deep bottomless black eye sockets (no glowing dots), upper
//   forehead dark shadow smudge, sculpted nose bridge, dark bruised lips + chin smear
// - Frenzy (Jumpscare / Chase / Dome): rolled-up pale white eyes (#e6d8ad),
//   tangled dark hair tendrils, unhinged jaw with visible upper/lower teeth rows
// - Layered jagged shroud + 6 whipping ribbons, heaving torso & 4-clawed arms
// ============================================================================

import React, { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RIBBON_SPECS = [
  { angle: 0.2, radius: 0.42, y: 1.55, w: 0.28, h: 1.75, phase: 0.0, tilt: 0.14 },
  { angle: 1.25, radius: 0.46, y: 1.42, w: 0.24, h: 1.95, phase: 1.1, tilt: -0.18 },
  { angle: 2.35, radius: 0.44, y: 1.6, w: 0.3, h: 1.85, phase: 2.3, tilt: 0.16 },
  { angle: 3.4, radius: 0.48, y: 1.38, w: 0.26, h: 2.05, phase: 3.4, tilt: -0.15 },
  { angle: 4.5, radius: 0.43, y: 1.5, w: 0.22, h: 1.7, phase: 4.7, tilt: 0.2 },
  { angle: 5.55, radius: 0.45, y: 1.46, w: 0.27, h: 1.9, phase: 5.6, tilt: -0.16 },
];

const CLAW_FINGERS = [
  { x: -0.06, z: 0.02, rz: 0.24, rx: 0.28, len: 0.32 },
  { x: -0.02, z: 0.04, rz: 0.08, rx: 0.36, len: 0.37 },
  { x: 0.025, z: 0.04, rz: -0.08, rx: 0.34, len: 0.36 },
  { x: 0.065, z: 0.015, rz: -0.26, rx: 0.26, len: 0.3 },
];

const HAIR_TENDRILS = [
  [-0.12, 0.14, 0.21, 0.18], [-0.05, 0.16, 0.225, -0.08],
  [0.02, 0.155, 0.228, 0.1], [0.09, 0.145, 0.215, -0.16], [0.14, 0.12, 0.195, -0.24],
];

const TEETH_OFFSETS = [-0.056, -0.034, -0.011, 0.011, 0.034, 0.056];

function ClawedArm({ side, armRef }) {
  const s = side;
  return (
    <group ref={armRef} position={[s * 0.48, 2.42, 0.08]} rotation={[0.38, 0, s * -0.14]}>
      <mesh position={[s * 0.04, -0.38, 0.03]} rotation={[0.12, 0, s * -0.08]}>
        <cylinderGeometry args={[0.055, 0.038, 0.82, 7]} />
        <meshStandardMaterial color="#030305" roughness={1} />
      </mesh>
      <group position={[s * 0.08, -0.78, 0.08]} rotation={[-0.48, 0, s * 0.14]}>
        <mesh position={[0, -0.4, 0.04]}>
          <cylinderGeometry args={[0.04, 0.024, 0.86, 7]} />
          <meshStandardMaterial color="#050608" roughness={0.96} />
        </mesh>
        <group position={[0, -0.84, 0.08]}>
          <mesh scale={[1.15, 0.7, 0.8]}>
            <sphereGeometry args={[0.055, 7, 7]} />
            <meshStandardMaterial color="#969aa0" roughness={0.9} />
          </mesh>
          {CLAW_FINGERS.map((f, idx) => (
            <mesh key={idx} position={[f.x, -f.len * 0.48, f.z]} rotation={[Math.PI + f.rx, 0, f.rz]}>
              <coneGeometry args={[0.014, f.len, 5]} />
              <meshStandardMaterial color="#2a2b30" roughness={0.85} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

const ShadowStalkerModel = forwardRef(function ShadowStalkerModel(
  { shroudMatRef, frenzy = false, eyeColor = '#e6d8ad', eyeScale = 1, ...rest },
  ref
) {
  const torsoRef = useRef();
  const headRef = useRef();
  const jawRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const ribbonsRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (torsoRef.current) {
      const rate = frenzy ? 14.0 : 2.2;
      const amp = frenzy ? 0.085 : 0.032;
      const heave = Math.sin(t * rate) * amp;
      torsoRef.current.scale.set(1 + heave, 1 + heave * 0.45, 1 + heave * 1.35);
      torsoRef.current.rotation.z = frenzy ? Math.sin(t * 36) * 0.07 : Math.sin(t * 1.1) * 0.025;
    }

    if (headRef.current) {
      const twitching = frenzy || Math.sin(t * 3.1) > 0.84;
      const speed = frenzy ? 88 : 44;
      const amp = frenzy ? 0.48 : 0.32;
      headRef.current.rotation.z = twitching
        ? Math.sin(t * speed) * amp
        : Math.sin(t * 1.35) * 0.08;
      headRef.current.rotation.x = twitching
        ? 0.18 + (frenzy ? Math.sin(t * 64) * 0.2 : 0)
        : 0.06;
    }

    if (jawRef.current) {
      const scream = frenzy ? 0.64 + Math.sin(t * 42) * 0.12 : 0.04 + Math.max(0, Math.sin(t * 2.1)) * 0.05;
      jawRef.current.rotation.x = scream;
      jawRef.current.position.y = frenzy ? -0.178 - Math.abs(Math.sin(t * 32)) * 0.03 : -0.108;
    }

    if (leftArmRef.current && rightArmRef.current) {
      if (frenzy) {
        leftArmRef.current.rotation.x = -1.15 + Math.sin(t * 24) * 0.55;
        rightArmRef.current.rotation.x = -1.15 + Math.cos(t * 24) * 0.55;
        leftArmRef.current.rotation.z = 0.22 + Math.sin(t * 19) * 0.24;
        rightArmRef.current.rotation.z = -0.22 - Math.cos(t * 19) * 0.24;
      } else {
        leftArmRef.current.rotation.x = 0.36 + Math.sin(t * 1.5) * 0.18;
        rightArmRef.current.rotation.x = 0.36 - Math.sin(t * 1.5 + 0.6) * 0.18;
        leftArmRef.current.rotation.z = 0.14 + Math.sin(t * 1.1) * 0.06;
        rightArmRef.current.rotation.z = -0.14 - Math.sin(t * 1.1) * 0.06;
      }
    }

    if (ribbonsRef.current) {
      const whipSpeed = frenzy ? 18.0 : 2.6;
      const whipAmp = frenzy ? 0.52 : 0.16;
      ribbonsRef.current.children.forEach((strip, idx) => {
        const spec = RIBBON_SPECS[idx];
        if (!spec) return;
        strip.rotation.x = spec.tilt + Math.sin(t * whipSpeed + spec.phase) * whipAmp;
        strip.rotation.z = Math.cos(t * (whipSpeed * 0.85) + spec.phase) * (whipAmp * 0.75);
      });
    }
  });

  return (
    <group ref={ref} {...rest}>
      {/* Layered Pitch-Black Tattered Shroud & Veil */}
      <mesh position={[0, 1.34, 0]}>
        <coneGeometry args={[0.64, 2.68, 7, 1, true]} />
        <meshStandardMaterial ref={shroudMatRef} color="#020204" roughness={1} transparent opacity={0.96} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.03, 1.24, -0.04]} rotation={[0.04, 0.5, -0.05]}>
        <coneGeometry args={[0.74, 2.28, 6, 1, true]} />
        <meshStandardMaterial color="#040508" roughness={1} transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>

      {/* 6 Asymmetric Whipping Torn Cloak Strips */}
      <group ref={ribbonsRef}>
        {RIBBON_SPECS.map((r, idx) => (
          <mesh key={idx} position={[Math.cos(r.angle) * r.radius, r.y, Math.sin(r.angle) * r.radius]} rotation={[r.tilt, -r.angle + Math.PI / 2, 0]}>
            <planeGeometry args={[r.w, r.h]} />
            <meshStandardMaterial color="#030407" roughness={1} transparent opacity={0.55} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      {/* Hunched Heaving Ribcage & Shoulders */}
      <group ref={torsoRef} position={[0, 2.02, 0.04]}>
        <mesh>
          <cylinderGeometry args={[0.25, 0.13, 1.32, 7]} />
          <meshStandardMaterial color="#020204" roughness={1} />
        </mesh>
        {[0.28, 0.12, -0.04, -0.2].map((ry, i) => (
          <mesh key={i} position={[0, ry, 0.06]} scale={[1.15 - i * 0.08, 0.28, 0.85]}>
            <torusGeometry args={[0.21, 0.032, 6, 10, Math.PI]} />
            <meshStandardMaterial color="#121418" roughness={0.95} />
          </mesh>
        ))}
        <mesh position={[0, 0.54, 0.03]} scale={[1.52, 0.68, 0.85]}>
          <sphereGeometry args={[0.33, 9, 9]} />
          <meshStandardMaterial color="#030306" roughness={1} />
        </mesh>
      </group>

      {/* Articulated Crooked Arms + Splayed 4-Fingered Claws */}
      <ClawedArm side={-1} armRef={leftArmRef} />
      <ClawedArm side={1} armRef={rightArmRef} />

      {/* Tight Pitch-Black Hood Framing Pale Ash-White Face (#b4b8be) */}
      <group ref={headRef} position={[0, 2.95, 0.12]}>
        {/* Outer Pitch-Black Hood/Veil Cowl */}
        <mesh scale={[0.92, 1.22, 1.02]}>
          <sphereGeometry args={[0.27, 12, 12]} />
          <meshStandardMaterial color="#020203" roughness={1} />
        </mesh>
        {/* Pale Desaturated Porcelain / Ash-White Face */}
        <mesh position={[0, -0.005, 0.125]} scale={[0.68, 0.88, 0.52]}>
          <sphereGeometry args={[0.235, 12, 12]} />
          <meshStandardMaterial color={frenzy ? '#dce0e6' : '#b8bcc2'} roughness={0.82} />
        </mesh>
        {/* Dark Circular Shadow Smudge Centered on Upper Forehead */}
        <mesh position={[0, 0.11, 0.228]} scale={[1.1, 0.9, 0.25]}>
          <sphereGeometry args={[0.048, 8, 8]} />
          <meshStandardMaterial color="#1c1d22" roughness={1} transparent opacity={0.78} />
        </mesh>
        {/* Sculpted Pale Nose Bridge */}
        <mesh position={[0, -0.015, 0.242]} rotation={[0.14, 0, 0]}>
          <boxGeometry args={[0.032, 0.072, 0.034]} />
          <meshStandardMaterial color={frenzy ? '#c2c6ce' : '#9fa3aa'} roughness={0.84} />
        </mesh>
        {/* Deep Hollow Pitch-Black Eye Sockets + Piercing Glowing Pinprick Pupils + Dark Ink Tear Streaks */}
        {[-0.068, 0.068].map((xOff, i) => (
          <group key={i} position={[xOff, 0.038, 0.222]}>
            <mesh scale={[1.22, 1.0, 0.52]}>
              <sphereGeometry args={[0.048, 9, 9]} />
              <meshBasicMaterial color="#010102" />
            </mesh>
            {/* Glowing pinprick pupil (meshBasicMaterial stays piercing in pitch dark, zero extra lights!) */}
            <mesh position={[0, 0.002, 0.028]} scale={eyeScale}>
              <sphereGeometry args={[0.014, 8, 8]} />
              <meshBasicMaterial color={eyeColor} />
            </mesh>
            {/* Dark vertical ink / tear streak running down the pale cheek below each socket */}
            <mesh position={[0, -0.068, 0.008]} rotation={[0.16, 0, i === 0 ? 0.06 : -0.06]}>
              <boxGeometry args={[0.018, 0.095, 0.01]} />
              <meshStandardMaterial color="#0d0e11" roughness={0.95} transparent opacity={0.88} />
            </mesh>
          </group>
        ))}
        {/* Tangled Dark Hair / Veil Tendrils Over Forehead (visible in frenzy jumpscare) */}
        {frenzy &&
          HAIR_TENDRILS.map(([hx, hy, hz, rotZ], i) => (
            <mesh key={i} position={[hx, hy, hz]} rotation={[0.12, 0, rotZ]}>
              <boxGeometry args={[0.022, 0.22, 0.012]} />
              <meshStandardMaterial color="#070709" roughness={0.95} />
            </mesh>
          ))}
        {/* Dark Bruised Upper Lip & Pitch-Black Inner Scream Cavity */}
        <mesh position={[0, -0.088, 0.232]} scale={[1.3, 0.36, 0.45]}>
          <sphereGeometry args={[0.046, 8, 8]} />
          <meshStandardMaterial color="#16171a" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.115, 0.206]} scale={[0.66, frenzy ? 1.55 : 0.7, 0.42]}>
          <sphereGeometry args={[0.075, 9, 9]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Upper Teeth Row (exposed during frenzy scream) */}
        {frenzy &&
          TEETH_OFFSETS.map((tx, i) => (
            <mesh key={`ut_${i}`} position={[tx, -0.098, 0.232]}>
              <boxGeometry args={[0.016, 0.026, 0.014]} />
              <meshStandardMaterial color="#cfc6ae" roughness={0.65} />
            </mesh>
          ))}
        {/* Hinged Lower Jaw With Dark Bruised Lower Lip, Chin Smear & Lower Teeth */}
        <group ref={jawRef} position={[0, -0.108, 0.188]}>
          <mesh position={[0, -0.042, 0.028]} scale={[0.58, 0.68, 0.52]}>
            <boxGeometry args={[0.2, 0.14, 0.15]} />
            <meshStandardMaterial color="#a8acb2" roughness={0.86} />
          </mesh>
          <mesh position={[0, 0.002, 0.046]} scale={[1.2, 0.34, 0.42]}>
            <sphereGeometry args={[0.044, 8, 8]} />
            <meshStandardMaterial color="#16171a" roughness={0.9} />
          </mesh>
          {/* Faint Vertical Dark Smear Down the Chin */}
          <mesh position={[0, -0.046, 0.068]}>
            <boxGeometry args={[0.024, 0.075, 0.008]} />
            <meshStandardMaterial color="#1d1e22" roughness={1} transparent opacity={0.62} />
          </mesh>
          {frenzy &&
            TEETH_OFFSETS.map((tx, i) => (
              <mesh key={`lt_${i}`} position={[tx, 0.006, 0.045]}>
                <boxGeometry args={[0.015, 0.024, 0.014]} />
                <meshStandardMaterial color="#c9bfa5" roughness={0.65} />
              </mesh>
            ))}
        </group>
      </group>
    </group>
  );
});

export default ShadowStalkerModel;
