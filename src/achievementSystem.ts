import type { ChangelogEntry } from './changelogParser'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedDate?: string
  category: 'evolution' | 'testing' | 'features' | 'growth'
  requirement: string
}

export interface Milestone {
  name: string
  current: number
  target: number
  progress: number // 0-100
  category: string
}

export interface AchievementData {
  achievements: Achievement[]
  milestones: Milestone[]
  totalUnlocked: number
  completionRate: number
}

/**
 * Calculate achievements based on evolution history
 */
export function calculateAchievements(entries: ChangelogEntry[]): AchievementData {
  const totalDays = entries.length
  const totalTests = entries.reduce((sum, entry) => {
    const match = entry.description.match(/(\d+)\s+(?:new\s+)?tests/i)
    return sum + (match ? parseInt(match[1]) : 0)
  }, 0)
  
  const hasSearchFeature = entries.some(e => 
    e.feature.toLowerCase().includes('search') || 
    e.description.toLowerCase().includes('search')
  )
  
  const hasVisualization = entries.some(e => 
    e.feature.toLowerCase().includes('graph') || 
    e.feature.toLowerCase().includes('visual') ||
    e.description.toLowerCase().includes('visualization')
  )
  
  const hasThemeSystem = entries.some(e => 
    e.feature.toLowerCase().includes('theme') || 
    e.feature.toLowerCase().includes('dark mode')
  )
  
  const hasExportFeature = entries.some(e => 
    e.feature.toLowerCase().includes('export') || 
    e.description.toLowerCase().includes('export')
  )
  
  const hasPredictions = entries.some(e => 
    e.feature.toLowerCase().includes('prediction') || 
    e.feature.toLowerCase().includes('ai')
  )

  const achievements: Achievement[] = [
    {
      id: 'first_evolution',
      name: 'The Beginning',
      description: 'Completed the first evolution',
      icon: '🌱',
      unlocked: totalDays >= 1,
      unlockedDate: totalDays >= 1 ? entries[entries.length - 1]?.date : undefined,
      category: 'evolution',
      requirement: 'Complete 1 evolution'
    },
    {
      id: 'week_strong',
      name: 'Week Strong',
      description: 'Survived a full week of evolution',
      icon: '📅',
      unlocked: totalDays >= 7,
      unlockedDate: totalDays >= 7 ? entries[entries.length - 7]?.date : undefined,
      category: 'evolution',
      requirement: 'Complete 7 evolutions'
    },
    {
      id: 'test_century',
      name: 'Test Century',
      description: 'Reached 100 total tests',
      icon: '🧪',
      unlocked: totalTests >= 100,
      unlockedDate: findUnlockDate(entries, 'tests', 100),
      category: 'testing',
      requirement: 'Reach 100 total tests'
    },
    {
      id: 'test_fortress',
      name: 'Test Fortress',
      description: 'Built an impressive fortress of 150+ tests',
      icon: '🏰',
      unlocked: totalTests >= 150,
      unlockedDate: findUnlockDate(entries, 'tests', 150),
      category: 'testing',
      requirement: 'Reach 150 total tests'
    },
    {
      id: 'search_pioneer',
      name: 'Search Pioneer',
      description: 'Added search functionality',
      icon: '🔍',
      unlocked: hasSearchFeature,
      unlockedDate: hasSearchFeature ? entries.find(e => 
        e.feature.toLowerCase().includes('search'))?.date : undefined,
      category: 'features',
      requirement: 'Implement search feature'
    },
    {
      id: 'visual_artist',
      name: 'Visual Artist',
      description: 'Created data visualizations',
      icon: '📊',
      unlocked: hasVisualization,
      unlockedDate: hasVisualization ? entries.find(e => 
        e.feature.toLowerCase().includes('graph') || 
        e.feature.toLowerCase().includes('visual'))?.date : undefined,
      category: 'features',
      requirement: 'Add data visualization'
    },
    {
      id: 'theme_master',
      name: 'Theme Master',
      description: 'Implemented theme switching',
      icon: '🎨',
      unlocked: hasThemeSystem,
      unlockedDate: hasThemeSystem ? entries.find(e => 
        e.feature.toLowerCase().includes('theme'))?.date : undefined,
      category: 'features',
      requirement: 'Add theme system'
    },
    {
      id: 'data_liberator',
      name: 'Data Liberator',
      description: 'Enabled data export capabilities',
      icon: '💾',
      unlocked: hasExportFeature,
      unlockedDate: hasExportFeature ? entries.find(e => 
        e.feature.toLowerCase().includes('export'))?.date : undefined,
      category: 'features',
      requirement: 'Add export feature'
    },
    {
      id: 'fortune_teller',
      name: 'Fortune Teller',
      description: 'Can predict future evolution patterns',
      icon: '🔮',
      unlocked: hasPredictions,
      unlockedDate: hasPredictions ? entries.find(e => 
        e.feature.toLowerCase().includes('prediction'))?.date : undefined,
      category: 'features',
      requirement: 'Add prediction engine'
    },
    {
      id: 'feature_rich',
      name: 'Feature Rich',
      description: 'Accumulated 5+ distinct features',
      icon: '⭐',
      unlocked: totalDays >= 5,
      unlockedDate: totalDays >= 5 ? entries[entries.length - 5]?.date : undefined,
      category: 'growth',
      requirement: 'Complete 5 evolutions'
    },
    {
      id: 'ten_days',
      name: 'Perfect Ten',
      description: 'Achieved 10 days of continuous evolution',
      icon: '🔟',
      unlocked: totalDays >= 10,
      unlockedDate: totalDays >= 10 ? entries[entries.length - 10]?.date : undefined,
      category: 'evolution',
      requirement: 'Complete 10 evolutions'
    },
    {
      id: 'test_colossus',
      name: 'Test Colossus',
      description: 'Reached the monumental 200 test milestone',
      icon: '🗿',
      unlocked: totalTests >= 200,
      unlockedDate: findUnlockDate(entries, 'tests', 200),
      category: 'testing',
      requirement: 'Reach 200 total tests'
    }
  ]

  // Calculate milestones for next achievements
  const milestones: Milestone[] = []
  
  // Next evolution milestone
  const nextEvolutionTarget = totalDays < 7 ? 7 : totalDays < 10 ? 10 : 15
  milestones.push({
    name: 'Next Evolution Milestone',
    current: totalDays,
    target: nextEvolutionTarget,
    progress: Math.min(100, (totalDays / nextEvolutionTarget) * 100),
    category: 'evolution'
  })
  
  // Next test milestone
  const nextTestTarget = totalTests < 100 ? 100 : totalTests < 150 ? 150 : totalTests < 200 ? 200 : 250
  milestones.push({
    name: 'Next Test Milestone',
    current: totalTests,
    target: nextTestTarget,
    progress: Math.min(100, (totalTests / nextTestTarget) * 100),
    category: 'testing'
  })

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const completionRate = (unlockedCount / achievements.length) * 100

  return {
    achievements,
    milestones,
    totalUnlocked: unlockedCount,
    completionRate
  }
}

/**
 * Helper function to find when an achievement was unlocked based on cumulative metric
 */
function findUnlockDate(entries: ChangelogEntry[], metric: 'tests' | 'files', threshold: number): string | undefined {
  let cumulative = 0
  
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i]
    
    if (metric === 'tests') {
      const match = entry.description.match(/(\d+)\s+(?:new\s+)?tests/i)
      cumulative += match ? parseInt(match[1]) : 0
    } else if (metric === 'files') {
      const match = entry.filesModified.match(/(\d+)/)
      cumulative += match ? parseInt(match[1]) : 0
    }
    
    if (cumulative >= threshold) {
      return entry.date
    }
  }
  
  return undefined
}
