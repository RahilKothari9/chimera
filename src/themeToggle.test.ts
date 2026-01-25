import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createThemeToggle, getThemeIcon } from './themeToggle'
import * as themeSystem from './themeSystem'

describe('Theme Toggle UI', () => {
  let mockGetCurrentTheme: any
  let mockGetEffectiveTheme: any
  let mockToggleTheme: any

  beforeEach(() => {
    // Mock theme system functions
    mockGetCurrentTheme = vi.spyOn(themeSystem, 'getCurrentTheme')
    mockGetEffectiveTheme = vi.spyOn(themeSystem, 'getEffectiveTheme')
    mockToggleTheme = vi.spyOn(themeSystem, 'toggleTheme')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createThemeToggle', () => {
    it('should create a theme toggle container', () => {
      mockGetCurrentTheme.mockReturnValue('dark')
      mockGetEffectiveTheme.mockReturnValue('dark')
      
      const toggle = createThemeToggle()
      
      expect(toggle).toBeInstanceOf(HTMLElement)
      expect(toggle.className).toBe('theme-toggle-container')
    })

    it('should contain a button element', () => {
      mockGetCurrentTheme.mockReturnValue('dark')
      mockGetEffectiveTheme.mockReturnValue('dark')
      
      const toggle = createThemeToggle()
      const button = toggle.querySelector('button')
      
      expect(button).toBeInstanceOf(HTMLButtonElement)
      expect(button?.className).toBe('theme-toggle-button')
    })

    it('should show sun icon when theme is dark', () => {
      mockGetCurrentTheme.mockReturnValue('dark')
      mockGetEffectiveTheme.mockReturnValue('dark')
      
      const toggle = createThemeToggle()
      const button = toggle.querySelector('button')
      
      expect(button?.innerHTML).toBe('☀️')
      expect(button?.getAttribute('aria-label')).toBe('Switch to light mode')
    })

    it('should show moon icon when theme is light', () => {
      mockGetCurrentTheme.mockReturnValue('light')
      mockGetEffectiveTheme.mockReturnValue('light')
      
      const toggle = createThemeToggle()
      const button = toggle.querySelector('button')
      
      expect(button?.innerHTML).toBe('🌙')
      expect(button?.getAttribute('aria-label')).toBe('Switch to dark mode')
    })

    it('should have proper accessibility attributes', () => {
      mockGetCurrentTheme.mockReturnValue('dark')
      mockGetEffectiveTheme.mockReturnValue('dark')
      
      const toggle = createThemeToggle()
      const button = toggle.querySelector('button')
      
      expect(button?.hasAttribute('aria-label')).toBe(true)
      expect(button?.hasAttribute('title')).toBe(true)
      expect(button?.getAttribute('title')).toBe('Toggle light/dark mode')
    })

    it('should toggle theme when clicked', () => {
      mockGetCurrentTheme.mockReturnValue('dark')
      mockGetEffectiveTheme.mockReturnValue('dark')
      mockToggleTheme.mockReturnValue('light')
      
      const toggle = createThemeToggle()
      const button = toggle.querySelector('button') as HTMLButtonElement
      
      button.click()
      
      expect(mockToggleTheme).toHaveBeenCalled()
    })

    it('should update icon after toggle', () => {
      mockGetCurrentTheme.mockReturnValueOnce('dark')
      mockGetEffectiveTheme.mockReturnValueOnce('dark')
      
      const toggle = createThemeToggle()
      const button = toggle.querySelector('button') as HTMLButtonElement
      
      expect(button.innerHTML).toBe('☀️')
      
      // Simulate theme change
      mockGetCurrentTheme.mockReturnValue('light')
      mockGetEffectiveTheme.mockReturnValue('light')
      mockToggleTheme.mockReturnValue('light')
      
      button.click()
      
      expect(button.innerHTML).toBe('🌙')
    })

    it('should dispatch themechange event when clicked', () => {
      mockGetCurrentTheme.mockReturnValue('dark')
      mockGetEffectiveTheme.mockReturnValue('dark')
      mockToggleTheme.mockReturnValue('light')
      
      const toggle = createThemeToggle()
      const button = toggle.querySelector('button') as HTMLButtonElement
      
      let eventFired = false
      window.addEventListener('themechange', () => {
        eventFired = true
      })
      
      button.click()
      
      expect(eventFired).toBe(true)
    })
  })

  describe('getThemeIcon', () => {
    it('should return sun icon for dark theme', () => {
      expect(getThemeIcon('dark')).toBe('☀️')
    })

    it('should return moon icon for light theme', () => {
      expect(getThemeIcon('light')).toBe('🌙')
    })
  })
})
