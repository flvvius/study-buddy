import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuizStore } from "@/store/quizStore";
import { cn } from "@/lib/utils";

export function QuizQuestion() {
  const {
    questions,
    currentQuestionIndex,
    selectedAnswer,
    showResult,
    score,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    resetQuiz,
  } = useQuizStore();

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      return "hover:bg-accent hover:text-accent-foreground";
    }

    const isCorrect = index === currentQuestion.correctAnswerIndex;
    const isSelected = index === selectedAnswer;

    if (isCorrect) {
      return "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    }
    if (isSelected && !isCorrect) {
      return "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    }
    return "opacity-50";
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium">
            Score: {score}/{questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        {currentQuestion.hasUndetectedAnswer && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <span>⚠️</span>
              <span>
                Correct answer couldn't be detected from the Excel file
                (conditional formatting). First option assumed correct.
              </span>
            </p>
          </div>
        )}
        <CardTitle className="mt-4 text-xl leading-relaxed">
          {currentQuestion.question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => selectAnswer(index)}
              disabled={showResult}
              className={cn(
                "w-full p-4 text-left rounded-lg border-2 transition-all",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                getOptionStyle(index)
              )}
            >
              <span className="font-medium mr-3">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>

        {showResult && (
          <div
            className={cn(
              "mt-4 p-4 rounded-lg",
              selectedAnswer === currentQuestion.correctAnswerIndex
                ? "bg-green-50 dark:bg-green-900/20"
                : "bg-red-50 dark:bg-red-900/20"
            )}
          >
            <p
              className={cn(
                "font-semibold",
                selectedAnswer === currentQuestion.correctAnswerIndex
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              )}
            >
              {selectedAnswer === currentQuestion.correctAnswerIndex
                ? "✅ Correct!"
                : "❌ Incorrect!"}
            </p>
            {selectedAnswer !== currentQuestion.correctAnswerIndex && (
              <p className="text-sm mt-1 text-muted-foreground">
                The correct answer is:{" "}
                <span className="font-medium">
                  {currentQuestion.options[currentQuestion.correctAnswerIndex]}
                </span>
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          ← Previous
        </Button>
        <Button variant="outline" onClick={resetQuiz}>
          🔄 Restart
        </Button>
        {showResult && (
          <Button onClick={nextQuestion} disabled={isLastQuestion}>
            {isLastQuestion ? "Finish" : "Next →"}
          </Button>
        )}
        {!showResult && (
          <Button disabled className="opacity-50">
            Select an answer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
