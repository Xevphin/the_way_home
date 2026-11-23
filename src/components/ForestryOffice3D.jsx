// ============================================================================
// src/components/ForestryOffice3D.jsx
// Abandoned Forestry / Contractor Site Office at [-8.8, 0, -92.0]:
// - Weathered concrete & timber structure with open east doorway facing road
// - Broken louvered side window looking out toward the dark pine treeline
// - Peeling official notice/memo paper pinned to the back interior wall
// - Flickering dim fluorescent ceiling lamp & animated shadow figure darting
//   past the outside window when the player turns to leave after reading!
// ============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LANDMARK_TRANSFORMS } from '../data/midnightLandmarksData';

function makeMemoWallTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 320;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#dfd5be';
  ctx.fillRect(0, 0, 256, 320);
  ctx.fillStyle = '#2c2924';
  ctx.fillRect(18, 22, 220, 14);
  ctx.fillStyle = '#8c2323';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('INTERNAL MEMO #312', 22, 62);
  ctx.fillStyle = '#38342d';
  for (let y = 86; y < 270; y += 16) {
    ctx.fillRect(22, y, 165 + ((y * 19) % 45), 6);
  }
  ctx.strokeStyle = '#9e2626';
  ctx.lineWidth = 4;
  ctx.strokeRect(130, 220, 96, 44);
  ctx.fillStyle = '#9e2626';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('ILLEGAL', 148, 248);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

export default function ForestryOffice3D({
  memoRead = false,
  hasCodeNote = false,
  windowScareActive = false,
}) {
  const tubeLightRef = useRef();
  const shadowPassRef = useRef();
  const scareProgressRef = useRef(0);
  const memoTex = useMemo(() => makeMemoWallTexture(), []);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    if (tubeLightRef.current) {
      const glitch = Math.sin(t * 23) > 0.86 || Math.sin(t * 7.3) > 0.92;
      tubeLightRef.current.intensity = glitch ? 0.35 : 3.4;
    }
    if (shadowPassRef.current) {
      if (windowScareActive && scareProgressRef.current < 1) {
        scareProgressRef.current = Math.min(1, scareProgressRef.current + delta * 1.45);
        shadowPassRef.current.visible = true;
        shadowPassRef.current.position.x = THREE.MathUtils.lerp(-2.8, 2.8, scareProgressRef.current);
      } else if (!windowScareActive) {
        scareProgressRef.current = 0;
        shadowPassRef.current.visible = false;
      } else {
        shadowPassRef.current.visible = false;
      }
    }
  });

  const { x, z, rotY } = LANDMARK_TRANSFORMS.forestryOffice;
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* Concrete Slab Floor & Weathered Roof */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[5.4, 0.12, 6.6]} />
        <meshStandardMaterial color="#303338" roughness={0.92} />
      </mesh>
      <mesh position={[0, 3.15, 0]} castShadow>
        <boxGeometry args={[5.8, 0.2, 7.0]} />
        <meshStandardMaterial color="#25282d" roughness={0.88} />
      </mesh>

      {/* Back Wall (West) */}
      <mesh position={[-2.5, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.24, 3.05, 6.4]} />
        <meshStandardMaterial color="#42464b" roughness={0.9} />
      </mesh>

      {/* North Wall With Wide Broken Window Opening Looking Out Into Dark Pine Trees */}
      <mesh position={[0, 0.55, -3.1]} castShadow>
        <boxGeometry args={[5.2, 1.1, 0.24]} />
        <meshStandardMaterial color="#404449" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.75, -3.1]} castShadow>
        <boxGeometry args={[5.2, 0.72, 0.24]} />
        <meshStandardMaterial color="#404449" roughness={0.9} />
      </mesh>
      {[-1.9, 1.9].map((wx, i) => (
        <mesh key={i} position={[wx, 1.75, -3.1]}>
          <boxGeometry args={[1.4, 1.35, 0.24]} />
          <meshStandardMaterial color="#404449" roughness={0.9} />
        </mesh>
      ))}

      {/* South Wall */}
      <mesh position={[0, 1.6, 3.1]} castShadow>
        <boxGeometry args={[5.2, 3.05, 0.24]} />
        <meshStandardMaterial color="#3d4147" roughness={0.9} />
      </mesh>

      {/* Front Wall (East, Facing Route 312) With Wide Open Doorway (z in [-1.1, +1.1]) */}
      {[-2.1, 2.1].map((fz, i) => (
        <mesh key={i} position={[2.5, 1.6, fz]} castShadow>
          <boxGeometry args={[0.24, 3.05, 2.2]} />
          <meshStandardMaterial color="#464b52" roughness={0.88} />
        </mesh>
      ))}
      <mesh position={[2.5, 2.76, 0]}>
        <boxGeometry args={[0.24, 0.72, 2.2]} />
        <meshStandardMaterial color="#464b52" roughness={0.88} />
      </mesh>
      {/* Faded Exterior Sign Plaque & Dim Fluorescent Breadcrumb Spill Onto Dirt Turnoff */}
      <mesh position={[2.65, 2.65, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.3, 0.44]} />
        <meshStandardMaterial color="#2a362e" roughness={0.85} />
      </mesh>
      <mesh position={[2.66, 2.38, 0]}>
        <boxGeometry args={[0.08, 0.08, 0.95]} />
        <meshBasicMaterial color="#c9f0d8" />
      </mesh>
      <pointLight position={[4.2, 2.45, 0]} color="#b4e2c7" intensity={3.6} distance={20} />

      {/* Peeling Official Memo Pinned on Back Interior Wall (x = -10.75 world) */}
      <group position={[-2.34, 1.58, 0]} rotation={[0, Math.PI / 2, -0.04]}>
        <mesh>
          <planeGeometry args={[0.68, 0.86]} />
          <meshStandardMaterial
            map={memoTex}
            emissive="#cfc29e"
            emissiveIntensity={memoRead ? 0.14 : 0.36}
            roughness={0.85}
          />
        </mesh>
      </group>

      {/* Rusted Contractor Desk & Glowing 4-Digit Padlock Code Note (4819) */}
      <mesh position={[-1.0, 0.42, -1.9]} castShadow>
        <boxGeometry args={[1.4, 0.84, 0.9]} />
        <meshStandardMaterial color="#3b2f26" roughness={0.85} />
      </mesh>
      {!hasCodeNote && (
        <group position={[-0.95, 0.87, -1.85]} rotation={[0, 0.25, 0]}>
          <mesh>
            <boxGeometry args={[0.38, 0.03, 0.28]} />
            <meshStandardMaterial color="#e8dbb8" emissive="#d9bd73" emissiveIntensity={0.55} roughness={0.8} />
          </mesh>
          <pointLight position={[0, 0.4, 0]} color="#ffda85" intensity={1.5} distance={5} />
        </group>
      )}

      {/* Flickering Fluorescent Ceiling Fixture */}
      <mesh position={[0, 2.98, 0]}>
        <boxGeometry args={[0.16, 0.08, 1.3]} />
        <meshBasicMaterial color="#d8f0e4" />
      </mesh>
      <pointLight ref={tubeLightRef} position={[0, 2.75, 0]} color="#c9ebd9" intensity={3.4} distance={11} />

      {/* Dark Shadow Silhouette Darting Past the Outside North Window Upon Leaving */}
      <group ref={shadowPassRef} position={[-2.8, 0, -4.1]} visible={false}>
        <mesh position={[0, 1.35, 0]}>
          <coneGeometry args={[0.45, 2.3, 8]} />
          <meshBasicMaterial color="#05070a" />
        </mesh>
        <mesh position={[0, 2.48, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#05070a" />
        </mesh>
      </group>
    </group>
  );
}
