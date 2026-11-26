// ============================================================================
// src/data/flashlightBeamTexture.js
// Procedural 256x256 tactical flashlight reflector cookie (CanvasTexture):
// - Bright cool-white central hotspot (#f5f8ff)
// - Darker inner trough between core and outer reflector ring
// - Crisp concentric outer halo ring at ~72% radius + smooth black falloff
// ============================================================================

import * as THREE from 'three';

let cachedBeamTex = null;

export function getFlashlightBeamTexture() {
  if (cachedBeamTex) return cachedBeamTex;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);

  // Hot inner core -> inner trough -> sharp outer concentric ring (~72%) -> black falloff
  grad.addColorStop(0.0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.24, 'rgba(255,255,255,1)');
  grad.addColorStop(0.38, 'rgba(185,198,218,0.72)');
  grad.addColorStop(0.52, 'rgba(72,84,104,0.34)');
  grad.addColorStop(0.64, 'rgba(110,124,148,0.48)');
  grad.addColorStop(0.71, 'rgba(235,245,255,0.88)');
  grad.addColorStop(0.77, 'rgba(220,234,255,0.82)');
  grad.addColorStop(0.86, 'rgba(58,68,84,0.28)');
  grad.addColorStop(0.95, 'rgba(10,14,20,0.06)');
  grad.addColorStop(1.0, 'rgba(0,0,0,0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  cachedBeamTex = tex;
  return tex;
}
