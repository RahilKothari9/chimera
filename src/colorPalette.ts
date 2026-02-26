/**
 * Color Palette Generator
 * Converts colors between formats and generates harmony-based palettes
 */

export type PaletteType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'tetradic'
  | 'monochromatic'

export interface RGB {
  r: number
  g: number
  b: number
}

export interface HSL {
  h: number // 0–360
  s: number // 0–100
  l: number // 0–100
}

export interface ColorSwatch {
  hex: string
  rgb: RGB
  hsl: HSL
  label: string
}

export interface PaletteResult {
  seed: ColorSwatch
  swatches: ColorSwatch[]
  type: PaletteType
}

// ---------------------------------------------------------------------------
// Conversion utilities
// ---------------------------------------------------------------------------

/**
 * Parses a 3- or 6-digit hex string (with or without leading '#') into RGB.
 * Returns null if the string is not a valid hex colour.
 */
export function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace(/^#/, '').trim()
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

/** Converts RGB (0–255) to a lowercase hex string like '#a1b2c3'. */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

/** Converts RGB (0–255) to HSL (h:0–360, s:0–100, l:0–100). */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / delta + 2) / 6
        break
      default:
        h = ((r - g) / delta + 4) / 6
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/** Converts HSL (h:0–360, s:0–100, l:0–100) to RGB (0–255). */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360
  const s = hsl.s / 100
  const l = hsl.l / 100
  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v }
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const hue2rgb = (t: number) => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }
  return {
    r: Math.round(hue2rgb(h + 1 / 3) * 255),
    g: Math.round(hue2rgb(h) * 255),
    b: Math.round(hue2rgb(h - 1 / 3) * 255),
  }
}

/** Converts a hex colour to HSL. Returns null for invalid input. */
export function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex)
  return rgb ? rgbToHsl(rgb) : null
}

/** Constructs a swatch from a hex string (with label). */
function buildSwatch(hex: string, label: string): ColorSwatch {
  const rgb = hexToRgb(hex)!
  const hsl = rgbToHsl(rgb)
  return { hex, rgb, hsl, label }
}

/** Creates a swatch by rotating the hue of a seed HSL value. */
function swatchFromHue(seedHsl: HSL, hueDelta: number, label: string): ColorSwatch {
  const hsl: HSL = {
    h: (seedHsl.h + hueDelta + 360) % 360,
    s: seedHsl.s,
    l: seedHsl.l,
  }
  const rgb = hslToRgb(hsl)
  const hex = rgbToHex(rgb)
  return { hex, rgb, hsl, label }
}

// ---------------------------------------------------------------------------
// Palette generation
// ---------------------------------------------------------------------------

/**
 * Generates a colour palette from a seed hex colour using the requested
 * harmony type.
 */
export function generatePalette(seedHex: string, type: PaletteType): PaletteResult | null {
  const rgb = hexToRgb(seedHex)
  if (!rgb) return null
  const hsl = rgbToHsl(rgb)
  const seed = buildSwatch(seedHex.startsWith('#') ? seedHex : `#${seedHex}`, 'Seed')

  let swatches: ColorSwatch[]

  switch (type) {
    case 'complementary':
      swatches = [swatchFromHue(hsl, 180, 'Complement')]
      break

    case 'analogous':
      swatches = [
        swatchFromHue(hsl, -30, 'Analogous −30°'),
        swatchFromHue(hsl, 30, 'Analogous +30°'),
      ]
      break

    case 'triadic':
      swatches = [
        swatchFromHue(hsl, 120, 'Triadic +120°'),
        swatchFromHue(hsl, 240, 'Triadic +240°'),
      ]
      break

    case 'split-complementary':
      swatches = [
        swatchFromHue(hsl, 150, 'Split +150°'),
        swatchFromHue(hsl, 210, 'Split +210°'),
      ]
      break

    case 'tetradic':
      swatches = [
        swatchFromHue(hsl, 90, 'Tetradic +90°'),
        swatchFromHue(hsl, 180, 'Tetradic +180°'),
        swatchFromHue(hsl, 270, 'Tetradic +270°'),
      ]
      break

    case 'monochromatic': {
      const steps: Array<[number, string]> = [
        [hsl.l - 30, 'Darker'],
        [hsl.l - 15, 'Dark'],
        [hsl.l + 15, 'Light'],
        [hsl.l + 30, 'Lighter'],
      ]
      swatches = steps.map(([lightness, label]) => {
        const adjHsl: HSL = { h: hsl.h, s: hsl.s, l: Math.max(5, Math.min(95, lightness)) }
        const adjRgb = hslToRgb(adjHsl)
        return { hex: rgbToHex(adjRgb), rgb: adjRgb, hsl: adjHsl, label }
      })
      break
    }

    default:
      return null
  }

  return { seed, swatches, type }
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/**
 * Calculates the relative luminance of a hex colour (WCAG formula).
 * Returns a value between 0 (black) and 1 (white).
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const toLinear = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b)
}

/**
 * Returns '#000000' or '#ffffff' whichever has better contrast against the
 * given background colour.
 */
export function getContrastColor(hex: string): string {
  return getLuminance(hex) > 0.179 ? '#000000' : '#ffffff'
}

/**
 * Generates a random hex colour string like '#a1b2c3'.
 */
export function generateRandomColor(): string {
  const rand = () => Math.floor(Math.random() * 256)
  return rgbToHex({ r: rand(), g: rand(), b: rand() })
}

/** Returns a human-readable label for HSL-based colour families. */
export function getColorName(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return 'Unknown'
  const hsl = rgbToHsl(rgb)
  const { h, s, l } = hsl

  if (l <= 10) return 'Near Black'
  if (l >= 90) return 'Near White'
  if (s < 12) {
    if (l < 35) return 'Dark Gray'
    if (l < 65) return 'Gray'
    return 'Light Gray'
  }

  if (h < 15 || h >= 345) return 'Red'
  if (h < 40) return 'Orange'
  if (h < 65) return 'Yellow'
  if (h < 150) return 'Green'
  if (h < 195) return 'Cyan'
  if (h < 255) return 'Blue'
  if (h < 285) return 'Indigo'
  if (h < 320) return 'Purple'
  if (h < 345) return 'Pink'
  return 'Red'
}

/** Returns all palette type options with display labels. */
export const PALETTE_TYPES: Array<{ value: PaletteType; label: string; description: string }> = [
  {
    value: 'complementary',
    label: 'Complementary',
    description: 'Opposite colour on the wheel — high contrast',
  },
  {
    value: 'analogous',
    label: 'Analogous',
    description: 'Adjacent colours — harmonious and cohesive',
  },
  {
    value: 'triadic',
    label: 'Triadic',
    description: 'Three evenly-spaced colours — vibrant balance',
  },
  {
    value: 'split-complementary',
    label: 'Split-Complementary',
    description: 'Complement with two neighbours — softer contrast',
  },
  {
    value: 'tetradic',
    label: 'Tetradic',
    description: 'Four evenly-spaced colours — rich variety',
  },
  {
    value: 'monochromatic',
    label: 'Monochromatic',
    description: 'Tints and shades of one hue — elegant simplicity',
  },
]
