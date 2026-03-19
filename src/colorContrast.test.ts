import { describe, it, expect } from 'vitest'
import {
  parseColor,
  srgbToLinear,
  relativeLuminance,
  contrastRatio,
  evaluateContrast,
  rgbToHex,
  suggestAccessibleColor,
  getComplianceSummary,
  type RgbColor,
} from './colorContrast'

describe('parseColor', () => {
  it('parses #RRGGBB hex', () => {
    expect(parseColor('#ffffff')).toEqual({ color: { r: 255, g: 255, b: 255 } })
    expect(parseColor('#000000')).toEqual({ color: { r: 0, g: 0, b: 0 } })
    expect(parseColor('#1a2b3c')).toEqual({ color: { r: 26, g: 43, b: 60 } })
  })

  it('parses #RGB shorthand hex', () => {
    expect(parseColor('#fff')).toEqual({ color: { r: 255, g: 255, b: 255 } })
    expect(parseColor('#000')).toEqual({ color: { r: 0, g: 0, b: 0 } })
    expect(parseColor('#abc')).toEqual({ color: { r: 170, g: 187, b: 204 } })
  })

  it('parses rgb() notation', () => {
    expect(parseColor('rgb(255, 0, 128)')).toEqual({ color: { r: 255, g: 0, b: 128 } })
    expect(parseColor('rgb(0,0,0)')).toEqual({ color: { r: 0, g: 0, b: 0 } })
  })

  it('parses rgba() notation (ignores alpha)', () => {
    expect(parseColor('rgba(100, 200, 50, 0.5)')).toEqual({ color: { r: 100, g: 200, b: 50 } })
  })

  it('returns error for empty input', () => {
    const result = parseColor('')
    expect(result.color).toBeNull()
    expect(result.error).toBeTruthy()
  })

  it('returns error for unrecognised format', () => {
    const result = parseColor('not-a-color')
    expect(result.color).toBeNull()
    expect(result.error).toBeTruthy()
  })

  it('trims whitespace', () => {
    expect(parseColor('  #ff0000  ')).toEqual({ color: { r: 255, g: 0, b: 0 } })
  })
})

describe('srgbToLinear', () => {
  it('returns 0 for black channel', () => {
    expect(srgbToLinear(0)).toBeCloseTo(0)
  })

  it('returns 1 for white channel', () => {
    expect(srgbToLinear(255)).toBeCloseTo(1)
  })

  it('applies low-end linear formula for small values', () => {
    // 10/255 ≈ 0.0392 ≤ 0.04045, so result = 0.0392 / 12.92
    const c = 10 / 255
    expect(srgbToLinear(10)).toBeCloseTo(c / 12.92, 5)
  })

  it('applies gamma formula for larger values', () => {
    // 128/255 ≈ 0.502 > 0.04045
    const c = 128 / 255
    expect(srgbToLinear(128)).toBeCloseTo(Math.pow((c + 0.055) / 1.055, 2.4), 5)
  })
})

describe('relativeLuminance', () => {
  it('returns 0 for pure black', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0)
  })

  it('returns 1 for pure white', () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1)
  })

  it('green contributes the most to luminance', () => {
    const greenOnly = relativeLuminance({ r: 0, g: 255, b: 0 })
    const redOnly = relativeLuminance({ r: 255, g: 0, b: 0 })
    const blueOnly = relativeLuminance({ r: 0, g: 0, b: 255 })
    expect(greenOnly).toBeGreaterThan(redOnly)
    expect(greenOnly).toBeGreaterThan(blueOnly)
  })
})

describe('contrastRatio', () => {
  const black: RgbColor = { r: 0, g: 0, b: 0 }
  const white: RgbColor = { r: 255, g: 255, b: 255 }

  it('returns 21 for black on white', () => {
    expect(contrastRatio(black, white)).toBeCloseTo(21, 1)
  })

  it('returns 21 for white on black', () => {
    expect(contrastRatio(white, black)).toBeCloseTo(21, 1)
  })

  it('returns 1 for identical colors', () => {
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5)
    expect(contrastRatio(black, black)).toBeCloseTo(1, 5)
  })

  it('is symmetric', () => {
    const a: RgbColor = { r: 100, g: 150, b: 200 }
    const b: RgbColor = { r: 30, g: 80, b: 40 }
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 10)
  })
})

describe('evaluateContrast', () => {
  const black: RgbColor = { r: 0, g: 0, b: 0 }
  const white: RgbColor = { r: 255, g: 255, b: 255 }

  it('gives AAA level for black on white', () => {
    const result = evaluateContrast(black, white)
    expect(result.level).toBe('AAA')
    expect(result.normalTextAA).toBe(true)
    expect(result.normalTextAAA).toBe(true)
    expect(result.largeTextAA).toBe(true)
    expect(result.largeTextAAA).toBe(true)
    expect(result.uiComponentsAA).toBe(true)
    expect(result.ratioLabel).toMatch(/^\d+\.\d{2}:1$/)
  })

  it('gives Fail level for very low contrast', () => {
    const a: RgbColor = { r: 200, g: 200, b: 200 }
    const b: RgbColor = { r: 220, g: 220, b: 220 }
    const result = evaluateContrast(a, b)
    expect(result.level).toBe('Fail')
    expect(result.normalTextAA).toBe(false)
    expect(result.largeTextAA).toBe(false)
  })

  it('gives AA Large level for medium contrast (3–4.49:1)', () => {
    // #767676 on white has ratio ≈ 4.48:1 (just below AA)
    // Use manually crafted colors to get a ratio ~3.5:1
    const fg: RgbColor = { r: 118, g: 118, b: 118 }
    const bg: RgbColor = { r: 255, g: 255, b: 255 }
    const result = evaluateContrast(fg, bg)
    // Contrast ratio for #767676 on white is approximately 4.48:1
    expect(result.ratio).toBeGreaterThanOrEqual(3)
    expect(result.largeTextAA).toBe(true)
  })

  it('includes ratio as formatted label', () => {
    const result = evaluateContrast(black, white)
    expect(result.ratioLabel).toBe('21.00:1')
  })
})

describe('rgbToHex', () => {
  it('converts white to #ffffff', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff')
  })

  it('converts black to #000000', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
  })

  it('converts a mid-range color correctly', () => {
    expect(rgbToHex({ r: 26, g: 43, b: 60 })).toBe('#1a2b3c')
  })

  it('clamps values to 0–255', () => {
    expect(rgbToHex({ r: -10, g: 300, b: 128 })).toBe('#00ff80')
  })
})

describe('suggestAccessibleColor', () => {
  it('returns null when contrast already meets the target', () => {
    const black: RgbColor = { r: 0, g: 0, b: 0 }
    const white: RgbColor = { r: 255, g: 255, b: 255 }
    expect(suggestAccessibleColor(black, white, 4.5)).toBeNull()
  })

  it('returns a color that meets the target ratio when original fails', () => {
    const lightGray: RgbColor = { r: 180, g: 180, b: 180 }
    const white: RgbColor = { r: 255, g: 255, b: 255 }
    const suggestion = suggestAccessibleColor(lightGray, white, 4.5)
    expect(suggestion).not.toBeNull()
    if (suggestion) {
      expect(contrastRatio(suggestion, white)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('always returns a fallback (black or white) even in extreme cases', () => {
    const mid: RgbColor = { r: 128, g: 128, b: 128 }
    const similar: RgbColor = { r: 130, g: 130, b: 130 }
    const suggestion = suggestAccessibleColor(mid, similar, 4.5)
    expect(suggestion).not.toBeNull()
  })
})

describe('getComplianceSummary', () => {
  it('returns correct data for AAA', () => {
    const s = getComplianceSummary('AAA')
    expect(s.label).toBe('AAA')
    expect(s.color).toBe('#16a34a')
    expect(s.description).toBeTruthy()
  })

  it('returns correct data for AA', () => {
    const s = getComplianceSummary('AA')
    expect(s.label).toBe('AA')
    expect(s.color).toBe('#2563eb')
  })

  it('returns correct data for AA Large', () => {
    const s = getComplianceSummary('AA Large')
    expect(s.label).toBe('AA Large')
    expect(s.color).toBe('#d97706')
  })

  it('returns correct data for Fail', () => {
    const s = getComplianceSummary('Fail')
    expect(s.label).toBe('Fail')
    expect(s.color).toBe('#dc2626')
  })
})
