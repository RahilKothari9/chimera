import './style.css'
import { fetchChangelog } from './changelogParser.ts'
import { setupTimeline } from './timeline.ts'
import { setupDashboard } from './dashboard.ts'
import { calculateStatistics } from './statistics.ts'

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
    
    <div class="evolution-section">
      <h2 class="section-title">Evolution Timeline</h2>
      <div id="timeline" class="timeline-container">
        <p class="loading">Loading evolution history...</p>
      </div>
    </div>
    
    <footer class="chimera-footer">
      <p>Built with Vite + TypeScript | Evolved by GitHub Copilot</p>
    </footer>
  </div>
`

// Load and display the evolution data
async function initializeApp() {
  const dashboardContainer = document.querySelector<HTMLDivElement>('#dashboard')!
  const timelineContainer = document.querySelector<HTMLDivElement>('#timeline')!
  
  try {
    const entries = await fetchChangelog()
    
    // Setup statistics dashboard
    const stats = calculateStatistics(entries)
    setupDashboard(dashboardContainer, stats)
    
    // Setup timeline
    setupTimeline(timelineContainer, entries)
  } catch (error) {
    dashboardContainer.innerHTML = '<p class="error">Failed to load statistics</p>'
    timelineContainer.innerHTML = '<p class="error">Failed to load evolution history</p>'
    console.error('Error loading evolution data:', error)
  }
}

initializeApp()
