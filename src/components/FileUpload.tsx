import { useCallback } from "react";
import * as XLSX from "xlsx";
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

export function FileUpload() {
  const setQuestions = useQuizStore((state) => state.setQuestions);

  const parseFile = useCallback(
    async (file: File) => {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to array of arrays
      const rows: string[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });

      // Filter out empty rows and parse questions
      const questions: Question[] = rows
        .filter((row) => row.length >= 2 && row[0]?.toString().trim()) // At least question + 1 option
        .map((row, index) => {
          const question = row[0]?.toString().trim() || "";
          const options = row
            .slice(1)
            .map((opt) => opt?.toString().trim())
            .filter((opt) => opt && opt.length > 0);

          return {
            id: index + 1,
            question,
            options,
            correctAnswerIndex: 0, // First option is always correct in the source file
          };
        })
        .filter((q) => q.options.length >= 2); // Need at least 2 options for a valid question

      if (questions.length === 0) {
        alert(
          "No valid questions found in the file. Make sure the format is: Question | Correct Answer | Wrong Answer 1 | Wrong Answer 2 | ..."
        );
        return;
      }

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
            Each row: Question | Correct Answer | Option 2 | Option 3 | ...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            The first answer column is treated as the correct answer.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
