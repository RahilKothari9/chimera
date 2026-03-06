import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTimestampConverterUI } from './timestampConverterUI'

// Stub navigator.clipboard
const writeText = vi.fn().mockResolvedValue(undefined)
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText },
  configurable: true,
})

// Fix Date.now to a known value so relative times are deterministic
const FIXED_NOW_MS = 1767225600000 // 2026-01-01T00:00:00.000Z
const KNOWN_EPOCH_S = 1767225600

describe('createTimestampConverterUI', () => {
  let container: HTMLElement

  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(FIXED_NOW_MS)
    container = createTimestampConverterUI()
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
    writeText.mockClear()
  })

  it('renders the section title', () => {
    expect(container.querySelector('.section-title')?.textContent).toContain('Unix Timestamp Converter')
  })

  it('renders the Unix input', () => {
    expect(container.querySelector('#tsc-unix-input')).toBeTruthy()
  })

  it('renders the datetime-local input', () => {
    const el = container.querySelector<HTMLInputElement>('#tsc-date-input')
    expect(el).toBeTruthy()
    expect(el?.type).toBe('datetime-local')
  })

  it('shows placeholder text in results area initially', () => {
    const results = container.querySelector('#tsc-results')
    expect(results?.textContent).toMatch(/enter a timestamp/i)
  })

  it('converts a Unix timestamp on input', () => {
    const input = container.querySelector<HTMLInputElement>('#tsc-unix-input')!
    input.value = String(KNOWN_EPOCH_S)
    input.dispatchEvent(new Event('input', { bubbles: true }))

    const results = container.querySelector('#tsc-results')!
    expect(results.textContent).toContain(String(KNOWN_EPOCH_S))
    expect(results.textContent).toContain('2026-01-01T00:00:00.000Z')
  })

  it('shows unit badge after Unix conversion', () => {
    const input = container.querySelector<HTMLInputElement>('#tsc-unix-input')!
    input.value = String(KNOWN_EPOCH_S)
    input.dispatchEvent(new Event('input', { bubbles: true }))

    const badge = container.querySelector<HTMLDivElement>('#tsc-unit-badge')!
    expect(badge.hidden).toBe(false)
    expect(badge.textContent).toContain('seconds')
  })

  it('detects milliseconds for 13-digit timestamp', () => {
    const input = container.querySelector<HTMLInputElement>('#tsc-unix-input')!
    input.value = String(KNOWN_EPOCH_S * 1000)
    input.dispatchEvent(new Event('input', { bubbles: true }))

    const badge = container.querySelector<HTMLDivElement>('#tsc-unit-badge')!
    expect(badge.textContent).toContain('milliseconds')
  })

  it('shows an error for invalid Unix input', () => {
    const input = container.querySelector<HTMLInputElement>('#tsc-unix-input')!
    input.value = 'not-a-number'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    const errorEl = container.querySelector<HTMLDivElement>('#tsc-unix-error')!
    expect(errorEl.hidden).toBe(false)
    expect(errorEl.textContent?.length).toBeGreaterThan(0)
  })

  it('converts a datetime-local value on input', () => {
    const input = container.querySelector<HTMLInputElement>('#tsc-date-input')!
    input.value = '2026-01-01T00:00:00'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    const results = container.querySelector('#tsc-results')!
    expect(results.textContent).toBeTruthy()
    // Unix seconds should appear somewhere
    const unixInput = container.querySelector<HTMLInputElement>('#tsc-unix-input')!
    expect(unixInput.value).toBeTruthy()
    expect(Number(unixInput.value)).toBeGreaterThan(0)
  })

  it('"Now" button on unix sets current seconds', () => {
    const btn = container.querySelector<HTMLButtonElement>('#tsc-now-unix-btn')!
    btn.click()

    const input = container.querySelector<HTMLInputElement>('#tsc-unix-input')!
    expect(input.value).toBe(String(Math.floor(FIXED_NOW_MS / 1000)))
  })

  it('"Now" button on date sets datetime-local to current time', () => {
    const btn = container.querySelector<HTMLButtonElement>('#tsc-now-date-btn')!
    btn.click()

    const input = container.querySelector<HTMLInputElement>('#tsc-date-input')!
    expect(input.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
  })

  it('"Set to Now" button populates both inputs', () => {
    const btn = container.querySelector<HTMLButtonElement>('#tsc-now-all-btn')!
    btn.click()

    const unix = container.querySelector<HTMLInputElement>('#tsc-unix-input')!
    const date = container.querySelector<HTMLInputElement>('#tsc-date-input')!
    expect(unix.value).toBeTruthy()
    expect(date.value).toBeTruthy()
  })

  it('"Clear" button resets all fields', () => {
    // Populate first
    const unix = container.querySelector<HTMLInputElement>('#tsc-unix-input')!
    unix.value = String(KNOWN_EPOCH_S)
    unix.dispatchEvent(new Event('input', { bubbles: true }))

    // Now clear
    container.querySelector<HTMLButtonElement>('#tsc-clear-btn')!.click()

    expect(unix.value).toBe('')
    expect(container.querySelector<HTMLInputElement>('#tsc-date-input')!.value).toBe('')
    expect(container.querySelector('#tsc-results')?.textContent).toMatch(/enter a timestamp/i)
  })

  it('renders a results table with the ISO format row', () => {
    const input = container.querySelector<HTMLInputElement>('#tsc-unix-input')!
    input.value = String(KNOWN_EPOCH_S)
    input.dispatchEvent(new Event('input', { bubbles: true }))

    const table = container.querySelector('.tsc-table')
    expect(table).toBeTruthy()
    expect(table?.textContent).toContain('ISO 8601')
    expect(table?.textContent).toContain('2026-01-01T00:00:00.000Z')
  })

  it('clicking a copy button calls clipboard.writeText', async () => {
    const input = container.querySelector<HTMLInputElement>('#tsc-unix-input')!
    input.value = String(KNOWN_EPOCH_S)
    input.dispatchEvent(new Event('input', { bubbles: true }))

    const copyBtn = container.querySelector<HTMLButtonElement>('.tsc-copy-btn')
    expect(copyBtn).toBeTruthy()
    copyBtn!.click()

    // Allow microtask queue to drain
    await Promise.resolve()
    expect(writeText).toHaveBeenCalled()
  })

  it('clears error when input is emptied', () => {
    const input = container.querySelector<HTMLInputElement>('#tsc-unix-input')!
    input.value = 'bad'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(container.querySelector<HTMLDivElement>('#tsc-unix-error')!.hidden).toBe(false)

    input.value = ''
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(container.querySelector<HTMLDivElement>('#tsc-unix-error')!.hidden).toBe(true)
  })

  it('syncs unix input when date input changes', () => {
    const dateIn = container.querySelector<HTMLInputElement>('#tsc-date-input')!
    dateIn.value = '2026-01-01T00:00:00'
    dateIn.dispatchEvent(new Event('input', { bubbles: true }))

    const unixIn = container.querySelector<HTMLInputElement>('#tsc-unix-input')!
    // Should be a non-empty integer string
    expect(/^\d+$/.test(unixIn.value)).toBe(true)
  })

  it('syncs date input when unix input changes', () => {
    const unixIn = container.querySelector<HTMLInputElement>('#tsc-unix-input')!
    unixIn.value = String(KNOWN_EPOCH_S)
    unixIn.dispatchEvent(new Event('input', { bubbles: true }))

    const dateIn = container.querySelector<HTMLInputElement>('#tsc-date-input')!
    expect(dateIn.value).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
