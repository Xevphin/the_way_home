// ============================================================================
// src/components/ObjectiveHud.jsx
// Clean borderless top-left objective UI matching the reference concept:
// - Bold warm-yellow header ("Chapter 1:") above crisp borderless white text
// - No dark translucent box, no colored left bar, no keybinds in task text
// ============================================================================

import React from 'react';
import { getMidnightChapter1Task } from '../data/midnightLandmarksData';

export default function ObjectiveHud({
  progress,
  customTaskText = null,
}) {
  const activeTaskText = customTaskText || (progress ? getMidnightChapter1Task(progress) : '');

  return (
    <aside className="minimal-task-hud" aria-live="polite">
      <div className="minimal-task-text">{activeTaskText}</div>
    </aside>
  );
}
