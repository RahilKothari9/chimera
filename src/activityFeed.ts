/**
 * Activity Feed System
 * 
 * Tracks and displays a real-time feed of user interactions with Chimera,
 * creating an engaging, dynamic experience that shows recent activity.
 */

export type ActivityType = 
  | 'page_view'
  | 'search'
  | 'vote'
  | 'feedback'
  | 'export'
  | 'theme_change'
  | 'navigation'
  | 'share'
  | 'achievement_unlock'
  | 'section_view'
  | 'backup'
  | 'code_execution'
  | 'snippet_save'
  | 'snippet_load'
  | 'snippet_delete'
  | 'template_browse'
  | 'template_preview'
  | 'template_use'
  | 'template_search'
  | 'qr_generate'
  | 'qr_modal_open'
  | 'qr_copy_url'
  | 'qr_download'
  | 'qr_print'
  | 'playground_qr_share'
  | 'tutorial'
  | 'roadmap'
  | 'code-smell'
  | 'challenge'
  | 'snippet'
  | 'regex_example'
  | 'regex_flags'
  | 'regex_test'
  | 'unit_converter'
  | 'password_generate'
  | 'pomodoro'
  | 'text_diff'

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: number
  icon: string
  metadata?: Record<string, unknown>
}

const STORAGE_KEY = 'chimera_activity_feed'
const MAX_ACTIVITIES = 50 // Keep only the last 50 activities

type ActivitySubscriber = (activities: Activity[]) => void
const subscribers: ActivitySubscriber[] = []

/**
 * Load activities from localStorage
 */
export function loadActivities(): Activity[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const activities = JSON.parse(stored) as Activity[]
    // Sort by timestamp descending (newest first)
    return activities.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Failed to load activities:', error)
    return []
  }
}

/**
 * Save activities to localStorage
 */
function saveActivities(activities: Activity[]): void {
  try {
    // Keep only the most recent MAX_ACTIVITIES
    const trimmed = activities.slice(0, MAX_ACTIVITIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch (error) {
    console.error('Failed to save activities:', error)
  }
}

/**
 * Add a new activity to the feed
 */
export function trackActivity(
  type: ActivityType,
  title: string,
  description: string,
  metadata?: Record<string, unknown>
): void {
  const activity: Activity = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    type,
    title,
    description,
    timestamp: Date.now(),
    icon: getActivityIcon(type),
    metadata,
  }
  
  const activities = loadActivities()
  activities.unshift(activity) // Add to the beginning
  saveActivities(activities)
  
  // Notify subscribers
  notifySubscribers(activities)
}

/**
 * Get the icon for an activity type
 */
function getActivityIcon(type: ActivityType): string {
  const icons: Record<ActivityType, string> = {
    page_view: '👁️',
    search: '🔍',
    vote: '👍',
    feedback: '💬',
    export: '📥',
    theme_change: '🎨',
    navigation: '🧭',
    share: '🔗',
    achievement_unlock: '🏆',
    section_view: '📊',
    backup: '💾',
    code_execution: '▶️',
    snippet_save: '💾',
    snippet_load: '📂',
    snippet_delete: '🗑️',
    template_browse: '📚',
    template_preview: '👁️',
    template_use: '✨',
    template_search: '🔍',
    qr_generate: '📱',
    qr_modal_open: '📱',
    qr_copy_url: '📋',
    qr_download: '⬇️',
    qr_print: '🖨️',
    playground_qr_share: '🔗',
    tutorial: '📚',
    roadmap: '🗺️',
    'code-smell': '🔍',
    challenge: '🎯',
    snippet: '📝',
    regex_example: '🔍',
    regex_flags: '⚙️',
    regex_test: '🧪',
    unit_converter: '🔄',
    password_generate: '🔐',
    pomodoro: '🍅',
    text_diff: '📄',
  }
  return icons[type] || '•'
}

/**
 * Clear all activities
 */
export function clearActivities(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    notifySubscribers([])
  } catch (error) {
    console.error('Failed to clear activities:', error)
  }
}

/**
 * Subscribe to activity changes
 */
export function subscribeToActivities(callback: ActivitySubscriber): () => void {
  subscribers.push(callback)
  
  // Return unsubscribe function
  return () => {
    const index = subscribers.indexOf(callback)
    if (index > -1) {
      subscribers.splice(index, 1)
    }
  }
}

/**
 * Notify all subscribers of activity changes
 */
function notifySubscribers(activities: Activity[]): void {
  subscribers.forEach(callback => callback(activities))
}

/**
 * Get activity statistics
 */
export function getActivityStats(): {
  total: number
  byType: Record<ActivityType, number>
  last24Hours: number
  lastHour: number
} {
  const activities = loadActivities()
  const now = Date.now()
  const oneHour = 60 * 60 * 1000
  const twentyFourHours = 24 * oneHour
  
  const stats = {
    total: activities.length,
    byType: {} as Record<ActivityType, number>,
    last24Hours: 0,
    lastHour: 0,
  }
  
  activities.forEach(activity => {
    // Count by type
    stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1
    
    // Count recent activities
    const age = now - activity.timestamp
    if (age < oneHour) {
      stats.lastHour++
    }
    if (age < twentyFourHours) {
      stats.last24Hours++
    }
  })
  
  return stats
}

/**
 * Get activities filtered by type
 */
export function getActivitiesByType(type: ActivityType): Activity[] {
  const activities = loadActivities()
  return activities.filter(activity => activity.type === type)
}

/**
 * Get activities from a specific time range
 */
export function getActivitiesInRange(startTime: number, endTime: number): Activity[] {
  const activities = loadActivities()
  return activities.filter(
    activity => activity.timestamp >= startTime && activity.timestamp <= endTime
  )
}

/**
 * Format a timestamp as a relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) {
    return 'just now'
  } else if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else if (days < 7) {
    return `${days}d ago`
  } else {
    return new Date(timestamp).toLocaleDateString()
  }
}

/**
 * Initialize activity feed with a welcome activity if it's the user's first visit
 */
export function initializeActivityFeed(): void {
  const activities = loadActivities()
  
  // If no activities exist, add a welcome message
  if (activities.length === 0) {
    trackActivity(
      'page_view',
      'Welcome to Chimera!',
      'Explore the evolution timeline and interactive features',
      { isWelcome: true }
    )
  } else {
    // Track that the user returned
    trackActivity(
      'page_view',
      'Returned to Chimera',
      'Continuing the exploration journey',
      { isReturn: true }
    )
  }
}
