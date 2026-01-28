import { describe, it, expect } from 'vitest'
import { 
  categorizeFeature, 
  detectDependencies, 
  createDependencyGraph, 
  getGraphStats 
} from './dependencyGraph'
import type { ChangelogEntry } from './changelogParser'

describe('categorizeFeature', () => {
  it('should categorize visualization features', () => {
    expect(categorizeFeature('Visual Impact Graph', 'graph showing data')).toBe('Visualization')
    expect(categorizeFeature('Chart System', 'chart visualization')).toBe('Visualization')
  })

  it('should categorize UI/UX features', () => {
    expect(categorizeFeature('Theme System', 'dark light mode toggle')).toBe('UI/UX')
    expect(categorizeFeature('UI Improvements', 'better user interface')).toBe('UI/UX')
  })

  it('should categorize search features', () => {
    expect(categorizeFeature('Search System', 'search and filter')).toBe('Search & Filter')
    expect(categorizeFeature('Filter Feature', 'filter entries')).toBe('Search & Filter')
  })

  it('should categorize data features', () => {
    expect(categorizeFeature('Data Export', 'export data to JSON')).toBe('Data & Export')
    expect(categorizeFeature('Export System', 'data export')).toBe('Data & Export')
  })

  it('should categorize analytics features', () => {
    expect(categorizeFeature('Statistics Dashboard', 'metrics and stats')).toBe('Analytics')
    expect(categorizeFeature('Code Metrics', 'metric tracking')).toBe('Analytics')
  })

  it('should categorize gamification features', () => {
    expect(categorizeFeature('Achievement System', 'achievement tracking')).toBe('Gamification')
    expect(categorizeFeature('Milestones', 'milestone features')).toBe('Gamification')
  })

  it('should categorize AI features', () => {
    expect(categorizeFeature('Prediction Engine', 'AI-powered predictions')).toBe('AI & Intelligence')
    expect(categorizeFeature('Forecasting', 'forecast future trends')).toBe('AI & Intelligence')
  })

  it('should categorize core features', () => {
    expect(categorizeFeature('Evolution Timeline', 'timeline of history')).toBe('Core Features')
    expect(categorizeFeature('History Tracker', 'tracking history over time')).toBe('Core Features')
  })

  it('should default to Other for unknown features', () => {
    expect(categorizeFeature('Random Feature', 'something unique')).toBe('Other')
  })
})

describe('detectDependencies', () => {
  it('should detect no dependencies for a single entry', () => {
    const entries: ChangelogEntry[] = [
      {
        day: "1",
        date: '2026-01-01',
        feature: 'Timeline',
        description: 'Timeline tracker',
        filesModified: ''
      }
    ]
    
    const deps = detectDependencies(entries)
    expect(deps).toHaveLength(0)
  })

  it('should detect dependencies when statistics builds on timeline', () => {
    const entries: ChangelogEntry[] = [
      {
        day: "1",
        date: '2026-01-01',
        feature: 'Evolution Timeline',
        description: 'Timeline tracker for evolution',
        filesModified: ''
      },
      {
        day: "2",
        date: '2026-01-02',
        feature: 'Statistics Dashboard',
        description: 'Dashboard analyzing timeline evolution data',
        filesModified: ''
      }
    ]
    
    const deps = detectDependencies(entries)
    expect(deps.length).toBeGreaterThan(0)
    
    const statsDep = deps.find(d => d.from === 'day-2' && d.to === 'day-1')
    expect(statsDep).toBeDefined()
    expect(statsDep?.type).toBe('builds-on')
  })

  it('should detect search enhancing timeline', () => {
    const entries: ChangelogEntry[] = [
      {
        day: "1",
        date: '2026-01-01',
        feature: 'Timeline',
        description: 'Timeline of evolution',
        filesModified: ''
      },
      {
        day: "3",
        date: '2026-01-03',
        feature: 'Search System',
        description: 'Search the timeline entries',
        filesModified: ''
      }
    ]
    
    const deps = detectDependencies(entries)
    const searchDep = deps.find(d => d.from === 'day-3')
    
    expect(searchDep).toBeDefined()
    expect(searchDep?.type).toBe('enhances')
  })

  it('should detect prediction using statistics', () => {
    const entries: ChangelogEntry[] = [
      {
        day: "1",
        date: '2026-01-01',
        feature: 'Timeline',
        description: 'Timeline tracker',
        filesModified: ''
      },
      {
        day: "2",
        date: '2026-01-02',
        feature: 'Statistics',
        description: 'Statistics dashboard',
        filesModified: ''
      },
      {
        day: "5",
        date: '2026-01-05',
        feature: 'AI Prediction',
        description: 'AI-powered prediction engine',
        filesModified: ''
      }
    ]
    
    const deps = detectDependencies(entries)
    const predictionDeps = deps.filter(d => d.from === 'day-5')
    
    expect(predictionDeps.length).toBeGreaterThan(0)
    expect(predictionDeps.some(d => d.type === 'uses')).toBe(true)
  })

  it('should not create dependencies to future features', () => {
    const entries: ChangelogEntry[] = [
      {
        day: "2",
        date: '2026-01-02',
        feature: 'Statistics Dashboard',
        description: 'Dashboard with timeline',
        filesModified: ''
      },
      {
        day: "1",
        date: '2026-01-01',
        feature: 'Timeline',
        description: 'Timeline tracker',
        filesModified: ''
      }
    ]
    
    const deps = detectDependencies(entries)
    // Stats at day 2 should depend on timeline at day 1, but not vice versa
    const invalidDep = deps.find(d => d.from === 'day-1' && d.to === 'day-2')
    expect(invalidDep).toBeUndefined()
  })
})

describe('createDependencyGraph', () => {
  it('should create nodes for all entries', () => {
    const entries: ChangelogEntry[] = [
      {
        day: "1",
        date: '2026-01-01',
        feature: 'Timeline',
        description: 'Timeline tracker',
        filesModified: ''
      },
      {
        day: "2",
        date: '2026-01-02',
        feature: 'Statistics',
        description: 'Stats dashboard',
        filesModified: ''
      }
    ]
    
    const graph = createDependencyGraph(entries)
    
    expect(graph.nodes).toHaveLength(2)
    expect(graph.nodes[0].id).toBe('day-1')
    expect(graph.nodes[0].name).toBe('Timeline')
    expect(graph.nodes[1].id).toBe('day-2')
    expect(graph.nodes[1].name).toBe('Statistics')
  })

  it('should assign categories to nodes', () => {
    const entries: ChangelogEntry[] = [
      {
        day: "1",
        date: '2026-01-01',
        feature: 'Timeline',
        description: 'Timeline of history',
        filesModified: ''
      }
    ]
    
    const graph = createDependencyGraph(entries)
    
    expect(graph.nodes[0].category).toBe('Core Features')
  })

  it('should include dependencies in the graph', () => {
    const entries: ChangelogEntry[] = [
      {
        day: "1",
        date: '2026-01-01',
        feature: 'Timeline',
        description: 'Timeline tracker',
        filesModified: ''
      },
      {
        day: "2",
        date: '2026-01-02',
        feature: 'Statistics',
        description: 'Statistics analyzing evolution timeline',
        filesModified: ''
      }
    ]
    
    const graph = createDependencyGraph(entries)
    
    expect(graph.dependencies.length).toBeGreaterThan(0)
  })

  it('should handle empty entries', () => {
    const graph = createDependencyGraph([])
    
    expect(graph.nodes).toHaveLength(0)
    expect(graph.dependencies).toHaveLength(0)
  })
})

describe('getGraphStats', () => {
  it('should calculate total nodes and dependencies', () => {
    const entries: ChangelogEntry[] = [
      {
        day: "1",
        date: '2026-01-01',
        feature: 'Timeline',
        description: 'Timeline tracker',
        filesModified: ''
      },
      {
        day: "2",
        date: '2026-01-02',
        feature: 'Statistics',
        description: 'Statistics dashboard with timeline',
        filesModified: ''
      }
    ]
    
    const graph = createDependencyGraph(entries)
    const stats = getGraphStats(graph)
    
    expect(stats.totalNodes).toBe(2)
    expect(stats.totalDependencies).toBeGreaterThanOrEqual(0)
  })

  it('should calculate average dependencies', () => {
    const entries: ChangelogEntry[] = [
      {
        day: "1",
        date: '2026-01-01',
        feature: 'Timeline',
        description: 'Timeline tracker',
        filesModified: ''
      },
      {
        day: "2",
        date: '2026-01-02',
        feature: 'Statistics',
        description: 'Statistics with timeline evolution',
        filesModified: ''
      }
    ]
    
    const graph = createDependencyGraph(entries)
    const stats = getGraphStats(graph)
    
    expect(typeof stats.avgDependencies).toBe('number')
    expect(stats.avgDependencies).toBeGreaterThanOrEqual(0)
  })

  it('should identify foundation node', () => {
    const entries: ChangelogEntry[] = [
      {
        day: "1",
        date: '2026-01-01',
        feature: 'Evolution Timeline',
        description: 'Timeline of evolution history',
        filesModified: ''
      },
      {
        day: "2",
        date: '2026-01-02',
        feature: 'Statistics Dashboard',
        description: 'Dashboard analyzing timeline evolution',
        filesModified: ''
      },
      {
        day: "3",
        date: '2026-01-03',
        feature: 'Search System',
        description: 'Search timeline entries',
        filesModified: ''
      }
    ]
    
    const graph = createDependencyGraph(entries)
    const stats = getGraphStats(graph)
    
    expect(stats.foundationNode).toBeDefined()
    expect(stats.foundationDependencies).toBeGreaterThanOrEqual(0)
  })

  it('should calculate category distribution', () => {
    const entries: ChangelogEntry[] = [
      {
        day: "1",
        date: '2026-01-01',
        feature: 'Timeline',
        description: 'Timeline of history',
        filesModified: ''
      },
      {
        day: "2",
        date: '2026-01-02',
        feature: 'Statistics',
        description: 'Statistics metrics dashboard',
        filesModified: ''
      },
      {
        day: "3",
        date: '2026-01-03',
        feature: 'Chart System',
        description: 'Visual graph charts',
        filesModified: ''
      }
    ]
    
    const graph = createDependencyGraph(entries)
    const stats = getGraphStats(graph)
    
    expect(stats.categories).toBeDefined()
    expect(stats.categories.length).toBeGreaterThan(0)
    expect(stats.categories.every(c => c.count > 0)).toBe(true)
  })

  it('should handle empty graph', () => {
    const graph = createDependencyGraph([])
    const stats = getGraphStats(graph)
    
    expect(stats.totalNodes).toBe(0)
    expect(stats.totalDependencies).toBe(0)
    expect(stats.avgDependencies).toBe(0)
    expect(stats.categories).toHaveLength(0)
  })
})
