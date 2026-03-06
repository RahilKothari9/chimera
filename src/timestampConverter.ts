/**
 * Unix Timestamp Converter
 *
 * Converts between Unix timestamps (seconds or milliseconds since the Unix
 * epoch 1970-01-01T00:00:00Z) and human-readable date/time representations.
 *
 * Key capabilities:
 * - Auto-detect whether a numeric string encodes seconds or milliseconds
 * - Parse an ISO-8601 / datetime-local string into a Unix timestamp
 * - Format a timestamp in multiple representations
 * - Produce a human-friendly "relative time" string (e.g. "3 hours ago")
 */

export type TimestampUnit = 'seconds' | 'milliseconds'

export interface TimestampFormats {
  /** Unix timestamp in whole seconds */
  seconds: number
  /** Unix timestamp in milliseconds */
  milliseconds: number
  /** ISO-8601 full string, e.g. 2026-03-06T02:37:00.000Z */
  iso: string
  /** UTC human-readable, e.g. Fri, 06 Mar 2026 02:37:00 GMT */
  utc: string
  /** Locale-specific long date/time string */
  locale: string
  /** Relative time string, e.g. "3 hours ago" or "in 2 days" */
  relative: string
  /** Day-of-week name */
  weekday: string
  /** Local offset string, e.g. "+05:30" or "-07:00" */
  offset: string
}

export interface ParseResult {
  success: true
  unit: TimestampUnit
  ms: number
  formats: TimestampFormats
}

export interface ParseError {
  success: false
  error: string
}

export type TimestampParseOutput = ParseResult | ParseError

// Threshold: if an integer has 13 or more digits (≥ 1 000 000 000 000)
// we treat it as milliseconds; otherwise as seconds.
const MS_THRESHOLD = 1_000_000_000_000

/**
 * Detect whether a raw numeric string represents a seconds or milliseconds
 * Unix timestamp, then parse it and return all representations.
 */
export function parseUnixTimestamp(raw: string): TimestampParseOutput {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return { success: false, error: 'Input is empty' }
  }

  if (!/^-?\d+$/.test(trimmed)) {
    return { success: false, error: 'Not a valid integer timestamp' }
  }

  const numeric = parseInt(trimmed, 10)
  if (!Number.isFinite(numeric)) {
    return { success: false, error: 'Timestamp value out of range' }
  }

  const absNumeric = Math.abs(numeric)
  const unit: TimestampUnit = absNumeric >= MS_THRESHOLD ? 'milliseconds' : 'seconds'
  const ms = unit === 'milliseconds' ? numeric : numeric * 1000

  const date = new Date(ms)
  if (isNaN(date.getTime())) {
    return { success: false, error: 'Timestamp produces an invalid date' }
  }

  return {
    success: true,
    unit,
    ms,
    formats: buildFormats(date),
  }
}

/**
 * Parse an ISO-8601 string or a datetime-local string (YYYY-MM-DDTHH:mm)
 * into a Unix timestamp and all representations.
 */
export function parseDateString(raw: string): TimestampParseOutput {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return { success: false, error: 'Input is empty' }
  }

  // Try to parse as a Date
  const date = new Date(trimmed)
  if (isNaN(date.getTime())) {
    return { success: false, error: 'Cannot parse as a valid date/time string' }
  }

  const ms = date.getTime()

  return {
    success: true,
    unit: 'milliseconds',
    ms,
    formats: buildFormats(date),
  }
}

/**
 * Build all format representations for a given Date object.
 */
export function buildFormats(date: Date): TimestampFormats {
  const ms = date.getTime()
  const seconds = Math.floor(ms / 1000)

  const iso = date.toISOString()
  const utc = date.toUTCString()

  let locale: string
  try {
    locale = date.toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    })
  } catch {
    locale = date.toLocaleString()
  }

  const relative = buildRelative(ms)

  let weekday: string
  try {
    weekday = date.toLocaleString(undefined, { weekday: 'long' })
  } catch {
    weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]
  }

  const offsetMinutes = -date.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absMinutes = Math.abs(offsetMinutes)
  const offsetHH = String(Math.floor(absMinutes / 60)).padStart(2, '0')
  const offsetMM = String(absMinutes % 60).padStart(2, '0')
  const offset = `${sign}${offsetHH}:${offsetMM}`

  return { seconds, milliseconds: ms, iso, utc, locale, relative, weekday, offset }
}

/** Human-friendly relative time (e.g. "3 hours ago" or "in 2 days"). */
export function buildRelative(ms: number): string {
  const nowMs = Date.now()
  const diffMs = ms - nowMs
  const diffSec = Math.round(diffMs / 1000)
  const absSec = Math.abs(diffSec)

  if (absSec < 5) return 'just now'

  let value: number
  let unit: string

  if (absSec < 60) {
    value = absSec; unit = 'second'
  } else if (absSec < 3600) {
    value = Math.round(absSec / 60); unit = 'minute'
  } else if (absSec < 86400) {
    value = Math.round(absSec / 3600); unit = 'hour'
  } else if (absSec < 86400 * 30) {
    value = Math.round(absSec / 86400); unit = 'day'
  } else if (absSec < 86400 * 365) {
    value = Math.round(absSec / (86400 * 30)); unit = 'month'
  } else {
    value = Math.round(absSec / (86400 * 365)); unit = 'year'
  }

  const label = value === 1 ? unit : `${unit}s`

  return diffSec < 0 ? `${value} ${label} ago` : `in ${value} ${label}`
}

/**
 * Format a Date as a datetime-local string (YYYY-MM-DDTHH:mm:ss)
 * suitable for use in <input type="datetime-local">.
 */
export function toDatetimeLocalString(date: Date): string {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  const Y = date.getFullYear()
  const M = pad(date.getMonth() + 1)
  const D = pad(date.getDate())
  const h = pad(date.getHours())
  const m = pad(date.getMinutes())
  const s = pad(date.getSeconds())
  return `${Y}-${M}-${D}T${h}:${m}:${s}`
}
