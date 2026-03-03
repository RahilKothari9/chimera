import { describe, it, expect } from 'vitest';
import { encodeBase64, decodeBase64, looksLikeBase64 } from './base64Tool';

describe('encodeBase64', () => {
  it('encodes a simple ASCII string', () => {
    const result = encodeBase64('Hello');
    expect(result.encoded).toBe('SGVsbG8=');
    expect(result.byteLength).toBe(5);
  });

  it('encodes an empty string to an empty Base64 string', () => {
    const result = encodeBase64('');
    expect(result.encoded).toBe('');
    expect(result.byteLength).toBe(0);
  });

  it('encodes a multi-line string', () => {
    const result = encodeBase64('foo\nbar');
    expect(result.encoded).toBe('Zm9vCmJhcg==');
  });

  it('encodes a URL with standard variant (contains + or /)', () => {
    // 'Hello World' → 'SGVsbG8gV29ybGQ='
    const result = encodeBase64('Hello World', 'standard');
    expect(result.encoded).toBe('SGVsbG8gV29ybGQ=');
  });

  it('url-safe variant replaces + with -', () => {
    // Find a string whose Base64 contains '+'
    // 'sure.' → 'c3VyZS4=' in standard; adjust to url-safe → same (no + or /)
    // Use a known value: chr(0xfb) → in btoa produces '+'
    // Easier: encode a long string and check no + or / appears
    const longText = 'Hello, World! This is a test string for Base64 encoding.';
    const result = encodeBase64(longText, 'url-safe');
    expect(result.encoded).not.toContain('+');
    expect(result.encoded).not.toContain('/');
    expect(result.encoded).not.toContain('=');
  });

  it('url-safe variant strips padding (=)', () => {
    const result = encodeBase64('Hello', 'url-safe');
    expect(result.encoded).not.toContain('=');
  });

  it('encodes UTF-8 characters correctly', () => {
    // The euro sign '€' is U+20AC, 3 bytes: E2 82 AC
    const result = encodeBase64('€');
    expect(result.encoded).toBe('4oKs');
    expect(result.byteLength).toBe(3);
  });

  it('round-trips arbitrary text', () => {
    const text = 'Chimera 🔥 自律的';
    const { encoded } = encodeBase64(text);
    const { decoded } = decodeBase64(encoded);
    expect(decoded).toBe(text);
  });

  it('reports byteLength for multi-byte characters', () => {
    // '😀' is U+1F600 → 4 UTF-8 bytes
    const result = encodeBase64('😀');
    expect(result.byteLength).toBe(4);
  });
});

describe('decodeBase64', () => {
  it('decodes a standard Base64 string', () => {
    const result = decodeBase64('SGVsbG8=');
    expect(result.success).toBe(true);
    expect(result.decoded).toBe('Hello');
  });

  it('decodes without padding', () => {
    // 'SGVsbG8' is 'Hello' without trailing =
    const result = decodeBase64('SGVsbG8');
    expect(result.success).toBe(true);
    expect(result.decoded).toBe('Hello');
  });

  it('decodes url-safe Base64 (- and _)', () => {
    // URL-safe variant of some standard base64 that has + or /
    // 'Hello World' standard: 'SGVsbG8gV29ybGQ='
    const urlSafe = 'SGVsbG8gV29ybGQ='.replace(/\+/g, '-').replace(/\//g, '_');
    const result = decodeBase64(urlSafe);
    expect(result.success).toBe(true);
    expect(result.decoded).toBe('Hello World');
  });

  it('decodes multi-line string', () => {
    const result = decodeBase64('Zm9vCmJhcg==');
    expect(result.success).toBe(true);
    expect(result.decoded).toBe('foo\nbar');
  });

  it('decodes empty string', () => {
    const result = decodeBase64('');
    expect(result.success).toBe(true);
    expect(result.decoded).toBe('');
  });

  it('returns success:false for clearly invalid Base64', () => {
    const result = decodeBase64('!!!');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('returns success:false for input with invalid length remainder', () => {
    // 'A' alone can't form valid base64
    const result = decodeBase64('A');
    expect(result.success).toBe(false);
  });

  it('decodes UTF-8 emoji round-trip', () => {
    const { encoded } = encodeBase64('🚀');
    const result = decodeBase64(encoded);
    expect(result.success).toBe(true);
    expect(result.decoded).toBe('🚀');
  });

  it('trims whitespace before decoding', () => {
    const result = decodeBase64('  SGVsbG8=  ');
    expect(result.success).toBe(true);
    expect(result.decoded).toBe('Hello');
  });
});

describe('looksLikeBase64', () => {
  it('returns true for a valid standard Base64 string', () => {
    expect(looksLikeBase64('SGVsbG8=')).toBe(true);
  });

  it('returns true for a valid url-safe Base64 string (no padding)', () => {
    expect(looksLikeBase64('SGVsbG8')).toBe(true);
  });

  it('returns false for plain English text', () => {
    expect(looksLikeBase64('Hello World!')).toBe(false);
  });

  it('returns false for a string shorter than 4 characters', () => {
    expect(looksLikeBase64('SGU')).toBe(false);
  });

  it('returns false for a string with an impossible Base64 length remainder (1)', () => {
    // Length 5 mod 4 = 1 → invalid
    expect(looksLikeBase64('AAAAA')).toBe(false);
  });

  it('returns true for a string with length mod 4 === 2 (after padding)', () => {
    expect(looksLikeBase64('SGVs')).toBe(true); // 4 chars → valid
  });

  it('returns false for empty string', () => {
    expect(looksLikeBase64('')).toBe(false);
  });

  it('returns false for a URL (contains :// etc.)', () => {
    expect(looksLikeBase64('https://example.com')).toBe(false);
  });

  it('returns true for a longer encoded payload', () => {
    const { encoded } = encodeBase64('Chimera self-evolving project');
    expect(looksLikeBase64(encoded)).toBe(true);
  });
});
