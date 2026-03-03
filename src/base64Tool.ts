/**
 * Base64 Encoder / Decoder
 *
 * Provides encode and decode helpers for standard Base64, URL-safe Base64,
 * and a lightweight "detect" heuristic so callers can offer auto-mode.
 */

export type Base64Variant = 'standard' | 'url-safe';

export interface Base64EncodeResult {
  encoded: string;
  byteLength: number;
}

export interface Base64DecodeResult {
  decoded: string;
  success: boolean;
  error?: string;
}

/**
 * Encode a UTF-8 string to Base64.
 *
 * @param input    Plain text to encode.
 * @param variant  'standard' (uses + and /) or 'url-safe' (uses - and _).
 */
export function encodeBase64(input: string, variant: Base64Variant = 'standard'): Base64EncodeResult {
  // Encode as UTF-8 bytes → binary string → btoa
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  let encoded = btoa(binary);

  if (variant === 'url-safe') {
    encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  return { encoded, byteLength: bytes.length };
}

/**
 * Decode a Base64 string back to UTF-8 text.
 *
 * Accepts both standard (+/) and URL-safe (-_) alphabets.
 * Returns a `success: false` result (instead of throwing) on invalid input.
 */
export function decodeBase64(input: string): Base64DecodeResult {
  try {
    // Normalise URL-safe chars → standard, and restore padding
    let normalised = input.trim().replace(/-/g, '+').replace(/_/g, '/');
    const padNeeded = normalised.length % 4;
    if (padNeeded === 2) normalised += '==';
    else if (padNeeded === 3) normalised += '=';

    const binary = atob(normalised);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { decoded, success: true };
  } catch (err) {
    return {
      decoded: '',
      success: false,
      error: err instanceof Error ? err.message : 'Invalid Base64 input',
    };
  }
}

/**
 * Heuristic: does the string look like a Base64-encoded value?
 *
 * Returns `true` when:
 * - Every character is in the standard or URL-safe Base64 alphabet (plus =)
 * - The length is a multiple of 4 (or the URL-safe variant without padding)
 * - The string is at least 4 characters long
 */
export function looksLikeBase64(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length < 4) return false;
  // Allow standard (+/) and URL-safe (-_) alphabets plus padding
  if (!/^[A-Za-z0-9+/\-_=]+$/.test(trimmed)) return false;
  // Normalise to standard and check length
  let normalised = trimmed.replace(/-/g, '+').replace(/_/g, '/');
  const padNeeded = normalised.length % 4;
  if (padNeeded === 2) normalised += '==';
  else if (padNeeded === 3) normalised += '=';
  else if (padNeeded === 1) return false; // impossible valid base64 length

  return normalised.length % 4 === 0;
}
