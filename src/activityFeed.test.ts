import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadActivities,
  trackActivity,
  clearActivities,
  subscribeToActivities,
  getActivityStats,
  getActivitiesByType,
  getActivitiesInRange,
  formatRelativeTime,
  initializeActivityFeed,
  type Activity,
} from './activityFeed'

describe('Activity Feed', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('loadActivities', () => {
    it('should return empty array when no activities exist', () => {
      const activities = loadActivities()
      expect(activities).toEqual([])
    })

    it('should load activities from localStorage', () => {
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'page_view',
          title: 'Test Activity',
          description: 'Test description',
          timestamp: Date.now(),
          icon: '👁️',
        },
      ]
      localStorage.setItem('chimera_activity_feed', JSON.stringify(mockActivities))
      
      const activities = loadActivities()
      expect(activities).toHaveLength(1)
      expect(activities[0].title).toBe('Test Activity')
    })

    it('should sort activities by timestamp descending', () => {
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'page_view',
          title: 'Older',
          description: 'desc',
          timestamp: 1000,
          icon: '👁️',
        },
        {
          id: '2',
          type: 'search',
          title: 'Newer',
          description: 'desc',
          timestamp: 2000,
          icon: '🔍',
        },
      ]
      localStorage.setItem('chimera_activity_feed', JSON.stringify(mockActivities))
      
      const activities = loadActivities()
      expect(activities[0].title).toBe('Newer')
      expect(activities[1].title).toBe('Older')
    })

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('chimera_activity_feed', 'invalid json')
      const activities = loadActivities()
      expect(activities).toEqual([])
    })
  })

  describe('trackActivity', () => {
    it('should add a new activity', () => {
      trackActivity('search', 'User searched', 'Searched for "test"')
      
      const activities = loadActivities()
      expect(activities).toHaveLength(1)
      expect(activities[0].type).toBe('search')
      expect(activities[0].title).toBe('User searched')
      expect(activities[0].description).toBe('Searched for "test"')
    })

    it('should generate unique IDs for activities', () => {
      trackActivity('vote', 'Voted', 'Upvoted Day 5')
      trackActivity('vote', 'Voted', 'Downvoted Day 3')
      
      const activities = loadActivities()
      expect(activities).toHaveLength(2)
      expect(activities[0].id).not.toBe(activities[1].id)
    })

    it('should add activities to the beginning of the list', () => {
      trackActivity('page_view', 'First', 'First activity')
      trackActivity('search', 'Second', 'Second activity')
      
      const activities = loadActivities()
      expect(activities[0].title).toBe('Second')
      expect(activities[1].title).toBe('First')
    })

    it('should include metadata when provided', () => {
      trackActivity('export', 'Exported', 'Exported as JSON', { format: 'json', count: 10 })
      
      const activities = loadActivities()
      expect(activities[0].metadata).toEqual({ format: 'json', count: 10 })
    })

    it('should assign correct icons based on activity type', () => {
      trackActivity('page_view', 'View', 'Viewed page')
      trackActivity('search', 'Search', 'Searched')
      trackActivity('vote', 'Vote', 'Voted')
      
      const activities = loadActivities()
      expect(activities.find(a => a.type === 'page_view')?.icon).toBe('👁️')
      expect(activities.find(a => a.type === 'search')?.icon).toBe('🔍')
      expect(activities.find(a => a.type === 'vote')?.icon).toBe('👍')
    })

    it('should limit activities to MAX_ACTIVITIES', () => {
      // Add 60 activities (MAX is 50)
      for (let i = 0; i < 60; i++) {
        trackActivity('page_view', `Activity ${i}`, `Description ${i}`)
      }
      
      const activities = loadActivities()
      expect(activities.length).toBeLessThanOrEqual(50)
    })

    it('should notify subscribers when activity is added', () => {
      const callback = vi.fn()
      subscribeToActivities(callback)
      
      trackActivity('theme_change', 'Theme changed', 'Switched to dark mode')
      
      expect(callback).toHaveBeenCalled()
      const callbackActivities = callback.mock.calls[0][0]
      expect(callbackActivities).toHaveLength(1)
    })
  })

  describe('clearActivities', () => {
    it('should remove all activities', () => {
      trackActivity('page_view', 'Test', 'Test activity')
      expect(loadActivities()).toHaveLength(1)
      
      clearActivities()
      expect(loadActivities()).toHaveLength(0)
    })

    it('should notify subscribers when activities are cleared', () => {
      trackActivity('page_view', 'Test', 'Test activity')
      const callback = vi.fn()
      subscribeToActivities(callback)
      
      clearActivities()
      
      expect(callback).toHaveBeenCalledWith([])
    })
  })

  describe('subscribeToActivities', () => {
    it('should call subscriber when activities change', () => {
      const callback = vi.fn()
      subscribeToActivities(callback)
      
      trackActivity('navigation', 'Navigated', 'Went to dashboard')
      
      expect(callback).toHaveBeenCalled()
    })

    it('should allow multiple subscribers', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      subscribeToActivities(callback1)
      subscribeToActivities(callback2)
      
      trackActivity('share', 'Shared', 'Shared a link')
      
      expect(callback1).toHaveBeenCalled()
      expect(callback2).toHaveBeenCalled()
    })

    it('should return an unsubscribe function', () => {
      const callback = vi.fn()
      const unsubscribe = subscribeToActivities(callback)
      
      trackActivity('page_view', 'Test', 'Test')
      expect(callback).toHaveBeenCalledTimes(1)
      
      unsubscribe()
      trackActivity('page_view', 'Test 2', 'Test 2')
      expect(callback).toHaveBeenCalledTimes(1) // Should not be called again
    })
  })

  describe('getActivityStats', () => {
    it('should return zero stats for empty activities', () => {
      const stats = getActivityStats()
      expect(stats.total).toBe(0)
      expect(stats.last24Hours).toBe(0)
      expect(stats.lastHour).toBe(0)
    })

    it('should count total activities', () => {
      trackActivity('page_view', 'Test 1', 'desc')
      trackActivity('search', 'Test 2', 'desc')
      trackActivity('vote', 'Test 3', 'desc')
      
      const stats = getActivityStats()
      expect(stats.total).toBe(3)
    })

    it('should count activities by type', () => {
      trackActivity('page_view', 'Test 1', 'desc')
      trackActivity('page_view', 'Test 2', 'desc')
      trackActivity('search', 'Test 3', 'desc')
      
      const stats = getActivityStats()
      expect(stats.byType.page_view).toBe(2)
      expect(stats.byType.search).toBe(1)
    })

    it('should count recent activities', () => {
      const now = Date.now()
      const activities = [
        {
          id: '1',
          type: 'page_view' as const,
          title: '30 min ago',
          description: 'desc',
          timestamp: now - 30 * 60 * 1000,
          icon: '👁️',
        },
        {
          id: '2',
          type: 'search' as const,
          title: '2 hours ago',
          description: 'desc',
          timestamp: now - 2 * 60 * 60 * 1000,
          icon: '🔍',
        },
        {
          id: '3',
          type: 'vote' as const,
          title: '2 days ago',
          description: 'desc',
          timestamp: now - 2 * 24 * 60 * 60 * 1000,
          icon: '👍',
        },
      ]
      localStorage.setItem('chimera_activity_feed', JSON.stringify(activities))
      
      const stats = getActivityStats()
      expect(stats.lastHour).toBe(1) // Only the 30 min ago activity
      expect(stats.last24Hours).toBe(2) // 30 min and 2 hours ago
    })
  })

  describe('getActivitiesByType', () => {
    beforeEach(() => {
      trackActivity('page_view', 'View 1', 'desc')
      trackActivity('search', 'Search 1', 'desc')
      trackActivity('page_view', 'View 2', 'desc')
      trackActivity('vote', 'Vote 1', 'desc')
    })

    it('should filter activities by type', () => {
      const pageViews = getActivitiesByType('page_view')
      expect(pageViews).toHaveLength(2)
      expect(pageViews.every(a => a.type === 'page_view')).toBe(true)
    })

    it('should return empty array for type with no activities', () => {
      const exports = getActivitiesByType('export')
      expect(exports).toEqual([])
    })
  })

  describe('getActivitiesInRange', () => {
    it('should filter activities by time range', () => {
      const now = Date.now()
      const activities = [
        {
          id: '1',
          type: 'page_view' as const,
          title: 'Activity 1',
          description: 'desc',
          timestamp: now - 1000,
          icon: '👁️',
        },
        {
          id: '2',
          type: 'search' as const,
          title: 'Activity 2',
          description: 'desc',
          timestamp: now - 5000,
          icon: '🔍',
        },
        {
          id: '3',
          type: 'vote' as const,
          title: 'Activity 3',
          description: 'desc',
          timestamp: now - 10000,
          icon: '👍',
        },
      ]
      localStorage.setItem('chimera_activity_feed', JSON.stringify(activities))
      
      const filtered = getActivitiesInRange(now - 6000, now)
      expect(filtered).toHaveLength(2)
      expect(filtered.map(a => a.title)).toEqual(['Activity 1', 'Activity 2'])
    })

    it('should return empty array when no activities in range', () => {
      trackActivity('page_view', 'Test', 'desc')
      const filtered = getActivitiesInRange(0, 1000)
      expect(filtered).toEqual([])
    })
  })

  describe('formatRelativeTime', () => {
    it('should format seconds as "just now"', () => {
      const now = Date.now()
      expect(formatRelativeTime(now - 30 * 1000)).toBe('just now')
    })

    it('should format minutes', () => {
      const now = Date.now()
      expect(formatRelativeTime(now - 5 * 60 * 1000)).toBe('5m ago')
    })

    it('should format hours', () => {
      const now = Date.now()
      expect(formatRelativeTime(now - 3 * 60 * 60 * 1000)).toBe('3h ago')
    })

    it('should format days', () => {
      const now = Date.now()
      expect(formatRelativeTime(now - 2 * 24 * 60 * 60 * 1000)).toBe('2d ago')
    })

    it('should format dates older than 7 days', () => {
      const now = Date.now()
      const timestamp = now - 10 * 24 * 60 * 60 * 1000
      const formatted = formatRelativeTime(timestamp)
      expect(formatted).toMatch(/\d+\/\d+\/\d+/)
    })
  })

  describe('initializeActivityFeed', () => {
    it('should add welcome activity for first-time users', () => {
      initializeActivityFeed()
      
      const activities = loadActivities()
      expect(activities).toHaveLength(1)
      expect(activities[0].title).toBe('Welcome to Chimera!')
      expect(activities[0].metadata?.isWelcome).toBe(true)
    })

    it('should add return activity for returning users', () => {
      trackActivity('page_view', 'Previous visit', 'desc')
      initializeActivityFeed()
      
      const activities = loadActivities()
      expect(activities[0].title).toBe('Returned to Chimera')
      expect(activities[0].metadata?.isReturn).toBe(true)
    })
  })
})
