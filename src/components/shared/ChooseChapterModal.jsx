// ============================================================================
// src/components/ChooseChapterModal.jsx
// Telltale-style dark-glass "Choose Chapter" horizontal carousel screen:
// - Supports left/right arrow buttons, ArrowLeft/ArrowRight & A/D keys,
//   Enter to launch, Escape to close, and horizontal mouse/touch swipe/drag
// - Renders live procedural 16:9 HTML5 <canvas> key-art for Chapter 1 & 2
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { CHAPTER_CARDS, drawChapterKeyArt } from '../../data/shared/chapterKeyArt';

function ChapterArtCanvas({ chapterId }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    drawChapterKeyArt(canvasRef.current, chapterId);
  }, [chapterId]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      className="chapter-card-canvas"
      aria-hidden="true"
    />
  );
}

export default function ChooseChapterModal({ open, onSelectChapter, onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dragStartXRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(0, i - 1));
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(CHAPTER_CARDS.length - 1, i + 1));
      } else if (e.code === 'Enter') {
        e.preventDefault();
        onSelectChapter(CHAPTER_CARDS[selectedIndex].id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, selectedIndex, onSelectChapter, onClose]);

  if (!open) return null;

  const handlePointerDown = (e) => {
    dragStartXRef.current = e.clientX;
  };

  const handlePointerUp = (e) => {
    if (dragStartXRef.current === null) return;
    const deltaX = e.clientX - dragStartXRef.current;
    dragStartXRef.current = null;
    if (deltaX < -42) {
      setSelectedIndex((i) => Math.min(CHAPTER_CARDS.length - 1, i + 1));
    } else if (deltaX > 42) {
      setSelectedIndex((i) => Math.max(0, i - 1));
    }
  };

  return (
    <div
      className="modal-backdrop choose-chapter-backdrop"
      onClick={onClose}
      role="dialog"
      aria-label="Choose Chapter"
    >
      <div
        className="choose-chapter-shell"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <div className="choose-chapter-header">
          <div>
            <div className="glass-eyebrow">THE WAY HOME • STORY CHAPTERS</div>
            <h2 className="choose-chapter-heading">Choose Chapter</h2>
          </div>
          <button
            type="button"
            className="modal-x-btn"
            onClick={onClose}
            aria-label="Close Choose Chapter"
          >
            ✕
          </button>
        </div>

        <div className="chapter-carousel-stage">
          <button
            type="button"
            className="chapter-nav-arrow left"
            onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}
            disabled={selectedIndex === 0}
            aria-label="Previous Chapter"
          >
            ‹
          </button>

          <div className="chapter-carousel-viewport">
            <div
              className="chapter-carousel-track"
              style={{ transform: `translateX(${(0.5 - selectedIndex) * 14}%)` }}
            >
              {CHAPTER_CARDS.map((card, idx) => {
                const isActive = idx === selectedIndex;
                return (
                  <article
                    key={card.id}
                    className={`chapter-card ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedIndex(idx)}
                  >
                    <div className="chapter-card-art-wrap">
                      <ChapterArtCanvas chapterId={card.id} />
                      <span className="chapter-card-badge">{card.badge}</span>
                    </div>
                    <div className="chapter-card-body">
                      <h3 className="chapter-card-title">{card.title}</h3>
                      <div className="chapter-card-subtitle">{card.subtitle}</div>
                      <p className="chapter-card-desc">{card.description}</p>
                      <button
                        type="button"
                        className="chapter-card-play-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectChapter(card.id);
                        }}
                      >
                        Play {card.badge}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="chapter-nav-arrow right"
            onClick={() => setSelectedIndex((i) => Math.min(CHAPTER_CARDS.length - 1, i + 1))}
            disabled={selectedIndex === CHAPTER_CARDS.length - 1}
            aria-label="Next Chapter"
          >
            ›
          </button>
        </div>

        <div className="chapter-carousel-hint">
          Use <strong>← / →</strong>, <strong>A / D</strong>, or swipe to browse chapters
        </div>
      </div>
    </div>
  );
}
