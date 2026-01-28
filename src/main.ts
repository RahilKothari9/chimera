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
import { initializeTheme } from './themeSystem.ts'
import { createThemeToggle } from './themeToggle.ts'
import { calculateAchievements } from './achievementSystem.ts'
import { createAchievementUI } from './achievementUI.ts'
import { getMetricsSummary, calculateHistoricalMetrics, getMetricsInsights } from './codeMetrics.ts'
import { setupMetricsUI } from './metricsUI.ts'
import { createDependencyGraph } from './dependencyGraph.ts'
import { setupDependencyGraphUI } from './dependencyGraphUI.ts'

// Initialize theme before rendering
initializeTheme()

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
    
    <div class="evolution-section">
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

// Load and display the evolution data
async function initializeApp() {
  const dashboardContainer = document.querySelector<HTMLDivElement>('#dashboard')!
  const timelineContainer = document.querySelector<HTMLDivElement>('#timeline')!
  const searchContainer = document.querySelector<HTMLDivElement>('#search-ui')!
  const predictionContainer = document.querySelector<HTMLDivElement>('#prediction-section')!
  const exportContainer = document.querySelector<HTMLDivElement>('#export-section')!
  const achievementContainer = document.querySelector<HTMLDivElement>('#achievement-section')!
  const metricsContainer = document.querySelector<HTMLDivElement>('#metrics-section')!
  const dependencyGraphContainer = document.querySelector<HTMLDivElement>('#dependency-graph-section')!
  
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
    
    // Setup search UI
    const searchUI = createSearchUI({
      onSearchChange: (filters: SearchFilters) => {
        // Filter entries based on search criteria
        filteredEntries = filterEntries(allEntries, filters)
        
        // Update timeline with filtered results
        setupTimeline(timelineContainer, filteredEntries)
        
        // Update results counter
        updateResultsCounter(searchUI, filteredEntries.length, allEntries.length)
      }
    })
    searchContainer.appendChild(searchUI)
    
    // Setup initial timeline with all entries
    setupTimeline(timelineContainer, filteredEntries)
    
    // Initialize results counter
    updateResultsCounter(searchUI, filteredEntries.length, allEntries.length)
  } catch (error) {
    dashboardContainer.innerHTML = '<p class="error">Failed to load statistics</p>'
    timelineContainer.innerHTML = '<p class="error">Failed to load evolution history</p>'
    predictionContainer.innerHTML = '<p class="error">Failed to generate predictions</p>'
    achievementContainer.innerHTML = '<p class="error">Failed to load achievements</p>'
    metricsContainer.innerHTML = '<p class="error">Failed to load metrics</p>'
    dependencyGraphContainer.innerHTML = '<p class="error">Failed to build dependency graph</p>'
    console.error('Error loading evolution data:', error)
  }
}

initializeApp()
