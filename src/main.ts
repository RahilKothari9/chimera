import './style.css'
import { fetchChangelog } from './changelogParser.ts'
import { setupTimeline } from './timeline.ts'
import { setupDashboard } from './dashboard.ts'
import { calculateStatistics } from './statistics.ts'
import { filterEntries, type SearchFilters } from './search.ts'
import { createSearchUI, updateResultsCounter } from './searchUI.ts'
import { setupImpactGraph } from './impactGraphUI.ts'
import { generatePredictions } from './predictionEngine.ts'
import { setupPredictionUI } from './predictionUI.ts'
import { createExportUI } from './exportUI.ts'
import { initializeTheme, toggleTheme } from './themeSystem.ts'
import { createThemeToggle } from './themeToggle.ts'
import { calculateAchievements } from './achievementSystem.ts'
import { createAchievementUI } from './achievementUI.ts'
import { getMetricsSummary, calculateHistoricalMetrics, getMetricsInsights } from './codeMetrics.ts'
import { setupMetricsUI } from './metricsUI.ts'
import { createDependencyGraph } from './dependencyGraph.ts'
import { setupDependencyGraphUI } from './dependencyGraphUI.ts'
import { createComparisonUI } from './comparisonUI.ts'
import { getStateFromURL, updateURLState } from './urlStateManager.ts'
import { setupShareButton } from './shareableLinksUI.ts'
import { getGlobalRegistry, initializeKeyboardShortcuts } from './keyboardShortcuts.ts'
import { showCommandPalette } from './commandPalette.ts'
import { showHelpModal } from './helpModal.ts'
import { initNotificationUI } from './notificationUI.ts'
import { setupPerformanceUI } from './performanceUI.ts'
import { createVotingDashboard } from './votingUI.ts'
import { createEvolutionTreeUI } from './evolutionTreeUI.ts'
import { createActivityFeedUI, setupTimeUpdates } from './activityFeedUI.ts'
import { initializeActivityFeed, trackActivity } from './activityFeed.ts'
import { createDataBackupUI } from './dataBackupUI.ts'
import { accessibilityManager } from './accessibilitySystem.ts'
import { AccessibilityDashboardUI } from './accessibilityUI.ts'

// Initialize accessibility features
accessibilityManager.initialize()

// Initialize notification system
initNotificationUI()

// Initialize activity feed
initializeActivityFeed()

// Initialize theme before rendering
initializeTheme()

// Initialize keyboard shortcuts
const shortcutRegistry = getGlobalRegistry()
initializeKeyboardShortcuts(shortcutRegistry)

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div class="chimera-header">
      <h1 class="chimera-title">🧬 CHIMERA</h1>
      <p class="chimera-subtitle">A Self-Evolving Autonomous Repository</p>
      <p class="chimera-description">
        Watch as an AI agent shapes its own destiny, adding features and improvements autonomously.
      </p>
    </div>
    
    <div class="dashboard-section">
      <h2 class="section-title">Evolution Statistics</h2>
      <div id="dashboard" class="dashboard-container">
        <p class="loading">Loading statistics...</p>
      </div>
    </div>
    
    <div id="metrics-section">
      <p class="loading">Analyzing codebase metrics...</p>
    </div>
    
    <div id="performance-section">
      <p class="loading">Collecting performance metrics...</p>
    </div>
    
    <div id="achievement-section">
      <p class="loading">Loading achievements...</p>
    </div>
    
    <div id="prediction-section">
      <p class="loading">Analyzing patterns and generating predictions...</p>
    </div>
    
    <div id="export-section"></div>
    
    <div id="dependency-graph-section">
      <p class="loading">Building dependency graph...</p>
    </div>
    
    <div id="comparison-section">
      <p class="loading">Preparing comparison tools...</p>
    </div>
    
    <div id="voting-section">
      <p class="loading">Loading community engagement...</p>
    </div>
    
    <div id="evolution-tree-section">
      <p class="loading">Building evolution tree...</p>
    </div>
    
    <div id="activity-feed-section">
      <p class="loading">Loading activity feed...</p>
    </div>
    
    <div id="backup-section">
      <p class="loading">Loading backup system...</p>
    </div>
    
    <div id="accessibility-section-container">
      <p class="loading">Loading accessibility system...</p>
    </div>
    
    <div class="evolution-section" id="main-content" tabindex="-1">
      <h2 class="section-title">Evolution Timeline</h2>
      <div id="search-ui"></div>
      <div id="timeline" class="timeline-container">
        <p class="loading">Loading evolution history...</p>
      </div>
    </div>
    
    <footer class="chimera-footer">
      <p>Built with Vite + TypeScript | Evolved by GitHub Copilot</p>
    </footer>
  </div>
`

// Add theme toggle to the page
const themeToggle = createThemeToggle()
document.body.appendChild(themeToggle)

// Setup shareable links button
setupShareButton()

// Register all keyboard shortcuts
function registerKeyboardShortcuts(searchUI: HTMLElement) {
  const registry = getGlobalRegistry()
  
  // Command Palette (Ctrl+K or /)
  registry.addShortcut({
    id: 'open-command-palette',
    name: 'Open Command Palette',
    description: 'Quick access to all commands and features',
    keys: ['ctrl+k', '/'],
    category: 'search',
    handler: () => {
      showCommandPalette({ registry })
    },
  })
  
  // Help Modal (?)
  registry.addShortcut({
    id: 'show-help',
    name: 'Show Keyboard Shortcuts',
    description: 'Display all available keyboard shortcuts',
    keys: ['shift+/'],
    category: 'actions',
    handler: () => {
      showHelpModal({ registry })
    },
  })
  
  // Navigation shortcuts
  registry.addShortcut({
    id: 'nav-dashboard',
    name: 'Go to Dashboard',
    description: 'Scroll to the statistics dashboard',
    keys: ['g+d', 'ctrl+1'],
    category: 'navigation',
    handler: () => {
      document.querySelector('#dashboard')?.scrollIntoView({ behavior: 'smooth' })
      trackActivity('navigation', 'Navigated to Dashboard', 'Used keyboard shortcut')
    },
  })
  
  registry.addShortcut({
    id: 'nav-metrics',
    name: 'Go to Metrics',
    description: 'Scroll to the code metrics section',
    keys: ['g+m', 'ctrl+2'],
    category: 'navigation',
    handler: () => {
      document.querySelector('#metrics-section')?.scrollIntoView({ behavior: 'smooth' })
    },
  })
  
  registry.addShortcut({
    id: 'nav-performance',
    name: 'Go to Performance',
    description: 'Scroll to the performance monitoring section',
    keys: ['g+e'],
    category: 'navigation',
    handler: () => {
      document.querySelector('#performance-section')?.scrollIntoView({ behavior: 'smooth' })
    },
  })
  
  registry.addShortcut({
    id: 'nav-achievements',
    name: 'Go to Achievements',
    description: 'Scroll to the achievements section',
    keys: ['g+a', 'ctrl+3'],
    category: 'navigation',
    handler: () => {
      document.querySelector('#achievement-section')?.scrollIntoView({ behavior: 'smooth' })
    },
  })
  
  registry.addShortcut({
    id: 'nav-predictions',
    name: 'Go to Predictions',
    description: 'Scroll to the predictions section',
    keys: ['g+p', 'ctrl+4'],
    category: 'navigation',
    handler: () => {
      document.querySelector('#prediction-section')?.scrollIntoView({ behavior: 'smooth' })
    },
  })
  
  registry.addShortcut({
    id: 'nav-evolution-tree',
    name: 'Go to Evolution Tree',
    description: 'Scroll to the evolution tree visualization',
    keys: ['g+v', 'ctrl+6'],
    category: 'navigation',
    handler: () => {
      document.querySelector('#evolution-tree-section')?.scrollIntoView({ behavior: 'smooth' })
    },
  })
  
  registry.addShortcut({
    id: 'nav-activity-feed',
    name: 'Go to Activity Feed',
    description: 'Scroll to the activity feed section',
    keys: ['g+f', 'ctrl+7'],
    category: 'navigation',
    handler: () => {
      document.querySelector('#activity-feed-section')?.scrollIntoView({ behavior: 'smooth' })
      trackActivity('navigation', 'Navigated to Activity Feed', 'Used keyboard shortcut')
    },
  })
  
  registry.addShortcut({
    id: 'nav-backup',
    name: 'Go to Backup',
    description: 'Scroll to the data backup section',
    keys: ['g+b', 'ctrl+9'],
    category: 'navigation',
    handler: () => {
      document.querySelector('#backup-section')?.scrollIntoView({ behavior: 'smooth' })
      trackActivity('navigation', 'Navigated to Backup', 'Used keyboard shortcut')
    },
  })
  
  registry.addShortcut({
    id: 'nav-accessibility',
    name: 'Go to Accessibility',
    description: 'Scroll to the accessibility section',
    keys: ['g+x', 'ctrl+8'],
    category: 'navigation',
    handler: () => {
      document.querySelector('#accessibility-section-container')?.scrollIntoView({ behavior: 'smooth' })
      trackActivity('navigation', 'Navigated to Accessibility', 'Used keyboard shortcut')
    },
  })
  
  registry.addShortcut({
    id: 'nav-timeline',
    name: 'Go to Timeline',
    description: 'Scroll to the evolution timeline',
    keys: ['g+t', 'ctrl+0'],
    category: 'navigation',
    handler: () => {
      document.querySelector('#timeline')?.scrollIntoView({ behavior: 'smooth' })
    },
  })
  
  registry.addShortcut({
    id: 'nav-top',
    name: 'Go to Top',
    description: 'Scroll to the top of the page',
    keys: ['g+g'],
    category: 'navigation',
    handler: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
  })
  
  registry.addShortcut({
    id: 'nav-bottom',
    name: 'Go to Bottom',
    description: 'Scroll to the bottom of the page',
    keys: ['shift+g'],
    category: 'navigation',
    handler: () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    },
  })
  
  // Action shortcuts
  registry.addShortcut({
    id: 'toggle-theme',
    name: 'Toggle Theme',
    description: 'Switch between light and dark mode',
    keys: ['ctrl+shift+t'],
    category: 'view',
    handler: () => {
      toggleTheme()
    },
  })
  
  registry.addShortcut({
    id: 'focus-search',
    name: 'Focus Search',
    description: 'Focus the search input',
    keys: ['s'],
    category: 'search',
    handler: () => {
      const searchInput = searchUI.querySelector('input')
      if (searchInput) {
        searchInput.focus()
        searchInput.select()
      }
    },
  })
  
  registry.addShortcut({
    id: 'clear-search',
    name: 'Clear Search',
    description: 'Clear search filters',
    keys: ['escape'],
    category: 'search',
    handler: () => {
      const searchInput = searchUI.querySelector('input') as HTMLInputElement
      if (searchInput && searchInput.value) {
        searchInput.value = ''
        searchInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    },
  })
}

// Load and display the evolution data
async function initializeApp() {
  const dashboardContainer = document.querySelector<HTMLDivElement>('#dashboard')!
  const timelineContainer = document.querySelector<HTMLDivElement>('#timeline')!
  const searchContainer = document.querySelector<HTMLDivElement>('#search-ui')!
  const predictionContainer = document.querySelector<HTMLDivElement>('#prediction-section')!
  const exportContainer = document.querySelector<HTMLDivElement>('#export-section')!
  const achievementContainer = document.querySelector<HTMLDivElement>('#achievement-section')!
  const metricsContainer = document.querySelector<HTMLDivElement>('#metrics-section')!
  const performanceContainer = document.querySelector<HTMLDivElement>('#performance-section')!
  const dependencyGraphContainer = document.querySelector<HTMLDivElement>('#dependency-graph-section')!
  const comparisonContainer = document.querySelector<HTMLDivElement>('#comparison-section')!
  const votingContainer = document.querySelector<HTMLDivElement>('#voting-section')!
  const evolutionTreeContainer = document.querySelector<HTMLDivElement>('#evolution-tree-section')!
  const activityFeedContainer = document.querySelector<HTMLDivElement>('#activity-feed-section')!
  const backupContainer = document.querySelector<HTMLDivElement>('#backup-section')!
  const accessibilityContainer = document.querySelector<HTMLDivElement>('#accessibility-section-container')!
  
  // Get initial state from URL
  const urlState = getStateFromURL()
  
  try {
    const allEntries = await fetchChangelog()
    let filteredEntries = allEntries
    
    // Setup statistics dashboard
    const stats = calculateStatistics(allEntries)
    setupDashboard(dashboardContainer, stats)
    
    // Setup code metrics
    const metricsSummary = getMetricsSummary(allEntries.length)
    const metricsHistory = calculateHistoricalMetrics(allEntries.length)
    const metricsInsights = getMetricsInsights(metricsSummary)
    setupMetricsUI(metricsContainer, metricsSummary, metricsHistory, metricsInsights)
    
    // Setup performance monitoring
    performanceContainer.innerHTML = ''
    setupPerformanceUI(performanceContainer, allEntries.length)
    
    // Setup impact graph
    setupImpactGraph(allEntries)
    
    // Setup achievements
    const achievementData = calculateAchievements(allEntries)
    const achievementUI = createAchievementUI(achievementData)
    achievementContainer.innerHTML = ''
    achievementContainer.appendChild(achievementUI)
    
    // Setup predictions
    const predictions = generatePredictions(allEntries)
    setupPredictionUI(predictionContainer, predictions)
    
    // Setup export UI
    const exportUI = createExportUI(allEntries)
    exportContainer.appendChild(exportUI)
    
    // Setup dependency graph
    const dependencyGraph = createDependencyGraph(allEntries)
    setupDependencyGraphUI(dependencyGraphContainer, dependencyGraph)
    
    // Setup comparison UI
    const comparisonUI = createComparisonUI(allEntries)
    comparisonContainer.innerHTML = ''
    comparisonContainer.appendChild(comparisonUI)
    
    // Setup voting dashboard
    const votingDashboard = createVotingDashboard()
    votingContainer.innerHTML = ''
    votingContainer.appendChild(votingDashboard)
    
    // Setup evolution tree
    const evolutionTreeUI = createEvolutionTreeUI(allEntries)
    evolutionTreeContainer.innerHTML = ''
    evolutionTreeContainer.appendChild(evolutionTreeUI)
    
    // Setup activity feed
    const activityFeedUI = createActivityFeedUI()
    activityFeedContainer.innerHTML = ''
    activityFeedContainer.appendChild(activityFeedUI)
    setupTimeUpdates()
    
    // Setup backup UI
    backupContainer.innerHTML = ''
    createDataBackupUI({
      container: backupContainer,
      onBackupCreated: () => {
        trackActivity('backup', 'Created backup', 'Auto-backup completed')
      },
      onDataRestored: () => {
        trackActivity('backup', 'Restored data', 'Data restored from backup')
      },
      onDataCleared: () => {
        trackActivity('backup', 'Cleared data', 'All data cleared')
      },
    })
    
    // Setup accessibility dashboard
    const accessibilityUI = new AccessibilityDashboardUI()
    accessibilityContainer.innerHTML = ''
    accessibilityUI.render(accessibilityContainer)
    trackActivity('page_view', 'Loaded accessibility system', 'Accessibility features initialized')
    
    // Setup search UI with URL state integration
    const initialFilters: SearchFilters = {
      searchTerm: urlState.searchQuery || '',
      category: urlState.searchCategory || 'all',
    }
    
    const searchUI = createSearchUI({
      onSearchChange: (filters: SearchFilters) => {
        // Filter entries based on search criteria
        filteredEntries = filterEntries(allEntries, filters)
        
        // Update timeline with filtered results
        setupTimeline(timelineContainer, filteredEntries)
        
        // Update results counter
        updateResultsCounter(searchUI, filteredEntries.length, allEntries.length)
        
        // Update URL state
        updateURLState({
          searchQuery: filters.searchTerm,
          searchCategory: filters.category !== 'all' ? filters.category : undefined,
        })
        
        // Track search activity
        if (filters.searchTerm || filters.category !== 'all') {
          trackActivity(
            'search',
            'Searched evolutions',
            `Found ${filteredEntries.length} results${filters.searchTerm ? ` for "${filters.searchTerm}"` : ''}${filters.category !== 'all' ? ` in ${filters.category}` : ''}`,
            { query: filters.searchTerm, category: filters.category, results: filteredEntries.length }
          )
        }
      },
      initialQuery: initialFilters.searchTerm,
      initialCategory: initialFilters.category,
    })
    searchContainer.appendChild(searchUI)
    
    // Apply initial filters from URL
    if (urlState.searchQuery || urlState.searchCategory) {
      filteredEntries = filterEntries(allEntries, initialFilters)
    }
    
    // Setup initial timeline with filtered entries
    setupTimeline(timelineContainer, filteredEntries)
    
    // Initialize results counter
    updateResultsCounter(searchUI, filteredEntries.length, allEntries.length)
    
    // Register keyboard shortcuts
    registerKeyboardShortcuts(searchUI)
  } catch (error) {
    dashboardContainer.innerHTML = '<p class="error">Failed to load statistics</p>'
    timelineContainer.innerHTML = '<p class="error">Failed to load evolution history</p>'
    predictionContainer.innerHTML = '<p class="error">Failed to generate predictions</p>'
    achievementContainer.innerHTML = '<p class="error">Failed to load achievements</p>'
    metricsContainer.innerHTML = '<p class="error">Failed to load metrics</p>'
    dependencyGraphContainer.innerHTML = '<p class="error">Failed to build dependency graph</p>'
    comparisonContainer.innerHTML = '<p class="error">Failed to load comparison tools</p>'
    votingContainer.innerHTML = '<p class="error">Failed to load voting dashboard</p>'
    evolutionTreeContainer.innerHTML = '<p class="error">Failed to build evolution tree</p>'
    console.error('Error loading evolution data:', error)
  }
}

initializeApp()
