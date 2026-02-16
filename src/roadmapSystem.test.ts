import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadFeatureRequests,
  saveFeatureRequests,
  getFeatureRequest,
  addFeatureRequest,
  updateFeatureRequest,
  deleteFeatureRequest,
  voteForFeature,
  unvoteFeature,
  hasUserVoted,
  filterFeatureRequests,
  getRoadmapStatistics,
  type FeatureRequest,
  type RoadmapFilters,
} from './roadmapSystem'

describe('Roadmap System', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Feature Request Storage', () => {
    it('should load default roadmap items on first load', () => {
      const requests = loadFeatureRequests()
      expect(requests).toHaveLength(6)
      expect(requests[0].title).toBe('Real-time Collaboration')
    })

    it('should save and load feature requests', () => {
      const testRequests: FeatureRequest[] = [
        {
          id: 'test-1',
          title: 'Test Feature',
          description: 'Test description',
          category: 'feature',
          status: 'proposed',
          priority: 'high',
          votes: 10,
          submittedBy: 'Test User',
          submittedAt: Date.now(),
          tags: ['test'],
        },
      ]

      saveFeatureRequests(testRequests)
      const loaded = loadFeatureRequests()

      expect(loaded).toHaveLength(1)
      expect(loaded[0].title).toBe('Test Feature')
      expect(loaded[0].votes).toBe(10)
    })

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('chimera_feature_requests', 'invalid json')
      const requests = loadFeatureRequests()
      expect(requests).toHaveLength(6) // Should return defaults
    })
  })

  describe('Get Feature Request', () => {
    it('should get a feature request by ID', () => {
      const requests = loadFeatureRequests()
      const request = getFeatureRequest('fr-001')

      expect(request).toBeDefined()
      expect(request?.title).toBe('Real-time Collaboration')
    })

    it('should return undefined for non-existent ID', () => {
      const request = getFeatureRequest('non-existent')
      expect(request).toBeUndefined()
    })
  })

  describe('Add Feature Request', () => {
    it('should add a new feature request', () => {
      const newRequest = {
        title: 'New Feature',
        description: 'A new feature request',
        category: 'feature' as const,
        status: 'proposed' as const,
        priority: 'medium' as const,
        submittedBy: 'User',
        tags: ['new'],
      }

      const added = addFeatureRequest(newRequest)

      expect(added.id).toBeDefined()
      expect(added.title).toBe('New Feature')
      expect(added.votes).toBe(1) // Starts with 1 vote
      expect(added.submittedAt).toBeDefined()

      const requests = loadFeatureRequests()
      expect(requests.some(r => r.id === added.id)).toBe(true)
    })

    it('should generate unique IDs for feature requests', () => {
      const request1 = addFeatureRequest({
        title: 'Feature 1',
        description: 'Description 1',
        category: 'feature',
        status: 'proposed',
        priority: 'low',
        submittedBy: 'User',
        tags: [],
      })

      const request2 = addFeatureRequest({
        title: 'Feature 2',
        description: 'Description 2',
        category: 'enhancement',
        status: 'proposed',
        priority: 'high',
        submittedBy: 'User',
        tags: [],
      })

      expect(request1.id).not.toBe(request2.id)
    })

    it('should add feature with all optional fields', () => {
      const added = addFeatureRequest({
        title: 'Complex Feature',
        description: 'Description',
        category: 'feature',
        status: 'planned',
        priority: 'critical',
        submittedBy: 'User',
        tags: ['tag1', 'tag2'],
        estimatedEffort: 'large',
        dependencies: ['fr-001', 'fr-002'],
      })

      expect(added.estimatedEffort).toBe('large')
      expect(added.dependencies).toEqual(['fr-001', 'fr-002'])
      expect(added.tags).toEqual(['tag1', 'tag2'])
    })
  })

  describe('Update Feature Request', () => {
    it('should update an existing feature request', () => {
      const requests = loadFeatureRequests()
      const originalVotes = requests[0].votes

      const updated = updateFeatureRequest('fr-001', {
        status: 'in-progress',
        priority: 'critical',
      })

      expect(updated).toBe(true)

      const request = getFeatureRequest('fr-001')
      expect(request?.status).toBe('in-progress')
      expect(request?.priority).toBe('critical')
      expect(request?.votes).toBe(originalVotes) // Votes unchanged
    })

    it('should return false for non-existent ID', () => {
      const updated = updateFeatureRequest('non-existent', { status: 'completed' })
      expect(updated).toBe(false)
    })

    it('should update multiple fields at once', () => {
      updateFeatureRequest('fr-001', {
        title: 'Updated Title',
        description: 'Updated Description',
        status: 'completed',
        completedAt: Date.now(),
      })

      const request = getFeatureRequest('fr-001')
      expect(request?.title).toBe('Updated Title')
      expect(request?.description).toBe('Updated Description')
      expect(request?.status).toBe('completed')
      expect(request?.completedAt).toBeDefined()
    })
  })

  describe('Delete Feature Request', () => {
    it('should delete a feature request', () => {
      const deleted = deleteFeatureRequest('fr-001')
      expect(deleted).toBe(true)

      const request = getFeatureRequest('fr-001')
      expect(request).toBeUndefined()
    })

    it('should return false for non-existent ID', () => {
      const deleted = deleteFeatureRequest('non-existent')
      expect(deleted).toBe(false)
    })

    it('should reduce total count after deletion', () => {
      const before = loadFeatureRequests().length
      deleteFeatureRequest('fr-001')
      const after = loadFeatureRequests().length

      expect(after).toBe(before - 1)
    })
  })

  describe('Voting', () => {
    it('should allow voting for a feature', () => {
      const request = getFeatureRequest('fr-001')
      const originalVotes = request!.votes

      const voted = voteForFeature('fr-001')
      expect(voted).toBe(true)

      const updated = getFeatureRequest('fr-001')
      expect(updated?.votes).toBe(originalVotes + 1)
    })

    it('should prevent double voting', () => {
      voteForFeature('fr-001')
      const firstVote = getFeatureRequest('fr-001')?.votes

      const secondVote = voteForFeature('fr-001')
      expect(secondVote).toBe(false)

      const afterSecond = getFeatureRequest('fr-001')?.votes
      expect(afterSecond).toBe(firstVote)
    })

    it('should track user votes', () => {
      voteForFeature('fr-001')
      expect(hasUserVoted('fr-001')).toBe(true)
      expect(hasUserVoted('fr-002')).toBe(false)
    })

    it('should return false for non-existent feature', () => {
      const voted = voteForFeature('non-existent')
      expect(voted).toBe(false)
    })

    it('should allow unvoting a feature', () => {
      voteForFeature('fr-001')
      const afterVote = getFeatureRequest('fr-001')?.votes

      const unvoted = unvoteFeature('fr-001')
      expect(unvoted).toBe(true)

      const afterUnvote = getFeatureRequest('fr-001')?.votes
      expect(afterUnvote).toBe(afterVote! - 1)
      expect(hasUserVoted('fr-001')).toBe(false)
    })

    it('should prevent unvoting without a vote', () => {
      const unvoted = unvoteFeature('fr-001')
      expect(unvoted).toBe(false)
    })

    it('should not reduce votes below zero', () => {
      const request = addFeatureRequest({
        title: 'Test',
        description: 'Test',
        category: 'feature',
        status: 'proposed',
        priority: 'low',
        submittedBy: 'User',
        tags: [],
      })

      // Manually set votes to 0
      updateFeatureRequest(request.id, { votes: 0 })

      const unvoted = unvoteFeature(request.id)
      expect(unvoted).toBe(false)
    })

    it('should allow voting for multiple features', () => {
      voteForFeature('fr-001')
      voteForFeature('fr-002')
      voteForFeature('fr-003')

      expect(hasUserVoted('fr-001')).toBe(true)
      expect(hasUserVoted('fr-002')).toBe(true)
      expect(hasUserVoted('fr-003')).toBe(true)
    })

    it('should handle corrupted votes data', () => {
      localStorage.setItem('chimera_feature_votes', 'invalid json')
      const voted = voteForFeature('fr-001')
      expect(voted).toBe(true)
    })
  })

  describe('Filtering', () => {
    it('should filter by status', () => {
      const requests = loadFeatureRequests()
      const filters: RoadmapFilters = { status: 'proposed' }
      const filtered = filterFeatureRequests(requests, filters)

      expect(filtered.every(r => r.status === 'proposed')).toBe(true)
      expect(filtered.length).toBeGreaterThan(0)
    })

    it('should filter by category', () => {
      const requests = loadFeatureRequests()
      const filters: RoadmapFilters = { category: 'feature' }
      const filtered = filterFeatureRequests(requests, filters)

      expect(filtered.every(r => r.category === 'feature')).toBe(true)
    })

    it('should filter by priority', () => {
      const requests = loadFeatureRequests()
      const filters: RoadmapFilters = { priority: 'high' }
      const filtered = filterFeatureRequests(requests, filters)

      expect(filtered.every(r => r.priority === 'high')).toBe(true)
    })

    it('should filter by search term in title', () => {
      const requests = loadFeatureRequests()
      const filters: RoadmapFilters = { searchTerm: 'real-time' }
      const filtered = filterFeatureRequests(requests, filters)

      expect(filtered.length).toBeGreaterThan(0)
      // Check that at least one result matches the search term
      const hasMatch = filtered.some(r => 
        r.title.toLowerCase().includes('real-time') ||
        r.description.toLowerCase().includes('real-time') ||
        r.tags.some(tag => tag.toLowerCase().includes('real-time'))
      )
      expect(hasMatch).toBe(true)
    })

    it('should filter by search term in description', () => {
      const requests = loadFeatureRequests()
      const filters: RoadmapFilters = { searchTerm: 'users' }
      const filtered = filterFeatureRequests(requests, filters)

      expect(filtered.some(r => r.description.toLowerCase().includes('users'))).toBe(true)
    })

    it('should filter by search term in tags', () => {
      const requests = loadFeatureRequests()
      const filters: RoadmapFilters = { searchTerm: 'ai' }
      const filtered = filterFeatureRequests(requests, filters)

      expect(filtered.some(r => r.tags.some(tag => tag.toLowerCase().includes('ai')))).toBe(true)
    })

    it('should combine multiple filters', () => {
      const requests = loadFeatureRequests()
      const filters: RoadmapFilters = {
        status: 'proposed',
        category: 'feature',
        priority: 'medium',
      }
      const filtered = filterFeatureRequests(requests, filters)

      expect(filtered.every(r => 
        r.status === 'proposed' && 
        r.category === 'feature' && 
        r.priority === 'medium'
      )).toBe(true)
    })

    it('should return empty array when no matches', () => {
      const requests = loadFeatureRequests()
      const filters: RoadmapFilters = { searchTerm: 'nonexistentterm12345' }
      const filtered = filterFeatureRequests(requests, filters)

      expect(filtered).toHaveLength(0)
    })
  })

  describe('Sorting', () => {
    it('should sort by votes descending by default', () => {
      const requests = loadFeatureRequests()
      const filtered = filterFeatureRequests(requests, {})

      for (let i = 0; i < filtered.length - 1; i++) {
        expect(filtered[i].votes).toBeGreaterThanOrEqual(filtered[i + 1].votes)
      }
    })

    it('should sort by votes ascending', () => {
      const requests = loadFeatureRequests()
      const filtered = filterFeatureRequests(requests, {
        sortBy: 'votes',
        sortOrder: 'asc',
      })

      for (let i = 0; i < filtered.length - 1; i++) {
        expect(filtered[i].votes).toBeLessThanOrEqual(filtered[i + 1].votes)
      }
    })

    it('should sort by date descending', () => {
      const requests = loadFeatureRequests()
      const filtered = filterFeatureRequests(requests, {
        sortBy: 'date',
        sortOrder: 'desc',
      })

      for (let i = 0; i < filtered.length - 1; i++) {
        expect(filtered[i].submittedAt).toBeGreaterThanOrEqual(filtered[i + 1].submittedAt)
      }
    })

    it('should sort by date ascending', () => {
      const requests = loadFeatureRequests()
      const filtered = filterFeatureRequests(requests, {
        sortBy: 'date',
        sortOrder: 'asc',
      })

      for (let i = 0; i < filtered.length - 1; i++) {
        expect(filtered[i].submittedAt).toBeLessThanOrEqual(filtered[i + 1].submittedAt)
      }
    })

    it('should sort by priority descending', () => {
      const requests = loadFeatureRequests()
      const filtered = filterFeatureRequests(requests, {
        sortBy: 'priority',
        sortOrder: 'desc',
      })

      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      for (let i = 0; i < filtered.length - 1; i++) {
        expect(priorityOrder[filtered[i].priority]).toBeGreaterThanOrEqual(
          priorityOrder[filtered[i + 1].priority]
        )
      }
    })
  })

  describe('Statistics', () => {
    it('should calculate total count', () => {
      const requests = loadFeatureRequests()
      const stats = getRoadmapStatistics(requests)

      expect(stats.total).toBe(requests.length)
    })

    it('should count by status', () => {
      const requests = loadFeatureRequests()
      const stats = getRoadmapStatistics(requests)

      expect(stats.proposed).toBe(requests.filter(r => r.status === 'proposed').length)
      expect(stats.planned).toBe(requests.filter(r => r.status === 'planned').length)
      expect(stats.inProgress).toBe(requests.filter(r => r.status === 'in-progress').length)
      expect(stats.completed).toBe(requests.filter(r => r.status === 'completed').length)
    })

    it('should count by category', () => {
      const requests = loadFeatureRequests()
      const stats = getRoadmapStatistics(requests)

      expect(stats.byCategory.feature).toBe(requests.filter(r => r.category === 'feature').length)
      expect(stats.byCategory.enhancement).toBe(requests.filter(r => r.category === 'enhancement').length)
      expect(stats.byCategory.performance).toBe(requests.filter(r => r.category === 'performance').length)
    })

    it('should count by priority', () => {
      const requests = loadFeatureRequests()
      const stats = getRoadmapStatistics(requests)

      expect(stats.byPriority.high).toBe(requests.filter(r => r.priority === 'high').length)
      expect(stats.byPriority.medium).toBe(requests.filter(r => r.priority === 'medium').length)
      expect(stats.byPriority.low).toBe(requests.filter(r => r.priority === 'low').length)
    })

    it('should calculate total votes', () => {
      const requests = loadFeatureRequests()
      const stats = getRoadmapStatistics(requests)

      const expectedTotal = requests.reduce((sum, r) => sum + r.votes, 0)
      expect(stats.totalVotes).toBe(expectedTotal)
    })

    it('should calculate average votes', () => {
      const requests = loadFeatureRequests()
      const stats = getRoadmapStatistics(requests)

      const expectedAvg = Math.round(requests.reduce((sum, r) => sum + r.votes, 0) / requests.length)
      expect(stats.averageVotes).toBe(expectedAvg)
    })

    it('should find most voted feature', () => {
      const requests = loadFeatureRequests()
      const stats = getRoadmapStatistics(requests)

      const mostVoted = requests.sort((a, b) => b.votes - a.votes)[0]
      expect(stats.mostVoted?.id).toBe(mostVoted.id)
      expect(stats.mostVoted?.votes).toBe(mostVoted.votes)
    })

    it('should handle empty request list', () => {
      saveFeatureRequests([])
      const stats = getRoadmapStatistics([])

      expect(stats.total).toBe(0)
      expect(stats.totalVotes).toBe(0)
      expect(stats.averageVotes).toBe(0)
      expect(stats.mostVoted).toBe(null)
    })
  })
})
