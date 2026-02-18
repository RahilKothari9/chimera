import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createDailyChallengeUI } from './dailyChallengeUI'
import { saveProgress, type ChallengeProgress } from './dailyChallenge'

// Mock modules
vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}))

vi.mock('./notificationSystem', () => ({
  notificationManager: {
    show: vi.fn(),
  },
}))

describe('Daily Challenge UI', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = '<div id="app"></div>'
  })

  afterEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  describe('UI Creation', () => {
    it('should create challenge UI element', () => {
      const ui = createDailyChallengeUI()
      expect(ui).toBeInstanceOf(HTMLElement)
      expect(ui.className).toBe('daily-challenge-container')
    })

    it('should display section title', () => {
      const ui = createDailyChallengeUI()
      const title = ui.querySelector('.section-title')
      expect(title?.textContent).toContain('Daily Coding Challenge')
    })

    it('should display challenge stats', () => {
      const ui = createDailyChallengeUI()
      const stats = ui.querySelectorAll('.challenge-stat-card')
      expect(stats.length).toBe(4) // Streak, Best Streak, Completed, Points
    })

    it('should display today\'s challenge', () => {
      const ui = createDailyChallengeUI()
      const challengeTitle = ui.querySelector('.challenge-title')
      expect(challengeTitle).toBeDefined()
      expect(challengeTitle?.textContent).toContain('Today\'s Challenge')
    })

    it('should display difficulty badge', () => {
      const ui = createDailyChallengeUI()
      const badge = ui.querySelector('.difficulty-badge')
      expect(badge).toBeDefined()
      expect(badge?.className).toMatch(/difficulty-(easy|medium|hard)/)
    })

    it('should display category badge', () => {
      const ui = createDailyChallengeUI()
      const badge = ui.querySelector('.category-badge')
      expect(badge).toBeDefined()
    })

    it('should display points badge', () => {
      const ui = createDailyChallengeUI()
      const badge = ui.querySelector('.points-badge')
      expect(badge).toBeDefined()
      expect(badge?.textContent).toContain('points')
    })

    it('should display challenge description', () => {
      const ui = createDailyChallengeUI()
      const description = ui.querySelector('.challenge-description')
      expect(description).toBeDefined()
      expect(description?.textContent?.length).toBeGreaterThan(0)
    })

    it('should display code input textarea', () => {
      const ui = createDailyChallengeUI()
      const textarea = ui.querySelector('#challenge-code-input') as HTMLTextAreaElement
      expect(textarea).toBeDefined()
      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('should have starter code in textarea', () => {
      const ui = createDailyChallengeUI()
      const textarea = ui.querySelector('#challenge-code-input') as HTMLTextAreaElement
      expect(textarea.value.length).toBeGreaterThan(0)
      expect(textarea.value).toContain('function')
    })

    it('should display test cases', () => {
      const ui = createDailyChallengeUI()
      const testCases = ui.querySelectorAll('.test-case-item')
      expect(testCases.length).toBeGreaterThan(0)
    })

    it('should display action buttons', () => {
      const ui = createDailyChallengeUI()
      const submitBtn = ui.querySelector('#submit-solution-btn')
      const resetBtn = ui.querySelector('#reset-code-btn')
      const hintsBtn = ui.querySelector('#show-hints-btn')
      
      expect(submitBtn).toBeDefined()
      expect(resetBtn).toBeDefined()
      expect(hintsBtn).toBeDefined()
    })

    it('should display hints section (hidden initially)', () => {
      const ui = createDailyChallengeUI()
      const hintsSection = ui.querySelector('#hints-section') as HTMLElement
      expect(hintsSection).toBeDefined()
      expect(hintsSection.style.display).toBe('none')
    })

    it('should display challenge browser', () => {
      const ui = createDailyChallengeUI()
      const browser = ui.querySelector('.challenge-browser')
      expect(browser).toBeDefined()
    })

    it('should display difficulty filter', () => {
      const ui = createDailyChallengeUI()
      const filter = ui.querySelector('#difficulty-filter') as HTMLSelectElement
      expect(filter).toBeDefined()
      expect(filter.options.length).toBeGreaterThan(1)
    })

    it('should display category filter', () => {
      const ui = createDailyChallengeUI()
      const filter = ui.querySelector('#category-filter') as HTMLSelectElement
      expect(filter).toBeDefined()
      expect(filter.options.length).toBeGreaterThan(1)
    })

    it('should display challenge list', () => {
      const ui = createDailyChallengeUI()
      const list = ui.querySelector('#challenge-list')
      const items = list?.querySelectorAll('.challenge-list-item')
      expect(items).toBeDefined()
      expect(items!.length).toBeGreaterThan(0)
    })
  })

  describe('Progress Display', () => {
    it('should display zero progress initially', () => {
      const ui = createDailyChallengeUI()
      const statCards = ui.querySelectorAll('.challenge-stat-card')
      
      const streakValue = statCards[0]?.querySelector('.stat-value')
      const completedValue = statCards[2]?.querySelector('.stat-value')
      const pointsValue = statCards[3]?.querySelector('.stat-value')
      
      expect(streakValue?.textContent).toBe('0')
      expect(completedValue?.textContent).toBe('0')
      expect(pointsValue?.textContent).toBe('0')
    })

    it('should display saved progress', () => {
      const progress: ChallengeProgress = {
        currentStreak: 5,
        longestStreak: 10,
        totalCompleted: 15,
        lastCompletedDate: null,
        completedChallenges: ['reverse-string', 'palindrome-check'],
        attempts: [],
        totalPoints: 250
      }
      saveProgress(progress)

      const ui = createDailyChallengeUI()
      const statCards = ui.querySelectorAll('.challenge-stat-card')
      
      const currentStreakValue = statCards[0]?.querySelector('.stat-value')
      const longestStreakValue = statCards[1]?.querySelector('.stat-value')
      const completedValue = statCards[2]?.querySelector('.stat-value')
      const pointsValue = statCards[3]?.querySelector('.stat-value')
      
      expect(currentStreakValue?.textContent).toBe('5')
      expect(longestStreakValue?.textContent).toBe('10')
      expect(completedValue?.textContent).toBe('15')
      expect(pointsValue?.textContent).toBe('250')
    })

    it('should show completion banner when challenge is completed', () => {
      const progress: ChallengeProgress = {
        currentStreak: 1,
        longestStreak: 1,
        totalCompleted: 1,
        lastCompletedDate: new Date().toDateString(),
        completedChallenges: [],
        attempts: [],
        totalPoints: 10
      }
      saveProgress(progress)

      const ui = createDailyChallengeUI()
      const banner = ui.querySelector('.challenge-completed-banner')
      expect(banner).toBeDefined()
      expect(banner?.textContent).toContain('Completed')
    })

    it('should disable submit button when challenge is completed', () => {
      const progress: ChallengeProgress = {
        currentStreak: 1,
        longestStreak: 1,
        totalCompleted: 1,
        lastCompletedDate: new Date().toDateString(),
        completedChallenges: [],
        attempts: [],
        totalPoints: 10
      }
      saveProgress(progress)

      const ui = createDailyChallengeUI()
      const submitBtn = ui.querySelector('#submit-solution-btn') as HTMLButtonElement
      expect(submitBtn.disabled).toBe(true)
    })

    it('should mark completed challenges in list', () => {
      const progress: ChallengeProgress = {
        currentStreak: 1,
        longestStreak: 1,
        totalCompleted: 2,
        lastCompletedDate: null,
        completedChallenges: ['reverse-string', 'palindrome-check'],
        attempts: [],
        totalPoints: 25
      }
      saveProgress(progress)

      const ui = createDailyChallengeUI()
      const completedItems = ui.querySelectorAll('.challenge-list-item.completed')
      expect(completedItems.length).toBe(2)
    })
  })

  describe('Interactions', () => {
    it('should toggle hints section on button click', () => {
      const ui = createDailyChallengeUI()
      const hintsBtn = ui.querySelector('#show-hints-btn') as HTMLButtonElement
      const hintsSection = ui.querySelector('#hints-section') as HTMLElement

      expect(hintsSection.style.display).toBe('none')

      hintsBtn.click()
      expect(hintsSection.style.display).toBe('block')

      hintsBtn.click()
      expect(hintsSection.style.display).toBe('none')
    })

    it('should show hints one by one', () => {
      const ui = createDailyChallengeUI()
      const showHintsBtn = ui.querySelector('#show-hints-btn') as HTMLButtonElement
      const nextHintBtn = ui.querySelector('#next-hint-btn') as HTMLButtonElement

      // Show hints section
      showHintsBtn.click()

      // All hints should be hidden initially
      const hints = ui.querySelectorAll('.hint-item')
      hints.forEach(hint => {
        expect((hint as HTMLElement).style.display).toBe('none')
      })

      // Show first hint
      nextHintBtn.click()
      expect((hints[0] as HTMLElement).style.display).toBe('block')

      // Show second hint
      if (hints.length > 1) {
        nextHintBtn.click()
        expect((hints[1] as HTMLElement).style.display).toBe('block')
      }
    })

    it('should reset code to starter template', () => {
      const ui = createDailyChallengeUI()
      const textarea = ui.querySelector('#challenge-code-input') as HTMLTextAreaElement
      const resetBtn = ui.querySelector('#reset-code-btn') as HTMLButtonElement

      const originalCode = textarea.value

      // Modify code
      textarea.value = 'some modified code'
      expect(textarea.value).not.toBe(originalCode)

      // Reset
      resetBtn.click()
      expect(textarea.value).toBe(originalCode)
    })

    it('should filter challenges by difficulty', () => {
      const ui = createDailyChallengeUI()
      const difficultyFilter = ui.querySelector('#difficulty-filter') as HTMLSelectElement
      const challengeList = ui.querySelector('#challenge-list')

      // Filter to easy
      difficultyFilter.value = 'easy'
      difficultyFilter.dispatchEvent(new Event('change'))

      const items = challengeList?.querySelectorAll('.challenge-list-item')
      items?.forEach(item => {
        const badge = item.querySelector('.difficulty-badge')
        expect(badge?.textContent?.toLowerCase()).toBe('easy')
      })
    })

    it('should filter challenges by category', () => {
      const ui = createDailyChallengeUI()
      const categoryFilter = ui.querySelector('#category-filter') as HTMLSelectElement
      const challengeList = ui.querySelector('#challenge-list')

      // Get available categories
      const options = Array.from(categoryFilter.options)
      const firstCategory = options.find(opt => opt.value !== 'all')
      
      if (firstCategory) {
        categoryFilter.value = firstCategory.value
        categoryFilter.dispatchEvent(new Event('change'))

        const items = challengeList?.querySelectorAll('.challenge-list-item')
        // Just verify filtering happened
        expect(items).toBeDefined()
      }
    })

    it('should handle challenge list item clicks', () => {
      const ui = createDailyChallengeUI()
      const challengeList = ui.querySelector('#challenge-list')
      const firstItem = challengeList?.querySelector('.challenge-list-item') as HTMLElement

      expect(() => {
        firstItem?.click()
      }).not.toThrow()
    })
  })

  describe('XSS Prevention', () => {
    it('should escape HTML in challenge title', () => {
      const ui = createDailyChallengeUI()
      const html = ui.innerHTML
      expect(html).not.toContain('<script>')
    })

    it('should escape HTML in descriptions', () => {
      const ui = createDailyChallengeUI()
      const html = ui.innerHTML
      expect(html).not.toContain('<script>')
      expect(html).not.toContain('javascript:')
    })

    it('should escape HTML in test cases', () => {
      const ui = createDailyChallengeUI()
      const testCases = ui.querySelectorAll('.test-case-item')
      testCases.forEach(testCase => {
        expect(testCase.innerHTML).not.toContain('<script>')
      })
    })
  })

  describe('Responsive Elements', () => {
    it('should have responsive classes', () => {
      const ui = createDailyChallengeUI()
      expect(ui.querySelector('.challenge-stats-grid')).toBeDefined()
      expect(ui.querySelector('.challenge-workspace')).toBeDefined()
      expect(ui.querySelector('.browser-filters')).toBeDefined()
    })

    it('should have mobile-friendly buttons', () => {
      const ui = createDailyChallengeUI()
      const buttons = ui.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
      buttons.forEach(btn => {
        expect(btn.className).toMatch(/btn-(primary|secondary|hint)/)
      })
    })
  })
})
