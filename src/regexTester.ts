/**
 * Regex Tester
 * Interactive regular expression testing and debugging tool
 */

export interface RegexFlags {
  global: boolean
  caseInsensitive: boolean
  multiline: boolean
  dotAll: boolean
}

export interface RegexMatch {
  fullMatch: string
  index: number
  groups: Record<string, string>
  captures: (string | undefined)[]
}

export interface RegexTestResult {
  isValid: boolean
  error?: string
  matches: RegexMatch[]
  matchCount: number
  pattern: string
  flags: string
  testText: string
}

export interface HighlightSegment {
  text: string
  isMatch: boolean
  matchIndex?: number
}

/**
 * Builds a flags string from a RegexFlags object
 */
export function buildFlagsString(flags: RegexFlags): string {
  let flagStr = ''
  if (flags.global) flagStr += 'g'
  if (flags.caseInsensitive) flagStr += 'i'
  if (flags.multiline) flagStr += 'm'
  if (flags.dotAll) flagStr += 's'
  return flagStr
}

/**
 * Validates a regular expression pattern and returns an error message or null
 */
export function validateRegex(pattern: string, flagStr: string): string | null {
  if (pattern === '') return null
  try {
    new RegExp(pattern, flagStr)
    return null
  } catch (e) {
    return (e as Error).message
  }
}

/**
 * Tests a regex pattern against a string and returns detailed match results
 */
export function testRegex(pattern: string, flags: RegexFlags, testText: string): RegexTestResult {
  const flagStr = buildFlagsString(flags)
  const validationError = validateRegex(pattern, flagStr)

  if (validationError) {
    return {
      isValid: false,
      error: validationError,
      matches: [],
      matchCount: 0,
      pattern,
      flags: flagStr,
      testText,
    }
  }

  if (pattern === '') {
    return {
      isValid: true,
      matches: [],
      matchCount: 0,
      pattern,
      flags: flagStr,
      testText,
    }
  }

  const regex = new RegExp(pattern, flagStr)
  const matches: RegexMatch[] = []

  if (flags.global) {
    let match: RegExpExecArray | null
    // Safety guard: avoid infinite loops on zero-length matches
    let lastIndex = -1
    while ((match = regex.exec(testText)) !== null) {
      if (match.index === lastIndex) {
        // Zero-length match at the same position - advance to avoid infinite loop
        regex.lastIndex++
        continue
      }
      lastIndex = match.index

      matches.push({
        fullMatch: match[0],
        index: match.index,
        groups: match.groups ?? {},
        captures: match.slice(1),
      })
    }
  } else {
    const match = regex.exec(testText)
    if (match) {
      matches.push({
        fullMatch: match[0],
        index: match.index,
        groups: match.groups ?? {},
        captures: match.slice(1),
      })
    }
  }

  return {
    isValid: true,
    matches,
    matchCount: matches.length,
    pattern,
    flags: flagStr,
    testText,
  }
}

/**
 * Splits test text into segments of matched and non-matched parts for highlighting
 * Requires the global flag to be enabled for multiple matches.
 */
export function getHighlightSegments(
  testText: string,
  result: RegexTestResult
): HighlightSegment[] {
  if (!result.isValid || result.matches.length === 0) {
    return testText ? [{ text: testText, isMatch: false }] : []
  }

  const segments: HighlightSegment[] = []
  let cursor = 0

  for (let i = 0; i < result.matches.length; i++) {
    const match = result.matches[i]
    const start = match.index
    const end = start + match.fullMatch.length

    // Text before this match
    if (start > cursor) {
      segments.push({ text: testText.slice(cursor, start), isMatch: false })
    }

    // The matched text
    segments.push({ text: match.fullMatch, isMatch: true, matchIndex: i })

    cursor = end
  }

  // Remaining text after last match
  if (cursor < testText.length) {
    segments.push({ text: testText.slice(cursor), isMatch: false })
  }

  return segments
}

/**
 * Generates a summary string describing the match results
 */
export function getMatchSummary(result: RegexTestResult): string {
  if (!result.isValid) {
    return `Invalid pattern: ${result.error}`
  }
  if (result.pattern === '') {
    return 'Enter a pattern to start matching'
  }
  if (result.matchCount === 0) {
    return 'No matches found'
  }
  return `${result.matchCount} match${result.matchCount === 1 ? '' : 'es'} found`
}

/**
 * Common regex patterns with descriptions for reference
 */
export interface RegexExample {
  name: string
  pattern: string
  flags: RegexFlags
  testText: string
  description: string
}

const DEFAULT_FLAGS: RegexFlags = {
  global: true,
  caseInsensitive: false,
  multiline: false,
  dotAll: false,
}

export const REGEX_EXAMPLES: RegexExample[] = [
  {
    name: 'Email Address',
    pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}',
    flags: { ...DEFAULT_FLAGS },
    testText: 'Contact us at hello@example.com or support@chimera.dev for help.',
    description: 'Matches standard email addresses',
  },
  {
    name: 'URL',
    pattern: 'https?:\\/\\/[^\\s]+',
    flags: { ...DEFAULT_FLAGS },
    testText: 'Visit https://example.com or http://chimera.dev for more info.',
    description: 'Matches http and https URLs',
  },
  {
    name: 'IPv4 Address',
    pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
    flags: { ...DEFAULT_FLAGS },
    testText: 'Server IPs: 192.168.1.1 and 10.0.0.255. Invalid: 999.999.999.999',
    description: 'Matches IPv4 addresses',
  },
  {
    name: 'Hex Color',
    pattern: '#[0-9a-fA-F]{3,6}\\b',
    flags: { ...DEFAULT_FLAGS },
    testText: 'Colors: #fff #ff0000 #1a2b3c and the invalid #xyz',
    description: 'Matches CSS hex color codes',
  },
  {
    name: 'ISO Date',
    pattern: '\\d{4}-\\d{2}-\\d{2}',
    flags: { ...DEFAULT_FLAGS },
    testText: 'Events: 2026-02-20, 2025-12-31, and not 20-02-2026',
    description: 'Matches YYYY-MM-DD date format',
  },
]
