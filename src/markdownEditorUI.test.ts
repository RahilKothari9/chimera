/**
 * Tests for Markdown Editor UI
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Window } from 'happy-dom'
import { setupMarkdownEditor } from './markdownEditorUI'

describe('Markdown Editor UI', () => {
  let container: HTMLElement

  beforeEach(() => {
    const window = new Window()
    global.document = window.document as unknown as Document
    global.window = window as unknown as Window & typeof globalThis
    global.navigator = {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    } as unknown as Navigator

    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  describe('setupMarkdownEditor', () => {
    it('should create the section element', () => {
      setupMarkdownEditor(container)
      const section = container.querySelector('.markdown-editor-section')
      expect(section).not.toBeNull()
    })

    it('should render a section title', () => {
      setupMarkdownEditor(container)
      const title = container.querySelector('.section-title')
      expect(title).not.toBeNull()
      expect(title?.textContent).toContain('Markdown Editor')
    })

    it('should render a subtitle', () => {
      setupMarkdownEditor(container)
      const sub = container.querySelector('.markdown-editor-subtitle')
      expect(sub).not.toBeNull()
    })

    it('should render the textarea', () => {
      setupMarkdownEditor(container)
      const ta = container.querySelector<HTMLTextAreaElement>('#md-editor-textarea')
      expect(ta).not.toBeNull()
      expect(ta?.tagName).toBe('TEXTAREA')
    })

    it('should pre-populate the textarea with initial content', () => {
      setupMarkdownEditor(container)
      const ta = container.querySelector<HTMLTextAreaElement>('#md-editor-textarea')
      expect(ta?.value).toContain('Welcome to the Markdown Editor')
    })

    it('should render the preview pane', () => {
      setupMarkdownEditor(container)
      const preview = container.querySelector('#md-preview')
      expect(preview).not.toBeNull()
    })

    it('should render the initial content in the preview', () => {
      setupMarkdownEditor(container)
      const preview = container.querySelector('#md-preview')
      expect(preview?.innerHTML).toContain('<h1>')
    })

    it('should render the toolbar', () => {
      setupMarkdownEditor(container)
      const toolbar = container.querySelector('.markdown-toolbar')
      expect(toolbar).not.toBeNull()
    })

    it('should render bold toolbar button', () => {
      setupMarkdownEditor(container)
      const btn = container.querySelector<HTMLButtonElement>('[data-action="bold"]')
      expect(btn).not.toBeNull()
    })

    it('should render italic toolbar button', () => {
      setupMarkdownEditor(container)
      const btn = container.querySelector<HTMLButtonElement>('[data-action="italic"]')
      expect(btn).not.toBeNull()
    })

    it('should render heading toolbar buttons', () => {
      setupMarkdownEditor(container)
      expect(container.querySelector('[data-action="h1"]')).not.toBeNull()
      expect(container.querySelector('[data-action="h2"]')).not.toBeNull()
      expect(container.querySelector('[data-action="h3"]')).not.toBeNull()
    })

    it('should render code and codeblock buttons', () => {
      setupMarkdownEditor(container)
      expect(container.querySelector('[data-action="code"]')).not.toBeNull()
      expect(container.querySelector('[data-action="codeblock"]')).not.toBeNull()
    })

    it('should render list and quote buttons', () => {
      setupMarkdownEditor(container)
      expect(container.querySelector('[data-action="ul"]')).not.toBeNull()
      expect(container.querySelector('[data-action="ol"]')).not.toBeNull()
      expect(container.querySelector('[data-action="quote"]')).not.toBeNull()
    })

    it('should render a template selector', () => {
      setupMarkdownEditor(container)
      const sel = container.querySelector<HTMLSelectElement>('.md-template-select')
      expect(sel).not.toBeNull()
      expect(sel?.tagName).toBe('SELECT')
    })

    it('should list templates as options', () => {
      setupMarkdownEditor(container)
      const options = container.querySelectorAll('.md-template-select option')
      expect(options.length).toBeGreaterThan(1) // includes "Templates…" placeholder
    })

    it('should render the stats bar', () => {
      setupMarkdownEditor(container)
      const stats = container.querySelector('.markdown-stats')
      expect(stats).not.toBeNull()
    })

    it('should show word count in stats', () => {
      setupMarkdownEditor(container)
      const words = container.querySelector('#md-stat-words')
      expect(words).not.toBeNull()
      expect(Number(words?.textContent)).toBeGreaterThan(0)
    })

    it('should show character count in stats', () => {
      setupMarkdownEditor(container)
      const chars = container.querySelector('#md-stat-chars')
      expect(Number(chars?.textContent)).toBeGreaterThan(0)
    })

    it('should render copy-source and copy-html buttons', () => {
      setupMarkdownEditor(container)
      expect(container.querySelector('#md-copy-source')).not.toBeNull()
      expect(container.querySelector('#md-copy-html')).not.toBeNull()
    })

    it('should update preview when textarea input fires', () => {
      setupMarkdownEditor(container)
      const ta = container.querySelector<HTMLTextAreaElement>('#md-editor-textarea')!
      const preview = container.querySelector<HTMLElement>('#md-preview')!

      ta.value = '# Dynamic Heading'
      ta.dispatchEvent(new Event('input'))
      expect(preview.innerHTML).toContain('<h1>')
      expect(preview.innerHTML).toContain('Dynamic Heading')
    })

    it('should update stats when textarea input fires', () => {
      setupMarkdownEditor(container)
      const ta = container.querySelector<HTMLTextAreaElement>('#md-editor-textarea')!
      const words = container.querySelector<HTMLElement>('#md-stat-words')!

      ta.value = 'one two three'
      ta.dispatchEvent(new Event('input'))
      expect(words.textContent).toBe('3')
    })
  })
})
