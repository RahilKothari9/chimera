/**
 * Tutorial UI Component
 * Creates overlay and interactive tutorial interface
 */

import {
  getTutorialById,
  loadTutorialProgress,
  saveTutorialProgress,
  markTutorialCompleted,
  type Tutorial,
  type TutorialStep,
  type TutorialProgress,
} from './tutorialSystem'

let currentTutorial: Tutorial | null = null
let currentStepIndex = 0
let tutorialOverlay: HTMLDivElement | null = null
let tutorialCard: HTMLDivElement | null = null
let spotlight: HTMLDivElement | null = null

/**
 * Start a tutorial by ID
 */
export function startTutorial(tutorialId: string): void {
  const tutorial = getTutorialById(tutorialId)
  if (!tutorial) {
    console.error(`Tutorial not found: ${tutorialId}`)
    return
  }

  currentTutorial = tutorial
  
  // Load saved progress or start from beginning
  const progress = loadTutorialProgress(tutorialId)
  currentStepIndex = progress && !progress.completed ? progress.currentStep : 0

  renderTutorial()
}

/**
 * Stop the current tutorial
 */
export function stopTutorial(): void {
  if (tutorialOverlay) {
    tutorialOverlay.remove()
    tutorialOverlay = null
  }
  if (spotlight) {
    spotlight.remove()
    spotlight = null
  }
  tutorialCard = null
  currentTutorial = null
  currentStepIndex = 0
}

/**
 * Go to next step
 */
export function nextStep(): void {
  if (!currentTutorial) return

  currentStepIndex++
  
  if (currentStepIndex >= currentTutorial.steps.length) {
    // Tutorial completed
    const tutorialName = currentTutorial.name
    const tutorialId = currentTutorial.id
    markTutorialCompleted(tutorialId)
    stopTutorial()
    showCompletionMessage(tutorialName)
    return
  }

  // Save progress
  const progress: TutorialProgress = {
    tutorialId: currentTutorial.id,
    currentStep: currentStepIndex,
    completed: false,
    lastAccessedAt: Date.now(),
  }
  saveTutorialProgress(progress)

  renderTutorial()
}

/**
 * Go to previous step
 */
export function previousStep(): void {
  if (!currentTutorial || currentStepIndex === 0) return

  currentStepIndex--
  
  // Save progress
  const progress: TutorialProgress = {
    tutorialId: currentTutorial.id,
    currentStep: currentStepIndex,
    completed: false,
    lastAccessedAt: Date.now(),
  }
  saveTutorialProgress(progress)

  renderTutorial()
}

/**
 * Skip the current tutorial
 */
export function skipTutorial(): void {
  if (!currentTutorial) return
  
  const tutorialName = currentTutorial.name
  stopTutorial()
  
  // Show skip notification
  const notification = document.createElement('div')
  notification.className = 'tutorial-notification'
  notification.innerHTML = `
    <p>Tutorial "${tutorialName}" skipped. You can restart it anytime from the command palette.</p>
  `
  document.body.appendChild(notification)
  
  setTimeout(() => notification.remove(), 3000)
}

/**
 * Render the tutorial UI
 */
function renderTutorial(): void {
  if (!currentTutorial) return

  const step = currentTutorial.steps[currentStepIndex]
  
  // Remove existing overlay
  if (tutorialOverlay) {
    tutorialOverlay.remove()
  }
  if (spotlight) {
    spotlight.remove()
  }

  // Create overlay
  tutorialOverlay = document.createElement('div')
  tutorialOverlay.className = 'tutorial-overlay'
  tutorialOverlay.onclick = (e) => {
    if (e.target === tutorialOverlay) {
      skipTutorial()
    }
  }

  // Create spotlight if target exists
  if (step.targetSelector) {
    createSpotlight(step.targetSelector)
  }

  // Create tutorial card
  tutorialCard = createTutorialCard(step, currentStepIndex, currentTutorial.steps.length)
  
  // Position card
  positionTutorialCard(step)

  tutorialOverlay.appendChild(tutorialCard)
  document.body.appendChild(tutorialOverlay)

  // Execute step action if exists
  if (step.action) {
    step.action()
  }
}

/**
 * Create spotlight effect for target element
 */
function createSpotlight(selector: string): void {
  const target = document.querySelector(selector)
  if (!target) return

  const rect = target.getBoundingClientRect()
  
  spotlight = document.createElement('div')
  spotlight.className = 'tutorial-spotlight'
  spotlight.style.top = `${rect.top - 8}px`
  spotlight.style.left = `${rect.left - 8}px`
  spotlight.style.width = `${rect.width + 16}px`
  spotlight.style.height = `${rect.height + 16}px`
  
  document.body.appendChild(spotlight)
  
  // Scroll target into view
  target.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

/**
 * Create tutorial card element
 */
function createTutorialCard(step: TutorialStep, stepIndex: number, totalSteps: number): HTMLDivElement {
  const card = document.createElement('div')
  card.className = 'tutorial-card'
  
  const progressPercent = ((stepIndex + 1) / totalSteps) * 100
  
  card.innerHTML = `
    <div class="tutorial-header">
      <h3>${step.title}</h3>
      <button class="tutorial-close" aria-label="Close tutorial">×</button>
    </div>
    <div class="tutorial-progress">
      <div class="tutorial-progress-bar" style="width: ${progressPercent}%"></div>
    </div>
    <div class="tutorial-content">
      <p>${step.content}</p>
    </div>
    <div class="tutorial-footer">
      <div class="tutorial-step-indicator">
        Step ${stepIndex + 1} of ${totalSteps}
      </div>
      <div class="tutorial-actions">
        ${stepIndex > 0 ? '<button class="tutorial-btn tutorial-btn-secondary tutorial-prev">Previous</button>' : ''}
        <button class="tutorial-btn tutorial-btn-secondary tutorial-skip">${step.skipButtonText || 'Skip'}</button>
        <button class="tutorial-btn tutorial-btn-primary tutorial-next">${step.nextButtonText || 'Next'}</button>
      </div>
    </div>
  `
  
  // Attach event listeners
  const closeBtn = card.querySelector('.tutorial-close')
  closeBtn?.addEventListener('click', skipTutorial)
  
  const skipBtn = card.querySelector('.tutorial-skip')
  skipBtn?.addEventListener('click', skipTutorial)
  
  const nextBtn = card.querySelector('.tutorial-next')
  nextBtn?.addEventListener('click', nextStep)
  
  const prevBtn = card.querySelector('.tutorial-prev')
  prevBtn?.addEventListener('click', previousStep)
  
  return card
}

/**
 * Position tutorial card relative to target or center
 */
function positionTutorialCard(step: TutorialStep): void {
  if (!tutorialCard) return

  if (step.targetSelector) {
    const target = document.querySelector(step.targetSelector)
    if (target) {
      const rect = target.getBoundingClientRect()
      const position = step.position || 'bottom'
      
      // Remove any existing position classes
      tutorialCard.className = 'tutorial-card'
      tutorialCard.classList.add(`tutorial-position-${position}`)
      
      switch (position) {
        case 'top':
          tutorialCard.style.top = `${rect.top - tutorialCard.offsetHeight - 20}px`
          tutorialCard.style.left = `${rect.left + rect.width / 2}px`
          tutorialCard.style.transform = 'translateX(-50%)'
          break
        case 'bottom':
          tutorialCard.style.top = `${rect.bottom + 20}px`
          tutorialCard.style.left = `${rect.left + rect.width / 2}px`
          tutorialCard.style.transform = 'translateX(-50%)'
          break
        case 'left':
          tutorialCard.style.top = `${rect.top + rect.height / 2}px`
          tutorialCard.style.left = `${rect.left - tutorialCard.offsetWidth - 20}px`
          tutorialCard.style.transform = 'translateY(-50%)'
          break
        case 'right':
          tutorialCard.style.top = `${rect.top + rect.height / 2}px`
          tutorialCard.style.left = `${rect.right + 20}px`
          tutorialCard.style.transform = 'translateY(-50%)'
          break
      }
      return
    }
  }
  
  // Center card if no target
  tutorialCard.style.top = '50%'
  tutorialCard.style.left = '50%'
  tutorialCard.style.transform = 'translate(-50%, -50%)'
}

/**
 * Show completion message
 */
function showCompletionMessage(tutorialName: string): void {
  const notification = document.createElement('div')
  notification.className = 'tutorial-notification tutorial-completion'
  notification.innerHTML = `
    <div class="tutorial-completion-content">
      <span class="tutorial-completion-icon">🎉</span>
      <p><strong>Tutorial Completed!</strong></p>
      <p>You've finished "${tutorialName}"</p>
    </div>
  `
  document.body.appendChild(notification)
  
  setTimeout(() => notification.remove(), 4000)
}

/**
 * Create tutorial launcher button
 */
export function createTutorialLauncher(): HTMLButtonElement {
  const button = document.createElement('button')
  button.className = 'tutorial-launcher-btn'
  button.innerHTML = '📚 Tutorials'
  button.setAttribute('aria-label', 'Open tutorials')
  button.onclick = () => {
    showTutorialMenu()
  }
  return button
}

/**
 * Show tutorial selection menu
 */
export function showTutorialMenu(): void {
  const modal = document.createElement('div')
  modal.className = 'tutorial-modal'
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove()
    }
  }
  
  const content = document.createElement('div')
  content.className = 'tutorial-modal-content'
  content.innerHTML = `
    <div class="tutorial-modal-header">
      <h2>Interactive Tutorials</h2>
      <button class="tutorial-modal-close" aria-label="Close">×</button>
    </div>
    <div class="tutorial-modal-body">
      <div id="tutorial-list"></div>
    </div>
  `
  
  const closeBtn = content.querySelector('.tutorial-modal-close')
  closeBtn?.addEventListener('click', () => modal.remove())
  
  modal.appendChild(content)
  document.body.appendChild(modal)
  
  // Render tutorial list (will be implemented in tests)
  const listContainer = content.querySelector('#tutorial-list')
  if (listContainer) {
    renderTutorialList(listContainer as HTMLDivElement)
  }
}

/**
 * Render list of available tutorials
 */
function renderTutorialList(container: HTMLDivElement): void {
  // This will be populated from tutorialSystem
  import('./tutorialSystem').then(({ tutorials, isTutorialCompleted }) => {
    container.innerHTML = tutorials.map(tutorial => {
      const completed = isTutorialCompleted(tutorial.id)
      return `
        <div class="tutorial-list-item ${completed ? 'completed' : ''}">
          <div class="tutorial-list-header">
            <h3>${tutorial.name}</h3>
            <span class="tutorial-badge tutorial-badge-${tutorial.category}">${tutorial.category}</span>
            ${completed ? '<span class="tutorial-completed-badge">✓ Completed</span>' : ''}
          </div>
          <p>${tutorial.description}</p>
          <div class="tutorial-list-footer">
            <span class="tutorial-time">⏱️ ${tutorial.estimatedTime} min</span>
            <button class="tutorial-btn tutorial-btn-primary tutorial-start" data-tutorial-id="${tutorial.id}">
              ${completed ? 'Restart' : 'Start'}
            </button>
          </div>
        </div>
      `
    }).join('')
    
    // Attach event listeners to start buttons
    container.querySelectorAll('.tutorial-start').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tutorialId = (e.target as HTMLElement).dataset.tutorialId
        if (tutorialId) {
          container.closest('.tutorial-modal')?.remove()
          startTutorial(tutorialId)
        }
      })
    })
  })
}

/**
 * Get current tutorial state (for testing)
 */
export function getCurrentTutorial(): { tutorial: Tutorial | null; stepIndex: number } {
  return {
    tutorial: currentTutorial,
    stepIndex: currentStepIndex,
  }
}
