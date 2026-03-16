/**
 * Color Converter
 *
 * Converts between common color formats: HEX, RGB, HSL, and HSV.
 * All public functions accept and return plain value objects so that
 * the logic is easy to test in isolation from the DOM.
 */

export interface RGBColor {
  r: number // 0–255
  g: number // 0–255
  b: number // 0–255
}

export interface HSLColor {
  h: number // 0–360
  s: number // 0–100
  l: number // 0–100
}

export interface HSVColor {
  h: number // 0–360
  s: number // 0–100
  v: number // 0–100
}

export interface ColorFormats {
  hex: string   // e.g. "#1a2b3c"
  rgb: RGBColor
  hsl: HSLColor
  hsv: HSVColor
  /** CSS-ready strings for each format */
  css: {
    hex: string
    rgb: string
    hsl: string
    hsv: string
  }
}

// ─── HEX helpers ──────────────────────────────────────────────────────────────

/**
 * Normalise a hex string to the form "#rrggbb" (lower-case, 6 digits).
 * Accepts 3-digit shorthand (#abc → #aabbcc) and optional leading #.
 * Returns null when the input cannot be parsed.
 */
export function normalizeHex(hex: string): string | null {
  const trimmed = hex.trim().replace(/^#/, '')
  if (trimmed.length === 3 && /^[0-9a-fA-F]{3}$/.test(trimmed)) {
    const expanded = trimmed
      .split('')
      .map((c) => c + c)
      .join('')
    return '#' + expanded.toLowerCase()
  }
  if (trimmed.length === 6 && /^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return '#' + trimmed.toLowerCase()
  }
  return null
}

// ─── Conversion functions ──────────────────────────────────────────────────────

/** Convert a normalised "#rrggbb" hex string to an RGB object. */
export function hexToRgb(hex: string): RGBColor | null {
  const norm = normalizeHex(hex)
  if (!norm) return null
  const n = parseInt(norm.slice(1), 16)
  return {
    r: (n >> 16) & 0xff,
    g: (n >> 8) & 0xff,
    b: n & 0xff,
  }
}

/** Convert RGB values to a "#rrggbb" hex string. */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')
  return '#' + toHex(r) + toHex(g) + toHex(b)
}

/** Convert RGB (0–255 each) to HSL (h: 0–360, s: 0–100, l: 0–100). */
export function rgbToHsl(r: number, g: number, b: number): HSLColor {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))
    if (max === rn) {
      h = ((gn - bn) / delta) % 6
    } else if (max === gn) {
      h = (bn - rn) / delta + 2
    } else {
      h = (rn - gn) / delta + 4
    }
    h = h * 60
    if (h < 0) h += 360
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/** Convert HSL (h: 0–360, s: 0–100, l: 0–100) to RGB (0–255 each). */
export function hslToRgb(h: number, s: number, l: number): RGBColor {
  const sn = s / 100
  const ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2
  let rp = 0, gp = 0, bp = 0

  if (h < 60)       { rp = c; gp = x; bp = 0 }
  else if (h < 120) { rp = x; gp = c; bp = 0 }
  else if (h < 180) { rp = 0; gp = c; bp = x }
  else if (h < 240) { rp = 0; gp = x; bp = c }
  else if (h < 300) { rp = x; gp = 0; bp = c }
  else              { rp = c; gp = 0; bp = x }

  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  }
}

/** Convert RGB (0–255 each) to HSV (h: 0–360, s: 0–100, v: 0–100). */
export function rgbToHsv(r: number, g: number, b: number): HSVColor {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  let h = 0
  const s = max === 0 ? 0 : delta / max
  const v = max

  if (delta !== 0) {
    if (max === rn) {
      h = ((gn - bn) / delta) % 6
    } else if (max === gn) {
      h = (bn - rn) / delta + 2
    } else {
      h = (rn - gn) / delta + 4
    }
    h = h * 60
    if (h < 0) h += 360
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  }
}

/** Convert HSV (h: 0–360, s: 0–100, v: 0–100) to RGB (0–255 each). */
export function hsvToRgb(h: number, s: number, v: number): RGBColor {
  const sn = s / 100
  const vn = v / 100
  const c = vn * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = vn - c
  let rp = 0, gp = 0, bp = 0

  if (h < 60)       { rp = c; gp = x; bp = 0 }
  else if (h < 120) { rp = x; gp = c; bp = 0 }
  else if (h < 180) { rp = 0; gp = c; bp = x }
  else if (h < 240) { rp = 0; gp = x; bp = c }
  else if (h < 300) { rp = x; gp = 0; bp = c }
  else              { rp = c; gp = 0; bp = x }

  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  }
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

/**
 * Parse a CSS-like color string into an RGBColor.
 * Supported formats:
 *   "#rgb" | "#rrggbb"
 *   "rgb(r, g, b)"
 *   "hsl(h, s%, l%)"
 *   "hsv(h, s%, v%)"
 */
export function parseColorInput(input: string): RGBColor | null {
  const s = input.trim()

  // HEX
  if (s.startsWith('#') || /^[0-9a-fA-F]{3,6}$/.test(s)) {
    const candidate = s.startsWith('#') ? s : '#' + s
    return hexToRgb(candidate)
  }

  // rgb(r, g, b)
  const rgbMatch = s.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i)
  if (rgbMatch) {
    return {
      r: clamp(parseInt(rgbMatch[1]), 0, 255),
      g: clamp(parseInt(rgbMatch[2]), 0, 255),
      b: clamp(parseInt(rgbMatch[3]), 0, 255),
    }
  }

  // hsl(h, s%, l%)
  const hslMatch = s.match(/^hsl\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/i)
  if (hslMatch) {
    return hslToRgb(
      parseInt(hslMatch[1]),
      parseInt(hslMatch[2]),
      parseInt(hslMatch[3]),
    )
  }

  // hsv(h, s%, v%)
  const hsvMatch = s.match(/^hsv\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/i)
  if (hsvMatch) {
    return hsvToRgb(
      parseInt(hsvMatch[1]),
      parseInt(hsvMatch[2]),
      parseInt(hsvMatch[3]),
    )
  }

  return null
}

/**
 * Convert any supported color string into all four color formats at once.
 * Returns null when the input cannot be parsed.
 */
export function convertColor(input: string): ColorFormats | null {
  const rgb = parseColorInput(input)
  if (!rgb) return null

  const { r, g, b } = rgb
  const hex = rgbToHex(r, g, b)
  const hsl = rgbToHsl(r, g, b)
  const hsv = rgbToHsv(r, g, b)

  return {
    hex,
    rgb,
    hsl,
    hsv,
    css: {
      hex,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    },
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
