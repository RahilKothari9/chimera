import { describe, it, expect } from 'vitest';
import { calculateStatistics, generateProgressBar } from './statistics';
import type { ChangelogEntry } from './changelogParser';

describe('calculateStatistics', () => {
  it('should return zero stats for empty entries', () => {
    const stats = calculateStatistics([]);
    
    expect(stats.totalEvolutions).toBe(0);
    expect(stats.daysSinceStart).toBe(0);
    expect(stats.avgEvolutionsPerDay).toBe(0);
    expect(stats.recentActivity).toBe(0);
    expect(stats.featureCategories.size).toBe(0);
  });

  it('should calculate basic stats for single entry', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-18',
        feature: 'Initial Setup',
        description: 'Created the base framework',
        filesModified: 'All initial files'
      }
    ];
    
    const stats = calculateStatistics(entries);
    
    expect(stats.totalEvolutions).toBe(1);
    expect(stats.daysSinceStart).toBe(1);
    expect(stats.avgEvolutionsPerDay).toBe(1);
    expect(stats.recentActivity).toBe(1);
  });

  it('should calculate stats for multiple entries', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-18',
        feature: 'Initial Setup',
        description: 'Created the base framework',
        filesModified: 'All initial files'
      },
      {
        day: '1',
        date: '2026-01-19',
        feature: 'Timeline',
        description: 'Added timeline feature',
        filesModified: 'src/timeline.ts'
      }
    ];
    
    const stats = calculateStatistics(entries);
    
    expect(stats.totalEvolutions).toBe(2);
    expect(stats.daysSinceStart).toBe(2);
    expect(stats.avgEvolutionsPerDay).toBe(1);
    expect(stats.recentActivity).toBe(2);
  });

  it('should calculate recent activity correctly', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-10',
        feature: 'Old Feature',
        description: 'This is old',
        filesModified: 'old.ts'
      },
      {
        day: '1',
        date: '2026-01-19',
        feature: 'Recent Feature',
        description: 'This is recent',
        filesModified: 'recent.ts'
      },
      {
        day: '2',
        date: '2026-01-20',
        feature: 'Today Feature',
        description: 'This is today',
        filesModified: 'today.ts'
      }
    ];
    
    const stats = calculateStatistics(entries);
    
    // Recent activity should only count entries within 7 days of the last entry (2026-01-20)
    expect(stats.recentActivity).toBe(2);
  });

  it('should categorize features correctly', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-18',
        feature: 'UI Styling',
        description: 'Improved CSS styles',
        filesModified: 'style.css'
      },
      {
        day: '1',
        date: '2026-01-19',
        feature: 'Authentication',
        description: 'Implemented user login',
        filesModified: 'auth.ts'
      },
      {
        day: '2',
        date: '2026-01-20',
        feature: 'Test Coverage',
        description: 'Increased test coverage',
        filesModified: 'test.ts'
      }
    ];
    
    const stats = calculateStatistics(entries);
    
    expect(stats.featureCategories.get('UI/UX')).toBe(1);
    expect(stats.featureCategories.get('Feature')).toBe(1);
    expect(stats.featureCategories.get('Testing')).toBe(1);
  });

  it('should categorize as Other when no keywords match', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-18',
        feature: 'Random Change',
        description: 'Something unrelated',
        filesModified: 'random.ts'
      }
    ];
    
    const stats = calculateStatistics(entries);
    
    expect(stats.featureCategories.get('Other')).toBe(1);
  });
});

describe('generateProgressBar', () => {
  it('should generate full bar when value equals max', () => {
    const bar = generateProgressBar(10, 10, 10);
    expect(bar).toBe('██████████');
  });

  it('should generate empty bar when value is zero', () => {
    const bar = generateProgressBar(0, 10, 10);
    expect(bar).toBe('░░░░░░░░░░');
  });

  it('should generate half-filled bar', () => {
    const bar = generateProgressBar(5, 10, 10);
    expect(bar).toBe('█████░░░░░');
  });

  it('should handle custom width', () => {
    const bar = generateProgressBar(3, 10, 5);
    expect(bar.length).toBe(5);
  });
});
