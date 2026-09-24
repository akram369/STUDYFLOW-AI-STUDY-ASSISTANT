import { useState, useRef, useCallback } from 'react';
import { generateStudySetApi } from '../services/api.js';

/**
 * Hook to manage study set generation with strict stale request protection and cancellation.
 */
export function useGenerateStudySet() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [studySet, setStudySet] = useState(null);
  const [error, setError] = useState(null);
  const [lastParams, setLastParams] = useState(null);

  // References for concurrency and cancellation control
  const latestGenerationIdRef = useRef(0);
  const abortControllerRef = useRef(null);

  /**
   * Generates a study set while aborting any prior in-flight requests and ignoring stale responses.
   */
  const generate = useCallback(async ({ input, mode, difficulty = 'medium', simulationMode }) => {
    if (!input || !input.trim()) return;

    // 1. Cancel previous in-flight HTTP request if one exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 2. Create new AbortController and increment generation ID
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++latestGenerationIdRef.current;

    // 3. Update state to loading
    setStatus('loading');
    setError(null);
    setLastParams({ input, mode, difficulty, simulationMode });

    try {
      const result = await generateStudySetApi({
        input,
        mode,
        difficulty,
        simulationMode,
        signal: controller.signal,
      });

      // 4. Stale Request Guard: Ensure this response belongs to the latest request
      if (currentRequestId !== latestGenerationIdRef.current) {
        console.warn(`[StudyFlow Concurrency] Discarded stale response for request #${currentRequestId} (latest is #${latestGenerationIdRef.current})`);
        return;
      }

      setStudySet(result);
      setStatus('success');
      setError(null);
    } catch (err) {
      // If aborted by a newer request, silently ignore
      if (err.name === 'AbortError') {
        console.log(`[StudyFlow Concurrency] Request #${currentRequestId} successfully aborted by newer request.`);
        return;
      }

      // Check if another request was fired after this one
      if (currentRequestId !== latestGenerationIdRef.current) {
        console.warn(`[StudyFlow Concurrency] Discarded error from stale request #${currentRequestId}`);
        return;
      }

      console.error('[StudyFlow Generation Error]:', err);

      setStatus('error');
      setError({
        type: err.errorType || 'UNKNOWN_ERROR',
        title: err.errorType === 'RATE_LIMIT'
          ? 'Rate limit reached'
          : err.errorType === 'TIMEOUT'
          ? 'Request timed out'
          : err.errorType === 'NETWORK_FAILURE'
          ? 'Network error'
          : 'Study set couldn\'t be created',
        message: err.userFriendlyMessage || err.message || 'Something went wrong with the generated content. Try again.',
        details: err.details || null,
      });
    }
  }, []);

  const retry = useCallback(() => {
    if (lastParams) {
      generate(lastParams);
    }
  }, [generate, lastParams]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus('idle');
    setStudySet(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setStatus('idle');
  }, []);

  return {
    status,
    studySet,
    error,
    lastParams,
    generate,
    retry,
    reset,
    clearError,
  };
}
