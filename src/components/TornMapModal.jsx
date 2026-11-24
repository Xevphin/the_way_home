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

        {/* Clean Hand-Drawn Torn Surveyor Map Diagram Only (Zero Spoiler Legend List!) */}
        <svg
          viewBox="0 0 360 175"
          style={{
            width: '100%',
            height: '215px',
            background: '#121519',
            borderRadius: '6px',
            border: '1px solid #3f382b',
            marginBottom: '0.85rem',
          }}
          aria-label="Hand-drawn branching forest loop diagram"
        >
          {/* Main Route 312 Wet Asphalt Spine (Vertical Center) */}
          <line x1="180" y1="10" x2="180" y2="165" stroke="#64748b" strokeWidth="4" strokeDasharray="5,4" />
          {/* West Oakside Trail Loops */}
          <path
            d="M180,126 C138,126 106,132 104,114 C101,94 140,92 180,96 M104,114 C70,112 60,82 94,74 C124,68 152,78 180,80 M94,74 L48,74 M94,74 C58,58 54,30 94,24 C132,20 156,30 180,26"
            fill="none"
            stroke="#d6cbb5"
            strokeWidth="2.3"
          />
          {/* East Oakside Trail Loops */}
          <path
            d="M180,136 C218,136 240,128 244,112 C248,92 296,96 290,72 C284,50 234,58 180,62 M244,112 C214,100 214,74 240,62 M264,60 C302,48 300,18 256,18 C222,18 206,34 180,36 M256,18 L256,38"
            fill="none"
            stroke="#d6cbb5"
            strokeWidth="2.3"
          />
          {/* Boxed Site Markers Matching Oakside Hand-Drawn Map */}
          {[
            { x: 226, y: 122, label: 'SURAU' },
            { x: 266, y: 80, label: 'RUIN #1' },
            { x: 218, y: 52, label: 'SHED' },
            { x: 248, y: 12, label: 'WAKAF' },
            { x: 90, y: 112, label: 'HOUSE #1' },
            { x: 86, y: 66, label: 'OFFICE' },
            { x: 52, y: 38, label: 'TOWER' },
            { x: 100, y: 14, label: 'STALL' },
          ].map((s) => (
            <g key={s.label} transform={`translate(${s.x},${s.y})`}>
              <rect x="-25" y="-7.5" width="50" height="15" fill="#121519" stroke="#e2d8c3" strokeWidth="1.3" />
              <text x="0" y="3" textAnchor="middle" fill="#f1e9d2" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                {s.label}
              </text>
            </g>
          ))}
        </svg>

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
