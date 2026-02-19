/**
 * Interactive Code Snippet Library UI
 * Beautiful, searchable interface for browsing and copying code snippets
 */

import {
  loadSnippets,
  getLanguages,
  getCategories,
  getAllTags,
  filterSnippets,
  incrementUsageCount,
  getMostUsedSnippets,
  getSnippetStats,
  type CodeSnippet,
  type SnippetFilters,
} from './snippetLibrary'
import { trackActivity } from './activityFeed'
import { notificationManager } from './notificationSystem'

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Simple syntax highlighting for code
 */
function highlightCode(code: string, _language: string): string {
  // Escape HTML first
  const escaped = escapeHtml(code)
  
  // Basic syntax highlighting patterns
  let highlighted = escaped
  
  // Highlight comments
  highlighted = highlighted.replace(
    /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm,
    '<span class="syntax-comment">$1</span>'
  )
  
  // Highlight strings
  highlighted = highlighted.replace(
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
    '<span class="syntax-string">$1</span>'
  )
  
  // Highlight keywords
  const keywords = [
    'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return',
    'class', 'interface', 'type', 'import', 'export', 'async', 'await', 'try',
    'catch', 'throw', 'new', 'this', 'super', 'extends', 'implements', 'def',
    'from', 'yield', 'with', 'as', 'in', 'not', 'and', 'or', 'is', 'None',
    'True', 'False', 'self', '__init__', '__enter__', '__exit__',
  ]
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g')
    highlighted = highlighted.replace(regex, '<span class="syntax-keyword">$1</span>')
  })
  
  // Highlight numbers
  highlighted = highlighted.replace(
    /\b(\d+\.?\d*)\b/g,
    '<span class="syntax-number">$1</span>'
  )
  
  return highlighted
}

/**
 * Copy code to clipboard
 */
async function copyToClipboard(code: string, snippetId: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(code)
    incrementUsageCount(snippetId)
    notificationManager.show('Code copied to clipboard!', { type: 'success' })
    trackActivity('snippet', 'Copied Code Snippet', `Snippet ID: ${snippetId}`)
  } catch (error) {
    notificationManager.show('Failed to copy code', { type: 'error' })
  }
}

/**
 * Create snippet card
 */
function createSnippetCard(snippet: CodeSnippet): HTMLElement {
  const card = document.createElement('div')
  card.className = 'snippet-card'
  card.dataset.snippetId = snippet.id
  
  const header = document.createElement('div')
  header.className = 'snippet-card-header'
  
  const titleRow = document.createElement('div')
  titleRow.className = 'snippet-title-row'
  
  const title = document.createElement('h3')
  title.className = 'snippet-title'
  title.textContent = snippet.title
  
  const badges = document.createElement('div')
  badges.className = 'snippet-badges'
  
  const langBadge = document.createElement('span')
  langBadge.className = 'snippet-badge snippet-badge-language'
  langBadge.textContent = snippet.language
  
  const categoryBadge = document.createElement('span')
  categoryBadge.className = 'snippet-badge snippet-badge-category'
  categoryBadge.textContent = snippet.category
  
  badges.appendChild(langBadge)
  badges.appendChild(categoryBadge)
  
  titleRow.appendChild(title)
  titleRow.appendChild(badges)
  
  const description = document.createElement('p')
  description.className = 'snippet-description'
  description.textContent = snippet.description
  
  header.appendChild(titleRow)
  header.appendChild(description)
  
  // Tags
  if (snippet.tags.length > 0) {
    const tagsContainer = document.createElement('div')
    tagsContainer.className = 'snippet-tags'
    
    snippet.tags.forEach(tag => {
      const tagEl = document.createElement('span')
      tagEl.className = 'snippet-tag'
      tagEl.textContent = `#${tag}`
      tagsContainer.appendChild(tagEl)
    })
    
    header.appendChild(tagsContainer)
  }
  
  // Code block
  const codeBlock = document.createElement('div')
  codeBlock.className = 'snippet-code-block'
  
  const codeHeader = document.createElement('div')
  codeHeader.className = 'snippet-code-header'
  
  const langLabel = document.createElement('span')
  langLabel.className = 'snippet-code-language'
  langLabel.textContent = snippet.language
  
  const copyBtn = document.createElement('button')
  copyBtn.className = 'snippet-copy-button'
  copyBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
    Copy
  `
  copyBtn.onclick = () => copyToClipboard(snippet.code, snippet.id)
  
  codeHeader.appendChild(langLabel)
  codeHeader.appendChild(copyBtn)
  
  const codeContent = document.createElement('pre')
  codeContent.className = 'snippet-code-content'
  
  const code = document.createElement('code')
  code.innerHTML = highlightCode(snippet.code, snippet.language)
  
  codeContent.appendChild(code)
  codeBlock.appendChild(codeHeader)
  codeBlock.appendChild(codeContent)
  
  // Footer
  const footer = document.createElement('div')
  footer.className = 'snippet-card-footer'
  
  const usageInfo = document.createElement('span')
  usageInfo.className = 'snippet-usage-info'
  usageInfo.textContent = `Used ${snippet.usageCount} times`
  
  const dateInfo = document.createElement('span')
  dateInfo.className = 'snippet-date-info'
  dateInfo.textContent = `Added: ${snippet.dateAdded}`
  
  footer.appendChild(usageInfo)
  footer.appendChild(dateInfo)
  
  card.appendChild(header)
  card.appendChild(codeBlock)
  card.appendChild(footer)
  
  return card
}

/**
 * Create stats overview
 */
function createStatsOverview(snippets: CodeSnippet[]): HTMLElement {
  const stats = getSnippetStats(snippets)
  
  const container = document.createElement('div')
  container.className = 'snippet-stats-overview'
  
  const totalCard = document.createElement('div')
  totalCard.className = 'snippet-stat-card'
  totalCard.innerHTML = `
    <div class="snippet-stat-icon">📚</div>
    <div class="snippet-stat-label">Total Snippets</div>
    <div class="snippet-stat-value">${stats.totalSnippets}</div>
  `
  
  const languagesCard = document.createElement('div')
  languagesCard.className = 'snippet-stat-card'
  languagesCard.innerHTML = `
    <div class="snippet-stat-icon">💬</div>
    <div class="snippet-stat-label">Languages</div>
    <div class="snippet-stat-value">${Object.keys(stats.languageBreakdown).length}</div>
  `
  
  const categoriesCard = document.createElement('div')
  categoriesCard.className = 'snippet-stat-card'
  categoriesCard.innerHTML = `
    <div class="snippet-stat-icon">🗂️</div>
    <div class="snippet-stat-label">Categories</div>
    <div class="snippet-stat-value">${Object.keys(stats.categoryBreakdown).length}</div>
  `
  
  const mostUsed = getMostUsedSnippets(snippets, 1)[0]
  const topUsageCard = document.createElement('div')
  topUsageCard.className = 'snippet-stat-card'
  topUsageCard.innerHTML = `
    <div class="snippet-stat-icon">⭐</div>
    <div class="snippet-stat-label">Most Used</div>
    <div class="snippet-stat-value">${mostUsed ? mostUsed.usageCount : 0}</div>
  `
  
  container.appendChild(totalCard)
  container.appendChild(languagesCard)
  container.appendChild(categoriesCard)
  container.appendChild(topUsageCard)
  
  return container
}

/**
 * Create filters UI
 */
function createFiltersUI(
  snippets: CodeSnippet[],
  currentFilters: SnippetFilters,
  onFilterChange: (filters: SnippetFilters) => void
): HTMLElement {
  const container = document.createElement('div')
  container.className = 'snippet-filters'
  
  // Search input
  const searchContainer = document.createElement('div')
  searchContainer.className = 'snippet-search-container'
  
  const searchInput = document.createElement('input')
  searchInput.type = 'text'
  searchInput.className = 'snippet-search-input'
  searchInput.placeholder = 'Search snippets...'
  searchInput.value = currentFilters.searchTerm || ''
  
  searchInput.oninput = () => {
    onFilterChange({ ...currentFilters, searchTerm: searchInput.value })
  }
  
  searchContainer.appendChild(searchInput)
  
  // Filter dropdowns
  const dropdownsContainer = document.createElement('div')
  dropdownsContainer.className = 'snippet-filter-dropdowns'
  
  // Language filter
  const languageSelect = document.createElement('select')
  languageSelect.className = 'snippet-filter-select'
  
  const langAllOption = document.createElement('option')
  langAllOption.value = ''
  langAllOption.textContent = 'All Languages'
  languageSelect.appendChild(langAllOption)
  
  getLanguages(snippets).forEach(lang => {
    const option = document.createElement('option')
    option.value = lang
    option.textContent = lang
    if (currentFilters.language === lang) {
      option.selected = true
    }
    languageSelect.appendChild(option)
  })
  
  languageSelect.onchange = () => {
    onFilterChange({ ...currentFilters, language: languageSelect.value || undefined })
  }
  
  // Category filter
  const categorySelect = document.createElement('select')
  categorySelect.className = 'snippet-filter-select'
  
  const catAllOption = document.createElement('option')
  catAllOption.value = ''
  catAllOption.textContent = 'All Categories'
  categorySelect.appendChild(catAllOption)
  
  getCategories(snippets).forEach(cat => {
    const option = document.createElement('option')
    option.value = cat
    option.textContent = cat
    if (currentFilters.category === cat) {
      option.selected = true
    }
    categorySelect.appendChild(option)
  })
  
  categorySelect.onchange = () => {
    onFilterChange({ ...currentFilters, category: categorySelect.value || undefined })
  }
  
  // Tag filter
  const tagSelect = document.createElement('select')
  tagSelect.className = 'snippet-filter-select'
  
  const tagAllOption = document.createElement('option')
  tagAllOption.value = ''
  tagAllOption.textContent = 'All Tags'
  tagSelect.appendChild(tagAllOption)
  
  getAllTags(snippets).slice(0, 20).forEach(({ tag }) => {
    const option = document.createElement('option')
    option.value = tag
    option.textContent = `#${tag}`
    if (currentFilters.tag === tag) {
      option.selected = true
    }
    tagSelect.appendChild(option)
  })
  
  tagSelect.onchange = () => {
    onFilterChange({ ...currentFilters, tag: tagSelect.value || undefined })
  }
  
  dropdownsContainer.appendChild(languageSelect)
  dropdownsContainer.appendChild(categorySelect)
  dropdownsContainer.appendChild(tagSelect)
  
  container.appendChild(searchContainer)
  container.appendChild(dropdownsContainer)
  
  return container
}

/**
 * Create snippet library UI
 */
export function createSnippetLibraryUI(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'snippet-library-container'
  container.id = 'snippet-library-content'
  
  const header = document.createElement('div')
  header.className = 'snippet-library-header'
  
  const title = document.createElement('h2')
  title.className = 'section-title'
  title.innerHTML = '📚 Code Snippet Library'
  
  const subtitle = document.createElement('p')
  subtitle.className = 'snippet-library-subtitle'
  subtitle.textContent = 'Searchable collection of useful code patterns across multiple languages'
  
  header.appendChild(title)
  header.appendChild(subtitle)
  
  const allSnippets = loadSnippets()
  let currentFilters: SnippetFilters = {}
  
  const statsOverview = createStatsOverview(allSnippets)
  
  const filtersUI = createFiltersUI(allSnippets, currentFilters, (filters) => {
    currentFilters = filters
    updateSnippetList()
    trackActivity('snippet', 'Filtered Snippets', `Filters: ${JSON.stringify(filters)}`)
  })
  
  const resultsHeader = document.createElement('div')
  resultsHeader.className = 'snippet-results-header'
  
  const resultsCount = document.createElement('div')
  resultsCount.className = 'snippet-results-count'
  resultsCount.id = 'snippet-results-count'
  
  resultsHeader.appendChild(resultsCount)
  
  const snippetList = document.createElement('div')
  snippetList.className = 'snippet-list'
  snippetList.id = 'snippet-list'
  
  function updateSnippetList() {
    const filtered = filterSnippets(allSnippets, currentFilters)
    
    resultsCount.textContent = `Showing ${filtered.length} of ${allSnippets.length} snippets`
    
    snippetList.innerHTML = ''
    
    if (filtered.length === 0) {
      const emptyState = document.createElement('div')
      emptyState.className = 'snippet-empty-state'
      emptyState.innerHTML = `
        <div class="empty-state-icon">🔍</div>
        <h3>No snippets found</h3>
        <p>Try adjusting your filters or search terms</p>
      `
      snippetList.appendChild(emptyState)
      return
    }
    
    filtered.forEach(snippet => {
      const card = createSnippetCard(snippet)
      snippetList.appendChild(card)
    })
  }
  
  updateSnippetList()
  
  container.appendChild(header)
  container.appendChild(statsOverview)
  container.appendChild(filtersUI)
  container.appendChild(resultsHeader)
  container.appendChild(snippetList)
  
  trackActivity('snippet', 'Viewed Snippet Library', `Total snippets: ${allSnippets.length}`)
  
  return container
}

/**
 * Setup snippet library in the page
 */
export function setupSnippetLibrary(): void {
  const section = document.querySelector('#snippet-library-section')
  if (!section) return
  
  section.innerHTML = ''
  const libraryUI = createSnippetLibraryUI()
  section.appendChild(libraryUI)
}
