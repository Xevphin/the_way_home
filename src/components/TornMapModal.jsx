// ============================================================================
// src/components/TornMapModal.jsx
// Hand-drawn Oakside-Park-style trail loop map & checklist—ONLY viewable once
// scavenged inside Abandoned Stilt House #1. Renders an authentic chalk/ink
// branching forest trail diagram alongside the landmark checklist.
// ============================================================================

import React, { useEffect } from 'react';

export default function TornMapModal({ open, progress, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.code === 'Escape' || e.code === 'KeyM') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-label="Torn Hand-Drawn Valley Sketch">
      <div className="memo-paper-modal" onClick={(e) => e.stopPropagation()}>
        <div className="memo-top-stamp">
          <span>TORN SURVEYOR SKETCH • ROUTE 312</span>
          <span className="memo-red-stamp">OAKSIDE TRAILS</span>
        </div>

        <h2 className="memo-doc-title">Lembah Batu Looping Forest Trails (Hand-Drawn)</h2>

        {/* Authentic Oakside-Park-Style Hand-Drawn Looping Trail Diagram */}
        <svg
          viewBox="0 0 360 155"
          style={{
            width: '100%',
            height: '132px',
            background: '#121519',
            borderRadius: '6px',
            border: '1px solid #3f382b',
            marginBottom: '0.65rem',
          }}
          aria-label="Hand-drawn branching forest loop diagram"
        >
          {/* Main Route 312 Wet Asphalt Spine (Vertical Center) */}
          <line x1="180" y1="10" x2="180" y2="148" stroke="#64748b" strokeWidth="4" strokeDasharray="5,4" />
          {/* West Oakside Trail Loops (Sites 6, 7, 8, 9) */}
          <path
            d="M180,115 C140,115 110,122 108,104 C105,86 142,84 180,88 M108,104 C74,102 64,74 96,68 C124,62 152,72 180,74 M96,68 L54,68 M96,68 C62,54 58,28 96,24 C132,20 156,30 180,26"
            fill="none"
            stroke="#d6cbb5"
            strokeWidth="2.2"
          />
          {/* East Oakside Trail Loops (Sites 1, 2, 3, 4, 5) */}
          <path
            d="M180,124 C216,124 238,118 242,102 C246,84 292,88 286,66 C280,46 232,54 180,58 M242,102 C214,92 214,68 238,58 M262,56 C298,46 296,18 254,18 C222,18 206,32 180,34 M254,18 L254,36"
            fill="none"
            stroke="#d6cbb5"
            strokeWidth="2.2"
          />
          {/* Boxed Site Markers Matching Oakside Park Concept */}
          {[
            { x: 224, y: 112, label: 'SURAU' },
            { x: 256, y: 74, label: 'RUIN #2' },
            { x: 214, y: 48, label: 'SHED' },
            { x: 244, y: 8, label: 'WAKAF' },
            { x: 92, y: 102, label: 'HOUSE #1' },
            { x: 88, y: 60, label: 'OFFICE' },
            { x: 58, y: 34, label: 'TOWER' },
            { x: 102, y: 12, label: 'STALL' },
          ].map((s) => (
            <g key={s.label} transform={`translate(${s.x},${s.y})`}>
              <rect x="-24" y="-7" width="48" height="14" fill="#121519" stroke="#e2d8c3" strokeWidth="1.3" />
              <text x="0" y="3" textAnchor="middle" fill="#f1e9d2" fontSize="7.2" fontFamily="monospace" fontWeight="bold">
                {s.label}
              </text>
            </g>
          ))}
        </svg>

        <div className="torn-sketch-grid">
          <div className="sketch-row warn"><span>← NORTHWEST LOOP</span><strong>&ldquo;Do NOT stop at the lit warung&rdquo;</strong></div>
          <div className="sketch-row"><span>→ NORTHEAST LOOP</span><strong>Mossy Wakaf + Riddle Chest (6414) {progress?.hasStarterRelay ? '✓' : ''}</strong></div>
          <div className="sketch-row"><span>← WEST WATCHTOWER</span><strong>Ranger Watchtower (Posters &amp; Lore) {progress?.posterRead ? '✓' : ''}</strong></div>
          <div className="sketch-row"><span>→ EAST SHED LOOP</span><strong>Rubber Shed (Needs Iron Key → Battery) {progress?.hasBatteryCell ? '✓' : ''}</strong></div>
          <div className="sketch-row"><span>→ OUTER EAST RUIN</span><strong>Stilt House #2 (Heavy Crowbar) {progress?.hasCrowbar ? '✓' : ''}</strong></div>
          <div className="sketch-row"><span>← WEST OFFICE LOOP</span><strong>Forestry Office (Memo #04 + Iron Key) {progress?.hasIronKey ? '✓' : ''}</strong></div>
          <div className="sketch-row"><span>← WEST STILT LOOP</span><strong>Stilt House #1 (Pry Crate → Belt) {progress?.hasBelt ? '✓' : ''}</strong></div>
          <div className="sketch-row safe"><span>→ EAST SANCTUARY</span><strong>Kampung Surau (Sacred Light)</strong></div>
        </div>

        <div className="memo-footer-row">
          <span className="memo-hint">Press [M] or [ESC] to fold sketch</span>
          <button type="button" className="memo-close-btn" onClick={onClose}>
            Fold Sketch
          </button>
        </div>
      </div>
    </div>
  );
}
