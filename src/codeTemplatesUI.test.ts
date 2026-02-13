import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createTemplateLibraryUI } from './codeTemplatesUI'
import type { CodeTemplate } from './codeTemplates'

// Mock dependencies
vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}))

vi.mock('./notificationUI', () => ({
  showNotification: vi.fn(),
}))

describe('Code Templates UI', () => {
  let container: HTMLElement
  let mockCallback: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockCallback = vi.fn()
    container = createTemplateLibraryUI(mockCallback)
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.clearAllMocks()
  })

  describe('Structure', () => {
    it('should create template library container', () => {
      expect(container.className).toBe('template-library')
    })

    it('should have header with title and subtitle', () => {
      const title = container.querySelector('.template-library-title')
      const subtitle = container.querySelector('.template-library-subtitle')
      expect(title?.textContent).toContain('Code Template Library')
      expect(subtitle).toBeTruthy()
    })

    it('should have search input', () => {
      const search = container.querySelector('#template-search-input')
      expect(search).toBeTruthy()
      expect(search?.getAttribute('type')).toBe('text')
      expect(search?.getAttribute('placeholder')).toBeTruthy()
    })

    it('should have search clear button', () => {
      const clearBtn = container.querySelector('#template-search-clear')
      expect(clearBtn).toBeTruthy()
    })

    it('should have categories container', () => {
      const categories = container.querySelector('#template-categories')
      expect(categories).toBeTruthy()
    })

    it('should have template list container', () => {
      const list = container.querySelector('#template-list')
      expect(list).toBeTruthy()
    })
  })

  describe('Categories', () => {
    it('should display category buttons', () => {
      const categoryBtns = container.querySelectorAll('.template-category-btn')
      expect(categoryBtns.length).toBeGreaterThan(0)
    })

    it('should have standard categories', () => {
      const categories = container.querySelectorAll('.template-category-btn')
      const categoryText = Array.from(categories).map(c => c.textContent?.toLowerCase() || '')
      
      expect(categoryText.some(t => t.includes('algorithms'))).toBe(true)
      expect(categoryText.some(t => t.includes('data structures'))).toBe(true)
      expect(categoryText.some(t => t.includes('utilities'))).toBe(true)
    })

    it('should toggle category active state on click', () => {
      const firstCategory = container.querySelector('.template-category-btn') as HTMLButtonElement
      expect(firstCategory.classList.contains('active')).toBe(false)
      
      firstCategory.click()
      expect(firstCategory.classList.contains('active')).toBe(true)
      
      firstCategory.click()
      expect(firstCategory.classList.contains('active')).toBe(false)
    })

    it('should filter templates by category', () => {
      const algorithmBtn = Array.from(container.querySelectorAll('.template-category-btn'))
        .find(btn => btn.getAttribute('data-category') === 'algorithms') as HTMLButtonElement
      
      algorithmBtn?.click()
      
      const templates = container.querySelectorAll('.template-card')
      expect(templates.length).toBeGreaterThan(0)
    })

    it('should show only one active category at a time', () => {
      const categoryBtns = Array.from(container.querySelectorAll('.template-category-btn')) as HTMLButtonElement[]
      
      categoryBtns[0]?.click()
      expect(categoryBtns[0]?.classList.contains('active')).toBe(true)
      
      categoryBtns[1]?.click()
      expect(categoryBtns[0]?.classList.contains('active')).toBe(false)
      expect(categoryBtns[1]?.classList.contains('active')).toBe(true)
    })
  })

  describe('Template Display', () => {
    it('should display template cards initially', () => {
      const cards = container.querySelectorAll('.template-card')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should have template card structure', () => {
      const card = container.querySelector('.template-card')
      expect(card).toBeTruthy()
      
      const title = card?.querySelector('.template-card-title')
      const description = card?.querySelector('.template-card-description')
      const tags = card?.querySelector('.template-card-tags')
      const actions = card?.querySelector('.template-card-actions')
      
      expect(title).toBeTruthy()
      expect(description).toBeTruthy()
      expect(tags).toBeTruthy()
      expect(actions).toBeTruthy()
    })

    it('should display language badge', () => {
      const card = container.querySelector('.template-card')
      const badge = card?.querySelector('.template-language-badge')
      expect(badge).toBeTruthy()
      expect(badge?.textContent).toBeTruthy()
    })

    it('should display tags', () => {
      const card = container.querySelector('.template-card')
      const tags = card?.querySelectorAll('.template-tag')
      expect(tags && tags.length).toBeGreaterThan(0)
    })

    it('should have preview and use buttons', () => {
      const card = container.querySelector('.template-card')
      const viewBtn = card?.querySelector('.template-view-btn')
      const useBtn = card?.querySelector('.template-use-btn')
      
      expect(viewBtn).toBeTruthy()
      expect(useBtn).toBeTruthy()
    })

    it('should escape HTML in template names', () => {
      const cards = container.querySelectorAll('.template-card-title')
      cards.forEach(card => {
        expect(card.textContent).not.toContain('<')
        expect(card.textContent).not.toContain('>')
      })
    })
  })

  describe('Search Functionality', () => {
    it('should filter templates on search input', () => {
      const searchInput = container.querySelector('#template-search-input') as HTMLInputElement
      
      searchInput.value = 'binary'
      searchInput.dispatchEvent(new Event('input'))
      
      const cards = container.querySelectorAll('.template-card')
      expect(cards.length).toBeGreaterThan(0)
      expect(cards.length).toBeLessThan(20) // Should be fewer than all templates
    })

    it('should show clear button when searching', () => {
      const searchInput = container.querySelector('#template-search-input') as HTMLInputElement
      const clearBtn = container.querySelector('#template-search-clear') as HTMLElement
      
      expect(clearBtn.style.display).toBe('none')
      
      searchInput.value = 'search'
      searchInput.dispatchEvent(new Event('input'))
      
      expect(clearBtn.style.display).toBe('block')
    })

    it('should clear search when clear button clicked', () => {
      const searchInput = container.querySelector('#template-search-input') as HTMLInputElement
      const clearBtn = container.querySelector('#template-search-clear') as HTMLButtonElement
      
      searchInput.value = 'test'
      searchInput.dispatchEvent(new Event('input'))
      
      clearBtn.click()
      
      expect(searchInput.value).toBe('')
      expect(clearBtn.style.display).toBe('none')
    })

    it('should show all templates when search is cleared', () => {
      const searchInput = container.querySelector('#template-search-input') as HTMLInputElement
      const clearBtn = container.querySelector('#template-search-clear') as HTMLButtonElement
      
      searchInput.value = 'binary'
      searchInput.dispatchEvent(new Event('input'))
      const searchResults = container.querySelectorAll('.template-card').length
      
      clearBtn.click()
      const allResults = container.querySelectorAll('.template-card').length
      
      expect(allResults).toBeGreaterThan(searchResults)
    })

    it('should show empty state when no results', () => {
      const searchInput = container.querySelector('#template-search-input') as HTMLInputElement
      
      searchInput.value = 'xyznonexistent123'
      searchInput.dispatchEvent(new Event('input'))
      
      const empty = container.querySelector('.template-empty')
      expect(empty).toBeTruthy()
      expect(empty?.textContent).toContain('No templates found')
    })

    it('should clear category selection when searching', () => {
      const categoryBtn = container.querySelector('.template-category-btn') as HTMLButtonElement
      const searchInput = container.querySelector('#template-search-input') as HTMLInputElement
      
      categoryBtn.click()
      expect(categoryBtn.classList.contains('active')).toBe(true)
      
      searchInput.value = 'test'
      searchInput.dispatchEvent(new Event('input'))
      
      expect(categoryBtn.classList.contains('active')).toBe(false)
    })
  })

  describe('Template Actions', () => {
    it('should call callback when use button clicked', () => {
      const useBtn = container.querySelector('.template-use-btn') as HTMLButtonElement
      useBtn.click()
      
      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          code: expect.any(String),
        })
      )
    })

    it('should open preview modal when preview button clicked', () => {
      const viewBtn = container.querySelector('.template-view-btn') as HTMLButtonElement
      viewBtn.click()
      
      const modal = document.querySelector('.template-preview-modal')
      expect(modal).toBeTruthy()
      
      // Cleanup
      if (modal) document.body.removeChild(modal)
    })
  })

  describe('Preview Modal', () => {
    let modal: Element

    beforeEach(() => {
      const viewBtn = container.querySelector('.template-view-btn') as HTMLButtonElement
      viewBtn.click()
      modal = document.querySelector('.template-preview-modal')!
    })

    afterEach(() => {
      if (modal && document.body.contains(modal)) {
        document.body.removeChild(modal)
      }
    })

    it('should display template details in modal', () => {
      expect(modal).toBeTruthy()
      
      const title = modal.querySelector('h3')
      const description = modal.querySelector('.template-preview-description')
      const code = modal.querySelector('.template-preview-code code')
      
      expect(title?.textContent).toBeTruthy()
      expect(description?.textContent).toBeTruthy()
      expect(code?.textContent).toBeTruthy()
    })

    it('should have close button', () => {
      const closeBtn = modal.querySelector('.template-preview-close')
      expect(closeBtn).toBeTruthy()
    })

    it('should have use button in modal', () => {
      const useBtn = modal.querySelector('.template-preview-use')
      expect(useBtn).toBeTruthy()
    })

    it('should close modal when close button clicked', () => {
      const closeBtn = modal.querySelector('.template-preview-close') as HTMLButtonElement
      closeBtn.click()
      
      expect(document.body.contains(modal)).toBe(false)
    })

    it('should call callback when use button in modal clicked', () => {
      const useBtn = modal.querySelector('.template-preview-use') as HTMLButtonElement
      useBtn.click()
      
      expect(mockCallback).toHaveBeenCalled()
      expect(document.body.contains(modal)).toBe(false)
    })

    it('should close modal on backdrop click', () => {
      const backdropEvent = new MouseEvent('click', { bubbles: true })
      Object.defineProperty(backdropEvent, 'target', { value: modal, enumerable: true })
      modal.dispatchEvent(backdropEvent)
      
      expect(document.body.contains(modal)).toBe(false)
    })

    it('should close modal on Escape key', () => {
      expect(document.body.contains(modal)).toBe(true)
      
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escapeEvent)
      
      // Wait a tick for the event handler
      setTimeout(() => {
        expect(document.body.contains(modal)).toBe(false)
      }, 0)
    })

    it('should display language badge in modal', () => {
      const badge = modal.querySelector('.template-language-badge')
      expect(badge).toBeTruthy()
    })

    it('should display category badge in modal', () => {
      const badge = modal.querySelector('.template-category-badge')
      expect(badge).toBeTruthy()
    })

    it('should display tags in modal', () => {
      const tags = modal.querySelectorAll('.template-tag')
      expect(tags.length).toBeGreaterThan(0)
    })

    it('should escape HTML in modal content', () => {
      const title = modal.querySelector('h3')
      const description = modal.querySelector('.template-preview-description')
      
      expect(title?.innerHTML).not.toContain('<script')
      expect(description?.innerHTML).not.toContain('<script')
    })
  })

  describe('Accessibility', () => {
    it('should have ARIA label for search input', () => {
      const searchInput = container.querySelector('#template-search-input')
      expect(searchInput?.getAttribute('aria-label')).toBeTruthy()
    })

    it('should have ARIA label for close button in modal', () => {
      const viewBtn = container.querySelector('.template-view-btn') as HTMLButtonElement
      viewBtn.click()
      
      const modal = document.querySelector('.template-preview-modal')!
      const closeBtn = modal.querySelector('.template-preview-close')
      
      expect(closeBtn?.getAttribute('aria-label')).toBeTruthy()
      
      // Cleanup
      document.body.removeChild(modal)
    })

    it('should have title attributes for category buttons', () => {
      const categoryBtns = container.querySelectorAll('.template-category-btn')
      categoryBtns.forEach(btn => {
        expect(btn.getAttribute('title')).toBeTruthy()
      })
    })
  })
})
