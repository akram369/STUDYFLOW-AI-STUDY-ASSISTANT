import React, { useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { Flashcard } from './Flashcard.jsx';
import { ProgressBar } from './ProgressBar.jsx';

export function FlashcardSession({
  session,
  onNewSession,
}) {
  const {
    activeSet,
    rootStudySet,
    isSubSession,
    cardIndex,
    currentCard,
    isFlipped,
    knownCardIds,
    reviewCardIds,
    isCardSessionFinished,
    flipCard,
    nextCard,
    prevCard,
    markKnown,
    markReview,
    startReviewMissedCards,
    restartCardSession,
  } = session;

  const totalCards = activeSet?.cards?.length || 0;
  const isFirstCard = cardIndex === 0;
  const isLastCard = cardIndex === totalCards - 1;

  const isCurrentKnown = currentCard ? knownCardIds.has(currentCard.id) : false;
  const isCurrentReview = currentCard ? reviewCardIds.has(currentCard.id) : false;

  const totalMissed = reviewCardIds.size;
  const totalMastered = knownCardIds.size;
  const originalTotal = rootStudySet?.cards?.length || totalCards;

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextCard();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevCard();
      } else if (e.key === ' ' || e.key === 'Enter') {
        // Space/Enter flips
        e.preventDefault();
        flipCard();
      } else if (e.key.toLowerCase() === 'k' || e.key === '1') {
        e.preventDefault();
        markKnown();
      } else if (e.key.toLowerCase() === 'r' || e.key === '2') {
        e.preventDefault();
        markReview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextCard, prevCard, flipCard, markKnown, markReview]);

  // Session Summary / Completion View
  if (isCardSessionFinished) {
    return (
      <div className="summary-card" role="region" aria-label="Flashcards study summary">
        <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', marginBottom: '16px' }}>
          <CheckCircle size={36} />
        </div>

        <h2 className="summary-title">Deck Completed!</h2>
        <p className="summary-desc">
          You've completed this active-recall pass of "{activeSet.title}".
        </p>

        <div className="summary-stats-grid">
          <div className="stat-box">
            <div className="stat-label">Mastered Cards</div>
            <div className="stat-value" style={{ color: 'var(--color-success)' }}>
              {totalMastered} / {originalTotal}
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Marked for Review</div>
            <div className="stat-value" style={{ color: totalMissed > 0 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
              {totalMissed}
            </div>
          </div>
        </div>

        <div className="summary-actions">
          {totalMissed > 0 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={startReviewMissedCards}
            >
              <RotateCcw size={15} />
              <span>Review missed cards ({totalMissed})</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={restartCardSession}
          >
            <RotateCcw size={15} />
            <span>Restart full deck</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onNewSession}
          >
            <Sparkles size={15} />
            <span>New study set</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="flashcard-session">
      {/* Session Toolbar */}
      <div className="session-toolbar">
        <div className="session-title-group">
          <span className="session-badge">
            {isSubSession ? 'Missed Cards Review' : 'Flashcards'}
          </span>
          <h2 className="session-heading">{activeSet.title}</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Card {cardIndex + 1} of {totalCards}
          </span>
          {isSubSession && (
            <button
              type="button"
              className="btn-ghost"
              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
              onClick={restartCardSession}
              title="Return to full deck"
            >
              Exit to full deck
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar current={cardIndex + 1} total={totalCards} />

      {/* Interactive 3D Card */}
      <Flashcard
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={flipCard}
        cardNumber={cardIndex + 1}
        totalCards={totalCards}
        isKnown={isCurrentKnown}
        isReview={isCurrentReview}
      />

      {/* Navigation and Recall Decision Controls */}
      <div className="card-actions-bar">
        {/* Previous Button */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={prevCard}
          disabled={isFirstCard}
          aria-label="Previous card"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        {/* Self-Assessment Decision Controls */}
        <div className="decision-buttons">
          <button
            type="button"
            className={`btn btn-review ${isCurrentReview ? 'active' : ''}`}
            onClick={markReview}
            title="Mark for review (Shortcut: R or 2)"
          >
            <RotateCcw size={15} />
            <span>Review again</span>
          </button>

          <button
            type="button"
            className={`btn btn-known ${isCurrentKnown ? 'active' : ''}`}
            onClick={markKnown}
            title="Mark as known (Shortcut: K or 1)"
          >
            <Check size={15} />
            <span>I know this</span>
          </button>
        </div>

        {/* Next Button */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={nextCard}
          aria-label={isLastCard ? 'Finish session' : 'Next card'}
        >
          <span>{isLastCard ? 'Finish' : 'Next'}</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Helpful keyboard navigation hint on desktop */}
      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Keyboard: <kbd>Space</kbd> flip &bull; <kbd>&larr;</kbd> <kbd>&rarr;</kbd> navigate &bull; <kbd>K</kbd> know &bull; <kbd>R</kbd> review
      </div>
    </div>
  );
}
