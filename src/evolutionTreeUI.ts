import { buildEvolutionTree, calculateTreeLayout, getNodesByCategory, type TreeNode } from './evolutionTree.ts'
import type { ChangelogEntry } from './changelogParser.ts'
import { notificationManager } from './notificationSystem.ts'

const CATEGORY_COLORS: Record<string, string> = {
  visualization: '#8b5cf6',
  analytics: '#06b6d4',
  interaction: '#10b981',
  ui: '#f59e0b',
  data: '#ec4899',
  achievement: '#eab308',
  prediction: '#3b82f6',
  community: '#14b8a6',
  dependency: '#6366f1',
  comparison: '#a855f7',
  general: '#6b7280',
}

export function createEvolutionTreeUI(entries: ChangelogEntry[]): HTMLElement {
  const container = document.createElement('div')
  container.className = 'evolution-tree-container'
  
  // Build tree structure
  const roots = buildEvolutionTree(entries)
  const layout = calculateTreeLayout(roots)
  
  // Create header with controls
  const header = document.createElement('div')
  header.className = 'evolution-tree-header'
  header.innerHTML = `
    <div class="evolution-tree-title-row">
      <h2 class="section-title">🌳 Evolution Tree</h2>
      <div class="evolution-tree-controls">
        <select class="evolution-tree-filter" aria-label="Filter by category">
          <option value="all">All Categories</option>
        </select>
        <button class="evolution-tree-zoom-fit" aria-label="Fit to view">
          <span>Fit View</span>
        </button>
      </div>
    </div>
    <p class="evolution-tree-description">
      Explore the evolution tree showing how features build upon each other.
      Each node represents a feature, connected to related developments.
    </p>
  `
  
  // Add category options
  const filterSelect = header.querySelector('.evolution-tree-filter') as HTMLSelectElement
  const byCategory = getNodesByCategory(layout.nodes)
  const categories = Array.from(byCategory.keys()).sort()
  
  categories.forEach(category => {
    const option = document.createElement('option')
    option.value = category
    option.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} (${byCategory.get(category)!.length})`
    filterSelect.appendChild(option)
  })
  
  // Create SVG canvas
  const svgContainer = document.createElement('div')
  svgContainer.className = 'evolution-tree-svg-container'
  
  const padding = 40
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', `0 0 ${layout.width + padding * 2} ${layout.height + padding * 2}`)
  svg.setAttribute('class', 'evolution-tree-svg')
  
  // Create group for zoom/pan
  const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  mainGroup.setAttribute('transform', `translate(${padding}, ${padding})`)
  svg.appendChild(mainGroup)
  
  // Draw connections first (so they appear behind nodes)
  const drawConnections = (node: TreeNode) => {
    node.children.forEach(child => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      
      // Calculate control points for smooth curve
      const startX = node.x + 80 // Center of node
      const startY = node.y + 70 // Bottom of node
      const endX = child.x + 80
      const endY = child.y + 10 // Top of child node
      const midY = (startY + endY) / 2
      
      const pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`
      
      line.setAttribute('d', pathData)
      line.setAttribute('class', 'evolution-tree-connection')
      line.setAttribute('stroke', CATEGORY_COLORS[node.category] || CATEGORY_COLORS.general)
      line.setAttribute('data-parent-category', node.category)
      line.setAttribute('data-child-category', child.category)
      
      mainGroup.appendChild(line)
      
      drawConnections(child)
    })
  }
  
  roots.forEach(drawConnections)
  
  // Draw nodes
  const drawNode = (node: TreeNode) => {
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    nodeGroup.setAttribute('class', 'evolution-tree-node')
    nodeGroup.setAttribute('data-day', node.day.toString())
    nodeGroup.setAttribute('data-category', node.category)
    nodeGroup.setAttribute('transform', `translate(${node.x}, ${node.y})`)
    
    // Node background
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', '160')
    rect.setAttribute('height', '70')
    rect.setAttribute('rx', '8')
    rect.setAttribute('class', 'evolution-tree-node-bg')
    rect.setAttribute('fill', CATEGORY_COLORS[node.category] || CATEGORY_COLORS.general)
    nodeGroup.appendChild(rect)
    
    // Category badge
    const badge = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    badge.setAttribute('x', '5')
    badge.setAttribute('y', '5')
    badge.setAttribute('width', '8')
    badge.setAttribute('height', '8')
    badge.setAttribute('rx', '2')
    badge.setAttribute('class', 'evolution-tree-category-badge')
    nodeGroup.appendChild(badge)
    
    // Day label
    const dayText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    dayText.setAttribute('x', '80')
    dayText.setAttribute('y', '20')
    dayText.setAttribute('class', 'evolution-tree-day')
    dayText.textContent = `Day ${node.day}`
    nodeGroup.appendChild(dayText)
    
    // Feature name (truncated)
    const featureText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    featureText.setAttribute('x', '80')
    featureText.setAttribute('y', '38')
    featureText.setAttribute('class', 'evolution-tree-feature')
    const truncated = node.feature.length > 18 ? node.feature.substring(0, 18) + '...' : node.feature
    featureText.textContent = truncated
    nodeGroup.appendChild(featureText)
    
    // Category label
    const categoryText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    categoryText.setAttribute('x', '80')
    categoryText.setAttribute('y', '56')
    categoryText.setAttribute('class', 'evolution-tree-category')
    categoryText.textContent = node.category
    nodeGroup.appendChild(categoryText)
    
    // Add hover tooltip
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
    title.textContent = `Day ${node.day}: ${node.feature}\n${node.date}\nCategory: ${node.category}\n${node.files.length} files modified`
    nodeGroup.appendChild(title)
    
    // Add click handler
    nodeGroup.style.cursor = 'pointer'
    nodeGroup.addEventListener('click', () => {
      notificationManager.info(`Day ${node.day}: ${node.feature}`)
      
      // Highlight this node and its connections
      document.querySelectorAll('.evolution-tree-node').forEach(n => {
        n.classList.remove('highlighted')
      })
      document.querySelectorAll('.evolution-tree-connection').forEach(c => {
        c.classList.remove('highlighted')
      })
      
      nodeGroup.classList.add('highlighted')
      
      // Highlight connections to/from this node
      document.querySelectorAll(`.evolution-tree-connection[data-parent-category="${node.category}"]`).forEach(c => {
        c.classList.add('highlighted')
      })
    })
    
    mainGroup.appendChild(nodeGroup)
    
    node.children.forEach(drawNode)
  }
  
  roots.forEach(drawNode)
  
  // Stats
  const stats = document.createElement('div')
  stats.className = 'evolution-tree-stats'
  stats.innerHTML = `
    <div class="evolution-tree-stat">
      <span class="evolution-tree-stat-label">Total Features</span>
      <span class="evolution-tree-stat-value">${layout.nodes.length}</span>
    </div>
    <div class="evolution-tree-stat">
      <span class="evolution-tree-stat-label">Categories</span>
      <span class="evolution-tree-stat-value">${categories.length}</span>
    </div>
    <div class="evolution-tree-stat">
      <span class="evolution-tree-stat-label">Max Depth</span>
      <span class="evolution-tree-stat-value">${layout.maxDepth + 1}</span>
    </div>
  `
  
  // Add legend
  const legend = document.createElement('div')
  legend.className = 'evolution-tree-legend'
  legend.innerHTML = '<div class="evolution-tree-legend-title">Categories</div>'
  
  categories.forEach(category => {
    const item = document.createElement('div')
    item.className = 'evolution-tree-legend-item'
    item.innerHTML = `
      <div class="evolution-tree-legend-color" style="background-color: ${CATEGORY_COLORS[category] || CATEGORY_COLORS.general}"></div>
      <span>${category}</span>
    `
    legend.appendChild(item)
  })
  
  // Handle category filter
  filterSelect.addEventListener('change', () => {
    const selectedCategory = filterSelect.value
    
    document.querySelectorAll('.evolution-tree-node').forEach(node => {
      const nodeCategory = node.getAttribute('data-category')
      if (selectedCategory === 'all' || nodeCategory === selectedCategory) {
        node.classList.remove('filtered-out')
      } else {
        node.classList.add('filtered-out')
      }
    })
    
    document.querySelectorAll('.evolution-tree-connection').forEach(conn => {
      const parentCategory = conn.getAttribute('data-parent-category')
      const childCategory = conn.getAttribute('data-child-category')
      
      if (selectedCategory === 'all' || 
          parentCategory === selectedCategory || 
          childCategory === selectedCategory) {
        conn.classList.remove('filtered-out')
      } else {
        conn.classList.add('filtered-out')
      }
    })
    
    notificationManager.success(
      selectedCategory === 'all' 
        ? 'Showing all categories' 
        : `Filtered to ${selectedCategory} category`
    )
  })
  
  // Handle fit view button
  const fitButton = header.querySelector('.evolution-tree-zoom-fit') as HTMLButtonElement
  fitButton.addEventListener('click', () => {
    // Reset any transforms
    mainGroup.setAttribute('transform', `translate(${padding}, ${padding})`)
    notificationManager.success('View reset to fit')
  })
  
  svgContainer.appendChild(svg)
  
  container.appendChild(header)
  container.appendChild(stats)
  container.appendChild(svgContainer)
  container.appendChild(legend)
  
  return container
}
