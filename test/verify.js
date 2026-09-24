import { generateStudySetApi } from '../src/services/api.js';
import { parseAIResponse, AIValidationError } from '../src/utils/validation.js';
import { normalizeStudySet } from '../src/utils/normalize.js';

// Polyfill fetch for node test environment if needed
const BASE_URL = 'http://localhost:3001';

async function runTests() {
  console.log('====================================================');
  console.log('   StudyFlow Comprehensive Architectural Test Suite  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Health check
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    assert(data.status === 'ok', `API Health endpoint is ok (mode: ${data.mode})`);
  } catch (e) {
    assert(false, `Health check failed: ${e.message}`);
  }

  // 2. Valid Flashcards Generation
  try {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: 'JavaScript closures and event loop',
        mode: 'flashcards',
        difficulty: 'medium',
      }),
    });
    const data = await res.json();
    assert(data.success === true, 'Flashcard generation endpoint returns success: true');
    
    // Parse through validation pipeline
    const parsed = parseAIResponse(data.raw);
    assert(parsed.type === 'flashcards', 'Parsed object type is "flashcards"');
    
    const normalized = normalizeStudySet(parsed, 'flashcards');
    assert(Array.isArray(normalized.cards) && normalized.cards.length >= 3, `Normalized cards count: ${normalized.cards.length}`);
    assert(Boolean(normalized.cards[0].id && normalized.cards[0].question && normalized.cards[0].answer), 'Cards contain valid id, question, answer');
  } catch (e) {
    assert(false, `Flashcards test failed: ${e.message}`);
  }

  // 3. Valid Quiz Generation
  try {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: 'Relational database normalization: 1NF, 2NF, 3NF',
        mode: 'quiz',
        difficulty: 'medium',
      }),
    });
    const data = await res.json();
    assert(data.success === true, 'Quiz generation endpoint returns success: true');
    
    const parsed = parseAIResponse(data.raw);
    assert(parsed.type === 'quiz', 'Parsed object type is "quiz"');
    
    const normalized = normalizeStudySet(parsed, 'quiz');
    assert(Array.isArray(normalized.questions) && normalized.questions.length >= 2, `Normalized questions count: ${normalized.questions.length}`);
    const q1 = normalized.questions[0];
    assert(q1.options.length >= 2, `Question has >= 2 options (${q1.options.length})`);
    assert(q1.correctAnswer >= 0 && q1.correctAnswer < q1.options.length, `correctAnswer index ${q1.correctAnswer} is within bounds [0..${q1.options.length - 1}]`);
  } catch (e) {
    assert(false, `Quiz test failed: ${e.message}`);
  }

  // 4. Resilience: Markdown-Wrapped JSON (```json ... ```)
  try {
    const markdownWrappedRaw = '```json\n{"type": "flashcards", "title": "Markdown Deck", "cards": [{"id": "c1", "question": "Q1", "answer": "A1"}]}\n```';
    const parsed = parseAIResponse(markdownWrappedRaw);
    assert(parsed.title === 'Markdown Deck', 'Strips markdown codeblock fences and parses clean JSON');
    const normalized = normalizeStudySet(parsed, 'flashcards');
    assert(normalized.cards[0].question === 'Q1', 'Markdown wrapped cards normalized successfully');
  } catch (e) {
    assert(false, `Markdown-wrapped test failed: ${e.message}`);
  }

  // 5. Failure Handling: Invalid / Malformed JSON
  try {
    const malformedRaw = '{ "type": "flashcards", "title": "Broken unclosed string...';
    try {
      parseAIResponse(malformedRaw);
      assert(false, 'Should throw AIValidationError on malformed JSON');
    } catch (err) {
      assert(err instanceof AIValidationError, 'Throws AIValidationError on malformed JSON');
      assert(err.errorType === 'INVALID_JSON', 'Identifies errorType as INVALID_JSON');
      assert(typeof err.userFriendlyMessage === 'string', 'Provides friendly non-technical explanation');
    }
  } catch (e) {
    assert(false, `Malformed JSON test failed: ${e.message}`);
  }

  // 6. Failure Handling: Empty Response
  try {
    try {
      parseAIResponse('   ');
      assert(false, 'Should throw on empty response');
    } catch (err) {
      assert(err.errorType === 'EMPTY_RESPONSE', 'Identifies errorType as EMPTY_RESPONSE');
    }
  } catch (e) {
    assert(false, `Empty response test failed: ${e.message}`);
  }

  // 7. Failure Handling: Missing Required Fields (Missing cards array)
  try {
    try {
      normalizeStudySet({ type: 'flashcards', title: 'Empty Deck' }, 'flashcards');
      assert(false, 'Should throw on missing cards array');
    } catch (err) {
      assert(err.errorType === 'EMPTY_CARDS', 'Identifies errorType as EMPTY_CARDS');
    }
  } catch (e) {
    assert(false, `Missing fields test failed: ${e.message}`);
  }

  // 8. Failure Handling: Quiz with Insufficient Options
  try {
    try {
      normalizeStudySet({
        type: 'quiz',
        title: 'Broken Quiz',
        questions: [{ id: 'q1', question: 'No choices?', options: ['Only 1 choice'], correctAnswer: 0 }],
      }, 'quiz');
      assert(false, 'Should throw on insufficient quiz options');
    } catch (err) {
      assert(err.errorType === 'INVALID_QUIZ_QUESTIONS', 'Identifies errorType as INVALID_QUIZ_QUESTIONS');
    }
  } catch (e) {
    assert(false, `Invalid options test failed: ${e.message}`);
  }

  // 9. Failure Handling: HTTP 429 Rate Limit Simulation
  try {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: 'Test rate limit',
        mode: 'flashcards',
        simulationMode: 'rate_limit',
      }),
    });
    assert(res.status === 429, 'Server correctly responds with HTTP 429 Rate Limit');
    const data = await res.json();
    assert(data.errorType === 'RATE_LIMIT', 'Response contains errorType: RATE_LIMIT');
  } catch (e) {
    assert(false, `Rate limit test failed: ${e.message}`);
  }

  // 10. Normalization: Deduplication of Card IDs & Whitespace Trimming
  try {
    const rawWithDuplicates = {
      type: 'flashcards',
      title: 'Duplicate ID Deck',
      cards: [
        { id: 'card-1', question: '  What is scoping?  ', answer: '  Lexical context  ' },
        { id: 'card-1', question: '  What is hoisting?  ', answer: '  Variable elevation  ' },
      ],
    };
    const normalized = normalizeStudySet(rawWithDuplicates, 'flashcards');
    assert(normalized.cards[0].id !== normalized.cards[1].id, 'Deduplicated duplicate card IDs into unique keys');
    assert(normalized.cards[0].question === 'What is scoping?', 'Trimmed whitespace from question');
    assert(normalized.cards[0].answer === 'Lexical context', 'Trimmed whitespace from answer');
  } catch (e) {
    assert(false, `Normalization test failed: ${e.message}`);
  }

  // 11. Stale Request Simulation (Two requests in quick succession)
  try {
    let latestId = 0;
    let finalState = null;

    // Simulate Request 1 (slow, starts first)
    const runReq1 = async () => {
      const id = ++latestId;
      await new Promise(r => setTimeout(r, 120)); // Slow
      if (id === latestId) {
        finalState = 'Req1';
      }
    };

    // Simulate Request 2 (fast, started after Req 1)
    const runReq2 = async () => {
      await new Promise(r => setTimeout(r, 20));
      const id = ++latestId;
      await new Promise(r => setTimeout(r, 40)); // Completes before Req 1
      if (id === latestId) {
        finalState = 'Req2';
      }
    };

    await Promise.all([runReq1(), runReq2()]);
    assert(finalState === 'Req2', 'Stale request #1 is ignored; latest request #2 wins state');
  } catch (e) {
    assert(false, `Stale request test failed: ${e.message}`);
  }

  console.log('\n----------------------------------------------------');
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runTests();
