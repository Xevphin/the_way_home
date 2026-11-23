// ============================================================================
// src/data/asphaltTextures.js
// Cached procedural wet midnight asphalt diffuse, bump & roughness CanvasMaps
// for RuralRoadWorld.jsx and ForestRadioCutscene.jsx so headlights & lanterns
// catch subtle damp grain and reflective wet road sheen.
// ============================================================================

import * as THREE from 'three';

let cachedMaps = null;

export function getWetAsphaltMaps() {
  if (cachedMaps) return cachedMaps;
  if (typeof document === 'undefined') return { map: null, bumpMap: null, roughnessMap: null };

  const size = 256;
  const diffCanvas = document.createElement('canvas');
  const bumpCanvas = document.createElement('canvas');
  const roughCanvas = document.createElement('canvas');
  diffCanvas.width = bumpCanvas.width = roughCanvas.width = size;
  diffCanvas.height = bumpCanvas.height = roughCanvas.height = size;

  const dCtx = diffCanvas.getContext('2d');
  const bCtx = bumpCanvas.getContext('2d');
  const rCtx = roughCanvas.getContext('2d');

  dCtx.fillStyle = '#181e27';
  dCtx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);
  rCtx.fillStyle = '#c8c8c8';
  rCtx.fillRect(0, 0, size, size);

  // Fine asphalt mineral grain
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 4200; i++) {
    const x = Math.floor(rand() * size);
    const y = Math.floor(rand() * size);
    const v = Math.floor(18 + rand() * 24);
    dCtx.fillStyle = `rgb(${v},${v + 4},${v + 10})`;
    dCtx.fillRect(x, y, 2, 2);
    const bv = Math.floor(90 + rand() * 80);
    bCtx.fillStyle = `rgb(${bv},${bv},${bv})`;
    bCtx.fillRect(x, y, 2, 2);
  }

  // Subtle damp puddle / wet tire-track sheen patches (lower roughness = glossier)
  for (let p = 0; p < 16; p++) {
    const px = rand() * size;
    const py = rand() * size;
    const rad = 18 + rand() * 34;
    const g = rCtx.createRadialGradient(px, py, 2, px, py, rad);
    g.addColorStop(0, 'rgba(42,42,42,0.75)');
    g.addColorStop(1, 'rgba(200,200,200,0)');
    rCtx.fillStyle = g;
    rCtx.fillRect(px - rad, py - rad, rad * 2, rad * 2);
  }

  const setup = (canvas, repeatX, repeatY) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.needsUpdate = true;
    return tex;
  };

  cachedMaps = {
    map: setup(diffCanvas, 3, 46),
    bumpMap: setup(bumpCanvas, 3, 46),
    roughnessMap: setup(roughCanvas, 3, 46),
  };
  return cachedMaps;
}
