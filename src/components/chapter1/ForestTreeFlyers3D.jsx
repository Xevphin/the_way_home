// ============================================================================
// src/components/ForestTreeFlyers3D.jsx
// Renders 10 weathered Missing Person posters ("HILANG / MISSING") and
// child-drawn Lurker crayon sketches nailed flush onto pine tree trunks
// along Route 312 & deep forest trail forks (100% procedural CanvasTextures).
// ============================================================================

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TREE_FLYERS } from '../../data/chapter1/treeFlyersData';

const MISSING_NAMES = ['A. FARHAN (22)', 'N. SYAFIQAH (24)', 'H. RIZAL (29)'];
const SKETCH_SCRAWLS = [
  'HE WATCHES FROM THE TREES',
  "DON'T LOOK AT HIS EYES",
  'NO ESCAPE',
  'IT STANDS ON THE ROAD',
  "DON'T FOLLOW THE LIGHTS",
];

function makeMissingPosterTexture(variantIdx) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 340;
  const ctx = c.getContext('2d');

  // Yellowed weathered paper base with subtle damp water stains
  ctx.fillStyle = '#d9ccb0';
  ctx.fillRect(0, 0, 256, 340);
  ctx.fillStyle = 'rgba(82, 66, 44, 0.18)';
  ctx.beginPath();
  ctx.arc(38, 290, 56, 0, Math.PI * 2);
  ctx.arc(225, 42, 48, 0, Math.PI * 2);
  ctx.fill();

  // Bold crimson header bar ("HILANG / MISSING")
  ctx.fillStyle = '#8f1919';
  ctx.fillRect(14, 16, 228, 44);
  ctx.fillStyle = '#f8f2e4';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HILANG / MISSING', 128, 46);

  // Dark silhouette portrait box
  ctx.fillStyle = '#25262b';
  ctx.fillRect(62, 72, 132, 126);
  ctx.fillStyle = '#111216';
  ctx.beginPath();
  ctx.arc(128, 114, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(128, 178, 44, 34, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Name & Route 312 / Lembah Batu details
  ctx.fillStyle = '#1c1917';
  ctx.font = 'bold 17px monospace';
  ctx.fillText(MISSING_NAMES[variantIdx % MISSING_NAMES.length], 128, 222);
  ctx.font = 'bold 13px monospace';
  ctx.fillText('LAST SEEN NEAR ROUTE 312', 128, 246);
  ctx.fillText('LEMBAH BATU FOREST ROAD', 128, 266);

  // Faded tear-off contact tabs at bottom
  ctx.strokeStyle = 'rgba(40, 32, 24, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(14, 294);
  ctx.lineTo(242, 294);
  for (let x = 44; x <= 212; x += 34) {
    ctx.moveTo(x, 294);
    ctx.lineTo(x, 336);
  }
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function makeChildSketchTexture(variantIdx) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 340;
  const ctx = c.getContext('2d');

  // Crumpled white lined school notebook paper
  ctx.fillStyle = '#e8e5dc';
  ctx.fillRect(0, 0, 256, 340);
  ctx.strokeStyle = 'rgba(92, 130, 178, 0.32)';
  ctx.lineWidth = 1;
  for (let y = 36; y < 328; y += 22) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(184, 62, 62, 0.35)';
  ctx.beginPath();
  ctx.moveTo(34, 0);
  ctx.lineTo(34, 340);
  ctx.stroke();

  // Unsettling black crayon tall hooded Lurker figure
  ctx.strokeStyle = '#141316';
  ctx.fillStyle = '#141316';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(128, 56);
  ctx.lineTo(86, 224);
  ctx.lineTo(170, 224);
  ctx.closePath();
  ctx.fill();

  // Pale face oval with hollow pitch-black eyes & red crayon slashes
  ctx.fillStyle = '#dcd9d0';
  ctx.beginPath();
  ctx.ellipse(128, 96, 20, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#070709';
  ctx.beginPath();
  ctx.arc(120, 92, 4.5, 0, Math.PI * 2);
  ctx.arc(136, 92, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Spindly clawed arms reaching outward
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(106, 132);
  ctx.lineTo(54, 166);
  ctx.moveTo(150, 132);
  ctx.lineTo(202, 164);
  ctx.stroke();

  // Aggressive red crayon scribbles + childlike warning text
  ctx.strokeStyle = '#a81818';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 248);
  ctx.lineTo(192, 244);
  ctx.moveTo(74, 256);
  ctx.lineTo(184, 254);
  ctx.stroke();

  ctx.fillStyle = '#991515';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  const scrawl = SKETCH_SCRAWLS[variantIdx % SKETCH_SCRAWLS.length];
  ctx.fillText(scrawl, 128, 286);
  ctx.fillStyle = '#18181b';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('IT IS RIGHT BEHIND YOU', 128, 314);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export default function ForestTreeFlyers3D() {
  const textures = useMemo(
    () => ({
      missing: [0, 1, 2].map((i) => makeMissingPosterTexture(i)),
      sketch: [0, 1, 2, 3, 4].map((i) => makeChildSketchTexture(i)),
    }),
    []
  );

  return (
    <group>
      {TREE_FLYERS.map((flyer) => {
        const tex =
          flyer.kind === 'missing'
            ? textures.missing[flyer.variant % textures.missing.length]
            : textures.sketch[flyer.variant % textures.sketch.length];
        const [x, y, z] = flyer.position;

        return (
          <group key={flyer.id} position={[x, 0, z]} rotation={[0, flyer.rotY, 0]}>
            {/* Host Pine Trunk Behind Flyer (offset -0.26m so flyer sits flush on bark) */}
            <mesh position={[0, 3.2, -0.26]}>
              <cylinderGeometry args={[0.21, 0.28, 6.4, 8]} />
              <meshStandardMaterial color="#211a14" roughness={0.96} />
            </mesh>
            {/* Weathered Paper Poster / Child Sketch Nailed to Trunk */}
            <mesh position={[0, y, 0.01]} rotation={[0, 0, flyer.tiltZ]}>
              <planeGeometry args={[0.46, 0.62]} />
              <meshStandardMaterial
                map={tex}
                roughness={0.9}
                emissive="#c4baa6"
                emissiveIntensity={0.08}
              />
            </mesh>
            {/* Rusted Iron Nail Head Pinning Top Center */}
            <mesh position={[0, y + 0.26, 0.022]}>
              <sphereGeometry args={[0.014, 6, 6]} />
              <meshStandardMaterial color="#3c3733" metalness={0.75} roughness={0.45} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
