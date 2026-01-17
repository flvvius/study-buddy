// ============================================================================
// Types
// ============================================================================

interface UndetectedAnswerWarningProps {
  show?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Warning banner for questions where correct answer couldn't be detected
 */
export function UndetectedAnswerWarning({
  show,
}: UndetectedAnswerWarningProps) {
  if (!show) return null;

  return (
    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
        <span>⚠️</span>
        <span>
          Correct answer couldn't be detected from the Excel file (conditional
          formatting). First option assumed correct.
        </span>
      </p>
    </div>
  );
}
