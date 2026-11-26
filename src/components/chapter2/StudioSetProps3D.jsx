// ============================================================================
// src/components/chapter2/StudioSetProps3D.jsx
// Brightly lit indoor film soundstage / movie studio environment:
// - Concrete stage floor, acoustic walls, overhead lighting trusses & softboxes
// - Standalone wooden door prop with A-frame braces on the studio floor
// - Camera dolly on steel tracks, Director's playback monitor village,
//   cast lounge couch + gaming TV, craft services coffee station & Exit door
// ============================================================================

import React, { useMemo } from 'react';
import * as THREE from 'three';

function makeExitSignTex() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0f3d26';
  ctx.fillRect(0, 0, 256, 64);
  ctx.strokeStyle = '#6ee7b7';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 56);
  ctx.fillStyle = '#ecfdf5';
  ctx.font = 'bold 26px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT • WRAP', 128, 42);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export default function StudioSetProps3D() {
  const exitTex = useMemo(() => makeExitSignTex(), []);

  return (
    <group>
      {/* Soundstage Concrete Floor & High Acoustic Studio Walls (28m x 28m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color="#484d56" roughness={0.78} />
      </mesh>
      {/* Yellow gaffer-tape stage floor boundary marks */}
      {[-6.5, 6.5].map((xPos, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[xPos, 0.01, 0]}>
          <planeGeometry args={[0.12, 16]} />
          <meshBasicMaterial color="#e6b83c" />
        </mesh>
      ))}

      {/* Studio Perimeter Walls & Ceiling */}
      {[
        { pos: [0, 4.5, -14], args: [28, 9, 0.4] },
        { pos: [0, 4.5, 14], args: [28, 9, 0.4] },
        { pos: [-14, 4.5, 0], args: [0.4, 9, 28] },
        { pos: [14, 4.5, 0], args: [0.4, 9, 28] },
      ].map((w, i) => (
        <mesh key={i} position={w.pos} receiveShadow>
          <boxGeometry args={w.args} />
          <meshStandardMaterial color="#2c3038" roughness={0.92} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 9, 0]}>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color="#1f2329" roughness={0.95} />
      </mesh>

      {/* Overhead Aluminum Lighting Trusses & Glowing Studio Softboxes */}
      {[-6, 0, 6].map((tz, i) => (
        <group key={i} position={[0, 7.2, tz]}>
          <mesh>
            <boxGeometry args={[24, 0.24, 0.24]} />
            <meshStandardMaterial color="#8c96a6" metalness={0.75} roughness={0.35} />
          </mesh>
          {[-7, 0, 7].map((lx, j) => (
            <group key={j} position={[lx, -0.42, 0]}>
              <mesh>
                <boxGeometry args={[1.4, 0.35, 0.9]} />
                <meshStandardMaterial color="#1c2026" roughness={0.6} />
              </mesh>
              <mesh position={[0, -0.19, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.25, 0.78]} />
                <meshBasicMaterial color="#fff8e8" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Standalone Wooden Door Prop Standing on the Studio Floor (With Back Braces!) */}
      <group position={[0, 0, 5.0]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[1.55, 3.0, 0.18]} />
          <meshStandardMaterial color="#2a1c14" roughness={0.85} />
        </mesh>
        {/* Open door leaf swung slightly inward */}
        <mesh position={[-0.62, 1.48, -0.58]} rotation={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[1.28, 2.78, 0.1]} />
          <meshStandardMaterial color="#422a1c" roughness={0.8} />
        </mesh>
        {/* Wooden A-frame stage braces holding the prop upright */}
        {[-0.72, 0.72].map((bx, i) => (
          <mesh key={i} position={[bx, 0.95, 0.72]} rotation={[-0.52, 0, 0]}>
            <boxGeometry args={[0.1, 2.2, 0.1]} />
            <meshStandardMaterial color="#9c7b4f" roughness={0.85} />
          </mesh>
        ))}
      </group>

      {/* Camera Dolly on Steel Tracks (West-Center) */}
      <group position={[-5.3, 0, 0.2]}>
        {[-0.45, 0.45].map((rx, i) => (
          <mesh key={i} position={[rx, 0.04, 0]}>
            <boxGeometry args={[0.06, 0.06, 7.6]} />
            <meshStandardMaterial color="#a6b0bf" metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[1.15, 0.18, 1.65]} />
          <meshStandardMaterial color="#1f242c" roughness={0.6} />
        </mesh>
        {/* Cinema Camera Pedestal & Matte Box */}
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 1.3, 10]} />
          <meshStandardMaterial color="#2c333d" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.62, 0.15]} rotation={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.38, 0.32, 0.65]} />
          <meshStandardMaterial color="#14171c" roughness={0.5} />
        </mesh>
      </group>

      {/* Director's Playback Monitor Village (Center) */}
      <group position={[0, 0, -4.3]}>
        <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.96, 1.2]} />
          <meshStandardMaterial color="#252a33" roughness={0.75} />
        </mesh>
        {[-0.85, 0.85].map((mx, i) => (
          <group key={i} position={[mx, 1.32, -0.1]}>
            <mesh>
              <boxGeometry args={[1.15, 0.72, 0.12]} />
              <meshStandardMaterial color="#111318" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.07]}>
              <planeGeometry args={[1.02, 0.58]} />
              <meshBasicMaterial color={i === 0 ? '#3a556e' : '#5e2e36'} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Cast Lounge Couch + Glowing Gaming TV (West-North Corner) */}
      <group position={[-9.0, 0, -8.8]}>
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 0.52, 1.2]} />
          <meshStandardMaterial color="#3c4f6b" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.88, 0.48]} castShadow>
          <boxGeometry args={[4.2, 0.72, 0.24]} />
          <meshStandardMaterial color="#32435c" roughness={0.85} />
        </mesh>
      </group>
      <group position={[-9.0, 0, -12.0]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[2.6, 0.7, 0.7]} />
          <meshStandardMaterial color="#23272e" roughness={0.75} />
        </mesh>
        <mesh position={[0, 1.22, 0]}>
          <boxGeometry args={[2.1, 1.15, 0.1]} />
          <meshStandardMaterial color="#0f1217" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.22, 0.06]}>
          <planeGeometry args={[1.95, 1.02]} />
          <meshBasicMaterial color="#4da3ff" />
        </mesh>
      </group>

      {/* Craft Services Coffee Station (East-North Corner) */}
      <group position={[9.4, 0, -8.4]}>
        <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.96, 1.3]} />
          <meshStandardMaterial color="#59402e" roughness={0.78} />
        </mesh>
        {/* Silver Coffee Urn & Paper Cup Stack */}
        <mesh position={[-0.75, 1.22, 0]}>
          <cylinderGeometry args={[0.2, 0.22, 0.56, 14]} />
          <meshStandardMaterial color="#d4dce6" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0.45, 1.08, 0.15]}>
          <cylinderGeometry args={[0.07, 0.055, 0.22, 10]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
      </group>

      {/* Studio Exit / Continue Door on North Wall */}
      <group position={[0, 0, -13.75]}>
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[1.6, 2.8, 0.16]} />
          <meshStandardMaterial color="#3c4654" roughness={0.65} metalness={0.35} />
        </mesh>
        <mesh position={[0, 3.15, 0.06]}>
          <planeGeometry args={[1.35, 0.34]} />
          <meshBasicMaterial map={exitTex} />
        </mesh>
      </group>
    </group>
  );
}
