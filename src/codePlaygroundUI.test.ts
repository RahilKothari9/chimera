/**
 * Tests for Code Playground UI
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createCodePlaygroundUI } from './codePlaygroundUI'
import { saveSnippet, clearAllSnippets } from './codePlayground'
import { notificationManager } from './notificationSystem'
import * as activityFeed from './activityFeed'

// Mock activity feed
vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}))

describe('Code Playground UI', () => {
  beforeEach(() => {
    localStorage.clear()
    clearAllSnippets()
    vi.clearAllMocks()
    vi.spyOn(notificationManager, 'show')
  })

  describe('createCodePlaygroundUI', () => {
    it('should create playground container', () => {
      const playground = createCodePlaygroundUI()
      expect(playground.className).toBe('playground-container')
    })

    it('should render header with title', () => {
      const playground = createCodePlaygroundUI()
      const title = playground.querySelector('.playground-title')
      expect(title?.textContent).toContain('Code Playground')
    })

    it('should render code editor', () => {
      const playground = createCodePlaygroundUI()
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement
      expect(editor).toBeTruthy()
      expect(editor.tagName).toBe('TEXTAREA')
    })

    it('should render output section', () => {
      const playground = createCodePlaygroundUI()
      const output = playground.querySelector('.playground-output')
      expect(output).toBeTruthy()
    })

    it('should render saved snippets section', () => {
      const playground = createCodePlaygroundUI()
      const snippetsSection = playground.querySelector('.playground-snippets-section')
      expect(snippetsSection).toBeTruthy()
    })

    it('should render action buttons', () => {
      const playground = createCodePlaygroundUI()
      const saveBtn = playground.querySelector('#save-snippet-btn')
      const clearBtn = playground.querySelector('#clear-playground-btn')
      const loadExamplesBtn = playground.querySelector('#load-examples-btn')
      const runBtn = playground.querySelector('.playground-run-btn')

      expect(saveBtn).toBeTruthy()
      expect(clearBtn).toBeTruthy()
      expect(loadExamplesBtn).toBeTruthy()
      expect(runBtn).toBeTruthy()
    })
  })

  describe('Code Editor', () => {
    it('should update line numbers when typing', () => {
      const playground = createCodePlaygroundUI()
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement
      const lineNumbers = playground.querySelector('.playground-line-numbers') as HTMLElement

      editor.value = 'line 1\nline 2\nline 3'
      editor.dispatchEvent(new Event('input'))

      expect(lineNumbers.textContent).toBe('1\n2\n3')
    })

    it('should have initial line number', () => {
      const playground = createCodePlaygroundUI()
      const lineNumbers = playground.querySelector('.playground-line-numbers') as HTMLElement
      expect(lineNumbers.textContent).toBe('1')
    })

    it('should allow typing in editor', () => {
      const playground = createCodePlaygroundUI()
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement

      editor.value = 'console.log("test");'
      editor.dispatchEvent(new Event('input'))

      expect(editor.value).toBe('console.log("test");')
    })
  })

  describe('Run Code', () => {
    it('should execute code and show output', () => {
      const playground = createCodePlaygroundUI()
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement
      const runBtn = playground.querySelector('.playground-run-btn') as HTMLButtonElement
      const output = playground.querySelector('.playground-output') as HTMLElement

      editor.value = 'console.log("Hello World");'
      runBtn.click()

      expect(output.textContent).toContain('Hello World')
    })

    it('should show execution time', () => {
      const playground = createCodePlaygroundUI()
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement
      const runBtn = playground.querySelector('.playground-run-btn') as HTMLButtonElement
      const output = playground.querySelector('.playground-output') as HTMLElement

      editor.value = 'console.log("test");'
      runBtn.click()

      expect(output.textContent).toContain('Executed in')
      expect(output.textContent).toContain('ms')
    })

    it('should show errors for invalid code', () => {
      const playground = createCodePlaygroundUI()
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement
      const runBtn = playground.querySelector('.playground-run-btn') as HTMLButtonElement
      const output = playground.querySelector('.playground-output') as HTMLElement

      editor.value = 'const x = ;' // Invalid syntax
      runBtn.click()

      const errorLine = output.querySelector('.playground-output-error')
      expect(errorLine).toBeTruthy()
      expect(errorLine?.textContent).toContain('Error')
    })

    it('should show warning when no code to run', () => {
      const playground = createCodePlaygroundUI()
      const runBtn = playground.querySelector('.playground-run-btn') as HTMLButtonElement

      runBtn.click()

      expect(notificationManager.show).toHaveBeenCalledWith('Enter some code to run', { type: 'warning' })
    })

    it('should show success notification on successful execution', () => {
      const playground = createCodePlaygroundUI()
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement
      const runBtn = playground.querySelector('.playground-run-btn') as HTMLButtonElement

      editor.value = 'console.log("test");'
      runBtn.click()

      expect(notificationManager.show).toHaveBeenCalledWith('Code executed successfully', { type: 'success' })
    })

    it('should show error notification on failed execution', () => {
      const playground = createCodePlaygroundUI()
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement
      const runBtn = playground.querySelector('.playground-run-btn') as HTMLButtonElement

      editor.value = 'throw new Error("test");'
      runBtn.click()

      expect(notificationManager.show).toHaveBeenCalledWith('Code execution failed', { type: 'error' })
    })

    it('should track activity when running code', () => {
      const playground = createCodePlaygroundUI()
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement
      const runBtn = playground.querySelector('.playground-run-btn') as HTMLButtonElement

      editor.value = 'console.log("test");'
      runBtn.click()

      expect(activityFeed.trackActivity).toHaveBeenCalledWith('code_execution', 'Ran code snippet', 'Success')
    })

    it('should call onSnippetRun callback', () => {
      const onSnippetRun = vi.fn()
      const playground = createCodePlaygroundUI({ onSnippetRun })
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement
      const runBtn = playground.querySelector('.playground-run-btn') as HTMLButtonElement
      const saveBtn = playground.querySelector('#save-snippet-btn') as HTMLButtonElement

      editor.value = 'console.log("test");'
      saveBtn.click() // Save first to create a snippet
      runBtn.click()

      expect(onSnippetRun).toHaveBeenCalled()
    })
  })

  describe('Save Snippet', () => {
    it('should save new snippet', () => {
      const playground = createCodePlaygroundUI()
      const nameInput = playground.querySelector('.playground-snippet-name') as HTMLInputElement
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement
      const saveBtn = playground.querySelector('#save-snippet-btn') as HTMLButtonElement

      nameInput.value = 'My Snippet'
      editor.value = 'console.log("test");'
      saveBtn.click()

      expect(notificationManager.show).toHaveBeenCalledWith('Snippet saved', { type: 'success' })
    })

    it('should show warning when saving empty code', () => {
      const playground = createCodePlaygroundUI()
      const saveBtn = playground.querySelector('#save-snippet-btn') as HTMLButtonElement

      saveBtn.click()

      expect(notificationManager.show).toHaveBeenCalledWith('Enter some code to save', { type: 'warning' })
    })

    it('should use default name if empty', () => {
      const playground = createCodePlaygroundUI()
      const nameInput = playground.querySelector('.playground-snippet-name') as HTMLInputElement
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement
      const saveBtn = playground.querySelector('#save-snippet-btn') as HTMLButtonElement

      nameInput.value = ''
      editor.value = 'console.log("test");'
      saveBtn.click()

      const snippetsList = playground.querySelector('.playground-snippets-list')
      expect(snippetsList?.textContent).toContain('Untitled Snippet')
    })

    it('should track activity when saving', () => {
      const playground = createCodePlaygroundUI()
      const nameInput = playground.querySelector('.playground-snippet-name') as HTMLInputElement
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement
      const saveBtn = playground.querySelector('#save-snippet-btn') as HTMLButtonElement

      nameInput.value = 'Test Snippet'
      editor.value = 'console.log("test");'
      saveBtn.click()

      expect(activityFeed.trackActivity).toHaveBeenCalledWith('snippet_save', 'Saved code snippet', 'Test Snippet')
    })
  })

  describe('Load Snippet', () => {
    it('should load snippet into editor', () => {
      saveSnippet({
        name: 'Test Snippet',
        code: 'console.log("test");',
        language: 'javascript',
      })

      const playground = createCodePlaygroundUI()
      const nameInput = playground.querySelector('.playground-snippet-name') as HTMLInputElement
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement
      const loadBtn = playground.querySelector('[data-action="load"]') as HTMLButtonElement

      loadBtn.click()

      expect(nameInput.value).toBe('Test Snippet')
      expect(editor.value).toBe('console.log("test");')
    })

    it('should show notification when loading', () => {
      saveSnippet({
        name: 'Test Snippet',
        code: 'console.log("test");',
        language: 'javascript',
      })

      const playground = createCodePlaygroundUI()
      const loadBtn = playground.querySelector('[data-action="load"]') as HTMLButtonElement

      loadBtn.click()

      expect(notificationManager.show).toHaveBeenCalledWith('Loaded: Test Snippet', { type: 'info' })
    })

    it('should track activity when loading', () => {
      saveSnippet({
        name: 'Test Snippet',
        code: 'console.log("test");',
        language: 'javascript',
      })

      const playground = createCodePlaygroundUI()
      const loadBtn = playground.querySelector('[data-action="load"]') as HTMLButtonElement

      loadBtn.click()

      expect(activityFeed.trackActivity).toHaveBeenCalledWith('snippet_load', 'Loaded code snippet', 'Test Snippet')
    })
  })

  describe('Delete Snippet', () => {
    it('should show empty message when no snippets', () => {
      const playground = createCodePlaygroundUI()
      const snippetsList = playground.querySelector('.playground-snippets-list')
      expect(snippetsList?.textContent).toContain('No saved snippets yet')
    })

    it('should track activity when deleting', () => {
      saveSnippet({
        name: 'Test Snippet',
        code: 'console.log("test");',
        language: 'javascript',
      })

      const playground = createCodePlaygroundUI()
      const deleteBtn = playground.querySelector('[data-action="delete"]') as HTMLButtonElement

      // Mock confirm using vi.stubGlobal
      vi.stubGlobal('confirm', () => true)

      deleteBtn.click()

      expect(activityFeed.trackActivity).toHaveBeenCalledWith('snippet_delete', 'Deleted code snippet', '')
      
      // Restore
      vi.unstubAllGlobals()
    })
  })

  describe('Load Examples', () => {
    it('should load example snippets', () => {
      const playground = createCodePlaygroundUI()
      const loadExamplesBtn = playground.querySelector('#load-examples-btn') as HTMLButtonElement

      loadExamplesBtn.click()

      const snippetsList = playground.querySelector('.playground-snippets-list')
      expect(snippetsList?.children.length).toBeGreaterThan(0)
    })

    it('should show notification when loading examples', () => {
      const playground = createCodePlaygroundUI()
      const loadExamplesBtn = playground.querySelector('#load-examples-btn') as HTMLButtonElement

      loadExamplesBtn.click()

      expect(notificationManager.show).toHaveBeenCalledWith(expect.stringContaining('example snippets'), { type: 'success' })
    })
  })

  describe('Clear Editor', () => {
    it('should clear editor content', () => {
      const playground = createCodePlaygroundUI()
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement
      const clearBtn = playground.querySelector('#clear-playground-btn') as HTMLButtonElement

      editor.value = 'console.log("test");'
      editor.dispatchEvent(new Event('input'))

      // Mock confirm using vi.stubGlobal
      vi.stubGlobal('confirm', () => true)

      clearBtn.click()

      expect(editor.value).toBe('')
      
      // Restore
      vi.unstubAllGlobals()
    })
  })

  describe('Clear Output', () => {
    it('should clear output display', () => {
      const playground = createCodePlaygroundUI()
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement
      const runBtn = playground.querySelector('.playground-run-btn') as HTMLButtonElement
      const clearOutputBtn = playground.querySelector('#clear-output-btn') as HTMLButtonElement
      const output = playground.querySelector('.playground-output') as HTMLElement

      editor.value = 'console.log("test");'
      runBtn.click()

      clearOutputBtn?.click()

      expect(output.textContent).toContain('Output cleared')
    })
  })

  describe('Snippets Count', () => {
    it('should show 0 snippets initially', () => {
      const playground = createCodePlaygroundUI()
      const count = playground.querySelector('.playground-snippets-count')
      expect(count?.textContent).toBe('0 snippets')
    })

    it('should update count when saving snippets', () => {
      const playground = createCodePlaygroundUI()
      const editor = playground.querySelector('.playground-code-editor') as HTMLTextAreaElement
      const saveBtn = playground.querySelector('#save-snippet-btn') as HTMLButtonElement
      const count = playground.querySelector('.playground-snippets-count')

      editor.value = 'console.log("test");'
      saveBtn.click()

      expect(count?.textContent).toBe('1 snippet')
    })

    it('should show plural for multiple snippets', () => {
      saveSnippet({ name: 'S1', code: 'c1', language: 'javascript' })
      saveSnippet({ name: 'S2', code: 'c2', language: 'javascript' })

      const playground = createCodePlaygroundUI()
      const count = playground.querySelector('.playground-snippets-count')

      expect(count?.textContent).toBe('2 snippets')
    })
  })

  describe('Active Snippet Highlighting', () => {
    it('should highlight active snippet', () => {
      saveSnippet({
        name: 'Test Snippet',
        code: 'console.log("test");',
        language: 'javascript',
      })

      const playground = createCodePlaygroundUI()
      
      // Need to trigger the click to make it active
      const loadBtn = playground.querySelector('[data-action="load"]') as HTMLButtonElement
      // Mock confirm using vi.stubGlobal in case there's dirty state
      vi.stubGlobal('confirm', () => true)
      loadBtn.click()

      const item = playground.querySelector('.playground-snippet-item')
      expect(item?.classList.contains('active')).toBe(true)
      
      // Restore
      vi.unstubAllGlobals()
    })
  })

  describe('HTML Escaping', () => {
    it('should escape snippet names to prevent XSS', () => {
      saveSnippet({
        name: '<script>alert("xss")</script>',
        code: 'console.log("test");',
        language: 'javascript',
      })

      const playground = createCodePlaygroundUI()
      const snippetsList = playground.querySelector('.playground-snippets-list')

      expect(snippetsList?.innerHTML).not.toContain('<script>')
      expect(snippetsList?.innerHTML).toContain('&lt;script&gt;')
    })
  })
})
