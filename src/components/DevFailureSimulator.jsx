import React from 'react';
import { AlertCircle, Sliders } from 'lucide-react';

const SIMULATION_MODES = [
  { value: '', label: 'Default Engine (Standard Flow)' },
  { value: 'malformed_json', label: 'Failure: Invalid / Malformed JSON' },
  { value: 'markdown_wrapped', label: 'Resilience: Markdown-wrapped ```json' },
  { value: 'missing_fields', label: 'Failure: Missing required fields' },
  { value: 'empty_response', label: 'Failure: Empty response from engine' },
  { value: 'invalid_options', label: 'Failure: Quiz with insufficient options' },
  { value: 'rate_limit', label: 'Failure: HTTP 429 Rate Limit' },
  { value: 'slow_timeout', label: 'Failure: 15s Timeout Simulation' },
];

export function DevFailureSimulator({ value, onChange }) {
  return (
    <div className="dev-simulator-banner" role="region" aria-label="Dev Failure Simulation">
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Sliders size={13} />
        <span><strong>Reviewer Testing Mode:</strong></span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <select
          className="dev-select"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Select failure injection mode"
        >
          {SIMULATION_MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
        {value && (
          <span style={{ color: 'var(--color-warning)', fontSize: '0.75rem', fontWeight: 600 }}>
            Active
          </span>
        )}
      </div>
    </div>
  );
}
