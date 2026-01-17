/**
 * Excel processing services
 *
 * This module provides functions for extracting and analyzing data from Excel cells:
 * - Text extraction (handling rich text, formulas, etc.)
 * - Style signature extraction (for comparing cell styles)
 * - Outlier detection (finding the differently-styled cell)
 */

export { getCellText } from "./textExtractor";

export {
  getCellStyleSignature,
  extractFontColor,
  extractFillColor,
  extractFontStyles,
  extractBorders,
  type StylePartExtractor,
} from "./styleExtractor";

export {
  findOutlierIndex,
  strategies as outlierStrategies,
  type OutlierStrategy,
  type StrategyName,
} from "./outlierDetector";
