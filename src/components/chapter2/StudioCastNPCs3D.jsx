// ============================================================================
// src/components/chapter2/StudioCastNPCs3D.jsx
// Lively behind-the-scenes cast & crew inside Chapter 2's Movie Studio:
// - Director by the playback monitor village + 2 Cameramen on dolly tracks
// - Lurker Actor (still wearing full tattered black shroud!) gaming on couch
//   with Amir & Hafiz
// - Uncle / Ustaz matching Chapter 1's SurauElderNPC (white jubah, kopiah,
//   grey mustache & beard) with coffee mug parented directly in his right hand!
// ============================================================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import ArticulatedCharacter from '../shared/ArticulatedCharacter';
import ShadowStalkerModel from '../shared/ShadowStalkerModel';

function StudioUncleNPC({ uncleDapping }) {
  const rightArmRef = useRef();
  const leftArmRef = useRef();
  const steamRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Right arm holds steaming coffee mug calmly with natural slight sipping sway
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -0.82 + Math.sin(t * 1.4) * 0.08;
    }
    // Left arm raises forward for the bro dap-up when interacted with
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = uncleDapping
        ? -0.95 + Math.sin(t * 8.0) * 0.12
        : -0.18 + Math.sin(t * 1.1) * 0.04;
    }
    if (steamRef.current) {
      const cycle = (t * 0.35) % 0.28;
      steamRef.current.position.y = 0.14 + cycle;
      steamRef.current.material.opacity = 0.45 * (1 - cycle / 0.28);
    }
  });

  return (
    <group position={[8.4, 0, -6.5]} rotation={[0, -0.85, 0]}>
      {/* Matching Chapter 1 SurauElderNPC: White Jubah / Baju Melayu + Kain Pelikat Sash */}
      <mesh position={[0, 0.46, 0]} castShadow>
        <cylinderGeometry args={[0.21, 0.27, 0.92, 12]} />
        <meshStandardMaterial color="#f1efe9" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.12, 0]} castShadow>
        <boxGeometry args={[0.42, 0.52, 0.24]} />
        <meshStandardMaterial color="#f6f4ee" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.225, 0.23, 0.14, 12]} />
        <meshStandardMaterial color="#c9bfa8" roughness={0.88} />
      </mesh>

      {/* Elder Head + White Kopiah Cap + Grey Mustache & Trimmed Beard */}
      <group position={[0, 1.56, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.145, 14, 14]} />
          <meshStandardMaterial color="#c89a72" roughness={0.78} />
        </mesh>
        {/* White Kopiah Cap */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.135, 0.142, 0.11, 14]} />
          <meshStandardMaterial color="#f5f3ee" roughness={0.82} />
        </mesh>
        {/* Calm Eyes */}
        {[-0.048, 0.048].map((ex, i) => (
          <mesh key={i} position={[ex, 0.02, 0.13]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#1f1b18" />
          </mesh>
        ))}
        {/* Silver-Grey Mustache & Beard */}
        <mesh position={[0, -0.04, 0.136]}>
          <boxGeometry args={[0.085, 0.022, 0.025]} />
          <meshStandardMaterial color="#d1d5db" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.095, 0.118]}>
          <boxGeometry args={[0.11, 0.075, 0.055]} />
          <meshStandardMaterial color="#d1d5db" roughness={0.92} />
        </mesh>
      </group>

      {/* Left Arm (Raises for Bro Dap-Up!) */}
      <group ref={leftArmRef} position={[-0.27, 1.28, 0]}>
        <mesh position={[0, -0.2, 0.03]} castShadow>
          <boxGeometry args={[0.12, 0.44, 0.12]} />
          <meshStandardMaterial color="#f3f1eb" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.44, 0.04]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial color="#c89a72" roughness={0.78} />
        </mesh>
      </group>

      {/* Right Arm + Hand Group — Coffee Mug Parented Directly Inside Hand (Zero Floating!) */}
      <group ref={rightArmRef} position={[0.27, 1.28, 0]}>
        <mesh position={[0, -0.2, 0.03]} castShadow>
          <boxGeometry args={[0.12, 0.44, 0.12]} />
          <meshStandardMaterial color="#f3f1eb" roughness={0.85} />
        </mesh>
        <group position={[0, -0.44, 0.05]}>
          <mesh>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color="#c89a72" roughness={0.78} />
          </mesh>
          {/* Ceramic Coffee Mug Held Directly in Hand */}
          <group position={[0, 0.02, 0.07]} rotation={[0.82, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.052, 0.045, 0.13, 12]} />
              <meshStandardMaterial color="#d97736" roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.044, 10]} />
              <meshStandardMaterial color="#2b190f" roughness={0.25} />
            </mesh>
            <mesh ref={steamRef} position={[0, 0.14, 0]}>
              <sphereGeometry args={[0.038, 8, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.38} depthWrite={false} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

export default function StudioCastNPCs3D({ directorTalking = false, uncleDapping = false }) {
  const camCrewRef = useRef();
  const lurkerGameRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (camCrewRef.current) {
      camCrewRef.current.rotation.y = 0.65 + Math.sin(t * 0.85) * 0.22;
    }
    if (lurkerGameRef.current) {
      lurkerGameRef.current.rotation.z = Math.sin(t * 5.2) * 0.04;
    }
  });

  return (
    <group>
      {/* Director Chatting at Video Village Playback Monitors */}
      <group position={[0.0, 0, -2.9]}>
        <ArticulatedCharacter
          shirtColor="#232833"
          sleeveColor="#1d222c"
          pantsColor="#383e4a"
          isTalking={directorTalking}
          isWaving={directorTalking}
        />
      </group>

      {/* Cameraman #1 & #2 */}
      <group ref={camCrewRef} position={[-5.1, 0, 1.35]} rotation={[0, 0.65, 0]}>
        <ArticulatedCharacter shirtColor="#374151" sleeveColor="#2b3340" pantsColor="#1f2937" />
      </group>
      <group position={[5.6, 0, 1.2]} rotation={[0, -1.1, 0]}>
        <ArticulatedCharacter shirtColor="#3f4a5c" sleeveColor="#313b4a" pantsColor="#232832" isTalking />
      </group>

      {/* Cast Gaming Lounge: Lurker Actor (Still in Full Tattered Shroud!) + Amir & Hafiz */}
      <group position={[-9.0, -0.35, -8.7]} rotation={[0, Math.PI, 0]}>
        <group ref={lurkerGameRef} scale={[0.72, 0.62, 0.72]}>
          <ShadowStalkerModel eyeColor="#ffffff" eyeScale={0.75} />
        </group>
        <mesh position={[0, 0.82, 0.38]}>
          <boxGeometry args={[0.26, 0.07, 0.14]} />
          <meshStandardMaterial color="#181c24" emissive="#38bdf8" emissiveIntensity={0.85} />
        </mesh>
      </group>

      <group position={[-10.3, -0.28, -8.6]} rotation={[0, Math.PI - 0.18, 0]}>
        <ArticulatedCharacter shirtColor="#c45c3e" sleeveColor="#b55135" pantsColor="#2b3d54" isTalking />
      </group>
      <group position={[-7.7, -0.28, -8.6]} rotation={[0, Math.PI + 0.18, 0]}>
        <ArticulatedCharacter shirtColor="#3e7859" sleeveColor="#34664b" pantsColor="#2c3442" isTalking />
      </group>

      {/* Chapter 1 Elder Uncle / Ustaz Holding Steaming Mug in Hand */}
      <StudioUncleNPC uncleDapping={uncleDapping} />
    </group>
  );
}
