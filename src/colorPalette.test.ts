import { describe, it, expect } from 'vitest'
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  generatePalette,
  getLuminance,
  getContrastColor,
  generateRandomColor,
  getColorName,
  PALETTE_TYPES,
} from './colorPalette'

// ---------------------------------------------------------------------------
// hexToRgb
// ---------------------------------------------------------------------------
describe('hexToRgb', () => {
  it('parses a 6-digit hex with hash', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('parses a 6-digit hex without hash', () => {
    expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('expands a 3-digit hex', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb('#f80')).toEqual({ r: 255, g: 136, b: 0 })
  })

  it('handles uppercase hex', () => {
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('returns null for invalid hex', () => {
    expect(hexToRgb('xyz')).toBeNull()
    expect(hexToRgb('#gggggg')).toBeNull()
    expect(hexToRgb('')).toBeNull()
    expect(hexToRgb('#12345')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// rgbToHex
// ---------------------------------------------------------------------------
describe('rgbToHex', () => {
  it('converts red', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000')
  })

  it('converts white', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff')
  })

  it('converts black', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
  })

  it('clamps values out of range', () => {
    expect(rgbToHex({ r: 300, g: -5, b: 128 })).toBe('#ff0080')
  })
})

// ---------------------------------------------------------------------------
// rgbToHsl
// ---------------------------------------------------------------------------
describe('rgbToHsl', () => {
  it('converts red', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 })
  })

  it('converts white', () => {
    expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100 })
  })

  it('converts black', () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 })
  })

  it('converts a mid-range colour', () => {
    const hsl = rgbToHsl({ r: 0, g: 128, b: 255 })
    expect(hsl.h).toBeGreaterThan(200)
    expect(hsl.h).toBeLessThan(220)
    expect(hsl.s).toBeGreaterThan(90)
  })
})

// ---------------------------------------------------------------------------
// hslToRgb
// ---------------------------------------------------------------------------
describe('hslToRgb', () => {
  it('converts pure red', () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('converts achromatic (grey)', () => {
    const grey = hslToRgb({ h: 0, s: 0, l: 50 })
    expect(grey.r).toBe(grey.g)
    expect(grey.g).toBe(grey.b)
    expect(grey.r).toBeGreaterThan(100)
    expect(grey.r).toBeLessThan(150)
  })

  it('roundtrips rgb → hsl → rgb', () => {
    const original = { r: 123, g: 45, b: 200 }
    const hsl = rgbToHsl(original)
    const back = hslToRgb(hsl)
    expect(Math.abs(back.r - original.r)).toBeLessThanOrEqual(2)
    expect(Math.abs(back.g - original.g)).toBeLessThanOrEqual(2)
    expect(Math.abs(back.b - original.b)).toBeLessThanOrEqual(2)
  })
})

// ---------------------------------------------------------------------------
// hexToHsl
// ---------------------------------------------------------------------------
describe('hexToHsl', () => {
  it('converts a valid hex', () => {
    const hsl = hexToHsl('#ff0000')
    expect(hsl).not.toBeNull()
    expect(hsl!.h).toBe(0)
    expect(hsl!.s).toBe(100)
    expect(hsl!.l).toBe(50)
  })

  it('returns null for invalid hex', () => {
    expect(hexToHsl('invalid')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// generatePalette
// ---------------------------------------------------------------------------
describe('generatePalette', () => {
  it('returns null for invalid hex', () => {
    expect(generatePalette('invalid', 'complementary')).toBeNull()
  })

  it('generates a complementary palette with 1 swatch', () => {
    const result = generatePalette('#ff0000', 'complementary')
    expect(result).not.toBeNull()
    expect(result!.swatches).toHaveLength(1)
    expect(result!.type).toBe('complementary')
    // Complement of red (h=0) is cyan (h=180)
    expect(result!.swatches[0].hsl.h).toBe(180)
  })

  it('generates an analogous palette with 2 swatches', () => {
    const result = generatePalette('#00ff00', 'analogous')
    expect(result).not.toBeNull()
    expect(result!.swatches).toHaveLength(2)
  })

  it('generates a triadic palette with 2 swatches', () => {
    const result = generatePalette('#ff0000', 'triadic')
    expect(result).not.toBeNull()
    expect(result!.swatches).toHaveLength(2)
    const hues = result!.swatches.map((s) => s.hsl.h)
    expect(hues[0]).toBe(120)
    expect(hues[1]).toBe(240)
  })

  it('generates a split-complementary palette with 2 swatches', () => {
    const result = generatePalette('#ff0000', 'split-complementary')
    expect(result).not.toBeNull()
    expect(result!.swatches).toHaveLength(2)
  })

  it('generates a tetradic palette with 3 swatches', () => {
    const result = generatePalette('#ff0000', 'tetradic')
    expect(result).not.toBeNull()
    expect(result!.swatches).toHaveLength(3)
  })

  it('generates a monochromatic palette with 4 swatches', () => {
    const result = generatePalette('#ff0000', 'monochromatic')
    expect(result).not.toBeNull()
    expect(result!.swatches).toHaveLength(4)
  })

  it('seed swatch has correct hex', () => {
    const result = generatePalette('#3498db', 'complementary')
    expect(result!.seed.hex).toBe('#3498db')
  })

  it('each swatch has hex, rgb, hsl, and label', () => {
    const result = generatePalette('#ff8800', 'triadic')!
    for (const swatch of [result.seed, ...result.swatches]) {
      expect(swatch.hex).toMatch(/^#[0-9a-f]{6}$/)
      expect(swatch.rgb).toHaveProperty('r')
      expect(swatch.rgb).toHaveProperty('g')
      expect(swatch.rgb).toHaveProperty('b')
      expect(swatch.hsl).toHaveProperty('h')
      expect(swatch.label).toBeTruthy()
    }
  })

  it('accepts hex without leading hash', () => {
    const result = generatePalette('ff0000', 'complementary')
    expect(result).not.toBeNull()
  })

  it('monochromatic lightness is clamped within 5–95', () => {
    // Very dark seed — lighter swatches should not exceed 95
    const result = generatePalette('#080808', 'monochromatic')!
    for (const swatch of result.swatches) {
      expect(swatch.hsl.l).toBeGreaterThanOrEqual(5)
      expect(swatch.hsl.l).toBeLessThanOrEqual(95)
    }
  })
})

// ---------------------------------------------------------------------------
// getLuminance
// ---------------------------------------------------------------------------
describe('getLuminance', () => {
  it('white has luminance 1', () => {
    expect(getLuminance('#ffffff')).toBeCloseTo(1, 2)
  })

  it('black has luminance 0', () => {
    expect(getLuminance('#000000')).toBeCloseTo(0, 5)
  })

  it('returns 0 for invalid hex', () => {
    expect(getLuminance('invalid')).toBe(0)
  })

  it('mid-grey has luminance between 0 and 1', () => {
    const l = getLuminance('#808080')
    expect(l).toBeGreaterThan(0)
    expect(l).toBeLessThan(1)
  })
})

// ---------------------------------------------------------------------------
// getContrastColor
// ---------------------------------------------------------------------------
describe('getContrastColor', () => {
  it('dark background → white text', () => {
    expect(getContrastColor('#000000')).toBe('#ffffff')
    expect(getContrastColor('#1a1a2e')).toBe('#ffffff')
  })

  it('light background → black text', () => {
    expect(getContrastColor('#ffffff')).toBe('#000000')
    expect(getContrastColor('#eeeeee')).toBe('#000000')
  })
})

// ---------------------------------------------------------------------------
// generateRandomColor
// ---------------------------------------------------------------------------
describe('generateRandomColor', () => {
  it('returns a valid hex colour', () => {
    const color = generateRandomColor()
    expect(color).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('returns a different colour on each call (statistically)', () => {
    const colors = new Set(Array.from({ length: 10 }, () => generateRandomColor()))
    expect(colors.size).toBeGreaterThan(1)
  })
})

// ---------------------------------------------------------------------------
// getColorName
// ---------------------------------------------------------------------------
describe('getColorName', () => {
  it('identifies red', () => {
    expect(getColorName('#ff0000')).toBe('Red')
  })

  it('identifies blue', () => {
    expect(getColorName('#0000ff')).toBe('Blue')
  })

  it('identifies green', () => {
    expect(getColorName('#00ff00')).toBe('Green')
  })

  it('identifies near-black', () => {
    expect(getColorName('#050505')).toBe('Near Black')
  })

  it('identifies near-white', () => {
    expect(getColorName('#f8f8f8')).toBe('Near White')
  })

  it('identifies grey', () => {
    expect(getColorName('#808080')).toBe('Gray')
  })

  it('returns Unknown for invalid hex', () => {
    expect(getColorName('invalid')).toBe('Unknown')
  })

  it('identifies orange', () => {
    expect(getColorName('#ff8800')).toBe('Orange')
  })

  it('identifies yellow', () => {
    expect(getColorName('#ffff00')).toBe('Yellow')
  })

  it('identifies cyan', () => {
    expect(getColorName('#00ffff')).toBe('Cyan')
  })
})

// ---------------------------------------------------------------------------
// PALETTE_TYPES
// ---------------------------------------------------------------------------
describe('PALETTE_TYPES', () => {
  it('contains all 6 types', () => {
    expect(PALETTE_TYPES).toHaveLength(6)
  })

  it('each entry has value, label, and description', () => {
    for (const entry of PALETTE_TYPES) {
      expect(entry.value).toBeTruthy()
      expect(entry.label).toBeTruthy()
      expect(entry.description).toBeTruthy()
    }
  })
})
