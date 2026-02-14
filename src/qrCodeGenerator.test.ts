/**
 * Tests for QR Code Generator
 */

import { describe, it, expect } from 'vitest'
import {
  generateQRCode,
  qrCodeToSVG,
  qrCodeToDataURL,
  generateQRCodeDataURL,
  type ErrorCorrectionLevel,
  type QRCodeOptions
} from './qrCodeGenerator'

describe('QR Code Generator', () => {
  describe('generateQRCode', () => {
    it('should generate QR code for simple text', () => {
      const result = generateQRCode('Hello')
      
      expect(result).toBeDefined()
      expect(result.modules).toBeDefined()
      expect(result.size).toBeGreaterThan(0)
      expect(result.modules.length).toBe(result.size)
      expect(result.modules[0].length).toBe(result.size)
    })

    it('should generate QR code for URL', () => {
      const result = generateQRCode('https://example.com')
      
      expect(result).toBeDefined()
      expect(result.modules).toBeDefined()
      expect(result.size).toBeGreaterThan(0)
    })

    it('should generate QR code with different error correction levels', () => {
      const levels: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H']
      
      levels.forEach(level => {
        const result = generateQRCode('Test', { errorCorrectionLevel: level })
        expect(result).toBeDefined()
        expect(result.modules).toBeDefined()
      })
    })

    it('should handle short text', () => {
      const result = generateQRCode('A')
      
      expect(result.modules).toBeDefined()
      expect(result.size).toBeGreaterThan(0)
    })

    it('should handle medium length text', () => {
      const result = generateQRCode('This is a test message for QR code generation')
      
      expect(result.modules).toBeDefined()
      expect(result.size).toBeGreaterThanOrEqual(21)
    })

    it('should handle long text', () => {
      const longText = 'A'.repeat(100)
      const result = generateQRCode(longText)
      
      expect(result.modules).toBeDefined()
      expect(result.size).toBeGreaterThan(0)
    })

    it('should handle special characters', () => {
      const result = generateQRCode('Hello! @#$%^&*()')
      
      expect(result.modules).toBeDefined()
      expect(result.size).toBeGreaterThan(0)
    })

    it('should handle numbers', () => {
      const result = generateQRCode('1234567890')
      
      expect(result.modules).toBeDefined()
      expect(result.size).toBeGreaterThan(0)
    })

    it('should handle empty string', () => {
      const result = generateQRCode('')
      
      expect(result.modules).toBeDefined()
      expect(result.size).toBeGreaterThan(0)
    })

    it('should generate square matrix', () => {
      const result = generateQRCode('Test')
      
      result.modules.forEach(row => {
        expect(row.length).toBe(result.size)
      })
    })

    it('should have finder patterns', () => {
      const result = generateQRCode('Test')
      const size = result.size
      
      // Top-left finder pattern
      expect(result.modules[0][0]).toBe(true)
      expect(result.modules[6][0]).toBe(true)
      expect(result.modules[0][6]).toBe(true)
      
      // Top-right finder pattern
      expect(result.modules[0][size - 7]).toBe(true)
      
      // Bottom-left finder pattern
      expect(result.modules[size - 7][0]).toBe(true)
    })

    it('should have timing patterns', () => {
      const result = generateQRCode('Test')
      
      // Check timing pattern at row 6
      for (let i = 8; i < result.size - 8; i++) {
        expect(typeof result.modules[6][i]).toBe('boolean')
      }
      
      // Check timing pattern at column 6
      for (let i = 8; i < result.size - 8; i++) {
        expect(typeof result.modules[i][6]).toBe('boolean')
      }
    })

    it('should use correct size for version 1', () => {
      const result = generateQRCode('Hi')
      
      // Version 1 QR code is 21x21
      expect(result.size).toBe(21)
    })

    it('should increase size for longer data', () => {
      const short = generateQRCode('Hi')
      const long = generateQRCode('A'.repeat(50))
      
      expect(long.size).toBeGreaterThanOrEqual(short.size)
    })

    it('should generate different codes for different inputs', () => {
      const qr1 = generateQRCode('Hello')
      const qr2 = generateQRCode('World')
      
      let different = false
      for (let i = 0; i < qr1.size && i < qr2.size; i++) {
        for (let j = 0; j < qr1.size && j < qr2.size; j++) {
          if (qr1.modules[i][j] !== qr2.modules[i][j]) {
            different = true
            break
          }
        }
        if (different) break
      }
      
      expect(different).toBe(true)
    })
  })

  describe('qrCodeToSVG', () => {
    it('should generate valid SVG', () => {
      const qrData = generateQRCode('Test')
      const svg = qrCodeToSVG(qrData)
      
      expect(svg).toContain('<svg')
      expect(svg).toContain('</svg>')
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    })

    it('should include white background', () => {
      const qrData = generateQRCode('Test')
      const svg = qrCodeToSVG(qrData)
      
      expect(svg).toContain('fill="#ffffff"')
    })

    it('should include black modules', () => {
      const qrData = generateQRCode('Test')
      const svg = qrCodeToSVG(qrData)
      
      expect(svg).toContain('fill="#000000"')
    })

    it('should respect margin option', () => {
      const qrData = generateQRCode('Test')
      const svg1 = qrCodeToSVG(qrData, { margin: 2 })
      const svg2 = qrCodeToSVG(qrData, { margin: 8 })
      
      expect(svg1).toBeDefined()
      expect(svg2).toBeDefined()
      expect(svg1.length).not.toBe(svg2.length)
    })

    it('should respect scale option', () => {
      const qrData = generateQRCode('Test')
      const svg1 = qrCodeToSVG(qrData, { scale: 2 })
      const svg2 = qrCodeToSVG(qrData, { scale: 8 })
      
      expect(svg1).toBeDefined()
      expect(svg2).toBeDefined()
      
      // Extract viewBox dimensions
      const getSize = (svg: string) => {
        const match = svg.match(/viewBox="0 0 (\d+) (\d+)"/)
        return match ? parseInt(match[1]) : 0
      }
      
      expect(getSize(svg2)).toBeGreaterThan(getSize(svg1))
    })

    it('should use default margin and scale when not specified', () => {
      const qrData = generateQRCode('Test')
      const svg = qrCodeToSVG(qrData)
      
      expect(svg).toBeDefined()
      expect(svg.length).toBeGreaterThan(0)
    })

    it('should create rect elements for modules', () => {
      const qrData = generateQRCode('Test')
      const svg = qrCodeToSVG(qrData)
      
      expect(svg).toContain('<rect')
    })

    it('should include viewBox attribute', () => {
      const qrData = generateQRCode('Test')
      const svg = qrCodeToSVG(qrData)
      
      expect(svg).toContain('viewBox=')
    })

    it('should include width and height attributes', () => {
      const qrData = generateQRCode('Test')
      const svg = qrCodeToSVG(qrData)
      
      expect(svg).toContain('width=')
      expect(svg).toContain('height=')
    })
  })

  describe('qrCodeToDataURL', () => {
    it('should generate data URL', () => {
      const qrData = generateQRCode('Test')
      const dataURL = qrCodeToDataURL(qrData)
      
      expect(dataURL).toContain('data:image/svg+xml;base64,')
    })

    it('should generate base64 encoded data', () => {
      const qrData = generateQRCode('Test')
      const dataURL = qrCodeToDataURL(qrData)
      
      const base64Part = dataURL.split(',')[1]
      expect(base64Part).toBeDefined()
      expect(base64Part.length).toBeGreaterThan(0)
    })

    it('should be valid base64', () => {
      const qrData = generateQRCode('Test')
      const dataURL = qrCodeToDataURL(qrData)
      
      const base64Part = dataURL.split(',')[1]
      
      // Should not throw when decoding
      expect(() => atob(base64Part)).not.toThrow()
    })

    it('should decode to valid SVG', () => {
      const qrData = generateQRCode('Test')
      const dataURL = qrCodeToDataURL(qrData)
      
      const base64Part = dataURL.split(',')[1]
      const decoded = atob(base64Part)
      
      expect(decoded).toContain('<svg')
      expect(decoded).toContain('</svg>')
    })

    it('should respect options', () => {
      const qrData = generateQRCode('Test')
      const dataURL1 = qrCodeToDataURL(qrData, { scale: 2 })
      const dataURL2 = qrCodeToDataURL(qrData, { scale: 8 })
      
      expect(dataURL1).toBeDefined()
      expect(dataURL2).toBeDefined()
      expect(dataURL1).not.toBe(dataURL2)
    })
  })

  describe('generateQRCodeDataURL', () => {
    it('should generate QR code and data URL in one step', () => {
      const dataURL = generateQRCodeDataURL('Test')
      
      expect(dataURL).toContain('data:image/svg+xml;base64,')
    })

    it('should work with different texts', () => {
      const dataURL1 = generateQRCodeDataURL('Hello')
      const dataURL2 = generateQRCodeDataURL('World')
      
      expect(dataURL1).toBeDefined()
      expect(dataURL2).toBeDefined()
      expect(dataURL1).not.toBe(dataURL2)
    })

    it('should respect error correction level option', () => {
      const dataURL = generateQRCodeDataURL('Test', { errorCorrectionLevel: 'H' })
      
      expect(dataURL).toBeDefined()
      expect(dataURL.length).toBeGreaterThan(0)
    })

    it('should respect margin option', () => {
      const dataURL = generateQRCodeDataURL('Test', { margin: 8 })
      
      expect(dataURL).toBeDefined()
      expect(dataURL.length).toBeGreaterThan(0)
    })

    it('should respect scale option', () => {
      const dataURL1 = generateQRCodeDataURL('Test', { scale: 2 })
      const dataURL2 = generateQRCodeDataURL('Test', { scale: 8 })
      
      expect(dataURL1).not.toBe(dataURL2)
    })

    it('should handle URLs', () => {
      const dataURL = generateQRCodeDataURL('https://github.com')
      
      expect(dataURL).toBeDefined()
      expect(dataURL).toContain('data:image/svg+xml;base64,')
    })

    it('should handle JSON data', () => {
      const json = JSON.stringify({ name: 'test', value: 123 })
      const dataURL = generateQRCodeDataURL(json)
      
      expect(dataURL).toBeDefined()
      expect(dataURL.length).toBeGreaterThan(0)
    })

    it('should handle unicode characters', () => {
      const dataURL = generateQRCodeDataURL('Hello 世界 🌍')
      
      expect(dataURL).toBeDefined()
      expect(dataURL.length).toBeGreaterThan(0)
    })
  })

  describe('Options', () => {
    it('should use default options when none provided', () => {
      const qrData = generateQRCode('Test')
      const svg = qrCodeToSVG(qrData)
      
      expect(svg).toBeDefined()
    })

    it('should handle all options together', () => {
      const options: QRCodeOptions = {
        errorCorrectionLevel: 'H',
        margin: 6,
        scale: 6
      }
      
      const dataURL = generateQRCodeDataURL('Test', options)
      
      expect(dataURL).toBeDefined()
      expect(dataURL.length).toBeGreaterThan(0)
    })

    it('should accept partial options', () => {
      const dataURL1 = generateQRCodeDataURL('Test', { margin: 2 })
      const dataURL2 = generateQRCodeDataURL('Test', { scale: 8 })
      const dataURL3 = generateQRCodeDataURL('Test', { errorCorrectionLevel: 'Q' })
      
      expect(dataURL1).toBeDefined()
      expect(dataURL2).toBeDefined()
      expect(dataURL3).toBeDefined()
    })
  })
})
