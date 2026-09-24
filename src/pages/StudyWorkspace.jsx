import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header.jsx';
import { StudyInput } from '../components/StudyInput.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { FlashcardSession } from '../components/FlashcardSession.jsx';
import { QuizSession } from '../components/QuizSession.jsx';
import { useGenerateStudySet } from '../hooks/useGenerateStudySet.js';
import { useStudySession } from '../hooks/useStudySession.js';
import { checkEngineHealth } from '../services/api.js';

export function StudyWorkspace() {
  // Input form state
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('flashcards');
  const [difficulty, setDifficulty] = useState('medium');
  const [simulationMode, setSimulationMode] = useState('');

  // Engine health info
  const [engineInfo, setEngineInfo] = useState({ status: 'ok', mode: 'mock-engine' });

  // Theme state persisted in localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('studyflow_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('studyflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Poll / check engine info on mount
  useEffect(() => {
    checkEngineHealth().then(setEngineInfo);
  }, []);

  // Generation state hook (with cancellation and stale request protection)
  const {
    status,
    studySet,
    error,
    generate,
    retry,
    reset,
    clearError,
  } = useGenerateStudySet();

  // Study session state hook (handles flashcards, quiz, mastery, missed item retry)
  const session = useStudySession(studySet);

  const handleSubmit = () => {
    if (!input.trim() || status === 'loading') return;
    generate({
      input,
      mode,
      difficulty,
      simulationMode: simulationMode || undefined,
    });
  };

  const handleSelectSuggestion = (suggestionText) => {
    setInput(suggestionText);
  };

  const handleNewSession = () => {
    reset();
  };

  const isSessionActive = status === 'success' && Boolean(studySet);

  return (
    <div className="app-container">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onNewSession={handleNewSession}
        isSessionActive={isSessionActive}
        engineMode={engineInfo.mode}
      />

      <main className="main-content" id="main-study-area">
        {/* State 1: Generation In-Flight */}
        {status === 'loading' && (
          <LoadingState
            mode={mode}
            onCancel={reset}
          />
        )}

        {/* State 2: Error Occurred */}
        {status === 'error' && (
          <ErrorState
            error={error}
            onRetry={retry}
            onEditInput={clearError}
          />
        )}

        {/* State 3: Active Study Session (Success) */}
        {status === 'success' && studySet && (
          <>
            {studySet.type === 'flashcards' ? (
              <FlashcardSession
                session={session}
                onNewSession={handleNewSession}
              />
            ) : (
              <QuizSession
                session={session}
                onNewSession={handleNewSession}
              />
            )}
          </>
        )}

        {/* State 4: Idle Workspace Input & Suggestions */}
        {status === 'idle' && (
          <>
            <StudyInput
              input={input}
              setInput={setInput}
              mode={mode}
              setMode={setMode}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              simulationMode={simulationMode}
              setSimulationMode={setSimulationMode}
              onSubmit={handleSubmit}
              isLoading={status === 'loading'}
            />

            <EmptyState
              onSelectSuggestion={handleSelectSuggestion}
            />
          </>
        )}
      </main>
    </div>
  );
}
