import { Progress } from "@/components/ui/progress";

// ============================================================================
// Types
// ============================================================================

interface QuestionHeaderProps {
  questionCounter: string;
  scoreDisplay: string;
  progress: number;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Header showing question count, score, and progress bar
 */
export function QuestionHeader({
  questionCounter,
  scoreDisplay,
  progress,
}: QuestionHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{questionCounter}</span>
        <span className="text-sm font-medium">Score: {scoreDisplay}</span>
      </div>
      <Progress value={progress} className="h-2" />
    </>
  );
}
