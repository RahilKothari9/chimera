/**
 * Activity Feed UI Component
 * 
 * Displays a real-time feed of user interactions with Chimera.
 */

import {
  loadActivities,
  subscribeToActivities,
  clearActivities,
  getActivityStats,
  formatRelativeTime,
  type Activity,
} from './activityFeed'
import { notificationManager } from './notificationSystem'

/**
 * Create the activity feed UI
 */
export function createActivityFeedUI(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'activity-feed-container'
  
  // Create header
  const header = document.createElement('div')
  header.className = 'activity-feed-header'
  header.innerHTML = `
    <div class="activity-feed-title-section">
      <h2 class="section-title">Live Activity Feed</h2>
      <p class="activity-feed-subtitle">Real-time interactions and events</p>
    </div>
    <div class="activity-feed-actions">
      <button id="clear-activities-btn" class="activity-feed-btn secondary" title="Clear all activities">
        🗑️ Clear All
      </button>
    </div>
  `
  
  // Create stats section
  const stats = getActivityStats()
  const statsSection = createStatsSection(stats)
  
  // Create activities list
  const activitiesList = document.createElement('div')
  activitiesList.className = 'activities-list'
  activitiesList.id = 'activities-list'
  
  const activities = loadActivities()
  if (activities.length === 0) {
    activitiesList.innerHTML = `
      <div class="empty-activities">
        <div class="empty-icon">📊</div>
        <p class="empty-text">No activities yet</p>
        <p class="empty-subtext">Start exploring Chimera to see your activity here</p>
      </div>
    `
  } else {
    renderActivities(activitiesList, activities)
  }
  
  container.appendChild(header)
  container.appendChild(statsSection)
  container.appendChild(activitiesList)
  
  // Setup clear button
  const clearBtn = container.querySelector('#clear-activities-btn')
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all activities?')) {
        clearActivities()
        notificationManager.info('All activities cleared', 2000)
      }
    })
  }
  
  // Subscribe to activity changes
  subscribeToActivities((newActivities) => {
    const list = document.getElementById('activities-list')
    if (list) {
      if (newActivities.length === 0) {
        list.innerHTML = `
          <div class="empty-activities">
            <div class="empty-icon">📊</div>
            <p class="empty-text">No activities yet</p>
            <p class="empty-subtext">Start exploring Chimera to see your activity here</p>
          </div>
        `
      } else {
        renderActivities(list, newActivities)
      }
      
      // Update stats
      const newStats = getActivityStats()
      const statsContainer = container.querySelector('.activity-stats-container')
      if (statsContainer) {
        const newStatsSection = createStatsSection(newStats)
        statsContainer.replaceWith(newStatsSection)
      }
    }
  })
  
  return container
}

/**
 * Create the stats section
 */
function createStatsSection(stats: ReturnType<typeof getActivityStats>): HTMLElement {
  const statsSection = document.createElement('div')
  statsSection.className = 'activity-stats-container'
  
  statsSection.innerHTML = `
    <div class="activity-stat-card">
      <div class="stat-value">${stats.total}</div>
      <div class="stat-label">Total Activities</div>
    </div>
    <div class="activity-stat-card">
      <div class="stat-value">${stats.last24Hours}</div>
      <div class="stat-label">Last 24 Hours</div>
    </div>
    <div class="activity-stat-card">
      <div class="stat-value">${stats.lastHour}</div>
      <div class="stat-label">Last Hour</div>
    </div>
  `
  
  return statsSection
}

/**
 * Render activities in the list
 */
function renderActivities(container: HTMLElement, activities: Activity[]): void {
  // Show max 20 activities in the feed
  const displayActivities = activities.slice(0, 20)
  
  container.innerHTML = displayActivities.map(activity => 
    createActivityCard(activity)
  ).join('')
  
  if (activities.length > 20) {
    const moreInfo = document.createElement('div')
    moreInfo.className = 'activity-more-info'
    moreInfo.textContent = `... and ${activities.length - 20} more activities`
    container.appendChild(moreInfo)
  }
}

/**
 * Create an activity card HTML
 */
function createActivityCard(activity: Activity): string {
  const typeClass = getActivityTypeClass(activity.type)
  
  return `
    <div class="activity-card ${typeClass}">
      <div class="activity-icon">${activity.icon}</div>
      <div class="activity-content">
        <div class="activity-title">${escapeHtml(activity.title)}</div>
        <div class="activity-description">${escapeHtml(activity.description)}</div>
        <div class="activity-time">${formatRelativeTime(activity.timestamp)}</div>
      </div>
    </div>
  `
}

/**
 * Get CSS class for activity type
 */
function getActivityTypeClass(type: string): string {
  return `activity-type-${type.replace(/_/g, '-')}`
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
 * Setup automatic time updates
 */
export function setupTimeUpdates(): void {
  // Update relative times every minute
  setInterval(() => {
    const timeElements = document.querySelectorAll('.activity-time')
    const activities = loadActivities()
    
    timeElements.forEach((element, index) => {
      if (activities[index]) {
        element.textContent = formatRelativeTime(activities[index].timestamp)
      }
    })
  }, 60000) // Update every minute
}
