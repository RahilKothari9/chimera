/**
 * Timestamp Converter
 *
 * Converts between Unix timestamps (seconds / milliseconds) and
 * human-readable date representations, with helpers for common
 * formatting needs that developers encounter daily.
 */

export type TimestampUnit = 'seconds' | 'milliseconds';

export type DateFormat =
  | 'iso'
  | 'utc'
  | 'local'
  | 'relative'
  | 'date-only'
  | 'time-only';

export interface UnixToDateResult {
  iso: string;
  utc: string;
  local: string;
  relative: string;
  dateOnly: string;
  timeOnly: string;
  dayOfWeek: string;
  unixSeconds: number;
  unixMilliseconds: number;
}

export interface DateToUnixResult {
  success: boolean;
  unixSeconds: number;
  unixMilliseconds: number;
  iso: string;
  error?: string;
}

/**
 * Returns the current Unix timestamp in both seconds and milliseconds.
 */
export function getCurrentTimestamp(): { seconds: number; milliseconds: number } {
  const ms = Date.now();
  return { seconds: Math.floor(ms / 1000), milliseconds: ms };
}

/**
 * Converts a Unix timestamp to multiple human-readable representations.
 *
 * @param timestamp  The numeric timestamp value.
 * @param unit       Whether `timestamp` is in seconds or milliseconds.
 */
export function unixToDate(timestamp: number, unit: TimestampUnit = 'seconds'): UnixToDateResult {
  const ms = unit === 'seconds' ? timestamp * 1000 : timestamp;
  const date = new Date(ms);

  return {
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    relative: getRelativeTime(ms),
    dateOnly: date.toISOString().split('T')[0],
    timeOnly: date.toISOString().split('T')[1].replace('Z', ' UTC'),
    dayOfWeek: date.toLocaleDateString(undefined, { weekday: 'long' }),
    unixSeconds: Math.floor(ms / 1000),
    unixMilliseconds: ms,
  };
}

/**
 * Parses a date string (ISO, natural language, or a raw timestamp) and
 * returns the corresponding Unix timestamps.
 *
 * Accepts:
 *  - ISO 8601 strings  (e.g. "2024-01-15T10:30:00Z")
 *  - Date-only strings (e.g. "2024-01-15")
 *  - Numeric strings   (treated as Unix seconds when ≤ 10 digits, otherwise ms)
 *  - Any string parseable by `new Date()`
 */
export function dateToUnix(input: string): DateToUnixResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: false, unixSeconds: 0, unixMilliseconds: 0, iso: '', error: 'Input is empty' };
  }

  // Numeric input: treat as unix timestamp
  if (/^-?\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    // Heuristic: ≤ 10-digit numbers → seconds; > 10 digits → milliseconds
    const ms = Math.abs(num) <= 9_999_999_999 ? num * 1000 : num;
    const date = new Date(ms);
    if (isNaN(date.getTime())) {
      return { success: false, unixSeconds: 0, unixMilliseconds: 0, iso: '', error: 'Invalid numeric timestamp' };
    }
    return {
      success: true,
      unixSeconds: Math.floor(ms / 1000),
      unixMilliseconds: ms,
      iso: date.toISOString(),
    };
  }

  const date = new Date(trimmed);
  if (isNaN(date.getTime())) {
    return {
      success: false,
      unixSeconds: 0,
      unixMilliseconds: 0,
      iso: '',
      error: `Cannot parse date: "${trimmed}"`,
    };
  }

  const ms = date.getTime();
  return {
    success: true,
    unixSeconds: Math.floor(ms / 1000),
    unixMilliseconds: ms,
    iso: date.toISOString(),
  };
}

/**
 * Returns a human-friendly relative time string (e.g. "3 minutes ago").
 *
 * @param ms  Timestamp in milliseconds.
 */
export function getRelativeTime(ms: number): string {
  const diffMs = Date.now() - ms;
  const absDiff = Math.abs(diffMs);
  const future = diffMs < 0;

  const seconds = Math.round(absDiff / 1000);
  const minutes = Math.round(absDiff / 60_000);
  const hours = Math.round(absDiff / 3_600_000);
  const days = Math.round(absDiff / 86_400_000);
  const weeks = Math.round(absDiff / 604_800_000);
  const months = Math.round(absDiff / 2_628_000_000);
  const years = Math.round(absDiff / 31_536_000_000);

  let label: string;
  if (seconds < 5) label = 'just now';
  else if (seconds < 60) label = `${seconds} second${seconds === 1 ? '' : 's'}`;
  else if (minutes < 60) label = `${minutes} minute${minutes === 1 ? '' : 's'}`;
  else if (hours < 24) label = `${hours} hour${hours === 1 ? '' : 's'}`;
  else if (days < 7) label = `${days} day${days === 1 ? '' : 's'}`;
  else if (weeks < 5) label = `${weeks} week${weeks === 1 ? '' : 's'}`;
  else if (months < 12) label = `${months} month${months === 1 ? '' : 's'}`;
  else label = `${years} year${years === 1 ? '' : 's'}`;

  if (label === 'just now') return label;
  return future ? `in ${label}` : `${label} ago`;
}

/**
 * Detects whether a string is more likely a Unix timestamp (numeric) or a
 * date string, returning a hint for UI auto-detection.
 */
export function detectInputType(input: string): 'unix' | 'date' | 'unknown' {
  const trimmed = input.trim();
  if (/^-?\d+$/.test(trimmed)) return 'unix';
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed) || /^\w{3},?\s+\d/.test(trimmed)) return 'date';
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? 'unknown' : 'date';
}
