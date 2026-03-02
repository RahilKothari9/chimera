/**
 * Text Diff Engine
 *
 * Computes a line-by-line diff between two text strings using the
 * Longest Common Subsequence (LCS) algorithm.
 */

export type DiffType = 'added' | 'removed' | 'unchanged';

export interface DiffLine {
  type: DiffType;
  line: string;
  /** 1-based line number in the left (original) text, undefined for added lines */
  leftLineNum?: number;
  /** 1-based line number in the right (modified) text, undefined for removed lines */
  rightLineNum?: number;
}

export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}

export interface DiffResult {
  lines: DiffLine[];
  stats: DiffStats;
}

/** Build the LCS length table for two arrays of strings. */
function buildLCSTable(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const table: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        table[i][j] = table[i - 1][j - 1] + 1;
      } else {
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
      }
    }
  }
  return table;
}

/** Backtrack through the LCS table to produce diff lines. */
function backtrack(
  table: number[][],
  a: string[],
  b: string[],
  i: number,
  j: number,
  result: DiffLine[],
  leftLineCounter: { v: number },
  rightLineCounter: { v: number }
): void {
  if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
    backtrack(table, a, b, i - 1, j - 1, result, leftLineCounter, rightLineCounter);
    result.push({
      type: 'unchanged',
      line: a[i - 1],
      leftLineNum: leftLineCounter.v++,
      rightLineNum: rightLineCounter.v++,
    });
  } else if (j > 0 && (i === 0 || table[i][j - 1] >= table[i - 1][j])) {
    backtrack(table, a, b, i, j - 1, result, leftLineCounter, rightLineCounter);
    result.push({
      type: 'added',
      line: b[j - 1],
      rightLineNum: rightLineCounter.v++,
    });
  } else if (i > 0) {
    backtrack(table, a, b, i - 1, j, result, leftLineCounter, rightLineCounter);
    result.push({
      type: 'removed',
      line: a[i - 1],
      leftLineNum: leftLineCounter.v++,
    });
  }
}

/**
 * Compute a line-by-line diff between two strings.
 *
 * @param original  The original (left) text.
 * @param modified  The modified (right) text.
 * @returns A `DiffResult` with annotated lines and summary statistics.
 */
export function computeDiff(original: string, modified: string): DiffResult {
  const a = original === '' ? [] : original.split('\n');
  const b = modified === '' ? [] : modified.split('\n');

  const table = buildLCSTable(a, b);
  const lines: DiffLine[] = [];
  const leftCounter = { v: 1 };
  const rightCounter = { v: 1 };

  backtrack(table, a, b, a.length, b.length, lines, leftCounter, rightCounter);

  const stats: DiffStats = { added: 0, removed: 0, unchanged: 0 };
  for (const dl of lines) {
    stats[dl.type]++;
  }

  return { lines, stats };
}

/**
 * Render a unified-diff-style string (like `diff -u`) from a DiffResult.
 */
export function toUnifiedString(result: DiffResult): string {
  return result.lines
    .map(dl => {
      if (dl.type === 'added') return `+ ${dl.line}`;
      if (dl.type === 'removed') return `- ${dl.line}`;
      return `  ${dl.line}`;
    })
    .join('\n');
}
