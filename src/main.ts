import './style.css'
import { fetchChangelog } from './changelogParser.ts'
import { setupTimeline } from './timeline.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div class="chimera-header">
      <h1 class="chimera-title">🧬 CHIMERA</h1>
      <p class="chimera-subtitle">A Self-Evolving Autonomous Repository</p>
      <p class="chimera-description">
        Watch as an AI agent shapes its own destiny, adding features and improvements autonomously.
      </p>
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

// Load and display the evolution timeline
async function initializeTimeline() {
  const timelineContainer = document.querySelector<HTMLDivElement>('#timeline')!
  
  try {
    const entries = await fetchChangelog()
    setupTimeline(timelineContainer, entries)
  } catch (error) {
    timelineContainer.innerHTML = '<p class="error">Failed to load evolution history</p>'
    console.error('Error loading timeline:', error)
  }
}

initializeTimeline()
