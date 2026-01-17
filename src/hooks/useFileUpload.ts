import { useCallback, useState } from "react";
import { toast } from "sonner";
import { parseExcelFile } from "@/services/parsers";
import { useQuizStore } from "@/store/quizStore";

// ============================================================================
// Constants
// ============================================================================

const SUPPORTED_EXTENSIONS = [".xlsx", ".xls", ".csv"] as const;

// ============================================================================
// File Validation
// ============================================================================

/**
 * Check if file has a supported extension
 */
const isValidFileType = (fileName: string): boolean => {
  const lowerName = fileName.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
};

// ============================================================================
// Toast Notifications
// ============================================================================

interface ToastConfig {
  questionsCount: number;
  detectedCount: number;
  rowsWithIdenticalStyling: number[];
}

/**
 * Show toast notifications for parsing results.
 */
const showParseResultToasts = ({
  questionsCount,
  detectedCount,
  rowsWithIdenticalStyling,
}: ToastConfig): void => {
  // Warn about rows with identical styling (likely conditional formatting)
  if (rowsWithIdenticalStyling.length > 0) {
    toast.warning(
      `${rowsWithIdenticalStyling.length} question(s) couldn't detect the correct answer`,
      {
        description: `Rows ${rowsWithIdenticalStyling.join(
          ", "
        )} use Excel conditional formatting which can't be read. The first option is assumed correct for these.`,
        duration: 8000,
      }
    );
  }

  // Success toast
  toast.success(`Loaded ${questionsCount} questions`, {
    description: `${detectedCount} with detected correct answers`,
    duration: 3000,
  });
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for handling file upload and parsing.
 * Returns handlers for file input change and drag-and-drop events.
 */
export const useFileUpload = () => {
  const setQuestions = useQuizStore((state) => state.setQuestions);
  const [isLoading, setIsLoading] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      // Validate file type
      if (!isValidFileType(file.name)) {
        toast.error("Unsupported file type", {
          description: "Please upload an Excel (.xlsx, .xls) or CSV file.",
        });
        return;
      }

      setIsLoading(true);

      try {
        const { questions, rowsWithIdenticalStyling } = await parseExcelFile(
          file
        );

        if (questions.length === 0) {
          toast.error("No valid questions found", {
            description: "Each row needs: Question | Option1 | Option2 | ...",
          });
          return;
        }

        showParseResultToasts({
          questionsCount: questions.length,
          detectedCount: questions.length - rowsWithIdenticalStyling.length,
          rowsWithIdenticalStyling,
        });

        setQuestions(questions);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to parse file";
        toast.error("Error parsing file", { description: message });
      } finally {
        setIsLoading(false);
      }
    },
    [setQuestions]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return {
    isLoading,
    handleFileChange,
    handleDrop,
    handleDragOver,
  };
};
