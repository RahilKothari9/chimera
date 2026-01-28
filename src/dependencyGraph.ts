import type { ChangelogEntry } from './changelogParser'

export interface FeatureNode {
  id: string
  name: string
  day: string  // Changed from number to string to match ChangelogEntry
  date: string
  category: string
  description: string
}

export interface FeatureDependency {
  from: string // Feature ID that depends on
  to: string   // Feature ID being depended upon
  type: 'builds-on' | 'enhances' | 'uses'
  strength: number // 0-1, how strong the dependency is
}

export interface DependencyGraph {
  nodes: FeatureNode[]
  dependencies: FeatureDependency[]
}

/**
 * Maps feature names to their categories based on keywords and patterns
 */
export function categorizeFeature(name: string, description: string): string {
  const combined = `${name} ${description}`.toLowerCase()
  
  if (combined.includes('visual') || combined.includes('graph') || combined.includes('chart')) {
    return 'Visualization'
  }
  if (combined.includes('ui') || combined.includes('theme') || combined.includes('toggle')) {
    return 'UI/UX'
  }
  if (combined.includes('search') || combined.includes('filter')) {
    return 'Search & Filter'
  }
  if (combined.includes('export') || combined.includes('data')) {
    return 'Data & Export'
  }
  if (combined.includes('statistic') || combined.includes('metric') || combined.includes('dashboard')) {
    return 'Analytics'
  }
  if (combined.includes('achievement') || combined.includes('milestone')) {
    return 'Gamification'
  }
  if (combined.includes('prediction') || combined.includes('forecast')) {
    return 'AI & Intelligence'
  }
  if (combined.includes('timeline') || combined.includes('history')) {
    return 'Core Features'
  }
  
  return 'Other'
}

/**
 * Analyzes changelog entries and detects dependencies between features
 */
export function detectDependencies(entries: ChangelogEntry[]): FeatureDependency[] {
  const dependencies: FeatureDependency[] = []
  
  // Define dependency rules based on feature evolution patterns
  const dependencyRules: { [key: string]: Array<{ pattern: RegExp, dependsOn: string[], type: 'builds-on' | 'enhances' | 'uses', strength: number }> } = {
    'statistics': [
      { pattern: /timeline|evolution|history/i, dependsOn: ['timeline', 'changelog'], type: 'builds-on', strength: 0.9 }
    ],
    'search': [
      { pattern: /timeline|evolution/i, dependsOn: ['timeline'], type: 'enhances', strength: 0.8 }
    ],
    'impact': [
      { pattern: /visual|graph/i, dependsOn: ['timeline', 'statistics'], type: 'builds-on', strength: 0.7 }
    ],
    'prediction': [
      { pattern: /ai|prediction/i, dependsOn: ['timeline', 'statistics'], type: 'uses', strength: 0.8 }
    ],
    'export': [
      { pattern: /data|export/i, dependsOn: ['timeline', 'statistics'], type: 'uses', strength: 0.7 }
    ],
    'achievement': [
      { pattern: /achievement|milestone/i, dependsOn: ['timeline', 'statistics'], type: 'uses', strength: 0.8 }
    ],
    'metrics': [
      { pattern: /metric|code/i, dependsOn: ['statistics', 'timeline'], type: 'builds-on', strength: 0.7 }
    ],
    'theme': [
      { pattern: /theme|dark|light/i, dependsOn: ['timeline', 'dashboard'], type: 'enhances', strength: 0.6 }
    ]
  }
  
  // Analyze each entry
  entries.forEach((entry, index) => {
    const featureName = entry.feature.toLowerCase()
    const description = entry.description.toLowerCase()
    
    // Check against dependency rules
    Object.entries(dependencyRules).forEach(([ruleKey, rules]) => {
      if (featureName.includes(ruleKey) || description.includes(ruleKey)) {
        rules.forEach(rule => {
          if (rule.pattern.test(entry.feature) || rule.pattern.test(entry.description)) {
            // Find the features this depends on
            rule.dependsOn.forEach(depName => {
              const dependentEntry = entries.find((e, i) => 
                i < index && // Must be before this entry
                (e.feature.toLowerCase().includes(depName) || 
                 e.description.toLowerCase().includes(depName))
              )
              
              if (dependentEntry) {
                dependencies.push({
                  from: `day-${entry.day}`,
                  to: `day-${dependentEntry.day}`,
                  type: rule.type,
                  strength: rule.strength
                })
              }
            })
          }
        })
      }
    })
  })
  
  return dependencies
}

/**
 * Creates a complete dependency graph from changelog entries
 */
export function createDependencyGraph(entries: ChangelogEntry[]): DependencyGraph {
  const nodes: FeatureNode[] = entries.map(entry => ({
    id: `day-${entry.day}`,
    name: entry.feature,
    day: entry.day,
    date: entry.date,
    category: categorizeFeature(entry.feature, entry.description),
    description: entry.description
  }))
  
  const dependencies = detectDependencies(entries)
  
  return {
    nodes,
    dependencies
  }
}

/**
 * Gets statistics about the dependency graph
 */
export function getGraphStats(graph: DependencyGraph) {
  const totalNodes = graph.nodes.length
  const totalDependencies = graph.dependencies.length
  
  // Calculate average dependencies per node
  const avgDependencies = totalNodes > 0 ? totalDependencies / totalNodes : 0
  
  // Find most connected nodes (nodes with most outgoing dependencies)
  const outgoingCounts = new Map<string, number>()
  const incomingCounts = new Map<string, number>()
  
  graph.dependencies.forEach(dep => {
    outgoingCounts.set(dep.from, (outgoingCounts.get(dep.from) || 0) + 1)
    incomingCounts.set(dep.to, (incomingCounts.get(dep.to) || 0) + 1)
  })
  
  // Find foundation nodes (most depended upon)
  let maxIncoming = 0
  let foundationNode = ''
  incomingCounts.forEach((count, nodeId) => {
    if (count > maxIncoming) {
      maxIncoming = count
      foundationNode = nodeId
    }
  })
  
  // Category distribution
  const categoryCount = new Map<string, number>()
  graph.nodes.forEach(node => {
    categoryCount.set(node.category, (categoryCount.get(node.category) || 0) + 1)
  })
  
  return {
    totalNodes,
    totalDependencies,
    avgDependencies: Math.round(avgDependencies * 10) / 10,
    foundationNode,
    foundationDependencies: maxIncoming,
    categories: Array.from(categoryCount.entries()).map(([name, count]) => ({
      name,
      count
    }))
  }
}
