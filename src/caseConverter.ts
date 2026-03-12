/**
 * String Case Converter
 *
 * Converts text between common naming conventions used in programming:
 * camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE,
 * Title Case, Sentence case, dot.case, and path/case.
 */

export type CaseType =
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'screaming_snake'
  | 'title'
  | 'sentence'
  | 'dot'
  | 'path'
  | 'lower'
  | 'upper';

export interface CaseConversionResult {
  input: string;
  results: Record<CaseType, string>;
}

/**
 * Splits an input string into an array of lowercase words.
 * Handles: spaces, underscores, hyphens, dots, slashes,
 * camelCase boundaries, and acronym boundaries.
 */
export function splitIntoWords(input: string): string[] {
  if (!input) return [];

  // Replace common separators with a space
  let s = input.replace(/[_\-./\\]+/g, ' ');

  // Insert a space before uppercase letters that follow a lowercase letter or digit (camelCase)
  s = s.replace(/([a-z\d])([A-Z])/g, '$1 $2');

  // Insert a space between a sequence of uppercase letters and a trailing uppercase+lowercase (e.g. XMLParser → XML Parser)
  s = s.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

  return s
    .split(/\s+/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 0);
}

/** camelCase */
export function toCamelCase(words: string[]): string {
  if (words.length === 0) return '';
  return words
    .filter((w) => w.length > 0)
    .map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1)))
    .join('');
}

/** PascalCase */
export function toPascalCase(words: string[]): string {
  return words.filter((w) => w.length > 0).map((w) => w[0].toUpperCase() + w.slice(1)).join('');
}

/** snake_case */
export function toSnakeCase(words: string[]): string {
  return words.join('_');
}

/** kebab-case */
export function toKebabCase(words: string[]): string {
  return words.join('-');
}

/** SCREAMING_SNAKE_CASE */
export function toScreamingSnakeCase(words: string[]): string {
  return words.join('_').toUpperCase();
}

/** Title Case */
export function toTitleCase(words: string[]): string {
  return words.filter((w) => w.length > 0).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}

/** Sentence case */
export function toSentenceCase(words: string[]): string {
  if (words.length === 0) return '';
  const joined = words.filter((w) => w.length > 0).join(' ');
  if (!joined) return '';
  return joined[0].toUpperCase() + joined.slice(1);
}

/** dot.case */
export function toDotCase(words: string[]): string {
  return words.join('.');
}

/** path/case */
export function toPathCase(words: string[]): string {
  return words.join('/');
}

/** lowercase (all words joined with spaces) */
export function toLowerCase(words: string[]): string {
  return words.join(' ');
}

/** UPPERCASE */
export function toUpperCase(words: string[]): string {
  return words.join(' ').toUpperCase();
}

/**
 * Convert an input string to all supported case types at once.
 */
export function convertAllCases(input: string): CaseConversionResult {
  const words = splitIntoWords(input);
  return {
    input,
    results: {
      camel: toCamelCase(words),
      pascal: toPascalCase(words),
      snake: toSnakeCase(words),
      kebab: toKebabCase(words),
      screaming_snake: toScreamingSnakeCase(words),
      title: toTitleCase(words),
      sentence: toSentenceCase(words),
      dot: toDotCase(words),
      path: toPathCase(words),
      lower: toLowerCase(words),
      upper: toUpperCase(words),
    },
  };
}

/** Human-readable labels for each case type */
export const CASE_LABELS: Record<CaseType, string> = {
  camel: 'camelCase',
  pascal: 'PascalCase',
  snake: 'snake_case',
  kebab: 'kebab-case',
  screaming_snake: 'SCREAMING_SNAKE_CASE',
  title: 'Title Case',
  sentence: 'Sentence case',
  dot: 'dot.case',
  path: 'path/case',
  lower: 'lowercase',
  upper: 'UPPERCASE',
};
