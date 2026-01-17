export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number; // First option (index 0) is always the correct answer from the file
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  showResult: boolean;
  score: number;
  isQuizComplete: boolean;
}
