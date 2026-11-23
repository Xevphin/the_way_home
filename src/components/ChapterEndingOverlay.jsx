// ============================================================================
// src/components/ChapterEndingOverlay.jsx
// Unified Chapter 1 conclusion screen shown after investigating the stalled
// car, discovering the illegal Forestry Memo, surviving the Phantom Roadside
// Stall hallucination, and reaching the Far Valley Road descent.
// ============================================================================

import React from 'react';

export default function ChapterEndingOverlay({ progress, onReturnToMenu }) {
  return (
    <div className="demo-ending-overlay" role="dialog" aria-label="End of Chapter 1">
      <div className="demo-ending-card">
        <div className="ending-badge">CHAPTER 1 COMPLETE • ROUTE 312 LEMBAH BATU</div>
        <h1 className="ending-title">
          The Way Home — Deeper Into the Valley
        </h1>
        <p className="ending-description">
          Behind you, the phantom warung stands rotted and empty in the pitch-black
          trees. Amir&apos;s warning was real—this illegal forest road was never meant
          to be cut through Lembah Batu, and whatever lives beneath these trees now
          knows you are walking home alone.
        </p>
        <div className="ending-summary-box">
          <div>✓ Inspected the Stalled Sedan After the Midnight Impact</div>
          <div>✓ Discovered the Illegal Forestry Road Construction Memo</div>
          <div>✓ Survived the Phantom Roadside Warung Hallucination</div>
          {progress?.milestoneRead && <div>✓ Found the Closed KM 14 Road Milestone</div>}
          {progress?.shelterRead && <div>✓ Read the Abandoned Surveyor&apos;s Logbook</div>}
        </div>
        <button type="button" className="menu-btn primary" onClick={onReturnToMenu}>
          Return to Main Menu
        </button>
      </div>
    </div>
  );
}
