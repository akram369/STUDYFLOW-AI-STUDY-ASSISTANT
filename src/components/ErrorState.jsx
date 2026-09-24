import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, Edit3, ChevronDown, ChevronUp } from 'lucide-react';

export function ErrorState({ error, onRetry, onEditInput }) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const title = error?.title || 'Study set couldn\'t be created';
  const message = error?.message || 'Something went wrong with the generated content. Try again.';
  const details = error?.details || null;

  return (
    <div className="error-container" role="alert">
      <div className="error-icon-wrapper" aria-hidden="true">
        <AlertTriangle size={24} />
      </div>

      <h2 className="error-title">{title}</h2>
      <p className="error-message">{message}</p>

      {details && (
        <div style={{ maxWidth: '500px', margin: '0 auto 20px', textAlign: 'left' }}>
          <button
            type="button"
            className="btn-ghost"
            style={{ fontSize: '0.75rem', padding: '4px 8px', color: 'var(--text-muted)' }}
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          >
            <span>{showTechnicalDetails ? 'Hide technical diagnosis' : 'View technical diagnosis'}</span>
            {showTechnicalDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showTechnicalDetails && (
            <pre
              style={{
                marginTop: '8px',
                padding: '10px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)}
            </pre>
          )}
        </div>
      )}

      <div className="error-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onEditInput}
        >
          <Edit3 size={15} />
          <span>Edit input</span>
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onRetry}
        >
          <RotateCcw size={15} />
          <span>Try again</span>
        </button>
      </div>
    </div>
  );
}
