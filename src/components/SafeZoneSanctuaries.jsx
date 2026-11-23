// ============================================================================
// src/components/SafeZoneSanctuaries.jsx
// Renders the 2 open-sided wooden Kampung Surau / Wakaf Safe Zone pavilions
// with warm golden lantern light spilling naturally across the veranda, steps,
// and surrounding earth (no hard-edged ground ring).
// ============================================================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { SAFE_ZONES } from '../data/objectivesData';

function HangingLantern({ position, intensity = 6.0, distance = 18 }) {
  const lightRef = useRef();
  const groupRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 1.4) * 0.04;
    }
    if (lightRef.current) {
      lightRef.current.intensity = intensity + Math.sin(t * 4.5) * 0.35;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Suspension Chain */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.65, 6]} />
        <meshStandardMaterial color="#3b2c1a" metalness={0.7} />
      </mesh>
      {/* Brass Lantern Cap & Base */}
      <mesh position={[0, 0.14, 0]}>
        <coneGeometry args={[0.22, 0.14, 8]} />
        <meshStandardMaterial color="#594225" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.14, 0.06, 8]} />
        <meshStandardMaterial color="#594225" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Glowing Warm Glass Core */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.15, 0.13, 0.3, 10]} />
        <meshStandardMaterial
          color="#fff4cc"
          emissive="#ffae34"
          emissiveIntensity={3.8}
        />
      </mesh>
      {/* Warm Spilling Golden Light */}
      <pointLight
        ref={lightRef}
        position={[0, -0.1, 0]}
        color="#ffc25c"
        intensity={intensity}
        distance={distance}
        decay={1.7}
      />
    </group>
  );
}

export default function SafeZoneSanctuaries() {
  const surau = SAFE_ZONES[0];
  const wakaf = SAFE_ZONES[1];

  return (
    <group>
      {/* =====================================================================
          SAFE ZONE 1: Open-Sided Kampung Roadside Surau Pavilion (East Clearing)
         ===================================================================== */}
      <group position={surau.position} rotation={[0, surau.rotationY || 0, 0]}>
        {/* No ground disc: only the hanging lantern pointLights warm the earth */}

        {/* Raised Timber Pavilion Platform & Front Wooden Steps */}
        <mesh position={[0.2, 0.32, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.8, 0.64, 6.2]} />
          <meshStandardMaterial color="#422e1e" roughness={0.82} />
        </mesh>
        {/* 2 Ascending Steps Facing the Rural Road (-X) */}
        <mesh position={[-3.05, 0.16, 0]} receiveShadow>
          <boxGeometry args={[0.7, 0.32, 2.5]} />
          <meshStandardMaterial color="#4d3623" roughness={0.85} />
        </mesh>
        <mesh position={[-3.55, 0.08, 0]} receiveShadow>
          <boxGeometry args={[0.55, 0.16, 2.5]} />
          <meshStandardMaterial color="#3c2a1b" roughness={0.85} />
        </mesh>

        {/* Low Wooden Veranda Balustrade Railings (Open-Sided Airy Feel) */}
        {[-2.85, 2.85].map((zOff, i) => (
          <mesh key={i} position={[0.2, 1.05, zOff]} castShadow>
            <boxGeometry args={[5.4, 0.12, 0.14]} />
            <meshStandardMaterial color="#593f29" roughness={0.75} />
          </mesh>
        ))}

        {/* Rear Lattice Timber Wall & Warm Prayer Carpet (Sejadah) */}
        <mesh position={[2.85, 1.85, 0]} castShadow>
          <boxGeometry args={[0.18, 2.5, 5.4]} />
          <meshStandardMaterial color="#4d3623" roughness={0.8} />
        </mesh>
        <mesh position={[0.6, 0.66, 0]}>
          <boxGeometry args={[3.4, 0.04, 4.4]} />
          <meshStandardMaterial color="#1d4d38" roughness={0.9} />
        </mesh>

        {/* 6 Carved Wooden Support Pillars */}
        {[
          [-2.4, 1.95, -2.8],
          [-2.4, 1.95, 2.8],
          [-2.4, 1.95, -1.25],
          [-2.4, 1.95, 1.25],
          [2.7, 1.95, -2.8],
          [2.7, 1.95, 2.8],
        ].map((p, idx) => (
          <mesh key={idx} position={p} castShadow>
            <boxGeometry args={[0.22, 2.9, 0.22]} />
            <meshStandardMaterial color="#362417" roughness={0.8} />
          </mesh>
        ))}

        {/* Two-Tier Traditional Kampung Pitched Roof & Golden Finial */}
        <mesh position={[0.2, 3.95, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[5.2, 1.5, 4]} />
          <meshStandardMaterial color="#25332b" roughness={0.7} />
        </mesh>
        <mesh position={[0.2, 4.95, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[2.6, 1.15, 4]} />
          <meshStandardMaterial color="#1e2b24" roughness={0.68} />
        </mesh>
        <mesh position={[0.2, 5.75, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.65, 8]} />
          <meshStandardMaterial color="#e6bf55" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Warm Hanging Golden Lanterns Spilling Light Onto Road & Steps */}
        <HangingLantern position={[0.1, 2.95, 0]} intensity={7.5} distance={20} />
        <HangingLantern position={[-2.2, 2.75, 0]} intensity={4.8} distance={15} />
      </group>

      {/* =====================================================================
          SAFE ZONE 2: Open-Sided Wayfarer Wakaf Pavilion (Deep East Clearing)
         ===================================================================== */}
      <group position={wakaf.position} rotation={[0, wakaf.rotationY || Math.PI, 0]}>

        {/* Raised Wakaf Deck & Steps Facing East Toward the Road (+X) */}
        <mesh position={[0, 0.28, 0]} receiveShadow castShadow>
          <boxGeometry args={[4.6, 0.56, 4.6]} />
          <meshStandardMaterial color="#402d1d" roughness={0.85} />
        </mesh>
        <mesh position={[2.6, 0.14, 0]} receiveShadow>
          <boxGeometry args={[0.65, 0.28, 2.2]} />
          <meshStandardMaterial color="#4c3623" roughness={0.85} />
        </mesh>

        {/* 4 Corner Timber Pillars */}
        {[
          [-1.95, 1.85, -1.95],
          [1.95, 1.85, -1.95],
          [-1.95, 1.85, 1.95],
          [1.95, 1.85, 1.95],
        ].map((p, idx) => (
          <mesh key={idx} position={p} castShadow>
            <boxGeometry args={[0.24, 2.8, 0.24]} />
            <meshStandardMaterial color="#382518" roughness={0.8} />
          </mesh>
        ))}

        {/* Wooden Resting Bench & Pitched Kampung Roof */}
        <mesh position={[-1.0, 0.86, 0]} castShadow>
          <boxGeometry args={[1.05, 0.14, 3.2]} />
          <meshStandardMaterial color="#5c402a" roughness={0.78} />
        </mesh>
        <mesh position={[0, 3.85, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[4.1, 1.65, 4]} />
          <meshStandardMaterial color="#2a211b" roughness={0.72} />
        </mesh>

        {/* Warm Hanging Center Lantern */}
        <HangingLantern position={[0, 2.85, 0]} intensity={7.2} distance={19} />
      </group>
    </group>
  );
}
