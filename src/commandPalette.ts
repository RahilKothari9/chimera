/**
 * Command Palette UI
 * A searchable command palette for quick access to features and actions
 */

import { type ShortcutRegistry } from './keyboardShortcuts'

export interface CommandPaletteConfig {
  registry: ShortcutRegistry
  onClose?: () => void
}

/**
 * Formats shortcut keys for display (e.g., 'ctrl+k' -> '⌘K' or 'Ctrl+K')
 */
export function formatShortcutKeys(keys: string[]): string {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
  
  return keys.map(key => {
    let formatted = key
    if (isMac) {
      formatted = formatted
        .replace(/ctrl/i, '⌘')
        .replace(/alt/i, '⌥')
        .replace(/shift/i, '⇧')
    } else {
      formatted = formatted
        .replace(/ctrl/i, 'Ctrl')
        .replace(/alt/i, 'Alt')
        .replace(/shift/i, 'Shift')
    }
    
    // Capitalize individual keys
    const parts = formatted.split('+')
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('+')
  }).join(' or ')
}

/**
 * Performs fuzzy search on text
 */
export function fuzzyMatch(search: string, text: string): boolean {
  if (!search) return true
  
  const searchLower = search.toLowerCase()
  const textLower = text.toLowerCase()
  
  // Simple substring match
  if (textLower.includes(searchLower)) return true
  
  // Fuzzy match: check if all characters appear in order
  let searchIndex = 0
  for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
    if (textLower[i] === searchLower[searchIndex]) {
      searchIndex++
    }
  }
  
  return searchIndex === searchLower.length
}

/**
 * Creates the command palette UI
 */
export function createCommandPalette(config: CommandPaletteConfig): HTMLElement {
  const { registry, onClose } = config
  
  // Create overlay
  const overlay = document.createElement('div')
  overlay.className = 'command-palette-overlay'
  
  // Create palette container
  const palette = document.createElement('div')
  palette.className = 'command-palette'
  
  // Create search input
  const searchContainer = document.createElement('div')
  searchContainer.className = 'command-palette-search'
  
  const searchIcon = document.createElement('span')
  searchIcon.className = 'command-palette-search-icon'
  searchIcon.textContent = '🔍'
  
  const searchInput = document.createElement('input')
  searchInput.type = 'text'
  searchInput.placeholder = 'Type a command or search...'
  searchInput.className = 'command-palette-input'
  
  searchContainer.appendChild(searchIcon)
  searchContainer.appendChild(searchInput)
  
  // Create results container
  const resultsContainer = document.createElement('div')
  resultsContainer.className = 'command-palette-results'
  
  // Track selected index
  let selectedIndex = 0
  
  const renderResults = (searchTerm: string) => {
    const shortcuts = registry.getAllShortcuts()
    const filtered = shortcuts.filter(s => 
      fuzzyMatch(searchTerm, s.name) || 
      fuzzyMatch(searchTerm, s.description) ||
      fuzzyMatch(searchTerm, s.category)
    )
    
    resultsContainer.innerHTML = ''
    
    if (filtered.length === 0) {
      const empty = document.createElement('div')
      empty.className = 'command-palette-empty'
      empty.textContent = 'No commands found'
      resultsContainer.appendChild(empty)
      return
    }
    
    // Group by category
    const categories: Record<string, typeof filtered> = {}
    filtered.forEach(shortcut => {
      if (!categories[shortcut.category]) {
        categories[shortcut.category] = []
      }
      categories[shortcut.category].push(shortcut)
    })
    
    let itemIndex = 0
    Object.entries(categories).forEach(([category, items]) => {
      const categoryHeader = document.createElement('div')
      categoryHeader.className = 'command-palette-category'
      categoryHeader.textContent = category.charAt(0).toUpperCase() + category.slice(1)
      resultsContainer.appendChild(categoryHeader)
      
      items.forEach(shortcut => {
        const item = document.createElement('div')
        item.className = 'command-palette-item'
        item.dataset.index = String(itemIndex)
        
        if (itemIndex === selectedIndex) {
          item.classList.add('selected')
        }
        
        const info = document.createElement('div')
        info.className = 'command-palette-item-info'
        
        const name = document.createElement('div')
        name.className = 'command-palette-item-name'
        name.textContent = shortcut.name
        
        const description = document.createElement('div')
        description.className = 'command-palette-item-description'
        description.textContent = shortcut.description
        
        info.appendChild(name)
        info.appendChild(description)
        
        const keys = document.createElement('div')
        keys.className = 'command-palette-item-keys'
        keys.textContent = formatShortcutKeys(shortcut.keys)
        
        item.appendChild(info)
        item.appendChild(keys)
        
        item.addEventListener('click', () => {
          shortcut.handler()
          close()
        })
        
        resultsContainer.appendChild(item)
        itemIndex++
      })
    })
    
    // Reset selected index if out of bounds
    if (selectedIndex >= itemIndex) {
      selectedIndex = 0
      updateSelection()
    }
  }
  
  const updateSelection = () => {
    const items = resultsContainer.querySelectorAll('.command-palette-item')
    items.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add('selected')
        item.scrollIntoView({ block: 'nearest' })
      } else {
        item.classList.remove('selected')
      }
    })
  }
  
  const executeSelected = () => {
    const selected = resultsContainer.querySelector('.command-palette-item.selected')
    if (selected) {
      const index = parseInt(selected.getAttribute('data-index') || '0', 10)
      const shortcuts = registry.getAllShortcuts()
      const filtered = shortcuts.filter(s => 
        fuzzyMatch(searchInput.value, s.name) || 
        fuzzyMatch(searchInput.value, s.description) ||
        fuzzyMatch(searchInput.value, s.category)
      )
      
      // Find the actual shortcut by counting through categories
      let count = 0
      for (const shortcut of filtered) {
        if (count === index) {
          shortcut.handler()
          close()
          return
        }
        count++
      }
    }
  }
  
  const close = () => {
    overlay.remove()
    if (onClose) onClose()
  }
  
  // Handle keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    const items = resultsContainer.querySelectorAll('.command-palette-item')
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1)
      updateSelection()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      selectedIndex = Math.max(selectedIndex - 1, 0)
      updateSelection()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      executeSelected()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    }
  })
  
  // Handle search
  searchInput.addEventListener('input', () => {
    selectedIndex = 0
    renderResults(searchInput.value)
  })
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      close()
    }
  })
  
  // Initial render
  renderResults('')
  
  palette.appendChild(searchContainer)
  palette.appendChild(resultsContainer)
  overlay.appendChild(palette)
  
  // Focus input after rendering
  setTimeout(() => searchInput.focus(), 0)
  
  return overlay
}

/**
 * Shows the command palette
 */
export function showCommandPalette(config: CommandPaletteConfig): void {
  // Remove existing palette if any
  const existing = document.querySelector('.command-palette-overlay')
  if (existing) {
    existing.remove()
  }
  
  const palette = createCommandPalette(config)
  document.body.appendChild(palette)
}
