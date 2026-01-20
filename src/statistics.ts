import type { ChangelogEntry } from './changelogParser';

export interface EvolutionStats {
  totalEvolutions: number;
  daysSinceStart: number;
  avgEvolutionsPerDay: number;
  recentActivity: number; // evolutions in last 7 days
  featureCategories: Map<string, number>;
}

/**
 * Analyzes changelog entries and generates statistics
 */
export function calculateStatistics(entries: ChangelogEntry[]): EvolutionStats {
  if (entries.length === 0) {
    return {
      totalEvolutions: 0,
      daysSinceStart: 0,
      avgEvolutionsPerDay: 0,
      recentActivity: 0,
      featureCategories: new Map()
    };
  }

  // Sort entries by date (oldest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const firstDate = new Date(sortedEntries[0].date);
  const lastDate = new Date(sortedEntries[sortedEntries.length - 1].date);
  const daysSinceStart = Math.ceil((lastDate.getTime() - firstDate.getTime()) / MS_PER_DAY) + 1;

  // Calculate recent activity (last 7 days from the most recent entry)
  const sevenDaysAgo = new Date(lastDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentActivity = entries.filter(entry => 
    new Date(entry.date) >= sevenDaysAgo
  ).length;

  // Categorize features by common keywords
  const featureCategories = categorizeFeatures(entries);

  return {
    totalEvolutions: entries.length,
    daysSinceStart,
    avgEvolutionsPerDay: entries.length / daysSinceStart,
    recentActivity,
    featureCategories
  };
}

/**
 * Categorizes features based on keywords in their names
 */
function categorizeFeatures(entries: ChangelogEntry[]): Map<string, number> {
  const categories = new Map<string, number>();

  const categoryKeywords = [
    { name: 'UI/UX', keywords: ['ui', 'ux', 'design', 'visual', 'interface', 'styling', 'css'] },
    { name: 'Feature', keywords: ['feature', 'add', 'new', 'implement'] },
    { name: 'Refactor', keywords: ['refactor', 'improve', 'optimize', 'clean'] },
    { name: 'Testing', keywords: ['test', 'testing', 'coverage'] },
    { name: 'Documentation', keywords: ['doc', 'documentation', 'readme', 'changelog'] },
    { name: 'Build/Deploy', keywords: ['build', 'deploy', 'ci', 'action', 'workflow'] },
    { name: 'Other', keywords: [] }
  ];

  entries.forEach(entry => {
    const text = `${entry.feature} ${entry.description}`.toLowerCase();
    let categorized = false;

    for (const category of categoryKeywords.slice(0, -1)) { // Skip 'Other'
      if (category.keywords.some(keyword => text.includes(keyword))) {
        categories.set(category.name, (categories.get(category.name) || 0) + 1);
        categorized = true;
        break;
      }
    }

    if (!categorized) {
      categories.set('Other', (categories.get('Other') || 0) + 1);
    }
  });

  return categories;
}

/**
 * Generates a simple text-based bar for visualizing numbers
 */
export function generateProgressBar(value: number, max: number, width: number = 20): string {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}
