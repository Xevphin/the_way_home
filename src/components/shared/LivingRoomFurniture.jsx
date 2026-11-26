// ============================================================================
// src/components/LivingRoomFurniture.jsx
// Reference-matched modern living room:
// - Grey woven-textured rug & dark matte ceiling panel
// - Charcoal L-shaped sectional sofa with patterned throw pillows
// - Multi-tiered dark walnut coffee table with neon chess set & optical book
// - Upright mahogany piano + bench (left wall) & leaning acoustic guitar
// - 4 circular decorative wall medallions above sofa
// - Blue retro arcade cabinet (back-right corner) & tall windows with shades
// ============================================================================

import React, { useMemo } from 'react';
import {
  makeChessboardTexture,
  makeOpticalBookTexture,
  makeWovenRugTexture,
} from '../../data/shared/livingRoomTextures';
import ModelAsset from './ModelAsset';
import { MODELS } from '../../data/shared/modelCatalog';

export default function LivingRoomFurniture({ notesChecked = false }) {
  const rugTex = useMemo(() => makeWovenRugTexture(), []);
  const opArtTex = useMemo(() => makeOpticalBookTexture(), []);
  const chessTex = useMemo(() => makeChessboardTexture(), []);

  return (
    <group>
      {/* Grey Woven-Textured Floor Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.15, 0.015, 2.85]} receiveShadow>
        <planeGeometry args={[6.4, 6.0]} />
        <meshStandardMaterial map={rugTex} roughness={0.94} />
      </mesh>

      {/* Modern Dark Matte Ceiling Accent Panel Over Living Room */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[3.1, 3.18, 2.8]}>
        <planeGeometry args={[6.6, 6.2]} />
        <meshStandardMaterial color="#1f1d1b" roughness={0.85} />
      </mesh>

      {/* ========= KENNEY CHARCOAL L-SHAPED SECTIONAL SOFA ========= */}
      <group>
        <ModelAsset
          url={MODELS.sofaLong}
          position={[2.45, 0, 4.95]}
          rotation={[0, Math.PI, 0]}
          targetWidth={2.9}
          tint="#465261"
        />
        <ModelAsset
          url={MODELS.sofaCorner}
          position={[4.55, 0, 4.82]}
          rotation={[0, Math.PI, 0]}
          targetWidth={1.45}
          tint="#465261"
        />
        <ModelAsset
          url={MODELS.sofaLong}
          position={[5.35, 0, 2.55]}
          rotation={[0, -Math.PI / 2, 0]}
          targetWidth={2.6}
          tint="#465261"
        />
        {/* Patterned Accent Throw Pillows Aligned Flush to Sofa Backrests */}
        {[
          { pos: [1.65, 0.68, 5.15], rot: [-0.18, 0.08, 0] },
          { pos: [2.85, 0.68, 5.15], rot: [-0.18, -0.06, 0] },
          { pos: [4.1, 0.68, 5.12], rot: [-0.18, 0.1, 0] },
          { pos: [5.52, 0.68, 2.55], rot: [0, -Math.PI / 2, -0.18] },
        ].map((p, idx) => (
          <mesh key={idx} position={p.pos} rotation={p.rot}>
            <boxGeometry args={[0.38, 0.36, 0.13]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#efe7dc' : '#cbd5e1'} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ========= MULTI-TIERED DARK WALNUT COFFEE TABLE + NEON CHESS ========= */}
      <group position={[3.0, 0, 2.55]}>
        {/* Staggered Interlocking Dark Walnut Plinths */}
        <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.65, 0.32, 1.25]} />
          <meshStandardMaterial color="#3b2618" roughness={0.65} />
        </mesh>
        <mesh position={[-0.18, 0.36, 0.14]} castShadow receiveShadow>
          <boxGeometry args={[1.45, 0.12, 0.82]} />
          <meshStandardMaterial color="#4a301e" roughness={0.6} />
        </mesh>
        <mesh position={[0.24, 0.44, -0.2]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.12, 0.65]} />
          <meshStandardMaterial color="#543824" roughness={0.58} />
        </mesh>
        {/* Neon Chess Set (Checkered Board + Glowing Neon Yellow & Orange Pieces) */}
        <group position={[0.42, 0.43, 0.26]}>
          <mesh>
            <boxGeometry args={[0.56, 0.025, 0.52]} />
            <meshStandardMaterial map={chessTex} roughness={0.3} />
          </mesh>
          <mesh position={[-0.22, 0.06, 0]}>
            <boxGeometry args={[0.08, 0.1, 0.46]} />
            <meshStandardMaterial color="#eaff2b" emissive="#d4f000" emissiveIntensity={1.5} />
          </mesh>
          <mesh position={[0.22, 0.06, 0]}>
            <boxGeometry args={[0.08, 0.1, 0.46]} />
            <meshStandardMaterial color="#ff5e1a" emissive="#ff4500" emissiveIntensity={1.5} />
          </mesh>
        </group>
        {/* Black-and-White Optical-Art Hardcover Book */}
        <mesh position={[-0.42, 0.45, 0.16]} castShadow>
          <boxGeometry args={[0.42, 0.06, 0.52]} />
          <meshStandardMaterial map={opArtTex} roughness={0.5} />
        </mesh>
        {/* Yellow Accent Tray, Wooden Box & Assignment Notes (Chore 3) */}
        <mesh position={[-0.08, 0.52, -0.24]}>
          <boxGeometry args={[0.32, 0.03, 0.28]} />
          <meshStandardMaterial color="#ebd215" roughness={0.4} />
        </mesh>
        <mesh position={[0.42, 0.52, -0.24]} rotation={[0, 0.14, 0]} castShadow>
          <boxGeometry args={[0.36, 0.04, 0.44]} />
          <meshStandardMaterial color={notesChecked ? '#d5e8d4' : '#ffffff'} roughness={0.85} />
        </mesh>
      </group>

      {/* ========= UPRIGHT MAHOGANY PIANO & BENCH (LEFT WALL) ========= */}
      <group position={[0.08, 0, 3.7]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.52, 1.24, 0.58]} />
          <meshStandardMaterial color="#3d1711" roughness={0.32} metalness={0.2} />
        </mesh>
        {/* Keyboard Shelf & Ivory/Ebony Keys */}
        <mesh position={[0, 0.72, 0.36]} castShadow>
          <boxGeometry args={[1.48, 0.1, 0.28]} />
          <meshStandardMaterial color="#4a1d15" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.78, 0.36]}>
          <boxGeometry args={[1.34, 0.03, 0.2]} />
          <meshStandardMaterial color="#f7f5f0" roughness={0.4} />
        </mesh>
        {/* Leather Piano Bench */}
        <mesh position={[0, 0.46, 0.78]} castShadow>
          <boxGeometry args={[0.84, 0.09, 0.38]} />
          <meshStandardMaterial color="#1a1a1d" roughness={0.6} />
        </mesh>
        {[-0.36, 0.36].map((bx, i) => (
          <mesh key={i} position={[bx, 0.23, 0.78]}>
            <boxGeometry args={[0.06, 0.44, 0.32]} />
            <meshStandardMaterial color="#331510" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* ========= ACOUSTIC GUITAR LEANING CLEANLY AGAINST SOUTH WALL ========= */}
      <group position={[0.62, 0, 5.62]} rotation={[-0.14, 0.22, 0]}>
        <mesh position={[0, 0.34, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.22, 0.12, 14]} />
          <meshStandardMaterial color="#c98e4b" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.36, 0.065]}>
          <circleGeometry args={[0.055, 14]} />
          <meshBasicMaterial color="#1c140f" />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <boxGeometry args={[0.065, 0.62, 0.035]} />
          <meshStandardMaterial color="#452b18" roughness={0.7} />
        </mesh>
      </group>

      {/* ========= 4 CIRCULAR DECORATIVE WALL MEDALLIONS ABOVE SOFA ========= */}
      {[
        { x: 2.05, y: 2.02, r: 0.34, color: '#d4b357' },
        { x: 2.75, y: 1.96, r: 0.38, color: '#e8e2d8' },
        { x: 3.58, y: 2.1, r: 0.46, color: '#4c86a8' },
        { x: 4.26, y: 2.0, r: 0.24, color: '#dfc15a' },
      ].map((m, idx) => (
        <mesh key={idx} position={[m.x, m.y, 5.88]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[m.r, m.r, 0.04, 22]} />
          <meshStandardMaterial color={m.color} roughness={0.75} />
        </mesh>
      ))}

      {/* ========= BLUE RETRO ARCADE MACHINE (CLEAR BACK-RIGHT CORNER) ========= */}
      <group position={[5.98, 0, 5.42]} rotation={[0, -2.35, 0]}>
        <mesh position={[0, 0.92, 0]} castShadow>
          <boxGeometry args={[0.72, 1.84, 0.68]} />
          <meshStandardMaterial color="#2779bd" roughness={0.45} />
        </mesh>
        {/* Glowing Retro Arcade Screen & Marquee */}
        <mesh position={[0, 1.24, 0.35]} rotation={[-0.25, 0, 0]}>
          <planeGeometry args={[0.56, 0.44]} />
          <meshStandardMaterial color="#1a2634" emissive="#3ba676" emissiveIntensity={1.1} />
        </mesh>
        <mesh position={[0, 1.72, 0.35]}>
          <planeGeometry args={[0.62, 0.18]} />
          <meshStandardMaterial color="#ffd966" emissive="#ffae34" emissiveIntensity={1.6} />
        </mesh>
        {/* Control Deck with Joystick */}
        <mesh position={[0, 0.92, 0.42]}>
          <boxGeometry args={[0.66, 0.08, 0.26]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
      </group>

      {/* ========= TWO TALL WINDOWS WITH ROMAN SHADES (EAST WALL) ========= */}
      {[1.4, 3.7].map((wz, idx) => (
        <group key={idx} position={[6.38, 1.72, wz]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[1.45, 1.95]} />
            <meshBasicMaterial color="#fff9e8" />
          </mesh>
          {/* Folded Grey-Taupe Roman Shade at Top */}
          <mesh position={[0, 0.72, 0.04]}>
            <boxGeometry args={[1.52, 0.52, 0.06]} />
            <meshStandardMaterial color="#8f8a84" roughness={0.9} />
          </mesh>
          {/* Window Mullion Crossbars */}
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.05, 1.95, 0.04]} />
            <meshStandardMaterial color="#f5f5f5" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
