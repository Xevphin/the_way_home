// ============================================================================
// src/components/PhoneTimeOverlay.jsx
// Clean diegetic smartphone lock-screen pop-up:
// - variant="cafe": 11:25 PM Friday Night at the cafe before driving home
// - variant="arrival": 02:47 AM Saturday morning after escaping Route 312
// ============================================================================

import React from 'react';

export default function PhoneTimeOverlay({ visible, variant = 'cafe' }) {
  if (!visible) return null;

  const isArrival = variant === 'arrival';

  return (
    <div
      className="phone-overlay-wrap"
      role="status"
      aria-label={isArrival ? 'Phone Screen 02:47 AM' : 'Phone Screen 11:25 PM'}
    >
      <div className="phone-device-frame">
        <div className="phone-status-bar">
          <span>{isArrival ? '4G • SIGNAL RESTORED' : '4G'}</span>
          <span>{isArrival ? '🔋 4%' : '🔋 18%'}</span>
        </div>
        <div className="phone-clock-big">{isArrival ? '02:47' : '11:25'}</div>
        <div className="phone-date-line">
          {isArrival ? 'Saturday • AM' : 'Friday Night • PM'}
        </div>

        {isArrival ? (
          <>
            <div className="phone-notif-pill">
              <div className="phone-notif-app">📍 LOCATION</div>
              <div className="phone-notif-body">Home — Safe Outside Lembah Batu</div>
            </div>
            <div className="phone-notif-pill">
              <div className="phone-notif-app">💬 HAFIZ</div>
              <div className="phone-notif-body">
                &ldquo;Bro you made it back okay? I&apos;ll drop by in the morning.&rdquo;
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="phone-notif-pill">
              <div className="phone-notif-app">⏰ ALARM SET</div>
              <div className="phone-notif-body">08:00 AM — Morning Lecture</div>
            </div>
            <div className="phone-notif-pill">
              <div className="phone-notif-app">💬 HAKIM</div>
              <div className="phone-notif-body">
                &ldquo;Don&apos;t stay out too late, see you in class!&rdquo;
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
