// ============================================================================
// src/components/PhantomStall3D.jsx
// Signature Chapter 1 Psychological Horror Set-Piece at [-14.6, 0, -222.0]:
// - Phase A (revealed=false): Welcoming everyday roadside warung with 3 normal
//   people (stall keeper + 2 casual patrons), warm amber overhead bulbs,
//   steaming plates & raised canopy roof (y = 3.35m, zero eye-level clipping).
// - Phase B (revealed=true): People, warm bulbs & plates park at y = -80 via
//   ref while the stall itself transforms in-place into a pre-mounted rusty,
//   crooked, dark-green vine-covered abandoned ruin (0ms lag, 0 dynamic lights).
// ============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ModelAsset from '../shared/ModelAsset';
import { MODELS } from '../../data/shared/modelCatalog';
import { LANDMARK_TRANSFORMS } from '../../data/chapter1/midnightLandmarksData';
import { getSubtitleDurationMs } from '../../data/shared/dialogueTiming';

// Exact delay from Beat 3 head-turn until ~0.35s before the one-shot flashbang
const EYE_GLOW_DELAY_SEC = Math.max(
  0.2,
  getSubtitleDurationMs('You should not have come here.', 'WHISPERING IN UNISON') / 1000 - 0.35
);

// 3 everyday people: 1 stall keeper behind counter + 2 casual seated patrons
const EVERYDAY_PEOPLE = [
  { id: 'keeper', pos: [-0.05, 0, 0.35], baseYaw: 1.45, skin: '#d8a47f', shirt: '#d6c8a8', pants: '#35424f', cap: '#3b322b', seated: false },
  { id: 'patron1', pos: [1.62, 0, -0.58], baseYaw: 0.35, skin: '#c68e68', shirt: '#4c7496', pants: '#2d3b4e', cap: null, seated: true },
  { id: 'patron2', pos: [1.72, 0, 1.55], baseYaw: -0.45, skin: '#d8a47f', shirt: '#a85a46', pants: '#3d352e', cap: '#465947', seated: true },
];

const PLAYER_SEAT_LOCAL = new THREE.Vector3(3.15, 1.38, 0.75);

function EverydayPerson({ cfg, stare }) {
  const headRef = useRef();
  const armRef = useRef();
  const eyeMatsRef = useRef([]);
  const stareAgeRef = useRef(0);

  const targetHeadYaw = useMemo(() => {
    const dx = PLAYER_SEAT_LOCAL.x - cfg.pos[0];
    const dz = PLAYER_SEAT_LOCAL.z - cfg.pos[2];
    return Math.atan2(dx, dz) - cfg.baseYaw;
  }, [cfg.pos, cfg.baseYaw]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    if (headRef.current) {
      const desired = stare ? targetHeadYaw : Math.sin(t * 0.75 + cfg.pos[2]) * 0.14;
      headRef.current.rotation.y += (desired - headRef.current.rotation.y) * Math.min(1, delta * (stare ? 12 : 3));
    }
    if (armRef.current) {
      armRef.current.rotation.x = stare ? 0 : -0.42 + Math.sin(t * 2.0 + cfg.pos[0]) * 0.15;
    }
    // Keep normal dark pupils until ~0.35s before flashbang, then snap to eerie glowing crimson eyes via ref!
    stareAgeRef.current = stare ? stareAgeRef.current + Math.min(delta, 0.1) : 0;
    const snapGlow = stare && stareAgeRef.current >= EYE_GLOW_DELAY_SEC;
    for (let i = 0; i < eyeMatsRef.current.length; i += 1) {
      const mat = eyeMatsRef.current[i];
      if (!mat) continue;
      if (snapGlow) {
        mat.emissive.set('#ff2a2a');
        mat.emissiveIntensity = 4.0;
      } else {
        mat.emissive.set('#000000');
        mat.emissiveIntensity = 0;
      }
    }
  });

  const yOff = cfg.seated ? -0.26 : 0;

  return (
    <group position={[cfg.pos[0], yOff, cfg.pos[2]]} rotation={[0, cfg.baseYaw, 0]}>
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.42, 0.56, 0.24]} />
        <meshLambertMaterial color={cfg.shirt} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.36, 0.65, 0.24]} />
        <meshLambertMaterial color={cfg.pants} />
      </mesh>
      <mesh ref={armRef} position={[0.26, 1.15, 0.12]}>
        <boxGeometry args={[0.12, 0.44, 0.12]} />
        <meshLambertMaterial color={cfg.shirt} />
      </mesh>
      <group ref={headRef} position={[0, 1.58, 0]}>
        <mesh>
          <sphereGeometry args={[0.155, 12, 12]} />
          <meshLambertMaterial color={cfg.skin} />
        </mesh>
        {/* Natural dark hair or casual cap */}
        <mesh position={[0, 0.06, -0.02]}>
          <sphereGeometry args={[0.16, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshLambertMaterial color={cfg.cap || '#1c1816'} />
        </mesh>
        {cfg.cap && (
          <mesh position={[0, 0.055, 0.14]} rotation={[0.15, 0, 0]}>
            <boxGeometry args={[0.22, 0.025, 0.14]} />
            <meshLambertMaterial color={cfg.cap} />
          </mesh>
        )}
        {[-0.05, 0.05].map((ex, i) => (
          <mesh key={i} position={[ex, 0.015, 0.145]}>
            <sphereGeometry args={[0.019, 8, 8]} />
            <meshStandardMaterial
              ref={(el) => { eyeMatsRef.current[i] = el; }}
              color="#171412"
              emissive="#000000"
              emissiveIntensity={0}
              roughness={0.35}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function CreepingVinesAndLeaves() {
  const { vineGeoms, leafClusters } = useMemo(() => {
    const paths = [
      [[-2.1, 0.05, -3.5], [-2.0, 1.1, -3.35], [-2.12, 2.2, -3.45], [-1.5, 3.15, -3.2], [0.2, 3.22, -2.6]],
      [[1.9, 0.05, 3.5], [1.85, 1.25, 3.38], [1.95, 2.35, 3.42], [1.3, 3.12, 2.9], [-0.4, 3.18, 2.1]],
      [[-2.1, 0.05, 3.5], [-1.95, 1.3, 3.2], [-1.8, 2.5, 2.6], [-0.8, 3.15, 1.6]],
      [[1.9, 0.05, -3.5], [1.8, 1.15, -3.1], [1.55, 2.25, -2.6], [1.95, 3.05, -1.8]],
      [[-0.75, 0.1, -2.1], [-0.4, 0.95, -1.5], [-0.85, 1.05, -0.2], [-0.55, 0.98, 1.2], [-0.7, 0.1, 2.3]],
    ];
    const geoms = paths.map((pts, idx) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
      return new THREE.TubeGeometry(curve, 18, 0.048 + (idx % 2) * 0.016, 6, false);
    });
    const leaves = [
      [-2.0, 1.6, -3.35, 0.28], [-1.6, 3.05, -3.1, 0.36], [0.1, 3.18, -2.4, 0.34],
      [1.88, 1.85, 3.35, 0.3], [1.2, 3.05, 2.8, 0.38], [-0.4, 3.1, 2.0, 0.32],
      [-1.9, 2.2, 2.8, 0.34], [1.7, 2.1, -2.8, 0.3], [-0.6, 1.06, -0.8, 0.26],
      [-0.65, 1.04, 0.9, 0.28], [2.25, 0.85, -0.6, 0.24], [2.35, 0.86, 1.65, 0.25],
    ];
    return { vineGeoms: geoms, leafClusters: leaves };
  }, []);

  return (
    <group>
      {vineGeoms.map((geom, i) => (
        <mesh key={`v_${i}`} geometry={geom}>
          <meshLambertMaterial color={i % 2 === 0 ? '#243d25' : '#1b301c'} />
        </mesh>
      ))}
      {leafClusters.map(([lx, ly, lz, r], i) => (
        <mesh key={`l_${i}`} position={[lx, ly, lz]} scale={[1.25, 0.72, 1.1]}>
          <sphereGeometry args={[r, 7, 7]} />
          <meshLambertMaterial color={i % 2 === 0 ? '#243d25' : '#1b301c'} />
        </mesh>
      ))}
    </group>
  );
}

export default function PhantomStall3D({ dinersStare = false, revealed = false }) {
  const { x, z, rotY } = LANDMARK_TRANSFORMS.phantomStall;
  const liveGroupRef = useRef();
  const abandonedGroupRef = useRef();
  const stallLightRef = useRef();
  const bulbMatsRef = useRef([]);
  const awningMatRef = useRef();

  // Swap live warung <-> rusty vine-covered ruin via y=-80 ref & intensity=0 (0ms shader recompile!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (liveGroupRef.current) liveGroupRef.current.position.y = revealed ? -80 : 0;
    if (abandonedGroupRef.current) abandonedGroupRef.current.position.y = revealed ? 0 : -80;

    if (stallLightRef.current) {
      stallLightRef.current.intensity = revealed
        ? 0
        : dinersStare
          ? Math.sin(t * 28) > -0.25 ? 2.4 : 0.9
          : 2.4;
    }

    const flicker = dinersStare ? (Math.sin(t * 28) > -0.25 ? 2.4 : 0.45) : 3.2;
    for (let i = 0; i < bulbMatsRef.current.length; i += 1) {
      const mat = bulbMatsRef.current[i];
      if (mat) mat.emissiveIntensity = revealed ? 0 : flicker;
    }
    if (awningMatRef.current) {
      awningMatRef.current.emissiveIntensity = revealed ? 0 : dinersStare ? flicker * 0.16 : 0.42;
    }
  });

  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* Always mounted & visible=true from initial mount so gl.compile compiles it upfront (0ms stutter!) */}
      <pointLight
        ref={stallLightRef}
        position={[1.15, 2.9, 0.35]}
        color="#ffbe6b"
        intensity={2.4}
        distance={11}
        decay={2}
      />

      {/* Persistent Floor Slab & Tables (always standing in place) */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[5.4, 0.12, 8.2]} />
        <meshLambertMaterial color={revealed ? '#1e1916' : '#4a3d31'} />
      </mesh>
      <ModelAsset url={MODELS.roundTable} position={[2.25, 0.1, -0.6]} targetHeight={0.78} />
      <ModelAsset url={MODELS.roundTable} position={[2.35, 0.1, 1.65]} targetHeight={0.78} />

      {/* PHASE A (PRE-FLASHBANG): Welcoming Everyday Warung + 3 Normal People + Warm Amber Bulbs */}
      <group ref={liveGroupRef} position={[0, 0, 0]}>
        {/* Raised Warm Canopy Roof (y = 3.35m >= 2.8m, zero eye-level clipping) */}
        <mesh position={[0.1, 3.35, 0]} rotation={[0, 0, -0.05]}>
          <boxGeometry args={[5.8, 0.16, 8.6]} />
          <meshStandardMaterial
            ref={awningMatRef}
            color="#7d4a30"
            emissive="#ffae4d"
            emissiveIntensity={0.42}
            roughness={0.82}
          />
        </mesh>
        {[[-2.1, -3.5], [1.9, -3.5], [-2.1, 3.5], [1.9, 3.5]].map(([px, pz], i) => (
          <mesh key={i} position={[px, 1.66, pz]}>
            <boxGeometry args={[0.2, 3.32, 0.2]} />
            <meshLambertMaterial color="#593b25" />
          </mesh>
        ))}
        <mesh position={[-2.1, 1.66, 0]}>
          <boxGeometry args={[0.18, 3.28, 7.2]} />
          <meshLambertMaterial color="#63442d" />
        </mesh>
        <mesh position={[-0.75, 0.56, 0]}>
          <boxGeometry args={[1.15, 0.96, 5.4]} />
          <meshLambertMaterial color="#785336" />
        </mesh>
        {[-2.4, -0.8, 0.8, 2.4].map((bz, i) => (
          <mesh key={i} position={[1.45, 3.08, bz]}>
            <sphereGeometry args={[0.13, 10, 10]} />
            <meshStandardMaterial
              ref={(el) => { bulbMatsRef.current[i] = el; }}
              color="#fff0c2"
              emissive="#ffcf66"
              emissiveIntensity={3.2}
              roughness={0.2}
            />
          </mesh>
        ))}
        {[[-0.6, 2.25], [1.65, 2.35]].map(([tz, tx], idx) => (
          <mesh key={idx} position={[tx, 0.9, tz]}>
            <cylinderGeometry args={[0.2, 0.16, 0.04, 12]} />
            <meshLambertMaterial color="#f2ede2" />
          </mesh>
        ))}
        {EVERYDAY_PEOPLE.map((cfg) => (
          <EverydayPerson key={cfg.id} cfg={cfg} stare={dinersStare} />
        ))}
      </group>

      {/* PHASE B (POST-FLASHBANG): Pre-Mounted Rusty, Crooked, Vine-Covered Abandoned Stall Ruin */}
      <group ref={abandonedGroupRef} position={[0, -80, 0]}>
        <mesh position={[0.15, 3.26, 0]} rotation={[0.04, 0, 0.13]}>
          <boxGeometry args={[5.75, 0.14, 8.5]} />
          <meshStandardMaterial color="#3b2a1e" roughness={0.94} metalness={0.28} />
        </mesh>
        {[[-2.1, -3.5, 0.04], [1.9, -3.5, 0.11], [-2.1, 3.5, -0.05], [1.9, 3.5, 0.08]].map(([px, pz, tilt], i) => (
          <mesh key={i} position={[px, 1.64, pz]} rotation={[0, 0, tilt]}>
            <boxGeometry args={[0.19, 3.28, 0.19]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#4a3222' : '#3b2a1e'} roughness={0.92} metalness={0.35} />
          </mesh>
        ))}
        <mesh position={[-2.1, 1.62, 0]} rotation={[0, 0, 0.03]}>
          <boxGeometry args={[0.18, 3.2, 7.2]} />
          <meshStandardMaterial color="#3b2a1e" roughness={0.94} metalness={0.25} />
        </mesh>
        <mesh position={[-0.75, 0.56, 0]}>
          <boxGeometry args={[1.15, 0.96, 5.4]} />
          <meshStandardMaterial color="#4a3222" roughness={0.92} metalness={0.35} />
        </mesh>
        <CreepingVinesAndLeaves />
      </group>
    </group>
  );
}
