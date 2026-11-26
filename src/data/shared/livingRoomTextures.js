// ============================================================================
// src/data/livingRoomTextures.js
// Procedural Three.js CanvasTextures for the reference-matched living room:
// - Grey woven heather floor rug
// - Black-and-white optical-art hardcover book
// - Checkered acrylic neon chess board
// ============================================================================

import * as THREE from 'three';

export function makeWovenRugTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#5a6069';
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 3) {
    ctx.fillStyle = y % 6 === 0 ? 'rgba(255,255,255,0.09)' : 'rgba(15,18,24,0.14)';
    ctx.fillRect(0, y, 256, 1);
  }
  for (let x = 0; x < 256; x += 4) {
    ctx.fillStyle = x % 8 === 0 ? 'rgba(220,226,235,0.07)' : 'rgba(10,12,16,0.1)';
    ctx.fillRect(x, 0, 1, 256);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 5);
  return tex;
}

export function makeOpticalBookTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 6;
  for (let i = 6; i < 62; i += 12) {
    ctx.strokeRect(i, i, 128 - i * 2, 128 - i * 2);
  }
  return new THREE.CanvasTexture(c);
}

export function makeChessboardTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  for (let r = 0; r < 8; r++) {
    for (let col = 0; col < 8; col++) {
      ctx.fillStyle = (r + col) % 2 === 0 ? '#eef2f6' : '#a8b0bc';
      ctx.fillRect(col * 16, r * 16, 16, 16);
    }
  }
  return new THREE.CanvasTexture(c);
}
