import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

const LOADING_STAGES = [
  'Analyzing your notes and identifying core themes...',
  'Extracting foundational concepts and key distinctions...',
  'Structuring active-recall cards and precision definitions...',
  'Verifying schema boundaries and pedagogical quality...',
];

export function LoadingState({ mode = 'flashcards', onCancel }) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % LOADING_STAGES.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="loading-header">
        <h2 className="loading-title">
          {mode === 'quiz' ? 'Generating your interactive quiz' : 'Generating your study set'}
        </h2>
        <div className="loading-status-text">
          <div className="pulse-dot" />
          <span>{LOADING_STAGES[stageIndex]}</span>
        </div>
      </div>

      {/* Shimmering Skeleton Card */}
      <div className="skeleton-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton-box" style={{ width: '80px', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '40px', height: '14px' }} />
        </div>

        <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton-box" style={{ width: '90%', height: '22px' }} />
          <div className="skeleton-box" style={{ width: '70%', height: '20px' }} />
          <div className="skeleton-box" style={{ width: '45%', height: '18px' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton-box" style={{ width: '120px', height: '12px' }} />
          <div className="skeleton-box" style={{ width: '80px', height: '12px' }} />
        </div>
      </div>

      {onCancel && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          style={{ margin: '0 auto' }}
        >
          <X size={14} />
          <span>Cancel request</span>
        </button>
      )}
    </div>
  );
}
