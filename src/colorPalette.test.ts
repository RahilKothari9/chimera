import { describe, it, expect } from 'vitest'
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  colorFromHex,
  colorFromHsl,
  relativeLuminance,
  contrastRatio,
  checkContrast,
  generatePalette,
  bestTextColor,
} from './colorPalette'

describe('hexToRgb', () => {
  it('parses a 6-char hex with hash', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
  })
  it('parses a 3-char hex with hash', () => {
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 })
  })
  it('handles uppercase letters', () => {
    expect(hexToRgb('#FF8800')).toEqual({ r: 255, g: 136, b: 0 })
  })
  it('parses hex without hash', () => {
    expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 })
  })
  it('parses black', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
  })
  it('returns null for invalid length', () => {
    expect(hexToRgb('#1234')).toBeNull()
    expect(hexToRgb('#12')).toBeNull()
  })
  it('returns null for non-hex characters in 6-char form', () => {
    expect(hexToRgb('#xxyyzz')).toBeNull()
  })
  it('returns null for non-hex characters in 3-char form', () => {
    expect(hexToRgb('#xyz')).toBeNull()
  })
})

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
  it('clamps values above 255', () => {
    expect(rgbToHex({ r: 300, g: 0, b: 0 })).toBe('#ff0000')
  })
  it('clamps negative values', () => {
    expect(rgbToHex({ r: -10, g: 128, b: 0 })).toBe('#008000')
  })
})

describe('rgbToHsl', () => {
  it('converts pure red', () => {
    const hsl = rgbToHsl({ r: 255, g: 0, b: 0 })
    expect(hsl.h).toBe(0)
    expect(hsl.s).toBe(100)
    expect(hsl.l).toBe(50)
  })
  it('converts pure green', () => {
    const hsl = rgbToHsl({ r: 0, g: 255, b: 0 })
    expect(hsl.h).toBe(120)
    expect(hsl.s).toBe(100)
    expect(hsl.l).toBe(50)
  })
  it('converts pure blue', () => {
    const hsl = rgbToHsl({ r: 0, g: 0, b: 255 })
    expect(hsl.h).toBe(240)
    expect(hsl.s).toBe(100)
    expect(hsl.l).toBe(50)
  })
  it('converts white', () => {
    const hsl = rgbToHsl({ r: 255, g: 255, b: 255 })
    expect(hsl.s).toBe(0)
    expect(hsl.l).toBe(100)
  })
  it('converts black', () => {
    const hsl = rgbToHsl({ r: 0, g: 0, b: 0 })
    expect(hsl.s).toBe(0)
    expect(hsl.l).toBe(0)
  })
  it('converts mid-gray', () => {
    const hsl = rgbToHsl({ r: 128, g: 128, b: 128 })
    expect(hsl.s).toBe(0)
  })
})

describe('hslToRgb', () => {
  it('converts pure red', () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 })
  })
  it('converts white (achromatic)', () => {
    expect(hslToRgb({ h: 0, s: 0, l: 100 })).toEqual({ r: 255, g: 255, b: 255 })
  })
  it('converts black (achromatic)', () => {
    expect(hslToRgb({ h: 0, s: 0, l: 0 })).toEqual({ r: 0, g: 0, b: 0 })
  })
  it('round-trips with rgbToHsl within 1 unit', () => {
    const original = { r: 100, g: 150, b: 200 }
    const back = hslToRgb(rgbToHsl(original))
    expect(Math.abs(back.r - original.r)).toBeLessThanOrEqual(1)
    expect(Math.abs(back.g - original.g)).toBeLessThanOrEqual(1)
    expect(Math.abs(back.b - original.b)).toBeLessThanOrEqual(1)
  })
  it('converts pure green', () => {
    const rgb = hslToRgb({ h: 120, s: 100, l: 50 })
    expect(rgb.g).toBe(255)
    expect(rgb.r).toBe(0)
    expect(rgb.b).toBe(0)
  })
})

describe('colorFromHex', () => {
  it('creates a ColorInfo from a valid hex', () => {
    const c = colorFromHex('#ff0000')
    expect(c).not.toBeNull()
    expect(c!.hex).toBe('#ff0000')
    expect(c!.rgb).toEqual({ r: 255, g: 0, b: 0 })
    expect(c!.hsl.h).toBe(0)
  })
  it('returns null for an invalid hex', () => {
    expect(colorFromHex('#xyz')).toBeNull()
  })
  it('normalizes hex casing', () => {
    const c = colorFromHex('#ABCDEF')
    expect(c!.hex).toBe('#abcdef')
  })
})

describe('colorFromHsl', () => {
  it('creates a ColorInfo from valid HSL', () => {
    const c = colorFromHsl(0, 100, 50)
    expect(c.hsl.h).toBe(0)
    expect(c.hsl.s).toBe(100)
    expect(c.hsl.l).toBe(50)
  })
  it('normalizes hue > 360', () => {
    const c = colorFromHsl(370, 50, 50)
    expect(c.hsl.h).toBe(10)
  })
  it('normalizes negative hue', () => {
    const c = colorFromHsl(-30, 50, 50)
    expect(c.hsl.h).toBe(330)
  })
  it('clamps saturation above 100', () => {
    const c = colorFromHsl(180, 150, 50)
    expect(c.hsl.s).toBe(100)
  })
  it('clamps lightness below 0', () => {
    const c = colorFromHsl(180, 50, -10)
    expect(c.hsl.l).toBe(0)
  })
})

describe('relativeLuminance', () => {
  it('white has luminance ~1', () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 2)
  })
  it('black has luminance 0', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 5)
  })
  it('luminance is between 0 and 1 for any color', () => {
    const lum = relativeLuminance({ r: 100, g: 149, b: 237 })
    expect(lum).toBeGreaterThan(0)
    expect(lum).toBeLessThan(1)
  })
})

describe('contrastRatio', () => {
  it('black on white gives maximum ratio of ~21', () => {
    const ratio = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })
    expect(ratio).toBeCloseTo(21, 0)
  })
  it('identical colors give ratio of 1', () => {
    expect(contrastRatio({ r: 128, g: 64, b: 32 }, { r: 128, g: 64, b: 32 })).toBeCloseTo(1, 2)
  })
  it('is symmetric (order does not matter)', () => {
    const a = { r: 100, g: 200, b: 50 }
    const b = { r: 30, g: 30, b: 30 }
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 5)
  })
})

describe('checkContrast', () => {
  it('black/white pair passes all WCAG levels', () => {
    const result = checkContrast(colorFromHex('#000000')!, colorFromHex('#ffffff')!)
    expect(result.aaLarge).toBe(true)
    expect(result.aa).toBe(true)
    expect(result.aaaLarge).toBe(true)
    expect(result.aaa).toBe(true)
  })
  it('yellow/white pair fails AA normal text', () => {
    const result = checkContrast(colorFromHex('#ffff00')!, colorFromHex('#ffffff')!)
    expect(result.aa).toBe(false)
  })
  it('ratioText has the correct format', () => {
    const result = checkContrast(colorFromHex('#000000')!, colorFromHex('#ffffff')!)
    expect(result.ratioText).toMatch(/^\d+\.\d{2}:1$/)
  })
  it('ratio matches contrastRatio function', () => {
    const a = colorFromHex('#336699')!
    const b = colorFromHex('#ffffff')!
    const result = checkContrast(a, b)
    expect(result.ratio).toBeCloseTo(contrastRatio(a.rgb, b.rgb), 5)
  })
})

describe('generatePalette', () => {
  it('returns null for an invalid hex', () => {
    expect(generatePalette('#xyz', 'complementary')).toBeNull()
  })
  it('complementary palette has 2 colors', () => {
    const p = generatePalette('#ff0000', 'complementary')!
    expect(p.colors).toHaveLength(2)
    expect(p.type).toBe('complementary')
  })
  it('analogous palette has 3 colors', () => {
    expect(generatePalette('#ff0000', 'analogous')!.colors).toHaveLength(3)
  })
  it('triadic palette has 3 colors', () => {
    expect(generatePalette('#ff0000', 'triadic')!.colors).toHaveLength(3)
  })
  it('tetradic palette has 4 colors', () => {
    expect(generatePalette('#ff0000', 'tetradic')!.colors).toHaveLength(4)
  })
  it('split-complementary palette has 3 colors', () => {
    expect(generatePalette('#ff0000', 'split-complementary')!.colors).toHaveLength(3)
  })
  it('monochromatic palette has 5 colors', () => {
    expect(generatePalette('#ff0000', 'monochromatic')!.colors).toHaveLength(5)
  })
  it('baseColor matches the input hex', () => {
    const p = generatePalette('#3399ff', 'complementary')!
    expect(p.baseColor.hex).toBe('#3399ff')
  })
  it('all colors in the palette have valid hex values', () => {
    const p = generatePalette('#6366f1', 'tetradic')!
    p.colors.forEach(c => {
      expect(c.hex).toMatch(/^#[0-9a-f]{6}$/)
    })
  })
})

describe('bestTextColor', () => {
  it('returns white for a very dark background', () => {
    expect(bestTextColor(colorFromHex('#1a1a2e')!).hex).toBe('#ffffff')
  })
  it('returns black for a very light background', () => {
    expect(bestTextColor(colorFromHex('#f0f0f0')!).hex).toBe('#000000')
  })
  it('returns white for pure black', () => {
    expect(bestTextColor(colorFromHex('#000000')!).hex).toBe('#ffffff')
  })
  it('returns black for pure white', () => {
    expect(bestTextColor(colorFromHex('#ffffff')!).hex).toBe('#000000')
  })
})
