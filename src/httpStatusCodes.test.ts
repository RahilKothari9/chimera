import { describe, it, expect } from 'vitest'
import {
  HTTP_STATUS_CODES,
  searchStatusCodes,
  filterByCategory,
  getStatusCode,
  getCategories,
  getCategoryLabel,
  getCategoryColor,
} from './httpStatusCodes'

describe('HTTP_STATUS_CODES data', () => {
  it('contains at least 50 status codes', () => {
    expect(HTTP_STATUS_CODES.length).toBeGreaterThanOrEqual(50)
  })

  it('contains the iconic 404 code', () => {
    const code = HTTP_STATUS_CODES.find((s) => s.code === 404)
    expect(code).toBeDefined()
    expect(code!.name).toBe('Not Found')
    expect(code!.category).toBe('4xx')
  })

  it('contains 200 OK', () => {
    const code = HTTP_STATUS_CODES.find((s) => s.code === 200)
    expect(code).toBeDefined()
    expect(code!.name).toBe('OK')
    expect(code!.category).toBe('2xx')
  })

  it('contains 500 Internal Server Error', () => {
    const code = HTTP_STATUS_CODES.find((s) => s.code === 500)
    expect(code).toBeDefined()
    expect(code!.name).toBe('Internal Server Error')
    expect(code!.category).toBe('5xx')
  })

  it('every code has a non-empty name, description, and detail', () => {
    for (const entry of HTTP_STATUS_CODES) {
      expect(entry.name.trim()).toBeTruthy()
      expect(entry.description.trim()).toBeTruthy()
      expect(entry.detail.trim()).toBeTruthy()
    }
  })

  it('all codes are in the correct category range', () => {
    for (const entry of HTTP_STATUS_CODES) {
      const prefix = Math.floor(entry.code / 100)
      expect(entry.category).toBe(`${prefix}xx`)
    }
  })

  it('codes are unique', () => {
    const codes = HTTP_STATUS_CODES.map((s) => s.code)
    const unique = new Set(codes)
    expect(unique.size).toBe(codes.length)
  })

  it('contains 418 I\'m a Teapot', () => {
    const code = HTTP_STATUS_CODES.find((s) => s.code === 418)
    expect(code).toBeDefined()
    expect(code!.name).toContain('Teapot')
  })
})

describe('searchStatusCodes', () => {
  it('returns all codes for empty query', () => {
    const result = searchStatusCodes('')
    expect(result).toHaveLength(HTTP_STATUS_CODES.length)
  })

  it('returns all codes for whitespace-only query', () => {
    const result = searchStatusCodes('   ')
    expect(result).toHaveLength(HTTP_STATUS_CODES.length)
  })

  it('finds codes by number', () => {
    const result = searchStatusCodes('404')
    expect(result.some((s) => s.code === 404)).toBe(true)
  })

  it('finds codes by name (case-insensitive)', () => {
    const result = searchStatusCodes('not found')
    expect(result.some((s) => s.code === 404)).toBe(true)
  })

  it('finds codes by description keyword', () => {
    const result = searchStatusCodes('too many')
    expect(result.some((s) => s.code === 429)).toBe(true)
  })

  it('finds codes by category', () => {
    const result = searchStatusCodes('5xx')
    expect(result.every((s) => s.category === '5xx')).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns empty array for no matches', () => {
    const result = searchStatusCodes('zzznomatch999')
    expect(result).toHaveLength(0)
  })

  it('search is case-insensitive', () => {
    const lower = searchStatusCodes('gateway')
    const upper = searchStatusCodes('GATEWAY')
    expect(lower.map((s) => s.code)).toEqual(upper.map((s) => s.code))
  })

  it('finds multiple matching codes for broad query', () => {
    const result = searchStatusCodes('redirect')
    expect(result.length).toBeGreaterThan(1)
  })
})

describe('filterByCategory', () => {
  it('returns all codes for "all"', () => {
    const result = filterByCategory('all')
    expect(result).toHaveLength(HTTP_STATUS_CODES.length)
  })

  it('returns only 2xx codes', () => {
    const result = filterByCategory('2xx')
    expect(result.every((s) => s.category === '2xx')).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns only 4xx codes', () => {
    const result = filterByCategory('4xx')
    expect(result.every((s) => s.category === '4xx')).toBe(true)
    expect(result.some((s) => s.code === 404)).toBe(true)
  })

  it('returns only 5xx codes', () => {
    const result = filterByCategory('5xx')
    expect(result.every((s) => s.category === '5xx')).toBe(true)
    expect(result.some((s) => s.code === 500)).toBe(true)
  })
})

describe('getStatusCode', () => {
  it('retrieves a code by number', () => {
    const code = getStatusCode(200)
    expect(code).toBeDefined()
    expect(code!.name).toBe('OK')
  })

  it('returns undefined for non-existent code', () => {
    expect(getStatusCode(999)).toBeUndefined()
  })

  it('retrieves 301 Moved Permanently', () => {
    const code = getStatusCode(301)
    expect(code).toBeDefined()
    expect(code!.name).toBe('Moved Permanently')
    expect(code!.category).toBe('3xx')
  })
})

describe('getCategories', () => {
  it('returns all 5 categories', () => {
    const cats = getCategories()
    expect(cats).toHaveLength(5)
    expect(cats).toContain('1xx')
    expect(cats).toContain('2xx')
    expect(cats).toContain('3xx')
    expect(cats).toContain('4xx')
    expect(cats).toContain('5xx')
  })
})

describe('getCategoryLabel', () => {
  it('returns a human-readable label', () => {
    expect(getCategoryLabel('2xx')).toContain('Success')
    expect(getCategoryLabel('4xx')).toContain('Client Error')
    expect(getCategoryLabel('5xx')).toContain('Server Error')
  })
})

describe('getCategoryColor', () => {
  it('returns a non-empty color string for each category', () => {
    const cats = getCategories()
    for (const cat of cats) {
      const color = getCategoryColor(cat)
      expect(color).toBeTruthy()
      expect(color.startsWith('#')).toBe(true)
    }
  })

  it('success is green-ish', () => {
    const color = getCategoryColor('2xx')
    expect(color).toBe('#28a745')
  })

  it('server errors are red-ish', () => {
    const color = getCategoryColor('5xx')
    expect(color).toBe('#dc3545')
  })
})
