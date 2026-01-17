import type { Question } from "@/types/quiz";

// ============================================================================
// Store State Types
// ============================================================================

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  showResult: boolean;
  score: number;
  answeredQuestions: Set<number>;
}

// ============================================================================
// Derived State Selectors
// ============================================================================

/**
 * Get the current question being displayed
 */
export const selectCurrentQuestion = (state: QuizState): Question =>
  state.questions[state.currentQuestionIndex];

/**
 * Check if we're on the last question
 */
export const selectIsLastQuestion = (state: QuizState): boolean =>
  state.currentQuestionIndex === state.questions.length - 1;

/**
 * Check if we're on the first question
 */
export const selectIsFirstQuestion = (state: QuizState): boolean =>
  state.currentQuestionIndex === 0;

/**
 * Calculate progress percentage (0-100)
 */
export const selectProgress = (state: QuizState): number =>
  ((state.currentQuestionIndex + 1) / state.questions.length) * 100;

/**
 * Calculate final score percentage (0-100)
 */
export const selectScorePercentage = (state: QuizState): number =>
  Math.round((state.score / state.questions.length) * 100);

/**
 * Check if selected answer is correct
 */
export const selectIsAnswerCorrect = (state: QuizState): boolean => {
  const currentQuestion = selectCurrentQuestion(state);
  return state.selectedAnswer === currentQuestion.correctAnswerIndex;
};

/**
 * Check if quiz is complete (answered all questions and on last question showing result)
 */
export const selectIsQuizComplete = (state: QuizState): boolean =>
  selectIsLastQuestion(state) &&
  state.showResult &&
  state.answeredQuestions.size === state.questions.length;

/**
 * Get formatted question counter string (e.g., "Question 1 of 10")
 */
export const selectQuestionCounter = (state: QuizState): string =>
  `Question ${state.currentQuestionIndex + 1} of ${state.questions.length}`;

/**
 * Get formatted score string (e.g., "5/10")
 */
export const selectScoreDisplay = (state: QuizState): string =>
  `${state.score}/${state.questions.length}`;
