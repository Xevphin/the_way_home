// ============================================================================
// src/data/midnightSpawns.js
// Initial spawn presets for Chapter 1 Midnight Forest (default post-crash
// driver-door spawn + optional URL QA presets for individual landmarks).
// ============================================================================

export function buildInitialMidnightProgress(baseProgress, initialSpawn) {
  return {
    ...baseProgress,
    ...(initialSpawn.readyRepair
      ? {
          carInspected: true,
          elderSpoken: true,
          hasTornMap: true,
          hasCrowbar: true,
          cratePried: true,
          hasIronKey: true,
          shedUnlocked: true,
          hasBelt: true,
          hasBatteryCell: true,
          hasStarterRelay: true,
          chestUnlocked: true,
        }
      : {}),
    lastRespawnPoint: initialSpawn.pos,
    lastRespawnYaw: initialSpawn.yaw,
  };
}

export function getInitialMidnightSpawn() {
  const sp = new URLSearchParams(window.location.search).get('spawn');
  if (sp === 'surau') return { pos: [10.4, 1.7, -43.2], yaw: -Math.PI / 2 - 0.12, skipCutscene: true };
  if (sp === 'house') return { pos: [-11.8, 1.7, -63.5], yaw: Math.PI / 2 - 0.1, skipCutscene: true };
  if (sp === 'office') return { pos: [-15.2, 1.7, -96.0], yaw: Math.PI / 2 - 0.26, skipCutscene: true };
  if (sp === 'ruin') return { pos: [13.2, 1.7, -123.5], yaw: -Math.PI / 2, skipCutscene: true };
  if (sp === 'shed') return { pos: [10.8, 1.7, -138.0], yaw: -Math.PI / 2, skipCutscene: true };
  if (sp === 'watchtower') return { pos: [-17.4, 1.7, -155.4], yaw: Math.PI / 2, skipCutscene: true };
  if (sp === 'wakaf') return { pos: [12.4, 1.7, -184.6], yaw: -Math.PI / 2 - 0.15, skipCutscene: true };
  if (sp === 'stall') return { pos: [-10.2, 1.7, -222.5], yaw: Math.PI / 2 - 0.12, skipCutscene: true };
  if (sp === 'repair') return { pos: [-0.8, 1.7, -0.5], yaw: -0.95, skipCutscene: true, readyRepair: true };
  return { pos: [-0.8, 1.7, -0.5], yaw: -0.45, skipCutscene: false };
}
