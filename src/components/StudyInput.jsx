import React from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { ModeSelector } from './ModeSelector.jsx';
import { DifficultySelector } from './DifficultySelector.jsx';
import { DevFailureSimulator } from './DevFailureSimulator.jsx';

export function StudyInput({
  input,
  setInput,
  mode,
  setMode,
  difficulty,
  setDifficulty,
  simulationMode,
  setSimulationMode,
  onSubmit,
  isLoading,
}) {
  const charCount = input.length;
  const isInputEmpty = charCount === 0;

  const handleKeyDown = (e) => {
    // Cmd+Enter or Ctrl+Enter to generate
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isInputEmpty && !isLoading) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="workspace-card" role="region" aria-label="Create study session workspace">
      <DevFailureSimulator
        value={simulationMode}
        onChange={setSimulationMode}
      />

      <div className="workspace-header">
        <h1 className="workspace-title">Create a study session</h1>
        <p className="workspace-subtitle">
          Paste notes, a topic, or anything you're learning.
        </p>
      </div>

      <div className="input-container">
        <textarea
          className="study-textarea"
          rows={6}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Explain JavaScript closures, async/await, and promises..."
          disabled={isLoading}
          aria-label="Study notes or topic input"
        />

        <div className="input-footer">
          <span>{charCount > 0 ? `${charCount} characters` : 'Minimum ~15 characters recommended'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {charCount > 0 && !isLoading && (
              <button
                type="button"
                className="btn-ghost"
                style={{ fontSize: '0.8rem', padding: '2px 6px' }}
                onClick={() => setInput('')}
              >
                Clear
              </button>
            )}
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Press Ctrl+Enter to submit</span>
          </div>
        </div>
      </div>

      <div className="workspace-controls">
        <div className="selectors-group">
          <ModeSelector
            mode={mode}
            onChange={setMode}
            disabled={isLoading}
          />

          <DifficultySelector
            difficulty={difficulty}
            onChange={setDifficulty}
            disabled={isLoading}
          />
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={isInputEmpty || isLoading}
          aria-label="Generate study set"
        >
          <span>Generate study set</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
