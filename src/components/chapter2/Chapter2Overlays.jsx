// ============================================================================
// src/components/chapter2/Chapter2Overlays.jsx
// HUD & cinematic UI overlays for Chapter 2 ("Unknown Mystery"):
// - Eyelid wake-up bars, white-to-black nightmare flash, Chapter 2 title &
//   auto-unmounting floating credits, ObjectiveHud, prompts, subtitles & wrap
// ============================================================================

import React from 'react';
import ChapterTitleCard from '../shared/ChapterTitleCard';
import OpeningCreditsOverlay from '../shared/OpeningCreditsOverlay';
import ObjectiveHud from '../shared/ObjectiveHud';
import TypewriterSubtitle from '../shared/TypewriterSubtitle';
import { getChapter2MorningTask } from '../../data/chapter2/chapter2Data';

export default function Chapter2Overlays({
  stage,
  paused,
  isCutscene,
  creditsDone,
  jumpscareActive,
  wakeFlash,
  completedChores,
  hoverInteractable,
  subtitle,
  onCreditsDone,
  onSkipCutscene,
  onReturnToMenu,
}) {
  const showCrosshair =
    (stage === 'GAMEPLAY_1' || stage === 'GAMEPLAY_2' || stage === 'CH2_STUDIO_BREAK') &&
    !paused &&
    !jumpscareActive;

  return (
    <>
      {stage === 'CUTSCENE_1' && (
        <>
          <div className="ch2-eyelid-bar top" aria-hidden="true" />
          <div className="ch2-eyelid-bar bottom" aria-hidden="true" />
        </>
      )}

      {wakeFlash && <div className="ch2-wake-flash" aria-hidden="true" />}

      {stage === 'GAMEPLAY_1' && (
        <>
          <ChapterTitleCard active={true} title="CHAPTER 2" subtitle="Unknown Mystery" />
          {!creditsDone && <OpeningCreditsOverlay active={true} onFinished={onCreditsDone} />}
          {!paused && <ObjectiveHud customTaskText="Walk down the endless Route 312 road" />}
        </>
      )}

      {stage === 'GAMEPLAY_2' && !paused && (
        <ObjectiveHud customTaskText={getChapter2MorningTask(completedChores)} />
      )}

      {stage === 'CH2_STUDIO_BREAK' && !paused && (
        <ObjectiveHud customTaskText="Take a break with the cast & crew — exit the studio when ready" />
      )}

      {showCrosshair && (
        <>
          <div className="center-reticle-dot" />
          {hoverInteractable && (
            <div className="center-control-prompt" role="status">
              <div className="center-prompt-headline">{hoverInteractable.keyLabel}</div>
              <div className="center-prompt-subtext">{hoverInteractable.actionLabel}</div>
            </div>
          )}
        </>
      )}

      {subtitle && !jumpscareActive && (
        <TypewriterSubtitle tag={subtitle.tag} text={subtitle.text} inCutscene={isCutscene} />
      )}

      {isCutscene && !paused && (
        <button type="button" className="skip-cutscene-minimal" onClick={onSkipCutscene}>
          Skip [SPACE]
        </button>
      )}

      {stage === 'COMPLETE' && (
        <div className="death-screen" role="dialog" aria-label="Chapter 2 Complete">
          <div className="death-content">
            <div className="death-eyebrow">CHAPTER 2 • BEHIND THE SCENES</div>
            <h1 className="death-title">THAT&apos;S A WRAP!</h1>
            <div className="death-divider" />
            <p className="death-whisper">
              &ldquo;Go take a break with the rest of the actors—Chapter 2 filming continues shortly.&rdquo;
            </p>
            <div className="death-actions">
              <button type="button" className="death-btn primary" onClick={onReturnToMenu}>
                Return to Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
