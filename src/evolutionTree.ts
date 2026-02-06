import type { ChangelogEntry } from './changelogParser.ts'

export interface TreeNode {
  id: string
  day: number
  date: string
  feature: string
  category: string
  description: string
  files: string[]
  children: TreeNode[]
  depth: number
  x: number
  y: number
}

export interface TreeLayout {
  nodes: TreeNode[]
  width: number
  height: number
  maxDepth: number
}

/**
 * Extract category from entry feature name or description
 */
function extractCategory(entry: ChangelogEntry): string {
  const feature = entry.feature.toLowerCase()
  const desc = entry.description.toLowerCase()
  
  // Define category keywords
  const categories = {
    visualization: ['graph', 'chart', 'visual', 'tree', 'timeline', 'dashboard'],
    analytics: ['metric', 'statistic', 'performance', 'monitor', 'insight', 'analysis'],
    interaction: ['keyboard', 'shortcut', 'command', 'palette', 'search', 'filter'],
    ui: ['theme', 'polish', 'design', 'ui', 'ux', 'frontend', 'style', 'modal'],
    data: ['export', 'import', 'share', 'url', 'snippet', 'copy'],
    achievement: ['achievement', 'badge', 'milestone', 'unlock'],
    prediction: ['prediction', 'forecast', 'trend', 'future'],
    community: ['voting', 'feedback', 'engagement', 'community'],
    dependency: ['dependency', 'package', 'library'],
    comparison: ['comparison', 'compare', 'diff', 'versus'],
  }
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => feature.includes(kw) || desc.includes(kw))) {
      return category
    }
  }
  
  return 'general'
}

/**
 * Build a tree structure from evolution entries
 * Organizes entries chronologically and by category
 */
export function buildEvolutionTree(entries: ChangelogEntry[]): TreeNode[] {
  // Sort entries chronologically (oldest first for tree building)
  const sortedEntries = [...entries].reverse()
  
  // Create nodes from entries
  const nodes: TreeNode[] = sortedEntries.map(entry => ({
    id: `node-${entry.day}`,
    day: parseInt(entry.day),
    date: entry.date,
    feature: entry.feature,
    category: extractCategory(entry),
    description: entry.description,
    files: entry.filesModified.split(',').map(f => f.trim()),
    children: [],
    depth: 0,
    x: 0,
    y: 0,
  }))
  
  // Build parent-child relationships based on categories and proximity
  // Recent entries of same category become children of earlier ones
  const categoryRoots = new Map<string, TreeNode[]>()
  
  for (const node of nodes) {
    if (!categoryRoots.has(node.category)) {
      categoryRoots.set(node.category, [])
    }
    const roots = categoryRoots.get(node.category)!
    
    // If this is the first node in the category, it's a root
    if (roots.length === 0) {
      roots.push(node)
    } else {
      // Add as child to the most recent root in this category
      const parent = roots[roots.length - 1]
      parent.children.push(node)
      
      // If this node has significant additions, it might spawn a new branch
      if (node.files.length >= 3) {
        roots.push(node)
      }
    }
  }
  
  // Return all root nodes
  const allRoots: TreeNode[] = []
  categoryRoots.forEach(roots => {
    allRoots.push(...roots)
  })
  
  return allRoots
}

/**
 * Calculate tree layout positions using a tidy tree algorithm
 */
export function calculateTreeLayout(roots: TreeNode[]): TreeLayout {
  const nodeWidth = 160
  const nodeHeight = 80
  const horizontalGap = 40
  const verticalGap = 100
  
  let maxDepth = 0
  
  // Calculate depth for all nodes
  function setDepth(node: TreeNode, depth: number) {
    node.depth = depth
    maxDepth = Math.max(maxDepth, depth)
    node.children.forEach(child => setDepth(child, depth + 1))
  }
  
  roots.forEach(root => setDepth(root, 0))
  
  // Calculate positions using a simple layered layout
  const layers: TreeNode[][] = []
  
  function collectByLayer(node: TreeNode) {
    if (!layers[node.depth]) {
      layers[node.depth] = []
    }
    layers[node.depth].push(node)
    node.children.forEach(collectByLayer)
  }
  
  roots.forEach(collectByLayer)
  
  // Position nodes in each layer
  let maxWidth = 0
  layers.forEach((layer, depth) => {
    const layerWidth = layer.length * (nodeWidth + horizontalGap)
    maxWidth = Math.max(maxWidth, layerWidth)
    
    layer.forEach((node, index) => {
      node.y = depth * (nodeHeight + verticalGap)
      node.x = index * (nodeWidth + horizontalGap)
    })
  })
  
  // Collect all nodes for return
  const allNodes: TreeNode[] = []
  function collectAll(node: TreeNode) {
    allNodes.push(node)
    node.children.forEach(collectAll)
  }
  roots.forEach(collectAll)
  
  return {
    nodes: allNodes,
    width: maxWidth,
    height: (maxDepth + 1) * (nodeHeight + verticalGap),
    maxDepth,
  }
}

/**
 * Get nodes by category for filtering
 */
export function getNodesByCategory(nodes: TreeNode[]): Map<string, TreeNode[]> {
  const byCategory = new Map<string, TreeNode[]>()
  
  for (const node of nodes) {
    if (!byCategory.has(node.category)) {
      byCategory.set(node.category, [])
    }
    byCategory.get(node.category)!.push(node)
  }
  
  return byCategory
}

/**
 * Find path from root to a specific node
 */
export function findNodePath(roots: TreeNode[], targetDay: number): TreeNode[] {
  const path: TreeNode[] = []
  
  function search(node: TreeNode): boolean {
    if (node.day === targetDay) {
      path.push(node)
      return true
    }
    
    for (const child of node.children) {
      if (search(child)) {
        path.unshift(node)
        return true
      }
    }
    
    return false
  }
  
  for (const root of roots) {
    if (search(root)) {
      return path
    }
  }
  
  return []
}
