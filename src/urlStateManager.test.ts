import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getStateFromURL,
  updateURLState,
  generateShareableURL,
  clearURLState,
  copyURLToClipboard,
  createDescriptiveShare,
} from './urlStateManager'

describe('URL State Manager', () => {
  beforeEach(() => {
    // Reset URL
    window.history.replaceState({}, '', '/')
  })

  describe('getStateFromURL', () => {
    it('should return empty state for clean URL', () => {
      const state = getStateFromURL()
      expect(state).toEqual({})
    })

    it('should parse search query from URL', () => {
      window.history.replaceState({}, '', '/?q=test')
      const state = getStateFromURL()
      expect(state.searchQuery).toBe('test')
    })

    it('should parse search category from URL', () => {
      window.history.replaceState({}, '', '/?cat=UI/UX')
      const state = getStateFromURL()
      expect(state.searchCategory).toBe('UI/UX')
    })

    it('should parse theme from URL', () => {
      window.history.replaceState({}, '', '/?theme=dark')
      const state = getStateFromURL()
      expect(state.theme).toBe('dark')
    })

    it('should parse view from URL', () => {
      window.history.replaceState({}, '', '/?view=timeline')
      const state = getStateFromURL()
      expect(state.view).toBe('timeline')
    })

    it('should parse evolution day from URL', () => {
      window.history.replaceState({}, '', '/?day=5')
      const state = getStateFromURL()
      expect(state.evolutionDay).toBe(5)
    })

    it('should parse comparison mode from URL', () => {
      window.history.replaceState({}, '', '/?cmp=period')
      const state = getStateFromURL()
      expect(state.comparisonMode).toBe('period')
    })

    it('should parse comparison periods from URL', () => {
      window.history.replaceState({}, '', '/?p1=last7&p2=prev7')
      const state = getStateFromURL()
      expect(state.comparisonPeriod1).toBe('last7')
      expect(state.comparisonPeriod2).toBe('prev7')
    })

    it('should parse multiple parameters from URL', () => {
      window.history.replaceState({}, '', '/?q=search&cat=Testing&theme=dark&day=3')
      const state = getStateFromURL()
      expect(state.searchQuery).toBe('search')
      expect(state.searchCategory).toBe('Testing')
      expect(state.theme).toBe('dark')
      expect(state.evolutionDay).toBe(3)
    })
  })

  describe('updateURLState', () => {
    it('should update URL with search query', () => {
      updateURLState({ searchQuery: 'test' })
      expect(window.location.search).toBe('?q=test')
    })

    it('should update URL with multiple parameters', () => {
      updateURLState({
        searchQuery: 'visualization',
        searchCategory: 'UI/UX',
        theme: 'dark',
      })
      const params = new URLSearchParams(window.location.search)
      expect(params.get('q')).toBe('visualization')
      expect(params.get('cat')).toBe('UI/UX')
      expect(params.get('theme')).toBe('dark')
    })

    it('should remove parameter when value is empty', () => {
      updateURLState({ searchQuery: 'test' })
      expect(window.location.search).toBe('?q=test')
      updateURLState({ searchQuery: '' })
      expect(window.location.search).toBe('')
    })

    it('should remove parameter when value is undefined', () => {
      updateURLState({ searchQuery: 'test' })
      expect(window.location.search).toBe('?q=test')
      updateURLState({ searchQuery: undefined })
      expect(window.location.search).toBe('')
    })

    it('should update existing parameter', () => {
      updateURLState({ searchQuery: 'old' })
      expect(window.location.search).toBe('?q=old')
      updateURLState({ searchQuery: 'new' })
      expect(window.location.search).toBe('?q=new')
    })

    it('should preserve existing parameters when updating', () => {
      updateURLState({ searchQuery: 'test', theme: 'dark' })
      updateURLState({ searchCategory: 'Testing' })
      const params = new URLSearchParams(window.location.search)
      expect(params.get('q')).toBe('test')
      expect(params.get('theme')).toBe('dark')
      expect(params.get('cat')).toBe('Testing')
    })
  })

  describe('generateShareableURL', () => {
    it('should generate URL with search query', () => {
      const url = generateShareableURL({ searchQuery: 'test' })
      expect(url).toContain('?q=test')
    })

    it('should generate URL with multiple parameters', () => {
      const url = generateShareableURL({
        searchQuery: 'visualization',
        searchCategory: 'UI/UX',
        theme: 'dark',
      })
      expect(url).toContain('q=visualization')
      expect(url).toContain('cat=UI%2FUX')
      expect(url).toContain('theme=dark')
    })

    it('should generate base URL when no parameters', () => {
      const url = generateShareableURL({})
      expect(url).toBe(window.location.origin + window.location.pathname)
    })

    it('should skip undefined values', () => {
      const url = generateShareableURL({
        searchQuery: 'test',
        searchCategory: undefined,
      })
      expect(url).toContain('q=test')
      expect(url).not.toContain('cat=')
    })

    it('should skip empty string values', () => {
      const url = generateShareableURL({
        searchQuery: 'test',
        searchCategory: '',
      })
      expect(url).toContain('q=test')
      expect(url).not.toContain('cat=')
    })

    it('should include evolution day', () => {
      const url = generateShareableURL({ evolutionDay: 5 })
      expect(url).toContain('day=5')
    })

    it('should include comparison parameters', () => {
      const url = generateShareableURL({
        comparisonMode: 'period',
        comparisonPeriod1: 'last7',
        comparisonPeriod2: 'prev7',
      })
      expect(url).toContain('cmp=period')
      expect(url).toContain('p1=last7')
      expect(url).toContain('p2=prev7')
    })
  })

  describe('clearURLState', () => {
    it('should clear all URL parameters', () => {
      window.history.replaceState({}, '', '/?q=test&cat=Testing&theme=dark')
      expect(window.location.search).toBe('?q=test&cat=Testing&theme=dark')
      clearURLState()
      expect(window.location.search).toBe('')
    })

    it('should work when no parameters exist', () => {
      clearURLState()
      expect(window.location.search).toBe('')
    })
  })

  describe('copyURLToClipboard', () => {
    it('should copy URL using clipboard API', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      })

      const result = await copyURLToClipboard('https://example.com')
      expect(result).toBe(true)
      expect(writeText).toHaveBeenCalledWith('https://example.com')
    })

    it('should use fallback for older browsers', async () => {
      // Remove clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      // Mock execCommand
      document.execCommand = vi.fn().mockReturnValue(true) as any

      const result = await copyURLToClipboard('https://example.com')
      expect(result).toBe(true)
      expect(document.execCommand).toHaveBeenCalledWith('copy')
    })

    it('should return false on error', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('Failed'))
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      })

      const result = await copyURLToClipboard('https://example.com')
      expect(result).toBe(false)
    })
  })

  describe('createDescriptiveShare', () => {
    it('should create descriptive share object', () => {
      const share = createDescriptiveShare('Search for visualization', {
        searchQuery: 'visualization',
        theme: 'dark',
      })

      expect(share.description).toBe('Search for visualization')
      expect(share.url).toContain('q=visualization')
      expect(share.url).toContain('theme=dark')
    })

    it('should work with empty state', () => {
      const share = createDescriptiveShare('Homepage', {})
      expect(share.description).toBe('Homepage')
      expect(share.url).toBe(window.location.origin + window.location.pathname)
    })

    it('should work with complex state', () => {
      const share = createDescriptiveShare('Compare last 7 vs previous 7 days', {
        view: 'comparison',
        comparisonMode: 'period',
        comparisonPeriod1: 'last7',
        comparisonPeriod2: 'prev7',
      })

      expect(share.description).toBe('Compare last 7 vs previous 7 days')
      expect(share.url).toContain('view=comparison')
      expect(share.url).toContain('cmp=period')
      expect(share.url).toContain('p1=last7')
      expect(share.url).toContain('p2=prev7')
    })
  })
})
