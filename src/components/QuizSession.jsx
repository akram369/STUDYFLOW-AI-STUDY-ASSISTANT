import React, { useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { ProgressBar } from './ProgressBar.jsx';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function QuizSession({
  session,
  onNewSession,
}) {
  const {
    activeSet,
    rootStudySet,
    isSubSession,
    quizIndex,
    currentQuestion,
    selectedAnswers,
    isQuizCompleted,
    quizScore,
    selectQuizAnswer,
    nextQuestion,
    prevQuestion,
    retryMissedQuestions,
    restartQuiz,
  } = session;

  const totalQuestions = activeSet?.questions?.length || 0;
  const isFirst = quizIndex === 0;
  const isLast = quizIndex === totalQuestions - 1;

  const currentQId = currentQuestion?.id;
  const selectedOptionIdx = currentQId ? selectedAnswers[currentQId] : undefined;
  const isAnswered = selectedOptionIdx !== undefined;
  const isCorrect = isAnswered && selectedOptionIdx === currentQuestion.correctAnswer;

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      // Number keys 1-4 or letters A-D to select option before answering
      if (!isAnswered && currentQuestion) {
        const key = e.key.toUpperCase();
        const letterIdx = OPTION_LETTERS.indexOf(key);
        if (letterIdx !== -1 && letterIdx < currentQuestion.options.length) {
          e.preventDefault();
          selectQuizAnswer(letterIdx);
          return;
        }

        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= currentQuestion.options.length) {
          e.preventDefault();
          selectQuizAnswer(num - 1);
          return;
        }
      }

      // Next / Prev
      if (e.key === 'ArrowRight' || (e.key === 'Enter' && isAnswered)) {
        e.preventDefault();
        nextQuestion();
      } else if (e.key === 'ArrowLeft' && isAnswered) {
        e.preventDefault();
        prevQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, currentQuestion, selectQuizAnswer, nextQuestion, prevQuestion]);

  // Quiz Completion / Score View
  if (isQuizCompleted) {
    const missedCount = quizScore.total - quizScore.correct;

    return (
      <div className="summary-card" role="region" aria-label="Quiz completion results">
        <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)', marginBottom: '16px' }}>
          <Trophy size={36} />
        </div>

        <div className="summary-score-large">
          {quizScore.correct} / {quizScore.total}
        </div>

        <h2 className="summary-title">Quiz Completed!</h2>
        <p className="summary-desc">
          You achieved {quizScore.percentage}% accuracy on "{activeSet.title}".
        </p>

        <div className="summary-stats-grid">
          <div className="stat-box">
            <div className="stat-label">Accuracy</div>
            <div className="stat-value" style={{ color: quizScore.percentage >= 70 ? 'var(--color-success)' : 'var(--color-warning)' }}>
              {quizScore.percentage}%
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Missed Questions</div>
            <div className="stat-value" style={{ color: missedCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
              {missedCount}
            </div>
          </div>
        </div>

        <div className="summary-actions">
          {missedCount > 0 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={retryMissedQuestions}
            >
              <RotateCcw size={15} />
              <span>Retry missed questions ({missedCount})</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={restartQuiz}
          >
            <RotateCcw size={15} />
            <span>Restart full quiz</span>
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

  if (!currentQuestion) return null;

  return (
    <div className="quiz-session">
      {/* Session Toolbar */}
      <div className="session-toolbar">
        <div className="session-title-group">
          <span className="session-badge">
            {isSubSession ? 'Missed Questions Retry' : 'Active Recall Quiz'}
          </span>
          <h2 className="session-heading">{activeSet.title}</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Question {quizIndex + 1} of {totalQuestions}
          </span>
          {isSubSession && (
            <button
              type="button"
              className="btn-ghost"
              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
              onClick={restartQuiz}
              title="Return to full quiz"
            >
              Exit to full quiz
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar current={quizIndex + 1} total={totalQuestions} />

      {/* Quiz Card */}
      <div className="quiz-card">
        <h3 className="quiz-question-title">{currentQuestion.question}</h3>

        <div className="quiz-options-list" role="radiogroup" aria-label="Question options">
          {currentQuestion.options.map((optText, idx) => {
            const letter = OPTION_LETTERS[idx] || String(idx + 1);
            let optionStateClass = '';

            if (isAnswered) {
              if (idx === currentQuestion.correctAnswer) {
                optionStateClass = 'is-correct';
              } else if (idx === selectedOptionIdx) {
                optionStateClass = 'is-wrong';
              } else {
                optionStateClass = 'is-unselected-distractor';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                role="radio"
                aria-checked={selectedOptionIdx === idx}
                disabled={isAnswered}
                className={`quiz-option-btn ${optionStateClass}`}
                onClick={() => selectQuizAnswer(idx)}
              >
                <div className="quiz-letter-badge">{letter}</div>
                <div style={{ flex: 1 }}>{optText}</div>
                {isAnswered && idx === currentQuestion.correctAnswer && (
                  <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                )}
                {isAnswered && idx === selectedOptionIdx && idx !== currentQuestion.correctAnswer && (
                  <XCircle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Post-Answer Explanation Banner */}
        {isAnswered && (
          <div className="explanation-box" role="region" aria-live="polite">
            <div className="explanation-title">
              {isCorrect ? (
                <>
                  <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
                  <span style={{ color: 'var(--color-success)' }}>Correct!</span>
                </>
              ) : (
                <>
                  <XCircle size={16} style={{ color: 'var(--color-danger)' }} />
                  <span style={{ color: 'var(--color-danger)' }}>Incorrect</span>
                </>
              )}
            </div>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="card-actions-bar">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={prevQuestion}
          disabled={isFirst}
          aria-label="Previous question"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        {isAnswered ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={nextQuestion}
            aria-label={isLast ? 'View results' : 'Next question'}
          >
            <span>{isLast ? 'Finish Quiz' : 'Next question'}</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Select an option to proceed
          </span>
        )}
      </div>

      {/* Keyboard hints */}
      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Keyboard: Press <kbd>1</kbd>–<kbd>4</kbd> or <kbd>A</kbd>–<kbd>D</kbd> to select &bull; <kbd>Enter</kbd> for next
      </div>
    </div>
  );
}
