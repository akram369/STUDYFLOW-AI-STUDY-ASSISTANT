import { z } from 'zod';

/**
 * Flashcard schema definition
 */
export const FlashcardSchema = z.object({
  id: z.string().default(() => `card-${Math.random().toString(36).substring(2, 9)}`),
  question: z.string().trim().min(1, 'Question text cannot be empty.'),
  answer: z.string().trim().min(1, 'Answer text cannot be empty.'),
});

/**
 * Flashcard Deck schema definition
 */
export const FlashcardSetSchema = z.object({
  type: z.literal('flashcards'),
  title: z.string().trim().default('Flashcard Study Deck'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  cards: z.array(FlashcardSchema)
    .min(1, 'At least 1 flashcard is required.')
    .max(25, 'Maximum card limit exceeded (25 cards).'),
});

/**
 * Quiz Question schema definition
 */
export const QuizQuestionSchema = z.object({
  id: z.string().default(() => `q-${Math.random().toString(36).substring(2, 9)}`),
  question: z.string().trim().min(1, 'Question text cannot be empty.'),
  options: z.array(z.string().trim().min(1, 'Option text cannot be empty.'))
    .min(2, 'Each question must have at least 2 options.')
    .max(6, 'Each question can have at most 6 options.'),
  correctAnswer: z.number().int({ message: 'Correct answer index must be an integer.' }).min(0),
  explanation: z.string().trim().default('No explanation provided.'),
}).refine(
  data => data.correctAnswer >= 0 && data.correctAnswer < data.options.length,
  {
    message: 'Correct answer index is out of bounds for the available options.',
    path: ['correctAnswer'],
  }
);

/**
 * Quiz Set schema definition
 */
export const QuizSetSchema = z.object({
  type: z.literal('quiz'),
  title: z.string().trim().default('Active Recall Quiz'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  questions: z.array(QuizQuestionSchema)
    .min(1, 'At least 1 question is required.')
    .max(20, 'Maximum question limit exceeded (20 questions).'),
});

/**
 * Discriminated union of all supported StudyFlow study set types
 */
export const StudySetSchema = z.discriminatedUnion('type', [
  FlashcardSetSchema,
  QuizSetSchema,
]);
