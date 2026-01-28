import { describe, it, expect, beforeEach } from 'vitest'
import { 
  calculateNodePositions,
  generateDependencyPath,
  getDependencyColor,
  getCategoryColor,
  setupDependencyGraphUI
} from './dependencyGraphUI'
import type { DependencyGraph } from './dependencyGraph'

describe('calculateNodePositions', () => {
  it('should return empty array for empty graph', () => {
    const graph: DependencyGraph = { nodes: [], dependencies: [] }
    const positions = calculateNodePositions(graph, 800, 600)
    
    expect(positions).toHaveLength(0)
  })

  it('should position single node at center', () => {
    const graph: DependencyGraph = {
      nodes: [{
        id: 'day-1',
        name: 'Timeline',
        day: "1",
        date: '2026-01-01',
        category: 'Core',
        description: 'Test'
      }],
      dependencies: []
    }
    
    const positions = calculateNodePositions(graph, 800, 600)
    
    expect(positions).toHaveLength(1)
    expect(positions[0].x).toBeDefined()
    expect(positions[0].y).toBeDefined()
  })

  it('should position multiple nodes in circular layout', () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 'day-1', name: 'Feature 1', day: "1", date: '2026-01-01', category: 'Core', description: 'Test' },
        { id: 'day-2', name: 'Feature 2', day: "2", date: '2026-01-02', category: 'Core', description: 'Test' },
        { id: 'day-3', name: 'Feature 3', day: "3", date: '2026-01-03', category: 'Core', description: 'Test' }
      ],
      dependencies: []
    }
    
    const positions = calculateNodePositions(graph, 800, 600)
    
    expect(positions).toHaveLength(3)
    expect(positions[0].x).not.toBe(positions[1].x)
    expect(positions[0].y).not.toBe(positions[1].y)
  })

  it('should preserve node data in positioned nodes', () => {
    const graph: DependencyGraph = {
      nodes: [{
        id: 'day-1',
        name: 'Timeline',
        day: "1",
        date: '2026-01-01',
        category: 'Core Features',
        description: 'Test description'
      }],
      dependencies: []
    }
    
    const positions = calculateNodePositions(graph, 800, 600)
    
    expect(positions[0].id).toBe('day-1')
    expect(positions[0].name).toBe('Timeline')
    expect(positions[0].day).toBe("1")
    expect(positions[0].category).toBe('Core Features')
  })
})

describe('generateDependencyPath', () => {
  it('should generate SVG path between two nodes', () => {
    const from = {
      id: 'day-1',
      name: 'From',
      day: "1",
      date: '2026-01-01',
      category: 'Core',
      description: 'Test',
      x: 100,
      y: 100
    }
    
    const to = {
      id: 'day-2',
      name: 'To',
      day: "2",
      date: '2026-01-02',
      category: 'Core',
      description: 'Test',
      x: 200,
      y: 200
    }
    
    const path = generateDependencyPath(from, to)
    
    expect(path).toContain('M 100,100')
    expect(path).toContain('Q')
    expect(path).toContain('200,200')
  })

  it('should handle same position nodes', () => {
    const node = {
      id: 'day-1',
      name: 'Node',
      day: "1",
      date: '2026-01-01',
      category: 'Core',
      description: 'Test',
      x: 100,
      y: 100
    }
    
    const path = generateDependencyPath(node, node)
    
    expect(path).toBe('M 100,100')
  })
})

describe('getDependencyColor', () => {
  it('should return blue for builds-on', () => {
    expect(getDependencyColor('builds-on')).toBe('#667eea')
  })

  it('should return purple for enhances', () => {
    expect(getDependencyColor('enhances')).toBe('#764ba2')
  })

  it('should return green for uses', () => {
    expect(getDependencyColor('uses')).toBe('#48bb78')
  })
})

describe('getCategoryColor', () => {
  it('should return specific color for known categories', () => {
    expect(getCategoryColor('Visualization')).toBe('#9f7aea')
    expect(getCategoryColor('UI/UX')).toBe('#667eea')
    expect(getCategoryColor('Analytics')).toBe('#f56565')
  })

  it('should return gray for unknown categories', () => {
    expect(getCategoryColor('Unknown Category')).toBe('#718096')
  })

  it('should handle Other category', () => {
    expect(getCategoryColor('Other')).toBe('#718096')
  })
})

describe('setupDependencyGraphUI', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
  })

  it('should create header with title', () => {
    const graph: DependencyGraph = { nodes: [], dependencies: [] }
    setupDependencyGraphUI(container, graph)
    
    const header = container.querySelector('.dependency-graph-header')
    expect(header).toBeTruthy()
    
    const title = header?.querySelector('h2')
    expect(title?.textContent).toContain('Feature Dependency Graph')
  })

  it('should create subtitle', () => {
    const graph: DependencyGraph = { nodes: [], dependencies: [] }
    setupDependencyGraphUI(container, graph)
    
    const subtitle = container.querySelector('.dependency-graph-subtitle')
    expect(subtitle).toBeTruthy()
    expect(subtitle?.textContent).toContain('features build upon')
  })

  it('should display stats cards', () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 'day-1', name: 'Feature 1', day: "1", date: '2026-01-01', category: 'Core', description: 'Test' },
        { id: 'day-2', name: 'Feature 2', day: "2", date: '2026-01-02', category: 'Core', description: 'Test' }
      ],
      dependencies: []
    }
    
    setupDependencyGraphUI(container, graph)
    
    const statsContainer = container.querySelector('.dependency-stats')
    expect(statsContainer).toBeTruthy()
    
    const statCards = statsContainer?.querySelectorAll('.stat-card')
    expect(statCards?.length).toBe(4) // Features, Dependencies, Avg Connections, Categories
  })

  it('should display correct number of features in stats', () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 'day-1', name: 'Feature 1', day: "1", date: '2026-01-01', category: 'Core', description: 'Test' },
        { id: 'day-2', name: 'Feature 2', day: "2", date: '2026-01-02', category: 'Core', description: 'Test' }
      ],
      dependencies: []
    }
    
    setupDependencyGraphUI(container, graph)
    
    const statsContainer = container.querySelector('.dependency-stats')
    const statValues = statsContainer?.querySelectorAll('.stat-value')
    
    expect(statValues?.[0].textContent).toBe('2') // 2 features
  })

  it('should create SVG graph container', () => {
    const graph: DependencyGraph = { nodes: [], dependencies: [] }
    setupDependencyGraphUI(container, graph)
    
    const svg = container.querySelector('.dependency-graph-svg')
    expect(svg).toBeTruthy()
    expect(svg?.tagName.toLowerCase()).toBe('svg')
  })

  it('should create nodes for each feature', () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 'day-1', name: 'Feature 1', day: "1", date: '2026-01-01', category: 'Core', description: 'Test' },
        { id: 'day-2', name: 'Feature 2', day: "2", date: '2026-01-02', category: 'UI/UX', description: 'Test' }
      ],
      dependencies: []
    }
    
    setupDependencyGraphUI(container, graph)
    
    const nodes = container.querySelectorAll('.node-group')
    expect(nodes.length).toBe(2)
  })

  it('should create circles for nodes', () => {
    const graph: DependencyGraph = {
      nodes: [{ id: 'day-1', name: 'Feature 1', day: "1", date: '2026-01-01', category: 'Core', description: 'Test' }],
      dependencies: []
    }
    
    setupDependencyGraphUI(container, graph)
    
    const circles = container.querySelectorAll('.node-circle')
    expect(circles.length).toBe(1)
  })

  it('should create text labels for nodes', () => {
    const graph: DependencyGraph = {
      nodes: [{ id: 'day-1', name: 'Feature 1', day: "1", date: '2026-01-01', category: 'Core', description: 'Test' }],
      dependencies: []
    }
    
    setupDependencyGraphUI(container, graph)
    
    const texts = container.querySelectorAll('.node-text')
    expect(texts.length).toBe(1)
    expect(texts[0].textContent).toBe('1')
  })

  it('should create dependency lines', () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 'day-1', name: 'Feature 1', day: "1", date: '2026-01-01', category: 'Core', description: 'Test' },
        { id: 'day-2', name: 'Feature 2', day: "2", date: '2026-01-02', category: 'Core', description: 'Test' }
      ],
      dependencies: [
        { from: 'day-2', to: 'day-1', type: 'builds-on', strength: 0.8 }
      ]
    }
    
    setupDependencyGraphUI(container, graph)
    
    const lines = container.querySelectorAll('.dependency-line')
    expect(lines.length).toBe(1)
  })

  it('should create legend', () => {
    const graph: DependencyGraph = { nodes: [], dependencies: [] }
    setupDependencyGraphUI(container, graph)
    
    const legend = container.querySelector('.dependency-legend')
    expect(legend).toBeTruthy()
    
    const legendTitle = legend?.querySelector('h3')
    expect(legendTitle?.textContent).toBe('Legend')
  })

  it('should show dependency types in legend', () => {
    const graph: DependencyGraph = { nodes: [], dependencies: [] }
    setupDependencyGraphUI(container, graph)
    
    const legend = container.querySelector('.dependency-legend')
    expect(legend?.textContent).toContain('Builds On')
    expect(legend?.textContent).toContain('Enhances')
    expect(legend?.textContent).toContain('Uses')
  })

  it('should show categories in legend', () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 'day-1', name: 'Feature 1', day: "1", date: '2026-01-01', category: 'Visualization', description: 'Test' },
        { id: 'day-2', name: 'Feature 2', day: "2", date: '2026-01-02', category: 'UI/UX', description: 'Test' }
      ],
      dependencies: []
    }
    
    setupDependencyGraphUI(container, graph)
    
    const legend = container.querySelector('.dependency-legend')
    const legendItems = legend?.querySelectorAll('.legend-item')
    
    expect(legendItems?.length).toBeGreaterThan(0)
  })

  it('should create insights section when foundation node exists', () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 'day-1', name: 'Timeline', day: "1", date: '2026-01-01', category: 'Core', description: 'Timeline of evolution' },
        { id: 'day-2', name: 'Statistics', day: "2", date: '2026-01-02', category: 'Analytics', description: 'Statistics analyzing timeline evolution' }
      ],
      dependencies: [
        { from: 'day-2', to: 'day-1', type: 'builds-on', strength: 0.9 }
      ]
    }
    
    setupDependencyGraphUI(container, graph)
    
    const insights = container.querySelector('.dependency-insights')
    expect(insights).toBeTruthy()
  })

  it('should show foundation node name in insights', () => {
    const graph: DependencyGraph = {
      nodes: [
        { id: 'day-1', name: 'Evolution Timeline', day: "1", date: '2026-01-01', category: 'Core', description: 'Timeline of evolution history' },
        { id: 'day-2', name: 'Statistics', day: "2", date: '2026-01-02', category: 'Analytics', description: 'Statistics with timeline evolution' }
      ],
      dependencies: [
        { from: 'day-2', to: 'day-1', type: 'builds-on', strength: 0.9 }
      ]
    }
    
    setupDependencyGraphUI(container, graph)
    
    const insights = container.querySelector('.dependency-insights')
    expect(insights?.textContent).toContain('foundation')
  })

  it('should clear container before rendering', () => {
    container.innerHTML = '<div>Previous content</div>'
    
    const graph: DependencyGraph = { nodes: [], dependencies: [] }
    setupDependencyGraphUI(container, graph)
    
    expect(container.textContent).not.toContain('Previous content')
  })
})
