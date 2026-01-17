import { create } from "zustand";
import type { Question } from "@/types/quiz";

interface QuizStore {
  // State
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  showResult: boolean;
  score: number;
  answeredQuestions: Set<number>;

  // Actions
  setQuestions: (questions: Question[]) => void;
  selectAnswer: (answerIndex: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  resetQuiz: () => void;
  goToQuestion: (index: number) => void;
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Shuffle options while tracking the correct answer
function shuffleQuestion(question: Question): Question {
  const correctAnswer = question.options[question.correctAnswerIndex];
  const shuffledOptions = shuffleArray(question.options);
  const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);

  return {
    ...question,
    options: shuffledOptions,
    correctAnswerIndex: newCorrectIndex,
  };
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  questions: [],
  currentQuestionIndex: 0,
  selectedAnswer: null,
  showResult: false,
  score: 0,
  answeredQuestions: new Set(),

  setQuestions: (questions) => {
    // Shuffle both the questions order and each question's options
    const shuffledQuestions = shuffleArray(questions).map(shuffleQuestion);
    set({
      questions: shuffledQuestions,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      showResult: false,
      score: 0,
      answeredQuestions: new Set(),
    });
  },

  selectAnswer: (answerIndex) => {
    const {
      questions,
      currentQuestionIndex,
      showResult,
      answeredQuestions,
      score,
    } = get();

    if (showResult) return; // Don't allow changing answer after showing result

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswerIndex;
    const alreadyAnswered = answeredQuestions.has(currentQuestionIndex);

    set({
      selectedAnswer: answerIndex,
      showResult: true,
      score: !alreadyAnswered && isCorrect ? score + 1 : score,
      answeredQuestions: new Set(answeredQuestions).add(currentQuestionIndex),
    });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        selectedAnswer: null,
        showResult: false,
      });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({
        currentQuestionIndex: currentQuestionIndex - 1,
        selectedAnswer: null,
        showResult: false,
      });
    }
  },

  goToQuestion: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({
        currentQuestionIndex: index,
        selectedAnswer: null,
        showResult: false,
      });
    }
  },

  resetQuiz: () => {
    const { questions } = get();
    // Re-shuffle everything on reset
    const shuffledQuestions = shuffleArray(questions).map(shuffleQuestion);
    set({
      questions: shuffledQuestions,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      showResult: false,
      score: 0,
      answeredQuestions: new Set(),
    });
  },
}));
