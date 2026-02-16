import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRoadmapDashboard } from './roadmapUI'
import { loadFeatureRequests, saveFeatureRequests } from './roadmapSystem'

// Mock the notification system
vi.mock('./notificationSystem', () => ({
  notificationManager: {
    show: vi.fn(),
  },
}))

// Mock the activity feed
vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}))

describe('Roadmap UI', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
  })

  describe('Roadmap Dashboard', () => {
    it('should create roadmap dashboard with header', () => {
      const dashboard = createRoadmapDashboard()
      
      expect(dashboard.querySelector('.roadmap-header')).toBeTruthy()
      expect(dashboard.querySelector('.section-title')?.textContent).toContain('Community Roadmap')
    })

    it('should display statistics', () => {
      const dashboard = createRoadmapDashboard()
      
      const statCards = dashboard.querySelectorAll('.stat-card')
      expect(statCards.length).toBeGreaterThanOrEqual(4)
      
      expect(dashboard.textContent).toContain('Total Requests')
      expect(dashboard.textContent).toContain('Community Votes')
      expect(dashboard.textContent).toContain('In Progress')
      expect(dashboard.textContent).toContain('Completed')
    })

    it('should display submit button', () => {
      const dashboard = createRoadmapDashboard()
      
      const submitBtn = dashboard.querySelector('#roadmap-submit-btn')
      expect(submitBtn).toBeTruthy()
      expect(submitBtn?.textContent).toContain('Submit Feature Request')
    })

    it('should display filters', () => {
      const dashboard = createRoadmapDashboard()
      
      expect(dashboard.querySelector('#roadmap-status-filter')).toBeTruthy()
      expect(dashboard.querySelector('#roadmap-category-filter')).toBeTruthy()
      expect(dashboard.querySelector('#roadmap-priority-filter')).toBeTruthy()
      expect(dashboard.querySelector('#roadmap-sort-filter')).toBeTruthy()
      expect(dashboard.querySelector('#roadmap-search')).toBeTruthy()
    })

    it('should display feature request list', () => {
      const dashboard = createRoadmapDashboard()
      
      const list = dashboard.querySelector('#roadmap-list')
      expect(list).toBeTruthy()
    })

    it('should render default feature requests', () => {
      const dashboard = createRoadmapDashboard()
      
      const requests = dashboard.querySelectorAll('.feature-request-card')
      expect(requests.length).toBeGreaterThan(0)
    })

    it('should show empty state when no requests match', () => {
      saveFeatureRequests([])
      const dashboard = createRoadmapDashboard()
      
      const emptyMessage = dashboard.querySelector('.roadmap-empty')
      expect(emptyMessage).toBeTruthy()
    })
  })

  describe('Filtering', () => {
    it('should filter by status', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const statusFilter = dashboard.querySelector('#roadmap-status-filter') as HTMLSelectElement
      statusFilter.value = 'proposed'
      statusFilter.dispatchEvent(new Event('change'))
      
      const cards = dashboard.querySelectorAll('.feature-request-card')
      cards.forEach(card => {
        const statusBadge = card.querySelector('.status-proposed')
        expect(statusBadge).toBeTruthy()
      })
    })

    it('should filter by category', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const categoryFilter = dashboard.querySelector('#roadmap-category-filter') as HTMLSelectElement
      categoryFilter.value = 'feature'
      categoryFilter.dispatchEvent(new Event('change'))
      
      const cards = dashboard.querySelectorAll('.feature-request-card')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should filter by priority', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const priorityFilter = dashboard.querySelector('#roadmap-priority-filter') as HTMLSelectElement
      priorityFilter.value = 'high'
      priorityFilter.dispatchEvent(new Event('change'))
      
      const cards = dashboard.querySelectorAll('.feature-request-card')
      cards.forEach(card => {
        const priorityBadge = card.querySelector('.priority-high')
        expect(priorityBadge).toBeTruthy()
      })
    })

    it('should filter by search term', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const searchInput = dashboard.querySelector('#roadmap-search') as HTMLInputElement
      searchInput.value = 'collaboration'
      searchInput.dispatchEvent(new Event('input'))
      
      const cards = dashboard.querySelectorAll('.feature-request-card')
      expect(cards.length).toBeGreaterThan(0)
      
      // Check that results contain the search term
      const firstCard = cards[0] as HTMLElement
      expect(firstCard.textContent?.toLowerCase()).toContain('collaboration')
    })

    it('should update results when search is cleared', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const searchInput = dashboard.querySelector('#roadmap-search') as HTMLInputElement
      
      // Set search
      searchInput.value = 'nonexistent'
      searchInput.dispatchEvent(new Event('input'))
      
      let cards = dashboard.querySelectorAll('.feature-request-card')
      expect(cards.length).toBe(0)
      
      // Clear search
      searchInput.value = ''
      searchInput.dispatchEvent(new Event('input'))
      
      cards = dashboard.querySelectorAll('.feature-request-card')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should combine multiple filters', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const statusFilter = dashboard.querySelector('#roadmap-status-filter') as HTMLSelectElement
      const categoryFilter = dashboard.querySelector('#roadmap-category-filter') as HTMLSelectElement
      
      statusFilter.value = 'proposed'
      statusFilter.dispatchEvent(new Event('change'))
      
      categoryFilter.value = 'feature'
      categoryFilter.dispatchEvent(new Event('change'))
      
      const cards = dashboard.querySelectorAll('.feature-request-card')
      cards.forEach(card => {
        expect(card.querySelector('.status-proposed')).toBeTruthy()
      })
    })
  })

  describe('Sorting', () => {
    it('should sort by votes (default)', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const cards = Array.from(dashboard.querySelectorAll('.feature-request-card'))
      const votes = cards.map(card => {
        const voteCount = card.querySelector('.vote-count')?.textContent
        return parseInt(voteCount || '0')
      })
      
      // Check descending order
      for (let i = 0; i < votes.length - 1; i++) {
        expect(votes[i]).toBeGreaterThanOrEqual(votes[i + 1])
      }
    })

    it('should sort by date newest first', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const sortFilter = dashboard.querySelector('#roadmap-sort-filter') as HTMLSelectElement
      sortFilter.value = 'date-desc'
      sortFilter.dispatchEvent(new Event('change'))
      
      const cards = dashboard.querySelectorAll('.feature-request-card')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should sort by date oldest first', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const sortFilter = dashboard.querySelector('#roadmap-sort-filter') as HTMLSelectElement
      sortFilter.value = 'date-asc'
      sortFilter.dispatchEvent(new Event('change'))
      
      const cards = dashboard.querySelectorAll('.feature-request-card')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should sort by priority', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const sortFilter = dashboard.querySelector('#roadmap-sort-filter') as HTMLSelectElement
      sortFilter.value = 'priority'
      sortFilter.dispatchEvent(new Event('change'))
      
      const cards = dashboard.querySelectorAll('.feature-request-card')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  describe('Feature Request Card', () => {
    it('should display request title', () => {
      const dashboard = createRoadmapDashboard()
      const requests = loadFeatureRequests()
      
      const card = dashboard.querySelector('.feature-request-card')
      const title = card?.querySelector('.request-title')
      
      expect(title).toBeTruthy()
      expect(requests.some(r => title?.textContent === r.title)).toBe(true)
    })

    it('should display request description', () => {
      const dashboard = createRoadmapDashboard()
      
      const card = dashboard.querySelector('.feature-request-card')
      const description = card?.querySelector('.request-description')
      
      expect(description).toBeTruthy()
      expect(description?.textContent).toBeTruthy()
    })

    it('should display status badge', () => {
      const dashboard = createRoadmapDashboard()
      
      const card = dashboard.querySelector('.feature-request-card')
      const badge = card?.querySelector('[class*="status-"]')
      
      expect(badge).toBeTruthy()
    })

    it('should display priority badge', () => {
      const dashboard = createRoadmapDashboard()
      
      const card = dashboard.querySelector('.feature-request-card')
      const badge = card?.querySelector('[class*="priority-"]')
      
      expect(badge).toBeTruthy()
    })

    it('should display vote count', () => {
      const dashboard = createRoadmapDashboard()
      
      const card = dashboard.querySelector('.feature-request-card')
      const voteCount = card?.querySelector('.vote-count')
      
      expect(voteCount).toBeTruthy()
      expect(parseInt(voteCount?.textContent || '0')).toBeGreaterThanOrEqual(0)
    })

    it('should display vote button', () => {
      const dashboard = createRoadmapDashboard()
      
      const card = dashboard.querySelector('.feature-request-card')
      const voteBtn = card?.querySelector('.vote-btn')
      
      expect(voteBtn).toBeTruthy()
    })

    it('should display metadata', () => {
      const dashboard = createRoadmapDashboard()
      
      const card = dashboard.querySelector('.feature-request-card')
      const meta = card?.querySelector('.request-meta')
      
      expect(meta).toBeTruthy()
      expect(card?.textContent).toContain('ago')
    })

    it('should display tags when present', () => {
      const dashboard = createRoadmapDashboard()
      
      const cards = dashboard.querySelectorAll('.feature-request-card')
      const cardWithTags = Array.from(cards).find(card => 
        card.querySelector('.request-tags')
      )
      
      expect(cardWithTags).toBeTruthy()
      
      if (cardWithTags) {
        const tags = cardWithTags.querySelectorAll('.tag')
        expect(tags.length).toBeGreaterThan(0)
      }
    })

    it('should escape HTML in title', () => {
      const dashboard = createRoadmapDashboard()
      
      const card = dashboard.querySelector('.feature-request-card')
      const title = card?.querySelector('.request-title')
      
      expect(title?.innerHTML).not.toContain('<script>')
    })

    it('should escape HTML in description', () => {
      const dashboard = createRoadmapDashboard()
      
      const card = dashboard.querySelector('.feature-request-card')
      const description = card?.querySelector('.request-description')
      
      expect(description?.innerHTML).not.toContain('<script>')
    })
  })

  describe('Voting', () => {
    it('should show unvoted state initially', () => {
      const dashboard = createRoadmapDashboard()
      
      const voteBtn = dashboard.querySelector('.vote-btn')
      expect(voteBtn?.classList.contains('voted')).toBe(false)
      expect(voteBtn?.querySelector('.vote-icon')?.textContent).toBe('△')
    })

    it('should handle vote click', async () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const voteBtn = dashboard.querySelector('.vote-btn') as HTMLButtonElement
      const initialCount = parseInt(voteBtn.querySelector('.vote-count')?.textContent || '0')
      
      voteBtn.click()
      
      // Wait for updates
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const updatedBtn = dashboard.querySelector('.vote-btn') as HTMLElement
      const newCount = parseInt(updatedBtn.querySelector('.vote-count')?.textContent || '0')
      
      expect(newCount).toBe(initialCount + 1)
      expect(updatedBtn.classList.contains('voted')).toBe(true)
    })

    it('should handle unvote click', async () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const voteBtn = dashboard.querySelector('.vote-btn') as HTMLButtonElement
      
      // Vote first
      voteBtn.click()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const votedBtn = dashboard.querySelector('.vote-btn') as HTMLButtonElement
      const votedCount = parseInt(votedBtn.querySelector('.vote-count')?.textContent || '0')
      
      // Unvote
      votedBtn.click()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const unvotedBtn = dashboard.querySelector('.vote-btn') as HTMLElement
      const unvotedCount = parseInt(unvotedBtn.querySelector('.vote-count')?.textContent || '0')
      
      expect(unvotedCount).toBe(votedCount - 1)
      expect(unvotedBtn.classList.contains('voted')).toBe(false)
    })
  })

  describe('Submit Modal', () => {
    it('should open modal when submit button clicked', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const submitBtn = dashboard.querySelector('#roadmap-submit-btn') as HTMLButtonElement
      submitBtn.click()
      
      const modal = document.querySelector('.roadmap-modal-overlay')
      expect(modal).toBeTruthy()
    })

    it('should display form fields', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const submitBtn = dashboard.querySelector('#roadmap-submit-btn') as HTMLButtonElement
      submitBtn.click()
      
      expect(document.querySelector('#request-title')).toBeTruthy()
      expect(document.querySelector('#request-description')).toBeTruthy()
      expect(document.querySelector('#request-category')).toBeTruthy()
      expect(document.querySelector('#request-priority')).toBeTruthy()
      expect(document.querySelector('#request-tags')).toBeTruthy()
      expect(document.querySelector('#request-submitter')).toBeTruthy()
    })

    it('should close modal on close button click', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const submitBtn = dashboard.querySelector('#roadmap-submit-btn') as HTMLButtonElement
      submitBtn.click()
      
      const closeBtn = document.querySelector('.modal-close') as HTMLButtonElement
      closeBtn.click()
      
      const modal = document.querySelector('.roadmap-modal-overlay')
      expect(modal).toBeFalsy()
    })

    it('should close modal on cancel button click', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const submitBtn = dashboard.querySelector('#roadmap-submit-btn') as HTMLButtonElement
      submitBtn.click()
      
      const cancelBtn = document.querySelector('.modal-cancel') as HTMLButtonElement
      cancelBtn.click()
      
      const modal = document.querySelector('.roadmap-modal-overlay')
      expect(modal).toBeFalsy()
    })

    it('should close modal on overlay click', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const submitBtn = dashboard.querySelector('#roadmap-submit-btn') as HTMLButtonElement
      submitBtn.click()
      
      const overlay = document.querySelector('.roadmap-modal-overlay') as HTMLElement
      overlay.click()
      
      const modal = document.querySelector('.roadmap-modal-overlay')
      expect(modal).toBeFalsy()
    })

    it('should submit new feature request', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const submitBtn = dashboard.querySelector('#roadmap-submit-btn') as HTMLButtonElement
      submitBtn.click()
      
      const titleInput = document.querySelector('#request-title') as HTMLInputElement
      const descInput = document.querySelector('#request-description') as HTMLTextAreaElement
      const categorySelect = document.querySelector('#request-category') as HTMLSelectElement
      const prioritySelect = document.querySelector('#request-priority') as HTMLSelectElement
      const tagsInput = document.querySelector('#request-tags') as HTMLInputElement
      const submitterInput = document.querySelector('#request-submitter') as HTMLInputElement
      
      titleInput.value = 'Test Feature'
      descInput.value = 'Test Description'
      categorySelect.value = 'feature'
      prioritySelect.value = 'high'
      tagsInput.value = 'test, demo'
      submitterInput.value = 'Test User'
      
      const form = document.querySelector('#feature-request-form') as HTMLFormElement
      form.dispatchEvent(new Event('submit'))
      
      const requests = loadFeatureRequests()
      const newRequest = requests.find(r => r.title === 'Test Feature')
      
      expect(newRequest).toBeTruthy()
      expect(newRequest?.description).toBe('Test Description')
      expect(newRequest?.category).toBe('feature')
      expect(newRequest?.priority).toBe('high')
      expect(newRequest?.tags).toContain('test')
      expect(newRequest?.tags).toContain('demo')
      expect(newRequest?.submittedBy).toBe('Test User')
    })

    it('should handle empty tags', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const submitBtn = dashboard.querySelector('#roadmap-submit-btn') as HTMLButtonElement
      submitBtn.click()
      
      const titleInput = document.querySelector('#request-title') as HTMLInputElement
      const descInput = document.querySelector('#request-description') as HTMLTextAreaElement
      const tagsInput = document.querySelector('#request-tags') as HTMLInputElement
      
      titleInput.value = 'No Tags Feature'
      descInput.value = 'Description'
      tagsInput.value = ''
      
      const form = document.querySelector('#feature-request-form') as HTMLFormElement
      form.dispatchEvent(new Event('submit'))
      
      const requests = loadFeatureRequests()
      const newRequest = requests.find(r => r.title === 'No Tags Feature')
      
      expect(newRequest?.tags).toEqual([])
    })

    it('should default to Anonymous if no submitter provided', () => {
      const dashboard = createRoadmapDashboard()
      document.body.appendChild(dashboard)
      
      const submitBtn = dashboard.querySelector('#roadmap-submit-btn') as HTMLButtonElement
      submitBtn.click()
      
      const titleInput = document.querySelector('#request-title') as HTMLInputElement
      const descInput = document.querySelector('#request-description') as HTMLTextAreaElement
      const submitterInput = document.querySelector('#request-submitter') as HTMLInputElement
      
      titleInput.value = 'Anonymous Feature'
      descInput.value = 'Description'
      submitterInput.value = ''
      
      const form = document.querySelector('#feature-request-form') as HTMLFormElement
      form.dispatchEvent(new Event('submit'))
      
      const requests = loadFeatureRequests()
      const newRequest = requests.find(r => r.title === 'Anonymous Feature')
      
      expect(newRequest?.submittedBy).toBe('Anonymous')
    })
  })
})
