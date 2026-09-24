# StudyFlow — AI Study Assistant

> "Turn anything you know into something you can learn."

StudyFlow is a precision active-learning web application built with React and Node.js. It transforms unstructured notes, lecture transcripts, and complex topics into interactive 3D flashcard decks and active-recall quizzes. 

Built under the core engineering philosophy:
**"AI output is unpredictable, but the product built around it is reliable."**

---

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture & Data Pipeline](#architecture--data-pipeline)
- [Resilience & AI Failure Handling](#resilience--ai-failure-handling)
- [Concurrency & Stale Request Protection](#concurrency--stale-request-protection)
- [Tech Stack](#tech-stack)
- [Running Locally](#running-locally)
- [Environment Variables](#environment-variables)
- [AI Usage Statement](#ai-usage)
- [Known Limitations](#known-limitations)
- [Time Spent](#time-spent)

---

## Overview

Unlike generic AI wrappers or chatbots, StudyFlow is an intentional productivity utility that treats LLM completions as untrusted, raw data. It enforces a strict runtime validation and normalization boundary before any content reaches the user interface, ensuring the UI never crashes or enters an invalid state.

The visual design follows an editorial, high-contrast productivity aesthetic inspired by Notion and Linear—favoring generous whitespace, an 8px spacing rhythm, subtle 1px borders, restrained shadows, and purposeful micro-interactions over neon gradients or generic AI badges.

---

## Key Features

### 1. Dual Study Modes
- **Interactive Flashcards:**
  - True 3D perspective flip card animations.
  - Self-assessment categorization: **"✓ I know this"** (mastered) vs. **"↻ Review again"** (flagged for repetition).
  - **Missed Cards Sub-Session:** One-click generation of a targeted sub-deck containing only flagged cards.
  - Complete keyboard navigation:
    - `Space` / `Enter`: Flip card
    - `ArrowLeft` / `ArrowRight`: Navigate previous / next
    - `K` or `1`: Mark as known
    - `R` or `2`: Mark for review
- **Active-Recall Quiz:**
  - Multiple-choice assessment with randomized, plausible distractors.
  - Instant pedagogical feedback upon selection: reveals correctness, correct answer, and an in-depth explanatory breakdown.
  - Pre-selection lock: Correct answers are never revealed prematurely.
  - Keyboard shortcuts (`1`–`4` or `A`–`D` to choose options, `Enter` to advance).
  - **Retry Missed Questions:** Directly re-attempt only questions answered incorrectly.

### 2. Failure Simulator & Testing Mode
Built directly into the interface for reviewers and engineers:
- Instantly simulate **Malformed JSON**, **Markdown-Wrapped Codeblocks**, **Missing Required Fields**, **Empty Responses**, **Invalid Quiz Distractors**, **HTTP 429 Rate Limits**, and **15s Gateway Timeouts** to verify zero-crash reliability without burning API credits.

### 3. Polish & Accessibility
- Clean Light and Dark theme with persistence in `localStorage`.
- WCAG-compliant color contrast and visible `:focus-visible` keyboard rings.
- Fully responsive across mobile (320px–430px), tablet (768px–1024px), and desktop (1280px–1920px).
- Shimmering skeleton cards and progressive status indicators (no fake percentage bars).

---

## Architecture & Data Pipeline

StudyFlow isolates the AI provider from the user interface and enforces a unidirectional data flow:

```
[User Input] 
     ↓
[Express API Gateway (POST /api/generate)]
     ↓
[AI Provider Layer (Gemini / OpenAI / Intelligent Mock Engine)]
     ↓
[Raw LLM Output (String)]
     ↓
[parseAIResponse() — Strips Markdown fences & extracts JSON]
     ↓
[Zod Schema Validation (StudySetSchema)]
     ↓
[normalizeStudySet() — Deduplicates IDs, clamps bounds, trims text]
     ↓
[Predictable React State (useStudySession & useGenerateStudySet)]
     ↓
[Interactive UI View]
```

### Component Structure
```
src/
├── components/
│   ├── Header.jsx             # Branding, engine status badge, theme toggle
│   ├── StudyInput.jsx         # Textarea, char counter, keyboard shortcuts
│   ├── ModeSelector.jsx       # Flashcards vs Quiz segmented control
│   ├── DifficultySelector.jsx # Easy / Medium / Hard toggle
│   ├── DevFailureSimulator.jsx# In-app failure injection testing bar
│   ├── LoadingState.jsx       # Contextual stage messages & shimmer skeleton
│   ├── ErrorState.jsx         # Friendly non-technical error UI with retry
│   ├── EmptyState.jsx         # Initial state with clickable topic chips
│   ├── Flashcard.jsx          # Accessible 3D flip card component
│   ├── FlashcardSession.jsx   # Card progression, mastery tags, review deck
│   ├── QuizSession.jsx        # Question options, instant review, retry flow
│   └── ProgressBar.jsx        # Semantic, animated ARIA progress indicator
├── hooks/
│   ├── useGenerateStudySet.js # Generation lifecycle, AbortController, stale guard
│   └── useStudySession.js     # Active session state, mastery sets, sub-sessions
├── schemas/
│   └── studySet.js            # Client-side Zod schemas for Flashcards & Quiz
├── services/
│   └── api.js                 # Standardized fetch client with error normalization
├── utils/
│   ├── validation.js          # Markdown stripping, JSON extraction, error classes
│   └── normalize.js           # ID deduplication, bounds clamping, schema check
├── pages/
│   └── StudyWorkspace.jsx     # Master orchestrator coordinating all UI states
├── App.jsx
├── index.css                  # Vanilla CSS design tokens & responsive rules
└── main.jsx
```

---

## Resilience & AI Failure Handling

LLMs are prone to producing unparseable syntax, hallucinated schemas, or conversational preamble. StudyFlow handles 15 failure classes with zero crashes:

| Failure Mode | How StudyFlow Handles It | User Experience |
| :--- | :--- | :--- |
| **Invalid / Malformed JSON** | Catches syntax errors in `parseAIResponse()`, logs technical error to console. | Friendly error banner: *"The study engine returned an unreadable format. Please try again."* with **Try again** and **Edit input** buttons. |
| **Markdown-Wrapped JSON** | Regex strips ` ```json ` and ` ``` ` delimiters before parsing. | Seamless. Cards generate normally. |
| **Preamble / Chatter** | Locates first `{` and last `}` to extract the valid JSON substring. | Seamless. Extraneous conversational text is ignored. |
| **Empty / Whitespace Response** | Validates length prior to parsing; throws `EMPTY_RESPONSE`. | Non-technical message explaining no material was returned. |
| **Missing Fields** | Zod schema validation checks for required keys (`cards`, `questions`, etc.). | Caught before render; offers immediate retry. |
| **Duplicate IDs** | `normalizeStudySet` tracks seen IDs in a `Set` and generates unique cryptographic keys if duplicates exist. | React renders smoothly with stable `key` props. |
| **Invalid Quiz Distractors** | Requires min 2 distinct options; filters blank strings. | Skips unusable questions or alerts user cleanly. |
| **Out-of-Bounds `correctAnswer`** | Validates `correctAnswer >= 0 && correctAnswer < options.length`; clamps to index 0 as fallback. | Quiz does not throw runtime exceptions. |
| **HTTP 429 Rate Limit** | Backend and API client trap status 429 specifically. | Informs user that rate limits were hit and invites them to try again shortly. |
| **Network Timeout (504)** | AbortController and timeout handlers trigger friendly timeout notice. | Suggests trying a slightly shorter topic. |

---

## Concurrency & Stale Request Protection

A frequent flaw in AI applications is the **race condition**:
1. User enters Topic A and clicks *Generate* (Request A is in-flight).
2. User quickly realizes they want to edit their prompt, types Topic B, and clicks *Generate* (Request B starts).
3. If Request A finishes *after* Request B, a naive application overwrites the UI with the outdated Topic A results.

### How StudyFlow Solves This:
- **`AbortController`:** When a new generation request is triggered, any preceding in-flight HTTP request is immediately aborted at the network level using `controller.abort()`.
- **Generation ID Counter (`latestGenerationIdRef`):** Each request increments a persistent ref counter. When an asynchronous response resolves, state is updated **only if** `currentRequestId === latestGenerationIdRef.current`. Stale responses are discarded silently with a console audit trail.

---

## Tech Stack

- **Frontend:** React 18, Vite 6, Vanilla CSS (CSS Custom Properties design system, 8px grid)
- **Validation:** Zod (runtime type and boundary validation on both client and server)
- **Icons:** Lucide React
- **Backend:** Node.js, Express (API gateway isolating API secrets)
- **Testing:** Automated Node.js verification test suite (`test/verify.js`)
- **Supported AI Models:** Google Gemini (`gemini-1.5-flash`, `gemini-2.0-flash`) and OpenAI (`gpt-4o-mini`), alongside an **Intelligent Mock Engine** for instant offline development.

---

## Running Locally

### Prerequisites
- Node.js 18+ (tested on Node v20 & v24)
- npm 9+

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Build the production client bundle
npm run build

# 3. Start the application
npm start
```
The server will start on **`http://localhost:3001`**, serving both the full interactive client and the backend API.

### Development Mode (with Hot Module Replacement)
To run Vite with live reloading alongside the Express backend:
```bash
npm run dev
```
- Client runs on `http://localhost:5173` (proxied to API on 3001)
- Express server runs on `http://localhost:3001`

### Running Automated Architectural Verification
Run the 24-point failure mode test suite:
```bash
npm test
```

---

## Pushing to GitHub

To publish this codebase to a new GitHub repository:

```bash
# 1. Ensure you are on the main branch
git branch -M main

# 2. Add your GitHub remote URL (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/studyflow.git

# 3. Push all commits to GitHub
git push -u origin main
```

*(Note: `.env` is strictly excluded in `.gitignore`. Your API keys will never be pushed to Git.)*

---

## Publishing & Deployment

StudyFlow can be deployed seamlessly to any Node.js hosting platform:

### Deploying to Render / Railway / Fly.io
1. **Connect your GitHub Repository**: Select your pushed `studyflow` repo.
2. **Configure Build & Start Commands**:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
3. **Environment Variables**:
   - Add `AI_API_KEY`: *(Your Gemini or OpenAI API Key)*
   - Add `AI_PROVIDER`: `gemini`
   - Add `AI_MODEL`: `gemini-2.5-flash`
   - *(Optional)* Add `PORT`: `3001` (or use provider's `$PORT`)
4. **Deploy**: Your app will be live with full static assets and API proxying unified under a single URL!

---

## Environment Variables

StudyFlow works **out-of-the-box without an API key** using its pedagogical Mock Engine. 

To connect live AI:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your API key and provider in `.env`:
   ```env
   # API Port
   PORT=3001

   # AI Provider: 'gemini' | 'openai' | 'mock'
   AI_PROVIDER=gemini

   # Your API key (never committed to Git)
   AI_API_KEY=your_gemini_api_key_here

   # Optional model override
   AI_MODEL=gemini-1.5-flash
   ```

*Security Guarantee: `AI_API_KEY` is loaded strictly on the Express server and is never exposed in browser bundles.*

---

## AI Usage

AI tools were used during development for brainstorming, generating mock reference content, debugging validation edge cases, and reviewing code structure. All code, architecture, CSS tokens, and resilience pipelines were designed, adapted, tested, and reviewed manually to ensure production-grade standards.

---

## Known Limitations

1. **In-Memory Session State:** Study session progress is managed in React state; refreshing the browser resets the current session back to the input workspace.
2. **Audio Pronunciation:** Audio synthesis for vocabulary flashcards is not currently implemented in this version.
3. **Single Active Provider:** The backend currently switches between Gemini and OpenAI via environment variables rather than multi-provider runtime fallback chains.

---

## Time Spent

Approximately **8 hours** across architecture planning, design token creation, validation layer engineering, interactive component construction, failure simulation tooling, and test verification.
