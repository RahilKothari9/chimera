import { describe, it, expect, beforeEach } from 'vitest'
import { createHttpStatusCodesUI } from './httpStatusCodesUI'
import { HTTP_STATUS_CODES } from './httpStatusCodes'

describe('createHttpStatusCodesUI', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = createHttpStatusCodesUI()
    document.body.appendChild(container)
  })

  it('creates a container with the correct id', () => {
    expect(container.id).toBe('http-status-dashboard')
  })

  it('renders the section title', () => {
    const title = container.querySelector('h2.section-title')
    expect(title).not.toBeNull()
    expect(title!.textContent).toContain('HTTP Status Code Reference')
  })

  it('renders a search input', () => {
    const input = container.querySelector<HTMLInputElement>('#http-status-search')
    expect(input).not.toBeNull()
  })

  it('renders category filter buttons', () => {
    const btns = container.querySelectorAll('.http-cat-btn')
    // All + 5 categories = 6
    expect(btns.length).toBe(6)
  })

  it('"All" button is active by default', () => {
    const allBtn = container.querySelector<HTMLButtonElement>('.http-cat-btn[data-category="all"]')
    expect(allBtn).not.toBeNull()
    expect(allBtn!.classList.contains('active')).toBe(true)
  })

  it('renders status code cards on mount', () => {
    const cards = container.querySelectorAll('.http-status-card')
    expect(cards.length).toBe(HTTP_STATUS_CODES.length)
  })

  it('each card shows a status code badge', () => {
    const badges = container.querySelectorAll('.http-status-badge')
    expect(badges.length).toBe(HTTP_STATUS_CODES.length)
  })

  it('each card has a copy button', () => {
    const copyBtns = container.querySelectorAll('.http-status-copy-btn')
    expect(copyBtns.length).toBe(HTTP_STATUS_CODES.length)
  })

  it('displays the total count correctly', () => {
    const countEl = container.querySelector('#http-status-count')
    expect(countEl).not.toBeNull()
    expect(countEl!.textContent).toBe(String(HTTP_STATUS_CODES.length))
  })

  it('filters cards when a category button is clicked', () => {
    const btn4xx = container.querySelector<HTMLButtonElement>('.http-cat-btn[data-category="4xx"]')!
    btn4xx.click()
    const cards = container.querySelectorAll('.http-status-card')
    const expected4xx = HTTP_STATUS_CODES.filter((s) => s.category === '4xx').length
    expect(cards.length).toBe(expected4xx)
  })

  it('marks clicked category button as active', () => {
    const btn5xx = container.querySelector<HTMLButtonElement>('.http-cat-btn[data-category="5xx"]')!
    btn5xx.click()
    expect(btn5xx.classList.contains('active')).toBe(true)
    expect(btn5xx.getAttribute('aria-pressed')).toBe('true')
  })

  it('deactivates previously active button on category change', () => {
    const allBtn = container.querySelector<HTMLButtonElement>('.http-cat-btn[data-category="all"]')!
    const btn2xx = container.querySelector<HTMLButtonElement>('.http-cat-btn[data-category="2xx"]')!
    btn2xx.click()
    expect(allBtn.classList.contains('active')).toBe(false)
    expect(allBtn.getAttribute('aria-pressed')).toBe('false')
  })

  it('filters cards when searching by code number', () => {
    const input = container.querySelector<HTMLInputElement>('#http-status-search')!
    input.value = '404'
    input.dispatchEvent(new Event('input'))
    const cards = container.querySelectorAll('.http-status-card')
    expect(cards.length).toBeGreaterThanOrEqual(1)
    const first = cards[0] as HTMLElement
    expect(first.dataset['code']).toBe('404')
  })

  it('filters cards when searching by name', () => {
    const input = container.querySelector<HTMLInputElement>('#http-status-search')!
    input.value = 'Not Found'
    input.dispatchEvent(new Event('input'))
    const cards = container.querySelectorAll('.http-status-card')
    expect(cards.length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state for no results', () => {
    const input = container.querySelector<HTMLInputElement>('#http-status-search')!
    input.value = 'zzznomatch999xyz'
    input.dispatchEvent(new Event('input'))
    const empty = container.querySelector('.http-status-empty')
    expect(empty).not.toBeNull()
  })

  it('shows all codes when search is cleared', () => {
    const input = container.querySelector<HTMLInputElement>('#http-status-search')!
    input.value = '404'
    input.dispatchEvent(new Event('input'))
    input.value = ''
    input.dispatchEvent(new Event('input'))
    const cards = container.querySelectorAll('.http-status-card')
    expect(cards.length).toBe(HTTP_STATUS_CODES.length)
  })

  it('updates count after filtering', () => {
    const input = container.querySelector<HTMLInputElement>('#http-status-search')!
    input.value = 'gateway'
    input.dispatchEvent(new Event('input'))
    const countEl = container.querySelector<HTMLElement>('#http-status-count')!
    const shownCards = container.querySelectorAll('.http-status-card').length
    expect(Number(countEl.textContent)).toBe(shownCards)
  })

  it('each card has a <details> element for more info', () => {
    const details = container.querySelectorAll('details.http-status-detail-toggle')
    expect(details.length).toBe(HTTP_STATUS_CODES.length)
  })
})
