// ============================================================================
// src/components/SaveIconToast.jsx
// Clean, unobtrusive top-corner auto-save icon pulse whenever Chapter 1
// stage progress or a Safe Zone sanctuary checkpoint saves to localStorage.
// ============================================================================

import React from 'react';

export default function SaveIconToast({ visible }) {
  if (!visible) return null;

  return (
    <div className="autosave-pill" role="status" aria-live="polite">
      <span className="autosave-ring" aria-hidden="true" />
      <span className="autosave-text">SAVING</span>
    </div>
  );
}
