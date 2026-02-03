/**
 * High Contrast Toggle UI
 * Provides a button to toggle high contrast mode
 */

import { getAccessibilityManager } from './accessibility';

export function createHighContrastToggle(): HTMLElement {
  const button = document.createElement('button');
  button.className = 'high-contrast-toggle';
  button.setAttribute('aria-label', 'Toggle high contrast mode');
  button.setAttribute('aria-pressed', 'false');
  button.title = 'Toggle high contrast mode (for better visibility)';
  button.innerHTML = '◐'; // Half-filled circle icon
  
  // Check if high contrast is already enabled
  const isHighContrast = document.documentElement.classList.contains('high-contrast');
  if (isHighContrast) {
    button.setAttribute('aria-pressed', 'true');
  }
  
  button.addEventListener('click', () => {
    const manager = getAccessibilityManager();
    manager.toggleHighContrast();
    
    const isNowHighContrast = document.documentElement.classList.contains('high-contrast');
    button.setAttribute('aria-pressed', isNowHighContrast.toString());
  });
  
  return button;
}

export function initializeHighContrastToggle(): void {
  const toggle = createHighContrastToggle();
  document.body.appendChild(toggle);
}
