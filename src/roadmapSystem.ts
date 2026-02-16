/**
 * Collaborative Feature Request & Roadmap System
 * Manages community-driven feature requests, voting, and roadmap planning
 */

export interface FeatureRequest {
  id: string
  title: string
  description: string
  category: 'feature' | 'enhancement' | 'bugfix' | 'documentation' | 'performance'
  status: 'proposed' | 'planned' | 'in-progress' | 'completed' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'critical'
  votes: number
  submittedBy: string
  submittedAt: number
  completedAt?: number
  tags: string[]
  estimatedEffort?: 'small' | 'medium' | 'large' | 'x-large'
  dependencies?: string[] // IDs of other features this depends on
}

export interface RoadmapFilters {
  status?: FeatureRequest['status']
  category?: FeatureRequest['category']
  priority?: FeatureRequest['priority']
  searchTerm?: string
  sortBy?: 'votes' | 'date' | 'priority'
  sortOrder?: 'asc' | 'desc'
}

const STORAGE_KEY = 'chimera_feature_requests'
const VOTES_KEY = 'chimera_feature_votes'

// Default roadmap items to seed the system
const DEFAULT_ROADMAP: FeatureRequest[] = [
  {
    id: 'fr-001',
    title: 'Real-time Collaboration',
    description: 'Enable multiple users to view and interact with Chimera simultaneously with live updates',
    category: 'feature',
    status: 'proposed',
    priority: 'high',
    votes: 42,
    submittedBy: 'Community',
    submittedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    tags: ['collaboration', 'websockets', 'real-time'],
    estimatedEffort: 'large',
  },
  {
    id: 'fr-002',
    title: 'AI-Powered Code Suggestions',
    description: 'Integrate AI to suggest improvements and optimizations for code snippets in the playground',
    category: 'feature',
    status: 'planned',
    priority: 'medium',
    votes: 38,
    submittedBy: 'Community',
    submittedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    tags: ['ai', 'ml', 'code-quality'],
    estimatedEffort: 'x-large',
  },
  {
    id: 'fr-003',
    title: 'Dark Mode Scheduler',
    description: 'Automatically switch between light and dark themes based on time of day',
    category: 'enhancement',
    status: 'proposed',
    priority: 'low',
    votes: 28,
    submittedBy: 'Community',
    submittedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    tags: ['theme', 'ux', 'accessibility'],
    estimatedEffort: 'small',
  },
  {
    id: 'fr-004',
    title: 'Export to GitHub Gist',
    description: 'Allow users to export code snippets directly to GitHub Gist',
    category: 'feature',
    status: 'proposed',
    priority: 'medium',
    votes: 35,
    submittedBy: 'Community',
    submittedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    tags: ['export', 'github', 'integration'],
    estimatedEffort: 'medium',
  },
  {
    id: 'fr-005',
    title: 'Performance Optimization',
    description: 'Improve page load time and reduce bundle size through code splitting and lazy loading',
    category: 'performance',
    status: 'in-progress',
    priority: 'high',
    votes: 31,
    submittedBy: 'Community',
    submittedAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
    tags: ['performance', 'optimization', 'build'],
    estimatedEffort: 'medium',
  },
  {
    id: 'fr-006',
    title: 'Mobile App Version',
    description: 'Create a Progressive Web App (PWA) version for mobile devices with offline support',
    category: 'feature',
    status: 'proposed',
    priority: 'medium',
    votes: 45,
    submittedBy: 'Community',
    submittedAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    tags: ['mobile', 'pwa', 'offline'],
    estimatedEffort: 'large',
  },
]

/**
 * Load feature requests from localStorage
 */
export function loadFeatureRequests(): FeatureRequest[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load feature requests:', error)
  }
  
  // Return default roadmap if nothing stored
  saveFeatureRequests(DEFAULT_ROADMAP)
  return DEFAULT_ROADMAP
}

/**
 * Save feature requests to localStorage
 */
export function saveFeatureRequests(requests: FeatureRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
  } catch (error) {
    console.error('Failed to save feature requests:', error)
  }
}

/**
 * Get a single feature request by ID
 */
export function getFeatureRequest(id: string): FeatureRequest | undefined {
  const requests = loadFeatureRequests()
  return requests.find(r => r.id === id)
}

/**
 * Add a new feature request
 */
export function addFeatureRequest(request: Omit<FeatureRequest, 'id' | 'votes' | 'submittedAt'>): FeatureRequest {
  const requests = loadFeatureRequests()
  
  const newRequest: FeatureRequest = {
    ...request,
    id: `fr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    votes: 1, // Start with 1 vote (from submitter)
    submittedAt: Date.now(),
  }
  
  requests.push(newRequest)
  saveFeatureRequests(requests)
  
  return newRequest
}

/**
 * Update an existing feature request
 */
export function updateFeatureRequest(id: string, updates: Partial<FeatureRequest>): boolean {
  const requests = loadFeatureRequests()
  const index = requests.findIndex(r => r.id === id)
  
  if (index === -1) {
    return false
  }
  
  requests[index] = { ...requests[index], ...updates }
  saveFeatureRequests(requests)
  
  return true
}

/**
 * Delete a feature request
 */
export function deleteFeatureRequest(id: string): boolean {
  const requests = loadFeatureRequests()
  const filtered = requests.filter(r => r.id !== id)
  
  if (filtered.length === requests.length) {
    return false
  }
  
  saveFeatureRequests(filtered)
  return true
}

/**
 * Vote for a feature request
 */
export function voteForFeature(id: string): boolean {
  const votes = getUserVotes()
  
  // Check if user already voted
  if (votes.includes(id)) {
    return false
  }
  
  const requests = loadFeatureRequests()
  const request = requests.find(r => r.id === id)
  
  if (!request) {
    return false
  }
  
  request.votes += 1
  saveFeatureRequests(requests)
  
  // Save user vote
  votes.push(id)
  saveUserVotes(votes)
  
  return true
}

/**
 * Remove vote from a feature request
 */
export function unvoteFeature(id: string): boolean {
  const votes = getUserVotes()
  
  // Check if user voted
  if (!votes.includes(id)) {
    return false
  }
  
  const requests = loadFeatureRequests()
  const request = requests.find(r => r.id === id)
  
  if (!request || request.votes <= 0) {
    return false
  }
  
  request.votes -= 1
  saveFeatureRequests(requests)
  
  // Remove user vote
  const filteredVotes = votes.filter(v => v !== id)
  saveUserVotes(filteredVotes)
  
  return true
}

/**
 * Check if user has voted for a feature
 */
export function hasUserVoted(id: string): boolean {
  const votes = getUserVotes()
  return votes.includes(id)
}

/**
 * Get user's votes
 */
function getUserVotes(): string[] {
  try {
    const stored = localStorage.getItem(VOTES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load user votes:', error)
    return []
  }
}

/**
 * Save user's votes
 */
function saveUserVotes(votes: string[]): void {
  try {
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes))
  } catch (error) {
    console.error('Failed to save user votes:', error)
  }
}

/**
 * Filter and sort feature requests
 */
export function filterFeatureRequests(
  requests: FeatureRequest[],
  filters: RoadmapFilters
): FeatureRequest[] {
  let filtered = [...requests]
  
  // Apply status filter
  if (filters.status) {
    filtered = filtered.filter(r => r.status === filters.status)
  }
  
  // Apply category filter
  if (filters.category) {
    filtered = filtered.filter(r => r.category === filters.category)
  }
  
  // Apply priority filter
  if (filters.priority) {
    filtered = filtered.filter(r => r.priority === filters.priority)
  }
  
  // Apply search term
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase()
    filtered = filtered.filter(r => 
      r.title.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term) ||
      r.tags.some(tag => tag.toLowerCase().includes(term))
    )
  }
  
  // Apply sorting
  const sortBy = filters.sortBy || 'votes'
  const sortOrder = filters.sortOrder || 'desc'
  
  filtered.sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'votes':
        comparison = a.votes - b.votes
        break
      case 'date':
        comparison = a.submittedAt - b.submittedAt
        break
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })
  
  return filtered
}

/**
 * Get roadmap statistics
 */
export function getRoadmapStatistics(requests: FeatureRequest[]) {
  return {
    total: requests.length,
    proposed: requests.filter(r => r.status === 'proposed').length,
    planned: requests.filter(r => r.status === 'planned').length,
    inProgress: requests.filter(r => r.status === 'in-progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    totalVotes: requests.reduce((sum, r) => sum + r.votes, 0),
    averageVotes: requests.length > 0 ? Math.round(requests.reduce((sum, r) => sum + r.votes, 0) / requests.length) : 0,
    mostVoted: requests.sort((a, b) => b.votes - a.votes)[0] || null,
    byCategory: {
      feature: requests.filter(r => r.category === 'feature').length,
      enhancement: requests.filter(r => r.category === 'enhancement').length,
      bugfix: requests.filter(r => r.category === 'bugfix').length,
      documentation: requests.filter(r => r.category === 'documentation').length,
      performance: requests.filter(r => r.category === 'performance').length,
    },
    byPriority: {
      critical: requests.filter(r => r.priority === 'critical').length,
      high: requests.filter(r => r.priority === 'high').length,
      medium: requests.filter(r => r.priority === 'medium').length,
      low: requests.filter(r => r.priority === 'low').length,
    },
  }
}
