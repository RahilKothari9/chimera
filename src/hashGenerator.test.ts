import { describe, it, expect } from 'vitest';
import { hashString, hashAllAlgorithms, formatBitWidth, HASH_ALGORITHMS } from './hashGenerator';

// Known SHA digests for the empty string and "hello"
const KNOWN = {
  'SHA-1': {
    '': 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
    hello: 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d',
  },
  'SHA-256': {
    '': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    hello: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
  },
  'SHA-384': {
    '': '38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b',
    hello: '59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f',
  },
  'SHA-512': {
    '': 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e',
    hello: '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043',
  },
} as const;

describe('hashString', () => {
  it.each(HASH_ALGORITHMS)('returns a %s HashResult with correct byteLength', async (alg) => {
    const result = await hashString('test', alg);
    expect(result.algorithm).toBe(alg);
    expect(typeof result.hex).toBe('string');
    expect(typeof result.base64).toBe('string');
    expect(result.hex.length).toBeGreaterThan(0);
    expect(result.base64.length).toBeGreaterThan(0);
  });

  it('SHA-1 empty string matches known digest', async () => {
    const r = await hashString('', 'SHA-1');
    expect(r.hex).toBe(KNOWN['SHA-1']['']);
    expect(r.byteLength).toBe(20);
  });

  it('SHA-1 "hello" matches known digest', async () => {
    const r = await hashString('hello', 'SHA-1');
    expect(r.hex).toBe(KNOWN['SHA-1']['hello']);
  });

  it('SHA-256 empty string matches known digest', async () => {
    const r = await hashString('', 'SHA-256');
    expect(r.hex).toBe(KNOWN['SHA-256']['']);
    expect(r.byteLength).toBe(32);
  });

  it('SHA-256 "hello" matches known digest', async () => {
    const r = await hashString('hello', 'SHA-256');
    expect(r.hex).toBe(KNOWN['SHA-256']['hello']);
  });

  it('SHA-384 empty string matches known digest', async () => {
    const r = await hashString('', 'SHA-384');
    // SHA-384 produces 48 bytes
    expect(r.byteLength).toBe(48);
    expect(r.hex).toBe(KNOWN['SHA-384']['']);
  });

  it('SHA-384 "hello" matches known digest', async () => {
    const r = await hashString('hello', 'SHA-384');
    expect(r.hex).toBe(KNOWN['SHA-384']['hello']);
  });

  it('SHA-512 empty string matches known digest', async () => {
    const r = await hashString('', 'SHA-512');
    expect(r.byteLength).toBe(64);
    expect(r.hex).toBe(KNOWN['SHA-512']['']);
  });

  it('SHA-512 "hello" matches known digest', async () => {
    const r = await hashString('hello', 'SHA-512');
    expect(r.hex).toBe(KNOWN['SHA-512']['hello']);
  });

  it('hex output is all lowercase hex characters', async () => {
    const r = await hashString('Chimera', 'SHA-256');
    expect(r.hex).toMatch(/^[0-9a-f]+$/);
  });

  it('base64 output decodes back to the same bytes as hex', async () => {
    const r = await hashString('round-trip', 'SHA-256');
    const decoded = atob(r.base64);
    const decodedHex = Array.from(decoded).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    expect(decodedHex).toBe(r.hex);
  });

  it('produces different hashes for different inputs', async () => {
    const r1 = await hashString('abc', 'SHA-256');
    const r2 = await hashString('xyz', 'SHA-256');
    expect(r1.hex).not.toBe(r2.hex);
  });

  it('same input always produces the same hash (deterministic)', async () => {
    const r1 = await hashString('deterministic', 'SHA-256');
    const r2 = await hashString('deterministic', 'SHA-256');
    expect(r1.hex).toBe(r2.hex);
  });

  it('handles multi-byte / emoji input correctly', async () => {
    const r = await hashString('🧬 Chimera', 'SHA-256');
    expect(r.hex).toHaveLength(64); // SHA-256 is always 256 bits = 32 bytes = 64 hex chars
  });

  it('SHA-256 hex length is always 64 characters', async () => {
    for (const input of ['', 'a', 'hello world', '0'.repeat(1000)]) {
      const r = await hashString(input, 'SHA-256');
      expect(r.hex).toHaveLength(64);
    }
  });

  it('SHA-512 hex length is always 128 characters', async () => {
    const r = await hashString('length check', 'SHA-512');
    expect(r.hex).toHaveLength(128);
  });
});

describe('hashAllAlgorithms', () => {
  it('returns results for all 4 algorithms', async () => {
    const results = await hashAllAlgorithms('test');
    expect(results).toHaveLength(4);
    const algs = results.map(r => r.algorithm);
    expect(algs).toContain('SHA-1');
    expect(algs).toContain('SHA-256');
    expect(algs).toContain('SHA-384');
    expect(algs).toContain('SHA-512');
  });

  it('returns consistent results matching hashString individually', async () => {
    const all = await hashAllAlgorithms('chimera');
    for (const result of all) {
      const single = await hashString('chimera', result.algorithm);
      expect(result.hex).toBe(single.hex);
    }
  });

  it('works with empty string', async () => {
    const results = await hashAllAlgorithms('');
    expect(results).toHaveLength(4);
    expect(results[0].hex).toBe(KNOWN['SHA-1']['']);
    expect(results[1].hex).toBe(KNOWN['SHA-256']['']);
  });
});

describe('formatBitWidth', () => {
  it('formats 20 bytes as 160-bit', () => {
    expect(formatBitWidth(20)).toBe('160-bit');
  });

  it('formats 32 bytes as 256-bit', () => {
    expect(formatBitWidth(32)).toBe('256-bit');
  });

  it('formats 48 bytes as 384-bit', () => {
    expect(formatBitWidth(48)).toBe('384-bit');
  });

  it('formats 64 bytes as 512-bit', () => {
    expect(formatBitWidth(64)).toBe('512-bit');
  });

  it('formats 0 bytes as 0-bit', () => {
    expect(formatBitWidth(0)).toBe('0-bit');
  });
});
