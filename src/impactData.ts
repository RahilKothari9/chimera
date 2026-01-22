import type { ChangelogEntry } from './changelogParser';

export interface ImpactDataPoint {
  date: string;
  dayNumber: number;
  featuresAdded: number;
  testsAdded: number;
  filesModified: number;
  category: string;
}

export interface ImpactMetrics {
  totalFeatures: number;
  totalTests: number;
  totalFiles: number;
  averageTestsPerFeature: number;
  mostProductiveDay: ImpactDataPoint | null;
}

/**
 * Categorizes a feature based on keywords
 */
function categorizeFeature(entry: ChangelogEntry): string {
  const text = `${entry.feature} ${entry.description}`.toLowerCase();
  
  const categoryKeywords = [
    { name: 'UI/UX', keywords: ['ui', 'ux', 'design', 'visual', 'interface', 'styling', 'css', 'dashboard', 'graph'] },
    { name: 'Feature', keywords: ['feature', 'add', 'new', 'implement', 'timeline', 'search', 'filter'] },
    { name: 'Testing', keywords: ['test', 'testing', 'coverage'] },
    { name: 'Documentation', keywords: ['doc', 'documentation', 'readme', 'changelog'] }
  ];

  for (const category of categoryKeywords) {
    if (category.keywords.some(keyword => text.includes(keyword))) {
      return category.name;
    }
  }
  
  return 'Other';
}

/**
 * Counts files from filesModified string
 */
function countFiles(filesModified: string): number {
  if (!filesModified || filesModified.trim() === '') return 0;
  // Split by common separators
  return filesModified.split(/[,\n]+/).filter(f => f.trim()).length;
}

/**
 * Extracts numerical impact data from evolution entries
 */
export function extractImpactData(entries: ChangelogEntry[]): ImpactDataPoint[] {
  return entries.map((entry) => {
    // Extract number of files modified from the entry
    const filesModified = countFiles(entry.filesModified);
    
    // Extract number of tests from description (look for patterns like "X tests")
    const testsMatch = entry.description.match(/(\d+)\s+(?:comprehensive\s+)?tests?/i);
    const testsAdded = testsMatch ? parseInt(testsMatch[1], 10) : 0;
    
    return {
      date: entry.date,
      dayNumber: parseInt(entry.day, 10),
      featuresAdded: 1, // Each entry represents one feature
      testsAdded,
      filesModified,
      category: categorizeFeature(entry)
    };
  });
}

/**
 * Calculates aggregate impact metrics
 */
export function calculateImpactMetrics(dataPoints: ImpactDataPoint[]): ImpactMetrics {
  if (dataPoints.length === 0) {
    return {
      totalFeatures: 0,
      totalTests: 0,
      totalFiles: 0,
      averageTestsPerFeature: 0,
      mostProductiveDay: null
    };
  }

  const totalFeatures = dataPoints.reduce((sum, dp) => sum + dp.featuresAdded, 0);
  const totalTests = dataPoints.reduce((sum, dp) => sum + dp.testsAdded, 0);
  const totalFiles = dataPoints.reduce((sum, dp) => sum + dp.filesModified, 0);
  
  // Find most productive day (by tests added)
  const mostProductiveDay = dataPoints.reduce((max, dp) => 
    (dp.testsAdded > (max?.testsAdded || 0)) ? dp : max
  , dataPoints[0]);

  return {
    totalFeatures,
    totalTests,
    totalFiles,
    averageTestsPerFeature: totalFeatures > 0 ? totalTests / totalFeatures : 0,
    mostProductiveDay
  };
}

/**
 * Prepares cumulative data for visualization
 */
export function prepareCumulativeData(dataPoints: ImpactDataPoint[]): ImpactDataPoint[] {
  let cumulativeTests = 0;
  let cumulativeFiles = 0;

  return dataPoints.map(dp => {
    cumulativeTests += dp.testsAdded;
    cumulativeFiles += dp.filesModified;

    return {
      ...dp,
      testsAdded: cumulativeTests,
      filesModified: cumulativeFiles
    };
  });
}
