// ============================================================================
// src/pages/Chapter2LoadingPage.jsx
// Chapter 2 Quranic Verse Loading Screen (Surah Al-Mu'minun • 23:97):
// - Reuses LoadingPage's clean dust-mote canvas, Amiri Arabic typography,
//   staggered fade-in, and thin golden progress bar (zero keybind pills!)
// ============================================================================

import React from 'react';
import LoadingPage from './LoadingPage';

const CHAPTER2_VERSE = {
  arabic: 'وَقُل رَّبِّ أَعُوذُ بِكَ مِنۡ هَمَزَٰتِ ٱلشَّيَٰطِينِ',
  translation:
    '"And say, \'My Lord, I seek refuge in You from the incitements of the devils.\'"',
  citation: "SURAH AL-MU'MINUN • 23:97",
};

export default function Chapter2LoadingPage({ onFinishedLoading }) {
  return <LoadingPage verse={CHAPTER2_VERSE} onFinishedLoading={onFinishedLoading} />;
}
