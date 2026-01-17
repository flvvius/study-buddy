import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export type OptionState = "default" | "correct" | "incorrect" | "disabled";

// ============================================================================
// Option State Calculation
// ============================================================================

interface GetOptionStateParams {
  index: number;
  correctIndex: number;
  selectedAnswer: number | null;
  showResult: boolean;
}

/**
 * Determine the visual state of an option button
 */
export const getOptionState = ({
  index,
  correctIndex,
  selectedAnswer,
  showResult,
}: GetOptionStateParams): OptionState => {
  if (!showResult) return "default";

  if (index === correctIndex) return "correct";
  if (index === selectedAnswer) return "incorrect";
  return "disabled";
};

// ============================================================================
// Style Mappings
// ============================================================================

const optionStyles: Record<OptionState, string> = {
  default: "hover:bg-accent hover:text-accent-foreground",
  correct:
    "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  incorrect:
    "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  disabled: "opacity-50",
};

/**
 * Get Tailwind classes for an option button based on its state
 */
export const getOptionClassName = (state: OptionState): string =>
  optionStyles[state];

// ============================================================================
// Component Props
// ============================================================================

interface OptionButtonProps {
  option: string;
  index: number;
  state: OptionState;
  disabled: boolean;
  onSelect: (index: number) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Individual answer option button
 */
export function OptionButton({
  option,
  index,
  state,
  disabled,
  onSelect,
}: OptionButtonProps) {
  const optionLabel = String.fromCharCode(65 + index);
  
  return (
    <button
      onClick={() => onSelect(index)}
      disabled={disabled}
      aria-label={`Option ${optionLabel}: ${option}`}
      aria-pressed={state === "correct" || state === "incorrect"}
      className={cn(
        "w-full p-4 text-left rounded-lg border-2 transition-all",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        getOptionClassName(state)
      )}
    >
      <span className="font-medium mr-3">
        {optionLabel}.
      </span>
      {option}
    </button>
  );
}

// ============================================================================
// Options List Component
// ============================================================================

interface OptionsListProps {
  options: string[];
  correctIndex: number;
  selectedAnswer: number | null;
  showResult: boolean;
  onSelect: (index: number) => void;
}

/**
 * List of answer option buttons
 */
export function OptionsList({
  options,
  correctIndex,
  selectedAnswer,
  showResult,
  onSelect,
}: OptionsListProps) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option, index) => (
        <OptionButton
          key={index}
          option={option}
          index={index}
          state={getOptionState({
            index,
            correctIndex,
            selectedAnswer,
            showResult,
          })}
          disabled={showResult}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
