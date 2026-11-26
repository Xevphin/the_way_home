// ============================================================================
// src/utils/appAudioSync.js
// Centralizes global master volume syncing and scene-audio teardown when
// returning to the Main Menu.
// ============================================================================

import { setMasterVolume } from '../components/shared/AudioEngine';
import { setMorningVolume } from '../components/shared/MorningAudio';
import { setRadioVolume } from '../components/chapter1/RadioAudio';
import { setForestAmbienceVolume } from '../components/chapter1/ForestAmbienceAudio';
import { setVoiceVolume } from '../components/shared/DialogueVoiceAudio';
import { setAmbientMusicVolume, stopAllSceneAmbience } from '../components/shared/AmbientMusicAudio';
import { setMenuAmbienceVolume } from '../components/shared/menuAmbience';
import { setJumpscareVolume } from '../components/shared/JumpscareAudio';
import { setChaseAudioVolume, stopEscapeChaseTheme } from '../components/chapter1/ChaseThemeAudio';
import {
  setChapter2AudioVolume,
  stopEndlessRoadDrone,
  stopPhoneBuzzLoop,
} from '../components/chapter2/Chapter2Audio';
import { setStudioAudioVolume, stopStudioAmbience } from '../components/chapter2/StudioAudio';
import {
  setFinaleAudioVolume,
  stopEndCreditsPiano,
  stopRevelationDrone,
} from '../components/chapter1/FinaleEndingAudio';

export function applyAllVolumes(vol) {
  setMasterVolume(vol);
  setMorningVolume(vol);
  setRadioVolume(vol);
  setForestAmbienceVolume(vol);
  setVoiceVolume(vol);
  setAmbientMusicVolume(vol);
  setMenuAmbienceVolume(vol);
  setJumpscareVolume(vol);
  setChaseAudioVolume(vol);
  setChapter2AudioVolume(vol);
  setStudioAudioVolume(vol);
  setFinaleAudioVolume(vol);
}

export function stopAllActiveAudio() {
  stopAllSceneAmbience();
  stopEscapeChaseTheme();
  stopEndlessRoadDrone();
  stopPhoneBuzzLoop();
  stopStudioAmbience();
  stopRevelationDrone();
  stopEndCreditsPiano();
}
