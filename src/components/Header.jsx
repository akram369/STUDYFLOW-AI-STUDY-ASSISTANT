import React from 'react';
import { BookOpen, Moon, Sun, PlusCircle, Sparkles } from 'lucide-react';

export function Header({
  theme,
  toggleTheme,
  onNewSession,
  isSessionActive,
  engineMode = 'mock-engine',
}) {
  const isMock = engineMode === 'mock-engine';

  return (
    <header className="site-header" role="banner">
      <div className="header-inner">
        <div className="brand-group">
          <div className="brand-icon" aria-hidden="true">
            <BookOpen size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-title">StudyFlow</span>
              <span className="brand-badge" title="Active Learning Engine">
                {isMock ? 'Mock Engine' : 'AI Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {isSessionActive && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onNewSession}
              title="Start a new study session"
            >
              <PlusCircle size={15} />
              <span>New Session</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
