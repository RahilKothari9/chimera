/**
 * Keyboard Shortcuts System
 * Provides a centralized way to register and manage keyboard shortcuts
 */

export interface ShortcutAction {
  id: string
  name: string
  description: string
  keys: string[] // e.g., ['ctrl+k'], ['/', 'ctrl+/']
  category: 'navigation' | 'actions' | 'view' | 'search'
  handler: () => void
}

export interface ShortcutRegistry {
  shortcuts: ShortcutAction[]
  addShortcut: (action: ShortcutAction) => void
  removeShortcut: (id: string) => void
  getShortcut: (id: string) => ShortcutAction | undefined
  getShortcutsByCategory: (category: ShortcutAction['category']) => ShortcutAction[]
  handleKeyPress: (event: KeyboardEvent) => boolean
  getAllShortcuts: () => ShortcutAction[]
}

/**
 * Normalizes a KeyboardEvent to a shortcut string (e.g., 'ctrl+k', 'shift+/')
 */
export function normalizeKeyEvent(event: KeyboardEvent): string {
  const parts: string[] = []
  
  if (event.ctrlKey || event.metaKey) parts.push('ctrl')
  if (event.shiftKey) parts.push('shift')
  if (event.altKey) parts.push('alt')
  
  // Use the key property for the actual key
  const key = event.key.toLowerCase()
  
  // Don't add modifier keys as the final key
  if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
    parts.push(key)
  }
  
  return parts.join('+')
}

/**
 * Creates a keyboard shortcut registry
 */
export function createShortcutRegistry(): ShortcutRegistry {
  const shortcuts: ShortcutAction[] = []
  
  const addShortcut = (action: ShortcutAction) => {
    // Remove existing shortcut with same id
    const existingIndex = shortcuts.findIndex(s => s.id === action.id)
    if (existingIndex !== -1) {
      shortcuts.splice(existingIndex, 1)
    }
    shortcuts.push(action)
  }
  
  const removeShortcut = (id: string) => {
    const index = shortcuts.findIndex(s => s.id === id)
    if (index !== -1) {
      shortcuts.splice(index, 1)
    }
  }
  
  const getShortcut = (id: string) => {
    return shortcuts.find(s => s.id === id)
  }
  
  const getShortcutsByCategory = (category: ShortcutAction['category']) => {
    return shortcuts.filter(s => s.category === category)
  }
  
  const getAllShortcuts = () => {
    return [...shortcuts]
  }
  
  const handleKeyPress = (event: KeyboardEvent): boolean => {
    // Don't handle shortcuts when typing in input fields
    const target = event.target as HTMLElement | null
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      // Allow '/' to open command palette even in inputs if it's the first character
      if (event.key === '/' && (target as HTMLInputElement).value === '') {
        // Continue to check for shortcuts
      } else {
        return false
      }
    }
    
    const keyCombo = normalizeKeyEvent(event)
    
    // Find matching shortcut
    for (const shortcut of shortcuts) {
      if (shortcut.keys.includes(keyCombo)) {
        event.preventDefault()
        shortcut.handler()
        return true
      }
    }
    
    return false
  }
  
  return {
    shortcuts,
    addShortcut,
    removeShortcut,
    getShortcut,
    getShortcutsByCategory,
    handleKeyPress,
    getAllShortcuts,
  }
}

// Global registry instance
let globalRegistry: ShortcutRegistry | null = null

export function getGlobalRegistry(): ShortcutRegistry {
  if (!globalRegistry) {
    globalRegistry = createShortcutRegistry()
  }
  return globalRegistry
}

/**
 * Initialize keyboard shortcuts listener
 */
export function initializeKeyboardShortcuts(registry: ShortcutRegistry = getGlobalRegistry()): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    registry.handleKeyPress(event)
  }
  
  document.addEventListener('keydown', handleKeyDown)
  
  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown)
  }
}
