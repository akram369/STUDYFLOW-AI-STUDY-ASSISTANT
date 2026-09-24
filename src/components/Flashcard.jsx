import React from 'react';
import { RotateCw, CheckCircle2, BookOpen } from 'lucide-react';

export function Flashcard({
  card,
  isFlipped,
  onFlip,
  cardNumber,
  totalCards,
  isKnown,
  isReview,
}) {
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onFlip();
    }
  };

  const isQuestionLong = card.question && card.question.length > 180;
  const isAnswerLong = card.answer && card.answer.length > 180;

  return (
    <div
      className="card-scene"
      onClick={onFlip}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Flashcard ${cardNumber} of ${totalCards}. ${isFlipped ? 'Answer shown. Press Space to flip to question.' : 'Question shown. Press Space to flip to answer.'}`}
      aria-pressed={isFlipped}
    >
      <div className={`card-flipper ${isFlipped ? 'is-flipped' : ''}`}>
        {/* Front Face: Question */}
        <div className="card-face card-face-front">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-tag">
              <BookOpen size={13} />
              Question &bull; {cardNumber} of {totalCards}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {isKnown && (
                <span className="card-tag" style={{ color: 'var(--color-success)' }}>
                  ✓ Mastered
                </span>
              )}
              {isReview && (
                <span className="card-tag" style={{ color: 'var(--color-warning)' }}>
                  ↻ Review Marked
                </span>
              )}
            </div>
          </div>

          <div className="card-body-scroll">
            <p className={`card-content-text ${isQuestionLong ? 'is-long' : ''}`}>
              {card.question}
            </p>
          </div>

          <div className="card-hint">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <RotateCw size={13} />
              Click card or press Space to reveal answer
            </span>
          </div>
        </div>

        {/* Back Face: Answer */}
        <div className="card-face card-face-back">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-tag" style={{ color: 'var(--accent)' }}>
              <CheckCircle2 size={13} />
              Answer &bull; {cardNumber} of {totalCards}
            </span>
            <span className="card-tag">Key Concept</span>
          </div>

          <div className="card-body-scroll">
            <p className={`card-content-text ${isAnswerLong ? 'is-long' : ''}`}>
              {card.answer}
            </p>
          </div>

          <div className="card-hint">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <RotateCw size={13} />
              Click card or press Space to return to prompt
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
