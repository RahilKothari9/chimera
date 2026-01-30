import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createShareButton, setupShareButton } from './shareableLinksUI'

describe('Shareable Links UI', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('createShareButton', () => {
    it('should create share button in container', () => {
      createShareButton(container)
      const button = container.querySelector('.share-button')
      expect(button).toBeTruthy()
    })

    it('should have share icon', () => {
      createShareButton(container)
      const icon = container.querySelector('.share-icon')
      expect(icon).toBeTruthy()
    })

    it('should have share text', () => {
      createShareButton(container)
      const text = container.querySelector('.share-text')
      expect(text).toBeTruthy()
      expect(text?.textContent).toBe('Share')
    })

    it('should have title attribute', () => {
      createShareButton(container)
      const button = container.querySelector('.share-button') as HTMLButtonElement
      expect(button.title).toBe('Share this view')
    })

    it('should open modal on click', () => {
      createShareButton(container)
      const button = container.querySelector('.share-button') as HTMLButtonElement
      button.click()

      const modal = document.querySelector('.share-modal')
      expect(modal).toBeTruthy()
    })
  })

  describe('share modal', () => {
    beforeEach(() => {
      createShareButton(container)
      const button = container.querySelector('.share-button') as HTMLButtonElement
      button.click()
    })

    it('should display modal header', () => {
      const header = document.querySelector('.share-modal-header h3')
      expect(header?.textContent).toBe('Share Chimera')
    })

    it('should have close button', () => {
      const closeButton = document.querySelector('.share-modal-close')
      expect(closeButton).toBeTruthy()
    })

    it('should close modal on close button click', () => {
      const closeButton = document.querySelector('.share-modal-close') as HTMLButtonElement
      closeButton.click()

      const modal = document.querySelector('.share-modal')
      expect(modal).toBeFalsy()
    })

    it('should close modal on backdrop click', () => {
      const modal = document.querySelector('.share-modal') as HTMLElement
      modal.click()

      const modalAfter = document.querySelector('.share-modal')
      expect(modalAfter).toBeFalsy()
    })

    it('should not close modal on content click', () => {
      const content = document.querySelector('.share-modal-content') as HTMLElement
      content.click()

      const modal = document.querySelector('.share-modal')
      expect(modal).toBeTruthy()
    })

    it('should display current URL', () => {
      const urlInput = document.querySelector('.share-url-input') as HTMLInputElement
      expect(urlInput.value).toBe(window.location.href)
    })

    it('should have readonly URL input', () => {
      const urlInput = document.querySelector('.share-url-input') as HTMLInputElement
      expect(urlInput.readOnly).toBe(true)
    })

    it('should have copy button', () => {
      const copyButton = document.querySelector('.share-copy-button')
      expect(copyButton).toBeTruthy()
      expect(copyButton?.textContent?.trim()).toContain('Copy')
    })

    it('should show hint text', () => {
      const hint = document.querySelector('.share-hint')
      expect(hint?.textContent).toBe('Share this URL to show the exact current view')
    })

    it('should display quick share options header', () => {
      const header = document.querySelector('.share-presets h4')
      expect(header?.textContent).toBe('Quick Share Options')
    })

    it('should display preset list', () => {
      const presetList = document.querySelector('#share-preset-list')
      expect(presetList).toBeTruthy()
    })

    it('should have multiple preset options', () => {
      const presets = document.querySelectorAll('.share-preset-item')
      expect(presets.length).toBeGreaterThan(0)
    })

    it('should have homepage preset', () => {
      const presets = Array.from(document.querySelectorAll('.share-preset-item'))
      const homepage = presets.find(p => p.textContent?.includes('Homepage'))
      expect(homepage).toBeTruthy()
    })

    it('should have latest evolution preset', () => {
      const presets = Array.from(document.querySelectorAll('.share-preset-item'))
      const latest = presets.find(p => p.textContent?.includes('Latest Evolution'))
      expect(latest).toBeTruthy()
    })

    it('should have dark theme preset', () => {
      const presets = Array.from(document.querySelectorAll('.share-preset-item'))
      const darkTheme = presets.find(p => p.textContent?.includes('Dark Theme'))
      expect(darkTheme).toBeTruthy()
    })

    it('should have search visualization preset', () => {
      const presets = Array.from(document.querySelectorAll('.share-preset-item'))
      const search = presets.find(p => p.textContent?.includes('Search: Visualization'))
      expect(search).toBeTruthy()
    })

    it('should have period comparison preset', () => {
      const presets = Array.from(document.querySelectorAll('.share-preset-item'))
      const comparison = presets.find(p => p.textContent?.includes('Period Comparison'))
      expect(comparison).toBeTruthy()
    })

    it('should have copy button for each preset', () => {
      const presets = document.querySelectorAll('.share-preset-item')
      presets.forEach(preset => {
        const copyButton = preset.querySelector('.share-preset-copy')
        expect(copyButton).toBeTruthy()
      })
    })

    it('should show success feedback on copy', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      })

      const copyButton = document.querySelector('.share-copy-button') as HTMLButtonElement
      copyButton.click()

      await vi.waitFor(() => {
        expect(copyButton.textContent).toContain('Copied!')
      })
    })

    it('should restore button text after feedback', async () => {
      vi.useFakeTimers()
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      })

      const copyButton = document.querySelector('.share-copy-button') as HTMLButtonElement
      const originalHTML = copyButton.innerHTML
      copyButton.click()

      await vi.waitFor(() => {
        expect(copyButton.textContent).toContain('Copied!')
      })

      vi.advanceTimersByTime(2000)
      
      await vi.waitFor(() => {
        expect(copyButton.innerHTML).toBe(originalHTML)
      })

      vi.useRealTimers()
    })

    it('should disable button during feedback', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      })

      const copyButton = document.querySelector('.share-copy-button') as HTMLButtonElement
      expect(copyButton.disabled).toBe(false)
      
      copyButton.click()

      await vi.waitFor(() => {
        expect(copyButton.disabled).toBe(true)
      })
    })

    it('should show error feedback on copy failure', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('Failed'))
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      })

      const copyButton = document.querySelector('.share-copy-button') as HTMLButtonElement
      copyButton.click()

      await vi.waitFor(() => {
        expect(copyButton.textContent).toContain('Failed')
      })
    })

    it('should copy preset URL on preset copy button click', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      })

      const presetCopyButton = document.querySelector('.share-preset-copy') as HTMLButtonElement
      presetCopyButton.click()

      await vi.waitFor(() => {
        expect(writeText).toHaveBeenCalled()
      })
    })
  })

  describe('setupShareButton', () => {
    it('should create floating share button container', () => {
      setupShareButton()
      const container = document.querySelector('.share-button-container')
      expect(container).toBeTruthy()
    })

    it('should create share button in floating container', () => {
      setupShareButton()
      const button = document.querySelector('.share-button-container .share-button')
      expect(button).toBeTruthy()
    })

    it('should append to document body', () => {
      setupShareButton()
      const container = document.body.querySelector('.share-button-container')
      expect(container).toBeTruthy()
    })
  })
})
