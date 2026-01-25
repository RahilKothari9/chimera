import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getCurrentTheme, getEffectiveTheme, applyTheme, toggleTheme, initializeTheme } from './themeSystem'

describe('Theme System', () => {
  let originalLocalStorage: Storage
  let mockMatchMedia: any

  beforeEach(() => {
    // Mock localStorage
    originalLocalStorage = window.localStorage
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      } as any
    })

    // Mock matchMedia
    mockMatchMedia = vi.fn()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    })

    // Mock document.documentElement
    document.documentElement.setAttribute = vi.fn()
  })

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: originalLocalStorage
    })
    vi.restoreAllMocks()
  })

  describe('getCurrentTheme', () => {
    it('should return "auto" when no theme is stored', () => {
      ;(localStorage.getItem as any).mockReturnValue(null)
      expect(getCurrentTheme()).toBe('auto')
    })

    it('should return stored theme when valid', () => {
      ;(localStorage.getItem as any).mockReturnValue('light')
      expect(getCurrentTheme()).toBe('light')

      ;(localStorage.getItem as any).mockReturnValue('dark')
      expect(getCurrentTheme()).toBe('dark')

      ;(localStorage.getItem as any).mockReturnValue('auto')
      expect(getCurrentTheme()).toBe('auto')
    })

    it('should return "auto" for invalid stored values', () => {
      ;(localStorage.getItem as any).mockReturnValue('invalid')
      expect(getCurrentTheme()).toBe('auto')
    })
  })

  describe('getEffectiveTheme', () => {
    it('should return the theme itself when not auto', () => {
      expect(getEffectiveTheme('light')).toBe('light')
      expect(getEffectiveTheme('dark')).toBe('dark')
    })

    it('should return dark when auto and system prefers dark', () => {
      mockMatchMedia.mockReturnValue({ matches: true })
      expect(getEffectiveTheme('auto')).toBe('dark')
    })

    it('should return light when auto and system prefers light', () => {
      mockMatchMedia.mockReturnValue({ matches: false })
      expect(getEffectiveTheme('auto')).toBe('light')
    })
  })

  describe('applyTheme', () => {
    it('should set data-theme attribute to light', () => {
      mockMatchMedia.mockReturnValue({ matches: false })
      applyTheme('light')
      
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light')
      expect(localStorage.setItem).toHaveBeenCalledWith('chimera-theme', 'light')
    })

    it('should set data-theme attribute to dark', () => {
      mockMatchMedia.mockReturnValue({ matches: true })
      applyTheme('dark')
      
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark')
      expect(localStorage.setItem).toHaveBeenCalledWith('chimera-theme', 'dark')
    })

    it('should apply auto theme based on system preference', () => {
      mockMatchMedia.mockReturnValue({ matches: true })
      applyTheme('auto')
      
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark')
      expect(localStorage.setItem).toHaveBeenCalledWith('chimera-theme', 'auto')
    })
  })

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      ;(localStorage.getItem as any).mockReturnValue('light')
      mockMatchMedia.mockReturnValue({ matches: false })
      
      const result = toggleTheme()
      
      expect(result).toBe('dark')
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark')
    })

    it('should toggle from dark to light', () => {
      ;(localStorage.getItem as any).mockReturnValue('dark')
      mockMatchMedia.mockReturnValue({ matches: true })
      
      const result = toggleTheme()
      
      expect(result).toBe('light')
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light')
    })

    it('should toggle from auto (showing dark) to light', () => {
      ;(localStorage.getItem as any).mockReturnValue('auto')
      mockMatchMedia.mockReturnValue({ matches: true })
      
      const result = toggleTheme()
      
      expect(result).toBe('light')
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light')
    })

    it('should toggle from auto (showing light) to dark', () => {
      ;(localStorage.getItem as any).mockReturnValue('auto')
      mockMatchMedia.mockReturnValue({ matches: false })
      
      const result = toggleTheme()
      
      expect(result).toBe('dark')
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark')
    })
  })

  describe('initializeTheme', () => {
    it('should apply the stored theme', () => {
      ;(localStorage.getItem as any).mockReturnValue('dark')
      mockMatchMedia.mockReturnValue({ 
        matches: true,
        addEventListener: vi.fn()
      })
      
      const result = initializeTheme()
      
      expect(result).toBe('dark')
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark')
    })

    it('should apply auto theme when no theme is stored', () => {
      ;(localStorage.getItem as any).mockReturnValue(null)
      mockMatchMedia.mockReturnValue({ 
        matches: false,
        addEventListener: vi.fn()
      })
      
      const result = initializeTheme()
      
      expect(result).toBe('auto')
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light')
    })

    it('should set up system theme change listener', () => {
      const addEventListener = vi.fn()
      ;(localStorage.getItem as any).mockReturnValue('auto')
      mockMatchMedia.mockReturnValue({ 
        matches: false,
        addEventListener
      })
      
      initializeTheme()
      
      expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })
})
