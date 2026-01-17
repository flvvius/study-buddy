export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number; // First option (index 0) is always the correct answer from the file
  hasUndetectedAnswer?: boolean; // True if all options had identical styling (likely conditional formatting)
}
