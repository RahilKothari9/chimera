import { describe, it, expect } from 'vitest';
import { generateUuidV4, formatUuid, generateUuids, isValidUuidV4 } from './uuidGenerator';

describe('generateUuidV4', () => {
  it('returns a string matching the UUID v4 format', () => {
    const uuid = generateUuidV4();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it('generates unique UUIDs on each call', () => {
    const a = generateUuidV4();
    const b = generateUuidV4();
    expect(a).not.toBe(b);
  });
});

describe('formatUuid', () => {
  const sample = '550e8400-e29b-41d4-a716-446655440000';

  it('returns the uuid unchanged for standard format', () => {
    expect(formatUuid(sample, 'standard')).toBe(sample);
  });

  it('uppercases for uppercase format', () => {
    expect(formatUuid(sample, 'uppercase')).toBe(sample.toUpperCase());
  });

  it('removes dashes for no-dashes format', () => {
    expect(formatUuid(sample, 'no-dashes')).toBe('550e8400e29b41d4a716446655440000');
  });

  it('wraps in braces for braces format', () => {
    expect(formatUuid(sample, 'braces')).toBe(`{${sample}}`);
  });
});

describe('generateUuids', () => {
  it('generates the requested number of UUIDs', () => {
    const result = generateUuids({ count: 5, format: 'standard' });
    expect(result.count).toBe(5);
    expect(result.uuids).toHaveLength(5);
  });

  it('clamps count to minimum of 1', () => {
    const result = generateUuids({ count: 0, format: 'standard' });
    expect(result.count).toBe(1);
    expect(result.uuids).toHaveLength(1);
  });

  it('clamps count to maximum of 100', () => {
    const result = generateUuids({ count: 200, format: 'standard' });
    expect(result.count).toBe(100);
    expect(result.uuids).toHaveLength(100);
  });

  it('applies the specified format to all UUIDs', () => {
    const result = generateUuids({ count: 3, format: 'no-dashes' });
    result.uuids.forEach((uuid) => {
      expect(uuid).not.toContain('-');
      expect(uuid).toHaveLength(32);
    });
  });

  it('generates unique UUIDs in a batch', () => {
    const result = generateUuids({ count: 10, format: 'standard' });
    const unique = new Set(result.uuids);
    expect(unique.size).toBe(10);
  });

  it('generates valid v4 UUIDs in standard format', () => {
    const result = generateUuids({ count: 5, format: 'standard' });
    result.uuids.forEach((uuid) => {
      expect(isValidUuidV4(uuid)).toBe(true);
    });
  });
});

describe('isValidUuidV4', () => {
  it('returns true for a valid lowercase UUID v4', () => {
    const uuid = generateUuidV4();
    expect(isValidUuidV4(uuid)).toBe(true);
  });

  it('returns true for a valid uppercase UUID v4', () => {
    expect(isValidUuidV4('550E8400-E29B-4CD4-A716-446655440000')).toBe(true);
  });

  it('returns true for a UUID wrapped in braces', () => {
    expect(isValidUuidV4('{550e8400-e29b-4cd4-a716-446655440000}')).toBe(true);
  });

  it('returns false for a UUID with version digit != 4', () => {
    expect(isValidUuidV4('550e8400-e29b-11d4-a716-446655440000')).toBe(false);
  });

  it('returns false for a UUID with invalid variant digit', () => {
    expect(isValidUuidV4('550e8400-e29b-41d4-1234-446655440000')).toBe(false);
  });

  it('returns false for a plaintext string', () => {
    expect(isValidUuidV4('not-a-uuid')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidUuidV4('')).toBe(false);
  });

  it('returns false for UUID without dashes', () => {
    expect(isValidUuidV4('550e8400e29b41d4a716446655440000')).toBe(false);
  });
});
