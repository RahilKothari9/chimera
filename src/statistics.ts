import type { ChangelogEntry } from './changelogParser';

export interface EvolutionStatistics {
  totalEvolutions: number;
  daysActive: number;
  mostModifiedFiles: Array<{ file: string; count: number }>;
  evolutionsByDate: Array<{ date: string; day: string; feature: string }>;
}

/**
 * Analyzes changelog entries and extracts statistics
 */
export function calculateStatistics(entries: ChangelogEntry[]): EvolutionStatistics {
  if (entries.length === 0) {
    return {
      totalEvolutions: 0,
      daysActive: 0,
      mostModifiedFiles: [],
      evolutionsByDate: []
    };
  }

  // Count file modifications
  const fileModificationMap = new Map<string, number>();
  
  entries.forEach(entry => {
    // Parse files from the filesModified string
    const files = entry.filesModified
      .split(',')
      .map(f => f.trim())
      .filter(f => f && f !== 'All initial files');
    
    files.forEach(file => {
      const count = fileModificationMap.get(file) || 0;
      fileModificationMap.set(file, count + 1);
    });
  });

  // Convert to sorted array
  const mostModifiedFiles = Array.from(fileModificationMap.entries())
    .map(([file, count]) => ({ file, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 most modified files

  // Create chronological evolution list
  const evolutionsByDate = entries.map(entry => ({
    date: entry.date,
    day: entry.day,
    feature: entry.feature
  }));

  return {
    totalEvolutions: entries.length,
    daysActive: entries.length,
    mostModifiedFiles,
    evolutionsByDate
  };
}

/**
 * Creates a simple text-based visualization of evolution activity
 */
export function createActivityChart(entries: ChangelogEntry[]): string {
  if (entries.length === 0) {
    return '';
  }

  const maxBarLength = 20;
  const bars = entries.map((entry, index) => {
    const barLength = Math.max(1, Math.floor((index + 1) / entries.length * maxBarLength));
    const bar = '█'.repeat(barLength);
    return `Day ${entry.day}: ${bar}`;
  });

  return bars.join('\n');
}
