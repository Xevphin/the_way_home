// ============================================================================
// src/data/chapterKeyArt.js
// Chapter catalog metadata + 100% procedural 16:9 HTML5 <canvas> key-art
// painter for the Telltale-style "Choose Chapter" carousel screen:
// - Chapter 1: Just Another Day (rainy dark forest road, headlights, glowing eyes)
// - Chapter 2: Unknown Mystery (crimson mist road, solitary door, blood trail, mask)
// ============================================================================

export const CHAPTER_CARDS = [
  {
    id: 'CHAPTER_1',
    badge: 'CHAPTER 1',
    title: 'Just Another Day',
    subtitle: 'Route 312 • Midnight Detour',
    description:
      'A routine Friday ends on an unlit forest shortcut where a stalled sedan and a pale hooded figure wait in the fog.',
  },
  {
    id: 'CHAPTER_2',
    badge: 'CHAPTER 2',
    title: 'Unknown Mystery',
    subtitle: 'The Warning • False Awakening',
    description:
      'Awaken alone on an endless mist-choked Route 312 where bodies line the asphalt and a solitary door awaits at the end.',
  },
];

function drawPineSilhouette(ctx, x, baseY, height, width) {
  ctx.beginPath();
  ctx.moveTo(x, baseY - height);
  ctx.lineTo(x - width * 0.35, baseY - height * 0.55);
  ctx.lineTo(x - width * 0.18, baseY - height * 0.58);
  ctx.lineTo(x - width * 0.52, baseY - height * 0.22);
  ctx.lineTo(x - width * 0.26, baseY - height * 0.25);
  ctx.lineTo(x - width * 0.65, baseY);
  ctx.lineTo(x + width * 0.65, baseY);
  ctx.lineTo(x + width * 0.26, baseY - height * 0.25);
  ctx.lineTo(x + width * 0.52, baseY - height * 0.22);
  ctx.lineTo(x + width * 0.18, baseY - height * 0.58);
  ctx.lineTo(x + width * 0.35, baseY - height * 0.55);
  ctx.closePath();
  ctx.fill();
}

function drawChapter1Art(ctx, w, h) {
  // Deep rainy midnight sky & fog horizon
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#040811');
  sky.addColorStop(0.55, '#0b1829');
  sky.addColorStop(1, '#090e15');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Subtle moonlight fog bloom
  const moonGlow = ctx.createRadialGradient(w * 0.52, h * 0.44, 10, w * 0.52, h * 0.44, w * 0.42);
  moonGlow.addColorStop(0, 'rgba(130, 175, 220, 0.22)');
  moonGlow.addColorStop(1, 'rgba(5, 10, 18, 0)');
  ctx.fillStyle = moonGlow;
  ctx.fillRect(0, 0, w, h);

  // Vanishing wet asphalt road
  ctx.fillStyle = '#12171f';
  ctx.beginPath();
  ctx.moveTo(w * 0.44, h * 0.52);
  ctx.lineTo(w * 0.56, h * 0.52);
  ctx.lineTo(w * 0.92, h);
  ctx.lineTo(w * 0.08, h);
  ctx.closePath();
  ctx.fill();

  // Warm car headlight cones sweeping forward
  const beam = ctx.createRadialGradient(w * 0.5, h * 0.98, 12, w * 0.5, h * 0.62, w * 0.44);
  beam.addColorStop(0, 'rgba(255, 232, 176, 0.45)');
  beam.addColorStop(0.5, 'rgba(235, 212, 155, 0.16)');
  beam.addColorStop(1, 'rgba(255, 232, 176, 0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(w * 0.28, h);
  ctx.lineTo(w * 0.43, h * 0.52);
  ctx.lineTo(w * 0.57, h * 0.52);
  ctx.lineTo(w * 0.72, h);
  ctx.closePath();
  ctx.fill();

  // Dashed yellow centerline
  ctx.strokeStyle = 'rgba(215, 178, 76, 0.65)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i += 1) {
    const t0 = 0.56 + i * 0.085;
    const t1 = t0 + 0.045;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * t0);
    ctx.lineTo(w * 0.5, h * t1);
    ctx.stroke();
  }

  // Dense jagged pine tree silhouettes on both flanks
  ctx.fillStyle = '#04080c';
  [0.04, 0.13, 0.22, 0.31, 0.69, 0.78, 0.87, 0.96].forEach((px, idx) => {
    const scale = idx === 3 || idx === 4 ? 0.58 : 0.88 + (idx % 2) * 0.16;
    drawPineSilhouette(ctx, w * px, h * 0.72, h * 0.68 * scale, w * 0.13 * scale);
  });

  // Twin piercing glowing pinprick eyes peering from the fog
  ctx.fillStyle = '#020306';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.47, 13, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#eef6ff';
  ctx.beginPath();
  ctx.arc(w * 0.493, h * 0.445, 2.2, 0, Math.PI * 2);
  ctx.arc(w * 0.507, h * 0.445, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Fine diagonal rain streaks
  ctx.strokeStyle = 'rgba(185, 212, 245, 0.22)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 64; i += 1) {
    const rx = ((i * 97) % w);
    const ry = ((i * 53) % h);
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 5, ry + 18);
    ctx.stroke();
  }
}

function drawChapter2Art(ctx, w, h) {
  // Crimson-tinted mist sky & desolate horizon
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#0a0305');
  sky.addColorStop(0.52, '#2b0910');
  sky.addColorStop(1, '#120609');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Crimson mist glow behind the solitary standing door
  const crimsonGlow = ctx.createRadialGradient(w * 0.5, h * 0.46, 8, w * 0.5, h * 0.46, w * 0.36);
  crimsonGlow.addColorStop(0, 'rgba(195, 28, 42, 0.46)');
  crimsonGlow.addColorStop(0.55, 'rgba(115, 14, 24, 0.2)');
  crimsonGlow.addColorStop(1, 'rgba(12, 3, 6, 0)');
  ctx.fillStyle = crimsonGlow;
  ctx.fillRect(0, 0, w, h);

  // Endless empty asphalt road
  ctx.fillStyle = '#140e12';
  ctx.beginPath();
  ctx.moveTo(w * 0.43, h * 0.52);
  ctx.lineTo(w * 0.57, h * 0.52);
  ctx.lineTo(w * 0.94, h);
  ctx.lineTo(w * 0.06, h);
  ctx.closePath();
  ctx.fill();

  // Blood trail & dark crimson splatters leading toward the door
  ctx.fillStyle = 'rgba(138, 12, 22, 0.78)';
  [
    [0.48, 0.92, 46, 12],
    [0.53, 0.82, 34, 9],
    [0.47, 0.72, 24, 7],
    [0.51, 0.63, 18, 5],
  ].forEach(([bx, by, rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(w * bx, h * by, rx, ry, -0.1, 0, Math.PI * 2);
    ctx.fill();
  });

  // Solitary standing wooden door at the vanishing point
  const dw = 46;
  const dh = 92;
  const dx = w * 0.5 - dw / 2;
  const dy = h * 0.52 - dh + 6;
  ctx.fillStyle = '#0b0608';
  ctx.strokeStyle = 'rgba(215, 65, 72, 0.65)';
  ctx.lineWidth = 2;
  ctx.fillRect(dx, dy, dw, dh);
  ctx.strokeRect(dx, dy, dw, dh);
  ctx.fillStyle = '#c89b52';
  ctx.beginPath();
  ctx.arc(dx + dw - 9, dy + dh * 0.55, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Ghostly porcelain mask eyes emerging subtly in upper crimson fog
  ctx.fillStyle = 'rgba(212, 218, 226, 0.2)';
  ctx.beginPath();
  ctx.ellipse(w * 0.77, h * 0.34, 24, 33, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#050204';
  ctx.beginPath();
  ctx.ellipse(w * 0.757, h * 0.325, 5.5, 4.5, 0, 0, Math.PI * 2);
  ctx.ellipse(w * 0.785, h * 0.325, 5.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff3844';
  ctx.beginPath();
  ctx.arc(w * 0.757, h * 0.325, 1.8, 0, Math.PI * 2);
  ctx.arc(w * 0.785, h * 0.325, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Lone Route 312 roadside sign on the left verge
  ctx.fillStyle = '#251c20';
  ctx.fillRect(w * 0.19, h * 0.53, 4, h * 0.18);
  ctx.fillStyle = '#203b2a';
  ctx.fillRect(w * 0.145, h * 0.5, 56, 24);
  ctx.strokeStyle = '#d4d8dc';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(w * 0.145, h * 0.5, 56, 24);
  ctx.fillStyle = '#f2f4f8';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('RTE 312', w * 0.145 + 28, h * 0.5 + 16);
}

export function drawChapterKeyArt(canvas, chapterId) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  if (chapterId === 'CHAPTER_2') {
    drawChapter2Art(ctx, width, height);
  } else {
    drawChapter1Art(ctx, width, height);
  }
}
