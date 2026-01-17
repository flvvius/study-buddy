import type { Question } from "@/types/quiz";

/**
 * Result of parsing a quiz file
 */
export interface ParseResult {
  questions: Question[];
  /** Row numbers that had identical styling (couldn't detect correct answer) */
  rowsWithIdenticalStyling: number[];
}

/**
 * Parser function signature
 */
export type ParserFn = (file: File) => Promise<ParseResult>;

/**
 * Supported file extensions
 */
export type SupportedExtension = "xlsx" | "xls" | "csv";
