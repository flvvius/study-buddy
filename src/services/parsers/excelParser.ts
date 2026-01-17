import ExcelJS from "exceljs";
import {
  getCellText,
  getCellStyleSignature,
  findOutlierIndex,
} from "@/services/excel";
import type { Question } from "@/types/quiz";
import type { ParseResult } from "./types";

// ============================================================================
// Row Processing
// ============================================================================

interface RowParseResult {
  question: Question | null;
  hasIdenticalStyling: boolean;
}

/**
 * Parse a single worksheet row into a Question.
 * Returns null if row doesn't have valid question format.
 */
const parseRow = (row: ExcelJS.Row, rowNumber: number): RowParseResult => {
  const cellCount = row.cellCount;

  // Need question + at least 2 options
  if (cellCount < 3) {
    return { question: null, hasIdenticalStyling: false };
  }

  // Get question from first column
  const questionCell = row.getCell(1);
  const questionText = getCellText(questionCell);
  if (!questionText) {
    return { question: null, hasIdenticalStyling: false };
  }

  // Collect options from column 2 onwards
  // Skip cells that have the same text as the question (merged cells)
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
  if (optionValues.length < 2) {
    return { question: null, hasIdenticalStyling: false };
  }

  // Get style signatures for each option cell
  const signatures = optionCells.map((cell) => getCellStyleSignature(cell));

  // Check if all signatures are identical (no styling difference detected)
  const uniqueSignatures = new Set(signatures);
  const hasUndetectedAnswer = uniqueSignatures.size === 1;

  // Find the outlier (correct answer)
  const correctAnswerIndex = findOutlierIndex(signatures);

  return {
    question: {
      id: rowNumber,
      question: questionText,
      options: optionValues,
      correctAnswerIndex,
      hasUndetectedAnswer,
    },
    hasIdenticalStyling: hasUndetectedAnswer,
  };
};

// ============================================================================
// Worksheet Processing
// ============================================================================

/**
 * Parse all rows from a worksheet into Questions.
 */
const parseWorksheet = (worksheet: ExcelJS.Worksheet): ParseResult => {
  const questions: Question[] = [];
  const rowsWithIdenticalStyling: number[] = [];

  worksheet.eachRow((row, rowNumber) => {
    const { question, hasIdenticalStyling } = parseRow(row, rowNumber);

    if (question) {
      questions.push(question);
      if (hasIdenticalStyling) {
        rowsWithIdenticalStyling.push(rowNumber);
      }
    }
  });

  return { questions, rowsWithIdenticalStyling };
};

// ============================================================================
// File Loading
// ============================================================================

/**
 * Load a file into an ExcelJS workbook.
 * Handles both Excel (.xlsx, .xls) and CSV formats.
 */
const loadWorkbook = async (file: File): Promise<ExcelJS.Workbook> => {
  const data = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();

  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".csv")) {
    const stream = new Blob([data]).stream();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workbook.csv.read(stream as any);
  } else {
    await workbook.xlsx.load(data);
  }

  return workbook;
};

// ============================================================================
// Public API
// ============================================================================

/**
 * Parse an Excel or CSV file into quiz questions.
 *
 * @param file - The file to parse
 * @returns ParseResult with questions and rows that had identical styling
 * @throws Error if no worksheet found
 */
export const parseExcelFile = async (file: File): Promise<ParseResult> => {
  const workbook = await loadWorkbook(file);
  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("No worksheet found in the file.");
  }

  return parseWorksheet(worksheet);
};
