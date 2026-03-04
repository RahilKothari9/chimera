import { describe, it, expect } from 'vitest'
import {
  parseInteger,
  buildRepresentations,
  convertBase,
  getBitLength,
} from './numberBaseConverter'

describe('buildRepresentations', () => {
  it('handles zero', () => {
    const r = buildRepresentations(BigInt(0))
    expect(r).toEqual({ binary: '0', octal: '0', decimal: '0', hex: '0' })
  })

  it('handles positive 255', () => {
    const r = buildRepresentations(BigInt(255))
    expect(r.binary).toBe('11111111')
    expect(r.octal).toBe('377')
    expect(r.decimal).toBe('255')
    expect(r.hex).toBe('FF')
  })

  it('handles negative -1', () => {
    const r = buildRepresentations(BigInt(-1))
    expect(r.binary).toBe('-1')
    expect(r.octal).toBe('-1')
    expect(r.decimal).toBe('-1')
    expect(r.hex).toBe('-1')
  })

  it('handles large value', () => {
    const r = buildRepresentations(BigInt(65535))
    expect(r.hex).toBe('FFFF')
    expect(r.binary).toBe('1111111111111111')
    expect(r.octal).toBe('177777')
    expect(r.decimal).toBe('65535')
  })
})

describe('parseInteger', () => {
  it('parses decimal 42', () => {
    const result = parseInteger('42', 10)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.value).toBe(BigInt(42))
    expect(result.representations.hex).toBe('2A')
    expect(result.representations.binary).toBe('101010')
    expect(result.representations.octal).toBe('52')
  })

  it('parses binary 1010', () => {
    const result = parseInteger('1010', 2)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.value).toBe(BigInt(10))
    expect(result.representations.decimal).toBe('10')
    expect(result.representations.hex).toBe('A')
  })

  it('parses octal 17', () => {
    const result = parseInteger('17', 8)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.value).toBe(BigInt(15))
    expect(result.representations.hex).toBe('F')
  })

  it('parses hex FF', () => {
    const result = parseInteger('FF', 16)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.value).toBe(BigInt(255))
    expect(result.representations.decimal).toBe('255')
    expect(result.representations.binary).toBe('11111111')
  })

  it('parses hex lowercase ff', () => {
    const result = parseInteger('ff', 16)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.value).toBe(BigInt(255))
  })

  it('parses zero in all bases', () => {
    for (const base of [2, 8, 10, 16] as const) {
      const result = parseInteger('0', base)
      expect(result.success).toBe(true)
      if (!result.success) continue
      expect(result.value).toBe(BigInt(0))
    }
  })

  it('parses negative decimal', () => {
    const result = parseInteger('-10', 10)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.value).toBe(BigInt(-10))
    expect(result.representations.binary).toBe('-1010')
    expect(result.representations.hex).toBe('-A')
  })

  it('parses negative binary', () => {
    const result = parseInteger('-1010', 2)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.value).toBe(BigInt(-10))
    expect(result.representations.decimal).toBe('-10')
  })

  it('trims whitespace', () => {
    const result = parseInteger('  42  ', 10)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.value).toBe(BigInt(42))
  })

  it('returns error for empty string', () => {
    const result = parseInteger('', 10)
    expect(result.success).toBe(false)
  })

  it('returns error for invalid binary digit', () => {
    const result = parseInteger('102', 2)
    expect(result.success).toBe(false)
  })

  it('returns error for invalid octal digit', () => {
    const result = parseInteger('89', 8)
    expect(result.success).toBe(false)
  })

  it('returns error for invalid decimal character', () => {
    const result = parseInteger('12a', 10)
    expect(result.success).toBe(false)
  })

  it('returns error for invalid hex character', () => {
    const result = parseInteger('GG', 16)
    expect(result.success).toBe(false)
  })

  it('returns error for lone minus sign', () => {
    const result = parseInteger('-', 10)
    expect(result.success).toBe(false)
  })

  it('handles large number', () => {
    const result = parseInteger('100000000000', 10)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.value).toBe(BigInt(100000000000))
  })
})

describe('convertBase', () => {
  it('converts decimal to all bases', () => {
    const result = convertBase('16', 10)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.representations).toEqual({
      binary: '10000',
      octal: '20',
      decimal: '16',
      hex: '10',
    })
  })

  it('converts hex to all bases', () => {
    const result = convertBase('1A', 16)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.representations.decimal).toBe('26')
    expect(result.representations.binary).toBe('11010')
    expect(result.representations.octal).toBe('32')
    expect(result.representations.hex).toBe('1A')
  })
})

describe('getBitLength', () => {
  it('returns 8 for small values', () => {
    expect(getBitLength(BigInt(0))).toBe(8)
    expect(getBitLength(BigInt(127))).toBe(8)
    expect(getBitLength(BigInt(-128))).toBe(8)
  })

  it('returns 16 for medium values', () => {
    expect(getBitLength(BigInt(128))).toBe(16)
    expect(getBitLength(BigInt(32767))).toBe(16)
  })

  it('returns 32 for larger values', () => {
    expect(getBitLength(BigInt(32768))).toBe(32)
    expect(getBitLength(BigInt(2147483647))).toBe(32)
  })

  it('returns 64 for very large values', () => {
    expect(getBitLength(BigInt(2147483648))).toBe(64)
  })

  it('returns null for values exceeding 64-bit signed range', () => {
    expect(getBitLength(BigInt('9223372036854775808'))).toBe(null)
  })
})
