import { SYSTEM_PROMPT, buildFlashcardsPrompt, buildQuizPrompt } from './prompts.js';

/**
 * Intelligent Mock Knowledge Base
 * Enables instant, high-quality local development and evaluation without requiring an API key.
 */
const MOCK_KNOWLEDGE_BASE = {
  javascript: {
    flashcards: [
      {
        id: 'js-1',
        question: 'What is a Closure in JavaScript?',
        answer: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment, allowing an inner function to access an outer function\'s scope even after the outer function has executed.',
      },
      {
        id: 'js-2',
        question: 'What is the Event Loop and how does it handle asynchronous code?',
        answer: 'The event loop continuously monitors the Call Stack and the Task/Microtask queues. When the call stack is clear, it pushes microtasks (e.g., Promise callbacks) first, followed by macrotasks (e.g., setTimeout).',
      },
      {
        id: 'js-3',
        question: 'What is the key difference between == and === in JavaScript?',
        answer: '== performs type coercion before comparison (loose equality), whereas === checks both value and type without coercion (strict equality).',
      },
      {
        id: 'js-4',
        question: 'How do Promises differ from traditional callbacks?',
        answer: 'Promises provide a standardized abstraction for asynchronous results with chained `.then()`/`.catch()` handlers, avoiding nested "callback hell" and ensuring consistent error propagation.',
      },
      {
        id: 'js-5',
        question: 'What is the difference between `let`, `const`, and `var`?',
        answer: '`var` is function-scoped and hoisted with `undefined`. `let` and `const` are block-scoped, live in the Temporal Dead Zone (TDZ) prior to declaration, and `const` prevents identifier reassignment.',
      },
      {
        id: 'js-6',
        question: 'What does `async/await` do under the hood?',
        answer: 'It is syntactic sugar built on top of Promises and Generators. An `async` function always returns a Promise, and `await` pauses execution of the async function until the awaited Promise settles.',
      },
    ],
    quiz: [
      {
        id: 'js-q1',
        question: 'What is output to the console when evaluating: typeof NaN?',
        options: ['"number"', '"nan"', '"undefined"', '"object"'],
        correctAnswer: 0,
        explanation: 'In JavaScript specification, NaN (Not-a-Number) is formally categorized as a numeric value representing an unrepresentable or undefined mathematical result.',
      },
      {
        id: 'js-q2',
        question: 'Which queue has higher processing priority when the JavaScript call stack becomes empty?',
        options: ['Macrotask Queue (setTimeout)', 'Microtask Queue (Promise.then)', 'RequestAnimationFrame Queue', 'I/O Polling Queue'],
        correctAnswer: 1,
        explanation: 'All microtasks in the microtask queue must be completely drained before the event loop advances to the next task in the macrotask queue.',
      },
      {
        id: 'js-q3',
        question: 'What happens when accessing a `let` variable before its line of declaration?',
        options: [
          'Returns undefined due to hoisting',
          'Throws a ReferenceError due to the Temporal Dead Zone',
          'Returns null',
          'Silently creates a global variable',
        ],
        correctAnswer: 1,
        explanation: 'Variables declared with let and const are hoisted but remain uninitialized in the Temporal Dead Zone (TDZ). Accessing them before initialization throws a ReferenceError.',
      },
      {
        id: 'js-q4',
        question: 'What is the value of `this` inside a standard arrow function?',
        options: [
          'The object that invoked the function',
          'Always window or globalThis',
          'Inherited lexically from the enclosing execution context',
          'undefined in strict mode',
        ],
        correctAnswer: 2,
        explanation: 'Arrow functions do not bind their own `this`; they retain the lexical `this` value of their enclosing scope at the time of creation.',
      },
    ],
  },
  react: {
    flashcards: [
      {
        id: 'react-1',
        question: 'What is the Virtual DOM and why does React use it?',
        answer: 'The Virtual DOM is a lightweight in-memory representation of the real DOM. React computes differences (reconciliation) between Virtual DOM snapshots and applies minimal batch updates to the real DOM to maximize performance.',
      },
      {
        id: 'react-2',
        question: 'What are the Rules of Hooks in React?',
        answer: '1. Only call hooks at the top level (never inside loops, conditions, or nested functions). 2. Only call hooks from React function components or custom hooks.',
      },
      {
        id: 'react-3',
        question: 'When should you use `useEffect` vs `useLayoutEffect`?',
        answer: '`useEffect` runs asynchronously after the browser paints, ideal for data fetching and subscriptions. `useLayoutEffect` runs synchronously after DOM mutations before browser paint, used when measuring layout or avoiding visual flickers.',
      },
      {
        id: 'react-4',
        question: 'Why is `key` mandatory when rendering lists in React?',
        answer: 'Keys provide stable identities to list elements across renders, allowing React\'s reconciliation algorithm to determine which items were inserted, reordered, or removed rather than re-rendering every item.',
      },
      {
        id: 'react-5',
        question: 'What is the purpose of `useCallback` and `useMemo`?',
        answer: '`useMemo` caches the calculated result of an expensive calculation between renders. `useCallback` caches a function definition between renders to avoid unnecessary re-renders of memoized child components.',
      },
    ],
    quiz: [
      {
        id: 'react-q1',
        question: 'What triggers a React component to re-render?',
        options: [
          'Changes to state, props, or parent component re-rendering',
          'Direct mutations to component local variables',
          'Any browser window scroll event',
          'Only calling forceUpdate()',
        ],
        correctAnswer: 0,
        explanation: 'React components automatically schedule a re-render when their local state updates, when incoming props change, or when their parent re-renders.',
      },
      {
        id: 'react-q2',
        question: 'What happens if you pass an empty dependency array `[]` to `useEffect`?',
        options: [
          'The effect runs on every render',
          'The effect never runs',
          'The effect runs once after the initial render and cleanup runs on unmount',
          'The effect throws a runtime error',
        ],
        correctAnswer: 2,
        explanation: 'An empty dependency array signals that the effect does not depend on any changing values from the component scope, so it executes once on mount and cleans up on unmount.',
      },
      {
        id: 'react-q3',
        question: 'Why should you avoid using array index as a `key` prop in dynamic lists?',
        options: [
          'React does not allow numbers as keys',
          'Reordering or filtering items causes state mismatch bugs and suboptimal DOM updates',
          'It increases the bundle size',
          'It disables CSS animations completely',
        ],
        correctAnswer: 1,
        explanation: 'Using array indexes as keys causes component state to get attached to the wrong item if the array is reordered, sorted, or filtered.',
      },
    ],
  },
  database: {
    flashcards: [
      {
        id: 'db-1',
        question: 'What is First Normal Form (1NF)?',
        answer: 'A relation is in 1NF if each column contains only atomic (indivisible) values, each record is unique, and there are no repeating groups or arrays stored in single attributes.',
      },
      {
        id: 'db-2',
        question: 'What is Second Normal Form (2NF)?',
        answer: 'A relation is in 2NF if it is in 1NF and all non-key attributes are fully functionally dependent on the entire primary key (no partial key dependencies).',
      },
      {
        id: 'db-3',
        question: 'What is Third Normal Form (3NF)?',
        answer: 'A relation is in 3NF if it is in 2NF and there are no transitive dependencies—non-prime attributes must depend only on candidate keys, never on other non-prime attributes.',
      },
      {
        id: 'db-4',
        question: 'What does the ACID acronym stand for in database transactions?',
        answer: 'Atomicity (all or nothing), Consistency (preserves database invariants), Isolation (concurrent transactions do not interfere), and Durability (committed changes persist despite system failures).',
      },
      {
        id: 'db-5',
        question: 'What is a B-Tree Index and how does it speed up queries?',
        answer: 'A self-balancing search tree that keeps data sorted and allows lookups, range queries, insertions, and deletions in logarithmic time (O(log n)), minimizing disk block reads.',
      },
    ],
    quiz: [
      {
        id: 'db-q1',
        question: 'Which normal form eliminates transitive functional dependencies?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correctAnswer: 2,
        explanation: '3NF specifically eliminates transitive dependencies (where X -> Y and Y -> Z, meaning Z depends on X transitively through non-key attribute Y).',
      },
      {
        id: 'db-q2',
        question: 'In ACID transactions, which property ensures that half-completed transactions are completely rolled back upon power failure?',
        options: ['Durability', 'Atomicity', 'Isolation', 'Consistency'],
        correctAnswer: 1,
        explanation: 'Atomicity ensures that all operations within a transaction either completely succeed together or are completely aborted with no partial changes remaining.',
      },
    ],
  },
};

/**
 * Fallback synthesizer for arbitrary user text
 */
function synthesizeFromText(input, mode, difficulty) {
  const words = input.trim().split(/\s+/);
  const titleCandidate = words.slice(0, 5).join(' ') || 'Study Notes';
  const title = titleCandidate.length > 35 ? titleCandidate.slice(0, 35) + '...' : titleCandidate;

  // Split input into sentences or paragraphs
  const rawSegments = input
    .split(/(?:\r?\n\r?\n|\.\s+)/)
    .map(s => s.trim())
    .filter(s => s.length > 15);

  const segments = rawSegments.length >= 3 ? rawSegments : [
    input,
    `Key aspects and context of ${title}`,
    `Practical implications and summary of ${title}`,
  ];

  if (mode === 'flashcards') {
    const cards = segments.slice(0, 8).map((seg, i) => ({
      id: `card-${i + 1}`,
      question: `Core concept ${i + 1}: What is the significance of "${seg.slice(0, 45)}${seg.length > 45 ? '...' : ''}"?`,
      answer: seg.length > 20 ? seg : `Key foundational takeaway regarding ${title}: ${seg}`,
    }));

    return {
      type: 'flashcards',
      title: `Study Deck: ${title}`,
      difficulty,
      cards,
    };
  }

  // Quiz mode
  const questions = segments.slice(0, 5).map((seg, i) => ({
    id: `q-${i + 1}`,
    question: `Regarding ${title}, which statement best reflects the following concept: "${seg.slice(0, 60)}${seg.length > 60 ? '...' : ''}"?`,
    options: [
      seg.slice(0, 80),
      `It is purely optional and has no direct impact on ${title}.`,
      `It contradicts the primary architectural assumptions of the subject.`,
      `It applies exclusively in obsolete legacy contexts.`,
    ],
    correctAnswer: 0,
    explanation: `The first choice directly aligns with the source notes: "${seg.slice(0, 100)}...". The other options are incorrect distractors.`,
  }));

  return {
    type: 'quiz',
    title: `Quiz: ${title}`,
    difficulty,
    questions,
  };
}

/**
 * Handle Failure Injection / Simulation Modes for testing
 */
function handleSimulation(simulationMode, mode) {
  switch (simulationMode) {
    case 'malformed_json':
      return { raw: '{ "type": "flashcards", "title": "Broken Deck", "cards": [ { "id": "1", "question": "Unclosed string... }' };
    
    case 'markdown_wrapped':
      return {
        raw: '```json\n' + JSON.stringify({
          type: 'flashcards',
          title: 'Markdown Wrapped Test Set',
          cards: [
            { id: 'c1', question: 'Does StudyFlow handle markdown codeblocks from LLMs?', answer: 'Yes! The parser strips markdown fences before validation.' }
          ]
        }) + '\n```'
      };

    case 'missing_fields':
      return { raw: JSON.stringify({ type: mode, title: 'Missing critical array' }) };

    case 'empty_response':
      return { raw: '' };

    case 'invalid_options':
      return {
        raw: JSON.stringify({
          type: 'quiz',
          title: 'Invalid Quiz Set',
          questions: [
            { id: 'q1', question: 'Broken question with insufficient options', options: ['Only one option'], correctAnswer: 0, explanation: 'Test' }
          ]
        })
      };

    case 'rate_limit':
      const err = new Error('Rate limit exceeded: quota depleted (429)');
      err.status = 429;
      throw err;

    case 'slow_timeout':
      return new Promise((_, reject) => {
        setTimeout(() => {
          const timeoutErr = new Error('Gateway timeout from upstream AI provider (504)');
          timeoutErr.status = 504;
          reject(timeoutErr);
        }, 15000);
      });

    default:
      return null;
  }
}

/**
 * Call Real AI Provider (Gemini or OpenAI)
 */
async function callLLMProvider({ input, mode, difficulty }) {
  const apiKey = process.env.AI_API_KEY;
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const prompt = mode === 'quiz' ? buildQuizPrompt(input, difficulty) : buildFlashcardsPrompt(input, difficulty);

  if (provider === 'gemini') {
    const model = process.env.AI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      const err = new Error(`Gemini API error (${res.status}): ${errBody.slice(0, 150)}`);
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Empty response received from AI model');
    }
    return { raw: candidateText };
  }

  // OpenAI Provider
  if (provider === 'openai') {
    const model = process.env.AI_MODEL || 'gpt-4o-mini';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      const err = new Error(`OpenAI API error (${res.status}): ${errBody.slice(0, 150)}`);
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response received from AI model');
    }
    return { raw: content };
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

/**
 * Main AI Generation Handler
 */
export async function generateStudyContent({ input, mode, difficulty = 'medium', simulationMode }) {
  // 1. Check for simulation test injection
  if (simulationMode) {
    const simResult = handleSimulation(simulationMode, mode);
    if (simResult) return simResult;
  }

  // 2. If an AI_API_KEY is configured, call the live LLM
  if (process.env.AI_API_KEY && process.env.AI_API_KEY.trim() !== '') {
    return await callLLMProvider({ input, mode, difficulty });
  }

  // 3. Otherwise use the intelligent pedagogical mock engine
  const lowerInput = input.toLowerCase();
  let matchedTopic = null;

  if (lowerInput.includes('closure') || lowerInput.includes('javascript') || lowerInput.includes('promise') || lowerInput.includes('async')) {
    matchedTopic = 'javascript';
  } else if (lowerInput.includes('react') || lowerInput.includes('hook') || lowerInput.includes('state') || lowerInput.includes('component')) {
    matchedTopic = 'react';
  } else if (lowerInput.includes('database') || lowerInput.includes('normal') || lowerInput.includes('sql') || lowerInput.includes('acid') || lowerInput.includes('index')) {
    matchedTopic = 'database';
  }

  // Artificial realistic processing delay for realism (700-1100ms)
  await new Promise(r => setTimeout(r, 850));

  if (matchedTopic && MOCK_KNOWLEDGE_BASE[matchedTopic]) {
    const data = MOCK_KNOWLEDGE_BASE[matchedTopic];
    if (mode === 'flashcards') {
      return {
        raw: JSON.stringify({
          type: 'flashcards',
          title: `${matchedTopic.toUpperCase()} Core Concepts`,
          difficulty,
          cards: data.flashcards,
        }),
      };
    } else {
      return {
        raw: JSON.stringify({
          type: 'quiz',
          title: `${matchedTopic.toUpperCase()} Assessment`,
          difficulty,
          questions: data.quiz,
        }),
      };
    }
  }

  // Generic synthesis for any other user input
  const generated = synthesizeFromText(input, mode, difficulty);
  return { raw: JSON.stringify(generated) };
}
