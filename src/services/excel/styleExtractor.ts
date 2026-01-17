import type ExcelJS from "exceljs";

/**
 * Style part extractor function signature.
 * Returns a string part of the signature or null if not applicable.
 */
type StylePartExtractor = (cell: ExcelJS.Cell) => string | null;

/**
 * Extracts font color information from a cell.
 * Handles ARGB, theme colors, indexed colors, and tints.
 * Normalizes default black (FF000000, theme:1) to not be included.
 */
const extractFontColor: StylePartExtractor = (cell) => {
  const fontColor = cell.font?.color;
  if (!fontColor) return null;

  const parts: string[] = [];

  // ARGB color (skip default black)
  if (fontColor.argb && fontColor.argb !== "FF000000") {
    parts.push(`fc-argb:${fontColor.argb}`);
  }

  // Theme color (skip theme:1 which is typically black, unless tinted)
  if (fontColor.theme !== undefined) {
    const tint = (fontColor as Record<string, unknown>).tint;
    if (fontColor.theme !== 1 || tint !== undefined) {
      parts.push(`fc-theme:${fontColor.theme}`);
      if (tint !== undefined) {
        parts.push(`fc-tint:${tint}`);
      }
    }
  }

  // Indexed color
  const indexed = (fontColor as Record<string, unknown>).indexed;
  if (indexed !== undefined) {
    parts.push(`fc-indexed:${indexed}`);
  }

  return parts.length > 0 ? parts.join("|") : null;
};

/**
 * Extracts fill/background color information from a cell.
 * Handles pattern fills with foreground and background colors.
 */
const extractFillColor: StylePartExtractor = (cell) => {
  const fill = cell.fill;
  if (!fill || fill.type !== "pattern") return null;

  const patternFill = fill as ExcelJS.FillPattern;
  const parts: string[] = [];

  // Foreground color
  if (patternFill.fgColor) {
    if (patternFill.fgColor.argb) {
      parts.push(`bg-argb:${patternFill.fgColor.argb}`);
    }
    if (patternFill.fgColor.theme !== undefined) {
      parts.push(`bg-theme:${patternFill.fgColor.theme}`);
    }
    const indexed = (patternFill.fgColor as Record<string, unknown>).indexed;
    if (indexed !== undefined) {
      parts.push(`bg-indexed:${indexed}`);
    }
  }

  // Background color
  if (patternFill.bgColor) {
    if (patternFill.bgColor.argb) {
      parts.push(`bg2-argb:${patternFill.bgColor.argb}`);
    }
    if (patternFill.bgColor.theme !== undefined) {
      parts.push(`bg2-theme:${patternFill.bgColor.theme}`);
    }
  }

  // Pattern type
  if (patternFill.pattern && patternFill.pattern !== "none") {
    parts.push(`pattern:${patternFill.pattern}`);
  }

  return parts.length > 0 ? parts.join("|") : null;
};

/**
 * Extracts font style information (bold, italic, underline, etc.)
 */
const extractFontStyles: StylePartExtractor = (cell) => {
  const font = cell.font;
  if (!font) return null;

  const parts: string[] = [];

  if (font.bold) parts.push("bold");
  if (font.italic) parts.push("italic");
  if (font.underline) parts.push("underline");
  if (font.strike) parts.push("strike");
  if (font.name) parts.push(`fn:${font.name}`);
  if (font.size) parts.push(`fs:${font.size}`);

  return parts.length > 0 ? parts.join("|") : null;
};

/**
 * Extracts border style information from a cell.
 */
const extractBorders: StylePartExtractor = (cell) => {
  const border = cell.border;
  if (!border) return null;

  const parts: string[] = [];

  if (border.top?.style) parts.push(`t:${border.top.style}`);
  if (border.bottom?.style) parts.push(`b:${border.bottom.style}`);
  if (border.left?.style) parts.push(`l:${border.left.style}`);
  if (border.right?.style) parts.push(`r:${border.right.style}`);
  if (border.top?.color?.argb) parts.push(`tc:${border.top.color.argb}`);
  if (border.bottom?.color?.argb) parts.push(`bc:${border.bottom.color.argb}`);
  if (border.left?.color?.argb) parts.push(`lc:${border.left.color.argb}`);
  if (border.right?.color?.argb) parts.push(`rc:${border.right.color.argb}`);

  return parts.length > 0 ? `border:${parts.join(",")}` : null;
};

/**
 * Default extractors in order of execution.
 * Can be extended by adding new extractors to this array.
 */
const defaultExtractors: StylePartExtractor[] = [
  extractFontColor,
  extractFillColor,
  extractFontStyles,
  extractBorders,
];

/**
 * Extracts a comprehensive style signature from a cell for comparison.
 * The signature uniquely identifies the visual style of a cell.
 *
 * @param cell - The Excel cell to extract styles from
 * @param extractors - Optional custom extractors (defaults to all built-in extractors)
 * @returns A string signature representing the cell's style
 */
export const getCellStyleSignature = (
  cell: ExcelJS.Cell,
  extractors: StylePartExtractor[] = defaultExtractors
): string => {
  const parts = extractors
    .map((extract) => extract(cell))
    .filter((part): part is string => part !== null);

  return parts.length > 0 ? parts.join("|") : "default";
};

// Export individual extractors for testing and custom composition
export {
  extractFontColor,
  extractFillColor,
  extractFontStyles,
  extractBorders,
  type StylePartExtractor,
};
