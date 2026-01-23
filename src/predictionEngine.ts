import type { ChangelogEntry } from './changelogParser';

export interface CategoryPrediction {
  category: string;
  probability: number;
  confidence: 'High' | 'Medium' | 'Low';
  reasoning: string;
}

export interface EvolutionPrediction {
  predictions: CategoryPrediction[];
  nextLikelyDate: string;
  overallTrend: string;
  suggestionCount: number;
}

/**
 * Categorizes a feature based on keywords in its description
 */
function categorizeEntry(entry: ChangelogEntry): string {
  const text = `${entry.feature} ${entry.description}`.toLowerCase();
  
  const categoryKeywords = [
    { name: 'UI/UX', keywords: ['ui', 'ux', 'design', 'visual', 'interface', 'styling', 'css', 'dashboard', 'graph', 'animation', 'responsive'] },
    { name: 'Data Visualization', keywords: ['chart', 'graph', 'visualization', 'plot', 'metric', 'statistics', 'analytics', 'dashboard'] },
    { name: 'Search & Filter', keywords: ['search', 'filter', 'query', 'find', 'lookup'] },
    { name: 'Testing', keywords: ['test', 'testing', 'coverage', 'vitest', 'unit', 'integration'] },
    { name: 'Documentation', keywords: ['doc', 'documentation', 'readme', 'changelog', 'comment'] },
    { name: 'Performance', keywords: ['performance', 'optimize', 'speed', 'cache', 'lazy', 'fast'] },
    { name: 'Interactivity', keywords: ['interactive', 'click', 'hover', 'drag', 'scroll', 'event', 'input'] },
    { name: 'Data Processing', keywords: ['parse', 'process', 'analyze', 'calculate', 'compute', 'transform'] },
    { name: 'Build/Deploy', keywords: ['build', 'deploy', 'ci', 'cd', 'vite', 'bundle'] }
  ];

  for (const category of categoryKeywords) {
    if (category.keywords.some(keyword => text.includes(keyword))) {
      return category.name;
    }
  }
  
  return 'Other';
}

/**
 * Calculates the frequency of each category in historical data
 */
function calculateCategoryFrequencies(entries: ChangelogEntry[]): Map<string, number> {
  const frequencies = new Map<string, number>();
  
  entries.forEach(entry => {
    const category = categorizeEntry(entry);
    frequencies.set(category, (frequencies.get(category) || 0) + 1);
  });
  
  return frequencies;
}

/**
 * Analyzes temporal patterns to find which categories are trending
 */
function analyzeTrends(entries: ChangelogEntry[]): Map<string, number> {
  if (entries.length < 2) {
    return new Map();
  }

  // Sort by date (most recent first)
  const sorted = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Weight recent entries more heavily
  const recentWeight = 2.0;
  const midWeight = 1.5;
  const oldWeight = 1.0;
  
  const trends = new Map<string, number>();
  sorted.forEach((entry, index) => {
    const category = categorizeEntry(entry);
    let weight = oldWeight;
    
    // Recent third gets higher weight
    if (index < sorted.length / 3) {
      weight = recentWeight;
    } else if (index < (2 * sorted.length) / 3) {
      weight = midWeight;
    }
    
    trends.set(category, (trends.get(category) || 0) + weight);
  });
  
  return trends;
}

/**
 * Calculates confidence level based on sample size and consistency
 */
function calculateConfidence(frequency: number, totalEntries: number): 'High' | 'Medium' | 'Low' {
  const percentage = (frequency / totalEntries) * 100;
  
  if (totalEntries < 3) return 'Low';
  if (percentage >= 25) return 'High';
  if (percentage >= 10) return 'Medium';
  return 'Low';
}

/**
 * Generates reasoning for why a category is predicted
 */
function generateReasoning(_category: string, frequency: number, trend: number, totalEntries: number): string {
  const percentage = Math.round((frequency / totalEntries) * 100);
  
  if (trend > frequency) {
    return `Strong upward trend with ${frequency} past occurrence${frequency !== 1 ? 's' : ''} (${percentage}% of features). Recent activity suggests growing focus.`;
  } else if (frequency > trend) {
    return `Historically common (${percentage}% of features) but showing decreased recent activity. May cycle back soon.`;
  } else if (frequency === 1) {
    return `Appeared once in evolution history. Moderate likelihood of revisiting this area.`;
  } else {
    return `Consistent pattern with ${frequency} occurrence${frequency !== 1 ? 's' : ''} (${percentage}% of features). Steady probability of continuation.`;
  }
}

/**
 * Predicts the next likely evolution date based on historical patterns
 */
function predictNextDate(entries: ChangelogEntry[]): string {
  if (entries.length === 0) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  // Sort by date (most recent first)
  const sorted = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate average gap between evolutions
  const gaps: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const date1 = new Date(sorted[i].date);
    const date2 = new Date(sorted[i + 1].date);
    const gap = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
    gaps.push(gap);
  }

  const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 1;
  
  // Predict next date
  const lastDate = new Date(sorted[0].date);
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + Math.round(avgGap));
  
  return nextDate.toISOString().split('T')[0];
}

/**
 * Analyzes overall trend of the project
 */
function determineOverallTrend(entries: ChangelogEntry[]): string {
  if (entries.length < 2) {
    return 'Just getting started! Building foundational features.';
  }

  // Check recent vs older activity
  const sorted = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const recent = sorted.slice(0, Math.ceil(sorted.length / 2));
  const older = sorted.slice(Math.ceil(sorted.length / 2));

  const recentCategories = new Set(recent.map(e => categorizeEntry(e)));
  const olderCategories = new Set(older.map(e => categorizeEntry(e)));

  const newCategories = [...recentCategories].filter(c => !olderCategories.has(c));
  
  if (newCategories.length > 0) {
    return `Expanding into new territories! Recent additions in ${newCategories.join(', ')}.`;
  } else if (recentCategories.size < olderCategories.size) {
    return 'Focusing and specializing. Deepening existing feature sets.';
  } else {
    return 'Steady evolution with balanced feature development across categories.';
  }
}

/**
 * Generates predictions for future evolutions based on historical patterns
 */
export function generatePredictions(entries: ChangelogEntry[]): EvolutionPrediction {
  if (entries.length === 0) {
    return {
      predictions: [],
      nextLikelyDate: predictNextDate(entries),
      overallTrend: 'Awaiting first evolution...',
      suggestionCount: 0
    };
  }

  const frequencies = calculateCategoryFrequencies(entries);
  const trends = analyzeTrends(entries);
  const totalEntries = entries.length;

  // Combine frequency and trend data to make predictions
  const allCategories = new Set([...frequencies.keys(), ...trends.keys()]);
  const predictions: CategoryPrediction[] = [];

  allCategories.forEach(category => {
    const frequency = frequencies.get(category) || 0;
    const trend = trends.get(category) || 0;
    
    // Calculate probability based on both frequency and trend
    const frequencyScore = frequency / totalEntries;
    const trendScore = trend / (totalEntries * 1.5); // Normalize trend score
    const combinedScore = (frequencyScore * 0.6) + (trendScore * 0.4);
    
    // Convert to percentage and cap at 95%
    const probability = Math.min(Math.round(combinedScore * 100), 95);
    
    // Only include predictions with meaningful probability
    if (probability >= 5) {
      predictions.push({
        category,
        probability,
        confidence: calculateConfidence(frequency, totalEntries),
        reasoning: generateReasoning(category, frequency, trend, totalEntries)
      });
    }
  });

  // Sort by probability (descending)
  predictions.sort((a, b) => b.probability - a.probability);

  return {
    predictions: predictions.slice(0, 8), // Top 8 predictions
    nextLikelyDate: predictNextDate(entries),
    overallTrend: determineOverallTrend(entries),
    suggestionCount: predictions.length
  };
}
