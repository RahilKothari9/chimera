/**
 * Password Generator
 *
 * Generates cryptographically random passwords with configurable character sets,
 * computes entropy in bits, and rates strength.
 */

export interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

export type PasswordStrength = 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong'

export interface PasswordResult {
  password: string
  entropy: number
  strength: PasswordStrength
  charsetSize: number
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

const AMBIGUOUS_CHARS = new Set(['0', 'O', 'l', '1', 'I'])

export const DEFAULT_OPTIONS: PasswordOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: false,
  excludeAmbiguous: false,
}

/**
 * Build the charset string from options.
 */
export function buildCharset(options: PasswordOptions): string {
  let charset = ''
  if (options.uppercase) charset += UPPERCASE
  if (options.lowercase) charset += LOWERCASE
  if (options.numbers) charset += NUMBERS
  if (options.symbols) charset += SYMBOLS
  if (options.excludeAmbiguous) {
    charset = charset.split('').filter(c => !AMBIGUOUS_CHARS.has(c)).join('')
  }
  return charset
}

/**
 * Calculate entropy in bits: log2(charsetSize ^ length) = length * log2(charsetSize).
 */
export function calculateEntropy(length: number, charsetSize: number): number {
  if (charsetSize <= 0 || length <= 0) return 0
  return length * Math.log2(charsetSize)
}

/**
 * Rate password strength based on entropy in bits.
 */
export function rateStrength(entropy: number): PasswordStrength {
  if (entropy < 28) return 'very-weak'
  if (entropy < 36) return 'weak'
  if (entropy < 60) return 'fair'
  if (entropy < 128) return 'strong'
  return 'very-strong'
}

/**
 * Generate a single password using the Web Crypto API (or Math.random fallback in test env).
 */
export function generatePassword(options: PasswordOptions): PasswordResult {
  const charset = buildCharset(options)
  if (charset.length === 0) {
    return { password: '', entropy: 0, strength: 'very-weak', charsetSize: 0 }
  }

  const { length } = options
  let password = ''

  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
    // Cryptographically secure
    const randomValues = new Uint32Array(length)
    globalThis.crypto.getRandomValues(randomValues)
    for (let i = 0; i < length; i++) {
      password += charset[randomValues[i] % charset.length]
    }
  } else {
    // Fallback (test environment)
    for (let i = 0; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }
  }

  const charsetSize = charset.length
  const entropy = calculateEntropy(length, charsetSize)
  const strength = rateStrength(entropy)

  return { password, entropy, strength, charsetSize }
}

/**
 * Generate multiple passwords at once.
 */
export function generateMultiple(options: PasswordOptions, count: number): PasswordResult[] {
  return Array.from({ length: count }, () => generatePassword(options))
}

/**
 * Human-readable label for strength.
 */
export function strengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 'very-weak': return 'Very Weak'
    case 'weak': return 'Weak'
    case 'fair': return 'Fair'
    case 'strong': return 'Strong'
    case 'very-strong': return 'Very Strong'
  }
}

/**
 * Strength level 0–4 (useful for progress bars).
 */
export function strengthLevel(strength: PasswordStrength): number {
  switch (strength) {
    case 'very-weak': return 0
    case 'weak': return 1
    case 'fair': return 2
    case 'strong': return 3
    case 'very-strong': return 4
  }
}
