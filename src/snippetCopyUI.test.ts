import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createSnippetCopyButton, addSnippetCopyToTimelineEntry } from './snippetCopyUI'
import type { EvolutionEntry } from './changelogParser'
import * as snippetFormatter from './snippetFormatter'
import { notificationManager } from './notificationSystem'

describe('Snippet Copy UI', () => {
  let sampleEntry: EvolutionEntry

  beforeEach(() => {
    sampleEntry = {
      day: 10,
      date: '2026-01-28',
      feature: 'Interactive Feature Dependency Graph',
      description: 'Added an intelligent dependency analysis system.',
      files: ['src/dependencyGraph.ts', 'src/dependencyGraphUI.ts'],
    }

    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    })
  })

  describe('createSnippetCopyButton', () => {
    it('should create a copy button container', () => {
      const button = createSnippetCopyButton({ entry: sampleEntry })
      expect(button).toBeInstanceOf(HTMLElement)
      expect(button.className).toBe('snippet-copy-container')
    })

    it('should include a format selector', () => {
      const button = createSnippetCopyButton({ entry: sampleEntry })
      const select = button.querySelector('select')
      expect(select).toBeTruthy()
      expect(select?.className).toBe('snippet-format-select')
    })

    it('should have all format options', () => {
      const button = createSnippetCopyButton({ entry: sampleEntry })
      const options = button.querySelectorAll('option')
      expect(options.length).toBe(4)
      
      const optionValues = Array.from(options).map((opt) => opt.value)
      expect(optionValues).toEqual(['markdown', 'plain', 'json', 'html'])
    })

    it('should have format display names', () => {
      const button = createSnippetCopyButton({ entry: sampleEntry })
      const options = button.querySelectorAll('option')
      
      const optionTexts = Array.from(options).map((opt) => opt.textContent)
      expect(optionTexts).toEqual(['Markdown', 'Plain Text', 'JSON', 'HTML'])
    })

    it('should include a copy button', () => {
      const button = createSnippetCopyButton({ entry: sampleEntry })
      const copyBtn = button.querySelector('.snippet-copy-button')
      expect(copyBtn).toBeTruthy()
      expect(copyBtn?.tagName).toBe('BUTTON')
    })

    it('should have an SVG icon in the copy button', () => {
      const button = createSnippetCopyButton({ entry: sampleEntry })
      const svg = button.querySelector('svg')
      expect(svg).toBeTruthy()
    })

    it('should have "Copy" text in the button', () => {
      const button = createSnippetCopyButton({ entry: sampleEntry })
      const copyBtn = button.querySelector('.snippet-copy-button')
      expect(copyBtn?.textContent).toContain('Copy')
    })

    it('should copy snippet on button click', async () => {
      const copySpy = vi.spyOn(snippetFormatter, 'copySnippetToClipboard')
      copySpy.mockResolvedValue(true)
      
      const notifSpy = vi.spyOn(notificationManager, 'success')

      const button = createSnippetCopyButton({ entry: sampleEntry })
      const copyBtn = button.querySelector('.snippet-copy-button') as HTMLButtonElement

      copyBtn.click()
      
      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(copySpy).toHaveBeenCalledWith(sampleEntry, {
        format: 'markdown',
        includeMetadata: true,
      })
      expect(notifSpy).toHaveBeenCalledWith('Copied as Markdown')
    })

    it('should copy with selected format', async () => {
      const copySpy = vi.spyOn(snippetFormatter, 'copySnippetToClipboard')
      copySpy.mockResolvedValue(true)
      
      vi.spyOn(notificationManager, 'success')

      const button = createSnippetCopyButton({ entry: sampleEntry })
      const select = button.querySelector('select') as HTMLSelectElement
      const copyBtn = button.querySelector('.snippet-copy-button') as HTMLButtonElement

      // Change format to JSON
      select.value = 'json'

      copyBtn.click()
      
      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(copySpy).toHaveBeenCalledWith(sampleEntry, {
        format: 'json',
        includeMetadata: true,
      })
    })

    it('should show error notification on copy failure', async () => {
      const copySpy = vi.spyOn(snippetFormatter, 'copySnippetToClipboard')
      copySpy.mockResolvedValue(false)
      
      const notifSpy = vi.spyOn(notificationManager, 'error')

      const button = createSnippetCopyButton({ entry: sampleEntry })
      const copyBtn = button.querySelector('.snippet-copy-button') as HTMLButtonElement

      copyBtn.click()
      
      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(notifSpy).toHaveBeenCalledWith('Failed to copy snippet')
    })

    it('should call onCopySuccess callback on success', async () => {
      const copySpy = vi.spyOn(snippetFormatter, 'copySnippetToClipboard')
      copySpy.mockResolvedValue(true)
      
      vi.spyOn(notificationManager, 'success')

      const onCopySuccess = vi.fn()
      const button = createSnippetCopyButton({ entry: sampleEntry, onCopySuccess })
      const copyBtn = button.querySelector('.snippet-copy-button') as HTMLButtonElement

      copyBtn.click()
      
      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(onCopySuccess).toHaveBeenCalled()
    })

    it('should call onCopyError callback on failure', async () => {
      const copySpy = vi.spyOn(snippetFormatter, 'copySnippetToClipboard')
      copySpy.mockResolvedValue(false)
      
      vi.spyOn(notificationManager, 'error')

      const onCopyError = vi.fn()
      const button = createSnippetCopyButton({ entry: sampleEntry, onCopyError })
      const copyBtn = button.querySelector('.snippet-copy-button') as HTMLButtonElement

      copyBtn.click()
      
      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(onCopyError).toHaveBeenCalled()
    })

    it('should disable button during copy operation', async () => {
      const copySpy = vi.spyOn(snippetFormatter, 'copySnippetToClipboard')
      // Make it take some time
      copySpy.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(true), 50)))
      
      vi.spyOn(notificationManager, 'success')

      const button = createSnippetCopyButton({ entry: sampleEntry })
      const copyBtn = button.querySelector('.snippet-copy-button') as HTMLButtonElement

      expect(copyBtn.disabled).toBe(false)
      
      copyBtn.click()
      
      // Should be disabled immediately
      expect(copyBtn.disabled).toBe(true)
      expect(copyBtn.classList.contains('copying')).toBe(true)
      
      // Wait for completion
      await new Promise((resolve) => setTimeout(resolve, 60))
      
      // Should be enabled again
      expect(copyBtn.disabled).toBe(false)
      expect(copyBtn.classList.contains('copying')).toBe(false)
    })

    it('should add copied class on success', async () => {
      const copySpy = vi.spyOn(snippetFormatter, 'copySnippetToClipboard')
      copySpy.mockResolvedValue(true)
      
      vi.spyOn(notificationManager, 'success')

      const button = createSnippetCopyButton({ entry: sampleEntry })
      const copyBtn = button.querySelector('.snippet-copy-button') as HTMLButtonElement

      copyBtn.click()
      
      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(copyBtn.classList.contains('copied')).toBe(true)
    })
  })

  describe('addSnippetCopyToTimelineEntry', () => {
    it('should add copy button to timeline entry', () => {
      const entryElement = document.createElement('div')
      entryElement.className = 'timeline-entry'
      
      const dateElement = document.createElement('div')
      dateElement.className = 'timeline-date'
      dateElement.textContent = 'Day 10 - 2026-01-28'
      entryElement.appendChild(dateElement)

      addSnippetCopyToTimelineEntry(entryElement, sampleEntry)

      const copyContainer = entryElement.querySelector('.snippet-copy-container')
      expect(copyContainer).toBeTruthy()
    })

    it('should insert copy button after date element', () => {
      const entryElement = document.createElement('div')
      entryElement.className = 'timeline-entry'
      
      const dateElement = document.createElement('div')
      dateElement.className = 'timeline-date'
      entryElement.appendChild(dateElement)
      
      const featureElement = document.createElement('h3')
      featureElement.className = 'timeline-feature'
      entryElement.appendChild(featureElement)

      addSnippetCopyToTimelineEntry(entryElement, sampleEntry)

      const children = Array.from(entryElement.children)
      const dateIndex = children.indexOf(dateElement)
      const copyContainer = entryElement.querySelector('.snippet-copy-container')
      const copyIndex = children.indexOf(copyContainer as Element)

      expect(copyIndex).toBe(dateIndex + 1)
    })

    it('should handle entries without date element', () => {
      const entryElement = document.createElement('div')
      entryElement.className = 'timeline-entry'

      addSnippetCopyToTimelineEntry(entryElement, sampleEntry)

      const copyContainer = entryElement.querySelector('.snippet-copy-container')
      expect(copyContainer).toBeTruthy()
      // Should be inserted at the beginning
      expect(entryElement.firstChild).toBe(copyContainer)
    })
  })
})
