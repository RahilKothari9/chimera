/**
 * Text Case Converter
 *
 * Converts text between common naming conventions used in programming and writing:
 * camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE,
 * Title Case, Sentence case, dot.case, lowercase, and UPPERCASE.
 */

export type TextCase =
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'screaming_snake'
  | 'title'
  | 'sentence'
  | 'dot'
  | 'lower'
  | 'upper';

export interface CaseConversionResult {
  output: string;
  wordCount: number;
}

/**
 * Split input text into an array of lowercase words.
 *
 * Handles all common separators (spaces, underscores, hyphens, dots) as well as
 * camelCase / PascalCase boundaries.
 */
export function splitWords(input: string): string[] {
  if (!input) return [];

  // Insert a space before uppercase letters that follow lowercase letters or digits
  // (handles camelCase / PascalCase splitting)
  const spaced = input
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

  // Replace any separator characters with a space
  const normalised = spaced.replace(/[-_.\s]+/g, ' ').trim();

  if (!normalised) return [];

  return normalised.split(' ').map((w) => w.toLowerCase()).filter((w) => w.length > 0);
}

/**
 * Convert text to camelCase.
 * Example: "hello world" → "helloWorld"
 */
export function toCamelCase(input: string): CaseConversionResult {
  const words = splitWords(input);
  const output = words
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join('');
  return { output, wordCount: words.length };
}

/**
 * Convert text to PascalCase.
 * Example: "hello world" → "HelloWorld"
 */
export function toPascalCase(input: string): CaseConversionResult {
  const words = splitWords(input);
  const output = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return { output, wordCount: words.length };
}

/**
 * Convert text to snake_case.
 * Example: "hello world" → "hello_world"
 */
export function toSnakeCase(input: string): CaseConversionResult {
  const words = splitWords(input);
  const output = words.join('_');
  return { output, wordCount: words.length };
}

/**
 * Convert text to kebab-case.
 * Example: "hello world" → "hello-world"
 */
export function toKebabCase(input: string): CaseConversionResult {
  const words = splitWords(input);
  const output = words.join('-');
  return { output, wordCount: words.length };
}

/**
 * Convert text to SCREAMING_SNAKE_CASE.
 * Example: "hello world" → "HELLO_WORLD"
 */
export function toScreamingSnakeCase(input: string): CaseConversionResult {
  const words = splitWords(input);
  const output = words.join('_').toUpperCase();
  return { output, wordCount: words.length };
}

/**
 * Convert text to Title Case.
 * Example: "hello world" → "Hello World"
 */
export function toTitleCase(input: string): CaseConversionResult {
  const words = splitWords(input);
  const output = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return { output, wordCount: words.length };
}

/**
 * Convert text to Sentence case.
 * Example: "hello world" → "Hello world"
 */
export function toSentenceCase(input: string): CaseConversionResult {
  const words = splitWords(input);
  const joined = words.join(' ');
  const output = joined.charAt(0).toUpperCase() + joined.slice(1);
  return { output, wordCount: words.length };
}

/**
 * Convert text to dot.case.
 * Example: "hello world" → "hello.world"
 */
export function toDotCase(input: string): CaseConversionResult {
  const words = splitWords(input);
  const output = words.join('.');
  return { output, wordCount: words.length };
}

/**
 * Convert text to lowercase.
 * Example: "Hello World" → "hello world"
 */
export function toLowerCaseText(input: string): CaseConversionResult {
  const words = splitWords(input);
  const output = words.join(' ');
  return { output, wordCount: words.length };
}

/**
 * Convert text to UPPERCASE.
 * Example: "hello world" → "HELLO WORLD"
 */
export function toUpperCaseText(input: string): CaseConversionResult {
  const words = splitWords(input);
  const output = words.join(' ').toUpperCase();
  return { output, wordCount: words.length };
}

/**
 * Convert input text to the specified case format.
 */
export function convertCase(input: string, targetCase: TextCase): CaseConversionResult {
  switch (targetCase) {
    case 'camel':          return toCamelCase(input);
    case 'pascal':         return toPascalCase(input);
    case 'snake':          return toSnakeCase(input);
    case 'kebab':          return toKebabCase(input);
    case 'screaming_snake':return toScreamingSnakeCase(input);
    case 'title':          return toTitleCase(input);
    case 'sentence':       return toSentenceCase(input);
    case 'dot':            return toDotCase(input);
    case 'lower':          return toLowerCaseText(input);
    case 'upper':          return toUpperCaseText(input);
  }
}

/**
 * Convert input text to all supported case formats at once.
 */
export function convertAllCases(input: string): Record<TextCase, string> {
  const cases: TextCase[] = [
    'camel', 'pascal', 'snake', 'kebab', 'screaming_snake',
    'title', 'sentence', 'dot', 'lower', 'upper',
  ];
  const result = {} as Record<TextCase, string>;
  for (const c of cases) {
    result[c] = convertCase(input, c).output;
  }
  return result;
}

/** Human-readable labels for each case format. */
export const CASE_LABELS: Record<TextCase, string> = {
  camel:           'camelCase',
  pascal:          'PascalCase',
  snake:           'snake_case',
  kebab:           'kebab-case',
  screaming_snake: 'SCREAMING_SNAKE_CASE',
  title:           'Title Case',
  sentence:        'Sentence case',
  dot:             'dot.case',
  lower:           'lowercase',
  upper:           'UPPERCASE',
};
