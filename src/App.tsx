import { FileUpload } from "@/components/FileUpload";
import { QuizQuestion } from "@/components/QuizQuestion";
import { QuizResults } from "@/components/QuizResults";
import { useQuizStore } from "@/store/quizStore";
import { Toaster } from "@/components/ui/sonner";

function App() {
  const { questions, currentQuestionIndex, showResult, answeredQuestions } =
    useQuizStore();

  const hasQuestions = questions.length > 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isQuizComplete =
    hasQuestions &&
    isLastQuestion &&
    showResult &&
    answeredQuestions.has(currentQuestionIndex);

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {!hasQuestions && <FileUpload />}
        {hasQuestions && !isQuizComplete && <QuizQuestion />}
        {isQuizComplete && <QuizResults />}
      </div>
    </>
  );
}

export default App;
