// Theme System for Chimera
// Manages light/dark mode with localStorage persistence

export type Theme = 'light' | 'dark' | 'auto'

const THEME_STORAGE_KEY = 'chimera-theme'

/**
 * Gets the currently active theme from localStorage or defaults to 'auto'
 */
export function getCurrentTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored
  }
  return 'auto'
}

/**
 * Determines the effective theme based on user preference and system settings
 */
export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'auto') {
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

/**
 * Applies the theme to the document
 */
export function applyTheme(theme: Theme): void {
  const effectiveTheme = getEffectiveTheme(theme)
  
  // Update the data-theme attribute
  document.documentElement.setAttribute('data-theme', effectiveTheme)
  
  // Store the preference
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

/**
 * Toggles between light and dark themes
 */
export function toggleTheme(): Theme {
  const current = getCurrentTheme()
  let next: Theme
  
  if (current === 'auto') {
    // If auto, switch to the opposite of what's currently showing
    const effective = getEffectiveTheme(current)
    next = effective === 'dark' ? 'light' : 'dark'
  } else if (current === 'light') {
    next = 'dark'
  } else {
    next = 'light'
  }
  
  applyTheme(next)
  return next
}

/**
 * Initializes the theme system by applying the saved theme
 */
export function initializeTheme(): Theme {
  const theme = getCurrentTheme()
  applyTheme(theme)
  
  // Listen for system theme changes when in auto mode
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const currentTheme = getCurrentTheme()
    if (currentTheme === 'auto') {
      applyTheme('auto')
    }
  })
  
  return theme
}
