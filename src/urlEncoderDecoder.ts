/**
 * URL Encoder / Decoder
 *
 * Provides helpers for encoding and decoding URL components and full URLs,
 * as well as parsing a URL string into its constituent parts.
 */

export type UrlMode = 'component' | 'full';

export interface DecodeResult {
  success: boolean;
  value: string;
  error?: string;
}

export interface ParsedUrl {
  valid: boolean;
  href: string;
  protocol: string;
  username: string;
  password: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  queryParams: Array<{ key: string; value: string }>;
  error?: string;
}

/**
 * Encode a URL component (encodes everything except letters, digits, and: _ . ! ~ * ' ( ) - ).
 */
export function encodeUrlComponent(input: string): string {
  return encodeURIComponent(input);
}

/**
 * Decode a URL component string. Returns a DecodeResult so callers can
 * distinguish invalid percent-sequences from valid decoded values.
 */
export function decodeUrlComponent(input: string): DecodeResult {
  try {
    return { success: true, value: decodeURIComponent(input) };
  } catch {
    return { success: false, value: input, error: 'Invalid percent-encoding in input' };
  }
}

/**
 * Encode a full URL (only encodes characters that are not allowed in a URI;
 * leaves :, /, ?, #, etc. intact).
 */
export function encodeUrl(input: string): string {
  return encodeURI(input);
}

/**
 * Decode a full encoded URL string.
 */
export function decodeUrl(input: string): DecodeResult {
  try {
    return { success: true, value: decodeURI(input) };
  } catch {
    return { success: false, value: input, error: 'Invalid percent-encoding in input' };
  }
}

/**
 * Auto-detect whether a string looks like it is already encoded
 * (contains percent-sequences) or is plain text.
 */
export function detectEncoding(input: string): 'encoded' | 'plain' {
  return /%[0-9A-Fa-f]{2}/.test(input) ? 'encoded' : 'plain';
}

/**
 * Parse a URL string into its parts using the built-in URL API.
 */
export function parseUrl(input: string): ParsedUrl {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      valid: false,
      href: '',
      protocol: '',
      username: '',
      password: '',
      hostname: '',
      port: '',
      pathname: '',
      search: '',
      hash: '',
      queryParams: [],
      error: 'Empty input',
    };
  }

  try {
    const url = new URL(trimmed);
    const queryParams: Array<{ key: string; value: string }> = [];
    url.searchParams.forEach((value, key) => {
      queryParams.push({ key, value });
    });

    return {
      valid: true,
      href: url.href,
      protocol: url.protocol,
      username: url.username,
      password: url.password,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      queryParams,
    };
  } catch {
    return {
      valid: false,
      href: trimmed,
      protocol: '',
      username: '',
      password: '',
      hostname: '',
      port: '',
      pathname: '',
      search: '',
      hash: '',
      queryParams: [],
      error: 'Not a valid URL (must include a protocol, e.g. https://)',
    };
  }
}

/**
 * Encode or decode a string based on mode and action.
 */
export function processUrl(
  input: string,
  mode: UrlMode,
  action: 'encode' | 'decode',
): DecodeResult {
  if (!input) return { success: true, value: '' };
  if (action === 'encode') {
    const encoded = mode === 'component' ? encodeUrlComponent(input) : encodeUrl(input);
    return { success: true, value: encoded };
  }
  return mode === 'component' ? decodeUrlComponent(input) : decodeUrl(input);
}
