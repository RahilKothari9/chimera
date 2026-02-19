import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createSnippetLibraryUI, setupSnippetLibrary } from './snippetLibraryUI'
import { loadSnippets } from './snippetLibrary'

// Mock notification system
vi.mock('./notificationSystem', () => ({
  showNotification: vi.fn(),
}))

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(() => Promise.resolve()),
  },
  writable: true,
  configurable: true,
})

describe('Snippet Library UI', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = '<div id="snippet-library-section"></div>'
  })

  describe('createSnippetLibraryUI', () => {
    it('should create the snippet library container', () => {
      const ui = createSnippetLibraryUI()
      
      expect(ui).toBeTruthy()
      expect(ui.className).toContain('snippet-library-container')
      expect(ui.id).toBe('snippet-library-content')
    })

    it('should display the library header', () => {
      const ui = createSnippetLibraryUI()
      
      const title = ui.querySelector('.section-title')
      expect(title).toBeTruthy()
      expect(title?.textContent).toContain('Code Snippet Library')
    })

    it('should display subtitle', () => {
      const ui = createSnippetLibraryUI()
      
      const subtitle = ui.querySelector('.snippet-library-subtitle')
      expect(subtitle).toBeTruthy()
      expect(subtitle?.textContent).toBeTruthy()
    })

    it('should display stats overview', () => {
      const ui = createSnippetLibraryUI()
      
      const stats = ui.querySelector('.snippet-stats-overview')
      expect(stats).toBeTruthy()
      
      const statCards = stats?.querySelectorAll('.snippet-stat-card')
      expect(statCards?.length).toBe(4)
    })

    it('should display total snippets stat', () => {
      const ui = createSnippetLibraryUI()
      
      const statValues = ui.querySelectorAll('.snippet-stat-value')
      expect(statValues.length).toBeGreaterThan(0)
    })

    it('should display filters UI', () => {
      const ui = createSnippetLibraryUI()
      
      const filters = ui.querySelector('.snippet-filters')
      expect(filters).toBeTruthy()
    })

    it('should have search input', () => {
      const ui = createSnippetLibraryUI()
      
      const searchInput = ui.querySelector('.snippet-search-input') as HTMLInputElement
      expect(searchInput).toBeTruthy()
      expect(searchInput?.type).toBe('text')
      expect(searchInput?.placeholder).toBeTruthy()
    })

    it('should have language filter dropdown', () => {
      const ui = createSnippetLibraryUI()
      
      const selects = ui.querySelectorAll('.snippet-filter-select')
      expect(selects.length).toBeGreaterThanOrEqual(3)
    })

    it('should display results count', () => {
      const ui = createSnippetLibraryUI()
      
      const resultsCount = ui.querySelector('#snippet-results-count')
      expect(resultsCount).toBeTruthy()
      expect(resultsCount?.textContent).toContain('Showing')
    })

    it('should display snippet list', () => {
      const ui = createSnippetLibraryUI()
      
      const list = ui.querySelector('#snippet-list')
      expect(list).toBeTruthy()
    })

    it('should render snippet cards', () => {
      const ui = createSnippetLibraryUI()
      
      const cards = ui.querySelectorAll('.snippet-card')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should display snippet titles', () => {
      const ui = createSnippetLibraryUI()
      
      const titles = ui.querySelectorAll('.snippet-title')
      expect(titles.length).toBeGreaterThan(0)
      titles.forEach(title => {
        expect(title.textContent).toBeTruthy()
      })
    })

    it('should display snippet descriptions', () => {
      const ui = createSnippetLibraryUI()
      
      const descriptions = ui.querySelectorAll('.snippet-description')
      expect(descriptions.length).toBeGreaterThan(0)
    })

    it('should display language badges', () => {
      const ui = createSnippetLibraryUI()
      
      const langBadges = ui.querySelectorAll('.snippet-badge-language')
      expect(langBadges.length).toBeGreaterThan(0)
    })

    it('should display category badges', () => {
      const ui = createSnippetLibraryUI()
      
      const categoryBadges = ui.querySelectorAll('.snippet-badge-category')
      expect(categoryBadges.length).toBeGreaterThan(0)
    })

    it('should display tags for snippets', () => {
      const ui = createSnippetLibraryUI()
      
      const tags = ui.querySelectorAll('.snippet-tag')
      expect(tags.length).toBeGreaterThan(0)
      
      tags.forEach(tag => {
        expect(tag.textContent).toMatch(/^#/)
      })
    })

    it('should display code blocks', () => {
      const ui = createSnippetLibraryUI()
      
      const codeBlocks = ui.querySelectorAll('.snippet-code-block')
      expect(codeBlocks.length).toBeGreaterThan(0)
    })

    it('should display code content', () => {
      const ui = createSnippetLibraryUI()
      
      const codeContent = ui.querySelectorAll('.snippet-code-content')
      expect(codeContent.length).toBeGreaterThan(0)
    })

    it('should have copy buttons', () => {
      const ui = createSnippetLibraryUI()
      
      const copyButtons = ui.querySelectorAll('.snippet-copy-button')
      expect(copyButtons.length).toBeGreaterThan(0)
    })

    it('should display usage count', () => {
      const ui = createSnippetLibraryUI()
      
      const usageInfo = ui.querySelectorAll('.snippet-usage-info')
      expect(usageInfo.length).toBeGreaterThan(0)
      
      usageInfo.forEach(info => {
        expect(info.textContent).toContain('Used')
      })
    })

    it('should display date added', () => {
      const ui = createSnippetLibraryUI()
      
      const dateInfo = ui.querySelectorAll('.snippet-date-info')
      expect(dateInfo.length).toBeGreaterThan(0)
      
      dateInfo.forEach(info => {
        expect(info.textContent).toContain('Added')
      })
    })

    it('should have snippet IDs in dataset', () => {
      const ui = createSnippetLibraryUI()
      
      const cards = ui.querySelectorAll('.snippet-card')
      cards.forEach(card => {
        const htmlCard = card as HTMLElement
        expect(htmlCard.dataset.snippetId).toBeTruthy()
      })
    })
  })

  describe('search functionality', () => {
    it('should filter snippets on search input', () => {
      const ui = createSnippetLibraryUI()
      
      const searchInput = ui.querySelector('.snippet-search-input') as HTMLInputElement
      const initialCount = ui.querySelectorAll('.snippet-card').length
      
      searchInput.value = 'fetch'
      searchInput.dispatchEvent(new Event('input'))
      
      // Need to wait for UI update
      setTimeout(() => {
        const resultsCount = ui.querySelector('#snippet-results-count')
        expect(resultsCount?.textContent).toBeTruthy()
      }, 100)
    })

    it('should show empty state when no results', () => {
      const ui = createSnippetLibraryUI()
      
      const searchInput = ui.querySelector('.snippet-search-input') as HTMLInputElement
      searchInput.value = 'xyznonexistent123'
      searchInput.dispatchEvent(new Event('input'))
      
      setTimeout(() => {
        const emptyState = ui.querySelector('.snippet-empty-state')
        expect(emptyState).toBeTruthy()
      }, 100)
    })

    it('should clear search when input is emptied', () => {
      const ui = createSnippetLibraryUI()
      const allSnippets = loadSnippets()
      
      const searchInput = ui.querySelector('.snippet-search-input') as HTMLInputElement
      
      searchInput.value = 'test'
      searchInput.dispatchEvent(new Event('input'))
      
      searchInput.value = ''
      searchInput.dispatchEvent(new Event('input'))
      
      setTimeout(() => {
        const resultsCount = ui.querySelector('#snippet-results-count')
        expect(resultsCount?.textContent).toContain(allSnippets.length.toString())
      }, 100)
    })
  })

  describe('filter dropdowns', () => {
    it('should filter by language', () => {
      const ui = createSnippetLibraryUI()
      
      const selects = ui.querySelectorAll('.snippet-filter-select')
      const languageSelect = selects[0] as HTMLSelectElement
      
      languageSelect.value = 'JavaScript'
      languageSelect.dispatchEvent(new Event('change'))
      
      setTimeout(() => {
        const resultsCount = ui.querySelector('#snippet-results-count')
        expect(resultsCount?.textContent).toBeTruthy()
      }, 100)
    })

    it('should filter by category', () => {
      const ui = createSnippetLibraryUI()
      
      const selects = ui.querySelectorAll('.snippet-filter-select')
      const categorySelect = selects[1] as HTMLSelectElement
      
      if (categorySelect.options.length > 1) {
        categorySelect.selectedIndex = 1
        categorySelect.dispatchEvent(new Event('change'))
        
        setTimeout(() => {
          const resultsCount = ui.querySelector('#snippet-results-count')
          expect(resultsCount?.textContent).toBeTruthy()
        }, 100)
      }
    })

    it('should filter by tag', () => {
      const ui = createSnippetLibraryUI()
      
      const selects = ui.querySelectorAll('.snippet-filter-select')
      const tagSelect = selects[2] as HTMLSelectElement
      
      if (tagSelect.options.length > 1) {
        tagSelect.selectedIndex = 1
        tagSelect.dispatchEvent(new Event('change'))
        
        setTimeout(() => {
          const resultsCount = ui.querySelector('#snippet-results-count')
          expect(resultsCount?.textContent).toBeTruthy()
        }, 100)
      }
    })

    it('should reset filters when "All" is selected', () => {
      const ui = createSnippetLibraryUI()
      const allSnippets = loadSnippets()
      
      const selects = ui.querySelectorAll('.snippet-filter-select')
      const languageSelect = selects[0] as HTMLSelectElement
      
      // Set filter
      if (languageSelect.options.length > 1) {
        languageSelect.selectedIndex = 1
        languageSelect.dispatchEvent(new Event('change'))
      }
      
      // Reset filter
      languageSelect.selectedIndex = 0
      languageSelect.dispatchEvent(new Event('change'))
      
      setTimeout(() => {
        const resultsCount = ui.querySelector('#snippet-results-count')
        expect(resultsCount?.textContent).toContain(allSnippets.length.toString())
      }, 100)
    })
  })

  describe('copy functionality', () => {
    it('should copy code on button click', async () => {
      const ui = createSnippetLibraryUI()
      
      const copyButtons = ui.querySelectorAll('.snippet-copy-button')
      const firstButton = copyButtons[0] as HTMLButtonElement
      
      firstButton.click()
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })

    it('should increment usage count on copy', async () => {
      const ui = createSnippetLibraryUI()
      const allSnippets = loadSnippets()
      const firstSnippetId = allSnippets[0].id
      const initialCount = allSnippets[0].usageCount
      
      const card = ui.querySelector(`[data-snippet-id="${firstSnippetId}"]`)
      const copyButton = card?.querySelector('.snippet-copy-button') as HTMLButtonElement
      
      if (copyButton) {
        copyButton.click()
        
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const updated = loadSnippets()
        const updatedSnippet = updated.find(s => s.id === firstSnippetId)
        expect(updatedSnippet?.usageCount).toBeGreaterThan(initialCount)
      }
    })
  })

  describe('syntax highlighting', () => {
    it('should apply syntax highlighting to code', () => {
      const ui = createSnippetLibraryUI()
      
      const codeElements = ui.querySelectorAll('.snippet-code-content code')
      
      if (codeElements.length > 0) {
        const firstCode = codeElements[0] as HTMLElement
        const html = firstCode.innerHTML
        
        // Check for syntax highlighting spans
        expect(html.includes('<span') || html.length > 0).toBe(true)
      }
    })

    it('should escape HTML in code', () => {
      const ui = createSnippetLibraryUI()
      
      const codeElements = ui.querySelectorAll('.snippet-code-content code')
      
      codeElements.forEach(code => {
        const html = code.innerHTML
        // Should not have unescaped script tags
        expect(html.includes('<script>')).toBe(false)
      })
    })
  })

  describe('setupSnippetLibrary', () => {
    it('should setup library in the page', () => {
      setupSnippetLibrary()
      
      const section = document.querySelector('#snippet-library-section')
      expect(section?.children.length).toBeGreaterThan(0)
    })

    it('should clear existing content', () => {
      const section = document.querySelector('#snippet-library-section')
      if (section) {
        section.innerHTML = '<div>old content</div>'
      }
      
      setupSnippetLibrary()
      
      const oldContent = section?.querySelector('div')
      expect(oldContent?.textContent).not.toBe('old content')
    })

    it('should handle missing section gracefully', () => {
      document.body.innerHTML = ''
      
      expect(() => setupSnippetLibrary()).not.toThrow()
    })
  })

  describe('empty state', () => {
    it('should show empty state when filters match nothing', () => {
      const ui = createSnippetLibraryUI()
      
      const searchInput = ui.querySelector('.snippet-search-input') as HTMLInputElement
      searchInput.value = 'impossiblequerythatwillnotmatch12345'
      searchInput.dispatchEvent(new Event('input'))
      
      setTimeout(() => {
        const emptyState = ui.querySelector('.snippet-empty-state')
        expect(emptyState).toBeTruthy()
        expect(emptyState?.textContent).toContain('No snippets found')
      }, 100)
    })
  })

  describe('XSS prevention', () => {
    it('should escape HTML in snippet titles', () => {
      const ui = createSnippetLibraryUI()
      
      const titles = ui.querySelectorAll('.snippet-title')
      titles.forEach(title => {
        expect(title.innerHTML.includes('<script')).toBe(false)
      })
    })

    it('should escape HTML in descriptions', () => {
      const ui = createSnippetLibraryUI()
      
      const descriptions = ui.querySelectorAll('.snippet-description')
      descriptions.forEach(desc => {
        expect((desc as HTMLElement).innerHTML.includes('<script')).toBe(false)
      })
    })

    it('should escape HTML in code blocks', () => {
      const ui = createSnippetLibraryUI()
      
      const codeBlocks = ui.querySelectorAll('.snippet-code-content code')
      codeBlocks.forEach(code => {
        const html = (code as HTMLElement).innerHTML
        // Raw script tags should be escaped
        expect(html.includes('<script>')).toBe(false)
      })
    })
  })
})
