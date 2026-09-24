import { parseAIResponse, AIValidationError } from '../utils/validation.js';
import { normalizeStudySet } from '../utils/normalize.js';

/**
 * Standardized API client for StudyFlow
 */
export async function generateStudySetApi({
  input,
  mode,
  difficulty = 'medium',
  simulationMode = undefined,
  signal = undefined,
}) {
  let response;

  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input,
        mode,
        difficulty,
        simulationMode,
      }),
      signal,
    });
  } catch (networkError) {
    if (networkError.name === 'AbortError') {
      // Re-throw so caller knows it was deliberately superseded/aborted
      throw networkError;
    }
    console.error('[API Network Error]:', networkError);
    throw new AIValidationError(
      'NETWORK_FAILURE',
      networkError.message,
      'Couldn\'t reach the study engine. Please check your connection and try again.'
    );
  }

  // Handle HTTP error statuses
  if (!response.ok) {
    let errorJson = null;
    try {
      errorJson = await response.json();
    } catch {
      // Non-JSON response
    }

    if (response.status === 429) {
      throw new AIValidationError(
        'RATE_LIMIT',
        'HTTP 429 Too Many Requests',
        'Too many requests to the study engine. Please wait a moment and try again.'
      );
    }

    if (response.status === 504 || response.status === 408) {
      throw new AIValidationError(
        'TIMEOUT',
        'HTTP Timeout',
        'The study engine timed out. Try generating a slightly shorter or more focused topic.'
      );
    }

    const message = errorJson?.message || `Server returned error (${response.status})`;
    throw new AIValidationError(
      'API_ERROR',
      message,
      errorJson?.userFriendlyMessage || 'Couldn\'t reach the study engine. Please try again shortly.',
      errorJson?.details
    );
  }

  const payload = await response.json();

  if (!payload.success) {
    throw new AIValidationError(
      payload.errorType || 'API_ERROR',
      payload.message || 'Generation failed',
      payload.message || 'The study engine encountered an issue creating your set.'
    );
  }

  // Robust Client-Side Validation Pipeline
  // AI Response -> parse -> validate schema -> normalize data
  const parsed = parseAIResponse(payload.raw);
  const normalizedStudySet = normalizeStudySet(parsed, mode);

  return normalizedStudySet;
}

/**
 * Health check check for provider status and mock mode
 */
export async function checkEngineHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { status: 'offline', mode: 'unknown' };
    return await res.json();
  } catch {
    return { status: 'offline', mode: 'unknown' };
  }
}
