// ============================================================================
// src/components/SunsetTransition.jsx
// Drives the 5.5-second Sunset Time-Skip ("A few hours later...") over the
// campus: smoothly animates sunsetProgress from 0 (bright morning) -> 1
// (warm orange-purple evening sunset) with a slow cinematic establishing pan.
// ============================================================================

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const SUNSET_DURATION_SEC = 5.4;

export default function SunsetTransition({
  active,
  holdEvening = false,
  onProgressChange,
  onComplete,
}) {
  const { camera } = useThree();
  const elapsedRef = useRef(0);
  const doneRef = useRef(false);
  const lastSentRef = useRef(-1);

  useEffect(() => {
    if (!active) return;
    elapsedRef.current = 0;
    doneRef.current = false;
    lastSentRef.current = -1;
  }, [active]);

  useFrame(({ clock }, delta) => {
    if (!active && !holdEvening) return;
    const dt = Math.min(delta, 0.1);

    if (holdEvening) {
      // Slow evening campus breathing angle over the parking lot & glowing hall
      const t = clock.getElapsedTime();
      camera.position.set(
        8.5 + Math.sin(t * 0.25) * 0.6,
        3.4 + Math.cos(t * 0.35) * 0.12,
        12.5
      );
      camera.lookAt(1.5, 2.2, -10.0);
      return;
    }

    elapsedRef.current += dt;
    const u = Math.min(1, elapsedRef.current / SUNSET_DURATION_SEC);
    const smooth = u * u * (3 - 2 * u);

    // Emit rounded progress updates (~30 steps) to smoothly shift sky & sun
    const quant = Math.round(smooth * 35) / 35;
    if (quant !== lastSentRef.current) {
      lastSentRef.current = quant;
      onProgressChange(quant);
    }

    // Slow wide cinematic crane pan from the walkway out to the evening parking lot
    camera.position.set(
      THREE.MathUtils.lerp(0.25, 8.5, smooth),
      THREE.MathUtils.lerp(1.75, 3.4, smooth),
      THREE.MathUtils.lerp(-8.8, 12.5, smooth)
    );
    camera.lookAt(
      THREE.MathUtils.lerp(0.0, 1.5, smooth),
      THREE.MathUtils.lerp(2.4, 2.2, smooth),
      THREE.MathUtils.lerp(-18.0, -10.0, smooth)
    );

    if (u >= 1 && !doneRef.current) {
      doneRef.current = true;
      onProgressChange(1);
      onComplete();
    }
  });

  return null;
}
