import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  createShortcutRegistry, 
  normalizeKeyEvent,
  initializeKeyboardShortcuts,
  type ShortcutAction 
} from './keyboardShortcuts'

describe('Keyboard Shortcuts System', () => {
  describe('normalizeKeyEvent', () => {
    it('should normalize simple key press', () => {
      const event = new KeyboardEvent('keydown', { key: 'k' })
      expect(normalizeKeyEvent(event)).toBe('k')
    })

    it('should normalize ctrl+key', () => {
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
      expect(normalizeKeyEvent(event)).toBe('ctrl+k')
    })

    it('should normalize shift+key', () => {
      const event = new KeyboardEvent('keydown', { key: '/', shiftKey: true })
      expect(normalizeKeyEvent(event)).toBe('shift+/')
    })

    it('should normalize ctrl+shift+key', () => {
      const event = new KeyboardEvent('keydown', { key: 'p', ctrlKey: true, shiftKey: true })
      expect(normalizeKeyEvent(event)).toBe('ctrl+shift+p')
    })

    it('should normalize alt+key', () => {
      const event = new KeyboardEvent('keydown', { key: 't', altKey: true })
      expect(normalizeKeyEvent(event)).toBe('alt+t')
    })

    it('should handle meta key as ctrl', () => {
      const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
      expect(normalizeKeyEvent(event)).toBe('ctrl+k')
    })

    it('should convert keys to lowercase', () => {
      const event = new KeyboardEvent('keydown', { key: 'K', ctrlKey: true })
      expect(normalizeKeyEvent(event)).toBe('ctrl+k')
    })
  })

  describe('createShortcutRegistry', () => {
    let registry: ReturnType<typeof createShortcutRegistry>

    beforeEach(() => {
      registry = createShortcutRegistry()
    })

    it('should create empty registry', () => {
      expect(registry.getAllShortcuts()).toHaveLength(0)
    })

    it('should add shortcut', () => {
      const action: ShortcutAction = {
        id: 'test',
        name: 'Test Action',
        description: 'Test description',
        keys: ['ctrl+t'],
        category: 'actions',
        handler: vi.fn(),
      }

      registry.addShortcut(action)
      expect(registry.getAllShortcuts()).toHaveLength(1)
      expect(registry.getShortcut('test')).toBe(action)
    })

    it('should replace existing shortcut with same id', () => {
      const action1: ShortcutAction = {
        id: 'test',
        name: 'Test 1',
        description: 'First',
        keys: ['ctrl+t'],
        category: 'actions',
        handler: vi.fn(),
      }

      const action2: ShortcutAction = {
        id: 'test',
        name: 'Test 2',
        description: 'Second',
        keys: ['ctrl+t'],
        category: 'actions',
        handler: vi.fn(),
      }

      registry.addShortcut(action1)
      registry.addShortcut(action2)
      
      expect(registry.getAllShortcuts()).toHaveLength(1)
      expect(registry.getShortcut('test')?.name).toBe('Test 2')
    })

    it('should remove shortcut', () => {
      const action: ShortcutAction = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        keys: ['ctrl+t'],
        category: 'actions',
        handler: vi.fn(),
      }

      registry.addShortcut(action)
      expect(registry.getAllShortcuts()).toHaveLength(1)
      
      registry.removeShortcut('test')
      expect(registry.getAllShortcuts()).toHaveLength(0)
    })

    it('should get shortcuts by category', () => {
      const nav: ShortcutAction = {
        id: 'nav1',
        name: 'Nav',
        description: 'Navigate',
        keys: ['ctrl+1'],
        category: 'navigation',
        handler: vi.fn(),
      }

      const action: ShortcutAction = {
        id: 'action1',
        name: 'Action',
        description: 'Do something',
        keys: ['ctrl+a'],
        category: 'actions',
        handler: vi.fn(),
      }

      registry.addShortcut(nav)
      registry.addShortcut(action)

      const navShortcuts = registry.getShortcutsByCategory('navigation')
      expect(navShortcuts).toHaveLength(1)
      expect(navShortcuts[0]).toBe(nav)

      const actionShortcuts = registry.getShortcutsByCategory('actions')
      expect(actionShortcuts).toHaveLength(1)
      expect(actionShortcuts[0]).toBe(action)
    })

    it('should handle key press and trigger handler', () => {
      const handler = vi.fn()
      const action: ShortcutAction = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        keys: ['ctrl+k'],
        category: 'actions',
        handler,
      }

      registry.addShortcut(action)

      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
      const handled = registry.handleKeyPress(event)

      expect(handled).toBe(true)
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple key combinations', () => {
      const handler = vi.fn()
      const action: ShortcutAction = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        keys: ['/', 'ctrl+k'],
        category: 'actions',
        handler,
      }

      registry.addShortcut(action)

      // Test first key combo
      const event1 = new KeyboardEvent('keydown', { key: '/' })
      expect(registry.handleKeyPress(event1)).toBe(true)
      expect(handler).toHaveBeenCalledTimes(1)

      // Test second key combo
      const event2 = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
      expect(registry.handleKeyPress(event2)).toBe(true)
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('should not handle unregistered shortcuts', () => {
      const event = new KeyboardEvent('keydown', { key: 'x', ctrlKey: true })
      const handled = registry.handleKeyPress(event)
      expect(handled).toBe(false)
    })

    it('should not handle shortcuts when typing in input', () => {
      const handler = vi.fn()
      const action: ShortcutAction = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        keys: ['ctrl+k'],
        category: 'actions',
        handler,
      }

      registry.addShortcut(action)

      const input = document.createElement('input')
      input.value = 'typing'
      document.body.appendChild(input)

      const event = new KeyboardEvent('keydown', { 
        key: 'k', 
        ctrlKey: true,
      })
      Object.defineProperty(event, 'target', { value: input, enumerable: true })

      const handled = registry.handleKeyPress(event)
      expect(handled).toBe(false)
      expect(handler).not.toHaveBeenCalled()

      document.body.removeChild(input)
    })

    it('should handle / shortcut even in empty input', () => {
      const handler = vi.fn()
      const action: ShortcutAction = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        keys: ['/'],
        category: 'actions',
        handler,
      }

      registry.addShortcut(action)

      const input = document.createElement('input')
      input.value = ''
      document.body.appendChild(input)

      const event = new KeyboardEvent('keydown', { key: '/' })
      Object.defineProperty(event, 'target', { value: input, enumerable: true })

      const handled = registry.handleKeyPress(event)
      expect(handled).toBe(true)
      expect(handler).toHaveBeenCalledTimes(1)

      document.body.removeChild(input)
    })
  })

  describe('initializeKeyboardShortcuts', () => {
    it('should initialize keyboard listener', () => {
      const registry = createShortcutRegistry()
      const handler = vi.fn()
      
      registry.addShortcut({
        id: 'test',
        name: 'Test',
        description: 'Test',
        keys: ['ctrl+k'],
        category: 'actions',
        handler,
      })

      const cleanup = initializeKeyboardShortcuts(registry)

      // Simulate keypress
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
      document.dispatchEvent(event)

      expect(handler).toHaveBeenCalledTimes(1)

      // Cleanup
      cleanup()
    })

    it('should cleanup listener on cleanup call', () => {
      const registry = createShortcutRegistry()
      const handler = vi.fn()
      
      registry.addShortcut({
        id: 'test',
        name: 'Test',
        description: 'Test',
        keys: ['ctrl+k'],
        category: 'actions',
        handler,
      })

      const cleanup = initializeKeyboardShortcuts(registry)
      cleanup()

      // Simulate keypress after cleanup
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
      document.dispatchEvent(event)

      expect(handler).not.toHaveBeenCalled()
    })
  })
})
