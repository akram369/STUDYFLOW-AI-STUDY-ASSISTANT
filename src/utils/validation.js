/**
 * Structured AI Output Parser & Sanitizer
 * Resiliently handles raw, markdown-fenced, and malformed strings returned by LLMs.
 */

export class AIValidationError extends Error {
  constructor(errorType, message, userFriendlyMessage, details = null) {
    super(message);
    this.name = 'AIValidationError';
    this.errorType = errorType;
    this.userFriendlyMessage = userFriendlyMessage;
    this.details = details;
  }
}

/**
 * Strips markdown codeblocks, e.g. ```json ... ``` or ``` ... ```
 */
export function stripMarkdownFences(text) {
  if (typeof text !== 'string') return '';
  let cleaned = text.trim();

  // Match ```json ... ``` or ``` ... ```
  const codeBlockRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
  const match = cleaned.match(codeBlockRegex);
  if (match) {
    cleaned = match[1].trim();
  }

  return cleaned;
}

/**
 * Attempts to extract the outermost JSON object if surrounded by preamble or postscript
 */
export function extractJsonObjectSubstring(text) {
  const firstOpen = text.indexOf('{');
  const lastClose = text.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    return text.substring(firstOpen, lastClose + 1);
  }
  return text;
}

/**
 * Parse raw string response from LLM into a JavaScript object.
 * Does NOT assume the LLM output is valid JSON.
 */
export function parseAIResponse(rawResponse) {
  // 1. Check for empty or non-string response
  if (rawResponse === null || rawResponse === undefined) {
    throw new AIValidationError(
      'EMPTY_RESPONSE',
      'AI response was null or undefined.',
      'No study material was returned from the study engine. Please try again.'
    );
  }

  let text = typeof rawResponse === 'object' ? JSON.stringify(rawResponse) : String(rawResponse);
  text = text.trim();

  if (text.length === 0) {
    throw new AIValidationError(
      'EMPTY_RESPONSE',
      'AI response was empty after trimming.',
      'No study material was returned. Please try again with a little more detail.'
    );
  }

  // 2. Strip markdown fences if present
  let sanitized = stripMarkdownFences(text);

  // 3. First attempt direct parse
  try {
    const parsed = JSON.parse(sanitized);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new AIValidationError(
        'INVALID_SHAPE',
        'Parsed JSON is not a root object.',
        'The generated study set was not formatted correctly. Try again.'
      );
    }
    return parsed;
  } catch (initialErr) {
    // 4. Try extracting substring between { and } in case model returned conversational chatter
    const candidate = extractJsonObjectSubstring(sanitized);
    if (candidate !== sanitized) {
      try {
        const extracted = JSON.parse(candidate);
        if (typeof extracted === 'object' && extracted !== null && !Array.isArray(extracted)) {
          return extracted;
        }
      } catch {
        // Fall through to throw syntax error
      }
    }

    console.warn('[StudyFlow Validation] Failed to parse JSON:', initialErr.message, 'Raw preview:', text.slice(0, 150));
    throw new AIValidationError(
      'INVALID_JSON',
      `JSON syntax error: ${initialErr.message}`,
      'The study engine returned an unreadable response format. Please try again.',
      initialErr.message
    );
  }
}
