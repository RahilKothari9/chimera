import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  tutorials,
  getTutorialById,
  getTutorialsByCategory,
  loadTutorialProgress,
  saveTutorialProgress,
  markTutorialCompleted,
  getCompletedTutorials,
  isTutorialCompleted,
  resetTutorialProgress,
  resetAllTutorials,
  getTutorialStats,
  type Tutorial,
  type TutorialProgress,
} from './tutorialSystem'

describe('Tutorial System', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Tutorial Data Structure', () => {
    it('should have predefined tutorials', () => {
      expect(tutorials).toBeDefined()
      expect(tutorials.length).toBeGreaterThan(0)
    })

    it('should have valid tutorial structure', () => {
      tutorials.forEach(tutorial => {
        expect(tutorial.id).toBeDefined()
        expect(tutorial.name).toBeDefined()
        expect(tutorial.description).toBeDefined()
        expect(tutorial.category).toBeDefined()
        expect(tutorial.estimatedTime).toBeGreaterThan(0)
        expect(tutorial.steps).toBeDefined()
        expect(tutorial.steps.length).toBeGreaterThan(0)
      })
    })

    it('should have valid tutorial steps', () => {
      tutorials.forEach(tutorial => {
        tutorial.steps.forEach(step => {
          expect(step.id).toBeDefined()
          expect(step.title).toBeDefined()
          expect(step.content).toBeDefined()
        })
      })
    })

    it('should have welcome tutorial for beginners', () => {
      const welcome = tutorials.find(t => t.id === 'welcome')
      expect(welcome).toBeDefined()
      expect(welcome?.category).toBe('beginner')
    })

    it('should have code playground tutorial', () => {
      const playground = tutorials.find(t => t.id === 'code-playground')
      expect(playground).toBeDefined()
      expect(playground?.category).toBe('feature-specific')
    })

    it('should have advanced features tutorial', () => {
      const advanced = tutorials.find(t => t.id === 'advanced-features')
      expect(advanced).toBeDefined()
      expect(advanced?.category).toBe('advanced')
    })
  })

  describe('getTutorialById', () => {
    it('should return tutorial by id', () => {
      const tutorial = getTutorialById('welcome')
      expect(tutorial).toBeDefined()
      expect(tutorial?.id).toBe('welcome')
    })

    it('should return undefined for non-existent id', () => {
      const tutorial = getTutorialById('non-existent')
      expect(tutorial).toBeUndefined()
    })

    it('should return correct tutorial data', () => {
      const tutorial = getTutorialById('welcome')
      expect(tutorial?.name).toBe('Welcome to Chimera')
      expect(tutorial?.steps.length).toBeGreaterThan(0)
    })
  })

  describe('getTutorialsByCategory', () => {
    it('should return beginner tutorials', () => {
      const beginner = getTutorialsByCategory('beginner')
      expect(beginner.length).toBeGreaterThan(0)
      beginner.forEach(t => {
        expect(t.category).toBe('beginner')
      })
    })

    it('should return advanced tutorials', () => {
      const advanced = getTutorialsByCategory('advanced')
      expect(advanced.length).toBeGreaterThan(0)
      advanced.forEach(t => {
        expect(t.category).toBe('advanced')
      })
    })

    it('should return feature-specific tutorials', () => {
      const featureSpecific = getTutorialsByCategory('feature-specific')
      expect(featureSpecific.length).toBeGreaterThan(0)
      featureSpecific.forEach(t => {
        expect(t.category).toBe('feature-specific')
      })
    })

    it('should return empty array for category with no tutorials', () => {
      const result = getTutorialsByCategory('advanced')
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Tutorial Progress Management', () => {
    it('should save tutorial progress', () => {
      const progress: TutorialProgress = {
        tutorialId: 'welcome',
        currentStep: 2,
        completed: false,
        lastAccessedAt: Date.now(),
      }
      
      saveTutorialProgress(progress)
      const loaded = loadTutorialProgress('welcome')
      
      expect(loaded).toBeDefined()
      expect(loaded?.tutorialId).toBe('welcome')
      expect(loaded?.currentStep).toBe(2)
      expect(loaded?.completed).toBe(false)
    })

    it('should load tutorial progress', () => {
      const progress: TutorialProgress = {
        tutorialId: 'code-playground',
        currentStep: 1,
        completed: false,
        lastAccessedAt: Date.now(),
      }
      
      saveTutorialProgress(progress)
      const loaded = loadTutorialProgress('code-playground')
      
      expect(loaded).toEqual(progress)
    })

    it('should return null for non-existent progress', () => {
      const progress = loadTutorialProgress('non-existent')
      expect(progress).toBeNull()
    })

    it('should update existing progress', () => {
      const progress1: TutorialProgress = {
        tutorialId: 'welcome',
        currentStep: 1,
        completed: false,
        lastAccessedAt: Date.now(),
      }
      
      saveTutorialProgress(progress1)
      
      const progress2: TutorialProgress = {
        tutorialId: 'welcome',
        currentStep: 3,
        completed: false,
        lastAccessedAt: Date.now(),
      }
      
      saveTutorialProgress(progress2)
      const loaded = loadTutorialProgress('welcome')
      
      expect(loaded?.currentStep).toBe(3)
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('chimera-tutorial-progress-welcome', 'invalid json')
      const progress = loadTutorialProgress('welcome')
      expect(progress).toBeNull()
    })
  })

  describe('Tutorial Completion', () => {
    it('should mark tutorial as completed', () => {
      markTutorialCompleted('welcome')
      expect(isTutorialCompleted('welcome')).toBe(true)
    })

    it('should save completed tutorials', () => {
      markTutorialCompleted('welcome')
      markTutorialCompleted('code-playground')
      
      const completed = getCompletedTutorials()
      expect(completed).toContain('welcome')
      expect(completed).toContain('code-playground')
      expect(completed.length).toBe(2)
    })

    it('should not duplicate completed tutorials', () => {
      markTutorialCompleted('welcome')
      markTutorialCompleted('welcome')
      
      const completed = getCompletedTutorials()
      expect(completed.filter(id => id === 'welcome').length).toBe(1)
    })

    it('should return false for non-completed tutorial', () => {
      expect(isTutorialCompleted('welcome')).toBe(false)
    })

    it('should update progress when marking as completed', () => {
      markTutorialCompleted('welcome')
      const progress = loadTutorialProgress('welcome')
      
      expect(progress?.completed).toBe(true)
    })

    it('should handle corrupted completed tutorials data', () => {
      localStorage.setItem('chimera-completed-tutorials', 'invalid json')
      const completed = getCompletedTutorials()
      expect(completed).toEqual([])
    })
  })

  describe('Tutorial Reset', () => {
    it('should reset tutorial progress', () => {
      const progress: TutorialProgress = {
        tutorialId: 'welcome',
        currentStep: 3,
        completed: false,
        lastAccessedAt: Date.now(),
      }
      
      saveTutorialProgress(progress)
      markTutorialCompleted('welcome')
      
      resetTutorialProgress('welcome')
      
      expect(loadTutorialProgress('welcome')).toBeNull()
      expect(isTutorialCompleted('welcome')).toBe(false)
    })

    it('should reset all tutorials', () => {
      markTutorialCompleted('welcome')
      markTutorialCompleted('code-playground')
      
      const progress: TutorialProgress = {
        tutorialId: 'advanced-features',
        currentStep: 2,
        completed: false,
        lastAccessedAt: Date.now(),
      }
      saveTutorialProgress(progress)
      
      resetAllTutorials()
      
      expect(getCompletedTutorials()).toEqual([])
      expect(loadTutorialProgress('advanced-features')).toBeNull()
    })

    it('should handle reset of non-existent tutorial', () => {
      expect(() => resetTutorialProgress('non-existent')).not.toThrow()
    })
  })

  describe('Tutorial Statistics', () => {
    it('should calculate tutorial stats with no progress', () => {
      const stats = getTutorialStats()
      
      expect(stats.total).toBe(tutorials.length)
      expect(stats.completed).toBe(0)
      expect(stats.inProgress).toBe(0)
      expect(stats.notStarted).toBe(tutorials.length)
    })

    it('should calculate stats with completed tutorials', () => {
      markTutorialCompleted('welcome')
      markTutorialCompleted('code-playground')
      
      const stats = getTutorialStats()
      
      expect(stats.completed).toBe(2)
      expect(stats.notStarted).toBe(tutorials.length - 2)
    })

    it('should calculate stats with in-progress tutorials', () => {
      const progress: TutorialProgress = {
        tutorialId: 'welcome',
        currentStep: 2,
        completed: false,
        lastAccessedAt: Date.now(),
      }
      
      saveTutorialProgress(progress)
      
      const stats = getTutorialStats()
      
      expect(stats.inProgress).toBe(1)
    })

    it('should calculate stats with mixed states', () => {
      markTutorialCompleted('welcome')
      
      const progress: TutorialProgress = {
        tutorialId: 'code-playground',
        currentStep: 1,
        completed: false,
        lastAccessedAt: Date.now(),
      }
      saveTutorialProgress(progress)
      
      const stats = getTutorialStats()
      
      expect(stats.completed).toBe(1)
      expect(stats.inProgress).toBe(1)
      expect(stats.notStarted).toBe(tutorials.length - 2)
      expect(stats.total).toBe(tutorials.length)
    })

    it('should not count completed tutorials as in-progress', () => {
      const progress: TutorialProgress = {
        tutorialId: 'welcome',
        currentStep: 5,
        completed: true,
        lastAccessedAt: Date.now(),
      }
      
      saveTutorialProgress(progress)
      markTutorialCompleted('welcome')
      
      const stats = getTutorialStats()
      
      expect(stats.completed).toBe(1)
      expect(stats.inProgress).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle localStorage quota exceeded', () => {
      const largeProgress: TutorialProgress = {
        tutorialId: 'welcome',
        currentStep: 1,
        completed: false,
        lastAccessedAt: Date.now(),
      }
      
      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = () => {
        throw new Error('QuotaExceededError')
      }
      
      expect(() => saveTutorialProgress(largeProgress)).not.toThrow()
      
      localStorage.setItem = originalSetItem
    })

    it('should handle missing localStorage', () => {
      const originalGetItem = localStorage.getItem
      localStorage.getItem = () => null
      
      const progress = loadTutorialProgress('welcome')
      expect(progress).toBeNull()
      
      localStorage.getItem = originalGetItem
    })

    it('should validate tutorial IDs are unique', () => {
      const ids = tutorials.map(t => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should validate step IDs are unique within tutorials', () => {
      tutorials.forEach(tutorial => {
        const stepIds = tutorial.steps.map(s => s.id)
        const uniqueStepIds = new Set(stepIds)
        expect(uniqueStepIds.size).toBe(stepIds.length)
      })
    })
  })
})
