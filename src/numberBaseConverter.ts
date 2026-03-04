/**
 * Number Base Converter
 *
 * Converts integers between binary (base 2), octal (base 8),
 * decimal (base 10), and hexadecimal (base 16).
 * Supports negative numbers and zero.
 */

export type NumberBase = 2 | 8 | 10 | 16

export interface BaseRepresentations {
  binary: string
  octal: string
  decimal: string
  hex: string
}

export interface ConversionResult {
  success: true
  value: bigint
  representations: BaseRepresentations
}

export interface ConversionError {
  success: false
  error: string
}

export type ConversionOutput = ConversionResult | ConversionError

const VALIDATORS: Record<NumberBase, RegExp> = {
  2:  /^-?[01]+$/,
  8:  /^-?[0-7]+$/,
  10: /^-?\d+$/,
  16: /^-?[0-9a-fA-F]+$/,
}

/**
 * Parse a string representation of an integer in the given base to a bigint.
 */
export function parseInteger(input: string, base: NumberBase): ConversionOutput {
  const trimmed = input.trim()
  if (trimmed === '' || trimmed === '-') {
    return { success: false, error: 'Input is empty' }
  }

  if (!VALIDATORS[base].test(trimmed)) {
    const baseNames: Record<NumberBase, string> = { 2: 'binary', 8: 'octal', 10: 'decimal', 16: 'hexadecimal' }
    return { success: false, error: `Invalid ${baseNames[base]} number: "${trimmed}"` }
  }

  const negative = trimmed.startsWith('-')
  const digits = negative ? trimmed.slice(1) : trimmed
  const value = negative ? -BigInt(`0x${toHexDigits(digits, base)}`) : BigInt(`0x${toHexDigits(digits, base)}`)

  return {
    success: true,
    value,
    representations: buildRepresentations(value),
  }
}

/**
 * Convert digit string (in a given base) to a hex digit string for BigInt parsing.
 */
function toHexDigits(digits: string, base: NumberBase): string {
  if (base === 16) return digits
  // Use Number for small values, BigInt arithmetic for large values
  // We convert via base-10 string then to hex
  const decimal = digitsToDecimalString(digits, base)
  return BigInt(decimal).toString(16)
}

/**
 * Convert digits in a given base to a decimal string.
 */
function digitsToDecimalString(digits: string, base: NumberBase): string {
  if (base === 10) return digits
  let result = BigInt(0)
  const b = BigInt(base)
  for (const ch of digits) {
    result = result * b + BigInt(parseInt(ch, base))
  }
  return result.toString()
}

/**
 * Build all four representations from a bigint value.
 */
export function buildRepresentations(value: bigint): BaseRepresentations {
  if (value === BigInt(0)) {
    return { binary: '0', octal: '0', decimal: '0', hex: '0' }
  }

  const negative = value < BigInt(0)
  const abs = negative ? -value : value

  const binary  = (negative ? '-' : '') + abs.toString(2)
  const octal   = (negative ? '-' : '') + abs.toString(8)
  const decimal = value.toString(10)
  const hex     = (negative ? '-' : '') + abs.toString(16).toUpperCase()

  return { binary, octal, decimal, hex }
}

/**
 * Convert a string in one base to all four representations.
 */
export function convertBase(input: string, fromBase: NumberBase): ConversionOutput {
  return parseInteger(input, fromBase)
}

/**
 * Get the bit-length category for a value (8, 16, 32, or 64 bit).
 * Returns null if the value exceeds 64-bit signed range.
 */
export function getBitLength(value: bigint): 8 | 16 | 32 | 64 | null {
  const abs = value < BigInt(0) ? -value - BigInt(1) : value
  if (abs < BigInt(128)) return 8
  if (abs < BigInt(32768)) return 16
  if (abs < BigInt(2147483648)) return 32
  if (abs < BigInt('9223372036854775808')) return 64
  return null
}
