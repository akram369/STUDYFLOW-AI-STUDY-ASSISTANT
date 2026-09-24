import React from 'react';

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

export function DifficultySelector({ difficulty, onChange, disabled }) {
  return (
    <div className="difficulty-group">
      <span className="control-label" id="diff-label">Level:</span>
      <div className="segmented-control" role="radiogroup" aria-labelledby="diff-label">
        {DIFFICULTIES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={difficulty === id}
            disabled={disabled}
            className={`segment-btn ${difficulty === id ? 'active' : ''}`}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
