/**
 * HTTP Status Code Reference UI
 */

import {
  searchStatusCodes,
  filterByCategory,
  getCategoryClass,
  getCategoryLabel,
  type HttpStatusCategory,
  type HttpStatusCode,
} from './httpStatusCodes'
import { trackActivity } from './activityFeed'

const ALL_CATEGORIES: (HttpStatusCategory | 'all')[] = ['all', '1xx', '2xx', '3xx', '4xx', '5xx']

export function createHttpStatusCodesUI(): HTMLElement {
  const container = document.createElement('div')
  container.id = 'http-status-codes-dashboard'
  container.className = 'http-status-container card-section'

  container.innerHTML = `
    <h2 class="section-title">🌐 HTTP Status Code Reference</h2>
    <div class="http-status-controls">
      <input
        type="text"
        id="http-status-search"
        class="http-status-search-input"
        placeholder="Search by code, name, or description…"
        aria-label="Search HTTP status codes"
      />
      <div class="http-status-category-filters" role="group" aria-label="Filter by category">
        ${ALL_CATEGORIES.map(
          (cat) => `
          <button
            class="http-cat-btn${cat === 'all' ? ' active' : ''}"
            data-category="${cat}"
            aria-pressed="${cat === 'all' ? 'true' : 'false'}"
          >${cat === 'all' ? 'All' : cat}</button>
        `,
        ).join('')}
      </div>
    </div>
    <div id="http-status-count" class="http-status-count" aria-live="polite"></div>
    <div id="http-status-list" class="http-status-list" role="list" aria-label="HTTP status codes"></div>
  `

  const searchInput = container.querySelector<HTMLInputElement>('#http-status-search')!
  const categoryBtns = container.querySelectorAll<HTMLButtonElement>('.http-cat-btn')
  const countEl = container.querySelector<HTMLDivElement>('#http-status-count')!
  const listEl = container.querySelector<HTMLDivElement>('#http-status-list')!

  let currentCategory: HttpStatusCategory | 'all' = 'all'
  let currentQuery = ''

  function getFilteredCodes(): HttpStatusCode[] {
    const byCategory = filterByCategory(currentCategory)
    if (!currentQuery.trim()) return byCategory
    const bySearch = searchStatusCodes(currentQuery)
    // Intersection: match both filters
    const searchSet = new Set(bySearch.map((s) => s.code))
    return byCategory.filter((s) => searchSet.has(s.code))
  }

  function renderList() {
    const codes = getFilteredCodes()
    countEl.textContent = `Showing ${codes.length} of 63 status codes`

    if (codes.length === 0) {
      listEl.innerHTML = '<p class="http-status-empty">No status codes match your search.</p>'
      return
    }

    listEl.innerHTML = codes
      .map(
        (s) => `
      <div class="http-status-item" role="listitem" data-code="${s.code}">
        <div class="http-status-item-header">
          <span class="http-status-code ${getCategoryClass(s.category)}">${s.code}</span>
          <span class="http-status-name">${escapeHtml(s.name)}</span>
          <span class="http-status-cat-badge ${getCategoryClass(s.category)}">${getCategoryLabel(s.category)}</span>
          <button
            class="http-status-copy-btn"
            data-code="${s.code}"
            data-name="${escapeHtml(s.name)}"
            aria-label="Copy ${s.code} ${escapeHtml(s.name)}"
            title="Copy code and name"
          >📋</button>
        </div>
        <p class="http-status-description">${escapeHtml(s.description)}</p>
        <p class="http-status-usage"><strong>Common usage:</strong> ${escapeHtml(s.usage)}</p>
      </div>
    `,
      )
      .join('')

    // Attach copy handlers
    listEl.querySelectorAll<HTMLButtonElement>('.http-status-copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code ?? ''
        const name = btn.dataset.name ?? ''
        const text = `${code} ${name}`
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = '✅'
          setTimeout(() => (btn.textContent = '📋'), 1500)
          trackActivity('http_status', `Copied ${text}`, `HTTP status code ${code} copied to clipboard`)
        })
      })
    })
  }

  // Search input handler
  searchInput.addEventListener('input', () => {
    currentQuery = searchInput.value
    renderList()
    if (currentQuery.trim()) {
      trackActivity('http_status', `Searched "${currentQuery}"`, 'HTTP status code search')
    }
  })

  // Category filter handlers
  categoryBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentCategory = (btn.dataset.category ?? 'all') as HttpStatusCategory | 'all'
      categoryBtns.forEach((b) => {
        b.classList.toggle('active', b === btn)
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false')
      })
      renderList()
      trackActivity('http_status', `Filtered by ${currentCategory}`, `Showing ${currentCategory} status codes`)
    })
  })

  renderList()
  return container
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
