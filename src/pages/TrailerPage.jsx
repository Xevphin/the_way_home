// ============================================================================
// src/pages/TrailerPage.jsx
// Self-contained automated ~50-second cinematic horror trailer route for
// "The Way Home: Chapter 1". Zero external assets, zero save-state side effects.
// ============================================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import TrailerScene3D from '../components/trailer/TrailerScene3D';
import TrailerOverlays from '../components/trailer/TrailerOverlays';
import { createTrailerAudioDirector } from '../components/trailer/TrailerAudioDirector';
import { evaluateOverlayState } from '../data/trailer/trailerTimeline';

export default function TrailerPage({ settings, onExitTrailer }) {
  const [time, setTime] = useState(0);
  const [runId, setRunId] = useState(0);
  const directorRef = useRef(null);
  const volume = settings?.volume ?? 0.75;

  // Create Web Audio cue director once per mount & cleanly tear down on exit
  useEffect(() => {
    const director = createTrailerAudioDirector(volume);
    directorRef.current = director;
    director.start();

    // Ensure Web Audio unlocks immediately if launched directly via ?trailer=1 URL
    const handleUnlock = () => director.unlock();
    window.addEventListener('pointerdown', handleUnlock, { passive: true });
    window.addEventListener('keydown', handleUnlock, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
      director.stop();
      directorRef.current = null;
    };
  }, []);

  useEffect(() => {
    directorRef.current?.setVolume(volume);
  }, [volume]);

  const handleExit = useCallback(() => {
    directorRef.current?.stop();
    onExitTrailer?.();
  }, [onExitTrailer]);

  const handleReplay = useCallback(() => {
    setTime(0);
    setRunId((n) => n + 1);
    directorRef.current?.start();
  }, []);

  // ESC cleanly returns to Main Menu; R replays once finished
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        handleExit();
      } else if (e.code === 'KeyR' && time >= 49.5) {
        e.preventDefault();
        handleReplay();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleExit, handleReplay, time]);

  const handleTimeUpdate = useCallback((nextTime) => {
    directorRef.current?.update(nextTime);
    setTime(nextTime);
  }, []);

  const overlayState = useMemo(() => evaluateOverlayState(time), [time]);

  return (
    <div
      className={`game-page trailer-page ${overlayState.isJumpscare ? 'is-jumpscare' : ''}`}
      aria-label="The Way Home Chapter 1 Official Trailer"
    >
      <Canvas
        dpr={[1, 1.5]}
        shadows
        camera={{ fov: 54, near: 0.1, far: 175, position: [0.32, 1.26, -2.6] }}
      >
        <TrailerScene3D
          playing={true}
          runId={runId}
          onTimeUpdate={handleTimeUpdate}
        />
      </Canvas>

      <TrailerOverlays
        state={overlayState}
        onReplay={handleReplay}
        onExit={handleExit}
      />
    </div>
  );
}
