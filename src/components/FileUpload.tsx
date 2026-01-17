import { useCallback } from "react";
import ExcelJS from "exceljs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuizStore } from "@/store/quizStore";
import type { Question } from "@/types/quiz";

// Extract a comprehensive style signature from a cell for comparison
function getCellStyleSignature(cell: ExcelJS.Cell): string {
  const parts: string[] = [];

  // Font color - check all possible color representations
  const fontColor = cell.font?.color;
  if (fontColor) {
    if (fontColor.argb) {
      // Normalize black colors (FF000000) to not include them - they're default
      if (fontColor.argb !== "FF000000") {
        parts.push(`fc-argb:${fontColor.argb}`);
      }
    }
    if (fontColor.theme !== undefined) {
      // Theme 1 is typically black/default text, so only include non-default themes
      // OR if there's a tint applied (which changes the color)
      const tint = (fontColor as Record<string, unknown>).tint;
      if (fontColor.theme !== 1 || tint !== undefined) {
        parts.push(`fc-theme:${fontColor.theme}`);
        if (tint !== undefined) {
          parts.push(`fc-tint:${tint}`);
        }
      }
    }
    if ((fontColor as Record<string, unknown>).indexed !== undefined) {
      parts.push(
        `fc-indexed:${(fontColor as Record<string, unknown>).indexed}`
      );
    }
  }
  // Note: If fontColor is undefined, we don't add anything - this is treated as default (black)

  // Fill/background color - check all color representations
  const fill = cell.fill;
  if (fill && fill.type === "pattern") {
    const patternFill = fill as ExcelJS.FillPattern;
    if (patternFill.fgColor) {
      if (patternFill.fgColor.argb) {
        parts.push(`bg-argb:${patternFill.fgColor.argb}`);
      }
      if (patternFill.fgColor.theme !== undefined) {
        parts.push(`bg-theme:${patternFill.fgColor.theme}`);
      }
      if (
        (patternFill.fgColor as Record<string, unknown>).indexed !== undefined
      ) {
        parts.push(
          `bg-indexed:${
            (patternFill.fgColor as Record<string, unknown>).indexed
          }`
        );
      }
    }
    if (patternFill.bgColor) {
      if (patternFill.bgColor.argb) {
        parts.push(`bg2-argb:${patternFill.bgColor.argb}`);
      }
      if (patternFill.bgColor.theme !== undefined) {
        parts.push(`bg2-theme:${patternFill.bgColor.theme}`);
      }
    }
    if (patternFill.pattern && patternFill.pattern !== "none") {
      parts.push(`pattern:${patternFill.pattern}`);
    }
  }

  // Font styles
  if (cell.font?.bold) parts.push("bold");
  if (cell.font?.italic) parts.push("italic");
  if (cell.font?.underline) parts.push("underline");
  if (cell.font?.strike) parts.push("strike");
  if (cell.font?.name) parts.push(`fn:${cell.font.name}`);
  if (cell.font?.size) parts.push(`fs:${cell.font.size}`);

  return parts.length > 0 ? parts.join("|") : "default";
}

// Find the outlier cell index - the one that's styled differently
function findOutlierIndex(signatures: string[]): number {
  if (signatures.length < 2) return 0;

  // Count occurrences of each signature
  const counts = new Map<string, number>();
  signatures.forEach((sig) => {
    counts.set(sig, (counts.get(sig) || 0) + 1);
  });

  // If all signatures are the same, return 0 (no outlier)
  if (counts.size === 1) return 0;

  // Find the signature that appears least (ideally just once)
  let minCount = Infinity;
  let minSig = "";
  counts.forEach((count, sig) => {
    if (count < minCount) {
      minCount = count;
      minSig = sig;
    }
  });

  // Return the first index with that signature
  return signatures.findIndex((sig) => sig === minSig);
}

// Extract plain text from a cell, handling rich text objects
function getCellText(cell: ExcelJS.Cell): string {
  const value = cell.value;

  // If it's null or undefined
  if (value == null) return "";

  // If it's already a string
  if (typeof value === "string") return value.trim();

  // If it's a number or boolean
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  // If it's a rich text object (has 'richText' property)
  if (typeof value === "object" && "richText" in value) {
    const richText = value as { richText: Array<{ text: string }> };
    return richText.richText
      .map((rt) => rt.text)
      .join("")
      .trim();
  }

  // If it's a formula result
  if (typeof value === "object" && "result" in value) {
    const formula = value as { result?: unknown };
    if (typeof formula.result === "string") return formula.result.trim();
    if (typeof formula.result === "number") return String(formula.result);
  }

  // Fallback to cell.text which ExcelJS provides
  if (cell.text) return cell.text.trim();

  // Last resort
  return String(value);
}

export function FileUpload() {
  const setQuestions = useQuizStore((state) => state.setQuestions);

  const parseFile = useCallback(
    async (file: File) => {
      const data = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();

      // Detect file type and read accordingly
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith(".csv")) {
        // For CSV, create a stream from the file
        const stream = new Blob([data]).stream();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await workbook.csv.read(stream as any);
      } else {
        await workbook.xlsx.load(data);
      }

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        alert("No worksheet found in the file.");
        return;
      }

      const questions: Question[] = [];

      worksheet.eachRow((row, rowNumber) => {
        // Get the actual cell count in this row
        const cellCount = row.cellCount;
        if (cellCount < 3) return; // Need question + at least 2 options

        // Get question from first column
        const questionCell = row.getCell(1);
        const questionText = getCellText(questionCell);
        if (!questionText) return;

        // Collect options from column 2 onwards
        // IMPORTANT: Skip cells that have the same text as the question (merged cells)
        const optionCells: ExcelJS.Cell[] = [];
        const optionValues: string[] = [];

        for (let col = 2; col <= cellCount; col++) {
          const cell = row.getCell(col);
          const text = getCellText(cell);

          // Skip empty cells and cells that contain the question text (merged cells)
          if (text.length > 0 && text !== questionText) {
            optionCells.push(cell);
            optionValues.push(text);
          }
        }

        // Need at least 2 options
        if (optionValues.length < 2) return;

        // Get style signatures for each option cell
        const signatures = optionCells.map((cell) =>
          getCellStyleSignature(cell)
        );

        // Find the outlier (correct answer)
        const correctAnswerIndex = findOutlierIndex(signatures);

        questions.push({
          id: rowNumber,
          question: questionText,
          options: optionValues,
          correctAnswerIndex,
        });
      });

      if (questions.length === 0) {
        alert(
          "No valid questions found. Each row needs: Question | Option1 | Option2 | ..."
        );
        return;
      }

      console.log(`Loaded ${questions.length} questions`);
      setQuestions(questions);
    },
    [setQuestions]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        parseFile(file);
      }
    },
    [parseFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        parseFile(file);
      }
    },
    [parseFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">📚 Study Buddy</CardTitle>
        <CardDescription className="text-base">
          Upload your quiz file to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl">📄</div>
            <div>
              <p className="text-lg font-medium">Drag & drop your file here</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports Excel (.xlsx, .xls) and CSV files
              </p>
            </div>
            <div className="text-muted-foreground">or</div>
            <Button asChild>
              <label className="cursor-pointer">
                Browse Files
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </div>
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Expected file format:</p>
          <p className="text-xs text-muted-foreground">
            Each row: Question | Option 1 | Option 2 | Option 3 | ...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            The correct answer should be{" "}
            <span className="font-medium">highlighted differently</span>{" "}
            (different color, bold, etc.)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
