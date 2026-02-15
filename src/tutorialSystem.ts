/**
 * Interactive Tutorial System
 * Provides guided walkthroughs for Chimera features
 */

export interface TutorialStep {
  id: string
  title: string
  content: string
  targetSelector?: string  // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: () => void  // Optional action to perform
  nextButtonText?: string
  skipButtonText?: string
}

export interface Tutorial {
  id: string
  name: string
  description: string
  category: 'beginner' | 'advanced' | 'feature-specific'
  estimatedTime: number  // in minutes
  steps: TutorialStep[]
}

export interface TutorialProgress {
  tutorialId: string
  currentStep: number
  completed: boolean
  lastAccessedAt: number
}

const STORAGE_KEY = 'chimera-tutorial-progress'
const COMPLETED_KEY = 'chimera-completed-tutorials'

/**
 * Available tutorials in the system
 */
export const tutorials: Tutorial[] = [
  {
    id: 'welcome',
    name: 'Welcome to Chimera',
    description: 'A quick introduction to Chimera and its core features',
    category: 'beginner',
    estimatedTime: 3,
    steps: [
      {
        id: 'welcome-1',
        title: 'Welcome to Chimera! 🎉',
        content: 'Chimera is a self-evolving repository that grows every day with new features. This tutorial will help you discover what Chimera can do.',
        nextButtonText: 'Get Started',
      },
      {
        id: 'welcome-2',
        title: 'Evolution Timeline',
        content: 'This timeline shows the complete history of Chimera\'s evolution. Each card represents a feature added on that day. Scroll down to explore how Chimera has grown!',
        targetSelector: '#timeline',
        position: 'top',
        nextButtonText: 'Next',
      },
      {
        id: 'welcome-3',
        title: 'Dashboard & Statistics',
        content: 'The dashboard displays key metrics about Chimera\'s evolution, including total features, activity patterns, and category breakdowns.',
        targetSelector: '#dashboard',
        position: 'top',
        nextButtonText: 'Next',
      },
      {
        id: 'welcome-4',
        title: 'Search & Filter',
        content: 'Use the search bar to find specific features, and filter by category to explore related features together.',
        targetSelector: '#search-container',
        position: 'bottom',
        nextButtonText: 'Next',
      },
      {
        id: 'welcome-5',
        title: 'Command Palette',
        content: 'Press Ctrl+K (or Cmd+K on Mac) to open the command palette. It gives you quick access to all features and actions.',
        nextButtonText: 'Next',
      },
      {
        id: 'welcome-6',
        title: 'Theme Toggle',
        content: 'Switch between light and dark modes using the theme toggle button in the top right corner.',
        targetSelector: '#theme-toggle',
        position: 'bottom',
        nextButtonText: 'Finish',
      },
    ],
  },
  {
    id: 'code-playground',
    name: 'Code Playground Tutorial',
    description: 'Learn how to use the interactive code playground',
    category: 'feature-specific',
    estimatedTime: 5,
    steps: [
      {
        id: 'playground-1',
        title: 'Interactive Code Playground',
        content: 'The Code Playground lets you write, execute, and share code snippets in multiple languages including JavaScript, TypeScript, Python, HTML, and more.',
        targetSelector: '#code-playground',
        position: 'top',
        nextButtonText: 'Next',
      },
      {
        id: 'playground-2',
        title: 'Code Templates',
        content: 'Browse 20+ built-in code templates organized by category (Algorithms, Data Structures, Design Patterns, etc.) to quickly start coding.',
        nextButtonText: 'Next',
      },
      {
        id: 'playground-3',
        title: 'Execute & Share',
        content: 'Run your code to see results, format it for readability, and copy it in multiple formats (Markdown, JSON, HTML). Your snippets are automatically saved.',
        nextButtonText: 'Finish',
      },
    ],
  },
  {
    id: 'advanced-features',
    name: 'Advanced Features',
    description: 'Discover powerful analytics and visualization tools',
    category: 'advanced',
    estimatedTime: 7,
    steps: [
      {
        id: 'advanced-1',
        title: 'Advanced Features Overview',
        content: 'Chimera includes several advanced features for data analysis, visualization, and insights. Let\'s explore them!',
        nextButtonText: 'Next',
      },
      {
        id: 'advanced-2',
        title: 'Impact Graph',
        content: 'The Visual Impact Graph shows how Chimera has grown over time, tracking tests and files added. Hover over data points for details.',
        nextButtonText: 'Next',
      },
      {
        id: 'advanced-3',
        title: 'Prediction Engine',
        content: 'The AI-powered prediction engine analyzes historical patterns and forecasts future feature categories and evolution dates.',
        nextButtonText: 'Next',
      },
      {
        id: 'advanced-4',
        title: 'Dependency Graph',
        content: 'Visualize how features depend on each other and explore the relationship graph to understand the project structure.',
        nextButtonText: 'Next',
      },
      {
        id: 'advanced-5',
        title: 'Export & Backup',
        content: 'Export Chimera\'s data in JSON, CSV, or Markdown formats. The backup system helps you preserve your customizations and settings.',
        nextButtonText: 'Next',
      },
      {
        id: 'advanced-6',
        title: 'Keyboard Shortcuts',
        content: 'Press ? to see all keyboard shortcuts. Master them to navigate Chimera efficiently!',
        nextButtonText: 'Finish',
      },
    ],
  },
  {
    id: 'achievements',
    name: 'Achievements & Gamification',
    description: 'Unlock achievements and track your progress',
    category: 'feature-specific',
    estimatedTime: 4,
    steps: [
      {
        id: 'achievements-1',
        title: 'Achievement System',
        content: 'Chimera includes a gamification layer with 12+ achievements to unlock as you explore and use different features.',
        nextButtonText: 'Next',
      },
      {
        id: 'achievements-2',
        title: 'Track Progress',
        content: 'Your activity is tracked in real-time. The Activity Feed shows all your interactions, and the Performance Metrics monitor usage patterns.',
        nextButtonText: 'Next',
      },
      {
        id: 'achievements-3',
        title: 'Voting System',
        content: 'Vote on features you find useful to help guide future development. Your votes contribute to Chimera\'s evolution!',
        nextButtonText: 'Finish',
      },
    ],
  },
]

/**
 * Get tutorial by ID
 */
export function getTutorialById(id: string): Tutorial | undefined {
  return tutorials.find(t => t.id === id)
}

/**
 * Get tutorials by category
 */
export function getTutorialsByCategory(category: Tutorial['category']): Tutorial[] {
  return tutorials.filter(t => t.category === category)
}

/**
 * Load tutorial progress from localStorage
 */
export function loadTutorialProgress(tutorialId: string): TutorialProgress | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${tutorialId}`)
    if (!stored) return null
    return JSON.parse(stored)
  } catch (error) {
    console.error('Failed to load tutorial progress:', error)
    return null
  }
}

/**
 * Save tutorial progress to localStorage
 */
export function saveTutorialProgress(progress: TutorialProgress): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEY}-${progress.tutorialId}`,
      JSON.stringify(progress)
    )
  } catch (error) {
    console.error('Failed to save tutorial progress:', error)
  }
}

/**
 * Mark tutorial as completed
 */
export function markTutorialCompleted(tutorialId: string): void {
  try {
    const completed = getCompletedTutorials()
    if (!completed.includes(tutorialId)) {
      completed.push(tutorialId)
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed))
    }
    
    // Update progress
    const progress: TutorialProgress = {
      tutorialId,
      currentStep: 0,
      completed: true,
      lastAccessedAt: Date.now(),
    }
    saveTutorialProgress(progress)
  } catch (error) {
    console.error('Failed to mark tutorial as completed:', error)
  }
}

/**
 * Get list of completed tutorial IDs
 */
export function getCompletedTutorials(): string[] {
  try {
    const stored = localStorage.getItem(COMPLETED_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load completed tutorials:', error)
    return []
  }
}

/**
 * Check if tutorial is completed
 */
export function isTutorialCompleted(tutorialId: string): boolean {
  return getCompletedTutorials().includes(tutorialId)
}

/**
 * Reset tutorial progress
 */
export function resetTutorialProgress(tutorialId: string): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY}-${tutorialId}`)
    
    // Remove from completed list
    const completed = getCompletedTutorials()
    const filtered = completed.filter(id => id !== tutorialId)
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to reset tutorial progress:', error)
  }
}

/**
 * Reset all tutorial progress
 */
export function resetAllTutorials(): void {
  try {
    tutorials.forEach(tutorial => {
      localStorage.removeItem(`${STORAGE_KEY}-${tutorial.id}`)
    })
    localStorage.removeItem(COMPLETED_KEY)
  } catch (error) {
    console.error('Failed to reset all tutorials:', error)
  }
}

/**
 * Get tutorial statistics
 */
export function getTutorialStats(): {
  total: number
  completed: number
  inProgress: number
  notStarted: number
} {
  const completed = getCompletedTutorials()
  const inProgress: string[] = []
  
  tutorials.forEach(tutorial => {
    const progress = loadTutorialProgress(tutorial.id)
    if (progress && !progress.completed && progress.currentStep > 0) {
      inProgress.push(tutorial.id)
    }
  })
  
  return {
    total: tutorials.length,
    completed: completed.length,
    inProgress: inProgress.length,
    notStarted: tutorials.length - completed.length - inProgress.length,
  }
}
