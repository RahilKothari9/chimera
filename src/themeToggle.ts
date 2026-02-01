// Theme Toggle UI Component
import { toggleTheme, getCurrentTheme, getEffectiveTheme } from './themeSystem'
import { notificationManager } from './notificationSystem'

/**
 * Creates a theme toggle button that allows users to switch between light and dark modes
 */
export function createThemeToggle(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'theme-toggle-container'
  
  const button = document.createElement('button')
  button.className = 'theme-toggle-button'
  button.setAttribute('aria-label', 'Toggle theme')
  button.setAttribute('title', 'Toggle light/dark mode')
  
  // Update button content based on current theme
  function updateButton() {
    const current = getCurrentTheme()
    const effective = getEffectiveTheme(current)
    
    if (effective === 'dark') {
      button.innerHTML = '☀️'
      button.setAttribute('aria-label', 'Switch to light mode')
    } else {
      button.innerHTML = '🌙'
      button.setAttribute('aria-label', 'Switch to dark mode')
    }
  }
  
  // Initialize button
  updateButton()
  
  // Handle click
  button.addEventListener('click', () => {
    toggleTheme()
    updateButton()
    
    // Show notification
    const effective = getEffectiveTheme(getCurrentTheme())
    const themeName = effective === 'dark' ? 'Dark' : 'Light'
    notificationManager.success(`${themeName} mode activated`, 2000)
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: getCurrentTheme() }
    }))
  })
  
  container.appendChild(button)
  return container
}
