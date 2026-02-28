import { describe, it, expect } from 'vitest'
import {
  buildCharset,
  calculateEntropy,
  rateStrength,
  generatePassword,
  generateMultiple,
  strengthLabel,
  strengthLevel,
  DEFAULT_OPTIONS,
  type PasswordOptions,
  type PasswordStrength,
} from './passwordGenerator'

describe('passwordGenerator', () => {
  describe('buildCharset', () => {
    it('includes uppercase letters when enabled', () => {
      const cs = buildCharset({ ...DEFAULT_OPTIONS, lowercase: false, numbers: false, symbols: false })
      expect(cs).toContain('A')
      expect(cs).toContain('Z')
      expect(cs).not.toContain('a')
    })

    it('includes lowercase letters when enabled', () => {
      const cs = buildCharset({ ...DEFAULT_OPTIONS, uppercase: false, numbers: false, symbols: false })
      expect(cs).toContain('a')
      expect(cs).toContain('z')
      expect(cs).not.toContain('A')
    })

    it('includes digits when numbers enabled', () => {
      const cs = buildCharset({ ...DEFAULT_OPTIONS, uppercase: false, lowercase: false, symbols: false })
      expect(cs).toContain('0')
      expect(cs).toContain('9')
    })

    it('includes symbols when enabled', () => {
      const cs = buildCharset({ ...DEFAULT_OPTIONS, uppercase: false, lowercase: false, numbers: false, symbols: true })
      expect(cs).toContain('!')
      expect(cs).toContain('@')
    })

    it('excludes ambiguous characters when excludeAmbiguous is true', () => {
      const cs = buildCharset({ ...DEFAULT_OPTIONS, excludeAmbiguous: true })
      expect(cs).not.toContain('0')
      expect(cs).not.toContain('O')
      expect(cs).not.toContain('l')
      expect(cs).not.toContain('1')
      expect(cs).not.toContain('I')
    })

    it('returns empty string when no charset selected', () => {
      const cs = buildCharset({ ...DEFAULT_OPTIONS, uppercase: false, lowercase: false, numbers: false, symbols: false })
      expect(cs).toBe('')
    })

    it('includes all four charsets when all enabled', () => {
      const cs = buildCharset({ ...DEFAULT_OPTIONS, symbols: true, uppercase: true, lowercase: true, numbers: true })
      expect(cs).toContain('A')
      expect(cs).toContain('a')
      expect(cs).toContain('0')
      expect(cs).toContain('!')
    })

    it('charset has no duplicate characters for base options', () => {
      const cs = buildCharset(DEFAULT_OPTIONS)
      const unique = new Set(cs.split(''))
      expect(unique.size).toBe(cs.length)
    })
  })

  describe('calculateEntropy', () => {
    it('returns 0 for charsetSize 0', () => {
      expect(calculateEntropy(16, 0)).toBe(0)
    })

    it('returns 0 for length 0', () => {
      expect(calculateEntropy(0, 62)).toBe(0)
    })

    it('calculates entropy correctly for simple case (2 chars, length 1 → 1 bit)', () => {
      expect(calculateEntropy(1, 2)).toBeCloseTo(1, 5)
    })

    it('calculates entropy for 62-char charset, length 8', () => {
      // 8 * log2(62) ≈ 47.63
      expect(calculateEntropy(8, 62)).toBeCloseTo(47.63, 1)
    })

    it('entropy scales linearly with length', () => {
      const e8 = calculateEntropy(8, 62)
      const e16 = calculateEntropy(16, 62)
      expect(e16).toBeCloseTo(e8 * 2, 5)
    })
  })

  describe('rateStrength', () => {
    it('rates entropy < 28 as very-weak', () => {
      expect(rateStrength(10)).toBe('very-weak')
      expect(rateStrength(27)).toBe('very-weak')
    })

    it('rates entropy 28-35 as weak', () => {
      expect(rateStrength(28)).toBe('weak')
      expect(rateStrength(35)).toBe('weak')
    })

    it('rates entropy 36-59 as fair', () => {
      expect(rateStrength(36)).toBe('fair')
      expect(rateStrength(59)).toBe('fair')
    })

    it('rates entropy 60-127 as strong', () => {
      expect(rateStrength(60)).toBe('strong')
      expect(rateStrength(127)).toBe('strong')
    })

    it('rates entropy >= 128 as very-strong', () => {
      expect(rateStrength(128)).toBe('very-strong')
      expect(rateStrength(200)).toBe('very-strong')
    })
  })

  describe('generatePassword', () => {
    it('returns a password of the requested length', () => {
      const result = generatePassword({ ...DEFAULT_OPTIONS, length: 20 })
      expect(result.password.length).toBe(20)
    })

    it('returns an empty password when no charset selected', () => {
      const result = generatePassword({
        length: 16,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      })
      expect(result.password).toBe('')
      expect(result.entropy).toBe(0)
      expect(result.charsetSize).toBe(0)
    })

    it('only contains characters from the selected charset', () => {
      const opts: PasswordOptions = { ...DEFAULT_OPTIONS, uppercase: false, symbols: false }
      const result = generatePassword(opts)
      const cs = buildCharset(opts)
      for (const ch of result.password) {
        expect(cs).toContain(ch)
      }
    })

    it('returns a positive entropy value', () => {
      const result = generatePassword(DEFAULT_OPTIONS)
      expect(result.entropy).toBeGreaterThan(0)
    })

    it('charsetSize matches the built charset length', () => {
      const result = generatePassword(DEFAULT_OPTIONS)
      expect(result.charsetSize).toBe(buildCharset(DEFAULT_OPTIONS).length)
    })

    it('returns a PasswordResult with all expected fields', () => {
      const result = generatePassword(DEFAULT_OPTIONS)
      expect(result).toHaveProperty('password')
      expect(result).toHaveProperty('entropy')
      expect(result).toHaveProperty('strength')
      expect(result).toHaveProperty('charsetSize')
    })

    it('generates different passwords across multiple calls (statistical)', () => {
      const passwords = new Set(
        Array.from({ length: 10 }, () => generatePassword(DEFAULT_OPTIONS).password)
      )
      expect(passwords.size).toBeGreaterThan(1)
    })

    it('strength matches rateStrength of entropy', () => {
      const result = generatePassword(DEFAULT_OPTIONS)
      expect(result.strength).toBe(rateStrength(result.entropy))
    })

    it('excludes ambiguous chars when option set', () => {
      const opts: PasswordOptions = { ...DEFAULT_OPTIONS, length: 100, excludeAmbiguous: true }
      const result = generatePassword(opts)
      for (const ch of result.password) {
        expect(['0', 'O', 'l', '1', 'I']).not.toContain(ch)
      }
    })
  })

  describe('generateMultiple', () => {
    it('returns the requested number of results', () => {
      const results = generateMultiple(DEFAULT_OPTIONS, 5)
      expect(results.length).toBe(5)
    })

    it('each result has the correct length', () => {
      const opts = { ...DEFAULT_OPTIONS, length: 12 }
      const results = generateMultiple(opts, 3)
      for (const r of results) {
        expect(r.password.length).toBe(12)
      }
    })

    it('returns an empty array for count 0', () => {
      expect(generateMultiple(DEFAULT_OPTIONS, 0)).toEqual([])
    })
  })

  describe('strengthLabel', () => {
    const cases: [PasswordStrength, string][] = [
      ['very-weak', 'Very Weak'],
      ['weak', 'Weak'],
      ['fair', 'Fair'],
      ['strong', 'Strong'],
      ['very-strong', 'Very Strong'],
    ]
    for (const [s, label] of cases) {
      it(`returns "${label}" for "${s}"`, () => {
        expect(strengthLabel(s)).toBe(label)
      })
    }
  })

  describe('strengthLevel', () => {
    it('very-weak → 0', () => expect(strengthLevel('very-weak')).toBe(0))
    it('weak → 1', () => expect(strengthLevel('weak')).toBe(1))
    it('fair → 2', () => expect(strengthLevel('fair')).toBe(2))
    it('strong → 3', () => expect(strengthLevel('strong')).toBe(3))
    it('very-strong → 4', () => expect(strengthLevel('very-strong')).toBe(4))
  })
})
