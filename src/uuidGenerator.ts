/**
 * UUID Generator
 *
 * Provides helpers to generate and validate UUIDs using the browser's native
 * `crypto.randomUUID()` API (UUID v4 — fully random).
 */

export type UUIDFormat = 'lowercase' | 'uppercase' | 'no-hyphens';

export interface UUIDResult {
  /** Raw UUID in lowercase with hyphens: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx */
  uuid: string;
  /** UUID rendered in the requested display format */
  formatted: string;
  format: UUIDFormat;
}

/** RFC 4122 UUID v4 regex (case-insensitive). */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Generate a single UUID v4 string (lowercase with hyphens).
 * Delegates to `crypto.randomUUID()` which is available in all modern browsers.
 */
export function generateUUIDv4(): string {
  return crypto.randomUUID();
}

/**
 * Apply a display format to a raw UUID string.
 *
 * @param uuid   A raw UUID (lowercase with hyphens).
 * @param format The desired output format.
 */
export function formatUUID(uuid: string, format: UUIDFormat): string {
  switch (format) {
    case 'uppercase':
      return uuid.toUpperCase();
    case 'no-hyphens':
      return uuid.toLowerCase().replace(/-/g, '');
    case 'lowercase':
    default:
      return uuid.toLowerCase();
  }
}

/**
 * Return `true` if `value` is a well-formed UUID v4 string
 * (any casing, with or without surrounding whitespace).
 */
export function isValidUUID(value: string): boolean {
  return UUID_V4_REGEX.test(value.trim());
}

/**
 * Generate `count` UUID v4 values, each rendered with the given format.
 *
 * @param count  Number of UUIDs to generate (clamped to 1–100).
 * @param format Output format to apply.
 */
export function generateUUIDs(
  count: number,
  format: UUIDFormat = 'lowercase',
): UUIDResult[] {
  const safeCount = Math.max(1, Math.min(100, Math.floor(count)));
  return Array.from({ length: safeCount }, () => {
    const uuid = generateUUIDv4();
    return { uuid, formatted: formatUUID(uuid, format), format };
  });
}

/**
 * Break a UUID string into its five canonical fields.
 * Returns `null` when the input is not a 32-hex-digit value.
 */
export function parseUUIDComponents(uuid: string): {
  timeLow: string;
  timeMid: string;
  timeHiAndVersion: string;
  clockSeqAndReserved: string;
  node: string;
} | null {
  const hex = uuid.toLowerCase().replace(/-/g, '');
  if (hex.length !== 32 || !/^[0-9a-f]{32}$/.test(hex)) return null;
  return {
    timeLow: hex.slice(0, 8),
    timeMid: hex.slice(8, 12),
    timeHiAndVersion: hex.slice(12, 16),
    clockSeqAndReserved: hex.slice(16, 20),
    node: hex.slice(20, 32),
  };
}
