/**
 * Tests for Color Palette Generator UI
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Window } from 'happy-dom'
import { setupColorPalette } from './colorPaletteUI'

vi.mock('./notificationSystem', () => ({
  notificationManager: { show: vi.fn() },
}))

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
  initializeActivityFeed: vi.fn(),
  getActivityFeed: vi.fn(() => []),
}))

describe('Color Palette Generator UI', () => {
  let container: HTMLElement

  beforeEach(() => {
    const window = new Window()
    global.document = window.document as unknown as Document
    global.window = window as unknown as Window & typeof globalThis
    global.navigator = {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    } as any

    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  describe('setupColorPalette', () => {
    it('renders the wrapper element', () => {
      setupColorPalette(container)
      expect(container.querySelector('.color-palette-wrapper')).not.toBeNull()
    })

    it('renders a section title containing "Color Palette"', () => {
      setupColorPalette(container)
      const title = container.querySelector('.section-title')
      expect(title).not.toBeNull()
      expect(title?.textContent).toContain('Color Palette')
    })

    it('renders a subtitle', () => {
      setupColorPalette(container)
      expect(container.querySelector('.color-palette-subtitle')).not.toBeNull()
    })

    it('renders the native color picker input', () => {
      setupColorPalette(container)
      const picker = container.querySelector<HTMLInputElement>('#cp-color-picker')
      expect(picker).not.toBeNull()
      expect(picker?.type).toBe('color')
    })

    it('renders the hex text input with default value', () => {
      setupColorPalette(container)
      const hexInput = container.querySelector<HTMLInputElement>('#cp-hex-input')
      expect(hexInput).not.toBeNull()
      expect(hexInput?.value).toBe('#6366f1')
    })

    it('renders the palette type select with 6 options', () => {
      setupColorPalette(container)
      const select = container.querySelector<HTMLSelectElement>('#cp-palette-type')
      expect(select).not.toBeNull()
      expect(select?.options.length).toBe(6)
    })

    it('renders preset color buttons', () => {
      setupColorPalette(container)
      const presets = container.querySelectorAll('.cp-preset')
      expect(presets.length).toBeGreaterThan(0)
    })

    it('renders the palette output container', () => {
      setupColorPalette(container)
      expect(container.querySelector('#cp-palette-output')).not.toBeNull()
    })

    it('renders color cards in the output after setup', () => {
      setupColorPalette(container)
      const cards = container.querySelectorAll('.palette-color-card')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('each color card has a swatch element', () => {
      setupColorPalette(container)
      const swatches = container.querySelectorAll('.palette-swatch')
      expect(swatches.length).toBeGreaterThan(0)
    })

    it('each color card has copy buttons', () => {
      setupColorPalette(container)
      const copyBtns = container.querySelectorAll('.palette-copy-btn')
      expect(copyBtns.length).toBeGreaterThan(0)
    })

    it('renders the contrast checker section', () => {
      setupColorPalette(container)
      expect(container.querySelector('.contrast-checker')).not.toBeNull()
    })

    it('renders a contrast table with header row', () => {
      setupColorPalette(container)
      const thead = container.querySelector('.contrast-table thead')
      expect(thead).not.toBeNull()
    })

    it('renders WCAG badge elements in the contrast table', () => {
      setupColorPalette(container)
      const badges = container.querySelectorAll('.wcag-badge')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('renders a palette type badge after initial generation', () => {
      setupColorPalette(container)
      expect(container.querySelector('.cp-palette-type-badge')).not.toBeNull()
    })

    it('renders a color count label after initial generation', () => {
      setupColorPalette(container)
      const count = container.querySelector('.cp-palette-count')
      expect(count).not.toBeNull()
      expect(count?.textContent).toContain('color')
    })

    it('clicking a preset updates the hex input', () => {
      setupColorPalette(container)
      const preset = container.querySelector<HTMLButtonElement>('.cp-preset')!
      const expectedHex = preset.dataset.hex!
      preset.click()
      const hexInput = container.querySelector<HTMLInputElement>('#cp-hex-input')!
      expect(hexInput.value).toBe(expectedHex)
    })

    it('changing the palette type re-renders the output', () => {
      setupColorPalette(container)
      const select = container.querySelector<HTMLSelectElement>('#cp-palette-type')!
      // Switch to triadic
      select.value = 'triadic'
      select.dispatchEvent(new Event('change'))
      const badge = container.querySelector('.cp-palette-type-badge')
      expect(badge?.textContent).toContain('Triadic')
    })

    it('clicking a copy button invokes clipboard.writeText', async () => {
      setupColorPalette(container)
      const btn = container.querySelector<HTMLButtonElement>('.palette-copy-btn')!
      btn.click()
      await Promise.resolve()
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })

    it('monochromatic palette renders 5 color cards', () => {
      setupColorPalette(container)
      const select = container.querySelector<HTMLSelectElement>('#cp-palette-type')!
      select.value = 'monochromatic'
      select.dispatchEvent(new Event('change'))
      const cards = container.querySelectorAll('.palette-color-card')
      expect(cards.length).toBe(5)
    })

    it('each color card has HEX, RGB, and HSL value rows', () => {
      setupColorPalette(container)
      const firstCard = container.querySelector('.palette-color-card')!
      const rows = firstCard.querySelectorAll('.palette-value-row')
      expect(rows.length).toBe(3)
    })

    it('color card data-hex attribute is a valid hex color', () => {
      setupColorPalette(container)
      const card = container.querySelector<HTMLElement>('.palette-color-card')!
      expect(card.dataset.hex).toMatch(/^#[0-9a-f]{6}$/)
    })
  })
})
