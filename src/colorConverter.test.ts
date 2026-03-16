import { describe, it, expect } from 'vitest'
import {
  normalizeHex,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  parseColorInput,
  convertColor,
} from './colorConverter.ts'

describe('normalizeHex', () => {
  it('handles 6-digit hex with hash', () => {
    expect(normalizeHex('#1a2b3c')).toBe('#1a2b3c')
  })

  it('handles 6-digit hex without hash', () => {
    expect(normalizeHex('1A2B3C')).toBe('#1a2b3c')
  })

  it('expands 3-digit shorthand', () => {
    expect(normalizeHex('#abc')).toBe('#aabbcc')
  })

  it('expands 3-digit shorthand without hash', () => {
    expect(normalizeHex('fff')).toBe('#ffffff')
  })

  it('returns null for invalid input', () => {
    expect(normalizeHex('xyz')).toBeNull()
    expect(normalizeHex('#12345')).toBeNull()
    expect(normalizeHex('')).toBeNull()
    expect(normalizeHex('not a color')).toBeNull()
  })
})

describe('hexToRgb', () => {
  it('converts white', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('converts black', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('converts red', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('converts blue', () => {
    expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
  })

  it('handles 3-digit shorthand', () => {
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('returns null for invalid input', () => {
    expect(hexToRgb('invalid')).toBeNull()
  })
})

describe('rgbToHex', () => {
  it('converts white', () => {
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
  })

  it('converts black', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000')
  })

  it('converts a mid-range color', () => {
    expect(rgbToHex(18, 52, 86)).toBe('#123456')
  })

  it('clamps values outside 0–255', () => {
    expect(rgbToHex(-10, 300, 128)).toBe('#00ff80')
  })
})

describe('rgbToHsl', () => {
  it('converts red to HSL', () => {
    const hsl = rgbToHsl(255, 0, 0)
    expect(hsl.h).toBe(0)
    expect(hsl.s).toBe(100)
    expect(hsl.l).toBe(50)
  })

  it('converts green to HSL', () => {
    const hsl = rgbToHsl(0, 255, 0)
    expect(hsl.h).toBe(120)
    expect(hsl.s).toBe(100)
    expect(hsl.l).toBe(50)
  })

  it('converts blue to HSL', () => {
    const hsl = rgbToHsl(0, 0, 255)
    expect(hsl.h).toBe(240)
    expect(hsl.s).toBe(100)
    expect(hsl.l).toBe(50)
  })

  it('converts white to HSL', () => {
    const hsl = rgbToHsl(255, 255, 255)
    expect(hsl.s).toBe(0)
    expect(hsl.l).toBe(100)
  })

  it('converts black to HSL', () => {
    const hsl = rgbToHsl(0, 0, 0)
    expect(hsl.s).toBe(0)
    expect(hsl.l).toBe(0)
  })
})

describe('hslToRgb', () => {
  it('converts red HSL back to RGB', () => {
    const rgb = hslToRgb(0, 100, 50)
    expect(rgb.r).toBe(255)
    expect(rgb.g).toBe(0)
    expect(rgb.b).toBe(0)
  })

  it('converts green HSL back to RGB', () => {
    const rgb = hslToRgb(120, 100, 50)
    expect(rgb.r).toBe(0)
    expect(rgb.g).toBe(255)
    expect(rgb.b).toBe(0)
  })

  it('converts white HSL back to RGB', () => {
    const rgb = hslToRgb(0, 0, 100)
    expect(rgb.r).toBe(255)
    expect(rgb.g).toBe(255)
    expect(rgb.b).toBe(255)
  })

  it('converts black HSL back to RGB', () => {
    const rgb = hslToRgb(0, 0, 0)
    expect(rgb.r).toBe(0)
    expect(rgb.g).toBe(0)
    expect(rgb.b).toBe(0)
  })
})

describe('rgbToHsl round-trip', () => {
  it('round-trips a mid-range color', () => {
    const original = { r: 100, g: 149, b: 237 }
    const hsl = rgbToHsl(original.r, original.g, original.b)
    const back = hslToRgb(hsl.h, hsl.s, hsl.l)
    expect(Math.abs(back.r - original.r)).toBeLessThanOrEqual(2)
    expect(Math.abs(back.g - original.g)).toBeLessThanOrEqual(2)
    expect(Math.abs(back.b - original.b)).toBeLessThanOrEqual(2)
  })
})

describe('rgbToHsv', () => {
  it('converts red to HSV', () => {
    const hsv = rgbToHsv(255, 0, 0)
    expect(hsv.h).toBe(0)
    expect(hsv.s).toBe(100)
    expect(hsv.v).toBe(100)
  })

  it('converts white to HSV', () => {
    const hsv = rgbToHsv(255, 255, 255)
    expect(hsv.s).toBe(0)
    expect(hsv.v).toBe(100)
  })

  it('converts black to HSV', () => {
    const hsv = rgbToHsv(0, 0, 0)
    expect(hsv.s).toBe(0)
    expect(hsv.v).toBe(0)
  })
})

describe('hsvToRgb', () => {
  it('converts red HSV back to RGB', () => {
    const rgb = hsvToRgb(0, 100, 100)
    expect(rgb.r).toBe(255)
    expect(rgb.g).toBe(0)
    expect(rgb.b).toBe(0)
  })

  it('converts white HSV back to RGB', () => {
    const rgb = hsvToRgb(0, 0, 100)
    expect(rgb.r).toBe(255)
    expect(rgb.g).toBe(255)
    expect(rgb.b).toBe(255)
  })
})

describe('rgbToHsv round-trip', () => {
  it('round-trips a mid-range color', () => {
    const original = { r: 72, g: 209, b: 204 }
    const hsv = rgbToHsv(original.r, original.g, original.b)
    const back = hsvToRgb(hsv.h, hsv.s, hsv.v)
    expect(Math.abs(back.r - original.r)).toBeLessThanOrEqual(2)
    expect(Math.abs(back.g - original.g)).toBeLessThanOrEqual(2)
    expect(Math.abs(back.b - original.b)).toBeLessThanOrEqual(2)
  })
})

describe('parseColorInput', () => {
  it('parses a 6-digit hex string', () => {
    expect(parseColorInput('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('parses a 3-digit hex string', () => {
    expect(parseColorInput('#f00')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('parses hex without hash', () => {
    expect(parseColorInput('00ff00')).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('parses rgb() notation', () => {
    expect(parseColorInput('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30 })
  })

  it('parses rgb() with extra spaces', () => {
    expect(parseColorInput('rgb( 255 , 128 , 0 )')).toEqual({ r: 255, g: 128, b: 0 })
  })

  it('parses hsl() notation', () => {
    const rgb = parseColorInput('hsl(0, 100%, 50%)')
    expect(rgb).not.toBeNull()
    expect(rgb!.r).toBe(255)
    expect(rgb!.g).toBe(0)
    expect(rgb!.b).toBe(0)
  })

  it('parses hsv() notation', () => {
    const rgb = parseColorInput('hsv(0, 100%, 100%)')
    expect(rgb).not.toBeNull()
    expect(rgb!.r).toBe(255)
    expect(rgb!.g).toBe(0)
    expect(rgb!.b).toBe(0)
  })

  it('returns null for unrecognised input', () => {
    expect(parseColorInput('not a color')).toBeNull()
    expect(parseColorInput('')).toBeNull()
    expect(parseColorInput('blue')).toBeNull()
  })
})

describe('convertColor', () => {
  it('returns all formats for a hex input', () => {
    const result = convertColor('#ff0000')
    expect(result).not.toBeNull()
    expect(result!.hex).toBe('#ff0000')
    expect(result!.rgb).toEqual({ r: 255, g: 0, b: 0 })
    expect(result!.hsl.h).toBe(0)
    expect(result!.hsl.s).toBe(100)
    expect(result!.hsl.l).toBe(50)
    expect(result!.hsv.h).toBe(0)
    expect(result!.hsv.s).toBe(100)
    expect(result!.hsv.v).toBe(100)
  })

  it('populates css strings correctly', () => {
    const result = convertColor('#0000ff')
    expect(result).not.toBeNull()
    expect(result!.css.hex).toBe('#0000ff')
    expect(result!.css.rgb).toBe('rgb(0, 0, 255)')
    expect(result!.css.hsl).toBe('hsl(240, 100%, 50%)')
    expect(result!.css.hsv).toBe('hsv(240, 100%, 100%)')
  })

  it('returns null for invalid input', () => {
    expect(convertColor('not-a-color')).toBeNull()
  })

  it('accepts rgb() input', () => {
    const result = convertColor('rgb(0, 255, 0)')
    expect(result).not.toBeNull()
    expect(result!.hex).toBe('#00ff00')
  })

  it('accepts hsl() input', () => {
    const result = convertColor('hsl(240, 100%, 50%)')
    expect(result).not.toBeNull()
    expect(result!.hex).toBe('#0000ff')
  })
})
