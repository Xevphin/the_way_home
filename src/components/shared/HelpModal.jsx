// ============================================================================
// src/components/HelpModal.jsx
// Dedicated smoked-glass Controls Guide modal accessible from both
// the Main Menu ("Help") and the in-game [ESC] Pause Overlay ("Help").
// Features stylized tactile keycap badges.
// ============================================================================

import React from 'react';

const CONTROL_ROWS = [
  { keys: ['W', 'A', 'S', 'D'], label: 'Move around / Steer during escape' },
  { keys: ['SHIFT'], label: 'Sprint (uses stamina while fleeing)' },
  { keys: ['E'], label: 'Interact, inspect clues & pick up items' },
  { keys: ['F'], label: 'Toggle flashlight beam on / off' },
  { keys: ['SPACE'], label: 'Skip active cutscene' },
  { keys: ['ESC'], label: 'Pause game & adjust settings' },
];

export default function HelpModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop help-backdrop"
      role="dialog"
      aria-label="Controls Guide"
      onClick={onClose}
    >
      <div className="glass-modal help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div>
            <div className="glass-eyebrow">FIELD GUIDE</div>
            <h2 className="subpanel-title">Controls Guide</h2>
          </div>
          <button type="button" className="modal-x-btn" onClick={onClose} aria-label="Close Help">
            ✕
          </button>
        </div>

        <div className="glass-hairline" />

        <div className="help-section-label">KEYBINDINGS</div>
        <div className="help-keybind-list">
          {CONTROL_ROWS.map((row) => (
            <div key={row.label} className="help-keybind-row">
              <div className="keycap-group">
                {row.keys.map((k) => (
                  <kbd key={k} className="keycap-badge">
                    {k}
                  </kbd>
                ))}
              </div>
              <span className="help-keybind-desc">{row.label}</span>
            </div>
          ))}
        </div>

        <div className="glass-footer-actions">
          <button type="button" className="glass-btn primary" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}