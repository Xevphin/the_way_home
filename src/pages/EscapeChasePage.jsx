// ============================================================================
// src/pages/EscapeChasePage.jsx
// Chapter 1 Climax Page:
// - 2-second hood-slam & engine ignition beat -> Enraged Shadow Lurker roar
// - High-speed third-person car obstacle-dodge sprint with procedural horror
//   chase theme, speed ramp, sparks/taillight blink, and instant clean retry!
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import EscapeChaseScene from '../components/EscapeChaseScene';
import TypewriterSubtitle from '../components/TypewriterSubtitle';
import useCutsceneSkip from '../hooks/useCutsceneSkip';
import { CHASE_DISTANCE, MAX_INTEGRITY } from '../data/escapeChaseData';
import {
  startForestNightAmbience,
  stopForestNightAmbience,
} from '../components/ForestAmbienceAudio';
import {
  startDrivingEngineAudio,
  stopDrivingEngineAudio,
} from '../components/AmbientMusicAudio';
import {
  startEscapeChaseTheme,
  stopEscapeChaseTheme,
} from '../components/ChaseThemeAudio';

function releasePointer() {
  if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
}

export default function EscapeChasePage({ paused = false, onOpenPause, onReturnToMenu, onEscaped }) {
  const [stage, setStage] = useState('IGNITION_BEAT'); // 'IGNITION_BEAT' | 'ROAR_CUTSCENE' | 'DRIVING' | 'WRECKED'
  const [integrity, setIntegrity] = useState(MAX_INTEGRITY);
  const [metersLeft, setMetersLeft] = useState(CHASE_DISTANCE);
  const [hitFlash, setHitFlash] = useState(false);
  const [subtitle, setSubtitle] = useState(null);
  const [runId, setRunId] = useState(0);
  const flashTimerRef = useRef(null);

  useEffect(() => {
    releasePointer();
    startForestNightAmbience();
    return () => {
      stopForestNightAmbience();
      stopDrivingEngineAudio();
      stopEscapeChaseTheme();
      clearTimeout(flashTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (stage === 'DRIVING' && !paused) {
      startDrivingEngineAudio();
      startEscapeChaseTheme();
    } else {
      stopDrivingEngineAudio();
      stopEscapeChaseTheme();
    }
  }, [stage, paused]);

  const handleIgnitionDone = useCallback(() => setStage('ROAR_CUTSCENE'), []);

  const handleStartDriving = useCallback(() => {
    setSubtitle(null);
    setStage('DRIVING');
  }, []);

  const isIntroCutscene = stage === 'IGNITION_BEAT' || stage === 'ROAR_CUTSCENE';
  useCutsceneSkip(isIntroCutscene && !paused, handleStartDriving);

  const handleHitObstacle = useCallback(() => {
    setHitFlash(true);
    clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setHitFlash(false), 320);

    setIntegrity((prev) => {
      const next = Math.max(0, prev - 1);
      if (next <= 0) setStage('WRECKED');
      return next;
    });
  }, []);

  const handleRetry = useCallback(() => {
    setIntegrity(MAX_INTEGRITY);
    setMetersLeft(CHASE_DISTANCE);
    setSubtitle(null);
    setRunId((n) => n + 1);
    setStage('DRIVING');
  }, []);

  const handleEscaped = useCallback(() => {
    stopForestNightAmbience();
    stopDrivingEngineAudio();
    stopEscapeChaseTheme();
    onEscaped?.();
  }, [onEscaped]);

  const handleMenu = useCallback(() => {
    stopForestNightAmbience();
    stopDrivingEngineAudio();
    stopEscapeChaseTheme();
    releasePointer();
    onReturnToMenu?.();
  }, [onReturnToMenu]);

  const progressPct = Math.min(
    100,
    Math.max(0, Math.round(((CHASE_DISTANCE - metersLeft) / CHASE_DISTANCE) * 100))
  );

  return (
    <div className="game-page">
      {!paused && (
        <button type="button" className="top-menu-escape-btn" onClick={onOpenPause || handleMenu}>
          ← Menu
        </button>
      )}

      <Canvas dpr={[1, 1.5]} shadows camera={{ fov: 64, near: 0.1, far: 160, position: [1.85, 1.35, -2.95] }}>
        <EscapeChaseScene
          stage={stage}
          paused={paused}
          integrity={integrity}
          runId={runId}
          onIgnitionDone={handleIgnitionDone}
          onStartDriving={handleStartDriving}
          onSubtitle={setSubtitle}
          onProgressUpdate={setMetersLeft}
          onHitObstacle={handleHitObstacle}
          onEscaped={handleEscaped}
        />
      </Canvas>

      {hitFlash && <div className="chase-hit-flash" aria-hidden="true" />}

      {stage === 'DRIVING' && (
        <div className="chase-hud-top" role="status" aria-label="Escape Chase Status">
          <div className="chase-metric-block">
            <span className="chase-hud-label">CAR INTEGRITY</span>
            <div className="chase-integrity-pips">
              {Array.from({ length: MAX_INTEGRITY }).map((_, i) => (
                <span key={i} className={`chase-pip ${i < integrity ? 'active' : ''}`} />
              ))}
            </div>
          </div>

          <div className="chase-metric-block wide">
            <div className="chase-distance-row">
              <span className="chase-hud-label">VALLEY BOUNDARY</span>
              <span className="chase-distance-val">{metersLeft}m</span>
            </div>
            <div className="chase-progress-track">
              <div className="chase-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>
      )}

      {stage === 'DRIVING' && (
        <div className="chase-controls-hint">
          Steer with <strong>A / D</strong> or <strong>← / →</strong> — Dodge Fallen Trees, Boulders &amp; Shadows!
        </div>
      )}

      {subtitle && <TypewriterSubtitle tag={subtitle.tag} text={subtitle.text} inCutscene={true} />}

      {isIntroCutscene && !paused && (
        <button type="button" className="skip-cutscene-minimal" onClick={handleStartDriving}>
          Skip [SPACE]
        </button>
      )}

      {stage === 'WRECKED' && (
        <div className="death-screen" role="alertdialog" aria-label="Vehicle Wrecked">
          <div className="death-content">
            <div className="death-eyebrow">ENGINE DESTROYED ON ROUTE 312</div>
            <h1 className="death-title">CONSUMED BY THE FOG</h1>
            <div className="death-divider" />
            <p className="death-whisper">
              &ldquo;The shadow caught up before you reached the valley boundary.&rdquo;
            </p>
            <div className="death-actions">
              <button type="button" className="death-btn primary" onClick={handleRetry}>
                Retry Escape Chase
              </button>
              <button type="button" className="death-btn" onClick={handleMenu}>
                Return to Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
