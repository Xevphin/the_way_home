// ============================================================================
// src/components/DocumentReaderModal.jsx
// Generalized crisp aged-paper reader supporting all 4 readable Lembah Batu
// lore documents: Forestry Memo, Missing Persons Poster, Local Newspaper,
// and Illegal Logging / Trail Closure Pamphlet.
// ============================================================================

import React, { useEffect } from 'react';
import { LORE_DOCUMENTS } from '../data/loreDocumentsData';

export default function DocumentReaderModal({ docId = null, onClose }) {
  const open = Boolean(docId && LORE_DOCUMENTS[docId]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.code === 'Escape' || e.code === 'KeyE' || e.code === 'Space') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const doc = LORE_DOCUMENTS[docId];

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-label={doc.title}
    >
      <article className="memo-paper-modal" onClick={(e) => e.stopPropagation()}>
        <div className="memo-top-stamp">
          <span>{doc.header}</span>
          <span className="memo-red-stamp">{doc.stamp || 'ARCHIVE'}</span>
        </div>

        <div className="memo-agency-line">{doc.agency}</div>
        <div className="memo-date-line">{doc.date}</div>

        <h2 className="memo-doc-title">{doc.title}</h2>

        <div className="memo-body-copy">
          {doc.paragraphs.map((para, idx) => (
            <p key={idx} className={idx === 2 ? 'memo-handwritten-warn' : ''}>
              {para}
            </p>
          ))}
        </div>

        <div className="memo-footer-row">
          <span className="memo-hint">Press [E] or [ESC] to put down</span>
          <button type="button" className="memo-close-btn" onClick={onClose}>
            Close Notice
          </button>
        </div>
      </article>
    </div>
  );
}
