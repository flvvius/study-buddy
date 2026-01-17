import type ExcelJS from "exceljs";

/**
 * Extracts plain text from an Excel cell, handling various value types:
 * - Plain strings
 * - Numbers and booleans
 * - Rich text objects
 * - Formula results
 */
export const getCellText = (cell: ExcelJS.Cell): string => {
  const value = cell.value;

  // Null or undefined
  if (value == null) return "";

  // Already a string
  if (typeof value === "string") return value.trim();

  // Number or boolean
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  // Rich text object (has 'richText' property)
  if (typeof value === "object" && "richText" in value) {
    const richText = value as { richText: Array<{ text: string }> };
    return richText.richText
      .map((rt) => rt.text)
      .join("")
      .trim();
  }

  // Formula result
  if (typeof value === "object" && "result" in value) {
    const formula = value as { result?: unknown };
    if (typeof formula.result === "string") return formula.result.trim();
    if (typeof formula.result === "number") return String(formula.result);
  }

  // Fallback to cell.text which ExcelJS provides
  if (cell.text) return cell.text.trim();

  // Last resort
  return String(value);
};
