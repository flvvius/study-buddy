import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useQuizStore,
  selectCurrentQuestion,
  selectIsLastQuestion,
  selectIsFirstQuestion,
  selectProgress,
  selectQuestionCounter,
  selectScoreDisplay,
  selectIsAnswerCorrect,
} from "@/store";
import {
  OptionsList,
  ResultFeedback,
  UndetectedAnswerWarning,
  QuestionHeader,
  QuestionNavigation,
} from "@/components/quiz";

export function QuizQuestion() {
  // Actions
  const selectAnswer = useQuizStore((s) => s.selectAnswer);
  const nextQuestion = useQuizStore((s) => s.nextQuestion);
  const previousQuestion = useQuizStore((s) => s.previousQuestion);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);

  // State
  const selectedAnswer = useQuizStore((s) => s.selectedAnswer);
  const showResult = useQuizStore((s) => s.showResult);

  // Derived state via selectors
  const currentQuestion = useQuizStore(selectCurrentQuestion);
  const isLastQuestion = useQuizStore(selectIsLastQuestion);
  const isFirstQuestion = useQuizStore(selectIsFirstQuestion);
  const progress = useQuizStore(selectProgress);
  const questionCounter = useQuizStore(selectQuestionCounter);
  const scoreDisplay = useQuizStore(selectScoreDisplay);
  const isCorrect = useQuizStore(selectIsAnswerCorrect);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <QuestionHeader
          questionCounter={questionCounter}
          scoreDisplay={scoreDisplay}
          progress={progress}
        />
        <UndetectedAnswerWarning show={currentQuestion.hasUndetectedAnswer} />
        <CardTitle className="mt-4 text-xl leading-relaxed">
          {currentQuestion.question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <OptionsList
          options={currentQuestion.options}
          correctIndex={currentQuestion.correctAnswerIndex}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          onSelect={selectAnswer}
        />
        {showResult && (
          <ResultFeedback
            isCorrect={isCorrect}
            correctAnswer={
              currentQuestion.options[currentQuestion.correctAnswerIndex]
            }
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        <QuestionNavigation
          isFirstQuestion={isFirstQuestion}
          isLastQuestion={isLastQuestion}
          showResult={showResult}
          onPrevious={previousQuestion}
          onNext={nextQuestion}
          onReset={resetQuiz}
        />
      </CardFooter>
    </Card>
  );
}
