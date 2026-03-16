import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createColorConverterUI } from './colorConverterUI.ts'

// Mock activity feed
vi.mock('./activityFeed.ts', () => ({
  trackActivity: vi.fn(),
}))

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  configurable: true,
})

function getSection(): HTMLElement {
  return createColorConverterUI()
}

describe('createColorConverterUI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns an HTMLElement', () => {
    const el = getSection()
    expect(el).toBeInstanceOf(HTMLElement)
  })

  it('contains the section title', () => {
    const el = getSection()
    expect(el.querySelector('.section-title')?.textContent).toContain('Color Converter')
  })

  it('renders a color picker input', () => {
    const el = getSection()
    const picker = el.querySelector<HTMLInputElement>('#color-picker')
    expect(picker).not.toBeNull()
    expect(picker?.type).toBe('color')
  })

  it('renders a text input', () => {
    const el = getSection()
    const textInput = el.querySelector<HTMLInputElement>('#color-text-input')
    expect(textInput).not.toBeNull()
    expect(textInput?.type).toBe('text')
  })

  it('renders a preview swatch element', () => {
    const el = getSection()
    expect(el.querySelector('#color-preview-swatch')).not.toBeNull()
  })

  it('renders an error element (hidden initially)', () => {
    const el = getSection()
    const error = el.querySelector<HTMLParagraphElement>('#color-converter-error')
    expect(error).not.toBeNull()
    expect(error?.hidden).toBe(true)
  })

  it('renders initial results for the default color', () => {
    const el = getSection()
    const results = el.querySelector('#color-converter-results')
    expect(results?.innerHTML).not.toBe('')
  })

  it('shows all four format labels in results', () => {
    const el = getSection()
    const text = el.querySelector('#color-converter-results')?.textContent ?? ''
    expect(text).toContain('HEX')
    expect(text).toContain('RGB')
    expect(text).toContain('HSL')
    expect(text).toContain('HSV')
  })

  it('renders four copy buttons', () => {
    const el = getSection()
    const copyBtns = el.querySelectorAll('.color-copy-btn')
    expect(copyBtns.length).toBe(4)
  })

  it('shows an error for invalid text input', () => {
    const el = getSection()
    const textInput = el.querySelector<HTMLInputElement>('#color-text-input')!
    const errorEl = el.querySelector<HTMLParagraphElement>('#color-converter-error')!

    textInput.value = 'not-a-color'
    textInput.dispatchEvent(new Event('input'))

    expect(errorEl.hidden).toBe(false)
    expect(errorEl.textContent).toContain('Cannot parse')
  })

  it('updates results when a valid hex is typed', () => {
    const el = getSection()
    const textInput = el.querySelector<HTMLInputElement>('#color-text-input')!
    const errorEl = el.querySelector<HTMLParagraphElement>('#color-converter-error')!

    textInput.value = '#ff0000'
    textInput.dispatchEvent(new Event('input'))

    expect(errorEl.hidden).toBe(true)
    const results = el.querySelector('#color-converter-results')
    expect(results?.textContent).toContain('#ff0000')
  })

  it('updates results when an rgb() string is typed', () => {
    const el = getSection()
    const textInput = el.querySelector<HTMLInputElement>('#color-text-input')!

    textInput.value = 'rgb(0, 128, 255)'
    textInput.dispatchEvent(new Event('input'))

    const results = el.querySelector('#color-converter-results')
    expect(results?.textContent).toContain('rgb(0, 128, 255)')
  })

  it('syncs the picker value when valid text is entered', () => {
    const el = getSection()
    const textInput = el.querySelector<HTMLInputElement>('#color-text-input')!
    const picker = el.querySelector<HTMLInputElement>('#color-picker')!

    textInput.value = '#00ff00'
    textInput.dispatchEvent(new Event('input'))

    expect(picker.value).toBe('#00ff00')
  })

  it('updates the text input and results when the picker fires', () => {
    const el = getSection()
    const picker = el.querySelector<HTMLInputElement>('#color-picker')!
    const textInput = el.querySelector<HTMLInputElement>('#color-text-input')!

    picker.value = '#0000ff'
    picker.dispatchEvent(new Event('input'))

    expect(textInput.value).toBe('#0000ff')
    const results = el.querySelector('#color-converter-results')
    expect(results?.textContent).toContain('#0000ff')
  })
})
