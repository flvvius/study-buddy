/**
 * Outlier detection strategy function signature.
 * Takes an array of signatures and returns the index of the outlier.
 */
type OutlierStrategy = (signatures: string[]) => number;

/**
 * Finds the outlier by looking for the least frequent signature.
 * This is the default strategy - works well when one answer is highlighted differently.
 *
 * @example
 * findByMinFrequency(['default', 'default', 'bold', 'default']) // returns 2
 * findByMinFrequency(['default', 'default', 'default']) // returns 0 (no outlier)
 */
const findByMinFrequency: OutlierStrategy = (signatures) => {
  if (signatures.length < 2) return 0;

  // Count occurrences of each signature
  const counts = signatures.reduce((acc, sig) => {
    acc.set(sig, (acc.get(sig) || 0) + 1);
    return acc;
  }, new Map<string, number>());

  // If all signatures are the same, return 0 (no outlier found)
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
};

/**
 * Alternative strategy: finds the first element that differs from the majority.
 * Useful when the first few options might be styled differently.
 */
const findFirstDifferent: OutlierStrategy = (signatures) => {
  if (signatures.length < 2) return 0;

  // Find the most common signature
  const counts = new Map<string, number>();
  signatures.forEach((sig) => {
    counts.set(sig, (counts.get(sig) || 0) + 1);
  });

  let maxCount = 0;
  let majoritySig = signatures[0];
  counts.forEach((count, sig) => {
    if (count > maxCount) {
      maxCount = count;
      majoritySig = sig;
    }
  });

  // Find first that differs from majority
  const differentIdx = signatures.findIndex((s) => s !== majoritySig);
  return differentIdx === -1 ? 0 : differentIdx;
};

/**
 * Available outlier detection strategies.
 * Easily extensible by adding new strategies to this map.
 */
export const strategies = {
  minFrequency: findByMinFrequency,
  firstDifferent: findFirstDifferent,
} as const;

export type StrategyName = keyof typeof strategies;

/**
 * Finds the outlier index using the specified strategy.
 *
 * @param signatures - Array of style signatures to analyze
 * @param strategy - The detection strategy to use (default: 'minFrequency')
 * @returns The index of the outlier (different element), or 0 if no outlier found
 */
export const findOutlierIndex = (
  signatures: string[],
  strategy: StrategyName = "minFrequency"
): number => {
  return strategies[strategy](signatures);
};

// Export types and individual strategies for testing
export { type OutlierStrategy, findByMinFrequency, findFirstDifferent };
