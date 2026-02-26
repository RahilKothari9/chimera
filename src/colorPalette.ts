/**
 * Color Palette Generator
 * Generates harmonious color palettes and calculates WCAG accessibility contrast ratios
 */

export interface RGBColor {
  r: number
  g: number
  b: number
}

export interface HSLColor {
  h: number // 0-360
  s: number // 0-100
  l: number // 0-100
}

export interface ColorInfo {
  hex: string
  rgb: RGBColor
  hsl: HSLColor
}

export interface ContrastResult {
  ratio: number
  ratioText: string
  aaLarge: boolean  // >= 3:1
  aa: boolean       // >= 4.5:1
  aaaLarge: boolean // >= 4.5:1
  aaa: boolean      // >= 7:1
}

export type PaletteType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary'
  | 'monochromatic'

export interface ColorPalette {
  type: PaletteType
  baseColor: ColorInfo
  colors: ColorInfo[]
}

/**
 * Parses a hex color string (with or without #) and returns an RGBColor, or null if invalid
 */
export function hexToRgb(hex: string): RGBColor | null {
  const sanitized = hex.replace('#', '')
  if (sanitized.length === 3) {
    const r = parseInt(sanitized[0] + sanitized[0], 16)
    const g = parseInt(sanitized[1] + sanitized[1], 16)
    const b = parseInt(sanitized[2] + sanitized[2], 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null
    return { r, g, b }
  }
  if (sanitized.length === 6) {
    const r = parseInt(sanitized.slice(0, 2), 16)
    const g = parseInt(sanitized.slice(2, 4), 16)
    const b = parseInt(sanitized.slice(4, 6), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null
    return { r, g, b }
  }
  return null
}

/**
 * Converts an RGBColor to a lowercase hex string (e.g. "#ff0000")
 */
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

/**
 * Converts an RGBColor to HSLColor
 */
export function rgbToHsl(rgb: RGBColor): HSLColor {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) }
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * Converts an HSLColor to RGBColor
 */
export function hslToRgb(hsl: HSLColor): RGBColor {
  const h = hsl.h / 360
  const s = hsl.s / 100
  const l = hsl.l / 100

  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v }
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  }
}

/**
 * Creates a ColorInfo from a hex string; returns null if the hex is invalid
 */
export function colorFromHex(hex: string): ColorInfo | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const hsl = rgbToHsl(rgb)
  return { hex: rgbToHex(rgb), rgb, hsl }
}

/**
 * Creates a ColorInfo from HSL values, normalizing hue to [0, 360)
 */
export function colorFromHsl(h: number, s: number, l: number): ColorInfo {
  const normH = ((h % 360) + 360) % 360
  const normS = Math.max(0, Math.min(100, s))
  const normL = Math.max(0, Math.min(100, l))
  const hsl: HSLColor = { h: normH, s: normS, l: normL }
  const rgb = hslToRgb(hsl)
  return { hex: rgbToHex(rgb), rgb, hsl }
}

/**
 * Calculates the WCAG 2.1 relative luminance of an RGB color
 */
export function relativeLuminance(rgb: RGBColor): number {
  const linearize = (c: number) => {
    const sRGB = c / 255
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * linearize(rgb.r) + 0.7152 * linearize(rgb.g) + 0.0722 * linearize(rgb.b)
}

/**
 * Calculates the WCAG 2.1 contrast ratio between two RGB colors
 */
export function contrastRatio(colorA: RGBColor, colorB: RGBColor): number {
  const lumA = relativeLuminance(colorA)
  const lumB = relativeLuminance(colorB)
  const lighter = Math.max(lumA, lumB)
  const darker = Math.min(lumA, lumB)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Returns WCAG 2.1 compliance information for a foreground/background color pair
 */
export function checkContrast(colorA: ColorInfo, colorB: ColorInfo): ContrastResult {
  const ratio = contrastRatio(colorA.rgb, colorB.rgb)
  return {
    ratio,
    ratioText: ratio.toFixed(2) + ':1',
    aaLarge: ratio >= 3,
    aa: ratio >= 4.5,
    aaaLarge: ratio >= 4.5,
    aaa: ratio >= 7,
  }
}

/**
 * Generates a color palette from a base hex color using the specified harmony rule
 */
export function generatePalette(baseHex: string, type: PaletteType): ColorPalette | null {
  const base = colorFromHex(baseHex)
  if (!base) return null

  const { h, s, l } = base.hsl
  let colors: ColorInfo[]

  switch (type) {
    case 'complementary':
      colors = [base, colorFromHsl(h + 180, s, l)]
      break
    case 'analogous':
      colors = [colorFromHsl(h - 30, s, l), base, colorFromHsl(h + 30, s, l)]
      break
    case 'triadic':
      colors = [base, colorFromHsl(h + 120, s, l), colorFromHsl(h + 240, s, l)]
      break
    case 'tetradic':
      colors = [
        base,
        colorFromHsl(h + 90, s, l),
        colorFromHsl(h + 180, s, l),
        colorFromHsl(h + 270, s, l),
      ]
      break
    case 'split-complementary':
      colors = [base, colorFromHsl(h + 150, s, l), colorFromHsl(h + 210, s, l)]
      break
    case 'monochromatic':
      colors = [
        colorFromHsl(h, s, Math.max(10, l - 40)),
        colorFromHsl(h, s, Math.max(10, l - 20)),
        base,
        colorFromHsl(h, s, Math.min(90, l + 20)),
        colorFromHsl(h, s, Math.min(90, l + 40)),
      ]
      break
  }

  return { type, baseColor: base, colors }
}

/**
 * Returns white or black — whichever gives better contrast against the background color
 */
export function bestTextColor(background: ColorInfo): ColorInfo {
  const white = colorFromHex('#ffffff')!
  const black = colorFromHex('#000000')!
  return contrastRatio(background.rgb, white.rgb) > contrastRatio(background.rgb, black.rgb)
    ? white
    : black
}
