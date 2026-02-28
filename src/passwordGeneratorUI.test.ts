import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPasswordGeneratorUI, setupPasswordGenerator } from './passwordGeneratorUI'

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}))

describe('Password Generator UI', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  describe('createPasswordGeneratorUI', () => {
    it('creates a container with the correct id', () => {
      const el = createPasswordGeneratorUI()
      expect(el.id).toBe('password-generator-dashboard')
    })

    it('contains a section title', () => {
      const el = createPasswordGeneratorUI()
      expect(el.querySelector('.section-title')?.textContent).toContain('Password Generator')
    })

    it('contains a length slider', () => {
      const el = createPasswordGeneratorUI()
      const slider = el.querySelector<HTMLInputElement>('#pw-length-input')
      expect(slider).not.toBeNull()
      expect(slider?.type).toBe('range')
    })

    it('length slider default value is 16', () => {
      const el = createPasswordGeneratorUI()
      const slider = el.querySelector<HTMLInputElement>('#pw-length-input')!
      expect(slider.value).toBe('16')
    })

    it('contains uppercase, lowercase, numbers checkboxes checked by default', () => {
      const el = createPasswordGeneratorUI()
      expect((el.querySelector<HTMLInputElement>('#pw-uppercase')!).checked).toBe(true)
      expect((el.querySelector<HTMLInputElement>('#pw-lowercase')!).checked).toBe(true)
      expect((el.querySelector<HTMLInputElement>('#pw-numbers')!).checked).toBe(true)
    })

    it('contains symbols and exclude-ambiguous checkboxes unchecked by default', () => {
      const el = createPasswordGeneratorUI()
      expect((el.querySelector<HTMLInputElement>('#pw-symbols')!).checked).toBe(false)
      expect((el.querySelector<HTMLInputElement>('#pw-exclude-ambiguous')!).checked).toBe(false)
    })

    it('contains a count select with 4 options', () => {
      const el = createPasswordGeneratorUI()
      const select = el.querySelector<HTMLSelectElement>('#pw-count-input')!
      expect(select).not.toBeNull()
      expect(select.options.length).toBe(4)
    })

    it('contains a generate button', () => {
      const el = createPasswordGeneratorUI()
      expect(el.querySelector('#pw-generate-btn')).not.toBeNull()
    })

    it('contains a results list placeholder initially', () => {
      const el = createPasswordGeneratorUI()
      const list = el.querySelector('#pw-results-list')!
      expect(list.textContent).toContain('Generate')
    })
  })

  describe('generate button', () => {
    it('populates results list after clicking generate', () => {
      const el = createPasswordGeneratorUI()
      document.body.appendChild(el)
      const btn = el.querySelector<HTMLButtonElement>('#pw-generate-btn')!
      btn.click()
      const resultCards = el.querySelectorAll('.pw-result-card')
      expect(resultCards.length).toBeGreaterThan(0)
    })

    it('generates 3 passwords when count is set to 3', () => {
      const el = createPasswordGeneratorUI()
      document.body.appendChild(el)
      const select = el.querySelector<HTMLSelectElement>('#pw-count-input')!
      select.value = '3'
      el.querySelector<HTMLButtonElement>('#pw-generate-btn')!.click()
      expect(el.querySelectorAll('.pw-result-card').length).toBe(3)
    })

    it('shows error when no charset selected', () => {
      const el = createPasswordGeneratorUI()
      document.body.appendChild(el)
      ;(el.querySelector<HTMLInputElement>('#pw-uppercase')!).checked = false
      ;(el.querySelector<HTMLInputElement>('#pw-lowercase')!).checked = false
      ;(el.querySelector<HTMLInputElement>('#pw-numbers')!).checked = false
      el.querySelector<HTMLButtonElement>('#pw-generate-btn')!.click()
      expect(el.querySelector('#pw-results-list')?.textContent).toContain('Select at least one character set')
    })

    it('each result card contains a copy button', () => {
      const el = createPasswordGeneratorUI()
      document.body.appendChild(el)
      el.querySelector<HTMLButtonElement>('#pw-generate-btn')!.click()
      const copyBtns = el.querySelectorAll('.pw-copy-btn')
      expect(copyBtns.length).toBeGreaterThan(0)
    })

    it('each result card contains strength bar', () => {
      const el = createPasswordGeneratorUI()
      document.body.appendChild(el)
      el.querySelector<HTMLButtonElement>('#pw-generate-btn')!.click()
      const bars = el.querySelectorAll('.pw-strength-bar-track')
      expect(bars.length).toBeGreaterThan(0)
    })

    it('each result card contains entropy info', () => {
      const el = createPasswordGeneratorUI()
      document.body.appendChild(el)
      el.querySelector<HTMLButtonElement>('#pw-generate-btn')!.click()
      const entropy = el.querySelectorAll('.pw-entropy')
      expect(entropy.length).toBeGreaterThan(0)
      expect(entropy[0].textContent).toContain('bits entropy')
    })
  })

  describe('length slider', () => {
    it('updates the length display when slider changes', () => {
      const el = createPasswordGeneratorUI()
      document.body.appendChild(el)
      const slider = el.querySelector<HTMLInputElement>('#pw-length-input')!
      const display = el.querySelector<HTMLElement>('#pw-length-display')!
      slider.value = '32'
      slider.dispatchEvent(new Event('input'))
      expect(display.textContent).toBe('32')
    })
  })

  describe('setupPasswordGenerator', () => {
    it('clears container and appends the dashboard', () => {
      const container = document.createElement('div')
      container.innerHTML = '<p>old content</p>'
      document.body.appendChild(container)
      setupPasswordGenerator(container)
      expect(container.innerHTML).not.toContain('old content')
      expect(container.querySelector('#password-generator-dashboard')).not.toBeNull()
    })
  })
})
