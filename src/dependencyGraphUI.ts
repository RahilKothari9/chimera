import type { DependencyGraph, FeatureNode, FeatureDependency } from './dependencyGraph'
import { getGraphStats } from './dependencyGraph'

export interface GraphPosition {
  x: number
  y: number
}

export interface PositionedNode extends FeatureNode {
  x: number
  y: number
}

/**
 * Calculates positions for nodes in the graph using a force-directed layout
 */
export function calculateNodePositions(graph: DependencyGraph, width: number, height: number): PositionedNode[] {
  const nodes = graph.nodes
  
  if (nodes.length === 0) {
    return []
  }
  
  // Use a simple circular layout based on day order
  const positions: PositionedNode[] = nodes.map((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2
    const radius = Math.min(width, height) * 0.35
    const centerX = width / 2
    const centerY = height / 2
    
    return {
      ...node,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  })
  
  return positions
}

/**
 * Generates SVG path for a curved dependency arrow
 */
export function generateDependencyPath(
  from: PositionedNode,
  to: PositionedNode
): string {
  // Calculate control point for a curved line
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2
  
  // Offset the control point perpendicular to the line
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.sqrt(dx * dx + dy * dy)
  
  if (length === 0) {
    return `M ${from.x},${from.y}`
  }
  
  const offsetX = -dy / length * 20
  const offsetY = dx / length * 20
  
  const controlX = midX + offsetX
  const controlY = midY + offsetY
  
  return `M ${from.x},${from.y} Q ${controlX},${controlY} ${to.x},${to.y}`
}

/**
 * Gets color for a dependency based on its type
 */
export function getDependencyColor(type: FeatureDependency['type']): string {
  switch (type) {
    case 'builds-on':
      return '#667eea' // Blue
    case 'enhances':
      return '#764ba2' // Purple
    case 'uses':
      return '#48bb78' // Green
    default:
      return '#718096' // Gray
  }
}

/**
 * Gets color for a node based on its category
 */
export function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    'Visualization': '#9f7aea',
    'UI/UX': '#667eea',
    'Search & Filter': '#48bb78',
    'Data & Export': '#ed8936',
    'Analytics': '#f56565',
    'Gamification': '#ecc94b',
    'AI & Intelligence': '#805ad5',
    'Core Features': '#4299e1',
    'Other': '#718096'
  }
  
  return colors[category] || colors['Other']
}

/**
 * Sets up the interactive dependency graph visualization
 */
export function setupDependencyGraphUI(container: HTMLElement, graph: DependencyGraph): void {
  container.innerHTML = ''
  
  // Create header
  const header = document.createElement('div')
  header.className = 'dependency-graph-header'
  
  const title = document.createElement('h2')
  title.textContent = '🔗 Feature Dependency Graph'
  header.appendChild(title)
  
  const subtitle = document.createElement('p')
  subtitle.textContent = 'Explore how Chimera\'s features build upon and relate to each other'
  subtitle.className = 'dependency-graph-subtitle'
  header.appendChild(subtitle)
  
  container.appendChild(header)
  
  // Show stats
  const stats = getGraphStats(graph)
  const statsContainer = document.createElement('div')
  statsContainer.className = 'dependency-stats'
  
  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${stats.totalNodes}</div>
      <div class="stat-label">Features</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.totalDependencies}</div>
      <div class="stat-label">Dependencies</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.avgDependencies}</div>
      <div class="stat-label">Avg Connections</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.categories.length}</div>
      <div class="stat-label">Categories</div>
    </div>
  `
  
  container.appendChild(statsContainer)
  
  // Create graph container
  const graphContainer = document.createElement('div')
  graphContainer.className = 'dependency-graph-container'
  
  const width = 800
  const height = 600
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '600')
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  svg.setAttribute('class', 'dependency-graph-svg')
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', 'Feature dependency graph showing relationships between Chimera features')
  
  // Calculate positions
  const positions = calculateNodePositions(graph, width, height)
  
  // Draw dependencies first (so they appear behind nodes)
  const dependenciesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  dependenciesGroup.setAttribute('class', 'dependencies-group')
  
  graph.dependencies.forEach(dep => {
    const fromNode = positions.find(n => n.id === dep.from)
    const toNode = positions.find(n => n.id === dep.to)
    
    if (fromNode && toNode) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', generateDependencyPath(fromNode, toNode))
      path.setAttribute('stroke', getDependencyColor(dep.type))
      path.setAttribute('stroke-width', String(Math.max(2, dep.strength * 3))) // Min 2px for visibility
      path.setAttribute('fill', 'none')
      path.setAttribute('opacity', '0.6')
      path.setAttribute('class', 'dependency-line')
      
      // Add tooltip
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
      title.textContent = `${fromNode.name} ${dep.type} ${toNode.name}`
      path.appendChild(title)
      
      dependenciesGroup.appendChild(path)
    }
  })
  
  svg.appendChild(dependenciesGroup)
  
  // Draw nodes
  const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  nodesGroup.setAttribute('class', 'nodes-group')
  
  positions.forEach(node => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.setAttribute('class', 'node-group')
    group.setAttribute('data-node-id', node.id)
    
    // Node circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', String(node.x))
    circle.setAttribute('cy', String(node.y))
    circle.setAttribute('r', '30')
    circle.setAttribute('fill', getCategoryColor(node.category))
    circle.setAttribute('class', 'node-circle')
    
    group.appendChild(circle)
    
    // Day label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', String(node.x))
    text.setAttribute('y', String(node.y + 5))
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('fill', 'white')
    text.setAttribute('font-size', '14')
    text.setAttribute('font-weight', 'bold')
    text.setAttribute('class', 'node-text')
    text.textContent = String(node.day)
    
    group.appendChild(text)
    
    // Tooltip
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
    title.textContent = `Day ${node.day}: ${node.name}\n${node.category}\n${node.date}`
    group.appendChild(title)
    
    nodesGroup.appendChild(group)
  })
  
  svg.appendChild(nodesGroup)
  graphContainer.appendChild(svg)
  container.appendChild(graphContainer)
  
  // Add legend
  const legend = document.createElement('div')
  legend.className = 'dependency-legend'
  
  legend.innerHTML = `
    <h3>Legend</h3>
    <div class="legend-section">
      <h4>Dependency Types</h4>
      <div class="legend-item">
        <span class="legend-line" style="background: #667eea;"></span>
        <span>Builds On</span>
      </div>
      <div class="legend-item">
        <span class="legend-line" style="background: #764ba2;"></span>
        <span>Enhances</span>
      </div>
      <div class="legend-item">
        <span class="legend-line" style="background: #48bb78;"></span>
        <span>Uses</span>
      </div>
    </div>
    <div class="legend-section">
      <h4>Top Categories</h4>
      ${stats.categories.slice(0, 5).map(cat => `
        <div class="legend-item">
          <span class="legend-circle" style="background: ${getCategoryColor(cat.name)};"></span>
          <span>${cat.name} (${cat.count})</span>
        </div>
      `).join('')}
    </div>
  `
  
  container.appendChild(legend)
  
  // Add insights
  if (stats.foundationNode) {
    const foundationNodeData = graph.nodes.find(n => n.id === stats.foundationNode)
    if (foundationNodeData) {
      const insights = document.createElement('div')
      insights.className = 'dependency-insights'
      insights.innerHTML = `
        <h3>🔍 Insights</h3>
        <p>
          <strong>${foundationNodeData.name}</strong> is the foundation of Chimera's evolution, 
          with <strong>${stats.foundationDependencies}</strong> features building upon it.
        </p>
        <p>
          The codebase has evolved through <strong>${stats.categories.length}</strong> distinct 
          categories, showing diverse architectural growth.
        </p>
      `
      container.appendChild(insights)
    }
  }
}
