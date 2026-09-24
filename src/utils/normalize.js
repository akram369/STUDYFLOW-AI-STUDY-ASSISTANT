import { StudySetSchema } from '../schemas/studySet.js';
import { AIValidationError } from './validation.js';

/**
 * Normalizes raw parsed AI output to match StudyFlow's runtime schema guarantees.
 * Prevents UI crashes from missing fields, duplicate IDs, out-of-bounds answers, etc.
 *
 * @param {object} rawParsed - The object parsed from JSON
 * @param {string} requestedMode - 'flashcards' | 'quiz'
 * @returns {object} Completely normalized and validated StudySet
 */
export function normalizeStudySet(rawParsed, requestedMode) {
  if (!rawParsed || typeof rawParsed !== 'object') {
    throw new AIValidationError(
      'INVALID_SHAPE',
      'Study set must be a valid JSON object.',
      'The generated study set was not structured properly. Please try again.'
    );
  }

  // Clone to avoid mutating inputs
  const candidate = JSON.parse(JSON.stringify(rawParsed));

  // 1. Verify response type matches request
  if (candidate.type !== requestedMode) {
    // If the model omitted 'type', auto-infer from keys
    if (!candidate.type) {
      if (Array.isArray(candidate.cards) && candidate.cards.length > 0) {
        candidate.type = 'flashcards';
      } else if (Array.isArray(candidate.questions) && candidate.questions.length > 0) {
        candidate.type = 'quiz';
      } else {
        candidate.type = requestedMode;
      }
    }

    if (candidate.type !== requestedMode) {
      throw new AIValidationError(
        'UNEXPECTED_TYPE',
        `Expected study type "${requestedMode}", but AI returned "${candidate.type}".`,
        `The engine produced ${candidate.type} instead of a ${requestedMode}. Please try again.`
      );
    }
  }

  // 2. Normalize Flashcards Deck
  if (requestedMode === 'flashcards') {
    if (!Array.isArray(candidate.cards) || candidate.cards.length === 0) {
      throw new AIValidationError(
        'EMPTY_CARDS',
        'Flashcards study set contains no cards.',
        'No flashcards could be generated from your notes. Try adding a little more detail.'
      );
    }

    const seenIds = new Set();
    const normalizedCards = [];

    for (let i = 0; i < candidate.cards.length; i++) {
      const card = candidate.cards[i];
      if (!card || typeof card !== 'object') continue;

      const question = (card.question || card.front || card.prompt || '').toString().trim();
      const answer = (card.answer || card.back || card.explanation || '').toString().trim();

      // Skip completely empty cards
      if (!question && !answer) continue;

      // Ensure stable, unique ID
      let id = card.id ? String(card.id).trim() : `card-${i + 1}`;
      if (seenIds.has(id) || !id) {
        id = `card-${i + 1}-${Math.random().toString(36).substring(2, 6)}`;
      }
      seenIds.add(id);

      normalizedCards.push({
        id,
        question: question || 'Key Concept',
        answer: answer || 'Refer to source material.',
      });
    }

    if (normalizedCards.length === 0) {
      throw new AIValidationError(
        'EMPTY_CARDS',
        'All flashcards in response were empty or malformed.',
        'The study set contained empty cards. Try refining your topic or notes.'
      );
    }

    candidate.cards = normalizedCards;
  }

  // 3. Normalize Quiz Deck
  if (requestedMode === 'quiz') {
    if (!Array.isArray(candidate.questions) || candidate.questions.length === 0) {
      throw new AIValidationError(
        'EMPTY_QUESTIONS',
        'Quiz study set contains no questions.',
        'No quiz questions could be created from this material. Try providing more context.'
      );
    }

    const seenIds = new Set();
    const normalizedQuestions = [];

    for (let i = 0; i < candidate.questions.length; i++) {
      const q = candidate.questions[i];
      if (!q || typeof q !== 'object') continue;

      const question = (q.question || q.prompt || '').toString().trim();
      if (!question) continue;

      // Options sanitization
      let options = Array.isArray(q.options)
        ? q.options.map(opt => String(opt || '').trim()).filter(Boolean)
        : [];

      if (options.length < 2) {
        console.warn(`[StudyFlow Normalize] Skipping quiz question ${i}: insufficient valid options (${options.length})`);
        continue;
      }

      // Correct answer normalization
      let correctAnswer = 0;
      if (typeof q.correctAnswer === 'number') {
        correctAnswer = Math.floor(q.correctAnswer);
      } else if (typeof q.correctAnswer === 'string') {
        const parsed = parseInt(q.correctAnswer, 10);
        if (!isNaN(parsed)) {
          correctAnswer = parsed;
        } else {
          // If string matches one of the option texts
          const matchingIdx = options.findIndex(opt => opt.toLowerCase() === q.correctAnswer.toLowerCase());
          if (matchingIdx !== -1) correctAnswer = matchingIdx;
        }
      }

      // Boundary clamp
      if (correctAnswer < 0 || correctAnswer >= options.length) {
        correctAnswer = 0; // Graceful fallback to first option rather than crashing
      }

      // Unique ID
      let id = q.id ? String(q.id).trim() : `q-${i + 1}`;
      if (seenIds.has(id) || !id) {
        id = `q-${i + 1}-${Math.random().toString(36).substring(2, 6)}`;
      }
      seenIds.add(id);

      normalizedQuestions.push({
        id,
        question,
        options,
        correctAnswer,
        explanation: (q.explanation || 'No detailed explanation provided.').toString().trim(),
      });
    }

    if (normalizedQuestions.length === 0) {
      throw new AIValidationError(
        'INVALID_QUIZ_QUESTIONS',
        'Could not construct at least one valid question with choices.',
        'The quiz format was invalid. Please try generating again.'
      );
    }

    candidate.questions = normalizedQuestions;
  }

  // 4. Validate through Zod Schema
  const parseResult = StudySetSchema.safeParse(candidate);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    console.error('[StudyFlow Validation Error Details]:', errorDetails);

    throw new AIValidationError(
      'SCHEMA_VALIDATION_FAILED',
      `Schema validation error: ${errorDetails}`,
      'The generated study set wasn\'t usable. Something went wrong with the content structure.',
      errorDetails
    );
  }

  return parseResult.data;
}
