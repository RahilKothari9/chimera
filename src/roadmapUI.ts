/**
 * Collaborative Feature Request & Roadmap UI
 * Visual interface for community feature requests and roadmap planning
 */

import {
  loadFeatureRequests,
  addFeatureRequest,
  voteForFeature,
  unvoteFeature,
  hasUserVoted,
  filterFeatureRequests,
  getRoadmapStatistics,
  type FeatureRequest,
  type RoadmapFilters,
} from './roadmapSystem'
import { trackActivity } from './activityFeed'
import { notificationManager } from './notificationSystem'

/**
 * Create the roadmap dashboard UI
 */
export function createRoadmapDashboard(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'roadmap-container'
  
  const requests = loadFeatureRequests()
  const stats = getRoadmapStatistics(requests)
  
  container.innerHTML = `
    <div class="roadmap-header">
      <h2 class="section-title">
        🗺️ Community Roadmap
        <span class="roadmap-subtitle">Vote on features you'd like to see</span>
      </h2>
      <button class="roadmap-submit-btn" id="roadmap-submit-btn">
        <span class="btn-icon">➕</span>
        <span class="btn-text">Submit Feature Request</span>
      </button>
    </div>
    
    <div class="roadmap-stats">
      <div class="stat-card">
        <div class="stat-value">${stats.total}</div>
        <div class="stat-label">Total Requests</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalVotes}</div>
        <div class="stat-label">Community Votes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.inProgress}</div>
        <div class="stat-label">In Progress</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.completed}</div>
        <div class="stat-label">Completed</div>
      </div>
    </div>
    
    <div class="roadmap-filters">
      <div class="filter-group">
        <label for="roadmap-status-filter">Status</label>
        <select id="roadmap-status-filter" class="filter-select">
          <option value="">All Statuses</option>
          <option value="proposed">Proposed</option>
          <option value="planned">Planned</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="roadmap-category-filter">Category</label>
        <select id="roadmap-category-filter" class="filter-select">
          <option value="">All Categories</option>
          <option value="feature">Feature</option>
          <option value="enhancement">Enhancement</option>
          <option value="bugfix">Bug Fix</option>
          <option value="documentation">Documentation</option>
          <option value="performance">Performance</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="roadmap-priority-filter">Priority</label>
        <select id="roadmap-priority-filter" class="filter-select">
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="roadmap-sort-filter">Sort By</label>
        <select id="roadmap-sort-filter" class="filter-select">
          <option value="votes">Most Votes</option>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="priority">Priority</option>
        </select>
      </div>
      
      <div class="filter-group filter-search">
        <label for="roadmap-search">Search</label>
        <input 
          type="text" 
          id="roadmap-search" 
          class="filter-input" 
          placeholder="Search features..."
        />
      </div>
    </div>
    
    <div id="roadmap-list" class="roadmap-list"></div>
  `
  
  // Setup event listeners
  const submitBtn = container.querySelector('#roadmap-submit-btn')
  submitBtn?.addEventListener('click', () => showSubmitModal())
  
  const statusFilter = container.querySelector('#roadmap-status-filter') as HTMLSelectElement
  const categoryFilter = container.querySelector('#roadmap-category-filter') as HTMLSelectElement
  const priorityFilter = container.querySelector('#roadmap-priority-filter') as HTMLSelectElement
  const sortFilter = container.querySelector('#roadmap-sort-filter') as HTMLSelectElement
  const searchInput = container.querySelector('#roadmap-search') as HTMLInputElement
  
  function updateRoadmapList() {
    const filters: RoadmapFilters = {
      status: statusFilter.value as FeatureRequest['status'] || undefined,
      category: categoryFilter.value as FeatureRequest['category'] || undefined,
      priority: priorityFilter.value as FeatureRequest['priority'] || undefined,
      searchTerm: searchInput.value || undefined,
    }
    
    // Parse sort filter
    if (sortFilter.value === 'votes') {
      filters.sortBy = 'votes'
      filters.sortOrder = 'desc'
    } else if (sortFilter.value === 'date-desc') {
      filters.sortBy = 'date'
      filters.sortOrder = 'desc'
    } else if (sortFilter.value === 'date-asc') {
      filters.sortBy = 'date'
      filters.sortOrder = 'asc'
    } else if (sortFilter.value === 'priority') {
      filters.sortBy = 'priority'
      filters.sortOrder = 'desc'
    }
    
    const allRequests = loadFeatureRequests()
    const filtered = filterFeatureRequests(allRequests, filters)
    
    const listContainer = container.querySelector('#roadmap-list')!
    listContainer.innerHTML = ''
    
    if (filtered.length === 0) {
      listContainer.innerHTML = '<p class="roadmap-empty">No feature requests match your filters.</p>'
      return
    }
    
    filtered.forEach(request => {
      const requestCard = createFeatureRequestCard(request, updateRoadmapList)
      listContainer.appendChild(requestCard)
    })
    
    // Track filter activity
    if (filters.searchTerm || filters.status || filters.category || filters.priority) {
      trackActivity('roadmap', 'Filtered roadmap', `${filtered.length} results`, filters as unknown as Record<string, unknown>)
    }
  }
  
  statusFilter.addEventListener('change', updateRoadmapList)
  categoryFilter.addEventListener('change', updateRoadmapList)
  priorityFilter.addEventListener('change', updateRoadmapList)
  sortFilter.addEventListener('change', updateRoadmapList)
  searchInput.addEventListener('input', updateRoadmapList)
  
  // Initial render
  updateRoadmapList()
  
  return container
}

/**
 * Create a feature request card
 */
function createFeatureRequestCard(
  request: FeatureRequest,
  onUpdate: () => void
): HTMLElement {
  const card = document.createElement('div')
  card.className = 'feature-request-card'
  card.dataset.id = request.id
  
  const hasVoted = hasUserVoted(request.id)
  const statusClass = `status-${request.status}`
  const priorityClass = `priority-${request.priority}`
  
  const relativeTime = getRelativeTime(request.submittedAt)
  
  card.innerHTML = `
    <div class="request-header">
      <div class="request-voting">
        <button class="vote-btn ${hasVoted ? 'voted' : ''}" data-id="${request.id}">
          <span class="vote-icon">${hasVoted ? '▲' : '△'}</span>
          <span class="vote-count">${request.votes}</span>
        </button>
      </div>
      
      <div class="request-content">
        <div class="request-title-row">
          <h3 class="request-title">${escapeHtml(request.title)}</h3>
          <div class="request-badges">
            <span class="badge ${statusClass}">${request.status.replace('-', ' ')}</span>
            <span class="badge ${priorityClass}">${request.priority}</span>
          </div>
        </div>
        
        <p class="request-description">${escapeHtml(request.description)}</p>
        
        <div class="request-meta">
          <span class="meta-item">
            <span class="meta-icon">👤</span>
            ${escapeHtml(request.submittedBy)}
          </span>
          <span class="meta-item">
            <span class="meta-icon">📅</span>
            ${relativeTime}
          </span>
          <span class="meta-item">
            <span class="meta-icon">📁</span>
            ${request.category}
          </span>
          ${request.estimatedEffort ? `
            <span class="meta-item">
              <span class="meta-icon">⏱️</span>
              ${request.estimatedEffort} effort
            </span>
          ` : ''}
        </div>
        
        ${request.tags.length > 0 ? `
          <div class="request-tags">
            ${request.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `
  
  // Setup vote button
  const voteBtn = card.querySelector('.vote-btn')
  voteBtn?.addEventListener('click', () => {
    if (hasUserVoted(request.id)) {
      const success = unvoteFeature(request.id)
      if (success) {
        notificationManager.show('Vote removed', { type: 'success' })
        trackActivity('roadmap', 'Unvoted feature', request.title)
        onUpdate()
      }
    } else {
      const success = voteForFeature(request.id)
      if (success) {
        notificationManager.show('Vote added! 🎉', { type: 'success' })
        trackActivity('roadmap', 'Voted for feature', request.title)
        onUpdate()
      }
    }
  })
  
  return card
}

/**
 * Show the submit feature request modal
 */
function showSubmitModal(): void {
  const modal = document.createElement('div')
  modal.className = 'roadmap-modal-overlay'
  
  modal.innerHTML = `
    <div class="roadmap-modal">
      <div class="modal-header">
        <h3>Submit Feature Request</h3>
        <button class="modal-close" aria-label="Close">&times;</button>
      </div>
      
      <form id="feature-request-form" class="feature-request-form">
        <div class="form-group">
          <label for="request-title">Title *</label>
          <input 
            type="text" 
            id="request-title" 
            class="form-input" 
            placeholder="Brief, descriptive title"
            required
            maxlength="100"
          />
        </div>
        
        <div class="form-group">
          <label for="request-description">Description *</label>
          <textarea 
            id="request-description" 
            class="form-textarea" 
            placeholder="Explain what you'd like to see and why it would be valuable"
            required
            rows="5"
            maxlength="500"
          ></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="request-category">Category *</label>
            <select id="request-category" class="form-select" required>
              <option value="feature">New Feature</option>
              <option value="enhancement">Enhancement</option>
              <option value="bugfix">Bug Fix</option>
              <option value="documentation">Documentation</option>
              <option value="performance">Performance</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="request-priority">Priority *</label>
            <select id="request-priority" class="form-select" required>
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="request-tags">Tags (comma-separated)</label>
          <input 
            type="text" 
            id="request-tags" 
            class="form-input" 
            placeholder="e.g., ui, mobile, api"
          />
        </div>
        
        <div class="form-group">
          <label for="request-submitter">Your Name</label>
          <input 
            type="text" 
            id="request-submitter" 
            class="form-input" 
            placeholder="Anonymous"
            value="Community Member"
          />
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-secondary modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary">Submit Request</button>
        </div>
      </form>
    </div>
  `
  
  document.body.appendChild(modal)
  
  // Focus first input
  const titleInput = modal.querySelector('#request-title') as HTMLInputElement
  titleInput?.focus()
  
  // Setup close handlers
  const closeBtn = modal.querySelector('.modal-close')
  const cancelBtn = modal.querySelector('.modal-cancel')
  
  const closeModal = () => {
    modal.remove()
  }
  
  closeBtn?.addEventListener('click', closeModal)
  cancelBtn?.addEventListener('click', closeModal)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal()
  })
  
  // Handle form submission
  const form = modal.querySelector('#feature-request-form') as HTMLFormElement
  form?.addEventListener('submit', (e) => {
    e.preventDefault()
    
    const title = (modal.querySelector('#request-title') as HTMLInputElement).value.trim()
    const description = (modal.querySelector('#request-description') as HTMLTextAreaElement).value.trim()
    const category = (modal.querySelector('#request-category') as HTMLSelectElement).value as FeatureRequest['category']
    const priority = (modal.querySelector('#request-priority') as HTMLSelectElement).value as FeatureRequest['priority']
    const tagsInput = (modal.querySelector('#request-tags') as HTMLInputElement).value.trim()
    const submittedBy = (modal.querySelector('#request-submitter') as HTMLInputElement).value.trim() || 'Anonymous'
    
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
    
    const newRequest = addFeatureRequest({
      title,
      description,
      category,
      priority,
      status: 'proposed',
      submittedBy,
      tags,
    })
    
    notificationManager.show('Feature request submitted! 🚀', { type: 'success' })
    trackActivity('roadmap', 'Submitted feature request', title, { id: newRequest.id })
    
    closeModal()
    
    // Refresh the roadmap
    const roadmapContainer = document.querySelector('.roadmap-container')
    if (roadmapContainer) {
      const newDashboard = createRoadmapDashboard()
      roadmapContainer.replaceWith(newDashboard)
    }
  })
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Get relative time string
 */
function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}
