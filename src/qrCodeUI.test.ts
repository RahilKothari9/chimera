/**
 * Tests for QR Code UI
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Window } from 'happy-dom'
import {
  showQRCodeModal,
  createQRShareButton,
  createQRPreview,
  generateQRCodeSet,
  type ShareData
} from './qrCodeUI'

describe('QR Code UI', () => {
  beforeEach(() => {
    const window = new Window()
    global.document = window.document as unknown as Document
    global.window = window as unknown as Window & typeof globalThis
    global.navigator = {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    } as any
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('showQRCodeModal', () => {
    it('should create modal element', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const modal = document.querySelector('.qr-modal')
      expect(modal).toBeDefined()
      expect(modal).not.toBeNull()
    })

    it('should display title', () => {
      const data: ShareData = {
        title: 'My Test Title',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const titleElement = document.querySelector('.qr-share-title')
      expect(titleElement?.textContent).toBe('My Test Title')
    })

    it('should display description when provided', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com',
        description: 'This is a test description'
      }

      showQRCodeModal(data)

      const descElement = document.querySelector('.qr-share-description')
      expect(descElement?.textContent).toBe('This is a test description')
    })

    it('should not display description when not provided', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const descElement = document.querySelector('.qr-share-description')
      expect(descElement).toBeNull()
    })

    it('should display URL', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com/path'
      }

      showQRCodeModal(data)

      const urlInput = document.querySelector('.qr-url-text') as HTMLInputElement
      expect(urlInput?.value).toBe('https://example.com/path')
    })

    it('should create QR code image', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const img = document.querySelector('.qr-code-image')
      expect(img).toBeDefined()
      expect(img).not.toBeNull()
    })

    it('should set QR image src', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const img = document.querySelector('.qr-code-image') as HTMLImageElement
      expect(img?.src).toContain('data:image/svg+xml;base64,')
    })

    it('should create error correction selector', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const select = document.querySelector('.qr-ec-select')
      expect(select).toBeDefined()
      expect(select).not.toBeNull()
    })

    it('should have all error correction levels', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const options = document.querySelectorAll('.qr-ec-select option')
      expect(options.length).toBe(4)
      
      const values = Array.from(options).map(opt => (opt as HTMLOptionElement).value)
      expect(values).toContain('L')
      expect(values).toContain('M')
      expect(values).toContain('Q')
      expect(values).toContain('H')
    })

    it('should default to Medium error correction', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const select = document.querySelector('.qr-ec-select') as HTMLSelectElement
      expect(select?.value).toBe('M')
    })

    it('should create copy URL button', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const copyBtn = document.querySelector('.qr-copy-btn')
      expect(copyBtn).toBeDefined()
      expect(copyBtn?.textContent).toContain('Copy URL')
    })

    it('should create download button', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const downloadBtn = document.querySelector('.qr-download-btn')
      expect(downloadBtn).toBeDefined()
      expect(downloadBtn?.textContent).toContain('Download')
    })

    it('should create print button', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const printBtn = document.querySelector('.qr-print-btn')
      expect(printBtn).toBeDefined()
      expect(printBtn?.textContent).toContain('Print')
    })

    it('should create close button', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const closeBtn = document.querySelector('.qr-modal-close')
      expect(closeBtn).toBeDefined()
      expect(closeBtn).not.toBeNull()
    })

    it('should close modal when close button clicked', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const closeBtn = document.querySelector('.qr-modal-close') as HTMLElement
      closeBtn?.click()

      const modal = document.querySelector('.qr-modal')
      expect(modal).toBeNull()
    })

    it('should close modal when backdrop clicked', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const backdrop = document.querySelector('.qr-modal-backdrop') as HTMLElement
      backdrop?.click()

      const modal = document.querySelector('.qr-modal')
      expect(modal).toBeNull()
    })

    it('should include instructions', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const instructions = document.querySelector('.qr-instructions')
      expect(instructions).toBeDefined()
      expect(instructions?.textContent).toContain('How to use')
    })

    it('should set ARIA attributes', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const modal = document.querySelector('.qr-modal')
      expect(modal?.getAttribute('role')).toBe('dialog')
      expect(modal?.getAttribute('aria-modal')).toBe('true')
      expect(modal?.hasAttribute('aria-labelledby')).toBe(true)
    })

    it('should remove existing modal before creating new one', () => {
      const data1: ShareData = {
        title: 'Test 1',
        url: 'https://example.com'
      }

      const data2: ShareData = {
        title: 'Test 2',
        url: 'https://example2.com'
      }

      showQRCodeModal(data1)
      showQRCodeModal(data2)

      const modals = document.querySelectorAll('.qr-modal')
      expect(modals.length).toBe(1)
    })

    it('should escape HTML in title for XSS prevention', () => {
      const data: ShareData = {
        title: '<script>alert("xss")</script>',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const titleElement = document.querySelector('.qr-share-title')
      expect(titleElement?.innerHTML).not.toContain('<script>')
      expect(titleElement?.textContent).toContain('<script>')
    })

    it('should escape HTML in description for XSS prevention', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com',
        description: '<img src=x onerror=alert(1)>'
      }

      showQRCodeModal(data)

      const descElement = document.querySelector('.qr-share-description')
      // HTML should be escaped, so innerHTML should contain entity-encoded text
      expect(descElement?.innerHTML).toContain('&lt;img')
      expect(descElement?.textContent).toContain('<img')
    })

    it('should make URL input readonly', () => {
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      showQRCodeModal(data)

      const urlInput = document.querySelector('.qr-url-text') as HTMLInputElement
      expect(urlInput?.readOnly).toBe(true)
    })
  })

  describe('createQRShareButton', () => {
    it('should create button element', () => {
      const container = document.createElement('div')
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      createQRShareButton(container, data)

      const button = container.querySelector('.qr-share-button')
      expect(button).toBeDefined()
      expect(button).not.toBeNull()
    })

    it('should have share icon/text', () => {
      const container = document.createElement('div')
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      createQRShareButton(container, data)

      const button = container.querySelector('.qr-share-button')
      expect(button?.textContent).toContain('Share QR')
    })

    it('should set ARIA label', () => {
      const container = document.createElement('div')
      const data: ShareData = {
        title: 'My Content',
        url: 'https://example.com'
      }

      createQRShareButton(container, data)

      const button = container.querySelector('.qr-share-button')
      expect(button?.getAttribute('aria-label')).toContain('My Content')
    })

    it('should open modal when clicked', () => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      
      const data: ShareData = {
        title: 'Test',
        url: 'https://example.com'
      }

      createQRShareButton(container, data)

      const button = container.querySelector('.qr-share-button') as HTMLElement
      button?.click()

      const modal = document.querySelector('.qr-modal')
      expect(modal).not.toBeNull()
    })
  })

  describe('createQRPreview', () => {
    it('should create image element', () => {
      const img = createQRPreview('https://example.com')

      expect(img.tagName).toBe('IMG')
      expect(img.className).toBe('qr-preview')
    })

    it('should set default size', () => {
      const img = createQRPreview('https://example.com')

      expect(img.width).toBe(128)
      expect(img.height).toBe(128)
    })

    it('should respect custom size', () => {
      const img = createQRPreview('https://example.com', 256)

      expect(img.width).toBe(256)
      expect(img.height).toBe(256)
    })

    it('should set src to data URL', () => {
      const img = createQRPreview('https://example.com')

      expect(img.src).toContain('data:image/svg+xml;base64,')
    })

    it('should set alt text', () => {
      const img = createQRPreview('https://example.com')

      expect(img.alt).toBe('QR Code Preview')
    })

    it('should handle different URLs', () => {
      const img1 = createQRPreview('https://example.com')
      const img2 = createQRPreview('https://different.com')

      expect(img1.src).not.toBe(img2.src)
    })
  })

  describe('generateQRCodeSet', () => {
    it('should generate QR codes for all error correction levels', () => {
      const set = generateQRCodeSet('https://example.com')

      expect(set.L).toBeDefined()
      expect(set.M).toBeDefined()
      expect(set.Q).toBeDefined()
      expect(set.H).toBeDefined()
    })

    it('should generate different QR codes for each level', () => {
      const set = generateQRCodeSet('https://example.com')

      const codes = [set.L, set.M, set.Q, set.H]
      const unique = new Set(codes)
      
      expect(unique.size).toBeGreaterThan(1)
    })

    it('should all be data URLs', () => {
      const set = generateQRCodeSet('https://example.com')

      expect(set.L).toContain('data:image/svg+xml;base64,')
      expect(set.M).toContain('data:image/svg+xml;base64,')
      expect(set.Q).toContain('data:image/svg+xml;base64,')
      expect(set.H).toContain('data:image/svg+xml;base64,')
    })

    it('should handle different URLs', () => {
      const set1 = generateQRCodeSet('https://example.com')
      const set2 = generateQRCodeSet('https://different.com')

      expect(set1.M).not.toBe(set2.M)
    })
  })
})
