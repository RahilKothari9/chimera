/**
 * Code Templates UI
 * User interface for browsing and inserting code templates
 */

import {
  getAllTemplates,
  getTemplateCategories,
  getTemplatesByCategory,
  searchTemplates,
  type CodeTemplate,
  type TemplateCategoryId,
} from './codeTemplates'
import { trackActivity } from './activityFeed'
import { notificationManager } from './notificationSystem'

export interface TemplateSelectionCallback {
  (template: CodeTemplate): void
}

/**
 * Create the template library UI
 */
export function createTemplateLibraryUI(onSelect: TemplateSelectionCallback): HTMLElement {
  const container = document.createElement('div')
  container.className = 'template-library'
  container.innerHTML = `
    <div class="template-library-header">
      <h3 class="template-library-title">📚 Code Template Library</h3>
      <p class="template-library-subtitle">Quick-start templates for common patterns and algorithms</p>
    </div>
    
    <div class="template-search">
      <input 
        type="text" 
        id="template-search-input" 
        class="template-search-input" 
        placeholder="Search templates..."
        aria-label="Search templates"
      />
      <button id="template-search-clear" class="template-search-clear" title="Clear search">✕</button>
    </div>
    
    <div class="template-categories" id="template-categories"></div>
    
    <div class="template-list" id="template-list"></div>
  `

  // Setup categories
  const categoriesContainer = container.querySelector('#template-categories')!
  const categories = getTemplateCategories()
  
  let activeCategory: TemplateCategoryId | null = null
  
  categories.forEach(category => {
    const categoryButton = document.createElement('button')
    categoryButton.className = 'template-category-btn'
    categoryButton.innerHTML = `${category.icon} <span>${category.name}</span>`
    categoryButton.title = category.description
    categoryButton.setAttribute('data-category', category.id)
    
    categoryButton.addEventListener('click', () => {
      // Toggle active state
      if (activeCategory === category.id) {
        activeCategory = null
        categoryButton.classList.remove('active')
        showAllTemplates()
      } else {
        activeCategory = category.id
        // Remove active from all buttons
        container.querySelectorAll('.template-category-btn').forEach(btn => {
          btn.classList.remove('active')
        })
        categoryButton.classList.add('active')
        showCategoryTemplates(category.id)
      }
      
      trackActivity('section_view', `Viewed template category ${category.id}`, `${category.name}`)
    })
    
    categoriesContainer.appendChild(categoryButton)
  })

  // Setup search
  const searchInput = container.querySelector('#template-search-input') as HTMLInputElement
  const searchClear = container.querySelector('#template-search-clear') as HTMLButtonElement
  
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim()
    
    if (query) {
      searchClear.style.display = 'block'
      // Clear category selection when searching
      activeCategory = null
      container.querySelectorAll('.template-category-btn').forEach(btn => {
        btn.classList.remove('active')
      })
      showSearchResults(query)
    } else {
      searchClear.style.display = 'none'
      showAllTemplates()
    }
  })
  
  searchClear.addEventListener('click', () => {
    searchInput.value = ''
    searchClear.style.display = 'none'
    showAllTemplates()
  })
  
  searchClear.style.display = 'none'

  // Template list rendering functions
  function renderTemplateList(templates: CodeTemplate[]) {
    const listContainer = container.querySelector('#template-list')!
    
    if (templates.length === 0) {
      listContainer.innerHTML = `
        <div class="template-empty">
          <p>No templates found</p>
        </div>
      `
      return
    }
    
    listContainer.innerHTML = ''
    
    templates.forEach(template => {
      const templateCard = document.createElement('div')
      templateCard.className = 'template-card'
      templateCard.innerHTML = `
        <div class="template-card-header">
          <h4 class="template-card-title">${escapeHtml(template.name)}</h4>
          <span class="template-language-badge">${getLanguageIcon(template.language)} ${template.language}</span>
        </div>
        <p class="template-card-description">${escapeHtml(template.description)}</p>
        <div class="template-card-tags">
          ${template.tags.map(tag => `<span class="template-tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
        <div class="template-card-actions">
          <button class="template-view-btn" data-template-id="${template.id}">
            👁️ Preview
          </button>
          <button class="template-use-btn" data-template-id="${template.id}">
            ✨ Use Template
          </button>
        </div>
      `
      
      // Preview button
      const viewBtn = templateCard.querySelector('.template-view-btn')!
      viewBtn.addEventListener('click', () => {
        showTemplatePreview(template)
        trackActivity('template_preview', `Previewed template ${template.name}`, template.language)
      })
      
      // Use button
      const useBtn = templateCard.querySelector('.template-use-btn')!
      useBtn.addEventListener('click', () => {
        onSelect(template)
        notificationManager.show(`Template "${template.name}" loaded!`, { type: 'success' })
        trackActivity('template_use', `Used template ${template.name}`, `${template.category} - ${template.language}`)
      })
      
      listContainer.appendChild(templateCard)
    })
  }

  function showAllTemplates() {
    const templates = getAllTemplates()
    renderTemplateList(templates)
  }

  function showCategoryTemplates(category: TemplateCategoryId) {
    const templates = getTemplatesByCategory(category)
    renderTemplateList(templates)
  }

  function showSearchResults(query: string) {
    const templates = searchTemplates(query)
    renderTemplateList(templates)
    trackActivity('template_search', `Searched templates for "${query}"`, `${templates.length} results`)
  }

  function showTemplatePreview(template: CodeTemplate) {
    const modal = document.createElement('div')
    modal.className = 'template-preview-modal'
    modal.innerHTML = `
      <div class="template-preview-content">
        <div class="template-preview-header">
          <div>
            <h3>${escapeHtml(template.name)}</h3>
            <p class="template-preview-description">${escapeHtml(template.description)}</p>
          </div>
          <button class="template-preview-close" aria-label="Close preview">✕</button>
        </div>
        
        <div class="template-preview-meta">
          <span class="template-language-badge">${getLanguageIcon(template.language)} ${template.language}</span>
          <span class="template-category-badge">${getCategoryIcon(template.category)} ${template.category}</span>
        </div>
        
        <div class="template-preview-tags">
          ${template.tags.map(tag => `<span class="template-tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
        
        <div class="template-preview-code">
          <pre><code>${escapeHtml(template.code)}</code></pre>
        </div>
        
        <div class="template-preview-actions">
          <button class="template-preview-use">✨ Use This Template</button>
        </div>
      </div>
    `
    
    const closeBtn = modal.querySelector('.template-preview-close')!
    const useBtn = modal.querySelector('.template-preview-use')!
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal)
    })
    
    useBtn.addEventListener('click', () => {
      onSelect(template)
      notificationManager.show(`Template "${template.name}" loaded!`, { type: 'success' })
      trackActivity('template_use', `Used template ${template.name}`, `${template.category} - ${template.language}`)
      document.body.removeChild(modal)
    })
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal)
      }
    })
    
    // Close on Escape
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.body.contains(modal)) {
        document.body.removeChild(modal)
        document.removeEventListener('keydown', escapeHandler)
      }
    }
    document.addEventListener('keydown', escapeHandler)
    
    document.body.appendChild(modal)
  }

  // Initialize with all templates
  showAllTemplates()

  return container
}

/**
 * Get language icon
 */
function getLanguageIcon(language: string): string {
  const icons: Record<string, string> = {
    javascript: '🟨',
    typescript: '🔷',
    python: '🐍',
    html: '🌐',
    css: '🎨',
    json: '📋',
  }
  return icons[language] || '📄'
}

/**
 * Get category icon
 */
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    algorithms: '🧮',
    'data-structures': '📊',
    utilities: '🛠️',
    patterns: '🎨',
    'web-apis': '🌐',
    examples: '💡',
  }
  return icons[category] || '📚'
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
