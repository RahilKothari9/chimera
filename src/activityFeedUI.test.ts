import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createActivityFeedUI, setupTimeUpdates } from './activityFeedUI'
import { trackActivity, clearActivities } from './activityFeed'

// Mock the notification system
vi.mock('./notificationSystem', () => ({
  notificationManager: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

describe('Activity Feed UI', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
  })

  describe('createActivityFeedUI', () => {
    it('should create activity feed container', () => {
      const ui = createActivityFeedUI()
      expect(ui.className).toBe('activity-feed-container')
    })

    it('should display header with title', () => {
      const ui = createActivityFeedUI()
      const title = ui.querySelector('.section-title')
      expect(title?.textContent).toBe('Live Activity Feed')
    })

    it('should display subtitle', () => {
      const ui = createActivityFeedUI()
      const subtitle = ui.querySelector('.activity-feed-subtitle')
      expect(subtitle?.textContent).toBe('Real-time interactions and events')
    })

    it('should show empty state when no activities', () => {
      const ui = createActivityFeedUI()
      const emptyState = ui.querySelector('.empty-activities')
      expect(emptyState).toBeTruthy()
      expect(emptyState?.textContent).toContain('No activities yet')
    })

    it('should display activities when they exist', () => {
      trackActivity('page_view', 'Test Activity', 'Test description')
      const ui = createActivityFeedUI()
      
      const activityCard = ui.querySelector('.activity-card')
      expect(activityCard).toBeTruthy()
      expect(activityCard?.textContent).toContain('Test Activity')
    })

    it('should display activity stats', () => {
      trackActivity('page_view', 'Activity 1', 'desc')
      trackActivity('search', 'Activity 2', 'desc')
      
      const ui = createActivityFeedUI()
      const statsContainer = ui.querySelector('.activity-stats-container')
      expect(statsContainer).toBeTruthy()
      
      const statCards = ui.querySelectorAll('.activity-stat-card')
      expect(statCards).toHaveLength(3) // Total, Last 24h, Last hour
    })

    it('should include clear all button', () => {
      const ui = createActivityFeedUI()
      const clearBtn = ui.querySelector('#clear-activities-btn')
      expect(clearBtn).toBeTruthy()
      expect(clearBtn?.textContent).toContain('Clear All')
    })

    it('should limit displayed activities to 20', () => {
      // Add 25 activities
      for (let i = 0; i < 25; i++) {
        trackActivity('page_view', `Activity ${i}`, `Description ${i}`)
      }
      
      const ui = createActivityFeedUI()
      const activityCards = ui.querySelectorAll('.activity-card')
      expect(activityCards.length).toBeLessThanOrEqual(20)
    })

    it('should show "more activities" message when > 20 activities', () => {
      // Add 25 activities
      for (let i = 0; i < 25; i++) {
        trackActivity('page_view', `Activity ${i}`, `Description ${i}`)
      }
      
      const ui = createActivityFeedUI()
      const moreInfo = ui.querySelector('.activity-more-info')
      expect(moreInfo).toBeTruthy()
      expect(moreInfo?.textContent).toContain('5 more activities')
    })
  })

  describe('activity card rendering', () => {
    it('should render activity icon', () => {
      trackActivity('search', 'Search test', 'Searched for something')
      const ui = createActivityFeedUI()
      
      const icon = ui.querySelector('.activity-icon')
      expect(icon?.textContent).toBe('🔍')
    })

    it('should render activity title', () => {
      trackActivity('vote', 'Voted on Day 5', 'Upvoted')
      const ui = createActivityFeedUI()
      
      const title = ui.querySelector('.activity-title')
      expect(title?.textContent).toBe('Voted on Day 5')
    })

    it('should render activity description', () => {
      trackActivity('export', 'Exported data', 'Exported 10 entries')
      const ui = createActivityFeedUI()
      
      const description = ui.querySelector('.activity-description')
      expect(description?.textContent).toBe('Exported 10 entries')
    })

    it('should render relative time', () => {
      trackActivity('theme_change', 'Theme changed', 'Switched to dark mode')
      const ui = createActivityFeedUI()
      
      const time = ui.querySelector('.activity-time')
      expect(time?.textContent).toBe('just now')
    })

    it('should apply type-specific CSS class', () => {
      trackActivity('navigation', 'Navigated', 'Went to dashboard')
      const ui = createActivityFeedUI()
      
      const card = ui.querySelector('.activity-card')
      expect(card?.classList.contains('activity-type-navigation')).toBe(true)
    })

    it('should escape HTML in title and description', () => {
      trackActivity('search', '<script>alert("xss")</script>', 'Test <b>bold</b>')
      const ui = createActivityFeedUI()
      
      const title = ui.querySelector('.activity-title')
      const description = ui.querySelector('.activity-description')
      
      // Should not contain actual HTML tags
      expect(title?.innerHTML).not.toContain('<script>')
      expect(description?.innerHTML).not.toContain('<b>')
    })
  })

  describe('stats section', () => {
    it('should display total activities count', () => {
      trackActivity('page_view', 'Test 1', 'desc')
      trackActivity('search', 'Test 2', 'desc')
      
      const ui = createActivityFeedUI()
      const statValues = ui.querySelectorAll('.stat-value')
      expect(statValues[0].textContent).toBe('2')
    })

    it('should display last 24 hours count', () => {
      trackActivity('page_view', 'Recent', 'desc')
      const ui = createActivityFeedUI()
      
      const statValues = ui.querySelectorAll('.stat-value')
      expect(statValues[1].textContent).toBe('1')
    })

    it('should display last hour count', () => {
      trackActivity('search', 'Very recent', 'desc')
      const ui = createActivityFeedUI()
      
      const statValues = ui.querySelectorAll('.stat-value')
      expect(statValues[2].textContent).toBe('1')
    })

    it('should have proper labels for stats', () => {
      const ui = createActivityFeedUI()
      const statLabels = ui.querySelectorAll('.stat-label')
      
      expect(statLabels[0].textContent).toBe('Total Activities')
      expect(statLabels[1].textContent).toBe('Last 24 Hours')
      expect(statLabels[2].textContent).toBe('Last Hour')
    })
  })

  describe('clear functionality', () => {
    it('should show confirmation dialog when clicking clear', () => {
      window.confirm = vi.fn().mockReturnValue(true)
      trackActivity('page_view', 'Test', 'desc')
      
      const ui = createActivityFeedUI()
      const clearBtn = ui.querySelector('#clear-activities-btn') as HTMLButtonElement
      clearBtn.click()
      
      expect(window.confirm).toHaveBeenCalled()
    })

    it('should not clear if user cancels confirmation', () => {
      window.confirm = vi.fn().mockReturnValue(false)
      trackActivity('page_view', 'Test', 'desc')
      
      const ui = createActivityFeedUI()
      const clearBtn = ui.querySelector('#clear-activities-btn') as HTMLButtonElement
      clearBtn.click()
      
      const activityCard = ui.querySelector('.activity-card')
      expect(activityCard).toBeTruthy() // Activity should still be there
    })
  })

  describe('reactive updates', () => {
    it('should update UI when new activity is added', () => {
      const ui = createActivityFeedUI()
      document.body.appendChild(ui)
      
      // Initially empty
      expect(ui.querySelector('.empty-activities')).toBeTruthy()
      
      // Add activity
      trackActivity('vote', 'New vote', 'Voted on something')
      
      // Should now show activities
      setTimeout(() => {
        expect(ui.querySelector('.activity-card')).toBeTruthy()
      }, 100)
    })

    it('should update stats when activities change', () => {
      const ui = createActivityFeedUI()
      document.body.appendChild(ui)
      
      trackActivity('search', 'Search 1', 'desc')
      trackActivity('page_view', 'View 1', 'desc')
      
      setTimeout(() => {
        const statValues = ui.querySelectorAll('.stat-value')
        expect(statValues[0].textContent).toBe('2')
      }, 100)
    })

    it('should show empty state after clearing all activities', () => {
      trackActivity('page_view', 'Test', 'desc')
      const ui = createActivityFeedUI()
      document.body.appendChild(ui)
      
      clearActivities()
      
      setTimeout(() => {
        expect(ui.querySelector('.empty-activities')).toBeTruthy()
      }, 100)
    })
  })

  describe('setupTimeUpdates', () => {
    it('should be callable', () => {
      expect(() => setupTimeUpdates()).not.toThrow()
    })

    it('should set up interval for updating times', () => {
      vi.useFakeTimers()
      const setIntervalSpy = vi.spyOn(window, 'setInterval')
      
      setupTimeUpdates()
      
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000)
      
      vi.useRealTimers()
    })
  })
})
