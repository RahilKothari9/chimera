/**
 * Tests for Regex Tester UI
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Window } from 'happy-dom'
import { setupRegexTester } from './regexTesterUI'

describe('Regex Tester UI', () => {
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

  describe('setupRegexTester', () => {
    it('should create the section element', () => {
      setupRegexTester(container)
      const section = container.querySelector('.regex-tester-section')
      expect(section).not.toBeNull()
    })

    it('should render a section title', () => {
      setupRegexTester(container)
      const title = container.querySelector('.section-title')
      expect(title).not.toBeNull()
      expect(title?.textContent).toContain('Regex Tester')
    })

    it('should render a subtitle', () => {
      setupRegexTester(container)
      const subtitle = container.querySelector('.regex-tester-subtitle')
      expect(subtitle).not.toBeNull()
    })

    it('should render the pattern input', () => {
      setupRegexTester(container)
      const input = container.querySelector<HTMLInputElement>('#regex-pattern')
      expect(input).not.toBeNull()
      expect(input?.tagName).toBe('INPUT')
    })

    it('should render the test text area', () => {
      setupRegexTester(container)
      const textarea = container.querySelector<HTMLTextAreaElement>('#regex-test-text')
      expect(textarea).not.toBeNull()
      expect(textarea?.tagName).toBe('TEXTAREA')
    })

    it('should render four flag checkboxes', () => {
      setupRegexTester(container)
      const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-flag]')
      expect(checkboxes.length).toBe(4)
    })

    it('should have global flag checked by default', () => {
      setupRegexTester(container)
      const globalCb = container.querySelector<HTMLInputElement>('input[data-flag="global"]')
      expect(globalCb?.checked).toBe(true)
    })

    it('should render the highlight output area', () => {
      setupRegexTester(container)
      const output = container.querySelector('#regex-highlight-output')
      expect(output).not.toBeNull()
    })

    it('should render the details list area', () => {
      setupRegexTester(container)
      const details = container.querySelector('#regex-details-list')
      expect(details).not.toBeNull()
    })

    it('should render the summary div', () => {
      setupRegexTester(container)
      const summary = container.querySelector('#regex-summary')
      expect(summary).not.toBeNull()
    })

    it('should render example buttons', () => {
      setupRegexTester(container)
      const buttons = container.querySelectorAll('.regex-example-btn')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should show placeholder text in highlight output when no text', () => {
      setupRegexTester(container)
      const output = container.querySelector('#regex-highlight-output')
      expect(output?.textContent).toContain('will appear here')
    })

    it('should clear the container before rendering', () => {
      container.innerHTML = '<div class="old-content">old</div>'
      setupRegexTester(container)
      expect(container.querySelector('.old-content')).toBeNull()
    })
  })

  describe('pattern matching interaction', () => {
    it('should show summary after entering a pattern and test text', () => {
      setupRegexTester(container)

      const patternInput = container.querySelector<HTMLInputElement>('#regex-pattern')!
      const textarea = container.querySelector<HTMLTextAreaElement>('#regex-test-text')!

      patternInput.value = '\\d+'
      patternInput.dispatchEvent(new Event('input'))

      textarea.value = 'hello 123 world'
      textarea.dispatchEvent(new Event('input'))

      const summary = container.querySelector('#regex-summary')
      expect(summary?.textContent).toContain('match')
    })

    it('should show error for invalid pattern', () => {
      setupRegexTester(container)

      const patternInput = container.querySelector<HTMLInputElement>('#regex-pattern')!
      patternInput.value = '[invalid'
      patternInput.dispatchEvent(new Event('input'))

      const errorEl = container.querySelector('#regex-pattern-error')
      expect(errorEl?.textContent).toContain('Invalid')
    })

    it('should show match highlight spans in output', () => {
      setupRegexTester(container)

      const patternInput = container.querySelector<HTMLInputElement>('#regex-pattern')!
      const textarea = container.querySelector<HTMLTextAreaElement>('#regex-test-text')!

      patternInput.value = 'world'
      patternInput.dispatchEvent(new Event('input'))

      textarea.value = 'hello world'
      textarea.dispatchEvent(new Event('input'))

      const highlights = container.querySelectorAll('.regex-match-highlight')
      expect(highlights.length).toBeGreaterThan(0)
      expect(highlights[0].textContent).toBe('world')
    })

    it('should show match detail cards', () => {
      setupRegexTester(container)

      const patternInput = container.querySelector<HTMLInputElement>('#regex-pattern')!
      const textarea = container.querySelector<HTMLTextAreaElement>('#regex-test-text')!

      patternInput.value = '\\d+'
      patternInput.dispatchEvent(new Event('input'))

      textarea.value = 'abc 42'
      textarea.dispatchEvent(new Event('input'))

      const cards = container.querySelectorAll('.regex-match-card')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should show empty state in details when no matches', () => {
      setupRegexTester(container)

      const patternInput = container.querySelector<HTMLInputElement>('#regex-pattern')!
      const textarea = container.querySelector<HTMLTextAreaElement>('#regex-test-text')!

      patternInput.value = 'xyz'
      patternInput.dispatchEvent(new Event('input'))

      textarea.value = 'hello world'
      textarea.dispatchEvent(new Event('input'))

      const emptyState = container.querySelector('.regex-details-empty')
      expect(emptyState).not.toBeNull()
    })
  })

  describe('example loading', () => {
    it('should load example into pattern and test text when button clicked', () => {
      setupRegexTester(container)

      const patternInput = container.querySelector<HTMLInputElement>('#regex-pattern')!
      const textarea = container.querySelector<HTMLTextAreaElement>('#regex-test-text')!
      const firstExample = container.querySelector<HTMLButtonElement>('.regex-example-btn')!

      firstExample.click()

      expect(patternInput.value).not.toBe('')
      expect(textarea.value).not.toBe('')
    })

    it('should update match results after loading an example', () => {
      setupRegexTester(container)

      const firstExample = container.querySelector<HTMLButtonElement>('.regex-example-btn')!
      firstExample.click()

      const summary = container.querySelector('#regex-summary')
      // Examples are designed to match, so summary should not say "No matches"
      expect(summary?.textContent).not.toBe('No matches found')
    })
  })

  describe('flags interaction', () => {
    it('should update flags display when flag is toggled', () => {
      setupRegexTester(container)

      const flagsDisplay = container.querySelector<HTMLElement>('#regex-flags-display')!
      const initialFlags = flagsDisplay.textContent

      const caseInsensitiveCb = container.querySelector<HTMLInputElement>('input[data-flag="caseInsensitive"]')!
      caseInsensitiveCb.checked = true
      caseInsensitiveCb.dispatchEvent(new Event('change'))

      const updatedFlags = flagsDisplay.textContent
      expect(updatedFlags).toContain('i')
      // If initial was just 'g', new should be different
      expect(updatedFlags).not.toBe(initialFlags)
    })

    it('should re-run test when flag changes', () => {
      setupRegexTester(container)

      const patternInput = container.querySelector<HTMLInputElement>('#regex-pattern')!
      const textarea = container.querySelector<HTMLTextAreaElement>('#regex-test-text')!

      patternInput.value = 'hello'
      textarea.value = 'HELLO hello'

      // With case-insensitive off (default), only one match
      textarea.dispatchEvent(new Event('input'))

      const caseInsensitiveCb = container.querySelector<HTMLInputElement>('input[data-flag="caseInsensitive"]')!
      caseInsensitiveCb.checked = true
      caseInsensitiveCb.dispatchEvent(new Event('change'))

      const summary = container.querySelector('#regex-summary')
      expect(summary?.textContent).toContain('2 matches')
    })
  })

  describe('match detail cards', () => {
    it('should show value, index, and length rows', () => {
      setupRegexTester(container)

      const patternInput = container.querySelector<HTMLInputElement>('#regex-pattern')!
      const textarea = container.querySelector<HTMLTextAreaElement>('#regex-test-text')!

      patternInput.value = 'world'
      patternInput.dispatchEvent(new Event('input'))

      textarea.value = 'hello world'
      textarea.dispatchEvent(new Event('input'))

      const rows = container.querySelectorAll('.regex-match-table th')
      const labels = Array.from(rows).map(r => r.textContent)
      expect(labels).toContain('Value')
      expect(labels).toContain('Index')
      expect(labels).toContain('Length')
    })

    it('should show capture group rows when pattern has groups', () => {
      setupRegexTester(container)

      const patternInput = container.querySelector<HTMLInputElement>('#regex-pattern')!
      const textarea = container.querySelector<HTMLTextAreaElement>('#regex-test-text')!

      patternInput.value = '(\\w+)@(\\w+)'
      patternInput.dispatchEvent(new Event('input'))

      textarea.value = 'user@host'
      textarea.dispatchEvent(new Event('input'))

      const rows = container.querySelectorAll('.regex-match-table th')
      const labels = Array.from(rows).map(r => r.textContent)
      expect(labels.some(l => l?.includes('Group'))).toBe(true)
    })

    it('should show a copy button per match card', () => {
      setupRegexTester(container)

      const patternInput = container.querySelector<HTMLInputElement>('#regex-pattern')!
      const textarea = container.querySelector<HTMLTextAreaElement>('#regex-test-text')!

      // global flag is on, will produce 2 matches
      patternInput.value = '\\d+'
      patternInput.dispatchEvent(new Event('input'))

      textarea.value = '12 34'
      textarea.dispatchEvent(new Event('input'))

      const copyBtns = container.querySelectorAll('.regex-copy-btn')
      expect(copyBtns.length).toBe(2)
    })
  })
})
