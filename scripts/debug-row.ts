import ExcelJS from "exceljs";
import { getCellText, getCellStyleSignature, findOutlierIndex } from "./services/excel";

/**
 * Debug script to investigate a specific row's parsing.
 * Run with: npx tsx src/debug-row.ts <filepath> <rowNumber>
 */
async function debugRow(filePath: string, targetRow: number) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    console.error("No worksheet found");
    return;
  }

  const row = worksheet.getRow(targetRow);
  const cellCount = row.cellCount;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`DEBUG ROW ${targetRow}`);
  console.log(`${"=".repeat(60)}`);
  console.log(`Cell count: ${cellCount}\n`);

  // Question cell
  const questionCell = row.getCell(1);
  const questionText = getCellText(questionCell);
  console.log(`Question (Col 1): "${questionText}"`);
  console.log(`Question signature: ${getCellStyleSignature(questionCell)}\n`);

  // Option cells
  console.log("OPTIONS:");
  console.log("-".repeat(60));

  const optionData: Array<{
    col: number;
    text: string;
    signature: string;
    rawFont: unknown;
    rawFill: unknown;
  }> = [];

  for (let col = 2; col <= cellCount; col++) {
    const cell = row.getCell(col);
    const text = getCellText(cell);

    if (text.length > 0 && text !== questionText) {
      const signature = getCellStyleSignature(cell);
      optionData.push({
        col,
        text: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
        signature,
        rawFont: cell.font,
        rawFill: cell.fill,
      });
    }
  }

  optionData.forEach((opt, idx) => {
    console.log(`\nOption ${idx} (Col ${opt.col}):`);
    console.log(`  Text: "${opt.text}"`);
    console.log(`  Signature: "${opt.signature}"`);
    console.log(`  Raw Font:`, JSON.stringify(opt.rawFont, null, 2));
    console.log(`  Raw Fill:`, JSON.stringify(opt.rawFill, null, 2));
  });

  // Signature analysis
  console.log(`\n${"=".repeat(60)}`);
  console.log("SIGNATURE ANALYSIS");
  console.log("-".repeat(60));

  const signatures = optionData.map((o) => o.signature);
  const uniqueSigs = new Set(signatures);

  console.log(`Signatures: [${signatures.map((s) => `"${s}"`).join(", ")}]`);
  console.log(`Unique count: ${uniqueSigs.size}`);

  if (uniqueSigs.size === 1) {
    console.log("\n⚠️  ALL SIGNATURES IDENTICAL - Cannot detect correct answer!");
    console.log("    Likely using conditional formatting (Excel limitation)");
  } else {
    // Count frequencies
    const counts = new Map<string, number>();
    signatures.forEach((sig) => counts.set(sig, (counts.get(sig) || 0) + 1));

    console.log("\nFrequency count:");
    counts.forEach((count, sig) => {
      console.log(`  "${sig}": ${count} occurrence(s)`);
    });

    // Use the actual findOutlierIndex function
    const outlierIndex = findOutlierIndex(signatures);
    console.log(`\n✅ Detected correct answer: Option ${outlierIndex} (Col ${optionData[outlierIndex].col})`);
    console.log(`   Text: "${optionData[outlierIndex].text}"`);
  }

  console.log(`\n${"=".repeat(60)}\n`);
}

// CLI
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: npx tsx src/debug-row.ts <excel-file-path> <row-number>");
  process.exit(1);
}

debugRow(args[0], parseInt(args[1], 10));
