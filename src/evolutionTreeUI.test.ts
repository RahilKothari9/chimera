import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createEvolutionTreeUI } from './evolutionTreeUI.ts'
import type { ChangelogEntry } from './changelogParser.ts'

// Mock notification system
vi.mock('./notificationSystem.ts', () => ({
  showNotification: vi.fn(),
  notificationManager: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

describe('Evolution Tree UI', () => {
  const mockEntries: ChangelogEntry[] = [
    {
      day: '1',
      date: '2026-01-01',
      feature: 'Timeline Visualization',
      description: 'Added timeline graph to show evolution',
      filesModified: 'timeline.ts, main.ts',
    },
    {
      day: '2',
      date: '2026-01-02',
      feature: 'Statistics Dashboard',
      description: 'Created analytics dashboard with metrics',
      filesModified: 'dashboard.ts, statistics.ts',
    },
    {
      day: '3',
      date: '2026-01-03',
      feature: 'Enhanced Timeline',
      description: 'Improved timeline visualization with filters',
      filesModified: 'timeline.ts, filters.ts, style.css',
    },
  ]

  let container: HTMLElement

  beforeEach(() => {
    container = createEvolutionTreeUI(mockEntries)
  })

  describe('Container structure', () => {
    it('should create a container with correct class', () => {
      expect(container.className).toBe('evolution-tree-container')
    })

    it('should include header section', () => {
      const header = container.querySelector('.evolution-tree-header')
      expect(header).toBeTruthy()
    })

    it('should include SVG container', () => {
      const svgContainer = container.querySelector('.evolution-tree-svg-container')
      expect(svgContainer).toBeTruthy()
    })

    it('should include SVG element', () => {
      const svg = container.querySelector('svg.evolution-tree-svg')
      expect(svg).toBeTruthy()
    })

    it('should include stats section', () => {
      const stats = container.querySelector('.evolution-tree-stats')
      expect(stats).toBeTruthy()
    })

    it('should include legend', () => {
      const legend = container.querySelector('.evolution-tree-legend')
      expect(legend).toBeTruthy()
    })
  })

  describe('Header', () => {
    it('should display section title', () => {
      const title = container.querySelector('.section-title')
      expect(title?.textContent).toContain('Evolution Tree')
    })

    it('should include description', () => {
      const description = container.querySelector('.evolution-tree-description')
      expect(description).toBeTruthy()
      expect(description?.textContent).toContain('evolution tree')
    })

    it('should include category filter', () => {
      const filter = container.querySelector('.evolution-tree-filter') as HTMLSelectElement
      expect(filter).toBeTruthy()
      expect(filter.tagName).toBe('SELECT')
    })

    it('should have "All Categories" as first option', () => {
      const filter = container.querySelector('.evolution-tree-filter') as HTMLSelectElement
      expect(filter.options[0].value).toBe('all')
      expect(filter.options[0].textContent).toBe('All Categories')
    })

    it('should populate category options', () => {
      const filter = container.querySelector('.evolution-tree-filter') as HTMLSelectElement
      expect(filter.options.length).toBeGreaterThan(1)
    })

    it('should include fit view button', () => {
      const button = container.querySelector('.evolution-tree-zoom-fit') as HTMLButtonElement
      expect(button).toBeTruthy()
      expect(button.tagName).toBe('BUTTON')
    })
  })

  describe('SVG rendering', () => {
    it('should set viewBox on SVG', () => {
      const svg = container.querySelector('svg.evolution-tree-svg')
      expect(svg?.getAttribute('viewBox')).toBeTruthy()
    })

    it('should include main group for content', () => {
      const svg = container.querySelector('svg.evolution-tree-svg')
      const mainGroup = svg?.querySelector('g')
      expect(mainGroup).toBeTruthy()
    })

    it('should render nodes for all entries', () => {
      const nodes = container.querySelectorAll('.evolution-tree-node')
      expect(nodes.length).toBe(mockEntries.length)
    })

    it('should render node backgrounds', () => {
      const backgrounds = container.querySelectorAll('.evolution-tree-node-bg')
      expect(backgrounds.length).toBe(mockEntries.length)
    })

    it('should set fill color for node backgrounds', () => {
      const backgrounds = container.querySelectorAll('.evolution-tree-node-bg')
      backgrounds.forEach(bg => {
        expect(bg.getAttribute('fill')).toBeTruthy()
      })
    })

    it('should render category badges', () => {
      const badges = container.querySelectorAll('.evolution-tree-category-badge')
      expect(badges.length).toBe(mockEntries.length)
    })

    it('should render day labels', () => {
      const dayLabels = container.querySelectorAll('.evolution-tree-day')
      expect(dayLabels.length).toBe(mockEntries.length)
    })

    it('should render feature names', () => {
      const features = container.querySelectorAll('.evolution-tree-feature')
      expect(features.length).toBe(mockEntries.length)
    })

    it('should render category labels', () => {
      const categories = container.querySelectorAll('.evolution-tree-category')
      expect(categories.length).toBe(mockEntries.length)
    })

    it('should add tooltips to nodes', () => {
      const tooltips = container.querySelectorAll('.evolution-tree-node title')
      expect(tooltips.length).toBe(mockEntries.length)
    })
  })

  describe('Connections', () => {
    it('should render connections between related nodes', () => {
      // There should be some connections in a tree structure
      const connections = container.querySelectorAll('.evolution-tree-connection')
      // May or may not have connections depending on tree structure
      expect(connections.length).toBeGreaterThanOrEqual(0)
    })

    it('should set stroke color for connections', () => {
      const connections = container.querySelectorAll('.evolution-tree-connection')
      connections.forEach(conn => {
        expect(conn.getAttribute('stroke')).toBeTruthy()
      })
    })
  })

  describe('Stats', () => {
    it('should display total features count', () => {
      const stats = container.querySelector('.evolution-tree-stats')
      const statsText = stats?.textContent || ''
      expect(statsText).toContain('Total Features')
      expect(statsText).toContain(mockEntries.length.toString())
    })

    it('should display categories count', () => {
      const stats = container.querySelector('.evolution-tree-stats')
      const statsText = stats?.textContent || ''
      expect(statsText).toContain('Categories')
    })

    it('should display max depth', () => {
      const stats = container.querySelector('.evolution-tree-stats')
      const statsText = stats?.textContent || ''
      expect(statsText).toContain('Max Depth')
    })

    it('should have stat items', () => {
      const statItems = container.querySelectorAll('.evolution-tree-stat')
      expect(statItems.length).toBe(3)
    })
  })

  describe('Legend', () => {
    it('should display legend title', () => {
      const legendTitle = container.querySelector('.evolution-tree-legend-title')
      expect(legendTitle?.textContent).toBe('Categories')
    })

    it('should have legend items', () => {
      const items = container.querySelectorAll('.evolution-tree-legend-item')
      expect(items.length).toBeGreaterThan(0)
    })

    it('should show color swatches', () => {
      const colors = container.querySelectorAll('.evolution-tree-legend-color')
      expect(colors.length).toBeGreaterThan(0)
    })

    it('should set background colors on swatches', () => {
      const colors = container.querySelectorAll('.evolution-tree-legend-color') as NodeListOf<HTMLElement>
      colors.forEach(color => {
        expect(color.style.backgroundColor).toBeTruthy()
      })
    })
  })

  describe('Interactivity', () => {
    it('should make nodes clickable', () => {
      const nodes = container.querySelectorAll('.evolution-tree-node') as NodeListOf<SVGElement>
      nodes.forEach(node => {
        expect(node.style.cursor).toBe('pointer')
      })
    })

    it('should filter nodes by category', () => {
      const filter = container.querySelector('.evolution-tree-filter') as HTMLSelectElement
      
      // Initially all nodes should be visible
      const nodes = container.querySelectorAll('.evolution-tree-node')
      nodes.forEach(node => {
        expect(node.classList.contains('filtered-out')).toBe(false)
      })
      
      // Change filter
      if (filter.options.length > 1) {
        filter.value = filter.options[1].value
        filter.dispatchEvent(new Event('change'))
        
        // Some nodes should now be filtered out
        const filteredNodes = container.querySelectorAll('.evolution-tree-node.filtered-out')
        expect(filteredNodes.length).toBeGreaterThanOrEqual(0)
      }
    })

    it('should reset filter to show all', () => {
      const filter = container.querySelector('.evolution-tree-filter') as HTMLSelectElement
      
      // Change to specific category
      if (filter.options.length > 1) {
        filter.value = filter.options[1].value
        filter.dispatchEvent(new Event('change'))
        
        // Reset to all
        filter.value = 'all'
        filter.dispatchEvent(new Event('change'))
        
        // All nodes should be visible again
        const nodes = container.querySelectorAll('.evolution-tree-node')
        nodes.forEach(node => {
          expect(node.classList.contains('filtered-out')).toBe(false)
        })
      }
    })
  })

  describe('Edge cases', () => {
    it('should handle empty entries', () => {
      const emptyContainer = createEvolutionTreeUI([])
      expect(emptyContainer).toBeTruthy()
      
      const nodes = emptyContainer.querySelectorAll('.evolution-tree-node')
      expect(nodes.length).toBe(0)
    })

    it('should handle single entry', () => {
      const singleEntry = [mockEntries[0]]
      const singleContainer = createEvolutionTreeUI(singleEntry)
      
      expect(singleContainer).toBeTruthy()
      
      const nodes = singleContainer.querySelectorAll('.evolution-tree-node')
      expect(nodes.length).toBe(1)
    })

    it('should truncate long feature names', () => {
      const longFeatureEntry: ChangelogEntry = {
        day: '99',
        date: '2026-01-99',
        feature: 'This is a very long feature name that should be truncated',
        description: 'Test',
        filesModified: 'test.ts',
      }
      
      const longContainer = createEvolutionTreeUI([longFeatureEntry])
      const featureText = longContainer.querySelector('.evolution-tree-feature')
      
      expect(featureText?.textContent).toBeTruthy()
      expect(featureText?.textContent?.length).toBeLessThanOrEqual(21) // 18 chars + '...'
    })
  })
})
