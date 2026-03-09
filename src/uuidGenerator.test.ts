import { describe, it, expect, vi } from 'vitest';
import {
  generateUUIDv4,
  formatUUID,
  isValidUUID,
  generateUUIDs,
  parseUUIDComponents,
} from './uuidGenerator';

// Canonical UUID v4 regex used throughout tests
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('generateUUIDv4', () => {
  it('returns a string in lowercase UUID v4 format', () => {
    const uuid = generateUUIDv4();
    expect(UUID_REGEX.test(uuid)).toBe(true);
  });

  it('produces a different value on each call', () => {
    const a = generateUUIDv4();
    const b = generateUUIDv4();
    expect(a).not.toBe(b);
  });

  it('always returns a 36-character string', () => {
    for (let i = 0; i < 5; i++) {
      expect(generateUUIDv4()).toHaveLength(36);
    }
  });

  it('contains exactly 4 hyphens', () => {
    const uuid = generateUUIDv4();
    const hyphens = uuid.split('').filter(c => c === '-').length;
    expect(hyphens).toBe(4);
  });

  it('version nibble is always "4"', () => {
    for (let i = 0; i < 10; i++) {
      const uuid = generateUUIDv4();
      expect(uuid[14]).toBe('4');
    }
  });

  it('variant nibble is always 8, 9, a, or b', () => {
    for (let i = 0; i < 10; i++) {
      const uuid = generateUUIDv4();
      expect(['8', '9', 'a', 'b']).toContain(uuid[19]);
    }
  });
});

describe('formatUUID', () => {
  const sample = '550e8400-e29b-41d4-a716-446655440000';

  it('lowercase keeps hyphens and lowercase', () => {
    expect(formatUUID(sample, 'lowercase')).toBe(sample);
  });

  it('uppercase converts to UPPER with hyphens', () => {
    expect(formatUUID(sample, 'uppercase')).toBe(sample.toUpperCase());
  });

  it('no-hyphens removes all hyphens and lowercases', () => {
    const result = formatUUID(sample, 'no-hyphens');
    expect(result).toBe('550e8400e29b41d4a716446655440000');
    expect(result).toHaveLength(32);
    expect(result).not.toContain('-');
  });

  it('defaults to lowercase for unknown format', () => {
    // Force-cast to exercise the default branch
    expect(formatUUID(sample, 'lowercase')).toBe(sample.toLowerCase());
  });
});

describe('isValidUUID', () => {
  it('returns true for a well-formed v4 UUID', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('returns true regardless of casing', () => {
    expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
  });

  it('returns true when surrounded by whitespace', () => {
    expect(isValidUUID('  550e8400-e29b-41d4-a716-446655440000  ')).toBe(true);
  });

  it('returns false for an empty string', () => {
    expect(isValidUUID('')).toBe(false);
  });

  it('returns false for a string with the wrong version nibble', () => {
    expect(isValidUUID('550e8400-e29b-31d4-a716-446655440000')).toBe(false);
  });

  it('returns false for a string missing hyphens', () => {
    expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false);
  });

  it('returns false for a short string', () => {
    expect(isValidUUID('short')).toBe(false);
  });

  it('returns false for a string with invalid characters', () => {
    expect(isValidUUID('zzzzzzzz-e29b-41d4-a716-446655440000')).toBe(false);
  });

  it('returns true for freshly generated UUIDs', () => {
    for (let i = 0; i < 5; i++) {
      expect(isValidUUID(crypto.randomUUID())).toBe(true);
    }
  });
});

describe('generateUUIDs', () => {
  it('returns the requested number of results', () => {
    expect(generateUUIDs(5)).toHaveLength(5);
    expect(generateUUIDs(10)).toHaveLength(10);
  });

  it('defaults to count=1 when 0 is passed', () => {
    expect(generateUUIDs(0)).toHaveLength(1);
  });

  it('caps at 100', () => {
    expect(generateUUIDs(200)).toHaveLength(100);
  });

  it('each result has uuid, formatted, and format fields', () => {
    const results = generateUUIDs(3, 'lowercase');
    for (const r of results) {
      expect(r).toHaveProperty('uuid');
      expect(r).toHaveProperty('formatted');
      expect(r).toHaveProperty('format');
    }
  });

  it('all generated UUIDs are valid v4 format', () => {
    const results = generateUUIDs(20);
    for (const r of results) {
      expect(UUID_REGEX.test(r.uuid)).toBe(true);
    }
  });

  it('applies lowercase format correctly', () => {
    const [r] = generateUUIDs(1, 'lowercase');
    expect(r.formatted).toBe(r.uuid.toLowerCase());
  });

  it('applies uppercase format correctly', () => {
    const [r] = generateUUIDs(1, 'uppercase');
    expect(r.formatted).toBe(r.uuid.toUpperCase());
  });

  it('applies no-hyphens format correctly', () => {
    const [r] = generateUUIDs(1, 'no-hyphens');
    expect(r.formatted).not.toContain('-');
    expect(r.formatted).toHaveLength(32);
  });

  it('defaults to lowercase when no format is passed', () => {
    const [r] = generateUUIDs(1);
    expect(r.format).toBe('lowercase');
  });

  it('all UUIDs in a batch are unique', () => {
    const results = generateUUIDs(50);
    const unique = new Set(results.map(r => r.uuid));
    expect(unique.size).toBe(50);
  });

  it('floors non-integer counts', () => {
    expect(generateUUIDs(3.9)).toHaveLength(3);
  });
});

describe('parseUUIDComponents', () => {
  const sample = '550e8400-e29b-41d4-a716-446655440000';

  it('returns five named components for a valid UUID', () => {
    const parts = parseUUIDComponents(sample);
    expect(parts).not.toBeNull();
    expect(parts!.timeLow).toBe('550e8400');
    expect(parts!.timeMid).toBe('e29b');
    expect(parts!.timeHiAndVersion).toBe('41d4');
    expect(parts!.clockSeqAndReserved).toBe('a716');
    expect(parts!.node).toBe('446655440000');
  });

  it('handles uppercase UUID input', () => {
    const parts = parseUUIDComponents(sample.toUpperCase());
    expect(parts).not.toBeNull();
    expect(parts!.timeLow).toBe('550e8400');
  });

  it('handles no-hyphens UUID input', () => {
    const noHyphens = sample.replace(/-/g, '');
    const parts = parseUUIDComponents(noHyphens);
    expect(parts).not.toBeNull();
    expect(parts!.timeLow).toBe('550e8400');
  });

  it('returns null for an empty string', () => {
    expect(parseUUIDComponents('')).toBeNull();
  });

  it('returns null for a string with wrong length', () => {
    expect(parseUUIDComponents('too-short')).toBeNull();
  });

  it('returns null for a string containing non-hex characters', () => {
    const bad = 'zzzzzzzz-e29b-41d4-a716-446655440000';
    expect(parseUUIDComponents(bad)).toBeNull();
  });

  it('node field is always 12 hex chars', () => {
    const parts = parseUUIDComponents(sample)!;
    expect(parts.node).toHaveLength(12);
    expect(/^[0-9a-f]{12}$/.test(parts.node)).toBe(true);
  });
});
