// ============================================================================
// src/components/JinnFlashback3D.jsx
// Ethereal night flashback to the Kampung Roadside Surau:
// - Warm lantern glow shifts subtly into an otherworldly luminous cyan-gold
//   celestial aura around the silent white-robed figure
// - Floating light motes rise softly, revealing the benevolent Muslim jinn
//   who watched over and shielded the player all night!
// ============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function JinnFlashback3D() {
  const auraLightRef = useRef();
  const haloRef = useRef();
  const motesRef = useRef();
  const shiftRef = useRef(0);

  const motes = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        angle: (i / 24) * Math.PI * 2,
        radius: 0.75 + (i % 4) * 0.36,
        yOff: (i % 7) * 0.42,
        speed: 0.45 + (i % 5) * 0.14,
      })),
    []
  );

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.06);
    const t = clock.getElapsedTime();
    shiftRef.current = Math.min(1, shiftRef.current + dt * 0.34);
    const s = shiftRef.current;

    if (auraLightRef.current) {
      auraLightRef.current.color.lerpColors(
        new THREE.Color('#ffcb77'),
        new THREE.Color('#b6f4ff'),
        s
      );
      auraLightRef.current.intensity = 9 + s * 9 + Math.sin(t * 4.5) * 1.4;
    }

    if (haloRef.current) {
      const pulse = 1 + Math.sin(t * 3.2) * 0.06;
      haloRef.current.scale.set(pulse, pulse, pulse);
      haloRef.current.material.opacity = 0.14 + s * 0.24;
    }

    if (motesRef.current) {
      motesRef.current.children.forEach((m, idx) => {
        const cfg = motes[idx];
        const ang = cfg.angle + t * cfg.speed;
        const y = ((cfg.yOff + t * 0.35) % 2.9) + 0.3;
        m.position.set(Math.cos(ang) * cfg.radius, y, Math.sin(ang) * cfg.radius);
      });
    }
  });

  return (
    <group>
      <color attach="background" args={['#040a12']} />
      <fog attach="fog" args={['#06101c', 4, 24]} />
      <ambientLight intensity={0.28} color="#476a8a" />

      {/* Ground & Timber Surau Deck */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[48, 48]} />
        <meshStandardMaterial color="#0b120e" roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[5.8, 0.44, 5.2]} />
        <meshStandardMaterial color="#4e3422" roughness={0.86} />
      </mesh>

      {/* 6 Carved Timber Surau Pillars & Pitched Roof */}
      {[-2.4, 0, 2.4].flatMap((px) =>
        [-2.1, 2.1].map((pz) => (
          <mesh key={`${px}_${pz}`} position={[px, 1.85, pz]}>
            <cylinderGeometry args={[0.1, 0.12, 3.3, 8]} />
            <meshStandardMaterial color="#3c2516" roughness={0.85} />
          </mesh>
        ))
      )}
      <mesh position={[0, 4.1, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[4.4, 1.8, 4]} />
        <meshStandardMaterial color="#2b1b12" roughness={0.9} />
      </mesh>

      {/* Shifting Warm-to-Ethereal Lantern Light */}
      <pointLight ref={auraLightRef} position={[0, 2.85, 0.4]} color="#ffcb77" intensity={10} distance={22} />

      {/* Silent Luminous White-Robed Figure (Benevolent Muslim Jinn) */}
      <group position={[0, 0.44, -0.35]}>
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.24, 0.35, 1.44, 12]} />
          <meshStandardMaterial
            color="#f6fbff"
            emissive="#bfefff"
            emissiveIntensity={0.48}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0, 1.42, 0]}>
          <boxGeometry args={[0.46, 0.44, 0.24]} />
          <meshStandardMaterial color="#f6fbff" emissive="#bfefff" emissiveIntensity={0.48} />
        </mesh>
        <mesh position={[0, 1.74, 0]}>
          <sphereGeometry args={[0.14, 14, 14]} />
          <meshStandardMaterial color="#e8eef5" emissive="#d0f4ff" emissiveIntensity={0.55} />
        </mesh>
        <mesh position={[0, 1.86, 0]}>
          <cylinderGeometry args={[0.135, 0.145, 0.11, 14]} />
          <meshStandardMaterial color="#ffffff" emissive="#e8f9ff" emissiveIntensity={0.6} />
        </mesh>
        {/* Ethereal Radiant Aura Shell */}
        <mesh ref={haloRef} position={[0, 1.25, 0]}>
          <sphereGeometry args={[1.38, 24, 18]} />
          <meshBasicMaterial color="#c2f5ff" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      </group>

      {/* Rising Celestial Light Motes */}
      <group ref={motesRef} position={[0, 0.44, -0.35]}>
        {motes.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color={i % 2 === 0 ? '#fff2b8' : '#b8f3ff'} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
