// ============================================================================
// src/pages/Sprint2Page.jsx
// Orchestrates Sprint 2 — The Drive to University, Campus Encounter, Sunset
// Time-Skip ("A few hours later..."), and interactive Evening Walk to Car
// ("Head to your car and drive to the cafe") with smooth fade-to-black into
// Sprint 3!
// ============================================================================

import React, { useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import TownWorld3D from '../components/TownWorld3D';
import TownDriveCutscene from '../components/TownDriveCutscene';
import CampusWorld3D from '../components/CampusWorld3D';
import CampusEncounter from '../components/CampusEncounter';
import SunsetTransition from '../components/SunsetTransition';
import EveningCampusController from '../components/EveningCampusController';
import ObjectiveHud from '../components/ObjectiveHud';
import SafeZoneBanner from '../components/SafeZoneBanner';
import useCutsceneSkip from '../hooks/useCutsceneSkip';
import { playDoorLatch } from '../components/MorningAudio';
import {
  startCampusAmbience,
  stopCampusAmbience,
} from '../components/AmbientMusicAudio';

function releasePointer() {
  if (document.pointerLockElement && document.exitPointerLock) {
    document.exitPointerLock();
  }
}

export default function Sprint2Page({
  settings,
  onReturnToMenu,
  onStartSprint3,
}) {
  const [stage, setStage] = useState('TOWN_DRIVE'); // 'TOWN_DRIVE' | 'CAMPUS_TALK' | 'SUNSET_SKIP' | 'EVENING_WALK'
  const [subtitle, setSubtitle] = useState(null);
  const [sunsetProgress, setSunsetProgress] = useState(0);
  const [hoverInteractable, setHoverInteractable] = useState(null);
  const [fadingToBlack, setFadingToBlack] = useState(false);

  const advanceStage = useCallback(() => {
    setSubtitle(null);
    setStage((cur) => {
      if (cur === 'TOWN_DRIVE') return 'CAMPUS_TALK';
      if (cur === 'CAMPUS_TALK') return 'SUNSET_SKIP';
      if (cur === 'SUNSET_SKIP') {
        setSunsetProgress(1);
        return 'EVENING_WALK';
      }
      return cur;
    });
  }, []);

  // Trigger smooth fade-to-black when player enters car at evening (keep pointer locked!)
  const handleEnterEveningCar = useCallback(() => {
    if (fadingToBlack) return;
    playDoorLatch(false);
    setHoverInteractable(null);
    setFadingToBlack(true);
    setTimeout(() => {
      onStartSprint3();
    }, 1050);
  }, [fadingToBlack, onStartSprint3]);

  // Safe debounced [SPACE] skip across Town Drive, Campus Talk & Sunset Time-Skip
  useCutsceneSkip(stage !== 'EVENING_WALK', advanceStage);

  const isTown = stage === 'TOWN_DRIVE';
  const isEveningWalk = stage === 'EVENING_WALK';

  // Play subtle Universiti Alam campus courtyard ambience during campus stages
  useEffect(() => {
    if (isTown) {
      stopCampusAmbience();
      return undefined;
    }
    startCampusAmbience();
    return () => stopCampusAmbience();
  }, [isTown]);

  const taskText = isTown
    ? 'Drive through town to morning classes at Universiti Alam'
    : stage === 'CAMPUS_TALK'
    ? 'Talk with Hakim outside the Academic Hall'
    : stage === 'SUNSET_SKIP'
    ? 'Finish today’s lectures and seminar notes'
    : 'Head to your car and drive to the cafe';

  return (
    <div className="chapter1-page">
      <button
        type="button"
        className="top-menu-escape-btn morning"
        onClick={() => {
          releasePointer();
          onReturnToMenu();
        }}
      >
        ← Menu
      </button>

      <Canvas dpr={[1, 1.5]} shadows camera={{ fov: 62, near: 0.08, far: 220, position: [0, 1.2, 10] }}>
        {isTown ? (
          <>
            <color attach="background" args={['#98c5f0']} />
            <fog attach="fog" args={['#cce2f7', 35, 160]} />
            <TownWorld3D />
            <TownDriveCutscene
              active={true}
              sensitivity={settings.sensitivity}
              onSubtitleChange={setSubtitle}
              onComplete={advanceStage}
            />
          </>
        ) : (
          <>
            <CampusWorld3D sunsetProgress={sunsetProgress} />
            <CampusEncounter
              active={stage === 'CAMPUS_TALK'}
              onSubtitleChange={setSubtitle}
              onComplete={advanceStage}
            />
            <SunsetTransition
              active={stage === 'SUNSET_SKIP'}
              holdEvening={false}
              onProgressChange={setSunsetProgress}
              onComplete={advanceStage}
            />
            <EveningCampusController
              enabled={isEveningWalk && !fadingToBlack}
              sensitivity={settings.sensitivity}
              onHoverInteractable={setHoverInteractable}
              onEnterCar={handleEnterEveningCar}
            />
          </>
        )}
      </Canvas>

      {/* Clean Borderless Top-Left Objective UI ("Chapter 1:") */}
      <ObjectiveHud chapterTitle="Chapter 1:" customTaskText={taskText} />

      {/* Centered Cinematic "A few hours later..." Time-Skip Intertitle */}
      {stage === 'SUNSET_SKIP' && (
        <div className="sunset-intertitle-overlay" aria-live="polite">
          <div className="sunset-intertitle-text">A few hours later...</div>
        </div>
      )}

      {/* Smooth Fade-to-Black Transition into Sprint 3 Highway Cutscene */}
      {fadingToBlack && <div className="fade-black-overlay" aria-hidden="true" />}

      {/* Large Centered Interaction Prompt & Film Subtitles */}
      <SafeZoneBanner
        hoverInteractable={hoverInteractable}
        subtitle={subtitle}
        isCutscene={!isEveningWalk}
        cutsceneTag={subtitle?.tag || ''}
        cutsceneCaption={subtitle?.text || ''}
        onSkipCutscene={advanceStage}
      />
    </div>
  );
}
