// ============================================================================
// src/components/SceneSelectModal.jsx
// Clean Main Menu Chapter 1 Scene Select drawer unlocked once the player
// completes Chapter 1 (persisted in localStorage).
// ============================================================================

import React from 'react';

const CHAPTER1_SCENES = [
  {
    id: 'CHAPTER_1',
    title: '01 • Morning Routine',
    desc: '08:15 AM sunlit home chores & Amir at the porch',
  },
  {
    id: 'SPRINT_2',
    title: '02 • Universiti Alam',
    desc: 'Town drive & campus courtyard conversation with Hakim',
  },
  {
    id: 'SPRINT_4',
    title: '03 • Late-Night Cafe & Route 312 Detour',
    desc: '11:25 PM farewell & turning onto 312 Lembah Batu',
  },
  {
    id: 'MIDNIGHT_FOREST',
    title: '04 • Route 312 Midnight Forest',
    desc: 'FM radio crash, Surau Elder, car-repair scavenging & riddle chest',
  },
  {
    id: 'ESCAPE_CHASE',
    title: '05 • The Escape Chase',
    desc: 'Enraged Shadow Lurker & high-speed forest road sprint',
  },
  {
    id: 'USTAZ_DOME',
    title: '06 • Ustaz Light Dome & 2:47 AM Arrival',
    desc: 'Sacred golden barrier & making it home safely',
  },
  {
    id: 'SOFA_REVELATION',
    title: '07 • Sofa Revelation & Finale Credits',
    desc: 'Hafiz revelation, Jinn flashback, movie credits & post-credits teaser',
  },
];

export default function SceneSelectModal({ open, onSelectScene, onClose }) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-label="Chapter 1 Scene Select"
    >
      <div className="translucent-modal scene-select-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div>
            <div className="pause-eyebrow">CHAPTER 1 COMPLETED • UNLOCKED</div>
            <h2 className="subpanel-title">Chapter 1 Scene Select</h2>
          </div>
          <button type="button" className="modal-x-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="scene-select-list">
          {CHAPTER1_SCENES.map((sc) => (
            <button
              key={sc.id}
              type="button"
              className="scene-select-item"
              onClick={() => onSelectScene(sc.id)}
            >
              <span className="scene-select-title">{sc.title}</span>
              <span className="scene-select-desc">{sc.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
