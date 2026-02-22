import type { ChangelogEntry } from './changelogParser';

export interface WordFrequency {
  word: string;
  count: number;
  weight: number; // normalized 0-1
}

// Common English stop words plus tech-noise words to exclude
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'it', 'its', 'this',
  'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your',
  'he', 'she', 'they', 'them', 'their', 'all', 'also', 'as', 'so', 'up',
  'out', 'if', 'not', 'no', 'into', 'than', 'then', 'now', 'when', 'which',
  'who', 'how', 'what', 'each', 'any', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'only', 'own', 'same', 'over', 'after', 'before',
  'through', 'about', 'between', 'while', 'during', 'without', 'within',
  'along', 'following', 'across', 'behind', 'beyond', 'plus', 'except',
  'new', 'created', 'added', 'updated', 'modified', 'changed', 'improved',
  'src', 'ts', 'md', 'html', 'css', 'js', 'file', 'files', 'type',
  'that', 'which', 'has', 'per', 'via', 'like', 'allows', 'uses', 'used',
  'using', 'based', 'include', 'includes', 'including', 'feature', 'features',
  'the', 'an', 'to', 'of', 'with', 'from', 'a', 'it', 'as', 'at', 'be',
]);

/**
 * Extracts and counts word frequencies from changelog entries.
 * Analyses both feature names and descriptions.
 */
export function analyzeWordFrequency(entries: ChangelogEntry[]): WordFrequency[] {
  if (entries.length === 0) return [];

  const counts = new Map<string, number>();

  for (const entry of entries) {
    const text = `${entry.feature} ${entry.description}`;
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ') // keep letters, digits, hyphens
      .split(/\s+/)
      .map(w => w.replace(/^-+|-+$/g, '')) // strip leading/trailing hyphens
      .filter(w => w.length >= 4 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));

    for (const word of words) {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }

  if (counts.size === 0) return [];

  const maxCount = Math.max(...counts.values());

  const result: WordFrequency[] = [];
  counts.forEach((count, word) => {
    result.push({ word, count, weight: count / maxCount });
  });

  // Sort by count descending, then alphabetically for stable order
  result.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

  return result;
}

/**
 * Returns the top N words by frequency.
 */
export function getTopWords(entries: ChangelogEntry[], limit = 60): WordFrequency[] {
  return analyzeWordFrequency(entries).slice(0, limit);
}
