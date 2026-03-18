/**
 * Tests for HTTP Status Codes UI
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createHttpStatusCodesUI } from './httpStatusCodesUI'
import { HTTP_STATUS_CODES } from './httpStatusCodes'

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}))

const writeTextMock = vi.fn().mockResolvedValue(undefined)
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: { writeText: writeTextMock },
  configurable: true,
})

describe('createHttpStatusCodesUI', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('returns an element with the correct id', () => {
    const el = createHttpStatusCodesUI()
    expect(el.id).toBe('http-status-codes-dashboard')
  })

  it('has a search input', () => {
    const el = createHttpStatusCodesUI()
    expect(el.querySelector('#http-status-search')).toBeTruthy()
  })

  it('has category filter buttons for all categories', () => {
    const el = createHttpStatusCodesUI()
    const btns = el.querySelectorAll('.http-cat-btn')
    expect(btns.length).toBe(6) // all, 1xx, 2xx, 3xx, 4xx, 5xx
  })

  it('"All" button is active by default', () => {
    const el = createHttpStatusCodesUI()
    const allBtn = el.querySelector<HTMLButtonElement>('[data-category="all"]')
    expect(allBtn).toBeTruthy()
    expect(allBtn!.classList.contains('active')).toBe(true)
    expect(allBtn!.getAttribute('aria-pressed')).toBe('true')
  })

  it('renders a list of status code items', () => {
    const el = createHttpStatusCodesUI()
    const items = el.querySelectorAll('.http-status-item')
    expect(items.length).toBe(HTTP_STATUS_CODES.length)
  })

  it('shows the correct count initially', () => {
    const el = createHttpStatusCodesUI()
    const countEl = el.querySelector('#http-status-count')
    expect(countEl!.textContent).toContain('63')
  })

  it('each status item has a copy button', () => {
    const el = createHttpStatusCodesUI()
    const copyBtns = el.querySelectorAll('.http-status-copy-btn')
    expect(copyBtns.length).toBe(HTTP_STATUS_CODES.length)
  })

  it('filters by category when a category button is clicked', () => {
    const el = createHttpStatusCodesUI()
    document.body.appendChild(el)

    const btn2xx = el.querySelector<HTMLButtonElement>('[data-category="2xx"]')!
    btn2xx.click()

    expect(btn2xx.classList.contains('active')).toBe(true)
    const items = el.querySelectorAll('.http-status-item')
    items.forEach((item) => {
      const code = parseInt((item as HTMLElement).dataset.code ?? '0', 10)
      expect(code).toBeGreaterThanOrEqual(200)
      expect(code).toBeLessThan(300)
    })
  })

  it('filters by 4xx category', () => {
    const el = createHttpStatusCodesUI()
    document.body.appendChild(el)

    const btn4xx = el.querySelector<HTMLButtonElement>('[data-category="4xx"]')!
    btn4xx.click()

    const items = el.querySelectorAll('.http-status-item')
    expect(items.length).toBeGreaterThan(0)
    items.forEach((item) => {
      const code = parseInt((item as HTMLElement).dataset.code ?? '0', 10)
      expect(code).toBeGreaterThanOrEqual(400)
      expect(code).toBeLessThan(500)
    })
  })

  it('filters results when search query is entered', () => {
    const el = createHttpStatusCodesUI()
    document.body.appendChild(el)

    const searchInput = el.querySelector<HTMLInputElement>('#http-status-search')!
    searchInput.value = '404'
    searchInput.dispatchEvent(new Event('input'))

    const items = el.querySelectorAll('.http-status-item')
    expect(items.length).toBeGreaterThanOrEqual(1)
    const codes = Array.from(items).map((item) =>
      parseInt((item as HTMLElement).dataset.code ?? '0', 10),
    )
    expect(codes).toContain(404)
  })

  it('shows empty state when search has no matches', () => {
    const el = createHttpStatusCodesUI()
    document.body.appendChild(el)

    const searchInput = el.querySelector<HTMLInputElement>('#http-status-search')!
    searchInput.value = 'zzz_no_match_xyz'
    searchInput.dispatchEvent(new Event('input'))

    expect(el.querySelector('.http-status-empty')).toBeTruthy()
    expect(el.querySelectorAll('.http-status-item').length).toBe(0)
  })

  it('resets to all codes when search is cleared', () => {
    const el = createHttpStatusCodesUI()
    document.body.appendChild(el)

    const searchInput = el.querySelector<HTMLInputElement>('#http-status-search')!
    searchInput.value = '404'
    searchInput.dispatchEvent(new Event('input'))
    searchInput.value = ''
    searchInput.dispatchEvent(new Event('input'))

    const items = el.querySelectorAll('.http-status-item')
    expect(items.length).toBe(HTTP_STATUS_CODES.length)
  })

  it('copy button writes to clipboard', async () => {
    const el = createHttpStatusCodesUI()
    document.body.appendChild(el)

    const copyBtn = el.querySelector<HTMLButtonElement>('.http-status-copy-btn')!
    copyBtn.click()

    await vi.waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledTimes(1)
    })

    const written = writeTextMock.mock.calls[0][0] as string
    expect(written).toMatch(/^\d{3} /)
  })

  it('copy button changes icon temporarily', async () => {
    vi.useFakeTimers()
    const el = createHttpStatusCodesUI()
    document.body.appendChild(el)

    const copyBtn = el.querySelector<HTMLButtonElement>('.http-status-copy-btn')!
    copyBtn.click()

    await Promise.resolve() // flush the clipboard promise
    expect(copyBtn.textContent).toBe('✅')

    vi.advanceTimersByTime(1600)
    expect(copyBtn.textContent).toBe('📋')

    vi.useRealTimers()
  })
})
