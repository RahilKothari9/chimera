import { describe, it, expect } from 'vitest'
import {
  buildEvolutionTree,
  calculateTreeLayout,
  getNodesByCategory,
  findNodePath,
  type TreeNode,
} from './evolutionTree.ts'
import type { ChangelogEntry } from './changelogParser.ts'

describe('Evolution Tree', () => {
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
    {
      day: '4',
      date: '2026-01-04',
      feature: 'Performance Metrics',
      description: 'Added performance monitoring to track metrics',
      filesModified: 'performance.ts, metrics.ts',
    },
    {
      day: '5',
      date: '2026-01-05',
      feature: 'Dark Theme',
      description: 'Implemented dark theme for better UI experience',
      filesModified: 'theme.ts, style.css',
    },
  ]

  describe('buildEvolutionTree', () => {
    it('should create tree nodes from entries', () => {
      const roots = buildEvolutionTree(mockEntries)
      
      expect(roots.length).toBeGreaterThan(0)
      
      // Check that nodes are created
      const allNodes: TreeNode[] = []
      const collectNodes = (node: TreeNode) => {
        allNodes.push(node)
        node.children.forEach(collectNodes)
      }
      roots.forEach(collectNodes)
      
      expect(allNodes.length).toBe(mockEntries.length)
    })

    it('should assign categories to nodes', () => {
      const roots = buildEvolutionTree(mockEntries)
      
      const allNodes: TreeNode[] = []
      const collectNodes = (node: TreeNode) => {
        allNodes.push(node)
        node.children.forEach(collectNodes)
      }
      roots.forEach(collectNodes)
      
      // Each node should have a category
      allNodes.forEach(node => {
        expect(node.category).toBeDefined()
        expect(typeof node.category).toBe('string')
      })
    })

    it('should group related features by category', () => {
      const roots = buildEvolutionTree(mockEntries)
      
      // Timeline entries should be grouped
      const allNodes: TreeNode[] = []
      const collectNodes = (node: TreeNode) => {
        allNodes.push(node)
        node.children.forEach(collectNodes)
      }
      roots.forEach(collectNodes)
      
      const visualizationNodes = allNodes.filter(n => n.category === 'visualization')
      expect(visualizationNodes.length).toBeGreaterThan(0)
    })

    it('should create parent-child relationships', () => {
      const roots = buildEvolutionTree(mockEntries)
      
      // Check that some nodes have children (related features)
      let hasChildren = false
      const checkChildren = (node: TreeNode) => {
        if (node.children.length > 0) {
          hasChildren = true
        }
        node.children.forEach(checkChildren)
      }
      roots.forEach(checkChildren)
      
      expect(hasChildren).toBe(true)
    })

    it('should preserve all entry data in nodes', () => {
      const roots = buildEvolutionTree(mockEntries)
      
      const allNodes: TreeNode[] = []
      const collectNodes = (node: TreeNode) => {
        allNodes.push(node)
        node.children.forEach(collectNodes)
      }
      roots.forEach(collectNodes)
      
      allNodes.forEach(node => {
        expect(node.day).toBeGreaterThan(0)
        expect(node.date).toBeDefined()
        expect(node.feature).toBeDefined()
        expect(node.description).toBeDefined()
        expect(Array.isArray(node.files)).toBe(true)
      })
    })

    it('should handle single entry', () => {
      const singleEntry = [mockEntries[0]]
      const roots = buildEvolutionTree(singleEntry)
      
      expect(roots.length).toBe(1)
      expect(roots[0].day).toBe(1)
      expect(roots[0].children.length).toBe(0)
    })

    it('should handle empty entries', () => {
      const roots = buildEvolutionTree([])
      expect(roots.length).toBe(0)
    })
  })

  describe('calculateTreeLayout', () => {
    it('should calculate positions for all nodes', () => {
      const roots = buildEvolutionTree(mockEntries)
      const layout = calculateTreeLayout(roots)
      
      expect(layout.nodes.length).toBe(mockEntries.length)
      
      layout.nodes.forEach(node => {
        expect(typeof node.x).toBe('number')
        expect(typeof node.y).toBe('number')
        expect(node.x).toBeGreaterThanOrEqual(0)
        expect(node.y).toBeGreaterThanOrEqual(0)
      })
    })

    it('should set depth for all nodes', () => {
      const roots = buildEvolutionTree(mockEntries)
      const layout = calculateTreeLayout(roots)
      
      layout.nodes.forEach(node => {
        expect(typeof node.depth).toBe('number')
        expect(node.depth).toBeGreaterThanOrEqual(0)
      })
    })

    it('should calculate layout dimensions', () => {
      const roots = buildEvolutionTree(mockEntries)
      const layout = calculateTreeLayout(roots)
      
      expect(layout.width).toBeGreaterThan(0)
      expect(layout.height).toBeGreaterThan(0)
      expect(layout.maxDepth).toBeGreaterThanOrEqual(0)
    })

    it('should position child nodes deeper than parents', () => {
      const roots = buildEvolutionTree(mockEntries)
      const layout = calculateTreeLayout(roots)
      
      const checkDepth = (node: TreeNode) => {
        node.children.forEach(child => {
          expect(child.depth).toBeGreaterThan(node.depth)
          expect(child.y).toBeGreaterThan(node.y)
          checkDepth(child)
        })
      }
      
      layout.nodes.filter(n => n.depth === 0).forEach(checkDepth)
    })

    it('should handle single node', () => {
      const singleEntry = [mockEntries[0]]
      const roots = buildEvolutionTree(singleEntry)
      const layout = calculateTreeLayout(roots)
      
      expect(layout.nodes.length).toBe(1)
      expect(layout.maxDepth).toBe(0)
      expect(layout.nodes[0].x).toBe(0)
      expect(layout.nodes[0].y).toBe(0)
    })

    it('should handle empty tree', () => {
      const layout = calculateTreeLayout([])
      
      expect(layout.nodes.length).toBe(0)
      expect(layout.width).toBeGreaterThanOrEqual(0)
      expect(layout.height).toBeGreaterThanOrEqual(0)
      expect(layout.maxDepth).toBe(0)
    })
  })

  describe('getNodesByCategory', () => {
    it('should group nodes by category', () => {
      const roots = buildEvolutionTree(mockEntries)
      
      const allNodes: TreeNode[] = []
      const collectNodes = (node: TreeNode) => {
        allNodes.push(node)
        node.children.forEach(collectNodes)
      }
      roots.forEach(collectNodes)
      
      const byCategory = getNodesByCategory(allNodes)
      
      expect(byCategory.size).toBeGreaterThan(0)
      
      // Each category should have at least one node
      byCategory.forEach((nodes, category) => {
        expect(nodes.length).toBeGreaterThan(0)
        nodes.forEach(node => {
          expect(node.category).toBe(category)
        })
      })
    })

    it('should handle empty node list', () => {
      const byCategory = getNodesByCategory([])
      expect(byCategory.size).toBe(0)
    })

    it('should handle single category', () => {
      const singleEntry: ChangelogEntry[] = [
        {
          day: '1',
          date: '2026-01-01',
          feature: 'Test Feature',
          description: 'A visualization feature',
          filesModified: 'test.ts',
        },
      ]
      
      const roots = buildEvolutionTree(singleEntry)
      const allNodes: TreeNode[] = []
      const collectNodes = (node: TreeNode) => {
        allNodes.push(node)
        node.children.forEach(collectNodes)
      }
      roots.forEach(collectNodes)
      
      const byCategory = getNodesByCategory(allNodes)
      expect(byCategory.size).toBe(1)
    })
  })

  describe('findNodePath', () => {
    it('should find path to node', () => {
      const roots = buildEvolutionTree(mockEntries)
      
      // Try to find a path to an existing node
      const targetDay = parseInt(mockEntries[2].day)
      const path = findNodePath(roots, targetDay)
      
      if (path.length > 0) {
        expect(path[path.length - 1].day).toBe(targetDay)
      }
    })

    it('should return path from root to target', () => {
      const roots = buildEvolutionTree(mockEntries)
      
      // Find a node that has a parent
      const allNodes: TreeNode[] = []
      const collectNodes = (node: TreeNode) => {
        allNodes.push(node)
        node.children.forEach(collectNodes)
      }
      roots.forEach(collectNodes)
      
      const childNode = allNodes.find(n => n.depth > 0)
      if (childNode) {
        const path = findNodePath(roots, childNode.day)
        expect(path.length).toBeGreaterThan(0)
        expect(path[0].depth).toBe(0) // First node should be root
      }
    })

    it('should return empty array for non-existent node', () => {
      const roots = buildEvolutionTree(mockEntries)
      const path = findNodePath(roots, 999)
      
      expect(path.length).toBe(0)
    })

    it('should handle empty tree', () => {
      const path = findNodePath([], 1)
      expect(path.length).toBe(0)
    })

    it('should find root node', () => {
      const roots = buildEvolutionTree(mockEntries)
      
      if (roots.length > 0) {
        const path = findNodePath(roots, roots[0].day)
        expect(path.length).toBeGreaterThan(0)
        expect(path[0].day).toBe(roots[0].day)
      }
    })
  })
})
