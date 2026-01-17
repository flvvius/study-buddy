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

export function QuizResults() {
  const { questions, score, resetQuiz } = useQuizStore();
  const percentage = Math.round((score / questions.length) * 100);

  const getMessage = () => {
    if (percentage >= 90) return { emoji: "🏆", text: "Outstanding!" };
    if (percentage >= 70) return { emoji: "🎉", text: "Great job!" };
    if (percentage >= 50) return { emoji: "👍", text: "Good effort!" };
    return { emoji: "💪", text: "Keep practicing!" };
  };

  const { emoji, text } = getMessage();

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <CardTitle className="text-3xl">{text}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="mb-6">
          <p className="text-5xl font-bold text-primary">{score}</p>
          <p className="text-muted-foreground">
            out of {questions.length} correct
          </p>
        </div>

        <div className="mb-4">
          <Progress value={percentage} className="h-4" />
        </div>

        <p
          className={cn(
            "text-2xl font-semibold",
            percentage >= 70
              ? "text-green-600 dark:text-green-400"
              : percentage >= 50
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {percentage}%
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button onClick={resetQuiz} className="w-full" size="lg">
          🔄 Try Again
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.location.reload()}
        >
          📄 Upload New Quiz
        </Button>
      </CardFooter>
    </Card>
  );
}
