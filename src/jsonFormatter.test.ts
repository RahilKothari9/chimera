/**
 * Tests for JSON Formatter core logic
 */

import { describe, it, expect } from 'vitest'
import {
  formatJson,
  repairJson,
  calculateStats,
  extractErrorPosition,
  sortKeys,
  diffJson,
  JSON_EXAMPLES,
} from './jsonFormatter'

describe('JSON Formatter', () => {
  // ---------------------------------------------------------------------------
  describe('formatJson', () => {
    it('should format valid JSON with 2-space indent', () => {
      const result = formatJson('{"a":1}')
      expect(result.isValid).toBe(true)
      expect(result.formatted).toBe('{\n  "a": 1\n}')
    })

    it('should use custom indent when specified', () => {
      const result = formatJson('{"a":1}', 4)
      expect(result.isValid).toBe(true)
      expect(result.formatted).toBe('{\n    "a": 1\n}')
    })

    it('should produce a minified version', () => {
      const result = formatJson('{ "x" :  1 }')
      expect(result.isValid).toBe(true)
      expect(result.minified).toBe('{"x":1}')
    })

    it('should return isValid false for invalid JSON', () => {
      const result = formatJson('{bad json}')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('should return isValid false for empty input', () => {
      const result = formatJson('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Input is empty')
    })

    it('should return isValid false for whitespace-only input', () => {
      const result = formatJson('   ')
      expect(result.isValid).toBe(false)
    })

    it('should format JSON arrays', () => {
      const result = formatJson('[1,2,3]')
      expect(result.isValid).toBe(true)
      expect(result.formatted).toBe('[\n  1,\n  2,\n  3\n]')
    })

    it('should handle JSON with nested objects', () => {
      const result = formatJson('{"a":{"b":2}}')
      expect(result.isValid).toBe(true)
      expect(result.formatted).toContain('"b": 2')
    })

    it('should include stats in successful results', () => {
      const result = formatJson('{"name":"Alice","age":30}')
      expect(result.stats).toBeDefined()
      expect(result.stats!.strings).toBeGreaterThan(0)
      expect(result.stats!.numbers).toBe(1)
    })

    it('should handle null JSON value', () => {
      const result = formatJson('null')
      expect(result.isValid).toBe(true)
      expect(result.formatted).toBe('null')
    })

    it('should handle boolean values', () => {
      const result = formatJson('true')
      expect(result.isValid).toBe(true)
      expect(result.formatted).toBe('true')
    })

    it('should handle number values', () => {
      const result = formatJson('42')
      expect(result.isValid).toBe(true)
      expect(result.formatted).toBe('42')
    })
  })

  // ---------------------------------------------------------------------------
  describe('repairJson', () => {
    it('should remove trailing commas before }', () => {
      const result = repairJson('{"a":1,}')
      expect(result).toBe('{"a":1}')
    })

    it('should remove trailing commas before ]', () => {
      const result = repairJson('[1,2,]')
      expect(result).toBe('[1,2]')
    })

    it('should replace single quotes with double quotes', () => {
      const result = repairJson("{'key':'value'}")
      expect(result).toContain('"key"')
      expect(result).toContain('"value"')
    })

    it('should quote unquoted keys', () => {
      const result = repairJson('{key:"value"}')
      expect(result).toContain('"key"')
    })

    it('should trim the input', () => {
      const result = repairJson('  {"a":1}  ')
      expect(result).toBe('{"a":1}')
    })
  })

  // ---------------------------------------------------------------------------
  describe('calculateStats', () => {
    it('should count strings', () => {
      const stats = calculateStats({ name: 'Alice', city: 'NYC' })
      expect(stats.strings).toBe(2)
    })

    it('should count numbers', () => {
      const stats = calculateStats({ age: 30, score: 99.5 })
      expect(stats.numbers).toBe(2)
    })

    it('should count booleans', () => {
      const stats = calculateStats({ active: true, verified: false })
      expect(stats.booleans).toBe(2)
    })

    it('should count nulls', () => {
      const stats = calculateStats({ a: null, b: null })
      expect(stats.nulls).toBe(2)
    })

    it('should count objects', () => {
      const stats = calculateStats({ a: {}, b: { c: {} } })
      // root object + a + b + c = 4 objects
      expect(stats.objects).toBe(4)
    })

    it('should count arrays', () => {
      const stats = calculateStats({ items: [1, 2, 3] })
      expect(stats.arrays).toBe(1)
    })

    it('should count keys', () => {
      const stats = calculateStats({ x: 1, y: 2, z: 3 })
      expect(stats.keys).toBe(3)
    })

    it('should calculate depth for flat object', () => {
      const stats = calculateStats({ a: 1 })
      expect(stats.depth).toBe(1)
    })

    it('should calculate depth for nested object', () => {
      const stats = calculateStats({ a: { b: { c: 1 } } })
      expect(stats.depth).toBe(3)
    })

    it('should handle null value', () => {
      const stats = calculateStats(null)
      expect(stats.nulls).toBe(1)
    })

    it('should handle array of primitives', () => {
      const stats = calculateStats([1, 'two', true, null])
      expect(stats.arrays).toBe(1)
      expect(stats.numbers).toBe(1)
      expect(stats.strings).toBe(1)
      expect(stats.booleans).toBe(1)
      expect(stats.nulls).toBe(1)
    })
  })

  // ---------------------------------------------------------------------------
  describe('extractErrorPosition', () => {
    it('should extract position from "position N" messages', () => {
      const result = extractErrorPosition('Unexpected token at position 5', '{"a":}')
      expect(result.line).toBeDefined()
      expect(result.column).toBeDefined()
    })

    it('should extract line/column from "line N column N" messages', () => {
      const result = extractErrorPosition('Unexpected token: line 2 column 4', 'test')
      expect(result.line).toBe(2)
      expect(result.column).toBe(4)
    })

    it('should return empty object for unknown format', () => {
      const result = extractErrorPosition('Unknown error', 'test')
      expect(result.line).toBeUndefined()
      expect(result.column).toBeUndefined()
    })
  })

  // ---------------------------------------------------------------------------
  describe('sortKeys', () => {
    it('should sort object keys alphabetically', () => {
      const result = sortKeys({ z: 1, a: 2, m: 3 }) as Record<string, number>
      expect(Object.keys(result)).toEqual(['a', 'm', 'z'])
    })

    it('should sort nested object keys', () => {
      const result = sortKeys({ b: { d: 1, c: 2 }, a: 1 }) as Record<string, unknown>
      expect(Object.keys(result)).toEqual(['a', 'b'])
      expect(Object.keys(result['b'] as object)).toEqual(['c', 'd'])
    })

    it('should preserve arrays', () => {
      const result = sortKeys([3, 1, 2])
      expect(result).toEqual([3, 1, 2])
    })

    it('should sort keys within array objects', () => {
      const result = sortKeys([{ z: 1, a: 2 }]) as Array<Record<string, number>>
      expect(Object.keys(result[0])).toEqual(['a', 'z'])
    })

    it('should return primitives unchanged', () => {
      expect(sortKeys(42)).toBe(42)
      expect(sortKeys('hello')).toBe('hello')
      expect(sortKeys(null)).toBe(null)
      expect(sortKeys(true)).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  describe('diffJson', () => {
    it('should return empty array for identical JSON', () => {
      const result = diffJson('{"a":1}', '{"a":1}')
      expect(result).toEqual([])
    })

    it('should detect added keys', () => {
      const result = diffJson('{"a":1}', '{"a":1,"b":2}')
      expect(result).not.toBeNull()
      const added = result!.find(d => d.type === 'added' && d.path === 'b')
      expect(added).toBeDefined()
      expect(added!.newValue).toBe(2)
    })

    it('should detect removed keys', () => {
      const result = diffJson('{"a":1,"b":2}', '{"a":1}')
      expect(result).not.toBeNull()
      const removed = result!.find(d => d.type === 'removed' && d.path === 'b')
      expect(removed).toBeDefined()
    })

    it('should detect changed values', () => {
      const result = diffJson('{"a":1}', '{"a":99}')
      expect(result).not.toBeNull()
      const changed = result!.find(d => d.type === 'changed' && d.path === 'a')
      expect(changed).toBeDefined()
      expect(changed!.oldValue).toBe(1)
      expect(changed!.newValue).toBe(99)
    })

    it('should return null for invalid input', () => {
      expect(diffJson('{bad}', '{"a":1}')).toBeNull()
      expect(diffJson('{"a":1}', '{bad}')).toBeNull()
    })

    it('should detect nested changes', () => {
      const result = diffJson('{"a":{"b":1}}', '{"a":{"b":2}}')
      expect(result).not.toBeNull()
      const changed = result!.find(d => d.path === 'a.b')
      expect(changed).toBeDefined()
    })
  })

  // ---------------------------------------------------------------------------
  describe('JSON_EXAMPLES', () => {
    it('should have at least 3 examples', () => {
      expect(JSON_EXAMPLES.length).toBeGreaterThanOrEqual(3)
    })

    it('should have non-empty labels', () => {
      for (const ex of JSON_EXAMPLES) {
        expect(ex.label.length).toBeGreaterThan(0)
      }
    })

    it('should have valid JSON values', () => {
      for (const ex of JSON_EXAMPLES) {
        expect(() => JSON.parse(ex.value)).not.toThrow()
      }
    })
  })
})
