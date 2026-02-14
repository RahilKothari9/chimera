/**
 * QR Code Generator
 * Pure JavaScript implementation for generating QR codes
 * Supports multiple error correction levels and encoding modes
 */

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export interface QRCodeOptions {
  errorCorrectionLevel?: ErrorCorrectionLevel
  margin?: number
  scale?: number
}

export interface QRCodeData {
  modules: boolean[][]
  size: number
}

/**
 * Error correction level capacities
 * L = Low (7%), M = Medium (15%), Q = Quartile (25%), H = High (30%)
 */
const ERROR_CORRECTION_CAPACITY: Record<ErrorCorrectionLevel, number> = {
  L: 0,
  M: 1,
  Q: 2,
  H: 3
}

/**
 * Galois Field operations for Reed-Solomon error correction
 */
class GaloisField {
  private exp: number[] = []
  private log: number[] = []

  constructor() {
    let x = 1
    for (let i = 0; i < 255; i++) {
      this.exp[i] = x
      this.log[x] = i
      x = x << 1
      if (x & 0x100) {
        x ^= 0x11d
      }
    }
  }

  multiply(a: number, b: number): number {
    if (a === 0 || b === 0) return 0
    return this.exp[(this.log[a] + this.log[b]) % 255]
  }

  power(a: number, power: number): number {
    if (power === 0) return 1
    if (a === 0) return 0
    return this.exp[(this.log[a] * power) % 255]
  }
}

const gf = new GaloisField()

/**
 * Generates Reed-Solomon error correction codes
 */
function generateErrorCorrection(data: number[], eccCount: number): number[] {
  const generator: number[] = [1]
  
  // Build generator polynomial
  for (let i = 0; i < eccCount; i++) {
    const newGen: number[] = []
    for (let j = 0; j <= generator.length; j++) {
      const a = j < generator.length ? gf.multiply(generator[j], gf.power(2, i)) : 0
      const b = j > 0 ? generator[j - 1] : 0
      newGen[j] = a ^ b
    }
    generator.length = 0
    generator.push(...newGen)
  }

  const result = [...data, ...new Array(eccCount).fill(0)]
  
  for (let i = 0; i < data.length; i++) {
    const factor = result[i]
    if (factor !== 0) {
      for (let j = 0; j < generator.length; j++) {
        result[i + j] ^= gf.multiply(generator[j], factor)
      }
    }
  }

  return result.slice(data.length)
}

/**
 * Determines the QR code version based on data length
 */
function getQRVersion(dataLength: number, ecLevel: ErrorCorrectionLevel): number {
  // Simplified version determination (versions 1-10)
  const capacities = [
    [152, 128, 104, 72],   // Version 1
    [272, 224, 176, 128],  // Version 2
    [440, 352, 272, 208],  // Version 3
    [640, 512, 384, 288],  // Version 4
    [864, 688, 496, 368],  // Version 5
    [1088, 864, 608, 480], // Version 6
    [1248, 992, 704, 528], // Version 7
    [1552, 1232, 880, 688], // Version 8
    [1856, 1456, 1056, 800], // Version 9
    [2192, 1728, 1232, 976]  // Version 10
  ]

  const ecIndex = ERROR_CORRECTION_CAPACITY[ecLevel]
  
  for (let version = 0; version < capacities.length; version++) {
    if (dataLength * 8 <= capacities[version][ecIndex]) {
      return version + 1
    }
  }
  
  return 10 // Max version for this implementation
}

/**
 * Encodes data in byte mode
 */
function encodeData(text: string): number[] {
  const data: number[] = []
  
  // Mode indicator: 0100 for byte mode
  data.push(0, 1, 0, 0)
  
  // Character count (8 bits for version 1-9)
  const length = text.length
  for (let i = 7; i >= 0; i--) {
    data.push((length >> i) & 1)
  }
  
  // Data
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i)
    for (let j = 7; j >= 0; j--) {
      data.push((charCode >> j) & 1)
    }
  }
  
  return data
}

/**
 * Converts bit array to byte array
 */
function bitsToBytes(bits: number[]): number[] {
  const bytes: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8 && i + j < bits.length; j++) {
      byte = (byte << 1) | bits[i + j]
    }
    bytes.push(byte)
  }
  return bytes
}

/**
 * Creates an empty QR code matrix with reserved cells marked
 */
function createMatrix(size: number): (boolean | null)[][] {
  return Array(size).fill(null).map(() => Array(size).fill(null))
}

/**
 * Adds finder patterns to QR code
 */
function addFinderPatterns(modules: (boolean | null)[][], size: number): void {
  const positions = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7]
  ]

  positions.forEach(([row, col]) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const mr = row + r
        const mc = col + c
        if (mr >= 0 && mr < size && mc >= 0 && mc < size) {
          // Black: outer border (r/c = 0 or 6) OR center 3x3 (r,c in 2-4)
          if (r === 0 || r === 6 || c === 0 || c === 6 ||
              (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            modules[mr][mc] = true
          } else {
            modules[mr][mc] = false
          }
        }
      }
    }
    
    // Add white border around finder pattern
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        if ((r === -1 || r === 7) && c >= -1 && c <= 7 ||
            (c === -1 || c === 7) && r >= 0 && r <= 6) {
          const mr = row + r
          const mc = col + c
          if (mr >= 0 && mr < size && mc >= 0 && mc < size) {
            modules[mr][mc] = false
          }
        }
      }
    }
  })
}

/**
 * Adds timing patterns to QR code
 */
function addTimingPatterns(modules: (boolean | null)[][], size: number): void {
  for (let i = 8; i < size - 8; i++) {
    modules[6][i] = i % 2 === 0
    modules[i][6] = i % 2 === 0
  }
}

/**
 * Adds alignment patterns (for version 2+)
 */
function addAlignmentPatterns(modules: (boolean | null)[][], version: number, size: number): void {
  if (version === 1) return
  
  const positions = [6, 18, 30, 42, 54, 66, 78]
  const coords = positions.slice(0, Math.min(version - 1, positions.length))
  
  coords.forEach(row => {
    coords.forEach(col => {
      // Skip if in finder pattern area
      if ((row === 6 && col === 6) || 
          (row <= 8 && col <= 8) ||
          (row <= 8 && col >= size - 9) ||
          (row >= size - 9 && col <= 8)) {
        return
      }
      
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const mr = row + r
          const mc = col + c
          if (mr >= 0 && mr < size && mc >= 0 && mc < size) {
            if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
              modules[mr][mc] = true
            } else {
              modules[mr][mc] = false
            }
          }
        }
      }
    })
  })
}

/**
 * Places data bits in the QR code matrix
 */
function placeData(modules: (boolean | null)[][], data: number[], size: number): void {
  let bitIndex = 0
  let direction = -1
  
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--
    
    for (let i = 0; i < size; i++) {
      const row = direction === -1 ? size - 1 - i : i
      
      for (let c = 0; c < 2; c++) {
        const currentCol = col - c
        
        if (currentCol < 0 || currentCol >= size || row < 0 || row >= size) continue
        
        if (modules[row][currentCol] === null) {
          if (bitIndex < data.length) {
            modules[row][currentCol] = data[bitIndex] === 1
            bitIndex++
          } else {
            modules[row][currentCol] = false
          }
        }
      }
    }
    
    direction *= -1
  }
}

/**
 * Generates a QR code from text data
 */
export function generateQRCode(text: string, options: QRCodeOptions = {}): QRCodeData {
  const ecLevel = options.errorCorrectionLevel || 'M'
  
  // Encode data
  const encodedBits = encodeData(text)
  const version = getQRVersion(text.length, ecLevel)
  const size = version * 4 + 17
  
  // Add error correction
  const dataBytes = bitsToBytes(encodedBits)
  const eccBytes = generateErrorCorrection(dataBytes, Math.min(10, version * 2))
  const allBytes = [...dataBytes, ...eccBytes]
  
  // Convert back to bits
  const allBits: number[] = []
  allBytes.forEach(byte => {
    for (let i = 7; i >= 0; i--) {
      allBits.push((byte >> i) & 1)
    }
  })
  
  // Create matrix
  const modules = createMatrix(size)
  
  // Add patterns
  addFinderPatterns(modules, size)
  addTimingPatterns(modules, size)
  addAlignmentPatterns(modules, version, size)
  
  // Place data
  placeData(modules, allBits, size)
  
  // Convert nulls to false for final output
  const finalModules: boolean[][] = modules.map(row => 
    row.map(cell => cell === true)
  )
  
  return { modules: finalModules, size }
}

/**
 * Converts QR code data to SVG string
 */
export function qrCodeToSVG(qrData: QRCodeData, options: QRCodeOptions = {}): string {
  const margin = options.margin || 4
  const scale = options.scale || 4
  const { modules, size } = qrData
  
  const totalSize = (size + margin * 2) * scale
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}">`
  svg += `<rect width="${totalSize}" height="${totalSize}" fill="#ffffff"/>`
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (modules[row][col]) {
        const x = (col + margin) * scale
        const y = (row + margin) * scale
        svg += `<rect x="${x}" y="${y}" width="${scale}" height="${scale}" fill="#000000"/>`
      }
    }
  }
  
  svg += '</svg>'
  return svg
}

/**
 * Converts QR code data to Data URL (for img src)
 */
export function qrCodeToDataURL(qrData: QRCodeData, options: QRCodeOptions = {}): string {
  const svg = qrCodeToSVG(qrData, options)
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Generates QR code as Data URL in one step
 */
export function generateQRCodeDataURL(text: string, options: QRCodeOptions = {}): string {
  const qrData = generateQRCode(text, options)
  return qrCodeToDataURL(qrData, options)
}
