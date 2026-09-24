/**
 * StudyFlow AI System Prompts & Prompt Templates
 * Designed for strict structured output generation and non-repetitive pedagogical variety.
 */

export const SYSTEM_PROMPT = `You are the core pedagogical engine for StudyFlow, a precision active-learning assistant.
Your job is to transform raw input notes, lectures, or topics into structured, high-retention study materials.

STRICT INSTRUCTIONS:
1. Output MUST be ONLY valid JSON matching the exact schema requested.
2. Do NOT wrap output in markdown codeblocks (no \`\`\`json or \`\`\`). Output pure JSON only.
3. No conversational preamble, postscript, or chit-chat.
4. Ensure factual accuracy, crisp phrasing, and high pedagogical utility.
5. Avoid superficial questions; test conceptual understanding and recall.
6. NO REPEATED QUESTIONS: Every question must test a completely unique concept or subtopic. NEVER generate repetitive or duplicate questions.
7. RANDOMIZE CORRECT ANSWER POSITIONS: For quizzes, distribute correctAnswer evenly across 0, 1, 2, and 3 (never put all correct answers on the same index).`;

export function buildFlashcardsPrompt(input, difficulty = 'medium') {
  const countGuideline = difficulty === 'hard' ? '8 to 12' : difficulty === 'easy' ? '5 to 7' : '6 to 10';
  const depthGuideline = {
    easy: 'Focus on foundational terminology, core definitions, and basic building blocks.',
    medium: 'Focus on practical applications, distinguishing related concepts, and operational mechanics.',
    hard: 'Focus on edge cases, architectural trade-offs, nuances, and deep conceptual precision.',
  }[difficulty] || 'Focus on core principles and practical mechanics.';

  return `Generate an interactive flashcard deck from the following material.

TARGET DIFFICULTY: ${difficulty.toUpperCase()} (${depthGuideline})
TARGET CARD COUNT: ${countGuideline} cards.

CRITICAL RULES:
- Every card must cover a distinct sub-topic. NO duplicates.
- Ensure crisp, authoritative answers.

JSON SCHEMA REQUIREMENT:
{
  "type": "flashcards",
  "title": "Clear concise topic title",
  "difficulty": "${difficulty}",
  "cards": [
    {
      "id": "card-1",
      "question": "Clear, focused prompt or question",
      "answer": "Concise, authoritative explanation or definition"
    }
  ]
}

INPUT MATERIAL:
"""
${input.trim()}
"""`;
}

export function buildQuizPrompt(input, difficulty = 'medium') {
  const countGuideline = difficulty === 'hard' ? '6 to 8' : difficulty === 'easy' ? '4 to 5' : '5 to 6';
  const depthGuideline = {
    easy: 'Direct recognition and definition questions with clearly distinct options.',
    medium: 'Scenario-based questions testing comprehension, prediction of outcomes, or proper usage.',
    hard: 'Challenging questions with realistic distractor options testing subtle distinctions and problem solving.',
  }[difficulty] || 'Scenario and comprehension questions.';

  return `Generate a multiple-choice quiz from the following material.

TARGET DIFFICULTY: ${difficulty.toUpperCase()} (${depthGuideline})
TARGET QUESTION COUNT: ${countGuideline} questions.

CRITICAL RULES FOR QUIZ:
1. Every question must be distinct and explore a different angle or mechanism. NO REPEATED OR PARAPHRASED QUESTIONS.
2. "options" must contain exactly 4 distinct, plausible choices.
3. "correctAnswer" must be an integer between 0 and 3 corresponding to the 0-indexed position in "options".
4. Distribute correct answers across indices 0, 1, 2, and 3 in a balanced, randomized manner (do not place the correct answer always at 0).
5. Distractors (wrong answers) must be plausible and educational, not absurd or identical across questions.
6. "explanation" must be informative and teach the user why the correct answer is right and why key distractors are mistaken.

JSON SCHEMA REQUIREMENT:
{
  "type": "quiz",
  "title": "Clear concise topic title",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": "q-1",
      "question": "Thoughtful question testing understanding",
      "options": [
        "First option",
        "Second option",
        "Third option",
        "Fourth option"
      ],
      "correctAnswer": 1,
      "explanation": "Clear explanation of why this answer is correct and why other key distractors are incorrect."
    }
  ]
}

INPUT MATERIAL:
"""
${input.trim()}
"""`;
}
