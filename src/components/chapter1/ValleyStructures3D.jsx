// ============================================================================
// src/components/ValleyStructures3D.jsx
// Scattered Lembah Batu midnight forest structures with gated obstacles:
// - Stilt House #1: Boarded-up porch crate (requires Heavy Crowbar to pry open
//   for Alternator Belt) + Torn Hand-Drawn Map
// - Stilt House #2 (Outer Ruin): Porch table holding Heavy Crowbar & Newspaper
// - Old Rubber Tapper's Shed: Fully enclosed 4-wall shed with padlocked iron
//   door (requires Rusted Iron Key to unlock & enter for Car Battery Cell!)
// - Mossy Wakaf: 4-Digit Riddle Padlocked Wooden Supply Chest (Starter Relay)
// ============================================================================

import React from 'react';
import { LANDMARK_TRANSFORMS } from '../../data/chapter1/midnightLandmarksData';

function KampungStiltHouse({
  position,
  rotY,
  hasTornMap = false,
  hasBelt = false,
  cratePried = false,
  showMap = false,
  showPorchLantern = false,
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {[[-2.3, -2.4], [2.3, -2.4], [-2.3, 2.4], [2.3, 2.4], [2.3, 0], [-2.3, 0]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx, 0.55, sz]}>
          <boxGeometry args={[0.22, 1.1, 0.22]} />
          <meshStandardMaterial color="#2b2017" roughness={0.92} />
        </mesh>
      ))}
      <mesh position={[0, 1.08, 0]} receiveShadow>
        <boxGeometry args={[5.4, 0.16, 5.6]} />
        <meshStandardMaterial color="#3b2c20" roughness={0.9} />
      </mesh>
      {[0, 1, 2].map((st) => (
        <mesh key={st} position={[3.0 + st * 0.42, 0.85 - st * 0.32, 0.8]} rotation={[0, 0, -0.05]}>
          <boxGeometry args={[0.45, 0.1, 1.55]} />
          <meshStandardMaterial color="#38291d" roughness={0.92} />
        </mesh>
      ))}
      <mesh position={[-0.75, 2.38, 0]} castShadow>
        <boxGeometry args={[3.7, 2.45, 5.1]} />
        <meshStandardMaterial color="#33271e" roughness={0.92} />
      </mesh>
      {[-1.1, 1.2].map((wz, i) => (
        <group key={i} position={[1.12, 2.45, wz]} rotation={[0, Math.PI / 2, i === 0 ? 0.08 : -0.06]}>
          <mesh>
            <planeGeometry args={[1.05, 1.1]} />
            <meshBasicMaterial color="#090b0f" />
          </mesh>
          <mesh position={[0.48, 0, 0.04]} rotation={[0, -0.35, 0.08]}>
            <boxGeometry args={[0.42, 1.12, 0.05]} />
            <meshStandardMaterial color="#2a2018" roughness={0.9} />
          </mesh>
        </group>
      ))}
      <mesh position={[-0.2, 4.15, 0]} rotation={[0, Math.PI / 4, 0.04]} castShadow>
        <coneGeometry args={[4.6, 1.65, 4]} />
        <meshStandardMaterial color="#262c2b" roughness={0.85} />
      </mesh>

      {showPorchLantern && (
        <group position={[2.45, 2.52, 2.15]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.09, 0.22, 8]} />
            <meshStandardMaterial color="#ffe4a8" emissive="#d98926" emissiveIntensity={2.4} />
          </mesh>
          <pointLight position={[0.4, -0.2, 0.3]} color="#ffae4a" intensity={3.2} distance={18} />
        </group>
      )}

      {/* Porch Table: Torn Map + Boarded Crate Holding Alternator Belt (Requires Crowbar) */}
      {showMap && (
        <group position={[2.25, 1.16, -0.7]}>
          <mesh position={[0, 0.36, 0]}>
            <boxGeometry args={[0.82, 0.72, 1.15]} />
            <meshStandardMaterial color="#423022" roughness={0.88} />
          </mesh>
          {/* Physical Unfolded & Partially Rolled Parchment Torn Map Sitting Flush on Porch Table */}
          <group visible={!hasTornMap} position={[0.04, 0.73, 0.28]} rotation={[0, 0.22, 0]}>
            <mesh>
              <boxGeometry args={[0.52, 0.018, 0.4]} />
              <meshStandardMaterial color="#ead8ae" emissive="#c4ab72" emissiveIntensity={0.45} roughness={0.82} />
            </mesh>
            {/* Drawn ink trail markings on parchment */}
            <mesh position={[0, 0.011, 0]}>
              <boxGeometry args={[0.34, 0.004, 0.025]} />
              <meshBasicMaterial color="#3b2b1d" />
            </mesh>
            <mesh position={[0.05, 0.011, 0.06]} rotation={[0, 0.65, 0]}>
              <boxGeometry args={[0.24, 0.004, 0.02]} />
              <meshBasicMaterial color="#4a3523" />
            </mesh>
            {/* Rolled parchment cylinder along left edge for unmistakable 3D silhouette */}
            <mesh position={[-0.25, 0.022, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.032, 0.032, 0.41, 10]} />
              <meshStandardMaterial color="#dfd0a2" emissive="#b59b62" emissiveIntensity={0.35} roughness={0.8} />
            </mesh>
          </group>
          {/* Boarded-Up Crate Lid (Nailed Shut Until Pried With Heavy Crowbar) */}
          {!cratePried && !hasBelt && (
            <group position={[-0.04, 0.88, -0.28]}>
              <mesh>
                <boxGeometry args={[0.56, 0.34, 0.52]} />
                <meshStandardMaterial color="#523b28" roughness={0.92} />
              </mesh>
              <mesh position={[0, 0.18, 0]} rotation={[0, 0.28, 0]}>
                <boxGeometry args={[0.64, 0.05, 0.14]} />
                <meshStandardMaterial color="#6e5037" roughness={0.9} />
              </mesh>
              <mesh position={[0, 0.18, 0]} rotation={[0, -0.32, 0]}>
                <boxGeometry args={[0.64, 0.05, 0.14]} />
                <meshStandardMaterial color="#6e5037" roughness={0.9} />
              </mesh>
              <pointLight position={[0, 0.45, 0]} color="#ffb86b" intensity={1.6} distance={6.5} />
            </group>
          )}
          {/* Car Part #1: Alternator Belt Revealed After Prying Crate */}
          {cratePried && !hasBelt && (
            <group position={[-0.04, 0.79, -0.28]}>
              <mesh rotation={[Math.PI / 2, 0, 0.3]}>
                <torusGeometry args={[0.17, 0.035, 8, 20]} />
                <meshStandardMaterial color="#20252d" emissive="#64b5f6" emissiveIntensity={0.48} roughness={0.5} />
              </mesh>
              <pointLight position={[0, 0.45, 0]} color="#90caf9" intensity={1.9} distance={6.5} />
            </group>
          )}
        </group>
      )}
    </group>
  );
}

export default function ValleyStructures3D({
  hasTornMap = false,
  hasBelt = false,
  cratePried = false,
  shedUnlocked = false,
  hasBatteryCell = false,
  chestUnlocked = false,
}) {
  const sh1 = LANDMARK_TRANSFORMS.stiltHouse1;
  const sh2 = LANDMARK_TRANSFORMS.stiltHouse2;
  const shed = LANDMARK_TRANSFORMS.rubberShed;
  const wakaf = LANDMARK_TRANSFORMS.wakaf;

  return (
    <group>
      {/* 1) Abandoned Stilt Houses (#1 West: Boarded Crate + Map, #2 East: Crowbar Ruin) */}
      <KampungStiltHouse
        position={[sh1.x, 0, sh1.z]}
        rotY={sh1.rotY}
        showMap={true}
        showPorchLantern={true}
        hasTornMap={hasTornMap}
        hasBelt={hasBelt}
        cratePried={cratePried}
      />
      <KampungStiltHouse
        position={[sh2.x, 0, sh2.z]}
        rotY={sh2.rotY}
        showMap={false}
        showPorchLantern={true}
      />

      {/* Faint Red Reflector Breadcrumb Post Guiding Into Rubber Tapper's Shed */}
      <group position={[7.4, 0, -138.0]}>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.12, 0.84, 0.12]} />
          <meshStandardMaterial color="#2a2d33" roughness={0.88} />
        </mesh>
        <mesh position={[-0.07, 0.68, 0]}>
          <boxGeometry args={[0.04, 0.16, 0.14]} />
          <meshStandardMaterial color="#ff4433" emissive="#ff2a1a" emissiveIntensity={3.0} />
        </mesh>
        <pointLight position={[-0.5, 0.75, 0]} color="#ff4433" intensity={1.8} distance={10} />
      </group>

      {/* 2) Old Rubber Tapper's Shed (4 Enclosed Walls + Locked Iron Door -> Car Battery Cell) */}
      <group position={[shed.x, 0, shed.z]} rotation={[0, shed.rotY, 0]}>
        <mesh position={[0, 0.06, 0]} receiveShadow>
          <boxGeometry args={[4.4, 0.12, 4.6]} />
          <meshStandardMaterial color="#29241e" roughness={0.94} />
        </mesh>
        {/* Back & Side Timber Walls */}
        <mesh position={[1.95, 1.35, 0]}>
          <boxGeometry args={[0.16, 2.55, 4.4]} />
          <meshStandardMaterial color="#33261b" roughness={0.9} />
        </mesh>
        {[-2.15, 2.15].map((sz, i) => (
          <mesh key={i} position={[0, 1.35, sz]}>
            <boxGeometry args={[4.2, 2.55, 0.16]} />
            <meshStandardMaterial color="#38291d" roughness={0.9} />
          </mesh>
        ))}
        {/* Front Wall Flanking Doorway (lz in [-0.88, +0.88]) */}
        {[-1.5, 1.5].map((fz, i) => (
          <mesh key={i} position={[-1.95, 1.35, fz]}>
            <boxGeometry args={[0.16, 2.55, 1.3]} />
            <meshStandardMaterial color="#38291d" roughness={0.9} />
          </mesh>
        ))}
        {/* Swinging Padlocked Iron Shed Door (Opens Cleanly Once Unlocked With Iron Key) */}
        <group position={[-1.95, 0, -0.85]} rotation={[0, shedUnlocked ? -1.45 : 0, 0]}>
          <mesh position={[0, 1.22, 0.85]}>
            <boxGeometry args={[0.1, 2.32, 1.7]} />
            <meshStandardMaterial color="#3f464d" roughness={0.72} metalness={0.45} />
          </mesh>
          {!shedUnlocked && (
            <mesh position={[-0.08, 1.15, 1.52]}>
              <boxGeometry args={[0.12, 0.18, 0.14]} />
              <meshStandardMaterial color="#c9932c" emissive="#e09f24" emissiveIntensity={0.65} metalness={0.75} />
            </mesh>
          )}
        </group>
        {/* Slanted Rustic Corrugated Zinc Roof */}
        <mesh position={[0, 2.72, 0]} rotation={[0, 0, 0.16]} castShadow>
          <boxGeometry args={[4.9, 0.1, 5.0]} />
          <meshStandardMaterial color="#3a4042" roughness={0.78} metalness={0.35} />
        </mesh>
        <mesh position={[0.45, 0.44, -0.2]} castShadow>
          <boxGeometry args={[0.85, 0.78, 0.85]} />
          <meshStandardMaterial color="#4a3726" roughness={0.88} />
        </mesh>
        {/* Car Component #2: Heavy-Duty Car Battery Cell Inside Shed */}
        {!hasBatteryCell && (
          <group position={[0.45, 0.94, -0.2]}>
            <mesh>
              <boxGeometry args={[0.38, 0.24, 0.24]} />
              <meshStandardMaterial color="#1f252e" emissive="#f0b429" emissiveIntensity={0.38} roughness={0.5} />
            </mesh>
            <pointLight position={[0, 0.55, 0]} color="#ffd57a" intensity={2.4} distance={8} />
          </group>
        )}
      </group>

      {/* 3) Padlocked Wooden Supply Chest on Mossy Wakaf Veranda (Code: 6414) */}
      <group position={[wakaf.x, 0, wakaf.z]} rotation={[0, wakaf.rotY, 0]}>
        <group position={[0.35, 0.58, -1.25]}>
          <mesh position={[0, 0.24, 0]} castShadow>
            <boxGeometry args={[0.95, 0.48, 0.58]} />
            <meshStandardMaterial color="#4a311e" roughness={0.85} />
          </mesh>
          <mesh
            position={[0, chestUnlocked ? 0.62 : 0.5, chestUnlocked ? -0.22 : 0]}
            rotation={[chestUnlocked ? -1.1 : 0, 0, 0]}
          >
            <boxGeometry args={[0.98, 0.1, 0.6]} />
            <meshStandardMaterial color="#593b24" roughness={0.8} />
          </mesh>
          {!chestUnlocked && (
            <mesh position={[0, 0.44, 0.31]}>
              <boxGeometry args={[0.14, 0.16, 0.07]} />
              <meshStandardMaterial color="#d4a63f" emissive="#c9932c" emissiveIntensity={0.55} metalness={0.7} />
            </mesh>
          )}
          <pointLight
            position={[0, 0.9, 0.4]}
            color={chestUnlocked ? '#7cf2a8' : '#ffd175'}
            intensity={1.6}
            distance={6}
          />
        </group>
      </group>
    </group>
  );
}
