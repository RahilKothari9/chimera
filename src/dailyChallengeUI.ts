/**
 * Daily Challenge UI
 * Interactive interface for daily coding challenges
 */

import {
  getDailyChallenge,
  getAllChallenges,
  getChallengesByDifficulty,
  getChallengesByCategory,
  getAllCategories,
  loadProgress,
  submitAttempt,
  isTodayChallengeCompleted,
  getChallengeStats,
  type CodingChallenge,
  type DifficultyLevel,
} from './dailyChallenge'
import { trackActivity } from './activityFeed'
import { notificationManager } from './notificationSystem'

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Create the daily challenge dashboard
 */
export function createDailyChallengeUI(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'daily-challenge-container'
  
  const progress = loadProgress()
  const dailyChallenge = getDailyChallenge()
  const isCompleted = isTodayChallengeCompleted()
  const stats = getChallengeStats()

  container.innerHTML = `
    <div class="daily-challenge-header">
      <h2 class="section-title">💻 Daily Coding Challenge</h2>
      <p class="daily-challenge-subtitle">Sharpen your skills with a new challenge every day</p>
    </div>

    <div class="challenge-stats-grid">
      <div class="challenge-stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-value">${progress.currentStreak}</div>
        <div class="stat-label">Day Streak</div>
      </div>
      <div class="challenge-stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-value">${progress.longestStreak}</div>
        <div class="stat-label">Best Streak</div>
      </div>
      <div class="challenge-stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-value">${progress.totalCompleted}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="challenge-stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-value">${progress.totalPoints}</div>
        <div class="stat-label">Total Points</div>
      </div>
    </div>

    <div class="daily-challenge-main">
      <div class="challenge-card ${isCompleted ? 'completed' : ''}">
        <div class="challenge-header">
          <div class="challenge-title-row">
            <h3 class="challenge-title">Today's Challenge: ${escapeHtml(dailyChallenge.title)}</h3>
            <span class="difficulty-badge difficulty-${dailyChallenge.difficulty}">${dailyChallenge.difficulty.toUpperCase()}</span>
          </div>
          <div class="challenge-meta">
            <span class="category-badge">📁 ${escapeHtml(dailyChallenge.category)}</span>
            <span class="points-badge">⭐ ${dailyChallenge.points} points</span>
          </div>
        </div>

        ${isCompleted ? `
          <div class="challenge-completed-banner">
            <span class="banner-icon">🎉</span>
            <span class="banner-text">Completed! Come back tomorrow for a new challenge.</span>
          </div>
        ` : ''}

        <div class="challenge-description">
          ${escapeHtml(dailyChallenge.description)}
        </div>

        <div class="challenge-workspace">
          <div class="workspace-header">
            <span class="workspace-label">Your Solution</span>
            <button class="btn-hint" id="show-hints-btn">💡 Show Hints</button>
          </div>
          <textarea 
            id="challenge-code-input" 
            class="challenge-code-input"
            placeholder="Write your solution here..."
            spellcheck="false"
          >${isCompleted ? '' : dailyChallenge.starterCode}</textarea>
          
          <div class="hints-section" id="hints-section" style="display: none;">
            <h4 class="hints-title">💡 Hints</h4>
            <ul class="hints-list">
              ${dailyChallenge.hints.map((hint, index) => 
                `<li class="hint-item" id="hint-${index}" style="display: none;">${escapeHtml(hint)}</li>`
              ).join('')}
            </ul>
            <button class="btn-secondary" id="next-hint-btn">Show Next Hint</button>
          </div>

          <div class="workspace-actions">
            <button class="btn-primary" id="submit-solution-btn" ${isCompleted ? 'disabled' : ''}>
              ${isCompleted ? '✓ Already Completed' : '▶ Run & Submit'}
            </button>
            <button class="btn-secondary" id="reset-code-btn">↻ Reset Code</button>
          </div>
        </div>

        <div class="test-cases-section">
          <h4 class="test-cases-title">Test Cases</h4>
          <div class="test-cases-list" id="test-cases-list">
            ${dailyChallenge.testCases.map((testCase, index) => `
              <div class="test-case-item">
                <div class="test-case-header">
                  <span class="test-case-number">Test ${index + 1}</span>
                  <span class="test-case-status" id="test-status-${index}">⏸️</span>
                </div>
                <div class="test-case-content">
                  <div class="test-case-label">Input:</div>
                  <code class="test-case-value">${escapeHtml(testCase.input)}</code>
                  <div class="test-case-label">Expected:</div>
                  <code class="test-case-value">${escapeHtml(testCase.expectedOutput)}</code>
                  <div class="test-case-description">${escapeHtml(testCase.description)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="result-section" id="result-section" style="display: none;"></div>
      </div>

      <div class="challenge-browser">
        <div class="browser-header">
          <h3 class="browser-title">Browse All Challenges</h3>
          <div class="browser-stats">
            <span>${stats.totalChallenges} total challenges</span>
          </div>
        </div>

        <div class="browser-filters">
          <select id="difficulty-filter" class="filter-select">
            <option value="all">All Difficulties</option>
            <option value="easy">Easy (${stats.byDifficulty.easy})</option>
            <option value="medium">Medium (${stats.byDifficulty.medium})</option>
            <option value="hard">Hard (${stats.byDifficulty.hard})</option>
          </select>

          <select id="category-filter" class="filter-select">
            <option value="all">All Categories</option>
            ${getAllCategories().map(cat => 
              `<option value="${escapeHtml(cat)}">${escapeHtml(cat)} (${stats.byCategory[cat]})</option>`
            ).join('')}
          </select>
        </div>

        <div class="challenge-list" id="challenge-list">
          ${renderChallengeList(getAllChallenges(), progress.completedChallenges)}
        </div>
      </div>
    </div>
  `

  // Setup event listeners
  setupEventListeners(container, dailyChallenge)
  
  return container
}

/**
 * Render challenge list
 */
function renderChallengeList(challenges: CodingChallenge[], completed: string[]): string {
  return challenges.map(challenge => {
    const isCompleted = completed.includes(challenge.id)
    return `
      <div class="challenge-list-item ${isCompleted ? 'completed' : ''}" data-challenge-id="${challenge.id}">
        <div class="list-item-header">
          <span class="list-item-title">${escapeHtml(challenge.title)}</span>
          ${isCompleted ? '<span class="completed-icon">✓</span>' : ''}
        </div>
        <div class="list-item-meta">
          <span class="difficulty-badge difficulty-${challenge.difficulty}">${challenge.difficulty}</span>
          <span class="category-badge-small">${escapeHtml(challenge.category)}</span>
          <span class="points-badge-small">⭐ ${challenge.points}</span>
        </div>
      </div>
    `
  }).join('')
}

/**
 * Setup event listeners
 */
function setupEventListeners(container: HTMLElement, initialChallenge: CodingChallenge): void {
  let currentChallenge = initialChallenge
  let currentHintIndex = 0

  // Submit solution
  const submitBtn = container.querySelector('#submit-solution-btn')
  submitBtn?.addEventListener('click', () => {
    const codeInput = container.querySelector('#challenge-code-input') as HTMLTextAreaElement
    const code = codeInput?.value || ''

    if (!code.trim()) {
      notificationManager.show('Please write some code first!', { type: 'warning' })
      return
    }

    const result = submitAttempt(currentChallenge.id, code)
    displayResults(container, result, currentChallenge)

    if (result.success) {
      notificationManager.show(
        `🎉 Challenge completed! +${currentChallenge.points} points. Streak: ${result.streakInfo?.current}🔥`,
        { type: 'success' }
      )
      trackActivity('challenge', 'Completed Daily Challenge', currentChallenge.title)
      
      // Refresh UI to show completion
      setTimeout(() => {
        const parent = container.parentElement
        if (parent) {
          const newUI = createDailyChallengeUI()
          parent.replaceChild(newUI, container)
        }
      }, 2000)
    } else {
      notificationManager.show('Some test cases failed. Try again!', { type: 'error' })
      trackActivity('challenge', 'Attempted Challenge', currentChallenge.title)
    }
  })

  // Reset code
  const resetBtn = container.querySelector('#reset-code-btn')
  resetBtn?.addEventListener('click', () => {
    const codeInput = container.querySelector('#challenge-code-input') as HTMLTextAreaElement
    if (codeInput) {
      codeInput.value = currentChallenge.starterCode
      notificationManager.show('Code reset to starter template', { type: 'info' })
    }
  })

  // Show hints
  const showHintsBtn = container.querySelector('#show-hints-btn')
  const hintsSection = container.querySelector('#hints-section') as HTMLElement
  showHintsBtn?.addEventListener('click', () => {
    if (hintsSection) {
      hintsSection.style.display = hintsSection.style.display === 'none' ? 'block' : 'none'
      currentHintIndex = 0
      // Hide all hints initially
      currentChallenge.hints.forEach((_, index) => {
        const hint = container.querySelector(`#hint-${index}`) as HTMLElement
        if (hint) hint.style.display = 'none'
      })
    }
  })

  // Next hint
  const nextHintBtn = container.querySelector('#next-hint-btn')
  nextHintBtn?.addEventListener('click', () => {
    if (currentHintIndex < currentChallenge.hints.length) {
      const hint = container.querySelector(`#hint-${currentHintIndex}`) as HTMLElement
      if (hint) {
        hint.style.display = 'block'
        currentHintIndex++
        trackActivity('challenge', 'Viewed Hint', `Hint ${currentHintIndex}`)
      }

      if (currentHintIndex >= currentChallenge.hints.length) {
        const btn = nextHintBtn as HTMLButtonElement
        btn.disabled = true
        btn.textContent = '✓ All Hints Shown'
      }
    }
  })

  // Filter challenges
  const difficultyFilter = container.querySelector('#difficulty-filter')
  const categoryFilter = container.querySelector('#category-filter')
  const challengeList = container.querySelector('#challenge-list')

  const updateChallengeList = () => {
    const difficulty = (difficultyFilter as HTMLSelectElement)?.value
    const category = (categoryFilter as HTMLSelectElement)?.value
    
    let challenges = getAllChallenges()
    
    if (difficulty && difficulty !== 'all') {
      challenges = getChallengesByDifficulty(difficulty as DifficultyLevel)
    }
    
    if (category && category !== 'all') {
      challenges = getChallengesByCategory(category)
    }

    const progress = loadProgress()
    if (challengeList) {
      challengeList.innerHTML = renderChallengeList(challenges, progress.completedChallenges)
      attachChallengeListeners(container, challengeList as HTMLElement)
    }

    trackActivity('challenge', 'Filtered Challenges', `${difficulty || 'all'} - ${category || 'all'}`)
  }

  difficultyFilter?.addEventListener('change', updateChallengeList)
  categoryFilter?.addEventListener('change', updateChallengeList)

  // Initial challenge list listeners
  if (challengeList) {
    attachChallengeListeners(container, challengeList as HTMLElement)
  }
}

/**
 * Attach listeners to challenge list items
 */
function attachChallengeListeners(_container: HTMLElement, challengeList: HTMLElement): void {
  const items = challengeList.querySelectorAll('.challenge-list-item')
  items.forEach(item => {
    item.addEventListener('click', () => {
      const challengeId = item.getAttribute('data-challenge-id')
      if (challengeId) {
        notificationManager.show(`Loading challenge: ${challengeId}`, { type: 'info' })
        trackActivity('challenge', 'Viewed Challenge', challengeId)
        // Could expand to load this challenge into the editor
      }
    })
  })
}

/**
 * Display test results
 */
function displayResults(
  container: HTMLElement, 
  result: ReturnType<typeof submitAttempt>,
  challenge: CodingChallenge
): void {
  const resultSection = container.querySelector('#result-section') as HTMLElement
  if (!resultSection) return

  const { validation } = result
  const passedCount = validation.results.filter(r => r.passed).length
  const totalCount = validation.results.length

  resultSection.style.display = 'block'
  resultSection.innerHTML = `
    <div class="result-header ${validation.passed ? 'success' : 'failure'}">
      <h4 class="result-title">
        ${validation.passed ? '✅ All Tests Passed!' : '❌ Some Tests Failed'}
      </h4>
      <div class="result-summary">
        ${passedCount} / ${totalCount} test cases passed
      </div>
    </div>

    <div class="result-details">
      ${validation.results.map((r, index) => `
        <div class="result-item ${r.passed ? 'passed' : 'failed'}">
          <div class="result-item-header">
            <span class="result-icon">${r.passed ? '✓' : '✗'}</span>
            <span class="result-label">Test ${index + 1}: ${escapeHtml(r.test.description)}</span>
          </div>
          ${!r.passed && r.error ? `
            <div class="result-error">
              <strong>Error:</strong> ${escapeHtml(r.error)}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>

    ${validation.passed ? `
      <div class="result-congrats">
        <div class="congrats-icon">🎉</div>
        <div class="congrats-text">
          <strong>Congratulations!</strong> You earned ${challenge.points} points!
        </div>
        ${result.streakInfo ? `
          <div class="streak-info">
            🔥 Current Streak: ${result.streakInfo.current} days
            ${result.streakInfo.current === result.streakInfo.longest ? ' (Personal Best!)' : ''}
          </div>
        ` : ''}
      </div>
    ` : ''}
  `

  // Update test case status indicators
  validation.results.forEach((r, index) => {
    const statusIcon = container.querySelector(`#test-status-${index}`)
    if (statusIcon) {
      statusIcon.textContent = r.passed ? '✅' : '❌'
    }
  })

  // Scroll to results
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}
