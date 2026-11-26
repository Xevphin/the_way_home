// ============================================================================
// src/components/InventoryHud.jsx
// Minimalist borderless bottom-right status HUD:
// - Transparent slender battery bar & flashlight icon (amber/white, red low)
// - Compact chips ONLY for scavenged items once physically discovered:
//   [M] Torn Map & Car Repair Components progress (0/3 -> 3/3)
// ============================================================================

import React from 'react';

export default function InventoryHud({
  flashlightOn,
  batteryLevel,
  progress = {},
  onToggleTornMap,
}) {
  const roundedBat = Math.round(batteryLevel);
  const lowBattery = roundedBat <= 22;
  const partsCount =
    (progress.hasBelt ? 1 : 0) +
    (progress.hasBatteryCell ? 1 : 0) +
    (progress.hasStarterRelay ? 1 : 0);

  return (
    <aside className="minimal-status-hud" aria-label="Equipment status">
      {(progress.hasTornMap || progress.hasCrowbar || progress.hasIronKey || partsCount > 0) && (
        <div className="collected-badges-row">
          {progress.hasTornMap && (
            <button
              type="button"
              className="minimal-item-chip clickable"
              onClick={onToggleTornMap}
              title="Press [M] to inspect your torn hand-drawn sketch"
            >
              <span className="chip-key">M</span>
              <span>Torn Map</span>
            </button>
          )}
          {progress.hasCrowbar && (
            <div className="minimal-item-chip">
              <span>🔧 Crowbar</span>
            </div>
          )}
          {progress.hasIronKey && (
            <div className="minimal-item-chip key">
              <span>🗝 Iron Key</span>
            </div>
          )}
          {partsCount > 0 && (
            <div className={`minimal-item-chip ${partsCount === 3 ? 'key' : ''}`}>
              <span>⚙ Car Parts {partsCount}/3</span>
            </div>
          )}
        </div>
      )}

      <div className={`minimal-battery-row ${flashlightOn ? 'on' : 'off'}`}>
        <span className="minimal-beam-icon" aria-hidden="true">
          {flashlightOn ? '☀' : '☾'}
        </span>
        <div className="minimal-battery-track">
          <div
            className={`minimal-battery-fill ${lowBattery ? 'low' : ''}`}
            style={{ width: `${roundedBat}%` }}
          />
        </div>
        <span className={`minimal-battery-pct ${lowBattery ? 'low' : ''}`}>
          {roundedBat}%
        </span>
      </div>
    </aside>
  );
}
