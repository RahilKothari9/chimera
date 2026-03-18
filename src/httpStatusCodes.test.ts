/**
 * Tests for HTTP Status Codes core module
 */

import { describe, it, expect } from 'vitest'
import {
  getAllStatusCodes,
  getStatusByCode,
  searchStatusCodes,
  filterByCategory,
  getCategoryLabel,
  getCategoryClass,
  getCategoryFromCode,
  HTTP_STATUS_CODES,
} from './httpStatusCodes'

describe('getAllStatusCodes', () => {
  it('returns all status codes', () => {
    const codes = getAllStatusCodes()
    expect(codes.length).toBeGreaterThan(0)
    expect(codes).toBe(HTTP_STATUS_CODES)
  })

  it('includes codes from every category', () => {
    const codes = getAllStatusCodes()
    const categories = new Set(codes.map((c) => c.category))
    expect(categories.has('1xx')).toBe(true)
    expect(categories.has('2xx')).toBe(true)
    expect(categories.has('3xx')).toBe(true)
    expect(categories.has('4xx')).toBe(true)
    expect(categories.has('5xx')).toBe(true)
  })

  it('each entry has required fields', () => {
    for (const code of getAllStatusCodes()) {
      expect(typeof code.code).toBe('number')
      expect(typeof code.name).toBe('string')
      expect(code.name.length).toBeGreaterThan(0)
      expect(typeof code.description).toBe('string')
      expect(code.description.length).toBeGreaterThan(0)
      expect(typeof code.usage).toBe('string')
      expect(code.usage.length).toBeGreaterThan(0)
      expect(['1xx', '2xx', '3xx', '4xx', '5xx']).toContain(code.category)
    }
  })
})

describe('getStatusByCode', () => {
  it('returns the status code entry for a known code', () => {
    const result = getStatusByCode(200)
    expect(result).toBeDefined()
    expect(result!.code).toBe(200)
    expect(result!.name).toBe('OK')
    expect(result!.category).toBe('2xx')
  })

  it('returns the entry for 404', () => {
    const result = getStatusByCode(404)
    expect(result).toBeDefined()
    expect(result!.name).toBe('Not Found')
    expect(result!.category).toBe('4xx')
  })

  it('returns the entry for 500', () => {
    const result = getStatusByCode(500)
    expect(result).toBeDefined()
    expect(result!.name).toBe('Internal Server Error')
    expect(result!.category).toBe('5xx')
  })

  it('returns the entry for 418', () => {
    const result = getStatusByCode(418)
    expect(result).toBeDefined()
    expect(result!.name).toContain("teapot")
  })

  it('returns undefined for an unknown code', () => {
    expect(getStatusByCode(999)).toBeUndefined()
    expect(getStatusByCode(0)).toBeUndefined()
  })
})

describe('searchStatusCodes', () => {
  it('returns all codes for an empty query', () => {
    expect(searchStatusCodes('').length).toBe(HTTP_STATUS_CODES.length)
    expect(searchStatusCodes('   ').length).toBe(HTTP_STATUS_CODES.length)
  })

  it('matches by numeric code', () => {
    const results = searchStatusCodes('404')
    expect(results.some((s) => s.code === 404)).toBe(true)
  })

  it('matches multiple codes with a partial number', () => {
    const results = searchStatusCodes('20')
    // Should match 200, 201, 202, 203, 204, 205, 206, 207, 208
    expect(results.length).toBeGreaterThanOrEqual(3)
    results.forEach((r) => expect(r.code.toString()).toContain('20'))
  })

  it('matches by name (case-insensitive)', () => {
    const results = searchStatusCodes('not found')
    expect(results.some((s) => s.code === 404)).toBe(true)
  })

  it('matches by description', () => {
    const results = searchStatusCodes('rate limit')
    expect(results.some((s) => s.code === 429)).toBe(true)
  })

  it('matches by usage', () => {
    const results = searchStatusCodes('WebDAV')
    expect(results.length).toBeGreaterThan(0)
  })

  it('returns empty array for no matches', () => {
    expect(searchStatusCodes('zzzznotfound')).toHaveLength(0)
  })

  it('is case insensitive', () => {
    const lower = searchStatusCodes('ok')
    const upper = searchStatusCodes('OK')
    expect(lower.map((s) => s.code).sort()).toEqual(upper.map((s) => s.code).sort())
  })
})

describe('filterByCategory', () => {
  it('returns all codes when category is "all"', () => {
    expect(filterByCategory('all').length).toBe(HTTP_STATUS_CODES.length)
  })

  it('returns only 1xx codes', () => {
    const results = filterByCategory('1xx')
    expect(results.length).toBeGreaterThan(0)
    results.forEach((r) => expect(r.category).toBe('1xx'))
  })

  it('returns only 2xx codes', () => {
    const results = filterByCategory('2xx')
    expect(results.length).toBeGreaterThan(0)
    results.forEach((r) => expect(r.category).toBe('2xx'))
  })

  it('returns only 3xx codes', () => {
    const results = filterByCategory('3xx')
    expect(results.length).toBeGreaterThan(0)
    results.forEach((r) => expect(r.category).toBe('3xx'))
  })

  it('returns only 4xx codes', () => {
    const results = filterByCategory('4xx')
    expect(results.length).toBeGreaterThan(0)
    results.forEach((r) => expect(r.category).toBe('4xx'))
  })

  it('returns only 5xx codes', () => {
    const results = filterByCategory('5xx')
    expect(results.length).toBeGreaterThan(0)
    results.forEach((r) => expect(r.category).toBe('5xx'))
  })

  it('all categories together equal all codes', () => {
    const all = getAllStatusCodes()
    const combined = [
      ...filterByCategory('1xx'),
      ...filterByCategory('2xx'),
      ...filterByCategory('3xx'),
      ...filterByCategory('4xx'),
      ...filterByCategory('5xx'),
    ]
    expect(combined.length).toBe(all.length)
  })
})

describe('getCategoryLabel', () => {
  it('returns correct label for each category', () => {
    expect(getCategoryLabel('1xx')).toBe('1xx Informational')
    expect(getCategoryLabel('2xx')).toBe('2xx Success')
    expect(getCategoryLabel('3xx')).toBe('3xx Redirection')
    expect(getCategoryLabel('4xx')).toBe('4xx Client Error')
    expect(getCategoryLabel('5xx')).toBe('5xx Server Error')
  })
})

describe('getCategoryClass', () => {
  it('returns a CSS class string for each category', () => {
    expect(getCategoryClass('1xx')).toBe('http-cat-1xx')
    expect(getCategoryClass('2xx')).toBe('http-cat-2xx')
    expect(getCategoryClass('3xx')).toBe('http-cat-3xx')
    expect(getCategoryClass('4xx')).toBe('http-cat-4xx')
    expect(getCategoryClass('5xx')).toBe('http-cat-5xx')
  })
})

describe('getCategoryFromCode', () => {
  it('identifies 1xx codes', () => {
    expect(getCategoryFromCode(100)).toBe('1xx')
    expect(getCategoryFromCode(199)).toBe('1xx')
  })

  it('identifies 2xx codes', () => {
    expect(getCategoryFromCode(200)).toBe('2xx')
    expect(getCategoryFromCode(299)).toBe('2xx')
  })

  it('identifies 3xx codes', () => {
    expect(getCategoryFromCode(301)).toBe('3xx')
    expect(getCategoryFromCode(308)).toBe('3xx')
  })

  it('identifies 4xx codes', () => {
    expect(getCategoryFromCode(400)).toBe('4xx')
    expect(getCategoryFromCode(451)).toBe('4xx')
  })

  it('identifies 5xx codes', () => {
    expect(getCategoryFromCode(500)).toBe('5xx')
    expect(getCategoryFromCode(511)).toBe('5xx')
  })

  it('returns null for out-of-range values', () => {
    expect(getCategoryFromCode(99)).toBeNull()
    expect(getCategoryFromCode(600)).toBeNull()
    expect(getCategoryFromCode(0)).toBeNull()
  })
})
