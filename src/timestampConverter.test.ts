import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  parseUnixTimestamp,
  parseDateString,
  buildFormats,
  buildRelative,
  toDatetimeLocalString,
} from './timestampConverter'

// A well-known epoch to anchor tests: 2026-01-01T00:00:00.000Z = 1767225600 seconds
const KNOWN_EPOCH_MS = 1767225600000
const KNOWN_EPOCH_S  = 1767225600

describe('parseUnixTimestamp', () => {
  it('returns error for empty string', () => {
    const r = parseUnixTimestamp('')
    expect(r.success).toBe(false)
    if (r.success) return
    expect(r.error).toMatch(/empty/i)
  })

  it('returns error for non-integer input', () => {
    const r = parseUnixTimestamp('abc')
    expect(r.success).toBe(false)
  })

  it('returns error for float input', () => {
    const r = parseUnixTimestamp('1234.56')
    expect(r.success).toBe(false)
  })

  it('detects seconds for a 10-digit timestamp', () => {
    const r = parseUnixTimestamp(String(KNOWN_EPOCH_S))
    expect(r.success).toBe(true)
    if (!r.success) return
    expect(r.unit).toBe('seconds')
    expect(r.ms).toBe(KNOWN_EPOCH_MS)
  })

  it('detects milliseconds for a 13-digit timestamp', () => {
    const r = parseUnixTimestamp(String(KNOWN_EPOCH_MS))
    expect(r.success).toBe(true)
    if (!r.success) return
    expect(r.unit).toBe('milliseconds')
    expect(r.ms).toBe(KNOWN_EPOCH_MS)
  })

  it('handles epoch zero', () => {
    const r = parseUnixTimestamp('0')
    expect(r.success).toBe(true)
    if (!r.success) return
    expect(r.unit).toBe('seconds')
    expect(r.ms).toBe(0)
  })

  it('handles negative timestamp (before epoch)', () => {
    const r = parseUnixTimestamp('-3600')
    expect(r.success).toBe(true)
    if (!r.success) return
    expect(r.unit).toBe('seconds')
    expect(r.ms).toBe(-3600000)
  })

  it('trims whitespace', () => {
    const r = parseUnixTimestamp('  1000  ')
    expect(r.success).toBe(true)
    if (!r.success) return
    expect(r.ms).toBe(1000000)
  })

  it('fills all format keys on success', () => {
    const r = parseUnixTimestamp(String(KNOWN_EPOCH_S))
    expect(r.success).toBe(true)
    if (!r.success) return
    expect(r.formats.iso).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(r.formats.utc).toBeTruthy()
    expect(r.formats.locale).toBeTruthy()
    expect(r.formats.weekday).toBeTruthy()
    expect(r.formats.offset).toMatch(/^[+-]\d{2}:\d{2}$/)
    expect(typeof r.formats.seconds).toBe('number')
    expect(typeof r.formats.milliseconds).toBe('number')
  })

  it('seconds and milliseconds in formats match', () => {
    const r = parseUnixTimestamp(String(KNOWN_EPOCH_S))
    expect(r.success).toBe(true)
    if (!r.success) return
    expect(r.formats.seconds).toBe(KNOWN_EPOCH_S)
    expect(r.formats.milliseconds).toBe(KNOWN_EPOCH_MS)
  })

  it('ISO date matches known epoch', () => {
    const r = parseUnixTimestamp(String(KNOWN_EPOCH_S))
    expect(r.success).toBe(true)
    if (!r.success) return
    expect(r.formats.iso).toBe('2026-01-01T00:00:00.000Z')
  })
})

describe('parseDateString', () => {
  it('returns error for empty string', () => {
    const r = parseDateString('')
    expect(r.success).toBe(false)
    if (r.success) return
    expect(r.error).toMatch(/empty/i)
  })

  it('returns error for gibberish', () => {
    const r = parseDateString('not-a-date')
    expect(r.success).toBe(false)
  })

  it('parses ISO-8601 string', () => {
    const r = parseDateString('2026-01-01T00:00:00.000Z')
    expect(r.success).toBe(true)
    if (!r.success) return
    expect(r.ms).toBe(KNOWN_EPOCH_MS)
  })

  it('parses a datetime-local string without timezone', () => {
    // datetime-local strings are interpreted as local time; we just verify
    // that parsing succeeds and returns a reasonable ms value
    const r = parseDateString('2026-01-01T00:00:00')
    expect(r.success).toBe(true)
    if (!r.success) return
    expect(typeof r.ms).toBe('number')
    expect(isFinite(r.ms)).toBe(true)
  })

  it('always reports unit as milliseconds', () => {
    const r = parseDateString('2026-01-01T00:00:00.000Z')
    expect(r.success).toBe(true)
    if (!r.success) return
    expect(r.unit).toBe('milliseconds')
  })
})

describe('buildFormats', () => {
  it('produces correct seconds and milliseconds', () => {
    const date = new Date(KNOWN_EPOCH_MS)
    const f = buildFormats(date)
    expect(f.seconds).toBe(KNOWN_EPOCH_S)
    expect(f.milliseconds).toBe(KNOWN_EPOCH_MS)
  })

  it('produces valid ISO string', () => {
    const date = new Date(KNOWN_EPOCH_MS)
    const f = buildFormats(date)
    expect(f.iso).toBe('2026-01-01T00:00:00.000Z')
  })

  it('produces non-empty utc and locale', () => {
    const date = new Date(KNOWN_EPOCH_MS)
    const f = buildFormats(date)
    expect(f.utc).toBeTruthy()
    expect(f.locale).toBeTruthy()
  })

  it('produces a valid offset string', () => {
    const date = new Date(KNOWN_EPOCH_MS)
    const f = buildFormats(date)
    expect(f.offset).toMatch(/^[+-]\d{2}:\d{2}$/)
  })

  it('produces a non-empty weekday', () => {
    const date = new Date(KNOWN_EPOCH_MS)
    const f = buildFormats(date)
    expect(f.weekday).toBeTruthy()
    // 2026-01-01 is a Thursday
    expect(f.weekday.toLowerCase()).toContain('thursday')
  })
})

describe('buildRelative', () => {
  let nowSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    nowSpy = vi.spyOn(Date, 'now').mockReturnValue(KNOWN_EPOCH_MS)
  })

  afterEach(() => {
    nowSpy.mockRestore()
  })

  it('returns "just now" for less than 5 seconds difference', () => {
    expect(buildRelative(KNOWN_EPOCH_MS + 3000)).toBe('just now')
    expect(buildRelative(KNOWN_EPOCH_MS - 3000)).toBe('just now')
  })

  it('returns seconds ago', () => {
    expect(buildRelative(KNOWN_EPOCH_MS - 30_000)).toBe('30 seconds ago')
  })

  it('returns minutes ago', () => {
    expect(buildRelative(KNOWN_EPOCH_MS - 5 * 60_000)).toBe('5 minutes ago')
  })

  it('returns hours ago', () => {
    expect(buildRelative(KNOWN_EPOCH_MS - 3 * 3600_000)).toBe('3 hours ago')
  })

  it('returns days ago', () => {
    expect(buildRelative(KNOWN_EPOCH_MS - 7 * 86400_000)).toBe('7 days ago')
  })

  it('returns months ago', () => {
    expect(buildRelative(KNOWN_EPOCH_MS - 60 * 86400_000)).toBe('2 months ago')
  })

  it('returns in seconds', () => {
    expect(buildRelative(KNOWN_EPOCH_MS + 45_000)).toBe('in 45 seconds')
  })

  it('returns in minutes', () => {
    expect(buildRelative(KNOWN_EPOCH_MS + 2 * 60_000)).toBe('in 2 minutes')
  })

  it('returns in hours', () => {
    expect(buildRelative(KNOWN_EPOCH_MS + 10 * 3600_000)).toBe('in 10 hours')
  })

  it('returns in years', () => {
    expect(buildRelative(KNOWN_EPOCH_MS + 400 * 86400_000)).toMatch(/^in \d+ year/)
  })

  it('uses singular for 1', () => {
    expect(buildRelative(KNOWN_EPOCH_MS + 60_000)).toBe('in 1 minute')
    expect(buildRelative(KNOWN_EPOCH_MS - 3600_000)).toBe('1 hour ago')
  })
})

describe('toDatetimeLocalString', () => {
  it('formats a Date as YYYY-MM-DDTHH:mm:ss', () => {
    // Use a fixed UTC date; local time varies by env timezone
    // Just check the shape
    const date = new Date('2026-06-15T10:30:00Z')
    const s = toDatetimeLocalString(date)
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
  })

  it('pads month, day, hours, minutes, seconds with leading zero', () => {
    // Create a date where local components might be single-digit
    const date = new Date(0) // 1970-01-01T00:00:00Z
    const s = toDatetimeLocalString(date)
    // Verify zero-padded components
    const parts = s.split('T')
    expect(parts).toHaveLength(2)
    const dateParts = parts[0].split('-')
    expect(dateParts[1]).toHaveLength(2)
    expect(dateParts[2]).toHaveLength(2)
    const timeParts = parts[1].split(':')
    expect(timeParts[0]).toHaveLength(2)
    expect(timeParts[1]).toHaveLength(2)
    expect(timeParts[2]).toHaveLength(2)
  })
})
