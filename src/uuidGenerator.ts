export type UuidFormat = 'standard' | 'uppercase' | 'no-dashes' | 'braces';

export interface UuidGenerateOptions {
  count: number;
  format: UuidFormat;
}

export interface UuidGenerateResult {
  uuids: string[];
  count: number;
}

export function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function formatUuid(uuid: string, format: UuidFormat): string {
  switch (format) {
    case 'uppercase':
      return uuid.toUpperCase();
    case 'no-dashes':
      return uuid.replace(/-/g, '');
    case 'braces':
      return `{${uuid}}`;
    case 'standard':
    default:
      return uuid;
  }
}

export function generateUuids(options: UuidGenerateOptions): UuidGenerateResult {
  const count = Math.max(1, Math.min(100, options.count));
  const uuids = Array.from({ length: count }, () =>
    formatUuid(generateUuidV4(), options.format)
  );
  return { uuids, count };
}

export function isValidUuidV4(input: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    input.replace(/^\{/, '').replace(/\}$/, '')
  );
}
