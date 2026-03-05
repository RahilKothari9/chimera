import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCurrentTimestamp,
  unixToDate,
  dateToUnix,
  getRelativeTime,
  detectInputType,
} from './timestampConverter';

// Fix Date.now() to a known value for deterministic tests
const FIXED_NOW_MS = 1_700_000_000_000; // 2023-11-14T22:13:20.000Z
const FIXED_NOW_S = Math.floor(FIXED_NOW_MS / 1000); // 1700000000

describe('getCurrentTimestamp', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(FIXED_NOW_MS);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns milliseconds equal to Date.now()', () => {
    expect(getCurrentTimestamp().milliseconds).toBe(FIXED_NOW_MS);
  });

  it('returns seconds as floor of milliseconds / 1000', () => {
    expect(getCurrentTimestamp().seconds).toBe(FIXED_NOW_S);
  });
});

describe('unixToDate – seconds input', () => {
  it('produces a valid ISO string', () => {
    const result = unixToDate(0, 'seconds');
    expect(result.iso).toBe('1970-01-01T00:00:00.000Z');
  });

  it('stores unixSeconds and unixMilliseconds correctly', () => {
    const result = unixToDate(1_000, 'seconds');
    expect(result.unixSeconds).toBe(1_000);
    expect(result.unixMilliseconds).toBe(1_000_000);
  });

  it('produces dateOnly in YYYY-MM-DD format', () => {
    const result = unixToDate(0, 'seconds');
    expect(result.dateOnly).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.dateOnly).toBe('1970-01-01');
  });

  it('produces timeOnly ending with " UTC"', () => {
    const result = unixToDate(0, 'seconds');
    expect(result.timeOnly).toMatch(/ UTC$/);
  });

  it('returns a non-empty dayOfWeek string', () => {
    const result = unixToDate(0, 'seconds');
    expect(result.dayOfWeek.length).toBeGreaterThan(0);
  });

  it('returns non-empty utc string', () => {
    const result = unixToDate(0, 'seconds');
    expect(result.utc.length).toBeGreaterThan(0);
  });

  it('returns non-empty local string', () => {
    const result = unixToDate(0, 'seconds');
    expect(result.local.length).toBeGreaterThan(0);
  });
});

describe('unixToDate – milliseconds input', () => {
  it('treats input as-is when unit is milliseconds', () => {
    const result = unixToDate(0, 'milliseconds');
    expect(result.unixMilliseconds).toBe(0);
    expect(result.unixSeconds).toBe(0);
  });

  it('stores correct unixSeconds for ms input', () => {
    const result = unixToDate(5_000, 'milliseconds');
    expect(result.unixSeconds).toBe(5);
    expect(result.unixMilliseconds).toBe(5_000);
  });

  it('defaults to seconds when unit omitted', () => {
    const result = unixToDate(1000);
    expect(result.unixMilliseconds).toBe(1_000_000);
  });
});

describe('dateToUnix', () => {
  it('returns error for empty string', () => {
    const result = dateToUnix('');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('returns error for whitespace-only string', () => {
    const result = dateToUnix('   ');
    expect(result.success).toBe(false);
  });

  it('parses ISO 8601 string correctly', () => {
    const result = dateToUnix('1970-01-01T00:00:00.000Z');
    expect(result.success).toBe(true);
    expect(result.unixSeconds).toBe(0);
    expect(result.unixMilliseconds).toBe(0);
  });

  it('parses date-only string', () => {
    const result = dateToUnix('2024-01-01');
    expect(result.success).toBe(true);
    expect(result.iso.startsWith('2024-01-01')).toBe(true);
  });

  it('parses a raw numeric string (≤10 digits) as seconds', () => {
    const result = dateToUnix('1000000');
    expect(result.success).toBe(true);
    expect(result.unixSeconds).toBe(1_000_000);
    expect(result.unixMilliseconds).toBe(1_000_000_000);
  });

  it('parses a raw numeric string (>10 digits) as milliseconds', () => {
    const result = dateToUnix('1700000000000');
    expect(result.success).toBe(true);
    expect(result.unixMilliseconds).toBe(1_700_000_000_000);
    expect(result.unixSeconds).toBe(1_700_000_000);
  });

  it('returns error for unparseable string', () => {
    const result = dateToUnix('not a date at all!!!');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Cannot parse date');
  });

  it('round-trips: dateToUnix(unixToDate(ts).iso).unixSeconds === ts', () => {
    const ts = 1_700_000_000;
    const iso = unixToDate(ts, 'seconds').iso;
    const back = dateToUnix(iso);
    expect(back.success).toBe(true);
    expect(back.unixSeconds).toBe(ts);
  });
});

describe('getRelativeTime', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(FIXED_NOW_MS);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "just now" for very recent timestamps', () => {
    expect(getRelativeTime(FIXED_NOW_MS - 2_000)).toBe('just now');
  });

  it('returns seconds ago for timestamps < 60s in the past', () => {
    const label = getRelativeTime(FIXED_NOW_MS - 30_000);
    expect(label).toMatch(/\d+ seconds? ago/);
  });

  it('returns minutes ago for timestamps 1–59 min in the past', () => {
    const label = getRelativeTime(FIXED_NOW_MS - 5 * 60_000);
    expect(label).toMatch(/\d+ minutes? ago/);
  });

  it('returns hours ago for timestamps within a day', () => {
    const label = getRelativeTime(FIXED_NOW_MS - 3 * 3_600_000);
    expect(label).toMatch(/\d+ hours? ago/);
  });

  it('returns days ago for timestamps within a week', () => {
    const label = getRelativeTime(FIXED_NOW_MS - 4 * 86_400_000);
    expect(label).toMatch(/\d+ days? ago/);
  });

  it('returns weeks ago for timestamps within a month', () => {
    const label = getRelativeTime(FIXED_NOW_MS - 14 * 86_400_000);
    expect(label).toMatch(/\d+ weeks? ago/);
  });

  it('returns months ago for timestamps within a year', () => {
    const label = getRelativeTime(FIXED_NOW_MS - 3 * 30 * 86_400_000);
    expect(label).toMatch(/\d+ months? ago/);
  });

  it('returns years ago for old timestamps', () => {
    const label = getRelativeTime(FIXED_NOW_MS - 3 * 365 * 86_400_000);
    expect(label).toMatch(/\d+ years? ago/);
  });

  it('returns "in X" for future timestamps', () => {
    const label = getRelativeTime(FIXED_NOW_MS + 2 * 3_600_000);
    expect(label).toMatch(/^in /);
  });
});

describe('detectInputType', () => {
  it('detects pure numeric string as unix', () => {
    expect(detectInputType('1700000000')).toBe('unix');
  });

  it('detects negative numeric string as unix', () => {
    expect(detectInputType('-3600')).toBe('unix');
  });

  it('detects ISO date string as date', () => {
    expect(detectInputType('2024-01-15T10:30:00Z')).toBe('date');
  });

  it('detects date-only string as date', () => {
    expect(detectInputType('2024-01-15')).toBe('date');
  });

  it('returns unknown for garbage input', () => {
    expect(detectInputType('xyz!!!')).toBe('unknown');
  });

  it('returns unknown for empty string', () => {
    expect(detectInputType('')).toBe('unknown');
  });
});
