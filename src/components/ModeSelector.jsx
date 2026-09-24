import React from 'react';
import { Layers, HelpCircle } from 'lucide-react';

export function ModeSelector({ mode, onChange, disabled }) {
  return (
    <div className="segmented-control" role="radiogroup" aria-label="Study mode selection">
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'flashcards'}
        disabled={disabled}
        className={`segment-btn ${mode === 'flashcards' ? 'active' : ''}`}
        onClick={() => onChange('flashcards')}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} />
          Flashcards
        </span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={mode === 'quiz'}
        disabled={disabled}
        className={`segment-btn ${mode === 'quiz' ? 'active' : ''}`}
        onClick={() => onChange('quiz')}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <HelpCircle size={14} />
          Quiz
        </span>
      </button>
    </div>
  );
}
