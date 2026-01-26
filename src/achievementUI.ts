import type { AchievementData } from './achievementSystem'

/**
 * Create the achievement UI section
 */
export function createAchievementUI(data: AchievementData): HTMLElement {
  const container = document.createElement('div')
  container.className = 'achievement-section'
  
  const header = document.createElement('div')
  header.className = 'achievement-header'
  header.innerHTML = `
    <h2 class="section-title">🏆 Achievements & Milestones</h2>
    <div class="achievement-stats">
      <div class="stat-badge">
        <span class="stat-value">${data.totalUnlocked}</span>
        <span class="stat-label">Unlocked</span>
      </div>
      <div class="stat-badge">
        <span class="stat-value">${data.completionRate.toFixed(0)}%</span>
        <span class="stat-label">Completion</span>
      </div>
    </div>
  `
  
  // Create milestones section
  const milestonesSection = createMilestonesSection(data.milestones)
  
  // Create achievements grid
  const achievementsGrid = createAchievementsGrid(data.achievements)
  
  container.appendChild(header)
  container.appendChild(milestonesSection)
  container.appendChild(achievementsGrid)
  
  return container
}

/**
 * Create the milestones progress section
 */
function createMilestonesSection(milestones: AchievementData['milestones']): HTMLElement {
  const section = document.createElement('div')
  section.className = 'milestones-section'
  
  const title = document.createElement('h3')
  title.className = 'milestones-title'
  title.textContent = '🎯 Progress Toward Next Milestones'
  section.appendChild(title)
  
  milestones.forEach(milestone => {
    const milestoneCard = document.createElement('div')
    milestoneCard.className = 'milestone-card'
    
    milestoneCard.innerHTML = `
      <div class="milestone-header">
        <span class="milestone-name">${milestone.name}</span>
        <span class="milestone-count">${milestone.current} / ${milestone.target}</span>
      </div>
      <div class="milestone-progress-bar">
        <div class="milestone-progress-fill" style="width: ${milestone.progress}%"></div>
      </div>
      <div class="milestone-percentage">${milestone.progress.toFixed(0)}%</div>
    `
    
    section.appendChild(milestoneCard)
  })
  
  return section
}

/**
 * Create the achievements grid
 */
function createAchievementsGrid(achievements: AchievementData['achievements']): HTMLElement {
  const grid = document.createElement('div')
  grid.className = 'achievements-grid'
  
  // Sort achievements: unlocked first, then by category
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.unlocked !== b.unlocked) {
      return a.unlocked ? -1 : 1
    }
    return a.category.localeCompare(b.category)
  })
  
  sortedAchievements.forEach(achievement => {
    const card = createAchievementCard(achievement)
    grid.appendChild(card)
  })
  
  return grid
}

/**
 * Create an individual achievement card
 */
function createAchievementCard(achievement: AchievementData['achievements'][0]): HTMLElement {
  const card = document.createElement('div')
  card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`
  
  const iconElement = document.createElement('div')
  iconElement.className = 'achievement-icon'
  iconElement.textContent = achievement.unlocked ? achievement.icon : '🔒'
  
  const nameElement = document.createElement('div')
  nameElement.className = 'achievement-name'
  nameElement.textContent = achievement.unlocked ? achievement.name : '???'
  
  const descElement = document.createElement('div')
  descElement.className = 'achievement-description'
  descElement.textContent = achievement.unlocked 
    ? achievement.description 
    : achievement.requirement
  
  const categoryBadge = document.createElement('div')
  categoryBadge.className = 'achievement-category'
  categoryBadge.textContent = achievement.category
  
  card.appendChild(iconElement)
  card.appendChild(nameElement)
  card.appendChild(descElement)
  card.appendChild(categoryBadge)
  
  if (achievement.unlocked && achievement.unlockedDate) {
    const dateElement = document.createElement('div')
    dateElement.className = 'achievement-date'
    dateElement.textContent = `Unlocked: ${achievement.unlockedDate}`
    card.appendChild(dateElement)
  }
  
  // Add tooltip for locked achievements
  if (!achievement.unlocked) {
    card.title = `Requirement: ${achievement.requirement}`
  }
  
  return card
}

/**
 * Animate achievement unlock (can be called when new achievements are earned)
 */
export function animateAchievementUnlock(achievementId: string): void {
  const card = document.querySelector(`[data-achievement-id="${achievementId}"]`)
  if (!card) return
  
  card.classList.add('achievement-unlock-animation')
  
  setTimeout(() => {
    card.classList.remove('achievement-unlock-animation')
  }, 1000)
}

/**
 * Update achievement UI with new data
 */
export function updateAchievementUI(container: HTMLElement, data: AchievementData): void {
  const newUI = createAchievementUI(data)
  container.innerHTML = ''
  container.appendChild(newUI)
}
