import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHelpModal, showHelpModal, type HelpModalConfig } from './helpModal'
import { createShortcutRegistry, type ShortcutAction } from './keyboardShortcuts'

describe('Help Modal', () => {
  let registry: ReturnType<typeof createShortcutRegistry>
  let config: HelpModalConfig

  beforeEach(() => {
    registry = createShortcutRegistry()
    
    // Add test shortcuts
    const shortcuts: ShortcutAction[] = [
      {
        id: 'nav-1',
        name: 'Go to Dashboard',
        description: 'Navigate to dashboard',
        keys: ['ctrl+1'],
        category: 'navigation',
        handler: vi.fn(),
      },
      {
        id: 'nav-2',
        name: 'Go to Timeline',
        description: 'Navigate to timeline',
        keys: ['ctrl+2'],
        category: 'navigation',
        handler: vi.fn(),
      },
      {
        id: 'action-1',
        name: 'Export Data',
        description: 'Export data',
        keys: ['ctrl+e'],
        category: 'actions',
        handler: vi.fn(),
      },
      {
        id: 'view-1',
        name: 'Toggle Theme',
        description: 'Switch theme',
        keys: ['ctrl+shift+t'],
        category: 'view',
        handler: vi.fn(),
      },
    ]

    shortcuts.forEach(s => registry.addShortcut(s))

    config = {
      registry,
      onClose: vi.fn(),
    }
  })

  describe('createHelpModal', () => {
    it('should create modal element', () => {
      const modal = createHelpModal(config)
      expect(modal).toBeDefined()
      expect(modal.className).toBe('help-modal-overlay')
    })

    it('should have title', () => {
      const modal = createHelpModal(config)
      const title = modal.querySelector('h2')
      expect(title?.textContent).toContain('Keyboard Shortcuts')
    })

    it('should have close button', () => {
      const modal = createHelpModal(config)
      const closeBtn = modal.querySelector('.help-modal-close')
      expect(closeBtn).toBeDefined()
    })

    it('should display sections for each category', () => {
      const modal = createHelpModal(config)
      const sections = modal.querySelectorAll('.help-modal-section')
      // Should have at least navigation, actions, and view sections
      expect(sections.length).toBeGreaterThanOrEqual(3)
    })

    it('should display category names', () => {
      const modal = createHelpModal(config)
      const titles = modal.querySelectorAll('.help-modal-section-title')
      const titleTexts = Array.from(titles).map(t => t.textContent)
      expect(titleTexts.some(t => t?.includes('Navigation'))).toBe(true)
      expect(titleTexts.some(t => t?.includes('Actions'))).toBe(true)
    })

    it('should display shortcuts in each category', () => {
      const modal = createHelpModal(config)
      const items = modal.querySelectorAll('.help-modal-shortcut-item')
      expect(items.length).toBe(4)
    })

    it('should display shortcut names', () => {
      const modal = createHelpModal(config)
      const names = modal.querySelectorAll('.help-modal-shortcut-name')
      const nameTexts = Array.from(names).map(n => n.textContent)
      expect(nameTexts).toContain('Go to Dashboard')
      expect(nameTexts).toContain('Export Data')
    })

    it('should display shortcut descriptions', () => {
      const modal = createHelpModal(config)
      const descriptions = modal.querySelectorAll('.help-modal-shortcut-description')
      const descTexts = Array.from(descriptions).map(d => d.textContent)
      expect(descTexts).toContain('Navigate to dashboard')
      expect(descTexts).toContain('Export data')
    })

    it('should display shortcut keys', () => {
      const modal = createHelpModal(config)
      const keys = modal.querySelectorAll('.help-modal-shortcut-keys')
      expect(keys.length).toBe(4)
      expect(keys[0].textContent).toBeTruthy()
    })

    it('should have footer with tips', () => {
      const modal = createHelpModal(config)
      const footer = modal.querySelector('.help-modal-footer')
      expect(footer).toBeDefined()
      expect(footer?.textContent).toContain('Tip')
    })

    it('should close when close button clicked', () => {
      const modal = createHelpModal(config)
      document.body.appendChild(modal)

      const closeBtn = modal.querySelector('.help-modal-close') as HTMLElement
      closeBtn.click()

      expect(config.onClose).toHaveBeenCalled()
      expect(document.querySelector('.help-modal-overlay')).toBeNull()
    })

    it('should close when overlay clicked', () => {
      const modal = createHelpModal(config)
      document.body.appendChild(modal)

      modal.click()

      expect(config.onClose).toHaveBeenCalled()
      expect(document.querySelector('.help-modal-overlay')).toBeNull()
    })

    it('should close on Escape key', () => {
      const modal = createHelpModal(config)
      document.body.appendChild(modal)

      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escEvent)

      expect(config.onClose).toHaveBeenCalled()
      expect(document.querySelector('.help-modal-overlay')).toBeNull()
    })

    it('should not display empty categories', () => {
      const emptyRegistry = createShortcutRegistry()
      emptyRegistry.addShortcut({
        id: 'only-nav',
        name: 'Test',
        description: 'Test',
        keys: ['ctrl+t'],
        category: 'navigation',
        handler: vi.fn(),
      })

      const modal = createHelpModal({ registry: emptyRegistry })
      const sections = modal.querySelectorAll('.help-modal-section')
      // Should only have navigation section, not all 4
      expect(sections.length).toBe(1)
    })
  })

  describe('showHelpModal', () => {
    it('should show help modal in document', () => {
      showHelpModal({ registry })
      
      const modal = document.querySelector('.help-modal-overlay')
      expect(modal).toBeDefined()

      // Cleanup
      modal?.remove()
    })

    it('should remove existing modal before showing new one', () => {
      showHelpModal({ registry })
      showHelpModal({ registry })

      const modals = document.querySelectorAll('.help-modal-overlay')
      expect(modals.length).toBe(1)

      // Cleanup
      modals[0]?.remove()
    })
  })
})
