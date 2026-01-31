/**
 * Keyboard Shortcuts Help Modal
 * Displays all available keyboard shortcuts organized by category
 */

import { type ShortcutRegistry } from './keyboardShortcuts'
import { formatShortcutKeys } from './commandPalette'

export interface HelpModalConfig {
  registry: ShortcutRegistry
  onClose?: () => void
}

/**
 * Creates the help modal UI
 */
export function createHelpModal(config: HelpModalConfig): HTMLElement {
  const { registry, onClose } = config
  
  // Create overlay
  const overlay = document.createElement('div')
  overlay.className = 'help-modal-overlay'
  
  // Create modal container
  const modal = document.createElement('div')
  modal.className = 'help-modal'
  
  // Create header
  const header = document.createElement('div')
  header.className = 'help-modal-header'
  
  const title = document.createElement('h2')
  title.textContent = '⌨️ Keyboard Shortcuts'
  
  const closeBtn = document.createElement('button')
  closeBtn.className = 'help-modal-close'
  closeBtn.textContent = '×'
  closeBtn.setAttribute('aria-label', 'Close')
  
  header.appendChild(title)
  header.appendChild(closeBtn)
  
  // Create content
  const content = document.createElement('div')
  content.className = 'help-modal-content'
  
  // Get shortcuts grouped by category
  const categories = {
    navigation: registry.getShortcutsByCategory('navigation'),
    actions: registry.getShortcutsByCategory('actions'),
    view: registry.getShortcutsByCategory('view'),
    search: registry.getShortcutsByCategory('search'),
  }
  
  const categoryNames: Record<string, string> = {
    navigation: '🧭 Navigation',
    actions: '⚡ Actions',
    view: '👁️ View',
    search: '🔍 Search',
  }
  
  Object.entries(categories).forEach(([category, shortcuts]) => {
    if (shortcuts.length === 0) return
    
    const section = document.createElement('div')
    section.className = 'help-modal-section'
    
    const sectionTitle = document.createElement('h3')
    sectionTitle.className = 'help-modal-section-title'
    sectionTitle.textContent = categoryNames[category] || category
    
    section.appendChild(sectionTitle)
    
    const list = document.createElement('div')
    list.className = 'help-modal-shortcuts-list'
    
    shortcuts.forEach(shortcut => {
      const item = document.createElement('div')
      item.className = 'help-modal-shortcut-item'
      
      const info = document.createElement('div')
      info.className = 'help-modal-shortcut-info'
      
      const name = document.createElement('div')
      name.className = 'help-modal-shortcut-name'
      name.textContent = shortcut.name
      
      const description = document.createElement('div')
      description.className = 'help-modal-shortcut-description'
      description.textContent = shortcut.description
      
      info.appendChild(name)
      info.appendChild(description)
      
      const keys = document.createElement('div')
      keys.className = 'help-modal-shortcut-keys'
      keys.textContent = formatShortcutKeys(shortcut.keys)
      
      item.appendChild(info)
      item.appendChild(keys)
      list.appendChild(item)
    })
    
    section.appendChild(list)
    content.appendChild(section)
  })
  
  // Add footer with tip
  const footer = document.createElement('div')
  footer.className = 'help-modal-footer'
  footer.innerHTML = `
    <p>💡 <strong>Tip:</strong> Press <kbd>?</kbd> anytime to open this help modal</p>
    <p>Press <kbd>Esc</kbd> to close</p>
  `
  
  const close = () => {
    overlay.remove()
    if (onClose) onClose()
  }
  
  // Close handlers
  closeBtn.addEventListener('click', close)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close()
  })
  
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      close()
      document.removeEventListener('keydown', escapeHandler)
    }
  })
  
  modal.appendChild(header)
  modal.appendChild(content)
  modal.appendChild(footer)
  overlay.appendChild(modal)
  
  return overlay
}

/**
 * Shows the help modal
 */
export function showHelpModal(config: HelpModalConfig): void {
  // Remove existing modal if any
  const existing = document.querySelector('.help-modal-overlay')
  if (existing) {
    existing.remove()
  }
  
  const modal = createHelpModal(config)
  document.body.appendChild(modal)
}
