import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuizStore, selectScorePercentage } from "@/store";
import { cn } from "@/lib/utils";

// ============================================================================
// Result Message Logic
// ============================================================================

interface ResultMessage {
  emoji: string;
  text: string;
}

const getResultMessage = (percentage: number): ResultMessage => {
  if (percentage >= 90) return { emoji: "🏆", text: "Outstanding!" };
  if (percentage >= 70) return { emoji: "🎉", text: "Great job!" };
  if (percentage >= 50) return { emoji: "👍", text: "Good effort!" };
  return { emoji: "💪", text: "Keep practicing!" };
};

const getScoreColorClass = (percentage: number): string => {
  if (percentage >= 70) return "text-green-600 dark:text-green-400";
  if (percentage >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

// ============================================================================
// Component
// ============================================================================

export function QuizResults() {
  const questions = useQuizStore((s) => s.questions);
  const score = useQuizStore((s) => s.score);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);
  const percentage = useQuizStore(selectScorePercentage);

  const { emoji, text } = getResultMessage(percentage);

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <CardTitle className="text-3xl">{text}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <ScoreDisplay score={score} total={questions.length} />
        <div className="mb-4">
          <Progress value={percentage} className="h-4" />
        </div>
        <p
          className={cn(
            "text-2xl font-semibold",
            getScoreColorClass(percentage)
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

// ============================================================================
// Sub-components
// ============================================================================

interface ScoreDisplayProps {
  score: number;
  total: number;
}

function ScoreDisplay({ score, total }: ScoreDisplayProps) {
  return (
    <div className="mb-6">
      <p className="text-5xl font-bold text-primary">{score}</p>
      <p className="text-muted-foreground">out of {total} correct</p>
    </div>
  );
}
