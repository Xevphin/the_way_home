// ============================================================================
// src/components/SurauElderNPC.jsx
// The Man in White inside the lantern-lit Kampung Roadside Surau:
// - Peaceful older Malay man wearing a clean white jubah/baju Melayu and
//   white kopiah cap standing quietly beside the prayer mat (sejadah)
// - Exports SURAU_ELDER_DIALOGUE (warm grounding advice on Lembah Batu,
//   sacred light, and always remembering Allah for protection & guidance)
// ============================================================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { LANDMARK_TRANSFORMS } from '../data/midnightLandmarksData';

export const SURAU_ELDER_DIALOGUE = [
  {
    speaker: 'UNCLE (SURAU)',
    text: 'Peace be with you, young man. I heard a heavy crash out on the road—are you alright? What happened to your car?',
  },
  {
    speaker: 'YOU',
    text: "Thank goodness you're here, Uncle... Something stepped right in front of my headlights and the engine died completely. I don't know how I'm getting home.",
  },
  {
    speaker: 'UNCLE (SURAU)',
    text: 'Good heavens... Few people ever make it this deep into Lembah Batu at night. Listen carefully—your car can still make it out if you replace its 3 damaged parts.',
  },
  {
    speaker: 'UNCLE (SURAU)',
    text: "An alternator belt, a battery cell, and a starter relay—they are locked away inside the old valley structures off the forest trails, so search carefully for tools and keys.",
  },
  {
    speaker: 'UNCLE (SURAU)',
    text: 'Stay near sacred light where evil cannot interfere. Always remember God and seek His protection, for He will guide you to the right way.',
  },
  {
    speaker: 'YOU',
    text: "Thank you, Uncle. I'll explore the trails, find those 3 parts, repair the car, and get out of this forest.",
  },
];

export default function SurauElderNPC({ isTalking = false }) {
  const headRef = useRef();
  const bodyRef = useRef();
  const rightArmRef = useRef();
  const { x, z, rotY } = LANDMARK_TRANSFORMS.surau;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bodyRef.current) {
      bodyRef.current.position.y = 0.66 + Math.sin(t * 1.6) * 0.012;
    }
    if (headRef.current) {
      headRef.current.rotation.x = isTalking
        ? Math.sin(t * 4.5) * 0.08
        : Math.sin(t * 1.1) * 0.04;
      headRef.current.rotation.y = Math.sin(t * 0.7) * 0.08;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = isTalking
        ? -0.45 + Math.sin(t * 5.2) * 0.14
        : -0.25;
    }
  });

  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* Positioned on the raised timber Surau deck facing west (-X) toward the steps */}
      <group ref={bodyRef} position={[0.2, 0.66, -0.55]} rotation={[0, -Math.PI / 2, 0]}>
        {/* White Jubah / Baju Melayu Lower Robe */}
        <mesh position={[0, 0.46, 0]} castShadow>
          <cylinderGeometry args={[0.21, 0.27, 0.92, 12]} />
          <meshStandardMaterial color="#f1efe9" roughness={0.85} />
        </mesh>
        {/* White Jubah Upper Torso & Collar */}
        <mesh position={[0, 1.12, 0]} castShadow>
          <boxGeometry args={[0.42, 0.52, 0.24]} />
          <meshStandardMaterial color="#f6f4ee" roughness={0.82} />
        </mesh>
        {/* Soft Woven Kain Pelikat / Waist Sash Accent */}
        <mesh position={[0, 0.88, 0]}>
          <cylinderGeometry args={[0.225, 0.23, 0.14, 12]} />
          <meshStandardMaterial color="#c9bfa8" roughness={0.88} />
        </mesh>
        {/* Left & Right White Sleeves + Hands */}
        <mesh position={[-0.27, 1.06, 0.06]} rotation={[-0.25, 0, 0.08]} castShadow>
          <boxGeometry args={[0.12, 0.46, 0.12]} />
          <meshStandardMaterial color="#f3f1eb" roughness={0.85} />
        </mesh>
        <group ref={rightArmRef} position={[0.27, 1.24, 0]}>
          <mesh position={[0, -0.18, 0.05]} castShadow>
            <boxGeometry args={[0.12, 0.46, 0.12]} />
            <meshStandardMaterial color="#f3f1eb" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.43, 0.06]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color="#c99f7d" roughness={0.75} />
          </mesh>
        </group>

        {/* Head, Gentle Grey Beard & Crisp White Kopiah Cap */}
        <group ref={headRef} position={[0, 1.54, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.155, 14, 14]} />
            <meshStandardMaterial color="#c99f7d" roughness={0.72} />
          </mesh>
          {/* Crisp White Kopiah */}
          <mesh position={[0, 0.095, 0]} castShadow>
            <cylinderGeometry args={[0.152, 0.16, 0.12, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.78} />
          </mesh>
          {/* Gentle Grey Beard */}
          <mesh position={[0, -0.07, 0.11]}>
            <sphereGeometry args={[0.085, 10, 8]} />
            <meshStandardMaterial color="#d2d5d9" roughness={0.92} />
          </mesh>
          {/* Warm Peaceful Eyes */}
          {[-0.05, 0.05].map((ex, i) => (
            <mesh key={i} position={[ex, 0.02, 0.142]}>
              <sphereGeometry args={[0.017, 8, 8]} />
              <meshBasicMaterial color="#1d1814" />
            </mesh>
          ))}
        </group>

        {/* Subtle Soft Warm Aura Highlighting the Man in White */}
        <pointLight position={[0, 1.4, 0.7]} color="#ffe5ad" intensity={2.2} distance={6.5} />
      </group>
    </group>
  );
}
