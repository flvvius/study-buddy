import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface ResultFeedbackProps {
  isCorrect: boolean;
  correctAnswer: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Feedback panel shown after answering a question
 */
export function ResultFeedback({
  isCorrect,
  correctAnswer,
}: ResultFeedbackProps) {
  return (
    <div
      className={cn(
        "mt-4 p-4 rounded-lg",
        isCorrect
          ? "bg-green-50 dark:bg-green-900/20"
          : "bg-red-50 dark:bg-red-900/20"
      )}
    >
      <p
        className={cn(
          "font-semibold",
          isCorrect
            ? "text-green-700 dark:text-green-300"
            : "text-red-700 dark:text-red-300"
        )}
      >
        {isCorrect ? "✅ Correct!" : "❌ Incorrect!"}
      </p>
      {!isCorrect && (
        <p className="text-sm mt-1 text-muted-foreground">
          The correct answer is:{" "}
          <span className="font-medium">{correctAnswer}</span>
        </p>
      )}
    </div>
  );
}
