import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  createCommandPalette,
  formatShortcutKeys,
  fuzzyMatch,
  showCommandPalette,
  type CommandPaletteConfig
} from './commandPalette'
import { createShortcutRegistry, type ShortcutAction } from './keyboardShortcuts'

describe('Command Palette', () => {
  describe('formatShortcutKeys', () => {
    it('should format simple keys', () => {
      const result = formatShortcutKeys(['/'])
      expect(result).toBe('/')
    })

    it('should format ctrl+key combinations', () => {
      const result = formatShortcutKeys(['ctrl+k'])
      // Result will vary by platform, just check it's transformed
      expect(result).toMatch(/[⌘Ctrl]/)
    })

    it('should format multiple key combinations', () => {
      const result = formatShortcutKeys(['/', 'ctrl+k'])
      expect(result).toContain('or')
    })

    it('should capitalize keys', () => {
      const result = formatShortcutKeys(['g'])
      expect(result).toBe('G')
    })
  })

  describe('fuzzyMatch', () => {
    it('should match exact substring', () => {
      expect(fuzzyMatch('nav', 'navigation')).toBe(true)
    })

    it('should match case-insensitive', () => {
      expect(fuzzyMatch('NAV', 'navigation')).toBe(true)
    })

    it('should match fuzzy patterns', () => {
      expect(fuzzyMatch('nv', 'navigation')).toBe(true)
      expect(fuzzyMatch('nvg', 'navigation')).toBe(true)
    })

    it('should return true for empty search', () => {
      expect(fuzzyMatch('', 'anything')).toBe(true)
    })

    it('should not match unrelated text', () => {
      expect(fuzzyMatch('xyz', 'navigation')).toBe(false)
    })

    it('should match partial words', () => {
      expect(fuzzyMatch('dash', 'dashboard')).toBe(true)
    })
  })

  describe('createCommandPalette', () => {
    let registry: ReturnType<typeof createShortcutRegistry>
    let config: CommandPaletteConfig

    beforeEach(() => {
      registry = createShortcutRegistry()
      
      // Add test shortcuts
      const shortcuts: ShortcutAction[] = [
        {
          id: 'nav-dashboard',
          name: 'Go to Dashboard',
          description: 'Navigate to the dashboard section',
          keys: ['ctrl+1'],
          category: 'navigation',
          handler: vi.fn(),
        },
        {
          id: 'nav-timeline',
          name: 'Go to Timeline',
          description: 'Navigate to the timeline section',
          keys: ['ctrl+2'],
          category: 'navigation',
          handler: vi.fn(),
        },
        {
          id: 'action-export',
          name: 'Export Data',
          description: 'Export evolution data',
          keys: ['ctrl+e'],
          category: 'actions',
          handler: vi.fn(),
        },
      ]

      shortcuts.forEach(s => registry.addShortcut(s))

      config = {
        registry,
        onClose: vi.fn(),
      }
    })

    it('should create palette element', () => {
      const palette = createCommandPalette(config)
      expect(palette).toBeDefined()
      expect(palette.className).toBe('command-palette-overlay')
    })

    it('should have search input', () => {
      const palette = createCommandPalette(config)
      const input = palette.querySelector('.command-palette-input')
      expect(input).toBeDefined()
      expect((input as HTMLInputElement).placeholder).toContain('command')
    })

    it('should render all shortcuts initially', () => {
      const palette = createCommandPalette(config)
      const items = palette.querySelectorAll('.command-palette-item')
      expect(items.length).toBe(3)
    })

    it('should group shortcuts by category', () => {
      const palette = createCommandPalette(config)
      const categories = palette.querySelectorAll('.command-palette-category')
      expect(categories.length).toBeGreaterThan(0)
    })

    it('should filter shortcuts by search term', () => {
      const palette = createCommandPalette(config)
      document.body.appendChild(palette)

      const input = palette.querySelector('.command-palette-input') as HTMLInputElement
      input.value = 'dashboard'
      input.dispatchEvent(new Event('input'))

      const items = palette.querySelectorAll('.command-palette-item')
      expect(items.length).toBe(1)
      expect(items[0].textContent).toContain('Dashboard')

      document.body.removeChild(palette)
    })

    it('should show empty state when no matches', () => {
      const palette = createCommandPalette(config)
      document.body.appendChild(palette)

      const input = palette.querySelector('.command-palette-input') as HTMLInputElement
      input.value = 'nonexistent'
      input.dispatchEvent(new Event('input'))

      const empty = palette.querySelector('.command-palette-empty')
      expect(empty).toBeDefined()
      expect(empty?.textContent).toContain('No commands')

      document.body.removeChild(palette)
    })

    it('should execute command on click', () => {
      const palette = createCommandPalette(config)
      document.body.appendChild(palette)

      const items = palette.querySelectorAll('.command-palette-item')
      const firstItem = items[0] as HTMLElement
      
      firstItem.click()

      const shortcut = registry.getShortcut('nav-dashboard')
      expect(shortcut?.handler).toHaveBeenCalled()
      expect(config.onClose).toHaveBeenCalled()

      // Cleanup
      if (palette.parentElement) {
        document.body.removeChild(palette)
      }
    })

    it('should navigate with arrow keys', () => {
      const palette = createCommandPalette(config)
      document.body.appendChild(palette)

      const input = palette.querySelector('.command-palette-input') as HTMLInputElement
      
      // Initially first item should be selected
      let selected = palette.querySelector('.command-palette-item.selected')
      expect(selected).toBeDefined()

      // Press arrow down
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      input.dispatchEvent(downEvent)

      selected = palette.querySelector('.command-palette-item.selected')
      expect(selected).toBeDefined()

      // Press arrow up
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      input.dispatchEvent(upEvent)

      selected = palette.querySelector('.command-palette-item.selected')
      expect(selected).toBeDefined()

      document.body.removeChild(palette)
    })

    it('should execute selected command on Enter', () => {
      const palette = createCommandPalette(config)
      document.body.appendChild(palette)

      const input = palette.querySelector('.command-palette-input') as HTMLInputElement
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      input.dispatchEvent(enterEvent)

      const shortcut = registry.getShortcut('nav-dashboard')
      expect(shortcut?.handler).toHaveBeenCalled()

      // Cleanup
      if (palette.parentElement) {
        document.body.removeChild(palette)
      }
    })

    it('should close on Escape', () => {
      const palette = createCommandPalette(config)
      document.body.appendChild(palette)

      const input = palette.querySelector('.command-palette-input') as HTMLInputElement
      
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      input.dispatchEvent(escEvent)

      expect(config.onClose).toHaveBeenCalled()
      expect(document.querySelector('.command-palette-overlay')).toBeNull()
    })

    it('should close on overlay click', () => {
      const palette = createCommandPalette(config)
      document.body.appendChild(palette)

      // Click on overlay (not on palette content)
      palette.click()

      expect(config.onClose).toHaveBeenCalled()
      expect(document.querySelector('.command-palette-overlay')).toBeNull()
    })

    it('should display shortcut keys', () => {
      const palette = createCommandPalette(config)
      const keys = palette.querySelectorAll('.command-palette-item-keys')
      expect(keys.length).toBeGreaterThan(0)
      expect(keys[0].textContent).toBeTruthy()
    })

    it('should display command descriptions', () => {
      const palette = createCommandPalette(config)
      const descriptions = palette.querySelectorAll('.command-palette-item-description')
      expect(descriptions.length).toBeGreaterThan(0)
      expect(descriptions[0].textContent).toBeTruthy()
    })
  })

  describe('showCommandPalette', () => {
    let registry: ReturnType<typeof createShortcutRegistry>

    beforeEach(() => {
      registry = createShortcutRegistry()
      registry.addShortcut({
        id: 'test',
        name: 'Test',
        description: 'Test command',
        keys: ['ctrl+t'],
        category: 'actions',
        handler: vi.fn(),
      })
    })

    it('should show command palette in document', () => {
      showCommandPalette({ registry })
      
      const palette = document.querySelector('.command-palette-overlay')
      expect(palette).toBeDefined()

      // Cleanup
      palette?.remove()
    })

    it('should remove existing palette before showing new one', () => {
      showCommandPalette({ registry })
      showCommandPalette({ registry })

      const palettes = document.querySelectorAll('.command-palette-overlay')
      expect(palettes.length).toBe(1)

      // Cleanup
      palettes[0]?.remove()
    })
  })
})
