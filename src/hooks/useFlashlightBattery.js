// ============================================================================
// src/hooks/useFlashlightBattery.js
// Flashlight battery: drains while ON (slower with Spare Batteries), slowly
// recovers while OFF, and recovers faster inside a Safe Zone.
// ============================================================================

import { useEffect, useState } from 'react';

export default function useFlashlightBattery({
  active,
  flashlightOn,
  hasSpareBatteries,
  inSafeZone,
  initialLevel = 78,
}) {
  const [batteryLevel, setBatteryLevel] = useState(initialLevel);

  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => {
      setBatteryLevel((prev) =>
        flashlightOn
          ? Math.max(8, prev - (hasSpareBatteries ? 0.22 : 0.42))
          : Math.min(100, prev + (inSafeZone ? 1.2 : 0.45))
      );
    }, 350);
    return () => clearInterval(id);
  }, [active, flashlightOn, hasSpareBatteries, inSafeZone]);

  return { batteryLevel, setBatteryLevel };
}
