import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  startTutorial,
  stopTutorial,
  nextStep,
  previousStep,
  skipTutorial,
  createTutorialLauncher,
  showTutorialMenu,
  getCurrentTutorial,
} from './tutorialUI'
import { resetAllTutorials, markTutorialCompleted } from './tutorialSystem'

describe('Tutorial UI', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    localStorage.clear()
    resetAllTutorials()
  })

  afterEach(() => {
    stopTutorial()
    document.body.innerHTML = ''
    localStorage.clear()
  })

  describe('startTutorial', () => {
    it('should start a tutorial', () => {
      startTutorial('welcome')
      
      const overlay = document.querySelector('.tutorial-overlay')
      expect(overlay).toBeTruthy()
    })

    it('should display tutorial card', () => {
      startTutorial('welcome')
      
      const card = document.querySelector('.tutorial-card')
      expect(card).toBeTruthy()
    })

    it('should show tutorial title', () => {
      startTutorial('welcome')
      
      const title = document.querySelector('.tutorial-card h3')
      expect(title?.textContent).toContain('Welcome to Chimera!')
    })

    it('should show tutorial content', () => {
      startTutorial('welcome')
      
      const content = document.querySelector('.tutorial-content p')
      expect(content?.textContent).toBeTruthy()
    })

    it('should show step indicator', () => {
      startTutorial('welcome')
      
      const indicator = document.querySelector('.tutorial-step-indicator')
      expect(indicator?.textContent).toContain('Step 1 of')
    })

    it('should show progress bar', () => {
      startTutorial('welcome')
      
      const progressBar = document.querySelector('.tutorial-progress-bar')
      expect(progressBar).toBeTruthy()
    })

    it('should not show previous button on first step', () => {
      startTutorial('welcome')
      
      const prevBtn = document.querySelector('.tutorial-prev')
      expect(prevBtn).toBeFalsy()
    })

    it('should show next button', () => {
      startTutorial('welcome')
      
      const nextBtn = document.querySelector('.tutorial-next')
      expect(nextBtn).toBeTruthy()
    })

    it('should show skip button', () => {
      startTutorial('welcome')
      
      const skipBtn = document.querySelector('.tutorial-skip')
      expect(skipBtn).toBeTruthy()
    })

    it('should show close button', () => {
      startTutorial('welcome')
      
      const closeBtn = document.querySelector('.tutorial-close')
      expect(closeBtn).toBeTruthy()
    })

    it('should handle non-existent tutorial', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      startTutorial('non-existent')
      
      const overlay = document.querySelector('.tutorial-overlay')
      expect(overlay).toBeFalsy()
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should resume from saved progress', () => {
      startTutorial('welcome')
      nextStep()
      nextStep()
      stopTutorial()
      
      startTutorial('welcome')
      
      const indicator = document.querySelector('.tutorial-step-indicator')
      expect(indicator?.textContent).toContain('Step 3 of')
    })
  })

  describe('stopTutorial', () => {
    it('should remove tutorial overlay', () => {
      startTutorial('welcome')
      stopTutorial()
      
      const overlay = document.querySelector('.tutorial-overlay')
      expect(overlay).toBeFalsy()
    })

    it('should remove spotlight', () => {
      startTutorial('welcome')
      stopTutorial()
      
      const spotlight = document.querySelector('.tutorial-spotlight')
      expect(spotlight).toBeFalsy()
    })

    it('should reset current tutorial state', () => {
      startTutorial('welcome')
      stopTutorial()
      
      const state = getCurrentTutorial()
      expect(state.tutorial).toBeNull()
      expect(state.stepIndex).toBe(0)
    })

    it('should handle stop when no tutorial active', () => {
      expect(() => stopTutorial()).not.toThrow()
    })
  })

  describe('nextStep', () => {
    it('should advance to next step', () => {
      startTutorial('welcome')
      nextStep()
      
      const state = getCurrentTutorial()
      expect(state.stepIndex).toBe(1)
    })

    it('should update step indicator', () => {
      startTutorial('welcome')
      nextStep()
      
      const indicator = document.querySelector('.tutorial-step-indicator')
      expect(indicator?.textContent).toContain('Step 2 of')
    })

    it('should update progress bar', () => {
      startTutorial('welcome')
      const initialProgress = document.querySelector<HTMLElement>('.tutorial-progress-bar')?.style.width
      
      nextStep()
      const newProgress = document.querySelector<HTMLElement>('.tutorial-progress-bar')?.style.width
      
      expect(newProgress).not.toBe(initialProgress)
    })

    it('should show previous button after first step', () => {
      startTutorial('welcome')
      nextStep()
      
      const prevBtn = document.querySelector('.tutorial-prev')
      expect(prevBtn).toBeTruthy()
    })

    it('should complete tutorial on last step', () => {
      startTutorial('welcome')
      const state = getCurrentTutorial()
      const totalSteps = state.tutorial?.steps.length || 0
      
      // Go through all steps
      for (let i = 0; i < totalSteps; i++) {
        nextStep()
      }
      
      const overlay = document.querySelector('.tutorial-overlay')
      expect(overlay).toBeFalsy()
    })

    it('should show completion message', async () => {
      startTutorial('welcome')
      const state = getCurrentTutorial()
      const totalSteps = state.tutorial?.steps.length || 0
      
      for (let i = 0; i < totalSteps; i++) {
        nextStep()
      }
      
      // Wait a bit for completion message
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const notification = document.querySelector('.tutorial-completion')
      expect(notification).toBeTruthy()
    })

    it('should save progress after each step', () => {
      startTutorial('welcome')
      nextStep()
      nextStep()
      
      const state = getCurrentTutorial()
      expect(state.stepIndex).toBe(2)
    })

    it('should handle next when no tutorial active', () => {
      expect(() => nextStep()).not.toThrow()
    })
  })

  describe('previousStep', () => {
    it('should go to previous step', () => {
      startTutorial('welcome')
      nextStep()
      nextStep()
      previousStep()
      
      const state = getCurrentTutorial()
      expect(state.stepIndex).toBe(1)
    })

    it('should update step indicator', () => {
      startTutorial('welcome')
      nextStep()
      nextStep()
      previousStep()
      
      const indicator = document.querySelector('.tutorial-step-indicator')
      expect(indicator?.textContent).toContain('Step 2 of')
    })

    it('should not go before first step', () => {
      startTutorial('welcome')
      previousStep()
      
      const state = getCurrentTutorial()
      expect(state.stepIndex).toBe(0)
    })

    it('should hide previous button on first step', () => {
      startTutorial('welcome')
      nextStep()
      previousStep()
      
      const prevBtn = document.querySelector('.tutorial-prev')
      expect(prevBtn).toBeFalsy()
    })

    it('should save progress', () => {
      startTutorial('welcome')
      nextStep()
      nextStep()
      previousStep()
      stopTutorial()
      
      startTutorial('welcome')
      const state = getCurrentTutorial()
      expect(state.stepIndex).toBe(1)
    })

    it('should handle previous when no tutorial active', () => {
      expect(() => previousStep()).not.toThrow()
    })
  })

  describe('skipTutorial', () => {
    it('should close tutorial', () => {
      startTutorial('welcome')
      skipTutorial()
      
      const overlay = document.querySelector('.tutorial-overlay')
      expect(overlay).toBeFalsy()
    })

    it('should show skip notification', async () => {
      startTutorial('welcome')
      skipTutorial()
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const notification = document.querySelector('.tutorial-notification')
      expect(notification).toBeTruthy()
      expect(notification?.textContent).toContain('skipped')
    })

    it('should handle skip when no tutorial active', () => {
      expect(() => skipTutorial()).not.toThrow()
    })
  })

  describe('Tutorial Card Interactions', () => {
    it('should close tutorial on close button click', () => {
      startTutorial('welcome')
      
      const closeBtn = document.querySelector('.tutorial-close') as HTMLElement
      closeBtn?.click()
      
      const overlay = document.querySelector('.tutorial-overlay')
      expect(overlay).toBeFalsy()
    })

    it('should skip tutorial on skip button click', () => {
      startTutorial('welcome')
      
      const skipBtn = document.querySelector('.tutorial-skip') as HTMLElement
      skipBtn?.click()
      
      const overlay = document.querySelector('.tutorial-overlay')
      expect(overlay).toBeFalsy()
    })

    it('should advance on next button click', () => {
      startTutorial('welcome')
      
      const nextBtn = document.querySelector('.tutorial-next') as HTMLElement
      nextBtn?.click()
      
      const state = getCurrentTutorial()
      expect(state.stepIndex).toBe(1)
    })

    it('should go back on previous button click', () => {
      startTutorial('welcome')
      nextStep()
      
      const prevBtn = document.querySelector('.tutorial-prev') as HTMLElement
      prevBtn?.click()
      
      const state = getCurrentTutorial()
      expect(state.stepIndex).toBe(0)
    })

    it('should close on overlay click', () => {
      startTutorial('welcome')
      
      const overlay = document.querySelector('.tutorial-overlay') as HTMLElement
      overlay?.click()
      
      const overlayAfter = document.querySelector('.tutorial-overlay')
      expect(overlayAfter).toBeFalsy()
    })
  })

  describe('createTutorialLauncher', () => {
    it('should create launcher button', () => {
      const button = createTutorialLauncher()
      
      expect(button).toBeTruthy()
      expect(button.tagName).toBe('BUTTON')
    })

    it('should have correct class', () => {
      const button = createTutorialLauncher()
      
      expect(button.className).toContain('tutorial-launcher-btn')
    })

    it('should have text content', () => {
      const button = createTutorialLauncher()
      
      expect(button.textContent).toContain('Tutorials')
    })

    it('should have aria-label', () => {
      const button = createTutorialLauncher()
      
      expect(button.getAttribute('aria-label')).toBeTruthy()
    })

    it('should open tutorial menu on click', () => {
      const button = createTutorialLauncher()
      document.body.appendChild(button)
      
      button.click()
      
      const modal = document.querySelector('.tutorial-modal')
      expect(modal).toBeTruthy()
    })
  })

  describe('showTutorialMenu', () => {
    it('should show tutorial modal', () => {
      showTutorialMenu()
      
      const modal = document.querySelector('.tutorial-modal')
      expect(modal).toBeTruthy()
    })

    it('should show modal header', () => {
      showTutorialMenu()
      
      const header = document.querySelector('.tutorial-modal-header h2')
      expect(header?.textContent).toContain('Interactive Tutorials')
    })

    it('should show close button', () => {
      showTutorialMenu()
      
      const closeBtn = document.querySelector('.tutorial-modal-close')
      expect(closeBtn).toBeTruthy()
    })

    it('should close on close button click', () => {
      showTutorialMenu()
      
      const closeBtn = document.querySelector('.tutorial-modal-close') as HTMLElement
      closeBtn?.click()
      
      const modal = document.querySelector('.tutorial-modal')
      expect(modal).toBeFalsy()
    })

    it('should close on overlay click', () => {
      showTutorialMenu()
      
      const modal = document.querySelector('.tutorial-modal') as HTMLElement
      modal?.click()
      
      const modalAfter = document.querySelector('.tutorial-modal')
      expect(modalAfter).toBeFalsy()
    })

    it('should not close on content click', () => {
      showTutorialMenu()
      
      const content = document.querySelector('.tutorial-modal-content') as HTMLElement
      content?.click()
      
      const modal = document.querySelector('.tutorial-modal')
      expect(modal).toBeTruthy()
    })
  })

  describe('Spotlight Effect', () => {
    beforeEach(() => {
      // Create target elements for spotlight
      const searchContainer = document.createElement('div')
      searchContainer.id = 'search-container'
      searchContainer.style.position = 'absolute'
      searchContainer.style.top = '100px'
      searchContainer.style.left = '100px'
      searchContainer.style.width = '200px'
      searchContainer.style.height = '50px'
      document.body.appendChild(searchContainer)
    })

    it('should create spotlight for target element', () => {
      startTutorial('welcome')
      
      // Navigate to step with target
      nextStep()
      nextStep()
      nextStep() // Search step
      
      const spotlight = document.querySelector('.tutorial-spotlight')
      expect(spotlight).toBeTruthy()
    })

    it('should not create spotlight when no target', () => {
      startTutorial('welcome')
      
      const spotlight = document.querySelector('.tutorial-spotlight')
      expect(spotlight).toBeFalsy()
    })
  })

  describe('getCurrentTutorial', () => {
    it('should return null when no tutorial active', () => {
      const state = getCurrentTutorial()
      
      expect(state.tutorial).toBeNull()
      expect(state.stepIndex).toBe(0)
    })

    it('should return current tutorial and step', () => {
      startTutorial('welcome')
      nextStep()
      
      const state = getCurrentTutorial()
      
      expect(state.tutorial).toBeTruthy()
      expect(state.tutorial?.id).toBe('welcome')
      expect(state.stepIndex).toBe(1)
    })

    it('should update when tutorial changes', () => {
      startTutorial('welcome')
      const state1 = getCurrentTutorial()
      
      nextStep()
      const state2 = getCurrentTutorial()
      
      expect(state1.stepIndex).toBe(0)
      expect(state2.stepIndex).toBe(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid button clicks', () => {
      startTutorial('welcome')
      
      const nextBtn = document.querySelector('.tutorial-next') as HTMLElement
      nextBtn?.click()
      nextBtn?.click()
      nextBtn?.click()
      
      const state = getCurrentTutorial()
      expect(state.stepIndex).toBeLessThan(10) // Should not overflow
    })

    it('should handle tutorial with single step', () => {
      // Would need a single-step tutorial for this
      // For now, test that last step completion works
      startTutorial('welcome')
      const state = getCurrentTutorial()
      const totalSteps = state.tutorial?.steps.length || 0
      
      for (let i = 0; i < totalSteps; i++) {
        nextStep()
      }
      
      expect(() => nextStep()).not.toThrow()
    })

    it('should handle missing target selector gracefully', () => {
      startTutorial('welcome')
      nextStep() // Step 2 has target selector
      
      // Should not throw even if element doesn't exist
      expect(document.querySelector('.tutorial-card')).toBeTruthy()
    })
  })
})
