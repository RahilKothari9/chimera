import { describe, it, expect, beforeEach } from 'vitest'
import { createAchievementUI, updateAchievementUI } from './achievementUI'
import type { AchievementData } from './achievementSystem'

describe('achievementUI', () => {
  let mockData: AchievementData

  beforeEach(() => {
    mockData = {
      achievements: [
        {
          id: 'test_achievement',
          name: 'Test Master',
          description: 'Completed all tests',
          icon: '🧪',
          unlocked: true,
          unlockedDate: '2026-01-20',
          category: 'testing',
          requirement: 'Complete 100 tests'
        },
        {
          id: 'locked_achievement',
          name: 'Future Feature',
          description: 'Not yet unlocked',
          icon: '🔮',
          unlocked: false,
          category: 'features',
          requirement: 'Add 10 features'
        }
      ],
      milestones: [
        {
          name: 'Next Test Milestone',
          current: 150,
          target: 200,
          progress: 75,
          category: 'testing'
        }
      ],
      totalUnlocked: 1,
      completionRate: 50
    }
  })

  describe('createAchievementUI', () => {
    it('should create achievement section container', () => {
      const ui = createAchievementUI(mockData)
      
      expect(ui).toBeDefined()
      expect(ui.className).toBe('achievement-section')
    })

    it('should display achievement statistics', () => {
      const ui = createAchievementUI(mockData)
      const html = ui.innerHTML
      
      expect(html).toContain('Achievements &amp; Milestones')
      expect(html).toContain('1') // totalUnlocked
      expect(html).toContain('50%') // completionRate
    })

    it('should create milestone cards', () => {
      const ui = createAchievementUI(mockData)
      const milestoneCards = ui.querySelectorAll('.milestone-card')
      
      expect(milestoneCards.length).toBe(1)
    })

    it('should display milestone progress', () => {
      const ui = createAchievementUI(mockData)
      const html = ui.innerHTML
      
      expect(html).toContain('Next Test Milestone')
      expect(html).toContain('150 / 200')
      expect(html).toContain('75%')
    })

    it('should create achievement cards', () => {
      const ui = createAchievementUI(mockData)
      const achievementCards = ui.querySelectorAll('.achievement-card')
      
      expect(achievementCards.length).toBe(2)
    })

    it('should mark unlocked achievements correctly', () => {
      const ui = createAchievementUI(mockData)
      const unlockedCard = ui.querySelector('.achievement-card.unlocked')
      
      expect(unlockedCard).toBeDefined()
      expect(unlockedCard?.innerHTML).toContain('Test Master')
      expect(unlockedCard?.innerHTML).toContain('🧪')
    })

    it('should mark locked achievements correctly', () => {
      const ui = createAchievementUI(mockData)
      const lockedCard = ui.querySelector('.achievement-card.locked')
      
      expect(lockedCard).toBeDefined()
      expect(lockedCard?.innerHTML).toContain('???')
      expect(lockedCard?.innerHTML).toContain('🔒')
      expect(lockedCard?.innerHTML).toContain('Add 10 features')
    })

    it('should display unlocked date for unlocked achievements', () => {
      const ui = createAchievementUI(mockData)
      const html = ui.innerHTML
      
      expect(html).toContain('Unlocked: 2026-01-20')
    })

    it('should display category badges', () => {
      const ui = createAchievementUI(mockData)
      const categoryBadges = ui.querySelectorAll('.achievement-category')
      
      expect(categoryBadges.length).toBe(2)
      expect(categoryBadges[0].textContent).toContain('testing')
    })

    it('should sort achievements with unlocked first', () => {
      const ui = createAchievementUI(mockData)
      const cards = ui.querySelectorAll('.achievement-card')
      
      // First card should be unlocked
      expect(cards[0].classList.contains('unlocked')).toBe(true)
      // Second card should be locked
      expect(cards[1].classList.contains('locked')).toBe(true)
    })

    it('should handle empty achievements', () => {
      const emptyData: AchievementData = {
        achievements: [],
        milestones: [],
        totalUnlocked: 0,
        completionRate: 0
      }
      
      const ui = createAchievementUI(emptyData)
      
      expect(ui).toBeDefined()
      expect(ui.querySelector('.achievements-grid')).toBeDefined()
    })

    it('should handle empty milestones', () => {
      const dataWithoutMilestones: AchievementData = {
        ...mockData,
        milestones: []
      }
      
      const ui = createAchievementUI(dataWithoutMilestones)
      const milestoneCards = ui.querySelectorAll('.milestone-card')
      
      expect(milestoneCards.length).toBe(0)
    })

    it('should display milestone progress bar correctly', () => {
      const ui = createAchievementUI(mockData)
      const progressFill = ui.querySelector('.milestone-progress-fill') as HTMLElement
      
      expect(progressFill).toBeDefined()
      expect(progressFill.style.width).toBe('75%')
    })

    it('should include section title', () => {
      const ui = createAchievementUI(mockData)
      const title = ui.querySelector('.section-title')
      
      expect(title).toBeDefined()
      expect(title?.textContent).toContain('Achievements & Milestones')
    })

    it('should include milestones title', () => {
      const ui = createAchievementUI(mockData)
      const title = ui.querySelector('.milestones-title')
      
      expect(title).toBeDefined()
      expect(title?.textContent).toContain('Progress Toward Next Milestones')
    })

    it('should add tooltip to locked achievements', () => {
      const ui = createAchievementUI(mockData)
      const lockedCard = ui.querySelector('.achievement-card.locked') as HTMLElement
      
      expect(lockedCard.title).toContain('Requirement: Add 10 features')
    })

    it('should handle multiple milestones', () => {
      const multiMilestoneData: AchievementData = {
        ...mockData,
        milestones: [
          {
            name: 'Milestone 1',
            current: 50,
            target: 100,
            progress: 50,
            category: 'testing'
          },
          {
            name: 'Milestone 2',
            current: 30,
            target: 50,
            progress: 60,
            category: 'evolution'
          }
        ]
      }
      
      const ui = createAchievementUI(multiMilestoneData)
      const milestoneCards = ui.querySelectorAll('.milestone-card')
      
      expect(milestoneCards.length).toBe(2)
    })

    it('should display correct achievement icon for unlocked', () => {
      const ui = createAchievementUI(mockData)
      const unlockedCard = ui.querySelector('.achievement-card.unlocked')
      const icon = unlockedCard?.querySelector('.achievement-icon')
      
      expect(icon?.textContent).toBe('🧪')
    })

    it('should display lock icon for locked achievements', () => {
      const ui = createAchievementUI(mockData)
      const lockedCard = ui.querySelector('.achievement-card.locked')
      const icon = lockedCard?.querySelector('.achievement-icon')
      
      expect(icon?.textContent).toBe('🔒')
    })
  })

  describe('updateAchievementUI', () => {
    it('should update existing container with new data', () => {
      const container = document.createElement('div')
      container.innerHTML = '<p>Old content</p>'
      
      updateAchievementUI(container, mockData)
      
      expect(container.innerHTML).toContain('Achievements &amp; Milestones')
      expect(container.innerHTML).not.toContain('Old content')
    })

    it('should replace all previous content', () => {
      const container = document.createElement('div')
      container.innerHTML = '<div class="old-class">Old</div>'
      
      updateAchievementUI(container, mockData)
      
      const oldElement = container.querySelector('.old-class')
      expect(oldElement).toBeNull()
    })

    it('should create achievement section in container', () => {
      const container = document.createElement('div')
      
      updateAchievementUI(container, mockData)
      
      const achievementSection = container.querySelector('.achievement-section')
      expect(achievementSection).toBeDefined()
    })
  })
})
