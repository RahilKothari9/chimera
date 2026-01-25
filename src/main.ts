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
    
    <div id="prediction-section">
      <p class="loading">Analyzing patterns and generating predictions...</p>
    </div>
    
    <div id="export-section"></div>
    
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
  
  try {
    const allEntries = await fetchChangelog()
    let filteredEntries = allEntries
    
    // Setup statistics dashboard
    const stats = calculateStatistics(allEntries)
    setupDashboard(dashboardContainer, stats)
    
    // Setup impact graph
    setupImpactGraph(allEntries)
    
    // Setup predictions
    const predictions = generatePredictions(allEntries)
    setupPredictionUI(predictionContainer, predictions)
    
    // Setup export UI
    const exportUI = createExportUI(allEntries)
    exportContainer.appendChild(exportUI)
    
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
    console.error('Error loading evolution data:', error)
  }
}

initializeApp()
