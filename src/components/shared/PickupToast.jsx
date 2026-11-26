// ============================================================================
// src/components/PickupToast.jsx
// Brief 1.2-second corner item pickup toast (e.g., "+ Alternator Belt",
// "+ Torn Hand-Drawn Map", "+ Starter Relay") shown on scavenging items.
// ============================================================================

import React from 'react';

export default function PickupToast({ toast }) {
  if (!toast) return null;
  return (
    <div key={toast.id} className="pickup-toast-pill" role="status" aria-live="polite">
      + {toast.label}
    </div>
  );
}
