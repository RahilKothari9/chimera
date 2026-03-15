import { describe, it, expect } from 'vitest';
import {
  encodeUrlComponent,
  decodeUrlComponent,
  encodeUrl,
  decodeUrl,
  detectEncoding,
  parseUrl,
  processUrl,
} from './urlEncoderDecoder';

describe('encodeUrlComponent', () => {
  it('encodes spaces as %20', () => {
    expect(encodeUrlComponent('hello world')).toBe('hello%20world');
  });

  it('encodes special characters', () => {
    expect(encodeUrlComponent('a=1&b=2')).toBe('a%3D1%26b%3D2');
  });

  it('encodes slashes', () => {
    expect(encodeUrlComponent('path/to/resource')).toBe('path%2Fto%2Fresource');
  });

  it('leaves unreserved characters unchanged', () => {
    expect(encodeUrlComponent('abc123-_.!~*\'()')).toBe('abc123-_.!~*\'()');
  });

  it('encodes a hash character', () => {
    expect(encodeUrlComponent('foo#bar')).toBe('foo%23bar');
  });

  it('handles empty string', () => {
    expect(encodeUrlComponent('')).toBe('');
  });
});

describe('decodeUrlComponent', () => {
  it('decodes %20 as space', () => {
    const result = decodeUrlComponent('hello%20world');
    expect(result.success).toBe(true);
    expect(result.value).toBe('hello world');
  });

  it('decodes encoded special characters', () => {
    const result = decodeUrlComponent('a%3D1%26b%3D2');
    expect(result.success).toBe(true);
    expect(result.value).toBe('a=1&b=2');
  });

  it('returns failure for malformed percent-encoding', () => {
    const result = decodeUrlComponent('%GG');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('returns the original value on failure', () => {
    const result = decodeUrlComponent('%GG');
    expect(result.value).toBe('%GG');
  });

  it('handles already-decoded strings', () => {
    const result = decodeUrlComponent('hello');
    expect(result.success).toBe(true);
    expect(result.value).toBe('hello');
  });
});

describe('encodeUrl', () => {
  it('preserves protocol and slashes', () => {
    const result = encodeUrl('https://example.com/path');
    expect(result).toContain('https://');
    expect(result).toContain('/path');
  });

  it('encodes spaces', () => {
    expect(encodeUrl('https://example.com/hello world')).toBe(
      'https://example.com/hello%20world',
    );
  });

  it('does not encode query separators', () => {
    const result = encodeUrl('https://example.com/?a=1&b=2');
    expect(result).toContain('?a=1&b=2');
  });
});

describe('decodeUrl', () => {
  it('decodes a percent-encoded URL', () => {
    const result = decodeUrl('https://example.com/hello%20world');
    expect(result.success).toBe(true);
    expect(result.value).toBe('https://example.com/hello world');
  });

  it('returns failure for malformed encoding', () => {
    const result = decodeUrl('%GG');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('detectEncoding', () => {
  it('detects encoded strings', () => {
    expect(detectEncoding('hello%20world')).toBe('encoded');
  });

  it('detects plain strings', () => {
    expect(detectEncoding('hello world')).toBe('plain');
  });

  it('detects encoded uppercase hex', () => {
    expect(detectEncoding('%3D')).toBe('encoded');
  });

  it('treats a lone percent sign as plain', () => {
    expect(detectEncoding('50% off')).toBe('plain');
  });
});

describe('parseUrl', () => {
  it('parses a full URL correctly', () => {
    const result = parseUrl('https://user:pass@example.com:8080/path?a=1&b=2#hash');
    expect(result.valid).toBe(true);
    expect(result.protocol).toBe('https:');
    expect(result.username).toBe('user');
    expect(result.password).toBe('pass');
    expect(result.hostname).toBe('example.com');
    expect(result.port).toBe('8080');
    expect(result.pathname).toBe('/path');
    expect(result.search).toBe('?a=1&b=2');
    expect(result.hash).toBe('#hash');
  });

  it('parses query parameters into key-value pairs', () => {
    const result = parseUrl('https://example.com/?foo=bar&baz=qux');
    expect(result.valid).toBe(true);
    expect(result.queryParams).toHaveLength(2);
    expect(result.queryParams[0]).toEqual({ key: 'foo', value: 'bar' });
    expect(result.queryParams[1]).toEqual({ key: 'baz', value: 'qux' });
  });

  it('returns valid=false for a plain string without protocol', () => {
    const result = parseUrl('example.com/path');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('returns valid=false for empty input', () => {
    const result = parseUrl('');
    expect(result.valid).toBe(false);
  });

  it('handles URLs with no query string', () => {
    const result = parseUrl('https://example.com/');
    expect(result.valid).toBe(true);
    expect(result.queryParams).toHaveLength(0);
    expect(result.search).toBe('');
  });

  it('handles URLs with no port', () => {
    const result = parseUrl('https://example.com/');
    expect(result.port).toBe('');
  });
});

describe('processUrl', () => {
  it('encodes a component', () => {
    const result = processUrl('hello world', 'component', 'encode');
    expect(result.success).toBe(true);
    expect(result.value).toBe('hello%20world');
  });

  it('decodes a component', () => {
    const result = processUrl('hello%20world', 'component', 'decode');
    expect(result.success).toBe(true);
    expect(result.value).toBe('hello world');
  });

  it('encodes a full URL', () => {
    const result = processUrl('https://example.com/hello world', 'full', 'encode');
    expect(result.success).toBe(true);
    expect(result.value).toBe('https://example.com/hello%20world');
  });

  it('decodes a full URL', () => {
    const result = processUrl('https://example.com/hello%20world', 'full', 'decode');
    expect(result.success).toBe(true);
    expect(result.value).toBe('https://example.com/hello world');
  });

  it('returns empty string for empty input', () => {
    const result = processUrl('', 'component', 'encode');
    expect(result.success).toBe(true);
    expect(result.value).toBe('');
  });

  it('returns error for invalid decode', () => {
    const result = processUrl('%GG', 'component', 'decode');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
