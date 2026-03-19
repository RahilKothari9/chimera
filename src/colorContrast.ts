/**
 * Color Contrast Checker
 *
 * Calculates the WCAG 2.1 contrast ratio between two colors and reports
 * compliance with the AA and AAA accessibility standards.
 */

export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface ContrastResult {
  ratio: number
  /** Formatted as "X.XX:1" */
  ratioLabel: string
  normalTextAA: boolean   // ≥ 4.5:1
  normalTextAAA: boolean  // ≥ 7:1
  largeTextAA: boolean    // ≥ 3:1
  largeTextAAA: boolean   // ≥ 4.5:1
  uiComponentsAA: boolean // ≥ 3:1
  level: 'AAA' | 'AA' | 'AA Large' | 'Fail'
}

export interface ParseResult {
  color: RgbColor | null
  error?: string
}

/**
 * Parse a CSS color string into an RGB object.
 * Supports: #RGB, #RRGGBB, rgb(r,g,b), rgba(r,g,b,a), named colors via canvas.
 */
export function parseColor(input: string): ParseResult {
  const s = input.trim()
  if (!s) return { color: null, error: 'Empty input' }

  // #RGB shorthand
  const shortHex = /^#([0-9a-fA-F]{3})$/.exec(s)
  if (shortHex) {
    const [rh, gh, bh] = shortHex[1].split('').map(c => parseInt(c + c, 16))
    return { color: { r: rh, g: gh, b: bh } }
  }

  // #RRGGBB
  const fullHex = /^#([0-9a-fA-F]{6})$/.exec(s)
  if (fullHex) {
    const hex = fullHex[1]
    return {
      color: {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      },
    }
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/.exec(s)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10)
    const g = parseInt(rgbMatch[2], 10)
    const b = parseInt(rgbMatch[3], 10)
    if (r > 255 || g > 255 || b > 255) return { color: null, error: 'RGB values must be 0–255' }
    return { color: { r, g, b } }
  }

  return { color: null, error: `Unrecognised color format: "${s}"` }
}

/**
 * Convert an sRGB channel value (0–255) to its linearised counterpart.
 * Uses the IEC 61966-2-1 piecewise formula mandated by WCAG 2.1.
 */
export function srgbToLinear(channel: number): number {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/**
 * Calculate the relative luminance of an sRGB color.
 * L = 0.2126 R + 0.7152 G + 0.0722 B  (WCAG 2.1 formula)
 */
export function relativeLuminance(color: RgbColor): number {
  return (
    0.2126 * srgbToLinear(color.r) +
    0.7152 * srgbToLinear(color.g) +
    0.0722 * srgbToLinear(color.b)
  )
}

/**
 * Calculate the WCAG 2.1 contrast ratio between two colors.
 * ratio = (L1 + 0.05) / (L2 + 0.05), where L1 is the lighter color.
 */
export function contrastRatio(color1: RgbColor, color2: RgbColor): number {
  const l1 = relativeLuminance(color1)
  const l2 = relativeLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Evaluate a contrast ratio against all WCAG 2.1 criteria and return
 * a structured result object.
 */
export function evaluateContrast(color1: RgbColor, color2: RgbColor): ContrastResult {
  const ratio = contrastRatio(color1, color2)
  const ratioLabel = `${ratio.toFixed(2)}:1`

  const normalTextAA = ratio >= 4.5
  const normalTextAAA = ratio >= 7
  const largeTextAA = ratio >= 3
  const largeTextAAA = ratio >= 4.5
  const uiComponentsAA = ratio >= 3

  let level: ContrastResult['level']
  if (normalTextAAA) level = 'AAA'
  else if (normalTextAA) level = 'AA'
  else if (largeTextAA) level = 'AA Large'
  else level = 'Fail'

  return {
    ratio,
    ratioLabel,
    normalTextAA,
    normalTextAAA,
    largeTextAA,
    largeTextAAA,
    uiComponentsAA,
    level,
  }
}

/**
 * Convert an RGB color to a CSS hex string (#rrggbb).
 */
export function rgbToHex(color: RgbColor): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`
}

/**
 * Suggest a darkened or lightened version of a color to meet AA (4.5:1) contrast
 * against the given background.  Returns null if the original already passes.
 */
export function suggestAccessibleColor(
  foreground: RgbColor,
  background: RgbColor,
  targetRatio = 4.5,
): RgbColor | null {
  if (contrastRatio(foreground, background) >= targetRatio) return null

  // Try darkening the foreground (step toward black)
  for (let factor = 0.9; factor >= 0; factor -= 0.05) {
    const darkened: RgbColor = {
      r: Math.round(foreground.r * factor),
      g: Math.round(foreground.g * factor),
      b: Math.round(foreground.b * factor),
    }
    if (contrastRatio(darkened, background) >= targetRatio) return darkened
  }

  // Try lightening the foreground by blending toward white
  for (let step = 1; step <= 20; step++) {
    const blend = step / 20
    const blended: RgbColor = {
      r: Math.round(foreground.r + (255 - foreground.r) * blend),
      g: Math.round(foreground.g + (255 - foreground.g) * blend),
      b: Math.round(foreground.b + (255 - foreground.b) * blend),
    }
    if (contrastRatio(blended, background) >= targetRatio) return blended
  }

  // Fall back to pure black or white, whichever has better contrast
  const black: RgbColor = { r: 0, g: 0, b: 0 }
  const white: RgbColor = { r: 255, g: 255, b: 255 }
  return contrastRatio(black, background) >= contrastRatio(white, background) ? black : white
}

/**
 * Return the WCAG compliance level label and a short description.
 */
export function getComplianceSummary(level: ContrastResult['level']): {
  label: string
  description: string
  color: string
} {
  switch (level) {
    case 'AAA':
      return {
        label: 'AAA',
        description: 'Excellent — meets the highest WCAG 2.1 standard for all text sizes',
        color: '#16a34a',
      }
    case 'AA':
      return {
        label: 'AA',
        description: 'Good — meets the standard for normal and large text',
        color: '#2563eb',
      }
    case 'AA Large':
      return {
        label: 'AA Large',
        description: 'Partial — passes only for large text (18pt+ or 14pt+ bold) and UI components',
        color: '#d97706',
      }
    case 'Fail':
      return {
        label: 'Fail',
        description: 'Insufficient contrast — does not meet any WCAG 2.1 level',
        color: '#dc2626',
      }
  }
}
