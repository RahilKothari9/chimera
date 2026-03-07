/**
 * Hash Generator
 *
 * Provides helpers to compute cryptographic hashes using the Web Crypto API.
 * Supports SHA-1, SHA-256, SHA-384, and SHA-512.
 */

export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export const HASH_ALGORITHMS: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export interface HashResult {
  algorithm: HashAlgorithm;
  /** Lowercase hexadecimal digest */
  hex: string;
  /** Standard Base64 encoded digest */
  base64: string;
  /** Digest length in bytes */
  byteLength: number;
}

/**
 * Compute a cryptographic hash of a UTF-8 string.
 *
 * @param input     The string to hash.
 * @param algorithm The hash algorithm to use.
 * @returns         A resolved `HashResult` containing hex and base64 forms.
 */
export async function hashString(input: string, algorithm: HashAlgorithm): Promise<HashResult> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashBytes = Array.from(new Uint8Array(hashBuffer));

  const hex = hashBytes.map(b => b.toString(16).padStart(2, '0')).join('');
  const base64 = btoa(hashBytes.map(b => String.fromCharCode(b)).join(''));

  return {
    algorithm,
    hex,
    base64,
    byteLength: hashBytes.length,
  };
}

/**
 * Compute all four supported hashes for a given input string in parallel.
 *
 * @param input The string to hash.
 * @returns     An array of `HashResult` objects, one per algorithm.
 */
export async function hashAllAlgorithms(input: string): Promise<HashResult[]> {
  return Promise.all(HASH_ALGORITHMS.map(alg => hashString(input, alg)));
}

/**
 * Format a digest byte length as a human-readable bit-width label.
 * E.g. 32 bytes → "256-bit"
 */
export function formatBitWidth(byteLength: number): string {
  return `${byteLength * 8}-bit`;
}
