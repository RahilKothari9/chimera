import { describe, it, expect } from 'vitest';
import { calculateStatistics, createActivityChart } from './statistics';
import type { ChangelogEntry } from './changelogParser';

describe('calculateStatistics', () => {
  it('should return zero statistics for empty entries', () => {
    const stats = calculateStatistics([]);
    
    expect(stats.totalEvolutions).toBe(0);
    expect(stats.daysActive).toBe(0);
    expect(stats.mostModifiedFiles).toHaveLength(0);
    expect(stats.evolutionsByDate).toHaveLength(0);
  });

  it('should calculate basic statistics from single entry', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-18',
        feature: 'Initial Setup',
        description: 'Created the base framework',
        filesModified: 'src/main.ts, src/app.ts'
      }
    ];

    const stats = calculateStatistics(entries);
    
    expect(stats.totalEvolutions).toBe(1);
    expect(stats.daysActive).toBe(1);
    expect(stats.mostModifiedFiles).toHaveLength(2);
    expect(stats.evolutionsByDate).toHaveLength(1);
  });

  it('should count file modifications correctly', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-18',
        feature: 'Initial Setup',
        description: 'Setup',
        filesModified: 'src/main.ts, src/app.ts'
      },
      {
        day: '1',
        date: '2026-01-19',
        feature: 'Update',
        description: 'Update',
        filesModified: 'src/main.ts, README.md'
      }
    ];

    const stats = calculateStatistics(entries);
    
    expect(stats.mostModifiedFiles).toContainEqual({ file: 'src/main.ts', count: 2 });
    expect(stats.mostModifiedFiles).toContainEqual({ file: 'src/app.ts', count: 1 });
    expect(stats.mostModifiedFiles).toContainEqual({ file: 'README.md', count: 1 });
  });

  it('should sort files by modification count', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-18',
        feature: 'Feature 1',
        description: 'Desc',
        filesModified: 'src/a.ts'
      },
      {
        day: '1',
        date: '2026-01-19',
        feature: 'Feature 2',
        description: 'Desc',
        filesModified: 'src/a.ts, src/b.ts'
      },
      {
        day: '2',
        date: '2026-01-20',
        feature: 'Feature 3',
        description: 'Desc',
        filesModified: 'src/a.ts, src/b.ts, src/c.ts'
      }
    ];

    const stats = calculateStatistics(entries);
    
    expect(stats.mostModifiedFiles[0]).toEqual({ file: 'src/a.ts', count: 3 });
    expect(stats.mostModifiedFiles[1]).toEqual({ file: 'src/b.ts', count: 2 });
    expect(stats.mostModifiedFiles[2]).toEqual({ file: 'src/c.ts', count: 1 });
  });

  it('should limit to top 5 most modified files', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-18',
        feature: 'Feature',
        description: 'Desc',
        filesModified: 'a.ts, b.ts, c.ts, d.ts, e.ts, f.ts, g.ts'
      }
    ];

    const stats = calculateStatistics(entries);
    
    expect(stats.mostModifiedFiles.length).toBeLessThanOrEqual(5);
  });

  it('should ignore "All initial files" in file counting', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-18',
        feature: 'Initial Setup',
        description: 'Setup',
        filesModified: 'All initial files'
      }
    ];

    const stats = calculateStatistics(entries);
    
    expect(stats.mostModifiedFiles).toHaveLength(0);
  });

  it('should count unique days correctly', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-18',
        feature: 'Feature A',
        description: 'Desc',
        filesModified: 'file.ts'
      },
      {
        day: '1',
        date: '2026-01-18', // Same date as day 0
        feature: 'Feature B',
        description: 'Desc',
        filesModified: 'file.ts'
      },
      {
        day: '2',
        date: '2026-01-19', // Different date
        feature: 'Feature C',
        description: 'Desc',
        filesModified: 'file.ts'
      }
    ];

    const stats = calculateStatistics(entries);
    
    expect(stats.totalEvolutions).toBe(3); // Total entries
    expect(stats.daysActive).toBe(2); // Only 2 unique dates
  });

  it('should create evolutionsByDate array', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-18',
        feature: 'Feature A',
        description: 'Desc',
        filesModified: 'file.ts'
      },
      {
        day: '1',
        date: '2026-01-19',
        feature: 'Feature B',
        description: 'Desc',
        filesModified: 'file.ts'
      }
    ];

    const stats = calculateStatistics(entries);
    
    expect(stats.evolutionsByDate).toHaveLength(2);
    expect(stats.evolutionsByDate[0]).toEqual({
      date: '2026-01-18',
      day: '0',
      feature: 'Feature A'
    });
    expect(stats.evolutionsByDate[1]).toEqual({
      date: '2026-01-19',
      day: '1',
      feature: 'Feature B'
    });
  });
});

describe('createActivityChart', () => {
  it('should return empty string for empty entries', () => {
    const chart = createActivityChart([]);
    expect(chart).toBe('');
  });

  it('should create chart for single entry', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-18',
        feature: 'Feature',
        description: 'Desc',
        filesModified: 'file.ts'
      }
    ];

    const chart = createActivityChart(entries);
    expect(chart).toContain('Day 0:');
    expect(chart).toContain('█');
  });

  it('should create multi-line chart for multiple entries', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-18',
        feature: 'Feature A',
        description: 'Desc',
        filesModified: 'file.ts'
      },
      {
        day: '1',
        date: '2026-01-19',
        feature: 'Feature B',
        description: 'Desc',
        filesModified: 'file.ts'
      }
    ];

    const chart = createActivityChart(entries);
    const lines = chart.split('\n');
    
    expect(lines.length).toBe(2);
    expect(lines[0]).toContain('Day 0:');
    expect(lines[1]).toContain('Day 1:');
  });
});
