import { Button } from "@/components/ui/button";

// ============================================================================
// Types
// ============================================================================

interface QuestionNavigationProps {
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  showResult: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onReset: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Navigation buttons for quiz questions
 */
export function QuestionNavigation({
  isFirstQuestion,
  isLastQuestion,
  showResult,
  onPrevious,
  onNext,
  onReset,
}: QuestionNavigationProps) {
  return (
    <>
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstQuestion}
        aria-label="Go to previous question"
      >
        ← Previous
      </Button>
      <Button
        variant="outline"
        onClick={onReset}
        aria-label="Restart quiz from beginning"
      >
        🔄 Restart
      </Button>
      {showResult ? (
        <Button
          onClick={onNext}
          disabled={isLastQuestion}
          aria-label={isLastQuestion ? "Finish quiz" : "Go to next question"}
        >
          {isLastQuestion ? "Finish" : "Next →"}
        </Button>
      ) : (
        <Button disabled className="opacity-50" aria-label="Select an answer to continue">
          Select an answer
        </Button>
      )}
    </>
  );
}
