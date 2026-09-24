import React from 'react';
import { Sparkles, Terminal, Database, Leaf, Landmark } from 'lucide-react';

const SUGGESTIONS = [
  { label: 'JavaScript Closures & Async', query: 'Explain JavaScript closures, the event loop, and how Promises handle asynchronous microtasks.' },
  { label: 'React Hooks & Virtual DOM', query: 'React hooks rules, reconciliation, useEffect lifecycle, and state optimization patterns.' },
  { label: 'Database Normalization', query: 'Relational database normalization: 1NF, 2NF, 3NF, BCNF, and ACID transaction guarantees.' },
  { label: 'Photosynthesis & Respiration', query: 'Light-dependent reactions of photosynthesis, Calvin cycle, ATP synthesis, and cellular respiration.' },
  { label: 'World War II Turning Points', query: 'Key strategic turning points of World War II: Battle of Midway, Stalingrad, and Normandy invasion.' },
];

export function EmptyState({ onSelectSuggestion }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        <Sparkles size={36} strokeWidth={1.5} />
      </div>
      <h2 className="empty-state-title">Your next study session starts here.</h2>
      <p className="empty-state-desc">
        Paste notes, lecture transcripts, or enter a topic to generate an interactive study set.
      </p>

      <div style={{ marginBottom: '12px' }}>
        <span className="control-label">Or start from an example topic:</span>
      </div>

      <div className="prompt-suggestions" role="group" aria-label="Example topics">
        {SUGGESTIONS.map((item) => (
          <button
            key={item.label}
            type="button"
            className="prompt-chip"
            onClick={() => onSelectSuggestion(item.query)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
