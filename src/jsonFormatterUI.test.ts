/**
 * Tests for JSON Formatter UI
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setupJsonFormatter } from './jsonFormatterUI'

// Mock dependencies
vi.mock('./notificationSystem.ts', () => ({
  notificationManager: { add: vi.fn() },
}))
vi.mock('./activityFeed.ts', () => ({
  trackActivity: vi.fn(),
}))

function makeContainer(): HTMLElement {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

describe('JSON Formatter UI', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = makeContainer()
  })

  describe('setupJsonFormatter', () => {
    it('should render the section into the container', () => {
      setupJsonFormatter(container)
      expect(container.querySelector('.json-formatter-section')).not.toBeNull()
    })

    it('should do nothing when container is null/undefined', () => {
      expect(() => setupJsonFormatter(null as unknown as HTMLElement)).not.toThrow()
    })

    it('should render a section title', () => {
      setupJsonFormatter(container)
      const title = container.querySelector('.section-title')
      expect(title).not.toBeNull()
      expect(title!.textContent).toContain('JSON')
    })

    it('should render a textarea for input', () => {
      setupJsonFormatter(container)
      const textarea = container.querySelector<HTMLTextAreaElement>('#json-input')
      expect(textarea).not.toBeNull()
    })

    it('should render Format button', () => {
      setupJsonFormatter(container)
      const btn = container.querySelector('.json-format-btn')
      expect(btn).not.toBeNull()
    })

    it('should render Minify button', () => {
      setupJsonFormatter(container)
      const btn = container.querySelector('.json-minify-btn')
      expect(btn).not.toBeNull()
    })

    it('should render Sort Keys button', () => {
      setupJsonFormatter(container)
      const btn = container.querySelector('.json-sort-btn')
      expect(btn).not.toBeNull()
    })

    it('should render Repair button', () => {
      setupJsonFormatter(container)
      const btn = container.querySelector('.json-repair-btn')
      expect(btn).not.toBeNull()
    })

    it('should render output area', () => {
      setupJsonFormatter(container)
      const output = container.querySelector('#json-output')
      expect(output).not.toBeNull()
    })

    it('should render example selector', () => {
      setupJsonFormatter(container)
      const sel = container.querySelector<HTMLSelectElement>('.json-examples-select')
      expect(sel).not.toBeNull()
      // Should have at least the placeholder option + examples
      expect(sel!.options.length).toBeGreaterThan(1)
    })

    it('should render diff section', () => {
      setupJsonFormatter(container)
      expect(container.querySelector('.json-diff-section')).not.toBeNull()
    })

    it('should render two textareas for diff', () => {
      setupJsonFormatter(container)
      const areas = container.querySelectorAll('.json-diff-a, .json-diff-b')
      expect(areas.length).toBe(2)
    })

    it('should render Compare button', () => {
      setupJsonFormatter(container)
      const btn = container.querySelector('.json-diff-btn')
      expect(btn).not.toBeNull()
    })
  })

  describe('Format button', () => {
    it('should display formatted JSON on valid input', () => {
      setupJsonFormatter(container)
      const input = container.querySelector<HTMLTextAreaElement>('#json-input')!
      const formatBtn = container.querySelector<HTMLButtonElement>('.json-format-btn')!
      const output = container.querySelector<HTMLElement>('#json-output')!

      input.value = '{"a":1}'
      formatBtn.click()

      expect(output.querySelector('pre')).not.toBeNull()
      expect(output.textContent).toContain('"a"')
    })

    it('should display error message for invalid input', () => {
      setupJsonFormatter(container)
      const input = container.querySelector<HTMLTextAreaElement>('#json-input')!
      const formatBtn = container.querySelector<HTMLButtonElement>('.json-format-btn')!
      const output = container.querySelector<HTMLElement>('#json-output')!

      input.value = '{bad json}'
      formatBtn.click()

      expect(output.querySelector('.json-error-msg')).not.toBeNull()
    })

    it('should show stats after formatting valid JSON', () => {
      setupJsonFormatter(container)
      const input = container.querySelector<HTMLTextAreaElement>('#json-input')!
      const formatBtn = container.querySelector<HTMLButtonElement>('.json-format-btn')!
      const stats = container.querySelector<HTMLElement>('#json-stats')!

      input.value = '{"x":1}'
      formatBtn.click()

      expect(stats.style.display).not.toBe('none')
    })

    it('should show copy button after formatting', () => {
      setupJsonFormatter(container)
      const input = container.querySelector<HTMLTextAreaElement>('#json-input')!
      const formatBtn = container.querySelector<HTMLButtonElement>('.json-format-btn')!
      const copyBtn = container.querySelector<HTMLButtonElement>('.json-copy-btn')!

      input.value = '{"a":1}'
      formatBtn.click()

      expect(copyBtn.style.display).not.toBe('none')
    })
  })

  describe('Minify button', () => {
    it('should minify formatted JSON', () => {
      setupJsonFormatter(container)
      const input = container.querySelector<HTMLTextAreaElement>('#json-input')!
      const minifyBtn = container.querySelector<HTMLButtonElement>('.json-minify-btn')!
      const output = container.querySelector<HTMLElement>('#json-output')!

      input.value = '{\n  "a": 1\n}'
      minifyBtn.click()

      expect(output.textContent).toContain('{"a":1}')
    })
  })

  describe('Sort Keys button', () => {
    it('should sort keys alphabetically', () => {
      setupJsonFormatter(container)
      const input = container.querySelector<HTMLTextAreaElement>('#json-input')!
      const sortBtn = container.querySelector<HTMLButtonElement>('.json-sort-btn')!
      const output = container.querySelector<HTMLElement>('#json-output')!

      input.value = '{"z":3,"a":1,"m":2}'
      sortBtn.click()

      const text = output.textContent || ''
      expect(text.indexOf('"a"')).toBeLessThan(text.indexOf('"m"'))
      expect(text.indexOf('"m"')).toBeLessThan(text.indexOf('"z"'))
    })
  })

  describe('Clear button', () => {
    it('should clear the input', () => {
      setupJsonFormatter(container)
      const input = container.querySelector<HTMLTextAreaElement>('#json-input')!
      const clearBtn = container.querySelector<HTMLButtonElement>('.json-clear-btn')!

      input.value = '{"a":1}'
      clearBtn.click()

      expect(input.value).toBe('')
    })

    it('should reset the output placeholder', () => {
      setupJsonFormatter(container)
      const input = container.querySelector<HTMLTextAreaElement>('#json-input')!
      const formatBtn = container.querySelector<HTMLButtonElement>('.json-format-btn')!
      const clearBtn = container.querySelector<HTMLButtonElement>('.json-clear-btn')!
      const output = container.querySelector<HTMLElement>('#json-output')!

      input.value = '{"a":1}'
      formatBtn.click()
      clearBtn.click()

      expect(output.querySelector('.json-placeholder')).not.toBeNull()
    })
  })

  describe('Compare (diff) button', () => {
    it('should report identical JSON', () => {
      setupJsonFormatter(container)
      const diffA = container.querySelector<HTMLTextAreaElement>('.json-diff-a')!
      const diffB = container.querySelector<HTMLTextAreaElement>('.json-diff-b')!
      const diffBtn = container.querySelector<HTMLButtonElement>('.json-diff-btn')!
      const diffResult = container.querySelector<HTMLElement>('#json-diff-result')!

      diffA.value = '{"a":1}'
      diffB.value = '{"a":1}'
      diffBtn.click()

      expect(diffResult.textContent).toContain('identical')
    })

    it('should show differences between JSON values', () => {
      setupJsonFormatter(container)
      const diffA = container.querySelector<HTMLTextAreaElement>('.json-diff-a')!
      const diffB = container.querySelector<HTMLTextAreaElement>('.json-diff-b')!
      const diffBtn = container.querySelector<HTMLButtonElement>('.json-diff-btn')!
      const diffResult = container.querySelector<HTMLElement>('#json-diff-result')!

      diffA.value = '{"a":1}'
      diffB.value = '{"a":2}'
      diffBtn.click()

      expect(diffResult.querySelector('.json-diff-row')).not.toBeNull()
    })

    it('should show error message when inputs are not valid JSON', () => {
      setupJsonFormatter(container)
      const diffA = container.querySelector<HTMLTextAreaElement>('.json-diff-a')!
      const diffB = container.querySelector<HTMLTextAreaElement>('.json-diff-b')!
      const diffBtn = container.querySelector<HTMLButtonElement>('.json-diff-btn')!
      const diffResult = container.querySelector<HTMLElement>('#json-diff-result')!

      diffA.value = '{bad}'
      diffB.value = '{"a":1}'
      diffBtn.click()

      expect(diffResult.querySelector('.json-error-msg')).not.toBeNull()
    })
  })

  describe('Example selector', () => {
    it('should load example JSON into input', () => {
      setupJsonFormatter(container)
      const input = container.querySelector<HTMLTextAreaElement>('#json-input')!
      const sel = container.querySelector<HTMLSelectElement>('.json-examples-select')!

      sel.value = '0'
      sel.dispatchEvent(new Event('change'))

      expect(input.value.trim().length).toBeGreaterThan(0)
    })
  })
})
