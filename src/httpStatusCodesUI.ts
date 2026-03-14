import {
  HTTP_STATUS_CODES,
  searchStatusCodes,
  filterByCategory,
  getCategories,
  getCategoryLabel,
  getCategoryColor,
  type HttpStatusCategory,
} from './httpStatusCodes'
import { trackActivity } from './activityFeed'

export function createHttpStatusCodesUI(): HTMLElement {
  const container = document.createElement('div')
  container.id = 'http-status-dashboard'
  container.className = 'http-status-container card-section'

  container.innerHTML = `
    <h2 class="section-title">🌐 HTTP Status Code Reference</h2>
    <p class="http-status-subtitle">Search and explore all standard HTTP response codes</p>

    <div class="http-status-controls">
      <input
        type="text"
        id="http-status-search"
        class="http-status-search"
        placeholder="Search by code, name, or keyword…"
        aria-label="Search HTTP status codes"
        autocomplete="off"
        spellcheck="false"
      />
      <div class="http-status-category-filters" role="group" aria-label="Filter by category">
        <button class="http-cat-btn active" data-category="all" aria-pressed="true">All</button>
        ${getCategories()
          .map(
            (cat) =>
              `<button class="http-cat-btn" data-category="${cat}" aria-pressed="false" style="--cat-color:${getCategoryColor(cat)}">${getCategoryLabel(cat)}</button>`,
          )
          .join('')}
      </div>
    </div>

    <div class="http-status-stats" id="http-status-stats" aria-live="polite">
      Showing <strong id="http-status-count">${HTTP_STATUS_CODES.length}</strong> codes
    </div>

    <div id="http-status-list" class="http-status-list" role="list" aria-label="HTTP status codes">
    </div>
  `

  let activeCategory: HttpStatusCategory | 'all' = 'all'
  let searchQuery = ''

  const searchInput = container.querySelector<HTMLInputElement>('#http-status-search')!
  const listEl = container.querySelector<HTMLDivElement>('#http-status-list')!
  const countEl = container.querySelector<HTMLElement>('#http-status-count')!
  const catBtns = container.querySelectorAll<HTMLButtonElement>('.http-cat-btn')

  function renderList(): void {
    const byCategory = filterByCategory(activeCategory)
    const results =
      searchQuery.trim()
        ? byCategory.filter((s) => {
            const q = searchQuery.trim().toLowerCase()
            return (
              String(s.code).includes(q) ||
              s.name.toLowerCase().includes(q) ||
              s.description.toLowerCase().includes(q) ||
              s.category.includes(q)
            )
          })
        : byCategory

    countEl.textContent = String(results.length)

    if (results.length === 0) {
      listEl.innerHTML = `<p class="http-status-empty">No status codes match your search.</p>`
      return
    }

    listEl.innerHTML = results
      .map(
        (s) => `
        <div class="http-status-card" role="listitem" data-code="${s.code}">
          <div class="http-status-card-header">
            <span class="http-status-badge" style="background:${getCategoryColor(s.category)}">${s.code}</span>
            <span class="http-status-name">${s.name}</span>
            <button
              class="http-status-copy-btn"
              data-copy="${s.code}"
              title="Copy status code ${s.code}"
              aria-label="Copy ${s.code}"
            >📋</button>
          </div>
          <p class="http-status-description">${s.description}</p>
          <details class="http-status-detail-toggle">
            <summary class="http-status-detail-summary">More details</summary>
            <p class="http-status-detail-text">${s.detail}</p>
          </details>
        </div>
      `,
      )
      .join('')

    // Wire up copy buttons
    listEl.querySelectorAll<HTMLButtonElement>('.http-status-copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.dataset['copy'] ?? ''
        const originalText = btn.textContent ?? '📋'
        if (navigator.clipboard) {
          navigator.clipboard.writeText(code).then(() => {
            btn.textContent = '✅'
            setTimeout(() => { btn.textContent = originalText }, 1200)
          }).catch(() => {
            btn.textContent = '❌'
            setTimeout(() => { btn.textContent = originalText }, 1200)
          })
        } else {
          btn.textContent = '✅'
          setTimeout(() => { btn.textContent = originalText }, 1200)
        }
        trackActivity('http_status', `Copied HTTP ${code}`, `Copied status code ${code} to clipboard`)
      })
    })
  }

  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value
    renderList()
    if (searchQuery.trim()) {
      trackActivity('http_status', 'HTTP Status Search', `Searched for "${searchQuery.trim()}"`)
    }
  })

  catBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = (btn.dataset['category'] as HttpStatusCategory | 'all') ?? 'all'
      catBtns.forEach((b) => {
        b.classList.toggle('active', b === btn)
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false')
      })
      renderList()
      trackActivity('http_status', `HTTP Status Filter: ${activeCategory}`, `Filtered by category ${activeCategory}`)
    })
  })

  renderList()

  return container
}
