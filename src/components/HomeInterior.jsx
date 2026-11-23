// ============================================================================
// src/components/HomeInterior.jsx
// Cozy, brightly lit multi-room morning home interior (bedroom, hallway,
// kitchen nook, living room, sunlit windows with curtains, swinging front
// door, and sunlit exterior porch/yard).
// ============================================================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import HomeProps3D from './HomeProps3D';
import MorningExteriorDriveway from './MorningExteriorDriveway';
import ModelAsset from './ModelAsset';
import { MODELS } from '../data/modelCatalog';

export default function HomeInterior({
  completedChores = [],
  doorOpen = false,
  doorKnocked = false,
  canExitHouse = false,
}) {
  const doorPivotRef = useRef();
  const doorBeaconRef = useRef();

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.1);
    // Smoothly swing front door open inward toward the living room wall
    if (doorPivotRef.current) {
      const targetRot = doorOpen ? Math.PI * 0.52 : 0;
      doorPivotRef.current.rotation.y +=
        (targetRot - doorPivotRef.current.rotation.y) * Math.min(1, dt * 4.5);
    }
    if (doorBeaconRef.current) {
      const t = clock.getElapsedTime();
      doorBeaconRef.current.position.y = 1.55 + Math.sin(t * 3.5) * 0.07;
      doorBeaconRef.current.rotation.y = t * 1.8;
    }
  });

  return (
    <group>
      {/* Bright Sunlit Morning Interior Lighting + Soft Rim Fill */}
      <ambientLight intensity={0.78} color="#fff7ea" />
      <hemisphereLight args={['#c8e4ff', '#87a86b', 0.52]} />
      <directionalLight
        position={[10, 14, 15]}
        intensity={1.75}
        color="#ffefd1"
        castShadow
      />
      <directionalLight position={[-12, 8, -10]} intensity={0.42} color="#cfe5ff" />
      {/* Cozy Interior Room Fill Lights */}
      <pointLight position={[-3.4, 2.75, 3.6]} color="#ffe9c2" intensity={3.2} distance={11} />
      <pointLight position={[-3.0, 2.75, -3.2]} color="#fff5e0" intensity={2.8} distance={10} />
      <pointLight position={[3.4, 2.75, 1.5]} color="#fff0d4" intensity={3.4} distance={12} />
      <pointLight position={[3.2, 2.6, -7.8]} color="#fff5d6" intensity={4.0} distance={14} />

      {/* Warm Polished Honey-Oak Hardwood Floor (Subtle Specular Sheen) & Ceiling */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[13.0, 12.0]} />
        <meshStandardMaterial color="#b38860" roughness={0.44} metalness={0.08} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.2, 0]}>
        <planeGeometry args={[13.0, 12.0]} />
        <meshStandardMaterial color="#f7f2ea" roughness={0.92} />
      </mesh>

      {/* Perimeter Walls (Warm Cream Plaster) */}
      {/* West Wall */}
      <mesh position={[-6.5, 1.6, 0]} receiveShadow>
        <boxGeometry args={[0.18, 3.2, 12.0]} />
        <meshStandardMaterial color="#efe5d8" roughness={0.88} />
      </mesh>
      {/* East Wall */}
      <mesh position={[6.5, 1.6, 0]} receiveShadow>
        <boxGeometry args={[0.18, 3.2, 12.0]} />
        <meshStandardMaterial color="#efe5d8" roughness={0.88} />
      </mesh>
      {/* South Wall */}
      <mesh position={[0, 1.6, 6.0]} receiveShadow>
        <boxGeometry args={[13.0, 3.2, 0.18]} />
        <meshStandardMaterial color="#ece1d3" roughness={0.88} />
      </mesh>

      {/* North Wall Split Around Front Door Opening (x in [2.55, 3.85], height 2.35m) */}
      <mesh position={[-1.98, 1.6, -6.0]} receiveShadow>
        <boxGeometry args={[9.06, 3.2, 0.18]} />
        <meshStandardMaterial color="#efe5d8" roughness={0.88} />
      </mesh>
      <mesh position={[5.18, 1.6, -6.0]} receiveShadow>
        <boxGeometry args={[2.66, 3.2, 0.18]} />
        <meshStandardMaterial color="#efe5d8" roughness={0.88} />
      </mesh>
      <mesh position={[3.2, 2.78, -6.0]}>
        <boxGeometry args={[1.34, 0.86, 0.18]} />
        <meshStandardMaterial color="#efe5d8" roughness={0.88} />
      </mesh>

      {/* Bedroom Partition Walls (with Wide 2.3m Open Doorway at x = -0.5, z in [0, 2.3]) */}
      <mesh position={[-3.5, 1.6, 0.0]} receiveShadow>
        <boxGeometry args={[6.0, 3.2, 0.16]} />
        <meshStandardMaterial color="#e8dccb" roughness={0.88} />
      </mesh>
      <mesh position={[-0.5, 1.6, 4.15]} receiveShadow>
        <boxGeometry args={[0.16, 3.2, 3.7]} />
        <meshStandardMaterial color="#e8dccb" roughness={0.88} />
      </mesh>

      {/* Sunlit Bedroom Window + Translucent Curtains + Morning Sunbeam Glow */}
      <group position={[-3.4, 1.7, 5.88]}>
        <mesh>
          <planeGeometry args={[2.3, 1.55]} />
          <meshBasicMaterial color="#fff8e3" />
        </mesh>
        {/* Flowing Translucent Morning Curtains */}
        {[-1.08, 1.08].map((cx, i) => (
          <mesh key={i} position={[cx, -0.15, -0.08]}>
            <boxGeometry args={[0.52, 2.0, 0.08]} />
            <meshStandardMaterial
              color="#fffaf0"
              transparent
              opacity={0.82}
              roughness={0.9}
            />
          </mesh>
        ))}
        {/* Warm Morning Sunlight Pool on Bedroom Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.68, -1.45]}>
          <planeGeometry args={[2.4, 2.2]} />
          <meshBasicMaterial color="#ffe8a6" transparent opacity={0.22} depthWrite={false} />
        </mesh>
      </group>

      {/* Exterior Front Yard, Driveway & Parked Car (for Sprint 2 transition) */}
      <MorningExteriorDriveway showCarBeacon={canExitHouse} />

      {/* Wooden Doorframe Trim (Seals Hinge & Latch Flush with Zero Sliver) */}
      {[2.54, 3.86].map((fx, i) => (
        <mesh key={i} position={[fx, 1.19, -5.95]}>
          <boxGeometry args={[0.12, 2.4, 0.24]} />
          <meshStandardMaterial color="#593822" roughness={0.75} />
        </mesh>
      ))}
      <mesh position={[3.2, 2.38, -5.95]}>
        <boxGeometry args={[1.44, 0.12, 0.24]} />
        <meshStandardMaterial color="#593822" roughness={0.75} />
      </mesh>

      {/* Swinging Wooden Front Door (Hinge at x = 2.55, z = -5.94) */}
      <group position={[2.55, 0, -5.94]} ref={doorPivotRef}>
        <mesh position={[0.65, 1.18, 0]} castShadow>
          <boxGeometry args={[1.32, 2.36, 0.09]} />
          <meshStandardMaterial color="#6e472b" roughness={0.7} />
        </mesh>
        {/* Brass Door Handle */}
        <mesh position={[1.12, 1.06, 0.07]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color="#e6be5c" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* Sunlit Exterior Wooden Front Porch & Morning Lawn Outside Front Door */}
      <group position={[3.2, 0, -8.2]}>
        <mesh position={[0, -0.04, 0]} receiveShadow>
          <boxGeometry args={[7.2, 0.14, 4.4]} />
          <meshStandardMaterial color="#9c734e" roughness={0.82} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.14, -6.5]} receiveShadow>
          <planeGeometry args={[46, 28]} />
          <meshStandardMaterial color="#5f8f4d" roughness={0.95} />
        </mesh>
        {/* Porch Roof & Corner Columns */}
        {[-3.1, 3.1].map((px, i) => (
          <mesh key={i} position={[px, 1.55, -1.9]} castShadow>
            <boxGeometry args={[0.2, 3.1, 0.2]} />
            <meshStandardMaterial color="#f4eee6" roughness={0.8} />
          </mesh>
        ))}
        {/* Real Kenney Oak Trees in the Front Yard */}
        {[-5.5, 5.2, -1.2, 7.8].map((tx, i) => (
          <ModelAsset
            key={i}
            url={i % 2 === 0 ? MODELS.oakTree : MODELS.detailedTree}
            position={[tx, -0.14, -8.2 - (i % 2) * 2.5]}
            targetHeight={5.4}
          />
        ))}
      </group>

      {/* Cozy Furniture, Bedside 08:15 AM Clock & 3 Chore Items */}
      <HomeProps3D completedChores={completedChores} />
    </group>
  );
}
