import { z } from 'zod';

export const FlashcardCardSchema = z.object({
  id: z.string().default(() => `card-${Math.random().toString(36).substring(2, 9)}`),
  question: z.string().trim().min(1, 'Question cannot be empty'),
  answer: z.string().trim().min(1, 'Answer cannot be empty'),
});

export const FlashcardsStudySetSchema = z.object({
  type: z.literal('flashcards'),
  title: z.string().trim().default('Untitled Study Set'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  cards: z.array(FlashcardCardSchema).min(1, 'At least 1 card is required').max(30),
});

export const QuizQuestionSchema = z.object({
  id: z.string().default(() => `q-${Math.random().toString(36).substring(2, 9)}`),
  question: z.string().trim().min(1, 'Question cannot be empty'),
  options: z.array(z.string().trim().min(1)).min(2, 'Must have at least 2 options').max(6),
  correctAnswer: z.number().int().min(0),
  explanation: z.string().trim().default(''),
}).refine(data => data.correctAnswer < data.options.length, {
  message: 'correctAnswer index out of range for provided options',
  path: ['correctAnswer'],
});

export const QuizStudySetSchema = z.object({
  type: z.literal('quiz'),
  title: z.string().trim().default('Untitled Quiz Set'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  questions: z.array(QuizQuestionSchema).min(1, 'At least 1 question is required').max(20),
});

export const StudySetSchema = z.discriminatedUnion('type', [
  FlashcardsStudySetSchema,
  QuizStudySetSchema,
]);

export const GenerateRequestSchema = z.object({
  input: z.string().trim().min(1, 'Input notes or topic cannot be empty').max(15000),
  mode: z.enum(['flashcards', 'quiz']),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  simulationMode: z.string().optional(),
});
