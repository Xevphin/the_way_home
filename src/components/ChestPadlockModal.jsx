// ============================================================================
// src/components/ChestPadlockModal.jsx
// Interactive 4-digit brass padlock overlay at the Mossy Wakaf supply chest:
// - Displays an atmospheric environmental 4-digit riddle instead of a blatant
//   location spoiler (Code: 6 - 4 - 1 - 4):
//   * 6 carved timber pillars holding the sacred Surau roof
//   * 4 years since the forbidden Forestry permit (#LB-312/04) was signed
//   * 1-4 from the silent KM 14 valley milestone marker along the fog road
// - Unlocking awards Car Component #3: the Starter Relay!
// ============================================================================

import React, { useEffect, useState } from 'react';
import { playChoreChime } from './MorningAudio';

const TARGET_CODE = [6, 4, 1, 4];

export default function ChestPadlockModal({
  open,
  memoRead = false,
  milestoneRead = false,
  onUnlock,
  onClose,
}) {
  const [digits, setDigits] = useState([0, 0, 0, 0]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    setErrorMsg('');
    const onKey = (e) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const stepDigit = (idx, delta) => {
    setErrorMsg('');
    setDigits((prev) =>
      prev.map((d, i) => (i === idx ? (d + delta + 10) % 10 : d))
    );
  };

  const handleTryUnlock = () => {
    const match = digits.every((d, i) => d === TARGET_CODE[i]);
    if (match) {
      playChoreChime();
      onUnlock();
    } else {
      setErrorMsg('The brass tumblers resist. Read the carved riddle carefully.');
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-label="Supply Chest 4-Digit Riddle Padlock"
    >
      <div className="padlock-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="padlock-eyebrow">MOSSY WAKAF • LOCKED SUPPLY CHEST</div>
        <h2 className="padlock-title">Carved Brass Padlock</h2>

        <div className="padlock-hint found">
          <em>
            &ldquo;First, count the <strong>pillars</strong> holding the sacred Surau roof.
            Second, the <strong>years</strong> since the forbidden forestry road permit was signed
            {memoRead ? ' (04)' : ''}.
            Last two, the <strong>silent milestone</strong> standing along the fog road
            {milestoneRead ? ' (KM 14)' : ''}.&rdquo;
          </em>
        </div>

        <div className="padlock-wheels-row">
          {digits.map((val, idx) => (
            <div key={idx} className="padlock-wheel-col">
              <button type="button" className="padlock-step-btn" onClick={() => stepDigit(idx, 1)}>
                ▲
              </button>
              <div className="padlock-digit-box">{val}</div>
              <button type="button" className="padlock-step-btn" onClick={() => stepDigit(idx, -1)}>
                ▼
              </button>
            </div>
          ))}
        </div>

        {errorMsg && <div className="padlock-error-msg">{errorMsg}</div>}

        <div className="padlock-actions">
          <button type="button" className="menu-btn primary" onClick={handleTryUnlock}>
            Unlock Chest
          </button>
          <button type="button" className="memo-close-btn" onClick={onClose}>
            Cancel [ESC]
          </button>
        </div>
      </div>
    </div>
  );
}
