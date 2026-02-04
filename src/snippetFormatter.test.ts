import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { EvolutionEntry } from './changelogParser'
import {
  formatAsMarkdown,
  formatAsPlainText,
  formatAsJSON,
  formatAsHTML,
  formatSnippet,
  copySnippetToClipboard,
  getFormatDisplayName,
} from './snippetFormatter'

describe('Snippet Formatter', () => {
  let sampleEntry: EvolutionEntry

  beforeEach(() => {
    sampleEntry = {
      day: 10,
      date: '2026-01-28',
      feature: 'Interactive Feature Dependency Graph',
      description:
        'Added an intelligent dependency analysis and visualization system that maps how features relate to each other.',
      files: [
        'src/dependencyGraph.ts',
        'src/dependencyGraph.test.ts',
        'src/dependencyGraphUI.ts',
      ],
    }
  })

  describe('formatAsMarkdown', () => {
    it('should format entry with metadata', () => {
      const result = formatAsMarkdown(sampleEntry, true)
      expect(result).toContain('### Interactive Feature Dependency Graph')
      expect(result).toContain('**Date**: 2026-01-28')
      expect(result).toContain('Added an intelligent dependency analysis')
      expect(result).toContain('**Files Modified**:')
      expect(result).toContain('src/dependencyGraph.ts')
    })

    it('should format entry without metadata', () => {
      const result = formatAsMarkdown(sampleEntry, false)
      expect(result).toContain('### Interactive Feature Dependency Graph')
      expect(result).toContain('**Date**: 2026-01-28')
      expect(result).toContain('Added an intelligent dependency analysis')
      expect(result).not.toContain('**Files Modified**:')
    })

    it('should handle entry with no files', () => {
      const entryNoFiles = { ...sampleEntry, files: [] }
      const result = formatAsMarkdown(entryNoFiles, true)
      expect(result).toContain('### Interactive Feature Dependency Graph')
      expect(result).not.toContain('**Files Modified**:')
    })
  })

  describe('formatAsPlainText', () => {
    it('should format entry with metadata', () => {
      const result = formatAsPlainText(sampleEntry, true)
      expect(result).toContain('Interactive Feature Dependency Graph')
      expect(result).toContain('Date: 2026-01-28')
      expect(result).toContain('Added an intelligent dependency analysis')
      expect(result).toContain('Files Modified:')
      expect(result).toContain('src/dependencyGraph.ts')
    })

    it('should format entry without metadata', () => {
      const result = formatAsPlainText(sampleEntry, false)
      expect(result).toContain('Interactive Feature Dependency Graph')
      expect(result).toContain('Date: 2026-01-28')
      expect(result).toContain('Added an intelligent dependency analysis')
      expect(result).not.toContain('Files Modified:')
    })

    it('should handle entry with no files', () => {
      const entryNoFiles = { ...sampleEntry, files: [] }
      const result = formatAsPlainText(entryNoFiles, true)
      expect(result).toContain('Interactive Feature Dependency Graph')
      expect(result).not.toContain('Files Modified:')
    })
  })

  describe('formatAsJSON', () => {
    it('should format entry with metadata', () => {
      const result = formatAsJSON(sampleEntry, true)
      const parsed = JSON.parse(result)
      expect(parsed.day).toBe(10)
      expect(parsed.date).toBe('2026-01-28')
      expect(parsed.feature).toBe('Interactive Feature Dependency Graph')
      expect(parsed.description).toContain('Added an intelligent dependency analysis')
      expect(parsed.files).toEqual([
        'src/dependencyGraph.ts',
        'src/dependencyGraph.test.ts',
        'src/dependencyGraphUI.ts',
      ])
    })

    it('should format entry without metadata', () => {
      const result = formatAsJSON(sampleEntry, false)
      const parsed = JSON.parse(result)
      expect(parsed.day).toBe(10)
      expect(parsed.date).toBe('2026-01-28')
      expect(parsed.feature).toBe('Interactive Feature Dependency Graph')
      expect(parsed.description).toContain('Added an intelligent dependency analysis')
      expect(parsed.files).toBeUndefined()
    })

    it('should handle entry with no files', () => {
      const entryNoFiles = { ...sampleEntry, files: [] }
      const result = formatAsJSON(entryNoFiles, true)
      const parsed = JSON.parse(result)
      expect(parsed.day).toBe(10)
      expect(parsed.files).toBeUndefined()
    })

    it('should produce valid JSON', () => {
      const result = formatAsJSON(sampleEntry, true)
      expect(() => JSON.parse(result)).not.toThrow()
    })

    it('should format JSON with proper indentation', () => {
      const result = formatAsJSON(sampleEntry, true)
      expect(result).toContain('  "day":')
      expect(result).toContain('\n')
    })
  })

  describe('formatAsHTML', () => {
    it('should format entry with metadata', () => {
      const result = formatAsHTML(sampleEntry, true)
      expect(result).toContain('<div class="evolution-entry">')
      expect(result).toContain('<h3>Interactive Feature Dependency Graph</h3>')
      expect(result).toContain('<strong>Date:</strong> 2026-01-28')
      expect(result).toContain('Added an intelligent dependency analysis')
      expect(result).toContain('<strong>Files Modified:</strong>')
      expect(result).toContain('src/dependencyGraph.ts')
      expect(result).toContain('</div>')
    })

    it('should format entry without metadata', () => {
      const result = formatAsHTML(sampleEntry, false)
      expect(result).toContain('<h3>Interactive Feature Dependency Graph</h3>')
      expect(result).toContain('<strong>Date:</strong> 2026-01-28')
      expect(result).not.toContain('<strong>Files Modified:</strong>')
    })

    it('should handle entry with no files', () => {
      const entryNoFiles = { ...sampleEntry, files: [] }
      const result = formatAsHTML(entryNoFiles, true)
      expect(result).toContain('<h3>Interactive Feature Dependency Graph</h3>')
      expect(result).not.toContain('<strong>Files Modified:</strong>')
    })

    it('should escape HTML special characters', () => {
      const entryWithHTML = {
        ...sampleEntry,
        feature: 'Test <script>alert("xss")</script> Feature',
        description: 'Contains <b>HTML</b> & "quotes"',
      }
      const result = formatAsHTML(entryWithHTML, false)
      expect(result).not.toContain('<script>')
      expect(result).toContain('&lt;script&gt;')
      expect(result).toContain('&lt;b&gt;')
      expect(result).toContain('&amp;')
    })
  })

  describe('formatSnippet', () => {
    it('should format as markdown when specified', () => {
      const result = formatSnippet(sampleEntry, { format: 'markdown' })
      expect(result).toContain('###')
      expect(result).toContain('**Date**:')
    })

    it('should format as plain text when specified', () => {
      const result = formatSnippet(sampleEntry, { format: 'plain' })
      expect(result).toContain('Date:')
      expect(result).not.toContain('###')
      expect(result).not.toContain('**')
    })

    it('should format as JSON when specified', () => {
      const result = formatSnippet(sampleEntry, { format: 'json' })
      expect(() => JSON.parse(result)).not.toThrow()
    })

    it('should format as HTML when specified', () => {
      const result = formatSnippet(sampleEntry, { format: 'html' })
      expect(result).toContain('<div class="evolution-entry">')
      expect(result).toContain('<h3>')
    })

    it('should respect includeMetadata option', () => {
      const resultWithMetadata = formatSnippet(sampleEntry, {
        format: 'markdown',
        includeMetadata: true,
      })
      const resultWithoutMetadata = formatSnippet(sampleEntry, {
        format: 'markdown',
        includeMetadata: false,
      })
      expect(resultWithMetadata).toContain('**Files Modified**:')
      expect(resultWithoutMetadata).not.toContain('**Files Modified**:')
    })

    it('should throw error for unsupported format', () => {
      expect(() =>
        formatSnippet(sampleEntry, { format: 'invalid' as any })
      ).toThrow('Unsupported format: invalid')
    })
  })

  describe('copySnippetToClipboard', () => {
    it('should copy snippet to clipboard successfully', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mockWriteText,
        },
        writable: true,
        configurable: true,
      })

      const result = await copySnippetToClipboard(sampleEntry, { format: 'markdown' })
      expect(result).toBe(true)
      expect(mockWriteText).toHaveBeenCalledOnce()
      expect(mockWriteText.mock.calls[0][0]).toContain('### Interactive Feature Dependency Graph')
    })

    it('should handle clipboard errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard access denied'))
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mockWriteText,
        },
        writable: true,
        configurable: true,
      })

      const result = await copySnippetToClipboard(sampleEntry, { format: 'markdown' })
      expect(result).toBe(false)
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to copy snippet:',
        expect.any(Error)
      )

      consoleError.mockRestore()
    })

    it('should copy JSON format correctly', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mockWriteText,
        },
        writable: true,
        configurable: true,
      })

      const result = await copySnippetToClipboard(sampleEntry, { format: 'json' })
      expect(result).toBe(true)
      const copiedText = mockWriteText.mock.calls[0][0]
      expect(() => JSON.parse(copiedText)).not.toThrow()
    })

    it('should copy HTML format correctly', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mockWriteText,
        },
        writable: true,
        configurable: true,
      })

      const result = await copySnippetToClipboard(sampleEntry, { format: 'html' })
      expect(result).toBe(true)
      const copiedText = mockWriteText.mock.calls[0][0]
      expect(copiedText).toContain('<div class="evolution-entry">')
    })
  })

  describe('getFormatDisplayName', () => {
    it('should return correct display name for markdown', () => {
      expect(getFormatDisplayName('markdown')).toBe('Markdown')
    })

    it('should return correct display name for plain text', () => {
      expect(getFormatDisplayName('plain')).toBe('Plain Text')
    })

    it('should return correct display name for JSON', () => {
      expect(getFormatDisplayName('json')).toBe('JSON')
    })

    it('should return correct display name for HTML', () => {
      expect(getFormatDisplayName('html')).toBe('HTML')
    })
  })
})
