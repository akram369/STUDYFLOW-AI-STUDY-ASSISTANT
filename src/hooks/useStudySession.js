import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Hook to manage interactive Flashcard and Quiz study session states
 */
export function useStudySession(initialStudySet) {
  // Store the primary root study set
  const [rootStudySet, setRootStudySet] = useState(initialStudySet);
  // Store the active deck/subset currently being studied (can be sub-deck of missed items)
  const [activeSet, setActiveSet] = useState(initialStudySet);
  const [isSubSession, setIsSubSession] = useState(false);

  // Sync if root studySet prop changes
  useEffect(() => {
    setRootStudySet(initialStudySet);
    setActiveSet(initialStudySet);
    setIsSubSession(false);
  }, [initialStudySet]);

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCardIds, setKnownCardIds] = useState(new Set());
  const [reviewCardIds, setReviewCardIds] = useState(new Set());
  const [isCardSessionFinished, setIsCardSessionFinished] = useState(false);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: number }
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // -------------------------------------------------------------
  // FLASHCARD ACTIONS
  // -------------------------------------------------------------
  const currentCard = useMemo(() => {
    if (!activeSet || activeSet.type !== 'flashcards' || !activeSet.cards) return null;
    return activeSet.cards[cardIndex] || null;
  }, [activeSet, cardIndex]);

  const flipCard = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const nextCard = useCallback(() => {
    if (!activeSet?.cards) return;
    if (cardIndex < activeSet.cards.length - 1) {
      setCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsCardSessionFinished(true);
    }
  }, [activeSet, cardIndex]);

  const prevCard = useCallback(() => {
    if (cardIndex > 0) {
      setCardIndex(prev => prev - 1);
      setIsFlipped(false);
      setIsCardSessionFinished(false);
    }
  }, [cardIndex]);

  const markKnown = useCallback(() => {
    if (!currentCard) return;
    const cardId = currentCard.id;

    setKnownCardIds(prev => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });

    setReviewCardIds(prev => {
      const next = new Set(prev);
      next.delete(cardId);
      return next;
    });

    nextCard();
  }, [currentCard, nextCard]);

  const markReview = useCallback(() => {
    if (!currentCard) return;
    const cardId = currentCard.id;

    setReviewCardIds(prev => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });

    setKnownCardIds(prev => {
      const next = new Set(prev);
      next.delete(cardId);
      return next;
    });

    nextCard();
  }, [currentCard, nextCard]);

  const startReviewMissedCards = useCallback(() => {
    if (!rootStudySet || rootStudySet.type !== 'flashcards') return;
    const missedCards = rootStudySet.cards.filter(c => reviewCardIds.has(c.id));
    if (missedCards.length === 0) return;

    setActiveSet({
      ...rootStudySet,
      title: `${rootStudySet.title} (Review Missed)`,
      cards: missedCards,
    });
    setCardIndex(0);
    setIsFlipped(false);
    setIsCardSessionFinished(false);
    setIsSubSession(true);
  }, [rootStudySet, reviewCardIds]);

  const restartCardSession = useCallback(() => {
    setActiveSet(rootStudySet);
    setCardIndex(0);
    setIsFlipped(false);
    setKnownCardIds(new Set());
    setReviewCardIds(new Set());
    setIsCardSessionFinished(false);
    setIsSubSession(false);
  }, [rootStudySet]);

  // -------------------------------------------------------------
  // QUIZ ACTIONS
  // -------------------------------------------------------------
  const currentQuestion = useMemo(() => {
    if (!activeSet || activeSet.type !== 'quiz' || !activeSet.questions) return null;
    return activeSet.questions[quizIndex] || null;
  }, [activeSet, quizIndex]);

  const selectQuizAnswer = useCallback((optionIndex) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    // Don't allow changing if already answered this question
    if (selectedAnswers[qId] !== undefined) return;

    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionIndex,
    }));
  }, [currentQuestion, selectedAnswers]);

  const nextQuestion = useCallback(() => {
    if (!activeSet?.questions) return;
    if (quizIndex < activeSet.questions.length - 1) {
      setQuizIndex(prev => prev + 1);
    } else {
      setIsQuizCompleted(true);
    }
  }, [activeSet, quizIndex]);

  const prevQuestion = useCallback(() => {
    if (quizIndex > 0) {
      setQuizIndex(prev => prev - 1);
      setIsQuizCompleted(false);
    }
  }, [quizIndex]);

  // Quiz score calculation
  const quizScore = useMemo(() => {
    if (!activeSet || activeSet.type !== 'quiz' || !activeSet.questions) {
      return { correct: 0, total: 0, percentage: 0 };
    }
    const questions = activeSet.questions;
    let correct = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    };
  }, [activeSet, selectedAnswers]);

  const retryMissedQuestions = useCallback(() => {
    if (!rootStudySet || rootStudySet.type !== 'quiz') return;
    const missed = rootStudySet.questions.filter(
      q => selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== q.correctAnswer
    );
    if (missed.length === 0) return;

    setActiveSet({
      ...rootStudySet,
      title: `${rootStudySet.title} (Retry Missed)`,
      questions: missed,
    });
    setQuizIndex(0);
    // Clear answers for missed questions so user can re-answer
    setSelectedAnswers(prev => {
      const copy = { ...prev };
      missed.forEach(m => delete copy[m.id]);
      return copy;
    });
    setIsQuizCompleted(false);
    setIsSubSession(true);
  }, [rootStudySet, selectedAnswers]);

  const restartQuiz = useCallback(() => {
    setActiveSet(rootStudySet);
    setQuizIndex(0);
    setSelectedAnswers({});
    setIsQuizCompleted(false);
    setIsSubSession(false);
  }, [rootStudySet]);

  return {
    activeSet,
    rootStudySet,
    isSubSession,

    // Flashcards
    cardIndex,
    currentCard,
    isFlipped,
    knownCardIds,
    reviewCardIds,
    isCardSessionFinished,
    flipCard,
    nextCard,
    prevCard,
    markKnown,
    markReview,
    startReviewMissedCards,
    restartCardSession,

    // Quiz
    quizIndex,
    currentQuestion,
    selectedAnswers,
    isQuizCompleted,
    quizScore,
    selectQuizAnswer,
    nextQuestion,
    prevQuestion,
    retryMissedQuestions,
    restartQuiz,
  };
}
