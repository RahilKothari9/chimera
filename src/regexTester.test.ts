/**
 * Tests for Regex Tester core logic
 */

import { describe, it, expect } from 'vitest'
import {
  buildFlagsString,
  validateRegex,
  testRegex,
  getHighlightSegments,
  getMatchSummary,
  REGEX_EXAMPLES,
  type RegexFlags,
} from './regexTester'

const DEFAULT_FLAGS: RegexFlags = {
  global: true,
  caseInsensitive: false,
  multiline: false,
  dotAll: false,
}

describe('Regex Tester', () => {
  describe('buildFlagsString', () => {
    it('should return empty string for no flags', () => {
      const flags: RegexFlags = { global: false, caseInsensitive: false, multiline: false, dotAll: false }
      expect(buildFlagsString(flags)).toBe('')
    })

    it('should include g for global flag', () => {
      const flags: RegexFlags = { ...DEFAULT_FLAGS, global: true, caseInsensitive: false, multiline: false, dotAll: false }
      expect(buildFlagsString(flags)).toContain('g')
    })

    it('should include i for case-insensitive flag', () => {
      const flags: RegexFlags = { global: false, caseInsensitive: true, multiline: false, dotAll: false }
      expect(buildFlagsString(flags)).toContain('i')
    })

    it('should include m for multiline flag', () => {
      const flags: RegexFlags = { global: false, caseInsensitive: false, multiline: true, dotAll: false }
      expect(buildFlagsString(flags)).toContain('m')
    })

    it('should include s for dotAll flag', () => {
      const flags: RegexFlags = { global: false, caseInsensitive: false, multiline: false, dotAll: true }
      expect(buildFlagsString(flags)).toContain('s')
    })

    it('should include all flags when all enabled', () => {
      const flags: RegexFlags = { global: true, caseInsensitive: true, multiline: true, dotAll: true }
      const result = buildFlagsString(flags)
      expect(result).toContain('g')
      expect(result).toContain('i')
      expect(result).toContain('m')
      expect(result).toContain('s')
    })
  })

  describe('validateRegex', () => {
    it('should return null for valid pattern', () => {
      expect(validateRegex('\\d+', 'g')).toBeNull()
    })

    it('should return null for empty pattern', () => {
      expect(validateRegex('', 'g')).toBeNull()
    })

    it('should return error message for invalid pattern', () => {
      const result = validateRegex('[invalid', 'g')
      expect(result).not.toBeNull()
      expect(typeof result).toBe('string')
    })

    it('should return error for unclosed group', () => {
      const result = validateRegex('(unclosed', 'g')
      expect(result).not.toBeNull()
    })

    it('should accept valid flags', () => {
      expect(validateRegex('test', 'gim')).toBeNull()
    })
  })

  describe('testRegex', () => {
    it('should return valid result for simple match', () => {
      const result = testRegex('\\d+', DEFAULT_FLAGS, 'abc 123 def 456')
      expect(result.isValid).toBe(true)
      expect(result.matchCount).toBe(2)
      expect(result.matches[0].fullMatch).toBe('123')
      expect(result.matches[1].fullMatch).toBe('456')
    })

    it('should return no matches when pattern does not match', () => {
      const result = testRegex('xyz', DEFAULT_FLAGS, 'hello world')
      expect(result.isValid).toBe(true)
      expect(result.matchCount).toBe(0)
      expect(result.matches).toHaveLength(0)
    })

    it('should capture named groups', () => {
      const result = testRegex('(?<year>\\d{4})-(?<month>\\d{2})', DEFAULT_FLAGS, '2026-02')
      expect(result.isValid).toBe(true)
      expect(result.matchCount).toBe(1)
      expect(result.matches[0].groups['year']).toBe('2026')
      expect(result.matches[0].groups['month']).toBe('02')
    })

    it('should capture unnamed groups', () => {
      const result = testRegex('(\\w+)@(\\w+)', DEFAULT_FLAGS, 'user@host')
      expect(result.isValid).toBe(true)
      expect(result.matches[0].captures[0]).toBe('user')
      expect(result.matches[0].captures[1]).toBe('host')
    })

    it('should return invalid result for bad pattern', () => {
      const result = testRegex('[bad', DEFAULT_FLAGS, 'test')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.matchCount).toBe(0)
    })

    it('should return empty matches for empty pattern', () => {
      const result = testRegex('', DEFAULT_FLAGS, 'hello')
      expect(result.isValid).toBe(true)
      expect(result.matchCount).toBe(0)
    })

    it('should respect case-insensitive flag', () => {
      const flags: RegexFlags = { ...DEFAULT_FLAGS, caseInsensitive: true }
      const result = testRegex('hello', flags, 'Hello HELLO hello')
      expect(result.matchCount).toBe(3)
    })

    it('should return single match when global flag is false', () => {
      const flags: RegexFlags = { ...DEFAULT_FLAGS, global: false }
      const result = testRegex('\\d+', flags, 'abc 123 def 456')
      expect(result.matchCount).toBe(1)
      expect(result.matches[0].fullMatch).toBe('123')
    })

    it('should respect multiline flag with ^ and $', () => {
      const flags: RegexFlags = { ...DEFAULT_FLAGS, multiline: true }
      const result = testRegex('^line', flags, 'line one\nline two\nline three')
      expect(result.matchCount).toBe(3)
    })

    it('should include correct match index', () => {
      const result = testRegex('world', DEFAULT_FLAGS, 'hello world')
      expect(result.matches[0].index).toBe(6)
    })

    it('should handle empty test text', () => {
      const result = testRegex('\\d+', DEFAULT_FLAGS, '')
      expect(result.isValid).toBe(true)
      expect(result.matchCount).toBe(0)
    })

    it('should not infinite loop on zero-length match', () => {
      const result = testRegex('a*', DEFAULT_FLAGS, 'b')
      expect(result.isValid).toBe(true)
    })

    it('should store pattern and flags in result', () => {
      const result = testRegex('\\d+', DEFAULT_FLAGS, 'test 1')
      expect(result.pattern).toBe('\\d+')
      expect(result.flags).toContain('g')
      expect(result.testText).toBe('test 1')
    })
  })

  describe('getHighlightSegments', () => {
    it('should return single non-match segment when no matches', () => {
      const result = testRegex('xyz', DEFAULT_FLAGS, 'hello world')
      const segments = getHighlightSegments('hello world', result)
      expect(segments).toHaveLength(1)
      expect(segments[0].isMatch).toBe(false)
      expect(segments[0].text).toBe('hello world')
    })

    it('should return segments with match highlighted', () => {
      const result = testRegex('world', DEFAULT_FLAGS, 'hello world!')
      const segments = getHighlightSegments('hello world!', result)
      const matchSegment = segments.find(s => s.isMatch)
      expect(matchSegment).toBeDefined()
      expect(matchSegment?.text).toBe('world')
    })

    it('should split text into before/match/after segments', () => {
      const result = testRegex('world', DEFAULT_FLAGS, 'hello world!')
      const segments = getHighlightSegments('hello world!', result)
      expect(segments.length).toBe(3)
      expect(segments[0].text).toBe('hello ')
      expect(segments[1].text).toBe('world')
      expect(segments[2].text).toBe('!')
    })

    it('should handle match at start of text', () => {
      const result = testRegex('^hello', DEFAULT_FLAGS, 'hello world')
      const segments = getHighlightSegments('hello world', result)
      expect(segments[0].isMatch).toBe(true)
      expect(segments[0].text).toBe('hello')
    })

    it('should handle match at end of text', () => {
      const result = testRegex('world$', DEFAULT_FLAGS, 'hello world')
      const segments = getHighlightSegments('hello world', result)
      const last = segments[segments.length - 1]
      expect(last.isMatch).toBe(true)
      expect(last.text).toBe('world')
    })

    it('should include matchIndex on match segments', () => {
      const result = testRegex('\\d+', DEFAULT_FLAGS, 'a1 b2 c3')
      const segments = getHighlightSegments('a1 b2 c3', result)
      const matches = segments.filter(s => s.isMatch)
      expect(matches[0].matchIndex).toBe(0)
      expect(matches[1].matchIndex).toBe(1)
    })

    it('should return empty array for empty text with no matches', () => {
      const result = testRegex('\\d+', DEFAULT_FLAGS, '')
      const segments = getHighlightSegments('', result)
      expect(segments).toHaveLength(0)
    })

    it('should handle invalid regex result', () => {
      const result = testRegex('[invalid', DEFAULT_FLAGS, 'test')
      const segments = getHighlightSegments('test', result)
      expect(segments).toHaveLength(1)
      expect(segments[0].isMatch).toBe(false)
    })
  })

  describe('getMatchSummary', () => {
    it('should describe invalid pattern', () => {
      const result = testRegex('[bad', DEFAULT_FLAGS, 'text')
      const summary = getMatchSummary(result)
      expect(summary).toContain('Invalid')
    })

    it('should prompt for pattern when pattern is empty', () => {
      const result = testRegex('', DEFAULT_FLAGS, 'text')
      const summary = getMatchSummary(result)
      expect(summary).toContain('pattern')
    })

    it('should report no matches', () => {
      const result = testRegex('xyz', DEFAULT_FLAGS, 'hello')
      const summary = getMatchSummary(result)
      expect(summary).toContain('No matches')
    })

    it('should report single match with singular word', () => {
      const result = testRegex('hello', DEFAULT_FLAGS, 'hello')
      const summary = getMatchSummary(result)
      expect(summary).toContain('1 match')
      expect(summary).not.toContain('matches')
    })

    it('should report multiple matches with plural word', () => {
      const result = testRegex('\\d', DEFAULT_FLAGS, '1 2 3')
      const summary = getMatchSummary(result)
      expect(summary).toContain('3 matches')
    })
  })

  describe('REGEX_EXAMPLES', () => {
    it('should have at least one example', () => {
      expect(REGEX_EXAMPLES.length).toBeGreaterThan(0)
    })

    it('each example should have required fields', () => {
      REGEX_EXAMPLES.forEach(example => {
        expect(example.name).toBeDefined()
        expect(example.pattern).toBeDefined()
        expect(example.flags).toBeDefined()
        expect(example.testText).toBeDefined()
        expect(example.description).toBeDefined()
      })
    })

    it('each example pattern should be a valid regex', () => {
      REGEX_EXAMPLES.forEach(example => {
        const flagStr = buildFlagsString(example.flags)
        expect(validateRegex(example.pattern, flagStr)).toBeNull()
      })
    })

    it('each example should match at least one item in its test text', () => {
      REGEX_EXAMPLES.forEach(example => {
        const result = testRegex(example.pattern, example.flags, example.testText)
        expect(result.matchCount).toBeGreaterThan(0)
      })
    })
  })
})
